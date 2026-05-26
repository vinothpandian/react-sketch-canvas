import { Lock, LockOpen } from "lucide-react";
import { useState } from "react";
import { ReactSketchCanvas } from "react-sketch-canvas";

export default function App() {
	const [readOnly, setReadOnly] = useState(false);

	const toggleReadOnly = () => {
		setReadOnly((prev) => !prev);
	};

	return (
		<div className="not-prose flex flex-col gap-4 w-full">
			{/* Read-Only Status & Toggle Panel */}
			<div className="flex items-center justify-between p-4 rounded-lg border border-fd-border bg-fd-card shadow-sm text-fd-foreground">
				<div className="flex items-center gap-3">
					<div
						className={`p-2 rounded-full border transition-colors duration-200 ${
							readOnly
								? "bg-amber-500/10 border-amber-500/20 text-amber-500"
								: "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
						}`}
					>
						{readOnly ? (
							<Lock className="w-5 h-5" />
						) : (
							<LockOpen className="w-5 h-5" />
						)}
					</div>
					<div className="flex flex-col">
						<span className="text-xs font-semibold uppercase tracking-wider text-fd-muted-foreground">
							Canvas Access
						</span>
						<span className="text-sm font-medium">
							{readOnly
								? "Read Only Mode — Drawing Locked"
								: "Active Mode — Ready for Sketching"}
						</span>
					</div>
				</div>

				{/* Premium Animated Toggle Switch */}
				<button
					type="button"
					role="switch"
					aria-checked={readOnly}
					onClick={toggleReadOnly}
					className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-fd-ring focus:ring-offset-2 ${
						readOnly ? "bg-amber-500" : "bg-fd-muted border border-fd-border"
					}`}
				>
					<span className="sr-only">Toggle Read Only</span>
					<span
						className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
							readOnly ? "translate-x-6" : "translate-x-1"
						}`}
					/>
				</button>
			</div>

			{/* Canvas Workspace */}
			<div className="relative overflow-hidden rounded-lg border border-fd-border aspect-video min-h-[240px] shadow-sm">
				{readOnly && (
					<div className="absolute inset-0 bg-fd-accent/10 backdrop-blur-[0.5px] pointer-events-none z-50 flex items-center justify-center">
						<div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-fd-card/90 border border-fd-border shadow-md text-xs font-medium text-fd-muted-foreground">
							<Lock className="w-3.5 h-3.5 text-amber-500" />
							Canvas is Read-Only
						</div>
					</div>
				)}
				<ReactSketchCanvas
					readOnly={readOnly}
					strokeColor="var(--color-fd-primary)"
					canvasColor="transparent"
				/>
			</div>
		</div>
	);
}
