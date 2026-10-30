"use client";

import { useState } from "react";
import { LoaderCircle } from "lucide-react";

// The "Sign out" link in the admin header. app/api/admin/logout/route.ts does the signing out.
export default function SignOutButton() {
  const [busy, setBusy] = useState(false);
  return (
    // The unsaved-changes warning (EditorFrame) can cancel this submit first.
    <form action="/api/admin/logout" method="post" onSubmit={(e) => !e.defaultPrevented && setBusy(true)}>
      <button
        type="submit"
        disabled={busy}
        className="inline-flex items-center gap-2 min-h-11 px-3 underline underline-offset-4 hover:bg-surface disabled:no-underline disabled:text-soft"
      >
        {busy && <LoaderCircle aria-hidden className="size-4 animate-spin" />}
        {busy ? "Signing out…" : "Sign out"}
      </button>
    </form>
  );
}
