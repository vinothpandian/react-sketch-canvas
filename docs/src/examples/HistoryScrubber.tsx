import { ListOrdered } from "lucide-react";
import { type ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import {
	type CanvasPath,
	ReactSketchCanvas,
	type ReactSketchCanvasRef,
} from "react-sketch-canvas";
import savedPaths from "../assets/initialSketch.json";

const paths = savedPaths as CanvasPath[];
const previewPadding = 24;
const minX = Math.min(
	...paths.flatMap((path) => path.paths.map((point) => point.x)),
);
const minY = Math.min(
	...paths.flatMap((path) => path.paths.map((point) => point.y)),
);
const previewPaths = paths.map((path) => ({
	...path,
	paths: path.paths.map((point) => ({
		x: point.x - minX + previewPadding,
		y: point.y - minY + previewPadding,
	})),
}));

const rangeInputClass = "h-9 w-full cursor-pointer accent-fd-primary";

function formatPathLabel(path: CanvasPath, index: number) {
	const pointCount = path.paths.length;
	const mode = path.drawMode ? "Draw" : "Erase";

	return `Stroke ${index + 1}: ${mode}, ${pointCount} point${
		pointCount === 1 ? "" : "s"
	}`;
}

function getPathKey(path: CanvasPath) {
	const firstPoint = path.paths[0];
	const lastPoint = path.paths.at(-1);

	return [
		path.strokeColor,
		path.strokeWidth,
		path.startTimestamp,
		path.endTimestamp,
		firstPoint?.x,
		firstPoint?.y,
		lastPoint?.x,
		lastPoint?.y,
	].join(":");
}

export default function HistoryScrubber() {
	const canvasRef = useRef<ReactSketchCanvasRef>(null);
	const [visiblePathCount, setVisiblePathCount] = useState(paths.length);

	const visiblePaths = useMemo(
		() => previewPaths.slice(0, visiblePathCount),
		[visiblePathCount],
	);

	useEffect(() => {
		canvasRef.current?.resetCanvas();

		const frame = window.requestAnimationFrame(() => {
			if (visiblePaths.length > 0) {
				canvasRef.current?.loadPaths(visiblePaths);
			}
		});

		return () => window.cancelAnimationFrame(frame);
	}, [visiblePaths]);

	const handleScrubChange = (event: ChangeEvent<HTMLInputElement>) => {
		setVisiblePathCount(Number(event.target.value));
	};

	return (
		<div className="not-prose grid w-full gap-4 xl:grid-cols-[minmax(0,1fr)_14rem] xl:items-start">
			<div className="grid gap-4">
				<div className="relative min-h-[240px] overflow-hidden rounded-lg border border-fd-border bg-fd-card shadow-sm aspect-video">
					<ReactSketchCanvas
						ref={canvasRef}
						canvasColor="transparent"
						readOnly
						strokeColor="var(--color-fd-primary)"
					/>
				</div>

				<label className="grid gap-2 rounded-lg border border-fd-border bg-fd-card p-3 text-fd-foreground shadow-sm">
					<span className="flex flex-wrap items-center justify-between gap-2 text-xs font-semibold uppercase tracking-wider text-fd-muted-foreground">
						<span>Playback position</span>
						<span className="rounded border border-fd-border bg-fd-muted px-2 py-1 font-mono text-[11px] text-fd-foreground">
							{visiblePathCount} / {paths.length} strokes
						</span>
					</span>
					<input
						type="range"
						min="0"
						max={paths.length}
						value={visiblePathCount}
						onChange={handleScrubChange}
						onInput={handleScrubChange}
						className={rangeInputClass}
						aria-label="Choose how many saved strokes to show"
					/>
				</label>
			</div>

			<aside className="rounded-lg border border-fd-border bg-fd-card text-fd-foreground shadow-sm">
				<div className="flex items-center gap-2 border-b border-fd-border px-3 py-2.5">
					<ListOrdered className="h-4 w-4 text-fd-primary" />
					<div>
						<h3 className="text-sm font-semibold">Saved stroke list</h3>
						<p className="text-xs text-fd-muted-foreground">
							The slider replays this array from the first stroke onward.
						</p>
					</div>
				</div>

				<ol className="grid max-h-64 grid-cols-1 gap-1 overflow-auto p-2 sm:grid-cols-2 xl:max-h-[18rem] xl:grid-cols-1">
					{paths.map((path, index) => {
						const isVisible = index < visiblePathCount;
						const isCurrent = index === visiblePathCount - 1;

						return (
							<li key={getPathKey(path)}>
								<button
									type="button"
									onClick={() => setVisiblePathCount(index + 1)}
									aria-current={isCurrent ? "step" : undefined}
									className={`grid w-full grid-cols-[auto_minmax(0,1fr)] items-center gap-2 rounded-md px-2 py-2 text-left text-xs transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-primary ${
										isVisible
											? "text-fd-foreground hover:bg-fd-accent"
											: "text-fd-muted-foreground hover:bg-fd-muted"
									} ${isCurrent ? "bg-fd-accent" : ""}`}
								>
									<span
										className="h-2.5 w-2.5 rounded-full border border-fd-border"
										style={{
											backgroundColor: path.drawMode
												? path.strokeColor
												: "var(--color-fd-muted)",
										}}
									/>
									<span className="truncate">
										{formatPathLabel(path, index)}
									</span>
								</button>
							</li>
						);
					})}
				</ol>
			</aside>
		</div>
	);
}
