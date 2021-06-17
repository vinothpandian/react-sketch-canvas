import { render } from '@testing-library/react';
import { ReactSketchCanvas } from './ReactSketchCanvas';

describe('ReactSketchCanvas', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<ReactSketchCanvas />);
    expect(baseElement).toBeTruthy();
  });
});
