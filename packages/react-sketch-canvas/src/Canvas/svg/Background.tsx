import type { CanvasProps } from "../types";

type BackgroundProps = Required<Pick<CanvasProps, "id">> &
	Pick<
		CanvasProps,
		"backgroundImage" | "canvasColor" | "preserveBackgroundImageAspectRatio"
	>;

/**
 * Defines the SVG pattern used to paint a configured background image.
 *
 * @remarks
 * The pattern is rendered only when a background image exists. The visible
 * rectangle decides whether to reference this pattern or use `canvasColor`.
 */
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

/**
 * Renders the background rectangle that sits behind all sketch strokes.
 *
 * @remarks
 * The rectangle id is stable because export code uses it to remove or recolor
 * the background when producing SVG output.
 */
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
