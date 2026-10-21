// Shown on the live site when sign-in works but saving isn't set up yet
// (GITHUB_TOKEN / GITHUB_REPO missing).
export default function SetupNotice() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-14">
      <h1 className="text-[2rem]">Almost ready</h1>
      <p className="mt-4 text-soft">
        You&rsquo;re signed in, but the website editor can&rsquo;t save changes yet. Ask Matt to finish the setup, then
        come back here.
      </p>
    </div>
  );
}
