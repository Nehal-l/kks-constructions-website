export const cmsPages = ["home", "about", "projects", "services", "contact", "testimonials", "privacy", "projectDetails"];

export const managedSections = {
  home: [
    ["home-hero", "Main hero"],
    ["home-intro", "Company introduction"],
    ["home-highlights", "Highlights"],
    ["home-projects", "Featured projects"],
    ["home-testimonials", "Testimonials"],
    ["home-contact", "Contact call-to-action"],
  ],
  about: [
    ["about-hero", "Page banner"],
    ["about-story", "Company story"],
    ["about-mission-vision", "Mission and vision"],
    ["about-standards", "Construction standards"],
    ["about-values", "Core values"],
    ["about-milestones", "Milestones"],
  ],
  projects: [["projects-hero", "Page banner"], ["projects-list", "Project portfolio"]],
  contact: [["contact-hero", "Page banner"], ["contact-details", "Contact and enquiry form"], ["contact-faq", "Frequently asked questions"]],
  testimonials: [["testimonials-hero", "Page banner"], ["testimonials-list", "Testimonial list"], ["testimonials-recognition", "Recognition"]],
  services: [["services-hero", "Page banner"]],
  privacy: [["privacy-hero", "Page banner"], ["privacy-content", "Privacy policy"]],
  projectDetails: [["project-detail-content", "Residence details"]],
};

export const essentialSections = new Set(["home-hero", "projects-list", "contact-details"]);

export const pageCopySections = [
  { page: "home", key: "projects", title: "Featured residences", fields: [["eyebrow", "Eyebrow"], ["title", "Heading"], ["copy", "Description", "textarea"], ["buttonLabel", "Button label"], ["buttonUrl", "Button link"]] },
  { page: "home", key: "testimonials", title: "Testimonials", fields: [["eyebrow", "Eyebrow"], ["title", "Heading"], ["copy", "Description", "textarea"], ["image", "Background image", "image"]] },
  { page: "home", key: "contact", title: "Contact call-to-action", fields: [["eyebrow", "Eyebrow"], ["title", "Heading"], ["buttonLabel", "Button label"], ["buttonUrl", "Button link"]] },
  { page: "about", key: "story", title: "Company story", fields: [["eyebrow", "Eyebrow"], ["title", "Heading"], ["quote", "Quote", "textarea"], ["image", "Image", "image"], ["imageAlt", "Image description"]] },
  { page: "about", key: "missionVision", title: "Mission and vision labels", fields: [["missionLabel", "Mission heading"], ["visionLabel", "Vision heading"]] },
  { page: "about", key: "standards", title: "Construction standards section", fields: [["eyebrow", "Eyebrow"], ["title", "Heading"], ["copy", "Description", "textarea"]] },
  { page: "about", key: "values", title: "Core values section", fields: [["eyebrow", "Eyebrow"], ["title", "Heading"]] },
  { page: "about", key: "milestones", title: "Milestones section", fields: [["eyebrow", "Eyebrow"], ["title", "Heading"], ["buttonLabel", "Button label"], ["buttonUrl", "Button link"]] },
  { page: "projects", key: "portfolio", title: "Project portfolio section", fields: [["eyebrow", "Eyebrow"], ["title", "Heading"], ["statusLabel", "Status filter label"], ["typeLabel", "Typology filter label"], ["searchPlaceholder", "Search placeholder"], ["statusAllLabel", "All status label"], ["statusOngoingLabel", "Ongoing status label"], ["statusCompletedLabel", "Completed status label"], ["statusUpcomingLabel", "Upcoming status label"], ["typeAllLabel", "All typologies label"], ["typeResidentialLabel", "Residential type label"], ["typeVillasLabel", "Villas type label"], ["typeMixedUseLabel", "Mixed-use type label"], ["emptyTitle", "Empty results heading"], ["emptyCopy", "Empty results description", "textarea"], ["resetLabel", "Reset button label"]] },
  { page: "contact", key: "details", title: "Contact details section", fields: [["eyebrow", "Office eyebrow"], ["title", "Office heading"], ["inquiryEyebrow", "Enquiry eyebrow"], ["inquiryTitle", "Enquiry heading"], ["inquiryCopy", "Enquiry description", "textarea"], ["whatsappTitle", "WhatsApp heading"], ["whatsappCopy", "WhatsApp description", "textarea"], ["whatsappButtonLabel", "WhatsApp button"], ["submitLabel", "Enquiry submit button"]] },
  { page: "contact", key: "faq", title: "Contact FAQ section", fields: [["eyebrow", "Eyebrow"], ["title", "Heading"]] },
  { page: "testimonials", key: "recognition", title: "Recognition section", fields: [["eyebrow", "Eyebrow"], ["title", "Heading"], ["bottomCopy", "Description", "textarea"], ["buttonLabel", "Button label"], ["buttonUrl", "Button link"]] },
  { page: "projectDetails", key: "overview", title: "Residence overview details", fields: [["title", "Heading"], ["priceLabel", "Price label"], ["specsTitle", "Specifications heading"], ["specsCopy", "Specifications description", "textarea"], ["mapLabel", "Location card label"]] },
  { page: "projectDetails", key: "videos", title: "Residence video section", fields: [["title", "Heading"]] },
  { page: "projectDetails", key: "amenities", title: "Residence amenities section", fields: [["eyebrow", "Eyebrow"], ["title", "Heading"], ["itemLabel", "Amenity label"]] },
  { page: "projectDetails", key: "location", title: "Residence location section", fields: [["eyebrow", "Eyebrow"], ["title", "Heading"], ["callout", "Description", "textarea"]] },
  { page: "projectDetails", key: "enquiry", title: "Residence enquiry section", fields: [["eyebrow", "Eyebrow"], ["title", "Heading"], ["copy", "Description", "textarea"], ["buttonLabel", "Viewing button"], ["brochureLabel", "Brochure button"], ["brochureRequestLabel", "Brochure request button"], ["brochureReadyLabel", "Brochure ready label"], ["brochureNotice", "Brochure notice", "textarea"], ["backLabel", "Back button"], ["expandLabel", "Gallery expand label"], ["submitLabel", "Enquiry submit button"]] },
  { page: "privacy", key: "body", title: "Privacy policy paragraphs", fields: [["paragraph1", "Paragraph one", "textarea"], ["paragraph2", "Paragraph two", "textarea"], ["paragraph3", "Paragraph three", "textarea"]] },
];

export const pageCollections = [
  { key: "standards", pages: ["about"], title: "Construction standards entries", fields: [["icon", "Icon key"], ["title", "Heading"], ["text", "Description"]] },
  { key: "milestones", pages: ["about"], title: "Milestone entries", fields: [["year", "Period"], ["title", "Heading"], ["desc", "Description"]] },
  { key: "faqs", pages: ["contact"], title: "FAQ entries", fields: [["q", "Question"], ["a", "Answer"]] },
  { key: "pressMentions", pages: ["testimonials"], title: "Recognition / press entries", fields: [["publication", "Publication"], ["quote", "Description"]] },
];

/** Maps built-in section ids to editable CMS bindings on the current page. */
export const builtinSectionBindings = {
  "home-hero": { kind: "hero", heroKey: "home" },
  "home-intro": { kind: "homeIntro" },
  "home-highlights": { kind: "highlights" },
  "home-projects": { kind: "pageCopy", copyKey: "projects" },
  "home-testimonials": { kind: "pageCopy", copyKey: "testimonials" },
  "home-contact": { kind: "pageCopy", copyKey: "contact" },
  "about-hero": { kind: "hero", heroKey: "about" },
  "about-story": { kind: "pageCopy", copyKey: "story" },
  "about-mission-vision": { kind: "pageCopy", copyKey: "missionVision" },
  "about-standards": { kind: "pageCopy", copyKey: "standards", collection: "standards" },
  "about-values": { kind: "pageCopy", copyKey: "values" },
  "about-milestones": { kind: "pageCopy", copyKey: "milestones", collection: "milestones" },
  "projects-hero": { kind: "hero", heroKey: "projects" },
  "projects-list": { kind: "pageCopy", copyKey: "portfolio" },
  "contact-hero": { kind: "hero", heroKey: "contact" },
  "contact-details": { kind: "pageCopy", copyKey: "details" },
  "contact-faq": { kind: "pageCopy", copyKey: "faq", collection: "faqs" },
  "testimonials-hero": { kind: "hero", heroKey: "testimonials" },
  "testimonials-list": { kind: "note", text: "Testimonial quotes are managed under the Testimonials tab." },
  "testimonials-recognition": { kind: "pageCopy", copyKey: "recognition", collection: "pressMentions" },
  "services-hero": { kind: "hero", heroKey: "services" },
  "privacy-hero": { kind: "hero", heroKey: "privacy" },
  "privacy-content": { kind: "pageCopy", copyKey: "body" },
  "project-detail-content": { kind: "pageCopy", copyKey: "overview" },
};

export const heroPages = new Set(["home", "about", "projects", "services", "contact", "testimonials", "privacy"]);
