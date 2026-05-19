import { DynamicCodeBlock } from "fumadocs-ui/components/dynamic-codeblock";
import { Tab, Tabs } from "fumadocs-ui/components/tabs";
import type { PropsWithChildren } from "react";

interface ExampleBlockProps {
	source: string;
	fileName?: string;
}

export default function ExampleBlock({
	children,
	fileName = "App.tsx",
	source,
}: PropsWithChildren<ExampleBlockProps>) {
	return (
		<figure className="not-prose my-6 overflow-hidden rounded-lg border bg-fd-card text-fd-card-foreground">
			<figcaption className="border-b bg-fd-muted/40 px-4 py-2 font-medium text-fd-muted-foreground text-sm">
				{fileName}
			</figcaption>
			<Tabs items={["Preview", "Source"]}>
				<Tab value="Preview">
					<div className="p-4">{children}</div>
				</Tab>
				<Tab value="Source">
					<DynamicCodeBlock
						code={source.trimEnd()}
						codeblock={{ title: fileName }}
						lang="tsx"
						options={{
							themes: {
								light: "github-light",
								dark: "github-dark",
							},
						}}
					/>
				</Tab>
			</Tabs>
		</figure>
	);
}
