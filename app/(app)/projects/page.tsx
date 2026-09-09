"use client";

export default function ProjectsPage() {
  return (
    <main
      dir="rtl"
      style={{
        minHeight: "100vh",
        background: "#08090c",
        color: "#fff",
        padding: "20px 16px 90px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "700px",
          margin: "0 auto",
        }}
      >
        <h1
          style={{
            margin: 0,
            fontSize: "24px",
            fontWeight: 700,
          }}
        >
          مشاريعي
        </h1>

        <p
          style={{
            marginTop: "8px",
            color: "#94a3b8",
            fontSize: "14px",
          }}
        >
          جميع مشاريعك المحفوظة ستظهر هنا.
        </p>

        <div
          style={{
            marginTop: "30px",
            padding: "40px 20px",
            borderRadius: "16px",
            border: "1px solid rgba(255,255,255,.1)",
            background: "rgba(255,255,255,.04)",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "42px" }}>📁</div>

          <div
            style={{
              marginTop: "12px",
              fontSize: "17px",
              fontWeight: 600,
            }}
          >
            لا توجد مشاريع بعد
          </div>

          <div
            style={{
              marginTop: "8px",
              color: "#94a3b8",
              fontSize: "13px",
            }}
          >
            ابدأ بتحرير صورة أو فيديو وسيظهر مشروعك هنا.
          </div>
        </div>
      </div>
    </main>
  );
}
