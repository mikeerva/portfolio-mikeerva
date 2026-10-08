# Read-only report of the approved master: scenes, objects, materials, bounds. Never saves.
import bpy, mathutils
print("=== FILE", bpy.data.filepath)
for sc in bpy.data.scenes:
    print("SCENE", sc.name, "engine", sc.render.engine, "res", sc.render.resolution_x, sc.render.resolution_y, "camera", sc.camera.name if sc.camera else None, "unit scale", sc.unit_settings.scale_length)
for col in bpy.data.collections:
    print("COLLECTION", col.name, [o.name for o in col.objects])
for o in bpy.data.objects:
    bb = [o.matrix_world @ mathutils.Vector(c) for c in o.bound_box]
    mn = [min(v[i] for v in bb) for i in range(3)]; mx = [max(v[i] for v in bb) for i in range(3)]
    mats = [s.material.name if s.material else None for s in o.material_slots]
    mods = [m.type for m in o.modifiers]
    extra = ''
    if o.type == 'MESH': extra = f"verts {len(o.data.vertices)} faces {len(o.data.polygons)}"
    if o.type == 'FONT': extra = f"text {o.data.body!r}"
    print(f"OBJ {o.name!r} {o.type} parent={o.parent.name if o.parent else None} loc={tuple(round(x,4) for x in o.location)} rot={tuple(round(x,3) for x in o.rotation_euler)} scale={tuple(round(x,3) for x in o.scale)} min={[round(x,4) for x in mn]} max={[round(x,4) for x in mx]} mats={mats} mods={mods} hide_render={o.hide_render} {extra}")
for m in bpy.data.materials:
    info = ''
    if m.use_nodes:
        b = next((n for n in m.node_tree.nodes if n.type == 'BSDF_PRINCIPLED'), None)
        if b:
            g = lambda k: b.inputs[k].default_value
            c = g('Base Color'); info = f"base=({c[0]:.3f},{c[1]:.3f},{c[2]:.3f}) metal={g('Metallic'):.2f} rough={g('Roughness'):.2f}"
        info += ' nodes=' + ','.join(sorted({n.type for n in m.node_tree.nodes}))
    print("MAT", m.name, "users", m.users, info)
for w in bpy.data.worlds: print("WORLD", w.name)
for i in bpy.data.images: print("IMAGE", i.name, i.filepath, i.size[:])
for t in bpy.data.texts: print("TEXT", t.name)
