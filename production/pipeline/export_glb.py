"""Web GLB of the approved product. Evaluated copies (mirror applied, wordmark as mesh) go
into a temporary export collection; the approved objects are never modified, the master never
saved. Mirrored pairs are split into their left and right halves (|L, |R) so the web can move
each cup's parts apart along its own axis for the exploded view — the halves are exactly the
mirrored geometry, nothing is reshaped. Draco-compressed for the web. Usage:
    blender -b MASTER --python production/pipeline/export_glb.py -- <out.glb>
"""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))
import bpy  # noqa: E402
import bmesh  # noqa: E402
import pulse_lib as L  # noqa: E402

out = Path(sys.argv[sys.argv.index('--') + 1])
sc = bpy.data.scenes.new('PULSE EXPORT')
bpy.context.window.scene = sc
src = L.product_source()
sc.collection.children.link(src)
bpy.context.view_layer.update()
dg = bpy.context.evaluated_depsgraph_get()
export = bpy.data.collections.new('PULSE_GLB')
sc.collection.children.link(export)
tris = 0
def half(me, keep_right):
    """A copy of the mesh holding only the faces on one side of X = 0."""
    bm = bmesh.new()
    bm.from_mesh(me)
    gone = [f for f in bm.faces if (f.calc_center_median().x > 0) != keep_right]
    bmesh.ops.delete(bm, geom=gone, context='FACES')
    out = bpy.data.meshes.new(me.name + ('|R' if keep_right else '|L'))
    bm.to_mesh(out)
    bm.free()
    for m in me.materials:
        out.materials.append(m)
    return out


def add(name, me):
    global tris
    copy = bpy.data.objects.new(name, me)
    export.objects.link(copy)
    # the dense surfaces (cushions, headband) halve with no visible loss at web sizes
    dense = len(me.polygons) > 4000
    if dense:
        dec = copy.modifiers.new('web', 'DECIMATE')
        dec.ratio = 0.5
    me.calc_loop_triangles()
    tris += len(me.loop_triangles) * (0.5 if dense else 1)


for ob in src.all_objects:
    if ob.type not in ('MESH', 'FONT', 'CURVE'):
        continue
    me = bpy.data.meshes.new_from_object(ob.evaluated_get(dg), preserve_all_data_layers=False, depsgraph=dg)
    me.transform(ob.matrix_world)
    name = ob.name.replace('PULSE v02 | ', '').replace('PULSE v03 | ', '')
    if any(m.type == 'MIRROR' for m in ob.modifiers):
        add(name + '|R', half(me, True))
        add(name + '|L', half(me, False))
    else:
        add(name, me)
sc.collection.children.unlink(src)
print('PULSE_GLB objects', len(export.objects), 'triangles ~', int(tris))
with bpy.context.temp_override(scene=sc, view_layer=sc.view_layers[0]):
  bpy.ops.export_scene.gltf(
    filepath=str(out), export_format='GLB', use_active_scene=True, export_apply=True,
    export_yup=True, export_texcoords=False, export_normals=True, export_cameras=False, export_lights=False,
    export_draco_mesh_compression_enable=True, export_draco_mesh_compression_level=7,
    export_draco_position_quantization=14, export_draco_normal_quantization=10,
)
print('PULSE_GLB written', out, out.stat().st_size)
