import type { CanvasPath, Point } from "../types";

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

type DoesEraserStrokeHitStrokeParams = {
	eraser: CanvasPath;
	stroke: CanvasPath;
};

type DoesEraserStrokeHitStrokeReturns = boolean;

type Segment = readonly [Point, Point];

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

const distanceBetweenPoints = (pointA: Point, pointB: Point): number =>
	line(pointA, pointB).length;

/**
 * Measure the shortest distance from a point to a finite line segment.
 *
 * @remarks
 * The projected point is clamped to the segment endpoints, so this works for
 * both normal segments and degenerate single-point segments.
 */
const distanceFromPointToSegment = (
	point: Point,
	[start, end]: Segment,
): number => {
	const lengthSquared = distanceBetweenPoints(start, end) ** 2;

	if (lengthSquared === 0) {
		return distanceBetweenPoints(point, start);
	}

	const projection =
		((point.x - start.x) * (end.x - start.x) +
			(point.y - start.y) * (end.y - start.y)) /
		lengthSquared;
	const boundedProjection = Math.max(0, Math.min(1, projection));
	const closestPoint = {
		x: start.x + boundedProjection * (end.x - start.x),
		y: start.y + boundedProjection * (end.y - start.y),
	};

	return distanceBetweenPoints(point, closestPoint);
};

/**
 * Return the signed orientation of three points.
 *
 * @remarks
 * Segment intersection uses the sign to determine whether two points sit on
 * opposite sides of another segment. A zero value means the points are
 * collinear.
 */
const orientation = (pointA: Point, pointB: Point, pointC: Point): number =>
	(pointB.y - pointA.y) * (pointC.x - pointB.x) -
	(pointB.x - pointA.x) * (pointC.y - pointB.y);

/**
 * Check whether a collinear point lies within a segment's bounding box.
 */
const isPointOnSegment = (point: Point, [start, end]: Segment): boolean =>
	point.x <= Math.max(start.x, end.x) &&
	point.x >= Math.min(start.x, end.x) &&
	point.y <= Math.max(start.y, end.y) &&
	point.y >= Math.min(start.y, end.y);

/**
 * Determine whether two finite segments touch or cross.
 *
 * @remarks
 * This handles both the normal crossing case and collinear endpoint overlap,
 * which matters for eraser strokes that travel directly along a drawing stroke.
 */
const doSegmentsIntersect = (
	[firstStart, firstEnd]: Segment,
	[secondStart, secondEnd]: Segment,
): boolean => {
	const firstOrientation = orientation(firstStart, firstEnd, secondStart);
	const secondOrientation = orientation(firstStart, firstEnd, secondEnd);
	const thirdOrientation = orientation(secondStart, secondEnd, firstStart);
	const fourthOrientation = orientation(secondStart, secondEnd, firstEnd);

	if (
		((firstOrientation > 0 && secondOrientation < 0) ||
			(firstOrientation < 0 && secondOrientation > 0)) &&
		((thirdOrientation > 0 && fourthOrientation < 0) ||
			(thirdOrientation < 0 && fourthOrientation > 0))
	) {
		return true;
	}

	return (
		(firstOrientation === 0 &&
			isPointOnSegment(secondStart, [firstStart, firstEnd])) ||
		(secondOrientation === 0 &&
			isPointOnSegment(secondEnd, [firstStart, firstEnd])) ||
		(thirdOrientation === 0 &&
			isPointOnSegment(firstStart, [secondStart, secondEnd])) ||
		(fourthOrientation === 0 &&
			isPointOnSegment(firstEnd, [secondStart, secondEnd]))
	);
};

/**
 * Measure the shortest distance between two finite segments.
 *
 * @remarks
 * Intersecting segments have zero distance. Otherwise, the minimum must occur
 * between one segment endpoint and the opposite segment.
 */
const distanceBetweenSegments = (
	firstSegment: Segment,
	secondSegment: Segment,
): number => {
	if (doSegmentsIntersect(firstSegment, secondSegment)) {
		return 0;
	}

	const [firstStart, firstEnd] = firstSegment;
	const [secondStart, secondEnd] = secondSegment;

	return Math.min(
		distanceFromPointToSegment(firstStart, secondSegment),
		distanceFromPointToSegment(firstEnd, secondSegment),
		distanceFromPointToSegment(secondStart, firstSegment),
		distanceFromPointToSegment(secondEnd, firstSegment),
	);
};

/**
 * Convert a stroke's point list into finite segments for hit testing.
 *
 * @remarks
 * Single-point strokes are represented as degenerate segments so dots can be
 * erased with the same distance logic as multi-point strokes.
 */
const strokeSegments = (stroke: CanvasPath): Segment[] =>
	stroke.paths.length > 1
		? stroke.paths
				.slice(1)
				.map((point, index) => [stroke.paths[index] as Point, point])
		: stroke.paths.map((point) => [point, point]);

type BoundingBox = {
	minX: number;
	maxX: number;
	minY: number;
	maxY: number;
};

function getBoundingBox(stroke: CanvasPath, padding: number): BoundingBox {
	let minX = Number.POSITIVE_INFINITY;
	let maxX = Number.NEGATIVE_INFINITY;
	let minY = Number.POSITIVE_INFINITY;
	let maxY = Number.NEGATIVE_INFINITY;

	for (const point of stroke.paths) {
		if (point.x < minX) minX = point.x;
		if (point.x > maxX) maxX = point.x;
		if (point.y < minY) minY = point.y;
		if (point.y > maxY) maxY = point.y;
	}

	return {
		minX: minX - padding,
		maxX: maxX + padding,
		minY: minY - padding,
		maxY: maxY + padding,
	};
}

function doBoundingBoxesOverlap(a: BoundingBox, b: BoundingBox): boolean {
	return (
		a.minX <= b.maxX && a.maxX >= b.minX && a.minY <= b.maxY && a.maxY >= b.minY
	);
}

/**
 * Check whether a stroke-mode eraser gesture intersects a drawing stroke.
 *
 * @remarks
 * The eraser is treated as a swept stroke. A drawing stroke is affected when
 * any point or segment is within half the eraser width plus half the target
 * stroke width, including single-point dot strokes.
 */
export function doesEraserStrokeHitStroke({
	eraser,
	stroke,
}: DoesEraserStrokeHitStrokeParams): DoesEraserStrokeHitStrokeReturns {
	if (eraser.paths.length === 0 || stroke.paths.length === 0) {
		return false;
	}

	const threshold = eraser.strokeWidth / 2 + stroke.strokeWidth / 2;

	const eraserBox = getBoundingBox(eraser, eraser.strokeWidth / 2);
	const strokeBox = getBoundingBox(stroke, stroke.strokeWidth / 2);
	if (!doBoundingBoxesOverlap(eraserBox, strokeBox)) {
		return false;
	}

	const eraserSegments = strokeSegments(eraser);
	const targetSegments = strokeSegments(stroke);

	return eraserSegments.some((eraserSegment) =>
		targetSegments.some(
			(targetSegment) =>
				distanceBetweenSegments(eraserSegment, targetSegment) <= threshold,
		),
	);
}
