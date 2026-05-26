import { useRef, useState } from "react";
import {
	ReactSketchCanvas,
	type ReactSketchCanvasRef,
} from "react-sketch-canvas";

export default function App() {
	const canvasRef = useRef<ReactSketchCanvasRef>(null);
	const outerRef = useRef<HTMLDivElement>(null);
	const innerRef = useRef<HTMLDivElement>(null);
	const [outerScroll, setOuterScroll] = useState({ top: 0, left: 0 });
	const [innerScroll, setInnerScroll] = useState({ top: 0, left: 0 });

	const handleScrollOuter = (event: React.UIEvent<HTMLDivElement>) => {
		setOuterScroll({
			top: event.currentTarget.scrollTop,
			left: event.currentTarget.scrollLeft,
		});
	};

	const handleScrollInner = (event: React.UIEvent<HTMLDivElement>) => {
		setInnerScroll({
			top: event.currentTarget.scrollTop,
			left: event.currentTarget.scrollLeft,
		});
	};

	const scrollOuter = (top: number, left: number) => {
		outerRef.current?.scrollBy({ top, left, behavior: "smooth" });
	};

	const scrollInner = (top: number, left: number) => {
		innerRef.current?.scrollBy({ top, left, behavior: "smooth" });
	};

	const handleClear = () => {
		canvasRef.current?.clearCanvas();
	};

	const roundedOuterLeft = Math.round(outerScroll.left);
	const roundedOuterTop = Math.round(outerScroll.top);
	const roundedInnerLeft = Math.round(innerScroll.left);
	const roundedInnerTop = Math.round(innerScroll.top);

	return (
		<div>
			<h1>Tools</h1>
			<div>
				<button type="button" onClick={() => scrollOuter(0, -80)}>
					Outer ←
				</button>
				<button type="button" onClick={() => scrollOuter(0, 80)}>
					Outer →
				</button>
				<button type="button" onClick={() => scrollInner(80, 0)}>
					Inner ↓
				</button>
				<button type="button" onClick={() => scrollInner(-80, 0)}>
					Inner ↑
				</button>
				<button type="button" onClick={handleClear}>
					Clear canvas
				</button>
				<span>
					Outer: ({roundedOuterLeft}, {roundedOuterTop})px · Inner: (
					{roundedInnerLeft}, {roundedInnerTop})px
				</span>
			</div>
			<h1>Canvas</h1>
			<div
				role="presentation"
				ref={outerRef}
				onScroll={handleScrollOuter}
				style={{
					width: "100%",
					overflowX: "auto",
					overflowY: "hidden",
					border: "1px dashed #94a3b8",
					borderRadius: "0.25rem",
				}}
			>
				<div role="presentation" style={{ width: 1600, padding: "0.5rem" }}>
					<div
						role="presentation"
						ref={innerRef}
						onScroll={handleScrollInner}
						style={{
							height: 240,
							overflowY: "auto",
							border: "1px dashed #cbd5f5",
							borderRadius: "0.25rem",
						}}
					>
						<div style={{ height: 600 }}>
							<ReactSketchCanvas
								ref={canvasRef}
								width="100%"
								height="600px"
								strokeColor="#0ea5e9"
							/>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
