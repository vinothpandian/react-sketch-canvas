import { useRef, useState } from "react";
import {
	type CanvasPath,
	ReactSketchCanvas,
	type ReactSketchCanvasRef,
} from "react-sketch-canvas";

const MAX_STROKE_COUNT = 100;
const MAX_POINTS_PER_STROKE = 1000;
const MIN_CONTROL_VALUE = 1;

export type PerformanceTool = "pen" | "eraser";

export type CreatePerformancePathsParams = {
	strokeCount: number;
	pointsPerStroke: number;
	tool: PerformanceTool;
};

export type PerformanceTotals = {
	strokeCount: number;
	pointCount: number;
};

export function clampPerformanceControlValue(
	value: string | number,
	maxValue: number,
): number {
	const parsedValue =
		typeof value === "number" ? value : Number.parseInt(value, 10);

	if (!Number.isFinite(parsedValue)) return MIN_CONTROL_VALUE;

	return Math.min(
		maxValue,
		Math.max(MIN_CONTROL_VALUE, Math.round(parsedValue)),
	);
}

function createStrokePoints(pointsPerStroke: number) {
	return Array.from({ length: pointsPerStroke }, () => ({
		x: 12 + Math.round(Math.random() * 620),
		y: 12 + Math.round(Math.random() * 360),
	}));
}

export function createPerformancePaths({
	strokeCount,
	pointsPerStroke,
	tool,
}: CreatePerformancePathsParams): CanvasPath[] {
	const safeStrokeCount = clampPerformanceControlValue(
		strokeCount,
		MAX_STROKE_COUNT,
	);
	const safePointsPerStroke = clampPerformanceControlValue(
		pointsPerStroke,
		MAX_POINTS_PER_STROKE,
	);
	const drawMode = tool === "pen";

	return Array.from({ length: safeStrokeCount }, () => ({
		drawMode,
		strokeColor: drawMode ? "#2563eb" : "#000000",
		strokeWidth: drawMode ? 1 : 12,
		paths: createStrokePoints(safePointsPerStroke),
	}));
}

export const getPerformanceTotals = (
	paths: CanvasPath[],
): PerformanceTotals => ({
	strokeCount: paths.length,
	pointCount: paths.reduce((total, path) => total + path.paths.length, 0),
});

export default function App() {
	const canvasRef = useRef<ReactSketchCanvasRef>(null);
	const [strokeCount, setStrokeCount] = useState(10);
	const [pointsPerStroke, setPointsPerStroke] = useState(100);
	const [totalStrokeCount, setTotalStrokeCount] = useState(0);
	const [pointCount, setPointCount] = useState(0);

	const updateTotals = (updatedPaths: CanvasPath[]) => {
		const totals = getPerformanceTotals(updatedPaths);

		setTotalStrokeCount(totals.strokeCount);
		setPointCount(totals.pointCount);
	};

	const handleAddPaths = (tool: PerformanceTool) => {
		const safeStrokeCount = clampPerformanceControlValue(
			strokeCount,
			MAX_STROKE_COUNT,
		);
		const safePointsPerStroke = clampPerformanceControlValue(
			pointsPerStroke,
			MAX_POINTS_PER_STROKE,
		);
		const addedPaths = createPerformancePaths({
			strokeCount: safeStrokeCount,
			pointsPerStroke: safePointsPerStroke,
			tool,
		});

		canvasRef.current?.eraseMode(tool === "eraser");
		canvasRef.current?.loadPaths(addedPaths);
		setStrokeCount(safeStrokeCount);
		setPointsPerStroke(safePointsPerStroke);
	};

	const handleReset = () => {
		canvasRef.current?.resetCanvas();
	};

	return (
		<div className="not-prose grid gap-4">
			<div className="grid gap-3 rounded-lg border bg-fd-card p-3">
				<div className="grid gap-3 md:grid-cols-2">
					<label className="grid gap-1 text-sm" htmlFor="performance-strokes">
						<span className="font-medium">Strokes</span>
						<input
							id="performance-strokes"
							type="number"
							min={MIN_CONTROL_VALUE}
							max={MAX_STROKE_COUNT}
							value={strokeCount}
							onChange={(event) =>
								setStrokeCount(
									clampPerformanceControlValue(
										event.currentTarget.value,
										MAX_STROKE_COUNT,
									),
								)
							}
							className="h-10 rounded-md border bg-fd-background px-3"
						/>
					</label>
					<label className="grid gap-1 text-sm" htmlFor="performance-points">
						<span className="font-medium">Points per stroke</span>
						<input
							id="performance-points"
							type="number"
							min={MIN_CONTROL_VALUE}
							max={MAX_POINTS_PER_STROKE}
							value={pointsPerStroke}
							onChange={(event) =>
								setPointsPerStroke(
									clampPerformanceControlValue(
										event.currentTarget.value,
										MAX_POINTS_PER_STROKE,
									),
								)
							}
							className="h-10 rounded-md border bg-fd-background px-3"
						/>
					</label>
				</div>
				<div className="flex flex-wrap items-center gap-2">
					<button
						type="button"
						onClick={() => handleAddPaths("pen")}
						className="inline-flex h-10 items-center rounded-md bg-fd-primary px-4 font-medium text-fd-primary-foreground text-sm transition-colors hover:bg-fd-primary/90"
					>
						Pen strokes
					</button>
					<button
						type="button"
						onClick={() => handleAddPaths("eraser")}
						className="inline-flex h-10 items-center rounded-md border bg-fd-background px-4 font-medium text-sm transition-colors hover:bg-fd-accent hover:text-fd-accent-foreground"
					>
						Eraser masks
					</button>
					<button
						type="button"
						onClick={handleReset}
						className="inline-flex h-10 items-center rounded-md border bg-fd-background px-4 font-medium text-sm transition-colors hover:bg-fd-accent hover:text-fd-accent-foreground"
					>
						Reset
					</button>
					<p className="ml-auto text-fd-muted-foreground text-sm">
						{totalStrokeCount} strokes, {pointCount.toLocaleString()} points
					</p>
				</div>
			</div>
			<ReactSketchCanvas
				ref={canvasRef}
				width="100%"
				height="420px"
				withViewBox
				onChange={updateTotals}
			/>
		</div>
	);
}
