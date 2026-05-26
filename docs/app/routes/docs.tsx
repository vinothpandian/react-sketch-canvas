import browserCollections from "collections/browser";
import { useFumadocsLoader } from "fumadocs-core/source/client";
import { DocsLayout } from "fumadocs-ui/layouts/docs";
import {
	DocsBody,
	DocsDescription,
	DocsPage,
	DocsTitle,
} from "fumadocs-ui/layouts/docs/page";
import {
	MarkdownCopyButton,
	ViewOptionsPopover,
} from "~/components/ai/page-actions";
import { getMDXComponents } from "~/components/mdx";
import { baseOptions, githubUrl } from "~/lib/layout.shared";
import { withDocsBasePath } from "~/lib/site-paths";
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
		markdownurl: `${withDocsBasePath(page.url)}.mdx`,
		githuburl: `${githubUrl}/blob/main/docs/src/content/docs/${page.path}`,
		pageTree: await source.serializePageTree(source.getPageTree()),
	};
}

const clientLoader = browserCollections.docs.createClientLoader({
	component(
		{ toc, frontmatter, default: MDXContent },
		props: { className?: string; markdownurl: string; githuburl: string },
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
				<div className="flex flex-row gap-2 items-center border-b pt-2 pb-6">
					<MarkdownCopyButton markdownUrl={props.markdownurl} />
					<ViewOptionsPopover
						markdownUrl={props.markdownurl}
						githubUrl={props.githuburl}
					/>
				</div>
				<DocsBody>
					<MDXContent components={getMDXComponents()} />
				</DocsBody>
			</DocsPage>
		);
	},
});

export default function Page({ loaderData }: Route.ComponentProps) {
	const { path, pageTree, markdownurl, githuburl } =
		useFumadocsLoader(loaderData);

	return (
		<DocsLayout {...baseOptions()} tree={pageTree}>
			{clientLoader.useContent(path, {
				markdownurl,
				githuburl,
			})}
		</DocsLayout>
	);
}
