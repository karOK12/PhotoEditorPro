import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const image = body?.image;

    if (!image || typeof image !== "string") {
      return NextResponse.json(
        { ok: false, message: "الصورة غير موجودة" },
        { status: 400 }
      );
    }

    // مؤقتًا نحفظ الصورة كـ Data URL نفسه
    // حتى يعمل الـ API بدون تغيير التصميم.
    return NextResponse.json({
      ok: true,
      url: image,
    });

  } catch (error) {
    console.error("Upload error:", error);

    return NextResponse.json(
      { ok: false, message: "حدث خطأ أثناء رفع الصورة" },
      { status: 500 }
    );
  }
}
