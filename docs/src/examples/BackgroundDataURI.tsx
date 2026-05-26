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

const redPixelPngDataUri =
	"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADUlEQVR42mP8z8BQDwAFgwJ/lG9qkgAAAABJRU5ErkJggg==";

type SomePreserveAspectRatio = (typeof somePreserveAspectRatio)[number];

export default function App() {
	const [bgDataURI, setBgDataURI] = useState(redPixelPngDataUri);
	const [preserveAspectRatio, setPreserveAspectRatio] =
		useState<SomePreserveAspectRatio>("xMidYMid");

	const handlePreserveAspectRatioChange = (
		event: ChangeEvent<HTMLSelectElement>,
	) => {
		setPreserveAspectRatio(event.target.value as SomePreserveAspectRatio);
	};

	const handleBackgroundImageChange = (
		event: ChangeEvent<HTMLInputElement>,
	) => {
		setBgDataURI(event.target.value);
	};

	return (
		<div>
			<h1>Tools</h1>
			<div>
				<div>
					<label htmlFor="bgDataURI">Background Data URI</label>
					<input
						type="text"
						id="bgDataURI"
						placeholder="Data URI of the image to use as a background"
						value={bgDataURI}
						onChange={handleBackgroundImageChange}
					/>
				</div>
				<div>
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
			</div>
			<h1>Canvas</h1>
			<ReactSketchCanvas
				backgroundImage={bgDataURI}
				preserveBackgroundImageAspectRatio={preserveAspectRatio}
			/>
		</div>
	);
}
