import {
	ArrowDown,
	ArrowLeft,
	ArrowRight,
	ArrowUp,
	Layers,
	Trash2,
} from "lucide-react";
import { useRef, useState } from "react";
import {
	ReactSketchCanvas,
	type ReactSketchCanvasRef,
} from "react-sketch-canvas";

export default function App() {
	const canvasRef = useRef<ReactSketchCanvasRef>(null);
	const outerRef = useRef<HTMLDivElement>(null);
	const innerRef = useRef<HTMLDivElement>(null);
	const [outerScroll, setOuterScroll] = useState({ top: 0, left: 0 });
	const [innerScroll, setInnerScroll] = useState({ top: 0, left: 0 });

	const handleScrollOuter = (event: React.UIEvent<HTMLDivElement>) => {
		setOuterScroll({
			top: event.currentTarget.scrollTop,
			left: event.currentTarget.scrollLeft,
		});
	};

	const handleScrollInner = (event: React.UIEvent<HTMLDivElement>) => {
		setInnerScroll({
			top: event.currentTarget.scrollTop,
			left: event.currentTarget.scrollLeft,
		});
	};

	const scrollOuter = (top: number, left: number) => {
		outerRef.current?.scrollBy({ top, left, behavior: "smooth" });
	};

	const scrollInner = (top: number, left: number) => {
		innerRef.current?.scrollBy({ top, left, behavior: "smooth" });
	};

	const handleClear = () => {
		canvasRef.current?.clearCanvas();
	};

	const roundedOuterLeft = Math.round(outerScroll.left);
	const roundedOuterTop = Math.round(outerScroll.top);
	const roundedInnerLeft = Math.round(innerScroll.left);
	const roundedInnerTop = Math.round(innerScroll.top);

	return (
		<div className="not-prose flex flex-col gap-4 w-full">
			{/* Scroll Controls Bar */}
			<div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-lg border border-fd-border bg-fd-card shadow-sm text-fd-foreground">
				{/* Triggers */}
				<div className="flex flex-wrap items-center gap-2">
					<button
						type="button"
						onClick={() => scrollOuter(0, -80)}
						className="inline-flex h-9 items-center gap-1.5 px-3 rounded-md border border-fd-border bg-fd-card text-xs font-semibold hover:bg-fd-accent shadow-sm transition-colors"
					>
						<ArrowLeft className="w-3.5 h-3.5" />
						Outer L
					</button>
					<button
						type="button"
						onClick={() => scrollOuter(0, 80)}
						className="inline-flex h-9 items-center gap-1.5 px-3 rounded-md border border-fd-border bg-fd-card text-xs font-semibold hover:bg-fd-accent shadow-sm transition-colors"
					>
						<ArrowRight className="w-3.5 h-3.5" />
						Outer R
					</button>
					<button
						type="button"
						onClick={() => scrollInner(-80, 0)}
						className="inline-flex h-9 items-center gap-1.5 px-3 rounded-md border border-fd-border bg-fd-card text-xs font-semibold hover:bg-fd-accent shadow-sm transition-colors"
					>
						<ArrowUp className="w-3.5 h-3.5" />
						Inner U
					</button>
					<button
						type="button"
						onClick={() => scrollInner(80, 0)}
						className="inline-flex h-9 items-center gap-1.5 px-3 rounded-md border border-fd-border bg-fd-card text-xs font-semibold hover:bg-fd-accent shadow-sm transition-colors"
					>
						<ArrowDown className="w-3.5 h-3.5" />
						Inner D
					</button>
					<button
						type="button"
						onClick={handleClear}
						className="inline-flex h-9 items-center gap-1.5 px-3 rounded-md border border-fd-border bg-fd-card text-xs font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 shadow-sm transition-all"
					>
						<Trash2 className="w-3.5 h-3.5" />
						Clear
					</button>
				</div>

				{/* Nested Meter readouts */}
				<div className="flex items-center gap-3 p-2 px-3.5 rounded-md bg-fd-muted border border-fd-border shadow-inner text-xs justify-between min-w-[16rem]">
					<span className="text-[10px] font-semibold uppercase tracking-wider text-fd-muted-foreground flex items-center gap-1.5">
						<Layers className="w-3.5 h-3.5 text-fd-primary" />
						Nested Offsets
					</span>
					<div className="flex gap-3 text-right">
						<div className="flex flex-col">
							<span className="text-[8px] uppercase font-bold text-fd-muted-foreground">
								Outer (X, Y)
							</span>
							<span className="font-mono font-bold mt-0.5">
								{roundedOuterLeft}, {roundedOuterTop}px
							</span>
						</div>
						<div className="flex flex-col border-l border-fd-border/50 pl-3">
							<span className="text-[8px] uppercase font-bold text-fd-muted-foreground">
								Inner (X, Y)
							</span>
							<span className="font-mono font-bold mt-0.5">
								{roundedInnerLeft}, {roundedInnerTop}px
							</span>
						</div>
					</div>
				</div>
			</div>

			{/* Outer scroll pane (Horizontal) */}
			<div
				ref={outerRef}
				onScroll={handleScrollOuter}
				className="relative w-full overflow-x-auto overflow-y-hidden rounded-lg border border-dashed border-fd-border bg-fd-muted p-2 shadow-inner"
			>
				<div className="relative w-[1200px] p-2 bg-fd-card/50 rounded border border-fd-border/30">
					<div className="absolute top-3 left-4 font-display text-[10px] text-fd-muted-foreground">
						Outer Scroll Pane (1200px width horizontal scroll)
					</div>

					{/* Inner scroll pane (Vertical) */}
					<div
						ref={innerRef}
						onScroll={handleScrollInner}
						className="relative h-60 overflow-y-auto rounded border border-dashed border-sky-400/50 bg-fd-muted p-2 mt-6 shadow-inner"
					>
						<div className="relative h-[600px] w-full rounded border border-fd-border bg-fd-card shadow overflow-hidden">
							<div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] dark:bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none opacity-40" />

							<div className="absolute top-4 left-4 font-display text-[10px] text-fd-muted-foreground">
								Inner Scroll Pane (600px height vertical scroll)
							</div>

							<ReactSketchCanvas
								ref={canvasRef}
								width="100%"
								height="600px"
								strokeColor="#0ea5e9"
								canvasColor="transparent"
							/>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
