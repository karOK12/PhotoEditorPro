"use client";

import { useEffect, useRef, useState } from "react";

type CropToolProps = {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  onApply: (x: number, y: number, width: number, height: number) => void;
  onCancel: () => void;
};

type Point = {
  x: number;
  y: number;
};

type Selection = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export default function CropTool({
  canvasRef,
  onApply,
  onCancel,
}: CropToolProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selection, setSelection] = useState<Selection | null>(null);
  const [dragging, setDragging] = useState(false);
  const startRef = useRef<Point | null>(null);

  function getCanvasRect() {
    const canvas = canvasRef.current;
    const container = containerRef.current;

    if (!canvas || !container) return null;

    const canvasRect = canvas.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();

    return {
      left: canvasRect.left - containerRect.left,
      top: canvasRect.top - containerRect.top,
      width: canvasRect.width,
      height: canvasRect.height,
    };
  }

  useEffect(() => {
    const updateSelection = () => {
      const rect = getCanvasRect();

      if (!rect) return;

      setSelection({
        x: rect.left,
        y: rect.top,
        width: rect.width,
        height: rect.height,
      });
    };

    updateSelection();

    window.addEventListener("resize", updateSelection);

    return () => {
      window.removeEventListener("resize", updateSelection);
    };
  }, [canvasRef]);

  function getPoint(event: React.PointerEvent) {
    const rect = getCanvasRect();

    if (!rect) return null;

    return {
      x: Math.max(
        rect.left,
        Math.min(event.clientX - containerRef.current!.getBoundingClientRect().left, rect.left + rect.width)
      ),
      y: Math.max(
        rect.top,
        Math.min(event.clientY - containerRef.current!.getBoundingClientRect().top, rect.top + rect.height)
      ),
    };
  }

  function handlePointerDown(event: React.PointerEvent) {
    const point = getPoint(event);

    if (!point) return;

    event.currentTarget.setPointerCapture(event.pointerId);

    startRef.current = point;
    setDragging(true);

    setSelection({
      x: point.x,
      y: point.y,
      width: 0,
      height: 0,
    });
  }

  function handlePointerMove(event: React.PointerEvent) {
    if (!dragging || !startRef.current) return;

    const point = getPoint(event);

    if (!point) return;

    const start = startRef.current;

    setSelection({
      x: Math.min(start.x, point.x),
      y: Math.min(start.y, point.y),
      width: Math.abs(point.x - start.x),
      height: Math.abs(point.y - start.y),
    });
  }

  function handlePointerUp() {
    setDragging(false);
    startRef.current = null;
  }

  function applyCrop() {
    const canvas = canvasRef.current;
    const rect = getCanvasRect();

    if (!canvas || !rect || !selection) return;

    if (selection.width < 10 || selection.height < 10) {
      return;
    }

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = Math.max(
      0,
      Math.round((selection.x - rect.left) * scaleX)
    );

    const y = Math.max(
      0,
      Math.round((selection.y - rect.top) * scaleY)
    );

    const width = Math.min(
      canvas.width - x,
      Math.round(selection.width * scaleX)
    );

    const height = Math.min(
      canvas.height - y,
      Math.round(selection.height * scaleY)
    );

    if (width <= 0 || height <= 0) return;

    onApply(x, y, width, height);
  }

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        width: "100%",
        minHeight: "320px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        borderRadius: "18px",
        background: "#090a0d",
        padding: "12px",
      }}
    >
      <canvas
        ref={(element) => {
          if (!element) return;

          const source = canvasRef.current;

          if (!source) return;

          element.width = source.width;
          element.height = source.height;

          const ctx = element.getContext("2d");

          if (ctx) {
            ctx.drawImage(source, 0, 0);
          }
        }}
        style={{
          maxWidth: "100%",
          maxHeight: "65vh",
          width: "auto",
          height: "auto",
          display: "block",
          borderRadius: "10px",
        }}
      />

      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        style={{
          position: "absolute",
          inset: 0,
          cursor: "crosshair",
          touchAction: "none",
          userSelect: "none",
        }}
      >
        {selection && (
          <div
            style={{
              position: "absolute",
              left: selection.x,
              top: selection.y,
              width: selection.width,
              height: selection.height,
              border: "2px solid #fff",
              boxShadow: "0 0 0 9999px rgba(0,0,0,.55)",
              pointerEvents: "none",
              boxSizing: "border-box",
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                backgroundImage:
                  "linear-gradient(to right, rgba(255,255,255,.35) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,.35) 1px, transparent 1px)",
                backgroundSize: "33.333% 33.333%",
              }}
            />
          </div>
        )}
      </div>

      <div
        style={{
          position: "absolute",
          left: "12px",
          right: "12px",
          bottom: "12px",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "10px",
        }}
      >
        <button
          type="button"
          onClick={onCancel}
          style={{
            height: "48px",
            borderRadius: "13px",
            border: "1px solid rgba(255,255,255,.1)",
            background: "#15171d",
            color: "#fff",
            cursor: "pointer",
            fontWeight: 700,
          }}
        >
          إلغاء
        </button>

        <button
          type="button"
          onClick={applyCrop}
          style={{
            height: "48px",
            borderRadius: "13px",
            border: 0,
            background: "#fff",
            color: "#08090c",
            cursor: "pointer",
            fontWeight: 800,
          }}
        >
          تطبيق القص
        </button>
      </div>
    </div>
  );
}
