import express from "express";
import { requireAuth, requireTrustedOrigin } from "../middleware/auth.js";
import { uploadSingleImage } from "../middleware/upload.js";
import { uploadImageBuffer, isCloudinaryReady } from "../config/cloudinary.js";
import { isDbConnected } from "../config/db.js";
import {
  getSiteContent,
  updateSiteContent,
  getProjects,
  getProjectBySlug,
  createProject,
  updateProject,
  deleteProject,
  reorderProjects,
  getTestimonials,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
  reorderTestimonials,
  getEnquiries,
  updateEnquiryStatus,
} from "../services/datastore.js";

const router = express.Router();

// Apply requireAuth to all admin routes
router.use(requireTrustedOrigin);
router.use(requireAuth);
router.use((_req, res, next) => {
  res.set("Cache-Control", "no-store");
  next();
});

const editableContentKeys = new Set([
  "company", "values", "highlights", "pageHeroes", "sections",
  "navigationItems", "pageVisibility", "sectionVisibility", "standards",
  "milestones", "faqs", "pressMentions", "homeIntro", "pageCopy", "footer", "isPublished",
]);
const sectionPages = new Set(["home", "about", "projects", "contact", "testimonials", "services", "privacy", "projectDetails"]);
const heroPages = new Set(["home", "about", "projects", "contact", "testimonials", "services", "privacy"]);
const pageCopyPages = new Set([...heroPages, "projectDetails"]);
const visibilityPages = new Set([...heroPages, "projectDetails"]);
const sectionTypes = new Set(["text", "image", "gallery", "callout", "cta", "quote", "video"]);
const managedSectionIds = new Set([
  "home-hero", "home-intro", "home-highlights", "home-projects", "home-testimonials", "home-contact",
  "about-hero", "about-story", "about-mission-vision", "about-standards", "about-values", "about-milestones",
  "projects-hero", "projects-list",
  "contact-hero", "contact-details", "contact-faq",
  "testimonials-hero", "testimonials-list", "testimonials-recognition",
  "services-hero", "privacy-hero", "privacy-content", "project-detail-hero", "project-detail-content",
]);
const projectFields = new Set([
  "name", "slug", "status", "type", "location", "price", "headline", "summary",
  "overview", "specs", "amenities", "locationNotes", "cover", "gallery", "videos",
  "brochure", "featured", "isPublished", "sortOrder",
]);
const pageCollections = {
  standards: ["icon", "title", "text"],
  milestones: ["year", "title", "desc"],
  faqs: ["q", "a"],
  pressMentions: ["publication", "quote"],
};

function isSafeContentUrl(value) {
  return typeof value === "string" &&
    (value.startsWith("/") && !value.startsWith("//") || /^https?:\/\//i.test(value));
}

function validatePageCopy(pageCopy) {
  if (!pageCopy || typeof pageCopy !== "object" || Array.isArray(pageCopy) ||
    Object.keys(pageCopy).length > pageCopyPages.size) {
    return "Page copy must be an object with supported page content.";
  }
  for (const [page, sections] of Object.entries(pageCopy)) {
    if (!pageCopyPages.has(page) || !sections || typeof sections !== "object" ||
      Array.isArray(sections) || Object.keys(sections).length > 40) {
      return "Page copy contains an unsupported page or section.";
    }
    for (const [section, fields] of Object.entries(sections)) {
      if (!/^[a-zA-Z0-9_-]{1,80}$/.test(section) || !fields ||
        typeof fields !== "object" || Array.isArray(fields) ||
        Object.keys(fields).length > 40) {
        return "Page copy contains an invalid section.";
      }
      for (const [field, value] of Object.entries(fields)) {
        if (!/^[a-zA-Z0-9_-]{1,80}$/.test(field) || typeof value !== "string" || value.length > 10000) {
          return "Page copy contains an invalid or oversized field.";
        }
        if (field.toLowerCase().endsWith("image") && value && !isSafeContentUrl(value)) {
          return "Page copy image URLs must be valid local or HTTP URLs.";
        }
        if (field.toLowerCase().endsWith("url") && value &&
          !(value.startsWith("/") && !value.startsWith("//") || /^https?:\/\//i.test(value))) {
          return "Page copy links must be valid local or HTTP URLs.";
        }
      }
    }
  }
  return null;
}

function pickProjectPayload(payload) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return {};
  }
  return Object.fromEntries(
    Object.entries(payload).filter(([key]) => projectFields.has(key))
  );
}

function validateProjectPayload(payload, partial = false) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return "Project data must be an object.";
  }
  if (Object.keys(payload).some((key) => !projectFields.has(key))) {
    return "Project contains unsupported fields.";
  }
  if (!partial && (
    typeof payload.name !== "string" || !payload.name.trim() || payload.name.length > 160 ||
    typeof payload.location !== "string" || !payload.location.trim() || payload.location.length > 200 ||
    !isSafeContentUrl(payload.cover)
  )) {
    return "Project name, location, and a valid cover image are required.";
  }
  if (payload.status !== undefined && !["ongoing", "completed", "upcoming"].includes(payload.status)) {
    return "Project status is invalid.";
  }
  for (const [field, maxLength] of Object.entries({
    name: 160, slug: 160, type: 80, location: 200, headline: 240,
    summary: 2000, overview: 10000, locationNotes: 5000,
  })) {
    if (payload[field] !== undefined && (
      typeof payload[field] !== "string" || payload[field].length > maxLength
    )) {
      return `Project ${field} is invalid.`;
    }
  }
  if (payload.cover !== undefined && !isSafeContentUrl(payload.cover)) {
    return "Project cover URL is invalid.";
  }
  if (payload.brochure !== undefined && payload.brochure !== "" && !isSafeContentUrl(payload.brochure)) {
    return "Project brochure URL is invalid.";
  }
  for (const field of ["gallery", "videos"]) {
    if (payload[field] !== undefined && (
      !Array.isArray(payload[field]) || payload[field].length > 100 ||
      payload[field].some((url) => !isSafeContentUrl(url))
    )) {
      return `Project ${field} must contain valid URLs.`;
    }
  }
  if (payload.price !== undefined && (typeof payload.price !== "string" || payload.price.length > 120)) {
    return "Project price is invalid.";
  }
  if (payload.specs !== undefined && (
    !Array.isArray(payload.specs) || payload.specs.length > 100 ||
    payload.specs.some((item) => !item || typeof item.label !== "string" ||
      typeof item.value !== "string" || item.label.length > 120 || item.value.length > 500)
  )) {
    return "Project specifications are invalid.";
  }
  if (payload.amenities !== undefined && (
    !Array.isArray(payload.amenities) || payload.amenities.length > 100 ||
    payload.amenities.some((item) => typeof item !== "string" || item.length > 300)
  )) {
    return "Project amenities are invalid.";
  }
  if (["featured", "isPublished"].some((field) =>
    payload[field] !== undefined && typeof payload[field] !== "boolean"
  )) {
    return "Project visibility settings are invalid.";
  }
  if (payload.sortOrder !== undefined && !Number.isFinite(payload.sortOrder)) {
    return "Project order is invalid.";
  }
  return null;
}

function validateContentPayload(payload) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return "Content must be an object.";
  }
  if (Object.keys(payload).some((key) => !editableContentKeys.has(key))) {
    return "Content includes unsupported fields.";
  }
  if (payload.sections !== undefined) {
    if (!Array.isArray(payload.sections) || payload.sections.length > 100) {
      return "Sections must be an array with no more than 100 items.";
    }
    const ids = new Set();
    for (const section of payload.sections) {
      if (
        !section || typeof section !== "object" ||
        typeof section.id !== "string" || !/^[a-zA-Z0-9_-]{1,80}$/.test(section.id) ||
        ids.has(section.id) || !sectionPages.has(section.page) ||
        !sectionTypes.has(section.type) ||
        typeof section.title !== "string" || section.title.length > 200 ||
        typeof (section.body || "") !== "string" || (section.body || "").length > 10000 ||
        typeof (section.image || "") !== "string" || (section.image || "").length > 2048 ||
        typeof (section.videoUrl || "") !== "string" || (section.videoUrl || "").length > 2048 ||
        typeof (section.buttonUrl || "") !== "string" || (section.buttonUrl || "").length > 2048 ||
        (section.image && !isSafeContentUrl(section.image)) ||
        (section.videoUrl && !isSafeContentUrl(section.videoUrl)) ||
        (section.buttonUrl && !isSafeContentUrl(section.buttonUrl)) ||
        (section.gallery !== undefined && (
          !Array.isArray(section.gallery) || section.gallery.length > 40 ||
          section.gallery.some((image) => !isSafeContentUrl(image))
        )) ||
        typeof (section.eyebrow || "") !== "string" || (section.eyebrow || "").length > 120 ||
        typeof (section.imageAlt || "") !== "string" || (section.imageAlt || "").length > 250 ||
        typeof (section.buttonLabel || "") !== "string" || (section.buttonLabel || "").length > 80 ||
        !["cream", "sand", "ink"].includes(section.background || "cream") ||
        !["top", "bottom"].includes(section.placement || "bottom") ||
        (section.sortOrder !== undefined && !Number.isFinite(section.sortOrder)) ||
        (section.enabled !== undefined && typeof section.enabled !== "boolean") ||
        (section.isPublished !== undefined && typeof section.isPublished !== "boolean")
      ) {
        return "A section has invalid or oversized fields.";
      }
      ids.add(section.id);
    }
  }
  if (payload.navigationItems !== undefined && (
    !Array.isArray(payload.navigationItems) || payload.navigationItems.length > 30 ||
    payload.navigationItems.some((item) =>
      !item || typeof item.label !== "string" || item.label.length > 80 ||
      typeof item.to !== "string" || item.to.length > 2048 ||
      !(item.to.startsWith("/") && !item.to.startsWith("//") || /^https:\/\//i.test(item.to))
    ) ||
    ["/", "/projects", "/contact"].some((path) =>
      !payload.navigationItems.some((item) => item.to === path)
    )
  )) {
    return "Navigation items are invalid.";
  }
  if (payload.pageVisibility !== undefined && (
    !payload.pageVisibility || typeof payload.pageVisibility !== "object" ||
    Array.isArray(payload.pageVisibility) ||
    Object.keys(payload.pageVisibility).some((key) =>
      !visibilityPages.has(key)
    ) ||
    Object.values(payload.pageVisibility).some((value) => typeof value !== "boolean") ||
    ["home", "projects", "contact"].some((page) => payload.pageVisibility[page] === false)
  )) {
    return "Page visibility settings are invalid.";
  }
  if (payload.sectionVisibility !== undefined && (
    !payload.sectionVisibility || typeof payload.sectionVisibility !== "object" ||
    Array.isArray(payload.sectionVisibility) ||
    Object.keys(payload.sectionVisibility).some((key) => !managedSectionIds.has(key)) ||
    Object.values(payload.sectionVisibility).some((value) => typeof value !== "boolean")
  )) {
    return "Built-in section visibility settings are invalid.";
  }
  for (const [collection, fields] of Object.entries(pageCollections)) {
    if (payload[collection] !== undefined && (
      !Array.isArray(payload[collection]) || payload[collection].length > 100 ||
      payload[collection].some((item) => !item || typeof item !== "object" ||
        fields.some((field) => typeof item[field] !== "string" || item[field].length > 2000))
    )) {
      return `${collection} entries are invalid.`;
    }
  }
  if (payload.homeIntro !== undefined && (
    !payload.homeIntro || typeof payload.homeIntro !== "object" || Array.isArray(payload.homeIntro) ||
    ["image", "imageAlt", "eyebrow", "title", "copy", "buttonLabel", "buttonUrl"].some((key) =>
      payload.homeIntro[key] !== undefined && (typeof payload.homeIntro[key] !== "string" || payload.homeIntro[key].length > 2048)
    ) ||
    (payload.homeIntro.image && !isSafeContentUrl(payload.homeIntro.image)) ||
    (payload.homeIntro.buttonUrl && (!payload.homeIntro.buttonUrl.startsWith("/") || payload.homeIntro.buttonUrl.startsWith("//")))
  )) {
    return "Homepage introduction content is invalid.";
  }
  if (payload.footer !== undefined && (
    !payload.footer || typeof payload.footer !== "object" || Array.isArray(payload.footer) ||
    Object.keys(payload.footer).some((key) => ![
      "tagline", "established", "copyright", "enquiryLabel", "enquiryUrl",
      "exploreLabel", "visitLabel", "privacyLabel",
    ].includes(key)) ||
    Object.entries(payload.footer).some(([key, value]) =>
      typeof value !== "string" || value.length > (key === "enquiryUrl" ? 2048 : 240)
    ) ||
    (payload.footer.enquiryUrl && !(
      payload.footer.enquiryUrl.startsWith("/") && !payload.footer.enquiryUrl.startsWith("//")
    ))
  )) {
    return "Footer content contains invalid or oversized fields.";
  }
  if (payload.pageHeroes !== undefined) {
    const heroFields = new Set(["title", "eyebrow", "copy", "image", "primaryButtonLabel", "primaryButtonUrl", "secondaryButtonLabel", "secondaryButtonUrl"]);
    if (!payload.pageHeroes || typeof payload.pageHeroes !== "object" || Array.isArray(payload.pageHeroes)) {
      return "Page banners are invalid.";
    }
    for (const [page, hero] of Object.entries(payload.pageHeroes)) {
      if (!heroPages.has(page) || !hero || typeof hero !== "object" || Array.isArray(hero) ||
        Object.keys(hero).some((key) => !heroFields.has(key)) ||
        Object.entries(hero).some(([key, value]) => typeof value !== "string" || value.length > 2048) ||
        (hero.image && !isSafeContentUrl(hero.image)) ||
        [hero.primaryButtonUrl, hero.secondaryButtonUrl].some((url) => url && (!url.startsWith("/") || url.startsWith("//")))) {
        return "A page banner has invalid or unsafe fields.";
      }
    }
  }
  if (payload.pageCopy !== undefined) {
    const pageCopyError = validatePageCopy(payload.pageCopy);
    if (pageCopyError) return pageCopyError;
  }
  return null;
}

// GET /api/admin/overview
router.get("/overview", async (_req, res) => {
  try {
    const allProjects = await getProjects(true);
    const allTestimonials = await getTestimonials(true);
    const enquiries = await getEnquiries();

    res.json({
      ok: true,
      stats: {
        totalProjects: allProjects.length,
        publishedProjects: allProjects.filter((p) => p.isPublished !== false).length,
        hiddenProjects: allProjects.filter((p) => p.isPublished === false).length,
        totalTestimonials: allTestimonials.length,
        publishedTestimonials: allTestimonials.filter((t) => t.isPublished !== false).length,
        totalEnquiries: enquiries.length,
      },
      system: {
        database: isDbConnected() ? "MongoDB Atlas" : "Disconnected",
        media: isCloudinaryReady() ? "Cloudinary Cloud" : "Local Storage",
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to generate admin overview." });
  }
});

// --- SITE CONTENT & SECTIONS ---

// GET /api/admin/content
router.get("/content", async (_req, res) => {
  try {
    const content = await getSiteContent(true);
    res.json({ ok: true, content });
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to load content." });
  }
});

// PUT /api/admin/content
router.put("/content", async (req, res) => {
  try {
    const validationError = validateContentPayload(req.body);
    if (validationError) return res.status(400).json({ error: validationError });
    const publish = req.query.publish !== "false";
    const updated = await updateSiteContent(req.body, publish);
    res.json({
      ok: true,
      message: publish ? "Site content published successfully." : "Draft saved privately.",
      content: updated,
    });
  } catch (err) {
    console.error("Update site content error:", err.message);
    res.status(500).json({ error: err.message || "Failed to update site content." });
  }
});

// --- PROJECTS CMS ---

// GET /api/admin/projects
router.get("/projects", async (_req, res) => {
  try {
    const projects = await getProjects(true);
    res.json({ ok: true, projects });
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to load projects." });
  }
});

// POST /api/admin/projects
router.post("/projects", async (req, res) => {
  try {
    const body = pickProjectPayload(req.body || {});
    const validationError = validateProjectPayload(body);
    if (validationError) return res.status(400).json({ error: validationError });

    let slug = (body.slug || body.name)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    const existing = await getProjectBySlug(slug, true);
    if (existing) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }

    const newProject = await createProject({
      ...body,
      slug,
      isPublished: body.isPublished !== undefined ? body.isPublished : true,
    });

    res.status(201).json({ ok: true, message: "Project created successfully.", project: newProject });
  } catch (err) {
    console.error("Create project error:", err.message);
    res.status(500).json({ error: err.message || "Failed to create project." });
  }
});

// PUT /api/admin/projects/:idOrSlug
router.put("/projects/:idOrSlug", async (req, res) => {
  try {
    const payload = pickProjectPayload(req.body || {});
    const validationError = validateProjectPayload(payload, true);
    if (validationError) return res.status(400).json({ error: validationError });
    const updated = await updateProject(req.params.idOrSlug, payload);
    if (!updated) {
      return res.status(404).json({ error: "Project not found." });
    }
    res.json({ ok: true, message: "Project updated successfully.", project: updated });
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to update project." });
  }
});

// DELETE /api/admin/projects/:idOrSlug
router.delete("/projects/:idOrSlug", async (req, res) => {
  try {
    const success = await deleteProject(req.params.idOrSlug);
    if (!success) {
      return res.status(404).json({ error: "Project not found or already deleted." });
    }
    res.json({ ok: true, message: "Project deleted successfully." });
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to delete project." });
  }
});

// PATCH /api/admin/projects/:idOrSlug/toggle-publish
router.patch("/projects/:idOrSlug/toggle-publish", async (req, res) => {
  try {
    const project = await getProjectBySlug(req.params.idOrSlug, true);
    if (!project) {
      return res.status(404).json({ error: "Project not found." });
    }
    const nextState = !project.isPublished;
    const updated = await updateProject(req.params.idOrSlug, { isPublished: nextState });
    res.json({
      ok: true,
      message: `Project is now ${nextState ? "published (visible to public)" : "hidden (draft mode)"}.`,
      isPublished: nextState,
      project: updated,
    });
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to toggle project publish state." });
  }
});

// POST /api/admin/projects/reorder
router.post("/projects/reorder", async (req, res) => {
  try {
    const { orderedSlugs } = req.body;
    if (!Array.isArray(orderedSlugs)) {
      return res.status(400).json({ error: "orderedSlugs array is required." });
    }
    await reorderProjects(orderedSlugs);
    res.json({ ok: true, message: "Project display order updated." });
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to reorder projects." });
  }
});

// --- TESTIMONIALS CMS ---

// GET /api/admin/testimonials
router.get("/testimonials", async (_req, res) => {
  try {
    const testimonials = await getTestimonials(true);
    res.json({ ok: true, testimonials });
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to load testimonials." });
  }
});

// POST /api/admin/testimonials
router.post("/testimonials", async (req, res) => {
  try {
    const { quote, name, role } = req.body;
    if (!quote || !name || !role) {
      return res.status(400).json({ error: "Quote, name, and role are required." });
    }
    const newT = await createTestimonial({
      ...req.body,
      isPublished: req.body.isPublished !== undefined ? req.body.isPublished : true,
    });
    res.status(201).json({ ok: true, message: "Testimonial created successfully.", testimonial: newT });
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to create testimonial." });
  }
});

// PUT /api/admin/testimonials/:id
router.put("/testimonials/:id", async (req, res) => {
  try {
    const updated = await updateTestimonial(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ error: "Testimonial not found." });
    }
    res.json({ ok: true, message: "Testimonial updated successfully.", testimonial: updated });
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to update testimonial." });
  }
});

// DELETE /api/admin/testimonials/:id
router.delete("/testimonials/:id", async (req, res) => {
  try {
    const success = await deleteTestimonial(req.params.id);
    if (!success) {
      return res.status(404).json({ error: "Testimonial not found." });
    }
    res.json({ ok: true, message: "Testimonial deleted successfully." });
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to delete testimonial." });
  }
});

// PATCH /api/admin/testimonials/:id/toggle-publish
router.patch("/testimonials/:id/toggle-publish", async (req, res) => {
  try {
    const all = await getTestimonials(true);
    const item = all.find((t) => t._id === req.params.id || t.id === req.params.id);
    if (!item) {
      return res.status(404).json({ error: "Testimonial not found." });
    }
    const nextState = !item.isPublished;
    const updated = await updateTestimonial(req.params.id, { isPublished: nextState });
    res.json({
      ok: true,
      message: `Testimonial is now ${nextState ? "published" : "hidden"}.`,
      isPublished: nextState,
      testimonial: updated,
    });
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to toggle testimonial publish state." });
  }
});

// POST /api/admin/testimonials/reorder
router.post("/testimonials/reorder", async (req, res) => {
  try {
    const { orderedIds } = req.body;
    if (!Array.isArray(orderedIds)) {
      return res.status(400).json({ error: "orderedIds array is required." });
    }
    await reorderTestimonials(orderedIds);
    res.json({ ok: true, message: "Testimonial display order updated." });
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to reorder testimonials." });
  }
});

// --- IMAGE UPLOAD (CLOUDINARY / LOCAL) ---

// POST /api/admin/upload
router.post("/upload", (req, res) => {
  uploadSingleImage(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ error: err.message || "File upload failed." });
    }
    if (!req.file) {
      return res.status(400).json({ error: "Please select an image file to upload." });
    }
    const bytes = req.file.buffer;
    const isJpeg = bytes.length > 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
    const isPng = bytes.length > 8 && bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
    const isWebp = bytes.length > 12 && bytes.toString("ascii", 0, 4) === "RIFF" && bytes.toString("ascii", 8, 12) === "WEBP";
    const isAvif = bytes.length > 12 && bytes.toString("ascii", 4, 12).includes("ftypavif");
    if (!isJpeg && !isPng && !isWebp && !isAvif) {
      return res.status(400).json({ error: "The uploaded file is not a supported image." });
    }

    try {
      const result = await uploadImageBuffer(
        req.file.buffer,
        req.file.originalname,
        "kks_constructions"
      );

      return res.json({
        ok: true,
        message: "Image uploaded successfully.",
        url: result.url,
        publicId: result.publicId,
        storage: result.storage,
      });
    } catch (uploadErr) {
      console.error("Upload handler error:", uploadErr.message);
      return res.status(500).json({ error: uploadErr.message || "Failed to process image upload." });
    }
  });
});

// --- ENQUIRIES ---

// GET /api/admin/enquiries
router.get("/enquiries", async (req, res) => {
  try {
    const status = req.query.status?.trim();
    const list = await getEnquiries(status ? { status } : {});
    res.json({ ok: true, enquiries: list });
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to load enquiries." });
  }
});

// PATCH /api/admin/enquiries/:id/status
router.patch("/enquiries/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ["new", "read", "replied"];
    if (!allowed.includes(status)) {
      return res.status(400).json({ error: `Status must be one of: ${allowed.join(", ")}` });
    }
    const updated = await updateEnquiryStatus(req.params.id, status);
    if (!updated) {
      return res.status(404).json({ error: "Enquiry not found." });
    }
    res.json({ ok: true, message: `Enquiry marked as ${status}.`, enquiry: updated });
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to update enquiry status." });
  }
});

export default router;
