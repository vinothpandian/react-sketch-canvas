import { render } from "@testing-library/react";
import * as React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const receivedRefs: Array<React.ForwardedRef<unknown>> = [];

vi.mock("../../../src/Canvas", () => ({
	Canvas: React.forwardRef((_props, ref) => {
		receivedRefs.push(ref);
		return <div data-testid="canvas-stub" />;
	}),
}));

describe("ReactSketchCanvas ref stability", () => {
	beforeEach(() => {
		receivedRefs.length = 0;
		vi.resetModules();
	});

	it("reuses the same low-level canvas ref across rerenders", async () => {
		const { ReactSketchCanvas } = await import(
			"../../../src/ReactSketchCanvas"
		);
		const { rerender } = render(
			<ReactSketchCanvas strokeColor="red" width="320px" height="180px" />,
		);

		rerender(
			<ReactSketchCanvas strokeColor="blue" width="320px" height="180px" />,
		);

		expect(receivedRefs).toHaveLength(2);
		expect(receivedRefs[0]).toBe(receivedRefs[1]);
	});
});
