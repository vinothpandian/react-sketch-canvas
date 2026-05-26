import { Eraser, Pencil, Redo2, RotateCcw, Trash2, Undo2 } from "lucide-react";
import { useRef, useState } from "react";
import {
	ReactSketchCanvas,
	type ReactSketchCanvasRef,
} from "react-sketch-canvas";

export default function App() {
	const canvasRef = useRef<ReactSketchCanvasRef>(null);
	const [eraseMode, setEraseMode] = useState(false);

	const handleEraserClick = () => {
		setEraseMode(true);
		canvasRef.current?.eraseMode(true);
	};

	const handlePenClick = () => {
		setEraseMode(false);
		canvasRef.current?.eraseMode(false);
	};

	const handleUndoClick = () => {
		canvasRef.current?.undo();
	};

	const handleRedoClick = () => {
		canvasRef.current?.redo();
	};

	const handleClearClick = () => {
		canvasRef.current?.clearCanvas();
	};

	const handleResetClick = () => {
		canvasRef.current?.resetCanvas();
	};

	return (
		<div className="not-prose flex flex-col gap-4 w-full">
			{/* Unified History & Utility Drawing Toolbar */}
			<div className="flex flex-wrap items-center justify-between gap-4 p-3 rounded-lg border border-fd-border bg-fd-card shadow-sm text-fd-foreground">
				{/* Draw vs Erase Segment */}
				<div className="flex items-center gap-2">
					<div className="inline-flex rounded-md p-1 bg-fd-muted border border-fd-border">
						<button
							type="button"
							onClick={handlePenClick}
							className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${
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
							className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${
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

				{/* History Actions (Undo/Redo) */}
				<div className="flex items-center gap-1.5">
					<button
						type="button"
						onClick={handleUndoClick}
						title="Undo (Ctrl+Z)"
						className="inline-flex items-center justify-center p-2 rounded-md border border-fd-border bg-fd-card text-fd-foreground hover:bg-fd-accent transition-colors duration-150 shadow-sm"
					>
						<Undo2 className="w-4 h-4" />
						<span className="sr-only">Undo</span>
					</button>
					<button
						type="button"
						onClick={handleRedoClick}
						title="Redo (Ctrl+Y)"
						className="inline-flex items-center justify-center p-2 rounded-md border border-fd-border bg-fd-card text-fd-foreground hover:bg-fd-accent transition-colors duration-150 shadow-sm"
					>
						<Redo2 className="w-4 h-4" />
						<span className="sr-only">Redo</span>
					</button>
				</div>

				{/* Canvas Cleanup Actions */}
				<div className="flex items-center gap-2">
					<button
						type="button"
						onClick={handleClearClick}
						className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-fd-border bg-fd-card text-xs font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all duration-150 shadow-sm"
					>
						<Trash2 className="w-3.5 h-3.5" />
						Clear
					</button>
					<button
						type="button"
						onClick={handleResetClick}
						className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-fd-border bg-fd-card text-xs font-medium text-fd-foreground hover:bg-fd-accent transition-all duration-150 shadow-sm"
					>
						<RotateCcw className="w-3.5 h-3.5" />
						Reset
					</button>
				</div>
			</div>

			{/* Drawing Workspace */}
			<div className="relative overflow-hidden rounded-lg border border-fd-border aspect-video min-h-[240px] shadow-sm">
				<ReactSketchCanvas
					ref={canvasRef}
					strokeColor="var(--color-fd-primary)"
					canvasColor="transparent"
				/>
			</div>
		</div>
	);
}
