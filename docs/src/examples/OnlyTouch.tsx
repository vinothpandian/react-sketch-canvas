import { Hand } from "lucide-react";
import { ReactSketchCanvas } from "react-sketch-canvas";

export default function App() {
	return (
		<div className="not-prose flex flex-col gap-4 w-full">
			{/* Input Header Status */}
			<div className="flex items-center gap-4 p-4 rounded-lg border border-fd-border bg-fd-card shadow-sm text-fd-foreground">
				<div className="flex items-center gap-3">
					<div className="p-2 rounded-full border bg-purple-500/10 border-purple-500/20 text-purple-500 shadow-sm">
						<Hand className="w-5 h-5" />
					</div>
					<div className="flex flex-col">
						<span className="text-xs font-semibold uppercase tracking-wider text-fd-muted-foreground">
							Allowed Inputs
						</span>
						<span className="text-sm font-medium">
							Touch Gestures Only (Stylus & Mouse pointers are ignored)
						</span>
					</div>
				</div>
			</div>

			{/* Canvas Workspace */}
			<div className="relative overflow-hidden rounded-lg border border-fd-border aspect-video min-h-[240px] shadow-sm">
				<ReactSketchCanvas
					allowOnlyPointerType="touch"
					strokeColor="var(--color-fd-primary)"
					canvasColor="transparent"
				/>
			</div>
		</div>
	);
}
