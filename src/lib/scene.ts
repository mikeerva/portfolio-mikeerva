import type { CategoryId } from '../config'

// Written by the Work UI, read every frame by the fluid canvas.
export const object = {
  // Continuous state index: integers are the four facets, fractions are in-between.
  // Unbounded so the object can keep turning; the category is progress mod 4.
  progress: 0,
  // The loading screen hides the canvas entirely: it keeps its state but skips drawing
  covered: false,
  // ...and so does the open menu, once its liquid has filled the screen
  menuCovered: false,
  // Set with a new progress that the mass should take up at once instead of turning to it
  jump: false,
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
  // Hero: centre (CSS px) of the link under the pointer, which draws the material toward it
  heroLink: null as { x: number; y: number } | null,
  // The entered project's panel has finished opening (set by the project layer)
  panelOpen: false,
  // How far through the open project's case study the reader has scrolled (0..1)
  projectScroll: 0,
  // About's portrait, called every frame with how far it has risen open (0..1, eased)
  onAboutFrame: null as ((reveal: number) => void) | null,
  // Called by the canvas every frame with the eased values it rendered the mass with,
  // so anything placed around the mass rides the same motion instead of its own loop.
  onFrame: null as ((frame: ObjectFrame) => void) | null,
  // Same frame, for the project layer
  onProjectsFrame: null as ((frame: ObjectFrame) => void) | null,
}

export interface ObjectFrame {
  // The view's size (CSS px), as the canvas measured it: read from here so no frame has to ask
  // the browser for layout
  vw: number
  vh: number
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

/**
 * Resolves true once the open project's panel has finished opening, or false if `cancelled`
 * turns true first. A case study's heavy start (a 3D scene, a particle field) waits for it, so it
 * doesn't land in the middle of the opening. Outside the project layer it resolves at once.
 */
export function afterPanelOpens(cancelled: () => boolean) {
  return new Promise<boolean>((resolve) => {
    const check = () => {
      if (cancelled()) resolve(false)
      else if (object.panelOpen || !object.onProjectsFrame) resolve(true)
      else requestAnimationFrame(check)
    }
    check()
  })
}
