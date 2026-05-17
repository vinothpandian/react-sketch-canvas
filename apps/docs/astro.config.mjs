import react from "@astrojs/react";
import starlight from "@astrojs/starlight";
import { defineConfig } from "astro/config";
import starlightTypeDoc, { typeDocSidebarGroup } from "starlight-typedoc";

// https://astro.build/config
export default defineConfig({
	site: "https://vinoth.info",
	base: "/react-sketch-canvas",
	image: {
		service: {
			entrypoint: "astro/assets/services/noop",
		},
	},
	integrations: [
		starlight({
			title: "React Sketch Canvas",
			customCss: [
				"./src/styles/tailwind.css",
				"./src/styles/customize.css",
				"@fontsource/kalam/400.css",
			],
			social: [
				{
					icon: "github",
					label: "GitHub",
					href: "https://github.com/vinothpandian/react-sketch-canvas",
				},
			],
			plugins: [
				// Generate the documentation.
				starlightTypeDoc({
					entryPoints: ["../../packages/react-sketch-canvas/src/index.tsx"],
					tsconfig: "../../packages/react-sketch-canvas/tsconfig.json",
					watch: false,
				}),
			],
			sidebar: [
				{
					label: "Guides",
					items: [{ autogenerate: { directory: "guides" } }],
				},
				{
					label: "Examples",
					items: [{ autogenerate: { directory: "examples" } }],
				},
				// Add the generated sidebar group to the sidebar.
				typeDocSidebarGroup,
			],
		}),
		react(),
	],
});
