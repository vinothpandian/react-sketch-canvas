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

type SomePreserveAspectRatio = (typeof somePreserveAspectRatio)[number];

const PRESETS = [
	{
		name: "Scenic",
		url: "https://images.pexels.com/photos/1193743/pexels-photo-1193743.jpeg?cs=srgb&fm=jpg",
	},
	{
		name: "Drafting Grid",
		url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Crect width='40' height='40' fill='%23f1f5f9'/%3E%3Cpath d='M0 40 L40 40 M40 0 L40 40' stroke='%23cbd5e1' stroke-width='0.5'/%3E%3C/svg%3E",
	},
	{
		name: "Blueprint",
		url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='30' height='30' viewBox='0 0 30 30'%3E%3Crect width='30' height='30' fill='%230f172a'/%3E%3Cpath d='M 0 30 L 30 30 M 30 0 L 30 30' stroke='%231e293b' stroke-width='1'/%3E%3C/svg%3E",
	},
];

export default function App() {
	const [backgroundImage, setBackgroundImage] = useState(
		"https://images.pexels.com/photos/1193743/pexels-photo-1193743.jpeg?cs=srgb&fm=jpg",
	);
	const [preserveAspectRatio, setPreserveAspectRatio] =
		useState<SomePreserveAspectRatio>("none");

	const handlePreserveAspectRatioChange = (
		event: ChangeEvent<HTMLSelectElement>,
	) => {
		setPreserveAspectRatio(event.target.value as SomePreserveAspectRatio);
	};

	const handleBackgroundImageChange = (
		event: ChangeEvent<HTMLInputElement>,
	) => {
		setBackgroundImage(event.target.value);
	};

	return (
		<div className="not-prose flex flex-col gap-4 w-full">
			{/* Settings Panel */}
			<div className="flex flex-col md:flex-row gap-4 p-4 rounded-lg border border-fd-border bg-fd-card shadow-sm text-fd-foreground">
				{/* Image URL Input & Presets */}
				<div className="flex flex-col gap-2 flex-1">
					<label
						className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-fd-muted-foreground"
						htmlFor="backgroundImage"
					>
						<Image className="w-3.5 h-3.5" />
						Background Image URL
					</label>
					<input
						type="text"
						id="backgroundImage"
						placeholder="URL or Data URI of background image"
						value={backgroundImage}
						onChange={handleBackgroundImageChange}
						className="h-9 w-full rounded-md border border-fd-border bg-fd-muted px-3 text-sm focus:outline-none focus:ring-2 focus:ring-fd-ring transition-all"
					/>

					{/* Quick Preset Buttons */}
					<div className="flex flex-wrap gap-1.5 items-center mt-1">
						<span className="text-[10px] uppercase font-bold text-fd-muted-foreground mr-1">
							Presets:
						</span>
						{PRESETS.map((preset) => (
							<button
								key={preset.name}
								type="button"
								onClick={() => setBackgroundImage(preset.url)}
								className={`px-2.5 py-0.5 rounded border text-[11px] font-medium transition-colors duration-150 ${
									backgroundImage === preset.url
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
						{/* aspect ratio icon equivalent */}
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
					backgroundImage={backgroundImage}
					preserveBackgroundImageAspectRatio={preserveAspectRatio}
					strokeColor="var(--color-fd-primary)"
					canvasColor="transparent"
				/>
			</div>
		</div>
	);
}
