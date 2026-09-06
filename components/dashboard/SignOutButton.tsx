"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/Button";

export function SignOutButton() {
  return (
    <Button variant="quiet" size="sm" type="button" onClick={() => signOut({ callbackUrl: "/" })}>
      Sign out
    </Button>
  );
}
