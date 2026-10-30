import { notFound, redirect } from "next/navigation";
import { adminConfigured, currentAdmin } from "./auth";
import { getStore } from "./admin-store";
import { COLLECTIONS, type CollectionName } from "./admin-types";

// The start of every admin page: 404 when the admin isn't set up, the
// sign-in page when nobody is signed in.
export async function adminPage() {
  if (!adminConfigured()) notFound();
  const session = await currentAdmin();
  if (!session) redirect("/admin/login");
  return { session, store: getStore() };
}

// Checks the section in the web address is a real one, otherwise shows "not found".
export function collectionParam(value: string): CollectionName {
  if (!COLLECTIONS.includes(value as CollectionName)) notFound();
  return value as CollectionName;
}
