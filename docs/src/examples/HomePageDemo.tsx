import {
	Download,
	Eraser,
	FileCode2,
	ImageDown,
	Pencil,
	Redo2,
	RotateCcw,
	Trash2,
	Undo2,
} from "lucide-react";
import { type ChangeEvent, useEffect, useRef, useState } from "react";
import {
	type EraserMode,
	ReactSketchCanvas,
	type ReactSketchCanvasRef,
} from "react-sketch-canvas";
import paths from "../assets/initialSketch.json";

interface ColorPreset {
	name: string;
	canvas: string;
	stroke: string;
}

const PRESETS: ColorPreset[] = [
	{ name: "Pine Forest", canvas: "#f4f8f6", stroke: "#106358" },
	{ name: "Terminal", canvas: "#090d16", stroke: "#10b981" },
];

const toolButtonClass =
	"inline-flex size-10 shrink-0 items-center justify-center rounded-md text-fd-muted-foreground transition-colors duration-150 hover:bg-fd-accent hover:text-fd-foreground aria-pressed:bg-fd-primary aria-pressed:text-fd-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-primary";

const panelButtonClass =
	"h-9 rounded-md border border-fd-border bg-fd-card px-2 text-xs font-medium transition-colors duration-150 hover:bg-fd-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-primary";

const downloadDrawing = (contents: string, filename: string, type?: string) => {
	const anchor = document.createElement("a");
	const url = type
		? URL.createObjectURL(new Blob([contents], { type }))
		: contents;

	anchor.href = url;
	anchor.download = filename;
	document.body.append(anchor);
	anchor.click();
	anchor.remove();

	if (type) {
		window.setTimeout(() => URL.revokeObjectURL(url), 1000);
	}
};

export default function HomePageDemo() {
	const [eraser, setEraser] = useState(false);
	const ref = useRef<ReactSketchCanvasRef>(null);
	const exportStatusTimeoutRef = useRef<number | null>(null);
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

	useEffect(() => {
		return () => {
			if (exportStatusTimeoutRef.current !== null) {
				window.clearTimeout(exportStatusTimeoutRef.current);
			}
		};
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

	const showExportStatus = (message: string) => {
		if (exportStatusTimeoutRef.current !== null) {
			window.clearTimeout(exportStatusTimeoutRef.current);
		}

		setExportStatus(message);
		exportStatusTimeoutRef.current = window.setTimeout(() => {
			setExportStatus("");
			exportStatusTimeoutRef.current = null;
		}, 1600);
	};

	const handleExportPngClick = async () => {
		try {
			const image = await ref.current?.exportImage("png");

			if (!image) {
				return;
			}

			downloadDrawing(image, "react-sketch-canvas-demo.png");
			showExportStatus("PNG downloaded");
		} catch {
			showExportStatus("PNG export failed");
		}
	};

	const handleExportSvgClick = async () => {
		try {
			const svg = await ref.current?.exportSvg();

			if (!svg) {
				return;
			}

			downloadDrawing(
				svg,
				"react-sketch-canvas-demo.svg",
				"image/svg+xml;charset=utf-8",
			);
			showExportStatus("SVG downloaded");
		} catch {
			showExportStatus("SVG export failed");
		}
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

	const applyPreset = (preset: ColorPreset) => {
		setCanvasColor(preset.canvas);
		setStrokeColor(preset.stroke);
	};

	return (
		<div className="not-prose grid w-full overflow-hidden rounded-lg border border-fd-border bg-fd-card text-fd-foreground shadow-sm md:grid-cols-[minmax(13.5rem,20rem)_minmax(0,1fr)]">
			<aside className="grid border-fd-border border-b bg-fd-card md:grid-cols-[3.25rem_minmax(0,1fr)] md:border-r md:border-b-0">
				<div className="flex gap-1 overflow-x-auto border-fd-border border-b bg-fd-muted p-1.5 md:grid md:content-start md:overflow-visible md:border-r md:border-b-0">
					<button
						type="button"
						aria-label="Use pen"
						aria-pressed={!eraser}
						className={toolButtonClass}
						title="Pen"
						onClick={handlePencilClick}
					>
						<Pencil className="size-4" />
					</button>
					<button
						type="button"
						aria-label="Use eraser"
						aria-pressed={eraser}
						className={toolButtonClass}
						title="Eraser"
						onClick={handleEraserClick}
					>
						<Eraser className="size-4" />
					</button>
					<button
						type="button"
						className={toolButtonClass}
						title="Undo"
						aria-label="Undo"
						onClick={handleUndoClick}
					>
						<Undo2 className="size-4" />
					</button>
					<button
						type="button"
						className={toolButtonClass}
						title="Redo"
						aria-label="Redo"
						onClick={handleRedoClick}
					>
						<Redo2 className="size-4" />
					</button>
					<button
						type="button"
						className={toolButtonClass}
						title="Clear canvas"
						aria-label="Clear canvas"
						onClick={handleClearClick}
					>
						<Trash2 className="size-4" />
					</button>
					<button
						type="button"
						className={toolButtonClass}
						title="Reset demo"
						aria-label="Reset demo"
						onClick={handleResetClick}
					>
						<RotateCcw className="size-4" />
					</button>
				</div>
				<div className="grid content-start gap-3 p-3">
					<div className="flex min-w-0 items-center justify-between gap-2">
						<span className="rounded border border-fd-border bg-fd-muted px-1.5 py-0.5 font-medium text-[11px] text-fd-muted-foreground">
							{eraser ? "Eraser" : "Pen"}
						</span>
						<div className="inline-flex rounded-md border border-fd-border bg-fd-muted p-0.5">
							<button
								type="button"
								aria-pressed={eraserMode === "mask"}
								className="h-8 rounded px-2 text-[11px] font-medium transition-colors duration-150 hover:bg-fd-accent aria-pressed:bg-fd-primary aria-pressed:text-fd-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-primary disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:bg-transparent"
								disabled={!eraser}
								onClick={() => handleEraserModeClick("mask")}
							>
								Mask
							</button>
							<button
								type="button"
								aria-pressed={eraserMode === "stroke"}
								className="h-8 rounded px-2 text-[11px] font-medium transition-colors duration-150 hover:bg-fd-accent aria-pressed:bg-fd-primary aria-pressed:text-fd-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-primary disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:bg-transparent"
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
							className="h-8 w-full cursor-pointer accent-fd-primary disabled:cursor-not-allowed"
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
							className="h-8 w-full cursor-pointer accent-fd-primary disabled:cursor-not-allowed"
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
							className="inline-flex h-9 items-center justify-between rounded-md border border-fd-border bg-fd-muted px-2 text-xs font-medium"
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
							className="inline-flex h-9 items-center justify-between rounded-md border border-fd-border bg-fd-muted px-2 text-xs font-medium"
							title="Canvas color"
						>
							Background
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

					<div className="grid gap-1.5">
						<span className="text-[11px] font-medium text-fd-muted-foreground">
							Presets
						</span>
						<div className="grid grid-cols-2 gap-1.5">
							{PRESETS.map((preset) => {
								const isActive =
									canvasColor.toLowerCase() === preset.canvas.toLowerCase() &&
									strokeColor.toLowerCase() === preset.stroke.toLowerCase();

								return (
									<button
										key={preset.name}
										type="button"
										aria-pressed={isActive}
										className="inline-flex h-9 min-w-0 items-center gap-1.5 rounded-md border border-fd-border bg-fd-card px-2 text-left text-[11px] font-medium text-fd-muted-foreground transition-colors duration-150 hover:bg-fd-accent hover:text-fd-foreground aria-pressed:border-fd-primary aria-pressed:bg-fd-primary/10 aria-pressed:text-fd-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-primary"
										title={preset.name}
										onClick={() => applyPreset(preset)}
									>
										<span className="flex shrink-0 -space-x-1">
											<span
												className="size-3 rounded-full border border-fd-border"
												style={{ backgroundColor: preset.stroke }}
											/>
											<span
												className="size-3 rounded-full border border-fd-border"
												style={{ backgroundColor: preset.canvas }}
											/>
										</span>
										<span className="min-w-0 truncate">{preset.name}</span>
									</button>
								);
							})}
						</div>
					</div>

					<div className="grid gap-1.5 border-fd-border border-t pt-3">
						<span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-fd-muted-foreground">
							<Download className="size-3.5" />
							Download
						</span>
						<div className="grid grid-cols-2 gap-1.5">
							<button
								type="button"
								className="inline-flex h-9 items-center justify-center gap-1.5 rounded-md bg-fd-primary px-2 text-xs font-medium text-fd-primary-foreground transition-colors duration-150 hover:bg-fd-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-primary"
								title="Download drawing as SVG"
								onClick={handleExportSvgClick}
							>
								<FileCode2 className="size-3.5" />
								SVG
							</button>
							<button
								type="button"
								className={panelButtonClass}
								title="Download drawing as PNG"
								onClick={handleExportPngClick}
							>
								<span className="inline-flex items-center justify-center gap-1.5">
									<ImageDown className="size-3.5" />
									PNG
								</span>
							</button>
						</div>
					</div>
				</div>
			</aside>

			<div className="relative min-h-[300px] overflow-hidden bg-fd-card sm:min-h-[380px] lg:min-h-[520px]">
				<ReactSketchCanvas
					ref={ref}
					canvasColor={canvasColor}
					eraserMode={eraserMode}
					eraserWidth={eraserWidth}
					height="100%"
					strokeColor={strokeColor}
					strokeWidth={strokeWidth}
				/>
				<div aria-live="polite" className="absolute right-3 bottom-3">
					{exportStatus ? (
						<p className="rounded-md border border-fd-border bg-fd-card px-2 py-1 text-fd-muted-foreground text-xs">
							{exportStatus}
						</p>
					) : null}
				</div>
			</div>
		</div>
	);
}
