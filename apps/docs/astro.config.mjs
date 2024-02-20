import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import tailwind from "@astrojs/tailwind";
import react from "@astrojs/react";
import starlightTypeDoc, { typeDocSidebarGroup } from "starlight-typedoc";


// https://astro.build/config
export default defineConfig({
  site: 'https://vinoth.info',
  base: '/react-sketch-canvas',
  integrations: [
    starlight({
      title: "React Sketch Canvas",
      customCss: [
        "./src/styles/tailwind.css",
        "./src/styles/customize.css",
        "@fontsource/kalam/400.css"
      ],
      social: {
        github: "https://github.com/vinothpandian/react-sketch-canvas"
      },
      plugins: [
        // Generate the documentation.
        starlightTypeDoc({
          entryPoints: ["../../packages/react-sketch-canvas/src/index.tsx"],
          tsconfig: "../../packages/react-sketch-canvas/tsconfig.json",
          watch: false
        })
      ],
      sidebar: [
        {
          label: "Guides",
          autogenerate: {
            directory: "guides"
          }
        },
        {
          label: "Examples",
          autogenerate: {
            directory: "examples"
          }
        },
        // Add the generated sidebar group to the sidebar.
        typeDocSidebarGroup
      ]
    }),
    tailwind({
      applyBaseStyles: false
    }),
    react()
  ]
});
