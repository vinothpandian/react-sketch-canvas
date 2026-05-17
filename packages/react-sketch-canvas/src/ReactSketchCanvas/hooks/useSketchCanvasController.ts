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

type UseSketchCanvasControllerOptions = {
	strokeColor: string;
	strokeWidth: number;
	eraserWidth: number;
	withTimestamp: boolean;
	onChange: (updatedPaths: CanvasPath[]) => void;
	onStroke: (path: CanvasPath, isEraser: boolean) => void;
};

export function useSketchCanvasController({
	strokeColor,
	strokeWidth,
	eraserWidth,
	withTimestamp,
	onChange,
	onStroke,
}: UseSketchCanvasControllerOptions) {
	const [state, setState] = React.useState<SketchState>(
		createInitialSketchState,
	);

	const currentPaths = state.currentPaths;
	const isDrawing = state.isDrawing;

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
