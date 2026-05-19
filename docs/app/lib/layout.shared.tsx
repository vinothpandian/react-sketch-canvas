import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";

export function baseOptions(): BaseLayoutProps {
	return {
		nav: {
			title: "React Sketch Canvas",
			url: "/",
		},
	};
}

export function githubFooter() {
	return (
		<a
			href="https://github.com/vinothpandian/react-sketch-canvas"
			rel="noreferrer"
			target="_blank"
		>
			GitHub
		</a>
	);
}
