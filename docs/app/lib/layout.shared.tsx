import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";

export const githubUrl = "https://github.com/vinothpandian/react-sketch-canvas";

export function baseOptions(): BaseLayoutProps {
	return {
		nav: {
			title: <span className="font-[Kalam,cursive]">React Sketch Canvas</span>,
			url: "/",
			transparentMode: "top",
		},
		githubUrl,
	};
}
