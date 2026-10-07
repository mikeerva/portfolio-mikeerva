// About: the Hero's material sweeps together, left first, into one body on the left that holds the
// portrait. The portrait is cut into the material exactly as a project's panel is: material behind
// it is cleared, and the small near lobes cross its corners in front of it.

// The portrait's frame (CSS px) and the column the CV is set in, for a viewport
export function aboutLayout(w: number, h: number) {
  if (h > w) {
    const height = Math.min(h * 0.27, (w * 0.5) / 0.8)
    const width = height * 0.8
    const top = Math.max(h * 0.1, 76)
    return {
      portrait: true,
      frame: { left: w * 0.5 - width / 2, top, width, height },
      text: { left: 24, top: top + height + height * 0.16, width: w - 48, bottom: h - 76 },
    }
  }
  const height = Math.min(h * 0.62, (w * 0.3) / 0.8)
  const width = height * 0.8
  const left = w * 0.22 - width / 2
  return {
    portrait: false,
    frame: { left, top: h * 0.52 - height / 2, width, height },
    text: { left: w * 0.45, top: h * 0.14, width: w * 0.55 - 48, bottom: h * 0.9 },
  }
}

// Where each of the mass's blobs settles, around the frame: x and y as fractions of the frame (0..1
// across it), radius as a fraction of its height, and depth (object units). Behind the portrait
// below PANEL_Z, in front of it above. The first fourteen are the Hero's own volumes, each taking
// the place nearest where it was; the rest grow out of them, filling the body and forming the two
// small near forms across the frame's lower-left and upper-right corners, as on a project panel.
export type AboutSlot = [x: number, y: number, r: number, depth: number]
export const ABOUT_SLOTS: AboutSlot[] = [
  [-0.3, 0.12, 0.26, 0.35],
  [0.05, 0.98, 0.36, 0.3],
  [-0.28, 0.55, 0.4, 0.3],
  [0.25, -0.06, 0.24, 0.3],
  [0.45, 1.08, 0.28, 0.25],
  [0.72, -0.1, 0.2, 0.2],
  [1.05, 0.5, 0.12, 0.3],
  [1.04, 0.2, 0.13, 0.25],
  [1.02, 0.8, 0.12, 0.3],
  [0.5, 0.45, 0.32, 0.2],
  [-0.05, 0.3, 0.26, 0.4],
  [0.85, 1.06, 0.16, 0.3],
  [-0.42, 0.88, 0.22, 0.25],
  [0.62, 1.02, 0.18, 0.3],
  // in front: one form crossing the lower-left corner...
  [0.02, 0.96, 0.07, 1.2],
  [0.1, 1.02, 0.045, 1.2],
  [-0.03, 0.87, 0.04, 1.15],
  // ...answered across the diagonal at the upper-right one
  [0.98, 0.04, 0.065, 1.2],
  [0.9, -0.02, 0.045, 1.2],
  [1.03, 0.13, 0.035, 1.15],
  [-0.2, 1.06, 0.2, 0.3],
  [0.55, -0.18, 0.15, 0.3],
  [-0.5, 0.35, 0.18, 0.3],
  [-0.35, -0.08, 0.15, 0.3],
  [0.25, 1.12, 0.22, 0.35],
  [-0.15, 0.72, 0.22, 0.35],
  [0.97, 0.98, 0.1, 0.3],
  [0.1, 0.1, 0.2, 0.4],
]

// The sweep: a volume sets off once this long (s) times its Hero x (0..1) has passed, so the left
// of the screen gathers first. The portrait rises open once the body has formed, and closes first
// on leaving, before the material lets go.
export const ABOUT_SWEEP_S = 0.9
export const ABOUT_OPEN_AT_S = 1.5
export const ABOUT_OPEN_S = 1.1
export const ABOUT_CLOSE_S = 0.45
