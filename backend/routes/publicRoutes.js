import express from "express";
import { isDbConnected } from "../config/db.js";
import { isCloudinaryReady } from "../config/cloudinary.js";
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

function field(value) {
  return typeof value === "string" ? value.trim() : "";
}

// GET /api/health
router.get("/health", async (_req, res) => {
  const content = await getSiteContent();
  res.json({
    ok: true,
    brand: content?.company?.name || "KKS Constructions",
    database: isDbConnected() ? "mongodb" : "local_resilient",
    mediaStorage: isCloudinaryReady() ? "cloudinary" : "local_resilient",
  });
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
    console.error("Public content load error:", err);
    res.status(500).json({ error: "Failed to load website content." });
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
  } catch (_err) {
    res.status(500).json({ error: "Failed to load projects." });
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
  } catch (_err) {
    return res.status(500).json({ error: "Failed to load project." });
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
  } catch (_err) {
    res.status(500).json({ error: "Failed to load testimonials." });
  }
});

// POST /api/enquiries
router.post("/enquiries", async (req, res) => {
  try {
    const name = field(req.body?.name);
    const email = field(req.body?.email);
    const phone = field(req.body?.phone);
    const message = field(req.body?.message);
    const project = field(req.body?.project);
    const source = field(req.body?.source) || "website";

    const errors = {};
    if (name.length < 2) errors.name = "Please enter your full name.";
    if (!emailPattern.test(email)) errors.email = "Please enter a valid email.";
    if (!phonePattern.test(phone)) errors.phone = "Please enter a valid phone number.";
    if (message.length < 12) errors.message = "Please share a little more detail.";

    if (Object.keys(errors).length) {
      return res.status(400).json({ error: "Please correct the highlighted fields.", errors });
    }

    const enquiry = {
      id: `enq_${Date.now()}`,
      name,
      email,
      phone,
      message,
      project: project || null,
      source,
      status: "new",
      createdAt: new Date().toISOString(),
    };

    await saveEnquiry(enquiry);

    return res.status(201).json({
      ok: true,
      message:
        "Thank you. Your inquiry has been received. Our advisory desk will get in touch with you shortly.",
    });
  } catch (err) {
    console.error("Enquiry submission error:", err);
    return res.status(500).json({ error: "Failed to process your enquiry." });
  }
});

export default router;
