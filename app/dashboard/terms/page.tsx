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
          الشروط والأحكام
        </h1>

        <p>
          باستخدامك Photo Editor Pro فإنك توافق على استخدام التطبيق بطريقة
          قانونية ومسؤولة.
        </p>

        <h2>الاستخدام المقبول</h2>
        <p>
          يُمنع استخدام التطبيق في أي نشاط مخالف للقوانين أو ينتهك حقوق
          الآخرين.
        </p>

        <h2>الحساب</h2>
        <p>
          أنت مسؤول عن الحفاظ على سرية بيانات حسابك وعن النشاط الذي يتم من
          خلاله.
        </p>

        <h2>المحتوى</h2>
        <p>
          أنت مسؤول عن الصور والفيديوهات والملفات التي تقوم برفعها أو تحريرها،
          وعن امتلاك الحقوق اللازمة لاستخدامها.
        </p>

        <h2>التحديثات</h2>
        <p>
          قد يتم تطوير وظائف التطبيق أو تعديلها أو إضافة ميزات جديدة من وقت
          لآخر.
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
