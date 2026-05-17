import type * as React from "react";

type BackgroundProps = {
	id: string;
	backgroundImage: string;
	canvasColor: string;
	preserveBackgroundImageAspectRatio?: React.SVGAttributes<HTMLImageElement>["preserveAspectRatio"];
};

export function BackgroundPattern({
	id,
	backgroundImage,
	preserveBackgroundImageAspectRatio,
}: Pick<
	BackgroundProps,
	"id" | "backgroundImage" | "preserveBackgroundImageAspectRatio"
>): JSX.Element | null {
	if (!backgroundImage) return null;

	return (
		<pattern
			id={`${id}__background`}
			x="0"
			y="0"
			width="100%"
			height="100%"
			patternUnits="userSpaceOnUse"
		>
			<image
				x="0"
				y="0"
				width="100%"
				height="100%"
				xlinkHref={backgroundImage}
				preserveAspectRatio={preserveBackgroundImageAspectRatio}
			/>
		</pattern>
	);
}

export function BackgroundRect({
	id,
	backgroundImage,
	canvasColor,
}: Pick<
	BackgroundProps,
	"id" | "backgroundImage" | "canvasColor"
>): JSX.Element {
	return (
		<g id={`${id}__canvas-background-group`}>
			<rect
				id={`${id}__canvas-background`}
				x="0"
				y="0"
				width="100%"
				height="100%"
				fill={backgroundImage ? `url(#${id}__background)` : canvasColor}
			/>
		</g>
	);
}
