import mongoose from "mongoose";

const specSchema = new mongoose.Schema(
  {
    label: { type: String, required: true },
    value: { type: String, required: true },
  },
  { _id: false }
);

const projectSchema = new mongoose.Schema(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["ongoing", "completed", "upcoming"],
      default: "ongoing",
    },
    type: {
      type: String,
      default: "Residential",
    },
    location: {
      type: String,
      required: true,
    },
    price: {
      type: String,
      default: "",
      maxlength: 120,
    },
    headline: {
      type: String,
      default: "",
    },
    summary: {
      type: String,
      default: "",
    },
    overview: {
      type: String,
      default: "",
    },
    specs: [specSchema],
    amenities: [
      {
        type: String,
      },
    ],
    locationNotes: {
      type: String,
      default: "",
    },
    cover: {
      type: String,
      required: true,
    },
    gallery: [
      {
        type: String,
      },
    ],
    videos: [
      {
        type: String,
      },
    ],
    brochure: {
      type: String,
      default: "",
    },
    featured: {
      type: Boolean,
      default: false,
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

projectSchema.index({ sortOrder: 1, createdAt: -1 });

export const Project = mongoose.models.Project || mongoose.model("Project", projectSchema);
