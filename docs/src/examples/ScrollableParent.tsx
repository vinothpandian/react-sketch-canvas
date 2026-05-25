import { useRef, useState } from "react";
import {
	ReactSketchCanvas,
	type ReactSketchCanvasRef,
} from "react-sketch-canvas";

export default function App() {
	const canvasRef = useRef<ReactSketchCanvasRef>(null);
	const scrollRef = useRef<HTMLDivElement>(null);
	const [scrollTop, setScrollTop] = useState(0);

	const handleScrollBy = (delta: number) => {
		scrollRef.current?.scrollBy({ top: delta, behavior: "smooth" });
	};

	const handleResetScroll = () => {
		scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
	};

	const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
		setScrollTop(event.currentTarget.scrollTop);
	};

	const handleClear = () => {
		canvasRef.current?.clearCanvas();
	};

	return (
		<div>
			<h1>Tools</h1>
			<div>
				<button type="button" onClick={() => handleScrollBy(-100)}>
					Scroll up
				</button>
				<button type="button" onClick={() => handleScrollBy(100)}>
					Scroll down
				</button>
				<button type="button" onClick={handleResetScroll}>
					Reset
				</button>
				<button type="button" onClick={handleClear}>
					Clear canvas
				</button>
				<span>Parent scrollTop: {Math.round(scrollTop)}px</span>
			</div>
			<h1>Canvas</h1>
			<div
				role="presentation"
				ref={scrollRef}
				onScroll={handleScroll}
				style={{
					height: 240,
					overflowY: "auto",
					border: "1px dashed #94a3b8",
					borderRadius: "0.25rem",
				}}
			>
				<div role="presentation" style={{ height: 600 }}>
					<ReactSketchCanvas
						ref={canvasRef}
						width="100%"
						height="600px"
						strokeColor="#a855f7"
					/>
				</div>
			</div>
		</div>
	);
}
