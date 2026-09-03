import crypto from "crypto";

const COOKIE_NAME = "photoeditorpro_registration";

function getSecret() {
  return (
    process.env.AUTH_SECRET ||
    process.env.NEXTAUTH_SECRET ||
    "photoeditorpro-registration-secret"
  );
}

export function createRegistrationStatusToken(userId: string) {
  const payload = `${userId}:completed`;
  const signature = crypto
    .createHmac("sha256", getSecret())
    .update(payload)
    .digest("hex");

  return Buffer.from(`${payload}:${signature}`).toString("base64url");
}

export function verifyRegistrationStatusToken(token: string) {
  try {
    const decoded = Buffer.from(token, "base64url").toString("utf8");
    const [userId, status, signature] = decoded.split(":");

    if (!userId || status !== "completed" || !signature) {
      return null;
    }

    const expected = crypto
      .createHmac("sha256", getSecret())
      .update(`${userId}:completed`)
      .digest("hex");

    if (
      signature.length !== expected.length ||
      !crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expected)
      )
    ) {
      return null;
    }

    return userId;
  } catch {
    return null;
  }
}

export { COOKIE_NAME };
