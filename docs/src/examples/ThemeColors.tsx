import { type ChangeEvent, useRef, useState } from "react";
import {
	type EraserMode,
	ReactSketchCanvas,
	type ReactSketchCanvasRef,
} from "react-sketch-canvas";

type Theme = "light" | "dark";

export default function App() {
	const canvasRef = useRef<ReactSketchCanvasRef>(null);
	const [theme, setTheme] = useState<Theme>("light");
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
		<section className="rsc-theme-example" data-theme={theme}>
			<style>
				{`
					.rsc-theme-example {
						--rsc-theme-border: #cbd5e1;
						--rsc-theme-canvas: #ffffff;
						--rsc-theme-stroke: #2563eb;
					}

					.rsc-theme-example[data-theme="dark"] {
						--rsc-theme-border: #334155;
						--rsc-theme-canvas: #020617;
						--rsc-theme-stroke: #38bdf8;
					}

					.rsc-theme-example__surface {
						border: 1px solid var(--rsc-theme-border);
						padding: 1rem;
					}

					.rsc-theme-example__tools {
						border: 1px solid #d4d4d8;
						background: #fafafa;
						display: grid;
						gap: 1rem;
						grid-template-columns: repeat(auto-fit, minmax(10rem, 1fr));
						margin-block-end: 1rem;
						padding: 1rem;
					}

					.rsc-theme-example__tool-group {
						border: 0;
						display: grid;
						gap: 0.5rem;
						margin: 0;
						min-inline-size: 0;
						padding: 0;
					}

					.rsc-theme-example__tool-group legend,
					.rsc-theme-example__range-control span {
						color: #52525b;
						font-size: 0.875rem;
						font-weight: 600;
						padding: 0;
					}

					.rsc-theme-example__button-row,
					.rsc-theme-example__radio-row {
						display: flex;
						flex-wrap: wrap;
						gap: 0.5rem;
					}

					.rsc-theme-example__radio-row label {
						display: flex;
						align-items: center;
						gap: 0.25rem;
					}

					.rsc-theme-example__range-control {
						display: grid;
						gap: 0.375rem;
					}

					.rsc-theme-example__range-control input {
						width: 100%;
					}

					@media (prefers-color-scheme: dark) {
						.rsc-theme-example {
							--rsc-theme-border: #334155;
							--rsc-theme-canvas: #020617;
							--rsc-theme-stroke: #38bdf8;
						}
					}
				`}
			</style>

			<h1>Tools</h1>
			<div className="rsc-theme-example__tools">
				<fieldset className="rsc-theme-example__tool-group">
					<legend>Canvas theme</legend>
					<div className="rsc-theme-example__button-row">
						<button
							type="button"
							disabled={theme === "light"}
							onClick={() => setTheme("light")}
						>
							Light
						</button>
						<button
							type="button"
							disabled={theme === "dark"}
							onClick={() => setTheme("dark")}
						>
							Dark
						</button>
					</div>
				</fieldset>

				<fieldset className="rsc-theme-example__tool-group">
					<legend>Mode</legend>
					<div className="rsc-theme-example__button-row">
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

				<div className="rsc-theme-example__tool-group">
					<label
						className="rsc-theme-example__range-control"
						htmlFor="strokeWidth"
					>
						<span>Stroke width</span>
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
					<label
						className="rsc-theme-example__range-control"
						htmlFor="eraserWidth"
					>
						<span>Eraser width</span>
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

				<fieldset className="rsc-theme-example__tool-group">
					<legend>Eraser mode</legend>
					<div className="rsc-theme-example__radio-row">
						<label>
							<input
								type="radio"
								name="eraserMode"
								value="mask"
								checked={eraserMode === "mask"}
								onChange={handleEraserModeChange}
							/>
							Mask
						</label>
						<label>
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
			<div className="rsc-theme-example__surface">
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
