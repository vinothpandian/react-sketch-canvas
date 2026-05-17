import type { CanvasPath } from "../../types";

export const getEraserPaths = (paths: CanvasPath[]): CanvasPath[] =>
	paths.filter((path) => !path.drawMode);

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
