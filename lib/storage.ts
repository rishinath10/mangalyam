import { randomUUID } from "node:crypto";
import { PutObjectCommand, DeleteObjectCommand, S3Client } from "@aws-sdk/client-s3";
import sharp from "sharp";
import { StorageUnavailableError, UnreadableImageError } from "@/lib/storage-errors";

// Re-exported so callers keep importing one module for uploads.
export { StorageUnavailableError, UnreadableImageError };

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
    // Path-style addressing: works for MinIO, and Cloudflare R2 supports it
    // too, so the same client config serves either without a code change.
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

type Variant = "cover" | "gallery" | "frame" | "ground" | "crest" | "divider";

/** The artwork variants: line work with an alpha channel that has to survive. */
const ART_VARIANTS: Variant[] = ["frame", "crest", "divider"];

// Wedding photos come straight off a phone at 4000px+. Resizing on upload is
// what keeps a guest on venue wifi from downloading 8MB per image.
const VARIANTS: Record<Variant, { width: number; height: number; quality: number }> = {
  cover: { width: 1600, height: 2000, quality: 80 },
  gallery: { width: 1200, height: 1200, quality: 78 },
  // Frame artwork is line work at the very edge of the card, where WebP's
  // ringing shows first, so it gets a higher quality than a photograph at a
  // smaller size. 3:4 at 1080x1440 is the generated-artwork target.
  frame: { width: 1080, height: 1440, quality: 88 },
  // The other three pieces of a drawn family. Same reasoning as the frame:
  // ornament, not photography, so quality stays high and the sizes stay small.
  ground: { width: 900, height: 900, quality: 82 },
  crest: { width: 900, height: 560, quality: 90 },
  divider: { width: 1200, height: 160, quality: 90 },
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
    .webp(ART_VARIANTS.includes(variant) ? { quality, alphaQuality: 100 } : { quality });

  let data: Buffer;
  let info: { width: number; height: number };
  try {
    ({ data, info } = await pipeline.toBuffer({ resolveWithObject: true }));
  } catch {
    // Only the decode is caught here. Everything after this line is our
    // infrastructure, and an outage there must not be blamed on the upload.
    throw new UnreadableImageError();
  }

  const key = `${prefix}/${randomUUID()}.webp`;

  try {
    const bucket = required("S3_BUCKET");
    await s3().send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: data,
        ContentType: "image/webp",
        CacheControl: "public, max-age=31536000, immutable",
      }),
    );
    // Inside the try as well: an unset public URL is a configuration fault
    // like any other, and it used to surface as a bare 500 after the object
    // had already been written.
    required("S3_PUBLIC_URL");
  } catch (err) {
    throw new StorageUnavailableError(err);
  }

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

export interface StorageHealth {
  ok: boolean;
  /** Which settings are present. Never the values — this is rendered in a page. */
  configured: Record<string, boolean>;
  /** The failure, in the operator's words. Null when everything worked. */
  problem: string | null;
}

/**
 * Can we actually store a file right now?
 *
 * Writes a tiny object and deletes it again, which is the only honest way to
 * answer: credentials can be present and wrong, a bucket can exist and refuse
 * writes, and a host can resolve and not be listening. An upload failing is
 * the first anyone hears about any of that, and by then it looks to the
 * customer like their photograph is broken.
 *
 * Names which settings are missing, never their values.
 */
export async function checkStorage(): Promise<StorageHealth> {
  const names = [
    "S3_ENDPOINT",
    "S3_BUCKET",
    "S3_ACCESS_KEY_ID",
    "S3_SECRET_ACCESS_KEY",
    "S3_PUBLIC_URL",
  ];
  const configured = Object.fromEntries(names.map((n) => [n, Boolean(process.env[n])]));
  const missing = names.filter((n) => !process.env[n]);
  if (missing.length) {
    return { ok: false, configured, problem: `Not set: ${missing.join(", ")}` };
  }

  const key = `healthcheck/${randomUUID()}.txt`;
  try {
    await s3().send(
      new PutObjectCommand({
        Bucket: required("S3_BUCKET"),
        Key: key,
        Body: Buffer.from("ok"),
        ContentType: "text/plain",
      }),
    );
  } catch (err) {
    return {
      ok: false,
      configured,
      problem: err instanceof Error ? err.message : String(err),
    };
  }

  // Best effort: a bucket that accepts writes and refuses deletes is still a
  // working bucket for our purposes, and leaving one probe file behind is
  // better than reporting a failure that would not affect an upload.
  try {
    await s3().send(new DeleteObjectCommand({ Bucket: required("S3_BUCKET"), Key: key }));
  } catch {
    /* ignore */
  }

  return { ok: true, configured, problem: null };
}
