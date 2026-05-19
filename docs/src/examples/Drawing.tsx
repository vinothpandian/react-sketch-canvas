import { type ChangeEvent, useRef, useState } from "react";
import {
	ReactSketchCanvas,
	type ReactSketchCanvasRef,
} from "react-sketch-canvas";

export default function App() {
	const canvasRef = useRef<ReactSketchCanvasRef>(null);
	const [eraseMode, setEraseMode] = useState(false);
	const [strokeWidth, setStrokeWidth] = useState(5);
	const [eraserWidth, setEraserWidth] = useState(10);

	const handleEraserClick = () => {
		setEraseMode(true);
		canvasRef.current?.eraseMode(true);
	};

	const handlePenClick = () => {
		setEraseMode(false);
		canvasRef.current?.eraseMode(false);
	};

	const handleStrokeWidthChange = (event: ChangeEvent<HTMLInputElement>) => {
		setStrokeWidth(+event.target.value);
	};

	const handleEraserWidthChange = (event: ChangeEvent<HTMLInputElement>) => {
		setEraserWidth(+event.target.value);
	};

	return (
		<div>
			<h1>Tools</h1>
			<div>
				<button type="button" disabled={!eraseMode} onClick={handlePenClick}>
					Pen
				</button>
				<button type="button" disabled={eraseMode} onClick={handleEraserClick}>
					Eraser
				</button>
				<label htmlFor="strokeWidth">Stroke width</label>
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
				<label htmlFor="eraserWidth">Eraser width</label>
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
			</div>
			<h1>Canvas</h1>
			<ReactSketchCanvas
				ref={canvasRef}
				strokeWidth={strokeWidth}
				eraserWidth={eraserWidth}
			/>
		</div>
	);
}
