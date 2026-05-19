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
		<figure className="not-prose overflow-hidden">
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
