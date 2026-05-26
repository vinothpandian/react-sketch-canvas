import { Download, Eraser, Pencil, Redo2, Undo2 } from "lucide-react";
import { type ChangeEvent, useEffect, useRef, useState } from "react";
import {
	type EraserMode,
	ReactSketchCanvas,
	type ReactSketchCanvasRef,
} from "react-sketch-canvas";
import paths from "../assets/initialSketch.json";

export default function HomePageDemo() {
	const [eraser, setEraser] = useState(false);
	const ref = useRef<ReactSketchCanvasRef>(null);
	const [strokeColor, setStrokeColor] = useState("#6497eb");
	// impeccable-ignore-colors: the kitchen-sink demo exposes the literal white canvas default through a color picker.
	const [canvasColor, setCanvasColor] = useState("#ffffff");
	const [strokeWidth, setStrokeWidth] = useState(4);
	const [eraserWidth, setEraserWidth] = useState(14);
	const [eraserMode, setEraserMode] = useState<EraserMode>("mask");
	const [exportStatus, setExportStatus] = useState("");

	useEffect(() => {
		if (ref.current) {
			ref.current.loadPaths(paths);
		}
	}, []);

	const handleEraserClick = () => {
		setEraser(true);
		ref.current?.eraseMode(true);
	};

	const handlePencilClick = () => {
		setEraser(false);
		ref.current?.eraseMode(false);
	};

	const handleResetClick = () => {
		setEraser(false);
		ref.current?.resetCanvas();
		window.requestAnimationFrame(() => ref.current?.loadPaths(paths));
	};

	const handleClearClick = () => {
		ref.current?.clearCanvas();
	};

	const handleUndoClick = () => {
		ref.current?.undo();
	};

	const handleRedoClick = () => {
		ref.current?.redo();
	};

	const handleExportClick = async () => {
		const image = await ref.current?.exportImage("png");

		if (!image) {
			return;
		}

		const anchor = document.createElement("a");
		anchor.href = image;
		anchor.download = "react-sketch-canvas-demo.png";
		document.body.append(anchor);
		anchor.click();
		anchor.remove();
		setExportStatus("PNG saved");
		window.setTimeout(() => setExportStatus(""), 1600);
	};

	const onStrokeColorChange = (event: ChangeEvent<HTMLInputElement>) => {
		setStrokeColor(event.target.value);
	};

	const onCanvasColorChange = (event: ChangeEvent<HTMLInputElement>) => {
		setCanvasColor(event.target.value);
	};

	const onStrokeWidthChange = (event: ChangeEvent<HTMLInputElement>) => {
		setStrokeWidth(Number(event.target.value));
	};

	const onEraserWidthChange = (event: ChangeEvent<HTMLInputElement>) => {
		setEraserWidth(Number(event.target.value));
	};

	const handleEraserModeClick = (mode: EraserMode) => {
		if (!eraser) {
			return;
		}

		setEraserMode(mode);
	};

	return (
		<div className="not-prose grid w-full gap-4 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-stretch">
			<div className="min-h-[260px] rounded-lg border border-fd-border bg-fd-card text-fd-foreground shadow-sm sm:min-h-[340px] lg:sticky lg:top-20 lg:min-h-[520px]">
				<div className="grid h-full grid-cols-[2.75rem_1fr]">
					<div className="grid h-full content-start gap-1 border-fd-border border-r bg-fd-muted p-1.5">
						<button
							type="button"
							aria-label="Use pen"
							aria-pressed={!eraser}
							className="inline-flex size-8 items-center justify-center rounded-md text-fd-muted-foreground transition-colors duration-150 hover:bg-fd-accent hover:text-fd-foreground aria-pressed:bg-fd-primary aria-pressed:text-fd-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-primary"
							title="Pen"
							onClick={handlePencilClick}
						>
							<Pencil className="size-3.5" />
						</button>
						<button
							type="button"
							aria-label="Use eraser"
							aria-pressed={eraser}
							className="inline-flex size-8 items-center justify-center rounded-md text-fd-muted-foreground transition-colors duration-150 hover:bg-fd-accent hover:text-fd-foreground aria-pressed:bg-fd-primary aria-pressed:text-fd-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-primary"
							title="Eraser"
							onClick={handleEraserClick}
						>
							<Eraser className="size-3.5" />
						</button>
						<button
							type="button"
							className="inline-flex size-8 items-center justify-center rounded-md text-fd-muted-foreground transition-colors duration-150 hover:bg-fd-accent hover:text-fd-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-primary"
							title="Undo"
							aria-label="Undo"
							onClick={handleUndoClick}
						>
							<Undo2 className="size-3.5" />
						</button>
						<button
							type="button"
							className="inline-flex size-8 items-center justify-center rounded-md text-fd-muted-foreground transition-colors duration-150 hover:bg-fd-accent hover:text-fd-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-primary"
							title="Redo"
							aria-label="Redo"
							onClick={handleRedoClick}
						>
							<Redo2 className="size-3.5" />
						</button>
						<button
							type="button"
							className="inline-flex size-8 items-center justify-center rounded-md text-fd-muted-foreground transition-colors duration-150 hover:bg-fd-accent hover:text-fd-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-primary"
							title="Export PNG"
							aria-label="Export PNG"
							onClick={handleExportClick}
						>
							<Download className="size-3.5" />
						</button>
					</div>
					<div className="grid h-full content-start gap-2 p-2.5">
						<div className="flex items-center justify-between gap-2">
							<span className="rounded border border-fd-border bg-fd-muted px-1.5 py-0.5 font-medium text-[11px] text-fd-muted-foreground">
								{eraser ? "Eraser" : "Pen"}
							</span>
							<div className="inline-flex rounded-md border border-fd-border bg-fd-muted p-0.5">
								<button
									type="button"
									aria-pressed={eraserMode === "mask"}
									className="h-7 rounded px-2 text-[11px] font-medium transition-colors duration-150 hover:bg-fd-accent aria-pressed:bg-fd-primary aria-pressed:text-fd-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-primary disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:bg-transparent"
									disabled={!eraser}
									onClick={() => handleEraserModeClick("mask")}
								>
									Mask
								</button>
								<button
									type="button"
									aria-pressed={eraserMode === "stroke"}
									className="h-7 rounded px-2 text-[11px] font-medium transition-colors duration-150 hover:bg-fd-accent aria-pressed:bg-fd-primary aria-pressed:text-fd-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-primary disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:bg-transparent"
									disabled={!eraser}
									onClick={() => handleEraserModeClick("stroke")}
								>
									Stroke
								</button>
							</div>
						</div>

						<label
							className={`grid gap-1 ${eraser ? "opacity-40" : "opacity-100"}`}
							htmlFor="home-v3-stroke-width"
						>
							<span className="flex items-center justify-between text-[11px] font-medium text-fd-muted-foreground">
								Stroke
								<span className="font-mono text-fd-foreground">
									{strokeWidth}px
								</span>
							</span>
							<input
								className="h-7 w-full cursor-pointer accent-fd-primary disabled:cursor-not-allowed"
								disabled={eraser}
								id="home-v3-stroke-width"
								max="20"
								min="1"
								step="1"
								type="range"
								value={strokeWidth}
								onChange={onStrokeWidthChange}
							/>
						</label>
						<label
							className={`grid gap-1 ${eraser ? "opacity-100" : "opacity-40"}`}
							htmlFor="home-v3-eraser-width"
						>
							<span className="flex items-center justify-between text-[11px] font-medium text-fd-muted-foreground">
								Eraser
								<span className="font-mono text-fd-foreground">
									{eraserWidth}px
								</span>
							</span>
							<input
								className="h-7 w-full cursor-pointer accent-fd-primary disabled:cursor-not-allowed"
								disabled={!eraser}
								id="home-v3-eraser-width"
								max="40"
								min="4"
								step="1"
								type="range"
								value={eraserWidth}
								onChange={onEraserWidthChange}
							/>
						</label>

						<div className="grid grid-cols-2 gap-1.5">
							<label
								className="inline-flex h-8 items-center justify-between rounded-md border border-fd-border bg-fd-muted px-2 text-[11px] font-medium"
								title="Ink color"
							>
								Ink
								<input
									aria-label="Ink color"
									className="size-5 cursor-pointer rounded border border-fd-border bg-transparent p-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-primary"
									title="Ink color"
									type="color"
									value={strokeColor}
									onChange={onStrokeColorChange}
								/>
							</label>
							<label
								className="inline-flex h-8 items-center justify-between rounded-md border border-fd-border bg-fd-muted px-2 text-[11px] font-medium"
								title="Canvas color"
							>
								BG
								<input
									aria-label="Canvas color"
									className="size-5 cursor-pointer rounded border border-fd-border bg-transparent p-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-primary"
									title="Canvas color"
									type="color"
									value={canvasColor}
									onChange={onCanvasColorChange}
								/>
							</label>
						</div>

						<div className="grid grid-cols-2 gap-1.5">
							<button
								type="button"
								className="h-8 rounded-md border border-fd-border bg-fd-card text-[11px] font-medium transition-colors duration-150 hover:bg-fd-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-primary"
								title="Clear"
								onClick={handleClearClick}
							>
								Clear
							</button>
							<button
								type="button"
								className="h-8 rounded-md border border-fd-border bg-fd-card text-[11px] font-medium transition-colors duration-150 hover:bg-fd-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-primary"
								title="Reset"
								onClick={handleResetClick}
							>
								Reset
							</button>
						</div>
					</div>
				</div>
			</div>

			<div className="relative h-full min-h-[260px] overflow-hidden rounded-lg border border-fd-border bg-fd-card shadow-sm sm:min-h-[340px] lg:col-start-1 lg:row-start-1 lg:min-h-[520px]">
				<ReactSketchCanvas
					ref={ref}
					canvasColor={canvasColor}
					eraserMode={eraserMode}
					eraserWidth={eraserWidth}
					height="100%"
					strokeColor={strokeColor}
					strokeWidth={strokeWidth}
				/>
				<p
					aria-live="polite"
					className="absolute right-3 bottom-3 min-h-5 rounded-md border border-fd-border bg-fd-card px-2 py-1 text-fd-muted-foreground text-xs"
				>
					{exportStatus}
				</p>
			</div>
		</div>
	);
}
