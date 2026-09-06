import { Suspense } from "react";
import Link from "next/link";
import { LoginForm } from "./LoginForm";

export const metadata = { title: "Sign in · Mangalyam" };

export default function LoginPage() {
  return (
    <>
      <h1 className="font-[family-name:var(--font-display)] text-2xl text-neutral-900">
        Welcome back
      </h1>
      <p className="mt-1.5 text-sm text-neutral-500">
        Sign in to manage your ceremony invitations.
      </p>

      {/* useSearchParams needs a suspense boundary to keep the page static. */}
      <Suspense fallback={<div className="mt-6 h-56" />}>
        <LoginForm />
      </Suspense>

      <p className="mt-6 text-center text-sm text-neutral-500">
        New here?{" "}
        <Link href="/signup" className="font-medium text-[#8A1C1C] hover:underline">
          Create an account
        </Link>
      </p>
    </>
  );
}
