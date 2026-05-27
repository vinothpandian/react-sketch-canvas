import { defineConfig } from "tsup";

export default defineConfig((options) => {
	const isProdEnv = options.env?.NODE_ENV === "production";

	return {
		entry: ["src/index.tsx"],
		sourcemap: !isProdEnv,
		format: isProdEnv ? ["esm", "cjs", "iife"] : ["esm"],
		dts: true,
		minify: isProdEnv,
		watch: !isProdEnv,
		clean: true,
	};
});
