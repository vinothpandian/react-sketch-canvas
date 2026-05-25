import { RootProvider } from "fumadocs-ui/provider/react-router";
import type { LinksFunction } from "react-router";
import { Links, Meta, Outlet, Scripts, ScrollRestoration } from "react-router";
import { withDocsBasePath } from "~/lib/site-paths";
import stylesheet from "./styles.css?url";

export const links: LinksFunction = () => [
	{ rel: "stylesheet", href: stylesheet },
];

export function Layout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<meta name="robots" content="index, follow" />
				<Meta />
				<Links />
			</head>
			<body>
				<RootProvider
					search={{
						options: {
							type: "static",
							api: withDocsBasePath("/api/search"),
						},
					}}
				>
					{children}
				</RootProvider>
				<ScrollRestoration />
				<Scripts />
			</body>
		</html>
	);
}

export default function App() {
	return <Outlet />;
}
