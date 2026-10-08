// The Signature Ring as geometry. The ear cup is a soft squircle, a superellipse
// |x/a|^n + |y/b|^n = 1 with n ≈ 4, and every graphic ring in the case study is drawn from the
// same curve, so the pressure waves, apertures and diagrams all share the product's own shape
// rather than a generic circle.

export const RING_N = 4

// A closed superellipse path centred on (cx, cy) with half-sizes (a, b)
export function squircle(cx: number, cy: number, a: number, b: number, n = RING_N, steps = 96) {
  const e = 2 / n
  let d = ''
  for (let i = 0; i < steps; i++) {
    const t = (i / steps) * Math.PI * 2
    const c = Math.cos(t)
    const s = Math.sin(t)
    const x = cx + a * Math.sign(c) * Math.abs(c) ** e
    const y = cy + b * Math.sign(s) * Math.abs(s) ** e
    d += `${i ? 'L' : 'M'}${x.toFixed(2)} ${y.toFixed(2)}`
  }
  return d + 'Z'
}

// A squircle filling a box given as [x, y, w, h]
export const squircleIn = ([x, y, w, h]: [number, number, number, number], n = RING_N) =>
  squircle(x + w / 2, y + h / 2, w / 2, h / 2, n)
