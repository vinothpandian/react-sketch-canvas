import { Clock, RotateCcw, Timer } from "lucide-react";
import { useRef, useState } from "react";
import {
	ReactSketchCanvas,
	type ReactSketchCanvasRef,
} from "react-sketch-canvas";

export default function App() {
	const canvasRef = useRef<ReactSketchCanvasRef>(null);
	const [sketchingTime, setSketchingTime] = useState(0);

	const handleSketchingTime = async () => {
		const time = (await canvasRef.current?.getSketchingTime()) || 0;
		setSketchingTime(time);
	};

	const handleReset = () => {
		setSketchingTime(0);
		canvasRef.current?.resetCanvas();
	};

	const sketchingTimeInSeconds = (sketchingTime / 1_000).toLocaleString(
		undefined,
		{ minimumFractionDigits: 3, maximumFractionDigits: 3 },
	);

	return (
		<div className="not-prose flex flex-col gap-4 w-full">
			{/* Stopwatch & Metrics Panel */}
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg border border-fd-border bg-fd-card shadow-sm text-fd-foreground">
				{/* Actions */}
				<div className="flex flex-wrap items-center gap-2">
					<button
						type="button"
						onClick={handleSketchingTime}
						className="inline-flex h-9 items-center gap-1.5 rounded-md bg-fd-primary px-3.5 text-xs font-semibold text-fd-primary-foreground shadow transition-colors hover:bg-fd-primary/90"
					>
						<Clock className="w-3.5 h-3.5" />
						Query Active Time
					</button>
					<button
						type="button"
						onClick={handleReset}
						className="inline-flex h-9 items-center gap-1.5 rounded-md border border-fd-border bg-fd-card px-3 text-xs font-semibold text-fd-muted-foreground hover:text-fd-foreground hover:bg-fd-accent shadow-sm transition-colors"
					>
						<RotateCcw className="w-3.5 h-3.5" />
						Reset Canvas
					</button>
				</div>

				{/* Stopwatch Display Panel */}
				<div className="flex items-center gap-3 p-2 px-3.5 rounded-md bg-fd-muted border border-fd-border shadow-inner min-w-[12rem] justify-between">
					<div className="flex flex-col">
						<span className="text-[10px] font-semibold uppercase tracking-wider text-fd-muted-foreground flex items-center gap-1">
							<Timer className="w-3 h-3 text-fd-primary" />
							Sketch Time
						</span>
						<span className="font-mono text-lg font-bold text-fd-foreground mt-0.5">
							{sketchingTimeInSeconds}{" "}
							<span className="text-xs font-normal text-fd-muted-foreground">
								seconds
							</span>
						</span>
					</div>
					<div className="flex flex-col items-end">
						<span className="text-[8px] font-semibold uppercase bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-1 py-0.25 rounded">
							Active
						</span>
					</div>
				</div>
			</div>

			{/* Canvas Workspace */}
			<div className="relative overflow-hidden rounded-lg border border-fd-border aspect-video min-h-[240px] shadow-sm">
				<ReactSketchCanvas
					ref={canvasRef}
					withTimestamp
					strokeColor="var(--color-fd-primary)"
					canvasColor="transparent"
				/>
			</div>
		</div>
	);
}
