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
          اتفاقية ترخيص
        </h1>

        <p>
          يُمنح المستخدم ترخيص محدود لاستخدام Photo Editor Pro وفق الوظائف
          التي يوفرها التطبيق.
        </p>

        <h2>الترخيص</h2>
        <p>
          الترخيص مخصص للاستخدام الشخصي أو الاستخدام المسموح به من خلال
          الخدمة، ولا يمنح المستخدم ملكية الكود المصدري أو مكونات التطبيق.
        </p>

        <h2>القيود</h2>
        <p>
          لا يجوز نسخ أو إعادة توزيع أو بيع أو استغلال مكونات التطبيق أو
          محاولة الوصول غير المصرح به إلى أنظمته.
        </p>

        <h2>الملكية</h2>
        <p>
          تبقى حقوق التطبيق ومكوناته وواجهاته البرمجية مملوكة لأصحابها ما لم
          يُذكر خلاف ذلك.
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
