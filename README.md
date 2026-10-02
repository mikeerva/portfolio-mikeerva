# Mike Androulakis — Hero

Single-screen hero: a music-reactive "dark matter" sphere (Three.js + Web Audio API), logo in the centre, two buttons.

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # typecheck + production build to dist/
```

## Where things live

| What | File |
| --- | --- |
| Name, role, button targets, email | `src/config.ts` |
| Logo (placeholder wordmark) | `src/components/Logo.tsx` |
| Sphere: geometry, bloom, camera | `src/scene/DarkMatter.ts` |
| Sphere: shaders (displacement, inner glow) | `src/scene/shaders.ts` |
| Music + frequency analysis | `src/lib/audio.ts` |

## Music

"Dark Fog" by Kevin MacLeod (incompetech.com), licensed under
[Creative Commons: By Attribution 4.0](https://creativecommons.org/licenses/by/4.0/).
The credit shown top-left of the page is required by the licence — keep it, or swap the track.

To use a different track (e.g. one downloaded from Pixabay, which needs no credit), drop the MP3 in
`public/audio/` and update `track` in `src/lib/audio.ts`.

Browsers block autoplay with sound, so music starts when the visitor presses the sound button.
