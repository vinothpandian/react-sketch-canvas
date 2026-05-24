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
	const handlers = useCanvasPointerHandlers({
		canvasRef,
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
		canvasRef.current.setPointerCapture =
			canvasRef.current.setPointerCapture ?? vi.fn();
	}, []);

	return (
		<div
			data-testid="canvas"
			ref={canvasRef}
			onPointerCancel={handlers.handlePointerCancel}
			onPointerDown={handlers.handlePointerDown}
			onPointerMove={handlers.handlePointerMove}
			onPointerUp={handlers.handlePointerUp}
		/>
	);
}

describe("useCanvasPointerHandlers", () => {
	beforeEach(() => {
		vi.useRealTimers();
	});

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

	it("does not move an active pointer when drawing is false", () => {
		const onPointerMove = vi.fn();
		const requestAnimationFrame = vi.spyOn(window, "requestAnimationFrame");
		const { getByTestId } = render(<Harness onPointerMove={onPointerMove} />);
		const canvas = getByTestId("canvas");

		fireEvent.pointerDown(canvas, {
			pointerId: 4,
			pointerType: "mouse",
			button: 0,
			buttons: 1,
		});
		fireEvent.pointerMove(canvas, {
			pointerId: 4,
			pointerType: "mouse",
			pageX: 40,
			pageY: 70,
		});

		expect(requestAnimationFrame).not.toHaveBeenCalled();
		expect(onPointerMove).not.toHaveBeenCalled();
		requestAnimationFrame.mockRestore();
	});

	it("ignores pointer down events from disallowed pointer types", () => {
		const onPointerDown = vi.fn();
		const { getByTestId } = render(
			<Harness allowOnlyPointerType="pen" onPointerDown={onPointerDown} />,
		);

		const event = createEvent.pointerDown(getByTestId("canvas"), {
			pointerType: "mouse",
			button: 0,
			buttons: 1,
		});
		fireEvent(getByTestId("canvas"), event);

		expect(onPointerDown).not.toHaveBeenCalled();
	});

	it("captures accepted pointer input", () => {
		const { getByTestId } = render(<Harness />);
		const canvas = getByTestId("canvas");
		const setPointerCapture = vi.fn();
		Object.assign(canvas, { setPointerCapture });

		const event = createEvent.pointerDown(canvas, {
			pointerId: 11,
			pointerType: "pen",
			button: 0,
			buttons: 1,
		});
		Object.defineProperty(event, "isTrusted", { value: true });
		fireEvent(canvas, event);

		expect(setPointerCapture).toHaveBeenCalledWith(11);
	});

	it("normalizes pointer move while drawing", () => {
		const onPointerMove = vi.fn();
		const animationFrames: FrameRequestCallback[] = [];
		const requestAnimationFrame = vi
			.spyOn(window, "requestAnimationFrame")
			.mockImplementation((callback) => {
				animationFrames.push(callback);
				return animationFrames.length;
			});
		const { getByTestId } = render(
			<Harness isDrawing onPointerMove={onPointerMove} />,
		);
		fireEvent.pointerDown(getByTestId("canvas"), {
			pointerId: 4,
			pointerType: "mouse",
			button: 0,
			buttons: 1,
		});

		const event = createEvent.pointerMove(getByTestId("canvas"), {
			pointerId: 4,
			pointerType: "mouse",
		});
		Object.defineProperties(event, {
			pageX: { value: 42 },
			pageY: { value: 64 },
		});

		fireEvent(getByTestId("canvas"), event);

		expect(onPointerMove).not.toHaveBeenCalled();

		animationFrames[0]?.(performance.now());

		expect(onPointerMove).toHaveBeenCalledWith({ x: 32, y: 44 });
		requestAnimationFrame.mockRestore();
	});

	it("batches accepted pointer moves into the next animation frame without dropping points", () => {
		const onPointerMove = vi.fn();
		const animationFrames: FrameRequestCallback[] = [];
		const requestAnimationFrame = vi
			.spyOn(window, "requestAnimationFrame")
			.mockImplementation((callback) => {
				animationFrames.push(callback);
				return animationFrames.length;
			});
		const { getByTestId } = render(
			<Harness isDrawing onPointerMove={onPointerMove} />,
		);
		const canvas = getByTestId("canvas");

		fireEvent.pointerDown(canvas, {
			pointerId: 4,
			pointerType: "touch",
			button: 0,
			buttons: 1,
		});
		const firstMove = createEvent.pointerMove(canvas, {
			pointerId: 4,
			pointerType: "touch",
		});
		Object.defineProperties(firstMove, {
			pageX: { value: 42 },
			pageY: { value: 64 },
		});
		const secondMove = createEvent.pointerMove(canvas, {
			pointerId: 4,
			pointerType: "touch",
		});
		Object.defineProperties(secondMove, {
			pageX: { value: 44 },
			pageY: { value: 68 },
		});

		fireEvent(canvas, firstMove);
		fireEvent(canvas, secondMove);

		expect(animationFrames).toHaveLength(1);
		expect(onPointerMove).not.toHaveBeenCalled();

		animationFrames[0]?.(performance.now());

		expect(onPointerMove).toHaveBeenCalledTimes(2);
		expect(onPointerMove).toHaveBeenNthCalledWith(1, { x: 32, y: 44 });
		expect(onPointerMove).toHaveBeenNthCalledWith(2, { x: 34, y: 48 });
		requestAnimationFrame.mockRestore();
	});

	it("prevents native page scrolling for accepted touch drawing", () => {
		const { getByTestId } = render(<Harness />);
		const canvas = getByTestId("canvas");
		const event = createEvent.pointerDown(canvas, {
			pointerId: 3,
			pointerType: "touch",
			button: 0,
			buttons: 1,
			cancelable: true,
		});

		fireEvent(canvas, event);

		expect(event.defaultPrevented).toBe(true);
	});

	it("ignores moves from pointers that are not active", () => {
		const onPointerMove = vi.fn();
		const { getByTestId } = render(
			<Harness isDrawing onPointerMove={onPointerMove} />,
		);
		const canvas = getByTestId("canvas");

		fireEvent.pointerDown(canvas, {
			pointerId: 1,
			pointerType: "touch",
			button: 0,
			buttons: 1,
		});
		fireEvent.pointerDown(canvas, {
			pointerId: 2,
			pointerType: "touch",
			button: 0,
			buttons: 1,
		});
		fireEvent.pointerMove(canvas, {
			pointerId: 2,
			pointerType: "touch",
			pageX: 50,
			pageY: 80,
		});

		expect(onPointerMove).not.toHaveBeenCalled();
	});

	it("finishes the active pointer on canvas pointerup", () => {
		const onPointerUp = vi.fn();
		const { getByTestId } = render(<Harness onPointerUp={onPointerUp} />);
		const canvas = getByTestId("canvas");

		fireEvent.pointerDown(canvas, {
			pointerId: 1,
			pointerType: "mouse",
			button: 0,
			buttons: 1,
		});

		fireEvent.pointerUp(canvas, {
			pointerId: 1,
			pointerType: "mouse",
			button: 0,
		});

		expect(onPointerUp).toHaveBeenCalledOnce();
	});

	it("finishes the active pointer on canvas pointercancel", () => {
		const onPointerUp = vi.fn();
		const { getByTestId } = render(<Harness onPointerUp={onPointerUp} />);
		const canvas = getByTestId("canvas");

		fireEvent.pointerDown(canvas, {
			pointerId: 12,
			pointerType: "pen",
			button: 0,
			buttons: 1,
		});
		fireEvent.pointerCancel(canvas, {
			pointerId: 12,
			pointerType: "pen",
		});

		expect(onPointerUp).toHaveBeenCalledOnce();
	});

	it("leaves ignored touch input available for parent scroll in pen-only mode", () => {
		const onPointerDown = vi.fn();
		const { getByTestId } = render(
			<Harness allowOnlyPointerType="pen" onPointerDown={onPointerDown} />,
		);
		const event = createEvent.pointerDown(getByTestId("canvas"), {
			pointerId: 2,
			pointerType: "touch",
			button: 0,
			buttons: 1,
		});

		fireEvent(getByTestId("canvas"), event);

		expect(onPointerDown).not.toHaveBeenCalled();
	});

	it("finishes the accepted pointer when the allowed pointer type changes before pointerup", () => {
		const onPointerUp = vi.fn();
		const { getByTestId, rerender } = render(
			<Harness allowOnlyPointerType="all" onPointerUp={onPointerUp} />,
		);
		const canvas = getByTestId("canvas");

		fireEvent.pointerDown(canvas, {
			pointerId: 9,
			pointerType: "mouse",
			button: 0,
			buttons: 1,
		});

		rerender(<Harness allowOnlyPointerType="pen" onPointerUp={onPointerUp} />);

		fireEvent.pointerUp(canvas, {
			pointerId: 9,
			pointerType: "mouse",
			button: 0,
		});

		expect(onPointerUp).toHaveBeenCalledOnce();
	});

	it("finishes the accepted mouse pointer even when pointerup reports no changed button", () => {
		const onPointerUp = vi.fn();
		const { getByTestId } = render(<Harness onPointerUp={onPointerUp} />);
		const canvas = getByTestId("canvas");

		fireEvent.pointerDown(canvas, {
			pointerId: 10,
			pointerType: "mouse",
			button: 0,
			buttons: 1,
		});
		fireEvent.pointerUp(canvas, {
			pointerId: 10,
			pointerType: "mouse",
			button: -1,
		});

		expect(onPointerUp).toHaveBeenCalledOnce();
	});
});
