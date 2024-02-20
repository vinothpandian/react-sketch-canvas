import { ReactSketchCanvas } from "react-sketch-canvas";
import { type ChangeEvent, useState } from "react";

export default function App() {
  const [readOnly, setReadOnly] = useState(false);

  const handleReadOnlyChange = (event: ChangeEvent<HTMLInputElement>) => {
    setReadOnly(event.target.checked);
  };

  return (
    <div className="d-flex flex-column gap-2 p-2">
      <h1>Tools</h1>
      <div className="d-flex gap-2 align-items-center ">
        <div className="form-check form-switch">
          <input
            className="form-check-input"
            type="checkbox"
            role="switch"
            id="readOnly"
            checked={readOnly}
            onChange={handleReadOnlyChange}
          />
          <label className="form-check-label" htmlFor="readOnly">
            readOnly - Disables drawing
          </label>
        </div>
      </div>
      <h1>Canvas</h1>
      <ReactSketchCanvas readOnly={readOnly} />
    </div>
  );
}
