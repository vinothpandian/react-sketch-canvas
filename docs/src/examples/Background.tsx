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
		<div>
			<h1>Tools</h1>
			<div>
				<div>
					<label htmlFor="backgroundImage">Background Image</label>
					<input
						type="text"
						id="backgroundImage"
						placeholder="URL of the image to use as a background"
						value={backgroundImage}
						onChange={handleBackgroundImageChange}
					/>
				</div>
				<label htmlFor="preserveAspectRatio">Preserve Aspect Ratio</label>
				<select
					id="preserveAspectRatio"
					aria-label="Preserve Aspect Ratio options"
					value={preserveAspectRatio}
					onChange={handlePreserveAspectRatioChange}
				>
					{somePreserveAspectRatio.map((value) => (
						<option key={value} value={value}>
							{value}
						</option>
					))}
				</select>
			</div>
			<h1>Canvas</h1>
			<ReactSketchCanvas
				backgroundImage={backgroundImage}
				preserveBackgroundImageAspectRatio={preserveAspectRatio}
			/>
		</div>
	);
}
