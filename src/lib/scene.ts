// Written by the Work UI, read every frame by the fluid canvas.
export const object = {
  // Continuous state index: integers are the four facets, fractions are in-between.
  // Unbounded so the object can keep turning; the category is progress mod 4.
  progress: 0,
  // Tilt (radians) from vertical dragging
  tilt: 0,
  hover: false,
  selected: false,
  // Called by the canvas every frame with the eased values it rendered the mass with,
  // so anything placed around the mass rides the same motion instead of its own loop.
  onFrame: null as ((frame: ObjectFrame) => void) | null,
}

export interface ObjectFrame {
  // Eased progress the mass is currently showing
  turn: number
  sway: number
  tilt: number
  zoom: number
  // Object centre and unit in CSS px (before zoom)
  cx: number
  cy: number
  unit: number
}
