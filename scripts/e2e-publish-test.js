// End-to-end CMS publish flow test.
// Usage: node scripts/e2e-publish-test.js
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
const COOKIE = "kks_admin_session";
let cookie = "";

async function call(pathname, options = {}) {
  const headers = { ...(options.headers || {}) };
  if (cookie) headers.Cookie = cookie;
  if (options.body) headers["Content-Type"] = "application/json";
  const res = await fetch(`${BASE}${pathname}`, { ...options, headers, redirect: "manual" });
  const setCookie = res.headers.getSetCookie?.() || [];
  for (const c of setCookie) {
    if (c.startsWith(`${COOKIE}=`)) cookie = c.split(";")[0];
  }
  const text = await res.text();
  let json;
  try { json = JSON.parse(text); } catch { json = text; }
  return { status: res.status, json };
}

function log(label, result) {
  console.log(`\n=== ${label} -> HTTP ${result.status}`);
  const body = typeof result.json === "string" ? result.json : JSON.stringify(result.json, null, 2);
  console.log(body.length > 2500 ? body.slice(0, 2500) + "\n...[truncated]" : body);
}

const marker = `E2E-${Date.now()}`;

console.log(`Backend: ${BASE}`);
console.log(`Owner: ${env.OWNER_EMAIL}`);

const login = await call("/api/auth/login", {
  method: "POST",
  body: JSON.stringify({ email: env.OWNER_EMAIL, password: env.OWNER_INITIAL_PASSWORD }),
});
log("1. LOGIN", login);
if (login.status !== 200) process.exit(1);

const me = await call("/api/auth/me");
log("2. SESSION /me", me);

const adminGet = await call("/api/admin/content");
log("3. GET /api/admin/content", { status: adminGet.status, json: { ok: adminGet.json?.ok, keys: Object.keys(adminGet.json?.content || {}) } });

const before = await call("/api/content");
console.log(`\n=== 4. GET /api/content (before) -> HTTP ${before.status}`);
console.log("   company.tagline =", JSON.stringify(before.json?.content?.company?.tagline));
console.log("   homeIntro.title =", JSON.stringify(before.json?.content?.homeIntro?.title));

// Publish a change
const publish = await call("/api/admin/content", {
  method: "PUT",
  body: JSON.stringify({
    homeIntro: {
      title: marker,
      eyebrow: "E2E Test",
      copy: "Automated publish verification.",
      buttonLabel: "Read more",
      buttonUrl: "/about",
    },
  }),
});
log("5. PUT /api/admin/content (publish=true)", { status: publish.status, json: { ok: publish.json?.ok, message: publish.json?.message, error: publish.json?.error, homeIntro: publish.json?.content?.homeIntro } });

const after = await call("/api/content");
console.log(`\n=== 6. GET /api/content (after) -> HTTP ${after.status}`);
console.log("   homeIntro.title =", JSON.stringify(after.json?.content?.homeIntro?.title));
console.log("   MATCHES MARKER =", after.json?.content?.homeIntro?.title === marker);

// Draft save (publish=false)
const draft = await call("/api/admin/content?publish=false", {
  method: "PUT",
  body: JSON.stringify({ homeIntro: { title: `${marker}-DRAFT` } }),
});
log("7. PUT /api/admin/content?publish=false", { status: draft.status, json: { ok: draft.json?.ok, message: draft.json?.message, error: draft.json?.error, title: draft.json?.content?.homeIntro?.title } });

const afterDraft = await call("/api/content");
console.log(`\n=== 8. GET /api/content (after draft) -> HTTP ${afterDraft.status}`);
console.log("   homeIntro.title =", JSON.stringify(afterDraft.json?.content?.homeIntro?.title));
console.log("   draft leaked publicly =", afterDraft.json?.content?.homeIntro?.title === `${marker}-DRAFT`);

const adminAfterDraft = await call("/api/admin/content");
console.log("\n=== 9. GET /api/admin/content (draft view)");
console.log("   homeIntro.title =", JSON.stringify(adminAfterDraft.json?.content?.homeIntro?.title));

// Restore
const restore = await call("/api/admin/content", {
  method: "PUT",
  body: JSON.stringify({ homeIntro: { title: "A quieter idea of grandeur." } }),
});
log("10. RESTORE", { status: restore.status, json: { ok: restore.json?.ok, error: restore.json?.error } });

const final = await call("/api/content");
console.log("\n=== 11. FINAL public read");
console.log("   homeIntro.title =", JSON.stringify(final.json?.content?.homeIntro?.title));

const noAuth = await fetch(`${BASE}/api/admin/content`);
console.log(`\n=== 12. Unauthenticated admin access -> HTTP ${noAuth.status}`);
