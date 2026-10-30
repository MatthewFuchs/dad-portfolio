// The admin's start page (/admin): one tile each for projects, manufacturers and
// presentations, with how many are on the website.
import Link from "next/link";
import { ArrowRight, Building2, FolderOpen, Plus, Presentation } from "lucide-react";
import { adminPage } from "../../lib/admin-page";
import { listEntries } from "../../lib/admin-content";
import { COLLECTIONS, NOUNS, type CollectionName } from "../../lib/admin-types";
import SetupNotice from "../../components/admin/SetupNotice";

// The icon and explanation on each tile.
const TILES: Record<CollectionName, { icon: typeof FolderOpen; text: string }> = {
  projects: { icon: FolderOpen, text: "Jobs on the Projects page, with photos and the products used." },
  manufacturers: { icon: Building2, text: "The companies you represent, their logos and their documents (PDFs)." },
  presentations: { icon: Presentation, text: "Lunch-and-learn presentations people can request." },
};

export default async function Dashboard() {
  // Sends anyone not signed in to the sign-in page.
  const { session, store } = await adminPage();
  if (!store) return <SetupNotice />;
  const counts = await Promise.all(COLLECTIONS.map((c) => listEntries(store, c).then((l) => l.length)));
  const first = session.name.split(" ")[0];

  return (
    <div className="mx-auto max-w-5xl px-4 md:px-8 py-10 md:py-14">
      <h1 className="text-[2.25rem] md:text-[3rem]">Hi {first}.</h1>
      <p className="mt-3 text-[1.25rem] text-soft">What would you like to update on the website?</p>

      <ul className="mt-10 grid gap-4 md:grid-cols-3">
        {COLLECTIONS.map((c, i) => {
          const { icon: Icon, text } = TILES[c];
          const noun = NOUNS[c];
          return (
            <li key={c} className="bg-white border border-ink/10 p-6 flex flex-col">
              <Icon aria-hidden className="size-8 text-olive-ink" />
              <h2 className="mt-4 text-[1.75rem] capitalize">{noun.many}</h2>
              <p className="mt-1 text-soft">
                {counts[i]} on the website
              </p>
              <p className="mt-3 text-[15px] text-soft flex-1">{text}</p>
              <div className="mt-6 grid gap-2">
                <Link href={`/admin/${c}/new`} className="btn">
                  <Plus aria-hidden className="size-5" /> Add a {noun.one}
                </Link>
                <Link href={`/admin/${c}`} className="btn btn-ghost">
                  Change or remove <ArrowRight aria-hidden className="size-5" />
                </Link>
              </div>
            </li>
          );
        })}
      </ul>

      <div className="mt-10 bg-surface p-5 md:p-6 max-w-3xl">
        <h2 className="text-[1.25rem]">Good to know</h2>
        <ul className="mt-3 space-y-2 list-disc pl-5 text-soft">
          {store.kind === "github" ? (
            <li>When you save, the website updates by itself in about 2 minutes.</li>
          ) : (
            <li>Test mode: changes are saved on this computer only, not on the live website.</li>
          )}
          <li>Nothing changes on the website until you press the Save button at the bottom of the screen.</li>
          <li>Every change is kept, so a mistake can always be undone. Just ask Matt.</li>
        </ul>
      </div>
    </div>
  );
}
