import "server-only";

import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";

const COOKIE_NAME = "moji_guest_session";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

function getGuestSessionSecret() {
  const secret = process.env.GUEST_SESSION_SECRET;

  if (!secret) {
    throw new Error("Missing GUEST_SESSION_SECRET. Guest sessions cannot be verified.");
  }

  return secret;
}

function signGuestId(guestId) {
  return createHmac("sha256", getGuestSessionSecret())
    .update(guestId)
    .digest("hex");
}

function verifySignedGuestCookie(cookieValue) {
  if (!cookieValue) {
    return null;
  }

  const [version, guestId, signature] = cookieValue.split(".");
  if (version !== "v1" || !guestId || !signature) {
    return null;
  }

  const expectedSignature = signGuestId(guestId);
  if (signature.length !== expectedSignature.length) {
    return null;
  }

  const provided = Buffer.from(signature);
  const expected = Buffer.from(expectedSignature);

  if (!timingSafeEqual(provided, expected)) {
    return null;
  }

  return guestId;
}

function createGuestSession() {
  const guestId = randomUUID();
  const signature = signGuestId(guestId);

  return {
    guestId,
    cookieValue: `v1.${guestId}.${signature}`,
    shouldSetCookie: true,
  };
}

export function getGuestSession(request) {
  const cookieValue = request.cookies.get(COOKIE_NAME)?.value;
  const guestId = verifySignedGuestCookie(cookieValue);

  if (guestId) {
    return {
      guestId,
      cookieValue,
      shouldSetCookie: false,
    };
  }

  return createGuestSession();
}

export function attachGuestSession(response, guestSession) {
  if (!guestSession.shouldSetCookie) {
    return response;
  }

  response.cookies.set({
    name: COOKIE_NAME,
    value: guestSession.cookieValue,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  });

  return response;
}
