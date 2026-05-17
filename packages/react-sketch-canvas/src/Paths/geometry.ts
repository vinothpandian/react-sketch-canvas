import type { Point } from "../types";

type ControlPoints = {
	current: Point;
	previous?: Point;
	next?: Point;
	reverse?: boolean;
};

type LineReturns = {
	length: number;
	angle: number;
};

/**
 * Calculate distance and angle between two points.
 *
 * @remarks
 * The Bezier smoothing code uses this vector to place control points relative
 * to neighboring stroke points.
 */
export const line = (pointA: Point, pointB: Point): LineReturns => {
	const lengthX = pointB.x - pointA.x;
	const lengthY = pointB.y - pointA.y;

	return {
		length: Math.sqrt(lengthX ** 2 + lengthY ** 2),
		angle: Math.atan2(lengthY, lengthX),
	};
};

const controlPoint = (controlPoints: ControlPoints): [number, number] => {
	const { current, next, previous, reverse } = controlPoints;
	const p = previous || current;
	const n = next || current;
	const smoothing = 0.2;
	const o = line(p, n);
	const angle = o.angle + (reverse ? Math.PI : 0);
	const length = o.length * smoothing;

	return [
		current.x + Math.cos(angle) * length,
		current.y + Math.sin(angle) * length,
	];
};

/**
 * Create a cubic Bezier SVG command for a stroke point.
 *
 * @remarks
 * The command uses the previous, current, and next points to create a smoothed
 * freehand stroke while preserving the original point list.
 */
export const bezierCommand = (point: Point, i: number, a: Point[]): string => {
	let cpsX: number;
	let cpsY: number;

	switch (i) {
		case 0:
			[cpsX, cpsY] = controlPoint({ current: point });
			break;
		case 1:
			[cpsX, cpsY] = controlPoint({ current: a[i - 1], next: point });
			break;
		default:
			[cpsX, cpsY] = controlPoint({
				current: a[i - 1],
				previous: a[i - 2],
				next: point,
			});
			break;
	}

	const [cpeX, cpeY] = controlPoint({
		current: point,
		previous: a[i - 1],
		next: a[i + 1],
		reverse: true,
	});

	return `C ${cpsX},${cpsY} ${cpeX},${cpeY} ${point.x}, ${point.y}`;
};
