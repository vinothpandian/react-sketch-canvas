import { ArrowDown, ArrowUp, Milestone, RotateCcw, Trash2 } from "lucide-react";
import { useRef, useState } from "react";
import {
	ReactSketchCanvas,
	type ReactSketchCanvasRef,
} from "react-sketch-canvas";

export default function App() {
	const canvasRef = useRef<ReactSketchCanvasRef>(null);
	const scrollRef = useRef<HTMLDivElement>(null);
	const [scrollTop, setScrollTop] = useState(0);

	const handleScrollBy = (delta: number) => {
		scrollRef.current?.scrollBy({ top: delta, behavior: "smooth" });
	};

	const handleResetScroll = () => {
		scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
	};

	const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
		setScrollTop(event.currentTarget.scrollTop);
	};

	const handleClear = () => {
		canvasRef.current?.clearCanvas();
	};

	return (
		<div className="not-prose flex flex-col gap-4 w-full">
			{/* Scroll Controls bar */}
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg border border-fd-border bg-fd-card shadow-sm text-fd-foreground">
				<div className="flex flex-wrap items-center gap-2">
					<button
						type="button"
						onClick={() => handleScrollBy(-100)}
						className="inline-flex h-9 items-center gap-1 px-3 rounded-md border border-fd-border bg-fd-card text-xs font-semibold hover:bg-fd-accent shadow-sm transition-colors"
					>
						<ArrowUp className="w-3.5 h-3.5" />
						Up
					</button>
					<button
						type="button"
						onClick={() => handleScrollBy(100)}
						className="inline-flex h-9 items-center gap-1 px-3 rounded-md border border-fd-border bg-fd-card text-xs font-semibold hover:bg-fd-accent shadow-sm transition-colors"
					>
						<ArrowDown className="w-3.5 h-3.5" />
						Down
					</button>
					<button
						type="button"
						onClick={handleResetScroll}
						className="inline-flex h-9 items-center gap-1 px-3 rounded-md border border-fd-border bg-fd-card text-xs font-semibold hover:bg-fd-accent shadow-sm transition-colors"
						title="Reset Scroll"
					>
						<RotateCcw className="w-3.5 h-3.5 text-fd-muted-foreground" />
					</button>
					<button
						type="button"
						onClick={handleClear}
						className="inline-flex h-9 items-center gap-1 px-3 rounded-md border border-fd-border bg-fd-card text-xs font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 shadow-sm transition-all"
					>
						<Trash2 className="w-3.5 h-3.5" />
						Clear
					</button>
				</div>

				{/* Scroll Meter Display */}
				<div className="flex items-center gap-3 p-2 px-3.5 rounded-md bg-fd-muted border border-fd-border shadow-inner text-xs min-w-[12rem] justify-between">
					<span className="text-[10px] font-semibold uppercase tracking-wider text-fd-muted-foreground flex items-center gap-1.5">
						<Milestone className="w-3.5 h-3.5 text-fd-primary" />
						Scroll Offset
					</span>
					<span className="font-mono font-bold text-fd-foreground">
						{Math.round(scrollTop)}px
					</span>
				</div>
			</div>

			{/* Scrollable Container */}
			<div
				ref={scrollRef}
				onScroll={handleScroll}
				className="relative h-60 overflow-y-auto rounded-lg border border-dashed border-fd-border/80 bg-fd-muted p-2 shadow-inner"
			>
				{/* Visual Grid Sheet Indicator */}
				<div className="relative h-[600px] w-full rounded border border-fd-border bg-fd-card shadow-sm overflow-hidden">
					<div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] dark:bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none opacity-40" />

					{/* Canvas Area with Kalam accent text */}
					<div className="absolute top-4 left-4 font-display text-xs text-fd-muted-foreground flex items-center gap-1">
						<span>Canvas Scroll Area (600px total height)</span>
					</div>

					<ReactSketchCanvas
						ref={canvasRef}
						width="100%"
						height="600px"
						strokeColor="var(--color-fd-primary)"
						canvasColor="transparent"
					/>
				</div>
			</div>
		</div>
	);
}
