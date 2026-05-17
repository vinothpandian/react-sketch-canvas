import { describe, expect, it } from "vitest";
import { bezierCommand, line } from "../../../src/Paths/geometry";

describe("Paths geometry", () => {
	it("measures the length and angle between two points", () => {
		const segment = line({ x: 0, y: 0 }, { x: 3, y: 4 });

		expect(segment.length).toBe(5);
		expect(segment.angle).toBeCloseTo(Math.atan2(4, 3));
	});

	it("builds a smooth cubic bezier command from neighboring points", () => {
		const command = bezierCommand({ x: 10, y: 0 }, 1, [
			{ x: 0, y: 0 },
			{ x: 10, y: 0 },
			{ x: 20, y: 10 },
		]);

		expect(command).toBe("C 2,0 5.999999999999999,-1.9999999999999998 10, 0");
	});
});
