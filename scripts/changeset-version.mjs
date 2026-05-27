import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { copyFile, readFile, unlink } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const rootChangelogPath = join(repoRoot, "CHANGELOG.md");
const packageChangelogPath = join(
	repoRoot,
	"packages",
	"react-sketch-canvas",
	"CHANGELOG.md",
);

if (process.cwd() !== repoRoot) {
	console.error(
		`Run this script from ${repoRoot}; current directory is ${process.cwd()}.`,
	);
	process.exit(1);
}

async function read(path) {
	return readFile(path, "utf8");
}

async function assertPackageChangelogIsDisposable() {
	if (!existsSync(packageChangelogPath)) {
		return;
	}

	const [rootChangelog, packageChangelog] = await Promise.all([
		read(rootChangelogPath),
		read(packageChangelogPath),
	]);

	if (rootChangelog !== packageChangelog) {
		throw new Error(
			`Refusing to overwrite ${packageChangelogPath} because it differs from ${rootChangelogPath}.`,
		);
	}
}

async function runChangesetVersion() {
	const executable = process.platform === "win32" ? "pnpm.cmd" : "pnpm";

	return new Promise((resolve, reject) => {
		const child = spawn(executable, ["exec", "changeset", "version"], {
			cwd: repoRoot,
			stdio: "inherit",
		});

		child.on("error", reject);
		child.on("close", (code) => {
			if (code === 0) {
				resolve();
			} else {
				reject(new Error(`changeset version exited with code ${code}`));
			}
		});
	});
}

try {
	await assertPackageChangelogIsDisposable();
	await copyFile(rootChangelogPath, packageChangelogPath);
	await runChangesetVersion();
	await copyFile(packageChangelogPath, rootChangelogPath);
	await unlink(packageChangelogPath);
} catch (error) {
	console.error(error.message);
	process.exitCode = 1;
}
