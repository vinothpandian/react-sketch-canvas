import { createEvent, fireEvent, render } from "@testing-library/react";
import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { useCanvasPointerHandlers } from "../../../src/Canvas/hooks/useCanvasPointerHandlers";
import type { AllowOnlyPointerType } from "../../../src/Canvas/types";
import type { Point } from "../../../src/types";

type HarnessProps = {
	isDrawing?: boolean;
	allowOnlyPointerType?: AllowOnlyPointerType;
	onPointerDown?: (point: Point, isEraser?: boolean) => void;
	onPointerMove?: (point: Point) => void;
	onPointerUp?: () => void;
};

function Harness({
	isDrawing = false,
	allowOnlyPointerType = "all",
	onPointerDown = vi.fn(),
	onPointerMove = vi.fn(),
	onPointerUp = vi.fn(),
}: HarnessProps) {
	const canvasRef = React.useRef<HTMLDivElement>(null);
	const canvasSizeRef = React.useRef<{ width: number; height: number } | null>(
		null,
	);
	const handlers = useCanvasPointerHandlers({
		canvasRef,
		canvasSizeRef,
		isDrawing,
		allowOnlyPointerType,
		onPointerDown,
		onPointerMove,
		onPointerUp,
	});

	React.useEffect(() => {
		if (!canvasRef.current) return;
		canvasRef.current.getBoundingClientRect = () =>
			({
				left: 10,
				top: 20,
				width: 300,
				height: 200,
			}) as DOMRect;
	}, []);

	return (
		<div
			data-testid="canvas"
			ref={canvasRef}
			onPointerDown={handlers.handlePointerDown}
			onPointerMove={handlers.handlePointerMove}
			onPointerUp={handlers.handlePointerUp}
		/>
	);
}

describe("useCanvasPointerHandlers", () => {
	it("normalizes pointer down into a canvas point", () => {
		const onPointerDown = vi.fn();
		const { getByTestId } = render(<Harness onPointerDown={onPointerDown} />);

		const event = createEvent.pointerDown(getByTestId("canvas"), {
			pointerType: "mouse",
			button: 0,
			buttons: 1,
		});
		Object.defineProperties(event, {
			pageX: { value: 40 },
			pageY: { value: 70 },
		});

		fireEvent(getByTestId("canvas"), event);

		expect(onPointerDown).toHaveBeenCalledWith({ x: 30, y: 50 }, false);
	});

	it("does not move when drawing is false", () => {
		const onPointerMove = vi.fn();
		const { getByTestId } = render(<Harness onPointerMove={onPointerMove} />);

		fireEvent.pointerMove(getByTestId("canvas"), {
			pointerType: "mouse",
			pageX: 40,
			pageY: 70,
		});

		expect(onPointerMove).not.toHaveBeenCalled();
	});

	it("ignores pointer down events from disallowed pointer types", () => {
		const onPointerDown = vi.fn();
		const { getByTestId } = render(
			<Harness allowOnlyPointerType="pen" onPointerDown={onPointerDown} />,
		);

		fireEvent.pointerDown(getByTestId("canvas"), {
			pointerType: "mouse",
			button: 0,
			buttons: 1,
		});

		expect(onPointerDown).not.toHaveBeenCalled();
	});

	it("normalizes pointer move while drawing", () => {
		const onPointerMove = vi.fn();
		const { getByTestId } = render(
			<Harness isDrawing onPointerMove={onPointerMove} />,
		);

		const event = createEvent.pointerMove(getByTestId("canvas"), {
			pointerType: "mouse",
		});
		Object.defineProperties(event, {
			pageX: { value: 42 },
			pageY: { value: 64 },
		});

		fireEvent(getByTestId("canvas"), event);

		expect(onPointerMove).toHaveBeenCalledWith({ x: 32, y: 44 });
	});

	it("wires document pointerup", () => {
		const onPointerUp = vi.fn();
		render(<Harness onPointerUp={onPointerUp} />);

		fireEvent.pointerUp(document, { pointerType: "mouse", button: 0 });

		expect(onPointerUp).toHaveBeenCalledOnce();
	});
});
