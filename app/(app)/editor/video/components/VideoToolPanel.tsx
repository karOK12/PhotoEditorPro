"use client";

type VideoToolPanelProps = {
  activeTool: string;
  onSplit: () => void;
  onDelete: () => void;
  hasSelection: boolean;
};

const panels: Record<string, { title: string; subtitle: string; items: { icon: string; label: string; tone: string }[] }> = {
  "تحرير": {
    title: "تحرير المقطع",
    subtitle: "قص وترتيب وتعديل المقطع المحدد",
    items: [
      { icon: "✂", label: "تقسيم", tone: "violet" },
      { icon: "◫", label: "تكرار", tone: "blue" },
      { icon: "⌫", label: "حذف", tone: "red" },
      { icon: "↔", label: "قص", tone: "orange" },
    ],
  },
  "صوت": {
    title: "الصوت",
    subtitle: "أضف الموسيقى والمؤثرات الصوتية",
    items: [
      { icon: "♫", label: "إضافة صوت", tone: "green" },
      { icon: "♬", label: "موسيقى", tone: "blue" },
      { icon: "◉", label: "مؤثرات", tone: "purple" },
      { icon: "◒", label: "تسجيل", tone: "orange" },
    ],
  },
  "نص": {
    title: "النص",
    subtitle: "أضف عناوين ونصوصاً فوق الفيديو",
    items: [
      { icon: "T", label: "إضافة نص", tone: "pink" },
      { icon: "Aa", label: "نمط", tone: "blue" },
      { icon: "✦", label: "حركة", tone: "purple" },
    ],
  },
  "ملصقات": {
    title: "الملصقات",
    subtitle: "أضف عناصر ورسومات متحركة",
    items: [
      { icon: "😊", label: "إيموجي", tone: "yellow" },
      { icon: "★", label: "أشكال", tone: "purple" },
      { icon: "GIF", label: "GIF", tone: "blue" },
    ],
  },
  "تأثيرات": {
    title: "التأثيرات",
    subtitle: "تأثيرات بصرية قابلة للتطبيق على الفيديو",
    items: [
      { icon: "✦", label: "سينمائي", tone: "purple" },
      { icon: "⚡", label: "ضوء", tone: "yellow" },
      { icon: "❄", label: "جو", tone: "blue" },
      { icon: "◌", label: "تشويه", tone: "pink" },
    ],
  },
  "فلاتر": {
    title: "الفلاتر",
    subtitle: "غيّر مظهر الفيديو بسرعة",
    items: [
      { icon: "◉", label: "سينما", tone: "orange" },
      { icon: "◈", label: "دافئ", tone: "red" },
      { icon: "◇", label: "بارد", tone: "blue" },
      { icon: "✧", label: "أبيض وأسود", tone: "gray" },
    ],
  },
  "ضبط": {
    title: "الضبط",
    subtitle: "تحكم دقيق بألوان وإضاءة الفيديو",
    items: [
      { icon: "☀", label: "الإضاءة", tone: "yellow" },
      { icon: "◐", label: "التباين", tone: "blue" },
      { icon: "◑", label: "التشبع", tone: "pink" },
      { icon: "◒", label: "حدة", tone: "purple" },
    ],
  },
  "سرعة": {
    title: "السرعة",
    subtitle: "تحكم بسرعة تشغيل المقطع",
    items: [
      { icon: "½×", label: "بطيء", tone: "blue" },
      { icon: "1×", label: "عادي", tone: "green" },
      { icon: "2×", label: "سريع", tone: "orange" },
      { icon: "⚡", label: "منحنى", tone: "purple" },
    ],
  },
  "انتقال": {
    title: "الانتقالات",
    subtitle: "أضف انتقالاً بين المقاطع",
    items: [
      { icon: "↔", label: "مزج", tone: "blue" },
      { icon: "◆", label: "تلاشي", tone: "purple" },
      { icon: "◫", label: "سحب", tone: "orange" },
      { icon: "✦", label: "مميز", tone: "pink" },
    ],
  },
  "طبقة": {
    title: "الطبقات",
    subtitle: "تحكم بالعناصر فوق الفيديو",
    items: [
      { icon: "＋", label: "إضافة طبقة", tone: "green" },
      { icon: "▣", label: "ترتيب", tone: "blue" },
      { icon: "◉", label: "شفافية", tone: "purple" },
    ],
  },
};

export default function VideoToolPanel({
  activeTool,
  onSplit,
  onDelete,
  hasSelection,
}: VideoToolPanelProps) {
  const panel = panels[activeTool];

  if (!panel) return null;

  return (
    <section className="videoToolPanel" dir="rtl">
      <div className="videoToolPanelHeader">
        <div>
          <strong>{panel.title}</strong>
          <span>{panel.subtitle}</span>
        </div>
        <div className="toolPanelGlow">{activeTool}</div>
      </div>

      <div className="videoToolGrid">
        {panel.items.map((item) => {
          const isSplit = activeTool === "تحرير" && item.label === "تقسيم";
          const isDelete = activeTool === "تحرير" && item.label === "حذف";

          return (
            <button
              key={item.label}
              type="button"
              className={`videoToolCard ${item.tone}`}
              disabled={(isSplit || isDelete) && !hasSelection}
              onClick={isSplit ? onSplit : isDelete ? onDelete : undefined}
            >
              <span className="videoToolIcon">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      <style jsx>{`
        .videoToolPanel {
          flex-shrink: 0;
          padding: 12px 14px 14px;
          background: #0d0e13;
          border-top: 1px solid rgba(255,255,255,.06);
          border-bottom: 1px solid rgba(255,255,255,.06);
        }

        .videoToolPanelHeader {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 11px;
        }

        .videoToolPanelHeader > div:first-child {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .videoToolPanelHeader strong {
          font-size: 14px;
          color: #fff;
        }

        .videoToolPanelHeader span {
          color: #858894;
          font-size: 11px;
        }

        .toolPanelGlow {
          padding: 7px 11px;
          border-radius: 12px;
          background: linear-gradient(135deg, #7c3aed, #2563eb);
          color: #fff !important;
          font-size: 11px !important;
          font-weight: 700;
          box-shadow: 0 5px 20px rgba(99,102,241,.22);
        }

        .videoToolGrid {
          display: flex;
          gap: 9px;
          overflow-x: auto;
          scrollbar-width: none;
        }

        .videoToolGrid::-webkit-scrollbar {
          display: none;
        }

        .videoToolCard {
          flex: 0 0 76px;
          height: 68px;
          border: 1px solid rgba(255,255,255,.07);
          border-radius: 15px;
          background: #15161d;
          color: #e8e9ee;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 6px;
          cursor: pointer;
          transition: transform .15s, border-color .15s, background .15s;
        }

        .videoToolCard:active {
          transform: scale(.95);
        }

        .videoToolCard:hover {
          background: #1b1d26;
          border-color: rgba(255,255,255,.16);
        }

        .videoToolCard:disabled {
          opacity: .35;
          cursor: not-allowed;
        }

        .videoToolIcon {
          width: 31px;
          height: 31px;
          border-radius: 10px;
          display: grid;
          place-items: center;
          color: #fff !important;
          font-size: 14px !important;
          font-weight: 800;
          background: linear-gradient(135deg, #7c3aed, #2563eb);
          box-shadow: 0 5px 15px rgba(79,70,229,.22);
        }

        .videoToolCard span:last-child {
          font-size: 10px;
          color: #d5d6dc;
        }

        .videoToolCard.green .videoToolIcon { background: linear-gradient(135deg,#10b981,#059669); }
        .videoToolCard.blue .videoToolIcon { background: linear-gradient(135deg,#3b82f6,#2563eb); }
        .videoToolCard.red .videoToolIcon { background: linear-gradient(135deg,#ef4444,#dc2626); }
        .videoToolCard.orange .videoToolIcon { background: linear-gradient(135deg,#f59e0b,#ea580c); }
        .videoToolCard.pink .videoToolIcon { background: linear-gradient(135deg,#ec4899,#db2777); }
        .videoToolCard.yellow .videoToolIcon { background: linear-gradient(135deg,#facc15,#f59e0b); }
        .videoToolCard.gray .videoToolIcon { background: linear-gradient(135deg,#64748b,#334155); }

        @media (max-width: 600px) {
          .videoToolPanel {
            padding-inline: 10px;
          }

          .videoToolCard {
            flex-basis: 70px;
            height: 64px;
          }
        }
      `}
      </style>
    </section>
  );
}
