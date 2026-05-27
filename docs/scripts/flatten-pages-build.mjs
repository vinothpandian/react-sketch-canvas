import { cp, readdir, rm } from "node:fs/promises";
import { join } from "node:path";

const productionBasename = "react-sketch-canvas";

async function directoryExists(path) {
	try {
		await readdir(path);
		return true;
	} catch (error) {
		if (error?.code === "ENOENT") {
			return false;
		}

		throw error;
	}
}

export async function flattenPagesBuild(docsRoot = process.cwd()) {
	const clientBuildRoot = join(docsRoot, "build", "client");
	const prerenderedRoot = join(clientBuildRoot, productionBasename);

	if (!(await directoryExists(prerenderedRoot))) {
		return;
	}

	for (const entry of await readdir(prerenderedRoot)) {
		await cp(join(prerenderedRoot, entry), join(clientBuildRoot, entry), {
			force: true,
			recursive: true,
		});
	}

	await rm(prerenderedRoot, { force: true, recursive: true });
}
