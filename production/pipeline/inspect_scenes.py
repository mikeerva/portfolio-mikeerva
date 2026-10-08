import bpy
print("=== ACTIVE WINDOW SCENE", bpy.context.window.scene.name if bpy.context.window else bpy.context.scene.name)
def walk(c, d=0):
    print("   " * d + "-", c.name, "excl" if False else "", [o.name for o in c.objects][:3], "…" if len(c.objects) > 3 else "")
    for ch in c.children: walk(ch, d + 1)
for sc in bpy.data.scenes:
    print("SCENE", sc.name, "world", sc.world.name if sc.world else None, "view", sc.view_settings.view_transform, sc.view_settings.look, "exposure", sc.view_settings.exposure)
    if sc.render.engine == 'CYCLES': print("   cycles samples", sc.cycles.samples, "device", sc.cycles.device, "denoise", sc.cycles.use_denoising)
    walk(sc.collection)
for t in bpy.data.texts:
    print("##### TEXT", t.name, len(t.lines), "lines")
    print("\n".join(l.body for l in t.lines[:60]))
