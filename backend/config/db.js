import mongoose from "mongoose";

let isConnected = false;

export async function connectDB() {
  const uri = process.env.MONGODB_URI?.trim();

  if (!uri) {
    console.log("ℹ️ MONGODB_URI not provided. Running in resilient local datastore mode.");
    isConnected = false;
    return false;
  }

  try {
    mongoose.set("strictQuery", true);
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = true;
    console.log(" Connected to MongoDB Atlas successfully.");
    return true;
  } catch (err) {
    console.warn("⚠️ MongoDB connection failed. Falling back to local datastore mode:", err.message);
    isConnected = false;
    return false;
  }
}

export function isDbConnected() {
  return isConnected && mongoose.connection.readyState === 1;
}

