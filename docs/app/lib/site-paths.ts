export const docsBasePath = import.meta.env.PROD ? "/react-sketch-canvas" : "";

export function withDocsBasePath(path: string) {
	if (!path.startsWith("/")) {
		return path;
	}

	if (docsBasePath === "") {
		return path;
	}

	if (path === docsBasePath || path.startsWith(`${docsBasePath}/`)) {
		return path;
	}

	return `${docsBasePath}${path}`;
}

export function withDocsBasePathInMarkdown(markdown: string) {
	return markdown.replace(/\]\((\/[^)\s]*)\)/g, (_, path: string) => {
		return `](${withDocsBasePath(path)})`;
	});
}
