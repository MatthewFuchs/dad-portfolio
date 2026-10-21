"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { Check, LoaderCircle, Trash2 } from "lucide-react";
import { NOUNS, type CollectionName } from "../../lib/admin-types";
import type { Errors } from "./fields";

// Wraps an edit form: the Save bar fixed to the bottom of the screen, the
// "Remove" button and its confirmation, and a warning before leaving with
// changes that aren't saved. Photos and PDFs upload as soon as they're
// chosen; Save waits until they've finished.

const UploadTracker = createContext<(p: Promise<unknown>) => void>(() => {});
export const useTrackUpload = () => useContext(UploadTracker);

type Status = { kind: "idle" } | { kind: "saving" } | { kind: "error"; message: string };

const LEAVE = "You have changes that aren't saved yet. Leave this page without saving?";

export default function EditorFrame({
  collection,
  id,
  name,
  draft,
  onErrors,
  deleteNote,
  children,
}: {
  collection: CollectionName;
  id: string | null;
  name: string;
  draft: unknown;
  onErrors: (e: Errors) => void;
  deleteNote?: string;
  children: ReactNode;
}) {
  const noun = NOUNS[collection].one;
  const current = JSON.stringify(draft);
  const [baseline] = useState(current);
  const changed = current !== baseline;
  // A new entry can always be saved; an existing one once something changed.
  const dirty = id === null || changed;
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [pending, setPending] = useState(0);
  const leaving = useRef(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const [removing, setRemoving] = useState(false);
  const [removeError, setRemoveError] = useState("");

  const track = useCallback((p: Promise<unknown>) => {
    setPending((n) => n + 1);
    p.finally(() => setPending((n) => n - 1));
  }, []);

  // Warn before closing the tab, following a link or signing out with unsaved changes.
  useEffect(() => {
    if (!changed) return;
    const beforeUnload = (e: BeforeUnloadEvent) => {
      if (!leaving.current) e.preventDefault();
    };
    const click = (e: MouseEvent) => {
      const a = (e.target as Element).closest?.("a[href]");
      if (a && !a.getAttribute("target") && !leaving.current && !confirm(LEAVE)) e.preventDefault();
      else if (a && !a.getAttribute("target")) leaving.current = true;
    };
    const submit = (e: SubmitEvent) => {
      if (!leaving.current && !confirm(LEAVE)) e.preventDefault();
      else leaving.current = true;
    };
    window.addEventListener("beforeunload", beforeUnload);
    document.addEventListener("click", click, true);
    document.querySelectorAll("header form").forEach((f) => f.addEventListener("submit", submit as EventListener));
    return () => {
      window.removeEventListener("beforeunload", beforeUnload);
      document.removeEventListener("click", click, true);
      document.querySelectorAll("header form").forEach((f) => f.removeEventListener("submit", submit as EventListener));
    };
  }, [changed]);

  async function save() {
    if (pending > 0) return;
    setStatus({ kind: "saving" });
    onErrors({});
    try {
      const res = await fetch("/api/admin/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ collection, id, draft }),
      });
      const body = await res.json().catch(() => ({}));
      if (res.ok && body.ok) {
        leaving.current = true;
        window.location.replace(`/admin/${collection}/${body.id}?saved=${id ? "1" : "new"}`);
        return;
      }
      if (res.status === 401) {
        setStatus({ kind: "error", message: "You've been signed out. Open the website editor in a new tab, sign in, then come back and press Save again." });
        return;
      }
      if (body.fields) {
        onErrors(body.fields);
        // Bring the first problem into view.
        requestAnimationFrame(() => {
          const first = document.querySelector<HTMLElement>("[data-error=true]");
          first?.scrollIntoView({ behavior: "smooth", block: "center" });
          first?.querySelector<HTMLElement>("input, textarea, select, button")?.focus({ preventScroll: true });
        });
        setStatus({ kind: "error", message: "Some things need fixing. They're marked in red." });
        return;
      }
      setStatus({ kind: "error", message: body.error || "Saving didn't work. Please try again." });
    } catch {
      setStatus({ kind: "error", message: "Couldn't reach the website. Please check your internet connection and try again." });
    }
  }

  async function remove() {
    setRemoving(true);
    setRemoveError("");
    try {
      const res = await fetch("/api/admin/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ collection, id }),
      });
      const body = await res.json().catch(() => ({}));
      if (res.ok && body.ok) {
        leaving.current = true;
        window.location.replace(`/admin/${collection}?removed=${encodeURIComponent(name)}`);
        return;
      }
      setRemoveError(body.error || "Removing didn't work. Please try again.");
    } catch {
      setRemoveError("Couldn't reach the website. Please check your internet connection.");
    }
    setRemoving(false);
  }

  const busy = status.kind === "saving";
  return (
    <UploadTracker.Provider value={track}>
      <div className="space-y-6 pb-40">
        {children}

        {id && (
          <section className="border border-ink/10 p-5 md:p-8">
            <h2 className="text-[1.25rem]">Remove this {noun}</h2>
            <p className="mt-2 text-soft max-w-[62ch]">
              Takes it off the website.{deleteNote ? ` ${deleteNote}` : ""}
            </p>
            <button
              type="button"
              onClick={() => dialog.current?.showModal()}
              className="btn btn-ghost mt-4 [--btn-fg:#991b1b] [--btn-line:#991b1b] [--btn-hover:#991b1b]"
            >
              <Trash2 aria-hidden className="size-5" /> Remove {noun}
            </button>
          </section>
        )}
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 bg-white border-t border-ink/15 shadow-[0_-8px_24px_rgba(0,0,0,0.06)]">
        <div className="mx-auto max-w-5xl px-4 md:px-8 py-3 flex flex-wrap items-center gap-x-5 gap-y-2">
          <button type="button" onClick={save} className="btn" disabled={busy || pending > 0 || !dirty}>
            {(busy || pending > 0) && <LoaderCircle aria-hidden className="size-5 animate-spin" />}
            {busy ? "Saving…" : pending > 0 ? "Uploading…" : id ? "Save changes" : `Add ${noun} to website`}
          </button>
          <p aria-live="polite" className={`text-[15px] flex-1 min-w-[16ch] ${status.kind === "error" ? "text-red-800 font-medium" : "text-soft"}`}>
            {status.kind === "error"
              ? status.message
              : pending > 0
                ? "Waiting for files to finish uploading…"
                : id === null
                  ? "Nothing goes on the website until you press this button."
                  : !dirty
                  ? (
                      <span className="inline-flex items-center gap-1">
                        <Check aria-hidden className="size-4" /> No unsaved changes
                      </span>
                    )
                  : "You have unsaved changes."}
          </p>
        </div>
      </div>

      <dialog
        ref={dialog}
        aria-labelledby="remove-title"
        className="m-auto w-[min(32rem,calc(100vw-2rem))] bg-white p-6 md:p-8 backdrop:bg-ink/50"
      >
        <h2 id="remove-title" className="text-[1.5rem]">
          Remove &ldquo;{name}&rdquo;?
        </h2>
        <p className="mt-3 text-soft">
          This takes the {noun} off the website. If it was a mistake, Matt can bring it back.
        </p>
        {removeError && <p role="alert" className="mt-4 text-red-800 font-medium">{removeError}</p>}
        <div className="mt-6 flex flex-wrap gap-3">
          <button type="button" onClick={remove} disabled={removing} className="btn [--btn-bg:#991b1b] [--btn-hover:#7f1d1d]">
            {removing && <LoaderCircle aria-hidden className="size-5 animate-spin" />}
            {removing ? "Removing…" : "Yes, remove it"}
          </button>
          <button type="button" onClick={() => dialog.current?.close()} className="btn btn-ghost" autoFocus>
            Keep it
          </button>
        </div>
      </dialog>
    </UploadTracker.Provider>
  );
}
