import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";

export const githubUrl = "https://github.com/vinothpandian/react-sketch-canvas";

export function baseOptions(): BaseLayoutProps {
	return {
		nav: {
			title: "React Sketch Canvas",
			url: "/",
			transparentMode: "top",
		},
		githubUrl,
	};
}
