import type { Point } from "../types";
import { bezierCommand } from "./geometry";

export type SvgPathProps = {
	paths: Point[];
	id: string;
	strokeWidth: number;
	strokeColor: string;
	command?: (point: Point, i: number, a: Point[]) => string;
};

export function SvgPath({
	paths,
	id,
	strokeWidth,
	strokeColor,
	command = bezierCommand,
}: SvgPathProps): JSX.Element {
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

	const d = paths.reduce(
		(acc, point, i, a) =>
			i === 0 ? `M ${point.x},${point.y}` : `${acc} ${command(point, i, a)}`,
		"",
	);

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
