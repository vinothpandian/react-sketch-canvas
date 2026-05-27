import { Trash2, ZoomIn } from "lucide-react";
import { type ChangeEvent, useRef, useState } from "react";
import {
	ReactSketchCanvas,
	type ReactSketchCanvasRef,
} from "react-sketch-canvas";

export default function App() {
	const canvasRef = useRef<ReactSketchCanvasRef>(null);
	const [scale, setScale] = useState(1);

	const handleScaleChange = (event: ChangeEvent<HTMLInputElement>) => {
		setScale(Number(event.target.value));
	};

	const handleClear = () => {
		canvasRef.current?.clearCanvas();
	};

	return (
		<div className="not-prose flex flex-col gap-4 w-full">
			{/* Scaling Controls Bar */}
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg border border-fd-border bg-fd-card shadow-sm text-fd-foreground">
				{/* Scale Slider */}
				<div className="flex flex-1 flex-col gap-1.5 max-w-md">
					<div className="flex justify-between items-center text-xs font-semibold uppercase tracking-wider text-fd-muted-foreground">
						<span className="flex items-center gap-1.5" htmlFor="scale">
							<ZoomIn className="w-3.5 h-3.5 text-fd-primary" />
							Parent Scale Factor
						</span>
						<span className="font-mono text-fd-foreground bg-fd-muted border border-fd-border px-1.5 py-0.5 rounded text-[10px]">
							{scale.toFixed(2)}x
						</span>
					</div>
					<input
						id="scale"
						type="range"
						min="0.5"
						max="1.5"
						step="0.05"
						value={scale}
						onChange={handleScaleChange}
						className="w-full accent-fd-primary cursor-pointer"
					/>
				</div>

				{/* Actions */}
				<div className="flex items-center gap-2">
					<button
						type="button"
						onClick={handleClear}
						className="inline-flex h-9 items-center gap-1.5 px-3 rounded-md border border-fd-border bg-fd-card text-xs font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 shadow-sm transition-all"
					>
						<Trash2 className="w-3.5 h-3.5" />
						Clear Canvas
					</button>
				</div>
			</div>

			{/* Scaled Canvas Container */}
			<div className="overflow-hidden rounded-lg border border-fd-border bg-fd-muted p-2 shadow-inner min-h-[280px] flex items-start justify-start">
				<div
					role="presentation"
					style={{
						transform: `scale(${scale})`,
						transformOrigin: "top left",
						width: `${100 / scale}%`,
					}}
					className="relative rounded border border-dashed border-emerald-500/50 bg-fd-card shadow-sm overflow-hidden transition-transform duration-100 ease-out"
				>
					<div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] dark:bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none opacity-40" />

					{/* Scaled tag info */}
					<div className="absolute top-3 left-4 font-display text-[10px] text-fd-muted-foreground z-10 select-none">
						Scaled Parent Viewport ({scale.toFixed(2)}x Zoom)
					</div>

					<ReactSketchCanvas
						ref={canvasRef}
						width="100%"
						height="240px"
						strokeColor="#16a34a"
						canvasColor="transparent"
					/>
				</div>
			</div>
		</div>
	);
}
