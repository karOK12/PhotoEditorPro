import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { success: false, message: "OTP غير مفعّل حاليًا" },
    { status: 501 }
  );
}
