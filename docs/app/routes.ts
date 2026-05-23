import { index, type RouteConfig, route } from "@react-router/dev/routes";

export default [
	route("api/search", "routes/search.ts"),
	route("llms.txt", "routes/llms.ts"),
	route("llms-full.txt", "routes/llms-full.ts"),
	index("routes/home.tsx"),
	route("*", "routes/docs.tsx"),
] satisfies RouteConfig;
