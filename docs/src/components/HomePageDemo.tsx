import { IconEraser, IconPencil, IconRestore } from "@tabler/icons-react";
import { type ChangeEvent, useEffect, useRef, useState } from "react";
import {
	ReactSketchCanvas,
	type ReactSketchCanvasRef,
} from "react-sketch-canvas";
import paths from "../assets/initialSketch.json";

export function HomePageDemo() {
	const [eraser, setEraser] = useState(false);
	const ref = useRef<ReactSketchCanvasRef>(null);
	const [strokeColor, setStrokeColor] = useState("#6497eb");

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
		if (ref.current) {
			ref.current.resetCanvas();
		}
	};

	const onColorChange = (event: ChangeEvent<HTMLInputElement>) => {
		setStrokeColor(event.target.value);
	};

	return (
		<div className="not-prose overflow-hidden rounded-xl border bg-fd-card shadow-sm">
			<div className="bg-[linear-gradient(135deg,var(--color-fd-muted),transparent)] p-3">
				<div className="overflow-hidden rounded-lg border bg-fd-background">
					<ReactSketchCanvas
						ref={ref}
						canvasColor="transparent"
						height="400px"
						strokeWidth={4}
						strokeColor={strokeColor}
					/>
				</div>
			</div>
			<div className="flex flex-wrap items-center gap-3 border-t bg-fd-muted/30 p-3">
				<label
					className="inline-flex h-9 items-center gap-2 rounded-md border bg-fd-background px-3 font-medium text-sm"
					title="Ink color"
				>
					<span>Ink</span>
					<input
						aria-label="Ink color"
						className="size-5 cursor-pointer rounded border bg-transparent p-0"
						title="Ink color"
						type="color"
						value={strokeColor}
						onChange={onColorChange}
					/>
				</label>
				<fieldset className="flex items-center rounded-md border bg-fd-background p-0.5">
					<legend className="sr-only">Drawing mode</legend>
					<button
						type="button"
						aria-pressed={!eraser}
						className="inline-flex h-8 items-center gap-2 rounded-sm px-3 text-sm transition-colors hover:bg-fd-accent hover:text-fd-accent-foreground aria-pressed:bg-fd-primary aria-pressed:text-fd-primary-foreground"
						title="Draw"
						onClick={handlePencilClick}
					>
						<IconPencil aria-hidden="true" size={20} />
						<span>Draw</span>
					</button>
					<button
						type="button"
						aria-pressed={eraser}
						className="inline-flex h-8 items-center gap-2 rounded-sm px-3 text-sm transition-colors hover:bg-fd-accent hover:text-fd-accent-foreground aria-pressed:bg-fd-primary aria-pressed:text-fd-primary-foreground"
						title="Erase"
						onClick={handleEraserClick}
					>
						<IconEraser aria-hidden="true" size={20} />
						<span>Erase</span>
					</button>
				</fieldset>
				<button
					type="button"
					className="inline-flex h-9 items-center gap-2 rounded-md border bg-fd-background px-3 text-sm transition-colors hover:bg-fd-accent hover:text-fd-accent-foreground"
					title="Reset"
					onClick={handleResetClick}
				>
					<IconRestore aria-hidden="true" size={20} />
					<span>Reset</span>
				</button>
			</div>
		</div>
	);
}
