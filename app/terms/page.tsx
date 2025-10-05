export const dynamic = "force-static";

export const metadata = {
  title: "Terms of Use | Fuchs Sales and Consulting",
  description:
    "Terms of Use for Fuchs Sales and Consulting.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-white text-gray-900 pt-32 px-6 md:px-16 pb-10">
      <h1 className="text-4xl font-bold mb-6">Terms of Use</h1>
      <iframe
        title="Terms of Use"
        src="/legal/terms.html"
        loading="lazy"
        className="w-full h-[70vh] md:h-[calc(100vh-14rem)] border border-gray-200 rounded-xl shadow-sm"
      />
      <p className="mt-4 text-sm text-gray-600">
        If the document doesn’t load,{" "}
        <a href="/legal/terms.html" target="_blank" rel="noopener noreferrer" className="underline">
          open it in a new tab
        </a>.
      </p>
    </main>
  );
}