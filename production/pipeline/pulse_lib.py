"""PULSE production pipeline: shared tools for every shot.

Runs inside Blender, opened on the approved master:
    blender -b production/pulse-approved/PULSE_APPROVED_MASTER.blend --python production/pipeline/render.py -- <shot> [options]

The master is never written. The product enters each shot as a COLLECTION INSTANCE of the
approved collections (the v02 product master and the v03 wordmark), so no mesh, material,
proportion, Signature Ring or wordmark position can change: a shot only places the instance,
the camera and the light around it. Scenes are new data-blocks in memory; render.py can save
them to production/pulse-3d/PULSE_CAMPAIGN_SCENES.blend, a separate file.
"""
import bpy
import math
from pathlib import Path
from mathutils import Vector

import numpy as np

REPO = Path(bpy.data.filepath).resolve().parents[2]
RENDERS = REPO / 'production' / 'renders'
APPROVED_SCENE = 'PULSE_PHASE1_5_STUDIO_v02'
PRODUCT_COLLECTIONS = ('PULSE_PRODUCT_MASTER_v02', 'PULSE_PHASE2_LOOKDEV')

# Approved product, in metres: X ±0.1016 (cups), Y ±0.04, Z 0.0035–0.209. Cup centres at
# X ±0.074, Z 0.055, splayed 16°; the wordmark sits on the +X cup's outer face.
CUP_CENTRE = Vector((0.074, 0.0, 0.055))
CUP_SPLAY = math.radians(16)


# ------------------------------------------------------------------ product

def product_source():
    src = bpy.data.collections.get('PULSE_PRODUCT_SRC')
    if src is None:
        src = bpy.data.collections.new('PULSE_PRODUCT_SRC')
        for name in PRODUCT_COLLECTIONS:
            src.children.link(bpy.data.collections[name])
    return src


def product(scene, loc=(0, 0, 0), rot=(0, 0, 0), name='PULSE 01'):
    """The approved product, placed. Rotation in degrees (X, Y, Z)."""
    inst = bpy.data.objects.new(name, None)
    inst.instance_type = 'COLLECTION'
    inst.instance_collection = product_source()
    inst.location = loc
    inst.rotation_euler = [math.radians(a) for a in rot]
    scene.collection.objects.link(inst)
    return inst


def product_points(inst, object_filter):
    """World-space vertices of the evaluated (mirrored) product parts whose name contains
    object_filter, as placed by the instance."""
    dg = bpy.context.evaluated_depsgraph_get()
    pts = []
    for coll in PRODUCT_COLLECTIONS:
        for ob in bpy.data.collections[coll].all_objects:
            if ob.type != 'MESH' or object_filter not in ob.name:
                continue
            ev = ob.evaluated_get(dg)
            me = ev.to_mesh()
            m = inst.matrix_world @ ob.matrix_world
            pts += [m @ v.co for v in me.vertices]
            ev.to_mesh_clear()
    return pts


# ------------------------------------------------------------------ scene

def setup_gpu():
    prefs = bpy.context.preferences.addons['cycles'].preferences
    for kind in ('OPTIX', 'CUDA'):
        try:
            prefs.compute_device_type = kind
            prefs.refresh_devices()
        except TypeError:
            continue
        if any(d.type == kind for d in prefs.devices):
            for d in prefs.devices:
                d.use = d.type == kind
            return kind
    return 'CPU'


def new_scene(name, size, samples=128, world=(0, 0, 0), world_strength=0.0, look='AgX - Medium High Contrast', exposure=0.0):
    old = bpy.data.scenes.get(name)
    if old:
        bpy.data.scenes.remove(old)
    sc = bpy.data.scenes.new(name)
    bpy.context.window.scene = sc
    r = sc.render
    r.engine = 'CYCLES'
    r.resolution_x, r.resolution_y = size
    r.resolution_percentage = 100
    r.film_transparent = False
    r.image_settings.file_format = 'PNG'
    r.image_settings.color_mode = 'RGB'
    r.image_settings.color_depth = '16'
    c = sc.cycles
    c.device = 'GPU' if setup_gpu() != 'CPU' else 'CPU'
    c.samples = samples
    c.use_adaptive_sampling = True
    c.adaptive_threshold = 0.02
    c.use_denoising = True
    c.denoiser = 'OPENIMAGEDENOISE'
    c.max_bounces = 8
    c.glossy_bounces = 4
    c.transmission_bounces = 8
    c.volume_bounces = 1
    c.caustics_reflective = False
    c.caustics_refractive = False
    c.sample_clamp_indirect = 6
    sc.view_settings.view_transform = 'AgX'
    try:
        sc.view_settings.look = look
    except TypeError:
        pass
    sc.view_settings.exposure = exposure
    w = bpy.data.worlds.new(name)
    w.use_nodes = True
    bg = next(n for n in w.node_tree.nodes if n.type == 'BACKGROUND')
    bg.inputs[0].default_value = (*world, 1)
    bg.inputs[1].default_value = world_strength
    sc.world = w
    return sc


def look_at(ob, target):
    d = Vector(target) - ob.location
    ob.rotation_euler = d.to_track_quat('-Z', 'Y').to_euler()


def camera(sc, loc, target, lens=50, shift=(0, 0), focus=None, fstop=None, name='CAM'):
    cd = bpy.data.cameras.new(name)
    cd.lens = lens
    cd.sensor_width = 36
    cd.sensor_fit = 'HORIZONTAL'
    cd.shift_x, cd.shift_y = shift
    cd.clip_start = 0.005
    cd.clip_end = 200
    if fstop:
        cd.dof.use_dof = True
        cd.dof.aperture_fstop = fstop
        cd.dof.focus_distance = (Vector(focus or target) - Vector(loc)).length
    cam = bpy.data.objects.new(name, cd)
    cam.location = loc
    look_at(cam, target)
    sc.collection.objects.link(cam)
    sc.camera = cam
    return cam


def area(sc, name, loc, target, size=(0.5, 0.5), energy=10.0, color=(1, 1, 1), shape='RECTANGLE', spread=180, visible=False):
    ld = bpy.data.lights.new(name, 'AREA')
    ld.shape = shape
    ld.size, ld.size_y = size
    ld.energy = energy
    ld.color = color
    ld.spread = math.radians(spread)
    ob = bpy.data.objects.new(name, ld)
    ob.location = loc
    look_at(ob, target)
    ob.visible_camera = visible
    sc.collection.objects.link(ob)
    return ob


def spot(sc, name, loc, target, energy=100.0, angle=30, blend=0.15, radius=0.02, color=(1, 1, 1)):
    ld = bpy.data.lights.new(name, 'SPOT')
    ld.energy = energy
    ld.spot_size = math.radians(angle)
    ld.spot_blend = blend
    ld.shadow_soft_size = radius
    ld.color = color
    ob = bpy.data.objects.new(name, ld)
    ob.location = loc
    look_at(ob, target)
    sc.collection.objects.link(ob)
    return ob


def sun(sc, name, direction_target, strength=3.0, angle=0.5, color=(1, 1, 1)):
    ld = bpy.data.lights.new(name, 'SUN')
    ld.energy = strength
    ld.angle = math.radians(angle)
    ld.color = color
    ob = bpy.data.objects.new(name, ld)
    ob.location = (0, 0, 0)
    look_at(ob, direction_target)
    sc.collection.objects.link(ob)
    return ob


# ------------------------------------------------------------------ materials

def material(name, base, rough=0.5, metal=0.0, spec=0.5, sheen=0.0, sheen_rough=0.5, coat=0.0,
             transmission=0.0, ior=1.45, emission=None, bump=None, alpha=1.0):
    """A Principled material; bump = (scale, strength[, detail]) adds a noise-driven surface."""
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    b = next(n for n in nt.nodes if n.type == 'BSDF_PRINCIPLED')
    b.inputs['Base Color'].default_value = (*base, 1)
    b.inputs['Roughness'].default_value = rough
    b.inputs['Metallic'].default_value = metal
    b.inputs['Specular IOR Level'].default_value = spec
    b.inputs['Sheen Weight'].default_value = sheen
    b.inputs['Sheen Roughness'].default_value = sheen_rough
    b.inputs['Coat Weight'].default_value = coat
    b.inputs['Transmission Weight'].default_value = transmission
    b.inputs['IOR'].default_value = ior
    b.inputs['Alpha'].default_value = alpha
    if emission:
        b.inputs['Emission Color'].default_value = (*emission[0], 1)
        b.inputs['Emission Strength'].default_value = emission[1]
    if bump:
        scale, strength = bump[0], bump[1]
        detail = bump[2] if len(bump) > 2 else 8.0
        tc = nt.nodes.new('ShaderNodeTexCoord')
        nz = nt.nodes.new('ShaderNodeTexNoise')
        nz.inputs['Scale'].default_value = scale
        nz.inputs['Detail'].default_value = detail
        nz.inputs['Roughness'].default_value = 0.6
        bp = nt.nodes.new('ShaderNodeBump')
        bp.inputs['Strength'].default_value = strength
        bp.inputs['Distance'].default_value = 0.002
        nt.links.new(tc.outputs['Object'], nz.inputs['Vector'])
        nt.links.new(nz.outputs['Fac'], bp.inputs['Height'])
        nt.links.new(bp.outputs['Normal'], b.inputs['Normal'])
        # a little roughness variation from the same field, so surfaces aren't uniformly flat
        mr = nt.nodes.new('ShaderNodeMapRange')
        mr.inputs['To Min'].default_value = rough * 0.85
        mr.inputs['To Max'].default_value = min(1.0, rough * 1.15)
        nt.links.new(nz.outputs['Fac'], mr.inputs['Value'])
        nt.links.new(mr.outputs['Result'], b.inputs['Roughness'])
    return m


def volume_material(name, density=0.02, color=(1, 1, 1), anisotropy=0.3):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    for n in list(nt.nodes):
        if n.type == 'BSDF_PRINCIPLED':
            nt.nodes.remove(n)
    out = next(n for n in nt.nodes if n.type == 'OUTPUT_MATERIAL')
    vs = nt.nodes.new('ShaderNodeVolumeScatter')
    vs.inputs['Density'].default_value = density
    vs.inputs['Color'].default_value = (*color, 1)
    vs.inputs['Anisotropy'].default_value = anisotropy
    nt.links.new(vs.outputs[0], out.inputs['Volume'])
    return m


# ------------------------------------------------------------------ geometry

def link(sc, ob):
    sc.collection.objects.link(ob)
    return ob


def box(sc, name, size, loc, mat=None, bevel=0.0):
    me = bpy.data.meshes.new(name)
    sx, sy, sz = (s / 2 for s in size)
    v = [(-sx, -sy, -sz), (sx, -sy, -sz), (sx, sy, -sz), (-sx, sy, -sz), (-sx, -sy, sz), (sx, -sy, sz), (sx, sy, sz), (-sx, sy, sz)]
    f = [(0, 3, 2, 1), (4, 5, 6, 7), (0, 1, 5, 4), (1, 2, 6, 5), (2, 3, 7, 6), (3, 0, 4, 7)]
    me.from_pydata(v, [], f)
    ob = bpy.data.objects.new(name, me)
    ob.location = loc
    if mat:
        me.materials.append(mat)
    if bevel:
        bv = ob.modifiers.new('bevel', 'BEVEL')
        bv.width = bevel
        bv.segments = 4
        bv.limit_method = 'NONE'
        me.shade_smooth()
        ob.modifiers.new('wn', 'WEIGHTED_NORMAL')
    return link(sc, ob)


def plane(sc, name, size, loc, rot=(0, 0, 0), mat=None):
    me = bpy.data.meshes.new(name)
    sx, sy = size[0] / 2, size[1] / 2
    me.from_pydata([(-sx, -sy, 0), (sx, -sy, 0), (sx, sy, 0), (-sx, sy, 0)], [], [(0, 1, 2, 3)])
    ob = bpy.data.objects.new(name, me)
    ob.location = loc
    ob.rotation_euler = [math.radians(a) for a in rot]
    if mat:
        me.materials.append(mat)
    return link(sc, ob)


def grid_mesh(sc, name, P, mat=None, smooth=True):
    """A quad grid from P, an (rows, cols, 3) array of vertex positions."""
    rows, cols, _ = P.shape
    me = bpy.data.meshes.new(name)
    idx = np.arange(rows * cols).reshape(rows, cols)
    a, b, c, d = idx[:-1, :-1].ravel(), idx[:-1, 1:].ravel(), idx[1:, 1:].ravel(), idx[1:, :-1].ravel()
    me.vertices.add(rows * cols)
    me.vertices.foreach_set('co', P.reshape(-1).astype(np.float32))
    n = len(a)
    me.loops.add(n * 4)
    me.loops.foreach_set('vertex_index', np.stack([a, b, c, d], 1).reshape(-1).astype(np.int32))
    me.polygons.add(n)
    me.polygons.foreach_set('loop_start', (np.arange(n) * 4).astype(np.int32))
    me.update(calc_edges=True)
    me.validate()
    if smooth:
        me.shade_smooth()
    ob = bpy.data.objects.new(name, me)
    if mat:
        me.materials.append(mat)
    return link(sc, ob)


def set_grid(ob, P):
    ob.data.vertices.foreach_set('co', P.reshape(-1).astype(np.float32))
    ob.data.update()


def points(sc, name, xyz, radius, mat):
    """A cloud of small spheres: vertices turned into points by a geometry-nodes modifier
    (rendered natively as spheres by Cycles)."""
    me = bpy.data.meshes.new(name)
    me.vertices.add(len(xyz))
    me.vertices.foreach_set('co', np.asarray(xyz, dtype=np.float32).reshape(-1))
    me.update()
    ob = bpy.data.objects.new(name, me)
    ng = bpy.data.node_groups.new(name + ' points', 'GeometryNodeTree')
    ng.interface.new_socket('Geometry', in_out='INPUT', socket_type='NodeSocketGeometry')
    ng.interface.new_socket('Geometry', in_out='OUTPUT', socket_type='NodeSocketGeometry')
    gi = ng.nodes.new('NodeGroupInput')
    go = ng.nodes.new('NodeGroupOutput')
    m2p = ng.nodes.new('GeometryNodeMeshToPoints')
    m2p.inputs['Radius'].default_value = radius
    # per-point size variation
    rnd = ng.nodes.new('FunctionNodeRandomValue')
    rnd.data_type = 'FLOAT'
    rnd.inputs['Min'].default_value = radius * 0.35
    rnd.inputs['Max'].default_value = radius * 1.4
    sm = ng.nodes.new('GeometryNodeSetMaterial')
    sm.inputs['Material'].default_value = mat
    ng.links.new(gi.outputs[0], m2p.inputs['Mesh'])
    ng.links.new(rnd.outputs['Value'], m2p.inputs['Radius'])
    ng.links.new(m2p.outputs[0], sm.inputs['Geometry'])
    ng.links.new(sm.outputs[0], go.inputs[0])
    mod = ob.modifiers.new('points', 'NODES')
    mod.node_group = ng
    return link(sc, ob)


def squircle_r(dx, dy, a, b, n=4.0):
    """Superellipse 'radius' of an offset: 1 on the Ring's outline scaled to (a, b)."""
    return (np.abs(dx / a) ** n + np.abs(dy / b) ** n) ** (1.0 / n)


def squircle_xy(a, b, steps=192, n=4.0):
    t = np.linspace(0, 2 * np.pi, steps, endpoint=False)
    c, s = np.cos(t), np.sin(t)
    return a * np.sign(c) * np.abs(c) ** (2 / n), b * np.sign(s) * np.abs(s) ** (2 / n)


def squircle_hole_slab(sc, name, outer, hole, thickness, loc, mat, steps=192):
    """A rectangular slab with a squircle opening — the Ring as architecture."""
    ox, oy = outer[0] / 2, outer[1] / 2
    ix, iy = squircle_xy(hole[0] / 2, hole[1] / 2, steps)
    t = np.linspace(0, 2 * np.pi, steps, endpoint=False)
    # the outer rectangle sampled along the same rays
    k = np.minimum(ox / np.maximum(np.abs(np.cos(t)), 1e-6), oy / np.maximum(np.abs(np.sin(t)), 1e-6))
    rx, ry = np.cos(t) * k, np.sin(t) * k
    verts = [(x, y, 0) for x, y in zip(ix, iy)] + [(x, y, 0) for x, y in zip(rx, ry)]
    faces = [(i, (i + 1) % steps, steps + (i + 1) % steps, steps + i) for i in range(steps)]
    me = bpy.data.meshes.new(name)
    me.from_pydata(verts, [], faces)
    me.materials.append(mat)
    ob = bpy.data.objects.new(name, me)
    ob.location = loc
    so = ob.modifiers.new('solid', 'SOLIDIFY')
    so.thickness = thickness
    return link(sc, ob)


# ------------------------------------------------------------------ render

def render(sc, path, samples=None, preview=False):
    if samples:
        sc.cycles.samples = samples
    if preview:
        sc.render.resolution_percentage = 30
        sc.cycles.samples = min(sc.cycles.samples, 32)
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    sc.render.filepath = str(path)
    bpy.context.window.scene = sc
    bpy.ops.render.render(write_still=True, scene=sc.name)
    return path


def project(sc, cam, pts):
    """World points → pixel coordinates in the rendered frame (top-left origin), with depth."""
    from bpy_extras.object_utils import world_to_camera_view
    W = sc.render.resolution_x
    H = sc.render.resolution_y
    out = []
    for p in pts:
        v = world_to_camera_view(sc, cam, p)
        out.append((v.x * W, (1 - v.y) * H, v.z))
    return out
