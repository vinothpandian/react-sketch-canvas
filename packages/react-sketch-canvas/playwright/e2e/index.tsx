import { useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
	type CanvasPath,
	ReactSketchCanvas,
	type ReactSketchCanvasRef,
} from "../../src";

function App() {
	const canvasRef = useRef<ReactSketchCanvasRef>(null);
	const [paths, setPaths] = useState<CanvasPath[]>([]);
	const [exportedImage, setExportedImage] = useState("");
	const [exportedSvg, setExportedSvg] = useState("");

	const handleExportImage = async () => {
		const dataUri = await canvasRef.current?.exportImage("png");
		setExportedImage(dataUri ?? "");
	};

	const handleExportSvg = async () => {
		const svg = await canvasRef.current?.exportSvg();
		setExportedSvg(svg ?? "");
	};

	return (
		<main>
			<ReactSketchCanvas
				ref={canvasRef}
				id="rsc"
				width="420px"
				height="320px"
				onChange={(updatedPaths) => setPaths([...updatedPaths])}
			/>
			<nav aria-label="Canvas controls">
				<button
					type="button"
					id="pen-button"
					onClick={() => canvasRef.current?.eraseMode(false)}
				>
					Pen
				</button>
				<button
					type="button"
					id="eraser-button"
					onClick={() => canvasRef.current?.eraseMode(true)}
				>
					Eraser
				</button>
				<button
					type="button"
					id="undo-button"
					onClick={() => canvasRef.current?.undo()}
				>
					Undo
				</button>
				<button
					type="button"
					id="redo-button"
					onClick={() => canvasRef.current?.redo()}
				>
					Redo
				</button>
				<button
					type="button"
					id="clear-button"
					onClick={() => canvasRef.current?.clearCanvas()}
				>
					Clear
				</button>
				<button
					type="button"
					id="reset-button"
					onClick={() => canvasRef.current?.resetCanvas()}
				>
					Reset
				</button>
				<button
					type="button"
					id="export-image-button"
					onClick={handleExportImage}
				>
					Export Image
				</button>
				<button type="button" id="export-svg-button" onClick={handleExportSvg}>
					Export SVG
				</button>
			</nav>
			<output id="path-count">{paths.length}</output>
			<output id="exported-image">{exportedImage}</output>
			<output id="exported-svg">{exportedSvg}</output>
		</main>
	);
}

const root = document.getElementById("root");

if (root) {
	createRoot(root).render(<App />);
}
