"use client";

import { ChevronDown, X as XIcon } from "lucide-react";
import React from "react";

// The row of filter buttons on the Presentations, Products and Projects pages,
// with an optional dropdown. It only shows the choices; each page does the filtering.
export type SelectOption = { label: string; value: string };

type SecondarySelect = {
  placeholder: string;
  value: string | null;
  options: SelectOption[];
  onChange: (v: string | null) => void;
};

type Props = {
  title?: string;
  allLabel?: string;
  options: string[];
  active: string[];
  onChange: (next: string[]) => void;
  multi?: boolean;
  secondary?: SecondarySelect;
  className?: string;
};

const cx = (...c: Array<string | false | null | undefined>) =>
  c.filter(Boolean).join(" ");

function Chip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cx(
        "min-h-11 shrink-0 snap-start whitespace-nowrap px-4 text-[length:var(--text-small)] transition-[background-color,color,transform] duration-200 active:scale-[0.98]",
        active
          ? "bg-olive text-ink font-medium shadow-[inset_0_0_0_1px_var(--color-olive-ink)]"
          : "bg-white text-ink shadow-[inset_0_0_0_1px_rgba(22,24,21,0.2)] hover:bg-surface"
      )}
    >
      {label}
    </button>
  );
}

export default function FilterBar({
  title = "Filter",
  allLabel = "All",
  options,
  active,
  onChange,
  multi = true,
  secondary,
  className = "",
}: Props) {
  const hasPrimary = active.length > 0;
  const hasSecondary = Boolean(secondary?.value);
  const hasFilters = hasPrimary || hasSecondary;

  const toggle = (opt: string) => {
    if (multi) {
      onChange(
        active.includes(opt)
          ? active.filter((x) => x !== opt)
          : [...active, opt]
      );
    } else {
      onChange(active[0] === opt ? [] : [opt]);
    }
  };

  const clear = () => onChange([]);

  const secondaryLabel =
    secondary && secondary.value
      ? secondary.options.find((o) => o.value === secondary.value)?.label ?? ""
      : "";

  return (
    <div
      className={className}
    >
      <div className="flex min-w-0 flex-col gap-3 md:grid md:grid-cols-[1fr_auto_auto] md:items-center">
        {/* WRAPPED PRIMARY PILLS */}
        <div className="-mx-[clamp(1rem,5vw,5.5rem)] flex snap-x gap-1.5 overflow-x-auto px-[clamp(1rem,5vw,5.5rem)] pb-1 [scrollbar-width:none] md:mx-0 md:flex-wrap md:overflow-visible md:px-0 md:pb-0">
          <Chip label={allLabel} active={!hasPrimary} onClick={clear} />
          {options.map((opt) => (
            <Chip
              key={opt}
              label={opt}
              active={active.includes(opt)}
              onClick={() => toggle(opt)}
            />
          ))}
        </div>

        {/* SECONDARY SELECT */}
        <div className="flex items-center md:justify-end">
          {secondary && (
            <div className="relative inline-flex items-center">
              <select
                value={secondary.value ?? ""}
                onChange={(e) => secondary.onChange(e.target.value || null)}
                className="appearance-none min-h-11 bg-surface pl-4 pr-10 text-[length:var(--text-small)] text-ink"
                aria-label={secondary.placeholder}
              >
                <option value="">{secondary.placeholder}</option>
                {secondary.options.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 h-4 w-4" />
            </div>
          )}
        </div>

        {/* RESET */}
        <div className="flex items-center md:justify-end">
          {hasFilters && (
            <button
              type="button"
              onClick={() => {
                clear();
                if (secondary) secondary.onChange(null);
              }}
              className="link min-h-11 px-1 text-[length:var(--text-small)]"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* ACTIVE TOKENS */}
      {hasFilters && (
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1">
          {active.map((a) => (
            <button
              key={a}
              type="button"
              onClick={() => onChange(active.filter((x) => x !== a))}
              className="inline-flex items-center gap-1 text-[length:var(--text-small)] text-soft hover:text-ink transition-colors"
              aria-label={`Remove filter ${a}`}
            >
              {a} <XIcon className="h-3.5 w-3.5" aria-hidden />
            </button>
          ))}
          {secondary && secondary.value && (
            <button
              type="button"
              onClick={() => secondary.onChange(null)}
              className="inline-flex items-center gap-1 text-[length:var(--text-small)] text-soft hover:text-ink transition-colors"
              aria-label={`Remove ${secondary.placeholder}`}
            >
              {secondary.placeholder.replace(/:\s*All$/i, ":")} {secondaryLabel}{" "}
              <XIcon className="h-3.5 w-3.5" aria-hidden />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
