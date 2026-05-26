import { useMemo, useRef, useState } from "react";
import {
	Canvas,
	type CanvasPath,
	type CanvasRef,
	type Point,
} from "react-sketch-canvas";

const basePaths: CanvasPath[] = [
	{
		drawMode: true,
		strokeColor: "#2563eb",
		strokeWidth: 6,
		paths: [
			{ x: 60, y: 80 },
			{ x: 150, y: 48 },
			{ x: 250, y: 120 },
			{ x: 350, y: 64 },
		],
	},
	{
		drawMode: true,
		strokeColor: "#16a34a",
		strokeWidth: 6,
		paths: [
			{ x: 70, y: 220 },
			{ x: 150, y: 150 },
			{ x: 260, y: 210 },
			{ x: 360, y: 132 },
		],
	},
	{
		drawMode: false,
		strokeColor: "#000000",
		strokeWidth: 26,
		paths: [
			{ x: 105, y: 114 },
			{ x: 180, y: 124 },
			{ x: 255, y: 138 },
		],
	},
];

function distanceToPoint(point: Point, target: Point): number {
	return Math.hypot(point.x - target.x, point.y - target.y);
}

function nearestPathIndex(point: Point): number {
	const distances = basePaths.map((path) =>
		Math.min(
			...path.paths.map((pathPoint) => distanceToPoint(point, pathPoint)),
		),
	);
	const closestDistance = Math.min(...distances);

	return closestDistance <= 48 ? distances.indexOf(closestDistance) : -1;
}

function highlightedPaths(selectedPathIndex: number): CanvasPath[] {
	return basePaths.map((path, index) => {
		if (index !== selectedPathIndex) return path;

		return {
			...path,
			strokeColor: path.drawMode ? "#f59e0b" : "#000000",
			strokeWidth: path.strokeWidth + 6,
		};
	});
}

export default function App() {
	const canvasRef = useRef<CanvasRef>(null);
	const [selectedPathIndex, setSelectedPathIndex] = useState(0);
	const [selectedPoint, setSelectedPoint] = useState<Point | null>(null);
	const [exportedSvg, setExportedSvg] = useState("");
	const paths = useMemo(
		() => highlightedPaths(selectedPathIndex),
		[selectedPathIndex],
	);

	const handlePointerDown = (point: Point) => {
		const nextSelection = nearestPathIndex(point);

		setSelectedPathIndex(nextSelection);
		setSelectedPoint(point);
		setExportedSvg("");
	};

	const handleExportSvg = async () => {
		const svg = await canvasRef.current?.exportSvg();
		setExportedSvg(svg ? `${svg.slice(0, 140)}...` : "");
	};

	return (
		<div className="not-prose grid gap-3">
			<div className="flex flex-wrap items-center gap-2">
				<button
					type="button"
					onClick={handleExportSvg}
					className="inline-flex h-10 items-center rounded-md border bg-fd-background px-4 font-medium text-sm"
				>
					Export highlighted SVG
				</button>
				<p className="text-fd-muted-foreground text-sm">
					Selected path:{" "}
					{selectedPathIndex === -1 ? "none" : selectedPathIndex + 1}
					{selectedPoint
						? ` at ${Math.round(selectedPoint.x)}, ${Math.round(selectedPoint.y)}`
						: ""}
				</p>
			</div>
			<Canvas
				ref={canvasRef}
				paths={paths}
				isDrawing={false}
				onPointerDown={handlePointerDown}
				onPointerMove={() => undefined}
				onPointerUp={() => undefined}
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
			{exportedSvg ? (
				<pre className="overflow-auto rounded-md border bg-fd-muted p-3 text-xs">
					{exportedSvg}
				</pre>
			) : null}
		</div>
	);
}
