import React from 'react';
import {
  CanvasPath,
  ReactSketchCanvas,
  ReactSketchCanvasProps,
} from 'react-sketch-canvas';

type CanvasRef = React.RefObject<ReactSketchCanvas>;
type Handlers = [string, () => void, string][];

interface InputFieldProps {
  fieldName: keyof ReactSketchCanvasProps;
  type?: string;
  canvasProps: Partial<ReactSketchCanvasProps>;
  setCanvasProps: React.Dispatch<
    React.SetStateAction<Partial<ReactSketchCanvasProps>>
  >;
}

function InputField({
  fieldName,
  type = 'text',
  canvasProps,
  setCanvasProps,
}: InputFieldProps) {
  const handleChange = ({
    target,
  }: React.ChangeEvent<HTMLInputElement>): void => {
    setCanvasProps((prevCanvasProps) => ({
      ...prevCanvasProps,
      [fieldName]: target.value,
    }));
  };

  const id = 'validation' + fieldName;

  return (
    <div className="p-2 col-10">
      <label htmlFor={id} className="form-label">
        {fieldName}
      </label>
      <input
        name={fieldName}
        type={type}
        className="form-control"
        id={id}
        value={canvasProps[fieldName] as string}
        onChange={handleChange}
        min={1}
        max={30}
      />
    </div>
  );
}

function App() {
  const [canvasProps, setCanvasProps] = React.useState<
    Partial<ReactSketchCanvasProps>
  >({
    className: 'react-sketch-canvas',
    width: '100%',
    height: '500px',
    backgroundImage:
      'https://upload.wikimedia.org/wikipedia/commons/7/70/Graph_paper_scan_1600x1000_%286509259561%29.jpg',
    preserveBackgroundImageAspectRatio: 'none',
    strokeWidth: 4,
    eraserWidth: 5,
    strokeColor: '#000000',
    canvasColor: '#FFFFFF',
    style: { borderRight: '1px solid #CCC' },
    exportWithBackgroundImage: true,
    withTimestamp: true,
    allowOnlyPointerType: 'all',
  });

  const inputProps: Array<[keyof ReactSketchCanvasProps, 'text' | 'number']> = [
    ['className', 'text'],
    ['width', 'text'],
    ['height', 'text'],
    ['backgroundImage', 'text'],
    ['preserveBackgroundImageAspectRatio', 'text'],
    ['strokeWidth', 'number'],
    ['eraserWidth', 'number'],
  ];

  const canvasRef: CanvasRef = React.useRef<ReactSketchCanvas>(null);

  const [dataURI, setDataURI] = React.useState<string>('');
  const [svg, setSVG] = React.useState<string>('');
  const [paths, setPaths] = React.useState<CanvasPath[]>([]);
  const [sketchingTime, setSketchingTime] = React.useState<number>(0);

  const imageExportHandler = async () => {
    const exportImage = canvasRef.current?.exportImage;

    if (exportImage) {
      const exportedDataURI = await exportImage('png');
      setDataURI(exportedDataURI);
    }
  };

  const svgExportHandler = async () => {
    const exportSvg = canvasRef.current?.exportSvg;

    if (exportSvg) {
      const exportedDataURI = await exportSvg();
      setSVG(exportedDataURI);
    }
  };

  const getSketchingTimeHandler = async () => {
    const getSketchingTime = canvasRef.current?.getSketchingTime;

    if (getSketchingTime) {
      const currentSketchingTime = await getSketchingTime();
      setSketchingTime(currentSketchingTime);
    }
  };

  const penHandler = () => {
    const eraseMode = canvasRef.current?.eraseMode;

    if (eraseMode) {
      eraseMode(false);
    }
  };

  const eraserHandler = () => {
    const eraseMode = canvasRef.current?.eraseMode;

    if (eraseMode) {
      eraseMode(true);
    }
  };

  const undoHandler = () => {
    const undo = canvasRef.current?.undo;

    if (undo) {
      undo();
    }
  };

  const redoHandler = () => {
    const redo = canvasRef.current?.redo;

    if (redo) {
      redo();
    }
  };

  const clearHandler = () => {
    const clearCanvas = canvasRef.current?.clearCanvas;

    if (clearCanvas) {
      clearCanvas();
    }
  };

  const resetCanvasHandler = () => {
    const resetCanvas = canvasRef.current?.resetCanvas;

    if (resetCanvas) {
      resetCanvas();
    }
  };

  const createButton = (
    label: string,
    handler: () => void,
    themeColor: string
  ) => (
    <button
      key={label}
      className={`btn btn-${themeColor} btn-block`}
      type="button"
      onClick={handler}
    >
      {label}
    </button>
  );

  const buttonsWithHandlers: Handlers = [
    ['Undo', undoHandler, 'primary'],
    ['Redo', redoHandler, 'primary'],
    ['Clear All', clearHandler, 'primary'],
    ['Reset All', resetCanvasHandler, 'primary'],
    ['Pen', penHandler, 'secondary'],
    ['Eraser', eraserHandler, 'secondary'],
    ['Export Image', imageExportHandler, 'success'],
    ['Export SVG', svgExportHandler, 'success'],
    ['Get Sketching time', getSketchingTimeHandler, 'success'],
  ];

  const onUpdate = (updatedPaths: CanvasPath[]): void => {
    setPaths(updatedPaths);
  };

  return (
    <main className="container-fluid p-5">
      <header className="border-bottom p-3 d-flex align-items-end">
        <img
          className="logo"
          src="https://i.imgur.com/ajs39FC.png"
          alt="React Sketch Canvas"
        />
        <h1 className="title">ReactSketchCanvas</h1>
      </header>
      <div className="row">
        <aside className="col-3 border-right">
          <header className="my-5">
            <h3>Props</h3>
          </header>
          <form>
            {inputProps.map(([fieldName, type]) => (
              <InputField
                key={fieldName}
                fieldName={fieldName}
                type={type}
                canvasProps={canvasProps}
                setCanvasProps={setCanvasProps}
              />
            ))}
            <div className="p-2 col-10 d-flex ">
              <div>
                <label htmlFor="strokeColorInput" className="form-label">
                  strokeColor
                </label>
                <input
                  type="color"
                  name="strokeColor"
                  className="form-control form-control-color"
                  id="strokeColorInput"
                  value={canvasProps.strokeColor}
                  title="Choose stroke color"
                  onChange={(e) => {
                    setCanvasProps((prevCanvasProps) => ({
                      ...prevCanvasProps,
                      strokeColor: e.target.value,
                    }));
                  }}
                ></input>
              </div>
              <div className="mx-4">
                <label htmlFor="canvasColorInput" className="form-label">
                  canvasColor
                </label>
                <input
                  name="canvasColor"
                  type="color"
                  className="form-control form-control-color"
                  id="canvasColorInput"
                  value={canvasProps.canvasColor}
                  title="Choose stroke color"
                  onChange={(e) => {
                    setCanvasProps((prevCanvasProps) => ({
                      ...prevCanvasProps,
                      backgroundImage: '',
                      canvasColor: e.target.value,
                    }));
                  }}
                ></input>
              </div>
            </div>
            <div className="p-2 col-10">
              <div className="form-check form-switch">
                <input
                  className="form-check-input"
                  type="checkbox"
                  role="switch"
                  id="switchExportWithBackgroundImage"
                  checked={canvasProps.exportWithBackgroundImage}
                  onChange={(e) => {
                    console.log(e);
                    setCanvasProps((prevCanvasProps) => ({
                      ...prevCanvasProps,
                      exportWithBackgroundImage: e.target.checked,
                    }));
                  }}
                />
                <label
                  className="form-check-label"
                  htmlFor="switchExportWithBackgroundImage"
                >
                  exportWithBackgroundImage
                </label>
              </div>
            </div>
            <div className="p-2 col-10">
              <div className="form-check form-switch">
                <input
                  className="form-check-input"
                  type="checkbox"
                  role="switch"
                  id="switchWithTimestamp"
                  checked={canvasProps.withTimestamp}
                  onChange={(e) => {
                    console.log(e);
                    setCanvasProps((prevCanvasProps) => ({
                      ...prevCanvasProps,
                      withTimestamp: e.target.checked,
                    }));
                  }}
                />
                <label
                  className="form-check-label"
                  htmlFor="switchWithTimestamp"
                >
                  withTimestamp
                </label>
              </div>
            </div>
            <div className="p-2">
              <label
                className="form-check-label"
                htmlFor="allowOnlyPointerType"
              >
                allowOnlyPointerType
              </label>
              <div id="allowOnlyPointerType" className="pt-2">
                <div className="form-check form-check-inline">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="allowPointer"
                    id="allowPointerAll"
                    value="all"
                    checked={canvasProps.allowOnlyPointerType === 'all'}
                    onChange={() => {
                      setCanvasProps((prevCanvasProps) => ({
                        ...prevCanvasProps,
                        allowOnlyPointerType: 'all',
                      }));
                    }}
                  />
                  <label className="form-check-label" htmlFor="allowPointerAll">
                    all
                  </label>
                </div>
                <div className="form-check form-check-inline">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="allowPointer"
                    id="allowPointerTouch"
                    value="touch"
                    checked={canvasProps.allowOnlyPointerType === 'touch'}
                    onChange={() => {
                      setCanvasProps((prevCanvasProps) => ({
                        ...prevCanvasProps,
                        allowOnlyPointerType: 'touch',
                      }));
                    }}
                  />
                  <label
                    className="form-check-label"
                    htmlFor="allowPointerTouch"
                  >
                    touch
                  </label>
                </div>
                <div className="form-check form-check-inline">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="allowPointer"
                    id="allowPointerMouse"
                    value="mouse"
                    checked={canvasProps.allowOnlyPointerType === 'mouse'}
                    onChange={() => {
                      setCanvasProps((prevCanvasProps) => ({
                        ...prevCanvasProps,
                        allowOnlyPointerType: 'mouse',
                      }));
                    }}
                  />
                  <label
                    className="form-check-label"
                    htmlFor="allowPointerMouse"
                  >
                    mouse
                  </label>
                </div>
                <div className="form-check form-check-inline">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="allowPointer"
                    id="allowPointerStylus"
                    value="stylus"
                    checked={canvasProps.allowOnlyPointerType === 'stylus'}
                    onChange={() => {
                      setCanvasProps((prevCanvasProps) => ({
                        ...prevCanvasProps,
                        allowOnlyPointerType: 'stylus',
                      }));
                    }}
                  />
                  <label
                    className="form-check-label"
                    htmlFor="allowPointerStylus"
                  >
                    stylus
                  </label>
                </div>
              </div>
            </div>
          </form>
        </aside>
        <section className="col-9">
          <header className="my-5">
            <h3>Canvas</h3>
          </header>
          <section className="row no-gutters canvas-area m-0 p-0">
            <div className="col-9 canvas p-0">
              <ReactSketchCanvas
                ref={canvasRef}
                onUpdate={onUpdate}
                {...canvasProps}
              />
            </div>
            <div className="col-3 panel">
              <div className="d-grid gap-2">
                {buttonsWithHandlers.map(([label, handler, themeColor]) =>
                  createButton(label, handler, themeColor)
                )}
              </div>
            </div>
          </section>

          <section className="row image-export mt-5 p-3 justify-content-center align-items-start">
            <div className="col-5 row form-group">
              <label className="col-12" htmlFor="dataURI">
                Paths
              </label>
              <textarea
                id="dataURI"
                className="dataURICode col-12"
                readOnly
                rows={10}
                value={
                  paths.length !== 0
                    ? JSON.stringify(paths)
                    : 'Sketch to get paths'
                }
              />
            </div>
            <div className="col-5 offset-2">
              <label className="col-12" htmlFor="dataURI">
                Sketching time
              </label>
              <div className="sketchingTime">
                {(sketchingTime / 1000).toFixed(3)} sec
              </div>
            </div>
          </section>

          <section className="row image-export p-3 justify-content-center align-items-start">
            <div className="col-5 row form-group">
              <label className="col-12" htmlFor="dataURI">
                Exported Data URI for imagetype
              </label>
              <textarea
                id="dataURI"
                className="dataURICode col-12"
                readOnly
                rows={10}
                value={dataURI || 'Click on export image'}
              />
            </div>
            <div className="col-5 offset-2">
              <p>Exported image</p>
              <img
                className="exported-image"
                src={
                  dataURI ||
                  'https://via.placeholder.com/500x250/000000/FFFFFF/?text=Click on export image'
                }
                alt="exported"
              />
            </div>
          </section>

          <section className="row image-export p-3 justify-content-center align-items-start">
            <div className="col-5 row form-group">
              <label className="col-12" htmlFor="dataURI">
                Exported SVG code
              </label>
              <textarea
                id="dataURI"
                className="dataURICode col-12"
                readOnly
                rows={10}
                value={svg || 'Click on export svg'}
              />
            </div>
            <div className="col-5 offset-2">
              <p>Exported SVG</p>
              {svg ? (
                <span
                  className="exported-image"
                  dangerouslySetInnerHTML={{ __html: svg }}
                />
              ) : (
                <img
                  src="https://via.placeholder.com/500x250/000000/FFFFFF/?text=Click on export SVG"
                  alt="Svg Export"
                  className="exported-image"
                />
              )}
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}

export default App;
