import type { CanvasPath } from "../../types";

/**
 * Sum active drawing time from timestamped paths.
 *
 * @remarks
 * Missing timestamps count as zero so callers can safely pass mixed imported
 * path data. Public callers should enable `withTimestamp` before drawing if
 * they need a meaningful result.
 */
export function getSketchingTime(paths: CanvasPath[]): number {
	return paths.reduce((totalSketchingTime, path) => {
		const startTimestamp = path.startTimestamp ?? 0;
		const endTimestamp = path.endTimestamp ?? 0;

		return totalSketchingTime + (endTimestamp - startTimestamp);
	}, 0);
}
