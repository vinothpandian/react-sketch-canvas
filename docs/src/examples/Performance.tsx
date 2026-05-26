import { Cpu, Eraser, Pencil, RotateCcw } from "lucide-react";
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
		strokeColor: drawMode ? "var(--color-fd-primary)" : "#000000",
		strokeWidth: drawMode ? 1.5 : 16,
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
		<div className="not-prose flex flex-col gap-4 w-full">
			{/* Performance Configuration Panel & Dashboard */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-lg border border-fd-border bg-fd-card shadow-sm text-fd-foreground">
				{/* Settings Controls */}
				<div className="flex flex-col gap-3 md:col-span-2 justify-between">
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
						<div className="flex flex-col gap-1.5">
							<label
								className="text-xs font-semibold uppercase tracking-wider text-fd-muted-foreground"
								htmlFor="performance-strokes"
							>
								Strokes (Max {MAX_STROKE_COUNT})
							</label>
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
								className="h-9 w-full rounded-md border border-fd-border bg-fd-muted px-3 text-sm focus:outline-none focus:ring-2 focus:ring-fd-ring transition-all"
							/>
						</div>

						<div className="flex flex-col gap-1.5">
							<label
								className="text-xs font-semibold uppercase tracking-wider text-fd-muted-foreground"
								htmlFor="performance-points"
							>
								Points per Stroke (Max {MAX_POINTS_PER_STROKE})
							</label>
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
								className="h-9 w-full rounded-md border border-fd-border bg-fd-muted px-3 text-sm focus:outline-none focus:ring-2 focus:ring-fd-ring transition-all"
							/>
						</div>
					</div>

					{/* Action Buttons */}
					<div className="flex flex-wrap items-center gap-2 mt-2">
						<button
							type="button"
							onClick={() => handleAddPaths("pen")}
							className="inline-flex h-9 items-center gap-1.5 rounded-md bg-fd-primary px-3.5 text-xs font-semibold text-fd-primary-foreground shadow transition-colors hover:bg-fd-primary/90"
						>
							<Pencil className="w-3.5 h-3.5" />
							Inject Pen Strokes
						</button>
						<button
							type="button"
							onClick={() => handleAddPaths("eraser")}
							className="inline-flex h-9 items-center gap-1.5 rounded-md border border-fd-border bg-fd-card px-3.5 text-xs font-semibold text-fd-foreground hover:bg-fd-accent shadow-sm transition-colors"
						>
							<Eraser className="w-3.5 h-3.5" />
							Inject Eraser Masks
						</button>
						<button
							type="button"
							onClick={handleReset}
							className="inline-flex h-9 items-center gap-1.5 rounded-md border border-fd-border bg-fd-card px-3 text-xs font-semibold text-fd-muted-foreground hover:text-fd-foreground hover:bg-fd-accent shadow-sm transition-colors"
						>
							<RotateCcw className="w-3.5 h-3.5" />
							Reset
						</button>
					</div>
				</div>

				{/* Real-time Dashboard Monitor */}
				<div className="flex flex-col gap-2 p-3 rounded-md bg-fd-muted border border-fd-border shadow-inner">
					<div className="flex items-center justify-between">
						<span className="text-xs font-semibold uppercase tracking-wider text-fd-muted-foreground flex items-center gap-1.5">
							<Cpu className="w-3.5 h-3.5 text-fd-primary" />
							Vector Stats
						</span>
						<span className="relative flex h-2 w-2">
							<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
							<span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
						</span>
					</div>
					<div className="grid grid-cols-2 gap-2 mt-1">
						<div className="flex flex-col p-2 bg-fd-card rounded border border-fd-border/40">
							<span className="text-[10px] uppercase font-semibold text-fd-muted-foreground">
								Strokes
							</span>
							<span className="font-mono text-lg font-bold text-fd-foreground">
								{totalStrokeCount}
							</span>
						</div>
						<div className="flex flex-col p-2 bg-fd-card rounded border border-fd-border/40">
							<span className="text-[10px] uppercase font-semibold text-fd-muted-foreground">
								Points
							</span>
							<span className="font-mono text-lg font-bold text-fd-foreground">
								{pointCount.toLocaleString()}
							</span>
						</div>
					</div>
				</div>
			</div>

			{/* Canvas Workspace */}
			<div className="relative overflow-hidden rounded-lg border border-fd-border aspect-video min-h-[280px] shadow-sm">
				<ReactSketchCanvas
					ref={canvasRef}
					withViewBox
					onChange={updateTotals}
					strokeColor="var(--color-fd-primary)"
					canvasColor="transparent"
				/>
			</div>
		</div>
	);
}
