"use client";

import { useState } from "react";

export default function Page() {
  const [selected, setSelected] = useState(0);

  return (
    <main dir="rtl" className="settings-page">
      <div className="settings-card">
        <div className="settings-icon">L</div>
        <h1>اتفاقية ترخيص</h1>
        <div className="settings-content">
          
          <p>يُمنح المستخدم ترخيص محدود لاستخدام Photo Editor Pro وفق الوظائف التي يوفرها التطبيق.</p>
          <h2>الترخيص</h2>
          <p>الترخيص مخصص للاستخدام الشخصي أو الاستخدام المسموح به من خلال الخدمة، ولا يمنح المستخدم ملكية الكود المصدري أو مكونات التطبيق.</p>
          <h2>القيود</h2>
          <p>لا يجوز نسخ أو إعادة توزيع أو بيع أو استغلال مكونات التطبيق أو محاولة الوصول غير المصرح به إلى أنظمته.</p>
          <h2>الملكية</h2>
          <p>تبقى حقوق التطبيق ومكوناته وواجهاته البرمجية مملوكة لأصحابها ما لم يُذكر خلاف ذلك.</p>
        
        </div>
      </div>

      <style jsx>{`
        .settings-page {
          min-height: calc(100dvh - 100px);
          padding: 24px;
        }

        .settings-card {
          width: min(900px, 100%);
          margin: 0 auto;
          padding: 28px;
          border: 1px solid rgba(255,255,255,.08);
          border-radius: 22px;
          background: rgba(255,255,255,.025);
          box-shadow: 0 18px 50px rgba(0,0,0,.18);
        }

        .settings-icon {
          width: 48px;
          height: 48px;
          display: grid;
          place-items: center;
          border-radius: 14px;
          background: rgba(255,255,255,.07);
          color: #fff;
          font-weight: 800;
          margin-bottom: 18px;
        }

        h1 {
          margin: 0 0 24px;
          font-size: 25px;
          color: #fff;
        }

        .settings-content {
          color: rgba(255,255,255,.76);
          line-height: 1.9;
          font-size: 15px;
        }

        .settings-content h2 {
          margin: 24px 0 8px;
          color: #fff;
          font-size: 18px;
        }

        .settings-content p {
          margin: 8px 0;
        }

        .muted {
          opacity: .65;
        }

        .rating-grid {
          display: flex;
          gap: 10px;
          direction: ltr;
          margin: 24px 0 10px;
        }

        .rating-grid button {
          width: 48px;
          height: 48px;
          border: 1px solid rgba(255,255,255,.1);
          border-radius: 12px;
          background: rgba(255,255,255,.05);
          color: #777;
          font-size: 25px;
          cursor: pointer;
          transition: .2s;
        }

        .rating-grid button:hover,
        .rating-grid button:nth-child(-n + var(--selected)) {
          color: #ffd166;
          background: rgba(255,209,102,.08);
        }

        @media (max-width: 600px) {
          .settings-page {
            padding: 16px;
          }

          .settings-card {
            padding: 20px;
            border-radius: 18px;
          }

          h1 {
            font-size: 22px;
          }
        }
      `}</style>
    </main>
  );
}
