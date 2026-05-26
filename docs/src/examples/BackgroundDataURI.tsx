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

const redCircleDataUri =
	"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Ccircle cx='16' cy='16' r='10' fill='%23ef4444'/%3E%3C/svg%3E";

type SomePreserveAspectRatio = (typeof somePreserveAspectRatio)[number];

export default function App() {
	const [bgDataURI, setBgDataURI] = useState(redCircleDataUri);
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
