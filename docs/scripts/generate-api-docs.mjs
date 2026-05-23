import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, readdirSync, rmSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const scriptsRoot = dirname(fileURLToPath(import.meta.url));
const docsRoot = dirname(scriptsRoot);
const outputRoot = join(docsRoot, "src/content/docs/api");
const typedocOutput = mkdtempSync(join(tmpdir(), "react-sketch-canvas-api-"));

const apiSections = [
	{
		sourceDir: "interfaces",
		targetDir: "interfaces",
		title: "Interfaces",
	},
	{
		sourceDir: "types",
		targetDir: "type-aliases",
		title: "Type Aliases",
	},
	{
		sourceDir: "variables",
		targetDir: "variables",
		title: "Variables",
	},
];

const sectionByTargetDir = new Map(
	apiSections.map((section) => [section.targetDir, section]),
);
const symbolUrls = new Map();

function slugify(value) {
	return value.toLowerCase();
}

function titleFromSlug(value) {
	return value
		.split("-")
		.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
		.join(" ");
}

function pageTitleFromContent(content, fallback) {
	const title = content.match(/^# .+?:\s+(.+)$/m) ?? content.match(/^# (.+)$/m);
	return title?.[1]?.trim() ?? fallback;
}

function stripTypedocChrome(content) {
	return content
		.replace(/^\*\*react-sketch-canvas\*\*\n\n\*\*\*\n\n/m, "")
		.replace(/^\[\*\*react-sketch-canvas\*\*\]\([^)]+\)\n\n\*\*\*\n\n/m, "")
		.replace(/^\[react-sketch-canvas\]\([^)]+\) \/ .+\n\n/m, "")
		.replace(/^# .+\n\n/m, "")
		.trimStart();
}

function addFrontmatter(content, title) {
	return `---\neditUrl: false\nnext: false\nprev: false\ntitle: ${JSON.stringify(title)}\n---\n\n${content.trimEnd()}\n`;
}

function rewriteMarkdownLinks(content) {
	return content.replace(
		/\]\(([^)\s]+\.md)(#[^)]+)?\)/g,
		(match, href, hash = "") => {
			const withoutReadme = href.replace(/\/?README\.md$/, "");
			if (withoutReadme.length === 0 || withoutReadme === "..") {
				return `](/api/${hash})`;
			}

			const page = basename(withoutReadme, ".md");
			const url = symbolUrls.get(page);

			return url ? `](${url}${hash})` : match;
		},
	);
}

async function writeGeneratedPage(sourcePath, targetPath, fallbackTitle) {
	const raw = await readFile(sourcePath, "utf8");
	const title = pageTitleFromContent(raw, fallbackTitle);
	const content = addFrontmatter(
		rewriteMarkdownLinks(stripTypedocChrome(raw)),
		title,
	);

	await mkdir(dirname(targetPath), { recursive: true });
	await writeFile(targetPath, content);
}

async function generateMarkdown() {
	const result = spawnSync(
		"typedoc",
		[
			"--plugin",
			"typedoc-plugin-markdown",
			"--entryPoints",
			"../packages/react-sketch-canvas/src/index.tsx",
			"--tsconfig",
			"../packages/react-sketch-canvas/tsconfig.json",
			"--markdown",
			typedocOutput,
			"--router",
			"kind",
			"--readme",
			"none",
			"--hideGenerator",
			"--disableGit",
			"--sourceLinkTemplate",
			"https://github.com/vinothpandian/react-sketch-canvas/blob/main/packages/react-sketch-canvas/src/{path}#L{line}",
		],
		{
			cwd: docsRoot,
			stdio: "inherit",
		},
	);

	if (result.status !== 0) {
		process.exit(result.status ?? 1);
	}
}

function readMarkdownPages(dir) {
	if (!existsSync(dir)) {
		return [];
	}

	return readdirSync(dir, { withFileTypes: true })
		.filter((entry) => entry.isFile() && entry.name.endsWith(".md"))
		.map((entry) => entry.name.replace(/\.md$/, ""))
		.filter((page) => page !== "index")
		.sort((a, b) => a.localeCompare(b));
}

function readChildDirectories(dir) {
	if (!existsSync(dir)) {
		return [];
	}

	return readdirSync(dir, { withFileTypes: true })
		.filter((entry) => entry.isDirectory())
		.map((entry) => entry.name)
		.sort((a, b) => {
			const first = apiSections.findIndex((section) => section.targetDir === a);
			const second = apiSections.findIndex(
				(section) => section.targetDir === b,
			);
			if (first !== -1 || second !== -1) {
				return (
					(first === -1 ? Number.MAX_SAFE_INTEGER : first) -
					(second === -1 ? Number.MAX_SAFE_INTEGER : second)
				);
			}

			return a.localeCompare(b);
		});
}

function buildSymbolUrls() {
	for (const section of apiSections) {
		const sourceDir = join(typedocOutput, section.sourceDir);
		for (const page of readMarkdownPages(sourceDir)) {
			symbolUrls.set(page, `/api/${section.targetDir}/${slugify(page)}/`);
		}
	}
}

async function writeMetaFiles(dir = outputRoot) {
	const relativePath = relative(outputRoot, dir);
	const dirName = basename(dir);
	const title =
		relativePath === ""
			? "API"
			: (sectionByTargetDir.get(dirName)?.title ?? titleFromSlug(dirName));
	const pages = [...readChildDirectories(dir), ...readMarkdownPages(dir)];

	await writeFile(
		join(dir, "meta.json"),
		`${JSON.stringify({ title, pages }, null, "\t")}\n`,
	);

	for (const child of readChildDirectories(dir)) {
		await writeMetaFiles(join(dir, child));
	}
}

async function main() {
	try {
		await generateMarkdown();
		buildSymbolUrls();

		rmSync(outputRoot, { force: true, recursive: true });
		await mkdir(outputRoot, { recursive: true });
		await writeGeneratedPage(
			join(typedocOutput, "README.md"),
			join(outputRoot, "index.md"),
			"react-sketch-canvas",
		);

		for (const section of apiSections) {
			const sourceDir = join(typedocOutput, section.sourceDir);
			const targetDir = join(outputRoot, section.targetDir);

			for (const page of readMarkdownPages(sourceDir)) {
				await writeGeneratedPage(
					join(sourceDir, `${page}.md`),
					join(targetDir, `${slugify(page)}.md`),
					page,
				);
			}
		}

		await writeMetaFiles();
	} finally {
		rmSync(typedocOutput, { force: true, recursive: true });
	}
}

await main();
