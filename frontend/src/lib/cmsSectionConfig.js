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
  projects: [
    ["projects-hero", "Page banner"],
    ["projects-list", "Project portfolio"],
  ],
  services: [
    ["services-hero", "Page banner"],
    ["services-list", "Disciplines & capabilities"],
    ["services-cta", "Consultation call-to-action"],
  ],
  contact: [
    ["contact-hero", "Page banner"],
    ["contact-details", "Office address & hours"],
    ["contact-private-desk", "Private Advisory Desk card"],
    ["contact-faq", "Frequently asked questions"],
  ],
  testimonials: [
    ["testimonials-hero", "Page banner"],
    ["testimonials-list", "Testimonial list"],
    ["testimonials-recognition", "Recognition"],
  ],
  privacy: [
    ["privacy-hero", "Page banner"],
    ["privacy-content", "Privacy policy"],
  ],
  projectDetails: [
    ["project-detail-hero", "Project hero & key facts"],
    ["project-detail-overview", "Overview & specifications"],
    ["project-detail-gallery", "Architectural gallery"],
    ["project-detail-videos", "Project films & video"],
    ["project-detail-amenities", "Curated amenities"],
    ["project-detail-location", "Neighbourhood & map"],
    ["project-detail-contact", "Direct consultation card"],
  ],
};

// Owner can hide or restore ANY section without artificial restrictions
export const essentialSections = new Set([]);

export const pageCopySections = [
  { page: "home", key: "projects", title: "Homepage featured residences", fields: [["eyebrow", "Eyebrow"], ["title", "Heading"], ["copy", "Description", "textarea"], ["buttonLabel", "Button label"], ["buttonUrl", "Button link"]] },
  { page: "home", key: "testimonials", title: "Homepage testimonials", fields: [["eyebrow", "Eyebrow"], ["title", "Heading"], ["copy", "Description", "textarea"], ["image", "Background image", "image"]] },
  { page: "home", key: "contact", title: "Homepage contact call-to-action", fields: [["eyebrow", "Eyebrow"], ["title", "Heading"], ["buttonLabel", "Button label"], ["buttonUrl", "Button link"]] },
  { page: "about", key: "story", title: "About story section", fields: [["eyebrow", "Eyebrow"], ["title", "Heading"], ["quote", "Quote", "textarea"], ["image", "Image", "image"], ["imageAlt", "Image description"]] },
  { page: "about", key: "missionVision", title: "About mission and vision labels", fields: [["missionLabel", "Mission heading"], ["visionLabel", "Vision heading"]] },
  { page: "about", key: "standards", title: "About construction standards section", fields: [["eyebrow", "Eyebrow"], ["title", "Heading"], ["copy", "Description", "textarea"]] },
  { page: "about", key: "values", title: "About core values section", fields: [["eyebrow", "Eyebrow"], ["title", "Heading"]] },
  { page: "about", key: "milestones", title: "About milestones section", fields: [["eyebrow", "Eyebrow"], ["title", "Heading"], ["buttonLabel", "Button label"], ["buttonUrl", "Button link"]] },
  { page: "projects", key: "portfolio", title: "Projects portfolio section", fields: [["eyebrow", "Eyebrow"], ["title", "Heading"], ["statusLabel", "Status filter label"], ["typeLabel", "Typology filter label"], ["searchPlaceholder", "Search placeholder"], ["statusAllLabel", "All status label"], ["statusOngoingLabel", "Ongoing status label"], ["statusCompletedLabel", "Completed status label"], ["statusUpcomingLabel", "Upcoming status label"], ["typeAllLabel", "All typologies label"], ["typeResidentialLabel", "Residential type label"], ["typeVillasLabel", "Villas type label"], ["typeMixedUseLabel", "Mixed-use type label"], ["showingLabel", "Results showing label"], ["residencesLabel", "Residences count label"], ["loadingLabel", "Updating status label"], ["emptyTitle", "Empty results heading"], ["emptyCopy", "Empty results description", "textarea"], ["resetLabel", "Reset button label"]] },
  { page: "services", key: "servicesList", title: "Services capabilities section", fields: [["eyebrow", "Eyebrow"], ["title", "Heading"], ["copy", "Introductory description", "textarea"], ["service1Title", "Service 1 heading"], ["service1Category", "Service 1 category"], ["service1Desc", "Service 1 description", "textarea"], ["service2Title", "Service 2 heading"], ["service2Category", "Service 2 category"], ["service2Desc", "Service 2 description", "textarea"], ["service3Title", "Service 3 heading"], ["service3Category", "Service 3 category"], ["service3Desc", "Service 3 description", "textarea"], ["service4Title", "Service 4 heading"], ["service4Category", "Service 4 category"], ["service4Desc", "Service 4 description", "textarea"], ["service5Title", "Service 5 heading"], ["service5Category", "Service 5 category"], ["service5Desc", "Service 5 description", "textarea"], ["service6Title", "Service 6 heading"], ["service6Category", "Service 6 category"], ["service6Desc", "Service 6 description", "textarea"]] },
  { page: "services", key: "servicesCta", title: "Services consultation call-to-action", fields: [["eyebrow", "Eyebrow"], ["title", "Heading"], ["copy", "Description", "textarea"], ["buttonLabel", "Button label"], ["buttonUrl", "Button link"]] },
  { page: "contact", key: "details", title: "Contact office details", fields: [["eyebrow", "Office eyebrow"], ["title", "Office heading"], ["phoneLabel", "Telephone label"], ["emailLabel", "Email label"], ["hoursLabel", "Advisory hours label"], ["inquiryEyebrow", "Enquiry eyebrow"], ["inquiryTitle", "Enquiry heading"], ["inquiryCopy", "Enquiry description", "textarea"], ["whatsappTitle", "WhatsApp heading"], ["whatsappCopy", "WhatsApp description", "textarea"], ["whatsappButtonLabel", "WhatsApp button"], ["submitLabel", "Enquiry submit button"]] },
  { page: "contact", key: "privateDesk", title: "Private Advisory Desk card", fields: [["eyebrow", "Card eyebrow label"], ["title", "Card heading"], ["description", "Card description text", "textarea"], ["phoneLabel", "Phone channel label"], ["whatsappLabel", "WhatsApp channel label"], ["instagramLabel", "Instagram channel label"], ["hoursPrefix", "Hours row prefix text"], ["cityFallback", "City fallback text"], ["instagramPlaceholder", "Instagram placeholder handle"]] },
  { page: "contact", key: "faq", title: "Contact FAQ section", fields: [["eyebrow", "Eyebrow"], ["title", "Heading"]] },
  { page: "testimonials", key: "recognition", title: "Recognition & press section", fields: [["eyebrow", "Eyebrow"], ["title", "Heading"], ["bottomCopy", "Description", "textarea"], ["buttonLabel", "Button label"], ["buttonUrl", "Button link"]] },
  { page: "projectDetails", key: "overview", title: "Residence overview details", fields: [["title", "Heading"], ["priceLabel", "Price label"], ["specsTitle", "Specifications heading"], ["specsCopy", "Specifications description", "textarea"], ["mapLabel", "Location card label"], ["notFoundTitle", "Not found heading"], ["notFoundCopy", "Not found description", "textarea"]] },
  { page: "projectDetails", key: "videos", title: "Residence video section", fields: [["title", "Heading"]] },
  { page: "projectDetails", key: "amenities", title: "Residence amenities section", fields: [["eyebrow", "Eyebrow"], ["title", "Heading"], ["itemLabel", "Amenity label"]] },
  { page: "projectDetails", key: "location", title: "Residence location section", fields: [["eyebrow", "Eyebrow"], ["title", "Heading"], ["callout", "Description", "textarea"]] },
  { page: "projectDetails", key: "enquiry", title: "Residence enquiry & actions", fields: [["eyebrow", "Eyebrow"], ["title", "Heading"], ["copy", "Description", "textarea"], ["contactButtonLabel", "Hero contact button label"], ["buttonLabel", "Viewing button"], ["brochureLabel", "Brochure button"], ["brochureRequestLabel", "Brochure request button"], ["brochureReadyLabel", "Brochure ready label"], ["brochureNotice", "Brochure notice", "textarea"], ["backLabel", "Back button"], ["expandLabel", "Gallery expand label"], ["submitLabel", "Enquiry submit button"]] },
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
  "services-hero": { kind: "hero", heroKey: "services" },
  "services-list": { kind: "pageCopy", copyKey: "servicesList" },
  "services-cta": { kind: "pageCopy", copyKey: "servicesCta" },
  "contact-hero": { kind: "hero", heroKey: "contact" },
  "contact-details": { kind: "pageCopy", copyKey: "details" },
  "contact-private-desk": { kind: "pageCopy", copyKey: "privateDesk" },
  "contact-faq": { kind: "pageCopy", copyKey: "faq", collection: "faqs" },
  "testimonials-hero": { kind: "hero", heroKey: "testimonials" },
  "testimonials-list": { kind: "note", text: "Testimonial quotes are managed under the Testimonials tab." },
  "testimonials-recognition": { kind: "pageCopy", copyKey: "recognition", collection: "pressMentions" },
  "privacy-hero": { kind: "hero", heroKey: "privacy" },
  "privacy-content": { kind: "pageCopy", copyKey: "body" },
  "project-detail-hero": { kind: "pageCopy", copyKey: "enquiry" },
  "project-detail-overview": { kind: "pageCopy", copyKey: "overview" },
  "project-detail-gallery": { kind: "pageCopy", copyKey: "enquiry" },
  "project-detail-videos": { kind: "pageCopy", copyKey: "videos" },
  "project-detail-amenities": { kind: "pageCopy", copyKey: "amenities" },
  "project-detail-location": { kind: "pageCopy", copyKey: "location" },
  "project-detail-contact": { kind: "pageCopy", copyKey: "privateDesk" },
  "project-detail-content": { kind: "pageCopy", copyKey: "overview" },
};

export const heroPages = new Set(["home", "about", "projects", "services", "contact", "testimonials", "privacy"]);
