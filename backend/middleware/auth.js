import crypto from "node:crypto";

const COOKIE_NAME = "kks_admin_session";
const SESSION_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const unsafeMethods = new Set(["POST", "PUT", "PATCH", "DELETE"]);
const developmentSessionSecret = crypto.randomBytes(32).toString("hex");

// ---------------------------------------------------------------------------
// Owner credential lookup — reads directly from environment variables.
// No database queries are made for authentication.
// ---------------------------------------------------------------------------
export function getOwnerFromEnv() {
  const email = (process.env.OWNER_EMAIL || "").toLowerCase().trim();
  const username = (process.env.OWNER_USERNAME || email.split("@")[0]).toLowerCase().trim();
  const password = process.env.OWNER_INITIAL_PASSWORD || "";
  return { id: "owner_env", email, username, password, role: "owner" };
}

export function requireTrustedOrigin(req, res, next) {
  if (!unsafeMethods.has(req.method) || !req.get("Origin")) return next();
  const requestOrigin = req.get("Origin");
  const rawOrigins = [
    process.env.CLIENT_ORIGIN,
    process.env.FRONTEND_URL,
    "http://localhost:5173",
  ]
    .filter(Boolean)
    .join(",");

  const allowedOrigins = rawOrigins
    .split(",")
    .map((origin) => {
      try {
        return new URL(origin.trim()).origin;
      } catch {
        return origin.trim().replace(/\/+$/, "");
      }
    })
    .filter(Boolean);

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

  let normalizedRequestOrigin = "";
  try {
    normalizedRequestOrigin = new URL(requestOrigin).origin;
  } catch {
    normalizedRequestOrigin = requestOrigin.replace(/\/+$/, "");
  }

  if (!allowedOrigins.includes(normalizedRequestOrigin) && !isLocalDevelopmentOrigin) {
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

// Authentication middleware — validates session token and confirms
// the owner credentials still match the current env vars.
export function requireAuth(req, res, next) {
  const token = req.cookies?.[COOKIE_NAME];
  if (!token) {
    return res.status(401).json({ error: "Authentication required. Please log in." });
  }

  const session = verifySessionToken(token);
  if (!session) {
    clearSessionCookie(res);
    return res.status(401).json({ error: "Session expired or invalid. Please log in again." });
  }

  // Confirm the session email still matches the configured owner email
  const owner = getOwnerFromEnv();
  const sessionEmail = (session.email || "").toLowerCase().trim();
  if (sessionEmail !== owner.email) {
    clearSessionCookie(res);
    return res.status(401).json({ error: "Session is no longer valid. Please log in again." });
  }

  req.user = {
    id: owner.id,
    username: owner.username,
    email: owner.email,
    role: owner.role,
  };

  return next();
}

// Password strength validator (kept for change-password UI validation)
export function validatePasswordStrength(password) {
  if (typeof password !== "string") return "Password must be a string.";
  if (password.length < 6) return "Password must be at least 6 characters long.";
  if (!/[A-Za-z]/.test(password)) return "Password must contain at least one letter.";
  if (!/[0-9]/.test(password)) return "Password must contain at least one number.";
  return null;
}
