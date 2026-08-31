(function () {
    "use strict";

    const state = {
        project: {
            id: crypto.randomUUID
                ? crypto.randomUUID()
                : String(Date.now()),

            name: "مشروع جديد",

            width: 1920,
            height: 1080,

            duration: 0,

            currentTime: 0,

            assets: [],

            layers: [],

            selectedLayerId: null,

            settings: {
                background: "#000000"
            }
        },

        listeners: new Set(),

        history: [],

        historyIndex: -1
    };


    function clone(value) {
        return JSON.parse(JSON.stringify(value));
    }


    function emit(type = "state") {
        const snapshot = getState();

        state.listeners.forEach(listener => {
            try {
                listener(snapshot, type);
            } catch (error) {
                console.error("ProjectState listener error:", error);
            }
        });
    }


    function getState() {
        return clone(state.project);
    }


    function subscribe(listener) {
        if (typeof listener !== "function") return () => {};

        state.listeners.add(listener);

        return () => {
            state.listeners.delete(listener);
        };
    }


    function createAsset(data = {}) {
        return {
            id: data.id || crypto.randomUUID
                ? crypto.randomUUID()
                : `${Date.now()}-${Math.random()}`,

            type: data.type || "image",

            name: data.name || "عنصر جديد",

            url: data.url || null,

            file: data.file || null,

            duration: Number(data.duration) || 5,

            metadata: data.metadata || {}
        };
    }


    function createLayer(data = {}) {
        return {
            id: data.id || `layer-${Date.now()}-${Math.random()}`,

            assetId: data.assetId || null,

            type: data.type || "image",

            name: data.name || "طبقة",

            start: Number(data.start) || 0,

            duration: Number(data.duration) || 5,

            visible: data.visible !== false,

            locked: data.locked === true,

            transform: {
                x: Number(data.x) || 0,
                y: Number(data.y) || 0,
                scaleX: Number(data.scaleX) || 1,
                scaleY: Number(data.scaleY) || 1,
                rotation: Number(data.rotation) || 0,
                opacity:
                    data.opacity === undefined
                        ? 1
                        : Number(data.opacity)
            },

            content: data.content || "",

            url: data.url || null,

            metadata: data.metadata || {}
        };
    }


    function addAsset(data) {
        const asset = createAsset(data);

        state.project.assets.push(asset);

        saveHistory();

        emit("asset:add");

        return asset;
    }


    function addLayer(data) {
        const layer = createLayer(data);

        state.project.layers.push(layer);

        state.project.selectedLayerId = layer.id;

        recalculateDuration();

        saveHistory();

        emit("layer:add");

        return layer;
    }


    function removeLayer(id) {
        const index =
            state.project.layers.findIndex(
                layer => layer.id === id
            );

        if (index === -1) return false;

        state.project.layers.splice(index, 1);

        if (state.project.selectedLayerId === id) {
            state.project.selectedLayerId = null;
        }

        recalculateDuration();

        saveHistory();

        emit("layer:remove");

        return true;
    }


    function selectLayer(id) {
        const exists =
            state.project.layers.some(
                layer => layer.id === id
            );

        state.project.selectedLayerId =
            exists ? id : null;

        emit("selection");

        return exists;
    }


    function getSelectedLayer() {
        return (
            state.project.layers.find(
                layer =>
                    layer.id ===
                    state.project.selectedLayerId
            ) || null
        );
    }


    function updateLayer(id, changes = {}) {
        const layer =
            state.project.layers.find(
                item => item.id === id
            );

        if (!layer || layer.locked) return false;

        Object.keys(changes).forEach(key => {
            if (
                key === "transform" &&
                typeof changes.transform === "object"
            ) {
                Object.assign(
                    layer.transform,
                    changes.transform
                );
            } else {
                layer[key] = changes[key];
            }
        });

        recalculateDuration();

        saveHistory();

        emit("layer:update");

        return true;
    }


    function moveLayer(id, x, y) {
        return updateLayer(id, {
            transform: {
                x: Number(x) || 0,
                y: Number(y) || 0
            }
        });
    }


    function resizeLayer(id, scaleX, scaleY) {
        return updateLayer(id, {
            transform: {
                scaleX: Number(scaleX) || 1,
                scaleY:
                    scaleY === undefined
                        ? Number(scaleX) || 1
                        : Number(scaleY) || 1
            }
        });
    }


    function rotateLayer(id, rotation) {
        return updateLayer(id, {
            transform: {
                rotation: Number(rotation) || 0
            }
        });
    }


    function setOpacity(id, opacity) {
        return updateLayer(id, {
            transform: {
                opacity: Math.max(
                    0,
                    Math.min(1, Number(opacity))
                )
            }
        });
    }


    function recalculateDuration() {
        state.project.duration =
            state.project.layers.reduce(
                (max, layer) =>
                    Math.max(
                        max,
                        layer.start + layer.duration
                    ),
                0
            );
    }


    function saveHistory() {
        const snapshot = clone(state.project);

        state.history =
            state.history.slice(
                0,
                state.historyIndex + 1
            );

        state.history.push(snapshot);

        if (state.history.length > 50) {
            state.history.shift();
        }

        state.historyIndex =
            state.history.length - 1;
    }


    function undo() {
        if (state.historyIndex <= 0) return false;

        state.historyIndex--;

        state.project =
            clone(
                state.history[
                    state.historyIndex
                ]
            );

        emit("undo");

        return true;
    }


    function redo() {
        if (
            state.historyIndex >=
            state.history.length - 1
        ) {
            return false;
        }

        state.historyIndex++;

        state.project =
            clone(
                state.history[
                    state.historyIndex
                ]
            );

        emit("redo");

        return true;
    }


    function setCurrentTime(time) {
        state.project.currentTime =
            Math.max(
                0,
                Math.min(
                    Number(time) || 0,
                    state.project.duration
                )
            );

        emit("timeline:time");
    }


    function reset() {
        state.project = {
            id:
                crypto.randomUUID
                    ? crypto.randomUUID()
                    : String(Date.now()),

            name: "مشروع جديد",

            width: 1920,
            height: 1080,

            duration: 0,

            currentTime: 0,

            assets: [],

            layers: [],

            selectedLayerId: null,

            settings: {
                background: "#000000"
            }
        };

        state.history = [];

        state.historyIndex = -1;

        saveHistory();

        emit("reset");
    }


    saveHistory();


    window.ProjectState = {
        getState,
        subscribe,

        addAsset,
        addLayer,
        removeLayer,

        selectLayer,
        getSelectedLayer,

        updateLayer,
        moveLayer,
        resizeLayer,
        rotateLayer,
        setOpacity,

        setCurrentTime,

        undo,
        redo,

        reset
    };

})();
