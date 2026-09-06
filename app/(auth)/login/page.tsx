import { Suspense } from "react";
import Link from "next/link";
import { LoginForm } from "./LoginForm";

export const metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <>
      <h1>Welcome back</h1>
      <p className="muted" style={{ fontSize: "var(--t-sm)", marginTop: ".4rem" }}>
        Sign in to manage your ceremony invitations.
      </p>

      {/* useSearchParams needs a boundary or the whole route goes dynamic */}
      <Suspense fallback={<div style={{ height: "17rem" }} />}>
        <LoginForm />
      </Suspense>

      <p className="auth-alt">
        New here? <Link href="/signup">Create an account</Link>
      </p>
    </>
  );
}
