import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

export function createSoleaiViewer(container, statusElement = null) {
    if (!container) {
        throw new Error("SOLEAI 3D preview container was not found.");
    }

    const scene = new THREE.Scene();
    scene.background = null;

    const camera = new THREE.PerspectiveCamera(
        35,
        1,
        0.01,
        100
    );

    camera.position.set(0, 0.65, 3.5);

    const renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true
    });

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;

    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.display = "block";

    container.appendChild(renderer.domElement);

    scene.add(new THREE.HemisphereLight(0xffffff, 0x444444, 2));

    const keyLight = new THREE.DirectionalLight(0xffffff, 3);
    keyLight.position.set(3, 5, 4);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xffffff, 1.5);
    fillLight.position.set(-4, 2, -3);
    scene.add(fillLight);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.autoRotate = false;
    controls.enableZoom = true;
    controls.enableRotate = true;

    const loader = new GLTFLoader();

    let currentShoe = null;
    let currentModelName = null;
    let loadingNumber = 0;
    let animationFrame = null;

    let foundMaterials = {};

    let materialGroups = {
        upper: [],
        side: [],
        sole: [],
        grip: [],
        laces: []
    };

    const selectedColors = {
        upper: "#eeeeee",
        side: "#aaaaaa",
        sole: "#eeeeee",
        grip: "#222222",
        laces: "#222222"
    };

    const explicitMaps = {
        "court-sneaker": {
            upper: ["Leather_White"],
            side: ["Leather_Green", "Leather_Grey"],
            sole: ["Cupsole"],
            grip: ["Gum_Tread"],
            laces: ["Lace_White"]
        },

        "basketball-shoe": {
            upper: ["Leather_Red"],
            side: ["Leather_Black"],
            sole: ["Cupsole"],
            grip: ["Red_Tread"],
            laces: ["Lace_Red"]
        },

        "canvas-high-top": {
            upper: ["Canvas_Navy"],
            side: ["Stripe_Red"],
            sole: ["Rubber_White"],
            grip: ["Gum_Tread"],
            laces: ["Lace_White"]
        },

        "ballet-flat": {
            upper: ["Patent_Red"],
            side: ["Ribbon"],
            sole: ["Sole_Leather"],
            grip: ["Heel_Rubber"],
            laces: []
        },

        "flip-flops": {
            upper: ["Flip_Blue"],
            side: ["Flip_Strap", "Flip_White", "Flip_Navy"],
            sole: [],
            grip: [],
            laces: []
        },

        "leather-sandal": {
            upper: ["Strap_Brown"],
            side: ["Brass"],
            sole: ["Footbed", "EVA", "Cork"],
            grip: ["Gum_Tread"],
            laces: []
        },

        "monk-strap-shoe": {
            upper: ["Calf_Tan"],
            side: ["Brass"],
            sole: ["Sole_Leather"],
            grip: ["Heel_Rubber"],
            laces: []
        },

        "oxford-shoe": {
            upper: ["Calf_Black"],
            side: ["Welt_Black"],
            sole: ["Sole_Leather"],
            grip: ["Heel_Rubber"],
            laces: ["Lace_Black"]
        },

        "penny-loafer": {
            upper: ["Calf_Wine"],
            side: ["Welt_Black"],
            sole: ["Sole_Leather"],
            grip: ["Heel_Rubber"],
            laces: []
        },

        "running-shoe": {
            upper: ["Knit"],
            side: ["Film", "Accent", "Shell", "Knit_Dark"],
            sole: ["Foam"],
            grip: ["Rubber_Tread"],
            laces: ["Lace"]
        },

        "slip-on-shoe": {
            upper: ["Canvas_Mustard", "Suede_Brown"],
            side: ["Binding_Brown", "Elastic"],
            sole: ["Rubber_White"],
            grip: ["Gum_Tread"],
            laces: []
        },

        "trail-shoe": {
            upper: ["Mesh_Olive", "Mesh_Black"],
            side: ["Film_Black", "Accent_Yellow"],
            sole: ["Foam_Dark"],
            grip: ["Rubber_Black"],
            laces: ["Lace_Black"]
        }
    };

    function setStatus(message, color = "#42e88b") {
        if (!statusElement) return;

        statusElement.textContent = message;
        statusElement.style.color = color;
    }

    function disposeModel(model) {
        if (!model) return;

        model.traverse((object) => {
            if (!object.isMesh) return;

            if (object.geometry) {
                object.geometry.dispose();
            }

            const materials = Array.isArray(object.material)
                ? object.material
                : [object.material];

            materials.forEach((material) => {
                if (material) material.dispose();
            });
        });
    }

    function classifyMaterials(modelName) {
        const names = Object.keys(foundMaterials);

        materialGroups = {
            upper: [],
            side: [],
            sole: [],
            grip: [],
            laces: []
        };

        if (explicitMaps[modelName]) {
            Object.entries(explicitMaps[modelName]).forEach(
                ([part, materials]) => {
                    materialGroups[part] = materials.filter(
                        name => names.includes(name)
                    );
                }
            );

            console.log("SOLEAI material groups:", materialGroups);
            return;
        }

        names.forEach((name) => {
            const n = name.toLowerCase();

            if (/lining|insole|aglet|thread|brass|dark$/.test(n)) {
                return;
            }

            if (/tread|grip/.test(n)) {
                materialGroups.grip.push(name);
            } else if (/lace|ribbon/.test(n)) {
                materialGroups.laces.push(name);
            } else if (/sole|cupsole|rubber|heel|welt|foam|footbed|cork/.test(n)) {
                materialGroups.sole.push(name);
            } else if (/stripe|binding|accent|film|shell|elastic/.test(n)) {
                materialGroups.side.push(name);
            } else if (/leather|canvas|knit|mesh|calf|suede|patent|strap|flip_/.test(n)) {
                materialGroups.upper.push(name);
            }
        });

        if (materialGroups.upper.length === 0) {
            materialGroups.upper = names.filter(name =>
                !Object.values(materialGroups).some(
                    group => group.includes(name)
                )
            );
        }

        if (materialGroups.side.length === 0) {
            materialGroups.side = [...materialGroups.upper];
        }
    }

    function applyColorToGroup(part, color) {
        const names = materialGroups[part] || [];

        names.forEach((name) => {
            (foundMaterials[name] || []).forEach((material) => {
                if (material.color) {
                    material.color.set(color);
                    material.needsUpdate = true;
                }
            });
        });
    }

    function applyAllColors() {
        Object.entries(selectedColors).forEach(([part, color]) => {
            applyColorToGroup(part, color);
        });
    }

    function resize() {
        if (!container.isConnected) return;

        const width = container.clientWidth;
        const height = container.clientHeight;

        if (width <= 0 || height <= 0) return;

        camera.aspect = width / height;
        camera.updateProjectionMatrix();

        renderer.setSize(width, height);
    }

    function loadFootwear(modelName) {
        const requestNumber = ++loadingNumber;

        setStatus(
            "LOADING " + modelName.replaceAll("-", " ").toUpperCase() + "...",
            "#e5b94b"
        );

        return new Promise((resolve, reject) => {
            loader.load(
                `/static/models/shoes/${modelName}.glb`,

                (gltf) => {
                    if (requestNumber !== loadingNumber) {
                        disposeModel(gltf.scene);
                        resolve(false);
                        return;
                    }

                    if (currentShoe) {
                        scene.remove(currentShoe);
                        disposeModel(currentShoe);
                    }

                    const shoe = gltf.scene;
                    foundMaterials = {};

                    shoe.traverse((object) => {
                        if (!object.isMesh) return;

                        const materials = Array.isArray(object.material)
                            ? object.material
                            : [object.material];

                        materials.forEach((material) => {
                            const name = material.name || "Unnamed";

                            if (!foundMaterials[name]) {
                                foundMaterials[name] = [];
                            }

                            foundMaterials[name].push(material);
                        });
                    });

                    classifyMaterials(modelName);

                    const box = new THREE.Box3().setFromObject(shoe);
                    const center = box.getCenter(new THREE.Vector3());
                    const size = box.getSize(new THREE.Vector3());

                    shoe.position.sub(center);

                    const maxDimension = Math.max(
                        size.x,
                        size.y,
                        size.z
                    );

                    if (maxDimension > 0) {
                        shoe.scale.setScalar(2 / maxDimension);
                    }

                    currentShoe = shoe;
                    currentModelName = modelName;

                    scene.add(currentShoe);

                    applyAllColors();

                    controls.target.set(0, 0, 0);
                    controls.update();

                    setStatus(
                        modelName.replaceAll("-", " ").toUpperCase() +
                        " READY FOR CUSTOMIZATION"
                    );

                    console.log("SOLEAI loaded:", modelName);
                    console.log("SOLEAI materials:", Object.keys(foundMaterials));

                    resize();
                    resolve(true);
                },

                undefined,

                (error) => {
                    if (requestNumber !== loadingNumber) {
                        resolve(false);
                        return;
                    }

                    console.error("SOLEAI model loading error:", error);

                    setStatus("MODEL LOADING FAILED", "#ff5555");
                    reject(error);
                }
            );
        });
    }

    function setColor(part, color) {
        if (!color) return;

        if (part === "toe" || part === "heel") {
            part = "upper";
        }

        if (part === "all") {
            Object.keys(selectedColors).forEach((key) => {
                selectedColors[key] = color;
            });

            applyAllColors();
            return;
        }

        if (!(part in selectedColors)) return;

        selectedColors[part] = color;
        applyColorToGroup(part, color);
    }

    function setLaceColor(color) {
        setColor("laces", color);
    }

    function setColors(colors = {}) {
        Object.entries(colors).forEach(([part, color]) => {
            setColor(part, color);
        });
    }

    function animate() {
        animationFrame = requestAnimationFrame(animate);

        controls.update();
        renderer.render(scene, camera);
    }

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);

    window.addEventListener("resize", resize);

    animate();
    resize();

    return {
        loadFootwear,
        setColor,
        setColors,
        setLaceColor,
        resize,

        getCurrentModelName() {
            return currentModelName;
        },

        getCurrentModel() {
            return currentShoe;
        },

        dispose() {
            loadingNumber++;

            cancelAnimationFrame(animationFrame);
            resizeObserver.disconnect();
            window.removeEventListener("resize", resize);

            if (currentShoe) {
                scene.remove(currentShoe);
                disposeModel(currentShoe);
                currentShoe = null;
            }

            controls.dispose();
            renderer.dispose();

            if (renderer.domElement.parentElement === container) {
                container.removeChild(renderer.domElement);
            }
        }
    };
}
