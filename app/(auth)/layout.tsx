import Link from "next/link";
import { Particles } from "@/components/site/Particles";
import { COMPANY } from "@/lib/company";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="tone-dark auth-shell">
      <Particles />
      <div className="auth-card-wrap">
        <Link href="/" className="nav-brand" style={{ textAlign: "center", marginBottom: "1.8rem" }}>
          <span className="wm" style={{ fontSize: "1.7rem" }}>{COMPANY.wordmark}</span>
          <span className="tg">Celebrations that last a lifetime</span>
        </Link>
        <div className="t t--lit">{children}</div>
      </div>
    </div>
  );
}
