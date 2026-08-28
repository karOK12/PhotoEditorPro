"use client";

import Script from "next/script";

export default function Home() {
  return (
    <>
      <header className="app-header">
        <div className="brand">
          <div className="brand-logo">PE</div>
          <div className="brand-info">
            <h1>Photo Editor Pro</h1>
            <span>استوديو التصميم والمونتاج</span>
          </div>
        </div>

        <button
          className="icon-button"
          id="sidebarButton"
          aria-label="فتح القائمة الجانبية"
        >
          ☰
        </button>
      </header>

      <main className="app-container">

        <section className="hero-section">
          <div className="hero-content">
            <span className="hero-badge">✦ مساحة الإبداع الخاصة بك</span>

            <h2>
              صمّم، عدّل،
              <br />
              <span>وأطلق إبداعك</span>
            </h2>

            <p>
              أدوات احترافية لتعديل الصور والفيديوهات وإنشاء تصاميمك
              بسهولة من مكان واحد.
            </p>
          </div>

          <div className="hero-glow" />
        </section>

        <section className="main-tools">
          <button
            className="tool-card primary-tool"
            id="imageEditorButton"
            onClick={() => {
              window.location.href = "/editor.html";
            }}
          >
            <div className="tool-card-top">
              <span className="tool-icon">🖼️</span>
              <span className="tool-arrow">←</span>
            </div>

            <div className="tool-content">
              <span className="tool-label">الأكثر استخداماً</span>
              <h3>تعديل الصور</h3>
              <p>
                فلاتر، نصوص، شعارات وتعديلات احترافية لصورك.
              </p>
            </div>
          </button>

          <button
            className="tool-card"
            id="videoEditorButton"
          >
            <div className="tool-card-top">
              <span className="tool-icon">🎬</span>
              <span className="tool-arrow">←</span>
            </div>

            <div className="tool-content">
              <span className="tool-label">قريباً</span>
              <h3>تعديل الفيديو</h3>
              <p>
                قص، دمج، صوت، نصوص وانتقالات بطريقة سهلة.
              </p>
            </div>
          </button>
        </section>

        <section className="quick-section">
          <div className="section-header">
            <div>
              <span className="section-kicker">استكشف</span>
              <h2>أدواتك السريعة</h2>
            </div>
          </div>

          <div className="quick-tools">
            <button className="quick-card">
              <span className="quick-icon">🎨</span>
              <strong>القوالب</strong>
              <small>تصاميم جاهزة</small>
            </button>

            <button className="quick-card">
              <span className="quick-icon">📁</span>
              <strong>مشاريعي</strong>
              <small>كل أعمالك محفوظة</small>
            </button>

            <button className="quick-card">
              <span className="quick-icon">✨</span>
              <strong>أدوات AI</strong>
              <small>قريباً</small>
            </button>

            <button
              className="quick-card"
              id="quickSettingsButton"
            >
              <span className="quick-icon">⚙️</span>
              <strong>الإعدادات</strong>
              <small>تخصيص التطبيق</small>
            </button>
          </div>
        </section>

        <section className="projects-section">
          <div className="section-header">
            <div>
              <span className="section-kicker">مساحتك</span>
              <h2>آخر المشاريع</h2>
            </div>

            <button id="viewProjectsButton" className="view-all-button">
              عرض الكل ←
            </button>
          </div>

          <div className="empty-projects">
            <div className="empty-icon">✦</div>
            <h3>مساحتك الإبداعية بانتظارك</h3>
            <p>
              ابدأ أول مشروع لك وسيظهر هنا تلقائياً.
            </p>

            <button
              className="start-project-button"
              onClick={() => {
                window.location.href = "/editor.html";
              }}
            >
              ابدأ مشروعك الأول
              <span>←</span>
            </button>
          </div>
        </section>

      </main>

      <footer className="app-footer">
        <span>Photo Editor Pro</span>
        <span>الإصدار 1.0.0</span>
      </footer>

      <Script src="/js/app.js" />
    </>
  );
}
