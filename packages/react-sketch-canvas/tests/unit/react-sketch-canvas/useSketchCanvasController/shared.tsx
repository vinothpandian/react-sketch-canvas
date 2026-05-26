import * as React from "react";
import { vi } from "vitest";
import { useSketchCanvasController } from "../../../../src/ReactSketchCanvas/hooks/useSketchCanvasController";
import type { CanvasPath } from "../../../../src/types";

export type ControllerSnapshot = ReturnType<typeof useSketchCanvasController>;

export function collectAnimationFrames() {
	const animationFrames: FrameRequestCallback[] = [];
	const requestAnimationFrame = vi
		.spyOn(window, "requestAnimationFrame")
		.mockImplementation((callback) => {
			animationFrames.push(callback);
			return animationFrames.length;
		});

	return { animationFrames, requestAnimationFrame };
}

export function Harness({
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
