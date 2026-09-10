"use client";

import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Field";
import type { InvitationSource } from "@/lib/invitation/compose";

type Settings = InvitationSource["settings"];

/**
 * Where guests send gift money.
 *
 * The QR goes up the moment it is chosen, through its own route — the same
 * arrangement as the cover photo, and for the same reason: an image is not a
 * form field, and making someone press Save before their upload counts is a
 * good way to lose it. Everything else here is an ordinary setting and waits
 * for Save with the rest of the page.
 */
export function BlessingsPanel({
  settings,
  onChange,
  onQrUpload,
  onQrRemove,
  qrBusy,
}: {
  settings: Settings;
  onChange: (patch: Partial<Settings>) => void;
  onQrUpload: (file: File) => void;
  onQrRemove: () => void;
  qrBusy: boolean;
}) {
  return (
    <div style={{ display: "grid", gap: "1.25rem" }}>
      <label className="toggle">
        <input
          type="checkbox"
          checked={settings.giftsEnabled}
          onChange={(e) => onChange({ giftsEnabled: e.target.checked })}
        />
        <span>
          <b>Show a place for gift money</b>
          <span>
            A short section at the very bottom of your invitation, below the
            reply form. Off unless you turn it on.
          </span>
        </span>
      </label>

      {settings.giftsEnabled && (
        <>
          {/* Said once, plainly, at the moment it matters — not buried in a
              policy page they will never open. */}
          <p className="notice" style={{ margin: 0 }}>
            Anyone who opens your invitation link can see and copy these
            details. That is the same group the link itself reaches, but it is
            worth knowing before you type an account number.
          </p>

          <Textarea
            id="giftNote"
            label="A line above the details"
            rows={3}
            maxLength={240}
            placeholder="Your presence is the greatest blessing. For those who wish to give, the details are here."
            value={settings.giftNote ?? ""}
            onChange={(e) => onChange({ giftNote: e.target.value || null })}
          />

          <div>
            <span className="field-label">Payment QR</span>
            {settings.giftQrUrl ? (
              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={settings.giftQrUrl}
                  alt="Your payment QR"
                  style={{
                    height: 108,
                    width: 108,
                    objectFit: "contain",
                    borderRadius: 10,
                    border: "1px solid var(--edge)",
                    background: "#fff",
                    padding: 6,
                  }}
                />
                <Button type="button" variant="danger" size="sm" disabled={qrBusy} onClick={onQrRemove}>
                  Remove
                </Button>
              </div>
            ) : (
              <input
                type="file"
                accept="image/*"
                disabled={qrBusy}
                className="filedrop"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) onQrUpload(file);
                  e.target.value = "";
                }}
              />
            )}
            <p className="dim" style={{ fontSize: "var(--t-xs)", marginTop: ".5rem" }}>
              {qrBusy
                ? "Uploading…"
                : "Your DuitNow or bank QR, screenshotted from your banking app. Crop it to the code itself — we keep it sharp so a guest's bank app can still read it."}
            </p>
          </div>

          <Input
            id="giftBankName"
            label="Bank"
            placeholder="Maybank"
            maxLength={60}
            value={settings.giftBankName ?? ""}
            onChange={(e) => onChange({ giftBankName: e.target.value || null })}
          />
          <Input
            id="giftAccountName"
            label="Account holder"
            placeholder="Rishi Nathan"
            maxLength={80}
            value={settings.giftAccountName ?? ""}
            onChange={(e) => onChange({ giftAccountName: e.target.value || null })}
          />
          <Input
            id="giftAccountNumber"
            label="Account number"
            inputMode="numeric"
            placeholder="1234 5678 9012"
            maxLength={34}
            hint="Shown only alongside the bank name — half a transfer instruction is no use to a guest."
            value={settings.giftAccountNumber ?? ""}
            onChange={(e) => onChange({ giftAccountNumber: e.target.value || null })}
          />
        </>
      )}
    </div>
  );
}
