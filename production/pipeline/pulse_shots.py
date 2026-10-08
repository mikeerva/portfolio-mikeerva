"""PULSE shots. Each builds its own scene around the approved product and renders its frames
to production/renders/. Desktop frames are 3:2 (or the slot's ratio); portrait frames are
separate compositions with their own camera, never crops.

Art direction, one rule everywhere: the world is real and only one thing is impossible — the
pressure of sound, which travels in the shape of the Signature Ring (a superellipse, n = 4),
never in circles."""
import math
import json
import os
from pathlib import Path
import bpy
import numpy as np
from mathutils import Vector

import pulse_lib as L

R = L.RENDERS
# Loop frames are large 16-bit PNG sequences: they go wherever PULSE_FRAMES points (another drive
# if the system drive is short of space), and are deleted once publish.mjs has encoded them
FRAMES = Path(os.environ.get('PULSE_FRAMES', str(R / 'frames')))
SHOTS = {}
RNG = np.random.default_rng(7)


def shot(fn):
    SHOTS[fn.__name__.removeprefix('shot_')] = fn
    return fn


def portrait(sc, w=1200, h=2000):
    sc.render.resolution_x, sc.render.resolution_y = w, h


def ease(x):
    x = min(max(x, 0.0), 1.0)
    return x * x * (3 - 2 * x)


# ------------------------------------------------------------------ materials

def dark_stone():
    return L.material('PULSE SET | dark basalt', (0.016, 0.015, 0.014), rough=0.62, bump=(55, 0.35, 10))


def concrete(tone=0.2, name='PULSE SET | concrete'):
    return L.material(name, (tone, tone * 0.96, tone * 0.9), rough=0.9, bump=(14, 0.25, 12))


def dust_material():
    return L.material('PULSE SET | stone dust', (0.75, 0.72, 0.66), rough=0.6, sheen=0.4)


# ------------------------------------------------------------------ the Ring, measured

def ring_frame(inst):
    """The +X cup's Signature Ring: its points, centre, outward normal and in-plane axes."""
    bpy.context.view_layer.update()
    inv = inst.matrix_world.inverted()
    pts = [p for p in L.product_points(inst, 'Signature Ring') if (inv @ p).x > 0]
    P = np.array([tuple(p) for p in pts])
    C = P.mean(0)
    _, _, vt = np.linalg.svd(P - C)
    n = vt[2]
    out = np.array(tuple(inst.matrix_world.to_3x3() @ Vector((1, 0, 0))))
    if n @ out < 0:
        n = -n
    up = np.array(tuple(inst.matrix_world.to_3x3() @ Vector((0, 0, 1))))
    v = up - (up @ n) * n
    v /= np.linalg.norm(v)
    front = np.array(tuple(inst.matrix_world.to_3x3() @ Vector((0, -1, 0))))
    w = front - (front @ n) * n - (front @ v) * v
    w /= np.linalg.norm(w)
    return P, C, n, v, w


def trace_ring(sc, cam, P, C, n, direction):
    """The Ring as the camera sees it: an SVG path through the band's centreline, in the
    rendered frame's own pixels (so the page's trace sits exactly on the photograph)."""
    perp = np.cross(n, direction)
    Q = P - C
    theta = np.arctan2(Q @ perp, Q @ direction)
    # the band is several loops of the same 192 profile samples: average each sample's loops in
    # 3D for the centreline, then smooth it lightly before projecting
    key = np.round(theta / (2 * math.pi) * 192).astype(int)
    order = sorted(set(key.tolist()))
    centre = np.array([P[key == k].mean(0) for k in order])
    kernel = np.array([1, 2, 3, 2, 1], float) / 9
    padded = np.concatenate([centre[-2:], centre, centre[:2]])
    centre = np.stack([np.convolve(padded[:, i], kernel, 'valid') for i in range(3)], 1)
    px = L.project(sc, cam, [Vector(tuple(p)) for p in centre])
    W, H = sc.render.resolution_x, sc.render.resolution_y
    path = [(x, y) for x, y, z in px if z > 0 and -0.2 * W < x < 1.2 * W and -0.2 * H < y < 1.2 * H]
    d = 'M' + 'L'.join(f'{x:.0f} {y:.0f}' for x, y in path)
    return {'size': [W, H], 'd': d, 'points': len(path)}


# ------------------------------------------------------------------ 01 hero / 06 final

# The hero loop: one strip of light travels behind, around and across the product, so the
# Signature Ring writes itself in light; then the dark holds. The loop starts at the poster
# moment, so the poster is frame 0 and the video can take over from it without a jump.
HERO_FRAMES = 168  # 7 s at 24 fps
HERO_POSTER_U = 0.6


def hero_light(strip, u):
    active = 0.74
    if u < active:
        k = u / active
        az = math.radians(165 - 200 * ease(k))
        strip.data.energy = 3.4 * math.sin(math.pi * k) ** 0.7
    else:
        az = math.radians(-35)
        strip.data.energy = 0.0
    strip.location = (0.5 * math.cos(az), 0.5 * math.sin(az), 0.36)
    L.look_at(strip, (0.05, 0.0, 0.06))


def hero_scene(name):
    sc = L.new_scene(name, (2400, 1600), samples=128)
    L.box(sc, 'slab', (1.6, 0.9, 0.12), (0.05, 0.12, -0.06), dark_stone(), bevel=0.004)
    p = L.product(sc)
    strip = L.area(sc, 'strip', (0.3, 0.3, 0.36), (0, 0, 0.06), size=(0.03, 1.1), energy=3.2, color=(1, 0.95, 0.88), spread=40)
    L.area(sc, 'rim', (-0.35, 0.45, 0.35), (0, 0, 0.12), size=(0.4, 0.2), energy=0.25, color=(0.92, 0.95, 1.0))
    return sc, p, strip


@shot
def shot_hero(preview=False, anim=False):
    sc, p, strip = hero_scene('PULSE SHOT | 01 hero')
    hero_light(strip, HERO_POSTER_U)
    cams = [
        ('', (2400, 1600), L.camera(sc, (0.52, -0.74, 0.2), (0.012, 0.0, 0.098), lens=50, shift=(-0.12, 0), name='hero_desk')),
        ('-m', (1200, 2000), L.camera(sc, (0.46, -0.66, 0.24), (0.01, 0.0, 0.1), lens=50, shift=(0, 0.13), name='hero_portrait')),
    ]
    for suffix, size, cam in cams:
        sc.camera = cam
        sc.render.resolution_x, sc.render.resolution_y = size
        hero_light(strip, HERO_POSTER_U)
        L.render(sc, R / f'hero-01{suffix}.png', preview=preview)
        if anim:
            sc.render.resolution_x, sc.render.resolution_y = (1280, 854) if not suffix else (720, 1200)
            sc.cycles.samples = 24
            sc.render.use_persistent_data = True  # only the light moves: keep the scene built between frames
            for f in range(HERO_FRAMES):
                hero_light(strip, (HERO_POSTER_U + f / HERO_FRAMES) % 1.0)
                L.render(sc, FRAMES / f'hero{suffix}' / f'{f:04d}.png')


@shot
def shot_final(preview=False):
    sc, p, strip = hero_scene('PULSE SHOT | 06 final')
    p.rotation_euler.z = math.radians(-90)  # the +X cup to the camera: the product in profile
    strip.location = (0.0, -0.39, 0.285)
    L.look_at(strip, (0.0, 0.0, 0.06))
    strip.data.energy = 1.6
    L.camera(sc, (0.0, -0.95, 0.12), (0.0, 0.0, 0.1), lens=55, shift=(0, -0.09), name='final_desk')
    L.render(sc, R / 'final-01.png', preview=preview)
    portrait(sc)
    L.camera(sc, (0.0, -0.9, 0.15), (0.0, 0.0, 0.11), lens=80, shift=(0, -0.04), name='final_portrait')
    L.render(sc, R / 'final-01-m.png', preview=preview)


# ------------------------------------------------------------------ 02 macros

def macro_scene(name, size):
    sc = L.new_scene(name, size, samples=128, world=(0.02, 0.02, 0.022), world_strength=1.0)
    L.box(sc, 'slab', (1.0, 1.0, 0.1), (0, 0, -0.05), dark_stone())
    p = L.product(sc)
    return sc, p


@shot
def shot_ring(preview=False):
    sc, p = macro_scene('PULSE SHOT | 02 ring macro', (2400, 1600))
    P, C, n, v, w = ring_frame(p)
    d = v * 0.85 + w * 0.55
    d /= np.linalg.norm(d)
    # the corner of the Ring nearest that direction
    corner = P[np.argmax((P - C) @ d)]
    # a strip whose reflection runs along the Ring
    L.area(sc, 'strip', tuple(corner + n * 0.16 + d * 0.16 + v * 0.05), tuple(corner), size=(0.012, 0.5), energy=1.4, color=(1, 0.93, 0.84), spread=30)
    L.area(sc, 'fill', tuple(C + n * 0.3 - d * 0.2), tuple(C), size=(0.3, 0.3), energy=0.08, color=(0.85, 0.9, 1))
    traces = {}
    for key, size, back, lens in (('desktop', (2400, 1600), 0.03, 100), ('portrait', (1200, 2000), 0.022, 85)):
        sc.render.resolution_x, sc.render.resolution_y = size
        loc = corner + n * 0.085 - d * back
        cam = L.camera(sc, tuple(loc), tuple(corner - d * 0.006), lens=lens, focus=tuple(corner), fstop=3.2, name=f'ring_{key}')
        L.render(sc, R / ('ring-macro-01.png' if key == 'desktop' else 'ring-macro-01-m.png'), preview=preview)
        traces[key] = trace_ring(sc, cam, P, C, n, d)
    (R / 'ring-trace.json').write_text(json.dumps(traces, indent=1))


@shot
def shot_mats(preview=False):
    sc, p = macro_scene('PULSE SHOT | 02 materials', (1440, 1800))
    # 01 cushion: the left cup's cushion, seen across from between the cups
    key = L.area(sc, 'key', (0.06, -0.25, 0.22), (-0.06, 0, 0.05), size=(0.25, 0.25), energy=3.0, color=(1, 0.95, 0.9))
    rim = L.area(sc, 'rim', (0.0, 0.25, 0.16), (-0.06, 0, 0.06), size=(0.02, 0.3), energy=0.9, color=(1, 0.95, 0.9))
    L.camera(sc, (0.035, -0.11, 0.085), (-0.058, -0.004, 0.05), lens=85, focus=(-0.055, -0.03, 0.055), fstop=2.8, name='mat_cushion')
    L.render(sc, R / 'mat-01.png', preview=preview)
    # 02 the connector: where the headband's dark metal meets the cup
    key.location = (0.3, -0.2, 0.3)
    L.look_at(key, (0.09, 0, 0.11))
    rim.location = (0.15, 0.2, 0.3)
    L.look_at(rim, (0.09, 0, 0.11))
    L.camera(sc, (0.21, -0.14, 0.17), (0.092, 0.0, 0.108), lens=100, focus=(0.096, -0.008, 0.112), fstop=4, name='mat_connector')
    L.render(sc, R / 'mat-02.png', preview=preview)
    # 03 the marking, on the +X cup's outer face, with the Ring's edge beside it
    P, C, n, v, w = ring_frame(p)
    wm = np.array((0.083, -0.022, 0.028))
    key.location = tuple(wm + n * 0.22 + v * 0.16 - w * 0.05)
    L.look_at(key, tuple(wm))
    key.data.energy = 1.2
    rim.data.energy = 0.0
    corner = P[np.argmax((P - C) @ (-v * 0.6 + w * 0.8))]
    aim = wm * 0.6 + corner * 0.4
    L.camera(sc, tuple(aim + n * 0.15 + v * 0.03), tuple(aim), lens=100, focus=tuple(wm), fstop=5.6, name='mat_mark')
    L.render(sc, R / 'mat-03.png', preview=preview)


# ------------------------------------------------------------------ 03 physical studies

def curtain_geometry(X, Z, rings):
    """Heavy fabric hanging in folds; each ring (radius, amplitude) is a squircle of pressure
    pushed out through it from the headphones."""
    folds = 0.009 * np.sin(2 * np.pi * X / 0.23 + 0.8 * np.sin(2 * np.pi * X / 0.67)) + 0.0025 * np.sin(2 * np.pi * X / 0.09 + 1.3)
    env = 0.55 + 0.45 * (1 - Z / Z.max())
    Y = 0.24 + folds * env
    r = L.squircle_r(X, Z - 0.12, 1.0, 1.3)
    for radius, amp in rings:
        Y = Y + amp * np.exp(-((r - radius) / 0.045) ** 2)
    return np.stack([X, Y, Z], -1)


PHYS1_FRAMES = 132  # 5.5 s
PHYS1_POSTER = 0.12


def phys1_rings(u):
    """One wave per loop: it leaves the headphones, travels out and decays, then stillness."""
    rings = []
    for lag, scale in ((0.0, 1.0), (0.09, 0.45)):
        k = (u - lag) % 1.0
        if k < 0.7:
            t = k / 0.7
            rings.append((0.05 + 0.85 * (1 - (1 - t) ** 2), 0.065 * scale * (1 - t) ** 1.6 * min(1.0, t * 8)))
    return rings


@shot
def shot_phys1(preview=False, anim=False):
    sc = L.new_scene('PULSE SHOT | 03 fabric', (1440, 1800), samples=128, world=(0.01, 0.01, 0.012), world_strength=1.0)
    L.plane(sc, 'floor', (6, 6), (0, 0, 0), mat=concrete(0.05))
    linen = L.material('PULSE SET | dark linen', (0.018, 0.017, 0.016), rough=0.86, sheen=0.7, sheen_rough=0.35, bump=(700, 0.12, 4))
    xs = np.linspace(-0.7, 0.7, 420)
    zs = np.linspace(0.0, 1.1, 330)
    X, Z = np.meshgrid(xs, zs)
    cloth = L.grid_mesh(sc, 'curtain', curtain_geometry(X, Z, phys1_rings(PHYS1_POSTER)), linen)
    L.box(sc, 'bench', (0.56, 0.2, 0.11), (0, 0.03, 0.055), dark_stone(), bevel=0.003)
    L.product(sc, loc=(0, 0.03, 0.11), rot=(0, 0, 18))
    L.spot(sc, 'graze', (-1.05, -0.3, 1.3), (0.05, 0.24, 0.32), energy=420, angle=40, blend=0.3, radius=0.04, color=(1, 0.93, 0.84))
    L.area(sc, 'top', (0.1, -0.2, 1.6), (0, 0.1, 0.1), size=(0.8, 0.8), energy=6, color=(0.9, 0.93, 1))
    L.area(sc, 'kick', (0.6, -0.3, 0.2), (0, 0.03, 0.15), size=(0.03, 0.4), energy=0.7, color=(1, 0.95, 0.9))
    L.camera(sc, (0.0, -1.2, 0.36), (0.0, 0.15, 0.24), lens=72, focus=(0, 0.03, 0.15), fstop=5.6, name='phys1')
    L.render(sc, R / 'phys-01.png', preview=preview)
    if anim:
        sc.render.resolution_x, sc.render.resolution_y = 1080, 1350
        sc.cycles.samples = 32
        sc.render.use_persistent_data = True
        for f in range(PHYS1_FRAMES):
            L.set_grid(cloth, curtain_geometry(X, Z, phys1_rings((PHYS1_POSTER + f / PHYS1_FRAMES) % 1.0)))
            L.render(sc, FRAMES / 'phys1' / f'{f:04d}.png')


def squircle_shell(n_pts, centre, axes, inner, spread, rng):
    """Points pushed out of a superellipsoid around the product, gathered on its boundary."""
    d = rng.normal(size=(n_pts, 3))
    s = (np.abs(d[:, 0]) ** 4 + np.abs(d[:, 1]) ** 4 + np.abs(d[:, 2]) ** 4) ** 0.25
    d = d / s[:, None]
    r = inner + np.abs(rng.normal(0, spread, n_pts)) + rng.exponential(spread * 0.8, n_pts) * (rng.random(n_pts) < 0.25)
    return np.asarray(centre) + d * np.asarray(axes) * r[:, None]


@shot
def shot_phys2(preview=False, anim=False):
    sc = L.new_scene('PULSE SHOT | 03 dust and light', (1440, 1800), samples=192, world=(0.0, 0.0, 0.0), world_strength=0.0)
    L.plane(sc, 'floor', (8, 8), (0, 0, 0), mat=dark_stone())
    L.plane(sc, 'wall', (8, 4), (0, 1.4, 2), rot=(90, 0, 0), mat=concrete(0.04))
    L.product(sc, rot=(0, 0, 24))
    haze = L.box(sc, 'haze', (3.0, 3.0, 3.0), (0, 0.2, 1.5), L.volume_material('PULSE SET | haze', 0.035, anisotropy=0.45))
    haze.visible_shadow = False
    # the beam: from high on the right, crossing just above the headphones
    L.spot(sc, 'beam', (1.3, 0.5, 2.4), (-0.1, 0.05, 0.2), energy=2600, angle=11, blend=0.25, radius=0.03, color=(1, 0.94, 0.85))
    L.area(sc, 'kick', (-0.5, -0.4, 0.3), (0, 0, 0.1), size=(0.02, 0.5), energy=0.5, color=(1, 0.95, 0.9))
    # dust everywhere; around the headphones it has been pushed out to a Ring-shaped boundary
    loose = RNG.uniform((-0.7, -0.4, 0.02), (0.7, 0.6, 1.2), (70000, 3))
    centre = np.array((0, 0, 0.11))
    rr = L.squircle_r(loose[:, 0] - centre[0], loose[:, 2] - centre[2], 0.34, 0.42)
    rr = np.maximum(rr, L.squircle_r(loose[:, 1] - centre[1], loose[:, 2] - centre[2], 0.34, 0.42))
    loose = loose[rr > 1.0]
    shell = squircle_shell(26000, centre, (0.34, 0.34, 0.42), 1.0, 0.035, RNG)
    shell = shell[shell[:, 2] > 0.005]
    L.points(sc, 'dust', np.concatenate([loose, shell]), 0.0011, dust_material())
    L.camera(sc, (0.0, -1.55, 0.42), (0.0, 0.1, 0.36), lens=52, focus=(0, 0, 0.12), fstop=4, name='phys2')
    L.render(sc, R / 'phys-02.png', preview=preview)


def water_geometry(X, Y):
    r = L.squircle_r(X, Y, 1.25, 1.0)
    h = 0.00045 * np.exp(-(r - 0.12) / 0.4) * np.cos(2 * np.pi * (r - 0.12) / 0.05)
    h = np.where(r < 0.12, 0.00045 * np.exp(-(0.12 - r) / 0.02), h)
    return np.stack([X, Y, 0.006 + h], -1)


@shot
def shot_phys3(preview=False):
    sc = L.new_scene('PULSE SHOT | 03 water', (1440, 1800), samples=160, world=(0.01, 0.01, 0.012), world_strength=1.0)
    wet = L.material('PULSE SET | wet basalt', (0.008, 0.008, 0.008), rough=0.35, bump=(40, 0.4, 10))
    L.box(sc, 'slab', (1.6, 1.6, 0.1), (0, 0.2, -0.05), wet)
    water = L.material('PULSE SET | water', (1, 1, 1), rough=0.015, transmission=1.0, ior=1.333, spec=0.5)
    xs = np.linspace(-0.7, 0.7, 520)
    ys = np.linspace(-0.6, 0.9, 560)
    X, Y = np.meshgrid(xs, ys)
    L.grid_mesh(sc, 'water', water_geometry(X, Y), water)
    L.product(sc, rot=(0, 0, 0))
    # long soft panels whose reflections draw the ripples
    L.area(sc, 'panel', (0.0, 1.25, 0.75), (0, 0.1, 0), size=(1.8, 0.5), energy=10, color=(1, 0.96, 0.9))
    L.area(sc, 'strip', (0.9, 0.7, 0.5), (0, 0.05, 0), size=(0.02, 1.2), energy=6, color=(1, 0.95, 0.88))
    L.area(sc, 'kick', (-0.5, -0.4, 0.4), (0, 0, 0.1), size=(0.4, 0.4), energy=0.6, color=(0.9, 0.93, 1))
    L.camera(sc, (0.0, -0.9, 0.42), (0.0, 0.08, 0.03), lens=58, focus=(0, 0, 0.08), fstop=5.6, name='phys3')
    L.render(sc, R / 'phys-03.png', preview=preview)


# ------------------------------------------------------------------ 04 campaign

@shot
def shot_camp_product(preview=False):
    sc = L.new_scene('PULSE SHOT | 04 suspended', (1440, 1800), samples=160, world=(0.0, 0.0, 0.0), world_strength=0.0)
    backdrop = L.material('PULSE SET | backdrop', (0.05, 0.047, 0.043), rough=0.9)
    L.plane(sc, 'backdrop', (6, 4), (0, 2.2, 1.5), rot=(90, 0, 0), mat=backdrop)
    L.product(sc, loc=(0.0, 0.0, 0.42), rot=(14, -10, 30))
    centre = (0.0, 0.0, 0.52)
    shell = squircle_shell(60000, centre, (0.2, 0.2, 0.25), 1.0, 0.09, RNG)
    L.points(sc, 'dust', shell, 0.0009, dust_material())
    L.area(sc, 'key', (0.6, -0.5, 0.9), (0, 0, 0.5), size=(0.5, 0.5), energy=6, color=(1, 0.94, 0.86))
    L.area(sc, 'rim_l', (-0.5, 0.6, 0.7), (0, 0, 0.5), size=(0.03, 0.9), energy=5, color=(1, 0.95, 0.9))
    L.area(sc, 'rim_r', (0.55, 0.55, 0.4), (0, 0, 0.5), size=(0.03, 0.9), energy=4, color=(0.9, 0.93, 1))
    L.area(sc, 'wash', (0, 1.6, 2.4), (0, 2.2, 1.0), size=(2, 1), energy=30, color=(1, 0.93, 0.84))
    L.camera(sc, (0.0, -1.2, 0.5), (0.0, 0.0, 0.5), lens=68, focus=(0, -0.03, 0.52), fstop=4.5, name='suspended')
    L.render(sc, R / 'camp-product-01.png', preview=preview)


def atrium(name, size):
    """A concrete hall lit only through a Ring-shaped skylight: the light falls in the shape of
    the Signature Ring onto one plinth, where the headphones rest."""
    sc = L.new_scene(name, size, samples=160, world=(0.03, 0.032, 0.036), world_strength=0.6, exposure=1.3)
    wall = concrete(0.5, 'PULSE SET | hall concrete')
    floor = L.material('PULSE SET | hall floor', (0.2, 0.19, 0.175), rough=0.55, bump=(9, 0.12, 10))
    Hh = 7.0
    L.plane(sc, 'floor', (14, 14), (0, 0, 0), mat=floor)
    L.plane(sc, 'back', (14, Hh), (0, 5, Hh / 2), rot=(90, 0, 0), mat=wall)
    L.plane(sc, 'left', (14, Hh), (-5, 0, Hh / 2), rot=(90, 0, 90), mat=wall)
    L.plane(sc, 'right', (14, Hh), (5, 0, Hh / 2), rot=(90, 0, -90), mat=wall)
    for i, y in enumerate(np.arange(-4.2, 4.6, 1.6)):
        L.box(sc, f'pilaster_l{i}', (0.5, 0.42, Hh), (-4.75, y, Hh / 2), wall)
        L.box(sc, f'pilaster_r{i}', (0.5, 0.42, Hh), (4.75, y, Hh / 2), wall)
    for i, x in enumerate((-2.4, 2.4)):
        L.box(sc, f'pilaster_b{i}', (0.42, 0.5, Hh), (x, 4.75, Hh / 2), wall)
    L.box(sc, 'bench', (3.2, 0.45, 0.42), (0, 4.4, 0.21), wall)
    # the sun, high and from behind-right; the opening is placed so its light lands on the plinth
    d = Vector((-0.32, -0.42, -1.0)).normalized()
    L.sun(sc, 'sun', tuple(d), strength=11, angle=0.35, color=(1, 0.93, 0.82))
    hole_c = -d * (Hh / -d.z)
    L.squircle_hole_slab(sc, 'ceiling', (14, 14), (1.5, 1.85), 0.5, (hole_c.x, hole_c.y, Hh), wall)
    haze = L.box(sc, 'haze', (10, 10, Hh), (0, 0, Hh / 2), L.volume_material('PULSE SET | hall haze', 0.011, anisotropy=0.55))
    haze.visible_shadow = False
    L.box(sc, 'plinth', (0.46, 0.46, 0.52), (0, 0, 0.26), concrete(0.3, 'PULSE SET | plinth'), bevel=0.004)
    L.product(sc, loc=(0, 0, 0.52), rot=(0, 0, 28))
    return sc


@shot
def shot_camp_space(preview=False):
    sc = atrium('PULSE SHOT | 04 hall', (2400, 1600))
    L.camera(sc, (-0.35, -2.9, 1.15), (0.0, 0.0, 0.92), lens=32, shift=(0, -0.04), name='hall_desk')
    L.render(sc, R / 'camp-space-01.png', preview=preview)
    portrait(sc)
    L.camera(sc, (0.0, -3.4, 0.9), (0.0, 0.0, 2.1), lens=24, name='hall_portrait')
    L.render(sc, R / 'camp-space-01-m.png', preview=preview)


@shot
def shot_camp_arch(preview=False):
    sc = atrium('PULSE SHOT | 04 hall wide', (2880, 1440))
    L.camera(sc, (3.4, -4.2, 0.55), (0.0, 0.0, 1.35), lens=22, name='arch_desk')
    L.render(sc, R / 'camp-arch-01.png', preview=preview)
    portrait(sc, 1440, 1800)
    L.camera(sc, (0.3, -2.6, 0.4), (0.0, 0.0, 2.6), lens=20, name='arch_portrait')
    L.render(sc, R / 'camp-arch-01-m.png', preview=preview)


# ------------------------------------------------------------------ 05 product master views

@shot
def shot_views(preview=False):
    sc = L.new_scene('PULSE SHOT | 05 views', (1400, 1400), samples=128, world=(0.42, 0.40, 0.36), world_strength=0.25, look='AgX - Base Contrast', exposure=-1.45)
    sc.render.film_transparent = True
    sc.render.image_settings.color_mode = 'RGBA'
    ground = L.plane(sc, 'catcher', (3, 3), (0, 0, 0.0035))
    ground.is_shadow_catcher = True
    L.product(sc)
    # the approved v03 softbox rig, re-created around the product
    L.area(sc, 'key', (0.28, -0.34, 0.34), (0, 0, 0.1), size=(0.32, 0.25), energy=8, color=(1, 0.92, 0.84))
    # only the key and top cast shadows onto the catcher; low fills would smear them sideways
    fill = L.area(sc, 'fill', (-0.3, -0.22, 0.22), (0, 0, 0.1), size=(0.28, 0.25), energy=2.4, color=(0.86, 0.9, 1.0))
    rim = L.area(sc, 'rim', (0.12, 0.28, 0.34), (0, 0, 0.1), size=(0.26, 0.25), energy=10, color=(1, 0.97, 0.92))
    fill.data.use_shadow = False
    rim.data.use_shadow = False
    L.area(sc, 'top', (0.0, -0.05, 0.48), (0, 0, 0.1), size=(0.24, 0.25), energy=4, color=(1, 0.94, 0.86))
    views = {'front': (0, -1.0, 0.11), 'side': (1.0, 0, 0.11), 'back': (0, 1.0, 0.11), '34': (0.6, -0.74, 0.34)}
    for key, loc in views.items():
        L.camera(sc, loc, (0, 0, 0.106), lens=105, name=f'view_{key}')
        L.render(sc, R / f'view-{key}.png', preview=preview)
