import Link from "next/link";
import { auth } from "@/lib/auth";
import { Particles } from "@/components/site/Particles";
import { SignOutButton } from "@/components/dashboard/SignOutButton";
import { COMPANY } from "@/lib/company";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <div className="tone-dark dash-shell">
      <Particles />

      <header className="dash-bar">
        <div className="dash-bar-in">
          <Link href="/dashboard" className="nav-brand">
            <span className="wm">{COMPANY.wordmark}</span>
            <span className="tg">Celebrations that last a lifetime</span>
          </Link>
          <span className="dim dash-email">{session?.user?.email}</span>
          <SignOutButton />
        </div>
      </header>

      <div className="dash-body">{children}</div>
    </div>
  );
}
