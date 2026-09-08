"use client";

import { ChangeEvent, useEffect, useRef, useState } from "react";

type FilterName = "normal" | "grayscale" | "sepia" | "contrast" | "bright";

const filters: Record<FilterName, string> = {
  normal: "none",
  grayscale: "grayscale(100%)",
  sepia: "sepia(85%)",
  contrast: "contrast(135%)",
  bright: "brightness(125%)",
};

export default function PhotoEditorPage() {
  const inputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterName>("normal");
  const [rotation, setRotation] = useState(0);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [flipX, setFlipX] = useState(false);
  const [flipY, setFlipY] = useState(false);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  function selectImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file || !file.type.startsWith("image/")) return;

    const url = URL.createObjectURL(file);

    const img = new Image();

    img.onload = () => {
      setImage(img);
      setPreviewUrl(url);
      setFilter("normal");
      setBrightness(100);
      setContrast(100);
      setRotation(0);
      setFlipX(false);
      setFlipY(false);
    };

    img.src = url;
  }

  function resetEditor() {
    setFilter("normal");
    setBrightness(100);
    setContrast(100);
    setRotation(0);
    setFlipX(false);
    setFlipY(false);
  }

  function exportImage() {
    if (!image || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const angle = ((rotation % 360) + 360) % 360;

    const rotated =
      angle === 90 || angle === 270;

    canvas.width = rotated ? image.naturalHeight : image.naturalWidth;
    canvas.height = rotated ? image.naturalWidth : image.naturalHeight;

    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    ctx.save();

    ctx.translate(canvas.width / 2, canvas.height / 2);

    ctx.rotate((angle * Math.PI) / 180);

    ctx.scale(flipX ? -1 : 1, flipY ? -1 : 1);

    ctx.filter = [
      filters[filter],
      `brightness(${brightness}%)`,
      `contrast(${contrast}%)`,
    ].join(" ");

    ctx.drawImage(
      image,
      -image.naturalWidth / 2,
      -image.naturalHeight / 2
    );

    ctx.restore();

    const link = document.createElement("a");

    link.download = "photoeditorpro-image.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  return (
    <main
      dir="rtl"
      style={{
        minHeight: "100dvh",
        background:
          "radial-gradient(circle at top right, #172554 0%, #0b1020 35%, #08090c 70%)",
        color: "#fff",
        fontFamily: "Arial, Tahoma, sans-serif",
        paddingBottom: "30px",
      }}
    >
      <header
        style={{
          height: "64px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 16px",
          borderBottom: "1px solid rgba(255,255,255,.08)",
          background: "rgba(8,9,12,.9)",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <strong style={{ fontSize: "19px" }}>تحرير الصور</strong>

        <button
          type="button"
          onClick={() => window.history.back()}
          style={{
            border: "1px solid rgba(255,255,255,.12)",
            background: "rgba(255,255,255,.06)",
            color: "#fff",
            borderRadius: "10px",
            padding: "8px 12px",
            cursor: "pointer",
          }}
        >
          رجوع
        </button>
      </header>

      <section
        style={{
          maxWidth: "1000px",
          margin: "0 auto",
          padding: "20px 16px",
        }}
      >
        {!image ? (
          <div
            style={{
              minHeight: "65vh",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                width: "100%",
                maxWidth: "520px",
                padding: "40px 24px",
                textAlign: "center",
                borderRadius: "24px",
                border: "1px solid rgba(255,255,255,.1)",
                background: "rgba(255,255,255,.05)",
              }}
            >
              <div style={{ fontSize: "56px", marginBottom: "18px" }}>
                🖼️
              </div>

              <h1 style={{ margin: "0 0 10px", fontSize: "28px" }}>
                محرر الصور
              </h1>

              <p
                style={{
                  color: "#94a3b8",
                  fontSize: "14px",
                  lineHeight: 1.8,
                }}
              >
                اختر صورة من هاتفك وابدأ التعديل عليها مباشرة.
              </p>

              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                onChange={selectImage}
                style={{ display: "none" }}
              />

              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                style={{
                  marginTop: "20px",
                  width: "100%",
                  padding: "14px",
                  border: 0,
                  borderRadius: "14px",
                  background: "#2563eb",
                  color: "#fff",
                  fontSize: "16px",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                اختيار صورة من الهاتف
              </button>
            </div>
          </div>
        ) : (
          <>
            <div
              style={{
                borderRadius: "22px",
                padding: "12px",
                background: "rgba(0,0,0,.3)",
                border: "1px solid rgba(255,255,255,.08)",
                display: "flex",
                justifyContent: "center",
                overflow: "hidden",
              }}
            >
              <img
                src={previewUrl || ""}
                alt="الصورة المحددة"
                style={{
                  maxWidth: "100%",
                  maxHeight: "55vh",
                  objectFit: "contain",
                  filter: [
                    filters[filter],
                    `brightness(${brightness}%)`,
                    `contrast(${contrast}%)`,
                  ].join(" "),
                  transform: `rotate(${rotation}deg) scaleX(${
                    flipX ? -1 : 1
                  }) scaleY(${flipY ? -1 : 1})`,
                  borderRadius: "14px",
                }}
              />
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(120px, 1fr))",
                gap: "10px",
                marginTop: "16px",
              }}
            >
              <button
                type="button"
                onClick={() => setRotation((value) => value + 90)}
                style={toolButton}
              >
                ↻ تدوير
              </button>

              <button
                type="button"
                onClick={() => setFlipX((value) => !value)}
                style={toolButton}
              >
                ↔ قلب أفقي
              </button>

              <button
                type="button"
                onClick={() => setFlipY((value) => !value)}
                style={toolButton}
              >
                ↕ قلب عمودي
              </button>

              <button
                type="button"
                onClick={resetEditor}
                style={toolButton}
              >
                إعادة ضبط
              </button>
            </div>

            <div
              style={{
                marginTop: "18px",
                padding: "18px",
                borderRadius: "18px",
                background: "rgba(255,255,255,.05)",
                border: "1px solid rgba(255,255,255,.08)",
              }}
            >
              <label style={labelStyle}>
                السطوع: {brightness}%
                <input
                  type="range"
                  min="50"
                  max="160"
                  value={brightness}
                  onChange={(e) =>
                    setBrightness(Number(e.target.value))
                  }
                  style={{ width: "100%", marginTop: "10px" }}
                />
              </label>

              <label style={{ ...labelStyle, marginTop: "18px" }}>
                التباين: {contrast}%
                <input
                  type="range"
                  min="50"
                  max="160"
                  value={contrast}
                  onChange={(e) =>
                    setContrast(Number(e.target.value))
                  }
                  style={{ width: "100%", marginTop: "10px" }}
                />
              </label>
            </div>

            <div
              style={{
                display: "flex",
                gap: "8px",
                overflowX: "auto",
                marginTop: "18px",
                paddingBottom: "5px",
              }}
            >
              {(Object.keys(filters) as FilterName[]).map((name) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => setFilter(name)}
                  style={{
                    ...toolButton,
                    minWidth: "100px",
                    border:
                      filter === name
                        ? "1px solid #3b82f6"
                        : "1px solid rgba(255,255,255,.1)",
                  }}
                >
                  {name === "normal" && "عادي"}
                  {name === "grayscale" && "أبيض وأسود"}
                  {name === "sepia" && "سيبيا"}
                  {name === "contrast" && "تباين"}
                  {name === "bright" && "إضاءة"}
                </button>
              ))}
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "10px",
                marginTop: "18px",
              }}
            >
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                style={toolButton}
              >
                اختيار صورة أخرى
              </button>

              <button
                type="button"
                onClick={exportImage}
                style={{
                  ...toolButton,
                  background: "#2563eb",
                  border: "1px solid #3b82f6",
                }}
              >
                حفظ الصورة
              </button>
            </div>

            <canvas ref={canvasRef} style={{ display: "none" }} />

            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              onChange={selectImage}
              style={{ display: "none" }}
            />
          </>
        )}
      </section>
    </main>
  );
}

const toolButton: React.CSSProperties = {
  padding: "12px",
  borderRadius: "12px",
  border: "1px solid rgba(255,255,255,.1)",
  background: "rgba(255,255,255,.06)",
  color: "#fff",
  cursor: "pointer",
  fontSize: "13px",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  color: "#e2e8f0",
  fontSize: "14px",
};
