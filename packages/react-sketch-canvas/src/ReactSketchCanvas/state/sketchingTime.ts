import type { CanvasPath } from "../../types";

export function getSketchingTime(paths: CanvasPath[]): number {
	return paths.reduce((totalSketchingTime, path) => {
		const startTimestamp = path.startTimestamp ?? 0;
		const endTimestamp = path.endTimestamp ?? 0;

		return totalSketchingTime + (endTimestamp - startTimestamp);
	}, 0);
}
