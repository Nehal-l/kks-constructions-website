export const company = {
  name: "KKS Constructions",
  shortName: "KKS",
  tagline: "Landmarks of quiet luxury",
  logo: "/images/logo.png",
  description:
    "KKS Constructions is a distinguished developer of ultra-luxury residences and mixed-use sanctuaries across India. We believe in architecture that holds the light, endures across generations, and enriches everyday rituals.",
  overview:
    "We design and deliver elevated living environments where architecture, landscape, and daily ritual meet. From sky mansions in urban financial capitals to secluded coastal courtyard villas, each KKS development is an essay in structural permanence, thermal comfort, and restrained elegance.",
  mission:
    "To create enduring places with rigorous craft, considered materials, and a calm, contemporary Indian sensibility.",
  vision:
    "To be recognised globally for landmark residences that age with grace and enrich the neighbourhoods they belong to.",
  values: [
    {
      title: "Craft",
      text: "Precision in detailing, from podium gardens to the last hand-patinated brass fitting.",
    },
    {
      title: "Restraint",
      text: "Luxury expressed through proportion, light, and material honesty—not ornament for its own sake.",
    },
    {
      title: "Stewardship",
      text: "Landscapes, water systems, and community spaces treated as essential, enduring architecture.",
    },
    {
      title: "Transparency",
      text: "Unwavering commitment to timelines, RERA disclosures, and dedicated lifetime homeowner aftercare.",
    },
  ],
  highlights: [
    { value: "22+", label: "Years of practice" },
    { value: "1,450+", label: "Homes delivered" },
    { value: "8", label: "Projects underway" },
    { value: "4", label: "Cities of presence" },
  ],
  contact: {
    addressLine: "Road No. 36, Jubilee Hills",
    city: "Hyderabad, Telangana — 500033",
    phone: "+91 98490 12345",
    email: "enquiries@kksconstructions.com",
    hours: "Monday–Saturday, 10:00 AM – 6:30 PM IST",
    mapNote: "Private viewing suites available by prior appointment at our Jubilee Hills advisory studio.",
  },
  social: {
    instagram: "https://instagram.com",
    linkedin: "https://linkedin.com",
    youtube: "https://youtube.com",
  },
  disclaimers: {
    visuals:
      "Architectural visuals on this website are concept imagery generated for design demonstration. They reflect design philosophy and aesthetic specifications for KKS developments.",
    legal:
      "Project specifications, amenities, and floor plans are subject to final municipal clearances and RERA disclosures. This portfolio serves as an architectural presentation.",
  },
};

export const pageHeroDefaults = {
  home: {
    title: "Architecture that holds the light.",
    eyebrow: company.name,
    copy: `${company.tagline}. Residences, gardens, and quiet interiors imagined for a slower kind of city living.`,
    image: "/images/hero-tower.jpg",
    primaryButtonLabel: "View projects",
    primaryButtonUrl: "/projects",
    secondaryButtonLabel: "Our story",
    secondaryButtonUrl: "/about",
  },
  about: { title: "A quieter idea of grandeur.", eyebrow: "About Us", copy: company.description, image: "/images/facade-detail.jpg" },
  projects: { title: "A collection in stone, glass, and garden.", eyebrow: "Projects", copy: "Filter by development status or typology, or search by landmark and name.", image: "/images/aerial-campus.jpg" },
  contact: { title: "We would like to hear from you.", eyebrow: "Contact Us", copy: "Reach our private advisory desk for site viewings, portfolio brochures, or bespoke consultation.", image: "/images/penthouse-terrace.jpg" },
  testimonials: { title: "Reflections on Living Well.", eyebrow: "Testimonials", copy: "Notes and experiences from homeowners, architects, and design consultants.", image: "/images/interior-bedroom.jpg" },
  services: { title: "Services shaped around your home.", eyebrow: "Our Services", copy: "Explore the services available to our residents.", image: "/images/aerial-campus.jpg" },
  privacy: { title: "Privacy Policy", eyebrow: "Legal", copy: "Data stewardship and confidentiality principles for our private advisory clients.", image: "/images/interior-kitchen.jpg" },
};

export const navLinks = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About Us" },
  { to: "/projects", label: "Projects" },
  { to: "/services", label: "Services" },
  { to: "/testimonials", label: "Testimonials" },
  { to: "/contact", label: "Contact Us" },
];

export const projects = [
  {
    slug: "aurelia-residences",
    name: "Aurelia Residences",
    status: "completed",
    type: "Residential",
    location: "Jubilee Hills, Hyderabad",
    headline: "A calm tower of stone, bronze, and sky.",
    summary:
      "High-rise residences imagined around a landscaped podium, generous cantilevered terraces, and a quiet arrival court.",
    overview:
      "Aurelia Residences rises 36 storeys above Jubilee Hills, offering panoramic skyline views through floor-to-ceiling acoustic glass. Each home features private high-speed elevator access, double-height living sanctuaries, and imported travertine stone terraces.",
    specs: [
      { label: "Typology", value: "3 & 4 BHK Sky Mansions" },
      { label: "Storeys", value: "36 Floors" },
      { label: "Possession", value: "Ready to Move" },
      { label: "RERA Reg.", value: "P02400003891" },
    ],
    amenities: [
      "Double-height arrival lobby",
      "Pergola podium gardens",
      "Temperature-controlled lap pool",
      "Holistic wellness atelier",
      "Executive boardroom suites",
      "Chauffeur lounge & valet",
    ],
    locationNotes:
      "Nestled within Jubilee Hills, just 12 minutes from HITEC City financial corridor, 5 minutes from KBR National Park, and proximate to premier healthcare and dining.",
    cover: "/images/hero-tower.jpg",
    gallery: [
      "/images/hero-tower.jpg",
      "/images/lobby-interior.jpg",
      "/images/interior-living.jpg",
      "/images/garden-pool.jpg",
      "/images/interior-kitchen.jpg",
    ],
    featured: true,
  },
  {
    slug: "palmyra-court",
    name: "Palmyra Court",
    status: "completed",
    type: "Villas",
    location: "Alibaug Coast, Maharashtra",
    headline: "Courtyard villas for unhurried living.",
    summary:
      "A cluster of low-rise coastal homes organised around water courts, swaying palms, and private fragrant gardens.",
    overview:
      "Palmyra Court is a secluded enclave of 24 private villas designed with indigenous basalt stone, teak wood colonnades, and central cooling courtyard pools that harmonize indoor and coastal outdoor living.",
    specs: [
      { label: "Typology", value: "4 & 5 BHK Courtyard Villas" },
      { label: "Homes", value: "24 Private Estates" },
      { label: "Possession", value: "Immediate Handover" },
      { label: "RERA Reg.", value: "P52000028472" },
    ],
    amenities: [
      "Private swimming court",
      "Community orchard lawn",
      "Resident club lounge",
      "Open-air dining pavilion",
      "Private nature trails",
      "24/7 dedicated concierge",
    ],
    locationNotes:
      "A short 20-minute speedboat transit from the Gateway of India to Mandwa jetty, set amidst pristine coconut groves and calm coastal waters.",
    cover: "/images/villa-courtyard.jpg",
    gallery: [
      "/images/villa-courtyard.jpg",
      "/images/garden-pool.jpg",
      "/images/interior-bedroom.jpg",
      "/images/interior-kitchen.jpg",
      "/images/spa-wellness.jpg",
    ],
    featured: true,
  },
  {
    slug: "meridian-towers",
    name: "Meridian Towers",
    status: "ongoing",
    type: "Residential",
    location: "Financial District, Hyderabad",
    headline: "Twin silhouettes along a landscaped boulevard.",
    summary:
      "Ongoing dual-tower residences with a 3-acre elevated garden podium and skyline-facing living rooms.",
    overview:
      "Meridian Towers reimagines the corporate corridor with quiet luxury. Dual sculptured silhouettes connected by a multi-level sky lounge and an Olympic-length infinity pool suspended 100 feet above the city floor.",
    specs: [
      { label: "Typology", value: "3 & 4 BHK Luxury Residences" },
      { label: "Towers", value: "2 Sculptural Towers" },
      { label: "Expected", value: "Q2 2027" },
      { label: "RERA Reg.", value: "P02400005118" },
    ],
    amenities: [
      "Lantern arrival lobby",
      "3-acre podium park",
      "Sky deck & observatory",
      "Technogym fitness atelier",
      "Children’s sensory lawn",
      "Resident screening room",
    ],
    locationNotes:
      "Direct access to the Outer Ring Road and Gachibowli junction, surrounded by multinational tech campuses and premium dining avenues.",
    cover: "/images/skyline-campus.jpg",
    gallery: [
      "/images/skyline-campus.jpg",
      "/images/facade-detail.jpg",
      "/images/interior-living.jpg",
      "/images/penthouse-terrace.jpg",
      "/images/lobby-interior.jpg",
    ],
    featured: true,
  },
  {
    slug: "atlas-boulevard",
    name: "Atlas Boulevard",
    status: "ongoing",
    type: "Mixed-use",
    location: "Whitefield, Bengaluru",
    headline: "Residences above a landscaped civic spine.",
    summary:
      "An ongoing mixed-use campus with residential towers, gardens, and a ground-level promenade.",
    overview:
      "Atlas Boulevard brings urban convenience and secluded privacy together. Master-planned across 12 verdant acres, residences sit above shaded tree-lined avenues with European-style cafes and resident-only wellness lounges.",
    specs: [
      { label: "Typology", value: "Boutique Residences + Promenade" },
      { label: "Scale", value: "12-Acre Masterplan" },
      { label: "Expected", value: "Phased (2027–2028)" },
      { label: "RERA Reg.", value: "PRM/KA/RERA/1251/446/PR/220815" },
    ],
    amenities: [
      "Central green boulevard",
      "Step-down podium parks",
      "Resident social club",
      "Thermal wellness circuit",
      "Private coworking suites",
      "Secured porte-cochère",
    ],
    locationNotes:
      "Situated near ITPL metro hub in Whitefield, ensuring frictionless transit to central Bengaluru while maintaining an insulated green buffer.",
    cover: "/images/aerial-campus.jpg",
    gallery: [
      "/images/aerial-campus.jpg",
      "/images/tower-night.jpg",
      "/images/garden-pool.jpg",
      "/images/lobby-interior.jpg",
      "/images/facade-detail.jpg",
    ],
    featured: true,
  },
  {
    slug: "solenne-gardens",
    name: "Solenne Gardens",
    status: "upcoming",
    type: "Residential",
    location: "Kokapet Neopolis, Hyderabad",
    headline: "A garden-first address, still on the drawing board.",
    summary:
      "Upcoming sanctuary residences conceived around organic wellness, reflective lotus courts, and planted courtyards.",
    overview:
      "Solenne Gardens is envisioned as an ecological retreat in the high-growth Neopolis corridor. Integrated with solar harvesting, oxygen-enriching garden corridors, and an exclusive Ayurvedic hydrotherapy spa.",
    specs: [
      { label: "Typology", value: "4 & 5 BHK Wellness Penthouses" },
      { label: "Landscape", value: "70% Dedicated Green Cover" },
      { label: "Launch", value: "Autumn 2026" },
      { label: "Approvals", value: "RERA Application in Progress" },
    ],
    amenities: [
      "Hydrotherapy spa",
      "Still-water lotus courts",
      "Curated library salon",
      "Sunrise yoga lawn",
      "Chef’s herb garden",
      "Sculptural art promenade",
    ],
    locationNotes:
      "Overlooking the Osman Sagar lake basin with protected skyline views and rapid connectivity via the Neopolis trumpet expressway.",
    cover: "/images/spa-wellness.jpg",
    gallery: [
      "/images/spa-wellness.jpg",
      "/images/garden-pool.jpg",
      "/images/interior-bedroom.jpg",
      "/images/penthouse-terrace.jpg",
      "/images/interior-kitchen.jpg",
    ],
    featured: true,
  },
  {
    slug: "north-atelier",
    name: "North Atelier",
    status: "upcoming",
    type: "Residential",
    location: "Hebbal Lakefront, Bengaluru",
    headline: "Evening light, vertical living, quiet rooms.",
    summary:
      "An upcoming high-rise study exploring nocturnal presence, deep cantilevered terraces, and acoustic serenity.",
    overview:
      "North Atelier stands as a nocturnal sculpture along the northern lakes of Bengaluru. Designed with darkened acoustic glazing, private plunge pools on every terrace, and dedicated collector wine cellars.",
    specs: [
      { label: "Typology", value: "Limited Edition Sky Villas" },
      { label: "Expression", value: "Acoustic Bronze & Low-E Glass" },
      { label: "Launch", value: "Winter 2026" },
      { label: "Approvals", value: "RERA Application in Progress" },
    ],
    amenities: [
      "Acoustic lantern lobby",
      "Rooftop observatory lounge",
      "Private dining salon",
      "Hanging terrace gardens",
      "Audiophile cinema suite",
      "Automated subterranean valet",
    ],
    locationNotes:
      "Positioned along the airport express corridor with direct lake frontage and zero obstruction to sunset horizons.",
    cover: "/images/tower-night.jpg",
    gallery: [
      "/images/tower-night.jpg",
      "/images/penthouse-terrace.jpg",
      "/images/interior-living.jpg",
      "/images/facade-detail.jpg",
      "/images/lobby-interior.jpg",
    ],
    featured: false,
  },
];

export const testimonials = [
  {
    id: "t1",
    quote:
      "The transition from the bustling city into the calm travertine arrival court of Aurelia is sublime. The silence inside our residence is testament to the acoustic engineering.",
    name: "Vikram & Ananya Singhania",
    role: "Homeowners · Aurelia Residences, Jubilee Hills",
  },
  {
    id: "t2",
    quote:
      "KKS delivered exactly what was promised in the architectural render—right down to the bespoke bronze hardware and water-court detailing.",
    name: "Radhika K. Merchant",
    role: "Villa Owner · Palmyra Court, Alibaug",
  },
  {
    id: "t3",
    quote:
      "Working with the KKS design team was an exceptional experience. Their insistence on genuine Indian limestones and natural ventilation sets a new benchmark.",
    name: "Siddharth Menon",
    role: "Principal Architect, Studio Terra",
  },
];

export const pageContentDefaults = {
  standards: [
    {
      icon: "Compass",
      title: "Contextual Architecture",
      text: "Every site dictates its own architectural vocabulary—from natural cross-ventilation to orientation that captures winter warmth and shields harsh summer radiation.",
    },
    {
      icon: "ShieldCheck",
      title: "Rigorous Engineering",
      text: "Engineered with seismic-compliant structural frames, post-tensioned slabs, and multi-tier waterproofing that protect the building envelope over generations.",
    },
    {
      icon: "Award",
      title: "Noble Materiality",
      text: "We source authentic natural limestones, fluted granites, aged bronzes, and sustainably harvested woods that age with character rather than decay.",
    },
  ],
  milestones: [
    { year: "Phase I", title: "Founding Philosophy", desc: "Established with a focus on crafting high-calibre residential sanctuaries away from high-density urban chaos." },
    { year: "Phase II", title: "Landmark High-Rises", desc: "Pioneered vertical garden terraces and double-height architectural arrival courts across premier residential corridors." },
    { year: "Phase III", title: "Integrated Communities", desc: "Expanding into low-impact mixed-use developments, wellness-first courtyard villas, and civic green boulevards." },
  ],
  faqs: [
    { q: "How can I schedule an exclusive on-site preview?", a: "Private walkthroughs are hosted by appointment to ensure discretion. Please submit the enquiry form or contact our private office directly." },
    { q: "Are all projects RERA certified and legally cleared?", a: "Yes. Every development under KKS Constructions adheres strictly to state RERA regulations and local municipal clearances before public booking." },
    { q: "Can floor plans and interior finishes be tailored?", a: "Select residences provide bespoke layouts, custom millwork packages, and modular spatial configurations during early construction phases." },
    { q: "Do you offer advisory assistance for overseas and NRI clients?", a: "Our dedicated NRI client desk provides end-to-end support with documentation, repatriable banking channels, and power-of-attorney protocols." },
  ],
  pressMentions: [
    { publication: "Architectural Digest India [Concept]", quote: "A masterclass in restraint and quiet craftsmanship in urban living." },
    { publication: "Design Anthology Asia [Concept]", quote: "KKS Residences redefine podium landscapes as living civic architecture." },
    { publication: "Luxury Living Journal [Concept]", quote: "Uncompromising attention to privacy, material honesty, and light." },
  ],
  homeIntro: {
    image: "/images/lobby-interior.jpg",
    imageAlt: "Concept photograph of a double-height residential lobby",
    eyebrow: "The house of KKS",
    title: "Measured luxury, made to last.",
    copy: "",
    buttonLabel: "About KKS Constructions",
    buttonUrl: "/about",
  },
  pageCopy: {
    home: {
      projects: { eyebrow: "Selected work", title: "Featured residences", copy: "A curated edit of luxury residences. Filter the complete portfolio on the projects page.", buttonLabel: "All projects", buttonUrl: "/projects" },
      testimonials: { eyebrow: "Voices", title: "Reflections on Living with KKS", copy: "Voices of homeowners and design collaborators who share our passion for architectural restraint.", image: "/images/garden-pool.jpg" },
      contact: { eyebrow: "Begin a conversation", title: "A private viewing, when you are ready.", buttonLabel: "Contact KKS Constructions", buttonUrl: "/contact" },
    },
    about: {
      story: { eyebrow: "Overview", title: "The House of KKS", quote: "We believe that true luxury does not shout. It reveals itself in the heavy glide of a solid oak door, the quiet temperature of honed stone, and shadows that shift gently across living walls.", image: "/images/interior-living.jpg", imageAlt: "Concept living room interior with city views" },
      missionVision: { missionLabel: "Our Mission", visionLabel: "Our Vision" },
      standards: { eyebrow: "Integrity", title: "Construction & Design Benchmarks", copy: "Our uncompromising commitment to architectural longevity and sustainable practice." },
      values: { eyebrow: "Core Values", title: "Principles that guide every stone." },
      milestones: { eyebrow: "Evolution", title: "Milestones of Excellence", buttonLabel: "Explore our residences", buttonUrl: "/projects" },
    },
    projects: {
      portfolio: { eyebrow: "Portfolio", title: "Residences", statusLabel: "Status", typeLabel: "Typology", searchPlaceholder: "Search by name, city...", emptyTitle: "No residences match your criteria", emptyCopy: "Try adjusting your status filter, typology selection, or search keywords.", resetLabel: "Reset all filters", statusAllLabel: "All", statusOngoingLabel: "Ongoing", statusCompletedLabel: "Completed", statusUpcomingLabel: "Upcoming", typeAllLabel: "All Typologies", typeResidentialLabel: "Residential", typeVillasLabel: "Villas", typeMixedUseLabel: "Mixed-use" },
    },
    contact: {
      details: { eyebrow: "Advisory Office", title: "Studio & Concierge", inquiryEyebrow: "Private Inquiries", inquiryTitle: "Send a Message", inquiryCopy: "All submitted enquiries are received by our concierge and recorded in the management portal.", whatsappTitle: "Instant Advisory", whatsappCopy: "Connect directly with an authorized sales advisor via WhatsApp or phone consultation for fast responses.", whatsappButtonLabel: "Chat on WhatsApp", submitLabel: "Send enquiry" },
      faq: { eyebrow: "Buyer Information", title: "Frequently Asked Questions" },
    },
    testimonials: {
      recognition: { eyebrow: "Recognition", title: "Critical Acclaim & Features", bottomCopy: "Interested in speaking with our homeowner relations team or requesting client references?", buttonLabel: "Contact Homeowner Relations", buttonUrl: "/contact" },
    },
    projectDetails: {
      overview: { title: "Architectural Overview", priceLabel: "Price guidance", specsTitle: "Bespoke Specifications", specsCopy: "Every home is finished with sustainable thermal glazing, Italian marble floorings, European sanitaryware, and smart home lighting integrations.", mapLabel: "Prime Location" },
      videos: { title: "Project Films" },
      amenities: { eyebrow: "Lifestyle", title: "Curated Amenities & Facilities", itemLabel: "Private Amenity" },
      location: { eyebrow: "Neighbourhood", title: "The Setting", callout: "A residence here means immediate access to financial corridors, international schools, and serene lakeside greenways." },
      enquiry: { eyebrow: "Inquire", title: "Begin Your Acquisition", copy: "Register your interest in this residence to receive full floor plans, pricing briefs, and private viewing schedules.", buttonLabel: "Schedule Private Viewing", brochureLabel: "Download Brochure", brochureRequestLabel: "Request Brochure", brochureReadyLabel: "Brochure Ready Below", brochureNotice: "Digital portfolio prepared. Submit the enquiry form below with your email to receive direct floor plans and documentation.", backLabel: "Back to collection", expandLabel: "Expand view", submitLabel: "Send enquiry" },
    },
    privacy: {
      body: {
        paragraph1: "collects the name, email, telephone number, and private messages submitted through our residence inquiry forms. This information is processed exclusively by our authorized private office to coordinate property walkthroughs and deliver requested architectural portfolios.",
        paragraph2: "We do not sell, rent, or distribute personal information to third parties. Inquiries are stored securely within encrypted database storage and restricted administrative consoles.",
        paragraph3: "To request access, modification, or permanent deletion of your inquiry data, you may reach our privacy desk directly at",
      },
    },
  },
};

export const statusLabels = {
  all: "All",
  ongoing: "Ongoing",
  completed: "Completed",
  upcoming: "Upcoming",
};

export function getProject(slug) {
  return projects.find((project) => project.slug === slug) || null;
}

export function getProjectsByStatus(status) {
  if (!status || status === "all") return projects;
  return projects.filter((project) => project.status === status);
}

export function getFeaturedProjects() {
  return projects.filter((project) => project.featured);
}
