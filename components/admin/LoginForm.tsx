"use client";

import { useState } from "react";
import { Eye, EyeOff, LoaderCircle } from "lucide-react";

// The email and password form. "next" is the admin page to open after signing in.
export default function LoginForm({ next }: { next: string }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [show, setShow] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setBusy(true);
    setError("");
    try {
      // Sent to app/api/admin/login/route.ts, which checks the password.
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.get("email"), password: form.get("password") }),
      });
      if (res.ok) {
        window.location.assign(next);
        return;
      }
      const body = await res.json().catch(() => ({}));
      setError(body.error || "Something went wrong. Please try again.");
    } catch {
      setError("Couldn't reach the website. Please check your internet connection.");
    }
    setBusy(false);
  }

  return (
    <form onSubmit={submit} className="mt-8 space-y-5" noValidate>
      <div>
        <label htmlFor="email" className="block font-medium">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          required
          className="admin-input mt-2"
        />
      </div>
      <div>
        <label htmlFor="password" className="block font-medium">
          Password
        </label>
        <div className="relative mt-2">
          <input
            id="password"
            name="password"
            type={show ? "text" : "password"}
            autoComplete="current-password"
            required
            className="admin-input pr-14"
          />
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="absolute right-0 top-0 h-full w-12 grid place-items-center text-soft hover:text-ink"
            aria-label={show ? "Hide password" : "Show password"}
          >
            {show ? <EyeOff aria-hidden className="size-5" /> : <Eye aria-hidden className="size-5" />}
          </button>
        </div>
      </div>
      {error && (
        <p role="alert" className="border-l-4 border-red-700 bg-red-50 px-4 py-3 text-red-900">
          {error}
        </p>
      )}
      <button type="submit" className="btn w-full" disabled={busy}>
        {busy && <LoaderCircle aria-hidden className="size-5 animate-spin" />}
        {busy ? "Signing in…" : "Sign in"}
      </button>
      <p className="text-[15px] text-soft">Forgot your password? Ask Matt to set a new one.</p>
    </form>
  );
}
