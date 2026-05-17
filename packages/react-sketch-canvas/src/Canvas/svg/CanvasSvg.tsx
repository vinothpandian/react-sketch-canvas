import type { CanvasPath } from "../../types";
import type { CanvasProps } from "../types";
import { BackgroundPattern, BackgroundRect } from "./Background";
import { EraserMaskDefs, HiddenEraserStrokes } from "./EraserMasks";
import { StrokeGroups } from "./StrokeGroups";
import { getEraserPaths, getPathGroups } from "./grouping";

type CanvasSvgProps = Required<Pick<CanvasProps, "id">> &
	Pick<
		CanvasProps,
		| "paths"
		| "canvasColor"
		| "backgroundImage"
		| "preserveBackgroundImageAspectRatio"
		| "svgStyle"
	> & {
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
	paths,
	canvasColor,
	backgroundImage,
	preserveBackgroundImageAspectRatio,
	svgStyle,
	viewBox,
}: CanvasSvgProps): JSX.Element {
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
			<HiddenEraserStrokes id={id} eraserPaths={eraserPaths} />
			<defs>
				<BackgroundPattern
					id={id}
					backgroundImage={backgroundImage}
					preserveBackgroundImageAspectRatio={
						preserveBackgroundImageAspectRatio
					}
				/>
				<EraserMaskDefs id={id} eraserPaths={eraserPaths} />
			</defs>
			<BackgroundRect
				id={id}
				backgroundImage={backgroundImage}
				canvasColor={canvasColor}
			/>
			<StrokeGroups id={id} pathGroups={pathGroups} eraserPaths={eraserPaths} />
		</svg>
	);
}
