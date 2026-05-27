import { mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

async function walk(dir) {
	const files = [];

	for (const entry of await readdir(dir, { withFileTypes: true })) {
		if (entry.name.startsWith(".")) {
			continue;
		}

		const path = join(dir, entry.name);

		if (entry.isDirectory()) {
			files.push(...(await walk(path)));
			continue;
		}

		if (/\.(md|mdx)$/.test(entry.name)) {
			files.push(path);
		}
	}

	return files;
}

function toPublicMarkdownPath(sourcePath, contentRoot) {
	const parsed = relative(contentRoot, sourcePath)
		.split(sep)
		.join("/")
		.replace(/\.(md|mdx)$/, "")
		.replace(/(^|\/)(index|README)$/i, "");

	if (parsed === "") {
		return "index.mdx";
	}

	return `${parsed}.mdx`;
}

function stripPageOnlySyntax(markdown) {
	return markdown
		.replace(/^---\n[\s\S]*?\n---\n?/, "")
		.replace(/^import\s.+?;\n/gm, "")
		.trimStart();
}

async function writeMarkdownCopy(sourcePath, contentRoot, publicBaseRoots) {
	const markdown = stripPageOnlySyntax(await readFile(sourcePath, "utf8"));
	const publicPath = toPublicMarkdownPath(sourcePath, contentRoot);

	for (const baseRoot of publicBaseRoots) {
		const target = join(baseRoot, publicPath);
		await mkdir(dirname(target), { recursive: true });
		await writeFile(target, markdown);
	}
}

export async function generateMarkdownPages(docsRoot = process.cwd()) {
	const contentRoot = join(docsRoot, "src/content/docs");
	const publicRoot = join(docsRoot, "public");
	const publicBaseRoots = [publicRoot, join(publicRoot, "react-sketch-canvas")];

	await Promise.all([
		rm(join(publicRoot, "agentic-tools.mdx"), { force: true }),
		rm(join(publicRoot, "api"), { force: true, recursive: true }),
		rm(join(publicRoot, "api.mdx"), { force: true }),
		rm(join(publicRoot, "guides"), { force: true, recursive: true }),
		rm(join(publicRoot, "index.mdx"), { force: true }),
	]);
	await rm(join(publicRoot, "react-sketch-canvas"), {
		force: true,
		recursive: true,
	});

	for (const sourcePath of await walk(contentRoot)) {
		await writeMarkdownCopy(sourcePath, contentRoot, publicBaseRoots);
	}
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
	await generateMarkdownPages();
}
