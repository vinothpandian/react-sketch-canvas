import { act, render } from "@testing-library/react";
import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { useSketchCanvasController } from "../../../src/ReactSketchCanvas/hooks/useSketchCanvasController";
import type { CanvasPath, Point } from "../../../src/types";

type ControllerSnapshot = ReturnType<typeof useSketchCanvasController>;

function Harness({
	onReady,
	onChange = vi.fn(),
	onStroke = vi.fn(),
	eraserMode = "mask",
}: {
	onReady: (controller: ControllerSnapshot) => void;
	onChange?: (paths: CanvasPath[]) => void;
	onStroke?: (path: CanvasPath, isEraser: boolean) => void;
	eraserMode?: "mask" | "stroke";
}) {
	const controller = useSketchCanvasController({
		strokeColor: "red",
		strokeWidth: 4,
		eraserWidth: 8,
		eraserMode,
		withTimestamp: false,
		onChange,
		onStroke,
	});

	React.useEffect(() => {
		onReady(controller);
	}, [controller, onReady]);

	return null;
}

describe("useSketchCanvasController", () => {
	it("creates and extends a stroke from pointer events", () => {
		let controller: ControllerSnapshot | undefined;
		const onReady = vi.fn((next: ControllerSnapshot) => {
			controller = next;
		});

		render(<Harness onReady={onReady} />);

		act(() => {
			controller?.handlePointerDown({ x: 1, y: 2 } satisfies Point);
		});
		act(() => {
			controller?.handlePointerMove({ x: 3, y: 4 } satisfies Point);
		});

		expect(controller?.currentPaths).toEqual([
			{
				drawMode: true,
				strokeColor: "red",
				strokeWidth: 4,
				paths: [
					{ x: 1, y: 2 },
					{ x: 3, y: 4 },
				],
			},
		]);
	});

	it("uses eraser stroke settings for eraser input", () => {
		let controller: ControllerSnapshot | undefined;
		render(
			<Harness
				onReady={(next) => {
					controller = next;
				}}
			/>,
		);

		act(() => {
			controller?.handlePointerDown({ x: 1, y: 2 }, true);
		});

		expect(controller?.currentPaths[0]).toMatchObject({
			drawMode: false,
			strokeColor: "#000000",
			strokeWidth: 8,
		});
	});

	it("reports each completed stroke once", async () => {
		let controller: ControllerSnapshot | undefined;
		const onStroke = vi.fn();

		render(
			<Harness
				onStroke={onStroke}
				onReady={(next) => {
					controller = next;
				}}
			/>,
		);

		act(() => {
			controller?.handlePointerDown({ x: 0, y: 0 });
		});
		act(() => {
			controller?.handlePointerMove({ x: 10, y: 0 });
		});
		act(() => {
			controller?.handlePointerUp();
		});
		await act(async () => {
			await Promise.resolve();
		});

		expect(onStroke).toHaveBeenCalledTimes(1);

		act(() => {
			controller?.handlePointerDown({ x: 0, y: 20 });
		});
		await act(async () => {
			await Promise.resolve();
		});

		expect(onStroke).toHaveBeenCalledTimes(1);

		act(() => {
			controller?.handlePointerMove({ x: 10, y: 20 });
		});
		act(() => {
			controller?.handlePointerUp();
		});
		await act(async () => {
			await Promise.resolve();
		});

		expect(onStroke).toHaveBeenCalledTimes(2);
	});

	it("deletes affected draw strokes in stroke eraser mode without persisting the eraser path", async () => {
		let controller: ControllerSnapshot | undefined;
		const onChange = vi.fn();
		const onStroke = vi.fn();

		render(
			<Harness
				eraserMode="stroke"
				onChange={onChange}
				onStroke={onStroke}
				onReady={(next) => {
					controller = next;
				}}
			/>,
		);

		act(() => {
			controller?.handlePointerDown({ x: 0, y: 0 });
			controller?.handlePointerMove({ x: 20, y: 0 });
			controller?.handlePointerUp();
		});
		act(() => {
			controller?.handlePointerDown({ x: 0, y: 30 });
			controller?.handlePointerMove({ x: 20, y: 30 });
			controller?.handlePointerUp();
		});
		act(() => {
			controller?.setEraseMode(true);
		});
		act(() => {
			controller?.handlePointerDown({ x: 10, y: -5 });
			controller?.handlePointerMove({ x: 10, y: 5 });
		});
		act(() => {
			controller?.handlePointerUp();
		});
		await act(async () => {
			await Promise.resolve();
		});

		expect(controller?.currentPaths).toHaveLength(1);
		expect(controller?.currentPaths[0]?.paths).toEqual([
			{ x: 0, y: 30 },
			{ x: 20, y: 30 },
		]);
		expect(controller?.currentPaths.every((path) => path.drawMode)).toBe(true);
		expect(onChange).toHaveBeenLastCalledWith([
			{
				drawMode: true,
				strokeColor: "red",
				strokeWidth: 4,
				paths: [
					{ x: 0, y: 30 },
					{ x: 20, y: 30 },
				],
			},
		]);
		expect(onStroke).toHaveBeenLastCalledWith(
			expect.objectContaining({
				drawMode: false,
				paths: [
					{ x: 10, y: -5 },
					{ x: 10, y: 5 },
				],
			}),
			true,
		);
	});

	it("undoes and redoes stroke eraser deletions as one operation", async () => {
		let controller: ControllerSnapshot | undefined;

		render(
			<Harness
				eraserMode="stroke"
				onReady={(next) => {
					controller = next;
				}}
			/>,
		);

		act(() => {
			controller?.handlePointerDown({ x: 0, y: 0 });
			controller?.handlePointerMove({ x: 20, y: 0 });
			controller?.handlePointerUp();
		});
		act(() => {
			controller?.setEraseMode(true);
		});
		act(() => {
			controller?.handlePointerDown({ x: 10, y: -5 });
			controller?.handlePointerMove({ x: 10, y: 5 });
			controller?.handlePointerUp();
		});

		expect(controller?.currentPaths).toHaveLength(0);

		await act(async () => {
			controller?.enqueueOperation({ type: "undo" });
			await Promise.resolve();
		});
		expect(controller?.currentPaths).toHaveLength(1);

		await act(async () => {
			controller?.enqueueOperation({ type: "redo" });
			await Promise.resolve();
		});
		expect(controller?.currentPaths).toHaveLength(0);
	});
});
