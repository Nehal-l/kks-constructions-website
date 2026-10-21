import express from "express";
import bcrypt from "bcryptjs";
import {
  createSessionToken,
  setSessionCookie,
  clearSessionCookie,
  requireAuth,
  requireTrustedOrigin,
  validatePasswordStrength,
} from "../middleware/auth.js";
import { loginRateLimiter } from "../middleware/rateLimiter.js";
import { findUserByLogin, updateUserPassword } from "../services/datastore.js";

const router = express.Router();
router.use(requireTrustedOrigin);

// POST /api/auth/login
router.post("/login", loginRateLimiter, async (req, res) => {
  try {
    const identifier = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
    const password = typeof req.body?.password === "string" ? req.body.password : "";

    if (!identifier || !password) {
      return res.status(400).json({ error: "Please provide both email and password." });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier) || password.length > 200) {
      return res.status(400).json({ error: "Please provide a valid email and password." });
    }

    const user = await findUserByLogin(identifier);
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials." });
    }

    const sessionPayload = {
      id: user._id?.toString() || user.id,
      username: user.username,
      email: user.email,
      role: user.role || "owner",
    };

    const token = createSessionToken(sessionPayload);
    setSessionCookie(res, token);

    return res.json({
      ok: true,
      message: "Authentication successful.",
      user: sessionPayload,
    });
  } catch (err) {
    console.error("Login error:", err);
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
router.post("/change-password", requireAuth, async (req, res) => {
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

    const user = await findUserByLogin(req.user.username);
    if (!user) {
      return res.status(404).json({ error: "User account not found." });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Current password is incorrect." });
    }

    const salt = await bcrypt.genSalt(10);
    const newHash = await bcrypt.hash(newPassword, salt);

    await updateUserPassword(user._id?.toString() || user.id, newHash);

    return res.json({
      ok: true,
      message: "Password changed successfully. Your new credentials are active.",
    });
  } catch (err) {
    console.error("Change password error:", err);
    return res.status(500).json({ error: "Failed to update password." });
  }
});

export default router;
