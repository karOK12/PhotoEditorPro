"use client";

type ToolId =
  | "crop"
  | "resize"
  | "rotate"
  | "adjust"
  | "filters"
  | "enhance";

type PhotoToolbarProps = {
  activeTool: ToolId | null;
  onToolChange: (tool: ToolId) => void;
  onUndo: () => void;
  onRedo: () => void;
  onReset: () => void;
  canUndo: boolean;
  canRedo: boolean;
};

const tools: { id: ToolId; label: string; icon: string }[] = [
  { id: "crop", label: "قص", icon: "✂" },
  { id: "resize", label: "الحجم", icon: "↗" },
  { id: "rotate", label: "تدوير", icon: "↻" },
  { id: "adjust", label: "ضبط", icon: "◐" },
  { id: "filters", label: "فلاتر", icon: "◉" },
  { id: "enhance", label: "تحسين", icon: "✦" },
];

export default function PhotoToolbar({
  activeTool,
  onToolChange,
  onUndo,
  onRedo,
  onReset,
  canUndo,
  canRedo,
}: PhotoToolbarProps) {
  return (
    <section
      style={{
        position: "sticky",
        top: "64px",
        zIndex: 19,
        background: "rgba(8,9,12,.96)",
        borderBottom: "1px solid rgba(255,255,255,.08)",
        borderRadius: "0 0 18px 18px",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "stretch",
          gap: "6px",
          overflowX: "auto",
          padding: "8px",
          WebkitOverflowScrolling: "touch",
          scrollbarWidth: "none",
        }}
      >
        {tools.map((tool) => {
          const active = activeTool === tool.id;

          return (
            <button
              key={tool.id}
              type="button"
              onClick={() => onToolChange(tool.id)}
              style={{
                flex: "0 0 72px",
                height: "62px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "5px",
                borderRadius: "13px",
                border: active
                  ? "1px solid rgba(255,255,255,.45)"
                  : "1px solid rgba(255,255,255,.08)",
                background: active ? "#252932" : "#121419",
                color: "#fff",
                cursor: "pointer",
                fontSize: "12px",
                fontWeight: active ? 800 : 600,
              }}
            >
              <span style={{ fontSize: "20px", lineHeight: 1 }}>
                {tool.icon}
              </span>
              <span>{tool.label}</span>
            </button>
          );
        })}

        <button
          type="button"
          onClick={onUndo}
          disabled={!canUndo}
          style={{
            flex: "0 0 72px",
            height: "62px",
            borderRadius: "13px",
            border: "1px solid rgba(255,255,255,.08)",
            background: "#121419",
            color: "#fff",
            opacity: canUndo ? 1 : 0.35,
            cursor: canUndo ? "pointer" : "not-allowed",
            fontSize: "12px",
            fontWeight: 600,
          }}
        >
          <span style={{ display: "block", fontSize: "20px" }}>↶</span>
          تراجع
        </button>

        <button
          type="button"
          onClick={onRedo}
          disabled={!canRedo}
          style={{
            flex: "0 0 72px",
            height: "62px",
            borderRadius: "13px",
            border: "1px solid rgba(255,255,255,.08)",
            background: "#121419",
            color: "#fff",
            opacity: canRedo ? 1 : 0.35,
            cursor: canRedo ? "pointer" : "not-allowed",
            fontSize: "12px",
            fontWeight: 600,
          }}
        >
          <span style={{ display: "block", fontSize: "20px" }}>↷</span>
          إعادة
        </button>

        <button
          type="button"
          onClick={onReset}
          style={{
            flex: "0 0 72px",
            height: "62px",
            borderRadius: "13px",
            border: "1px solid rgba(255,255,255,.08)",
            background: "#242832",
            color: "#fff",
            cursor: "pointer",
            fontSize: "12px",
            fontWeight: 700,
          }}
        >
          <span style={{ display: "block", fontSize: "20px" }}>↺</span>
          ضبط
        </button>
      </div>
    </section>
  );
}
