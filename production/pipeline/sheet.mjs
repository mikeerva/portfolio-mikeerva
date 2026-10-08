// Contact sheet: node sheet.mjs out.png cols width img1 img2 ...
import sharp from 'sharp'
const [out, cols, w, ...files] = process.argv.slice(2)
const W = +w, C = +cols
const metas = await Promise.all(files.map((f) => sharp(f).metadata()))
const tiles = await Promise.all(files.map((f, i) => sharp(f).resize(W).png().toBuffer({ resolveWithObject: true })))
const rowsH = []
tiles.forEach((t, i) => { const r = Math.floor(i / C); rowsH[r] = Math.max(rowsH[r] || 0, t.info.height) })
const H = rowsH.reduce((a, b) => a + b + 6, 0)
const comp = tiles.map((t, i) => ({ input: t.data, left: (i % C) * (W + 6), top: rowsH.slice(0, Math.floor(i / C)).reduce((a, b) => a + b + 6, 0) }))
await sharp({ create: { width: C * (W + 6), height: H, channels: 3, background: '#808080' } }).composite(comp).png().toFile(out)
console.log('sheet', out)
