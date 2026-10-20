import type { ReactNode } from "react";

// Shared opening for inner pages: one large heading and a lead sentence,
// left-aligned on the page gutter, clearing the fixed nav and breadcrumbs.
export default function PageHeader({
  title,
  lead,
  children,
}: {
  title: string;
  lead?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <header className="gutter pt-24 lg:pt-28 pb-8 md:pb-12">
      <h1 className="text-[length:var(--text-display)] leading-[0.98] tracking-[-0.035em]">
        {title}
      </h1>
      {lead && (
        <p
          className="mt-6 md:mt-8 max-w-[48ch] text-[length:var(--text-lead)] leading-snug"
        >
          {lead}
        </p>
      )}
      {children}
    </header>
  );
}
