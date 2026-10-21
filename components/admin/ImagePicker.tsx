"use client";

import { useRef, useState } from "react";
import { ImagePlus, LoaderCircle, RefreshCw, Trash2 } from "lucide-react";
import type { FileRef, UploadKind } from "../../lib/admin-types";
import { useTrackUpload } from "./EditorFrame";
import { prepareImage, uploadFile, UploadError } from "./upload";
import Thumb from "./Thumb";

export type ImageValue = { ref: FileRef; preview: string } | null;

/** Prepares and uploads one file, reporting progress; resolves to its token. */
export function useUpload() {
  const track = useTrackUpload();
  return (file: File, kind: UploadKind, onProgress: (f: number) => void) => {
    const job = (async () => {
      const blob = kind === "pdf" ? file : await prepareImage(file, kind);
      return uploadFile(blob, kind, onProgress);
    })();
    track(job);
    return job;
  };
}

export const errorText = (e: unknown) =>
  e instanceof UploadError ? e.message : "The file didn't upload. Please try again.";

/** Drag-and-drop area that also opens the file chooser when tapped. */
export function DropZone({
  accept,
  multiple,
  onFiles,
  children,
  className = "",
  invalid,
  describedBy,
}: {
  accept: string;
  multiple?: boolean;
  onFiles: (files: File[]) => void;
  children: React.ReactNode;
  className?: string;
  invalid?: boolean;
  describedBy?: string;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => input.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setOver(false);
          const files = Array.from(e.dataTransfer.files);
          if (files.length) onFiles(multiple ? files : files.slice(0, 1));
        }}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        className={`w-full border-2 border-dashed grid place-items-center text-center p-6 transition-colors ${
          over ? "border-olive-ink bg-olive/20" : invalid ? "border-red-700 bg-red-50" : "border-ink/25 hover:border-ink/60 hover:bg-surface"
        } ${className}`}
      >
        {children}
      </button>
      <input
        ref={input}
        type="file"
        accept={accept}
        multiple={multiple}
        hidden
        onChange={(e) => {
          const files = Array.from(e.target.files ?? []);
          e.target.value = "";
          if (files.length) onFiles(files);
        }}
      />
    </>
  );
}

export const IMAGE_ACCEPT = "image/jpeg,image/png,image/webp,image/heic,image/heif";

export default function ImagePicker({
  id,
  value,
  onChange,
  kind,
  error,
  background = "white",
  fit = "cover",
  aspect = "aspect-[4/3]",
  describedBy,
}: {
  id: string;
  value: ImageValue;
  onChange: (v: ImageValue) => void;
  kind: "photo" | "logo";
  error?: string;
  background?: "white" | "dark";
  fit?: "cover" | "contain";
  aspect?: string;
  describedBy?: string;
}) {
  const upload = useUpload();
  const [progress, setProgress] = useState<number | null>(null);
  const [uploadError, setUploadError] = useState("");
  const [localPreview, setLocalPreview] = useState<string | null>(null);

  async function pick([file]: File[]) {
    setUploadError("");
    const preview = URL.createObjectURL(file);
    setLocalPreview(preview);
    setProgress(0);
    try {
      const token = await upload(file, kind, setProgress);
      onChange({ ref: { upload: token }, preview });
    } catch (e) {
      setUploadError(errorText(e));
    }
    setLocalPreview(null);
    setProgress(null);
  }

  const shown = localPreview ?? value?.preview;
  const what = kind === "logo" ? "logo" : "photo";
  return (
    <div id={id} tabIndex={-1}>
      {shown ? (
        <div className="max-w-xl">
          <div
            className={`relative ${aspect} overflow-hidden border border-ink/10 ${
              background === "dark" ? "bg-neutral-900" : kind === "logo" ? "bg-white" : "bg-surface"
            }`}
          >
            <Thumb
              key={shown}
              src={shown}
              className={`absolute inset-0 size-full ${fit === "contain" || kind === "logo" ? "object-contain p-4" : "object-cover"}`}
            />
            {progress !== null && (
              <div className="absolute inset-0 grid place-items-center bg-white/70">
                <span className="inline-flex items-center gap-2 bg-white px-4 py-2 font-medium">
                  <LoaderCircle aria-hidden className="size-5 animate-spin" />
                  Uploading… {Math.round(progress * 100)}%
                </span>
              </div>
            )}
          </div>
          {progress === null && (
            <div className="mt-3 flex flex-wrap gap-2">
              <DropZone accept={IMAGE_ACCEPT} onFiles={pick} className="!w-auto !p-0 !border-solid border min-h-11 px-4">
                <span className="inline-flex items-center gap-2 px-4">
                  <RefreshCw aria-hidden className="size-4" /> Choose a different {what}
                </span>
              </DropZone>
              <button
                type="button"
                onClick={() => onChange(null)}
                className="inline-flex items-center gap-2 min-h-11 px-4 border border-ink/20 hover:border-red-800 hover:text-red-800"
              >
                <Trash2 aria-hidden className="size-4" /> Remove
              </button>
            </div>
          )}
        </div>
      ) : (
        <DropZone accept={IMAGE_ACCEPT} onFiles={pick} className={`max-w-xl ${aspect}`} invalid={!!error} describedBy={describedBy}>
          <span>
            <ImagePlus aria-hidden className="size-8 mx-auto text-soft" />
            <span className="mt-3 block font-medium">Add a {what}</span>
            <span className="mt-1 block text-[15px] text-soft">Drag it here, or tap to choose from your computer or phone</span>
          </span>
        </DropZone>
      )}
      {uploadError && (
        <p role="alert" className="mt-2 text-[15px] font-medium text-red-800">
          {uploadError}
        </p>
      )}
    </div>
  );
}
