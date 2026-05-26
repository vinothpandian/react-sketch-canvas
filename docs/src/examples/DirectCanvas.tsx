import {
	Copy,
	Download,
	ExternalLink,
	Layers,
	MousePointerClick,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
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
	const [svgViewerUrl, setSvgViewerUrl] = useState("");
	const paths = useMemo(
		() => highlightedPaths(selectedPathIndex),
		[selectedPathIndex],
	);

	useEffect(() => {
		if (!exportedSvg) {
			setSvgViewerUrl("");
			return;
		}

		const url = URL.createObjectURL(
			new Blob([exportedSvg], { type: "image/svg+xml" }),
		);
		setSvgViewerUrl(url);

		return () => URL.revokeObjectURL(url);
	}, [exportedSvg]);

	const handlePointerDown = (point: Point) => {
		const nextSelection = nearestPathIndex(point);

		setSelectedPathIndex(nextSelection);
		setSelectedPoint(point);
		setExportedSvg("");
	};

	const handleExportSvg = async () => {
		const svg = await canvasRef.current?.exportSvg();
		setExportedSvg(svg ?? "");
	};

	const handleCopySvg = async () => {
		if (!exportedSvg) return;

		await navigator.clipboard.writeText(exportedSvg);
	};

	return (
		<div className="not-prose flex flex-col gap-4 w-full">
			{/* CAD Style Inspector Header */}
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg border border-fd-border bg-fd-card shadow-sm text-fd-foreground">
				{/* Vector Export Command */}
				<div className="flex items-center gap-2">
					<button
						type="button"
						onClick={handleExportSvg}
						className="inline-flex h-9 items-center gap-1.5 rounded-md bg-fd-primary px-3.5 text-xs font-semibold text-fd-primary-foreground shadow transition-colors hover:bg-fd-primary/90"
					>
						<Download className="w-3.5 h-3.5" />
						Export Highlighted SVG
					</button>
				</div>

				{/* Selection Pill */}
				<div className="flex items-center gap-2.5 p-2 px-3.5 rounded-md bg-fd-muted border border-fd-border shadow-inner text-xs min-w-[15rem] justify-between">
					<div className="flex flex-col">
						<span className="text-[10px] font-semibold uppercase tracking-wider text-fd-muted-foreground flex items-center gap-1">
							<MousePointerClick className="w-3 h-3 text-fd-primary" />
							CAD Selection
						</span>
						<span className="font-semibold text-fd-foreground mt-0.5">
							{selectedPathIndex === -1 ? (
								<span className="text-fd-muted-foreground italic">
									No path selected
								</span>
							) : (
								<span>Vector Path #{selectedPathIndex + 1}</span>
							)}
						</span>
					</div>

					{selectedPoint && (
						<div className="flex flex-col items-end border-l border-fd-border/50 pl-3">
							<span className="text-[8px] font-semibold uppercase tracking-wider text-fd-muted-foreground">
								Coordinates
							</span>
							<span className="font-mono text-[10px] font-semibold text-fd-foreground mt-0.5">
								{Math.round(selectedPoint.x)}X, {Math.round(selectedPoint.y)}Y
							</span>
						</div>
					)}
				</div>
			</div>

			{/* Custom Low-Level Canvas Viewport */}
			<div className="relative overflow-hidden rounded-lg border border-fd-border aspect-video min-h-[260px] shadow-sm bg-slate-50 dark:bg-slate-950/20">
				<Canvas
					ref={canvasRef}
					paths={paths}
					isDrawing={false}
					onPointerDown={handlePointerDown}
					onPointerMove={() => undefined}
					onPointerUp={() => undefined}
					allowOnlyPointerType="all"
					backgroundImage=""
					canvasColor="transparent"
					exportWithBackgroundImage={false}
					width="100%"
					height="100%"
					svgStyle={{ touchAction: "none" }}
					withViewBox
				/>
			</div>

			{/* Conditionally Rendered Output Panel */}
			{exportedSvg && (
				<div className="flex flex-col gap-3 p-4 rounded-lg border border-fd-border bg-fd-card shadow-sm text-fd-foreground">
					<span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-fd-muted-foreground border-b border-fd-border/50 pb-2">
						<Layers className="w-3.5 h-3.5 text-fd-primary" />
						Exported CAD SVG Code
					</span>

					<div className="flex flex-col gap-3">
						<div className="flex flex-wrap gap-2">
							<button
								type="button"
								onClick={handleCopySvg}
								className="inline-flex h-8 items-center gap-1.5 rounded-md border border-fd-border bg-fd-card px-3 text-xs font-medium hover:bg-fd-accent transition-colors shadow-sm"
							>
								<Copy className="w-3 h-3" />
								Copy SVG
							</button>
							{svgViewerUrl && (
								<a
									href={svgViewerUrl}
									target="_blank"
									rel="noreferrer"
									className="inline-flex h-8 items-center gap-1.5 rounded-md border border-fd-border bg-fd-card px-3 text-xs font-medium hover:bg-fd-accent transition-colors shadow-sm"
								>
									<ExternalLink className="w-3 h-3" />
									View In Window
								</a>
							)}
						</div>
						<pre className="max-h-52 overflow-auto rounded-md border border-fd-border bg-fd-muted p-3 font-mono text-[10px] text-fd-foreground leading-relaxed">
							{exportedSvg}
						</pre>
					</div>
				</div>
			)}
		</div>
	);
}
