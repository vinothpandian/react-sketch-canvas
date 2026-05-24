import {
	IconArrowBackUp,
	IconArrowForwardUp,
	IconDownload,
	IconEraser,
	IconPencil,
	IconRestore,
	IconTrash,
} from "@tabler/icons-react";
import { type ChangeEvent, useEffect, useRef, useState } from "react";
import {
	type EraserMode,
	ReactSketchCanvas,
	type ReactSketchCanvasRef,
} from "react-sketch-canvas";
import paths from "../assets/initialSketch.json";

const toolButtonClass =
	"inline-flex h-8 min-w-0 flex-1 items-center justify-center gap-2 rounded-sm px-3 text-sm transition-colors hover:bg-fd-accent hover:text-fd-accent-foreground aria-pressed:bg-fd-primary aria-pressed:text-fd-primary-foreground";

const actionButtonClass =
	"inline-flex h-9 items-center justify-center gap-2 rounded-md border bg-fd-background px-3 text-sm transition-colors hover:bg-fd-accent hover:text-fd-accent-foreground";

const rangeInputClass =
	"h-2 w-full cursor-pointer accent-fd-primary disabled:cursor-not-allowed disabled:opacity-60";

export function HomePageDemo() {
	const [eraser, setEraser] = useState(false);
	const ref = useRef<ReactSketchCanvasRef>(null);
	const [strokeColor, setStrokeColor] = useState("#6497eb");
	const [canvasColor, setCanvasColor] = useState("#ffffff");
	const [strokeWidth, setStrokeWidth] = useState(4);
	const [eraserWidth, setEraserWidth] = useState(14);
	const [eraserMode, setEraserMode] = useState<EraserMode>("mask");
	const [exportMessage, setExportMessage] = useState("PNG");

	useEffect(() => {
		if (ref.current) {
			ref.current.loadPaths(paths);
		}
	}, []);

	const handleEraserClick = () => {
		setEraser(true);
		if (ref.current) {
			ref.current.eraseMode(true);
		}
	};

	const handlePencilClick = () => {
		setEraser(false);
		if (ref.current) {
			ref.current.eraseMode(false);
		}
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
		anchor.click();
		setExportMessage("Saved");
		window.setTimeout(() => setExportMessage("PNG"), 1600);
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
		setEraserMode(mode);
	};

	return (
		<div className="not-prose overflow-hidden rounded-xl border bg-fd-card shadow-sm">
			<div className="grid gap-0 bg-[linear-gradient(135deg,var(--color-fd-muted),transparent)] p-3 lg:grid-cols-[minmax(0,1fr)_18rem]">
				<div className="overflow-hidden rounded-t-lg border bg-fd-background lg:rounded-r-none lg:rounded-bl-lg">
					<div className="h-full">
						<ReactSketchCanvas
							ref={ref}
							canvasColor={canvasColor}
							eraserMode={eraserMode}
							eraserWidth={eraserWidth}
							height="100%"
							strokeColor={strokeColor}
							strokeWidth={strokeWidth}
						/>
					</div>
				</div>
				<div className="grid gap-4 rounded-b-lg border border-t-0 bg-fd-background p-3 lg:rounded-r-lg lg:rounded-bl-none lg:border-t lg:border-l-0">
					<fieldset className="grid gap-2">
						<legend className="mb-2 font-medium text-fd-muted-foreground text-xs uppercase">
							Tool
						</legend>
						<div className="flex rounded-md border bg-fd-card p-0.5">
							<button
								type="button"
								aria-pressed={!eraser}
								className={toolButtonClass}
								title="Draw"
								onClick={handlePencilClick}
							>
								<IconPencil aria-hidden="true" size={18} />
								<span>Pen</span>
							</button>
							<button
								type="button"
								aria-pressed={eraser}
								className={toolButtonClass}
								title="Erase"
								onClick={handleEraserClick}
							>
								<IconEraser aria-hidden="true" size={18} />
								<span>Eraser</span>
							</button>
						</div>
					</fieldset>

					<fieldset className="grid gap-2">
						<legend className="mb-2 font-medium text-fd-muted-foreground text-xs uppercase">
							Eraser mode
						</legend>
						<div className="grid grid-cols-2 rounded-md border bg-fd-card p-0.5">
							<button
								type="button"
								aria-pressed={eraserMode === "mask"}
								className="inline-flex h-8 items-center justify-center rounded-sm px-3 text-sm transition-colors hover:bg-fd-accent hover:text-fd-accent-foreground aria-pressed:bg-fd-primary aria-pressed:text-fd-primary-foreground"
								onClick={() => handleEraserModeClick("mask")}
							>
								<span>Mask</span>
							</button>
							<button
								type="button"
								aria-pressed={eraserMode === "stroke"}
								className="inline-flex h-8 items-center justify-center rounded-sm px-3 text-sm transition-colors hover:bg-fd-accent hover:text-fd-accent-foreground aria-pressed:bg-fd-primary aria-pressed:text-fd-primary-foreground"
								onClick={() => handleEraserModeClick("stroke")}
							>
								<span>Stroke</span>
							</button>
						</div>
					</fieldset>

					<div className="grid gap-3">
						<label className="grid gap-1.5 text-sm" htmlFor="home-stroke-width">
							<span className="flex items-center justify-between">
								<span className="font-medium">Stroke width</span>
								<span className="text-fd-muted-foreground">
									{strokeWidth}px
								</span>
							</span>
							<input
								className={rangeInputClass}
								disabled={eraser}
								id="home-stroke-width"
								max="20"
								min="1"
								step="1"
								type="range"
								value={strokeWidth}
								onChange={onStrokeWidthChange}
							/>
						</label>
						<label className="grid gap-1.5 text-sm" htmlFor="home-eraser-width">
							<span className="flex items-center justify-between">
								<span className="font-medium">Eraser width</span>
								<span className="text-fd-muted-foreground">
									{eraserWidth}px
								</span>
							</span>
							<input
								className={rangeInputClass}
								disabled={!eraser}
								id="home-eraser-width"
								max="40"
								min="4"
								step="1"
								type="range"
								value={eraserWidth}
								onChange={onEraserWidthChange}
							/>
						</label>
					</div>

					<div className="grid grid-cols-2 gap-2">
						<label
							className="inline-flex h-10 items-center justify-between gap-2 rounded-md border bg-fd-card px-3 text-sm"
							title="Ink color"
						>
							<span>Ink</span>
							<input
								aria-label="Ink color"
								className="size-6 cursor-pointer rounded border bg-transparent p-0"
								title="Ink color"
								type="color"
								value={strokeColor}
								onChange={onStrokeColorChange}
							/>
						</label>
						<label
							className="inline-flex h-10 items-center justify-between gap-2 rounded-md border bg-fd-card px-3 text-sm"
							title="Canvas color"
						>
							<span>Canvas</span>
							<input
								aria-label="Canvas color"
								className="size-6 cursor-pointer rounded border bg-transparent p-0"
								title="Canvas color"
								type="color"
								value={canvasColor}
								onChange={onCanvasColorChange}
							/>
						</label>
					</div>

					<div className="grid grid-cols-2 gap-2">
						<button
							type="button"
							className={actionButtonClass}
							title="Undo"
							onClick={handleUndoClick}
						>
							<IconArrowBackUp aria-hidden="true" size={18} />
							<span>Undo</span>
						</button>
						<button
							type="button"
							className={actionButtonClass}
							title="Redo"
							onClick={handleRedoClick}
						>
							<IconArrowForwardUp aria-hidden="true" size={18} />
							<span>Redo</span>
						</button>
						<button
							type="button"
							className={actionButtonClass}
							title="Clear"
							onClick={handleClearClick}
						>
							<IconTrash aria-hidden="true" size={18} />
							<span>Clear</span>
						</button>
						<button
							type="button"
							className={actionButtonClass}
							title="Reset"
							onClick={handleResetClick}
						>
							<IconRestore aria-hidden="true" size={18} />
							<span>Reset</span>
						</button>
						<button
							type="button"
							className={`${actionButtonClass} col-span-2`}
							title="Export PNG"
							onClick={handleExportClick}
						>
							<IconDownload aria-hidden="true" size={18} />
							<span>Export {exportMessage}</span>
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
