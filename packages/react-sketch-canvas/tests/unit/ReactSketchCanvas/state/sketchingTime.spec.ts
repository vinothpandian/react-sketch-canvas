import { describe, expect, it } from "vitest";
import { getSketchingTime } from "../../../../src/ReactSketchCanvas/state/sketchingTime";

describe("getSketchingTime", () => {
	it("sums timestamp durations and treats missing timestamps as zero", () => {
		expect(
			getSketchingTime([
				{
					drawMode: true,
					strokeColor: "red",
					strokeWidth: 4,
					paths: [{ x: 0, y: 0 }],
					startTimestamp: 100,
					endTimestamp: 250,
				},
				{
					drawMode: true,
					strokeColor: "blue",
					strokeWidth: 4,
					paths: [{ x: 1, y: 1 }],
				},
			]),
		).toBe(150);
	});
});
