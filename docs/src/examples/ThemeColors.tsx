import { Eraser, Pencil, Settings2 } from "lucide-react";
import { type ChangeEvent, useRef, useState } from "react";
import {
	type EraserMode,
	ReactSketchCanvas,
	type ReactSketchCanvasRef,
} from "react-sketch-canvas";

export default function App() {
	const canvasRef = useRef<ReactSketchCanvasRef>(null);
	const [eraseMode, setEraseMode] = useState(false);
	const [eraserMode, setEraserMode] = useState<EraserMode>("mask");
	const [strokeWidth, setStrokeWidth] = useState(5);
	const [eraserWidth, setEraserWidth] = useState(10);

	const handlePenClick = () => {
		setEraseMode(false);
		canvasRef.current?.eraseMode(false);
	};

	const handleEraserClick = () => {
		setEraseMode(true);
		canvasRef.current?.eraseMode(true);
	};

	const handleStrokeWidthChange = (event: ChangeEvent<HTMLInputElement>) => {
		setStrokeWidth(+event.target.value);
	};

	const handleEraserWidthChange = (event: ChangeEvent<HTMLInputElement>) => {
		setEraserWidth(+event.target.value);
	};

	const handleEraserModeChange = (mode: EraserMode) => {
		setEraserMode(mode);
	};

	return (
		<div className="not-prose flex flex-col gap-4 w-full">
			{/* Tools Panel */}
			<div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-lg border border-fd-border bg-fd-card shadow-sm text-fd-foreground">
				{/* Active Tool */}
				<div className="flex flex-col gap-2 min-w-[12rem]">
					<span className="text-xs font-semibold uppercase tracking-wider text-fd-muted-foreground">
						Active Tool
					</span>
					<div className="inline-flex rounded-md p-1 bg-fd-muted border border-fd-border w-fit">
						<button
							type="button"
							onClick={handlePenClick}
							className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${
								!eraseMode
									? "bg-fd-primary text-fd-primary-foreground shadow-sm"
									: "text-fd-muted-foreground hover:text-fd-foreground hover:bg-fd-accent/50"
							}`}
						>
							<Pencil className="w-3.5 h-3.5" />
							Pen
						</button>
						<button
							type="button"
							onClick={handleEraserClick}
							className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${
								eraseMode
									? "bg-fd-primary text-fd-primary-foreground shadow-sm"
									: "text-fd-muted-foreground hover:text-fd-foreground hover:bg-fd-accent/50"
							}`}
						>
							<Eraser className="w-3.5 h-3.5" />
							Eraser
						</button>
					</div>
				</div>

				{/* Sliders */}
				<div className="flex flex-1 flex-col sm:flex-row gap-4">
					{/* Stroke Width Slider */}
					<div
						className={`flex flex-col flex-1 gap-2 transition-opacity duration-200 ${eraseMode ? "opacity-40" : "opacity-100"}`}
					>
						<div className="flex justify-between items-center text-xs font-semibold uppercase tracking-wider text-fd-muted-foreground">
							<span htmlFor="strokeWidth">Stroke Width</span>
							<span className="font-mono text-fd-foreground bg-fd-muted border border-fd-border px-1.5 py-0.5 rounded text-[10px]">
								{strokeWidth}px
							</span>
						</div>
						<input
							disabled={eraseMode}
							type="range"
							min="1"
							max="20"
							step="1"
							id="strokeWidth"
							value={strokeWidth}
							onChange={handleStrokeWidthChange}
							className="w-full accent-fd-primary cursor-pointer disabled:cursor-not-allowed"
						/>
					</div>

					{/* Eraser Width Slider */}
					<div
						className={`flex flex-col flex-1 gap-2 transition-opacity duration-200 ${!eraseMode ? "opacity-40" : "opacity-100"}`}
					>
						<div className="flex justify-between items-center text-xs font-semibold uppercase tracking-wider text-fd-muted-foreground">
							<span htmlFor="eraserWidth">Eraser Width</span>
							<span className="font-mono text-fd-foreground bg-fd-muted border border-fd-border px-1.5 py-0.5 rounded text-[10px]">
								{eraserWidth}px
							</span>
						</div>
						<input
							disabled={!eraseMode}
							type="range"
							min="1"
							max="20"
							step="1"
							id="eraserWidth"
							value={eraserWidth}
							onChange={handleEraserWidthChange}
							className="w-full accent-fd-primary cursor-pointer disabled:cursor-not-allowed"
						/>
					</div>
				</div>

				{/* Eraser Mode */}
				<div className="flex flex-col gap-2 min-w-[12rem]">
					<span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-fd-muted-foreground">
						<Settings2 className="w-3.5 h-3.5" />
						Eraser Mode
					</span>
					<div className="inline-flex rounded-md p-1 bg-fd-muted border border-fd-border w-fit">
						<button
							type="button"
							onClick={() => handleEraserModeChange("mask")}
							className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${
								eraserMode === "mask"
									? "bg-fd-card text-fd-foreground border border-fd-border/30 shadow-sm"
									: "text-fd-muted-foreground hover:text-fd-foreground"
							}`}
						>
							Mask
						</button>
						<button
							type="button"
							onClick={() => handleEraserModeChange("stroke")}
							className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${
								eraserMode === "stroke"
									? "bg-fd-card text-fd-foreground border border-fd-border/30 shadow-sm"
									: "text-fd-muted-foreground hover:text-fd-foreground"
							}`}
						>
							Stroke
						</button>
					</div>
				</div>
			</div>

			{/* Canvas Workspace */}
			<div className="canvas-wrapper relative overflow-hidden rounded-lg border border-fd-border aspect-video min-h-[240px] shadow-sm">
				<style>
					{`
						.canvas-wrapper {
							--rsc-theme-canvas: white;
							--rsc-theme-stroke: blue;
						}

						.dark .canvas-wrapper {
							--rsc-theme-canvas: black;
							--rsc-theme-stroke: red;
						}
					`}
				</style>
				<ReactSketchCanvas
					ref={canvasRef}
					canvasColor="var(--rsc-theme-canvas)"
					strokeColor="var(--rsc-theme-stroke)"
					eraserMode={eraserMode}
					strokeWidth={strokeWidth}
					eraserWidth={eraserWidth}
				/>
			</div>
		</div>
	);
}
