import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import tailwind from "@astrojs/tailwind";

import react from "@astrojs/react";

// https://astro.build/config
export default defineConfig({
  integrations: [starlight({
    title: "React Sketch Canvas",
    customCss: ["./src/tailwind.css"],
    social: {
      github: "https://github.com/vinothpandian/react-sketch-canvas"
    },
    sidebar: [{
      label: "Guides",
      items: [{
        label: "Example Guide",
        link: "/guides/example/"
      }]
    }, {
      label: "Reference",
      autogenerate: {
        directory: "reference"
      }
    }]
  }), tailwind({
    applyBaseStyles: false
  }), react()]
});