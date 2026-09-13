import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { signupSchema } from "@/lib/auth/schemas";
import { clientKey, rateLimit } from "@/lib/rate-limit";

/**
 * Five accounts per address per hour.
 *
 * Signup is the only unauthenticated write left in the app that creates a
 * row, and each one costs a bcrypt hash at cost 12. Unthrottled it is both a
 * way to fill the users table and a cheap way to keep a CPU busy. Five is far
 * more than a household setting up an account ever needs.
 */
const SIGNUP_LIMIT = { limit: 5, windowMs: 60 * 60_000 };

export async function POST(req: Request) {
  const limited = rateLimit(clientKey(req, "signup"), SIGNUP_LIMIT);
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Too many accounts created from here. Try again in a little while." },
      { status: 429, headers: { "Retry-After": String(limited.retryAfterSeconds) } },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = signupSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", issues: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const { name, email, password } = parsed.data;
  const passwordHash = await bcrypt.hash(password, 12);

  try {
    const user = await db.user.create({
      data: { name, email: email.toLowerCase(), passwordHash },
      select: { id: true, email: true, name: true },
    });
    return NextResponse.json(user, { status: 201 });
  } catch (err) {
    // Unique constraint on users.email — reported as a field error rather than
    // a generic 409 so the signup form can point at the right input.
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "An account with that email already exists" },
        { status: 409 },
      );
    }
    throw err;
  }
}
