import Link from "next/link";
import { Kalash } from "@/components/decor";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-[#FBF6EC] px-5 py-12">
      <Link href="/" className="mb-8 flex flex-col items-center gap-3">
        <Kalash className="h-11 w-11 text-[#8A1C1C]" />
        <span className="font-[family-name:var(--font-display)] text-2xl tracking-wide text-[#5C1010]">
          Mangalyam
        </span>
      </Link>
      <div className="w-full max-w-sm rounded-2xl border border-[#E4D6BC] bg-white p-7 shadow-sm">
        {children}
      </div>
    </div>
  );
}
