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
	let currentGroup = 0;

	return paths.reduce<CanvasPath[][]>(
		(arrayGroup, path) => {
			if (!path.drawMode) {
				currentGroup += 1;
				return arrayGroup;
			}

			if (arrayGroup[currentGroup] === undefined) {
				arrayGroup[currentGroup] = [];
			}

			arrayGroup[currentGroup].push(path);
			return arrayGroup;
		},
		[[]],
	);
};
