"use client";

import { useState } from "react";
import { thumb, type ManufacturerDraft } from "../../lib/admin-types";
import EditorFrame from "./EditorFrame";
import DocumentsEditor, { type DocItem } from "./DocumentsEditor";
import { CheckChips, ChipInput, Choice, describe, Field, Section, type Errors } from "./fields";
import ImagePicker, { type ImageValue } from "./ImagePicker";

// The add/change form for a manufacturer. It only holds what's typed: EditorFrame
// does the saving, and lib/admin-content.ts checks everything on the server.
export default function ManufacturerForm({
  id,
  initial,
  categoryOptions,
  usedBy,
}: {
  id: string | null;
  initial: ManufacturerDraft;
  categoryOptions: string[];
  usedBy?: string;
}) {
  const [f, setF] = useState(initial);
  const [logo, setLogo] = useState<ImageValue>(
    initial.logo && "path" in initial.logo ? { ref: initial.logo, preview: thumb(initial.logo.path) } : null
  );
  const [docs, setDocs] = useState<DocItem[]>(() =>
    initial.documents.map((d, i) => ({ key: `saved-${i}`, title: d.title, type: d.type, updated: d.updated, file: d.file, fileName: "" }))
  );
  const [errors, setErrors] = useState<Errors>({});
  // Changes one field and leaves the others alone.
  const set = <K extends keyof ManufacturerDraft>(k: K, v: ManufacturerDraft[K]) => setF((s) => ({ ...s, [k]: v }));

  // What gets sent to the server on Save.
  const draft: ManufacturerDraft = {
    name: f.name,
    website: f.website,
    logo: logo?.ref ?? null,
    logoBackground: f.logoBackground,
    shortInfo: f.shortInfo,
    innovation: f.innovation,
    categories: f.categories,
    documents: docs.map((d) => ({ title: d.title, type: d.type, updated: d.updated, file: d.file })),
  };
  // Categories typed by hand. The ones already in use appear as tick boxes instead.
  const extraCategories = f.categories.filter((c) => !categoryOptions.includes(c));

  return (
    <EditorFrame
      collection="manufacturers"
      id={id}
      name={f.name || "this manufacturer"}
      draft={draft}
      onErrors={setErrors}
      deleteNote={usedBy ? `It will also be taken off ${usedBy}. Its documents will be removed from the Resources page.` : "Its documents will be removed from the Resources page."}
    >
      <Section title="About the company">
        <Field id="name" label="Company name" error={errors.name}>
          <input id="name" value={f.name} onChange={(e) => set("name", e.target.value)} className="admin-input" {...describe("name", false, errors.name)} />
        </Field>
        <Field id="website" label="Website" help="e.g. www.truefoam.com" error={errors.website}>
          <input
            id="website"
            type="url"
            inputMode="url"
            value={f.website}
            onChange={(e) => set("website", e.target.value)}
            className="admin-input"
            {...describe("website", true, errors.website)}
          />
        </Field>
        <Field id="shortInfo" label="One-line description" help="Shown on the company's card on the Manufacturers page." error={errors.shortInfo}>
          <textarea id="shortInfo" rows={2} value={f.shortInfo} onChange={(e) => set("shortInfo", e.target.value)} className="admin-input" {...describe("shortInfo", true, errors.shortInfo)} />
        </Field>
        <Field
          id="innovation"
          label="What makes them stand out"
          optional
          help="A sentence or two, shown when someone opens the company's details."
          error={errors.innovation}
        >
          <textarea id="innovation" rows={3} value={f.innovation} onChange={(e) => set("innovation", e.target.value)} className="admin-input" {...describe("innovation", true, errors.innovation)} />
        </Field>
      </Section>

      <Section title="Logo" help="A PNG with a see-through background looks best.">
        <Field id="logo" label="Logo" error={errors.logo}>
          <ImagePicker id="logo" value={logo} onChange={setLogo} kind="logo" background={f.logoBackground} error={errors.logo} aspect="aspect-[3/1]" />
        </Field>
        <Field id="logoBackground" label="Background behind the logo">
          <Choice
            name="logoBackground"
            value={f.logoBackground}
            onChange={(v) => set("logoBackground", v)}
            options={[
              { value: "white", label: "White", help: "For most logos" },
              { value: "dark", label: "Dark", help: "For white or very light logos" },
            ]}
          />
        </Field>
      </Section>

      <Section title="Product categories" help="Used for the filter buttons on the Manufacturers page. Tap to choose.">
        <CheckChips label="Product categories" options={categoryOptions} value={f.categories} onChange={(v) => set("categories", v)} />
        <Field id="newCategory" label="Another category" optional help="Only if none of the ones above fit." error={errors.categories}>
          <ChipInput
            id="newCategory"
            value={extraCategories}
            onChange={(extra) => set("categories", [...f.categories.filter((c) => categoryOptions.includes(c)), ...extra])}
            suggestions={[]}
            placeholder="e.g. Waterproofing"
          />
        </Field>
      </Section>

      <Section title="Documents" help="Data sheets, brochures and other PDFs. They appear on the Resources page under this company, in this order.">
        <DocumentsEditor items={docs} setItems={setDocs} errors={errors} />
      </Section>
    </EditorFrame>
  );
}
