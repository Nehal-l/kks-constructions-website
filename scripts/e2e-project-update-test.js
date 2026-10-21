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

const login = await call("/api/auth/login", {
  method: "POST",
  body: JSON.stringify({ email: env.OWNER_EMAIL, password: env.OWNER_INITIAL_PASSWORD }),
});
console.log("LOGIN", login.status);
if (login.status !== 200) process.exit(1);

const projs = await call("/api/admin/projects");
const project = projs.json.projects?.[0];
if (!project) {
  console.log("No projects found");
  process.exit(1);
}

const marker = `E2E-PROJ-${Date.now()}`;
const payload = { ...project, headline: marker };
console.log("Updating", project.slug, "with mongo fields _id:", project._id);

const update = await call(`/api/admin/projects/${encodeURIComponent(project.slug)}`, {
  method: "PUT",
  body: JSON.stringify(payload),
});
console.log("UPDATE", update.status, update.json.error || update.json.message);

const pub = await call(`/api/projects/${encodeURIComponent(project.slug)}`);
console.log("PUBLIC headline", pub.json.project?.headline);
console.log("MATCH", pub.json.project?.headline === marker);

if (update.status === 200 && marker) {
  await call(`/api/admin/projects/${encodeURIComponent(project.slug)}`, {
    method: "PUT",
    body: JSON.stringify({ headline: project.headline || "" }),
  });
  console.log("Restored headline");
}
