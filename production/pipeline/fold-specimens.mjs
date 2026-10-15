// Render the native FOLD mark and real typefaces as the raster specimens used by the site.
// Run: node production/pipeline/fold-specimens.mjs
// Uses the pipeline's existing sharp dependency. Font licenses sit beside the font files.
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const root = new URL('../../', import.meta.url)
const asset = (name) => fileURLToPath(new URL(`public/projects/fold/${name}`, root))
const font = (name) => fileURLToPath(new URL(`assets/fold-fonts/${name}`, import.meta.url))
const size = 1254
const ink = '#151311'
const svg = (body) => Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">${body}</svg>`)

// Take the mark directly from the canonical path, not from a font or a generated imitation.
const source = await readFile(new URL('src/projects/fold/wordmark.ts', root), 'utf8')
const path = source.match(/export const PATH\s*=\s*'([^']+)'/)?.[1]
if (!path) throw new Error('FOLD master path not found')
const scale = 1.1
await sharp(asset('material-kraft.png'))
  .resize(size, size)
  .composite([{ input: svg(`<path fill="${ink}" fill-rule="evenodd" d="${path}" transform="translate(77 393.25) scale(${scale})"/>`) }])
  .webp({ quality: 92, effort: 6 })
  .toFile(asset('system-wordmark-v2.webp'))

const fonts = {
  anton: { font: 'Anton', fontfile: font('Anton-Regular.ttf') },
  mono: { font: 'IBM Plex Mono', fontfile: font('IBMPlexMono-Regular.ttf') },
  inter: { font: 'Inter', fontfile: font('Inter.ttf') },
}
async function type(text, family, px, left, top, colour = ink) {
  const face = fonts[family]
  const buffer = await sharp({ text: {
    text: `<span foreground="${colour}">${text}</span>`,
    font: `${face.font} ${px}`, fontfile: face.fontfile, dpi: 72, rgba: true,
  } }).png().toBuffer({ resolveWithObject: true })
  if (left + buffer.info.width > size || top + buffer.info.height > size) {
    throw new Error(`Specimen text exceeds card: ${text}`)
  }
  return { input: buffer.data, left, top }
}
const grid = svg('<g stroke="#151311" stroke-opacity=".22" stroke-width="1.5"><path d="M76 192H1178M76 825H1178M100 170V851M100 1048H1154"/></g>')
await sharp(asset('material-paper.png')).resize(size, size).composite([
  { input: grid },
  await type('TYPE / 03 FAMILIES', 'mono', 21, 100, 78, '#625b53'),
  await type('ANTON', 'mono', 22, 930, 135, '#625b53'),
  await type('DISPLAY', 'mono', 22, 930, 164, '#625b53'),
  await type('Aa', 'anton', 670, 106, 232),
  await type('Aa', 'mono', 142, 100, 899),
  await type('IBM PLEX MONO', 'mono', 23, 382, 907, '#625b53'),
  await type('DETAILS / 0123456789', 'mono', 23, 382, 945, '#625b53'),
  await type('INTER / READING', 'mono', 20, 100, 1083, '#625b53'),
  await type('Good things inside.', 'inter', 47, 100, 1131),
]).webp({ quality: 92, effort: 6 }).toFile(asset('system-type-v2.webp'))

console.log('Rendered system-wordmark-v2.webp and system-type-v2.webp from the master mark and font files.')
