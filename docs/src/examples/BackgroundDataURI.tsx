import { Image } from "lucide-react";
import { type ChangeEvent, useState } from "react";
import { ReactSketchCanvas } from "react-sketch-canvas";

const somePreserveAspectRatio = [
	"none",
	"xMinYMin",
	"xMidYMin",
	"xMaxYMin",
	"xMinYMid",
	"xMidYMid",
	"xMaxYMid",
	"xMinYMax",
	"xMidYMax",
	"xMaxYMax",
] as const;

const redPixelPngDataUri =
	"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADUlEQVR42mP8z8BQDwAFgwJ/lG9qkgAAAABJRU5ErkJggg==";

const gridPatternDataUri =
	"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 20 20'%3E%3Crect width='20' height='20' fill='%23f8fafc'/%3E%3Cpath d='M0 20 L20 20 M20 0 L20 20' stroke='%23e2e8f0' stroke-width='0.5'/%3E%3C/svg%3E";

const stripesDataUri =
	"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Crect width='40' height='40' fill='%23f1f5f9'/%3E%3Cpath d='M-10 10 L30 -30 M0 40 L40 0 M30 50 L50 30' stroke='%23e2e8f0' stroke-width='3' stroke-linecap='round'/%3E%3C/svg%3E";

type SomePreserveAspectRatio = (typeof somePreserveAspectRatio)[number];

const PRESETS = [
	{ name: "Red Pixel", uri: redPixelPngDataUri },
	{ name: "Grid Sheet", uri: gridPatternDataUri },
	{ name: "Stripes Slate", uri: stripesDataUri },
];

export default function App() {
	const [bgDataURI, setBgDataURI] = useState(gridPatternDataUri);
	const [preserveAspectRatio, setPreserveAspectRatio] =
		useState<SomePreserveAspectRatio>("xMidYMid");

	const handlePreserveAspectRatioChange = (
		event: ChangeEvent<HTMLSelectElement>,
	) => {
		setPreserveAspectRatio(event.target.value as SomePreserveAspectRatio);
	};

	const handleBackgroundImageChange = (
		event: ChangeEvent<HTMLInputElement>,
	) => {
		setBgDataURI(event.target.value);
	};

	return (
		<div className="not-prose flex flex-col gap-4 w-full">
			{/* Settings Panel */}
			<div className="flex flex-col md:flex-row gap-4 p-4 rounded-lg border border-fd-border bg-fd-card shadow-sm text-fd-foreground">
				{/* Data URI Input & Presets */}
				<div className="flex flex-col gap-2 flex-1">
					<label
						className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-fd-muted-foreground"
						htmlFor="bgDataURI"
					>
						<Image className="w-3.5 h-3.5" />
						Background Data URI
					</label>
					<input
						type="text"
						id="bgDataURI"
						placeholder="Data URI of the image to use as a background"
						value={bgDataURI}
						onChange={handleBackgroundImageChange}
						className="h-9 w-full rounded-md border border-fd-border bg-fd-muted px-3 text-sm focus:outline-none focus:ring-2 focus:ring-fd-ring transition-all"
					/>

					{/* Predefined Presets */}
					<div className="flex flex-wrap gap-1.5 items-center mt-1">
						<span className="text-[10px] uppercase font-bold text-fd-muted-foreground mr-1">
							Presets:
						</span>
						{PRESETS.map((preset) => (
							<button
								key={preset.name}
								type="button"
								onClick={() => setBgDataURI(preset.uri)}
								className={`px-2.5 py-0.5 rounded border text-[11px] font-medium transition-colors duration-150 ${
									bgDataURI === preset.uri
										? "border-fd-primary bg-fd-primary/10 text-fd-primary"
										: "border-fd-border bg-fd-card text-fd-muted-foreground hover:text-fd-foreground hover:bg-fd-accent/50"
								}`}
							>
								{preset.name}
							</button>
						))}
					</div>
				</div>

				{/* Aspect Ratio Selector */}
				<div className="flex flex-col gap-2 min-w-[14rem]">
					<label
						className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-fd-muted-foreground"
						htmlFor="preserveAspectRatio"
					>
						<Image className="w-3.5 h-3.5 text-fd-primary" />
						Aspect Ratio
					</label>
					<select
						id="preserveAspectRatio"
						value={preserveAspectRatio}
						onChange={handlePreserveAspectRatioChange}
						className="h-9 rounded-md border border-fd-border bg-fd-muted px-3 text-sm focus:outline-none focus:ring-2 focus:ring-fd-ring transition-all"
					>
						{somePreserveAspectRatio.map((value) => (
							<option key={value} value={value}>
								{value}
							</option>
						))}
					</select>
				</div>
			</div>

			{/* Canvas Workspace */}
			<div className="relative overflow-hidden rounded-lg border border-fd-border aspect-video min-h-[240px] shadow-sm">
				<ReactSketchCanvas
					backgroundImage={bgDataURI}
					preserveBackgroundImageAspectRatio={preserveAspectRatio}
					strokeColor="var(--color-fd-primary)"
					canvasColor="transparent"
				/>
			</div>
		</div>
	);
}
