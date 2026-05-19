import { DynamicCodeBlock } from "fumadocs-ui/components/dynamic-codeblock";
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
		<figure>
			<figcaption>{fileName}</figcaption>
			<div>{children}</div>
			<details>
				<summary>Source</summary>
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
			</details>
		</figure>
	);
}
