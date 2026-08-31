(function () {
    "use strict";

    const style = document.createElement("style");

    style.textContent = `
        .editor-panel {
            position: absolute;
            left: 16px;
            right: 16px;
            bottom: 16px;
            z-index: 50;
            background: rgba(20, 20, 24, .97);
            border: 1px solid rgba(255,255,255,.10);
            border-radius: 18px;
            padding: 18px;
            box-shadow: 0 18px 50px rgba(0,0,0,.35);
            backdrop-filter: blur(18px);
            color: #fff;
            display: none;
        }

        .editor-panel.active {
            display: block;
            animation: editorPanelIn .18s ease-out;
        }

        @keyframes editorPanelIn {
            from {
                opacity: 0;
                transform: translateY(12px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        .editor-panel-head {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
            margin-bottom: 18px;
        }

        .editor-panel-title {
            font-size: 17px;
            font-weight: 700;
        }

        .editor-panel-close {
            width: 34px;
            height: 34px;
            border: 0;
            border-radius: 10px;
            background: rgba(255,255,255,.08);
            color: #fff;
            font-size: 20px;
            cursor: pointer;
        }

        .editor-panel-content {
            display: flex;
            flex-direction: column;
            gap: 16px;
        }

        .editor-range-row {
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .editor-range {
            flex: 1;
            accent-color: #fff;
            cursor: pointer;
        }

        .editor-range-value {
            min-width: 52px;
            text-align: center;
            font-weight: 700;
        }

        .editor-panel-actions {
            display: flex;
            gap: 10px;
            margin-top: 4px;
        }

        .editor-panel-actions button {
            flex: 1;
            min-height: 44px;
            border-radius: 12px;
            border: 1px solid rgba(255,255,255,.10);
            cursor: pointer;
            font-weight: 700;
        }

        .editor-panel-reset {
            background: rgba(255,255,255,.07);
            color: #fff;
        }

        .editor-panel-apply {
            background: #fff;
            color: #111;
        }

        .editor-rotate-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;
        }

        .editor-rotate-grid button {
            min-height: 48px;
            border: 1px solid rgba(255,255,255,.10);
            border-radius: 12px;
            background: rgba(255,255,255,.06);
            color: #fff;
            cursor: pointer;
            font-weight: 700;
        }

        .editor-panel-label {
            font-size: 13px;
            opacity: .7;
        }

        .editor-panel-status {
            text-align: center;
            padding: 12px;
            border-radius: 12px;
            background: rgba(255,255,255,.06);
            font-size: 13px;
            opacity: .8;
        }

        @media (max-width: 600px) {
            .editor-panel {
                left: 8px;
                right: 8px;
                bottom: 8px;
                padding: 14px;
                border-radius: 16px;
            }
        }
    `;

    document.head.appendChild(style);

    const canvasArea = document.querySelector(".canvas-area");

    if (!canvasArea) return;

    const panel = document.createElement("div");
    panel.className = "editor-panel";
    panel.id = "editorToolPanel";

    panel.innerHTML = `
        <div class="editor-panel-head">
            <div class="editor-panel-title" id="editorPanelTitle">
                أداة التحرير
            </div>

            <button
                type="button"
                class="editor-panel-close"
                id="editorPanelClose"
                aria-label="إغلاق"
            >×</button>
        </div>

        <div
            class="editor-panel-content"
            id="editorPanelContent"
        ></div>
    `;

    canvasArea.appendChild(panel);

    const title = panel.querySelector("#editorPanelTitle");
    const content = panel.querySelector("#editorPanelContent");
    const close = panel.querySelector("#editorPanelClose");

    function openPanel(name, html) {
        title.textContent = name;
        content.innerHTML = html;
        panel.classList.add("active");
    }

    function closePanel() {
        panel.classList.remove("active");
        content.innerHTML = "";
    }

    close.addEventListener("click", closePanel);

    window.EditorPanels = {
        open: openPanel,
        close: closePanel,
        element: panel
    };

    function engine() {
        return window.EditorEngine || null;
    }

    function requireImage() {
        const e = engine();

        if (!e || !e.hasImage()) {
            alert("اختَر صورة أولاً.");
            return false;
        }

        return true;
    }

    function openBrightness() {
        if (!requireImage()) return;

        const e = engine();
        const original = e.getState().brightness;

        openPanel(
            "الإضاءة",
            `
                <div class="editor-panel-label">
                    تعديل إضاءة الصورة مباشرة
                </div>

                <div class="editor-range-row">
                    <input
                        id="panelBrightness"
                        class="editor-range"
                        type="range"
                        min="-100"
                        max="100"
                        step="1"
                        value="${original}"
                    >

                    <div
                        id="panelBrightnessValue"
                        class="editor-range-value"
                    >${original}</div>
                </div>

                <div class="editor-panel-actions">
                    <button
                        type="button"
                        class="editor-panel-reset"
                        id="panelBrightnessCancel"
                    >إلغاء</button>

                    <button
                        type="button"
                        class="editor-panel-apply"
                        id="panelBrightnessApply"
                    >تطبيق</button>
                </div>
            `
        );

        const range = content.querySelector("#panelBrightness");
        const value = content.querySelector("#panelBrightnessValue");

        range.addEventListener("input", () => {
            const v = Number(range.value);
            value.textContent = v;
            e.setBrightness(v);
        });

        content.querySelector("#panelBrightnessCancel")
            .addEventListener("click", () => {
                e.setBrightness(original);
                closePanel();
            });

        content.querySelector("#panelBrightnessApply")
            .addEventListener("click", () => {
                e.applyHistory();
                closePanel();
            });
    }

    function openContrast() {
        if (!requireImage()) return;

        const e = engine();
        const original = e.getState().contrast;

        openPanel(
            "التباين",
            `
                <div class="editor-panel-label">
                    تعديل تباين الصورة مباشرة
                </div>

                <div class="editor-range-row">
                    <input
                        id="panelContrast"
                        class="editor-range"
                        type="range"
                        min="-100"
                        max="100"
                        step="1"
                        value="${original}"
                    >

                    <div
                        id="panelContrastValue"
                        class="editor-range-value"
                    >${original}</div>
                </div>

                <div class="editor-panel-actions">
                    <button
                        type="button"
                        class="editor-panel-reset"
                        id="panelContrastCancel"
                    >إلغاء</button>

                    <button
                        type="button"
                        class="editor-panel-apply"
                        id="panelContrastApply"
                    >تطبيق</button>
                </div>
            `
        );

        const range = content.querySelector("#panelContrast");
        const value = content.querySelector("#panelContrastValue");

        range.addEventListener("input", () => {
            const v = Number(range.value);
            value.textContent = v;
            e.setContrast(v);
        });

        content.querySelector("#panelContrastCancel")
            .addEventListener("click", () => {
                e.setContrast(original);
                closePanel();
            });

        content.querySelector("#panelContrastApply")
            .addEventListener("click", () => {
                e.applyHistory();
                closePanel();
            });
    }

    function openRotate() {
        if (!requireImage()) return;

        openPanel(
            "تدوير الصورة",
            `
                <div class="editor-panel-label">
                    اختر اتجاه التدوير
                </div>

                <div class="editor-rotate-grid">
                    <button type="button" id="rotateLeft">
                        ↶ 90° يسار
                    </button>

                    <button type="button" id="rotateRight">
                        ↷ 90° يمين
                    </button>

                    <button type="button" id="rotate180">
                        180°
                    </button>

                    <button type="button" id="rotateClose">
                        تم
                    </button>
                </div>
            `
        );

        const e = engine();

        content.querySelector("#rotateLeft")
            .addEventListener("click", () => e.rotate(-90));

        content.querySelector("#rotateRight")
            .addEventListener("click", () => e.rotate(90));

        content.querySelector("#rotate180")
            .addEventListener("click", () => e.rotate(180));

        content.querySelector("#rotateClose")
            .addEventListener("click", closePanel);
    }

    function openFilter() {
        if (!requireImage()) return;

        openPanel(
            "الفلاتر",
            `
                <div class="editor-panel-status">
                    محرك الفلاتر قيد البناء — لن نعرض فلاتر وهمية.
                </div>
            `
        );
    }

    function openCrop() {
        if (!requireImage()) return;

        openPanel(
            "قص الصورة",
            `
                <div class="editor-panel-status">
                    أداة القص الحالية تعمل على مساحة الصورة.
                </div>

                <div class="editor-panel-actions">
                    <button
                        type="button"
                        class="editor-panel-reset"
                        id="cropPanelClose"
                    >إغلاق</button>
                </div>
            `
        );

        content.querySelector("#cropPanelClose")
            .addEventListener("click", closePanel);
    }

    function openText() {
        if (!requireImage()) return;

        openPanel(
            "النص",
            `
                <div class="editor-panel-status">
                    نظام النص سيتم ربطه بالمحرك الطبقي بدل استخدام
                    prompt أو عناصر وهمية.
                </div>

                <div class="editor-panel-actions">
                    <button
                        type="button"
                        class="editor-panel-reset"
                        id="textPanelClose"
                    >إغلاق</button>
                </div>
            `
        );

        content.querySelector("#textPanelClose")
            .addEventListener("click", closePanel);
    }

    /*
     * Capture يمنع المستمعات القديمة من تنفيذ نفس الزر مرتين.
     * عند الضغط على الزر، هذا المدير هو المسؤول عن فتح القسم.
     */
    document.addEventListener("click", function (event) {
        const button = event.target.closest(".editor-tool");

        if (!button) return;

        const actions = {
            cropButton: openCrop,
            rotateButton: openRotate,
            brightnessButton: openBrightness,
            contrastButton: openContrast,
            filterButton: openFilter,
            addTextButton: openText
        };

        const action = actions[button.id];

        if (!action) return;

        event.preventDefault();
        event.stopImmediatePropagation();

        action();
    }, true);
})();
