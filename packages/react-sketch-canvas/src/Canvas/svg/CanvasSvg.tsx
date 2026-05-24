import type * as React from "react";
import type { CanvasProps } from "../types";
import { BackgroundPattern, BackgroundRect } from "./Background";
import { EraserMaskDefs, HiddenEraserStrokes } from "./EraserMasks";
import { getEraserPaths, getPathGroups } from "./grouping";
import { StrokeGroups } from "./StrokeGroups";

type CanvasSvgProps = Required<Pick<CanvasProps, "id">> &
	Pick<
		CanvasProps,
		| "paths"
		| "canvasColor"
		| "backgroundImage"
		| "preserveBackgroundImageAspectRatio"
		| "svgStyle"
	> & {
		internalId: string;
		viewBox?: string;
	};

/**
 * Renders the complete SVG tree for the canvas.
 *
 * @remarks
 * This component keeps SVG construction separate from pointer and export logic.
 * It renders hidden eraser strokes, mask definitions, background markup, and
 * visible stroke groups in the order required for erasing to work.
 */
export function CanvasSvg({
	id,
	internalId,
	paths,
	canvasColor,
	backgroundImage,
	preserveBackgroundImageAspectRatio,
	svgStyle,
	viewBox,
}: CanvasSvgProps): React.JSX.Element {
	const eraserPaths = getEraserPaths(paths);
	const pathGroups = getPathGroups(paths);

	return (
		<svg
			version="1.1"
			baseProfile="full"
			xmlns="http://www.w3.org/2000/svg"
			xmlnsXlink="http://www.w3.org/1999/xlink"
			aria-hidden="true"
			style={{
				width: "100%",
				height: "100%",
				...svgStyle,
			}}
			id={id}
			viewBox={viewBox}
		>
			<defs>
				<HiddenEraserStrokes
					internalId={internalId}
					eraserPaths={eraserPaths}
				/>
				<BackgroundPattern
					internalId={internalId}
					backgroundImage={backgroundImage}
					preserveBackgroundImageAspectRatio={
						preserveBackgroundImageAspectRatio
					}
				/>
				<EraserMaskDefs internalId={internalId} eraserPaths={eraserPaths} />
			</defs>
			<BackgroundRect
				internalId={internalId}
				backgroundImage={backgroundImage}
				canvasColor={canvasColor}
			/>
			<StrokeGroups
				internalId={internalId}
				pathGroups={pathGroups}
				eraserPaths={eraserPaths}
			/>
		</svg>
	);
}
