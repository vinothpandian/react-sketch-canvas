import { Hand, MousePointer, Pencil } from "lucide-react";
import { ReactSketchCanvas } from "react-sketch-canvas";

export default function App() {
	return (
		<div className="not-prose flex flex-col gap-4 w-full">
			{/* Input Header Status */}
			<div className="flex items-center gap-4 p-4 rounded-lg border border-fd-border bg-fd-card shadow-sm text-fd-foreground">
				<div className="flex items-center gap-3">
					<div className="flex -space-x-2">
						<div className="p-2 rounded-full border bg-emerald-500/10 border-emerald-500/20 text-emerald-500 z-20">
							<MousePointer className="w-4 h-4" />
						</div>
						<div className="p-2 rounded-full border bg-blue-500/10 border-blue-500/20 text-blue-500 z-10">
							<Pencil className="w-4 h-4" />
						</div>
						<div className="p-2 rounded-full border bg-purple-500/10 border-purple-500/20 text-purple-500">
							<Hand className="w-4 h-4" />
						</div>
					</div>
					<div className="flex flex-col">
						<span className="text-xs font-semibold uppercase tracking-wider text-fd-muted-foreground">
							Allowed Inputs
						</span>
						<span className="text-sm font-medium">
							All Pointer Types Allowed (Mouse, Stylus & Touch)
						</span>
					</div>
				</div>
			</div>

			{/* Canvas Workspace */}
			<div className="relative overflow-hidden rounded-lg border border-fd-border aspect-video min-h-[240px] shadow-sm">
				<ReactSketchCanvas
					allowOnlyPointerType="all"
					strokeColor="var(--color-fd-primary)"
					canvasColor="transparent"
				/>
			</div>
		</div>
	);
}
