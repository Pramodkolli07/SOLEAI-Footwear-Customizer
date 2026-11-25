const state = {
    chapter: 0,
    footwear: "Sneakers",
    material: "Leather",
    grip: "Standard grip",
    laces: "Flat laces",
    laceColor: "#222222",
    colorMode: "individual",
    colors: {
        upper: "#eeeeee",
        side: "#aaaaaa",
        toe: "#eeeeee",
        heel: "#dc263e"
    }
};


let current3DModel = null;

window.addEventListener("soleai-viewer-ready", event => {
    window.soleaiViewer = event.detail.viewer;
    console.log("SOLEAI 3D viewer connected.");
    updatePreview();
});
const chapters = [...document.querySelectorAll(".chapter")];
const dots = [...document.querySelectorAll(".chapter-dot")];

const parts = {
    upper: document.getElementById("shoeUpper"),
    side: document.getElementById("shoeSidePanel"),
    toe: document.getElementById("shoeToe"),
    heel: document.getElementById("shoeHeel")
};

const laceGroup = document.getElementById("shoeLaces");
const shoeArtwork = document.getElementById("shoeArtwork");

const footwearProfiles = {
    "Sneakers": "Sneaker profile",
    "Boots": "Boot sole profile",
    "Sandals": "Sandal sole profile",
    "Flip-flops": "Flip-flop sole profile",
    "Formal shoes": "Formal shoe profile",
    "Sports shoes": "Sports performance profile",
    "Casual shoes": "Casual shoe profile",
    "Loafers": "Loafer sole profile"
};

function selectCard(attribute, value) {
    document.querySelectorAll(`[data-${attribute}]`).forEach(button => {
        button.classList.toggle(
            "selected",
            button.dataset[attribute] === value
        );
    });
}

function updatePreview() {
    Object.keys(parts).forEach(part => {
        parts[part].setAttribute("fill", state.colors[part]);
    });

    laceGroup.setAttribute("stroke", state.laceColor);

    const noLaces = state.laces === "No laces" ||
        state.footwear === "Sandals" ||
        state.footwear === "Flip-flops";

    laceGroup.style.display = noLaces ? "none" : "block";

    document.getElementById("previewLabel").textContent =
        state.footwear.toUpperCase() + " / CUSTOM DESIGN";

    document.getElementById("soleProfile").textContent =
        footwearProfiles[state.footwear];

    updateLaceNote();
}

function updateLaceNote() {
    const note = document.getElementById("laceNote");

    if (state.footwear === "Sandals" ||
        state.footwear === "Flip-flops") {
        note.textContent =
            "Laces are automatically disabled for this footwear type.";
    } else {
        note.textContent = "";
    }
}

function showChapter(index) {
    if (index < 0 || index >= chapters.length) return;

    state.chapter = index;

    chapters.forEach((chapter, i) => {
        chapter.classList.toggle("active", i === index);
        chapter.classList.remove("leaving");
    });

    dots.forEach((dot, i) => {
        dot.classList.toggle("active", i === index);
        dot.classList.toggle("completed", i < index);
    });

    document.getElementById("progressFill").style.width =
        (index / (chapters.length - 1) * 100) + "%";

    document.getElementById("backChapter").disabled = index === 0;

    document.getElementById("nextChapter").style.display =
        index === 6 ? "none" : "inline-block";

    document.getElementById("wizardActions").style.display =
        index === 6 ? "none" : "flex";

    if (index === 5) updateSummary();

    if (index === 6) {
        createFinalReveal();
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
}

function moveChapter(direction) {
    const current = chapters[state.chapter];

    current.classList.add("leaving");

    setTimeout(() => {
        showChapter(state.chapter + direction);
    }, 250);
}

document.querySelectorAll("[data-footwear]").forEach(button => {
    button.addEventListener("click", () => {
        state.footwear = button.dataset.footwear;

        selectCard("footwear", state.footwear);

        if (["Sandals", "Flip-flops"].includes(state.footwear)) {
            state.laces = "No laces";
            selectCard("laces", state.laces);
        }

        updatePreview();
    });
});

document.querySelectorAll("[data-material]").forEach(button => {
    button.addEventListener("click", () => {
        state.material = button.dataset.material;
        selectCard("material", state.material);
    });
});

document.getElementById("skipMaterial").addEventListener("click", () => {
    state.material = "Not specified";
    moveChapter(1);
});

document.querySelectorAll("[data-mode]").forEach(button => {
    button.addEventListener("click", () => {
        state.colorMode = button.dataset.mode;

        document.querySelectorAll("[data-mode]").forEach(item => {
            item.classList.toggle("active", item === button);
        });

        document.getElementById("individualColors").hidden =
            state.colorMode !== "individual";

        document.getElementById("monochromeColors").hidden =
            state.colorMode !== "mono";
    });
});

document.querySelectorAll("[data-part]").forEach(button => {
    button.addEventListener("click", () => {
        document.querySelectorAll("[data-part]").forEach(item => {
            item.classList.remove("active");
        });

        button.classList.add("active");
        state.selectedPart = button.dataset.part;
    });
});

state.selectedPart = "upper";

document.querySelectorAll("#individualColors .color").forEach(button => {
    button.addEventListener("click", () => {
        const color = button.dataset.color;
        const part = state.selectedPart;

        state.colors[part] = color;

        if (window.soleaiViewer && (part === "upper" || part === "side")) {
            window.soleaiViewer.setColor(part, color);
        }

        document.querySelectorAll("#individualColors .color").forEach(item => {
            item.classList.toggle("selected", item === button);
        });
    });
});

document.querySelectorAll(".mono-color").forEach(button => {
    button.addEventListener("click", () => {
        const color = button.dataset.color;

        Object.keys(state.colors).forEach(part => {
            state.colors[part] = color;
        });

        updatePreview();

        document.querySelectorAll(".mono-color").forEach(item => {
            item.classList.toggle("selected", item === button);
        });
    });
});

document.querySelectorAll("[data-grip]").forEach(button => {
    button.addEventListener("click", () => {
        state.grip = button.dataset.grip;
        selectCard("grip", state.grip);
    });
});

document.querySelectorAll("[data-laces]").forEach(button => {
    button.addEventListener("click", () => {
        if (["Sandals", "Flip-flops"].includes(state.footwear)) return;

        state.laces = button.dataset.laces;
        selectCard("laces", state.laces);
        updatePreview();
    });
});

document.querySelectorAll(".lace-color").forEach(button => {
    button.addEventListener("click", () => {
        state.laceColor = button.dataset.color;
        if (window.soleaiViewer) window.soleaiViewer.setLaceColor(state.laceColor);

        document.querySelectorAll(".lace-color").forEach(item => {
            item.classList.toggle("selected", item === button);
        });
    });
});

function updateSummary() {
    const name = document.getElementById("designName").value.trim()
        || "My SOLEAI Masterpiece";

    document.getElementById("designSummary").innerHTML = `
        <p><strong>Design:</strong> ${escapeHTML(name)}</p>
        <p><strong>Footwear:</strong> ${escapeHTML(state.footwear)}</p>
        <p><strong>Material:</strong> ${escapeHTML(state.material)}</p>
        <p><strong>Colour mode:</strong> ${escapeHTML(state.colorMode)}</p>
        <p><strong>Upper:</strong> ${state.colors.upper}</p>
        <p><strong>Side panel:</strong> ${state.colors.side}</p>
        <p><strong>Toe:</strong> ${state.colors.toe}</p>
        <p><strong>Heel:</strong> ${state.colors.heel}</p>
        <p><strong>Sole profile:</strong> ${escapeHTML(footwearProfiles[state.footwear])}</p>
        <p><strong>Grip:</strong> ${escapeHTML(state.grip)}</p>
        <p><strong>Laces:</strong> ${escapeHTML(state.laces)}</p>
        <p><strong>Lace colour:</strong> ${state.laceColor}</p>
    `;
}

function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    })[character]);
}

function createFinalReveal() {
    updateSummary();

    const reveal = document.getElementById("revealShoe");

    if (!reveal) return;

    reveal.innerHTML = `
        <div id="soleaiReveal3D" class="soleai-reveal-3d"></div>
        <div id="soleaiRevealStatus" class="soleai-reveal-status">
            PREPARING YOUR MASTERPIECE...
        </div>
    `;

    reveal.classList.remove("animate");
    void reveal.offsetWidth;
    reveal.classList.add("animate");

    const revealContent = reveal.closest(".reveal-content");

    if (revealContent) {
        revealContent.classList.remove("reveal-text-animate");
        void revealContent.offsetWidth;
        revealContent.classList.add("reveal-text-animate");
    }

    window.dispatchEvent(
        new CustomEvent("soleai-show-reveal", {
            detail: {
                footwear: state.footwear,
                colors: {
                    upper: state.colors.upper,
                    side: state.colors.side
                },
                laceColor: state.laceColor
            }
        })
    );
}

document.getElementById("backChapter").addEventListener("click", () => {
    moveChapter(-1);
});

document.getElementById("nextChapter").addEventListener("click", () => {
    moveChapter(1);
});

dots.forEach(dot => {
    dot.addEventListener("click", () => {
        const target = Number(dot.dataset.go);

        if (target <= state.chapter) {
            showChapter(target);
        }
    });
});

document.getElementById("placeOrder").addEventListener("click", () => {
    updateSummary();

    const design = {
        ...state,
        name: document.getElementById("designName").value.trim()
            || "My SOLEAI Masterpiece"
    };

    localStorage.setItem("soleAI_design", JSON.stringify(design));

    alert("Your masterpiece is ready! Order placement will be connected in the next development stage.");
});

updatePreview();
showChapter(0);

/* ==========================================
   SOLEAI REAL-TIME 3D FOOTWEAR ENGINE
========================================== */

function updatePreview() {
    const viewer = window.soleaiViewer;

    const modelMap = {
        "Sneakers": "court-sneaker",
        "Boots": "trail-shoe",
        "Sandals": "leather-sandal",
        "Flip-flops": "flip-flops",
        "Formal shoes": "oxford-shoe",
        "Sports shoes": "running-shoe",
        "Casual shoes": "slip-on-shoe",
        "Loafers": "penny-loafer"
    };

    const modelName = modelMap[state.footwear] || "court-sneaker";

    document.getElementById("previewLabel").textContent =
        state.footwear.toUpperCase() + " / CUSTOM DESIGN";

    document.getElementById("soleProfile").textContent =
        footwearProfiles[state.footwear];

    updateLaceNote();

    if (!viewer) return;

    if (current3DModel !== modelName) {
        current3DModel = modelName;

        viewer.loadFootwear(modelName)
            .then(loaded => {
                if (loaded && window.soleaiViewer === viewer) {
                    apply3DColors(viewer);
                }
            })
            .catch(error => {
                console.error("SOLEAI model loading error:", error);
                current3DModel = null;
            });

        return;
    }

    apply3DColors(viewer);
}

function apply3DColors(viewer) {
    if (!viewer) return;

    viewer.setColor("upper", state.colors.upper);
    viewer.setColor("side", state.colors.side);
    viewer.setLaceColor(state.laceColor);
}
/* ==========================================
   CINEMATIC CHAPTER TRANSITION
========================================== */

const chapterTitles = [
    ["THE CREATION", "CHOOSE THE FOUNDATION OF YOUR DESIGN"],
    ["THE MATERIAL", "EVERY MASTERPIECE HAS A TEXTURE"],
    ["THE COLOUR STUDIO", "MAKE YOUR PERSONALITY VISIBLE"],
    ["THE GRIP", "DESIGNED FOR EVERY STEP"],
    ["THE DETAILS", "THE LITTLE THINGS DEFINE GREATNESS"],
    ["THE MASTERPIECE", "YOUR VISION IS TAKING SHAPE"],
    ["THE GRAND REVEAL", "THIS IS YOUR CREATION"]
];

function showCinematicTransition(target, callback) {
    const overlay = document.getElementById("chapterTransition");
    const title = chapterTitles[target];

    document.getElementById("transitionNumber").textContent =
        String(target + 1).padStart(2, "0");

    document.getElementById("transitionLabel").textContent =
        "CHAPTER " + String(target + 1).padStart(2, "0") + " / 07";

    document.getElementById("transitionTitle").textContent = title[0];

    document.getElementById("transitionSubtitle").textContent = title[1];

    overlay.classList.remove("show", "flash");
    void overlay.offsetWidth;

    overlay.classList.add("show", "flash");

    setTimeout(() => {
        callback();
    }, 1150);

    setTimeout(() => {
        overlay.classList.remove("show", "flash");
    }, 1800);
}

function moveChapter(direction) {
    const target = state.chapter + direction;

    if (target < 0 || target >= chapters.length) return;

    showCinematicTransition(target, () => {
        showChapter(target);
    });
}



