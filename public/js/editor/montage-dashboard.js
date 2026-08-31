(function () {
    "use strict";

    const $ = id => document.getElementById(id);

    const state = {
        playing: false,
        currentTime: 0,
        zoom: 1,
        selectedTrack: null,
        musicUrl: null,
        musicFile: null
    };

    function engine() {
        return window.EditorEngine || null;
    }

    function project() {
        return window.ProjectState || null;
    }

    function hasImage() {
        const e = engine();
        return !!(e && typeof e.hasImage === "function" && e.hasImage());
    }

    function status(text) {
        const el = $("previewStatus");
        if (el) el.textContent = text;
    }

    function notify(message) {
        status(message);

        clearTimeout(window.__montageStatusTimer);

        window.__montageStatusTimer = setTimeout(() => {
            status(hasImage() ? "جاهز للتحرير" : "جاهز");
        }, 1800);
    }

    /* =========================
       TOOL CONNECTION
    ========================= */

    const toolMap = {
        cropButton: "crop",
        rotateButton: "rotate",
        brightnessButton: "brightness",
        contrastButton: "contrast",
        filterButton: "filter",
        addTextButton: "text",
        addLogoButton: "logo",
        musicButton: "music"
    };

    document.addEventListener("click", function (event) {

        const button = event.target.closest(".editor-tool");

        if (!button) return;

        const action = toolMap[button.id];

        if (!action) return;

        if (
            button.disabled ||
            ["rotate", "brightness", "contrast", "filter", "crop", "text"]
                .includes(action) && !hasImage()
        ) {
            if (!hasImage()) notify("اختَر صورة أولاً");
            return;
        }

        if (action === "logo") {
            openLogoPicker();
            return;
        }

        if (action === "music") {
            openMusicPicker();
            return;
        }
    });

    /* =========================
       ZOOM
    ========================= */

    $("zoomInButton")?.addEventListener("click", () => {
        state.zoom = Math.min(4, state.zoom + 0.1);
        applyZoom();
    });

    $("zoomOutButton")?.addEventListener("click", () => {
        state.zoom = Math.max(0.25, state.zoom - 0.1);
        applyZoom();
    });

    $("fitButton")?.addEventListener("click", () => {
        state.zoom = 1;
        applyZoom();
    });

    function applyZoom() {
        const canvas = $("editorCanvas");

        if (canvas) {
            canvas.style.transform =
                `scale(${state.zoom})`;
            canvas.style.transformOrigin = "center center";
        }

        const value = $("zoomValue");

        if (value) {
            value.textContent =
                `${Math.round(state.zoom * 100)}%`;
        }
    }

    /* =========================
       PLAYBACK
    ========================= */

    $("playButton")?.addEventListener("click", () => {

        state.playing = !state.playing;

        const button = $("playButton");

        if (button) {
            button.textContent =
                state.playing ? "Ⅱ" : "▶";
        }

        if (state.playing) {
            notify("تشغيل المشروع");
            startPlayback();
        } else {
            notify("إيقاف التشغيل");
        }
    });

    $("previousFrameButton")?.addEventListener("click", () => {
        state.currentTime = Math.max(0, state.currentTime - 1);
        updateTimelineCursor();
    });

    $("nextFrameButton")?.addEventListener("click", () => {
        state.currentTime += 1;
        updateTimelineCursor();
    });

    let playbackTimer = null;

    function startPlayback() {

        clearInterval(playbackTimer);

        playbackTimer = setInterval(() => {

            if (!state.playing) {
                clearInterval(playbackTimer);
                return;
            }

            state.currentTime += 0.1;

            updateTimelineCursor();

        }, 100);
    }

    function updateTimelineCursor() {

        const ruler = $("timelineRuler");

        if (!ruler) return;

        ruler.style.setProperty(
            "--playhead",
            `${state.currentTime * 40}px`
        );
    }

    /* =========================
       MUSIC
    ========================= */

    function openMusicPicker() {

        let input = $("montageMusicInput");

        if (!input) {

            input = document.createElement("input");

            input.type = "file";
            input.accept = "audio/*";
            input.id = "montageMusicInput";
            input.hidden = true;

            document.body.appendChild(input);

            input.addEventListener("change", () => {

                const file = input.files?.[0];

                if (!file) return;

                state.musicFile = file;
                state.musicUrl = URL.createObjectURL(file);

                const name = $("musicName");

                if (name) {
                    name.textContent = file.name;
                }

                addTimelineItem(
                    "الصوت",
                    file.name,
                    "music"
                );

                notify("تمت إضافة الموسيقى");
            });
        }

        input.click();
    }

    $("selectMusicButton")?.addEventListener(
        "click",
        openMusicPicker
    );

    let audio = null;

    $("musicPlayButton")?.addEventListener("click", () => {

        if (!state.musicUrl) {
            notify("أضف موسيقى أولاً");
            return;
        }

        if (!audio) {
            audio = new Audio(state.musicUrl);

            audio.addEventListener("ended", () => {
                const button = $("musicPlayButton");
                if (button) button.textContent = "▶";
            });
        }

        if (audio.paused) {
            audio.play();
            $("musicPlayButton").textContent = "Ⅱ";
        } else {
            audio.pause();
            $("musicPlayButton").textContent = "▶";
        }
    });

    /* =========================
       LOGO
    ========================= */

    function openLogoPicker() {

        let input = $("montageLogoInput");

        if (!input) {

            input = document.createElement("input");

            input.type = "file";
            input.accept = "image/*";
            input.id = "montageLogoInput";
            input.hidden = true;

            document.body.appendChild(input);

            input.addEventListener("change", () => {

                const file = input.files?.[0];

                if (!file) return;

                addTimelineItem(
                    "Overlay",
                    file.name,
                    "logo"
                );

                notify("تمت إضافة الشعار");
            });
        }

        input.click();
    }

    /* =========================
       TIMELINE
    ========================= */

    function addTimelineItem(type, name, kind, options = {}) {

        const tracks = $("timelineTracks");

        if (!tracks) return null;

        $("timelineEmpty")?.remove();

        const projectState = project();

        let track =
            tracks.querySelector(
                `[data-track="${kind}"]`
            );

        if (!track) {

            track = document.createElement("div");

            track.className = "timeline-track montage-track";

            track.dataset.track = kind;

            track.innerHTML = `
                <div class="timeline-label">
                    ${type}
                </div>

                <div class="timeline-lane"></div>
            `;

            tracks.appendChild(track);
        }

        const lane =
            track.querySelector(".timeline-lane");

        let asset = null;
        let layer = null;

        /*
         * المشروع هو المصدر الحقيقي للبيانات.
         * الـTimeline مجرد واجهة لعرض الـLayers.
         */

        if (
            projectState &&
            typeof projectState.addAsset === "function"
        ) {

            asset = projectState.addAsset({
                type: kind,
                name,
                url: options.url || null,
                file: options.file || null,
                duration: Number(options.duration) || 5,
                metadata: options.metadata || {}
            });
        }

        if (
            projectState &&
            typeof projectState.addLayer === "function"
        ) {

            layer = projectState.addLayer({
                assetId: asset?.id || null,
                type: kind,
                name,
                start: Number(options.start) || 0,
                duration: Number(options.duration) || 5,
                url: options.url || null,
                content: options.content || "",
                metadata: options.metadata || {}
            });
        }

        const clip =
            document.createElement("button");

        clip.type = "button";

        clip.className =
            "timeline-clip montage-clip";

        clip.textContent = name;

        clip.dataset.kind = kind;

        if (asset?.id) {
            clip.dataset.assetId = asset.id;
        }

        if (layer?.id) {
            clip.dataset.layerId = layer.id;
        }

        /*
         * عرض المقطع مرتبط بمدته.
         * 1 ثانية = 80px تقريباً.
         */
        const duration =
            Number(layer?.duration || options.duration || 5);

        const pixelsPerSecond = 80;

        clip.style.width =
            `${Math.max(90, duration * pixelsPerSecond)}px`;

        clip.style.flex = "0 0 auto";

        clip.addEventListener("click", () => {

            document
                .querySelectorAll(".montage-clip")
                .forEach(el =>
                    el.classList.remove("active")
                );

            clip.classList.add("active");

            state.selectedTrack = {
                type,
                name,
                kind,
                assetId: asset?.id || null,
                layerId: layer?.id || null
            };

            if (
                layer?.id &&
                projectState &&
                typeof projectState.selectLayer === "function"
            ) {
                projectState.selectLayer(layer.id);
            }

            notify(`تم تحديد ${type}`);
        });

        lane.appendChild(clip);

        return {
            asset,
            layer,
            clip
        };
    }

    /* =========================
       EXPORT
    ========================= */

    $("exportButton")?.addEventListener("click", () => {

        const canvas = $("editorCanvas");

        if (!canvas || !hasImage()) {
            notify("لا توجد صورة للتصدير");
            return;
        }

        try {

            const link =
                document.createElement("a");

            link.download =
                "photo-editor-project.png";

            link.href =
                canvas.toDataURL("image/png");

            link.click();

            notify("تم تصدير المشروع");

        } catch (error) {

            console.error(error);
            notify("تعذر تصدير المشروع");
        }
    });

    /* =========================
       HISTORY CONNECTION
    ========================= */

    $("undoButton")?.addEventListener(
        "click",
        () => {
            engine()?.undo?.();
            notify("تراجع");
        }
    );

    $("redoButton")?.addEventListener(
        "click",
        () => {
            engine()?.redo?.();
            notify("إعادة");
        }
    );

    /* =========================
       PROJECT EVENTS
    ========================= */

    if (project() && typeof project().on === "function") {

        project().on("change", () => {
            renderProjectState();
        });

        project().on("select", () => {
            renderProjectState();
        });
    }

    function renderProjectState() {

        const p = project();

        if (!p) return;

        try {

            const state =
                typeof p.getState === "function"
                    ? p.getState()
                    : null;

            if (state) {
                console.log(
                    "[MontageDashboard] Project State",
                    state
                );
            }

        } catch (_) {}
    }

    /* =========================
       INIT
    ========================= */

    window.MontageDashboard = {
        state,
        addTimelineItem,
        openMusicPicker,
        openLogoPicker,
        notify
    };

    applyZoom();

    console.log(
        "✓ Montage Dashboard connected"
    );

})();
