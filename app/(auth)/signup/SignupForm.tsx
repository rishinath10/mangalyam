"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";

type FieldErrors = Partial<Record<"name" | "email" | "password", string[]>>;

export function SignupForm() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    setFieldErrors({});

    const res = await fetch("/api/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setFieldErrors(body.issues ?? {});
      setError(body.error ?? "Something went wrong. Please try again.");
      setPending(false);
      return;
    }

    // Sign the new account straight in — asking them to log in immediately
    // after signing up is friction with no purpose.
    await signIn("credentials", {
      email: form.email,
      password: form.password,
      redirect: false,
    });
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 space-y-4">
      <Input
        id="name"
        label="Your name"
        autoComplete="name"
        required
        value={form.name}
        onChange={set("name")}
        error={fieldErrors.name?.[0]}
      />
      <Input
        id="email"
        label="Email"
        type="email"
        autoComplete="email"
        required
        value={form.email}
        onChange={set("email")}
        error={fieldErrors.email?.[0]}
      />
      <Input
        id="password"
        label="Password"
        type="password"
        autoComplete="new-password"
        required
        minLength={8}
        value={form.password}
        onChange={set("password")}
        hint="At least 8 characters."
        error={fieldErrors.password?.[0]}
      />

      {error && Object.keys(fieldErrors).length === 0 && (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Creating account…" : "Create account"}
      </Button>
    </form>
  );
}
