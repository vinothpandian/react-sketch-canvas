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
		<div>
			<h1>Tools</h1>
			<div>
				<button type="button" disabled={!eraseMode} onClick={handlePenClick}>
					Pen
				</button>
				<button type="button" disabled={eraseMode} onClick={handleEraserClick}>
					Eraser
				</button>
				<div />
				<button type="button" onClick={handleUndoClick}>
					Undo
				</button>
				<button type="button" onClick={handleRedoClick}>
					Redo
				</button>
				<button type="button" onClick={handleClearClick}>
					Clear
				</button>
				<button type="button" onClick={handleResetClick}>
					Reset
				</button>
			</div>
			<h1>Canvas</h1>
			<ReactSketchCanvas ref={canvasRef} />
		</div>
	);
}
