"use client";

type Props = {
  tools: string[][];
  activeTool: string;
  onSelect: (tool: string) => void;
};

export default function VideoEditorBottomBar({
  tools,
  activeTool,
  onSelect,
}: Props) {
  return (
    <nav className="videoEditorBottomBar" dir="rtl">
      <div className="videoEditorBottomScroller">
        {tools.map(([icon, label]) => (
          <button
            key={label}
            type="button"
            className={`videoEditorBottomItem ${
              activeTool === label ? "active" : ""
            }`}
            onClick={() => onSelect(label)}
          >
            <span className="videoEditorBottomIcon">{icon}</span>
            <span>{label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
