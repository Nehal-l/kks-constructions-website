// Round-trip test: GET admin content -> PUT it back -> GET public content -> diff.
// Usage: node scripts/e2e-roundtrip-test.js
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

function deepDiff(a, b, path = "", out = []) {
  if (out.length > 200) return out;
  const aObj = a && typeof a === "object";
  const bObj = b && typeof b === "object";
  if (aObj && bObj && Array.isArray(a) === Array.isArray(b)) {
    const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
    for (const k of keys) deepDiff(a[k], b[k], path ? `${path}.${k}` : k, out);
    return out;
  }
  if (JSON.stringify(a) !== JSON.stringify(b)) {
    out.push(`${path}\n    admin  = ${JSON.stringify(a)?.slice(0, 160)}\n    public = ${JSON.stringify(b)?.slice(0, 160)}`);
  }
  return out;
}

const login = await call("/api/auth/login", {
  method: "POST",
  body: JSON.stringify({ email: env.OWNER_EMAIL, password: env.OWNER_INITIAL_PASSWORD }),
});
if (login.status !== 200) {
  console.log("LOGIN FAILED", login.status, JSON.stringify(login.json));
  process.exit(1);
}
console.log("LOGIN OK");

const adminGet = await call("/api/admin/content");
const adminContent = adminGet.json?.content || {};
console.log("ADMIN CONTENT KEYS:", Object.keys(adminContent).join(", "));

// Publish the exact admin payload back
const put = await call("/api/admin/content", {
  method: "PUT",
  body: JSON.stringify(adminContent),
});
console.log("PUT STATUS:", put.status, put.json?.ok ? "ok" : put.json?.error);

const publicGet = await call("/api/content");
const publicContent = publicGet.json?.content || {};
console.log("PUBLIC CONTENT KEYS:", Object.keys(publicContent).join(", "));

const diffs = deepDiff(adminContent, publicContent);
console.log(`\n=== DIFFS (${diffs.length}) ===`);
diffs.forEach((d) => console.log(" - " + d));

const missingInPublic = Object.keys(adminContent).filter((k) => !(k in publicContent));
const extraInPublic = Object.keys(publicContent).filter((k) => !(k in adminContent));
console.log("\nKEYS MISSING FROM PUBLIC:", missingInPublic.join(", ") || "(none)");
console.log("KEYS ONLY IN PUBLIC:", extraInPublic.join(", ") || "(none)");
