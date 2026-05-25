import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import mdx from "fumadocs-mdx/vite";
import { defineConfig } from "vite";
import { generateMarkdownPages } from "./scripts/generate-markdown-pages.mjs";
import * as MdxConfig from "./source.config";

export default defineConfig({
	base: process.env.NODE_ENV === "production" ? "/react-sketch-canvas/" : "/",
	plugins: [
		{
			name: "react-sketch-canvas:markdown-pages",
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
		mdx(MdxConfig),
		tailwindcss(),
		reactRouter(),
	],
	resolve: {
		tsconfigPaths: true,
	},
});
