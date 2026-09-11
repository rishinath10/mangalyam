import Link from "next/link";
import { auth } from "@/lib/auth";
import { isPurchasable, priceLabel } from "@/lib/pricing";
import { Particles } from "@/components/site/Particles";
import { CreateWizard } from "@/components/create/CreateWizard";
import { allManifestsOrCoded } from "@/lib/templates/design-store";
import { DesignsProvider } from "@/components/templates/DesignsProvider";
import { COMPANY } from "@/lib/company";

export const metadata = {
  title: "Create your invitation",
  description:
    "Build your e-invitation for any event — wedding, naming ceremony, housewarming, temple consecration — and see it working before you sign up. Pay only when you are ready to send it.",
};

/**
 * The create flow is deliberately outside /dashboard: it is reachable without
 * an account, and middleware.ts guards only /dashboard and /admin. Signing in
 * happens on the last step, once there is something worth keeping.
 */
export default async function CreatePage() {
  const session = await auth();
  // Every design, resolved: uploaded artwork merged over the code families,
  // and designs that exist only in the database included. The wizard previews
  // whichever one the visitor is trying and cannot reach a database itself.
  const designs = await allManifestsOrCoded();

  return (
    <div className="tone-dark wz-shell">
      <Particles />

      <header className="wz-bar">
        <div className="wz-bar-in">
          <Link href="/" className="nav-brand">
            <span className="wm">{COMPANY.wordmark}</span>
            <span className="tg">Celebrations that last a lifetime</span>
          </Link>
          <Link
            href={session?.user ? "/dashboard" : "/login"}
            className="btn btn-line btn-sm wz-bar-alt"
          >
            {session?.user ? "My dashboard" : "Sign in"}
          </Link>
        </div>
      </header>

      <div className="wz-body-wrap">
        <DesignsProvider designs={designs}>
          <CreateWizard
            signedIn={Boolean(session?.user)}
            signedInEmail={session?.user?.email ?? null}
            purchasable={isPurchasable()}
            priceLabel={priceLabel()}
          />
        </DesignsProvider>
      </div>
    </div>
  );
}
