import { createSoleaiViewer } from "./soleai-viewer.js";

let revealViewer = null;
let revealModel = null;

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

window.addEventListener("soleai-show-reveal", async event => {
    const design = event.detail;

    const container = document.getElementById("soleaiReveal3D");
    const status = document.getElementById("soleaiRevealStatus");

    if (!container || !design) return;

    if (revealViewer) {
        revealViewer.dispose();
        revealViewer = null;
    }

    container.innerHTML = "";
    container.classList.remove("reveal-entrance");

    revealViewer = createSoleaiViewer(container, status);

    revealModel = modelMap[design.footwear] || "court-sneaker";

    try {
        const loaded = await revealViewer.loadFootwear(revealModel);

        if (!loaded) return;

        revealViewer.setColor("upper", design.colors.upper);
        revealViewer.setColor("side", design.colors.side);
        revealViewer.setLaceColor(design.laceColor);

        requestAnimationFrame(() => {
            container.classList.add("reveal-entrance");
            revealViewer.resize();
        });

        console.log("SOLEAI grand reveal ready:", revealModel);

    } catch (error) {
        console.error("SOLEAI reveal loading failed:", error);
        status.textContent = "YOUR MASTERPIECE IS PREPARING...";
    }
});

window.addEventListener("beforeunload", () => {
    if (revealViewer) revealViewer.dispose();
}, { once: true });
