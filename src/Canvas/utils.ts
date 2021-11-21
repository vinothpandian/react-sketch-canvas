export function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.addEventListener('load', () => {
      if (img.width > 0) {
        resolve(img);
      }
      reject('Image not found');
    });
    img.addEventListener('error', (err) => reject(err));
    img.src = url;
    img.setAttribute('crossorigin', 'anonymous');
  });
}

export function getCanvasWithViewBox(canvas: HTMLDivElement) {
  const svgCanvas = canvas.firstChild?.cloneNode(true) as SVGElement;

  const width = canvas.offsetWidth;
  const height = canvas.offsetHeight;

  svgCanvas.setAttribute('viewBox', `0 0 ${width} ${height}`);

  svgCanvas.setAttribute('width', width.toString());
  svgCanvas.setAttribute('height', height.toString());
  return { svgCanvas, width, height };
}
