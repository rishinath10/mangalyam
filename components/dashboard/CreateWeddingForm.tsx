"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";

export function CreateWeddingForm() {
  const router = useRouter();
  const [names, setNames] = useState({ coupleName1: "", coupleName2: "" });
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);

    const res = await fetch("/api/weddings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(names),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "Could not create the wedding.");
      setPending(false);
      return;
    }

    const wedding = await res.json();
    router.push(`/dashboard/weddings/${wedding.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} style={{ display: "grid", gap: "1rem" }}>
      <div className="form-grid two">
        <Input
          id="coupleName1"
          label="First name"
          placeholder="Rishi"
          required
          maxLength={60}
          value={names.coupleName1}
          onChange={(e) => setNames((n) => ({ ...n, coupleName1: e.target.value }))}
        />
        <Input
          id="coupleName2"
          label="Second name"
          placeholder="Gaayathri"
          required
          maxLength={60}
          value={names.coupleName2}
          onChange={(e) => setNames((n) => ({ ...n, coupleName2: e.target.value }))}
        />
      </div>

      {error && (
        <p role="alert" className="notice notice-bad">
          {error}
        </p>
      )}

      <Button type="submit" disabled={pending}>
        {pending ? "Creating…" : "Create wedding"}
      </Button>
    </form>
  );
}
