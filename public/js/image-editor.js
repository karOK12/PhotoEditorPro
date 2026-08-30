const selectImageButton = document.getElementById("selectImageButton");
const emptyEditor = document.getElementById("emptyEditor");
const imageWorkspace = document.getElementById("imageWorkspace");
const editorCanvas = document.getElementById("editorCanvas");
const exportButton = document.getElementById("exportButton");

const cropButton = document.getElementById("cropButton");
const rotateButton = document.getElementById("rotateButton");
const brightnessButton = document.getElementById("brightnessButton");
const contrastButton = document.getElementById("contrastButton");
const filterButton = document.getElementById("filterButton");
const addTextButton = document.getElementById("addTextButton");

const undoButton = document.getElementById("undoButton");
const redoButton = document.getElementById("redoButton");

const zoomOutButton = document.getElementById("zoomOutButton");
const zoomInButton = document.getElementById("zoomInButton");
const fitButton = document.getElementById("fitButton");
const zoomValue = document.getElementById("zoomValue");

const timelineTracks = document.getElementById("timelineTracks");
const timelineEmpty = document.getElementById("timelineEmpty");
const timelineDuration = document.getElementById("timelineDuration");

const ctx = editorCanvas.getContext("2d");

let originalImage = null;
let selectedImageUrl = null;

let zoom = 1;
let rotation = 0;

let brightness = 0;
let contrast = 0;

let history = [];
let historyIndex = -1;

let imageLayers = [];
let layerCounter = 0;

let cropMode = false;
let cropRect = null;
let cropDragging = false;
let cropHandle = null;
let cropStartX = 0;
let cropStartY = 0;


/* =========================================================
   Utilities
========================================================= */

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);

    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}


function updateTimelineDuration() {
    if (!timelineDuration) return;

    if (!imageLayers.length) {
        timelineDuration.textContent = "00:00";
        return;
    }

    const duration = Math.max(
        ...imageLayers.map(layer => layer.start + layer.duration)
    );

    timelineDuration.textContent = formatTime(duration);
}


/* =========================================================
   Canvas rendering
========================================================= */

function getImageDimensions() {
    if (!originalImage) {
        return { width: 0, height: 0 };
    }

    const w = originalImage.naturalWidth;
    const h = originalImage.naturalHeight;

    if (rotation % 180 === 0) {
        return { width: w, height: h };
    }

    return { width: h, height: w };
}


function renderCanvas() {
    if (!originalImage) return;

    const maxWidth = 1400;
    const maxHeight = 850;

    const dimensions = getImageDimensions();

    let width = dimensions.width;
    let height = dimensions.height;

    const scale = Math.min(
        maxWidth / width,
        maxHeight / height,
        1
    );

    width = Math.max(1, Math.round(width * scale));
    height = Math.max(1, Math.round(height * scale));

    editorCanvas.width = width;
    editorCanvas.height = height;

    ctx.clearRect(0, 0, width, height);

    ctx.save();

    ctx.translate(width / 2, height / 2);

    const angle = rotation * Math.PI / 180;

    ctx.rotate(angle);

    let drawWidth;
    let drawHeight;

    if (rotation % 180 === 0) {
        drawWidth = width;
        drawHeight = height;
    } else {
        drawWidth = height;
        drawHeight = width;
    }

    ctx.filter = `
        brightness(${100 + brightness}%)
        contrast(${100 + contrast}%)
    `;

    ctx.drawImage(
        originalImage,
        -drawWidth / 2,
        -drawHeight / 2,
        drawWidth,
        drawHeight
    );

    ctx.restore();

    ctx.filter = "none";

    applyZoom();
}


function applyZoom() {
    const container = editorCanvas.parentElement;

    if (!container) return;

    editorCanvas.style.transform = `scale(${zoom})`;
    editorCanvas.style.transformOrigin = "center center";

    if (zoomValue) {
        zoomValue.textContent = `${Math.round(zoom * 100)}%`;
    }
}


function fitCanvas() {
    zoom = 1;
    applyZoom();
}


/* =========================================================
   History
========================================================= */

function createState() {
    return {
        rotation,
        brightness,
        contrast
    };
}


function restoreState(state) {
    rotation = state.rotation;
    brightness = state.brightness;
    contrast = state.contrast;

    renderCanvas();
    updateHistoryButtons();
}


function pushHistory() {
    const state = createState();

    history = history.slice(0, historyIndex + 1);

    history.push(state);

    historyIndex = history.length - 1;

    updateHistoryButtons();
}


function undo() {
    if (historyIndex <= 0) return;

    historyIndex--;

    restoreState(history[historyIndex]);
}


function redo() {
    if (historyIndex >= history.length - 1) return;

    historyIndex++;

    restoreState(history[historyIndex]);
}


function updateHistoryButtons() {
    if (undoButton) {
        undoButton.disabled = historyIndex <= 0;
    }

    if (redoButton) {
        redoButton.disabled =
            historyIndex < 0 ||
            historyIndex >= history.length - 1;
    }
}


/* =========================================================
   Image loading
========================================================= */

function loadImage(file) {
    const imageUrl = URL.createObjectURL(file);

    selectedImageUrl = imageUrl;

    const img = new Image();

    img.onload = () => {
        originalImage = img;

        rotation = 0;
        brightness = 0;
        contrast = 0;
        zoom = 1;

        history = [];
        historyIndex = -1;

        renderCanvas();

        pushHistory();

        emptyEditor.hidden = true;
        imageWorkspace.hidden = false;

        exportButton.disabled = false;

        enableEditorTools();

        createImageLayer(file, imageUrl);
    };

    img.src = imageUrl;
}


/* =========================================================
   Editor tools state
========================================================= */

function enableEditorTools() {
    [
        rotateButton,
        brightnessButton,
        contrastButton,
        filterButton,
        zoomOutButton,
        zoomInButton,
        fitButton
    ].forEach(button => {
        if (button) button.disabled = false;
    });
}


/* =========================================================
   Rotate
========================================================= */

if (rotateButton) {
    rotateButton.addEventListener("click", () => {
        if (!originalImage) return;

        rotation = (rotation + 90) % 360;

        renderCanvas();
        pushHistory();
    });
}


/* =========================================================
   Brightness
========================================================= */

if (brightnessButton) {
    brightnessButton.addEventListener("click", () => {
        if (!originalImage) return;

        brightness += 10;

        if (brightness > 100) {
            brightness = -100;
        }

        renderCanvas();
        pushHistory();
    });
}


/* =========================================================
   Contrast
========================================================= */

if (contrastButton) {
    contrastButton.addEventListener("click", () => {
        if (!originalImage) return;

        contrast += 10;

        if (contrast > 100) {
            contrast = -100;
        }

        renderCanvas();
        pushHistory();
    });
}


/* =========================================================
   Zoom
========================================================= */

if (zoomInButton) {
    zoomInButton.addEventListener("click", () => {
        if (!originalImage) return;

        zoom = Math.min(zoom + 0.1, 3);

        applyZoom();
    });
}


if (zoomOutButton) {
    zoomOutButton.addEventListener("click", () => {
        if (!originalImage) return;

        zoom = Math.max(zoom - 0.1, 0.25);

        applyZoom();
    });
}


if (fitButton) {
    fitButton.addEventListener("click", () => {
        if (!originalImage) return;

        fitCanvas();
    });
}


/* =========================================================
   Undo / Redo
========================================================= */

if (undoButton) {
    undoButton.addEventListener("click", undo);
}

if (redoButton) {
    redoButton.addEventListener("click", redo);
}


/* =========================================================
   Timeline
========================================================= */

function createImageLayer(file, imageUrl) {
    layerCounter++;

    const layer = {
        id: layerCounter,
        type: "image",
        name: `الصورة ${layerCounter}`,
        start: 0,
        duration: 15,
        file,
        url: imageUrl
    };

    imageLayers.push(layer);

    renderTimeline();
    updateTimelineDuration();
}


function renderTimeline() {
    if (!timelineTracks) return;

    const existingTracks =
        timelineTracks.querySelectorAll(".timeline-track");

    existingTracks.forEach(track => track.remove());

    if (!imageLayers.length) {
        if (timelineEmpty) timelineEmpty.hidden = false;
        return;
    }

    if (timelineEmpty) timelineEmpty.hidden = true;

    imageLayers.forEach(layer => {
        const track = document.createElement("div");

        track.className = "timeline-track";
        track.dataset.layerId = layer.id;

        const label = document.createElement("div");

        label.className = "timeline-label";
        label.textContent = layer.name;

        const clip = document.createElement("div");

        clip.className = `timeline-clip ${
            layer.type === "text"
                ? "text-clip"
                : "image-clip"
        }`;

        clip.style.width =
            `${Math.max(layer.duration * 8, 120)}px`;

        clip.textContent =
            layer.type === "text"
                ? `${layer.name}: ${layer.content}`
                : layer.name;

        clip.addEventListener("click", () => {
            document
                .querySelectorAll(".timeline-clip")
                .forEach(item => {
                    item.classList.remove("active");
                });

            clip.classList.add("active");
        });

        track.appendChild(label);
        track.appendChild(clip);

        timelineTracks.appendChild(track);
    });
}


/* =========================================================
   Crop
========================================================= */

function getCanvasPosition(event) {
    const rect = editorCanvas.getBoundingClientRect();

    const scaleX =
        editorCanvas.width / rect.width;

    const scaleY =
        editorCanvas.height / rect.height;

    return {
        x: (event.clientX - rect.left) * scaleX,
        y: (event.clientY - rect.top) * scaleY
    };
}


function enterCropMode() {
    if (!editorCanvas.width || !editorCanvas.height) {
        alert("اختَر صورة أولاً.");
        return;
    }

    cropMode = true;

    cropRect = {
        x: Math.round(editorCanvas.width * 0.1),
        y: Math.round(editorCanvas.height * 0.1),
        width: Math.round(editorCanvas.width * 0.8),
        height: Math.round(editorCanvas.height * 0.8)
    };

    drawCropOverlay();

    cropButton.classList.add("active");
}


function exitCropMode() {
    cropMode = false;
    cropDragging = false;
    cropHandle = null;
    cropRect = null;

    cropButton.classList.remove("active");

    renderCanvas();
}


function detectCropHandle(x, y) {
    if (!cropRect) return null;

    const size = 25;

    const handles = {
        nw: [cropRect.x, cropRect.y],
        ne: [
            cropRect.x + cropRect.width,
            cropRect.y
        ],
        sw: [
            cropRect.x,
            cropRect.y + cropRect.height
        ],
        se: [
            cropRect.x + cropRect.width,
            cropRect.y + cropRect.height
        ]
    };

    for (const [name, [hx, hy]] of Object.entries(handles)) {
        if (
            Math.abs(x - hx) <= size &&
            Math.abs(y - hy) <= size
        ) {
            return name;
        }
    }

    if (
        x >= cropRect.x &&
        x <= cropRect.x + cropRect.width &&
        y >= cropRect.y &&
        y <= cropRect.y + cropRect.height
    ) {
        return "move";
    }

    return null;
}


function drawCropOverlay() {
    if (!cropRect) return;

    renderCanvas();

    ctx.save();

    ctx.fillStyle = "rgba(0,0,0,.55)";

    ctx.fillRect(
        0,
        0,
        editorCanvas.width,
        editorCanvas.height
    );

    ctx.clearRect(
        cropRect.x,
        cropRect.y,
        cropRect.width,
        cropRect.height
    );

    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 2;

    ctx.strokeRect(
        cropRect.x,
        cropRect.y,
        cropRect.width,
        cropRect.height
    );

    const handleSize = 12;

    const points = [
        [cropRect.x, cropRect.y],
        [
            cropRect.x + cropRect.width,
            cropRect.y
        ],
        [
            cropRect.x,
            cropRect.y + cropRect.height
        ],
        [
            cropRect.x + cropRect.width,
            cropRect.y + cropRect.height
        ]
    ];

    ctx.fillStyle = "#fff";

    points.forEach(([x, y]) => {
        ctx.fillRect(
            x - handleSize / 2,
            y - handleSize / 2,
            handleSize,
            handleSize
        );
    });

    ctx.restore();
}


editorCanvas.addEventListener("pointerdown", event => {
    if (!cropMode || !cropRect) return;

    const pos = getCanvasPosition(event);

    cropHandle = detectCropHandle(
        pos.x,
        pos.y
    );

    if (!cropHandle) return;

    cropDragging = true;

    cropStartX = pos.x;
    cropStartY = pos.y;

    editorCanvas.setPointerCapture(
        event.pointerId
    );
});


editorCanvas.addEventListener("pointermove", event => {
    if (
        !cropMode ||
        !cropDragging ||
        !cropRect
    ) {
        return;
    }

    const pos = getCanvasPosition(event);

    const dx = pos.x - cropStartX;
    const dy = pos.y - cropStartY;

    const minSize = 40;

    if (cropHandle === "move") {
        cropRect.x += dx;
        cropRect.y += dy;

        cropRect.x = Math.max(
            0,
            Math.min(
                cropRect.x,
                editorCanvas.width - cropRect.width
            )
        );

        cropRect.y = Math.max(
            0,
            Math.min(
                cropRect.y,
                editorCanvas.height - cropRect.height
            )
        );
    }

    if (cropHandle === "nw") {
        const right =
            cropRect.x + cropRect.width;

        const bottom =
            cropRect.y + cropRect.height;

        cropRect.x =
            Math.max(
                0,
                Math.min(
                    pos.x,
                    right - minSize
                )
            );

        cropRect.y =
            Math.max(
                0,
                Math.min(
                    pos.y,
                    bottom - minSize
                )
            );

        cropRect.width =
            right - cropRect.x;

        cropRect.height =
            bottom - cropRect.y;
    }

    if (cropHandle === "ne") {
        const left = cropRect.x;
        const bottom =
            cropRect.y + cropRect.height;

        cropRect.y =
            Math.max(
                0,
                Math.min(
                    pos.y,
                    bottom - minSize
                )
            );

        cropRect.width =
            Math.max(
                minSize,
                Math.min(
                    editorCanvas.width - left,
                    pos.x - left
                )
            );

        cropRect.height =
            bottom - cropRect.y;
    }

    if (cropHandle === "sw") {
        const right =
            cropRect.x + cropRect.width;

        const top = cropRect.y;

        cropRect.x =
            Math.max(
                0,
                Math.min(
                    pos.x,
                    right - minSize
                )
            );

        cropRect.width =
            right - cropRect.x;

        cropRect.height =
            Math.max(
                minSize,
                Math.min(
                    editorCanvas.height - top,
                    pos.y - top
                )
            );
    }

    if (cropHandle === "se") {
        cropRect.width =
            Math.max(
                minSize,
                Math.min(
                    editorCanvas.width - cropRect.x,
                    pos.x - cropRect.x
                )
            );

        cropRect.height =
            Math.max(
                minSize,
                Math.min(
                    editorCanvas.height - cropRect.y,
                    pos.y - cropRect.y
                )
            );
    }

    cropStartX = pos.x;
    cropStartY = pos.y;

    drawCropOverlay();
});


editorCanvas.addEventListener("pointerup", event => {
    if (!cropDragging) return;

    cropDragging = false;
    cropHandle = null;

    try {
        editorCanvas.releasePointerCapture(
            event.pointerId
        );
    } catch {}
});


function applyCrop() {
    if (!cropMode || !cropRect) return;

    /*
     * القص الحقيقي الكامل سيُنقل إلى
     * نظام non-destructive state في المرحلة التالية.
     *
     * حاليًا نحفظ حدود القص كحالة انتقالية
     * ولا ندمر الصورة الأصلية.
     */

    const croppedCanvas =
        document.createElement("canvas");

    croppedCanvas.width =
        cropRect.width;

    croppedCanvas.height =
        cropRect.height;

    const croppedCtx =
        croppedCanvas.getContext("2d");

    croppedCtx.drawImage(
        editorCanvas,
        cropRect.x,
        cropRect.y,
        cropRect.width,
        cropRect.height,
        0,
        0,
        cropRect.width,
        cropRect.height
    );

    const cropUrl =
        croppedCanvas.toDataURL("image/png");

    layerCounter++;

    imageLayers.push({
        id: layerCounter,
        type: "crop",
        name: `قص ${
            imageLayers.filter(
                item => item.type === "crop"
            ).length + 1
        }`,
        start: 0,
        duration: 5,
        url: cropUrl
    });

    renderTimeline();
    updateTimelineDuration();

    exitCropMode();
}


if (cropButton) {
    cropButton.addEventListener("click", () => {
        if (!cropMode) {
            enterCropMode();
        } else {
            applyCrop();
        }
    });
}


/* =========================================================
   Text
========================================================= */

if (addTextButton) {
    addTextButton.addEventListener("click", () => {
        if (!originalImage) {
            alert("اختَر صورة أولاً.");
            return;
        }

        const text = prompt(
            "اكتب النص الذي تريد إضافته:"
        );

        if (!text || !text.trim()) return;

        layerCounter++;

        imageLayers.push({
            id: layerCounter,
            type: "text",
            name: `النص ${
                imageLayers.filter(
                    item => item.type === "text"
                ).length + 1
            }`,
            content: text.trim(),
            start: 0,
            duration: 5
        });

        renderTimeline();
        updateTimelineDuration();
    });
}


/* =========================================================
   Filters
========================================================= */

if (filterButton) {
    filterButton.addEventListener("click", () => {
        if (!originalImage) return;

        alert(
            "نظام الفلاتر الاحترافي سيتم ربطه بمحرك الفلاتر في الخطوة التالية."
        );
    });
}


/* =========================================================
   Select image
========================================================= */

if (selectImageButton) {
    selectImageButton.addEventListener(
        "click",
        () => {
            const input =
                document.createElement("input");

            input.type = "file";

            input.accept =
                "image/jpeg,image/png,image/webp,image/gif";

            input.addEventListener(
                "change",
                () => {
                    const file =
                        input.files?.[0];

                    if (!file) return;

                    if (!file.type.startsWith("image/")) {
                        alert(
                            "الملف المحدد ليس صورة."
                        );

                        return;
                    }

                    loadImage(file);
                }
            );

            input.click();
        }
    );
}


/* =========================================================
   Export
========================================================= */

if (exportButton) {
    exportButton.addEventListener(
        "click",
        () => {
            if (
                !editorCanvas.width ||
                !editorCanvas.height
            ) {
                return;
            }

            const link =
                document.createElement("a");

            link.download =
                "photo-editor-pro.png";

            link.href =
                editorCanvas.toDataURL(
                    "image/png"
                );

            link.click();
        }
    );
}


/* =========================================================
   Cleanup
========================================================= */

window.addEventListener(
    "beforeunload",
    () => {
        if (selectedImageUrl) {
            URL.revokeObjectURL(
                selectedImageUrl
            );
        }
    }
);


/* =========================================================
   Initial state
========================================================= */

updateHistoryButtons();
updateTimelineDuration();
