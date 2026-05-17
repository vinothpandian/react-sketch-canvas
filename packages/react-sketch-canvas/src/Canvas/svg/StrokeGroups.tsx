import type * as React from "react";
import Paths from "../../Paths";
import type { CanvasPath } from "../../types";
import type { CanvasProps } from "../types";

type StrokeGroupsProps = Required<Pick<CanvasProps, "id">> & {
	pathGroups: CanvasPath[][];
	eraserPaths: CanvasPath[];
};

/**
 * Renders visible drawing strokes grouped between eraser strokes.
 *
 * @remarks
 * The group index lines up with eraser mask indexes from `EraserMaskDefs`.
 * Keeping these groups separate is what lets SVG masks emulate canvas-style
 * erasing without mutating existing path data.
 */
export function StrokeGroups({
	id,
	pathGroups,
	eraserPaths,
}: StrokeGroupsProps): React.JSX.Element {
	return (
		<>
			{pathGroups.map((pathGroup, i) => (
				<g
					// biome-ignore lint/suspicious/noArrayIndexKey: stroke groups are ordered drawing segments with no domain id.
					key={`${id}__stroke-group-${i}`}
					id={`${id}__stroke-group-${i}`}
					{...(eraserPaths[i] ? { mask: `url(#${id}__eraser-mask-${i})` } : {})}
				>
					<Paths id={`${id}__stroke-group-${i}__paths`} paths={pathGroup} />
				</g>
			))}
		</>
	);
}
