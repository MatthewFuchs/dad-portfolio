import type { Metadata } from "next";
import { collectionParam } from "../../../../lib/admin-page";
import { NOUNS } from "../../../../lib/admin-types";
import Editor from "../../../../components/admin/Editor";

type Params = { params: Promise<{ collection: string; id: string }>; searchParams: Promise<{ saved?: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  return { title: `Change ${NOUNS[collectionParam((await params).collection)].one}` };
}

export default async function EditPage({ params, searchParams }: Params) {
  const { collection, id } = await params;
  const { saved } = await searchParams;
  return <Editor collection={collectionParam(collection)} id={id} saved={saved} />;
}
