"use client";

export default function Page() {
  return (
    <main
      dir="rtl"
      style={{
        minHeight: "calc(100dvh - 100px)",
        padding: "40px 24px",
        background: "#ffffff",
        color: "#111111",
        boxSizing: "border-box",
      }}
    >
      <article
        style={{
          width: "min(900px, 100%)",
          margin: "0 auto",
          lineHeight: 1.9,
          fontSize: "16px",
        }}
      >
        <h1
          style={{
            margin: "0 0 28px",
            fontSize: "30px",
            fontWeight: 800,
            color: "#111111",
          }}
        >
          سياسة الخصوصية
        </h1>

        <p>
          نحن نحترم خصوصيتك ونسعى إلى حماية بياناتك الشخصية أثناء استخدام
          Photo Editor Pro.
        </p>

        <h2>البيانات التي يتم التعامل معها</h2>
        <p>
          قد يتم التعامل مع بيانات الحساب والمشاريع والملفات التي تختار رفعها
          إلى التطبيق، وذلك لتوفير وظائف التحرير وإدارة المشاريع.
        </p>

        <h2>حماية الحساب</h2>
        <p>
          يتم استخدام وسائل المصادقة والجلسات لحماية الوصول إلى حسابك. لا تشارك
          بيانات تسجيل الدخول الخاصة بك مع الآخرين.
        </p>

        <h2>الملفات والمشاريع</h2>
        <p>
          الملفات التي تستخدمها داخل التطبيق يتم التعامل معها وفق الوظائف
          المتاحة في التطبيق والخدمات المرتبطة به.
        </p>

        <h2>تحديث السياسة</h2>
        <p>
          قد يتم تحديث هذه السياسة عند إضافة وظائف أو خدمات جديدة إلى التطبيق.
        </p>
      </article>

      <style jsx>{`
        article h2 {
          margin: 28px 0 8px;
          font-size: 20px;
          font-weight: 750;
          color: #111111;
        }

        article p {
          margin: 8px 0;
          color: #333333;
        }

        @media (max-width: 600px) {
          main {
            padding: 24px 16px !important;
          }

          article {
            font-size: 15px !important;
          }

          article h1 {
            font-size: 25px !important;
          }

          article h2 {
            font-size: 18px !important;
          }
        }
      `}</style>
    </main>
  );
}
