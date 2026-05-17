import type { CanvasPath, Point } from "../../types";

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
		strokeColor: drawMode ? strokeColor : "#000000",
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
 * Add a point to the most recent stroke without mutating existing path arrays.
 */
export function appendPointToLastStroke(
	paths: CanvasPath[],
	point: Point,
): CanvasPath[] {
	const currentStroke = paths.slice(-1)[0];

	if (!currentStroke) {
		return paths;
	}

	const updatedStroke = {
		...currentStroke,
		paths: [...currentStroke.paths, point],
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
