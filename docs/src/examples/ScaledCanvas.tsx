import { type ChangeEvent, useRef, useState } from "react";
import {
	ReactSketchCanvas,
	type ReactSketchCanvasRef,
} from "react-sketch-canvas";

export default function App() {
	const canvasRef = useRef<ReactSketchCanvasRef>(null);
	const [scale, setScale] = useState(1);

	const handleScaleChange = (event: ChangeEvent<HTMLInputElement>) => {
		setScale(Number(event.target.value));
	};

	const handleClear = () => {
		canvasRef.current?.clearCanvas();
	};

	return (
		<div>
			<h1>Tools</h1>
			<div>
				<label htmlFor="scale">Parent scale</label>
				<input
					id="scale"
					type="range"
					min="0.5"
					max="1.5"
					step="0.05"
					value={scale}
					onChange={handleScaleChange}
				/>
				<span>{scale.toFixed(2)}×</span>
				<button type="button" onClick={handleClear}>
					Clear canvas
				</button>
			</div>
			<h1>Canvas</h1>
			<div
				role="presentation"
				style={{
					transform: `scale(${scale})`,
					transformOrigin: "top left",
					width: `${100 / scale}%`,
					border: "1px dashed #94a3b8",
					borderRadius: "0.25rem",
				}}
			>
				<ReactSketchCanvas
					ref={canvasRef}
					width="100%"
					height="240px"
					strokeColor="#16a34a"
				/>
			</div>
		</div>
	);
}
