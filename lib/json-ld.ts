/** JSON for a <script> tag. "<" is escaped so text from the admin (a project
 *  description containing "</script>", say) can't close the tag early and
 *  run as code on the page. */
export function jsonLdHtml(data: unknown) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
