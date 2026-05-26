import { useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
	type CanvasPath,
	ReactSketchCanvas,
	type ReactSketchCanvasRef,
} from "../../src";

const STRESS_STROKE_COUNT = 1000;
const STRESS_POINTS_PER_STROKE = 1000;
const ERASER_STRESS_PAIR_COUNT = 100;

function createStressPaths(): CanvasPath[] {
	return Array.from({ length: STRESS_STROKE_COUNT }, (_, strokeIndex) => ({
		drawMode: true,
		strokeColor: "red",
		strokeWidth: 1,
		paths: Array.from(
			{ length: STRESS_POINTS_PER_STROKE },
			(_, pointIndex) => ({
				x: 10 + (pointIndex % 400),
				y: 10 + (strokeIndex % 280) + Math.floor(pointIndex / 400),
			}),
		),
	}));
}

function createEraserStressDrawPaths(): CanvasPath[] {
	return Array.from({ length: ERASER_STRESS_PAIR_COUNT }, (_, index) => {
		const y = 12 + index * 2;

		return {
			drawMode: true,
			strokeColor: "red",
			strokeWidth: 4,
			paths: [
				{ x: 10, y },
				{ x: 400, y },
			],
		} satisfies CanvasPath;
	});
}

function createViewBoxPaths(): CanvasPath[] {
	return [
		{
			drawMode: true,
			strokeColor: "red",
			strokeWidth: 4,
			paths: [
				{ x: 20, y: 20 },
				{ x: 360, y: 260 },
			],
		},
	];
}

function App() {
	const canvasRef = useRef<ReactSketchCanvasRef>(null);
	const [canvasSize, setCanvasSize] = useState({ width: 420, height: 320 });
	const [paths, setPaths] = useState<CanvasPath[]>([]);
	const [exportedImage, setExportedImage] = useState("");
	const [exportedSvg, setExportedSvg] = useState("");
	const stressPointCount = paths.reduce(
		(total, path) => total + path.paths.length,
		0,
	);

	const handleExportImage = async () => {
		const dataUri = await canvasRef.current?.exportImage("png");
		setExportedImage(dataUri ?? "");
	};

	const handleExportSvg = async () => {
		const svg = await canvasRef.current?.exportSvg();
		setExportedSvg(svg ?? "");
	};

	const handleLoadEraserStressPaths = () => {
		canvasRef.current?.resetCanvas();
		canvasRef.current?.loadPaths(createEraserStressDrawPaths());
		canvasRef.current?.eraseMode(true);
	};

	return (
		<main>
			<ReactSketchCanvas
				ref={canvasRef}
				id="rsc"
				width={`${canvasSize.width}px`}
				height={`${canvasSize.height}px`}
				withViewBox
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
				<button
					type="button"
					id="load-stress-paths-button"
					onClick={() => canvasRef.current?.loadPaths(createStressPaths())}
				>
					Load Stress Paths
				</button>
				<button
					type="button"
					id="load-eraser-stress-paths-button"
					onClick={handleLoadEraserStressPaths}
				>
					Load Eraser Stress Paths
				</button>
				<button
					type="button"
					id="load-viewbox-paths-button"
					onClick={() => canvasRef.current?.loadPaths(createViewBoxPaths())}
				>
					Load ViewBox Paths
				</button>
				<button
					type="button"
					id="resize-canvas-button"
					onClick={() => setCanvasSize({ width: 560, height: 360 })}
				>
					Resize Canvas
				</button>
			</nav>
			<output id="path-count">{paths.length}</output>
			<output id="stress-point-count">{stressPointCount}</output>
			<output id="exported-image">{exportedImage}</output>
			<output id="exported-svg">{exportedSvg}</output>
		</main>
	);
}

const root = document.getElementById("root");

if (root) {
	createRoot(root).render(<App />);
}
