import browserCollections from "collections/browser";
import { DocsBody } from "fumadocs-ui/layouts/docs/page";
import { HomeLayout } from "fumadocs-ui/layouts/home";
import { getMDXComponents } from "~/components/mdx";
import { baseOptions } from "~/lib/layout.shared";
import { source } from "~/lib/source";
import type { Route } from "./+types/home";

export async function loader() {
	const page = source.getPage([]);

	if (!page) {
		throw new Response("Not found", { status: 404 });
	}

	return {
		path: page.path,
	};
}

const clientLoader = browserCollections.docs.createClientLoader({
	component({ frontmatter, default: MDXContent }) {
		return (
			<>
				<title>{frontmatter.title}</title>
				{frontmatter.description ? (
					<meta name="description" content={frontmatter.description} />
				) : null}
				<DocsBody className="mx-auto w-full max-w-6xl px-4 py-10 md:px-6 md:py-16">
					<MDXContent components={getMDXComponents()} />
				</DocsBody>
			</>
		);
	},
});

export default function Page({ loaderData }: Route.ComponentProps) {
	return (
		<HomeLayout {...baseOptions()} className="min-h-dvh">
			{clientLoader.useContent(loaderData.path)}
		</HomeLayout>
	);
}
