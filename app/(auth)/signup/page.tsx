import Link from "next/link";
import { SignupForm } from "./SignupForm";

export const metadata = { title: "Create an account · Mangalyam" };

export default function SignupPage() {
  return (
    <>
      <h1 className="font-[family-name:var(--font-display)] text-2xl text-neutral-900">
        Create your account
      </h1>
      <p className="mt-1.5 text-sm text-neutral-500">
        One account holds every ceremony in your wedding.
      </p>

      <SignupForm />

      <p className="mt-6 text-center text-sm text-neutral-500">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-[#8A1C1C] hover:underline">
          Sign in
        </Link>
      </p>
    </>
  );
}
