import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";

export const githubUrl = "https://github.com/vinothpandian/react-sketch-canvas";

export function baseOptions(): BaseLayoutProps {
	return {
		nav: {
			title: "React Sketch Canvas",
			url: "https://vinoth.info/react-sketch-canvas/",
			transparentMode: "top",
		},
		githubUrl,
		links: [
			{
				text: "Docs",
				url: "/guides/installation/",
				active: "nested-url",
			},
			{
				text: "Examples",
				url: "/examples/drawing/",
				active: "nested-url",
			},
			{
				text: "API",
				url: "/api/",
				active: "nested-url",
			},
		],
	};
}
