import * as React from "react";
import { useCallback } from "react";
import type { Point } from "../../types";
import type { AllowOnlyPointerType, CanvasProps } from "../types";

const ERASER_BUTTON_MASK = 32;

type PointerLike = {
	clientX: number;
	clientY: number;
};

type BoundsLike = {
	left: number;
	top: number;
	width: number;
	height: number;
};

type ElementSizeLike = {
	offsetWidth: number;
	offsetHeight: number;
};

type UseCanvasPointerHandlersParams = Pick<
	CanvasProps,
	| "isDrawing"
	| "allowOnlyPointerType"
	| "onPointerDown"
	| "onPointerMove"
	| "onPointerUp"
> & {
	canvasRef: React.RefObject<HTMLDivElement | null>;
};

type UseCanvasPointerHandlersReturns = {
	handlePointerDown: (event: React.PointerEvent<HTMLDivElement>) => void;
	handlePointerMove: (event: React.PointerEvent<HTMLDivElement>) => void;
	/**
	 * Bound to both `onPointerUp` and `onPointerCancel`: in either case the
	 * active stroke ends, since the pointer is no longer guaranteed to deliver
	 * further move events.
	 */
	finishActivePointer: (
		event: React.PointerEvent<HTMLDivElement> | PointerEvent,
	) => void;
};

/**
 * Check whether a pointer event matches the configured input device filter.
 */
export const isAllowedPointerType = (
	allowOnlyPointerType: AllowOnlyPointerType,
	pointerType: string,
): boolean =>
	allowOnlyPointerType === "all" || pointerType === allowOnlyPointerType;

/**
 * Ignore non-primary mouse buttons while allowing pen and touch pointer events.
 */
export const shouldHandlePointerButton = (
	pointerType: string,
	button: number,
): boolean => !(pointerType === "mouse" && button !== 0);

/**
 * Detect the barrel/eraser button used by pointer events from pen devices.
 */
export const isPenEraser = (pointerType: string, buttons: number): boolean =>
	pointerType === "pen" && (buttons & ERASER_BUTTON_MASK) !== 0;

/**
 * Convert a viewport-relative pointer coordinate into a canvas-relative point.
 *
 * @remarks
 * Both `clientX/clientY` and `getBoundingClientRect()` are viewport-relative,
 * so this single subtraction stays correct regardless of window or ancestor
 * scroll positions without us having to read `scrollX`/`scrollY` separately.
 *
 * `getBoundingClientRect()` reports post-transform screen pixels while the SVG
 * path coordinate system is in pre-transform CSS pixels. When an ancestor
 * applies `transform: scale()` the two diverge, so the visual delta is divided
 * by the rect-to-layout-size ratio to map the pointer back into the canvas's
 * own coordinate space.
 */
export const getCanvasPoint = (
	pointerEvent: PointerLike,
	boundingArea: BoundsLike,
	elementSize: ElementSizeLike,
): Point => {
	const scaleX =
		boundingArea.width > 0 && elementSize.offsetWidth > 0
			? elementSize.offsetWidth / boundingArea.width
			: 1;
	const scaleY =
		boundingArea.height > 0 && elementSize.offsetHeight > 0
			? elementSize.offsetHeight / boundingArea.height
			: 1;

	return {
		x: (pointerEvent.clientX - boundingArea.left) * scaleX,
		y: (pointerEvent.clientY - boundingArea.top) * scaleY,
	};
};

/**
 * Build stable pointer handlers for the low-level canvas.
 *
 * @remarks
 * The hook keeps DOM coordinate normalization, input filtering, and document
 * level `pointerup` handling out of the `Canvas` component.
 */
export function useCanvasPointerHandlers({
	canvasRef,
	isDrawing,
	allowOnlyPointerType,
	onPointerDown,
	onPointerMove,
	onPointerUp,
}: UseCanvasPointerHandlersParams): UseCanvasPointerHandlersReturns {
	const activePointerIdRef = React.useRef<number | null>(null);

	const getCoordinates = useCallback(
		(pointerEvent: React.PointerEvent<HTMLDivElement>): Point => {
			const canvas = canvasRef.current;
			const boundingArea = canvas?.getBoundingClientRect();

			if (!canvas || !boundingArea) {
				return { x: 0, y: 0 };
			}

			return getCanvasPoint(pointerEvent, boundingArea, canvas);
		},
		[canvasRef],
	);

	const isActivePointer = useCallback(
		(event: React.PointerEvent<HTMLDivElement> | PointerEvent): boolean =>
			activePointerIdRef.current === event.pointerId,
		[],
	);

	const preventNativeTouchScroll = useCallback(
		(event: React.PointerEvent<HTMLDivElement>): void => {
			if (event.pointerType !== "touch" || !event.cancelable) return;

			event.preventDefault();
		},
		[],
	);

	const finishActivePointer = useCallback(
		(event: React.PointerEvent<HTMLDivElement> | PointerEvent): void => {
			if (!isActivePointer(event)) return;

			activePointerIdRef.current = null;
			onPointerUp();
		},
		[isActivePointer, onPointerUp],
	);

	const handlePointerDown = useCallback(
		(event: React.PointerEvent<HTMLDivElement>): void => {
			if (!isAllowedPointerType(allowOnlyPointerType, event.pointerType))
				return;
			if (!shouldHandlePointerButton(event.pointerType, event.button)) return;

			if (activePointerIdRef.current !== null) {
				// A second pointer arrived mid-stroke (e.g. user moved from a single
				// finger to a two-finger gesture). End the active stroke so the
				// browser is free to interpret the gesture as a pan/zoom and so a
				// stale stroke does not record movement from the wrong pointer.
				activePointerIdRef.current = null;
				onPointerUp();
				return;
			}

			preventNativeTouchScroll(event);

			if (event.isTrusted) {
				event.currentTarget.setPointerCapture(event.pointerId);
			}

			activePointerIdRef.current = event.pointerId;
			onPointerDown(
				getCoordinates(event),
				isPenEraser(event.pointerType, event.buttons),
			);
		},
		[
			allowOnlyPointerType,
			getCoordinates,
			onPointerDown,
			onPointerUp,
			preventNativeTouchScroll,
		],
	);

	const handlePointerMove = useCallback(
		(event: React.PointerEvent<HTMLDivElement>): void => {
			if (!isDrawing) return;
			if (!isActivePointer(event)) return;

			preventNativeTouchScroll(event);
			onPointerMove(getCoordinates(event));
		},
		[
			getCoordinates,
			isActivePointer,
			isDrawing,
			onPointerMove,
			preventNativeTouchScroll,
		],
	);

	return {
		handlePointerDown,
		handlePointerMove,
		finishActivePointer,
	};
}
