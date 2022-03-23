import React, { useRef, useState, useCallback } from 'react';
import { DraggableCore, DraggableData, DraggableEvent } from 'react-draggable';
import { useOnClickOutside } from '../hooks';
import { CanvasText } from '../types';

export interface SVGTextEditableProps {
  text: CanvasText;
  onChange?: (oldText: CanvasText, newText: CanvasText) => void;
  isDrawing?: boolean;
}

interface Size {
  x: number;
  y: number;
  width: number;
  height: number;
}

export default function SVGTextEditable({
  text,
  onChange,
  isDrawing,
}: SVGTextEditableProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [wasDragged, setWasDragged] = useState(false);
  const [currentText, setCurrentText] = useState(text.text);
  const [textSize, setTextSize] = useState<Size>({
    height: 0,
    width: 0,
    x: 0,
    y: 0,
  });
  const [rectOffset, setRectOffset] = useState({ x: 0, y: 0 });

  const inputRef = useRef<HTMLInputElement>(null);
  useOnClickOutside(inputRef, () => {
    if (isEditing) {
      // rollbackChanges();
      commitChanges();
    }
  });

  const textRef = useRef<SVGTextElement>(null);

  const beginEditing = useCallback(() => {
    if (wasDragged) {
      setWasDragged(false);
      return;
    }
    if (textRef.current) {
      const size = textRef.current.getBBox();
      const mX = 2;
      const mY = 1.2;
      const dx = size.width * mX - size.width;
      const dy = size.height * mY - size.height;
      size.width *= mX;
      size.height *= mY;
      size.x -= dx / 2;
      size.y -= dy / 2;
      setTextSize(size);
    }

    setIsEditing(true);
  }, [wasDragged]);

  const commitChanges = () => {
    setIsEditing(false);
    if (onChange) {
      onChange(text, {
        ...text,
        text: currentText,
      });
    }
  };

  const rollbackChanges = () => {
    setIsEditing(false);
    setCurrentText(text.text);
  };

  const onDragStart = (
    _: DraggableEvent,
    data: DraggableData
  ): void | false => {
    setRectOffset({
      x: data.x - text.position.x,
      y: data.y - text.position.y,
    });
  };

  const isDragging = (_: DraggableEvent, data: DraggableData): void | false => {
    if (!wasDragged) {
      setWasDragged(true);
    }
    if (textRef.current) {
      textRef.current.setAttribute('x', (data.x - rectOffset.x).toString());
      textRef.current.setAttribute('y', (data.y - rectOffset.y).toString());
    }
  };

  const onDragStop = (_: DraggableEvent, data: DraggableData): void | false => {
    if (!wasDragged) {
      beginEditing();
      return;
    }
    setWasDragged(false);
    if (!textRef.current) {
      return;
    }
    const newX = data.x - rectOffset.x;
    const newY = data.y - rectOffset.y;
    if (onChange) {
      onChange(text, {
        ...text,
        position: {
          x: newX,
          y: newY,
        },
      });
    }
  };

  if (isEditing) {
    return (
      <foreignObject
        x={textSize.x}
        y={textSize.y}
        width={textSize.width}
        height={textSize.height}
      >
        <input
          type="text"
          ref={inputRef}
          style={{
            width: '100%',
            height: '100%',
            textAlign: 'center',
          }}
          autoFocus={true}
          value={currentText}
          onInput={(e) => setCurrentText(e.currentTarget.value)}
          onFocus={(e) => e.currentTarget.select()}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              commitChanges();
              return;
            }
            if (e.key === 'Escape') {
              rollbackChanges();
              return;
            }
          }}
        />
      </foreignObject>
    );
  }

  return (
    <DraggableCore
      onStart={onDragStart}
      onDrag={isDragging}
      onStop={onDragStop}
      disabled={isDrawing}
    >
      <text
        x={text.position.x}
        y={text.position.y}
        onMouseUp={beginEditing}
        ref={textRef}
        style={{ cursor: 'pointer' }}
      >
        {currentText}
      </text>
    </DraggableCore>
  );
}
