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

        .editor-filter-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 10px;
        }

        .editor-filter {
            min-height: 62px;
            border: 1px solid rgba(255,255,255,.10);
            border-radius: 12px;
            background: rgba(255,255,255,.06);
            color: #fff;
            cursor: pointer;
            font-weight: 600;
        }

        .editor-filter.active {
            border-color: #fff;
            background: rgba(255,255,255,.14);
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

        .editor-text-input {
            width: 100%;
            min-height: 48px;
            box-sizing: border-box;
            border: 1px solid rgba(255,255,255,.12);
            border-radius: 12px;
            background: rgba(255,255,255,.06);
            color: #fff;
            padding: 12px;
            outline: none;
        }

        .editor-panel-label {
            font-size: 13px;
            opacity: .7;
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

        <div class="editor-panel-content" id="editorPanelContent"></div>
    `;

    canvasArea.appendChild(panel);

    const title = document.getElementById("editorPanelTitle");
    const content = document.getElementById("editorPanelContent");
    const close = document.getElementById("editorPanelClose");

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

    /*
     * لا نشغّل الأدوات هنا بالقوة.
     * هذا الملف مسؤول عن واجهة اللوحات،
     * والمحرك الأساسي يحتفظ بالتحكم في الصورة.
     */
})();
