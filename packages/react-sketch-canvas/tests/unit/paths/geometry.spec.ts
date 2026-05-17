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

		expect(command.startsWith("C ")).toBe(true);
		expect(command.endsWith(" 10, 0")).toBe(true);
		expect(command).toMatch(/^C [^ ]+ [^ ]+ 10, 0$/);
	});
});
