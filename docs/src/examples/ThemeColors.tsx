import { type ChangeEvent, useRef, useState } from "react";
import {
	type EraserMode,
	ReactSketchCanvas,
	type ReactSketchCanvasRef,
} from "react-sketch-canvas";

type Theme = "light" | "dark";

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

	const handleEraserModeChange = (event: ChangeEvent<HTMLInputElement>) => {
		setEraserMode(event.target.value as EraserMode);
	};

	return (
		<section className="grid gap-3">
			<h1>Tools</h1>
			<div className="grid! gap-4 rounded-md border bg-fd-card p-4 text-fd-card-foreground grid-cols-[repeat(auto-fit,minmax(10rem,1fr))]">
				<fieldset className="grid min-w-0 gap-2 border-0 p-0">
					<legend className="p-0 font-semibold text-fd-muted-foreground text-sm">
						Mode
					</legend>
					<div className="flex flex-wrap gap-2">
						<button
							type="button"
							disabled={!eraseMode}
							onClick={handlePenClick}
						>
							Pen
						</button>
						<button
							type="button"
							disabled={eraseMode}
							onClick={handleEraserClick}
						>
							Eraser
						</button>
					</div>
				</fieldset>

				<div className="grid min-w-0 gap-3">
					<label className="grid gap-1 text-sm" htmlFor="strokeWidth">
						<span className="font-semibold text-fd-muted-foreground">
							Stroke width
						</span>
						<input
							disabled={eraseMode}
							type="range"
							min="1"
							max="20"
							step="1"
							id="strokeWidth"
							value={strokeWidth}
							onChange={handleStrokeWidthChange}
						/>
					</label>
					<label className="grid gap-1 text-sm" htmlFor="eraserWidth">
						<span className="font-semibold text-fd-muted-foreground">
							Eraser width
						</span>
						<input
							disabled={!eraseMode}
							type="range"
							min="1"
							max="20"
							step="1"
							id="eraserWidth"
							value={eraserWidth}
							onChange={handleEraserWidthChange}
						/>
					</label>
				</div>

				<fieldset className="grid min-w-0 gap-2 border-0 p-0">
					<legend className="p-0 font-semibold text-fd-muted-foreground text-sm">
						Eraser mode
					</legend>
					<div className="flex flex-wrap gap-3">
						<label className="flex items-center gap-1">
							<input
								type="radio"
								name="eraserMode"
								value="mask"
								checked={eraserMode === "mask"}
								onChange={handleEraserModeChange}
							/>
							Mask
						</label>
						<label className="flex items-center gap-1">
							<input
								type="radio"
								name="eraserMode"
								value="stroke"
								checked={eraserMode === "stroke"}
								onChange={handleEraserModeChange}
							/>
							Stroke
						</label>
					</div>
				</fieldset>
			</div>

			<h1>Canvas</h1>
			<div className="canvas-wrapper rounded-md border p-4">
				<style>
					{`
					.canvas-wrapper {
						--rsc-theme-canvas: #ffffff;
						--rsc-theme-stroke: #2563eb;
					}

					@media (prefers-color-scheme: dark) {
						.canvas-wrapper {
							--rsc-theme-canvas: #020617;
							--rsc-theme-stroke: #38bdf8;
						}
					}
				`}
				</style>
				<ReactSketchCanvas
					ref={canvasRef}
					width="100%"
					height="220px"
					canvasColor="var(--rsc-theme-canvas)"
					strokeColor="var(--rsc-theme-stroke)"
					eraserMode={eraserMode}
					strokeWidth={strokeWidth}
					eraserWidth={eraserWidth}
				/>
			</div>
		</section>
	);
}
