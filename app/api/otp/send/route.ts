import { NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/app/lib/db";
import transporter from "../../../../lib/mailer";

export async function POST(request: Request) {
  console.log("===== OTP ROUTE HIT =====", new Date().toISOString());

  try {
    const body = await request.json();

    const email = String(body?.email ?? "")
      .trim()
      .toLowerCase();

    if (!email) {
      return NextResponse.json(
        {
          success: false,
          message: "البريد الإلكتروني مطلوب",
        },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return NextResponse.json(
        {
          success: false,
          message: "البريد الإلكتروني غير صالح",
        },
        { status: 400 }
      );
    }

    const otp = crypto
      .randomInt(100000, 1000000)
      .toString();

    const codeHash = crypto
      .createHash("sha256")
      .update(otp)
      .digest("hex");

    /*
     * أولاً نحاول إرسال البريد فعلياً.
     * لا نحفظ OTP في قاعدة البيانات قبل نجاح الإرسال.
     */
    const mailInfo = await transporter.sendMail({
      from: `"Photo Editor Pro" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to: email,
      subject: `OTP TEST ${Date.now()}`,
      text: `رمز التحقق الخاص بك هو: ${otp}

الرمز صالح لمدة 10 دقائق.

إذا لم تطلب هذا الرمز، يمكنك تجاهل هذه الرسالة.`,
    });

    console.log("===== OTP EMAIL SENT =====");
    console.log("FROM:", process.env.SMTP_FROM || process.env.SMTP_USER);
    console.log("TO:", email);
    console.log("messageId:", mailInfo.messageId);
    console.log("accepted:", mailInfo.accepted);
    console.log("rejected:", mailInfo.rejected);
    console.log("response:", mailInfo.response);
    console.log("==========================");

    /*
     * إذا لم يقبل SMTP المستلم، لا نعتبر العملية ناجحة.
     */
    if (
      !mailInfo.accepted ||
      !mailInfo.accepted.some(
        (address) =>
          typeof address === "string" &&
          address.toLowerCase() === email
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "لم يتم قبول البريد الإلكتروني من خادم البريد",
        },
        { status: 502 }
      );
    }

    /*
     * تعطيل رموز التسجيل القديمة لهذا البريد.
     */
    await db.query(
      `UPDATE otp_codes
       SET used_at = NOW()
       WHERE email = $1
         AND purpose = $2
         AND used_at IS NULL`,
      [email, "register"]
    );

    /*
     * حفظ OTP الجديد بعد نجاح الإرسال فقط.
     */
    await db.query(
      `INSERT INTO otp_codes
       (
         id,
         email,
         code_hash,
         purpose,
         attempts,
         expires_at,
         created_at
       )
       VALUES
       (
         gen_random_uuid(),
         $1,
         $2,
         $3,
         0,
         NOW() + INTERVAL '10 minutes',
         NOW()
       )`,
      [email, codeHash, "register"]
    );

    return NextResponse.json({
      success: true,
      message: "تم إرسال رمز التحقق إلى بريدك الإلكتروني",
      smtp: {
        messageId: mailInfo.messageId,
        accepted: mailInfo.accepted,
        rejected: mailInfo.rejected,
        response: mailInfo.response,
      },
    });
  } catch (error) {
    console.error("OTP send error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "تعذر إرسال رمز التحقق إلى البريد الإلكتروني",
      },
      { status: 500 }
    );
  }
}
