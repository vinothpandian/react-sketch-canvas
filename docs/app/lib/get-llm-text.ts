import { withDocsBasePath, withDocsBasePathInMarkdown } from "~/lib/site-paths";
import type { source } from "~/lib/source";

export async function getLLMText(page: (typeof source)["$inferPage"]) {
	const processed = await page.data.getText("processed");

	return `# ${page.data.title} (${withDocsBasePath(page.url)})

${withDocsBasePathInMarkdown(processed)}`;
}
