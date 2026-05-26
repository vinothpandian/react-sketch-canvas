import { Layers, Paintbrush, Palette } from "lucide-react";
import { type ChangeEvent, useRef, useState } from "react";
import {
	ReactSketchCanvas,
	type ReactSketchCanvasRef,
} from "react-sketch-canvas";

interface ColorPreset {
	name: string;
	canvas: string;
	stroke: string;
}

const PRESETS: ColorPreset[] = [
	{ name: "Classic Ink", canvas: "#ffffff", stroke: "#0f172a" },
	{ name: "Pine Forest", canvas: "#f4f8f6", stroke: "#106358" },
	{ name: "Blueprint", canvas: "#0b1c33", stroke: "#60a5fa" },
	{ name: "Chalkboard", canvas: "#1e293b", stroke: "#f8fafc" },
	{ name: "Terminal", canvas: "#090d16", stroke: "#10b981" },
];

export default function App() {
	const canvasRef = useRef<ReactSketchCanvasRef>(null);
	const [strokeColor, setStrokeColor] = useState("#106358");
	const [canvasColor, setCanvasColor] = useState("#f4f8f6");

	const handleStrokeColorChange = (event: ChangeEvent<HTMLInputElement>) => {
		setStrokeColor(event.target.value);
	};

	const handleCanvasColorChange = (event: ChangeEvent<HTMLInputElement>) => {
		setCanvasColor(event.target.value);
	};

	const applyPreset = (preset: ColorPreset) => {
		setCanvasColor(preset.canvas);
		setStrokeColor(preset.stroke);
	};

	return (
		<div className="not-prose flex flex-col gap-4 w-full">
			{/* Color Options Bar */}
			<div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-lg border border-fd-border bg-fd-card shadow-sm text-fd-foreground">
				{/* Custom Color Controls */}
				<div className="flex flex-wrap gap-4 items-center">
					{/* Stroke Color */}
					<div className="flex flex-col gap-1.5">
						<span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-fd-muted-foreground">
							<Paintbrush className="w-3.5 h-3.5" />
							Stroke Color
						</span>
						<label className="relative flex items-center gap-2 px-3 py-1.5 rounded-md border border-fd-border bg-fd-muted hover:bg-fd-accent/50 cursor-pointer transition-colors duration-200 text-xs font-medium">
							<span
								className="w-4 h-4 rounded-full border border-fd-border shadow-inner"
								style={{ backgroundColor: strokeColor }}
							/>
							<span className="font-mono text-[11px]">
								{strokeColor.toUpperCase()}
							</span>
							<input
								type="color"
								value={strokeColor}
								onChange={handleStrokeColorChange}
								className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
							/>
						</label>
					</div>

					{/* Canvas Color */}
					<div className="flex flex-col gap-1.5">
						<span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-fd-muted-foreground">
							<Layers className="w-3.5 h-3.5" />
							Canvas Color
						</span>
						<label className="relative flex items-center gap-2 px-3 py-1.5 rounded-md border border-fd-border bg-fd-muted hover:bg-fd-accent/50 cursor-pointer transition-colors duration-200 text-xs font-medium">
							<span
								className="w-4 h-4 rounded-full border border-fd-border shadow-inner"
								style={{ backgroundColor: canvasColor }}
							/>
							<span className="font-mono text-[11px]">
								{canvasColor.toUpperCase()}
							</span>
							<input
								type="color"
								value={canvasColor}
								onChange={handleCanvasColorChange}
								className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
							/>
						</label>
					</div>
				</div>

				{/* Presets Grid */}
				<div className="flex flex-col gap-1.5 flex-1 max-w-md">
					<span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-fd-muted-foreground">
						<Palette className="w-3.5 h-3.5" />
						Drafting Presets
					</span>
					<div className="flex flex-wrap gap-2">
						{PRESETS.map((preset) => {
							const isActive =
								canvasColor.toLowerCase() === preset.canvas.toLowerCase() &&
								strokeColor.toLowerCase() === preset.stroke.toLowerCase();
							return (
								<button
									key={preset.name}
									type="button"
									onClick={() => applyPreset(preset)}
									className={`flex items-center gap-1.5 px-2.5 py-1 rounded border text-xs font-medium transition-all duration-200 ${
										isActive
											? "border-fd-primary bg-fd-primary/10 text-fd-primary"
											: "border-fd-border bg-fd-card text-fd-muted-foreground hover:text-fd-foreground hover:bg-fd-accent/50"
									}`}
								>
									{/* preset color swatch mini */}
									<div className="flex -space-x-1.5">
										<div
											className="w-2.5 h-2.5 rounded-full border border-fd-border shadow-inner z-10"
											style={{ backgroundColor: preset.stroke }}
										/>
										<div
											className="w-2.5 h-2.5 rounded-full border border-fd-border shadow-inner"
											style={{ backgroundColor: preset.canvas }}
										/>
									</div>
									{preset.name}
								</button>
							);
						})}
					</div>
				</div>
			</div>

			{/* Drawing Workspace */}
			<div className="relative overflow-hidden rounded-lg border border-fd-border aspect-video min-h-[240px] shadow-sm transition-colors duration-200">
				<ReactSketchCanvas
					ref={canvasRef}
					strokeColor={strokeColor}
					canvasColor={canvasColor}
				/>
			</div>
		</div>
	);
}
