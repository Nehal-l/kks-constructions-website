import "../config/loadEnv.js";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { isDbConnected } from "../config/db.js";
import { Project } from "../models/Project.js";
import { Testimonial } from "../models/Testimonial.js";
import { SiteContent } from "../models/SiteContent.js";
import { Enquiry } from "../models/Enquiry.js";
import {
  company as defaultCompany,
  projects as defaultProjects,
  testimonials as defaultTestimonials,
  pageContentDefaults,
  pageHeroDefaults,
} from "../../data/content.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const localDataFile = path.resolve(__dirname, "../../data/content.json");
const enquiriesFile = path.resolve(__dirname, "../../data/enquiries.json");

function mergeWithDefaults(defaults, stored) {
  if (Array.isArray(defaults)) return Array.isArray(stored) ? stored : defaults;
  if (!defaults || typeof defaults !== "object") return stored ?? defaults;
  if (!stored || typeof stored !== "object" || Array.isArray(stored)) return defaults;
  return Object.fromEntries(Object.keys({ ...defaults, ...stored }).map((key) => [
    key,
    key in defaults ? mergeWithDefaults(defaults[key], stored[key]) : stored[key],
  ]));
}

// Deep-merge a partial content patch over a base object.
function deepMergeContent(base, patch) {
  if (patch === undefined) return base;
  if (Array.isArray(patch)) return patch;
  if (!patch || typeof patch !== "object") return patch;
  if (!base || typeof base !== "object" || Array.isArray(base)) return patch;
  return Object.fromEntries(Object.keys({ ...base, ...patch }).map((key) => [
    key,
    key in patch ? deepMergeContent(base[key], patch[key]) : base[key],
  ]));
}

// Flatten a nested object patch into Mongo dotted `$set` paths
function flattenToDottedSet(patch, prefix = "", out = {}) {
  for (const [key, value] of Object.entries(patch)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === "object" && !Array.isArray(value)) {
      flattenToDottedSet(value, path, out);
    } else {
      out[path] = value;
    }
  }
  return out;
}

let localStore = {
  content: null,
  draftContent: null,
  projects: [],
  testimonials: [],
};

export function loadLocalStore() {
  try {
    if (fs.existsSync(localDataFile)) {
      const raw = fs.readFileSync(localDataFile, "utf-8");
      localStore = JSON.parse(raw);
      localStore.draftContent = localStore.draftContent || null;
      localStore.content = {
        ...pageContentDefaults,
        sectionVisibility: {},
        pageVisibility: {},
        sections: [],
        ...localStore.content,
        homeIntro: { ...pageContentDefaults.homeIntro, ...localStore.content?.homeIntro },
        pageCopy: mergeWithDefaults(pageContentDefaults.pageCopy, localStore.content?.pageCopy),
        pageHeroes: mergeWithDefaults(pageHeroDefaults, localStore.content?.pageHeroes),
      };
    } else {
      initializeLocalStore();
    }
  } catch (err) {
    console.error("Error reading content.json:", err.message);
    initializeLocalStore();
  }
}

// Ensure store is populated on import
loadLocalStore();

export function saveLocalStore() {
  try {
    fs.writeFileSync(localDataFile, JSON.stringify(localStore, null, 2), "utf-8");
  } catch (err) {
    console.error("Error saving content.json:", err.message);
  }
}

function initializeLocalStore() {
  localStore = {
    content: {
      company: defaultCompany,
      ...pageContentDefaults,
      values: defaultCompany.values || [],
      highlights: defaultCompany.highlights || [],
      pageHeroes: pageHeroDefaults,
      isPublished: true,
    },
    draftContent: null,
    projects: defaultProjects.map((p, idx) => ({
      ...p,
      isPublished: true,
      sortOrder: idx,
    })),
    testimonials: defaultTestimonials.map((t, idx) => ({
      ...t,
      rating: 5,
      isPublished: true,
      sortOrder: idx,
    })),
  };
  saveLocalStore();
}

// Bootstrap CMS data — seeds MongoDB collections on first run.
// Owner authentication is handled separately via environment variables (see backend/middleware/auth.js).
export async function bootstrapSystem() {
  loadLocalStore();

  // If MongoDB URI is configured, ensure DB is connected and seed CMS data
  if (process.env.MONGODB_URI) {
    if (!isDbConnected()) {
      throw new Error("MongoDB Atlas is configured but not connected during system bootstrap.");
    }

    try {
      const contentCount = await SiteContent.countDocuments();
      if (contentCount === 0) {
        await SiteContent.create({
          key: "main_content",
          ...localStore.content,
        });
        console.log(" Seeded site content into MongoDB Atlas.");
      } else {
        const storedContent = await SiteContent.findOne({ key: "main_content" });
        const rawContent = storedContent?.toObject() || {};
        const updates = {};
        for (const field of Object.keys(pageContentDefaults)) {
          if (!Object.prototype.hasOwnProperty.call(rawContent, field)) {
            updates[field] = pageContentDefaults[field];
          }
        }
        const mergedPageCopy = mergeWithDefaults(pageContentDefaults.pageCopy, rawContent.pageCopy);
        if (JSON.stringify(mergedPageCopy) !== JSON.stringify(rawContent.pageCopy || {})) {
          updates.pageCopy = mergedPageCopy;
        }
        const mergedPageHeroes = mergeWithDefaults(pageHeroDefaults, rawContent.pageHeroes);
        if (JSON.stringify(mergedPageHeroes) !== JSON.stringify(rawContent.pageHeroes || {})) {
          updates.pageHeroes = mergedPageHeroes;
        }
        if (Object.keys(updates).length) {
          await SiteContent.updateOne({ key: "main_content" }, { $set: updates });
        }
      }

      const projectsCount = await Project.countDocuments();
      if (projectsCount === 0) {
        await Project.insertMany(localStore.projects);
        console.log(` Seeded ${localStore.projects.length} projects into MongoDB Atlas.`);
      }

      const testimonialsCount = await Testimonial.countDocuments();
      if (testimonialsCount === 0) {
        await Testimonial.insertMany(localStore.testimonials);
        console.log(` Seeded ${localStore.testimonials.length} testimonials into MongoDB Atlas.`);
      }
    } catch (err) {
      console.error("❌ Error bootstrapping MongoDB collections:", err.message);
      throw new Error(`MongoDB bootstrap failed: ${err.message}`);
    }
  }
}

// Data Access API
function withoutStorageFields(document) {
  const {
    _id,
    key,
    createdAt,
    updatedAt,
    __v,
    draftContent,
    ...content
  } = document || {};
  return content;
}

export async function getSiteContent(includeDraft = false) {
  if (process.env.MONGODB_URI) {
    if (!isDbConnected()) {
      throw new Error("MongoDB Atlas is configured but not connected. Unable to load site content.");
    }
    try {
      const doc = await SiteContent.findOne({ key: "main_content" });
      if (doc) {
        const stored = doc.toObject();
        const publishedContent = withoutStorageFields(stored);
        return includeDraft && stored.draftContent
          ? deepMergeContent(publishedContent, stored.draftContent)
          : publishedContent;
      }
    } catch (err) {
      console.error("❌ Failed to query site content from MongoDB:", err.message);
      throw new Error(`Database query failed for site content: ${err.message}`);
    }
  }
  return includeDraft && localStore.draftContent
    ? deepMergeContent(localStore.content, localStore.draftContent)
    : localStore.content;
}

export async function updateSiteContent(data, publish = true) {
  if (process.env.MONGODB_URI) {
    if (!isDbConnected()) {
      throw new Error("MongoDB Atlas is configured but not connected. Content updates cannot be saved.");
    }
    try {
      if (!publish) {
        const existing = await SiteContent.findOne({ key: "main_content" });
        const mergedDraft = deepMergeContent(existing?.draftContent, data);
        await SiteContent.findOneAndUpdate(
          { key: "main_content" },
          { $set: { draftContent: mergedDraft } },
          { new: true, upsert: true, setDefaultsOnInsert: true }
        );
        localStore.draftContent = mergedDraft;
        saveLocalStore();
        return getSiteContent(true);
      }
      const existing = await SiteContent.findOne({ key: "main_content" });
      const publishedBase = existing ? withoutStorageFields(existing.toObject()) : {};
      const mergedPublish = deepMergeContent(
        deepMergeContent(publishedBase, existing?.draftContent),
        data
      );
      const updatePayload = {
        ...flattenToDottedSet(mergedPublish),
        sectionVisibility: mergedPublish.sectionVisibility || {},
        pageVisibility: mergedPublish.pageVisibility || {},
        sections: mergedPublish.sections || [],
      };
      const updated = await SiteContent.findOneAndUpdate(
        { key: "main_content" },
        { $set: updatePayload, $unset: { draftContent: 1 } },
        { new: true, upsert: true, setDefaultsOnInsert: true }
      );
      localStore.content = withoutStorageFields(updated.toObject());
      localStore.content.sectionVisibility = mergedPublish.sectionVisibility || {};
      localStore.content.pageVisibility = mergedPublish.pageVisibility || {};
      localStore.content.sections = mergedPublish.sections || [];
      localStore.draftContent = null;
      saveLocalStore();
      return getSiteContent();
    } catch (err) {
      console.error("❌ Failed to update site content in MongoDB:", err.message);
      throw new Error(`Database update failed for site content: ${err.message}`);
    }
  }

  // Pure local store mode when MONGODB_URI is not configured
  if (!publish) {
    localStore.draftContent = deepMergeContent(localStore.draftContent, data);
    saveLocalStore();
    return getSiteContent(true);
  }
  localStore.content = deepMergeContent(
    deepMergeContent(localStore.content, localStore.draftContent),
    data
  );
  if (data.sectionVisibility !== undefined) {
    localStore.content.sectionVisibility = { ...(localStore.content.sectionVisibility || {}), ...data.sectionVisibility };
  }
  if (data.pageVisibility !== undefined) {
    localStore.content.pageVisibility = { ...(localStore.content.pageVisibility || {}), ...data.pageVisibility };
  }
  if (data.sections !== undefined) {
    localStore.content.sections = data.sections;
  }
  localStore.draftContent = null;
  saveLocalStore();
  return localStore.content;
}

export async function getProjects(includeUnpublished = false) {
  if (process.env.MONGODB_URI) {
    if (!isDbConnected()) {
      throw new Error("MongoDB Atlas is configured but not connected. Unable to retrieve projects.");
    }
    try {
      const query = includeUnpublished ? {} : { isPublished: { $ne: false } };
      return await Project.find(query).sort({ sortOrder: 1, createdAt: -1 }).lean();
    } catch (err) {
      console.error("❌ Failed to query projects from MongoDB:", err.message);
      throw new Error(`Database query failed for projects: ${err.message}`);
    }
  }
  return localStore.projects
    .filter((p) => includeUnpublished || p.isPublished !== false)
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
}

export async function getProjectBySlug(slug, includeUnpublished = false) {
  if (process.env.MONGODB_URI) {
    if (!isDbConnected()) {
      throw new Error("MongoDB Atlas is configured but not connected. Unable to retrieve project.");
    }
    try {
      const query = includeUnpublished ? { slug } : { slug, isPublished: true };
      return await Project.findOne(query).lean();
    } catch (err) {
      console.error(`❌ Failed to query project '${slug}' from MongoDB:`, err.message);
      throw new Error(`Database query failed for project: ${err.message}`);
    }
  }
  return (
    localStore.projects.find(
      (p) => p.slug === slug && (includeUnpublished || p.isPublished !== false)
    ) || null
  );
}

export async function createProject(data) {
  if (process.env.MONGODB_URI) {
    if (!isDbConnected()) {
      throw new Error("MongoDB Atlas is configured but not connected. Cannot create project.");
    }
    try {
      const created = await Project.create(data);
      localStore.projects.push(created.toObject());
      saveLocalStore();
      return created.toObject();
    } catch (err) {
      console.error("❌ Failed to create project in MongoDB:", err.message);
      throw new Error(`Database write failed for project creation: ${err.message}`);
    }
  }
  const newProj = {
    _id: `proj_${Date.now()}`,
    ...data,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  localStore.projects.push(newProj);
  saveLocalStore();
  return newProj;
}

export async function updateProject(slugOrId, data) {
  if (process.env.MONGODB_URI) {
    if (!isDbConnected()) {
      throw new Error("MongoDB Atlas is configured but not connected. Cannot update project.");
    }
    try {
      const query = slugOrId.match(/^[0-9a-fA-F]{24}$/)
        ? { _id: slugOrId }
        : { slug: slugOrId };
      const updated = await Project.findOneAndUpdate(query, { $set: data }, { new: true });
      if (updated) {
        const idx = localStore.projects.findIndex(
          (p) => p.slug === updated.slug || p._id === updated._id.toString()
        );
        if (idx !== -1) localStore.projects[idx] = updated.toObject();
        saveLocalStore();
        return updated.toObject();
      }
      return null;
    } catch (err) {
      console.error("❌ Failed to update project in MongoDB:", err.message);
      throw new Error(`Database update failed for project: ${err.message}`);
    }
  }
  const idx = localStore.projects.findIndex(
    (p) => p.slug === slugOrId || p._id === slugOrId
  );
  if (idx === -1) return null;
  localStore.projects[idx] = {
    ...localStore.projects[idx],
    ...data,
    updatedAt: new Date().toISOString(),
  };
  saveLocalStore();
  return localStore.projects[idx];
}

export async function deleteProject(slugOrId) {
  if (process.env.MONGODB_URI) {
    if (!isDbConnected()) {
      throw new Error("MongoDB Atlas is configured but not connected. Cannot delete project.");
    }
    try {
      const query = slugOrId.match(/^[0-9a-fA-F]{24}$/)
        ? { _id: slugOrId }
        : { slug: slugOrId };
      const deleted = await Project.findOneAndDelete(query);
      if (deleted) {
        localStore.projects = localStore.projects.filter(
          (p) => p.slug !== deleted.slug && p._id !== deleted._id.toString()
        );
        saveLocalStore();
        return true;
      }
      return false;
    } catch (err) {
      console.error("❌ Failed to delete project in MongoDB:", err.message);
      throw new Error(`Database delete failed for project: ${err.message}`);
    }
  }
  const initLen = localStore.projects.length;
  localStore.projects = localStore.projects.filter(
    (p) => p.slug !== slugOrId && p._id !== slugOrId
  );
  saveLocalStore();
  return localStore.projects.length < initLen;
}

export async function reorderProjects(orderedSlugs) {
  if (!Array.isArray(orderedSlugs)) return false;

  if (process.env.MONGODB_URI) {
    if (!isDbConnected()) {
      throw new Error("MongoDB Atlas is configured but not connected. Cannot reorder projects.");
    }
    try {
      const updates = orderedSlugs.map((slug, idx) =>
        Project.updateOne({ slug }, { $set: { sortOrder: idx } })
      );
      await Promise.all(updates);
    } catch (err) {
      console.error("❌ Failed to reorder projects in MongoDB:", err.message);
      throw new Error(`Database update failed for project reordering: ${err.message}`);
    }
  }

  // Update local cache
  orderedSlugs.forEach((slug, idx) => {
    const proj = localStore.projects.find((p) => p.slug === slug);
    if (proj) proj.sortOrder = idx;
  });
  localStore.projects.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  saveLocalStore();
  return true;
}

// Testimonials
export async function getTestimonials(includeUnpublished = false) {
  if (process.env.MONGODB_URI) {
    if (!isDbConnected()) {
      throw new Error("MongoDB Atlas is configured but not connected. Unable to retrieve testimonials.");
    }
    try {
      const query = includeUnpublished ? {} : { isPublished: { $ne: false } };
      return await Testimonial.find(query).sort({ sortOrder: 1, createdAt: -1 }).lean();
    } catch (err) {
      console.error("❌ Failed to query testimonials from MongoDB:", err.message);
      throw new Error(`Database query failed for testimonials: ${err.message}`);
    }
  }
  return localStore.testimonials
    .filter((t) => includeUnpublished || t.isPublished !== false)
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
}

export async function createTestimonial(data) {
  if (process.env.MONGODB_URI) {
    if (!isDbConnected()) {
      throw new Error("MongoDB Atlas is configured but not connected. Cannot create testimonial.");
    }
    try {
      const created = await Testimonial.create(data);
      localStore.testimonials.push(created.toObject());
      saveLocalStore();
      return created.toObject();
    } catch (err) {
      console.error("❌ Failed to create testimonial in MongoDB:", err.message);
      throw new Error(`Database write failed for testimonial: ${err.message}`);
    }
  }
  const newT = {
    _id: `t_${Date.now()}`,
    ...data,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  localStore.testimonials.push(newT);
  saveLocalStore();
  return newT;
}

export async function updateTestimonial(id, data) {
  if (process.env.MONGODB_URI) {
    if (!isDbConnected()) {
      throw new Error("MongoDB Atlas is configured but not connected. Cannot update testimonial.");
    }
    try {
      const updated = await Testimonial.findByIdAndUpdate(id, { $set: data }, { new: true });
      if (updated) {
        const idx = localStore.testimonials.findIndex(
          (t) => t._id === id || t.id === id || t._id === updated._id.toString()
        );
        if (idx !== -1) localStore.testimonials[idx] = updated.toObject();
        saveLocalStore();
        return updated.toObject();
      }
      return null;
    } catch (err) {
      console.error("❌ Failed to update testimonial in MongoDB:", err.message);
      throw new Error(`Database update failed for testimonial: ${err.message}`);
    }
  }
  const idx = localStore.testimonials.findIndex((t) => t._id === id || t.id === id);
  if (idx === -1) return null;
  localStore.testimonials[idx] = {
    ...localStore.testimonials[idx],
    ...data,
    updatedAt: new Date().toISOString(),
  };
  saveLocalStore();
  return localStore.testimonials[idx];
}

export async function deleteTestimonial(id) {
  if (process.env.MONGODB_URI) {
    if (!isDbConnected()) {
      throw new Error("MongoDB Atlas is configured but not connected. Cannot delete testimonial.");
    }
    try {
      const deleted = await Testimonial.findByIdAndDelete(id);
      if (deleted) {
        localStore.testimonials = localStore.testimonials.filter(
          (t) => t._id !== id && t.id !== id
        );
        saveLocalStore();
        return true;
      }
      return false;
    } catch (err) {
      console.error("❌ Failed to delete testimonial in MongoDB:", err.message);
      throw new Error(`Database delete failed for testimonial: ${err.message}`);
    }
  }
  const initLen = localStore.testimonials.length;
  localStore.testimonials = localStore.testimonials.filter(
    (t) => t._id !== id && t.id !== id
  );
  saveLocalStore();
  return localStore.testimonials.length < initLen;
}

export async function reorderTestimonials(orderedIds) {
  if (!Array.isArray(orderedIds)) return false;

  if (process.env.MONGODB_URI) {
    if (!isDbConnected()) {
      throw new Error("MongoDB Atlas is configured but not connected. Cannot reorder testimonials.");
    }
    try {
      const updates = orderedIds.map((id, idx) =>
        Testimonial.findByIdAndUpdate(id, { $set: { sortOrder: idx } })
      );
      await Promise.all(updates);
    } catch (err) {
      console.error("❌ Failed to reorder testimonials in MongoDB:", err.message);
      throw new Error(`Database update failed for testimonial reordering: ${err.message}`);
    }
  }

  orderedIds.forEach((id, idx) => {
    const t = localStore.testimonials.find((item) => item._id === id || item.id === id);
    if (t) t.sortOrder = idx;
  });
  localStore.testimonials.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  saveLocalStore();
  return true;
}

// Enquiries
export async function saveEnquiry(payload) {
  if (process.env.MONGODB_URI) {
    if (!isDbConnected()) {
      throw new Error("MongoDB Atlas is configured but not connected. Cannot save enquiry.");
    }
    try {
      const created = await Enquiry.create(payload);
      return created.toObject();
    } catch (e) {
      console.error("❌ MongoDB save enquiry error:", e.message);
      throw new Error(`Database write failed for enquiry: ${e.message}`);
    }
  }

  // Local store fallback (only when MONGODB_URI not configured)
  const newEnq = { _id: `enq_${Date.now()}`, ...payload };
  try {
    let list = [];
    if (fs.existsSync(enquiriesFile)) {
      list = JSON.parse(fs.readFileSync(enquiriesFile, "utf-8"));
    }
    list.push(newEnq);
    fs.writeFileSync(enquiriesFile, JSON.stringify(list, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to save enquiry to disk:", err.message);
    throw new Error(`Failed to save enquiry: ${err.message}`);
  }
  return newEnq;
}

export async function updateEnquiryStatus(id, status) {
  const allowed = ["new", "read", "replied"];
  if (!allowed.includes(status)) {
    throw new Error(`Invalid status. Allowed: ${allowed.join(", ")}`);
  }
  if (process.env.MONGODB_URI) {
    if (!isDbConnected()) {
      throw new Error("MongoDB Atlas is configured but not connected. Cannot update enquiry.");
    }
    try {
      const updated = await Enquiry.findByIdAndUpdate(
        id,
        { $set: { status } },
        { new: true }
      );
      if (!updated) return null;
      return updated.toObject();
    } catch (err) {
      console.error("❌ Failed to update enquiry status in MongoDB:", err.message);
      throw new Error(`Database update failed for enquiry status: ${err.message}`);
    }
  }
  // Local fallback
  try {
    if (fs.existsSync(enquiriesFile)) {
      const list = JSON.parse(fs.readFileSync(enquiriesFile, "utf-8"));
      const idx = list.findIndex((e) => e._id === id || e.id === id);
      if (idx === -1) return null;
      list[idx] = { ...list[idx], status };
      fs.writeFileSync(enquiriesFile, JSON.stringify(list, null, 2), "utf-8");
      return list[idx];
    }
  } catch (err) {
    console.error("Failed to update enquiry status on disk:", err.message);
    throw new Error(`Failed to update enquiry: ${err.message}`);
  }
  return null;
}

export async function getEnquiries({ status } = {}) {
  if (process.env.MONGODB_URI) {
    if (!isDbConnected()) {
      throw new Error("MongoDB Atlas is configured but not connected. Unable to retrieve enquiries.");
    }
    try {
      const query = status ? { status } : {};
      return await Enquiry.find(query).sort({ createdAt: -1 }).lean();
    } catch (err) {
      console.error("❌ Failed to query enquiries from MongoDB:", err.message);
      throw new Error(`Database query failed for enquiries: ${err.message}`);
    }
  }
  try {
    if (fs.existsSync(enquiriesFile)) {
      const list = JSON.parse(fs.readFileSync(enquiriesFile, "utf-8")).reverse();
      return status ? list.filter((e) => e.status === status) : list;
    }
  } catch {
    return [];
  }
  return [];
}

