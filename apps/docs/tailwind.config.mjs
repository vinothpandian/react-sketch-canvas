import starlightPlugin from "@astrojs/starlight-tailwind";
import colors from "tailwindcss/colors";

const accent = {
  50: "#f0f5fe",
  100: "#dee8fb",
  200: "#c5d8f8",
  300: "#9cc0f4",
  400: "#6497eb",
  500: "#4c7be5",
  600: "#375fd9",
  700: "#2e4bc7",
  800: "#2b3fa2",
  900: "#283980",
  950: "#1c244f",
};

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      colors: {
        accent,
        gray: colors.zinc,
      },
    },
  },
  plugins: [starlightPlugin()],
};
