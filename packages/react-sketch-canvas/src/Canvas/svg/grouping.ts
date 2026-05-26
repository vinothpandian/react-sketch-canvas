import type { CanvasPath } from "../../types";

/**
 * Return only eraser strokes from an ordered path list.
 *
 * @remarks
 * Eraser strokes are represented as normal paths with `drawMode` set to
 * `false`. Rendering code uses this list to build SVG masks.
 */
export const getEraserPaths = (paths: CanvasPath[]): CanvasPath[] =>
	paths.filter((path) => !path.drawMode);

/**
 * Split drawing strokes into groups separated by eraser strokes.
 *
 * @remarks
 * Each group is rendered with the eraser mask that corresponds to its position
 * in the full path sequence. Empty groups are retained so mask indexes stay in
 * sync with eraser indexes.
 */
export const getPathGroups = (paths: CanvasPath[]): CanvasPath[][] => {
	const pathGroups: CanvasPath[][] = [[]];
	let currentGroup = pathGroups[0];

	for (const path of paths) {
		if (!path.drawMode) {
			currentGroup = [];
			pathGroups.push(currentGroup);
			continue;
		}

		currentGroup.push(path);
	}

	while (
		pathGroups.length > 1 &&
		pathGroups[pathGroups.length - 1].length === 0
	) {
		pathGroups.pop();
	}

	return pathGroups;
};
