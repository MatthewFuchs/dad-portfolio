"use client";

import { ChevronDown, X as XIcon } from "lucide-react";
import React from "react";

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
        "px-3 py-1.5 rounded-full text-sm border transition",
        active
          ? "bg-black text-white border-black"
          : "bg-white text-gray-900 border-gray-300 hover:border-gray-500"
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
      className={cx(
        "rounded-2xl border border-gray-200 bg-white/70 px-3 py-3 md:px-4 md:py-3",
        className
      )}
    >
      <div className="flex flex-col gap-3 md:grid md:grid-cols-[1fr_auto_auto] md:items-center">
        {/* WRAPPED PRIMARY PILLS */}
        <div className="w-full flex flex-wrap gap-2">
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
                className="appearance-none rounded-full border border-gray-300 bg-white pl-3 pr-8 py-1.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-300"
                aria-label={secondary.placeholder}
              >
                <option value="">{secondary.placeholder}</option>
                {secondary.options.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 h-4 w-4 text-gray-500" />
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
              className="text-sm text-gray-600 underline decoration-transparent hover:decoration-gray-400 hover:text-gray-900"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* ACTIVE TOKENS */}
      {hasFilters && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {active.map((a) => (
            <button
              key={a}
              type="button"
              onClick={() => onChange(active.filter((x) => x !== a))}
              className="inline-flex items-center gap-1 rounded-full border border-gray-300 bg-white px-2.5 py-1 text-xs text-gray-700 hover:bg-gray-50"
              aria-label={`Remove filter ${a}`}
            >
              {a} <XIcon className="h-3.5 w-3.5" aria-hidden />
            </button>
          ))}
          {secondary && secondary.value && (
            <button
              type="button"
              onClick={() => secondary.onChange(null)}
              className="inline-flex items-center gap-1 rounded-full border border-gray-300 bg-white px-2.5 py-1 text-xs text-gray-700 hover:bg-gray-50"
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
