import Paths from "../../Paths";
import type { CanvasPath } from "../../types";

type StrokeGroupsProps = {
	id: string;
	pathGroups: CanvasPath[][];
	eraserPaths: CanvasPath[];
};

export function StrokeGroups({
	id,
	pathGroups,
	eraserPaths,
}: StrokeGroupsProps): JSX.Element {
	return (
		<>
			{pathGroups.map((pathGroup, i) => (
				<g
					id={`${id}__stroke-group-${i}`}
					// biome-ignore lint/suspicious/noArrayIndexKey: stroke groups are ordered drawing segments with no domain id.
					key={`${id}__stroke-group-${i}`}
					{...(eraserPaths[i] ? { mask: `url(#${id}__eraser-mask-${i})` } : {})}
				>
					<Paths id={`${id}__stroke-group-${i}__paths`} paths={pathGroup} />
				</g>
			))}
		</>
	);
}
