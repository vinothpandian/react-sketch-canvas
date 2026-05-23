import { readdirSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";
import type { Config } from "@react-router/dev/config";

function getDocPaths() {
	const root = join(process.cwd(), "src/content/docs");
	const paths = ["/"];

	function walk(dir: string) {
		for (const entry of readdirSync(dir)) {
			if (entry.startsWith(".")) {
				continue;
			}

			const path = join(dir, entry);
			const stat = statSync(path);

			if (stat.isDirectory()) {
				walk(path);
				continue;
			}

			if (!/\.(md|mdx)$/.test(entry)) {
				continue;
			}

			const parsed = relative(root, path)
				.split(sep)
				.join("/")
				.replace(/\.(md|mdx)$/, "")
				.replace(/(^|\/)(index|README)$/i, "");
			const route = `/${parsed}`.replace(/\/+/g, "/");

			if (route !== "/") {
				paths.push(route);
			}
		}
	}

	walk(root);
	return paths;
}

export default {
	basename: "/react-sketch-canvas",
	prerender: [...getDocPaths(), "/llms.txt", "/llms-full.txt"],
} satisfies Config;
