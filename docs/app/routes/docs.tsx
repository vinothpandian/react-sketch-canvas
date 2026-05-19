import browserCollections from "collections/browser";
import { useFumadocsLoader } from "fumadocs-core/source/client";
import { DocsLayout } from "fumadocs-ui/layouts/docs";
import {
	DocsBody,
	DocsDescription,
	DocsPage,
	DocsTitle,
} from "fumadocs-ui/layouts/docs/page";
import { getMDXComponents } from "~/components/mdx";
import { baseOptions } from "~/lib/layout.shared";
import { source } from "~/lib/source";
import type { Route } from "./+types/docs";

export async function loader({ params }: Route.LoaderArgs) {
	const slugs = params["*"]?.split("/").filter(Boolean) ?? [];
	const page = source.getPage(slugs);

	if (!page) {
		throw new Response("Not found", { status: 404 });
	}

	return {
		path: page.path,
		url: page.url,
		pageTree: await source.serializePageTree(source.getPageTree()),
	};
}

const clientLoader = browserCollections.docs.createClientLoader({
	component(
		{ toc, frontmatter, default: MDXContent },
		props?: { className?: string },
	) {
		return (
			<DocsPage toc={toc} {...props}>
				<title>{frontmatter.title}</title>
				{frontmatter.description ? (
					<meta name="description" content={frontmatter.description} />
				) : null}
				<DocsTitle>{frontmatter.title}</DocsTitle>
				{frontmatter.description ? (
					<DocsDescription>{frontmatter.description}</DocsDescription>
				) : null}
				<DocsBody>
					<MDXContent components={getMDXComponents()} />
				</DocsBody>
			</DocsPage>
		);
	},
});

export default function Page({ loaderData }: Route.ComponentProps) {
	const { path, pageTree } = useFumadocsLoader(loaderData);

	return (
		<DocsLayout {...baseOptions()} tree={pageTree}>
			{clientLoader.useContent(path)}
		</DocsLayout>
	);
}
