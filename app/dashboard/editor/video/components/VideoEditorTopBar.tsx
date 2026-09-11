"use client";

type VideoEditorTopBarProps = {
  selectedName: string;
  onBack: () => void;
  onAddMedia: () => void;
  onExport: () => void;
};

export default function VideoEditorTopBar({
  selectedName,
  onBack,
  onAddMedia,
  onExport,
}: VideoEditorTopBarProps) {
  return (
    <header className="videoEditorTopBar" dir="rtl">
      <button
        type="button"
        className="videoEditorTopButton"
        onClick={onBack}
        aria-label="رجوع"
      >
        ‹
      </button>

      <div className="videoEditorTopTitle">
        <strong>محرر الفيديو</strong>
        <span>{selectedName || "مشروع جديد"}</span>
      </div>

      <div className="videoEditorTopActions">
        <button
          type="button"
          className="videoEditorTopButton"
          onClick={onAddMedia}
          aria-label="إضافة وسائط"
        >
          +
        </button>

        <button
          type="button"
          className="videoEditorExportButton"
          onClick={onExport}
        >
          تصدير
        </button>
      </div>
    </header>
  );
}
