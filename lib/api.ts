import { NextResponse } from "next/server";
import { ZodError, type ZodType } from "zod";
import { StorageUnavailableError } from "@/lib/storage-errors";

export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly details?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export const unauthorized = () => new ApiError(401, "Not signed in");

/**
 * Deliberately 404, not 403: a wedding the caller does not own must be
 * indistinguishable from one that does not exist, or the API leaks which IDs
 * are real.
 */
export const notFound = (what = "Resource") =>
  new ApiError(404, `${what} not found`);

export const forbidden = (message: string) => new ApiError(403, message);
export const badRequest = (message: string, details?: unknown) =>
  new ApiError(400, message, details);

/** Wraps a route handler so thrown ApiErrors become clean JSON responses. */
export function handle<T>(fn: () => Promise<T>) {
  return fn().then(
    (data) => NextResponse.json(data),
    (err: unknown) => {
      if (err instanceof ApiError) {
        return NextResponse.json(
          { error: err.message, details: err.details },
          { status: err.status },
        );
      }
      if (err instanceof ZodError) {
        return NextResponse.json(
          { error: "Invalid input", details: err.flatten().fieldErrors },
          { status: 400 },
        );
      }
      if (err instanceof StorageUnavailableError) {
        // The operator needs the real cause; the customer needs to know it is
        // not their file and not their fault.
        console.error("Image storage failed:", err.cause);
        return NextResponse.json(
          {
            error:
              "Image storage is not reachable right now, so the upload could not be saved. Nothing is wrong with your photo.",
          },
          { status: 503 },
        );
      }
      console.error("Unhandled API error:", err);
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    },
  );
}

export async function parseBody<T>(req: Request, schema: ZodType<T>): Promise<T> {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    throw badRequest("Invalid JSON body");
  }
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    throw badRequest("Invalid input", parsed.error.flatten().fieldErrors);
  }
  return parsed.data;
}
