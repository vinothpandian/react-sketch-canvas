import React from "react";
import { ReactSketchCanvas, Point } from "react-sketch-canvas";

const styles = {
  border: "0.0625rem solid #9c9c9c",
  borderRadius: "0.25rem",
};

const generateDashedLinePath = (points: Point[]): string => {
  if (points.length < 2) {
    return points.length === 1 ? `M ${points[0].x} ${points[0].y}` : "";
  }

  let path = `M ${points[0].x} ${points[0].y}`;
  const dashLength = 10;
  const gapLength = 5;
  let currentSegmentLength = 0;
  let drawingDash = true;

  for (let i = 1; i < points.length; i++) {
    const p1 = points[i-1];
    const p2 = points[i];
    const segmentDx = p2.x - p1.x;
    const segmentDy = p2.y - p1.y;
    const segmentLength = Math.sqrt(segmentDx * segmentDx + segmentDy * segmentDy);

    if (segmentLength === 0) continue;

    const dxNormalized = segmentDx / segmentLength;
    const dyNormalized = segmentDy / segmentLength;

    let drawnLengthOnSegment = 0;
    while(drawnLengthOnSegment < segmentLength) {
      const lengthToDraw = drawingDash ? dashLength : gapLength;
      const remainingLengthInCurrentPart = lengthToDraw - currentSegmentLength;
      
      if (drawnLengthOnSegment + remainingLengthInCurrentPart >= segmentLength) {
        // Finish this segment
        if (drawingDash) {
          path += ` L ${p2.x} ${p2.y}`;
        } else {
          path += ` M ${p2.x} ${p2.y}`;
        }
        currentSegmentLength += (segmentLength - drawnLengthOnSegment);
        drawnLengthOnSegment = segmentLength;
      } else {
        // Draw part of dash/gap and switch
        drawnLengthOnSegment += remainingLengthInCurrentPart;
        currentSegmentLength = 0;
        
        const currentX = p1.x + dxNormalized * drawnLengthOnSegment;
        const currentY = p1.y + dyNormalized * drawnLengthOnSegment;

        if (drawingDash) {
          path += ` L ${currentX} ${currentY}`;
        } else {
          path += ` M ${currentX} ${currentY}`;
        }
        drawingDash = !drawingDash;
      }
    }
  }
  return path;
};

const CustomPathGenerationExample = () => (
  <ReactSketchCanvas
    style={styles}
    width="100%"
    height="400px"
    strokeWidth={4}
    strokeColor="blue"
    getSvgPathFromPoints={generateDashedLinePath}
  />
);

export default CustomPathGenerationExample;
