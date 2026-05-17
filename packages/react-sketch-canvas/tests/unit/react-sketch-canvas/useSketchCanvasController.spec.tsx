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
}: {
	onReady: (controller: ControllerSnapshot) => void;
	onChange?: (paths: CanvasPath[]) => void;
	onStroke?: (path: CanvasPath, isEraser: boolean) => void;
}) {
	const controller = useSketchCanvasController({
		strokeColor: "red",
		strokeWidth: 4,
		eraserWidth: 8,
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
});
