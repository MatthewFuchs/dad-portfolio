"use client";

import { useState } from "react";

export default function EmailForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle"
  );
  const [err, setErr] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    setErr("");

    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form) as any);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error || "Failed");
      setStatus("sent");
      form.reset();
    } catch (e: any) {
      setStatus("error");
      setErr(e.message || "Something went wrong");
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <input
        type="text"
        name="website"
        className="hidden"
        tabIndex={-1}
        autoComplete="off"
      />

      <input
        name="name"
        placeholder="Your name"
        className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black"
        required
      />
      <input
        name="company"
        placeholder="Company (optional)"
        className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black"
      />
      <input
        name="email"
        type="email"
        placeholder="Your email"
        className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black"
        required
      />
      <textarea
        name="message"
        placeholder="How can we help?"
        rows={6}
        className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black"
        required
      />

      <button
        type="submit"
        disabled={status === "sending"}
        className="bg-black text-white px-5 py-3 rounded-lg font-semibold hover:bg-gray-800 transition disabled:opacity-60"
      >
        {status === "sending" ? "Sending…" : "Send"}
      </button>

      {status === "sent" && (
        <p className="text-green-700 text-sm">
          Thanks! Your message has been sent.
        </p>
      )}
      {status === "error" && (
        <p className="text-red-700 text-sm">
          Sorry, something went wrong. {err}
        </p>
      )}
    </form>
  );
}
