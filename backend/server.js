import "./config/loadEnv.js";
import cors from "cors";
import express from "express";
import cookieParser from "cookie-parser";

import { connectDB, isDbConnected } from "./config/db.js";
import { configureCloudinary, isCloudinaryReady, localUploadsDir } from "./config/cloudinary.js";
import { configureMailer } from "./config/mailer.js";
import { bootstrapSystem } from "./services/datastore.js";
import authRoutes from "./routes/authRoutes.js";
import publicRoutes from "./routes/publicRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

const app = express();
const port = Number(process.env.PORT) || 5000;

// Helper to reliably normalize any URL into standard origin format (e.g. "https://example.com")
export function normalizeOrigin(val) {
  if (!val || typeof val !== "string") return "";
  let trimmed = val.trim();
  if (!trimmed) return "";
  if (!/^https?:\/\//i.test(trimmed)) {
    trimmed = `https://${trimmed}`;
  }
  try {
    return new URL(trimmed).origin;
  } catch {
    return trimmed.replace(/\/+$/, "");
  }
}

// CORS configuration: reads frontend origins from CLIENT_ORIGIN, FRONTEND_URL, CLIENT_URL, or CORS_ORIGIN
// Supports single or comma-separated origins, with or without trailing slashes.
const rawOrigins = [
  process.env.CLIENT_ORIGIN,
  process.env.FRONTEND_URL,
  process.env.CLIENT_URL,
  process.env.CORS_ORIGIN,
]
  .filter(Boolean)
  .join(",");

const defaultOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost:5000",
  "http://127.0.0.1:5000",
];

const envOrigins = (rawOrigins || "")
  .split(",")
  .map(normalizeOrigin)
  .filter(Boolean);

export const configuredOrigins = Array.from(
  new Set([
    ...defaultOrigins.map(normalizeOrigin),
    ...envOrigins,
  ])
);

if (process.env.NODE_ENV === "production") {
  // Ensure CLIENT_ORIGIN is filled from FRONTEND_URL or CLIENT_URL if not directly set
  if (!process.env.CLIENT_ORIGIN && (process.env.FRONTEND_URL || process.env.CLIENT_URL || process.env.CORS_ORIGIN)) {
    process.env.CLIENT_ORIGIN = process.env.FRONTEND_URL || process.env.CLIENT_URL || process.env.CORS_ORIGIN;
  }

  const requiredProductionSettings = [
    "MONGODB_URI",
    "CLOUDINARY_CLOUD_NAME",
    "CLOUDINARY_API_KEY",
    "CLOUDINARY_API_SECRET",
    "SESSION_SECRET",
    "OWNER_INITIAL_PASSWORD",
    "CLIENT_ORIGIN",
  ];
  const missing = requiredProductionSettings.filter((key) => !process.env[key]?.trim());
  if (missing.length) {
    throw new Error(`Missing required production configuration: ${missing.join(", ")}`);
  }
  if (process.env.SESSION_SECRET.length < 32) {
    throw new Error("Production SESSION_SECRET must be at least 32 characters.");
  }
  const invalidOrigin = envOrigins.some((origin) => {
    try {
      const parsed = new URL(origin);
      return parsed.protocol !== "https:" && parsed.hostname !== "localhost" && parsed.hostname !== "127.0.0.1";
    } catch {
      return true;
    }
  });
  if (invalidOrigin) {
    throw new Error("Every production client origin in .env must be a valid HTTPS or localhost origin.");
  }
}

app.set("trust proxy", 1);
app.set("etag", false);

app.use((req, res, next) => {
  if (process.env.NODE_ENV === "production") {
    if (!req.secure) return res.status(426).json({ error: "HTTPS is required." });
    res.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  }
  return next();
});

const corsOptions = {
  origin: (requestOrigin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, server-to-server, or same-origin)
    if (!requestOrigin) return callback(null, true);

    const normalizedReqOrigin = normalizeOrigin(requestOrigin);

    if (
      process.env.CORS_ORIGIN === "*" ||
      configuredOrigins.includes(normalizedReqOrigin) ||
      process.env.NODE_ENV !== "production"
    ) {
      return callback(null, true);
    }
    console.warn(`⚠️ [CORS Blocked] Origin: "${requestOrigin}" (normalized: "${normalizedReqOrigin}"). Allowed origins:`, configuredOrigins);
    return callback(new Error(`Origin ${requestOrigin} is not allowed by CORS.`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
    "Cache-Control",
    "Pragma",
    "Expires",
    "Origin",
    "If-Modified-Since",
    "X-Forwarded-Proto",
  ],
  exposedHeaders: ["Content-Range", "X-Content-Range"],
  maxAge: 86400, // 24 hours preflight cache
};

app.use(cors(corsOptions));

app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "2mb" }));
app.use(cookieParser());

// Serve local uploads folder statically for resilient local media storage
app.use("/uploads", express.static(localUploadsDir));

// Connect to external services & bootstrap initial system data
async function startServer() {
  await connectDB();
  await configureCloudinary();
  configureMailer();
  if (process.env.MONGODB_URI && !isDbConnected()) {
    throw new Error("MongoDB Atlas URI is configured, but database connection could not be established.");
  }
  if (process.env.NODE_ENV === "production" && !isDbConnected()) {
    throw new Error("MongoDB Atlas must be reachable in production.");
  }
  if (process.env.NODE_ENV === "production" && !isCloudinaryReady()) {
    throw new Error("Cloudinary must be configured in production.");
  }
  await bootstrapSystem();

  // Mount API modules
  app.use("/api/auth", authRoutes);
  app.use("/api/admin", adminRoutes);
  app.use("/api", publicRoutes);

  // Catch-all 404 handler for unmatched API routes
  app.use("/api", (_req, res) => {
    res.status(404).json({ error: "API endpoint not found." });
  });

  // Global error handler
  app.use((err, _req, res, _next) => {
    console.error("Unhandled server error:", err);
    res.status(err.status || 500).json({
      error: err.message || "Internal server error.",
    });
  });

  app.listen(port, () => {
    console.log(`✅ KKS Constructions API server running on port ${port}`);
    console.log(`👤 Owner bootstrap email: ${process.env.OWNER_EMAIL || "constructionskks@gmail.com"}`);
  });
}

startServer();
