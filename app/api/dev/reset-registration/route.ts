import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    const expected = process.env.DEV_RESET_TOKEN;

    if (!expected) {
      return NextResponse.json(
        { success: false, message: "أداة الاختبار غير مهيأة" },
        { status: 503 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const token = typeof body.token === "string" ? body.token : "";

    const a = Buffer.from(token);
    const b = Buffer.from(expected);

    const valid =
      a.length === b.length && crypto.timingSafeEqual(a, b);

    if (!valid) {
      return NextResponse.json(
        { success: false, message: "غير مصرح" },
        { status: 403 }
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { success: false, message: "خطأ في الخادم" },
      { status: 500 }
    );
  }
}
