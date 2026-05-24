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
	canvasRefOverride,
	undo = vi.fn(),
	redo = vi.fn(),
	clearCanvas = vi.fn(),
	loadPaths = vi.fn(),
	resetCanvas = vi.fn(),
	setEraseMode = vi.fn(),
}: {
	forwardedRef: React.RefObject<ReactSketchCanvasRef | null>;
	withTimestamp?: boolean;
	canvasRefOverride?: CanvasRef | null;
	undo?: () => void;
	redo?: () => void;
	clearCanvas?: () => void;
	loadPaths?: (paths: CanvasPath[]) => void;
	resetCanvas?: () => void;
	setEraseMode?: (erase: boolean) => void;
}) {
	const canvasRef = React.useRef<CanvasRef | null>(
		canvasRefOverride === undefined ? canvasApi : canvasRefOverride,
	);
	useSketchCanvasImperativeHandle(forwardedRef, {
		canvasRef,
		currentPaths: [path],
		withTimestamp,
		setEraseMode,
		undo,
		redo,
		clearCanvas,
		loadPaths,
		resetCanvas,
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

	it("throws export errors when the low-level canvas ref is not ready", async () => {
		const ref = React.createRef<ReactSketchCanvasRef>();
		render(<Harness forwardedRef={ref} canvasRefOverride={null} />);

		expect(() => ref.current?.exportImage("png")).toThrow(
			"Export function called before canvas loaded",
		);
		await expect(ref.current?.exportSvg()).rejects.toThrow(
			"Export function called before canvas loaded",
		);
	});

	it("maps imperative state methods to controller operations", () => {
		const ref = React.createRef<ReactSketchCanvasRef>();
		const undo = vi.fn();
		const redo = vi.fn();
		const clearCanvas = vi.fn();
		const loadPaths = vi.fn();
		const resetCanvas = vi.fn();
		const setEraseMode = vi.fn();
		render(
			<Harness
				forwardedRef={ref}
				undo={undo}
				redo={redo}
				clearCanvas={clearCanvas}
				loadPaths={loadPaths}
				resetCanvas={resetCanvas}
				setEraseMode={setEraseMode}
			/>,
		);

		ref.current?.eraseMode(true);
		ref.current?.clearCanvas();
		ref.current?.undo();
		ref.current?.redo();
		ref.current?.loadPaths([path]);
		ref.current?.resetCanvas();

		expect(setEraseMode).toHaveBeenCalledWith(true);
		expect(clearCanvas).toHaveBeenCalledOnce();
		expect(undo).toHaveBeenCalledOnce();
		expect(redo).toHaveBeenCalledOnce();
		expect(loadPaths).toHaveBeenCalledWith([path]);
		expect(resetCanvas).toHaveBeenCalledOnce();
	});
});
