"use client";

import { ChangeEvent, PointerEvent, useEffect, useRef, useState } from "react";

type Thumbnail = {
  time: number;
  url: string;
};

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds)) return "00:00";
  const total = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(total / 60);
  const secs = total % 60;
  return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

export default function VideoEditorPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [videoUrl, setVideoUrl] = useState("");
  const [videoName, setVideoName] = useState("");
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [thumbnails, setThumbnails] = useState<Thumbnail[]>([]);
  const [dragging, setDragging] = useState(false);
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(0);
  const [splitPoints, setSplitPoints] = useState<number[]>([]);
  const [trimDragging, setTrimDragging] = useState<"start" | "end" | null>(null);

  useEffect(() => {
    return () => {
      if (videoUrl) URL.revokeObjectURL(videoUrl);
      thumbnails.forEach((item) => URL.revokeObjectURL(item.url));
    };
  }, [videoUrl, thumbnails]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onTimeUpdate = () => setCurrentTime(video.currentTime);
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onEnded = () => {
      setPlaying(false);
      setCurrentTime(video.duration || 0);
    };

    video.addEventListener("timeupdate", onTimeUpdate);
    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);
    video.addEventListener("ended", onEnded);

    return () => {
      video.removeEventListener("timeupdate", onTimeUpdate);
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
      video.removeEventListener("ended", onEnded);
    };
  }, [videoUrl]);

  const generateThumbnails = async (video: HTMLVideoElement) => {
    const length = video.duration;

    if (!Number.isFinite(length) || length <= 0) return;

    const count = Math.min(18, Math.max(8, Math.ceil(length / 2)));
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    if (!context) return;

    canvas.width = 180;
    canvas.height = 102;

    const generated: Thumbnail[] = [];

    for (let index = 0; index < count; index++) {
      const time = Math.min(
        length - 0.05,
        (length * index) / Math.max(1, count - 1)
      );

      await new Promise<void>((resolve) => {
        const handleSeeked = () => {
          video.removeEventListener("seeked", handleSeeked);

          context.drawImage(
            video,
            0,
            0,
            canvas.width,
            canvas.height
          );

          generated.push({
            time,
            url: canvas.toDataURL("image/jpeg", 0.72),
          });

          resolve();
        };

        video.addEventListener("seeked", handleSeeked);
        video.currentTime = time;
      });
    }

    video.currentTime = 0;
    setThumbnails(generated);
  };

  const handleVideoLoaded = async () => {
    const video = videoRef.current;
    if (!video) return;

    const videoDuration = video.duration || 0;
    setDuration(videoDuration);
    setTrimStart(0);
    setTrimEnd(videoDuration);
    setSplitPoints([]);
    await generateThumbnails(video);
  };

  const handleFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("video/")) return;

    if (videoUrl) URL.revokeObjectURL(videoUrl);
    thumbnails.forEach((item) => URL.revokeObjectURL(item.url));

    const url = URL.createObjectURL(file);

    setVideoUrl(url);
    setVideoName(file.name);
    setDuration(0);
    setCurrentTime(0);
    setPlaying(false);
    setTrimStart(0);
    setTrimEnd(0);
    setSplitPoints([]);
    setThumbnails([]);
  };

  const togglePlayback = async () => {
    const video = videoRef.current;
    if (!video || !videoUrl) return;

    if (video.paused) {
      await video.play();
    } else {
      video.pause();
    }
  };

  const seekToPosition = (clientX: number) => {
    const timeline = timelineRef.current;
    const video = videoRef.current;

    if (!timeline || !video || !duration) return;

    const rect = timeline.getBoundingClientRect();
    const position = Math.min(
      1,
      Math.max(0, (clientX - rect.left) / rect.width)
    );

    const nextTime = position * duration;
    video.currentTime = Math.min(trimEnd || duration, Math.max(trimStart, nextTime));
    setCurrentTime(video.currentTime);
  };

  const handleTimelinePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (!videoUrl) return;

    setDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
    seekToPosition(event.clientX);
  };

  const handleTimelinePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!dragging) return;
    seekToPosition(event.clientX);
  };

  const handleTimelinePointerUp = () => {
    setDragging(false);
    setTrimDragging(null);
  };

  const handleTrimPointerDown = (
    event: PointerEvent<HTMLDivElement>,
    side: "start" | "end"
  ) => {
    if (!videoUrl || !duration) return;

    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    setTrimDragging(side);
  };

  const handleTrimPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!trimDragging || !duration || !timelineRef.current) return;

    const rect = timelineRef.current.getBoundingClientRect();
    const position = Math.min(
      1,
      Math.max(0, (event.clientX - rect.left) / rect.width)
    );
    const time = position * duration;

    if (trimDragging === "start") {
      const nextStart = Math.min(time, trimEnd - 0.05);
      setTrimStart(Math.max(0, nextStart));

      if (videoRef.current) {
        videoRef.current.currentTime = Math.max(
          0,
          Math.min(videoRef.current.currentTime, nextStart)
        );
      }
    } else {
      const nextEnd = Math.max(time, trimStart + 0.05);
      setTrimEnd(Math.min(duration, nextEnd));

      if (videoRef.current) {
        videoRef.current.currentTime = Math.min(
          videoRef.current.currentTime,
          nextEnd
        );
      }
    }
  };

  const progress = duration ? (currentTime / duration) * 100 : 0;
  const trimStartPercent = duration ? (trimStart / duration) * 100 : 0;
  const trimEndPercent = duration ? (trimEnd / duration) * 100 : 100;

  const splitClip = () => {
    if (!videoUrl || !duration) return;

    const point = Math.min(trimEnd, Math.max(trimStart, currentTime));

    if (
      point <= trimStart + 0.05 ||
      point >= trimEnd - 0.05 ||
      splitPoints.some((item) => Math.abs(item - point) < 0.05)
    ) {
      return;
    }

    setSplitPoints((items) =>
      [...items, point].sort((a, b) => a - b)
    );
  };

  const deleteSelectedSection = () => {
    if (!videoUrl || !duration) return;

    const video = videoRef.current;
    if (!video) return;

    const point = Math.min(trimEnd, Math.max(trimStart, currentTime));

    if (point <= trimStart + 0.05 || point >= trimEnd - 0.05) {
      return;
    }

    const leftDistance = point - trimStart;
    const rightDistance = trimEnd - point;

    if (leftDistance >= rightDistance) {
      setTrimEnd(point);
      video.currentTime = Math.min(video.currentTime, point);
      setCurrentTime(video.currentTime);
    } else {
      setTrimStart(point);
      video.currentTime = point;
      setCurrentTime(point);
    }
  };

  const duplicateClip = () => {
    if (!videoUrl || !duration) return;
    alert("تم تجهيز المقطع للتكرار. سيتم ربط التكرار الحقيقي عند إضافة نظام المقاطع المتعددة.");
  };

  return (
    <main dir="rtl" className="video-editor">
      <style jsx>{`
        .video-editor {
          min-height: 100dvh;
          background:
            radial-gradient(circle at 50% -20%, #20242d 0%, transparent 45%),
            #08090c;
          color: #fff;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .topbar {
          height: 64px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 14px;
          border-bottom: 1px solid #242730;
          background: rgba(12, 13, 17, 0.96);
          backdrop-filter: blur(16px);
        }

        .topbar-right,
        .topbar-left {
          display: flex;
          align-items: center;
          gap: 9px;
        }

        .back-button,
        .export-button,
        .icon-button {
          border: 0;
          cursor: pointer;
          color: #fff;
          border-radius: 10px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .back-button,
        .icon-button {
          width: 40px;
          background: #181a20;
          border: 1px solid #2a2d35;
          font-size: 19px;
        }

        .export-button {
          padding: 0 17px;
          background: #fff;
          color: #08090c;
          font-weight: 800;
          font-size: 14px;
        }

        .title {
          display: flex;
          flex-direction: column;
          gap: 2px;
          margin-right: 2px;
        }

        .title strong {
          font-size: 15px;
        }

        .title span {
          color: #8d929e;
          font-size: 11px;
          max-width: 150px;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
        }

        .preview-section {
          flex: 1;
          min-height: 0;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 16px 12px 10px;
        }

        .preview {
          width: min(100%, 900px);
          margin: 0 auto;
          aspect-ratio: 16 / 9;
          background: #030405;
          border: 1px solid #252830;
          border-radius: 14px;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.35);
        }

        .preview video {
          width: 100%;
          height: 100%;
          object-fit: contain;
          display: block;
        }

        .empty-preview {
          text-align: center;
          color: #747985;
        }

        .empty-preview .video-icon {
          font-size: 42px;
          margin-bottom: 8px;
          display: block;
        }

        .empty-preview strong {
          color: #b9bdc7;
          display: block;
          margin-bottom: 5px;
        }

        .empty-preview span {
          font-size: 12px;
        }

        .controls {
          width: min(100%, 900px);
          margin: 10px auto 0;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 14px;
        }

        .play-button {
          width: 46px;
          height: 46px;
          border: 0;
          border-radius: 50%;
          background: #fff;
          color: #08090c;
          font-size: 20px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .time {
          color: #b7bbc5;
          font-variant-numeric: tabular-nums;
          font-size: 13px;
          direction: ltr;
          min-width: 105px;
          text-align: center;
        }

        .timeline-panel {
          flex-shrink: 0;
          background: #0d0f13;
          border-top: 1px solid #242730;
          padding: 10px 12px 14px;
        }

        .timeline-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 8px;
          color: #8e939e;
          font-size: 11px;
        }

        .timeline-head strong {
          color: #cdd0d8;
          font-size: 12px;
        }

        .timeline {
          width: 100%;
          max-width: 1100px;
          margin: 0 auto;
          height: 88px;
          border: 1px solid #2a2d35;
          border-radius: 9px;
          background: #07080b;
          position: relative;
          overflow: hidden;
          touch-action: none;
          user-select: none;
        }

        .thumbnail-track {
          height: 100%;
          display: flex;
          direction: ltr;
        }

        .thumbnail {
          height: 100%;
          min-width: 0;
          flex: 1;
          object-fit: cover;
          border-right: 1px solid rgba(255, 255, 255, 0.12);
          pointer-events: none;
        }

        .empty-timeline {
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #626772;
          font-size: 12px;
        }

        .playhead {
          position: absolute;
          top: 0;
          bottom: 0;
          width: 2px;
          background: #fff;
          box-shadow: 0 0 8px rgba(255, 255, 255, 0.65);
          transform: translateX(-1px);
          pointer-events: none;
          z-index: 3;
        }

        .playhead::before {
          content: "";
          position: absolute;
          top: -1px;
          left: 50%;
          transform: translateX(-50%);
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #fff;
        }

        .clip-border {
          position: absolute;
          top: 0;
          bottom: 0;
          border: 2px solid #fff;
          border-radius: 8px;
          pointer-events: none;
          z-index: 2;
        }

        .trim-mask {
          position: absolute;
          top: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.62);
          pointer-events: none;
          z-index: 1;
        }

        .trim-handle {
          position: absolute;
          top: 0;
          bottom: 0;
          width: 10px;
          background: #fff;
          border-radius: 5px;
          z-index: 4;
          cursor: ew-resize;
          box-shadow: 0 0 10px rgba(255, 255, 255, 0.45);
        }

        .trim-handle::after {
          content: "";
          position: absolute;
          top: 50%;
          left: 50%;
          width: 3px;
          height: 28px;
          border-radius: 3px;
          background: #111;
          transform: translate(-50%, -50%);
        }

        .split-marker {
          position: absolute;
          top: 0;
          bottom: 0;
          width: 2px;
          background: #ff3b30;
          z-index: 3;
          pointer-events: none;
        }

        .tools {
          max-width: 1100px;
          margin: 10px auto 0;
          display: flex;
          align-items: center;
          gap: 8px;
          overflow-x: auto;
          scrollbar-width: none;
        }

        .tools::-webkit-scrollbar {
          display: none;
        }

        .tool {
          flex: 0 0 auto;
          border: 1px solid #292c34;
          background: #171920;
          color: #cdd0d8;
          border-radius: 9px;
          padding: 8px 12px;
          font-size: 12px;
        }

        .add-video {
          flex: 0 0 auto;
          border: 1px dashed #3a3e48;
          background: transparent;
          color: #aeb3be;
          border-radius: 9px;
          padding: 8px 13px;
          font-size: 12px;
          cursor: pointer;
        }

        .add-video:hover,
        .tool:hover,
        .back-button:hover,
        .icon-button:hover {
          background: #20232b;
        }

        @media (max-width: 600px) {
          .topbar {
            height: 58px;
            padding: 0 10px;
          }

          .export-button {
            height: 38px;
            padding: 0 14px;
          }

          .title strong {
            font-size: 14px;
          }

          .preview-section {
            padding: 12px 8px 8px;
          }

          .preview {
            border-radius: 10px;
          }

          .timeline-panel {
            padding: 9px 8px 12px;
          }

          .timeline {
            height: 76px;
          }

          .tools {
            margin-top: 8px;
          }
        }
      `}</style>

      <header className="topbar">
        <div className="topbar-right">
          <button
            className="back-button"
            type="button"
            aria-label="رجوع"
            onClick={() => window.history.back()}
          >
            →
          </button>

          <div className="title">
            <strong>محرر الفيديو</strong>
            {videoName && <span>{videoName}</span>}
          </div>
        </div>

        <div className="topbar-left">
          <button
            className="icon-button"
            type="button"
            aria-label="إضافة فيديو"
            onClick={() => fileInputRef.current?.click()}
          >
            +
          </button>

          <button
            className="export-button"
            type="button"
            onClick={() => {
              if (!videoUrl) return;
              alert("سيتم ربط التصدير الفعلي بعد اكتمال أدوات المونتاج.");
            }}
          >
            تصدير
          </button>
        </div>
      </header>

      <section className="preview-section">
        <div className="preview">
          {videoUrl ? (
            <video
              ref={videoRef}
              src={videoUrl}
              playsInline
              preload="metadata"
              onLoadedMetadata={handleVideoLoaded}
            />
          ) : (
            <div className="empty-preview">
              <span className="video-icon">▣</span>
              <strong>أضف فيديو للبدء</strong>
              <span>سيظهر الفيديو هنا مع شريط المونتاج أسفل الشاشة</span>
            </div>
          )}
        </div>

        <div className="controls">
          <button
            className="play-button"
            type="button"
            onClick={togglePlayback}
            disabled={!videoUrl}
            aria-label={playing ? "إيقاف" : "تشغيل"}
          >
            {playing ? "Ⅱ" : "▶"}
          </button>

          <div className="time">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>
        </div>
      </section>

      <section className="timeline-panel">
        <div className="timeline-head">
          <strong>Timeline</strong>
          <span>{videoUrl ? "اسحب المؤشر لفحص الفيديو" : "أضف فيديو لإنشاء المسار"}</span>
        </div>

        <div
          ref={timelineRef}
          className="timeline"
          onPointerDown={handleTimelinePointerDown}
          onPointerMove={(event) => {
            handleTimelinePointerMove(event);
            handleTrimPointerMove(event);
          }}
          onPointerUp={handleTimelinePointerUp}
          onPointerCancel={handleTimelinePointerUp}
        >
          {thumbnails.length > 0 ? (
            <>
              <div className="thumbnail-track">
                {thumbnails.map((thumbnail, index) => (
                  <img
                    key={`${thumbnail.time}-${index}`}
                    className="thumbnail"
                    src={thumbnail.url}
                    alt=""
                    draggable={false}
                  />
                ))}
              </div>

              <div
                className="trim-mask"
                style={{
                  left: 0,
                  width: `${trimStartPercent}%`,
                }}
              />

              <div
                className="trim-mask"
                style={{
                  left: `${trimEndPercent}%`,
                  right: 0,
                }}
              />

              <div
                className="clip-border"
                style={{
                  left: `${trimStartPercent}%`,
                  right: `${100 - trimEndPercent}%`,
                }}
              />

              {splitPoints.map((point) => (
                <div
                  key={point}
                  className="split-marker"
                  style={{
                    left: `${(point / duration) * 100}%`,
                  }}
                />
              ))}

              <div
                className="trim-handle"
                style={{ left: `calc(${trimStartPercent}% - 5px)` }}
                onPointerDown={(event) =>
                  handleTrimPointerDown(event, "start")
                }
              />

              <div
                className="trim-handle"
                style={{ left: `calc(${trimEndPercent}% - 5px)` }}
                onPointerDown={(event) =>
                  handleTrimPointerDown(event, "end")
                }
              />

              <div
                className="playhead"
                style={{
                  left: `${progress}%`,
                }}
              />
            </>
          ) : (
            <div className="empty-timeline">
              {videoUrl ? "جارٍ تجهيز إطارات الفيديو..." : "مسار الفيديو سيظهر هنا"}
            </div>
          )}
        </div>

        <div className="tools">
          <button
            className="add-video"
            type="button"
            onClick={() => fileInputRef.current?.click()}
          >
            ＋ إضافة فيديو
          </button>

          <button
            className="tool"
            type="button"
            onClick={() => {
              if (!videoUrl || !videoRef.current) return;
              setTrimStart(currentTime);
            }}
          >
            ✂ قص من هنا
          </button>

          <button
            className="tool"
            type="button"
            onClick={splitClip}
          >
            ⌁ تقسيم
          </button>

          <button
            className="tool"
            type="button"
            onClick={deleteSelectedSection}
          >
            ⌫ حذف
          </button>

          <button
            className="tool"
            type="button"
            onClick={duplicateClip}
          >
            ↻ تكرار
          </button>
          <button className="tool" type="button">♫ صوت</button>
          <button className="tool" type="button">T نص</button>
        </div>
      </section>

      <input
        ref={fileInputRef}
        type="file"
        accept="video/*"
        hidden
        onChange={handleFile}
      />
    </main>
  );
}
