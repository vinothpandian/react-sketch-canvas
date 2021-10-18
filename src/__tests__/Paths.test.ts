import { line } from '../Paths';

test('should return length and angle', () => {
  const got = line({ x: 0, y: 0 }, { x: 0, y: 0 });
  const expected = { length: 0, angle: 0 };
  expect(expected).toEqual(got);
});
