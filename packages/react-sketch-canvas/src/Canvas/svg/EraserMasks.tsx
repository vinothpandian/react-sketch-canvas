import type * as React from "react";
import { SvgPath } from "../../Paths";
import type { CanvasPath } from "../../types";

type EraserMasksProps = {
	internalId: string;
	eraserPaths: CanvasPath[];
};

/**
 * Renders hidden eraser strokes that SVG masks can reference by id.
 *
 * @remarks
 * The strokes are not visible in the final canvas. They provide reusable mask
 * shapes so each drawing group can be clipped by the erasers that occur after
 * it in path order.
 */
export function HiddenEraserStrokes({
	internalId,
	eraserPaths,
}: EraserMasksProps): React.JSX.Element {
	return (
		<g id={`${internalId}__eraser-stroke-group`}>
			<rect
				id={`${internalId}__mask-background`}
				x="0"
				y="0"
				width="100%"
				height="100%"
				fill="#fff"
			/>
			{eraserPaths.map((eraserPath, i) => (
				<SvgPath
					// biome-ignore lint/suspicious/noArrayIndexKey: eraser masks are generated from ordered strokes with no domain id.
					key={`${internalId}__eraser-${i}`}
					id={`${internalId}__eraser-${i}`}
					paths={eraserPath.paths}
					strokeColor="#000"
					strokeWidth={eraserPath.strokeWidth}
				/>
			))}
		</g>
	);
}

/**
 * Defines one SVG mask for each eraser stroke.
 *
 * @remarks
 * Each mask includes the current eraser and all later erasers. This preserves
 * path ordering: a drawing group is erased only by eraser strokes that were
 * created after that drawing group.
 */
export function EraserMaskDefs({
	internalId,
	eraserPaths,
}: EraserMasksProps): React.JSX.Element {
	return (
		<>
			{eraserPaths.map((_, i) => (
				<mask
					id={`${internalId}__eraser-mask-${i}`}
					// biome-ignore lint/suspicious/noArrayIndexKey: mask order is tied to ordered eraser strokes.
					key={`${internalId}__eraser-mask-${i}`}
					className="react-sketch-canvas__eraser-mask darkreader-ignore"
					data-darkreader-ignore=""
					maskUnits="userSpaceOnUse"
					style={{ colorScheme: "light" }}
				>
					<use
						href={`#${internalId}__mask-background`}
						xlinkHref={`#${internalId}__mask-background`}
					/>
					{Array.from({ length: eraserPaths.length - i }, (_i, j) => j + i).map(
						(k) => (
							<use
								key={k.toString()}
								href={`#${internalId}__eraser-${k.toString()}`}
								xlinkHref={`#${internalId}__eraser-${k.toString()}`}
							/>
						),
					)}
				</mask>
			))}
		</>
	);
}
