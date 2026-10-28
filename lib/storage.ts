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

type Variant = "cover" | "gallery" | "qr" | "frame" | "ground" | "crest" | "divider";

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
  // Quality is ignored for a QR — see LOSSLESS_VARIANTS below.
  qr: { width: 1000, height: 1000, quality: 100 },
};

/**
 * Variants stored byte-exact rather than re-encoded lossily.
 *
 * A payment QR is not a picture of a thing, it is data, and it is the one
 * image on the page whose failure mode is silent: a guest whose bank app
 * cannot resolve it gets no error, just a scan that never completes, and
 * neither they nor the host ever finds out why the money did not arrive.
 *
 * To be straight about the tradeoff — lossy WebP at our photo quality did in
 * fact still scan in every case tested here, including a QR screenshotted
 * down to 170px and JPEG-compressed before it reached us. Lossless is kept
 * anyway: it costs about 30KB once per invitation, and it removes a whole
 * class of risk that a test with a software decoder cannot rule out — a real
 * bank app reading a screen at an angle in bad light, on an old phone.
 * Cheap insurance against a failure nobody would be able to report.
 */
const LOSSLESS_VARIANTS: Variant[] = ["qr"];

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

  let pipeline = sharp(input, { failOn: "error" })
    .rotate() // honour EXIF orientation before the tags are dropped
    .resize({ width, height, fit: "inside", withoutEnlargement: true });

  // A QR saved as a transparent PNG is black-on-nothing: it looks correct in
  // the editor, where it sits on a white card, and disappears the moment a
  // guest opens it full size over a dark backdrop. Giving it the white quiet
  // zone it is supposed to have makes the image right wherever it lands.
  if (variant === "qr") pipeline = pipeline.flatten({ background: "#ffffff" });

  pipeline = pipeline
    // alphaQuality 100: a frame's transparent centre is the whole point, and
    // WebP's default lossy alpha softens the border's inner edge into a halo
    // over the cover behind it.
    .webp(
      LOSSLESS_VARIANTS.includes(variant)
        ? { lossless: true }
        : ART_VARIANTS.includes(variant)
          ? { quality, alphaQuality: 100 }
          : { quality },
    );

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
  /**
   * The settings, with values for the ones that are not secrets.
   *
   * Showing the endpoint, bucket, region and public URL is the point: every
   * realistic storage fault is a wrong hostname, a wrong bucket or the two
   * URLs swapped, and none of those can be diagnosed from a list of names
   * that only says "set". They are not secrets either — the public URL is
   * served to every guest, the bucket name appears inside it, and the
   * endpoint is an internal hostname. The access key and secret are secrets,
   * so those are only ever reported as present or missing.
   */
  settings: { name: string; value: string | null; secret: boolean; present: boolean }[];
  /** The failure, in the operator's words. Null when everything worked. */
  problem: string | null;
  /** What that failure usually means, and what to go and change. */
  diagnosis: string | null;
}

/**
 * Turns a storage error into something worth reading.
 *
 * "getaddrinfo EAI_AGAIN minio" is accurate and tells an operator nothing.
 * Each branch here names the thing that is actually wrong and the place to
 * change it, because the person reading this is trying to get uploads working
 * again, not to learn what a DNS error code is.
 */
function diagnose(err: unknown, endpoint: string | undefined): string {
  const raw = err instanceof Error ? `${err.name}: ${err.message}` : String(err);
  const host = (() => {
    try {
      return endpoint ? new URL(endpoint).hostname : "the storage host";
    } catch {
      return "the storage host";
    }
  })();

  if (/EAI_AGAIN|ENOTFOUND|getaddrinfo/i.test(raw)) {
    return `The app cannot resolve the name "${host}". Nothing is wrong with the credentials — the container simply has no idea what that name points at. Either the storage service is not running, or it is not on the same Docker network as this app, or it is running under a different service name. Check the name in S3_ENDPOINT against the storage service's actual name, and that both containers share a network.`;
  }
  if (/ECONNREFUSED/i.test(raw)) {
    return `"${host}" resolves, but nothing is listening on that port. The storage service is probably stopped, or S3_ENDPOINT has the wrong port.`;
  }
  if (/ETIMEDOUT|ECONNRESET|socket hang up/i.test(raw)) {
    return `"${host}" resolves but never answers. That usually means a firewall or a network the app container cannot reach, rather than a storage fault.`;
  }
  if (/InvalidAccessKeyId|SignatureDoesNotMatch|AccessDenied|403/i.test(raw)) {
    return "The storage service answered and rejected the credentials. S3_ACCESS_KEY_ID or S3_SECRET_ACCESS_KEY is wrong, or that key has no write access to this bucket.";
  }
  if (/NoSuchBucket|404/i.test(raw)) {
    return "The storage service answered, but the bucket in S3_BUCKET does not exist on it. Create it, or correct the name.";
  }
  if (/certificate|self.signed|CERT_|TLS|SSL/i.test(raw)) {
    return "TLS failed against the storage host. If this is an internal service over plain HTTP, S3_ENDPOINT should start with http:// rather than https://.";
  }
  return "The storage service did not accept a test write. The raw error above is the best clue.";
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
  // secret: true means the value is never rendered, only whether it is set.
  const spec: { name: string; secret: boolean }[] = [
    { name: "S3_ENDPOINT", secret: false },
    { name: "S3_BUCKET", secret: false },
    { name: "S3_REGION", secret: false },
    { name: "S3_PUBLIC_URL", secret: false },
    { name: "S3_ACCESS_KEY_ID", secret: true },
    { name: "S3_SECRET_ACCESS_KEY", secret: true },
  ];
  const settings = spec.map(({ name, secret }) => {
    const present = Boolean(process.env[name]);
    return {
      name,
      secret,
      present,
      // A secret that is set still reports present: true with a null value,
      // so the page can say "set, hidden" rather than leaving the operator
      // unable to tell a configured credential from a missing one.
      value: present && !secret ? (process.env[name] as string) : null,
    };
  });

  // S3_REGION has a working default, so it is reported but never required.
  const required_ = spec.filter((x) => x.name !== "S3_REGION").map((x) => x.name);
  const missing = required_.filter((n) => !process.env[n]);
  if (missing.length) {
    return {
      ok: false,
      settings,
      problem: `Not set: ${missing.join(", ")}`,
      diagnosis:
        "These have to be present in the container's environment at run time. Set them and restart — none of them is baked into the build.",
    };
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
      settings,
      problem: err instanceof Error ? err.message : String(err),
      diagnosis: diagnose(err, process.env.S3_ENDPOINT),
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

  return { ok: true, settings, problem: null, diagnosis: null };
}
