import trimesh

model_path = "static/models/shoes/court-sneaker.glb"

scene = trimesh.load(model_path, force="scene")

print("\n========== SOLEAI 3D MODEL INSPECTION ==========")

print("\nTotal geometries:", len(scene.geometry))
print("\nMODEL COMPONENTS:")

for node_name in scene.graph.nodes_geometry:
    transform, geometry_name = scene.graph[node_name]
    geometry = scene.geometry[geometry_name]

    print("\nComponent:", node_name)
    print("Geometry:", geometry_name)
    print("Vertices:", len(geometry.vertices))
    print("Faces:", len(geometry.faces))

    if hasattr(geometry.visual, "material"):
        material = geometry.visual.material
        print("Material:", getattr(material, "name", "Unnamed"))
    else:
        print("Material: Not separately defined")

print("\nModel dimensions:", scene.bounds)
print("\n========== INSPECTION COMPLETE ==========")
