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

        <div className="flex items-center gap-2">
          <button
            className="icon-button"
            id="settingsButton"
            aria-label="الإعدادات"
          >
            ⚙️
          </button>
        </div>
      </header>

      <main className="app-container">
        <section className="welcome-section">
          <div>
            <span className="welcome-label">مرحباً بك 👋</span>

            <h2>ماذا تريد أن تصمم اليوم؟</h2>

            <p>
              عدّل صورك وفيديوهاتك وأنشئ تصاميمك من مكان واحد.
            </p>
          </div>
        </section>

        <section className="main-tools">
          <button
            className="tool-card primary-tool"
            id="imageEditorButton"
            onClick={() => {
              window.location.href = "/editor.html";
            }}
          >
            <div className="tool-icon">🖼️</div>

            <div className="tool-content">
              <h3>تعديل صورة</h3>

              <p>
                تعديل الصور، الفلاتر، النصوص والشعارات
              </p>
            </div>

            <span className="tool-arrow">←</span>
          </button>

          <button
            className="tool-card"
            id="videoEditorButton"
          >
            <div className="tool-icon">🎬</div>

            <div className="tool-content">
              <h3>تعديل فيديو</h3>

              <p>
                قص، دمج، صوت، نصوص وانتقالات
              </p>
            </div>

            <span className="tool-arrow">←</span>
          </button>
        </section>

        <section className="quick-section">
          <div className="section-header">
            <h2>أدوات سريعة</h2>
          </div>

          <div className="quick-tools">
            <button className="quick-card">
              <span>🎨</span>
              <strong>القوالب</strong>
              <small>تصاميم جاهزة</small>
            </button>

            <button className="quick-card">
              <span>📁</span>
              <strong>مشاريعي</strong>
              <small>المشاريع المحفوظة</small>
            </button>

            <button className="quick-card">
              <span>✨</span>
              <strong>أدوات AI</strong>
              <small>قريباً</small>
            </button>

            <button className="quick-card">
              <span>⚙️</span>
              <strong>الإعدادات</strong>
              <small>تخصيص التطبيق</small>
            </button>
          </div>
        </section>

        <section className="projects-section">
          <div className="section-header">
            <h2>آخر المشاريع</h2>

            <button id="viewProjectsButton">
              عرض الكل
            </button>
          </div>

          <div className="empty-projects">
            <div className="empty-icon">📂</div>

            <h3>لا توجد مشاريع بعد</h3>

            <p>
              عندما تبدأ بتعديل الصور أو الفيديوهات ستظهر مشاريعك هنا.
            </p>
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
