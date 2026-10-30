"use client";

import type { Dispatch, SetStateAction } from "react";
import { ArrowDown, ArrowUp, FilePlus, FileText, LoaderCircle, Trash2 } from "lucide-react";
import { DOCUMENT_TYPES, type FileRef } from "../../lib/admin-types";
import { FieldError, type Errors } from "./fields";
import { DropZone, errorText, useUpload } from "./ImagePicker";
import { newKey } from "./GalleryEditor";

export type DocItem = {
  key: string;
  title: string;
  type: string;
  updated: string;
  file: FileRef | null;
  fileName: string;
  progress?: number | null;
  error?: string;
};

// "Product-Data_Sheet 2024.pdf" -> "Product Data Sheet 2024"
const titleFromFile = (name: string) => name.replace(/\.pdf$/i, "").replace(/[-_]+/g, " ").replace(/\s+/g, " ").trim();

// Returns a copy of the list with one item moved.
function move<T>(list: T[], from: number, to: number) {
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

/** A manufacturer's PDFs (data sheets, brochures…), shown on the Resources page. */
export default function DocumentsEditor({
  items,
  setItems,
  errors,
}: {
  items: DocItem[];
  setItems: Dispatch<SetStateAction<DocItem[]>>;
  errors: Errors;
}) {
  const upload = useUpload();
  const update = (key: string, patch: Partial<DocItem>) =>
    setItems((list) => list.map((it) => (it.key === key ? { ...it, ...patch } : it)));

  // Uploads a PDF for one row, showing progress as it goes.
  function attach(key: string, file: File) {
    update(key, { progress: 0, error: undefined, fileName: file.name });
    upload(file, "pdf", (progress) => update(key, { progress }))
      .then((token) => update(key, { file: { upload: token }, progress: null }))
      .catch((e) => update(key, { error: errorText(e), progress: null, file: null }));
  }

  // Adds a row per PDF, with the name filled in from the file name.
  function addFiles(files: File[]) {
    for (const file of files) {
      const key = newKey();
      setItems((list) => [...list, { key, title: titleFromFile(file.name), type: "Data Sheet", updated: "", file: null, fileName: file.name }]);
      attach(key, file);
    }
  }

  return (
    <div>
      {items.length > 0 && (
        <ol className="space-y-3">
          {items.map((it, i) => {
            // An upload failure, or a problem the server found on Save.
            const fileError = it.error ?? errors[`documents.${i}.file`];
            return (
              <li
                key={it.key}
                data-error={Object.keys(errors).some((k) => k.startsWith(`documents.${i}.`)) ? "true" : undefined}
                className="border border-ink/15 bg-white p-3 md:p-4"
              >
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 grid gap-3 md:grid-cols-2">
                    <div className="md:col-span-2">
                      <label htmlFor={`doc-title-${it.key}`} className="block text-[15px] font-medium">
                        Document name
                      </label>
                      <input
                        id={`doc-title-${it.key}`}
                        value={it.title}
                        onChange={(e) => update(it.key, { title: e.target.value })}
                        placeholder="e.g. Foundation Plus Data Sheet"
                        aria-invalid={errors[`documents.${i}.title`] ? true : undefined}
                        className="admin-input mt-1"
                      />
                      {errors[`documents.${i}.title`] && <FieldError>{errors[`documents.${i}.title`]}</FieldError>}
                    </div>
                    <div>
                      <label htmlFor={`doc-type-${it.key}`} className="block text-[15px] font-medium">
                        Kind of document
                      </label>
                      <select
                        id={`doc-type-${it.key}`}
                        value={it.type}
                        onChange={(e) => update(it.key, { type: e.target.value })}
                        className="admin-input mt-1"
                      >
                        {[...new Set([...DOCUMENT_TYPES, it.type])].map((t) => (
                          <option key={t} value={t}>
                            {t === "PDF" ? "Other" : t}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label htmlFor={`doc-date-${it.key}`} className="block text-[15px] font-medium">
                        Date <span className="font-normal text-soft">(optional, e.g. May 2025)</span>
                      </label>
                      <input
                        id={`doc-date-${it.key}`}
                        value={it.updated}
                        onChange={(e) => update(it.key, { updated: e.target.value })}
                        className="admin-input mt-1"
                      />
                    </div>
                    <div className="md:col-span-2 flex flex-wrap items-center gap-3">
                      {it.progress != null ? (
                        <span className="inline-flex items-center gap-2 min-h-11">
                          <LoaderCircle aria-hidden className="size-5 animate-spin" /> Uploading {it.fileName}…{" "}
                          {Math.round(it.progress * 100)}%
                        </span>
                      ) : it.file ? (
                        <>
                          <span className="inline-flex items-center gap-2 min-h-11">
                            <FileText aria-hidden className="size-5 text-olive-ink" />
                            {"path" in it.file ? (
                              <a href={it.file.path} target="_blank" rel="noopener" className="link">
                                Open the PDF
                              </a>
                            ) : (
                              <span>{it.fileName} (ready)</span>
                            )}
                          </span>
                          <DropZone accept="application/pdf" onFiles={([f]) => attach(it.key, f)} className="!w-auto !p-0 !border-solid border min-h-11">
                            <span className="px-4">Replace PDF</span>
                          </DropZone>
                        </>
                      ) : (
                        <DropZone accept="application/pdf" onFiles={([f]) => attach(it.key, f)} className="!w-auto !p-0 border min-h-11" invalid={!!fileError}>
                          <span className="inline-flex items-center gap-2 px-4">
                            <FilePlus aria-hidden className="size-5" /> Choose the PDF
                          </span>
                        </DropZone>
                      )}
                    </div>
                    {fileError && <FieldError>{fileError}</FieldError>}
                  </div>
                  <div className="flex sm:flex-col gap-2">
                    <button
                      type="button"
                      onClick={() => setItems((l) => move(l, i, i - 1))}
                      disabled={i === 0}
                      aria-label={`Move document ${i + 1} up`}
                      className="grid place-items-center size-11 border border-ink/20 hover:border-ink disabled:opacity-30"
                    >
                      <ArrowUp aria-hidden className="size-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setItems((l) => move(l, i, i + 1))}
                      disabled={i === items.length - 1}
                      aria-label={`Move document ${i + 1} down`}
                      className="grid place-items-center size-11 border border-ink/20 hover:border-ink disabled:opacity-30"
                    >
                      <ArrowDown aria-hidden className="size-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setItems((l) => l.filter((x) => x.key !== it.key))}
                      aria-label={`Remove document ${i + 1}`}
                      className="grid place-items-center size-11 border border-ink/20 hover:border-red-800 hover:text-red-800"
                    >
                      <Trash2 aria-hidden className="size-5" />
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      )}
      <DropZone accept="application/pdf" multiple onFiles={addFiles} className="mt-4 min-h-28">
        <span>
          <FilePlus aria-hidden className="size-8 mx-auto text-soft" />
          <span className="mt-2 block font-medium">Add documents</span>
          <span className="mt-1 block text-[15px] text-soft">Drag PDFs here, or tap to choose. You can pick several at once.</span>
        </span>
      </DropZone>
    </div>
  );
}
