import * as React from 'react';
import { CanvasText } from '../types';
import SVGTextEditable from './SVGTextEditable';

interface SVGTextsProps {
  texts: CanvasText[];
  onChange?: (oldText: CanvasText, newText: CanvasText) => void;
  isDrawing?: boolean;
}

export const SVGTexts = ({ texts, onChange, isDrawing }: SVGTextsProps) => {
  return (
    <>
      {texts.map((text, id) => (
        <SVGTextEditable
          texts={texts}
          text={text}
          key={id.toString()}
          onChange={onChange}
          isDrawing={isDrawing}
        />
      ))}
    </>
  );
};
