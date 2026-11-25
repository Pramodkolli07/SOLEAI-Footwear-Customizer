import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

const container = document.getElementById("threePreview");
const status = document.getElementById("modelStatus");
const selector = document.getElementById("footwearSelector");

const scene = new THREE.Scene();
scene.background = new THREE.Color("#151515");

const camera = new THREE.PerspectiveCamera(
    35,
    container.clientWidth / container.clientHeight,
    0.01,
    100
);

camera.position.set(0, 0.65, 3.5);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(container.clientWidth, container.clientHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;

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

const loader = new GLTFLoader();

let currentShoe = null;
let foundMaterials = {};
let originalColors = {};
let materialGroups = {
    upper: [],
    side: [],
    sole: [],
    grip: [],
    laces: []
};

let loadingNumber = 0;

const selectedColors = {
    upper: "#eeeeee",
    side: "#eeeeee",
    sole: "#eeeeee",
    grip: "#222222",
    laces: "#eeeeee"
};

function classifyMaterials(modelName) {
    const names = Object.keys(foundMaterials);

    materialGroups = {
        upper: [],
        side: [],
        sole: [],
        grip: [],
        laces: []
    };

    // Verified material mapping for the Court Sneaker.
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

    if (explicitMaps[modelName]) {
        Object.entries(explicitMaps[modelName]).forEach(([part, materials]) => {
            materialGroups[part] = materials.filter(name =>
                names.includes(name)
            );
        });

        console.log("Verified material groups:", materialGroups);
        return;
    }

    // Existing automatic detection for other footwear models.
    names.forEach((name) => {
        const n = name.toLowerCase();

        if (/lining|insole|aglet|thread|brass|dark$/.test(n)) {
            return;
        }

        if (/tread|grip/.test(n)) {
            materialGroups.grip.push(name);
            return;
        }

        if (/lace|ribbon/.test(n)) {
            materialGroups.laces.push(name);
            return;
        }

        if (/sole|cupsole|rubber|heel|welt|foam|footbed|cork/.test(n)) {
            materialGroups.sole.push(name);
            return;
        }

        if (/stripe|binding|accent|film|shell|elastic/.test(n)) {
            materialGroups.side.push(name);
            return;
        }

        if (/leather|canvas|knit|mesh|calf|suede|patent|strap|flip_/.test(n)) {
            materialGroups.upper.push(name);
        }
    });

    if (materialGroups.upper.length === 0) {
        materialGroups.upper = names.filter(name =>
            !Object.values(materialGroups).some(group => group.includes(name))
        );
    }

    if (materialGroups.side.length === 0) {
        materialGroups.side = [...materialGroups.upper];
    }

    console.log("Detected material groups:", materialGroups);
}

function applySelectedColors() {
    Object.entries(materialGroups).forEach(([part, names]) => {
        names.forEach((name) => {
            (foundMaterials[name] || []).forEach((material) => {
                if (material.color) {
                    material.color.set(selectedColors[part]);
                }
            });
        });
    });
}

function loadFootwear(modelName) {
    const requestNumber = ++loadingNumber;

    status.textContent = "LOADING " + modelName.toUpperCase() + "...";
    status.style.color = "#e5b94b";

    loader.load(
        `/static/models/shoes/${modelName}.glb`,

        (gltf) => {
            if (requestNumber !== loadingNumber) return;

            if (currentShoe) {
                scene.remove(currentShoe);

                currentShoe.traverse((object) => {
                    if (!object.isMesh) return;

                    object.geometry.dispose();

                    const materials = Array.isArray(object.material)
                        ? object.material
                        : [object.material];

                    materials.forEach(material => material.dispose());
                });
            }

            const shoe = gltf.scene;

            foundMaterials = {};
            originalColors = {};

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

                    if (material.color && originalColors[name] === undefined) {
                        originalColors[name] = material.color.getHex();
                    }
                });
            });

            classifyMaterials(modelName);

            const box = new THREE.Box3().setFromObject(shoe);
            const center = box.getCenter(new THREE.Vector3());
            const size = box.getSize(new THREE.Vector3());

            shoe.position.sub(center);

            const maxDimension = Math.max(size.x, size.y, size.z);

            if (maxDimension > 0) {
                shoe.scale.setScalar(2 / maxDimension);
            }

            currentShoe = shoe;
            scene.add(currentShoe);

            applySelectedColors();

            controls.target.set(0, 0, 0);
            controls.update();

            status.textContent =
                modelName.replaceAll("-", " ").toUpperCase() +
                " READY FOR CUSTOMIZATION";

            status.style.color = "#42e88b";

            console.log("Loaded footwear:", modelName);
            console.log("Materials:", Object.keys(foundMaterials));
        },

        undefined,

        (error) => {
            if (requestNumber !== loadingNumber) return;

            console.error("Model loading error:", error);

            status.textContent = "MODEL LOADING FAILED";
            status.style.color = "#ff5555";
        }
    );
}

window.changeShoeColor = function(part, color) {
    selectedColors[part] = color;

    const names = materialGroups[part] || [];

    names.forEach((name) => {
        (foundMaterials[name] || []).forEach((material) => {
            if (material.color) {
                material.color.set(color);
            }
        });
    });
};

window.resetShoeColors = function() {
    Object.keys(selectedColors).forEach((part) => {
        const input = document.querySelector(
            `[oninput*="changeShoeColor('${part}'"]`
        );

        if (input) {
            selectedColors[part] = input.value;
        }
    });

    Object.entries(originalColors).forEach(([name, color]) => {
        (foundMaterials[name] || []).forEach((material) => {
            if (material.color) {
                material.color.setHex(color);
            }
        });
    });

    selectedColors.upper = "#eeeeee";
    selectedColors.side = "#eeeeee";
    selectedColors.sole = "#eeeeee";
    selectedColors.grip = "#222222";
    selectedColors.laces = "#eeeeee";

    Object.entries(selectedColors).forEach(([part, color]) => {
        const input = document.querySelector(
            `[oninput*="changeShoeColor('${part}'"]`
        );

        if (input) input.value = color;
    });

    applySelectedColors();
};

selector.addEventListener("change", () => {
    loadFootwear(selector.value);
});

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

animate();

window.addEventListener("resize", () => {
    const width = container.clientWidth;
    const height = container.clientHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
});

loadFootwear(selector.value);



