import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SvgPath, bezierCommand, line } from "../../src/Paths";

describe("Paths helpers", () => {
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

describe("SvgPath", () => {
	it("renders a circle for a single-point stroke", () => {
		render(
			<svg aria-hidden="true">
				<SvgPath
					id="single-point"
					paths={[{ x: 12, y: 24 }]}
					strokeColor="blue"
					strokeWidth={8}
				/>
			</svg>,
		);

		const circle = document.querySelector("circle#single-point");

		expect(circle).toBeInstanceOf(SVGCircleElement);
		expect(circle?.getAttribute("cx")).toBe("12");
		expect(circle?.getAttribute("cy")).toBe("24");
		expect(circle?.getAttribute("r")).toBe("4");
		expect(circle?.getAttribute("fill")).toBe("blue");
	});

	it("renders a path for a multi-point stroke", () => {
		render(
			<svg aria-hidden="true">
				<SvgPath
					id="multi-point"
					paths={[
						{ x: 0, y: 0 },
						{ x: 10, y: 0 },
					]}
					strokeColor="red"
					strokeWidth={6}
					command={(point) => `L ${point.x},${point.y}`}
				/>
			</svg>,
		);

		const path = document.querySelector("path#multi-point");

		expect(path).toBeInstanceOf(SVGPathElement);
		expect(path?.getAttribute("d")).toBe("M 0,0 L 10,0");
		expect(path?.getAttribute("stroke")).toBe("red");
		expect(path?.getAttribute("stroke-width")).toBe("6");
		expect(path?.getAttribute("fill")).toBe("none");
	});
});
