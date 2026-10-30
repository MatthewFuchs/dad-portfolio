"use client";

import { useEffect } from "react";
import Link from "next/link";

// Shown when a page fails to render. Nav and footer stay in place.
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  // Records the failure in the browser console, for debugging.
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="gutter bg-ground pt-24 lg:pt-28 pb-20 md:pb-24 grid gap-10 md:grid-cols-12 md:gap-x-6">
      <div className="md:col-span-7">
        <h1 className="text-[length:var(--text-head)]">
          This page did not load
        </h1>
        <p className="mt-5 max-w-[48ch] text-[length:var(--text-lead)] leading-snug">
          Something went wrong on our side. Trying again usually fixes it.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-3">
          <button type="button" onClick={reset} className="btn">
            Try again
          </button>
          <Link href="/" className="link inline-flex min-h-11 items-center font-medium">
            Go to the homepage
          </Link>
        </div>
        <p className="mt-10 text-soft">
          Still stuck? Email{" "}
          <a href="mailto:gfuchs@fuchs-sales.ca" className="link text-ink">
            gfuchs@fuchs-sales.ca
          </a>{" "}
          or call{" "}
          <a href="tel:+17782416316" className="link text-ink">
            +1 (778) 241-6316
          </a>
          .
          {/* A code that matches this failure in the server logs, if a visitor reports it. */}
          {error.digest && (
            <span className="block mt-2 text-[length:var(--text-small)]">
              Reference: {error.digest}
            </span>
          )}
        </p>
      </div>
    </div>
  );
}
