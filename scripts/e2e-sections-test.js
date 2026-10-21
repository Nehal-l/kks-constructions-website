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
const content = admin.json.content || {};
console.log("Has pageVisibility:", "pageVisibility" in content, content.pageVisibility);
console.log("Has sectionVisibility:", "sectionVisibility" in content, content.sectionVisibility);
console.log("Has footer:", "footer" in content);
console.log("sections count:", (content.sections || []).length);

const section = {
  id: `section_e2e_${Date.now()}`,
  page: "home",
  placement: "bottom",
  type: "text",
  title: "E2E Section",
  eyebrow: "",
  body: "Test body",
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

const payload = { ...content, sections: [...(content.sections || []), section] };
const put = await call("/api/admin/content", { method: "PUT", body: JSON.stringify(payload) });
console.log("PUT full content", put.status, put.json.error || put.json.message);

const pub = await call("/api/content");
const found = (pub.json.content?.sections || []).find((s) => s.id === section.id);
console.log("Public has section:", Boolean(found), found?.title);

// cleanup
const cleaned = { sections: (put.json.content?.sections || []).filter((s) => s.id !== section.id) };
await call("/api/admin/content", { method: "PUT", body: JSON.stringify(cleaned) });
console.log("Cleaned up");
