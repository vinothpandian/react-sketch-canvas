import type * as React from "react";
import type { CanvasProps } from "../types";

type BackgroundProps = Pick<
	CanvasProps,
	"backgroundImage" | "canvasColor" | "preserveBackgroundImageAspectRatio"
> & {
	internalId: string;
};

/**
 * Defines the SVG pattern used to paint a configured background image.
 *
 * @remarks
 * The pattern is rendered only when a background image exists. The visible
 * rectangle decides whether to reference this pattern or use `canvasColor`.
 */
export function BackgroundPattern({
	internalId,
	backgroundImage,
	preserveBackgroundImageAspectRatio,
}: Pick<
	BackgroundProps,
	"internalId" | "backgroundImage" | "preserveBackgroundImageAspectRatio"
>): React.JSX.Element | null {
	if (!backgroundImage) return null;

	return (
		<pattern
			id={`${internalId}__background`}
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

/**
 * Renders the background rectangle that sits behind all sketch strokes.
 *
 * @remarks
 * The rectangle id is stable because export code uses it to remove or recolor
 * the background when producing SVG output.
 */
export function BackgroundRect({
	internalId,
	backgroundImage,
	canvasColor,
}: Pick<
	BackgroundProps,
	"internalId" | "backgroundImage" | "canvasColor"
>): React.JSX.Element {
	return (
		<g id={`${internalId}__canvas-background-group`}>
			<rect
				id={`${internalId}__canvas-background`}
				x="0"
				y="0"
				width="100%"
				height="100%"
				fill={backgroundImage ? `url(#${internalId}__background)` : canvasColor}
			/>
		</g>
	);
}
