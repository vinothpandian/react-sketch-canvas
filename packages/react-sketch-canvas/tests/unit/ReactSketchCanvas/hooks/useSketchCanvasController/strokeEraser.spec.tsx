import { act, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { type ControllerSnapshot, Harness } from "./shared";

describe("useSketchCanvasController stroke eraser", () => {
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

		act(() => {
			controller?.undo();
		});
		expect(controller?.currentPaths).toHaveLength(1);

		act(() => {
			controller?.redo();
		});
		expect(controller?.currentPaths).toHaveLength(0);
	});

	it("does not add an undo step when a stroke eraser misses every draw stroke", async () => {
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
			controller?.handlePointerDown({ x: 100, y: 100 });
			controller?.handlePointerMove({ x: 120, y: 100 });
			controller?.handlePointerUp();
		});

		expect(controller?.currentPaths).toHaveLength(1);

		act(() => {
			controller?.undo();
		});
		expect(controller?.currentPaths).toHaveLength(0);
	});
});
