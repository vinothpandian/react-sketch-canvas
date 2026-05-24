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
	const [useExplicitSize, setUseExplicitSize] = useState<boolean>(true);
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
		setUseExplicitSize(event.target.checked);
		setExportResult(null);
	};

	const handleExportClick = async () => {
		if (!canvasRef.current) return;

		const logicalWidth = useExplicitSize ? exportWidth : CANVAS_WIDTH;
		const logicalHeight = useExplicitSize ? exportHeight : CANVAS_HEIGHT;
		const effectiveRatio = useExplicitSize ? pixelRatio : deviceDpr;
		const pixelWidth = Math.round(logicalWidth * effectiveRatio);
		const pixelHeight = Math.round(logicalHeight * effectiveRatio);

		const image = useExplicitSize
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

	const projectedPixelWidth = useExplicitSize
		? Math.round(exportWidth * pixelRatio)
		: Math.round(CANVAS_WIDTH * deviceDpr);
	const projectedPixelHeight = useExplicitSize
		? Math.round(exportHeight * pixelRatio)
		: Math.round(CANVAS_HEIGHT * deviceDpr);

	return (
		<div className="d-flex flex-column gap-3 p-2">
			<section>
				<h1>Export options</h1>
				<div className="row g-2">
					<div className="col-md-3">
						<label htmlFor="rasterExportFormat" className="form-label">
							Format
						</label>
						<select
							id="rasterExportFormat"
							className="form-select form-select-sm"
							value={exportFormat}
							onChange={handleExportFormatChange}
						>
							<option value="png">PNG</option>
							<option value="jpeg">JPEG</option>
						</select>
					</div>
					<div className="col-md-3">
						<label htmlFor="rasterExportWidth" className="form-label">
							Width (CSS px)
						</label>
						<input
							id="rasterExportWidth"
							className="form-control form-control-sm"
							type="number"
							min={1}
							max={4096}
							step={20}
							value={exportWidth}
							disabled={!useExplicitSize}
							onChange={handleExportWidthChange}
						/>
					</div>
					<div className="col-md-3">
						<label htmlFor="rasterExportHeight" className="form-label">
							Height (CSS px)
						</label>
						<input
							id="rasterExportHeight"
							className="form-control form-control-sm"
							type="number"
							min={1}
							max={4096}
							step={20}
							value={exportHeight}
							disabled={!useExplicitSize}
							onChange={handleExportHeightChange}
						/>
					</div>
					<div className="col-md-3">
						<label htmlFor="rasterExportPixelRatio" className="form-label">
							Pixel ratio
						</label>
						<select
							id="rasterExportPixelRatio"
							className="form-select form-select-sm"
							value={pixelRatio}
							disabled={!useExplicitSize}
							onChange={handlePixelRatioChange}
						>
							<option value={1}>1x (standard)</option>
							<option value={2}>2x (retina)</option>
							<option value={3}>3x (super retina)</option>
							<option value={4}>4x (print)</option>
						</select>
					</div>
				</div>
				<div className="form-check mt-3">
					<input
						id="rasterExportUseExplicitSize"
						className="form-check-input"
						type="checkbox"
						checked={useExplicitSize}
						onChange={handleUseExplicitSizeChange}
					/>
					<label
						htmlFor="rasterExportUseExplicitSize"
						className="form-check-label"
					>
						Pass explicit <code>width</code> / <code>height</code> options (when
						unchecked, the library auto-scales by{" "}
						<code>window.devicePixelRatio</code> = {deviceDpr.toFixed(2)})
					</label>
				</div>
				<div className="d-flex gap-2 mt-3">
					<button
						type="button"
						className="btn btn-sm btn-primary"
						onClick={handleExportClick}
					>
						Export
					</button>
					<button
						type="button"
						className="btn btn-sm btn-outline-secondary"
						onClick={handleClearOutputClick}
					>
						Clear output
					</button>
				</div>
				<p className="text-body-secondary small mt-3 mb-0">
					Projected output:{" "}
					<strong>
						{projectedPixelWidth} x {projectedPixelHeight} px
					</strong>{" "}
					(logical {useExplicitSize ? exportWidth : CANVAS_WIDTH} x{" "}
					{useExplicitSize ? exportHeight : CANVAS_HEIGHT} CSS px).
				</p>
			</section>

			<section>
				<h1>Canvas</h1>
				<ReactSketchCanvas
					ref={canvasRef}
					width={`${CANVAS_WIDTH}px`}
					height={`${CANVAS_HEIGHT}px`}
					canvasColor="#f8fafc"
					strokeColor="#0f172a"
					strokeWidth={6}
				/>
			</section>

			{exportResult ? (
				<section>
					<h1>Export output</h1>
					<p className="text-body-secondary small mb-2">
						{exportResult.format.toUpperCase()} -{" "}
						<strong>
							{exportResult.pixelWidth} x {exportResult.pixelHeight} px
						</strong>{" "}
						(logical {exportResult.logicalWidth} x {exportResult.logicalHeight}{" "}
						CSS px), {formatBytes(exportResult.byteLength)} encoded.
					</p>
					<img
						className="img-fluid border rounded"
						src={exportResult.value}
						alt={`${exportResult.format.toUpperCase()} export preview`}
					/>
				</section>
			) : null}
		</div>
	);
}
