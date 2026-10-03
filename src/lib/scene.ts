import type { CategoryId } from '../config'

// Written by the Work UI, read every frame by the fluid canvas.
export const object = {
  // Continuous state index: integers are the four facets, fractions are in-between.
  // Unbounded so the object can keep turning; the category is progress mod 4.
  progress: 0,
  // Tilt (radians) from vertical dragging
  tilt: 0,
  hover: false,
  // A category is selected: once the mass has settled, it divides into `projects` fragments
  open: false,
  projects: 0,
  // The selected category, which decides the constellation and the fragments' shapes
  category: null as CategoryId | null,
  // The project being entered (index), or -1; and the fragment under the pointer, or -1
  focus: -1,
  hoverProject: -1,
  // When the Hero began forming on first load (performance.now() ms), or null before it has;
  // 0 shows it formed straight away
  introAt: null as number | null,
  // How far through the open project's case study the reader has scrolled (0..1)
  projectScroll: 0,
  // Called by the canvas every frame with the eased values it rendered the mass with,
  // so anything placed around the mass rides the same motion instead of its own loop.
  onFrame: null as ((frame: ObjectFrame) => void) | null,
  // Same frame, for the project layer
  onProjectsFrame: null as ((frame: ObjectFrame) => void) | null,
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
  // How far the mass has divided into project fragments, and how far the focused fragment
  // has been entered (both 0..1, linear in time; ease where used)
  split: number
  enter: number
  // Each fragment's centre and approximate radius on screen, CSS px: [x, y, r] per project
  fragments: Float32Array
}
