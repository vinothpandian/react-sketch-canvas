import { ReactSketchCanvas } from "react-sketch-canvas";

export default function App() {
  return (
    <div>
      <h1>Draw here!</h1>
      <ReactSketchCanvas
        width="100%"
        height="150px"
        canvasColor="transparent"
        strokeColor="#a855f7"
      />
    </div>
  );
}
