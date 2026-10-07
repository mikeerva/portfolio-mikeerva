// Points inside the letterforms of a word, for FORM: the word is drawn once to a small offscreen
// canvas and its filled pixels become targets. Returned as x, y pairs normalised to the word's
// width (x in -0.5..0.5, y up), so the field scales them to whatever the view allows.
export async function sampleWord(word: string): Promise<Float32Array> {
  const family = 'Archivo'
  try {
    await document.fonts.load(`800 200px ${family}`)
  } catch {
    // the fallback face still makes a word
  }
  const W = 1200
  const H = 360
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  if (!ctx) return new Float32Array(0)
  ctx.font = `800 260px ${family}, 'Inter Tight', sans-serif`
  if ('fontStretch' in ctx) (ctx as CanvasRenderingContext2D & { fontStretch: string }).fontStretch = 'expanded'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = '#fff'
  ctx.fillText(word, W / 2, H / 2)
  const width = Math.min(ctx.measureText(word).width, W)
  const data = ctx.getImageData(0, 0, W, H).data
  const points: number[] = []
  const step = 2
  for (let y = 0; y < H; y += step) {
    for (let x = 0; x < W; x += step) {
      if (data[(y * W + x) * 4 + 3] > 140) points.push((x - W / 2) / width, -(y - H / 2) / width)
    }
  }
  return new Float32Array(points)
}
