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


      </div>
    </header>
  );
}
