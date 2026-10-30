import { jsonLdHtml } from "../lib/json-ld";

export { jsonLdHtml };

// Adds structured data for search engines to a page. Visitors never see it.
export default function JsonLd({ data }: { data: Record<string, any> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: jsonLdHtml(data) }}
    />
  );
}
