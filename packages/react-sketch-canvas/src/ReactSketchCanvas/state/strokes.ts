import type { CanvasPath, Point } from "../../types";
import { ERASER_MASK_STROKE_COLOR } from "../constants";

type CreateStrokeParams = {
	point: Point;
	drawMode: boolean;
	strokeColor: string;
	strokeWidth: number;
	eraserWidth: number;
	withTimestamp: boolean;
	now: number;
};

type CreateStrokeReturns = CanvasPath;

/**
 * Create the first path object for a new draw or erase stroke.
 *
 * @remarks
 * Eraser strokes are stored as black paths with `drawMode: false`; SVG mask
 * rendering interprets that shape as erased content later.
 */
export function createStroke({
	point,
	drawMode,
	strokeColor,
	strokeWidth,
	eraserWidth,
	withTimestamp,
	now,
}: CreateStrokeParams): CreateStrokeReturns {
	const stroke: CanvasPath = {
		drawMode,
		strokeColor: drawMode ? strokeColor : ERASER_MASK_STROKE_COLOR,
		strokeWidth: drawMode ? strokeWidth : eraserWidth,
		paths: [point],
	};

	if (!withTimestamp) {
		return stroke;
	}

	return {
		...stroke,
		startTimestamp: now,
		endTimestamp: 0,
	};
}

/**
 * Add points to the most recent stroke with one path array update.
 */
export function appendPointsToLastStroke(
	paths: CanvasPath[],
	points: Point[],
): CanvasPath[] {
	const currentStroke = paths[paths.length - 1];

	if (!currentStroke || points.length === 0) {
		return paths;
	}

	const nextPoints: Point[] = [];
	let previousPoint = currentStroke.paths[currentStroke.paths.length - 1];

	for (const point of points) {
		if (previousPoint?.x === point.x && previousPoint.y === point.y) {
			continue;
		}

		nextPoints.push(point);
		previousPoint = point;
	}

	if (nextPoints.length === 0) {
		return paths;
	}

	const updatedStroke = {
		...currentStroke,
		paths: [...currentStroke.paths, ...nextPoints],
	};

	return [...paths.slice(0, -1), updatedStroke];
}

/**
 * Mark the most recent stroke as complete when timestamp tracking is enabled.
 */
export function finishStroke(
	paths: CanvasPath[],
	withTimestamp: boolean,
	now: number,
): CanvasPath[] {
	if (!withTimestamp) return paths;

	const currentStroke = paths.slice(-1)?.[0] ?? null;
	if (currentStroke === null) return paths;

	const updatedStroke = {
		...currentStroke,
		endTimestamp: now,
	};

	return [...paths.slice(0, -1), updatedStroke];
}
