import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import bcrypt from "bcryptjs";
import { isDbConnected } from "../config/db.js";
import { User } from "../models/User.js";
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

// Deep-merge a partial content patch over a base object. Arrays are replaced
// wholesale (list edits are authoritative), while nested objects (company,
// pageHeroes, homeIntro, footer, pageCopy, ...) are merged field-by-field so a
// partial admin update does not wipe sibling fields.
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

// Flatten a nested object patch into Mongo dotted `$set` paths so a partial
// update to a nested object (e.g. homeIntro.title) merges field-by-field
// instead of replacing the whole subdocument. Arrays are treated as leaves.
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
  users: [],
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
    users: [],
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

// Bootstrap Owner User and seed DB if connected
export async function bootstrapSystem() {
  loadLocalStore();

  const ownerEmail = (process.env.OWNER_EMAIL || "constructionskks@gmail.com").toLowerCase().trim();
  const ownerUsername = (process.env.OWNER_USERNAME || ownerEmail.split("@")[0]).toLowerCase().trim();
  const initialPassword = process.env.OWNER_INITIAL_PASSWORD || (
    process.env.NODE_ENV === "production" ? "" : "kks123"
  );
  if (!initialPassword) {
    throw new Error("OWNER_INITIAL_PASSWORD must be configured before production bootstrap.");
  }

  // Bootstrap in local store
  let localOwner = localStore.users.find(
    (u) => u.username === ownerUsername || u.email === ownerEmail
  );
  if (!localOwner) {
    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(initialPassword, salt);
    localOwner = {
      _id: `user_${Date.now()}`,
      username: ownerUsername,
      email: ownerEmail,
      password: passwordHash,
      role: "owner",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    localStore.users.push(localOwner);
    saveLocalStore();
    console.log(` Seeded owner account in local store: ${ownerUsername} (${ownerEmail})`);
  }

  // If MongoDB is connected, ensure Owner, Content, Projects, and Testimonials are in Mongo
  if (isDbConnected()) {
    try {
      const existingUser = await User.findOne({
        $or: [{ username: ownerUsername }, { email: ownerEmail }],
      });
      if (!existingUser) {
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(initialPassword, salt);
        await User.create({
          username: ownerUsername,
          email: ownerEmail,
          password: passwordHash,
          role: "owner",
        });
        console.log(` Seeded owner account in MongoDB: ${ownerUsername} (${ownerEmail})`);
      }

      const contentCount = await SiteContent.countDocuments();
      if (contentCount === 0) {
        await SiteContent.create({
          key: "main_content",
          ...localStore.content,
        });
        console.log(" Seeded site content into MongoDB.");
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
        console.log(` Seeded ${localStore.projects.length} projects into MongoDB.`);
      }

      const testimonialsCount = await Testimonial.countDocuments();
      if (testimonialsCount === 0) {
        await Testimonial.insertMany(localStore.testimonials);
        console.log(` Seeded ${localStore.testimonials.length} testimonials into MongoDB.`);
      }
    } catch (err) {
      console.error("Error bootstrapping MongoDB collections:", err.message);
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
  if (isDbConnected()) {
    const doc = await SiteContent.findOne({ key: "main_content" });
    if (doc) {
      const stored = doc.toObject();
      const publishedContent = withoutStorageFields(stored);
      return includeDraft && stored.draftContent
        ? deepMergeContent(publishedContent, stored.draftContent)
        : publishedContent;
    }
  }
  return includeDraft && localStore.draftContent
    ? deepMergeContent(localStore.content, localStore.draftContent)
    : localStore.content;
}

export async function updateSiteContent(data, publish = true) {
  if (isDbConnected()) {
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
  }
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
  if (isDbConnected()) {
    const query = includeUnpublished ? {} : { isPublished: { $ne: false } };
    return Project.find(query).sort({ sortOrder: 1, createdAt: -1 }).lean();
  }
  return localStore.projects
    .filter((p) => includeUnpublished || p.isPublished !== false)
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
}

export async function getProjectBySlug(slug, includeUnpublished = false) {
  if (isDbConnected()) {
    const query = includeUnpublished ? { slug } : { slug, isPublished: true };
    return Project.findOne(query).lean();
  }
  return (
    localStore.projects.find(
      (p) => p.slug === slug && (includeUnpublished || p.isPublished !== false)
    ) || null
  );
}

export async function createProject(data) {
  if (isDbConnected()) {
    const created = await Project.create(data);
    localStore.projects.push(created.toObject());
    saveLocalStore();
    return created.toObject();
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
  if (isDbConnected()) {
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
  if (isDbConnected()) {
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

  if (isDbConnected()) {
    const updates = orderedSlugs.map((slug, idx) =>
      Project.updateOne({ slug }, { $set: { sortOrder: idx } })
    );
    await Promise.all(updates);
  }

  // Update local
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
  if (isDbConnected()) {
    const query = includeUnpublished ? {} : { isPublished: { $ne: false } };
    return Testimonial.find(query).sort({ sortOrder: 1, createdAt: -1 }).lean();
  }
  return localStore.testimonials
    .filter((t) => includeUnpublished || t.isPublished !== false)
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
}

export async function createTestimonial(data) {
  if (isDbConnected()) {
    const created = await Testimonial.create(data);
    localStore.testimonials.push(created.toObject());
    saveLocalStore();
    return created.toObject();
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
  if (isDbConnected()) {
    const updated = await Testimonial.findByIdAndUpdate(id, { $set: data }, { new: true });
    if (updated) {
      const idx = localStore.testimonials.findIndex(
        (t) => t._id === id || t.id === id || t._id === updated._id.toString()
      );
      if (idx !== -1) localStore.testimonials[idx] = updated.toObject();
      saveLocalStore();
      return updated.toObject();
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
  if (isDbConnected()) {
    const deleted = await Testimonial.findByIdAndDelete(id);
    if (deleted) {
      localStore.testimonials = localStore.testimonials.filter(
        (t) => t._id !== id && t.id !== id
      );
      saveLocalStore();
      return true;
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

  if (isDbConnected()) {
    const updates = orderedIds.map((id, idx) =>
      Testimonial.findByIdAndUpdate(id, { $set: { sortOrder: idx } })
    );
    await Promise.all(updates);
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
  if (isDbConnected()) {
    try {
      await Enquiry.create(payload);
    } catch (e) {
      console.error("MongoDB save enquiry error:", e.message);
    }
  }

  // Also persist to enquiries.json
  try {
    let list = [];
    if (fs.existsSync(enquiriesFile)) {
      list = JSON.parse(fs.readFileSync(enquiriesFile, "utf-8"));
    }
    list.push(payload);
    fs.writeFileSync(enquiriesFile, JSON.stringify(list, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to save enquiry to disk:", err.message);
  }
}

export async function getEnquiries() {
  if (isDbConnected()) {
    const docs = await Enquiry.find().sort({ createdAt: -1 }).lean();
    if (docs && docs.length > 0) return docs;
  }
  try {
    if (fs.existsSync(enquiriesFile)) {
      return JSON.parse(fs.readFileSync(enquiriesFile, "utf-8")).reverse();
    }
  } catch {
    return [];
  }
  return [];
}

// User Lookups
export async function findUserByLogin(identifier) {
  const clean = identifier.toLowerCase().trim();
  if (isDbConnected()) {
    const user = await User.findOne({
      $or: [{ username: clean }, { email: clean }],
    });
    if (user) return user;
  }
  return localStore.users.find((u) => u.username === clean || u.email === clean) || null;
}

export async function updateUserPassword(userId, newPasswordHash) {
  if (isDbConnected()) {
    await User.findByIdAndUpdate(userId, {
      $set: { password: newPasswordHash, updatedAt: new Date() },
    });
  }
  const u = localStore.users.find(
    (user) => user._id === userId || user._id.toString() === userId.toString()
  );
  if (u) {
    u.password = newPasswordHash;
    u.updatedAt = new Date().toISOString();
    saveLocalStore();
  }
  return true;
}
