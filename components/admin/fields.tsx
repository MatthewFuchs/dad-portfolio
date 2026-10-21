"use client";

import { useId, useState, type ReactNode } from "react";
import { Check, Plus, X } from "lucide-react";

// Building blocks for the admin forms: plain labels, a line of help under
// each, and the problem (if any) in red right next to the field.

export type Errors = Record<string, string>;

export function Section({ title, help, children }: { title: string; help?: ReactNode; children: ReactNode }) {
  return (
    <section className="bg-white border border-ink/10 p-5 md:p-8">
      <h2 className="text-[1.5rem] md:text-[1.75rem]">{title}</h2>
      {help && <div className="mt-2 text-soft max-w-[62ch]">{help}</div>}
      <div className="mt-6 space-y-6">{children}</div>
    </section>
  );
}

export function Field({
  label,
  help,
  error,
  optional,
  children,
  id,
}: {
  label: string;
  help?: ReactNode;
  error?: string;
  optional?: boolean;
  id: string;
  children: ReactNode;
}) {
  return (
    <div data-error={error ? "true" : undefined}>
      <label htmlFor={id} className="block font-medium">
        {label}
        {optional && <span className="font-normal text-soft"> (optional)</span>}
      </label>
      {help && (
        <p id={`${id}-help`} className="mt-1 text-[15px] text-soft max-w-[62ch]">
          {help}
        </p>
      )}
      <div className="mt-2">{children}</div>
      {error && <FieldError id={`${id}-error`}>{error}</FieldError>}
    </div>
  );
}

export function FieldError({ id, children }: { id?: string; children: ReactNode }) {
  return (
    <p id={id} className="mt-2 text-[15px] font-medium text-red-800">
      {children}
    </p>
  );
}

/** aria props tying an input to its help line and error. */
export const describe = (id: string, help: boolean, error?: string) => ({
  "aria-invalid": error ? (true as const) : undefined,
  "aria-describedby": [help && `${id}-help`, error && `${id}-error`].filter(Boolean).join(" ") || undefined,
});

/** A list of short words or phrases (sectors, topics) with suggestions to tap. */
export function ChipInput({
  id,
  value,
  onChange,
  suggestions,
  placeholder,
}: {
  id: string;
  value: string[];
  onChange: (v: string[]) => void;
  suggestions: string[];
  placeholder: string;
}) {
  const [text, setText] = useState("");
  const add = (word: string) => {
    const w = word.trim();
    if (w && !value.some((v) => v.toLowerCase() === w.toLowerCase())) onChange([...value, w]);
    setText("");
  };
  const unused = suggestions.filter((s) => !value.some((v) => v.toLowerCase() === s.toLowerCase()));
  return (
    <div>
      {value.length > 0 && (
        <ul className="flex flex-wrap gap-2 mb-3" aria-label="Chosen">
          {value.map((v) => (
            <li key={v} className="inline-flex items-center bg-olive/35 pl-3">
              {v}
              <button
                type="button"
                onClick={() => onChange(value.filter((x) => x !== v))}
                className="grid place-items-center size-11 hover:bg-olive/50"
                aria-label={`Remove ${v}`}
              >
                <X aria-hidden className="size-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="flex gap-2">
        <input
          id={id}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              add(text);
            }
          }}
          placeholder={placeholder}
          className="admin-input"
        />
        <button type="button" onClick={() => add(text)} className="btn btn-ghost shrink-0" disabled={!text.trim()}>
          Add
        </button>
      </div>
      {unused.length > 0 && (
        <div className="mt-3">
          <p className="text-[15px] text-soft">Or tap one you&rsquo;ve used before:</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {unused.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => add(s)}
                className="inline-flex items-center gap-1 min-h-11 px-3 border border-ink/20 hover:border-ink hover:bg-surface"
              >
                <Plus aria-hidden className="size-4" /> {s}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/** Pick any number from a fixed list, shown as buttons that tick on and off. */
export function CheckChips({
  options,
  value,
  onChange,
  label,
}: {
  options: string[];
  value: string[];
  onChange: (v: string[]) => void;
  label: string;
}) {
  return (
    <div role="group" aria-label={label} className="flex flex-wrap gap-2">
      {options.map((o) => {
        const on = value.includes(o);
        return (
          <button
            key={o}
            type="button"
            aria-pressed={on}
            onClick={() => onChange(on ? value.filter((v) => v !== o) : [...value, o])}
            className={`inline-flex items-center gap-2 min-h-11 px-4 border ${
              on ? "bg-ink text-white border-ink" : "border-ink/25 hover:border-ink"
            }`}
          >
            {on && <Check aria-hidden className="size-4" />}
            {o}
          </button>
        );
      })}
    </div>
  );
}

/** One choice from a few, as large radio cards. */
export function Choice<T extends string>({
  name,
  value,
  onChange,
  options,
}: {
  name: string;
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string; help?: string }[];
}) {
  const base = useId();
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {options.map((o) => (
        <label
          key={o.value}
          htmlFor={`${base}-${o.value}`}
          className={`flex gap-3 p-4 border cursor-pointer ${
            value === o.value ? "border-ink bg-surface" : "border-ink/20 hover:border-ink/60"
          }`}
        >
          <input
            id={`${base}-${o.value}`}
            type="radio"
            name={name}
            value={o.value}
            checked={value === o.value}
            onChange={() => onChange(o.value)}
            className="mt-1 size-5 accent-[var(--color-ink)]"
          />
          <span>
            <span className="block font-medium">{o.label}</span>
            {o.help && <span className="block text-[15px] text-soft">{o.help}</span>}
          </span>
        </label>
      ))}
    </div>
  );
}
