import Link from "next/link";
import { Kalash } from "@/components/decor";
import { SignOutButton } from "@/components/dashboard/SignOutButton";
import { auth } from "@/lib/auth";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <div className="min-h-dvh bg-neutral-50">
      <header className="sticky top-0 z-30 border-b border-neutral-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-5">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <Kalash className="h-6 w-6 text-[#8A1C1C]" />
            <span className="font-[family-name:var(--font-display)] text-lg tracking-wide text-[#5C1010]">
              Mangalyam
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="hidden text-sm text-neutral-500 sm:inline">
              {session?.user?.email}
            </span>
            <SignOutButton />
          </div>
        </div>
      </header>
      {children}
    </div>
  );
}
