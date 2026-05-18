import { IconEraser, IconPencil, IconRestore } from "@tabler/icons-react";
import { type ChangeEvent, useEffect, useRef, useState } from "react";
import {
	ReactSketchCanvas,
	type ReactSketchCanvasRef,
} from "react-sketch-canvas";
import paths from "../assets/initialSketch.json";
import "./reset.css";

export function HomePageDemo() {
	const [eraser, setEraser] = useState(false);
	const ref = useRef<ReactSketchCanvasRef>(null);
	const [strokeColor, setStrokeColor] = useState("#6497eb");

	useEffect(() => {
		if (ref.current) {
			ref.current.loadPaths(paths);
		}
	}, []);

	const handleEraserClick = () => {
		setEraser(true);
		if (ref.current) {
			ref.current.eraseMode(true);
		}
	};

	const handlePencilClick = () => {
		setEraser(false);
		if (ref.current) {
			ref.current.eraseMode(false);
		}
	};

	const handleResetClick = () => {
		if (ref.current) {
			ref.current.resetCanvas();
		}
	};

	const onColorChange = (event: ChangeEvent<HTMLInputElement>) => {
		setStrokeColor(event.target.value);
	};

	return (
		<div className="reset-wrapper home-demo">
			<ReactSketchCanvas
				ref={ref}
				canvasColor="transparent"
				height="400px"
				strokeWidth={4}
				strokeColor={strokeColor}
			/>
			<div className="home-demo-toolbar">
				<label className="home-demo-color" title="Ink color">
					<span
						className="home-demo-swatch"
						style={{ backgroundColor: strokeColor }}
					/>
					<input
						aria-label="Ink color"
						title="Ink color"
						type="color"
						value={strokeColor}
						onChange={onColorChange}
					/>
				</label>
				<fieldset className="home-demo-tools">
					<legend>Drawing mode</legend>
					<button
						className={
							!eraser ? "home-demo-button is-selected" : "home-demo-button"
						}
						type="button"
						aria-pressed={!eraser}
						title="Draw"
						onClick={handlePencilClick}
					>
						<IconPencil aria-hidden="true" size={20} />
						<span>Draw</span>
					</button>
					<button
						className={
							eraser ? "home-demo-button is-selected" : "home-demo-button"
						}
						type="button"
						aria-pressed={eraser}
						title="Erase"
						onClick={handleEraserClick}
					>
						<IconEraser aria-hidden="true" size={20} />
						<span>Erase</span>
					</button>
				</fieldset>
				<button
					className="home-demo-button home-demo-reset"
					type="button"
					title="Reset"
					onClick={handleResetClick}
				>
					<IconRestore aria-hidden="true" size={20} />
					<span>Reset</span>
				</button>
			</div>
		</div>
	);
}
