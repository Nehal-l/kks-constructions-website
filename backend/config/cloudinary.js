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

export function configureCloudinary() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();
  const apiKey = process.env.CLOUDINARY_API_KEY?.trim();
  const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();
  const validCredentials = cloudName && /^[A-Za-z0-9_-]{2,}$/.test(cloudName) &&
    /^[A-Za-z0-9_-]{6,}$/.test(apiKey || "") && apiSecret &&
    !/[<>]/.test(apiSecret);

  if (validCredentials) {
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true,
    });
    isCloudinaryConfigured = true;
    console.log(" Cloudinary storage configured successfully.");
  } else {
    isCloudinaryConfigured = false;
    console.log("ℹ️ Cloudinary credentials not configured. Local media storage will be used.");
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
          if (error) return reject(error);
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

  // Fallback: save to local uploads directory
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
