import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import mdx from "fumadocs-mdx/vite";
import { defineConfig } from "vite";
import { flattenPagesBuild } from "./scripts/flatten-pages-build.mjs";
import { generateApiDocs } from "./scripts/generate-api-docs.mjs";
import { generateMarkdownPages } from "./scripts/generate-markdown-pages.mjs";
import * as MdxConfig from "./source.config";

export default defineConfig({
	base: process.env.NODE_ENV === "production" ? "/react-sketch-canvas/" : "/",
	plugins: [
		{
			name: "react-sketch-canvas:markdown-pages",
			apply: "serve",
			async buildStart() {
				await generateMarkdownPages();
			},
			async handleHotUpdate({ file }) {
				if (!/src\/content\/docs\/.*\.(md|mdx)$/.test(file)) {
					return;
				}

				await generateMarkdownPages();
			},
		},
		{
			name: "react-sketch-canvas:generated-docs",
			apply: "build",
			async buildStart() {
				await generateApiDocs();
				await generateMarkdownPages();
			},
		},
		mdx(MdxConfig),
		tailwindcss(),
		reactRouter(),
		{
			name: "react-sketch-canvas:flatten-pages-build",
			apply: "build",
			enforce: "post",
			async closeBundle() {
				await flattenPagesBuild();
			},
		},
	],
	resolve: {
		tsconfigPaths: true,
	},
});
