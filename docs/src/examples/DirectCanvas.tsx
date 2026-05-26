import { useRef, useState } from "react";
import {
	Canvas,
	type CanvasPath,
	type CanvasRef,
	type Point,
} from "react-sketch-canvas";

type Tool = "pen" | "eraser";

function createPath(point: Point, tool: Tool, isPenEraser = false): CanvasPath {
	const isDrawingStroke = tool === "pen" && !isPenEraser;

	return {
		drawMode: isDrawingStroke,
		strokeColor: isDrawingStroke ? "#2563eb" : "#000000",
		strokeWidth: isDrawingStroke ? 5 : 18,
		paths: [point],
	};
}

export default function App() {
	const canvasRef = useRef<CanvasRef>(null);
	const [paths, setPaths] = useState<CanvasPath[]>([]);
	const [isDrawing, setIsDrawing] = useState(false);
	const [tool, setTool] = useState<Tool>("pen");
	const [exportedSvg, setExportedSvg] = useState("");

	const handlePointerDown = (point: Point, isEraser?: boolean) => {
		setIsDrawing(true);
		setPaths((currentPaths) => [
			...currentPaths,
			createPath(point, tool, isEraser),
		]);
		setExportedSvg("");
	};

	const handlePointerMove = (point: Point) => {
		if (!isDrawing) return;

		setPaths((currentPaths) => {
			const activePath = currentPaths[currentPaths.length - 1];

			if (!activePath) return currentPaths;

			return [
				...currentPaths.slice(0, -1),
				{
					...activePath,
					paths: [...activePath.paths, point],
				},
			];
		});
	};

	const handlePointerUp = () => {
		setIsDrawing(false);
	};

	const handleUndo = () => {
		setPaths((currentPaths) => currentPaths.slice(0, -1));
		setExportedSvg("");
	};

	const handleExportSvg = async () => {
		const svg = await canvasRef.current?.exportSvg();
		setExportedSvg(svg ? `${svg.slice(0, 140)}...` : "");
	};

	return (
		<div className="not-prose grid gap-3">
			<div className="flex flex-wrap gap-2">
				<button
					type="button"
					onClick={() => setTool("pen")}
					className="inline-flex h-10 items-center rounded-md border px-4 font-medium text-sm data-[active=true]:bg-fd-primary data-[active=true]:text-fd-primary-foreground"
					data-active={tool === "pen"}
				>
					Pen
				</button>
				<button
					type="button"
					onClick={() => setTool("eraser")}
					className="inline-flex h-10 items-center rounded-md border px-4 font-medium text-sm data-[active=true]:bg-fd-primary data-[active=true]:text-fd-primary-foreground"
					data-active={tool === "eraser"}
				>
					Eraser
				</button>
				<button
					type="button"
					onClick={handleUndo}
					className="inline-flex h-10 items-center rounded-md border bg-fd-background px-4 font-medium text-sm"
				>
					Undo local state
				</button>
				<button
					type="button"
					onClick={handleExportSvg}
					className="inline-flex h-10 items-center rounded-md border bg-fd-background px-4 font-medium text-sm"
				>
					Export SVG
				</button>
			</div>
			<Canvas
				ref={canvasRef}
				paths={paths}
				isDrawing={isDrawing}
				onPointerDown={handlePointerDown}
				onPointerMove={handlePointerMove}
				onPointerUp={handlePointerUp}
				allowOnlyPointerType="all"
				backgroundImage=""
				canvasColor="white"
				exportWithBackgroundImage={false}
				width="100%"
				height="320px"
				style={{ border: "1px solid var(--color-fd-border)", borderRadius: 8 }}
				svgStyle={{ touchAction: "none" }}
				withViewBox
			/>
			<p className="text-fd-muted-foreground text-sm">
				{paths.length} controlled paths
			</p>
			{exportedSvg ? (
				<pre className="overflow-auto rounded-md border bg-fd-muted p-3 text-xs">
					{exportedSvg}
				</pre>
			) : null}
		</div>
	);
}
