import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { success: false, message: "التحقق من OTP غير مفعّل حاليًا" },
    { status: 501 }
  );
}
