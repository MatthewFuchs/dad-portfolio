"use client";

import { useEffect, useRef, useState } from "react";

const INBOX = "gfuchs@fuchs-sales.ca";
const TIMEOUT_MS = 15000;

type Status = "idle" | "sending" | "sent" | "error";

// Contact form. While sending, the fields lock and the button says so; on
// success the form is replaced by a confirmation; on any failure (offline,
// timeout, server error) the visitor keeps what they typed and can retry or
// send the same message from their own email app.
export default function EmailForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [reason, setReason] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  // Until React is running, a click would do a native GET submit and put the
  // message in the URL; the button stays disabled until then.
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form)) as Record<string, string>;

    if (!navigator.onLine) {
      setReason("You appear to be offline.");
      setStatus("error");
      return;
    }

    setStatus("sending");
    setReason("");
    // Give up after TIMEOUT_MS so a stalled connection can't leave the form stuck.
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        signal: ctrl.signal,
      });
      const json = await res.json().catch(() => null);
      if (res.status === 429) throw new Error("rate");
      if (!res.ok || !json?.ok) throw new Error("server");
      setStatus("sent");
      form.reset();
    } catch (err) {
      setReason(
        err instanceof DOMException && err.name === "AbortError"
          ? "The server took too long to respond."
          : err instanceof Error && err.message === "rate"
          ? "Too many messages were sent from this connection. Please wait a few minutes."
          : "The message could not be delivered."
      );
      setStatus("error");
    } finally {
      clearTimeout(timer);
    }
  }

  // Same message, addressed from the visitor's own email app.
  const mailtoFallback = () => {
    const f = formRef.current;
    const v = (n: string) =>
      (f?.elements.namedItem(n) as HTMLInputElement | null)?.value ?? "";
    const body = [
      v("message"),
      "",
      `${v("name")}${v("company") ? `, ${v("company")}` : ""}`,
      v("email"),
    ].join("\n");
    return `mailto:${INBOX}?subject=${encodeURIComponent(
      `Website enquiry from ${v("name") || "the contact form"}`
    )}&body=${encodeURIComponent(body)}`;
  };

  const field =
    "mt-1.5 block w-full bg-ground px-4 py-3 border border-transparent text-ink placeholder:text-soft/70 focus:outline-none focus:border-ink disabled:opacity-60";

  if (status === "sent") {
    return (
      <div role="status" className="py-4">
        <p className="text-[length:var(--text-lead)] leading-snug">
          Thanks, your message is on its way. Greg will reply to the email
          address you gave.
        </p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="link mt-6 min-h-11 font-medium"
        >
          Send another message
        </button>
      </div>
    );
  }

  // The hidden "website" field below is a trap for spam bots. People never see it,
  // so if it arrives filled in, app/api/contact/route.ts quietly ignores the message.
  const sending = status === "sending";

  return (
    <form
      ref={formRef}
      method="post"
      onSubmit={onSubmit}
      aria-busy={sending}
      className="space-y-5"
    >
      <input
        type="text"
        name="website"
        className="hidden"
        tabIndex={-1}
        autoComplete="off"
      />
      <fieldset disabled={sending} className="space-y-5">
        <label className="block">
          <span className="text-[length:var(--text-small)]">Name</span>
          <input name="name" autoComplete="name" className={field} required />
        </label>
        <label className="block">
          <span className="text-[length:var(--text-small)]">
            Company <span className="text-soft">(optional)</span>
          </span>
          <input name="company" autoComplete="organization" className={field} />
        </label>
        <label className="block">
          <span className="text-[length:var(--text-small)]">Email</span>
          <input
            name="email"
            type="email"
            autoComplete="email"
            className={field}
            required
          />
        </label>
        <label className="block">
          <span className="text-[length:var(--text-small)]">How can we help?</span>
          <textarea name="message" rows={6} className={field} required />
        </label>
      </fieldset>

      {status === "error" && (
        <div role="alert" className="bg-ground p-4 sm:p-5">
          <p className="font-medium">Your message was not sent.</p>
          <p className="mt-1 text-soft">
            {reason} What you typed is still here.
          </p>
          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
            <button type="submit" className="link min-h-11 font-medium">
              Try again
            </button>
            <a
              href={`mailto:${INBOX}`}
              onClick={(e) => (e.currentTarget.href = mailtoFallback())}
              className="link inline-flex min-h-11 items-center font-medium"
            >
              Send it from your email app
            </a>
          </div>
        </div>
      )}

      {status !== "error" && (
        <button
          type="submit"
          disabled={sending || !ready}
          className="btn btn-dark w-full sm:w-auto disabled:cursor-wait disabled:opacity-70"
        >
          {sending && (
            <span
              aria-hidden
              className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white motion-reduce:animate-none"
            />
          )}
          {sending ? "Sending…" : "Send message"}
        </button>
      )}
    </form>
  );
}
