export const dynamic = "force-static";

export const metadata = {
  title: "Privacy Policy | Fuchs Sales and Consulting",
  description:
    "Privacy Policy for Fuchs Sales and Consulting.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-white text-gray-900 pt-32 px-6 md:px-16 pb-10">
      <h1 className="text-4xl font-bold mb-6">Privacy Policy</h1>
      <iframe
        title="Privacy Policy"
        src="/legal/privacy.html"
        loading="lazy"
        className="w-full h-[70vh] md:h-[calc(100vh-14rem)] border border-gray-200 rounded-xl shadow-sm"
      />
      <p className="mt-4 text-sm text-gray-600">
        If the document doesn’t load,{" "}
        <a href="/legal/privacy.html" target="_blank" rel="noopener noreferrer" className="underline">
          open it in a new tab
        </a>.
      </p>
    </main>
  );
}