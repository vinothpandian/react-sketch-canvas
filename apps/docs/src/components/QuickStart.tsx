import { LiveCode } from "./LiveCode.tsx";

const DemoCode = `import { ReactSketchCanvas } from "react-sketch-canvas";

export default function App() {
  return (
    <div>
      <h1>Draw here!</h1>
      <ReactSketchCanvas />
    </div>
  );
}`;

export function QuickStart() {
  return <LiveCode files={{ "App.tsx": DemoCode }} />;
}
