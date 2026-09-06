import Link from "next/link";
import { auth } from "@/lib/auth";
import { GopuramArch, Kalash, KolamBorder } from "@/components/decor";

export default async function HomePage() {
  const session = await auth();

  return (
    <main className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-[#FBF6EC] px-6 py-20 text-center">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 mx-auto h-full w-full max-w-[460px] text-[#C08A2E] opacity-25"
        aria-hidden="true"
      >
        <GopuramArch className="h-full w-full" />
      </div>

      <div className="relative">
        <Kalash className="mx-auto h-14 w-14 text-[#8A1C1C]" />
        <h1 className="mt-7 font-[family-name:var(--font-display)] text-5xl tracking-wide text-[#5C1010] sm:text-6xl">
          Mangalyam
        </h1>
        <KolamBorder
          id="home-kolam"
          className="mx-auto mt-5 h-5 w-52 text-[#C08A2E] opacity-70"
        />
        <p className="mx-auto mt-7 max-w-md text-[15px] leading-relaxed text-[#7A6553]">
          Digital invitations for Malaysian Indian weddings. One wedding, an
          invitation for every ceremony — each with its own venue, timing and
          RSVP.
        </p>

        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          {session?.user ? (
            <Link
              href="/dashboard"
              className="rounded-lg bg-[#8A1C1C] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#6F1414]"
            >
              Go to your dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/signup"
                className="rounded-lg bg-[#8A1C1C] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#6F1414]"
              >
                Get started
              </Link>
              <Link
                href="/login"
                className="rounded-lg border border-[#D9C5A0] px-6 py-3 text-sm font-medium text-[#5C1010] transition hover:bg-white"
              >
                Sign in
              </Link>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
