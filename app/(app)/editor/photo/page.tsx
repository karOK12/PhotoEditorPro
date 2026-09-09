"use client";

import { ChangeEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import PhotoCanvas from "./components/PhotoCanvas";
import PhotoToolbar from "./components/PhotoToolbar";
import Adjustments from "./components/Adjustments";
import Filters from "./components/Filters";
import CropTool from "./components/CropTool";

type FilterName =
  | "normal"
  | "grayscale"
  | "sepia"
  | "warm"
  | "cool"
  | "highContrast";

const filterMap: Record<FilterName, string> = {
  normal: "",
  grayscale: "grayscale(100%)",
  sepia: "sepia(85%)",
  warm: "sepia(25%) saturate(125%)",
  cool: "saturate(90%) hue-rotate(12deg)",
  highContrast: "contrast(135%) saturate(115%)",
};

export default function PhotoEditorPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [flipX, setFlipX] = useState(false);
  const [flipY, setFlipY] = useState(false);
  const [activeFilter, setActiveFilter] =
    useState<FilterName>("normal");
  const [cropMode, setCropMode] = useState(false);

  useEffect(() => {
    return () => {
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [imageUrl]);

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("يرجى اختيار صورة فقط");
      return;
    }

    if (imageUrl) {
      URL.revokeObjectURL(imageUrl);
    }

    setImageUrl(URL.createObjectURL(file));

    setBrightness(100);
    setContrast(100);
    setSaturation(100);
    setRotation(0);
    setFlipX(false);
    setFlipY(false);
    setActiveFilter("normal");
  }

  function resetEditor() {
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
    setRotation(0);
    setFlipX(false);
    setFlipY(false);
    setActiveFilter("normal");
  }

  function rotateLeft() {
    setRotation((value) => (value - 90 + 360) % 360);
  }

  function rotateRight() {
    setRotation((value) => (value + 90) % 360);
  }

  function flipHorizontal() {
    setFlipX((value) => !value);
  }

  function flipVertical() {
    setFlipY((value) => !value);
  }

  function openFilePicker() {
    fileInputRef.current?.click();
  }

  function applyCrop(
    x: number,
    y: number,
    width: number,
    height: number
  ) {
    const canvas = canvasRef.current;

    if (!canvas || width <= 0 || height <= 0) return;

    const croppedCanvas = document.createElement("canvas");

    croppedCanvas.width = width;
    croppedCanvas.height = height;

    const ctx = croppedCanvas.getContext("2d");

    if (!ctx) return;

    ctx.drawImage(
      canvas,
      x,
      y,
      width,
      height,
      0,
      0,
      width,
      height
    );

    croppedCanvas.toBlob((blob) => {
      if (!blob) return;

      const newUrl = URL.createObjectURL(blob);

      setImageUrl((oldUrl) => {
        if (oldUrl) {
          URL.revokeObjectURL(oldUrl);
        }

        return newUrl;
      });

      setRotation(0);
      setFlipX(false);
      setFlipY(false);
      setCropMode(false);
    }, "image/png");
  }

  function exportImage() {
    if (!imageUrl) {
      alert("اختر صورة أولاً");
      return;
    }

    const image = new Image();

    image.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      if (!ctx) return;

      const rotated = rotation % 180 !== 0;

      canvas.width = rotated ? image.height : image.width;
      canvas.height = rotated ? image.width : image.height;

      ctx.save();

      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.scale(flipX ? -1 : 1, flipY ? -1 : 1);

      ctx.filter = `
        brightness(${brightness}%)
        contrast(${contrast}%)
        saturate(${saturation}%)
        ${filterMap[activeFilter]}
      `;

      ctx.drawImage(
        image,
        -image.width / 2,
        -image.height / 2,
        image.width,
        image.height
      );

      ctx.restore();

      canvas.toBlob((blob) => {
        if (!blob) return;

        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = url;
        link.download = "photoeditorpro-image.png";
        link.click();

        URL.revokeObjectURL(url);
      }, "image/png");
    };

    image.src = imageUrl;
  }

  return (
    <main
      dir="rtl"
      style={{
        minHeight: "100vh",
        background: "#08090c",
        color: "#fff",
        paddingBottom: "30px",
      }}
    >
      <header
        style={{
          height: "64px",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          padding: "0 16px",
          borderBottom: "1px solid rgba(255,255,255,.08)",
          background: "rgba(8,9,12,.92)",
          position: "sticky",
          top: 0,
          zIndex: 20,
        }}
      >
        <button
          type="button"
          onClick={() => router.back()}
          style={{
            width: "42px",
            height: "42px",
            borderRadius: "12px",
            border: "1px solid rgba(255,255,255,.1)",
            background: "#15171d",
            color: "#fff",
            cursor: "pointer",
            fontSize: "20px",
          }}
        >
          →
        </button>

        <strong style={{ fontSize: "18px" }}>
          تحرير الصور
        </strong>
      </header>

      <div
        style={{
          width: "100%",
          maxWidth: "1000px",
          margin: "0 auto",
          padding: "16px",
          display: "grid",
          gap: "14px",
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          style={{ display: "none" }}
        />

        {!imageUrl ? (
          <button
            type="button"
            onClick={openFilePicker}
            style={{
              minHeight: "180px",
              borderRadius: "20px",
              border: "1px dashed rgba(255,255,255,.2)",
              background: "#111318",
              color: "#fff",
              cursor: "pointer",
              fontSize: "16px",
              fontWeight: 700,
            }}
          >
            + اختر صورة من الهاتف
          </button>
        ) : (
          <>
            <div
              style={{
                position: "relative",
              }}
            >
              <PhotoCanvas
                imageUrl={imageUrl}
                canvasRef={canvasRef}
                brightness={brightness}
                contrast={contrast}
                saturation={saturation}
                rotation={rotation}
                flipX={flipX}
                flipY={flipY}
              />

              {cropMode && (
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    zIndex: 10,
                  }}
                >
                  <CropTool
                    canvasRef={canvasRef}
                    onApply={applyCrop}
                    onCancel={() => setCropMode(false)}
                  />
                </div>
              )}
            </div>

            <PhotoToolbar
              activeTool={null}
              onToolChange={() => {}}
              onUndo={() => {}}
              onRedo={() => {}}
              onReset={resetEditor}
              canUndo={false}
              canRedo={false}
            />

            <Adjustments
              brightness={brightness}
              contrast={contrast}
              saturation={saturation}
              onBrightnessChange={setBrightness}
              onContrastChange={setContrast}
              onSaturationChange={setSaturation}
            />

            <section
              style={{
                display: "grid",
                gap: "10px",
                padding: "16px",
                borderRadius: "18px",
                background: "#111318",
                border: "1px solid rgba(255,255,255,.08)",
              }}
            >
              <strong style={{ fontSize: "14px" }}>
                الفلاتر
              </strong>

              <Filters
                activeFilter={activeFilter}
                onFilterChange={setActiveFilter}
              />
            </section>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "10px",
              }}
            >
              <button
                type="button"
                onClick={openFilePicker}
                style={{
                  height: "50px",
                  borderRadius: "14px",
                  border: "1px solid rgba(255,255,255,.1)",
                  background: "#15171d",
                  color: "#fff",
                  cursor: "pointer",
                  fontWeight: 700,
                }}
              >
                تغيير الصورة
              </button>

              <button
                type="button"
                onClick={exportImage}
                style={{
                  height: "50px",
                  borderRadius: "14px",
                  border: 0,
                  background: "#fff",
                  color: "#08090c",
                  cursor: "pointer",
                  fontWeight: 800,
                }}
              >
                تصدير PNG
              </button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
