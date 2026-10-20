"use client";

// Last resort when the root layout itself fails: it replaces the whole
// document, so it carries its own <html>, <body> and inline styles.
export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en-CA">
      <body
        style={{
          margin: 0,
          minHeight: "100svh",
          display: "grid",
          placeItems: "center",
          background: "#f3f3f0",
          color: "#161815",
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
          padding: "1rem",
        }}
      >
        <main style={{ maxWidth: "36rem" }}>
          <h1 style={{ fontSize: "2.25rem", fontWeight: 400, margin: 0 }}>
            Fuchs Sales &amp; Consulting is having trouble
          </h1>
          <p style={{ fontSize: "1.125rem", lineHeight: 1.5 }}>
            The site could not load. Please try again, or reach Greg directly
            at <a href="mailto:gfuchs@fuchs-sales.ca">gfuchs@fuchs-sales.ca</a>{" "}
            or <a href="tel:+17782416316">+1 (778) 241-6316</a>.
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: "1rem",
              minHeight: "3.25rem",
              padding: "0 1.5rem",
              border: 0,
              background: "#9caf88",
              color: "#161815",
              fontSize: "1rem",
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
