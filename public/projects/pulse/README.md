# PULSE — case-study assets

Everything the PULSE case study (`src/projects/pulse/`) loads from this folder. All of it is
produced from the approved Blender master — nothing here is hand-placed or AI-generated.

## Source and pipeline

- **Approved master:** `production/pulse-approved/PULSE_APPROVED_MASTER.blend`
  (scene `PULSE_PHASE1_5_STUDIO_v02`: product master v02 + wordmark v03). Never written to;
  its SHA-256 is recorded in `production/pipeline/MASTER.sha256` and checked after every run.
- **Shots:** `production/pipeline/pulse_shots.py` builds each scene around a *collection
  instance* of the approved product, so geometry, materials, proportions, the Signature Ring and
  the wordmark position cannot change.
- **Render:** from the repo root
  `D:/blender.exe -b production/pulse-approved/PULSE_APPROVED_MASTER.blend --python production/pipeline/render.py -- <shots…> [--preview] [--anim] [--save]`
  or `production/pipeline/run_all.sh` for everything (Cycles, OptiX).
- **Publish:** `cd production/pipeline && node publish.mjs` — dithers each 16-bit render with a
  fine grain and encodes AVIF, encodes the loops to H.264 MP4, copies the GLB and Draco decoder,
  and regenerates `src/projects/pulse/ring-trace.ts` (the Ring's centreline as the macro camera
  saw it, measured from the 3D master).
- **GLB:** `production/pipeline/export_glb.py` — evaluated copies (mirror applied, wordmark as
  mesh), each mirrored pair split into its left and right halves (`|L`, `|R`) so the page can
  move the parts apart along each cup's axis, dense surfaces decimated 50 %, Draco-compressed.
- **Cameras:** `production/pipeline/export_cameras.py` writes `src/projects/pulse/stage-cams.ts`:
  the hero, ring-macro, final and view cameras in three.js coordinates, and each cup's axis. The
  live stage (`PulseStage.tsx`, `timeline.ts`) starts and ends on these cameras, so it cuts to the
  renders without a jump.

## Files

| ID | Files | Size |
| --- | --- | --- |
| PULSE_HERO_01 | hero-01.avif + .mp4, hero-01-m.avif + .mp4 | 2400×1600 / 1200×2000 (loops 1280×854 / 720×1200, 7 s) |
| PULSE_RING_MACRO_01 | ring-macro-01.avif, ring-macro-01-m.avif | 2400×1600 / 1200×2000 |
| PULSE_MAT_01–03 | mat-01.avif … mat-03.avif | 1440×1800 |
| PULSE_PHYS_01 | phys-01.avif + .mp4 | 1440×1800 (loop 1080×1350, 5.5 s) |
| PULSE_PHYS_02, _03 | phys-02.avif, phys-03.avif | 1440×1800 |
| PULSE_CAMP_SPACE_01 | camp-space-01.avif, camp-space-01-m.avif | 2400×1600 / 1200×2000 |
| PULSE_CAMP_ARCH_01 | camp-arch-01.avif (2 : 1), camp-arch-01-m.avif (4 : 5) | 2880×1440 / 1440×1800 |
| PULSE_CAMP_PRODUCT_01 | camp-product-01.avif | 1440×1800 |
| PULSE_VIEW_FRONT / SIDE / BACK / 34 | view-*.avif (alpha) | 1400×1400 |
| PULSE_FINAL_01 | final-01.avif, final-01-m.avif | 2400×1600 / 1200×2000 |
| 3D master | pulse-01.glb, draco/ | Draco GLB, 21 parts, ~200 KB |

Full-panel slots have two compositions — a 3 : 2 desktop frame and a separate 3 : 5 portrait
frame, each with its own camera — never a crop of one another.

## Rules kept

- The pressure of sound always travels in the shape of the Signature Ring (superellipse, n = 4),
  never in circles: the fabric wave, the dust boundaries, the water ripples, the skylight.
- No people: no tool available here can put the approved product on a person without
  redesigning it, so the campaign is product and architecture.
- The wordmark in posters is set in the page, never rendered or generated.
