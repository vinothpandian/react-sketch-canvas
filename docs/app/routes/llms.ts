import { llms } from "fumadocs-core/source";
import { withDocsBasePathInMarkdown } from "~/lib/site-paths";
import { source } from "~/lib/source";

export function loader() {
	return new Response(withDocsBasePathInMarkdown(llms(source).index()), {
		headers: {
			"Content-Type": "text/plain; charset=utf-8",
		},
	});
}
