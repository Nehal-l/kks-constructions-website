import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

const env = {};
for (const raw of fs.readFileSync(path.join(root, "backend", ".env"), "utf-8").split(/\r?\n/)) {
  const match = raw.match(/^\s*([^#=]+?)\s*=\s*(.*)$/);
  if (match) env[match[1].trim()] = match[2].trim().replace(/^["']|["']$/g, "");
}

const BASE = `http://localhost:${env.PORT || 5000}`;
let cookie = "";

async function call(pathname, options = {}) {
  const headers = { ...(options.headers || {}) };
  if (cookie) headers.Cookie = cookie;
  if (options.body) headers["Content-Type"] = "application/json";
  const res = await fetch(`${BASE}${pathname}`, { ...options, headers });
  for (const c of res.headers.getSetCookie?.() || []) {
    if (c.startsWith("kks_admin_session=")) cookie = c.split(";")[0];
  }
  return { status: res.status, json: await res.json().catch(() => ({})) };
}

await call("/api/auth/login", {
  method: "POST",
  body: JSON.stringify({ email: env.OWNER_EMAIL, password: env.OWNER_INITIAL_PASSWORD }),
});

const admin = await call("/api/admin/content");
const content = {
  ...admin.json.content,
  sections: admin.json.content.sections || [],
  navigationItems: admin.json.content.navigationItems || [],
  footer: admin.json.content.footer || {},
  pageVisibility: admin.json.content.pageVisibility || {},
  sectionVisibility: admin.json.content.sectionVisibility || {},
};

const section = {
  id: `section_e2e_${Date.now()}`,
  page: "about",
  placement: "bottom",
  type: "text",
  title: "About E2E",
  eyebrow: "",
  body: "Body",
  image: "",
  imageAlt: "",
  gallery: [],
  videoUrl: "",
  buttonLabel: "",
  buttonUrl: "",
  background: "cream",
  enabled: true,
  isPublished: true,
  sortOrder: 0,
};

content.sections = [...content.sections, section];
content.sectionVisibility = { ...content.sectionVisibility, "about-story": false };

const put = await call("/api/admin/content", { method: "PUT", body: JSON.stringify(content) });
console.log("SAVE like AdminSections", put.status, put.json.error || put.json.message);

await call("/api/admin/content", {
  method: "PUT",
  body: JSON.stringify({ sections: content.sections.filter((s) => s.id !== section.id), sectionVisibility: {} }),
});
