import { index, type RouteConfig, route } from "@react-router/dev/routes";

export default [
	route("api/search", "routes/search.ts"),
	index("routes/home.tsx"),
	route("*", "routes/docs.tsx"),
] satisfies RouteConfig;
