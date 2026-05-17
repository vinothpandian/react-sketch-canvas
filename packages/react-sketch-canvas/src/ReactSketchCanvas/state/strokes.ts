import type { CanvasPath, Point } from "../../types";

type CreateStrokeOptions = {
	point: Point;
	drawMode: boolean;
	strokeColor: string;
	strokeWidth: number;
	eraserWidth: number;
	withTimestamp: boolean;
	now: number;
};

export function createStroke({
	point,
	drawMode,
	strokeColor,
	strokeWidth,
	eraserWidth,
	withTimestamp,
	now,
}: CreateStrokeOptions): CanvasPath {
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
