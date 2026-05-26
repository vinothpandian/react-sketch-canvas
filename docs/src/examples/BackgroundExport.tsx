import {
	Copy,
	Download,
	ExternalLink,
	Image,
	Settings,
	Trash2,
} from "lucide-react";
import { type ChangeEvent, useEffect, useRef, useState } from "react";
import {
	type CanvasPath,
	ReactSketchCanvas,
	type ReactSketchCanvasRef,
} from "react-sketch-canvas";

const backgroundSources = {
	remote:
		"https://images.pexels.com/photos/1193743/pexels-photo-1193743.jpeg?cs=srgb&fm=jpg",
	dataUri:
		"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 640 360'%3E%3Crect width='640' height='360' fill='%23f8fafc'/%3E%3Cpath d='M0 260 C120 170 220 310 340 220 S540 160 640 230 V360 H0 Z' fill='%23bfdbfe'/%3E%3Ccircle cx='500' cy='95' r='54' fill='%23facc15'/%3E%3Cpath d='M60 110 H300' stroke='%2314b8a6' stroke-width='20' stroke-linecap='round'/%3E%3Cpath d='M60 150 H230' stroke='%23fb7185' stroke-width='20' stroke-linecap='round'/%3E%3C/svg%3E",
	inaccessible: "https://example.invalid/react-sketch-canvas-background.png",
} as const;

const initialPaths: CanvasPath[] = [
	{
		drawMode: true,
		strokeColor: "#dc2626",
		strokeWidth: 5,
		paths: [
			{ x: 80, y: 80 },
			{ x: 140, y: 130 },
			{ x: 210, y: 95 },
			{ x: 280, y: 150 },
		],
	},
	{
		drawMode: true,
		strokeColor: "#2563eb",
		strokeWidth: 8,
		paths: [
			{ x: 360, y: 95 },
			{ x: 420, y: 145 },
			{ x: 500, y: 105 },
			{ x: 560, y: 155 },
		],
	},
];

type BackgroundSource = keyof typeof backgroundSources;
type ExportFormat = "png" | "jpeg" | "svg";
type ExportResult =
	| { format: "png" | "jpeg"; value: string }
	| { format: "svg"; value: string };

export default function App() {
	const canvasRef = useRef<ReactSketchCanvasRef>(null);
	const [backgroundSource, setBackgroundSource] =
		useState<BackgroundSource>("dataUri");
	const [exportFormat, setExportFormat] = useState<ExportFormat>("png");
	const [exportWithBackgroundImage, setExportWithBackgroundImage] =
		useState(true);
	const [exportAtFixedSize, setExportAtFixedSize] = useState(false);
	const [exportResult, setExportResult] = useState<ExportResult | null>(null);
	const [svgViewerUrl, setSvgViewerUrl] = useState("");

	useEffect(() => {
		canvasRef.current?.resetCanvas();
		canvasRef.current?.loadPaths(initialPaths);
	}, []);

	useEffect(() => {
		if (exportResult?.format !== "svg") {
			setSvgViewerUrl("");
			return;
		}

		const url = URL.createObjectURL(
			new Blob([exportResult.value], { type: "image/svg+xml" }),
		);
		setSvgViewerUrl(url);

		return () => URL.revokeObjectURL(url);
	}, [exportResult]);

	const handleBackgroundSourceChange = (
		event: ChangeEvent<HTMLSelectElement>,
	) => {
		setBackgroundSource(event.target.value as BackgroundSource);
		setExportResult(null);
	};

	const handleExportFormatChange = (event: ChangeEvent<HTMLSelectElement>) => {
		setExportFormat(event.target.value as ExportFormat);
		setExportResult(null);
	};

	const handleExportWithBackgroundChange = (
		event: ChangeEvent<HTMLInputElement>,
	) => {
		setExportWithBackgroundImage(event.target.checked);
		setExportResult(null);
	};

	const handleFixedSizeChange = (event: ChangeEvent<HTMLInputElement>) => {
		setExportAtFixedSize(event.target.checked);
		setExportResult(null);
	};

	const handleExportClick = async () => {
		if (!canvasRef.current) return;

		if (exportFormat === "svg") {
			const svg = await canvasRef.current.exportSvg();
			setExportResult({ format: "svg", value: svg });
			return;
		}

		const image = await canvasRef.current.exportImage(
			exportFormat,
			exportAtFixedSize ? { width: 320, height: 180 } : undefined,
		);
		setExportResult({ format: exportFormat, value: image });
	};

	const handleClearOutputClick = () => {
		setExportResult(null);
	};

	const handleCopySvgClick = async () => {
		if (exportResult?.format !== "svg") return;

		await navigator.clipboard.writeText(exportResult.value);
	};

	const backgroundImage = backgroundSources[backgroundSource];
	const showFallbackNote =
		backgroundSource === "inaccessible" &&
		exportWithBackgroundImage &&
		exportFormat !== "svg";

	return (
		<div className="not-prose flex flex-col gap-5 w-full">
			{/* Grid Configuration and Canvas */}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
				{/* Configurations Panel */}
				<div className="lg:col-span-1 flex flex-col gap-4 p-4 rounded-lg border border-fd-border bg-fd-card shadow-sm text-fd-foreground h-fit">
					<span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-fd-muted-foreground border-b border-fd-border/50 pb-2">
						<Settings className="w-3.5 h-3.5 text-fd-primary" />
						Export Configurator
					</span>

					{/* Background Source */}
					<div className="flex flex-col gap-1.5">
						<label
							htmlFor="backgroundSource"
							className="text-xs font-medium text-fd-muted-foreground"
						>
							Background Layer
						</label>
						<select
							id="backgroundSource"
							value={backgroundSource}
							onChange={handleBackgroundSourceChange}
							className="h-9 rounded-md border border-fd-border bg-fd-muted px-2.5 text-xs font-medium focus:ring-2 focus:ring-fd-ring outline-none"
						>
							<option value="remote">Remote image URL</option>
							<option value="dataUri">Data URI</option>
							<option value="inaccessible">Inaccessible URL</option>
						</select>
					</div>

					{/* Export Format */}
					<div className="flex flex-col gap-1.5">
						<label
							htmlFor="exportFormat"
							className="text-xs font-medium text-fd-muted-foreground"
						>
							File Format
						</label>
						<select
							id="exportFormat"
							value={exportFormat}
							onChange={handleExportFormatChange}
							className="h-9 rounded-md border border-fd-border bg-fd-muted px-2.5 text-xs font-medium focus:ring-2 focus:ring-fd-ring outline-none"
						>
							<option value="png">PNG (Raster)</option>
							<option value="jpeg">JPEG (Raster)</option>
							<option value="svg">SVG (Vector)</option>
						</select>
					</div>

					{/* Toggles */}
					<div className="flex flex-col gap-2.5 mt-1 border-t border-fd-border/30 pt-3">
						<label className="flex items-center gap-2 cursor-pointer group text-xs text-fd-foreground">
							<input
								id="exportWithBackgroundImage"
								type="checkbox"
								checked={exportWithBackgroundImage}
								onChange={handleExportWithBackgroundChange}
								className="w-3.5 h-3.5 accent-fd-primary rounded cursor-pointer"
							/>
							<span className="group-hover:text-fd-primary transition-colors">
								Include background image
							</span>
						</label>

						<label
							className={`flex items-center gap-2 cursor-pointer group text-xs text-fd-foreground transition-opacity ${
								exportFormat === "svg"
									? "opacity-30 pointer-events-none"
									: "opacity-100"
							}`}
						>
							<input
								id="exportAtFixedSize"
								type="checkbox"
								checked={exportAtFixedSize}
								disabled={exportFormat === "svg"}
								onChange={handleFixedSizeChange}
								className="w-3.5 h-3.5 accent-fd-primary rounded cursor-pointer"
							/>
							<span className="group-hover:text-fd-primary transition-colors">
								Export raster as 320 x 180
							</span>
						</label>
					</div>

					{/* Action Triggers */}
					<div className="flex gap-2 mt-2 pt-3 border-t border-fd-border/30">
						<button
							type="button"
							onClick={handleExportClick}
							className="flex-1 inline-flex h-9 items-center justify-center gap-1.5 rounded-md bg-fd-primary px-3 text-xs font-semibold text-fd-primary-foreground shadow transition-colors hover:bg-fd-primary/90"
						>
							<Download className="w-3.5 h-3.5" />
							Export
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

					{showFallbackNote && (
						<p className="p-2 rounded bg-amber-500/10 border border-amber-500/20 text-[10px] text-amber-600 dark:text-amber-500 mt-2 font-medium leading-relaxed">
							Note: If background fails to load during export, the drawing will
							still render without the background layer.
						</p>
					)}
				</div>

				{/* Canvas Workspace */}
				<div className="lg:col-span-2 flex flex-col gap-2">
					<span className="text-xs font-semibold uppercase tracking-wider text-fd-muted-foreground">
						Interactive Canvas
					</span>
					<div className="relative overflow-hidden rounded-lg border border-fd-border bg-fd-card h-[280px] shadow-sm">
						<ReactSketchCanvas
							ref={canvasRef}
							backgroundImage={backgroundImage}
							canvasColor="#f8fafc"
							exportWithBackgroundImage={exportWithBackgroundImage}
							preserveBackgroundImageAspectRatio="xMidYMid slice"
							strokeWidth={5}
							strokeColor="#111827"
						/>
					</div>
				</div>
			</div>

			{/* Conditionally Rendered Output Panel */}
			{exportResult && (
				<div className="flex flex-col gap-3 p-4 rounded-lg border border-fd-border bg-fd-card shadow-sm text-fd-foreground">
					<span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-fd-muted-foreground border-b border-fd-border/50 pb-2">
						<Image className="w-3.5 h-3.5 text-fd-primary" />
						Export Output ({exportResult.format.toUpperCase()})
					</span>

					{exportResult.format === "svg" ? (
						<div className="flex flex-col gap-3">
							<div className="flex flex-wrap gap-2">
								<button
									type="button"
									onClick={handleCopySvgClick}
									className="inline-flex h-8 items-center gap-1.5 rounded-md border border-fd-border bg-fd-card px-3 text-xs font-medium hover:bg-fd-accent transition-colors shadow-sm"
								>
									<Copy className="w-3 h-3" />
									Copy SVG Code
								</button>
								{svgViewerUrl && (
									<a
										href={svgViewerUrl}
										target="_blank"
										rel="noreferrer"
										className="inline-flex h-8 items-center gap-1.5 rounded-md border border-fd-border bg-fd-card px-3 text-xs font-medium hover:bg-fd-accent transition-colors shadow-sm"
									>
										<ExternalLink className="w-3 h-3" />
										Open in New Tab
									</a>
								)}
							</div>
							<textarea
								readOnly
								rows={6}
								value={exportResult.value}
								className="w-full rounded-md border border-fd-border bg-fd-muted p-3 font-mono text-xs text-fd-foreground focus:outline-none"
							/>
						</div>
					) : (
						<div className="flex flex-col gap-2 max-w-lg">
							<div className="overflow-hidden rounded border border-fd-border shadow-inner bg-fd-muted">
								<img
									src={exportResult.value}
									alt={`${exportResult.format.toUpperCase()} export preview`}
									className="w-full h-auto object-contain max-h-[220px]"
								/>
							</div>
							<span className="text-[10px] text-fd-muted-foreground text-center">
								Right click image to download or copy raster output
							</span>
						</div>
					)}
				</div>
			)}
		</div>
	);
}
