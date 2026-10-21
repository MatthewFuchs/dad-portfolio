"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import SmoothScroll from "./SmoothScroll";

// The public site's frame: nav, main landmark, footer and smooth scrolling.
// The admin panel (/admin) renders full-screen without any of it.
export default function SiteChrome({
  header,
  footer,
  children,
}: {
  header: ReactNode;
  footer: ReactNode;
  children: ReactNode;
}) {
  const pathname = usePathname() ?? "";
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    return <>{children}</>;
  }
  return (
    <>
      {header}
      <main id="main" className="flex-1">
        {children}
      </main>
      <SmoothScroll />
      {footer}
    </>
  );
}
