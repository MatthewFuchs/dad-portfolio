import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { currentAdmin } from "../../lib/auth";

export const metadata: Metadata = {
  title: { default: "Website editor", template: "%s | Website editor" },
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

// The admin's own frame: the company logo, who's signed in and a way back to
// the website. No site nav or footer (see components/SiteChrome.tsx).
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await currentAdmin();
  return (
    <div className="min-h-svh flex flex-col bg-ground text-[17px] md:text-[18px] tracking-normal">
      <header className="bg-white border-b border-ink/10">
        <div className="mx-auto max-w-5xl px-4 md:px-8 min-h-16 py-3 flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
          <Link href={session ? "/admin" : "/admin/login"} className="flex items-center gap-3 min-h-11">
            <Image src="/fuchs.png" alt="Fuchs Sales & Consulting" width={145} height={30} priority />
            <span className="hidden sm:inline border-l border-ink/15 pl-3 text-soft">Website editor</span>
          </Link>
          {session && (
            <div className="flex items-center gap-1 text-[15px]">
              <span className="hidden md:inline text-soft mr-2">Signed in as {session.name}</span>
              <a href="/" target="_blank" rel="noopener" className="inline-flex items-center gap-1 min-h-11 px-3 hover:bg-surface">
                View website <ArrowUpRight aria-hidden className="size-4" />
              </a>
              <form action="/api/admin/logout" method="post">
                <button type="submit" className="min-h-11 px-3 underline underline-offset-4 hover:bg-surface">
                  Sign out
                </button>
              </form>
            </div>
          )}
        </div>
      </header>
      <main id="main" className="flex-1">
        {children}
      </main>
    </div>
  );
}
