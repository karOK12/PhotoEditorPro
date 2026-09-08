"use client";

type PhotoToolbarProps = {
  onRotate: () => void;
  onFlipX: () => void;
  onFlipY: () => void;
  onReset: () => void;
};

export default function PhotoToolbar({
  onRotate,
  onFlipX,
  onFlipY,
  onReset,
}: PhotoToolbarProps) {
  const buttonStyle = {
    minWidth: "72px",
    height: "46px",
    padding: "0 12px",
    borderRadius: "12px",
    border: "1px solid rgba(255,255,255,.1)",
    background: "#15171d",
    color: "#fff",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: 600,
  };

  return (
    <div
      style={{
        display: "flex",
        gap: "8px",
        overflowX: "auto",
        padding: "4px 0",
      }}
    >
      <button type="button" onClick={onRotate} style={buttonStyle}>
        ↻ تدوير
      </button>

      <button type="button" onClick={onFlipX} style={buttonStyle}>
        ↔ قلب أفقي
      </button>

      <button type="button" onClick={onFlipY} style={buttonStyle}>
        ↕ قلب عمودي
      </button>

      <button
        type="button"
        onClick={onReset}
        style={{
          ...buttonStyle,
          background: "#242832",
        }}
      >
        إعادة ضبط
      </button>
    </div>
  );
}
