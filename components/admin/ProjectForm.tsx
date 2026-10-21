"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { thumb, type ProjectDraft } from "../../lib/admin-types";
import EditorFrame from "./EditorFrame";
import { ChipInput, describe, Field, Section, type Errors } from "./fields";
import GalleryEditor, { type GalleryItem } from "./GalleryEditor";
import ImagePicker, { type ImageValue } from "./ImagePicker";

export type ManufacturerOption = { id: string; name: string; logo: string; logoBackground?: "white" | "dark" };

export default function ProjectForm({
  id,
  initial,
  manufacturers,
  sectorSuggestions,
  webAddress,
}: {
  id: string | null;
  initial: ProjectDraft;
  manufacturers: ManufacturerOption[];
  sectorSuggestions: string[];
  webAddress?: string;
}) {
  const [f, setF] = useState(() => ({ ...initial, gallery: undefined }));
  const [hero, setHero] = useState<ImageValue>(
    initial.hero && "path" in initial.hero ? { ref: initial.hero, preview: thumb(initial.hero.path) } : null
  );
  const [gallery, setGallery] = useState<GalleryItem[]>(() =>
    initial.gallery.map((g, i) => ({
      key: `saved-${i}`, // the same on server and browser (newKey() is for photos added later)
      ref: g.image,
      preview: "path" in g.image ? thumb(g.image.path) : "",
      caption: g.caption,
      stage: g.stage,
    }))
  );
  const [errors, setErrors] = useState<Errors>({});
  const set = <K extends keyof ProjectDraft>(k: K, v: ProjectDraft[K]) => setF((s) => ({ ...s, [k]: v }));

  const draft: ProjectDraft = {
    name: f.name,
    focus: f.focus,
    location: f.location,
    year: f.year,
    summary: f.summary,
    sectors: f.sectors,
    manufacturers: f.manufacturers,
    hero: hero?.ref ?? null,
    gallery: gallery.map((g) => ({ image: g.ref!, caption: g.caption, stage: g.stage })),
  };

  return (
    <EditorFrame collection="projects" id={id} name={f.name || "this project"} draft={draft} onErrors={setErrors}>
      <Section title="About the project">
        <Field id="name" label="Project name" help="As you'd say it, e.g. Cloverdale Athletic Park Soccer Clubhouse." error={errors.name}>
          <input id="name" value={f.name} onChange={(e) => set("name", e.target.value)} className="admin-input" {...describe("name", true, errors.name)} />
        </Field>
        <Field id="focus" label="Short description" optional help="A few words shown after the name, e.g. Tree Pits." error={errors.focus}>
          <input id="focus" value={f.focus} onChange={(e) => set("focus", e.target.value)} className="admin-input" {...describe("focus", true, errors.focus)} />
        </Field>
        <div className="grid gap-6 md:grid-cols-[2fr_1fr]">
          <Field id="location" label="City and province" help="e.g. Surrey, BC" error={errors.location}>
            <input id="location" value={f.location} onChange={(e) => set("location", e.target.value)} className="admin-input" {...describe("location", true, errors.location)} />
          </Field>
          <Field id="year" label="Year" optional help="e.g. 2024" error={errors.year}>
            <input
              id="year"
              inputMode="numeric"
              maxLength={4}
              value={f.year}
              onChange={(e) => set("year", e.target.value.replace(/\D/g, ""))}
              className="admin-input"
              {...describe("year", true, errors.year)}
            />
          </Field>
        </div>
        <Field id="summary" label="About this project" help="A few sentences: what was built and how the products were used." error={errors.summary}>
          <textarea
            id="summary"
            rows={6}
            value={f.summary}
            onChange={(e) => set("summary", e.target.value)}
            className="admin-input"
            {...describe("summary", true, errors.summary)}
          />
        </Field>
        <p className="text-[15px] text-soft">
          {webAddress ? (
            <>
              Web page:{" "}
              <a href={webAddress} target="_blank" rel="noopener" className="link">
                fuchs-sales.ca{webAddress}
              </a>
            </>
          ) : (
            "The project's web page address is made from its name when you add it."
          )}
        </p>
      </Section>

      <Section title="Main photo" help="The large photo at the top of the project page, also used on the project's card.">
        <Field id="hero" label="Main photo" error={errors.hero}>
          <ImagePicker id="hero" value={hero} onChange={setHero} kind="photo" error={errors.hero} aspect="aspect-[16/10]" />
        </Field>
      </Section>

      <Section
        title="More photos"
        help={
          <>
            <p>Shown on the project page in this order. Use the arrows (or drag on a computer) to change the order.</p>
            <p className="mt-2">
              <strong className="font-medium text-ink">Step-by-step build:</strong> with 4 or more photos and a step name on
              every photo (like Excavation, Liner, Finished), the page shows them as a build sequence visitors can step through.
            </p>
          </>
        }
      >
        <GalleryEditor items={gallery} setItems={setGallery} errors={errors} />
      </Section>

      <Section title="Products used" help="Tick the manufacturers whose products were used. Their logos appear on the project page.">
        <div role="group" aria-label="Products used" className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {manufacturers.map((m) => {
            const on = f.manufacturers.includes(m.id);
            return (
              <button
                key={m.id}
                type="button"
                aria-pressed={on}
                onClick={() => set("manufacturers", on ? f.manufacturers.filter((x) => x !== m.id) : [...f.manufacturers, m.id])}
                className={`flex items-center gap-3 p-3 border text-left ${on ? "border-ink bg-surface" : "border-ink/15 hover:border-ink/50"}`}
              >
                <span className={`grid place-items-center size-6 border shrink-0 ${on ? "bg-ink border-ink text-white" : "border-ink/40"}`}>
                  {on && <Check aria-hidden className="size-4" />}
                </span>
                <span className={`grid place-items-center w-20 h-10 shrink-0 ${m.logoBackground === "dark" ? "bg-neutral-900" : "bg-white"}`}>
                  <img src={thumb(m.logo, 200)} alt="" className="max-h-8 max-w-[4.5rem] object-contain" />
                </span>
                <span>{m.name}</span>
              </button>
            );
          })}
        </div>
      </Section>

      <Section title="Type of work" help="Used for the filter buttons on the Projects page. Pick from the list, or type a new one.">
        <Field id="sectors" label="Type of work" error={errors.sectors}>
          <ChipInput id="sectors" value={f.sectors} onChange={(v) => set("sectors", v)} suggestions={sectorSuggestions} placeholder="e.g. Drainage" />
        </Field>
      </Section>
    </EditorFrame>
  );
}
