import { Download, FileText } from "lucide-react";

// Uploaded files can have generic names (e.g. ".../0/file.pdf"); save them
// under the document's title instead.
function downloadName(title: string, href: string) {
  const ext = href.match(/\.[a-z0-9]+$/i)?.[0] ?? ".pdf";
  return title.replace(/[\\/:*?"<>|]+/g, "").trim() + ext;
}

// One document: its name and details, with View and Download links. Used on the
// Resources page and on each manufacturer's page.
export default function ResourceRow({
  title,
  href,
  type = "PDF",
  size,
  updated,
  tags = [],
}: {
  title: string;
  href: string;
  type?: string;
  size?: string;
  updated?: string;
  tags?: string[];
}) {
  const meta = [type, ...tags, size, updated && `Updated ${updated}`]
    .filter(Boolean)
    .join(" · ");
  return (
    <li className="grid gap-3 py-4 sm:grid-cols-[1fr_auto] sm:items-center sm:gap-6">
      <div className="min-w-0 flex gap-3">
        <FileText className="mt-1 h-4 w-4 shrink-0 text-soft" aria-hidden />
        <div className="min-w-0">
          <p className="font-medium leading-snug">{title}</p>
          <p className="mt-1 text-[length:var(--text-small)] text-soft">{meta}</p>
        </div>
      </div>
      <div className="flex gap-6 pl-7 sm:pl-0 text-[length:var(--text-small)]">
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="link inline-flex min-h-11 items-center font-medium"
        >
          View
        </a>
        <a
          href={href}
          download={downloadName(title, href)}
          className="link inline-flex min-h-11 items-center gap-1.5 font-medium"
        >
          <Download className="h-3.5 w-3.5" aria-hidden />
          Download
        </a>
      </div>
    </li>
  );
}
