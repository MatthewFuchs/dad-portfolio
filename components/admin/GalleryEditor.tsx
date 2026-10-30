"use client";

import { useState, type Dispatch, type SetStateAction } from "react";
import { ArrowDown, ArrowUp, Check, GripVertical, ImagePlus, LoaderCircle, Trash2 } from "lucide-react";
import type { FileRef } from "../../lib/admin-types";
import { FieldError, type Errors } from "./fields";
import { DropZone, errorText, IMAGE_ACCEPT, useUpload } from "./ImagePicker";
import Thumb from "./Thumb";

export type GalleryItem = {
  key: string;
  ref: FileRef | null;
  preview: string;
  caption: string;
  stage: string;
  progress?: number | null;
  error?: string;
};

// A random label that follows a photo as it moves around the list.
export const newKey = () => Math.random().toString(36).slice(2);

// Returns a copy of the list with one item moved.
function move<T>(list: T[], from: number, to: number) {
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

/** The project's other photos: add several at once, reorder, caption them
 *  and (optionally) name each step of the build. */
export default function GalleryEditor({
  items,
  setItems,
  errors,
}: {
  items: GalleryItem[];
  setItems: Dispatch<SetStateAction<GalleryItem[]>>;
  errors: Errors;
}) {
  const upload = useUpload();
  const [dragKey, setDragKey] = useState<string | null>(null);
  // dragKey: the photo being dragged. handleKey: the photo whose grip is held. A row
  // can only be dragged by its grip, so selecting caption text doesn't start a drag.
  const [handleKey, setHandleKey] = useState<string | null>(null);
  const update = (key: string, patch: Partial<GalleryItem>) =>
    setItems((list) => list.map((it) => (it.key === key ? { ...it, ...patch } : it)));

  // Each photo appears straight away with a local preview, then uploads in the background.
  function add(files: File[]) {
    for (const file of files) {
      const key = newKey();
      const preview = URL.createObjectURL(file);
      setItems((list) => [...list, { key, ref: null, preview, caption: "", stage: "", progress: 0 }]);
      upload(file, "photo", (progress) => update(key, { progress }))
        .then((token) => update(key, { ref: { upload: token }, progress: null }))
        .catch((e) => update(key, { error: errorText(e), progress: null }));
    }
  }

  // The project page uses the step-by-step view when there are at least 4 photos
  // and all have a step name. This must match app/projects/[slug]/page.tsx.
  const staged = items.filter((it) => it.stage.trim()).length;
  const isSequence = items.length >= 4 && staged === items.length;

  return (
    <div>
      {items.length > 0 && (
        <ol className="space-y-3">
          {items.map((it, i) => (
            <li
              key={it.key}
              draggable={handleKey === it.key}
              onDragStart={() => setDragKey(it.key)}
              onDragEnd={() => {
                setDragKey(null);
                setHandleKey(null);
              }}
              onDragOver={(e) => {
                if (!dragKey || dragKey === it.key) return;
                e.preventDefault();
                const from = items.findIndex((x) => x.key === dragKey);
                if (from !== -1) setItems((list) => move(list, from, i));
              }}
              data-error={errors[`gallery.${i}`] ? "true" : undefined}
              className={`border p-3 md:p-4 bg-white ${dragKey === it.key ? "opacity-50" : ""} ${
                errors[`gallery.${i}`] || it.error ? "border-red-700" : "border-ink/15"
              }`}
            >
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex gap-2 items-start">
                  <button
                    type="button"
                    aria-hidden
                    tabIndex={-1}
                    onPointerDown={() => setHandleKey(it.key)}
                    onPointerUp={() => setHandleKey(null)}
                    className="hidden sm:grid place-items-center w-8 h-24 cursor-grab text-soft hover:text-ink"
                    title="Drag to move"
                  >
                    <GripVertical className="size-5" />
                  </button>
                  <div className="relative w-full sm:w-40 aspect-[4/3] bg-surface overflow-hidden shrink-0">
                    <Thumb key={it.preview} src={it.preview} className="absolute inset-0 size-full object-cover" />
                    {it.progress != null && (
                      <div className="absolute inset-0 grid place-items-center bg-white/70 text-[15px] font-medium">
                        <span className="inline-flex items-center gap-1">
                          <LoaderCircle aria-hidden className="size-4 animate-spin" /> {Math.round(it.progress * 100)}%
                        </span>
                      </div>
                    )}
                    <span className="absolute left-0 top-0 bg-ink text-white text-[14px] px-2 py-0.5">{i + 1}</span>
                  </div>
                </div>
                <div className="flex-1 grid gap-3">
                  <div>
                    <label htmlFor={`caption-${it.key}`} className="block text-[15px] font-medium">
                      Caption <span className="font-normal text-soft">(optional)</span>
                    </label>
                    <input
                      id={`caption-${it.key}`}
                      value={it.caption}
                      onChange={(e) => update(it.key, { caption: e.target.value })}
                      placeholder="What the photo shows"
                      className="admin-input mt-1"
                    />
                  </div>
                  <div>
                    <label htmlFor={`stage-${it.key}`} className="block text-[15px] font-medium">
                      Step name <span className="font-normal text-soft">(optional, e.g. Excavation)</span>
                    </label>
                    <input
                      id={`stage-${it.key}`}
                      value={it.stage}
                      onChange={(e) => update(it.key, { stage: e.target.value })}
                      className="admin-input mt-1"
                    />
                  </div>
                </div>
                <div className="flex sm:flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => setItems((l) => move(l, i, i - 1))}
                    disabled={i === 0}
                    aria-label={`Move photo ${i + 1} up`}
                    className="grid place-items-center size-11 border border-ink/20 hover:border-ink disabled:opacity-30"
                  >
                    <ArrowUp aria-hidden className="size-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setItems((l) => move(l, i, i + 1))}
                    disabled={i === items.length - 1}
                    aria-label={`Move photo ${i + 1} down`}
                    className="grid place-items-center size-11 border border-ink/20 hover:border-ink disabled:opacity-30"
                  >
                    <ArrowDown aria-hidden className="size-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setItems((l) => l.filter((x) => x.key !== it.key))}
                    aria-label={`Remove photo ${i + 1}`}
                    className="grid place-items-center size-11 border border-ink/20 hover:border-red-800 hover:text-red-800"
                  >
                    <Trash2 aria-hidden className="size-5" />
                  </button>
                </div>
              </div>
              {(it.error || errors[`gallery.${i}`]) && (
                <FieldError>{it.error ?? errors[`gallery.${i}`]}</FieldError>
              )}
              {errors[`gallery.${i}.caption`] && <FieldError>{errors[`gallery.${i}.caption`]}</FieldError>}
              {errors[`gallery.${i}.stage`] && <FieldError>{errors[`gallery.${i}.stage`]}</FieldError>}
            </li>
          ))}
        </ol>
      )}

      {items.length > 0 && staged > 0 && (
        <p className={`mt-4 px-4 py-3 ${isSequence ? "bg-olive/30" : "bg-surface"}`} role="status">
          {isSequence ? (
            <span className="inline-flex items-center gap-2">
              <Check aria-hidden className="size-5" /> The project page will show these photos as a step-by-step build.
            </span>
          ) : (
            <>
              To show a step-by-step build, add at least 4 photos and give every photo a step name. Right now {staged} of{" "}
              {items.length} {items.length === 1 ? "photo has" : "photos have"} a step name.
            </>
          )}
        </p>
      )}

      <DropZone accept={IMAGE_ACCEPT} multiple onFiles={add} className="mt-4 min-h-32">
        <span>
          <ImagePlus aria-hidden className="size-8 mx-auto text-soft" />
          <span className="mt-2 block font-medium">Add photos</span>
          <span className="mt-1 block text-[15px] text-soft">Drag them here, or tap to choose. You can pick several at once.</span>
        </span>
      </DropZone>
    </div>
  );
}
