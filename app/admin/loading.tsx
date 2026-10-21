import { LoaderCircle } from "lucide-react";

// Shown the moment a link in the admin is tapped, while the next page loads
// (on the live site the content comes from GitHub, which can take a second).
export default function AdminLoading() {
  return (
    <div className="mx-auto max-w-5xl px-4 md:px-8 py-10 md:py-14" role="status" aria-live="polite">
      <p className="inline-flex items-center gap-3 text-[1.125rem] text-soft">
        <LoaderCircle aria-hidden className="size-6 animate-spin" /> Loading…
      </p>
      <div aria-hidden className="mt-8 grid gap-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-28 bg-white border border-ink/10 animate-pulse" />
        ))}
      </div>
    </div>
  );
}
