import Link from "next/link";
import { SignupForm } from "./SignupForm";

export const metadata = { title: "Create an account" };

export default function SignupPage() {
  return (
    <>
      <h1>Create your account</h1>
      <p className="muted" style={{ fontSize: "var(--t-sm)", marginTop: ".4rem" }}>
        One account holds every ceremony in your wedding.
      </p>

      <SignupForm />

      <p className="auth-alt">
        Already have an account? <Link href="/login">Sign in</Link>
      </p>
    </>
  );
}
