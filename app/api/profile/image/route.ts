import { NextResponse } from "next/server";
import { db } from "@/app/lib/db";
import {
  getSessionCookieName,
  verifySessionToken,
} from "@/lib/auth-session";

export async function POST(req: Request) {
  try {
    const cookieHeader = req.headers.get("cookie") || "";

    const sessionToken = cookieHeader
      .split(";")
      .map((item) => item.trim())
      .find((item) => item.startsWith(`${getSessionCookieName()}=`))
      ?.split("=")
      .slice(1)
      .join("=");

    if (!sessionToken) {
      return NextResponse.json(
        { ok: false, message: "غير مسجل الدخول" },
        { status: 401 }
      );
    }

    const session = verifySessionToken(decodeURIComponent(sessionToken));

    if (!session) {
      return NextResponse.json(
        { ok: false, message: "جلسة الدخول غير صالحة" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const image = body?.image;

    if (!image || typeof image !== "string") {
      return NextResponse.json(
        { ok: false, message: "الصورة غير موجودة" },
        { status: 400 }
      );
    }

    await db.query(
      `INSERT INTO user_profiles (user_id, profile_image)
       VALUES ($1, $2)
       ON CONFLICT (user_id)
       DO UPDATE SET
         profile_image = EXCLUDED.profile_image,
         updated_at = NOW()`,
      [session.userId, image]
    );

    return NextResponse.json({
      ok: true,
      url: image,
    });
  } catch (error) {
    console.error("Profile image update error:", error);

    const message =
      error instanceof Error ? error.message : String(error);

    return NextResponse.json(
      { ok: false, message },
      { status: 500 }
    );
  }
}
