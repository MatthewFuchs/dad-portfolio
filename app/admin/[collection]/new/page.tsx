// The "Add" page, e.g. /admin/projects/new. No id means a new entry; components/
// admin/Editor.tsx does the work.
import type { Metadata } from "next";
import { collectionParam } from "../../../../lib/admin-page";
import { NOUNS } from "../../../../lib/admin-types";
import Editor from "../../../../components/admin/Editor";

type Params = { params: Promise<{ collection: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  return { title: `Add a ${NOUNS[collectionParam((await params).collection)].one}` };
}

export default async function NewPage({ params }: Params) {
  return <Editor collection={collectionParam((await params).collection)} id={null} />;
}
