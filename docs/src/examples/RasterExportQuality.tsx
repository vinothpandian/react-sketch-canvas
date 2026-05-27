import {
	Download,
	Image as ImageIcon,
	Info,
	Settings,
	Trash2,
} from "lucide-react";
import { type ChangeEvent, useEffect, useRef, useState } from "react";
import {
	type CanvasPath,
	ReactSketchCanvas,
	type ReactSketchCanvasRef,
} from "react-sketch-canvas";

const CANVAS_WIDTH = 640;
const CANVAS_HEIGHT = 360;

const initialPaths: CanvasPath[] = [
	{
		drawMode: true,
		strokeColor: "#0f172a",
		strokeWidth: 6,
		paths: [
			{ x: 60, y: 250 },
			{ x: 120, y: 130 },
			{ x: 200, y: 220 },
			{ x: 280, y: 90 },
			{ x: 360, y: 200 },
			{ x: 440, y: 70 },
			{ x: 540, y: 220 },
			{ x: 600, y: 130 },
		],
	},
	{
		drawMode: true,
		strokeColor: "#ef4444",
		strokeWidth: 3,
		paths: [
			{ x: 90, y: 90 },
			{ x: 140, y: 95 },
			{ x: 190, y: 92 },
		],
	},
];

type ExportFormat = "png" | "jpeg";

type ExportResult = {
	format: ExportFormat;
	value: string;
	logicalWidth: number;
	logicalHeight: number;
	pixelWidth: number;
	pixelHeight: number;
	byteLength: number;
};

function estimateDataUrlBytes(dataUrl: string): number {
	const commaIndex = dataUrl.indexOf(",");

	if (commaIndex === -1) return 0;

	const base64 = dataUrl.slice(commaIndex + 1);
	const padding = base64.endsWith("==") ? 2 : base64.endsWith("=") ? 1 : 0;

	return Math.max(0, Math.floor((base64.length * 3) / 4) - padding);
}

function formatBytes(bytes: number): string {
	if (bytes < 1024) return `${bytes} B`;
	if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;

	return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function App() {
	const canvasRef = useRef<ReactSketchCanvasRef>(null);
	const [exportFormat, setExportFormat] = useState<ExportFormat>("png");
	const [exportWidth, setExportWidth] = useState<number>(CANVAS_WIDTH);
	const [exportHeight, setExportHeight] = useState<number>(CANVAS_HEIGHT);
	const [pixelRatio, setPixelRatio] = useState<number>(2);
	const [exportAtExplicitSize, setExportAtExplicitSize] =
		useState<boolean>(true);
	const [exportResult, setExportResult] = useState<ExportResult | null>(null);
	const [deviceDpr, setDeviceDpr] = useState<number>(1);

	useEffect(() => {
		canvasRef.current?.resetCanvas();
		canvasRef.current?.loadPaths(initialPaths);
		if (typeof window !== "undefined") {
			setDeviceDpr(window.devicePixelRatio || 1);
		}
	}, []);

	const handleExportFormatChange = (event: ChangeEvent<HTMLSelectElement>) => {
		setExportFormat(event.target.value as ExportFormat);
		setExportResult(null);
	};

	const handleExportWidthChange = (event: ChangeEvent<HTMLInputElement>) => {
		setExportWidth(Number.parseInt(event.target.value, 10) || 0);
		setExportResult(null);
	};

	const handleExportHeightChange = (event: ChangeEvent<HTMLInputElement>) => {
		setExportHeight(Number.parseInt(event.target.value, 10) || 0);
		setExportResult(null);
	};

	const handlePixelRatioChange = (event: ChangeEvent<HTMLSelectElement>) => {
		setPixelRatio(Number.parseFloat(event.target.value));
		setExportResult(null);
	};

	const handleUseExplicitSizeChange = (
		event: ChangeEvent<HTMLInputElement>,
	) => {
		setExportAtExplicitSize(event.target.checked);
		setExportResult(null);
	};

	const handleExportClick = async () => {
		if (!canvasRef.current) return;

		const logicalWidth = exportAtExplicitSize ? exportWidth : CANVAS_WIDTH;
		const logicalHeight = exportAtExplicitSize ? exportHeight : CANVAS_HEIGHT;
		const effectiveRatio = exportAtExplicitSize ? pixelRatio : deviceDpr;
		const pixelWidth = Math.round(logicalWidth * effectiveRatio);
		const pixelHeight = Math.round(logicalHeight * effectiveRatio);

		const image = exportAtExplicitSize
			? await canvasRef.current.exportImage(exportFormat, {
					width: pixelWidth,
					height: pixelHeight,
				})
			: await canvasRef.current.exportImage(exportFormat);

		setExportResult({
			format: exportFormat,
			value: image,
			logicalWidth,
			logicalHeight,
			pixelWidth,
			pixelHeight,
			byteLength: estimateDataUrlBytes(image),
		});
	};

	const handleClearOutputClick = () => {
		setExportResult(null);
	};

	const projectedPixelWidth = exportAtExplicitSize
		? Math.round(exportWidth * pixelRatio)
		: Math.round(CANVAS_WIDTH * deviceDpr);
	const projectedPixelHeight = exportAtExplicitSize
		? Math.round(exportHeight * pixelRatio)
		: Math.round(CANVAS_HEIGHT * deviceDpr);

	return (
		<div className="not-prose flex flex-col gap-5 w-full">
			{/* Grid Layout Config & Canvas */}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
				{/* Configurations Panel */}
				<div className="lg:col-span-1 flex flex-col gap-4 p-4 rounded-lg border border-fd-border bg-fd-card shadow-sm text-fd-foreground h-fit">
					<span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-fd-muted-foreground border-b border-fd-border/50 pb-2">
						<Settings className="w-3.5 h-3.5 text-fd-primary" />
						Quality Configurator
					</span>

					{/* Export Format */}
					<div className="flex flex-col gap-1.5">
						<label
							htmlFor="rasterExportFormat"
							className="text-xs font-medium text-fd-muted-foreground"
						>
							Format
						</label>
						<select
							id="rasterExportFormat"
							value={exportFormat}
							onChange={handleExportFormatChange}
							className="h-9 rounded-md border border-fd-border bg-fd-muted px-2.5 text-xs font-medium focus:ring-2 focus:ring-fd-ring outline-none"
						>
							<option value="png">PNG</option>
							<option value="jpeg">JPEG</option>
						</select>
					</div>

					{/* Dimensions inputs */}
					<div className="grid grid-cols-2 gap-3">
						<div className="flex flex-col gap-1.5">
							<label
								htmlFor="rasterExportWidth"
								className="text-xs font-medium text-fd-muted-foreground"
							>
								Width (CSS px)
							</label>
							<input
								id="rasterExportWidth"
								type="number"
								min={1}
								max={4096}
								step={20}
								value={exportWidth}
								disabled={!exportAtExplicitSize}
								onChange={handleExportWidthChange}
								className="h-9 rounded-md border border-fd-border bg-fd-muted px-3 text-xs font-mono focus:ring-2 focus:ring-fd-ring outline-none disabled:opacity-40 disabled:cursor-not-allowed"
							/>
						</div>
						<div className="flex flex-col gap-1.5">
							<label
								htmlFor="rasterExportHeight"
								className="text-xs font-medium text-fd-muted-foreground"
							>
								Height (CSS px)
							</label>
							<input
								id="rasterExportHeight"
								type="number"
								min={1}
								max={4096}
								step={20}
								value={exportHeight}
								disabled={!exportAtExplicitSize}
								onChange={handleExportHeightChange}
								className="h-9 rounded-md border border-fd-border bg-fd-muted px-3 text-xs font-mono focus:ring-2 focus:ring-fd-ring outline-none disabled:opacity-40 disabled:cursor-not-allowed"
							/>
						</div>
					</div>

					{/* Pixel ratio dropdown */}
					<div className="flex flex-col gap-1.5">
						<label
							htmlFor="rasterExportPixelRatio"
							className="text-xs font-medium text-fd-muted-foreground"
						>
							Pixel Ratio
						</label>
						<select
							id="rasterExportPixelRatio"
							value={pixelRatio}
							disabled={!exportAtExplicitSize}
							onChange={handlePixelRatioChange}
							className="h-9 rounded-md border border-fd-border bg-fd-muted px-2.5 text-xs font-medium focus:ring-2 focus:ring-fd-ring outline-none disabled:opacity-40 disabled:cursor-not-allowed"
						>
							<option value={1}>1x (Standard)</option>
							<option value={2}>2x (Retina)</option>
							<option value={3}>3x (Super Retina)</option>
							<option value={4}>4x (Print Quality)</option>
						</select>
					</div>

					{/* Toggle switch explicit options */}
					<div className="flex flex-col gap-2 border-t border-fd-border/30 pt-3">
						<label className="flex items-start gap-2.5 cursor-pointer group text-xs text-fd-foreground leading-normal">
							<input
								id="rasterExportUseExplicitSize"
								type="checkbox"
								checked={exportAtExplicitSize}
								onChange={handleUseExplicitSizeChange}
								className="w-3.5 h-3.5 accent-fd-primary rounded cursor-pointer mt-0.5"
							/>
							<span className="group-hover:text-fd-primary transition-colors">
								Pass explicit <code>width</code> / <code>height</code>{" "}
								properties (otherwise defaults to scaled device dpr ={" "}
								{deviceDpr.toFixed(2)})
							</span>
						</label>
					</div>

					{/* Action Buttons */}
					<div className="flex gap-2 mt-2 pt-3 border-t border-fd-border/30">
						<button
							type="button"
							onClick={handleExportClick}
							className="flex-1 inline-flex h-9 items-center justify-center gap-1.5 rounded-md bg-fd-primary px-3 text-xs font-semibold text-fd-primary-foreground shadow transition-colors hover:bg-fd-primary/90"
						>
							<Download className="w-3.5 h-3.5" />
							Export Raster
						</button>
						<button
							type="button"
							onClick={handleClearOutputClick}
							className="inline-flex h-9 items-center justify-center p-2 rounded-md border border-fd-border bg-fd-card text-fd-muted-foreground hover:text-fd-foreground hover:bg-fd-accent shadow-sm transition-colors"
							title="Clear Output"
						>
							<Trash2 className="w-3.5 h-3.5" />
						</button>
					</div>

					{/* Projected Stats Info Card */}
					<div className="flex gap-2 p-2.5 rounded bg-fd-muted border border-fd-border/50 text-[11px] text-fd-muted-foreground mt-2 leading-relaxed">
						<Info className="w-3.5 h-3.5 text-fd-primary flex-shrink-0 mt-0.5" />
						<div>
							<span>Projected Dimensions:</span>
							<strong className="text-fd-foreground font-mono block">
								{projectedPixelWidth} x {projectedPixelHeight} px
							</strong>
						</div>
					</div>
				</div>

				{/* Canvas Workspace */}
				<div className="lg:col-span-2 flex flex-col gap-2">
					<span className="text-xs font-semibold uppercase tracking-wider text-fd-muted-foreground">
						Interactive Canvas ({CANVAS_WIDTH} x {CANVAS_HEIGHT})
					</span>
					<div className="relative overflow-hidden rounded-lg border border-fd-border bg-fd-card shadow-sm h-[280px]">
						<div className="absolute inset-0 flex items-center justify-center bg-[#f8fafc]">
							<ReactSketchCanvas
								ref={canvasRef}
								width="100%"
								height="100%"
								canvasColor="#f8fafc"
								strokeColor="#0f172a"
								strokeWidth={6}
							/>
						</div>
					</div>
				</div>
			</div>

			{/* Conditionally Rendered Output Panel */}
			{exportResult && (
				<div className="flex flex-col gap-3 p-4 rounded-lg border border-fd-border bg-fd-card shadow-sm text-fd-foreground">
					<span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-fd-muted-foreground border-b border-fd-border/50 pb-2">
						<ImageIcon className="w-3.5 h-3.5 text-fd-primary" />
						Raster Studio Output Preview
					</span>

					<div className="flex flex-col md:flex-row md:items-start gap-4">
						{/* Stats Card */}
						<div className="flex flex-col gap-2 p-3 bg-fd-muted rounded-md border border-fd-border min-w-[14rem] text-xs">
							<div className="flex flex-col border-b border-fd-border/50 pb-1.5">
								<span className="text-[10px] text-fd-muted-foreground uppercase font-bold">
									Format
								</span>
								<span className="font-bold font-mono uppercase text-sm mt-0.5">
									{exportResult.format}
								</span>
							</div>
							<div className="flex flex-col border-b border-fd-border/50 pb-1.5">
								<span className="text-[10px] text-fd-muted-foreground uppercase font-bold">
									Export size
								</span>
								<span className="font-mono font-bold mt-0.5">
									{exportResult.pixelWidth} x {exportResult.pixelHeight} px
								</span>
								<span className="text-[10px] text-fd-muted-foreground mt-0.5">
									Logical: {exportResult.logicalWidth} x{" "}
									{exportResult.logicalHeight} CSS px
								</span>
							</div>
							<div className="flex flex-col">
								<span className="text-[10px] text-fd-muted-foreground uppercase font-bold">
									File size
								</span>
								<span className="font-mono font-bold mt-0.5">
									{formatBytes(exportResult.byteLength)}
								</span>
							</div>
						</div>

						{/* Image */}
						<div className="flex-1 flex flex-col gap-1.5 max-w-xl">
							<div className="overflow-hidden rounded border border-fd-border bg-fd-muted shadow-inner">
								<img
									src={exportResult.value}
									alt={`${exportResult.format.toUpperCase()} export preview`}
									className="w-full h-auto object-contain max-h-[260px]"
								/>
							</div>
							<span className="text-[10px] text-fd-muted-foreground text-center">
								Right-click thumbnail to copy or save high-fidelity raster image
							</span>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
