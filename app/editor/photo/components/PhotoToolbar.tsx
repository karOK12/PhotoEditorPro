"use client";

type PhotoToolbarProps = {
  onCrop: () => void;
  onRotateLeft: () => void;
  onRotateRight: () => void;
  onFlipX: () => void;
  onFlipY: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onReset: () => void;
  canUndo: boolean;
  canRedo: boolean;
};

export default function PhotoToolbar({
  onCrop,
  onRotateLeft,
  onRotateRight,
  onFlipX,
  onFlipY,
  onUndo,
  onRedo,
  onReset,
  canUndo,
  canRedo,
}: PhotoToolbarProps) {
  const buttonStyle = {
    flex: "0 0 auto",
    minWidth: "76px",
    height: "46px",
    padding: "0 12px",
    borderRadius: "12px",
    border: "1px solid rgba(255,255,255,.1)",
    background: "#15171d",
    color: "#fff",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: 600,
  } as const;

  const disabledStyle = {
    opacity: 0.35,
    cursor: "not-allowed",
  } as const;

  return (
    <div
      style={{
        display: "flex",
        gap: "8px",
        overflowX: "auto",
        padding: "4px 0",
        scrollbarWidth: "none",
      }}
    >
      <button
        type="button"
        onClick={onUndo}
        disabled={!canUndo}
        style={{
          ...buttonStyle,
          ...(canUndo ? {} : disabledStyle),
        }}
      >
        ↶ تراجع
      </button>

      <button
        type="button"
        onClick={onRedo}
        disabled={!canRedo}
        style={{
          ...buttonStyle,
          ...(canRedo ? {} : disabledStyle),
        }}
      >
        ↷ إعادة
      </button>

      <button type="button" onClick={onCrop} style={buttonStyle}>
        ✂ قص
      </button>

      <button type="button" onClick={onRotateLeft} style={buttonStyle}>
        ↺ يسار
      </button>

      <button type="button" onClick={onRotateRight} style={buttonStyle}>
        ↻ يمين
      </button>

      <button type="button" onClick={onFlipX} style={buttonStyle}>
        ↔ أفقي
      </button>

      <button type="button" onClick={onFlipY} style={buttonStyle}>
        ↕ عمودي
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
