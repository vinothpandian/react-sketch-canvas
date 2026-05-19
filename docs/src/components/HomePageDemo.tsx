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
		<div>
			<ReactSketchCanvas
				ref={ref}
				canvasColor="transparent"
				height="400px"
				strokeWidth={4}
				strokeColor={strokeColor}
			/>
			<div>
				<label title="Ink color">
					Ink color
					<input
						aria-label="Ink color"
						title="Ink color"
						type="color"
						value={strokeColor}
						onChange={onColorChange}
					/>
				</label>
				<fieldset>
					<legend>Drawing mode</legend>
					<button
						type="button"
						aria-pressed={!eraser}
						title="Draw"
						onClick={handlePencilClick}
					>
						<IconPencil aria-hidden="true" size={20} />
						<span>Draw</span>
					</button>
					<button
						type="button"
						aria-pressed={eraser}
						title="Erase"
						onClick={handleEraserClick}
					>
						<IconEraser aria-hidden="true" size={20} />
						<span>Erase</span>
					</button>
				</fieldset>
				<button type="button" title="Reset" onClick={handleResetClick}>
					<IconRestore aria-hidden="true" size={20} />
					<span>Reset</span>
				</button>
			</div>
		</div>
	);
}
