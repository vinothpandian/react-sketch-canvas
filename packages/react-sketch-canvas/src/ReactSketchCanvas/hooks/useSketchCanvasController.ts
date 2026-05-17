import * as React from "react";
import { useCallback } from "react";
import type { CanvasPath, Point } from "../../types";
import {
	type SketchState,
	addLastStrokeToHistory,
	createInitialSketchState,
	resetCanvasState,
} from "../state/history";
import {
	type Operation,
	applyOperation,
	enqueueOperation as enqueueOperationInState,
} from "../state/operations";
import {
	appendPointToLastStroke,
	createStroke,
	finishStroke,
} from "../state/strokes";
import type { ReactSketchCanvasProps } from "../types";

type UseSketchCanvasControllerParams = Required<
	Pick<
		ReactSketchCanvasProps,
		| "strokeColor"
		| "strokeWidth"
		| "eraserWidth"
		| "withTimestamp"
		| "onChange"
		| "onStroke"
	>
>;

type UseSketchCanvasControllerReturns = {
	currentPaths: CanvasPath[];
	isDrawing: boolean;
	drawMode: boolean;
	setEraseMode: (erase: boolean) => void;
	enqueueOperation: (operation: Operation) => void;
	resetCanvas: () => void;
	handlePointerDown: (point: Point, isEraser?: boolean) => void;
	handlePointerMove: (point: Point) => void;
	handlePointerUp: () => void;
};

/**
 * Owns state transitions for `ReactSketchCanvas`.
 *
 * @remarks
 * This hook is the stateful controller for drawing, erasing, undo/redo queue
 * processing, timestamp capture, and change callbacks. Rendering and ref
 * methods stay in separate hooks so this logic can be unit tested directly.
 */
export function useSketchCanvasController({
	strokeColor,
	strokeWidth,
	eraserWidth,
	withTimestamp,
	onChange,
	onStroke,
}: UseSketchCanvasControllerParams): UseSketchCanvasControllerReturns {
	const [state, setState] = React.useState<SketchState>(
		createInitialSketchState,
	);

	const currentPaths = state.currentPaths;
	const isDrawing = state.isDrawing;

	// Keep the legacy stroke callback timing: the completed stroke is reported
	// on the render after drawing transitions from active to inactive.
	// biome-ignore lint/correctness/useExhaustiveDependencies: preserve legacy stroke-lift timing tied only to drawing state changes.
	const liftStrokeUp = React.useCallback((): void => {
		const lastStroke = currentPaths.slice(-1)?.[0] ?? null;
		if (lastStroke === null) return;

		onStroke(lastStroke, !lastStroke.drawMode);
	}, [isDrawing]);

	React.useEffect(() => {
		liftStrokeUp();
	}, [liftStrokeUp]);

	React.useEffect(() => {
		onChange(currentPaths);
	}, [currentPaths, onChange]);

	React.useEffect(() => {
		if (state.isProcessingQueue || state.operationQueue.length === 0) return;

		setState((current) => {
			if (current.isProcessingQueue || current.operationQueue.length === 0) {
				return current;
			}

			const [operation, ...remainingQueue] = current.operationQueue;
			const processed = applyOperation(
				{ ...current, isProcessingQueue: true },
				operation,
			);

			return {
				...processed,
				operationQueue: remainingQueue,
				isProcessingQueue: false,
			};
		});
	}, [state.isProcessingQueue, state.operationQueue]);

	const enqueueOperation = useCallback((operation: Operation) => {
		setState((current) => enqueueOperationInState(current, operation));
	}, []);

	const setEraseMode = useCallback((erase: boolean): void => {
		setState((current) => ({ ...current, drawMode: !erase }));
	}, []);

	const resetCanvas = useCallback((): void => {
		setState(resetCanvasState());
	}, []);

	const handlePointerDown = useCallback(
		(point: Point, isEraser = false): void => {
			setState((current) => {
				const synced = addLastStrokeToHistory(current);
				const isDraw = !isEraser && synced.drawMode;
				const stroke = createStroke({
					point,
					drawMode: isDraw,
					strokeColor,
					strokeWidth,
					eraserWidth,
					withTimestamp,
					now: Date.now(),
				});

				return {
					...synced,
					isDrawing: true,
					historyPos: synced.historyPos + 1,
					historySynced: false,
					currentPaths: [...synced.currentPaths, stroke],
				};
			});
		},
		[eraserWidth, strokeColor, strokeWidth, withTimestamp],
	);

	const handlePointerMove = useCallback((point: Point): void => {
		setState((current) => {
			if (!current.isDrawing) return current;

			return {
				...current,
				currentPaths: appendPointToLastStroke(current.currentPaths, point),
			};
		});
	}, []);

	const handlePointerUp = useCallback((): void => {
		setState((current) => {
			if (!current.isDrawing) return current;

			return {
				...current,
				isDrawing: false,
				currentPaths: finishStroke(
					current.currentPaths,
					withTimestamp,
					Date.now(),
				),
			};
		});
	}, [withTimestamp]);

	return {
		currentPaths,
		isDrawing,
		drawMode: state.drawMode,
		setEraseMode,
		enqueueOperation,
		resetCanvas,
		handlePointerDown,
		handlePointerMove,
		handlePointerUp,
	};
}
