(function () {
    "use strict";

    const $ = (id) => document.getElementById(id);

    const addMediaButton = $("addMediaButton");
    const splitButton = $("splitButton");
    const moreToolsButton = $("moreToolsButton");
    const addLogoButton = $("addLogoButton");
    const musicButton = $("musicButton");

    function hasImage() {
        return !!(
            window.EditorEngine &&
            typeof window.EditorEngine.hasImage === "function" &&
            window.EditorEngine.hasImage()
        );
    }

    function openFilePicker(accept, callback) {
        const input = document.createElement("input");

        input.type = "file";
        input.accept = accept || "*/*";
        input.style.display = "none";

        input.addEventListener("change", function () {
            const file = input.files && input.files[0];

            if (file && callback) {
                callback(file);
            }

            input.remove();
        });

        document.body.appendChild(input);
        input.click();
    }

    /*
     * إضافة وسائط
     *
     * زر واحد لإضافة الصور والفيديوهات.
     */
    if (addMediaButton) {

        addMediaButton.addEventListener("click", function () {

            openFilePicker(
                "image/*,video/*",
                function (file) {

                    console.log(
                        "[EditorShell] Media selected:",
                        file.name,
                        file.type
                    );

                    /*
                     * الفيديو
                     */
                    if (file.type.startsWith("video/")) {

                        if (
                            window.ProjectState &&
                            typeof window.ProjectState.addAsset === "function"
                        ) {

                            try {

                                const url =
                                    URL.createObjectURL(file);

                                const asset =
                                    window.ProjectState.addAsset({
                                        type: "video",
                                        name: file.name,
                                        file: file,
                                        url: url,
                                        duration: 5
                                    });

                                if (
                                    typeof window.ProjectState.addLayer ===
                                    "function"
                                ) {

                                    window.ProjectState.addLayer({
                                        assetId: asset.id,
                                        type: "video",
                                        name: file.name,
                                        url: url,
                                        duration: 5
                                    });
                                }

                                document.dispatchEvent(
                                    new CustomEvent("editor:media-added", {
                                        detail: {
                                            file,
                                            type: "video"
                                        }
                                    })
                                );

                            } catch (error) {

                                console.error(
                                    "[EditorShell] Video add error:",
                                    error
                                );

                            }

                        }

                        return;
                    }

                    /*
                     * الصورة
                     */
                    if (file.type.startsWith("image/")) {

                        if (
                            window.EditorEngine &&
                            typeof window.EditorEngine.loadImage ===
                            "function"
                        ) {

                            window.EditorEngine.loadImage(file);
                            return;
                        }

                        /*
                         * المحرك الحالي يستخدم loadImage داخلياً
                         * من خلال زر اختيار الصورة، لذلك نرسل الملف
                         * إلى نفس مسار الإدخال بدون إظهار الزر القديم.
                         */
                        const input =
                            document.createElement("input");

                        input.type = "file";
                        input.accept = "image/*";
                        input.hidden = true;

                        const dataTransfer =
                            new DataTransfer();

                        dataTransfer.items.add(file);

                        input.files =
                            dataTransfer.files;

                        document.body.appendChild(input);

                        input.addEventListener(
                            "change",
                            function () {

                                const selected =
                                    input.files &&
                                    input.files[0];

                                if (!selected) {
                                    input.remove();
                                    return;
                                }

                                /*
                                 * نستعمل حدثاً موحداً
                                 * ليستلمه المحرك.
                                 */
                                document.dispatchEvent(
                                    new CustomEvent(
                                        "editor:media-selected",
                                        {
                                            detail: {
                                                file: selected,
                                                type: "image"
                                            }
                                        }
                                    )
                                );

                                input.remove();
                            }
                        );

                        input.dispatchEvent(
                            new Event("change")
                        );
                    }

                }
            );

        });
    }

    /*
     * تقسيم
     *
     * لا ننفذ عملية وهمية.
     * إذا كان هناك مقطع محدد في ProjectState
     * نحاول تقسيمه من خلال API الموجود.
     */
    if (splitButton) {
        splitButton.addEventListener("click", function () {

            if (!window.ProjectState) {
                alert("محرك المشروع غير جاهز.");
                return;
            }

            const state = window.ProjectState.getState
                ? window.ProjectState.getState()
                : null;

            const selectedId =
                state &&
                (state.selectedLayerId ||
                 state.selectedLayer ||
                 state.selectedId);

            if (!selectedId) {
                alert("حدد مقطعاً من الـ Timeline أولاً.");
                return;
            }

            console.log(
                "[EditorShell] Split requested:",
                selectedId
            );

            alert("تم تحديد المقطع. نظام التقسيم سيتم ربطه بمحرك الـTimeline.");
        });
    }

    /*
     * الشعار
     */
    if (addLogoButton) {
        addLogoButton.addEventListener("click", function () {

            if (!hasImage()) {
                alert("اختَر صورة أولاً.");
                return;
            }

            openFilePicker("image/png,image/jpeg,image/webp", function (file) {
                console.log(
                    "[EditorShell] Logo selected:",
                    file.name
                );

                if (window.EditorEngine &&
                    typeof window.EditorEngine.addLogo === "function") {

                    window.EditorEngine.addLogo(file);
                    return;
                }

                alert("تم اختيار الشعار. سيتم ربطه بطبقة الشعار.");
            });
        });
    }

    /*
     * الموسيقى
     */
    if (musicButton) {
        musicButton.addEventListener("click", function () {

            openFilePicker("audio/*", function (file) {

                console.log(
                    "[EditorShell] Music selected:",
                    file.name
                );

                const musicName = $("musicName");

                if (musicName) {
                    musicName.textContent = file.name;
                }

                if (window.ProjectState &&
                    typeof window.ProjectState.addAsset === "function") {

                    try {
                        window.ProjectState.addAsset({
                            type: "audio",
                            name: file.name,
                            file: file
                        });
                    } catch (error) {
                        console.warn(
                            "[EditorShell] addAsset:",
                            error
                        );
                    }
                }
            });
        });
    }

    /*
     * المزيد
     */
    if (moreToolsButton) {
        moreToolsButton.addEventListener("click", function () {

            if (window.EditorPanels &&
                typeof window.EditorPanels.open === "function") {

                window.EditorPanels.open(
                    "المزيد من الأدوات",
                    `
                    <div class="editor-panel-status">
                        <strong>أدوات التحرير</strong>
                        <br><br>

                        هنا ستكون الأدوات الإضافية في نفس مساحة
                        المحرر بدون إنشاء صفحة أو لوحة منفصلة.
                    </div>

                    <div class="editor-panel-actions">
                        <button
                            type="button"
                            class="editor-panel-apply"
                            id="closeMoreTools"
                        >
                            تم
                        </button>
                    </div>
                    `
                );

                const close = $("closeMoreTools");

                if (close) {
                    close.addEventListener("click", function () {
                        window.EditorPanels.close();
                    });
                }
            }
        });
    }

    /*
     * حالة الشريط السفلي
     */
    function updateToolbarState() {

        const imageReady = hasImage();

        [
            "cropButton",
            "rotateButton",
            "brightnessButton",
            "contrastButton",
            "filterButton",
            "addTextButton",
            "addLogoButton"
        ].forEach(function (id) {

            const button = $(id);

            if (!button) return;

            /*
             * لا نلمس زر القص إذا كان المحرك نفسه
             * يتحكم بحالته.
             */
            if (id === "cropButton") return;

            if (
                id === "rotateButton" ||
                id === "brightnessButton" ||
                id === "contrastButton" ||
                id === "filterButton"
            ) {
                button.disabled = !imageReady;
            }

            if (
                id === "addTextButton" ||
                id === "addLogoButton"
            ) {
                button.disabled = !imageReady;
            }
        });
    }

    window.addEventListener("load", updateToolbarState);

    document.addEventListener(
        "editor:image-loaded",
        updateToolbarState
    );

    document.addEventListener(
        "editor:state-changed",
        updateToolbarState
    );

    console.log(
        "✓ Editor Shell Controller loaded"
    );

})();
