import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");

  if (error) {
    return NextResponse.redirect(
      new URL("/?google_error=cancelled", request.url)
    );
  }

  if (!code) {
    return NextResponse.json(
      {
        success: false,
        message: "لم يتم استلام رمز Google",
      },
      { status: 400 }
    );
  }

  return NextResponse.json({
    success: true,
    message: "تم استلام رمز Google بنجاح",
    codeReceived: true,
  });
}
