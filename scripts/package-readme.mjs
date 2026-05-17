import { existsSync } from "node:fs";
import { copyFile, readFile, unlink } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const command = process.argv[2];
const repoRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const rootReadmePath = join(repoRoot, "README.md");
const packageReadmePath = join(process.cwd(), "README.md");

async function read(path) {
	return readFile(path, "utf8");
}

async function readRootReadme() {
	try {
		return await read(rootReadmePath);
	} catch (error) {
		throw new Error(
			`Unable to read root README at ${rootReadmePath}: ${error.message}`,
		);
	}
}

async function packageReadmeDiffersFrom(rootReadme) {
	if (!existsSync(packageReadmePath)) {
		return false;
	}

	return (await read(packageReadmePath)) !== rootReadme;
}

async function prepack() {
	const rootReadme = await readRootReadme();

	if (await packageReadmeDiffersFrom(rootReadme)) {
		throw new Error(
			`Refusing to overwrite ${packageReadmePath} because it differs from root README ${rootReadmePath}.`,
		);
	}

	await copyFile(rootReadmePath, packageReadmePath);
}

async function postpack() {
	const rootReadme = await readRootReadme();

	if (!existsSync(packageReadmePath)) {
		return;
	}

	if (await packageReadmeDiffersFrom(rootReadme)) {
		throw new Error(
			`Refusing to delete ${packageReadmePath} because it differs from root README ${rootReadmePath}.`,
		);
	}

	await unlink(packageReadmePath);
}

const commands = {
	prepack,
	postpack,
};

if (!(command in commands)) {
	console.error("Usage: node scripts/package-readme.mjs <prepack|postpack>");
	process.exitCode = 1;
} else {
	try {
		await commands[command]();
	} catch (error) {
		console.error(error.message);
		process.exitCode = 1;
	}
}
