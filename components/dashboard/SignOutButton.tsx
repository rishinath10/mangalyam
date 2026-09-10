"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/Button";

/**
 * `line`, not `quiet`: quiet draws no border and no ground, which on a bar of
 * other text is indistinguishable from a label. A pill is what tells someone
 * this is a thing to press.
 */
export function SignOutButton() {
  return (
    <Button variant="line" size="sm" type="button" onClick={() => signOut({ callbackUrl: "/" })}>
      Sign out
    </Button>
  );
}
