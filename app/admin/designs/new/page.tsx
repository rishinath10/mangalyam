import Link from "next/link";
import { requireAdmin } from "@/lib/auth/admin";
import { DesignForm } from "@/components/admin/DesignForm";

export const dynamic = "force-dynamic";

export default async function NewDesign() {
  await requireAdmin();

  return (
    <div className="wrap">
      <Link href="/admin/designs" className="crumb">← Designs</Link>
      <div className="page-head">
        <div>
          <h1>A new design</h1>
          <p className="muted">
            Name it and set its colours here. The artwork goes up on the next
            screen, and nothing reaches a customer until you publish it.
          </p>
        </div>
      </div>

      <section className="panel">
        <DesignForm />
      </section>
    </div>
  );
}
