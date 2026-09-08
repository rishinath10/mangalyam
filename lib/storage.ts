import { randomUUID } from "node:crypto";
import { PutObjectCommand, DeleteObjectCommand, S3Client } from "@aws-sdk/client-s3";
import sharp from "sharp";

/**
 * Object storage is MinIO (S3-compatible) on the builder's own Coolify box.
 * Everything here speaks plain S3 so the same code works against MinIO in dev
 * and any S3 provider later without a rewrite.
 */

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable ${name}`);
  return value;
}

let client: S3Client | null = null;

function s3(): S3Client {
  if (client) return client;
  client = new S3Client({
    endpoint: required("S3_ENDPOINT"),
    region: process.env.S3_REGION ?? "us-east-1",
    credentials: {
      accessKeyId: required("S3_ACCESS_KEY_ID"),
      secretAccessKey: required("S3_SECRET_ACCESS_KEY"),
    },
    // MinIO serves buckets as a path segment, not a hostname prefix.
    forcePathStyle: true,
  });
  return client;
}

export const MAX_UPLOAD_BYTES = 12 * 1024 * 1024;

export const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/heic",
  "image/heif",
] as const;

type Variant = "cover" | "gallery" | "frame";

// Wedding photos come straight off a phone at 4000px+. Resizing on upload is
// what keeps a guest on venue wifi from downloading 8MB per image.
const VARIANTS: Record<Variant, { width: number; height: number; quality: number }> = {
  cover: { width: 1600, height: 2000, quality: 80 },
  gallery: { width: 1200, height: 1200, quality: 78 },
  // Frame artwork is line work at the very edge of the card, where WebP's
  // ringing shows first, so it gets a higher quality than a photograph at a
  // smaller size. 3:4 at 1080x1440 is the generated-artwork target.
  frame: { width: 1080, height: 1440, quality: 88 },
};

export interface StoredImage {
  key: string;
  url: string;
  width: number;
  height: number;
}

/**
 * Re-encodes to WebP and uploads. Re-encoding is not only for size: it strips
 * EXIF (including GPS coordinates from the couple's camera roll) and means a
 * file that merely claims to be an image never reaches storage intact.
 */
export async function storeImage(
  input: Buffer,
  variant: Variant,
  prefix: string,
): Promise<StoredImage> {
  const { width, height, quality } = VARIANTS[variant];

  const pipeline = sharp(input, { failOn: "error" })
    .rotate() // honour EXIF orientation before the tags are dropped
    .resize({ width, height, fit: "inside", withoutEnlargement: true })
    // alphaQuality 100: a frame's transparent centre is the whole point, and
    // WebP's default lossy alpha softens the border's inner edge into a halo
    // over the cover behind it.
    .webp(variant === "frame" ? { quality, alphaQuality: 100 } : { quality });

  const { data, info } = await pipeline.toBuffer({ resolveWithObject: true });

  const bucket = required("S3_BUCKET");
  const key = `${prefix}/${randomUUID()}.webp`;

  await s3().send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: data,
      ContentType: "image/webp",
      CacheControl: "public, max-age=31536000, immutable",
    }),
  );

  return {
    key,
    url: `${required("S3_PUBLIC_URL").replace(/\/+$/, "")}/${key}`,
    width: info.width,
    height: info.height,
  };
}

/** Best-effort: a failed delete must not block removing the database row. */
export async function deleteImage(url: string): Promise<void> {
  const base = process.env.S3_PUBLIC_URL?.replace(/\/+$/, "");
  if (!base || !url.startsWith(`${base}/`)) return;
  const key = url.slice(base.length + 1);
  try {
    await s3().send(
      new DeleteObjectCommand({ Bucket: required("S3_BUCKET"), Key: key }),
    );
  } catch (err) {
    console.error("Failed to delete object from storage:", key, err);
  }
}
