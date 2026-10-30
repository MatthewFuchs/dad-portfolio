// The sign-in page. The form itself is components/admin/LoginForm.tsx.
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { adminConfigured, currentAdmin } from "../../../lib/auth";
import LoginForm from "../../../components/admin/LoginForm";

export const metadata: Metadata = { title: "Sign in" };

// Only same-site admin pages are allowed as the place to go after signing in.
function safeNext(next: string | undefined) {
  return next && /^\/admin(\/[\w\-/]*)?(\?[\w=&%-]*)?$/.test(next) ? next : "/admin";
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; signedout?: string }>;
}) {
  if (!adminConfigured()) notFound();
  const { next, signedout } = await searchParams;
  // Already signed in: skip this page.
  if (await currentAdmin()) redirect(safeNext(next));

  return (
    <div className="px-4 py-12 md:py-20">
      <div className="mx-auto max-w-md bg-white border border-ink/10 p-6 md:p-10">
        <h1 className="text-[2rem] md:text-[2.5rem]">Sign in</h1>
        <p className="mt-3 text-soft">
          Sign in to add and update projects, manufacturers and presentations on the website.
        </p>
        {signedout && (
          <p role="status" className="mt-6 bg-surface px-4 py-3">
            You&rsquo;re signed out.
          </p>
        )}
        <LoginForm next={safeNext(next)} />
      </div>
    </div>
  );
}
