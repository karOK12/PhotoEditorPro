import crypto from "crypto";

const COOKIE_NAME = "photoeditorpro_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 30; // 30 يوم

function getSecret(): string {
  const secret = process.env.AUTH_SECRET;

  if (!secret) {
    throw new Error("AUTH_SECRET is not configured");
  }

  return secret;
}

function createSignature(payload: string): string {
  return crypto
    .createHmac("sha256", getSecret())
    .update(payload)
    .digest("base64url");
}

export function createSessionToken(userId: string): string {
  const payload = Buffer.from(
    JSON.stringify({
      userId,
      exp: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE,
    })
  ).toString("base64url");

  const signature = createSignature(payload);

  return `${payload}.${signature}`;
}

export function verifySessionToken(
  token: string
): { userId: string } | null {
  try {
    const parts = token.split(".");

    if (parts.length !== 2) {
      return null;
    }

    const [payload, signature] = parts;

    const expectedSignature = createSignature(payload);

    const a = Buffer.from(signature);
    const b = Buffer.from(expectedSignature);

    if (
      a.length !== b.length ||
      !crypto.timingSafeEqual(a, b)
    ) {
      return null;
    }

    const data = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8")
    );

    if (
      !data?.userId ||
      !data?.exp ||
      data.exp <= Math.floor(Date.now() / 1000)
    ) {
      return null;
    }

    return {
      userId: String(data.userId),
    };
  } catch {
    return null;
  }
}

export function getSessionCookieName(): string {
  return COOKIE_NAME;
}

export function getSessionMaxAge(): number {
  return SESSION_MAX_AGE;
}
