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

// CORS configuration supporting single or comma-separated origins with credentials
// Reads CLIENT_ORIGIN and FRONTEND_URL from environment
const rawOrigins = [
  process.env.CLIENT_ORIGIN,
  process.env.FRONTEND_URL,
]
  .filter(Boolean)
  .join(",");

const defaultOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:3000",
];

const configuredOrigins = Array.from(
  new Set(
    (rawOrigins || defaultOrigins.join(","))
      .split(",")
      .map((o) => {
        try {
          return new URL(o.trim()).origin;
        } catch {
          return o.trim().replace(/\/+$/, "");
        }
      })
      .filter(Boolean)
  )
);

if (process.env.NODE_ENV === "production") {
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
  if (process.env.OWNER_INITIAL_PASSWORD === "kks123") {
    throw new Error("The local development password cannot be used in production.");
  }
  if (process.env.OWNER_INITIAL_PASSWORD.length < 12 || process.env.SESSION_SECRET.length < 32) {
    throw new Error("Production bootstrap password and session secret must be strong, unique values.");
  }
  const invalidOrigin = configuredOrigins.some((origin) => {
    try {
      const parsed = new URL(origin);
      return parsed.protocol !== "https:" || parsed.origin !== origin;
    } catch {
      return true;
    }
  });
  if (invalidOrigin) {
    throw new Error("Every production CLIENT_ORIGIN must be an exact HTTPS origin.");
  }
}

app.set("trust proxy", 1);
app.use((req, res, next) => {
  if (process.env.NODE_ENV === "production") {
    if (!req.secure) return res.status(426).json({ error: "HTTPS is required." });
    res.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  }
  return next();
});

app.use(
  cors({
    origin: (requestOrigin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or same-origin)
      if (!requestOrigin) return callback(null, true);
      let normalizedOrigin = "";
      try {
        normalizedOrigin = new URL(requestOrigin).origin;
      } catch {
        normalizedOrigin = requestOrigin.replace(/\/+$/, "");
      }

      if (
        configuredOrigins.includes(normalizedOrigin) ||
        process.env.NODE_ENV !== "production"
      ) {
        return callback(null, true);
      }
      return callback(null, false);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
  })
);

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
    console.log(` KKS Constructions API server running on port ${port}`);
    console.log(` Owner bootstrap email: ${process.env.OWNER_EMAIL || "constructionskks@gmail.com"}`);
  });
}

startServer();
