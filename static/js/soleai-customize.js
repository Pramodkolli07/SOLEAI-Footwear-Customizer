import { createSoleaiViewer } from "./soleai-viewer.js";

const container = document.getElementById("soleaiPreview3D");
const status = document.getElementById("soleaiModelStatus");

if (container) {
    const viewer = createSoleaiViewer(container, status);

    window.soleaiViewer = viewer;

    window.dispatchEvent(
        new CustomEvent("soleai-viewer-ready", {
            detail: { viewer }
        })
    );


    window.addEventListener("beforeunload", () => {
        viewer.dispose();
    }, { once: true });

    console.log("SOLEAI 3D customization viewer initialized.");
}

