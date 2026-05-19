import * as Twoslash from "fumadocs-twoslash/ui";
import { Card, Cards } from "fumadocs-ui/components/card";
import { Tab, Tabs } from "fumadocs-ui/components/tabs";
import defaultMdxComponents from "fumadocs-ui/mdx";
import type { MDXComponents } from "mdx/types";

export function getMDXComponents(components?: MDXComponents) {
	return {
		...defaultMdxComponents,
		Card,
		CardGrid: Cards,
		Tab,
		TabItem: Tab,
		Tabs,
		...Twoslash,
		...components,
	} satisfies MDXComponents;
}

export const useMDXComponents = getMDXComponents;

declare global {
	type MDXProvidedComponents = ReturnType<typeof getMDXComponents>;
}
