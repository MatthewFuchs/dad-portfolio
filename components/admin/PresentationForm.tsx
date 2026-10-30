"use client";

import { useState } from "react";
import { thumb, type PresentationDraft } from "../../lib/admin-types";
import EditorFrame from "./EditorFrame";
import { ChipInput, Choice, describe, Field, Section, type Errors } from "./fields";
import ImagePicker, { type ImageValue } from "./ImagePicker";

// The add/change form for a presentation. It only holds what's typed: EditorFrame
// does the saving, and lib/admin-content.ts checks everything on the server.
export default function PresentationForm({
  id,
  initial,
  manufacturers,
  topicSuggestions,
}: {
  id: string | null;
  initial: PresentationDraft;
  manufacturers: { id: string; name: string }[];
  topicSuggestions: string[];
}) {
  const [f, setF] = useState(initial);
  const [banner, setBanner] = useState<ImageValue>(
    initial.banner && "path" in initial.banner ? { ref: initial.banner, preview: thumb(initial.banner.path) } : null
  );
  const [errors, setErrors] = useState<Errors>({});
  // Changes one field and leaves the others alone.
  const set = <K extends keyof PresentationDraft>(k: K, v: PresentationDraft[K]) => setF((s) => ({ ...s, [k]: v }));
  // What gets sent to the server on Save.
  const draft: PresentationDraft = { ...f, banner: banner?.ref ?? null };

  return (
    <EditorFrame collection="presentations" id={id} name={f.title || "this presentation"} draft={draft} onErrors={setErrors}>
      <Section title="About the presentation">
        <Field id="title" label="Title" error={errors.title}>
          <input id="title" value={f.title} onChange={(e) => set("title", e.target.value)} className="admin-input" {...describe("title", false, errors.title)} />
        </Field>
        <Field id="subtitle" label="Second line" optional help="Shown under the title, e.g. an accreditation." error={errors.subtitle}>
          <input id="subtitle" value={f.subtitle} onChange={(e) => set("subtitle", e.target.value)} className="admin-input" {...describe("subtitle", true, errors.subtitle)} />
        </Field>
        <Field id="manufacturer" label="Manufacturer" help="Whose products the presentation is about.">
          <select id="manufacturer" value={f.manufacturer} onChange={(e) => set("manufacturer", e.target.value)} className="admin-input" {...describe("manufacturer", true)}>
            <option value="">None</option>
            {manufacturers.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </Field>
        <Field id="blurb" label="Description" help="A few sentences on what the presentation covers." error={errors.blurb}>
          <textarea id="blurb" rows={5} value={f.blurb} onChange={(e) => set("blurb", e.target.value)} className="admin-input" {...describe("blurb", true, errors.blurb)} />
        </Field>
        <Field id="topics" label="Topics" help="Short labels shown on the card. Pick from the list, or type a new one." error={errors.topics}>
          <ChipInput id="topics" value={f.topics} onChange={(v) => set("topics", v)} suggestions={topicSuggestions} placeholder="e.g. Thermal Bridging" />
        </Field>
      </Section>

      <Section title="Picture" help="Shown at the top of the presentation's card.">
        <Field id="banner" label="Picture" error={errors.banner}>
          <ImagePicker id="banner" value={banner} onChange={setBanner} kind="photo" fit={f.bannerFit} error={errors.banner} aspect="aspect-[16/9]" />
        </Field>
        <Field id="bannerFit" label="How the picture fits">
          <Choice
            name="bannerFit"
            value={f.bannerFit}
            onChange={(v) => set("bannerFit", v)}
            options={[
              { value: "cover", label: "Fill the space", help: "Best for photos (edges may be trimmed)" },
              { value: "contain", label: "Show the whole picture", help: "Best for diagrams and logos" },
            ]}
          />
        </Field>
      </Section>
    </EditorFrame>
  );
}
