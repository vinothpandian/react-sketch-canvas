import { MousePointer } from "lucide-react";
import { ReactSketchCanvas } from "react-sketch-canvas";

export default function App() {
	return (
		<div className="not-prose flex flex-col gap-4 w-full">
			{/* Input Header Status */}
			<div className="flex items-center gap-4 p-4 rounded-lg border border-fd-border bg-fd-card shadow-sm text-fd-foreground">
				<div className="flex items-center gap-3">
					<div className="p-2 rounded-full border bg-emerald-500/10 border-emerald-500/20 text-emerald-500 shadow-sm">
						<MousePointer className="w-5 h-5" />
					</div>
					<div className="flex flex-col">
						<span className="text-xs font-semibold uppercase tracking-wider text-fd-muted-foreground">
							Allowed Inputs
						</span>
						<span className="text-sm font-medium">
							Mouse Pointer Only (Stylus & Touch inputs are ignored)
						</span>
					</div>
				</div>
			</div>

			{/* Canvas Workspace */}
			<div className="relative overflow-hidden rounded-lg border border-fd-border aspect-video min-h-[240px] shadow-sm">
				<ReactSketchCanvas
					allowOnlyPointerType="mouse"
					strokeColor="var(--color-fd-primary)"
					canvasColor="transparent"
				/>
			</div>
		</div>
	);
}
