/**
 * Internal stroke color used for mask-mode eraser paths.
 *
 * @remarks
 * The eraser is rendered onto a white SVG mask backdrop; a solid black stroke
 * is what cuts holes through the mask. The value is shared by stroke creation
 * (`state/strokes.ts`) and the hidden mask SVG (`Canvas/svg/EraserMasks.tsx`)
 * so they cannot drift apart.
 */
export const ERASER_MASK_STROKE_COLOR = "#000000";
