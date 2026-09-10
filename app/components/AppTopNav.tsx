"use client";

export default function AppTopNav() {
  return (
    <header
      dir="rtl"
      style={{
        position: "fixed",
        top: 0,
        right: 0,
        left: 0,
        zIndex: 1100,
        height: 76,
        padding: "0 18px",
        background: "rgba(8,9,12,.94)",
        borderBottom: "1px solid rgba(255,255,255,.08)",
        backdropFilter: "blur(18px)",
        WebkitBackdropFilter: "blur(18px)",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          position: "relative",
          height: 76,
          display: "flex",
          alignItems: "center",
          maxWidth: 1500,
          margin: "0 auto",
        }}
      >
        <div
          style={{
            color: "#fff",
            fontSize: 18,
            fontWeight: 900,
            letterSpacing: "-.4px",
          }}
        >
          PhotoEditorPro
        </div>

        <button
          type="button"
          aria-label="فتح القائمة"
          className="top-sidebar-menu-button"
          onClick={() => {
            window.dispatchEvent(new Event("photoeditorpro:open-sidebar"));
          }}
          style={{
            position: "absolute",
            left: 14,
            top: 18,
            width: 40,
            height: 40,
            padding: 0,
            border: "1px solid rgba(255,255,255,.12)",
            borderRadius: 12,
            background: "rgba(255,255,255,.07)",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backdropFilter: "blur(14px)",
            WebkitBackdropFilter: "blur(14px)",
            boxShadow: "0 4px 18px rgba(0,0,0,.18)",
          }}
        >
          <svg
            width="21"
            height="21"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <path d="M4 7h16" />
            <path d="M4 12h16" />
            <path d="M4 17h16" />
          </svg>
        </button>
      </div>
    </header>
  );
}
