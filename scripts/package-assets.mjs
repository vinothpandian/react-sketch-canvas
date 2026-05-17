import { existsSync } from "node:fs";
import { copyFile, readFile, unlink } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const command = process.argv[2];
const repoRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const packageRoot = join(repoRoot, "packages", "react-sketch-canvas");

const packageAssets = [
	{
		name: "README",
		rootPath: join(repoRoot, "README.md"),
		packagePath: join(packageRoot, "README.md"),
	},
	{
		name: "CHANGELOG",
		rootPath: join(repoRoot, "CHANGELOG.md"),
		packagePath: join(packageRoot, "CHANGELOG.md"),
	},
];

if (process.cwd() !== packageRoot) {
	console.error(
		`Run this script from ${packageRoot}; current directory is ${process.cwd()}.`,
	);
	process.exit(1);
}

async function read(path) {
	return readFile(path, "utf8");
}

async function readRootAsset(asset) {
	try {
		return await read(asset.rootPath);
	} catch (error) {
		throw new Error(
			`Unable to read root ${asset.name} at ${asset.rootPath}: ${error.message}`,
		);
	}
}

async function packageAssetDiffersFrom(asset, rootContent) {
	if (!existsSync(asset.packagePath)) {
		return false;
	}

	return (await read(asset.packagePath)) !== rootContent;
}

async function prepack() {
	for (const asset of packageAssets) {
		const rootContent = await readRootAsset(asset);

		if (await packageAssetDiffersFrom(asset, rootContent)) {
			throw new Error(
				`Refusing to overwrite ${asset.packagePath} because it differs from root ${asset.name} ${asset.rootPath}.`,
			);
		}

		await copyFile(asset.rootPath, asset.packagePath);
	}
}

async function postpack() {
	for (const asset of packageAssets) {
		const rootContent = await readRootAsset(asset);

		if (!existsSync(asset.packagePath)) {
			continue;
		}

		if (await packageAssetDiffersFrom(asset, rootContent)) {
			throw new Error(
				`Refusing to delete ${asset.packagePath} because it differs from root ${asset.name} ${asset.rootPath}.`,
			);
		}

		await unlink(asset.packagePath);
	}
}

const commands = {
	prepack,
	postpack,
};

if (!(command in commands)) {
	console.error("Usage: node scripts/package-assets.mjs <prepack|postpack>");
	process.exitCode = 1;
} else {
	try {
		await commands[command]();
	} catch (error) {
		console.error(error.message);
		process.exitCode = 1;
	}
}
