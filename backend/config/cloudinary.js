import "./loadEnv.js";
import { v2 as cloudinary } from "cloudinary";
import fs from "node:fs";
import path from "node:path";
import streamifier from "streamifier";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const localUploadsDir = path.resolve(__dirname, "../uploads");

// Ensure local uploads directory exists
if (!fs.existsSync(localUploadsDir)) {
  fs.mkdirSync(localUploadsDir, { recursive: true });
}

let isCloudinaryConfigured = false;

export function maskApiKey(apiKey) {
  if (!apiKey || typeof apiKey !== "string") return "";
  if (apiKey.length <= 6) return "***";
  return `${apiKey.slice(0, 3)}***${apiKey.slice(-3)}`;
}

export function parseCloudinaryCredentials() {
  let cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();
  let apiKey = process.env.CLOUDINARY_API_KEY?.trim();
  let apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();
  const cloudinaryUrl = process.env.CLOUDINARY_URL?.trim();

  // If CLOUDINARY_URL is provided, or if CLOUDINARY_API_KEY contains full cloudinary:// URL
  const urlCandidate = (cloudinaryUrl && cloudinaryUrl.startsWith("cloudinary://"))
    ? cloudinaryUrl
    : (apiKey && apiKey.startsWith("cloudinary://"))
      ? apiKey
      : null;

  if (urlCandidate) {
    try {
      const parsed = new URL(urlCandidate);
      apiKey = parsed.username || apiKey;
      apiSecret = parsed.password || apiSecret;
      cloudName = parsed.hostname || cloudName;
    } catch (e) {
      console.warn("⚠️ Failed to parse Cloudinary URL:", e.message);
    }
  }

  return { cloudName, apiKey, apiSecret };
}

export async function configureCloudinary() {
  const { cloudName, apiKey, apiSecret } = parseCloudinaryCredentials();

  const hasAnyCredential = Boolean(
    cloudName || apiKey || apiSecret || process.env.CLOUDINARY_URL
  );

  if (!hasAnyCredential) {
    isCloudinaryConfigured = false;
    console.log("ℹ️ Cloudinary credentials not configured. Local media storage will be used for uploads.");
    return false;
  }

  const validCloudName = cloudName && /^[A-Za-z0-9_-]{2,}$/.test(cloudName);
  const validApiKey = apiKey && /^[0-9A-Za-z_-]{6,}$/.test(apiKey);
  const validApiSecret = apiSecret && apiSecret.length >= 8 && !/[<>]/.test(apiSecret);

  if (!validCloudName || !validApiKey || !validApiSecret) {
    isCloudinaryConfigured = false;
    console.error("❌ Cloudinary credentials format is invalid:");
    if (!validCloudName) console.error("   Cloud Name is missing or invalid format.");
    if (!validApiKey) console.error("   API Key is missing or invalid format.");
    if (!validApiSecret) console.error("   API Secret is missing or invalid.");
    if (process.env.NODE_ENV === "production") {
      throw new Error("Invalid Cloudinary configuration in production.");
    }
    return false;
  }

  try {
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true,
    });

    const pingRes = await cloudinary.api.ping();
    if (pingRes && pingRes.status === "ok") {
      isCloudinaryConfigured = true;
      console.log(` Cloudinary storage verified successfully [cloud: "${cloudName}", apiKey: ${maskApiKey(apiKey)}].`);
      return true;
    }
    throw new Error(`Cloudinary ping returned unexpected status: ${JSON.stringify(pingRes)}`);
  } catch (err) {
    isCloudinaryConfigured = false;
    console.error(`❌ Cloudinary authentication/connectivity failed [cloud: "${cloudName}", apiKey: ${maskApiKey(apiKey)}]: ${err.message}`);
    if (process.env.NODE_ENV === "production") {
      throw new Error(`Cloudinary initialization failed: ${err.message}`);
    }
    return false;
  }
}

export function isCloudinaryReady() {
  return isCloudinaryConfigured;
}

export async function uploadImageBuffer(buffer, originalname, folder = "kks_constructions") {
  if (isCloudinaryConfigured) {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: "image",
          transformation: [{ quality: "auto", fetch_format: "auto" }],
        },
        (error, result) => {
          if (error) {
            console.error("❌ Cloudinary upload error:", error.message);
            return reject(new Error(`Cloudinary upload failed: ${error.message}`));
          }
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
            format: result.format,
            bytes: result.bytes,
            storage: "cloudinary",
          });
        }
      );
      streamifier.createReadStream(buffer).pipe(uploadStream);
    });
  }

  // If Cloudinary credentials were provided in env but service is not ready, do not silently fall back
  const hasCloudinaryEnv = Boolean(
    process.env.CLOUDINARY_CLOUD_NAME ||
    process.env.CLOUDINARY_API_KEY ||
    process.env.CLOUDINARY_URL
  );
  if (hasCloudinaryEnv) {
    throw new Error("Cloudinary credentials are configured but the service is unavailable. Image upload aborted to prevent unpersisted storage.");
  }

  // Only fall back to local disk in local development when Cloudinary is not configured at all
  const ext = buffer[0] === 0xff && buffer[1] === 0xd8
    ? ".jpg"
    : buffer.subarray(0, 4).toString("ascii") === "RIFF"
      ? ".webp"
      : buffer[0] === 0x89 && buffer[1] === 0x50
        ? ".png"
        : ".avif";
  const cleanBase = path.basename(originalname, path.extname(originalname)).replace(/[^a-zA-Z0-9_-]/g, "_");
  const uniqueName = `${cleanBase}_${Date.now()}${ext}`;
  const targetPath = path.join(localUploadsDir, uniqueName);

  await fs.promises.writeFile(targetPath, buffer);

  return {
    url: `/uploads/${uniqueName}`,
    publicId: uniqueName,
    storage: "local",
  };
}

export { cloudinary, localUploadsDir };
