import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Check, Pencil, Plus } from "lucide-react";
import { adminPage, collectionParam } from "../../../lib/admin-page";
import { listEntries } from "../../../lib/admin-content";
import type { ManufacturerFile, PresentationFile, ProjectFile } from "../../../lib/content";
import { NOUNS, thumb, type CollectionName } from "../../../lib/admin-types";
import SetupNotice from "../../../components/admin/SetupNotice";
import Thumb from "../../../components/admin/Thumb";

type Params = { params: Promise<{ collection: string }>; searchParams: Promise<{ removed?: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const c = collectionParam((await params).collection);
  return { title: NOUNS[c].many[0].toUpperCase() + NOUNS[c].many.slice(1) };
}

type Row = { id: string; name: string; detail: string; image?: string; dark?: boolean; contain?: boolean };

function rows(collection: CollectionName, entries: { id: string; entry: unknown }[]): Row[] {
  switch (collection) {
    case "projects":
      return (entries as { id: string; entry: ProjectFile }[])
        .map(({ id, entry: e }) => ({ id, name: e.name, detail: [e.location, e.year].filter(Boolean).join(" · "), image: e.hero, year: Number(e.year || 0) }))
        .sort((a, b) => b.year - a.year || a.name.localeCompare(b.name));
    case "manufacturers":
      return (entries as { id: string; entry: ManufacturerFile }[])
        .sort((a, b) => (a.entry.order ?? 100) - (b.entry.order ?? 100) || a.entry.name.localeCompare(b.entry.name))
        .map(({ id, entry: e }) => ({
          id,
          name: e.name,
          detail: `${e.resources?.length ?? 0} document${e.resources?.length === 1 ? "" : "s"}`,
          image: e.logo,
          dark: e.logoBackground === "dark",
          contain: true,
        }));
    case "presentations":
      return (entries as { id: string; entry: PresentationFile }[])
        .sort((a, b) => (a.entry.order ?? 100) - (b.entry.order ?? 100))
        .map(({ id, entry: e }) => ({ id, name: e.title, detail: e.subtitle ?? "", image: e.banner, contain: e.bannerFit === "contain" }));
  }
}

export default async function ListPage({ params, searchParams }: Params) {
  const collection = collectionParam((await params).collection);
  const { removed } = await searchParams;
  const { store } = await adminPage();
  if (!store) return <SetupNotice />;
  const noun = NOUNS[collection];
  const list = rows(collection, await listEntries(store, collection));

  return (
    <div className="mx-auto max-w-5xl px-4 md:px-8 py-8 md:py-12">
      <Link href="/admin" className="inline-flex items-center gap-2 min-h-11 text-soft hover:text-ink">
        <ArrowLeft aria-hidden className="size-5" /> Back to start
      </Link>
      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <h1 className="text-[2.25rem] md:text-[3rem] capitalize">{noun.many}</h1>
        <Link href={`/admin/${collection}/new`} className="btn">
          <Plus aria-hidden className="size-5" /> Add a {noun.one}
        </Link>
      </div>
      {removed && (
        <p role="status" className="mt-6 bg-olive/30 px-4 py-3 inline-flex items-center gap-2">
          <Check aria-hidden className="size-5" />
          &ldquo;{removed}&rdquo; was removed{store.kind === "github" ? ". The website updates in about 2 minutes." : "."}
        </p>
      )}
      <p className="mt-4 text-soft">Tap one to change it{collection === "projects" ? "" : ". They're listed in the order they appear on the website"}.</p>

      <ul className="mt-6 grid gap-3">
        {list.map((r) => (
          <li key={r.id}>
            <Link
              href={`/admin/${collection}/${r.id}`}
              className="group flex items-center gap-4 bg-white border border-ink/10 p-3 pr-4 hover:border-ink/40"
            >
              <span className={`relative w-24 sm:w-32 aspect-[4/3] shrink-0 overflow-hidden ${r.dark ? "bg-neutral-900" : r.contain ? "bg-white border border-ink/5" : "bg-surface"}`}>
                {r.image && (
                  <Thumb src={thumb(r.image, 200)} className={`absolute inset-0 size-full ${r.contain ? "object-contain p-2" : "object-cover"}`} />
                )}
              </span>
              <span className="flex-1 min-w-0">
                <span className="block font-medium text-[1.125rem] leading-snug">{r.name}</span>
                {r.detail && <span className="block text-[15px] text-soft truncate">{r.detail}</span>}
              </span>
              <span className="hidden sm:inline-flex items-center gap-2 min-h-11 px-4 border border-ink/20 group-hover:border-ink">
                <Pencil aria-hidden className="size-4" /> Change
              </span>
            </Link>
          </li>
        ))}
      </ul>
      {list.length === 0 && <p className="mt-6 bg-white border border-ink/10 p-6">No {noun.many} yet.</p>}
    </div>
  );
}
