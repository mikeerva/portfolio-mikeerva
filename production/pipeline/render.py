"""Entry point. From the repo root:

    D:/blender.exe -b production/pulse-approved/PULSE_APPROVED_MASTER.blend \
        --python production/pipeline/render.py -- <shot> [<shot> …] [--preview] [--save]

Shots are defined in pulse_shots.py. --preview renders at 30 % with few samples.
--save writes every scene built in this run to production/pulse-3d/PULSE_CAMPAIGN_SCENES.blend
(a copy; the approved master is never saved).
"""
import sys
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import bpy  # noqa: E402
import pulse_lib as L  # noqa: E402
import pulse_shots as S  # noqa: E402

args = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
flags = {a for a in args if a.startswith('--')}
names = [a for a in args if not a.startswith('--')] or list(S.SHOTS)
master = Path(bpy.data.filepath).resolve()

for name in names:
    t = time.time()
    kwargs = {'preview': '--preview' in flags}
    if '--anim' in flags and name in ('hero', 'phys1', 'phys2'):
        kwargs['anim'] = True
    S.SHOTS[name](**kwargs)
    print(f'PULSE_SHOT_DONE {name} {time.time() - t:.0f}s', flush=True)

if '--save' in flags:
    out = L.REPO / 'production' / 'pulse-3d' / 'PULSE_CAMPAIGN_SCENES.blend'
    assert out.resolve() != master
    bpy.ops.wm.save_as_mainfile(filepath=str(out), copy=True)
    print('PULSE_SAVED', out)
