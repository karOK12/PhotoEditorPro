import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/lib/db";
import { getSessionCookieName, verifySessionToken } from "@/lib/auth-session";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get(getSessionCookieName())?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "غير مسجل الدخول" },
        { status: 401 }
      );
    }

    const session = verifySessionToken(token);

    if (!session?.userId) {
      return NextResponse.json(
        { success: false, message: "جلسة غير صالحة" },
        { status: 401 }
      );
    }

    const result = await db.query(
      `
        SELECT
          id,
          name,
          type,
          thumbnail,
          data,
          created_at,
          updated_at
        FROM projects
        WHERE user_id = $1
        ORDER BY updated_at DESC
      `,
      [session.userId]
    );

    return NextResponse.json({
      success: true,
      projects: result.rows,
    });
  } catch (error) {
    console.error("GET /api/projects error:", error);

    return NextResponse.json(
      { success: false, message: "خطأ في الخادم" },
      { status: 500 }
    );
  }
}
