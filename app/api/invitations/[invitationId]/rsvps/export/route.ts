import { db } from "@/lib/db";
import { requireInvitation } from "@/lib/auth/ownership";
import { ApiError } from "@/lib/api";
import { NextResponse } from "next/server";
import { ceremonyLabel } from "@/lib/ceremonies";
import { slugify } from "@/lib/slug";

type Params = { params: Promise<{ invitationId: string }> };

/**
 * Spreadsheets treat a leading =, +, - or @ as a formula, so a guest could
 * put one in their name or message and have it execute when the caterer
 * opens the file. Prefixing an apostrophe keeps the value as text.
 */
function csvCell(value: string | number | boolean | null): string {
  if (value === null) return "";
  let s = String(value);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
}

export async function GET(_req: Request, { params }: Params) {
  try {
    const { invitationId } = await params;
    const { invitation } = await requireInvitation(invitationId);

    const rsvps = await db.rsvp.findMany({
      where: { invitationId: invitation.id },
      orderBy: { createdAt: "asc" },
    });

    const header = ["Name", "Attending", "Guests", "Meal", "Message", "Replied at"];
    const rows = rsvps.map((r) =>
      [
        r.guestName,
        r.attending ? "Yes" : "No",
        r.guestCount,
        r.mealPreference,
        r.message,
        r.createdAt.toISOString(),
      ]
        .map(csvCell)
        .join(","),
    );

    // A BOM so Excel reads the UTF-8 names correctly rather than mangling them.
    const csv = `﻿${header.map(csvCell).join(",")}\n${rows.join("\n")}\n`;
    const name = slugify(
      `${ceremonyLabel(invitation.ceremonyType, invitation.customCeremonyName)} rsvps`,
    );

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${name || "rsvps"}.csv"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    throw err;
  }
}
