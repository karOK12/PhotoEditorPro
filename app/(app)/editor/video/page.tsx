"use client";

import { ChangeEvent, PointerEvent, useEffect, useRef, useState } from "react";
import VideoToolPanel from "./components/VideoToolPanel";
import VideoEditorTopBar from "./components/VideoEditorTopBar";
import VideoEditorBottomBar from "./components/VideoEditorBottomBar";

type MediaItem = {
  id: string;
  name: string;
  type: "video" | "image";
  url: string;
  duration: number;
};

const tools = [
  ["✂", "تحرير"],
  ["♫", "صوت"],
  ["T", "نص"],
  ["◇", "ملصقات"],
  ["✦", "تأثيرات"],
  ["◉", "فلاتر"],
  ["☼", "ضبط"],
  ["↔", "سرعة"],
  ["▣", "انتقال"],
  ["▥", "طبقة"],
];

function formatTime(seconds: number) {
  const value = Math.max(0, Math.floor(seconds || 0));
  return `${String(Math.floor(value / 60)).padStart(2, "0")}:${String(value % 60).padStart(2, "0")}`;
}

export default function VideoEditorPage() {
  const mediaInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

  const [media, setMedia] = useState<MediaItem[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [currentTime, setCurrentTime] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [activeTool, setActiveTool] = useState("تحرير");
  const [timelineDragging, setTimelineDragging] = useState(false);
  const [draggedId, setDraggedId] = useState<string | null>(null);

  const selected = media.find((item) => item.id === selectedId) || media[0];
  const totalDuration = media.reduce((sum, item) => sum + item.duration, 0);
  const selectedIndex = selected ? media.findIndex((item) => item.id === selected.id) : 0;

  useEffect(() => {
    return () => {
      media.forEach((item) => URL.revokeObjectURL(item.url));
    };
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const update = () => setCurrentTime(video.currentTime);
    const play = () => setPlaying(true);
    const pause = () => setPlaying(false);

    video.addEventListener("timeupdate", update);
    video.addEventListener("play", play);
    video.addEventListener("pause", pause);

    return () => {
      video.removeEventListener("timeupdate", update);
      video.removeEventListener("play", play);
      video.removeEventListener("pause", pause);
    };
  }, [selected?.id]);

  const addMedia = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    const items: MediaItem[] = files
      .filter((file) => file.type.startsWith("video/") || file.type.startsWith("image/"))
      .map((file) => ({
        id: `${file.name}-${Date.now()}-${Math.random()}`,
        name: file.name,
        type: file.type.startsWith("video/") ? "video" : "image",
        url: URL.createObjectURL(file),
        duration: file.type.startsWith("image/") ? 5 : 0,
      }));

    items.forEach((item) => {
      if (item.type === "video") {
        const probe = document.createElement("video");
        probe.preload = "metadata";
        probe.src = item.url;
        probe.onloadedmetadata = () => {
          setMedia((current) =>
            current.map((entry) =>
              entry.id === item.id
                ? { ...entry, duration: Number.isFinite(probe.duration) ? probe.duration : 5 }
                : entry
            )
          );
        };
      }
    });

    setMedia((current) => [...current, ...items]);
    if (!selectedId && items[0]) setSelectedId(items[0].id);
    event.target.value = "";
  };

  const selectMedia = (item: MediaItem) => {
    setSelectedId(item.id);
    setCurrentTime(0);
    setPlaying(false);
  };

  const deleteMedia = (id: string) => {
    setMedia((items) => {
      const index = items.findIndex((item) => item.id === id);
      const next = items.filter((item) => item.id !== id);

      if (id === selectedId) {
        const nextSelected = next[Math.max(0, index - 1)] || next[0];
        setSelectedId(nextSelected?.id || "");
        setCurrentTime(0);
        setPlaying(false);
      }

      return next;
    });
  };

  const splitSelectedClip = () => {
    if (!selected || selected.type !== "video" || selected.duration <= 0) return;

    const point = Math.max(0.1, Math.min(selected.duration - 0.1, currentTime));
    if (point <= 0.1 || point >= selected.duration - 0.1) return;

    const firstId = `${selected.id}-a-${Date.now()}`;
    const secondId = `${selected.id}-b-${Date.now()}`;

    const first: MediaItem = {
      ...selected,
      id: firstId,
      name: `${selected.name} — 1`,
      duration: point,
    };

    const second: MediaItem = {
      ...selected,
      id: secondId,
      name: `${selected.name} — 2`,
      duration: selected.duration - point,
    };

    setMedia((items) => {
      const index = items.findIndex((item) => item.id === selected.id);
      if (index < 0) return items;

      const next = [...items];
      next.splice(index, 1, first, second);
      return next;
    });

    setSelectedId(secondId);
    setCurrentTime(0);
    setPlaying(false);
  };

  const moveMedia = (fromId: string, toId: string) => {
    if (fromId === toId) return;

    setMedia((items) => {
      const fromIndex = items.findIndex((item) => item.id === fromId);
      const toIndex = items.findIndex((item) => item.id === toId);

      if (fromIndex < 0 || toIndex < 0) return items;

      const next = [...items];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });
  };

  const togglePlay = async () => {
    if (!selected) return;

    if (selected.type === "video" && videoRef.current) {
      if (videoRef.current.paused) await videoRef.current.play();
      else videoRef.current.pause();
    } else {
      setPlaying((value) => !value);
    }
  };

  const seekTimeline = (clientX: number) => {
    if (!timelineRef.current || !totalDuration) return;

    const rect = timelineRef.current.getBoundingClientRect();
    const position = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const time = position * totalDuration;

    let accumulated = 0;
    let target = media[0];

    for (const item of media) {
      if (time <= accumulated + item.duration) {
        target = item;
        break;
      }
      accumulated += item.duration;
    }

    if (!target) return;

    if (target.id !== selectedId) {
      setSelectedId(target.id);
      setPlaying(false);
    }

    const localTime = Math.max(0, time - accumulated);
    setCurrentTime(localTime);

    if (target.type === "video" && videoRef.current) {
      videoRef.current.currentTime = localTime;
    }
  };

  const handleTimelineDown = (event: PointerEvent<HTMLDivElement>) => {
    if (!media.length) return;
    setTimelineDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
    seekTimeline(event.clientX);
  };

  const handleTimelineMove = (event: PointerEvent<HTMLDivElement>) => {
    if (timelineDragging) seekTimeline(event.clientX);
  };

  const handleTimelineUp = () => setTimelineDragging(false);

  const progress = selected?.duration
    ? Math.min(100, (currentTime / selected.duration) * 100)
    : 0;

  return (
    <main dir="rtl" className="editor">
      <style jsx>{`
        * { box-sizing: border-box; }

        .editor {
          min-height: 100dvh;
          background: #08090c;
          color: #fff;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          font-family: Arial, sans-serif;
        }

        .videoEditorTopBar {
          height: 58px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 0 12px;
          background: #101116;
          border-bottom: 1px solid #252730;
          z-index: 20;
        }

        .videoEditorTopButton {
          width: 38px;
          height: 38px;
          flex: 0 0 38px;
          border: 1px solid #30333c;
          border-radius: 10px;
          background: #191b21;
          color: #fff;
          font-size: 22px;
          cursor: pointer;
        }

        .videoEditorTopTitle {
          min-width: 0;
          flex: 1;
          text-align: right;
        }

        .videoEditorTopTitle strong {
          display: block;
          color: #fff;
          font-size: 14px;
        }

        .videoEditorTopTitle span {
          display: block;
          margin-top: 2px;
          max-width: 180px;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
          color: #777c88;
          font-size: 10px;
        }

        .videoEditorTopActions {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-shrink: 0;
        }

        .videoEditorExportButton {
          height: 38px;
          padding: 0 15px;
          border: 0;
          border-radius: 9px;
          background: #fff;
          color: #090a0d;
          font-size: 12px;
          font-weight: 800;
          cursor: pointer;
        }

        .videoEditorBottomBar {
          flex-shrink: 0;
          width: 100%;
          padding: 7px 8px;
          background: #101116;
          border-top: 1px solid #292c34;
          overflow: hidden;
          z-index: 15;
        }

        .videoEditorBottomScroller {
          display: flex;
          align-items: stretch;
          gap: 3px;
          width: max-content;
          min-width: 100%;
          overflow-x: auto;
          scrollbar-width: none;
        }

        .videoEditorBottomScroller::-webkit-scrollbar {
          display: none;
        }

        .videoEditorBottomItem {
          min-width: 63px;
          height: 57px;
          padding: 0 8px;
          border: 0;
          border-radius: 9px;
          background: transparent;
          color: #aeb2bc;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 5px;
          flex-shrink: 0;
          cursor: pointer;
        }

        .videoEditorBottomItem.active {
          background: #20232a;
          color: #fff;
        }

        .videoEditorBottomIcon {
          font-size: 19px;
          line-height: 1;
        }

        .top {
          height: 58px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 12px;
          background: #101116;
          border-bottom: 1px solid #252730;
        }

        .topGroup {
          display: flex;
          align-items: center;
          gap: 9px;
        }

        .topButton {
          width: 38px;
          height: 38px;
          border: 1px solid #30333c;
          border-radius: 10px;
          background: #191b21;
          color: #fff;
          font-size: 19px;
          cursor: pointer;
        }

        .projectTitle strong {
          display: block;
          font-size: 14px;
        }

        .projectTitle span {
          display: block;
          color: #777c88;
          font-size: 10px;
          margin-top: 2px;
          max-width: 150px;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
        }

        .export {
          border: 0;
          border-radius: 9px;
          height: 38px;
          padding: 0 16px;
          background: #fff;
          color: #090a0d;
          font-weight: 800;
          cursor: pointer;
        }

        .workspace {
          flex: 1;
          min-height: 0;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .previewArea {
          flex: 1;
          min-height: 260px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 14px;
          background:
            radial-gradient(circle at center, #1b1d23 0, #0a0b0f 62%);
        }

        .previewFrame {
          position: relative;
          width: min(100%, 780px);
          height: min(100%, 58vh);
          aspect-ratio: 16 / 9;
          background: #030405;
          border: 1px solid #292c34;
          border-radius: 12px;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 24px 80px rgba(0,0,0,.45);
        }

        .previewFrame video,
        .previewFrame img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          display: block;
        }

        .empty {
          text-align: center;
          color: #777c88;
        }

        .emptyIcon {
          font-size: 42px;
          display: block;
          margin-bottom: 8px;
        }

        .empty strong {
          color: #c7cad2;
          display: block;
          margin-bottom: 5px;
        }

        .redGuide {
          position: absolute;
          left: 0;
          right: 0;
          top: ${progress}%;
          height: 2px;
          background: #ff304f;
          box-shadow: 0 0 9px rgba(255,48,79,.85);
          pointer-events: none;
          z-index: 5;
          transition: top .04s linear;
        }

        .redGuide::after {
          content: "";
          position: absolute;
          right: 0;
          top: -4px;
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #ff304f;
        }

        .playerControls {
          position: absolute;
          bottom: 10px;
          left: 10px;
          right: 10px;
          height: 42px;
          border-radius: 9px;
          background: rgba(0,0,0,.68);
          backdrop-filter: blur(10px);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 14px;
          z-index: 7;
        }

        .play {
          width: 34px;
          height: 34px;
          border: 0;
          border-radius: 50%;
          background: #fff;
          color: #111;
          cursor: pointer;
          font-weight: 900;
        }

        .playerTime {
          direction: ltr;
          font-size: 11px;
          color: #d0d3da;
          font-variant-numeric: tabular-nums;
        }

        .sideTools {
          flex-shrink: 0;
          display: flex;
          align-items: stretch;
          gap: 3px;
          padding: 7px 8px;
          background: #101116;
          border-top: 1px solid #292c34;
          overflow-x: auto;
          scrollbar-width: none;
        }

        .sideTools::-webkit-scrollbar { display: none; }

        .tool {
          min-width: 63px;
          height: 57px;
          border: 0;
          border-radius: 9px;
          background: transparent;
          color: #aeb2bc;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 5px;
          cursor: pointer;
          flex-shrink: 0;
        }

        .tool span {
          font-size: 19px;
          line-height: 1;
        }

        .tool small {
          font-size: 10px;
        }

        .tool.active {
          background: #20232a;
          color: #fff;
        }

        .timelineSection {
          flex-shrink: 0;
          background: #0d0e12;
          border-top: 1px solid #292c34;
          padding: 8px 10px 10px;
        }

        .timelineHeader {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 7px;
          font-size: 11px;
          color: #777c87;
        }

        .timelineHeader strong {
          color: #d5d8df;
          font-size: 12px;
        }

        .addMedia {
          border: 1px dashed #484c57;
          background: #181a20;
          color: #d4d7de;
          border-radius: 8px;
          padding: 7px 11px;
          cursor: pointer;
          font-size: 11px;
        }

        .timeline {
          height: 88px;
          position: relative;
          display: flex;
          gap: 3px;
          padding: 3px;
          overflow: hidden;
          background: #07080b;
          border: 1px solid #30333c;
          border-radius: 8px;
          touch-action: none;
          user-select: none;
          transform: scaleX(${zoom});
          transform-origin: center;
        }

        .clip {
          position: relative;
          height: 100%;
          min-width: 76px;
          flex: 1 1 0;
          overflow: hidden;
          border: 2px solid transparent;
          border-radius: 6px;
          background: #17191e;
          cursor: pointer;
        }

        .clip.selected {
          border-color: #ff304f;
          box-shadow: 0 0 0 1px rgba(255,48,79,.35);
        }

        .clip.dragging {
          opacity: .45;
          transform: scale(.98);
        }

        .clipDelete {
          position: absolute;
          top: 4px;
          left: 4px;
          width: 22px;
          height: 22px;
          border: 0;
          border-radius: 50%;
          background: rgba(0,0,0,.8);
          color: #fff;
          font-size: 16px;
          line-height: 20px;
          cursor: pointer;
          z-index: 4;
        }

        .timelineActions {
          display: flex;
          align-items: center;
          gap: 7px;
          margin-top: 7px;
          overflow-x: auto;
          scrollbar-width: none;
        }

        .timelineActions::-webkit-scrollbar {
          display: none;
        }

        .timelineAction {
          flex: 0 0 auto;
          height: 30px;
          padding: 0 11px;
          border: 1px solid #30333c;
          border-radius: 7px;
          background: #181a20;
          color: #d5d8df;
          font-size: 10px;
          cursor: pointer;
        }

        .timelineAction:hover:not(:disabled) {
          background: #242730;
        }

        .timelineAction.danger {
          color: #ff8c99;
        }

        .timelineAction:disabled {
          opacity: .35;
          cursor: default;
        }

        .clip img,
        .clip video {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          pointer-events: none;
        }

        .clipName {
          position: absolute;
          right: 4px;
          bottom: 3px;
          left: 4px;
          padding: 3px 4px;
          border-radius: 4px;
          background: rgba(0,0,0,.7);
          color: #fff;
          font-size: 8px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .timelineCursor {
          position: absolute;
          top: -2px;
          bottom: -2px;
          width: 2px;
          background: #ff304f;
          z-index: 10;
          pointer-events: none;
          box-shadow: 0 0 7px rgba(255,48,79,.9);
        }

        .timelineCursor::before {
          content: "";
          position: absolute;
          top: -2px;
          left: -4px;
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #ff304f;
        }

        .timelineBottom {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 7px;
          color: #777c87;
          font-size: 10px;
        }

        .zoomControls {
          display: flex;
          gap: 5px;
          direction: ltr;
        }

        .zoomControls button {
          width: 27px;
          height: 25px;
          border: 1px solid #30333c;
          background: #181a20;
          color: #ddd;
          border-radius: 6px;
          cursor: pointer;
        }

        @media (min-width: 760px) {
          .workspace {
            display: grid;
            grid-template-columns: 1fr;
          }

          .sideTools {
            justify-content: center;
          }

          .tool {
            min-width: 78px;
          }

          .timelineSection {
            padding-left: 18px;
            padding-right: 18px;
          }
        }

        @media (max-width: 600px) {
          .previewArea {
            min-height: 245px;
            padding: 9px;
          }

          .previewFrame {
            width: 100%;
            border-radius: 9px;
          }

          .timeline {
            height: 76px;
          }

          .sideTools {
            padding-bottom: 8px;
          }
        }
      `}</style>

      <VideoEditorTopBar
        selectedName={selected?.name || ""}
        onBack={() => window.history.back()}
        onAddMedia={() => mediaInputRef.current?.click()}
        onExport={() => {}}
      />

      <section className="workspace">
        <section className="previewArea">
          <div className="previewFrame">
            {selected ? (
              selected.type === "video" ? (
                <video
                  ref={videoRef}
                  src={selected.url}
                  playsInline
                  preload="metadata"
                />
              ) : (
                <img src={selected.url} alt={selected.name} />
              )
            ) : (
              <div className="empty">
                <span className="emptyIcon">＋</span>
                <strong>أضف صورة أو فيديو</strong>
                <span>ابدأ مشروعك من هنا</span>
              </div>
            )}

            {selected && <div className="redGuide" />}

            {selected && (
              <div className="playerControls">
                <button className="play" type="button" onClick={togglePlay}>
                  {playing ? "Ⅱ" : "▶"}
                </button>
                <span className="playerTime">
                  {formatTime(currentTime)} / {formatTime(selected.duration)}
                </span>
              </div>
            )}
          </div>
        </section>

        <VideoToolPanel
          activeTool={activeTool}
          hasSelection={Boolean(selected)}
          onSplit={splitSelectedClip}
          onDelete={() => selected && deleteMedia(selected.id)}
        />
      </section>

      <section className="timelineSection">
        <div className="timelineHeader">
          <strong>المسار الرئيسي</strong>

          <button
            className="addMedia"
            type="button"
            onClick={() => mediaInputRef.current?.click()}
          >
            ＋ صورة / فيديو
          </button>
        </div>

        <div
          ref={timelineRef}
          className="timeline"
          onPointerDown={handleTimelineDown}
          onPointerMove={handleTimelineMove}
          onPointerUp={handleTimelineUp}
          onPointerCancel={handleTimelineUp}
        >
          {media.length ? (
            media.map((item, index) => (
              <div
                key={item.id}
                className={`clip ${selected?.id === item.id ? "selected" : ""} ${draggedId === item.id ? "dragging" : ""}`}
                draggable
                style={{
                  flexGrow: Math.max(1, item.duration),
                  flexBasis: `${Math.max(70, item.duration * 32)}px`,
                }}
                onClick={(event) => {
                  event.stopPropagation();
                  selectMedia(item);
                }}
                onDragStart={() => setDraggedId(item.id)}
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => {
                  event.preventDefault();
                  if (draggedId) moveMedia(draggedId, item.id);
                  setDraggedId(null);
                }}
                onDragEnd={() => setDraggedId(null)}
              >
                {item.type === "video" ? (
                  <video src={item.url} muted preload="metadata" />
                ) : (
                  <img src={item.url} alt="" />
                )}

                <span className="clipName">
                  {index + 1}. {item.name}
                </span>

                {selected?.id === item.id && (
                  <button
                    type="button"
                    className="clipDelete"
                    aria-label="حذف المقطع"
                    onClick={(event) => {
                      event.stopPropagation();
                      deleteMedia(item.id);
                    }}
                  >
                    ×
                  </button>
                )}
              </div>
            ))
          ) : (
            <div className="empty" style={{ width: "100%", paddingTop: 27 }}>
              أضف صورة أو فيديو إلى المسار
            </div>
          )}

          {media.length > 0 && (
            <div
              className="timelineCursor"
              style={{
                right: `${Math.min(100, Math.max(0, progress))}%`,
              }}
            />
          )}
        </div>

        <div className="timelineActions">
          <button
            type="button"
            className="timelineAction"
            disabled={!selected}
            onClick={splitSelectedClip}
          >
            ✂ تقسيم المقطع
          </button>

          <button
            type="button"
            className="timelineAction danger"
            disabled={!selected}
            onClick={() => selected && deleteMedia(selected.id)}
          >
            × حذف المحدد
          </button>
        </div>

        <div className="timelineBottom">
          <span>
            {media.length} عنصر • {formatTime(totalDuration)}
          </span>

          <div className="zoomControls">
            <button type="button" onClick={() => setZoom(Math.max(1, zoom - 0.1))}>
              −
            </button>
            <button type="button" onClick={() => setZoom(Math.min(1.8, zoom + 0.1))}>
              +
            </button>
          </div>
        </div>
      </section>

      <VideoEditorBottomBar
        tools={tools}
        activeTool={activeTool}
        onSelect={setActiveTool}
      />

      <input
        ref={mediaInputRef}
        type="file"
        accept="video/*,image/*"
        multiple
        hidden
        onChange={addMedia}
      />
    </main>
  );
}
