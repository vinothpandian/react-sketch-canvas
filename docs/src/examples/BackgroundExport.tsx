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

	useEffect(() => {
		canvasRef.current?.resetCanvas();
		canvasRef.current?.loadPaths(initialPaths);
	}, []);

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

	const backgroundImage = backgroundSources[backgroundSource];
	const showFallbackNote =
		backgroundSource === "inaccessible" &&
		exportWithBackgroundImage &&
		exportFormat !== "svg";

	return (
		<div className="d-flex flex-column gap-3 p-2">
			<section>
				<h1>Export options</h1>
				<div className="row g-2">
					<div className="col-md-4">
						<label htmlFor="backgroundSource" className="form-label">
							Background source
						</label>
						<select
							id="backgroundSource"
							className="form-select form-select-sm"
							value={backgroundSource}
							onChange={handleBackgroundSourceChange}
						>
							<option value="remote">Remote image URL</option>
							<option value="dataUri">Data URI</option>
							<option value="inaccessible">Inaccessible URL</option>
						</select>
					</div>
					<div className="col-md-4">
						<label htmlFor="exportFormat" className="form-label">
							Export format
						</label>
						<select
							id="exportFormat"
							className="form-select form-select-sm"
							value={exportFormat}
							onChange={handleExportFormatChange}
						>
							<option value="png">PNG</option>
							<option value="jpeg">JPEG</option>
							<option value="svg">SVG</option>
						</select>
					</div>
					<div className="col-md-4 d-flex flex-column justify-content-end gap-2">
						<div className="form-check">
							<input
								id="exportWithBackgroundImage"
								className="form-check-input"
								type="checkbox"
								checked={exportWithBackgroundImage}
								onChange={handleExportWithBackgroundChange}
							/>
							<label
								htmlFor="exportWithBackgroundImage"
								className="form-check-label"
							>
								Include background image
							</label>
						</div>
						<div className="form-check">
							<input
								id="exportAtFixedSize"
								className="form-check-input"
								type="checkbox"
								checked={exportAtFixedSize}
								disabled={exportFormat === "svg"}
								onChange={handleFixedSizeChange}
							/>
							<label htmlFor="exportAtFixedSize" className="form-check-label">
								Export raster as 320 x 180
							</label>
						</div>
					</div>
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
				{showFallbackNote ? (
					<p className="alert alert-warning py-2 mt-3 mb-0">
						If the browser cannot load the background image for export, the
						drawing can still export without that background layer.
					</p>
				) : null}
			</section>

			<section>
				<h1>Canvas</h1>
				<ReactSketchCanvas
					ref={canvasRef}
					height="240px"
					backgroundImage={backgroundImage}
					canvasColor="#f8fafc"
					exportWithBackgroundImage={exportWithBackgroundImage}
					preserveBackgroundImageAspectRatio="xMidYMid slice"
					strokeWidth={5}
					strokeColor="#111827"
				/>
			</section>

			{exportResult ? (
				<section>
					<h1>Export output</h1>
					{exportResult.format === "svg" ? (
						<textarea
							className="form-control font-monospace"
							readOnly
							rows={6}
							value={exportResult.value}
						/>
					) : (
						<img
							className="img-fluid border rounded"
							src={exportResult.value}
							alt={`${exportResult.format.toUpperCase()} export preview`}
						/>
					)}
				</section>
			) : null}
		</div>
	);
}
