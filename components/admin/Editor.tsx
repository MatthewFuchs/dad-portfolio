import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Check } from "lucide-react";
import { adminPage } from "../../lib/admin-page";
import { getEntry, listEntries, toDraft } from "../../lib/admin-content";
import { NOUNS, type CollectionName } from "../../lib/admin-types";
import ManufacturerForm from "./ManufacturerForm";
import PresentationForm from "./PresentationForm";
import ProjectForm from "./ProjectForm";
import SetupNotice from "./SetupNotice";

const unique = (words: string[]) => Array.from(new Set(words.filter(Boolean))).sort((a, b) => a.localeCompare(b));

// The add/edit page for any collection (server side): loads the entry and
// the lists the form offers (manufacturers, sectors, categories, topics).
export default async function Editor({
  collection,
  id,
  saved,
}: {
  collection: CollectionName;
  id: string | null;
  saved?: string;
}) {
  const { store } = await adminPage();
  if (!store) return <SetupNotice />;
  const noun = NOUNS[collection];

  const entry = id ? await getEntry(store, collection, id) : undefined;
  if (id && !entry) notFound();
  const manufacturers = (await listEntries(store, "manufacturers")).sort((a, b) => a.entry.name.localeCompare(b.entry.name));

  let form: React.ReactNode;
  let title: string;
  if (collection === "projects") {
    const projects = await listEntries(store, "projects");
    const draft = toDraft("projects", entry as never);
    title = draft.name;
    form = (
      <ProjectForm
        id={id}
        initial={draft}
        manufacturers={manufacturers.map((m) => ({ id: m.id, name: m.entry.name, logo: m.entry.logo, logoBackground: m.entry.logoBackground }))}
        sectorSuggestions={unique(projects.flatMap((p) => p.entry.sectors ?? []))}
        webAddress={id ? `/projects/${id}` : undefined}
      />
    );
  } else if (collection === "manufacturers") {
    const draft = toDraft("manufacturers", entry as never);
    title = draft.name;
    const projects = id ? (await listEntries(store, "projects")).filter((p) => p.entry.manufacturers?.includes(id)) : [];
    form = (
      <ManufacturerForm
        id={id}
        initial={draft}
        categoryOptions={unique(manufacturers.flatMap((m) => m.entry.categories ?? []))}
        usedBy={projects.length ? `${projects.length} project${projects.length === 1 ? "" : "s"}` : undefined}
      />
    );
  } else {
    const presentations = await listEntries(store, "presentations");
    const draft = toDraft("presentations", entry as never);
    title = draft.title;
    form = (
      <PresentationForm
        id={id}
        initial={draft}
        manufacturers={manufacturers.map((m) => ({ id: m.id, name: m.entry.name }))}
        topicSuggestions={unique(presentations.flatMap((p) => p.entry.topics ?? []))}
      />
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 md:px-8 py-8 md:py-12">
      <Link href={`/admin/${collection}`} className="inline-flex items-center gap-2 min-h-11 text-soft hover:text-ink">
        <ArrowLeft aria-hidden className="size-5" /> All {noun.many}
      </Link>
      <h1 className="mt-4 text-[2rem] md:text-[2.75rem]">{id ? title : `Add a ${noun.one}`}</h1>
      {saved && (
        <p role="status" className="mt-6 bg-olive/30 px-4 py-3 flex items-start gap-2">
          <Check aria-hidden className="size-5 mt-0.5 shrink-0" />
          <span>
            {saved === "new" ? `The ${noun.one} was added. ` : "Your changes are saved. "}
            {store.kind === "github"
              ? "The website will show them in about 2 minutes."
              : "(Test mode: saved on this computer only.)"}
          </span>
        </p>
      )}
      <div className="mt-8">{form}</div>
    </div>
  );
}
