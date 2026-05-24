import * as React from "react";
import { useCallback } from "react";
import type { Point } from "../../types";
import type { AllowOnlyPointerType, CanvasProps } from "../types";

const ERASER_BUTTON_MASK = 32;

type PointerLike = {
	pageX: number;
	pageY: number;
};

type BoundsLike = {
	left: number;
	top: number;
};

type ScrollLike = {
	scrollX: number;
	scrollY: number;
};

type CanvasSizeRef = React.MutableRefObject<{
	width: number;
	height: number;
} | null>;

type UseCanvasPointerHandlersParams = Pick<
	CanvasProps,
	| "isDrawing"
	| "allowOnlyPointerType"
	| "onPointerDown"
	| "onPointerMove"
	| "onPointerUp"
> & {
	canvasRef: React.RefObject<HTMLDivElement | null>;
	canvasSizeRef: CanvasSizeRef;
};

type UseCanvasPointerHandlersReturns = {
	handlePointerDown: (event: React.PointerEvent<HTMLDivElement>) => void;
	handlePointerMove: (event: React.PointerEvent<HTMLDivElement>) => void;
	handlePointerUp: (
		event: React.PointerEvent<HTMLDivElement> | PointerEvent,
	) => void;
	handlePointerCancel: (
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
	pointerType === "pen" && Math.floor(buttons / ERASER_BUTTON_MASK) % 2 === 1;

/**
 * Convert a page-level pointer coordinate into a canvas-relative point.
 */
export const getCanvasPoint = (
	pointerEvent: PointerLike,
	boundingArea: BoundsLike,
	scroll: ScrollLike,
): Point => ({
	x: pointerEvent.pageX - boundingArea.left - scroll.scrollX,
	y: pointerEvent.pageY - boundingArea.top - scroll.scrollY,
});

/**
 * Build stable pointer handlers for the low-level canvas.
 *
 * @remarks
 * The hook keeps DOM coordinate normalization, input filtering, and document
 * level `pointerup` handling out of the `Canvas` component. It also records the
 * latest canvas size so viewBox export can mirror the rendered dimensions.
 */
export function useCanvasPointerHandlers({
	canvasRef,
	canvasSizeRef,
	isDrawing,
	allowOnlyPointerType,
	onPointerDown,
	onPointerMove,
	onPointerUp,
}: UseCanvasPointerHandlersParams): UseCanvasPointerHandlersReturns {
	const activePointerIdRef = React.useRef<number | null>(null);

	const getCoordinates = useCallback(
		(pointerEvent: React.PointerEvent<HTMLDivElement>): Point => {
			const boundingArea = canvasRef.current?.getBoundingClientRect();
			canvasSizeRef.current = boundingArea
				? { width: boundingArea.width, height: boundingArea.height }
				: null;

			if (!boundingArea) {
				return { x: 0, y: 0 };
			}

			return getCanvasPoint(pointerEvent, boundingArea, {
				scrollX: window.scrollX ?? 0,
				scrollY: window.scrollY ?? 0,
			});
		},
		[canvasRef, canvasSizeRef],
	);

	const isActivePointer = useCallback(
		(event: React.PointerEvent<HTMLDivElement> | PointerEvent): boolean =>
			activePointerIdRef.current === event.pointerId,
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
			if (activePointerIdRef.current !== null) return;
			if (!isAllowedPointerType(allowOnlyPointerType, event.pointerType))
				return;
			if (!shouldHandlePointerButton(event.pointerType, event.button)) return;

			if (event.isTrusted) {
				event.currentTarget.setPointerCapture(event.pointerId);
			}

			activePointerIdRef.current = event.pointerId;
			onPointerDown(
				getCoordinates(event),
				isPenEraser(event.pointerType, event.buttons),
			);
		},
		[allowOnlyPointerType, getCoordinates, onPointerDown],
	);

	const handlePointerMove = useCallback(
		(event: React.PointerEvent<HTMLDivElement>): void => {
			if (!isDrawing) return;
			if (!isActivePointer(event)) return;

			onPointerMove(getCoordinates(event));
		},
		[getCoordinates, isActivePointer, isDrawing, onPointerMove],
	);

	return {
		handlePointerDown,
		handlePointerMove,
		handlePointerUp: finishActivePointer,
		handlePointerCancel: finishActivePointer,
	};
}
