import * as React from "react";
import type { CanvasPath, Point } from "../types";
import { bezierCommand } from "./geometry";

/**
 * Props for rendering a single SVG stroke path.
 *
 * @remarks
 * This type composes the stroke fields from {@link CanvasPath} and adds the
 * SVG id plus an optional command generator for tests or alternate smoothing.
 */
export type SvgPathProps = Pick<
	CanvasPath,
	"paths" | "strokeWidth" | "strokeColor"
> & {
	id: string;
	command?: (point: Point, i: number, a: Point[]) => string;
};

/**
 * Render one `CanvasPath` as SVG.
 *
 * @remarks
 * A one-point path is rendered as a circle so taps and clicks produce visible
 * dots. Multi-point paths are rendered as a smoothed cubic Bezier path.
 */
function SvgPathComponent({
	paths,
	id,
	strokeWidth,
	strokeColor,
	command = bezierCommand,
}: SvgPathProps): React.JSX.Element {
	const d = React.useMemo(
		() =>
			paths.reduce(
				(acc, point, i, a) =>
					i === 0
						? `M ${point.x},${point.y}`
						: `${acc} ${command(point, i, a)}`,
				"",
			),
		[command, paths],
	);

	if (paths.length === 1) {
		const { x, y } = paths[0];
		const radius = strokeWidth / 2;

		return (
			<circle
				key={id}
				id={id}
				cx={x}
				cy={y}
				r={radius}
				stroke={strokeColor}
				fill={strokeColor}
			/>
		);
	}

	return (
		<path
			key={id}
			id={id}
			d={d}
			fill="none"
			strokeLinecap="round"
			stroke={strokeColor}
			strokeWidth={strokeWidth}
		/>
	);
}

export const SvgPath = React.memo(SvgPathComponent);
SvgPath.displayName = "SvgPath";
