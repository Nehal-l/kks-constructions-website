import express from "express";
import crypto from "node:crypto";
import {
  createSessionToken,
  setSessionCookie,
  clearSessionCookie,
  requireAuth,
  requireTrustedOrigin,
  validatePasswordStrength,
  getOwnerFromEnv,
} from "../middleware/auth.js";
import { loginRateLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();
router.use(requireTrustedOrigin);

// POST /api/auth/login
// Authenticates the owner directly against OWNER_EMAIL + OWNER_INITIAL_PASSWORD env vars.
// No database lookup is performed for authentication.
router.post("/login", loginRateLimiter, (req, res) => {
  try {
    const identifier = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
    const password = typeof req.body?.password === "string" ? req.body.password : "";

    if (!identifier || !password) {
      return res.status(400).json({ error: "Please provide both email and password." });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier) || password.length > 200) {
      return res.status(400).json({ error: "Please provide a valid email and password." });
    }

    const owner = getOwnerFromEnv();

    if (!owner.email || !owner.password) {
      console.error("Login error: OWNER_EMAIL or OWNER_INITIAL_PASSWORD is not configured in .env");
      return res.status(500).json({ error: "Owner credentials are not configured on this server." });
    }

    const emailMatch = identifier === owner.email;
    const usernameMatch = identifier === owner.username;
    if (!emailMatch && !usernameMatch) {
      return res.status(401).json({ error: "Invalid credentials." });
    }

    // Constant-time string comparison to prevent timing attacks
    const suppliedBuf = Buffer.from(password);
    const expectedBuf = Buffer.from(owner.password);
    const lengthMatch = suppliedBuf.length === expectedBuf.length;
    const valueMatch = lengthMatch && crypto.timingSafeEqual(suppliedBuf, expectedBuf);

    if (!valueMatch) {
      return res.status(401).json({ error: "Invalid credentials." });
    }

    const sessionPayload = {
      id: owner.id,
      username: owner.username,
      email: owner.email,
      role: owner.role,
    };

    const token = createSessionToken(sessionPayload);
    setSessionCookie(res, token);

    return res.json({
      ok: true,
      message: "Authentication successful.",
      user: sessionPayload,
    });
  } catch (err) {
    console.error("Login error:", err.message);
    return res.status(500).json({ error: "An unexpected error occurred during login." });
  }
});

// POST /api/auth/logout
router.post("/logout", (_req, res) => {
  clearSessionCookie(res);
  return res.json({ ok: true, message: "Logged out successfully." });
});

// GET /api/auth/me
router.get("/me", requireAuth, (req, res) => {
  return res.json({ ok: true, user: req.user });
});

// POST /api/auth/change-password
// Since credentials live in .env, a password change updates the env file
// on disk so the new password persists across restarts.
router.post("/change-password", requireAuth, (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body || {};

    if (
      typeof currentPassword !== "string" || !currentPassword ||
      typeof newPassword !== "string" || !newPassword ||
      typeof confirmPassword !== "string"
    ) {
      return res.status(400).json({ error: "Please enter your current and new password." });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ error: "New password and confirmation do not match." });
    }

    const strengthError = validatePasswordStrength(newPassword);
    if (strengthError) {
      return res.status(400).json({ error: strengthError });
    }

    const owner = getOwnerFromEnv();
    if (currentPassword !== owner.password) {
      return res.status(400).json({ error: "Current password is incorrect." });
    }

    // Update OWNER_INITIAL_PASSWORD in the running process so it takes effect immediately.
    // The owner must also manually update backend/.env to persist across restarts.
    process.env.OWNER_INITIAL_PASSWORD = newPassword;

    return res.json({
      ok: true,
      message: "Password updated for this session. To persist across server restarts, update OWNER_INITIAL_PASSWORD in backend/.env.",
    });
  } catch (err) {
    console.error("Change password error:", err.message);
    return res.status(500).json({ error: "Failed to update password." });
  }
});

export default router;
