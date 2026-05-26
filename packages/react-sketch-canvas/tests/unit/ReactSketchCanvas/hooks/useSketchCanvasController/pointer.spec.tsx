import { act, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { Point } from "../../../../../src/types";
import {
	type ControllerSnapshot,
	collectAnimationFrames,
	Harness,
} from "./shared";

describe("useSketchCanvasController pointer input", () => {
	it("creates and extends a stroke from pointer events", () => {
		const { animationFrames, requestAnimationFrame } = collectAnimationFrames();
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

		expect(controller?.currentPaths[0]?.paths).toEqual([{ x: 1, y: 2 }]);

		act(() => {
			animationFrames[0]?.(performance.now());
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
		expect(requestAnimationFrame).toHaveBeenCalledOnce();
		requestAnimationFrame.mockRestore();
	});

	it("batches multiple pointer moves into one frame-level state update", () => {
		const { animationFrames, requestAnimationFrame } = collectAnimationFrames();
		let controller: ControllerSnapshot | undefined;

		render(
			<Harness
				onReady={(next) => {
					controller = next;
				}}
			/>,
		);

		act(() => {
			controller?.handlePointerDown({ x: 1, y: 2 });
		});
		act(() => {
			controller?.handlePointerMove({ x: 3, y: 4 });
			controller?.handlePointerMove({ x: 5, y: 6 });
		});

		expect(controller?.currentPaths[0]?.paths).toEqual([{ x: 1, y: 2 }]);
		expect(requestAnimationFrame).toHaveBeenCalledOnce();

		act(() => {
			animationFrames[0]?.(performance.now());
		});

		expect(controller?.currentPaths[0]?.paths).toEqual([
			{ x: 1, y: 2 },
			{ x: 3, y: 4 },
			{ x: 5, y: 6 },
		]);
		requestAnimationFrame.mockRestore();
	});

	it("flushes queued pointer moves before finishing a stroke", async () => {
		const { requestAnimationFrame } = collectAnimationFrames();
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
			controller?.handlePointerDown({ x: 1, y: 2 });
			controller?.handlePointerMove({ x: 3, y: 4 });
			controller?.handlePointerMove({ x: 5, y: 6 });
			controller?.handlePointerUp();
		});
		await act(async () => {
			await Promise.resolve();
		});

		expect(controller?.currentPaths[0]?.paths).toEqual([
			{ x: 1, y: 2 },
			{ x: 3, y: 4 },
			{ x: 5, y: 6 },
		]);
		expect(onStroke).toHaveBeenLastCalledWith(
			expect.objectContaining({
				paths: [
					{ x: 1, y: 2 },
					{ x: 3, y: 4 },
					{ x: 5, y: 6 },
				],
			}),
			false,
		);
		expect(requestAnimationFrame).toHaveBeenCalledOnce();
		requestAnimationFrame.mockRestore();
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
});
