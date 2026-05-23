import * as React from "react";
import { useCallback } from "react";
import { doesEraserStrokeHitStroke } from "../../Paths/geometry";
import type { CanvasPath, Point } from "../../types";
import {
	addLastStrokeToHistory,
	createInitialSketchState,
	resetCanvasState,
	type SketchState,
} from "../state/history";
import {
	applyOperation,
	enqueueOperation as enqueueOperationInState,
	type Operation,
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
		| "eraserMode"
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
	eraserMode,
	withTimestamp,
	onChange,
	onStroke,
}: UseSketchCanvasControllerParams): UseSketchCanvasControllerReturns {
	const [state, setState] = React.useState<SketchState>(
		createInitialSketchState,
	);

	const currentPaths = state.currentPaths;
	const isDrawing = state.isDrawing;
	const onChangeRef = React.useRef(onChange);
	const onStrokeRef = React.useRef(onStroke);

	React.useEffect(() => {
		onChangeRef.current = onChange;
	}, [onChange]);

	React.useEffect(() => {
		onStrokeRef.current = onStroke;
	}, [onStroke]);

	React.useEffect(() => {
		if (isDrawing || state.lastCompletedStroke === null) return;

		const completedStroke = state.lastCompletedStroke;
		onStrokeRef.current(completedStroke.path, completedStroke.isEraser);
		setState((current) =>
			current.lastCompletedStroke === completedStroke
				? { ...current, lastCompletedStroke: null }
				: current,
		);
	}, [isDrawing, state.lastCompletedStroke]);

	React.useEffect(() => {
		onChangeRef.current(currentPaths);
	}, [currentPaths]);

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
				const isStrokeEraser = !isDraw && eraserMode === "stroke";

				return {
					...synced,
					isDrawing: true,
					historyPos: synced.historyPos + 1,
					historySynced: false,
					activeStroke: isStrokeEraser ? stroke : null,
					currentPaths: isStrokeEraser
						? synced.currentPaths
						: [...synced.currentPaths, stroke],
				};
			});
		},
		[eraserMode, eraserWidth, strokeColor, strokeWidth, withTimestamp],
	);

	const handlePointerMove = useCallback((point: Point): void => {
		setState((current) => {
			if (!current.isDrawing) return current;

			if (current.activeStroke !== null) {
				return {
					...current,
					activeStroke: appendPointToLastStroke(
						[current.activeStroke],
						point,
					)[0] as CanvasPath,
				};
			}

			return {
				...current,
				currentPaths: appendPointToLastStroke(current.currentPaths, point),
			};
		});
	}, []);

	const handlePointerUp = useCallback((): void => {
		setState((current) => {
			if (!current.isDrawing) return current;

			if (current.activeStroke !== null) {
				const [eraserStroke] = finishStroke(
					[current.activeStroke],
					withTimestamp,
					Date.now(),
				);
				const updatedPaths = current.currentPaths.filter(
					(path) =>
						!path.drawMode ||
						!doesEraserStrokeHitStroke({ eraser: eraserStroke, stroke: path }),
				);

				return {
					...current,
					isDrawing: false,
					activeStroke: null,
					currentPaths: updatedPaths,
					lastCompletedStroke: {
						path: eraserStroke,
						isEraser: true,
					},
				};
			}

			const currentPaths = finishStroke(
				current.currentPaths,
				withTimestamp,
				Date.now(),
			);
			const lastStroke = currentPaths.slice(-1)?.[0] ?? null;

			return {
				...current,
				isDrawing: false,
				currentPaths,
				lastCompletedStroke:
					lastStroke === null
						? null
						: {
								path: lastStroke,
								isEraser: !lastStroke.drawMode,
							},
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
