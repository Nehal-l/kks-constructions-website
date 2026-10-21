import mongoose from "mongoose";

const siteContentSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      default: "main_content",
      unique: true,
    },
    company: {
      name: { type: String, default: "KKS Constructions" },
      shortName: { type: String, default: "KKS" },
      tagline: { type: String, default: "Landmarks of quiet luxury" },
      logo: { type: String, default: "/images/logo.png" },
      description: { type: String, default: "" },
      overview: { type: String, default: "" },
      mission: { type: String, default: "" },
      vision: { type: String, default: "" },
      contact: {
        addressLine: { type: String, default: "" },
        city: { type: String, default: "" },
        phone: { type: String, default: "" },
        email: { type: String, default: "" },
        hours: { type: String, default: "" },
        mapNote: { type: String, default: "" },
        whatsapp: { type: String, default: "" },
      },
      social: {
        instagram: { type: String, default: "" },
        linkedin: { type: String, default: "" },
        youtube: { type: String, default: "" },
      },
      disclaimers: {
        visuals: { type: String, default: "" },
        legal: { type: String, default: "" },
      },
    },
    values: [
      {
        title: { type: String, default: "" },
        text: { type: String, default: "" },
      },
    ],
    highlights: [
      {
        value: { type: String, default: "" },
        label: { type: String, default: "" },
      },
    ],
    pageHeroes: {
      home: {
        title: { type: String, default: "Architecture that holds the light." },
        eyebrow: { type: String, default: "KKS Constructions" },
        copy: { type: String, default: "" },
        image: { type: String, default: "/images/hero-tower.jpg" },
        primaryButtonLabel: { type: String, default: "View projects" },
        primaryButtonUrl: { type: String, default: "/projects" },
        secondaryButtonLabel: { type: String, default: "Our story" },
        secondaryButtonUrl: { type: String, default: "/about" },
      },
      about: {
        title: { type: String, default: "A quieter idea of grandeur." },
        eyebrow: { type: String, default: "About Us" },
        copy: { type: String, default: "" },
        image: { type: String, default: "/images/facade-detail.jpg" },
      },
      projects: {
        title: { type: String, default: "A collection in stone, glass, and garden." },
        eyebrow: { type: String, default: "Projects" },
        copy: { type: String, default: "" },
        image: { type: String, default: "/images/aerial-campus.jpg" },
      },
      contact: {
        title: { type: String, default: "We would like to hear from you." },
        eyebrow: { type: String, default: "Contact Us" },
        copy: { type: String, default: "" },
        image: { type: String, default: "/images/penthouse-terrace.jpg" },
      },
      testimonials: {
        title: { type: String, default: "Reflections on Living Well." },
        eyebrow: { type: String, default: "Testimonials" },
        copy: { type: String, default: "" },
        image: { type: String, default: "/images/interior-bedroom.jpg" },
      },
      services: {
        title: { type: String, default: "Services shaped around your home." },
        eyebrow: { type: String, default: "Our Services" },
        copy: { type: String, default: "Explore the services available to our residents." },
        image: { type: String, default: "/images/aerial-campus.jpg" },
      },
      privacy: {
        title: { type: String, default: "Privacy Policy" },
        eyebrow: { type: String, default: "Legal" },
        copy: { type: String, default: "Data stewardship and confidentiality principles for our private advisory clients." },
        image: { type: String, default: "/images/interior-kitchen.jpg" },
      },
    },
    sections: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },
    navigationItems: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },
    pageVisibility: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    sectionVisibility: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    standards: {
      type: [mongoose.Schema.Types.Mixed],
      default: undefined,
    },
    milestones: {
      type: [mongoose.Schema.Types.Mixed],
      default: undefined,
    },
    faqs: {
      type: [mongoose.Schema.Types.Mixed],
      default: undefined,
    },
    pressMentions: {
      type: [mongoose.Schema.Types.Mixed],
      default: undefined,
    },
    homeIntro: {
      type: mongoose.Schema.Types.Mixed,
      default: undefined,
    },
    pageCopy: {
      type: mongoose.Schema.Types.Mixed,
      default: undefined,
    },
    footer: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    draftContent: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export const SiteContent =
  mongoose.models.SiteContent || mongoose.model("SiteContent", siteContentSchema);
