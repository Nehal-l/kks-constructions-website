import "./loadEnv.js";
import mongoose from "mongoose";

let isConnected = false;

export function maskMongoUri(uri) {
  if (!uri || typeof uri !== "string") return "";
  try {
    const parsed = new URL(uri);
    if (parsed.password) {
      parsed.password = "****";
    }
    return parsed.toString();
  } catch {
    return uri.replace(/:([^@/]+)@/, ":****@");
  }
}

export function validateMongoUri(rawUri) {
  if (!rawUri || typeof rawUri !== "string" || !rawUri.trim()) {
    return { valid: false, error: "MONGODB_URI is not provided." };
  }
  const uri = rawUri.trim().replace(/^["']|["']$/g, "");
  if (!uri.startsWith("mongodb://") && !uri.startsWith("mongodb+srv://")) {
    return {
      valid: false,
      error: "Invalid MONGODB_URI scheme. URI must start with 'mongodb://' or 'mongodb+srv://'.",
    };
  }
  if (/<(user|username|password|pass)>/i.test(uri)) {
    return {
      valid: false,
      error: "MONGODB_URI contains unreplaced placeholder credentials (<username> or <password>).",
    };
  }
  try {
    const parsed = new URL(uri);
    if (!parsed.hostname) {
      return { valid: false, error: "MONGODB_URI does not specify a valid host/cluster." };
    }
    return { valid: true, uri, parsed };
  } catch (e) {
    return { valid: false, error: `Invalid MONGODB_URI format: ${e.message}` };
  }
}

export async function connectDB() {
  const rawUri = process.env.MONGODB_URI?.trim();

  if (!rawUri) {
    console.log("ℹ️ MONGODB_URI not provided. Local file storage mode active.");
    isConnected = false;
    return false;
  }

  const validation = validateMongoUri(rawUri);
  if (!validation.valid) {
    const masked = maskMongoUri(rawUri);
    console.error(`❌ MongoDB configuration error for ${masked}: ${validation.error}`);
    throw new Error(`MongoDB URI validation failed: ${validation.error}`);
  }

  const maskedUri = maskMongoUri(rawUri);

  try {
    mongoose.set("strictQuery", true);
    console.log(` Connecting to MongoDB Atlas (${maskedUri})...`);

    mongoose.connection.removeAllListeners("connected");
    mongoose.connection.removeAllListeners("error");
    mongoose.connection.removeAllListeners("disconnected");

    mongoose.connection.on("connected", () => {
      isConnected = true;
    });

    mongoose.connection.on("error", (err) => {
      isConnected = false;
      console.error("❌ MongoDB connection error:", err.message);
    });

    mongoose.connection.on("disconnected", () => {
      isConnected = false;
      console.warn("⚠️ MongoDB disconnected from server.");
    });

    await mongoose.connect(rawUri, {
      serverSelectionTimeoutMS: 8000,
      connectTimeoutMS: 10000,
    });

    isConnected = true;
    const dbName = mongoose.connection.name;
    const host = mongoose.connection.host;
    console.log(` Connected to MongoDB Atlas successfully [host: ${host}, db: "${dbName}"].`);
    return true;
  } catch (err) {
    isConnected = false;
    console.error(`❌ MongoDB connection failed (${maskedUri}): [${err.name}] ${err.message}`);
    if (err.message.includes("bad auth") || err.message.includes("Authentication failed")) {
      console.error("   Reason: Invalid database credentials (username/password). Check MONGODB_URI.");
    } else if (err.message.includes("ENOTFOUND") || err.message.includes("querySrv")) {
      console.error("   Reason: DNS/Host lookup failed. Check cluster hostname in MONGODB_URI.");
    } else if (err.name === "MongooseServerSelectionError" || err.message.includes("timed out")) {
      console.error("   Reason: Connection timed out. Ensure your IP address is whitelisted in MongoDB Atlas Network Access.");
    }
    throw err;
  }
}

export function isDbConnected() {
  return isConnected && mongoose.connection.readyState === 1;
}
