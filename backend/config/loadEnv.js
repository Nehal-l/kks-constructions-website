import dotenv from "dotenv";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let envLoaded = false;

export function loadEnv() {
  if (envLoaded) return;

  const candidatePaths = [
    path.resolve(__dirname, "../.env"),
    path.resolve(process.cwd(), "backend/.env"),
    path.resolve(process.cwd(), ".env"),
  ];

  let resolvedPath = null;
  for (const candidate of candidatePaths) {
    if (fs.existsSync(candidate)) {
      resolvedPath = candidate;
      break;
    }
  }

  if (resolvedPath) {
    dotenv.config({ path: resolvedPath });
    envLoaded = true;
    const rel = path.relative(process.cwd(), resolvedPath);
    console.log(` [env] Loaded environment configuration from: ${rel || path.basename(resolvedPath)}`);
  } else {
    dotenv.config();
    envLoaded = true;
    console.warn("⚠️ [env] No candidate .env file found; using default environment variables.");
  }

  const keysToClean = [
    "MONGODB_URI",
    "CLOUDINARY_CLOUD_NAME",
    "CLOUDINARY_API_KEY",
    "CLOUDINARY_API_SECRET",
    "CLOUDINARY_URL",
    "PORT",
    "NODE_ENV",
    "CLIENT_ORIGIN",
    "SESSION_SECRET",
    "OWNER_USERNAME",
    "OWNER_EMAIL",
    "OWNER_INITIAL_PASSWORD",
    "ENQUIRY_RECEIVER_EMAIL",
    "RESEND_API_KEY",
    "RESEND_FROM_EMAIL",
  ];

  for (const key of keysToClean) {
    if (typeof process.env[key] === "string") {
      process.env[key] = process.env[key].trim().replace(/^["']|["']$/g, "");
    }
  }
}

// Auto-execute on import
loadEnv();

