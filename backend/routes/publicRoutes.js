import express from "express";
import rateLimit from "express-rate-limit";
import { isDbConnected } from "../config/db.js";
import { isCloudinaryReady } from "../config/cloudinary.js";
import { sendEnquiryNotification } from "../config/mailer.js";
import {
  getSiteContent,
  getProjects,
  getProjectBySlug,
  getTestimonials,
  saveEnquiry,
} from "../services/datastore.js";
import { statusLabels } from "../../data/content.js";

const router = express.Router();

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^[0-9+\-\s()]{8,20}$/;

// Rate limit enquiry submissions: 5 per 10 minutes per IP
const enquiryLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many enquiries submitted. Please wait a few minutes before trying again." },
  skipSuccessfulRequests: false,
});

function field(value) {
  return typeof value === "string" ? value.trim() : "";
}

// GET /api/health
router.get("/health", async (_req, res) => {
  try {
    const content = await getSiteContent();
    res.json({
      ok: true,
      brand: content?.company?.name || "KKS Constructions",
      database: isDbConnected() ? "mongodb" : "disconnected",
      mediaStorage: isCloudinaryReady() ? "cloudinary" : "local",
    });
  } catch (err) {
    res.status(500).json({
      ok: false,
      error: err.message,
      database: isDbConnected() ? "mongodb" : "disconnected",
      mediaStorage: isCloudinaryReady() ? "cloudinary" : "local",
    });
  }
});

// GET /api/content
router.get("/content", async (_req, res) => {
  try {
    const content = await getSiteContent();
    res.set("Cache-Control", "no-store");
    const publishedContent = {
      ...content,
      sections: (Array.isArray(content?.sections) ? content.sections : []).filter(
        (section) => section.isPublished !== false && section.enabled !== false
      ),
    };
    res.json({
      ok: true,
      content: publishedContent,
    });
  } catch (err) {
    console.error("Public content load error:", err.message);
    res.status(500).json({ error: err.message || "Failed to load website content." });
  }
});

// GET /api/projects
router.get("/projects", async (req, res) => {
  try {
    res.set("Cache-Control", "no-store");
    const status = field(req.query.status).toLowerCase();
    const type = field(req.query.type).toLowerCase();

    let list = await getProjects(false); // Only published projects

    if (status && status !== "all") {
      list = list.filter((project) => project.status.toLowerCase() === status);
    }
    if (type && type !== "all") {
      list = list.filter((project) => project.type.toLowerCase() === type);
    }

    const content = await getSiteContent();

    res.json({
      ok: true,
      filters: statusLabels,
      disclaimer: content?.company?.disclaimers?.visuals || "",
      projects: list,
    });
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to load projects." });
  }
});

// GET /api/projects/:slug
router.get("/projects/:slug", async (req, res) => {
  try {
    res.set("Cache-Control", "no-store");
    const project = await getProjectBySlug(req.params.slug, false);
    if (!project) {
      return res.status(404).json({ error: "Project not found." });
    }
    const content = await getSiteContent();
    return res.json({
      ok: true,
      project,
      disclaimer: content?.company?.disclaimers?.visuals || "",
    });
  } catch (err) {
    return res.status(500).json({ error: err.message || "Failed to load project." });
  }
});

// GET /api/testimonials
router.get("/testimonials", async (_req, res) => {
  try {
    res.set("Cache-Control", "no-store");
    const list = await getTestimonials(false); // Only published testimonials
    res.json({
      ok: true,
      testimonials: list,
    });
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to load testimonials." });
  }
});

// POST /api/enquiries (Temporarily disabled: direct communication in effect)
router.post("/enquiries", (_req, res) => {
  return res.status(503).json({
    ok: false,
    error: "For any enquiries, please contact us directly through phone, WhatsApp, or Instagram.",
  });
});

/* TEMPORARILY DISABLED HANDLER (Uncomment to restore):
router.post("/enquiries", enquiryLimiter, async (req, res) => {
  try {
    const name = field(req.body?.name);
    const email = field(req.body?.email);
    const phone = field(req.body?.phone);
    const subject = field(req.body?.subject).slice(0, 200);
    const message = field(req.body?.message);
    const project = field(req.body?.project).slice(0, 200);
    const source = field(req.body?.source).slice(0, 80) || "website";

    const errors = {};
    if (name.length < 2) errors.name = "Please enter your full name.";
    if (!emailPattern.test(email)) errors.email = "Please enter a valid email.";
    if (!phonePattern.test(phone)) errors.phone = "Please enter a valid phone number.";
    if (message.length < 12) errors.message = "Please share a little more detail.";
    if (message.length > 5000) errors.message = "Message is too long.";
    if (name.length > 200) errors.name = "Name is too long.";

    if (Object.keys(errors).length) {
      return res.status(400).json({ error: "Please correct the highlighted fields.", errors });
    }

    const enquiryData = {
      name,
      email,
      phone,
      subject,
      message,
      project: project || null,
      source,
      status: "new",
    };

    const saved = await saveEnquiry(enquiryData);

    sendEnquiryNotification({ ...enquiryData, createdAt: saved.createdAt || new Date().toISOString() })
      .then((result) => {
        if (!result.ok) {
          console.warn("⚠️ Enquiry saved but email notification failed:", result.error);
        }
      })
      .catch(() => {});

    return res.status(201).json({
      ok: true,
      message:
        "Thank you. Your inquiry has been received. Our advisory desk will get in touch with you shortly.",
    });
  } catch (err) {
    console.error("Enquiry submission error:", err.message);
    return res.status(500).json({ error: err.message || "Failed to process your enquiry." });
  }
});
*/

export default router;
