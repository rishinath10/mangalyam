/**
 * Upload failures, in their own module with no dependencies.
 *
 * lib/api.ts needs to recognise these to choose a status code, and it is
 * imported by every route in the app. Declaring them next to the storage
 * client would drag sharp and the AWS SDK — a native module and a large one —
 * into routes that never touch an image.
 */

/** The bytes were not an image, or not one sharp can decode. The caller's fault. */
export class UnreadableImageError extends Error {
  constructor() {
    super("Unreadable image");
    this.name = "UnreadableImageError";
  }
}

/**
 * The file was fine; we could not store it. A missing setting, an unreachable
 * bucket, wrong credentials — the operator's problem, never the customer's.
 * `cause` carries the real error for the server log.
 */
export class StorageUnavailableError extends Error {
  constructor(readonly cause: unknown) {
    super("Image storage is unavailable");
    this.name = "StorageUnavailableError";
  }
}
