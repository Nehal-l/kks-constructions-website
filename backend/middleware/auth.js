import crypto from "node:crypto";
import { findUserByLogin } from "../services/datastore.js";

const COOKIE_NAME = "kks_admin_session";
const SESSION_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const unsafeMethods = new Set(["POST", "PUT", "PATCH", "DELETE"]);
const developmentSessionSecret = crypto.randomBytes(32).toString("hex");

export function requireTrustedOrigin(req, res, next) {
  if (!unsafeMethods.has(req.method) || !req.get("Origin")) return next();
  const requestOrigin = req.get("Origin");
  const allowedOrigins = (process.env.CLIENT_ORIGIN || "http://localhost:5173")
    .split(",")
    .map((origin) => {
      try {
        return new URL(origin.trim()).origin;
      } catch {
        return "";
      }
    });
  let isLocalDevelopmentOrigin = false;
  if (process.env.NODE_ENV !== "production") {
    try {
      const origin = new URL(requestOrigin);
      isLocalDevelopmentOrigin = origin.protocol === "http:" &&
        ["localhost", "127.0.0.1", "[::1]"].includes(origin.hostname);
    } catch {
      isLocalDevelopmentOrigin = false;
    }
  }
  if (!allowedOrigins.includes(requestOrigin) && !isLocalDevelopmentOrigin) {
    return res.status(403).json({ error: "Request origin is not allowed." });
  }
  return next();
}

function getSecret() {
  if (process.env.SESSION_SECRET) return process.env.SESSION_SECRET;
  if (process.env.NODE_ENV === "production") {
    throw new Error("SESSION_SECRET must be configured in production.");
  }
  return developmentSessionSecret;
}

// Generate signed tamper-proof token
export function createSessionToken(payload) {
  const data = {
    ...payload,
    exp: Date.now() + SESSION_EXPIRY_MS,
  };
  const jsonStr = JSON.stringify(data);
  const base64Data = Buffer.from(jsonStr).toString("base64url");
  const signature = crypto
    .createHmac("sha256", getSecret())
    .update(base64Data)
    .digest("base64url");
  return `${base64Data}.${signature}`;
}

// Verify signed token
export function verifySessionToken(token) {
  if (!token || typeof token !== "string") return null;
  const parts = token.split(".");
  if (parts.length !== 2) return null;

  const [base64Data, signature] = parts;
  const expectedSig = crypto
    .createHmac("sha256", getSecret())
    .update(base64Data)
    .digest("base64url");

  const received = Buffer.from(signature);
  const expected = Buffer.from(expectedSig);
  if (received.length !== expected.length || !crypto.timingSafeEqual(received, expected)) {
    return null;
  }

  try {
    const jsonStr = Buffer.from(base64Data, "base64url").toString("utf-8");
    const data = JSON.parse(jsonStr);
    if (!data.exp || data.exp < Date.now()) return null;
    return data;
  } catch {
    return null;
  }
}

// Set HTTP-only Cookie with proper security flags
export function setSessionCookie(res, token) {
  const isProd = process.env.NODE_ENV === "production";
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    maxAge: SESSION_EXPIRY_MS,
    path: "/",
  });
}

export function clearSessionCookie(res) {
  const isProd = process.env.NODE_ENV === "production";
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    path: "/",
  });
}

// Authentication middleware
export async function requireAuth(req, res, next) {
  const token = req.cookies?.[COOKIE_NAME];
  if (!token) {
    return res.status(401).json({ error: "Authentication required. Please log in." });
  }

  const session = verifySessionToken(token);
  if (!session) {
    clearSessionCookie(res);
    return res.status(401).json({ error: "Session expired or invalid. Please log in again." });
  }

  const user = await findUserByLogin(session.username || session.email);
  if (!user) {
    clearSessionCookie(res);
    return res.status(401).json({ error: "User account no longer found." });
  }

  req.user = {
    id: user._id?.toString() || user.id,
    username: user.username,
    email: user.email,
    role: user.role || "owner",
  };

  return next();
}

// Password strength validator
export function validatePasswordStrength(password) {
  if (typeof password !== "string") return "Password must be a string.";
  if (password.length < 8) return "Password must be at least 8 characters long.";
  if (!/[A-Za-z]/.test(password)) return "Password must contain at least one letter.";
  if (!/[0-9]/.test(password)) return "Password must contain at least one number.";
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
    return "Password must contain at least one special character.";
  }
  return null;
}
