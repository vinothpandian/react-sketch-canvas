import { type ChangeEvent, useState } from "react";
import { ReactSketchCanvas } from "react-sketch-canvas";

export default function App() {
	const [readOnly, setReadOnly] = useState(false);

	const handleReadOnlyChange = (event: ChangeEvent<HTMLInputElement>) => {
		setReadOnly(event.target.checked);
	};

	return (
		<div>
			<h1>Tools</h1>
			<div>
				<div>
					<input
						type="checkbox"
						role="switch"
						id="readOnly"
						aria-checked={readOnly}
						checked={readOnly}
						onChange={handleReadOnlyChange}
					/>
					<label htmlFor="readOnly">readOnly - Disables drawing</label>
				</div>
			</div>
			<h1>Canvas</h1>
			<ReactSketchCanvas readOnly={readOnly} />
		</div>
	);
}
