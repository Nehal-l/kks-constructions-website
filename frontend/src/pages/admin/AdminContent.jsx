import { useEffect, useState } from "react";
import {
  Save,
  Upload,
  Plus,
  Trash2,
  CheckCircle,
  AlertCircle,
  Building,
  Phone,
  Layers,
  Sparkles,
  Link2,
  Home,
  BookOpen,
  Briefcase,
  Building2,
  Quote,
  Image as ImageIcon,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { fetchAdminContent, updateAdminContent, uploadAdminImage, getMediaUrl } from "../../lib/api";
import { useSiteContent } from "../../context/ContentContext";
import {
  company as defaultCompany,
  pageContentDefaults,
  pageHeroDefaults,
  navLinks as defaultNavLinks,
} from "@data";

function mergeDefaults(defaults, stored) {
  if (!defaults || typeof defaults !== "object" || Array.isArray(defaults)) return stored ?? defaults;
  if (!stored || typeof stored !== "object" || Array.isArray(stored)) return defaults;
  return Object.fromEntries(
    Object.keys({ ...defaults, ...stored }).map((key) => [
      key,
      key in defaults ? mergeDefaults(defaults[key], stored[key]) : stored[key],
    ])
  );
}

export default function AdminContent({ onTabChange }) {
  const { refreshContent } = useSiteContent();
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [activeSection, setActiveSection] = useState("contact");
  const [toast, setToast] = useState(null);

  function showToast(message, type = "success") {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  }

  async function load() {
    setLoading(true);
    try {
      const res = await fetchAdminContent();
      const stored = res.content || {};
      setContent({
        ...stored,
        company: {
          ...defaultCompany,
          ...(stored.company || {}),
          contact: {
            ...defaultCompany.contact,
            ...(stored.company?.contact || {}),
          },
          social: {
            ...defaultCompany.social,
            ...(stored.company?.social || {}),
          },
          disclaimers: {
            ...defaultCompany.disclaimers,
            ...(stored.company?.disclaimers || {}),
          },
        },
        pageHeroes: {
          ...pageHeroDefaults,
          ...(stored.pageHeroes || {}),
        },
        pageCopy: mergeDefaults(pageContentDefaults.pageCopy, stored.pageCopy),
        homeIntro: {
          ...pageContentDefaults.homeIntro,
          ...(stored.homeIntro || {}),
        },
        standards: Array.isArray(stored.standards) && stored.standards.length > 0
          ? stored.standards
          : (pageContentDefaults.standards || []),
        milestones: Array.isArray(stored.milestones) && stored.milestones.length > 0
          ? stored.milestones
          : (pageContentDefaults.milestones || []),
        faqs: Array.isArray(stored.faqs) && stored.faqs.length > 0
          ? stored.faqs
          : (pageContentDefaults.faqs || []),
        pressMentions: Array.isArray(stored.pressMentions) && stored.pressMentions.length > 0
          ? stored.pressMentions
          : (pageContentDefaults.pressMentions || []),
        values: Array.isArray(stored.values) && stored.values.length > 0
          ? stored.values
          : (defaultCompany.values || []),
        highlights: Array.isArray(stored.highlights) && stored.highlights.length > 0
          ? stored.highlights
          : (defaultCompany.highlights || []),
        navigationItems: stored.navigationItems?.length ? stored.navigationItems : defaultNavLinks,
        sections: stored.sections || [],
        sectionVisibility: stored.sectionVisibility || {},
        pageVisibility: stored.pageVisibility || {},
        footer: stored.footer || {},
      });
    } catch (err) {
      showToast(err.message || "Failed to load content.", "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function updatePageCopy(page, section, field, value) {
    setContent((prev) => ({
      ...prev,
      pageCopy: {
        ...prev.pageCopy,
        [page]: {
          ...prev.pageCopy?.[page],
          [section]: {
            ...prev.pageCopy?.[page]?.[section],
            [field]: value,
          },
        },
      },
    }));
  }

  async function handleFileUpload(file, callback) {
    if (!file) return;
    setUploading(true);
    try {
      const res = await uploadAdminImage(file);
      callback(res.url);
      showToast("Media uploaded successfully.");
    } catch (err) {
      showToast(err.message || "Failed to upload media.", "error");
    } finally {
      setUploading(false);
    }
  }

  async function handleSave(e, publish = true) {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      await updateAdminContent(content, { publish });
      if (publish && !(await refreshContent({ refresh: true }))) {
        showToast("Content published, but preview could not refresh. Reload to verify.", "error");
        return;
      }
      showToast(publish ? "Website content published live successfully!" : "Draft saved privately.");
    } catch (err) {
      showToast(err.message || "Failed to save content.", "error");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="p-16 text-center text-stone animate-pulse">Loading website content editor…</div>;
  }

  if (!content) {
    return <div className="p-16 text-center text-stone">Could not load content editor.</div>;
  }

  const tabs = [
    { key: "contact", label: "Contact & Private Advisory Desk", icon: Phone },
    { key: "company", label: "Company Profile", icon: Building },
    { key: "home", label: "Home Page Subsections", icon: Home },
    { key: "about", label: "About Page & Story", icon: BookOpen },
    { key: "services", label: "Services & Capabilities", icon: Briefcase },
    { key: "projects", label: "Portfolio Search Labels", icon: Building2 },
    { key: "testimonials", label: "Testimonials Praise", icon: Quote },
    { key: "details", label: "Project Details Labels", icon: Layers },
    { key: "metrics", label: "Metrics & Core Values", icon: Sparkles },
    { key: "heroes", label: "Page Banners", icon: ImageIcon },
    { key: "navigation", label: "Navigation & Footer", icon: Link2 },
  ];

  const privateDesk = content.pageCopy?.contact?.privateDesk || {};
  const contactDetails = content.pageCopy?.contact?.details || {};
  const contactFaq = content.pageCopy?.contact?.faq || {};
  const servicesList = content.pageCopy?.services?.servicesList || {};
  const servicesCta = content.pageCopy?.services?.servicesCta || {};
  const aboutStory = content.pageCopy?.about?.story || {};
  const aboutMissionVision = content.pageCopy?.about?.missionVision || {};
  const aboutStandards = content.pageCopy?.about?.standards || {};
  const aboutMilestones = content.pageCopy?.about?.milestones || {};
  const portfolioLabels = content.pageCopy?.projects?.portfolio || {};
  const homeProjects = content.pageCopy?.home?.projects || {};
  const homeTestimonials = content.pageCopy?.home?.testimonials || {};
  const homeContact = content.pageCopy?.home?.contact || {};
  const testRecognition = content.pageCopy?.testimonials?.recognition || {};
  const detailOverview = content.pageCopy?.projectDetails?.overview || {};
  const detailAmenities = content.pageCopy?.projectDetails?.amenities || {};
  const detailLocation = content.pageCopy?.projectDetails?.location || {};
  const detailEnquiry = content.pageCopy?.projectDetails?.enquiry || {};

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 text-xs uppercase tracking-wider shadow-2xl ${
            toast.type === "error"
              ? "bg-red-900 text-cream border border-red-500"
              : "bg-ink text-gold border border-gold"
          }`}
        >
          {toast.type === "error" ? <AlertCircle className="size-4" /> : <CheckCircle className="size-4" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Top Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-sand pb-6">
        <div>
          <h2 className="font-display text-3xl text-ink">Website Text, Cards & Subsections</h2>
          <p className="mt-1 text-xs text-stone">
            Every section, card, and subsection across all pages is saved directly to the database and published live.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 self-start md:self-auto">
          <button
            type="button"
            onClick={(e) => handleSave(e, false)}
            disabled={saving}
            className="flex items-center gap-2 border border-ink px-5 py-2.5 text-[0.68rem] uppercase tracking-[0.2em] text-ink hover:bg-white transition cursor-pointer disabled:opacity-50"
          >
            <Save className="size-4" /> Save Draft
          </button>
          <button
            type="button"
            onClick={(e) => handleSave(e, true)}
            disabled={saving}
            className="flex items-center gap-2 bg-ink px-6 py-2.5 text-[0.68rem] uppercase tracking-[0.24em] text-cream hover:bg-gold hover:text-ink transition cursor-pointer shadow-sm disabled:opacity-50"
          >
            <Save className="size-4" /> {saving ? "Publishing…" : "Save & Publish"}
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-sand pb-3">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = activeSection === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveSection(tab.key)}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs uppercase tracking-wider transition border cursor-pointer ${
                active
                  ? "border-gold bg-gold text-ink font-semibold shadow-xs"
                  : "border-sand/60 bg-white/70 text-stone hover:border-gold hover:text-ink hover:bg-white"
              }`}
            >
              <Icon className="size-3.5" /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* Form Content */}
      <form onSubmit={(e) => handleSave(e, true)} className="space-y-6">

        {/* ========================================================================= */}
        {/* 1. CONTACT & PRIVATE ADVISORY DESK */}
        {/* ========================================================================= */}
        {activeSection === "contact" && (
          <div className="space-y-6">
            {/* Private Advisory Desk Card */}
            <div className="bg-white p-6 border-2 border-gold/40 shadow-sm space-y-5">
              <div className="flex items-center justify-between border-b border-sand pb-3">
                <div>
                  <span className="text-[0.62rem] uppercase tracking-[0.24em] text-gold-deep font-semibold">
                    Direct Contact Card
                  </span>
                  <h3 className="font-display text-2xl text-ink">Private Advisory Desk</h3>
                </div>
                <span className="text-xs bg-gold/15 text-gold-deep px-2.5 py-1 uppercase tracking-wider font-mono">
                  contact-private-desk
                </span>
              </div>
              <p className="text-xs text-stone">
                This card is prominently displayed on the Contact page. You can customize all headlines, phone, WhatsApp, Instagram, and hours.
              </p>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-[0.65rem] uppercase tracking-widest text-stone mb-1">
                    Card Eyebrow
                  </label>
                  <input
                    type="text"
                    value={privateDesk.eyebrow || ""}
                    onChange={(e) => updatePageCopy("contact", "privateDesk", "eyebrow", e.target.value)}
                    placeholder="DIRECT CONTACT"
                    className="w-full border border-sand p-2.5 text-xs text-ink"
                  />
                </div>
                <div>
                  <label className="block text-[0.65rem] uppercase tracking-widest text-stone mb-1">
                    Card Heading / Title
                  </label>
                  <input
                    type="text"
                    value={privateDesk.title || ""}
                    onChange={(e) => updatePageCopy("contact", "privateDesk", "title", e.target.value)}
                    placeholder="Private Advisory Desk"
                    className="w-full border border-sand p-2.5 text-xs text-ink"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[0.65rem] uppercase tracking-widest text-stone mb-1">
                  Card Description Text
                </label>
                <textarea
                  rows={2}
                  value={privateDesk.description || ""}
                  onChange={(e) => updatePageCopy("contact", "privateDesk", "description", e.target.value)}
                  placeholder="For any enquiries, please contact us directly through phone, WhatsApp, or Instagram."
                  className="w-full border border-sand p-2.5 text-xs text-ink"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-3 border-t border-sand/60 pt-4">
                <div>
                  <label className="block text-[0.65rem] uppercase tracking-widest text-stone mb-1">
                    Phone Button Label
                  </label>
                  <input
                    type="text"
                    value={privateDesk.phoneLabel || ""}
                    onChange={(e) => updatePageCopy("contact", "privateDesk", "phoneLabel", e.target.value)}
                    placeholder="Phone"
                    className="w-full border border-sand p-2.5 text-xs text-ink"
                  />
                </div>
                <div>
                  <label className="block text-[0.65rem] uppercase tracking-widest text-stone mb-1">
                    WhatsApp Button Label
                  </label>
                  <input
                    type="text"
                    value={privateDesk.whatsappLabel || ""}
                    onChange={(e) => updatePageCopy("contact", "privateDesk", "whatsappLabel", e.target.value)}
                    placeholder="WhatsApp"
                    className="w-full border border-sand p-2.5 text-xs text-ink"
                  />
                </div>
                <div>
                  <label className="block text-[0.65rem] uppercase tracking-widest text-stone mb-1">
                    Instagram Button Label
                  </label>
                  <input
                    type="text"
                    value={privateDesk.instagramLabel || ""}
                    onChange={(e) => updatePageCopy("contact", "privateDesk", "instagramLabel", e.target.value)}
                    placeholder="Instagram"
                    className="w-full border border-sand p-2.5 text-xs text-ink"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="block text-[0.65rem] uppercase tracking-widest text-stone mb-1">
                    Desk Telephone Number
                  </label>
                  <input
                    type="text"
                    value={content.company?.contact?.phone || ""}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        company: {
                          ...content.company,
                          contact: { ...content.company.contact, phone: e.target.value },
                        },
                      })
                    }
                    placeholder="+91 98490 12345"
                    className="w-full border border-sand p-2.5 text-xs text-ink font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[0.65rem] uppercase tracking-widest text-stone mb-1">
                    Desk WhatsApp Number
                  </label>
                  <input
                    type="text"
                    value={content.company?.contact?.whatsapp || ""}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        company: {
                          ...content.company,
                          contact: { ...content.company.contact, whatsapp: e.target.value },
                        },
                      })
                    }
                    placeholder="+91 98490 12345"
                    className="w-full border border-sand p-2.5 text-xs text-ink font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[0.65rem] uppercase tracking-widest text-stone mb-1">
                    Instagram Handle / URL
                  </label>
                  <input
                    type="text"
                    value={content.company?.social?.instagram || ""}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        company: {
                          ...content.company,
                          social: { ...content.company.social, instagram: e.target.value },
                        },
                      })
                    }
                    placeholder="https://instagram.com/kksconstructions"
                    className="w-full border border-sand p-2.5 text-xs text-ink font-mono"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 border-t border-sand/60 pt-4">
                <div>
                  <label className="block text-[0.65rem] uppercase tracking-widest text-stone mb-1">
                    Advisory Desk Hours Prefix / Footer
                  </label>
                  <input
                    type="text"
                    value={privateDesk.hoursPrefix || ""}
                    onChange={(e) => updatePageCopy("contact", "privateDesk", "hoursPrefix", e.target.value)}
                    placeholder="Advisory Desk:"
                    className="w-full border border-sand p-2.5 text-xs text-ink"
                  />
                </div>
                <div>
                  <label className="block text-[0.65rem] uppercase tracking-widest text-stone mb-1">
                    City Fallback Footer
                  </label>
                  <input
                    type="text"
                    value={privateDesk.cityFallback || ""}
                    onChange={(e) => updatePageCopy("contact", "privateDesk", "cityFallback", e.target.value)}
                    placeholder="Hyderabad, India"
                    className="w-full border border-sand p-2.5 text-xs text-ink"
                  />
                </div>
              </div>
            </div>

            {/* Studio & Concierge Office Details */}
            <div className="bg-white p-6 border border-sand shadow-sm space-y-5">
              <h3 className="font-display text-2xl text-ink">Studio & Concierge Location</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-[0.65rem] uppercase tracking-widest text-stone mb-1">
                    Eyebrow
                  </label>
                  <input
                    type="text"
                    value={contactDetails.eyebrow || ""}
                    onChange={(e) => updatePageCopy("contact", "details", "eyebrow", e.target.value)}
                    placeholder="ADVISORY OFFICE"
                    className="w-full border border-sand p-2.5 text-xs text-ink"
                  />
                </div>
                <div>
                  <label className="block text-[0.65rem] uppercase tracking-widest text-stone mb-1">
                    Heading
                  </label>
                  <input
                    type="text"
                    value={contactDetails.title || ""}
                    onChange={(e) => updatePageCopy("contact", "details", "title", e.target.value)}
                    placeholder="Studio & Concierge"
                    className="w-full border border-sand p-2.5 text-xs text-ink"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-[0.65rem] uppercase tracking-widest text-stone mb-1">
                    Physical Address Line
                  </label>
                  <input
                    type="text"
                    value={content.company?.contact?.addressLine || ""}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        company: {
                          ...content.company,
                          contact: { ...content.company.contact, addressLine: e.target.value },
                        },
                      })
                    }
                    placeholder="Road No. 36, Jubilee Hills"
                    className="w-full border border-sand p-2.5 text-xs text-ink"
                  />
                </div>
                <div>
                  <label className="block text-[0.65rem] uppercase tracking-widest text-stone mb-1">
                    City, State & Pincode
                  </label>
                  <input
                    type="text"
                    value={content.company?.contact?.city || ""}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        company: {
                          ...content.company,
                          contact: { ...content.company.contact, city: e.target.value },
                        },
                      })
                    }
                    placeholder="Hyderabad, Telangana — 500033"
                    className="w-full border border-sand p-2.5 text-xs text-ink"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-[0.65rem] uppercase tracking-widest text-stone mb-1">
                    Direct Email Address
                  </label>
                  <input
                    type="email"
                    value={content.company?.contact?.email || ""}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        company: {
                          ...content.company,
                          contact: { ...content.company.contact, email: e.target.value },
                        },
                      })
                    }
                    placeholder="enquiries@kksconstructions.com"
                    className="w-full border border-sand p-2.5 text-xs text-ink"
                  />
                </div>
                <div>
                  <label className="block text-[0.65rem] uppercase tracking-widest text-stone mb-1">
                    Advisory Operating Hours
                  </label>
                  <input
                    type="text"
                    value={content.company?.contact?.hours || ""}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        company: {
                          ...content.company,
                          contact: { ...content.company.contact, hours: e.target.value },
                        },
                      })
                    }
                    placeholder="Monday–Saturday, 10:00 AM – 6:30 PM IST"
                    className="w-full border border-sand p-2.5 text-xs text-ink"
                  />
                </div>
              </div>

              {/* Instant WhatsApp Consultation Box */}
              <div className="border border-sand bg-cream/30 p-4 space-y-3">
                <span className="text-[0.62rem] uppercase tracking-widest text-gold-deep font-medium">
                  Instant Advisory Box
                </span>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div>
                    <label className="block text-[0.65rem] uppercase tracking-widest text-stone mb-1">Heading</label>
                    <input
                      type="text"
                      value={contactDetails.whatsappTitle || ""}
                      onChange={(e) => updatePageCopy("contact", "details", "whatsappTitle", e.target.value)}
                      placeholder="Instant Advisory"
                      className="w-full border border-sand p-2 text-xs text-ink"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[0.65rem] uppercase tracking-widest text-stone mb-1">Description</label>
                    <input
                      type="text"
                      value={contactDetails.whatsappCopy || ""}
                      onChange={(e) => updatePageCopy("contact", "details", "whatsappCopy", e.target.value)}
                      placeholder="Connect directly with an authorized sales advisor via WhatsApp or phone consultation for fast responses."
                      className="w-full border border-sand p-2 text-xs text-ink"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Frequently Asked Questions */}
            <div className="bg-white p-6 border border-sand shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-sand pb-3">
                <div>
                  <span className="text-[0.62rem] uppercase tracking-[0.24em] text-gold-deep font-semibold">Contact FAQs</span>
                  <h3 className="font-display text-2xl text-ink">Frequently Asked Questions</h3>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setContent((prev) => ({
                      ...prev,
                      faqs: [...(prev.faqs || []), { q: "New Question?", a: "Detailed answer..." }],
                    }))
                  }
                  className="inline-flex items-center gap-1.5 border border-ink bg-white px-3 py-1.5 text-xs uppercase tracking-wider hover:bg-gold transition"
                >
                  <Plus className="size-3.5" /> Add FAQ
                </button>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-[0.65rem] uppercase tracking-widest text-stone mb-1">FAQ Section Eyebrow</label>
                  <input
                    type="text"
                    value={contactFaq.eyebrow || ""}
                    onChange={(e) => updatePageCopy("contact", "faq", "eyebrow", e.target.value)}
                    placeholder="Buyer Information"
                    className="w-full border border-sand p-2 text-xs text-ink"
                  />
                </div>
                <div>
                  <label className="block text-[0.65rem] uppercase tracking-widest text-stone mb-1">FAQ Section Title</label>
                  <input
                    type="text"
                    value={contactFaq.title || ""}
                    onChange={(e) => updatePageCopy("contact", "faq", "title", e.target.value)}
                    placeholder="Frequently Asked Questions"
                    className="w-full border border-sand p-2 text-xs text-ink"
                  />
                </div>
              </div>

              <div className="space-y-3 pt-2">
                {(content.faqs || []).map((item, index) => (
                  <div key={index} className="border border-sand p-4 bg-cream/20 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[0.62rem] uppercase tracking-wider text-stone font-semibold">Question {index + 1}</span>
                      <button
                        type="button"
                        onClick={() =>
                          setContent((prev) => ({
                            ...prev,
                            faqs: prev.faqs.filter((_, i) => i !== index),
                          }))
                        }
                        className="text-stone hover:text-red-700 p-1"
                        title="Delete question"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                    <input
                      type="text"
                      value={item.q || ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        setContent((prev) => ({
                          ...prev,
                          faqs: prev.faqs.map((f, i) => (i === index ? { ...f, q: val } : f)),
                        }));
                      }}
                      placeholder="Question text"
                      className="w-full border border-sand p-2 text-xs text-ink font-medium"
                    />
                    <textarea
                      rows={2}
                      value={item.a || ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        setContent((prev) => ({
                          ...prev,
                          faqs: prev.faqs.map((f, i) => (i === index ? { ...f, a: val } : f)),
                        }));
                      }}
                      placeholder="Answer text"
                      className="w-full border border-sand p-2 text-xs text-ink"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 2. COMPANY PROFILE */}
        {/* ========================================================================= */}
        {activeSection === "company" && (
          <div className="bg-white p-6 border border-sand shadow-sm space-y-6">
            <h3 className="font-display text-2xl text-ink">Company Identity & Philosophy</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-[0.65rem] uppercase tracking-widest text-stone mb-1">Company Legal Name</label>
                <input
                  type="text"
                  value={content.company?.name || ""}
                  onChange={(e) =>
                    setContent({ ...content, company: { ...content.company, name: e.target.value } })
                  }
                  className="w-full border border-sand p-2.5 text-xs text-ink"
                />
              </div>
              <div>
                <label className="block text-[0.65rem] uppercase tracking-widest text-stone mb-1">Short Brand Moniker</label>
                <input
                  type="text"
                  value={content.company?.shortName || ""}
                  onChange={(e) =>
                    setContent({ ...content, company: { ...content.company, shortName: e.target.value } })
                  }
                  className="w-full border border-sand p-2.5 text-xs text-ink"
                />
              </div>
            </div>

            <div>
              <label className="block text-[0.65rem] uppercase tracking-widest text-stone mb-1">Brand Tagline</label>
              <input
                type="text"
                value={content.company?.tagline || ""}
                onChange={(e) =>
                  setContent({ ...content, company: { ...content.company, tagline: e.target.value } })
                }
                className="w-full border border-sand p-2.5 text-xs text-ink"
              />
            </div>

            {/* Logo Upload */}
            <div className="border border-sand p-4 bg-cream/40 flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <img
                src={getMediaUrl(content.company?.logo || "/images/logo.png")}
                alt="Logo preview"
                className="h-12 w-auto object-contain border border-sand bg-ink p-1"
              />
              <div className="flex-1 space-y-2">
                <input
                  type="text"
                  value={content.company?.logo || ""}
                  onChange={(e) =>
                    setContent({ ...content, company: { ...content.company, logo: e.target.value } })
                  }
                  className="w-full border border-sand p-2 text-xs"
                  placeholder="Logo URL"
                />
                <label className="inline-flex items-center gap-2 border border-ink bg-white px-3 py-1.5 text-xs uppercase tracking-wider cursor-pointer hover:bg-gold transition">
                  <Upload className="size-3.5" />
                  {uploading ? "Uploading…" : "Upload Logo Image"}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) =>
                      handleFileUpload(e.target.files?.[0], (url) =>
                        setContent((prev) => ({ ...prev, company: { ...prev.company, logo: url } }))
                      )
                    }
                  />
                </label>
              </div>
            </div>

            <div>
              <label className="block text-[0.65rem] uppercase tracking-widest text-stone mb-1">Short Brand Bio</label>
              <textarea
                rows={3}
                value={content.company?.description || ""}
                onChange={(e) =>
                  setContent({ ...content, company: { ...content.company, description: e.target.value } })
                }
                className="w-full border border-sand p-2.5 text-xs text-ink"
              />
            </div>

            <div>
              <label className="block text-[0.65rem] uppercase tracking-widest text-stone mb-1">Detailed Overview Narrative</label>
              <textarea
                rows={3}
                value={content.company?.overview || ""}
                onChange={(e) =>
                  setContent({ ...content, company: { ...content.company, overview: e.target.value } })
                }
                className="w-full border border-sand p-2.5 text-xs text-ink"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-[0.65rem] uppercase tracking-widest text-stone mb-1">Mission Statement</label>
                <textarea
                  rows={2}
                  value={content.company?.mission || ""}
                  onChange={(e) =>
                    setContent({ ...content, company: { ...content.company, mission: e.target.value } })
                  }
                  className="w-full border border-sand p-2.5 text-xs text-ink"
                />
              </div>
              <div>
                <label className="block text-[0.65rem] uppercase tracking-widest text-stone mb-1">Vision Statement</label>
                <textarea
                  rows={2}
                  value={content.company?.vision || ""}
                  onChange={(e) =>
                    setContent({ ...content, company: { ...content.company, vision: e.target.value } })
                  }
                  className="w-full border border-sand p-2.5 text-xs text-ink"
                />
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 3. HOME PAGE SUBSECTIONS */}
        {/* ========================================================================= */}
        {activeSection === "home" && (
          <div className="space-y-6">
            {/* Homepage Intro Section */}
            <div className="bg-white p-6 border border-sand shadow-sm space-y-4">
              <h3 className="font-display text-2xl text-ink">Company Introduction Section</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-[0.65rem] uppercase tracking-widest text-stone mb-1">Intro Eyebrow</label>
                  <input
                    type="text"
                    value={content.homeIntro?.eyebrow || ""}
                    onChange={(e) => setContent({ ...content, homeIntro: { ...content.homeIntro, eyebrow: e.target.value } })}
                    placeholder="The house of KKS"
                    className="w-full border border-sand p-2.5 text-xs text-ink"
                  />
                </div>
                <div>
                  <label className="block text-[0.65rem] uppercase tracking-widest text-stone mb-1">Intro Title</label>
                  <input
                    type="text"
                    value={content.homeIntro?.title || ""}
                    onChange={(e) => setContent({ ...content, homeIntro: { ...content.homeIntro, title: e.target.value } })}
                    placeholder="Measured luxury, made to last."
                    className="w-full border border-sand p-2.5 text-xs text-ink"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[0.65rem] uppercase tracking-widest text-stone mb-1">Intro Description</label>
                <textarea
                  rows={3}
                  value={content.homeIntro?.copy || ""}
                  onChange={(e) => setContent({ ...content, homeIntro: { ...content.homeIntro, copy: e.target.value } })}
                  className="w-full border border-sand p-2.5 text-xs text-ink"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-[0.65rem] uppercase tracking-widest text-stone mb-1">Button Label</label>
                  <input
                    type="text"
                    value={content.homeIntro?.buttonLabel || ""}
                    onChange={(e) => setContent({ ...content, homeIntro: { ...content.homeIntro, buttonLabel: e.target.value } })}
                    placeholder="About KKS Constructions"
                    className="w-full border border-sand p-2.5 text-xs text-ink"
                  />
                </div>
                <div>
                  <label className="block text-[0.65rem] uppercase tracking-widest text-stone mb-1">Button Destination (Path)</label>
                  <input
                    type="text"
                    value={content.homeIntro?.buttonUrl || ""}
                    onChange={(e) => setContent({ ...content, homeIntro: { ...content.homeIntro, buttonUrl: e.target.value } })}
                    placeholder="/about"
                    className="w-full border border-sand p-2.5 text-xs text-ink"
                  />
                </div>
              </div>
            </div>

            {/* Featured Projects Callout on Home */}
            <div className="bg-white p-6 border border-sand shadow-sm space-y-4">
              <h3 className="font-display text-2xl text-ink">Featured Projects Preview Header</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-[0.65rem] uppercase tracking-widest text-stone mb-1">Eyebrow</label>
                  <input
                    type="text"
                    value={homeProjects.eyebrow || ""}
                    onChange={(e) => updatePageCopy("home", "projects", "eyebrow", e.target.value)}
                    placeholder="Selected work"
                    className="w-full border border-sand p-2 text-xs text-ink"
                  />
                </div>
                <div>
                  <label className="block text-[0.65rem] uppercase tracking-widest text-stone mb-1">Title</label>
                  <input
                    type="text"
                    value={homeProjects.title || ""}
                    onChange={(e) => updatePageCopy("home", "projects", "title", e.target.value)}
                    placeholder="Featured residences"
                    className="w-full border border-sand p-2 text-xs text-ink"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[0.65rem] uppercase tracking-widest text-stone mb-1">Copy</label>
                <textarea
                  rows={2}
                  value={homeProjects.copy || ""}
                  onChange={(e) => updatePageCopy("home", "projects", "copy", e.target.value)}
                  className="w-full border border-sand p-2 text-xs text-ink"
                />
              </div>
            </div>

            {/* Testimonials Callout on Home */}
            <div className="bg-white p-6 border border-sand shadow-sm space-y-4">
              <h3 className="font-display text-2xl text-ink">Testimonials Callout on Home</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-[0.65rem] uppercase tracking-widest text-stone mb-1">Eyebrow</label>
                  <input
                    type="text"
                    value={homeTestimonials.eyebrow || ""}
                    onChange={(e) => updatePageCopy("home", "testimonials", "eyebrow", e.target.value)}
                    placeholder="Voices"
                    className="w-full border border-sand p-2 text-xs text-ink"
                  />
                </div>
                <div>
                  <label className="block text-[0.65rem] uppercase tracking-widest text-stone mb-1">Title</label>
                  <input
                    type="text"
                    value={homeTestimonials.title || ""}
                    onChange={(e) => updatePageCopy("home", "testimonials", "title", e.target.value)}
                    placeholder="Reflections on Living with KKS"
                    className="w-full border border-sand p-2 text-xs text-ink"
                  />
                </div>
              </div>
            </div>

            {/* Contact Callout on Home */}
            <div className="bg-white p-6 border border-sand shadow-sm space-y-4">
              <h3 className="font-display text-2xl text-ink">Contact Callout on Home</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-[0.65rem] uppercase tracking-widest text-stone mb-1">Eyebrow</label>
                  <input
                    type="text"
                    value={homeContact.eyebrow || ""}
                    onChange={(e) => updatePageCopy("home", "contact", "eyebrow", e.target.value)}
                    placeholder="Begin a conversation"
                    className="w-full border border-sand p-2 text-xs text-ink"
                  />
                </div>
                <div>
                  <label className="block text-[0.65rem] uppercase tracking-widest text-stone mb-1">Title</label>
                  <input
                    type="text"
                    value={homeContact.title || ""}
                    onChange={(e) => updatePageCopy("home", "contact", "title", e.target.value)}
                    placeholder="A private viewing, when you are ready."
                    className="w-full border border-sand p-2 text-xs text-ink"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 4. ABOUT PAGE & STORY */}
        {/* ========================================================================= */}
        {activeSection === "about" && (
          <div className="space-y-6">
            <div className="bg-white p-6 border border-sand shadow-sm space-y-4">
              <h3 className="font-display text-2xl text-ink">Story Narrative Subsection</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-[0.65rem] uppercase tracking-widest text-stone mb-1">Eyebrow</label>
                  <input
                    type="text"
                    value={aboutStory.eyebrow || ""}
                    onChange={(e) => updatePageCopy("about", "story", "eyebrow", e.target.value)}
                    placeholder="Overview"
                    className="w-full border border-sand p-2 text-xs text-ink"
                  />
                </div>
                <div>
                  <label className="block text-[0.65rem] uppercase tracking-widest text-stone mb-1">Title</label>
                  <input
                    type="text"
                    value={aboutStory.title || ""}
                    onChange={(e) => updatePageCopy("about", "story", "title", e.target.value)}
                    placeholder="The House of KKS"
                    className="w-full border border-sand p-2 text-xs text-ink"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[0.65rem] uppercase tracking-widest text-stone mb-1">Story Quote / Highlights</label>
                <textarea
                  rows={3}
                  value={aboutStory.quote || ""}
                  onChange={(e) => updatePageCopy("about", "story", "quote", e.target.value)}
                  className="w-full border border-sand p-2 text-xs text-ink"
                />
              </div>
            </div>

            {/* Construction Standards Benchmarks */}
            <div className="bg-white p-6 border border-sand shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-sand pb-3">
                <div>
                  <span className="text-[0.62rem] uppercase tracking-[0.24em] text-gold-deep font-semibold">About Page</span>
                  <h3 className="font-display text-2xl text-ink">Construction Standards Benchmarks</h3>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setContent((prev) => ({
                      ...prev,
                      standards: [
                        ...(prev.standards || []),
                        { icon: "ShieldCheck", title: "New Benchmark", text: "Benchmark description..." },
                      ],
                    }))
                  }
                  className="inline-flex items-center gap-1.5 border border-ink bg-white px-3 py-1.5 text-xs uppercase tracking-wider hover:bg-gold transition"
                >
                  <Plus className="size-3.5" /> Add Standard
                </button>
              </div>

              <div className="space-y-3">
                {(content.standards || []).map((std, index) => (
                  <div key={index} className="border border-sand p-4 bg-cream/20 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[0.62rem] uppercase tracking-wider text-stone font-semibold">Standard {index + 1}</span>
                      <button
                        type="button"
                        onClick={() =>
                          setContent((prev) => ({
                            ...prev,
                            standards: prev.standards.filter((_, i) => i !== index),
                          }))
                        }
                        className="text-stone hover:text-red-700 p-1"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-3">
                      <div>
                        <label className="block text-[0.6rem] uppercase tracking-widest text-stone mb-1">Icon Name</label>
                        <input
                          type="text"
                          value={std.icon || ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            setContent((prev) => ({
                              ...prev,
                              standards: prev.standards.map((s, i) => (i === index ? { ...s, icon: val } : s)),
                            }));
                          }}
                          placeholder="Compass / ShieldCheck / Award"
                          className="w-full border border-sand p-2 text-xs text-ink"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-[0.6rem] uppercase tracking-widest text-stone mb-1">Title</label>
                        <input
                          type="text"
                          value={std.title || ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            setContent((prev) => ({
                              ...prev,
                              standards: prev.standards.map((s, i) => (i === index ? { ...s, title: val } : s)),
                            }));
                          }}
                          className="w-full border border-sand p-2 text-xs text-ink font-medium"
                        />
                      </div>
                    </div>
                    <textarea
                      rows={2}
                      value={std.text || ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        setContent((prev) => ({
                          ...prev,
                          standards: prev.standards.map((s, i) => (i === index ? { ...s, text: val } : s)),
                        }));
                      }}
                      className="w-full border border-sand p-2 text-xs text-ink"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Milestones */}
            <div className="bg-white p-6 border border-sand shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-sand pb-3">
                <div>
                  <span className="text-[0.62rem] uppercase tracking-[0.24em] text-gold-deep font-semibold">About Page</span>
                  <h3 className="font-display text-2xl text-ink">Milestones of Excellence</h3>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setContent((prev) => ({
                      ...prev,
                      milestones: [
                        ...(prev.milestones || []),
                        { year: "Phase IV", title: "New Era", desc: "Milestone details..." },
                      ],
                    }))
                  }
                  className="inline-flex items-center gap-1.5 border border-ink bg-white px-3 py-1.5 text-xs uppercase tracking-wider hover:bg-gold transition"
                >
                  <Plus className="size-3.5" /> Add Milestone
                </button>
              </div>

              <div className="space-y-3">
                {(content.milestones || []).map((ms, index) => (
                  <div key={index} className="border border-sand p-4 bg-cream/20 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[0.62rem] uppercase tracking-wider text-stone font-semibold">Milestone {index + 1}</span>
                      <button
                        type="button"
                        onClick={() =>
                          setContent((prev) => ({
                            ...prev,
                            milestones: prev.milestones.filter((_, i) => i !== index),
                          }))
                        }
                        className="text-stone hover:text-red-700 p-1"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-3">
                      <div>
                        <label className="block text-[0.6rem] uppercase tracking-widest text-stone mb-1">Phase / Year</label>
                        <input
                          type="text"
                          value={ms.year || ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            setContent((prev) => ({
                              ...prev,
                              milestones: prev.milestones.map((m, i) => (i === index ? { ...m, year: val } : m)),
                            }));
                          }}
                          placeholder="Phase I / 2024"
                          className="w-full border border-sand p-2 text-xs text-ink"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-[0.6rem] uppercase tracking-widest text-stone mb-1">Heading</label>
                        <input
                          type="text"
                          value={ms.title || ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            setContent((prev) => ({
                              ...prev,
                              milestones: prev.milestones.map((m, i) => (i === index ? { ...m, title: val } : m)),
                            }));
                          }}
                          className="w-full border border-sand p-2 text-xs text-ink font-medium"
                        />
                      </div>
                    </div>
                    <textarea
                      rows={2}
                      value={ms.desc || ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        setContent((prev) => ({
                          ...prev,
                          milestones: prev.milestones.map((m, i) => (i === index ? { ...m, desc: val } : m)),
                        }));
                      }}
                      className="w-full border border-sand p-2 text-xs text-ink"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 5. SERVICES & CAPABILITIES */}
        {/* ========================================================================= */}
        {activeSection === "services" && (
          <div className="space-y-6">
            <div className="bg-white p-6 border border-sand shadow-sm space-y-4">
              <h3 className="font-display text-2xl text-ink">Services Capabilities Header</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-[0.65rem] uppercase tracking-widest text-stone mb-1">Eyebrow</label>
                  <input
                    type="text"
                    value={servicesList.eyebrow || ""}
                    onChange={(e) => updatePageCopy("services", "servicesList", "eyebrow", e.target.value)}
                    placeholder="Our Capabilities"
                    className="w-full border border-sand p-2 text-xs text-ink"
                  />
                </div>
                <div>
                  <label className="block text-[0.65rem] uppercase tracking-widest text-stone mb-1">Heading</label>
                  <input
                    type="text"
                    value={servicesList.title || ""}
                    onChange={(e) => updatePageCopy("services", "servicesList", "title", e.target.value)}
                    placeholder="Disciplines of Architectural Practice"
                    className="w-full border border-sand p-2 text-xs text-ink"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[0.65rem] uppercase tracking-widest text-stone mb-1">Header Description</label>
                <textarea
                  rows={2}
                  value={servicesList.copy || ""}
                  onChange={(e) => updatePageCopy("services", "servicesList", "copy", e.target.value)}
                  className="w-full border border-sand p-2 text-xs text-ink"
                />
              </div>
            </div>

            {/* 6 Capabilities Cards */}
            <div className="bg-white p-6 border border-sand shadow-sm space-y-4">
              <h3 className="font-display text-2xl text-ink">6 Architectural Disciplines & Offerings</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                {[1, 2, 3, 4, 5, 6].map((num) => (
                  <div key={num} className="border border-sand p-4 bg-cream/20 space-y-3">
                    <span className="text-[0.62rem] uppercase tracking-widest text-gold-deep font-semibold">
                      Discipline 0{num}
                    </span>
                    <div>
                      <label className="block text-[0.6rem] uppercase tracking-widest text-stone mb-1">Title</label>
                      <input
                        type="text"
                        value={servicesList[`service${num}Title`] || ""}
                        onChange={(e) => updatePageCopy("services", "servicesList", `service${num}Title`, e.target.value)}
                        className="w-full border border-sand p-2 text-xs text-ink font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-[0.6rem] uppercase tracking-widest text-stone mb-1">Category</label>
                      <input
                        type="text"
                        value={servicesList[`service${num}Category`] || ""}
                        onChange={(e) => updatePageCopy("services", "servicesList", `service${num}Category`, e.target.value)}
                        className="w-full border border-sand p-2 text-xs text-ink"
                      />
                    </div>
                    <div>
                      <label className="block text-[0.6rem] uppercase tracking-widest text-stone mb-1">Description</label>
                      <textarea
                        rows={2}
                        value={servicesList[`service${num}Desc`] || ""}
                        onChange={(e) => updatePageCopy("services", "servicesList", `service${num}Desc`, e.target.value)}
                        className="w-full border border-sand p-2 text-xs text-ink"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Services CTA Banner */}
            <div className="bg-white p-6 border border-sand shadow-sm space-y-4">
              <h3 className="font-display text-2xl text-ink">Commission Private Advisory CTA Banner</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-[0.65rem] uppercase tracking-widest text-stone mb-1">Eyebrow</label>
                  <input
                    type="text"
                    value={servicesCta.eyebrow || ""}
                    onChange={(e) => updatePageCopy("services", "servicesCta", "eyebrow", e.target.value)}
                    placeholder="Begin an Engagement"
                    className="w-full border border-sand p-2 text-xs text-ink"
                  />
                </div>
                <div>
                  <label className="block text-[0.65rem] uppercase tracking-widest text-stone mb-1">Heading</label>
                  <input
                    type="text"
                    value={servicesCta.title || ""}
                    onChange={(e) => updatePageCopy("services", "servicesCta", "title", e.target.value)}
                    placeholder="Commission a Private Advisory Consultation"
                    className="w-full border border-sand p-2 text-xs text-ink"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[0.65rem] uppercase tracking-widest text-stone mb-1">Copy</label>
                <textarea
                  rows={2}
                  value={servicesCta.copy || ""}
                  onChange={(e) => updatePageCopy("services", "servicesCta", "copy", e.target.value)}
                  className="w-full border border-sand p-2 text-xs text-ink"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-[0.65rem] uppercase tracking-widest text-stone mb-1">Button Label</label>
                  <input
                    type="text"
                    value={servicesCta.buttonLabel || ""}
                    onChange={(e) => updatePageCopy("services", "servicesCta", "buttonLabel", e.target.value)}
                    placeholder="Contact Advisory Desk"
                    className="w-full border border-sand p-2 text-xs text-ink"
                  />
                </div>
                <div>
                  <label className="block text-[0.65rem] uppercase tracking-widest text-stone mb-1">Button Destination</label>
                  <input
                    type="text"
                    value={servicesCta.buttonUrl || ""}
                    onChange={(e) => updatePageCopy("services", "servicesCta", "buttonUrl", e.target.value)}
                    placeholder="/contact"
                    className="w-full border border-sand p-2 text-xs text-ink"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 6. PORTFOLIO SEARCH LABELS */}
        {/* ========================================================================= */}
        {activeSection === "projects" && (
          <div className="bg-white p-6 border border-sand shadow-sm space-y-4">
            <h3 className="font-display text-2xl text-ink">Projects Portfolio Headers & Filter Labels</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-[0.65rem] uppercase tracking-widest text-stone mb-1">Section Eyebrow</label>
                <input
                  type="text"
                  value={portfolioLabels.eyebrow || ""}
                  onChange={(e) => updatePageCopy("projects", "portfolio", "eyebrow", e.target.value)}
                  placeholder="Portfolio"
                  className="w-full border border-sand p-2 text-xs text-ink"
                />
              </div>
              <div>
                <label className="block text-[0.65rem] uppercase tracking-widest text-stone mb-1">Section Heading</label>
                <input
                  type="text"
                  value={portfolioLabels.title || ""}
                  onChange={(e) => updatePageCopy("projects", "portfolio", "title", e.target.value)}
                  placeholder="Residences"
                  className="w-full border border-sand p-2 text-xs text-ink"
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="block text-[0.65rem] uppercase tracking-widest text-stone mb-1">Search Placeholder</label>
                <input
                  type="text"
                  value={portfolioLabels.searchPlaceholder || ""}
                  onChange={(e) => updatePageCopy("projects", "portfolio", "searchPlaceholder", e.target.value)}
                  placeholder="Search by name, city..."
                  className="w-full border border-sand p-2 text-xs text-ink"
                />
              </div>
              <div>
                <label className="block text-[0.65rem] uppercase tracking-widest text-stone mb-1">"Showing" Label</label>
                <input
                  type="text"
                  value={portfolioLabels.showingLabel || ""}
                  onChange={(e) => updatePageCopy("projects", "portfolio", "showingLabel", e.target.value)}
                  placeholder="Showing"
                  className="w-full border border-sand p-2 text-xs text-ink"
                />
              </div>
              <div>
                <label className="block text-[0.65rem] uppercase tracking-widest text-stone mb-1">"Residences" Count Label</label>
                <input
                  type="text"
                  value={portfolioLabels.residencesLabel || ""}
                  onChange={(e) => updatePageCopy("projects", "portfolio", "residencesLabel", e.target.value)}
                  placeholder="residences"
                  className="w-full border border-sand p-2 text-xs text-ink"
                />
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 7. TESTIMONIALS & CRITICAL PRAISE */}
        {/* ========================================================================= */}
        {activeSection === "testimonials" && (
          <div className="space-y-6">
            <div className="bg-white p-6 border border-sand shadow-sm space-y-4">
              <h3 className="font-display text-2xl text-ink">Critical Acclaim & Features Header</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-[0.65rem] uppercase tracking-widest text-stone mb-1">Eyebrow</label>
                  <input
                    type="text"
                    value={testRecognition.eyebrow || ""}
                    onChange={(e) => updatePageCopy("testimonials", "recognition", "eyebrow", e.target.value)}
                    placeholder="Recognition"
                    className="w-full border border-sand p-2 text-xs text-ink"
                  />
                </div>
                <div>
                  <label className="block text-[0.65rem] uppercase tracking-widest text-stone mb-1">Heading</label>
                  <input
                    type="text"
                    value={testRecognition.title || ""}
                    onChange={(e) => updatePageCopy("testimonials", "recognition", "title", e.target.value)}
                    placeholder="Critical Acclaim & Features"
                    className="w-full border border-sand p-2 text-xs text-ink"
                  />
                </div>
              </div>
            </div>

            {/* Press Mentions */}
            <div className="bg-white p-6 border border-sand shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-sand pb-3">
                <h3 className="font-display text-2xl text-ink">Press Mentions & Publications</h3>
                <button
                  type="button"
                  onClick={() =>
                    setContent((prev) => ({
                      ...prev,
                      pressMentions: [
                        ...(prev.pressMentions || []),
                        { publication: "New Publication", quote: "Editorial quote here..." },
                      ],
                    }))
                  }
                  className="inline-flex items-center gap-1.5 border border-ink bg-white px-3 py-1.5 text-xs uppercase tracking-wider hover:bg-gold transition"
                >
                  <Plus className="size-3.5" /> Add Press Quote
                </button>
              </div>

              <div className="space-y-3">
                {(content.pressMentions || []).map((pm, index) => (
                  <div key={index} className="border border-sand p-4 bg-cream/20 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[0.62rem] uppercase tracking-wider text-stone font-semibold">Mention {index + 1}</span>
                      <button
                        type="button"
                        onClick={() =>
                          setContent((prev) => ({
                            ...prev,
                            pressMentions: prev.pressMentions.filter((_, i) => i !== index),
                          }))
                        }
                        className="text-stone hover:text-red-700 p-1"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                    <input
                      type="text"
                      value={pm.publication || ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        setContent((prev) => ({
                          ...prev,
                          pressMentions: prev.pressMentions.map((p, i) => (i === index ? { ...p, publication: val } : p)),
                        }));
                      }}
                      placeholder="Architectural Digest / Publication"
                      className="w-full border border-sand p-2 text-xs text-ink font-medium"
                    />
                    <textarea
                      rows={2}
                      value={pm.quote || ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        setContent((prev) => ({
                          ...prev,
                          pressMentions: prev.pressMentions.map((p, i) => (i === index ? { ...p, quote: val } : p)),
                        }));
                      }}
                      className="w-full border border-sand p-2 text-xs text-ink"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 8. PROJECT DETAILS LABELS */}
        {/* ========================================================================= */}
        {activeSection === "details" && (
          <div className="bg-white p-6 border border-sand shadow-sm space-y-5">
            <h3 className="font-display text-2xl text-ink">Project Details Page Labels & Inquiries</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-[0.65rem] uppercase tracking-widest text-stone mb-1">Specifications Heading</label>
                <input
                  type="text"
                  value={detailOverview.specsTitle || ""}
                  onChange={(e) => updatePageCopy("projectDetails", "overview", "specsTitle", e.target.value)}
                  placeholder="Bespoke Specifications"
                  className="w-full border border-sand p-2.5 text-xs text-ink"
                />
              </div>
              <div>
                <label className="block text-[0.65rem] uppercase tracking-widest text-stone mb-1">Price Guidance Label</label>
                <input
                  type="text"
                  value={detailOverview.priceLabel || ""}
                  onChange={(e) => updatePageCopy("projectDetails", "overview", "priceLabel", e.target.value)}
                  placeholder="Price guidance"
                  className="w-full border border-sand p-2.5 text-xs text-ink"
                />
              </div>
            </div>

            <div>
              <label className="block text-[0.65rem] uppercase tracking-widest text-stone mb-1">Default Specifications Description</label>
              <textarea
                rows={2}
                value={detailOverview.specsCopy || ""}
                onChange={(e) => updatePageCopy("projectDetails", "overview", "specsCopy", e.target.value)}
                className="w-full border border-sand p-2.5 text-xs text-ink"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-[0.65rem] uppercase tracking-widest text-stone mb-1">Amenities Eyebrow</label>
                <input
                  type="text"
                  value={detailAmenities.eyebrow || ""}
                  onChange={(e) => updatePageCopy("projectDetails", "amenities", "eyebrow", e.target.value)}
                  placeholder="Lifestyle"
                  className="w-full border border-sand p-2.5 text-xs text-ink"
                />
              </div>
              <div>
                <label className="block text-[0.65rem] uppercase tracking-widest text-stone mb-1">Amenities Heading</label>
                <input
                  type="text"
                  value={detailAmenities.title || ""}
                  onChange={(e) => updatePageCopy("projectDetails", "amenities", "title", e.target.value)}
                  placeholder="Curated Amenities & Facilities"
                  className="w-full border border-sand p-2.5 text-xs text-ink"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-[0.65rem] uppercase tracking-widest text-stone mb-1">Acquisition Card Title</label>
                <input
                  type="text"
                  value={detailEnquiry.title || ""}
                  onChange={(e) => updatePageCopy("projectDetails", "enquiry", "title", e.target.value)}
                  placeholder="Begin Your Acquisition"
                  className="w-full border border-sand p-2.5 text-xs text-ink"
                />
              </div>
              <div>
                <label className="block text-[0.65rem] uppercase tracking-widest text-stone mb-1">Schedule Button Label</label>
                <input
                  type="text"
                  value={detailEnquiry.buttonLabel || ""}
                  onChange={(e) => updatePageCopy("projectDetails", "enquiry", "buttonLabel", e.target.value)}
                  placeholder="Schedule Private Viewing"
                  className="w-full border border-sand p-2.5 text-xs text-ink"
                />
              </div>
            </div>

            <div>
              <label className="block text-[0.65rem] uppercase tracking-widest text-stone mb-1">Acquisition Card Notice / Instructions</label>
              <textarea
                rows={2}
                value={detailEnquiry.brochureNotice || ""}
                onChange={(e) => updatePageCopy("projectDetails", "enquiry", "brochureNotice", e.target.value)}
                placeholder="Digital portfolio prepared. For any enquiries or floor plans, please contact us directly through phone, WhatsApp, or Instagram."
                className="w-full border border-sand p-2.5 text-xs text-ink"
              />
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 9. METRICS & CORE VALUES */}
        {/* ========================================================================= */}
        {activeSection === "metrics" && (
          <div className="space-y-6">
            {/* Highlights Statistics */}
            <div className="bg-white p-6 border border-sand shadow-sm space-y-4">
              <h3 className="font-display text-2xl text-ink">4 Key Benchmark Statistics</h3>
              <div className="grid gap-4 sm:grid-cols-4">
                {(content.highlights || []).map((stat, idx) => (
                  <div key={idx} className="border border-sand p-3 bg-cream/30 space-y-2">
                    <span className="text-[0.62rem] uppercase tracking-wider text-gold-deep font-semibold">Stat {idx + 1}</span>
                    <input
                      type="text"
                      value={stat.value || ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        setContent((prev) => ({
                          ...prev,
                          highlights: prev.highlights.map((h, i) => (i === idx ? { ...h, value: val } : h)),
                        }));
                      }}
                      placeholder="22+"
                      className="w-full border border-sand p-2 text-xs font-mono font-bold text-ink"
                    />
                    <input
                      type="text"
                      value={stat.label || ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        setContent((prev) => ({
                          ...prev,
                          highlights: prev.highlights.map((h, i) => (i === idx ? { ...h, label: val } : h)),
                        }));
                      }}
                      placeholder="Years of practice"
                      className="w-full border border-sand p-2 text-xs text-stone"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Core Values */}
            <div className="bg-white p-6 border border-sand shadow-sm space-y-4">
              <h3 className="font-display text-2xl text-ink">4 Core Values of Practice</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                {(content.values || []).map((val, idx) => (
                  <div key={idx} className="border border-sand p-4 bg-cream/30 space-y-2">
                    <span className="text-[0.62rem] uppercase tracking-wider text-gold-deep font-semibold">Value {idx + 1}</span>
                    <input
                      type="text"
                      value={val.title || ""}
                      onChange={(e) => {
                        const v = e.target.value;
                        setContent((prev) => ({
                          ...prev,
                          values: prev.values.map((item, i) => (i === idx ? { ...item, title: v } : item)),
                        }));
                      }}
                      placeholder="Craft / Restraint / Stewardship / Transparency"
                      className="w-full border border-sand p-2 text-xs font-semibold text-ink"
                    />
                    <textarea
                      rows={2}
                      value={val.text || ""}
                      onChange={(e) => {
                        const v = e.target.value;
                        setContent((prev) => ({
                          ...prev,
                          values: prev.values.map((item, i) => (i === idx ? { ...item, text: v } : item)),
                        }));
                      }}
                      className="w-full border border-sand p-2 text-xs text-stone"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 10. PAGE HERO BANNERS */}
        {/* ========================================================================= */}
        {activeSection === "heroes" && (
          <div className="bg-white p-6 border border-sand shadow-sm space-y-6">
            <h3 className="font-display text-2xl text-ink">Page Hero Banners & Photography</h3>
            <div className="space-y-6">
              {[
                { key: "home", label: "Home Page Hero" },
                { key: "about", label: "About Page Hero" },
                { key: "projects", label: "Projects / Portfolio Hero" },
                { key: "services", label: "Services Page Hero" },
                { key: "contact", label: "Contact Us Hero" },
                { key: "testimonials", label: "Testimonials Hero" },
                { key: "privacy", label: "Privacy Policy Hero" },
              ].map(({ key, label }) => {
                const hero = content.pageHeroes?.[key] || {};
                return (
                  <div key={key} className="border border-sand p-5 bg-cream/20 space-y-4">
                    <div className="flex items-center justify-between border-b border-sand pb-2">
                      <h4 className="font-display text-lg text-ink">{label}</h4>
                      <span className="text-[0.62rem] uppercase tracking-wider text-stone font-mono">{key}</span>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block text-[0.65rem] uppercase tracking-widest text-stone mb-1">Banner Eyebrow</label>
                        <input
                          type="text"
                          value={hero.eyebrow || ""}
                          onChange={(e) =>
                            setContent({
                              ...content,
                              pageHeroes: {
                                ...content.pageHeroes,
                                [key]: { ...hero, eyebrow: e.target.value },
                              },
                            })
                          }
                          className="w-full border border-sand p-2 text-xs text-ink"
                        />
                      </div>
                      <div>
                        <label className="block text-[0.65rem] uppercase tracking-widest text-stone mb-1">Banner Heading</label>
                        <input
                          type="text"
                          value={hero.title || ""}
                          onChange={(e) =>
                            setContent({
                              ...content,
                              pageHeroes: {
                                ...content.pageHeroes,
                                [key]: { ...hero, title: e.target.value },
                              },
                            })
                          }
                          className="w-full border border-sand p-2 text-xs text-ink font-medium"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[0.65rem] uppercase tracking-widest text-stone mb-1">Banner Subtitle / Copy</label>
                      <textarea
                        rows={2}
                        value={hero.copy || ""}
                        onChange={(e) =>
                          setContent({
                            ...content,
                            pageHeroes: {
                              ...content.pageHeroes,
                              [key]: { ...hero, copy: e.target.value },
                            },
                          })
                        }
                        className="w-full border border-sand p-2 text-xs text-ink"
                      />
                    </div>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                      <img
                        src={getMediaUrl(hero.image || "/images/hero-tower.jpg")}
                        alt=""
                        className="h-20 w-36 object-cover border border-sand"
                      />
                      <div className="flex-1 space-y-2">
                        <input
                          type="text"
                          value={hero.image || ""}
                          onChange={(e) =>
                            setContent({
                              ...content,
                              pageHeroes: {
                                ...content.pageHeroes,
                                [key]: { ...hero, image: e.target.value },
                              },
                            })
                          }
                          className="w-full border border-sand p-2 text-xs"
                          placeholder="Image URL"
                        />
                        <label className="inline-flex items-center gap-2 border border-ink bg-white px-3 py-1.5 text-xs uppercase tracking-wider cursor-pointer hover:bg-gold transition">
                          <Upload className="size-3.5" />
                          {uploading ? "Uploading…" : "Upload Banner Image"}
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) =>
                              handleFileUpload(e.target.files?.[0], (url) =>
                                setContent((prev) => ({
                                  ...prev,
                                  pageHeroes: {
                                    ...prev.pageHeroes,
                                    [key]: { ...(prev.pageHeroes?.[key] || {}), image: url },
                                  },
                                }))
                              )
                            }
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 11. NAVIGATION & FOOTER */}
        {/* ========================================================================= */}
        {activeSection === "navigation" && (
          <div className="space-y-6">
            <div className="bg-white p-6 border border-sand shadow-sm space-y-4">
              <h3 className="font-display text-2xl text-ink">Footer Details & Copyright</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-[0.65rem] uppercase tracking-widest text-stone mb-1">Footer Tagline</label>
                  <input
                    type="text"
                    value={content.footer?.tagline || ""}
                    onChange={(e) => setContent({ ...content, footer: { ...content.footer, tagline: e.target.value } })}
                    placeholder="Landmarks of quiet luxury"
                    className="w-full border border-sand p-2 text-xs text-ink"
                  />
                </div>
                <div>
                  <label className="block text-[0.65rem] uppercase tracking-widest text-stone mb-1">Established Year Text</label>
                  <input
                    type="text"
                    value={content.footer?.established || ""}
                    onChange={(e) => setContent({ ...content, footer: { ...content.footer, established: e.target.value } })}
                    placeholder="Est. 2002 · India"
                    className="w-full border border-sand p-2 text-xs text-ink"
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-[0.65rem] uppercase tracking-widest text-stone mb-1">Copyright Statement</label>
                  <input
                    type="text"
                    value={content.footer?.copyright || ""}
                    onChange={(e) => setContent({ ...content, footer: { ...content.footer, copyright: e.target.value } })}
                    placeholder="© 2026 KKS Constructions. All rights reserved."
                    className="w-full border border-sand p-2 text-xs text-ink"
                  />
                </div>
                <div>
                  <label className="block text-[0.65rem] uppercase tracking-widest text-stone mb-1">Enquiry Button Label</label>
                  <input
                    type="text"
                    value={content.footer?.enquiryLabel || ""}
                    onChange={(e) => setContent({ ...content, footer: { ...content.footer, enquiryLabel: e.target.value } })}
                    placeholder="Direct Advisory Desk"
                    className="w-full border border-sand p-2 text-xs text-ink"
                  />
                </div>
              </div>
            </div>

            {/* Legal Disclaimers */}
            <div className="bg-white p-6 border border-sand shadow-sm space-y-4">
              <h3 className="font-display text-2xl text-ink">Architectural & Legal Disclaimers</h3>
              <div>
                <label className="block text-[0.65rem] uppercase tracking-widest text-stone mb-1">Visuals / Renderings Disclaimer</label>
                <textarea
                  rows={2}
                  value={content.company?.disclaimers?.visuals || ""}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      company: {
                        ...content.company,
                        disclaimers: { ...content.company.disclaimers, visuals: e.target.value },
                      },
                    })
                  }
                  className="w-full border border-sand p-2 text-xs text-ink"
                />
              </div>
              <div>
                <label className="block text-[0.65rem] uppercase tracking-widest text-stone mb-1">RERA & Municipal Clearances Disclaimer</label>
                <textarea
                  rows={2}
                  value={content.company?.disclaimers?.legal || ""}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      company: {
                        ...content.company,
                        disclaimers: { ...content.company.disclaimers, legal: e.target.value },
                      },
                    })
                  }
                  className="w-full border border-sand p-2 text-xs text-ink"
                />
              </div>
            </div>
          </div>
        )}

        {/* Bottom Save Bar */}
        <div className="flex items-center justify-end gap-3 border-t border-sand pt-6">
          <button
            type="button"
            onClick={(e) => handleSave(e, false)}
            disabled={saving}
            className="border border-ink px-6 py-2.5 text-xs uppercase tracking-widest text-ink hover:bg-white transition disabled:opacity-50"
          >
            Save Draft
          </button>
          <button
            type="submit"
            disabled={saving}
            className="bg-ink px-8 py-2.5 text-xs uppercase tracking-widest text-cream hover:bg-gold hover:text-ink transition disabled:opacity-50"
          >
            {saving ? "Publishing…" : "Save & Publish"}
          </button>
        </div>
      </form>
    </div>
  );
}
