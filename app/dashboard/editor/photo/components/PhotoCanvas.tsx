"use client";

import { useEffect } from "react";

type PhotoCanvasProps = {
  imageUrl: string | null;
  brightness: number;
  contrast: number;
  saturation: number;
  temperature: number;
  rotation: number;
  flipX: boolean;
  flipY: boolean;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
};

export default function PhotoCanvas({
  imageUrl,
  brightness,
  contrast,
  saturation,
  temperature,
  rotation,
  flipX,
  flipY,
  canvasRef,
}: PhotoCanvasProps) {
  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas || !imageUrl) return;

    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    const image = new Image();

    image.onload = () => {
      const rotated = rotation % 180 !== 0;

      canvas.width = rotated ? image.height : image.width;
      canvas.height = rotated ? image.width : image.height;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.save();

      ctx.translate(canvas.width / 2, canvas.height / 2);

      ctx.rotate((rotation * Math.PI) / 180);

      ctx.scale(
        flipX ? -1 : 1,
        flipY ? -1 : 1
      );

      const temperatureFilter =
        temperature > 0
          ? `sepia(${temperature * 0.35}%) saturate(${100 + temperature * 0.15}%)`
          : temperature < 0
            ? `hue-rotate(${temperature * 0.35}deg) saturate(${100 + Math.abs(temperature) * 0.08}%)`
            : "";

      ctx.filter = `
        brightness(${brightness}%)
        contrast(${contrast}%)
        saturate(${saturation}%)
        ${temperatureFilter}
      `;

      ctx.drawImage(
        image,
        -image.width / 2,
        -image.height / 2,
        image.width,
        image.height
      );

      ctx.restore();
    };

    image.src = imageUrl;
  }, [
    imageUrl,
    brightness,
    contrast,
    saturation,
    temperature,
    rotation,
    flipX,
    flipY,
    canvasRef,
  ]);

  if (!imageUrl) {
    return (
      <div
        style={{
          width: "100%",
          minHeight: "320px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "18px",
          border: "1px dashed rgba(255,255,255,.18)",
          background: "#111318",
          color: "#94a3b8",
          textAlign: "center",
          padding: "30px",
        }}
      >
        اختر صورة للبدء بالتعديل
      </div>
    );
  }

  return (
    <div
      style={{
        width: "100%",
        minHeight: "320px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "auto",
        borderRadius: "18px",
        background: "#090a0d",
        padding: "12px",
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          maxWidth: "100%",
          maxHeight: "65vh",
          width: "auto",
          height: "auto",
          display: "block",
          borderRadius: "10px",
        }}
      />
    </div>
  );
}
