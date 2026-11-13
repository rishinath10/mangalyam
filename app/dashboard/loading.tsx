import { Mascot } from "@/components/mascot/Mascot";

/** Shown while a dashboard page is fetched: he is on his way with it. */
export default function Loading() {
  return (
    <div className="page-loading" role="status">
      <Mascot pose="walk" height={130} enter="none" className="mascot-walk" />
      <p className="muted">Fetching your invitations…</p>
    </div>
  );
}
