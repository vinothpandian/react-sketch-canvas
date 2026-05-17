import { render } from "@testing-library/react";
import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import type { CanvasRef } from "../../../src/Canvas/types";
import { useSketchCanvasImperativeHandle } from "../../../src/ReactSketchCanvas/hooks/useSketchCanvasImperativeHandle";
import type { ReactSketchCanvasRef } from "../../../src/ReactSketchCanvas/types";
import type { CanvasPath } from "../../../src/types";

const path: CanvasPath = {
	drawMode: true,
	strokeColor: "red",
	strokeWidth: 4,
	paths: [{ x: 0, y: 0 }],
	startTimestamp: 10,
	endTimestamp: 30,
};

const canvasApi: CanvasRef = {
	exportImage: vi.fn(async () => "data:image/png;base64,abc"),
	exportSvg: vi.fn(async () => "<svg></svg>"),
};

function Harness({
	forwardedRef,
	withTimestamp = true,
}: {
	forwardedRef: React.RefObject<ReactSketchCanvasRef>;
	withTimestamp?: boolean;
}) {
	const canvasRef = React.useRef<CanvasRef>(canvasApi);
	useSketchCanvasImperativeHandle(forwardedRef, {
		canvasRef,
		currentPaths: [path],
		withTimestamp,
		setEraseMode: vi.fn(),
		enqueueOperation: vi.fn(),
		resetCanvas: vi.fn(),
	});
	return null;
}

describe("useSketchCanvasImperativeHandle", () => {
	it("exposes export methods and current paths", async () => {
		const ref = React.createRef<ReactSketchCanvasRef>();
		render(<Harness forwardedRef={ref} />);

		await expect(ref.current?.exportImage("png")).resolves.toBe(
			"data:image/png;base64,abc",
		);
		await expect(ref.current?.exportSvg()).resolves.toBe("<svg></svg>");
		await expect(ref.current?.exportPaths()).resolves.toEqual([path]);
		await expect(ref.current?.getSketchingTime()).resolves.toBe(20);
	});

	it("rejects sketching time when timestamps are disabled", async () => {
		const ref = React.createRef<ReactSketchCanvasRef>();
		render(<Harness forwardedRef={ref} withTimestamp={false} />);

		await expect(ref.current?.getSketchingTime()).rejects.toThrow(
			"Set 'withTimestamp' prop to get sketching time",
		);
	});
});
