import { Pencil } from "lucide-react";
import { ReactSketchCanvas } from "react-sketch-canvas";

export default function App() {
	return (
		<div className="not-prose flex flex-col gap-3 w-full">
			{/* Header display */}
			<div className="flex items-center gap-2 text-fd-muted-foreground select-none">
				<Pencil className="w-3.5 h-3.5 text-fd-primary animate-pulse" />
				<span className="font-display text-sm font-bold tracking-tight">
					Drafting Canvas Workspace
				</span>
			</div>

			{/* Canvas Workspace */}
			<div className="relative overflow-hidden rounded-lg border border-fd-border aspect-video min-h-[200px] shadow-sm">
				<ReactSketchCanvas
					width="100%"
					height="100%"
					canvasColor="transparent"
					strokeColor="var(--color-fd-primary)"
				/>
			</div>
		</div>
	);
}
