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
} from "lucide-react";
import { fetchAdminContent, updateAdminContent, uploadAdminImage, getMediaUrl } from "../../lib/api";
import { useSiteContent } from "../../context/ContentContext";
import { navLinks as defaultNavLinks } from "@data";

export default function AdminContent() {
  const { refreshContent } = useSiteContent();
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [activeSection, setActiveSection] = useState("company");
  const [toast, setToast] = useState(null);

  function showToast(message, type = "success") {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  }

  async function load() {
    setLoading(true);
    try {
      const res = await fetchAdminContent();
      setContent({
        ...res.content,
        navigationItems: res.content.navigationItems?.length ? res.content.navigationItems : defaultNavLinks,
        footer: res.content.footer || {},
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

  async function handleLogoUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const res = await uploadAdminImage(file);
      setContent((prev) => ({
        ...prev,
        company: { ...prev.company, logo: res.url },
      }));
      showToast("Logo uploaded successfully.");
    } catch (err) {
      showToast(err.message || "Failed to upload logo.", "error");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function handleHeroImageUpload(e, pageKey) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const res = await uploadAdminImage(file);
      setContent((prev) => ({
        ...prev,
        pageHeroes: {
          ...prev.pageHeroes,
          [pageKey]: {
            ...prev.pageHeroes?.[pageKey],
            image: res.url,
          },
        },
      }));
      showToast(`Hero banner for ${pageKey} updated.`);
    } catch (err) {
      showToast(err.message || "Failed to upload banner.", "error");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function handleSave(e, publish = true) {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      await updateAdminContent(content, { publish });
      if (publish && !(await refreshContent({ refresh: true }))) {
        showToast("Content was published, but this preview could not refresh. Reload to verify.", "error");
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
    return <div className="p-16 text-center text-stone animate-pulse">Loading website content...</div>;
  }

  if (!content) {
    return <div className="p-16 text-center text-stone">Could not load content editor.</div>;
  }

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
          <h2 className="font-display text-3xl text-ink">Website Text, Sections & Media</h2>
          <p className="mt-1 text-xs text-stone">
            All edits here are saved directly to MongoDB and immediately update the public website.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 self-start md:self-auto">
          <button type="button" onClick={(event) => handleSave(event, false)} disabled={saving} className="flex items-center gap-2 border border-ink px-5 py-2.5 text-[0.68rem] uppercase tracking-[0.2em] text-ink disabled:opacity-50">
            <Save className="size-4" /> Save Draft
          </button>
          <button type="button" onClick={handleSave} disabled={saving} className="flex items-center gap-2 bg-ink px-6 py-2.5 text-[0.68rem] uppercase tracking-[0.24em] text-cream hover:bg-gold hover:text-ink transition disabled:opacity-50">
            <Save className="size-4" /> {saving ? "Publishing..." : "Save & Publish"}
          </button>
        </div>
      </div>

      {/* Section Sub-Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-sand pb-2">
        {[
          { key: "company", label: "Company Profile", icon: Building },
          { key: "contact", label: "Contact & Studio", icon: Phone },
          { key: "metrics", label: "Metrics & Values", icon: Sparkles },
          { key: "heroes", label: "Page Banners", icon: Layers },
          { key: "navigation", label: "Navigation & Footer", icon: Link2 },
        ].map((tab) => {
          const Icon = tab.icon;
          const active = activeSection === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveSection(tab.key)}
              className={`flex items-center gap-2 px-4 py-2 text-xs uppercase tracking-wider transition border ${
                active
                  ? "border-gold bg-gold text-ink font-semibold"
                  : "border-transparent bg-white/60 text-stone hover:border-sand"
              }`}
            >
              <Icon className="size-3.5" /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* Form Content */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* 1. Company Profile */}
        {activeSection === "company" && (
          <div className="bg-white p-6 border border-sand shadow-sm space-y-6">
            <h3 className="font-display text-2xl text-ink">Company Identity & Philosophy</h3>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-[0.65rem] uppercase tracking-widest text-stone mb-1">
                  Company Legal Name
                </label>
                <input
                  type="text"
                  value={content.company?.name || ""}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      company: { ...content.company, name: e.target.value },
                    })
                  }
                  className="w-full border border-sand p-2.5 text-xs text-ink focus:border-gold focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[0.65rem] uppercase tracking-widest text-stone mb-1">
                  Short Brand Moniker
                </label>
                <input
                  type="text"
                  value={content.company?.shortName || ""}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      company: { ...content.company, shortName: e.target.value },
                    })
                  }
                  className="w-full border border-sand p-2.5 text-xs text-ink focus:border-gold focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[0.65rem] uppercase tracking-widest text-stone mb-1">
                Brand Tagline
              </label>
              <input
                type="text"
                value={content.company?.tagline || ""}
                onChange={(e) =>
                  setContent({
                    ...content,
                    company: { ...content.company, tagline: e.target.value },
                  })
                }
                className="w-full border border-sand p-2.5 text-xs text-ink focus:border-gold focus:outline-none"
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
                    setContent({
                      ...content,
                      company: { ...content.company, logo: e.target.value },
                    })
                  }
                  className="w-full border border-sand p-2 text-xs"
                  placeholder="Logo URL or upload"
                />
                <label className="inline-flex items-center gap-2 border border-ink bg-white px-3 py-1.5 text-xs uppercase tracking-wider cursor-pointer hover:bg-gold transition">
                  <Upload className="size-3.5" />
                  {uploading ? "Uploading..." : "Upload Logo Image"}
                  <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                </label>
              </div>
            </div>

            <div>
              <label className="block text-[0.65rem] uppercase tracking-widest text-stone mb-1">
                About Description (Short Story)
              </label>
              <textarea
                rows={3}
                value={content.company?.description || ""}
                onChange={(e) =>
                  setContent({
                    ...content,
                    company: { ...content.company, description: e.target.value },
                  })
                }
                className="w-full border border-sand p-2.5 text-xs text-ink"
              />
            </div>

            <div>
              <label className="block text-[0.65rem] uppercase tracking-widest text-stone mb-1">
                Detailed Overview
              </label>
              <textarea
                rows={3}
                value={content.company?.overview || ""}
                onChange={(e) =>
                  setContent({
                    ...content,
                    company: { ...content.company, overview: e.target.value },
                  })
                }
                className="w-full border border-sand p-2.5 text-xs text-ink"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-[0.65rem] uppercase tracking-widest text-stone mb-1">
                  Mission Statement
                </label>
                <textarea
                  rows={2}
                  value={content.company?.mission || ""}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      company: { ...content.company, mission: e.target.value },
                    })
                  }
                  className="w-full border border-sand p-2.5 text-xs text-ink"
                />
              </div>

              <div>
                <label className="block text-[0.65rem] uppercase tracking-widest text-stone mb-1">
                  Vision Statement
                </label>
                <textarea
                  rows={2}
                  value={content.company?.vision || ""}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      company: { ...content.company, vision: e.target.value },
                    })
                  }
                  className="w-full border border-sand p-2.5 text-xs text-ink"
                />
              </div>
            </div>
          </div>
        )}

        {/* 2. Contact, Studio & Social */}
        {activeSection === "contact" && (
          <div className="bg-white p-6 border border-sand shadow-sm space-y-6">
            <h3 className="font-display text-2xl text-ink">Advisory Studio & Contact Details</h3>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-[0.65rem] uppercase tracking-widest text-stone mb-1">
                  Address Line
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
                  className="w-full border border-sand p-2.5 text-xs text-ink"
                />
              </div>

              <div>
                <label className="block text-[0.65rem] uppercase tracking-widest text-stone mb-1">
                  City & State / Pincode
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
                  className="w-full border border-sand p-2.5 text-xs text-ink"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="block text-[0.65rem] uppercase tracking-widest text-stone mb-1">
                  Advisory Telephone
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
                  className="w-full border border-sand p-2.5 text-xs text-ink"
                />
              </div>

              <div>
                <label className="block text-[0.65rem] uppercase tracking-widest text-stone mb-1">
                  Public Email Address
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
                  className="w-full border border-sand p-2.5 text-xs text-ink"
                />
              </div>

              <div>
                <label className="block text-[0.65rem] uppercase tracking-widest text-stone mb-1">
                  WhatsApp Direct Number
                </label>
                <input
                  type="text"
                  value={content.company?.contact?.whatsapp || content.company?.contact?.phone || ""}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      company: {
                        ...content.company,
                        contact: { ...content.company.contact, whatsapp: e.target.value },
                      },
                    })
                  }
                  className="w-full border border-sand p-2.5 text-xs text-ink"
                />
              </div>
            </div>

            <div>
              <label className="block text-[0.65rem] uppercase tracking-widest text-stone mb-1">
                Studio Hours
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
                className="w-full border border-sand p-2.5 text-xs text-ink"
              />
            </div>

            <div>
              <label className="block text-[0.65rem] uppercase tracking-widest text-stone mb-1">
                Private Viewing Studio Note
              </label>
              <textarea
                rows={2}
                value={content.company?.contact?.mapNote || ""}
                onChange={(e) =>
                  setContent({
                    ...content,
                    company: {
                      ...content.company,
                      contact: { ...content.company.contact, mapNote: e.target.value },
                    },
                  })
                }
                className="w-full border border-sand p-2.5 text-xs text-ink"
              />
            </div>

            {/* Social Links */}
            <div className="border-t border-sand pt-4">
              <h4 className="font-display text-lg mb-3">Social Profiles</h4>
              <div className="grid gap-3 sm:grid-cols-3">
                <input
                  type="url"
                  placeholder="Instagram URL"
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
                  className="border border-sand p-2 text-xs"
                />
                <input
                  type="url"
                  placeholder="LinkedIn URL"
                  value={content.company?.social?.linkedin || ""}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      company: {
                        ...content.company,
                        social: { ...content.company.social, linkedin: e.target.value },
                      },
                    })
                  }
                  className="border border-sand p-2 text-xs"
                />
                <input
                  type="url"
                  placeholder="YouTube URL"
                  value={content.company?.social?.youtube || ""}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      company: {
                        ...content.company,
                        social: { ...content.company.social, youtube: e.target.value },
                      },
                    })
                  }
                  className="border border-sand p-2 text-xs"
                />
              </div>
            </div>

            {/* Disclaimers */}
            <div className="border-t border-sand pt-4 space-y-4">
              <h4 className="font-display text-lg">Legal & Visual Disclaimers</h4>
              <div>
                <label className="block text-[0.65rem] uppercase tracking-widest text-stone mb-1">
                  Architectural Visuals Disclaimer
                </label>
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
                  className="w-full border border-sand p-2 text-xs"
                />
              </div>
              <div>
                <label className="block text-[0.65rem] uppercase tracking-widest text-stone mb-1">
                  RERA Legal Compliance Disclaimer
                </label>
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
                  className="w-full border border-sand p-2 text-xs"
                />
              </div>
            </div>
          </div>
        )}

        {/* 3. Metrics & Values */}
        {activeSection === "metrics" && (
          <div className="space-y-6">
            {/* Highlights Grid */}
            <div className="bg-white p-6 border border-sand shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-display text-2xl text-ink">Key Highlights & Statistics</h3>
                  <p className="text-xs text-stone">Numbers shown on the homepage dark statistics banner.</p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setContent({
                      ...content,
                      highlights: [...(content.highlights || []), { value: "", label: "" }],
                    })
                  }
                  className="inline-flex items-center gap-1 text-xs uppercase tracking-wider text-gold-deep"
                >
                  <Plus className="size-3.5" /> Add Metric
                </button>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                {(content.highlights || []).map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 border border-sand p-3 bg-cream/30">
                    <input
                      type="text"
                      placeholder="e.g. 22+"
                      value={item.value}
                      onChange={(e) => {
                        const updated = [...content.highlights];
                        updated[idx].value = e.target.value;
                        setContent({ ...content, highlights: updated });
                      }}
                      className="w-1/3 border border-sand p-2 text-xs font-display text-base"
                    />
                    <input
                      type="text"
                      placeholder="e.g. Years of practice"
                      value={item.label}
                      onChange={(e) => {
                        const updated = [...content.highlights];
                        updated[idx].label = e.target.value;
                        setContent({ ...content, highlights: updated });
                      }}
                      className="flex-1 border border-sand p-2 text-xs"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setContent({
                          ...content,
                          highlights: content.highlights.filter((_, i) => i !== idx),
                        })
                      }
                      className="text-stone hover:text-red-700 p-1"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Core Values */}
            <div className="bg-white p-6 border border-sand shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-display text-2xl text-ink">Core Values</h3>
                  <p className="text-xs text-stone">Brand pillars displayed on the About page.</p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setContent({
                      ...content,
                      values: [...(content.values || []), { title: "", text: "" }],
                    })
                  }
                  className="inline-flex items-center gap-1 text-xs uppercase tracking-wider text-gold-deep"
                >
                  <Plus className="size-3.5" /> Add Value
                </button>
              </div>

              <div className="space-y-3">
                {(content.values || []).map((val, idx) => (
                  <div key={idx} className="flex flex-col sm:flex-row gap-3 border border-sand p-4 bg-cream/30">
                    <input
                      type="text"
                      placeholder="Title (e.g. Craft)"
                      value={val.title}
                      onChange={(e) => {
                        const updated = [...content.values];
                        updated[idx].title = e.target.value;
                        setContent({ ...content, values: updated });
                      }}
                      className="w-full sm:w-1/4 border border-sand p-2 text-xs font-display text-lg"
                    />
                    <textarea
                      rows={2}
                      placeholder="Description"
                      value={val.text}
                      onChange={(e) => {
                        const updated = [...content.values];
                        updated[idx].text = e.target.value;
                        setContent({ ...content, values: updated });
                      }}
                      className="flex-1 border border-sand p-2 text-xs"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setContent({
                          ...content,
                          values: content.values.filter((_, i) => i !== idx),
                        })
                      }
                      className="self-end sm:self-center text-stone hover:text-red-700 p-2"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 4. Page Hero Banners */}
        {activeSection === "heroes" && (
          <div className="bg-white p-6 border border-sand shadow-sm space-y-8">
            <div>
              <h3 className="font-display text-2xl text-ink">Webpage Hero Banners & Headers</h3>
              <p className="text-xs text-stone">
                Customize titles, eyebrows, and background visuals for every major webpage.
              </p>
            </div>

            {["home", "about", "projects", "services", "contact", "testimonials", "privacy"].map((page) => {
              const hero = content.pageHeroes?.[page] || {};
              return (
                <div key={page} className="border border-sand/80 p-5 bg-cream/30 space-y-4">
                  <div className="flex items-center justify-between border-b border-sand pb-2">
                    <h4 className="font-display text-xl uppercase tracking-wider text-gold-deep">
                      {page} Page Banner
                    </h4>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-[0.65rem] uppercase tracking-widest text-stone mb-1">
                        Eyebrow Label
                      </label>
                      <input
                        type="text"
                        value={hero.eyebrow || ""}
                        onChange={(e) =>
                          setContent({
                            ...content,
                            pageHeroes: {
                              ...content.pageHeroes,
                              [page]: { ...hero, eyebrow: e.target.value },
                            },
                          })
                        }
                        className="w-full border border-sand p-2 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[0.65rem] uppercase tracking-widest text-stone mb-1">
                        Main Heading Title
                      </label>
                      <input
                        type="text"
                        value={hero.title || ""}
                        onChange={(e) =>
                          setContent({
                            ...content,
                            pageHeroes: {
                              ...content.pageHeroes,
                              [page]: { ...hero, title: e.target.value },
                            },
                          })
                        }
                        className="w-full border border-sand p-2 text-xs font-display text-base"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[0.65rem] uppercase tracking-widest text-stone mb-1">
                      Banner Subtitle / Copy
                    </label>
                    <textarea
                      rows={2}
                      value={hero.copy || ""}
                      onChange={(e) =>
                        setContent({
                          ...content,
                          pageHeroes: {
                            ...content.pageHeroes,
                            [page]: { ...hero, copy: e.target.value },
                          },
                        })
                      }
                      className="w-full border border-sand p-2 text-xs"
                    />
                  </div>

                  {page === "home" && (
                    <div className="grid gap-4 sm:grid-cols-2">
                      {[
                        ["primaryButtonLabel", "Primary button label"],
                        ["primaryButtonUrl", "Primary button path"],
                        ["secondaryButtonLabel", "Secondary button label"],
                        ["secondaryButtonUrl", "Secondary button path"],
                      ].map(([key, label]) => (
                        <label key={key} className="block text-[0.65rem] uppercase tracking-widest text-stone">
                          {label}
                          <input
                            maxLength={120}
                            value={hero[key] || ""}
                            onChange={(e) => setContent({
                              ...content,
                              pageHeroes: {
                                ...content.pageHeroes,
                                [page]: { ...hero, [key]: e.target.value },
                              },
                            })}
                            className="mt-1 w-full border border-sand p-2 text-xs"
                            placeholder="/projects"
                          />
                        </label>
                      ))}
                    </div>
                  )}

                  {/* Banner Image */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 border border-sand p-3 bg-white">
                    <img
                      src={getMediaUrl(hero.image || "/images/hero-tower.jpg")}
                      alt=""
                      className="h-16 w-28 object-cover border border-sand bg-ink"
                    />
                    <div className="flex-1 space-y-1">
                      <input
                        type="text"
                        value={hero.image || ""}
                        onChange={(e) =>
                          setContent({
                            ...content,
                            pageHeroes: {
                              ...content.pageHeroes,
                              [page]: { ...hero, image: e.target.value },
                            },
                          })
                        }
                        className="w-full border border-sand p-1.5 text-xs"
                        placeholder="Image URL"
                      />
                      <label className="inline-flex items-center gap-1.5 border border-ink bg-cream px-3 py-1 text-[0.65rem] uppercase tracking-wider cursor-pointer hover:bg-gold transition">
                        <Upload className="size-3" />
                        {uploading ? "Uploading..." : "Upload New Banner"}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleHeroImageUpload(e, page)}
                        />
                      </label>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {activeSection === "navigation" && (
          <div className="space-y-6">
            <div className="bg-white p-6 border border-sand shadow-sm space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="font-display text-2xl text-ink">Website Navigation</h3>
                  <p className="text-xs text-stone">Manage public menu labels, destinations, and order. Use safe relative paths or HTTPS URLs.</p>
                </div>
                <button type="button" onClick={() => setContent({
                  ...content,
                  navigationItems: [...(content.navigationItems || []), { label: "", to: "" }],
                })} className="inline-flex items-center gap-1 text-xs uppercase tracking-wider text-gold-deep">
                  <Plus className="size-3.5" /> Add link
                </button>
              </div>
              <div className="space-y-3">
                {(content.navigationItems || []).map((item, index) => (
                  <div key={`${item.to}-${index}`} className="grid gap-3 border border-sand p-3 sm:grid-cols-[1fr_2fr_auto]">
                    <input aria-label="Navigation label" value={item.label || ""} maxLength={80} onChange={(event) => {
                      const links = [...content.navigationItems];
                      links[index] = { ...links[index], label: event.target.value };
                      setContent({ ...content, navigationItems: links });
                    }} className="border border-sand p-2 text-xs" placeholder="Menu label" />
                    <input aria-label="Navigation destination" value={item.to || ""} maxLength={2048} disabled={["/", "/projects", "/contact"].includes(item.to)} onChange={(event) => {
                      const links = [...content.navigationItems];
                      links[index] = { ...links[index], to: event.target.value };
                      setContent({ ...content, navigationItems: links });
                    }} className="border border-sand p-2 text-xs" placeholder="/projects or https://example.com" />
                    <button type="button" aria-label="Remove navigation link" disabled={["/", "/projects", "/contact"].includes(item.to)} onClick={() => setContent({
                      ...content,
                      navigationItems: content.navigationItems.filter((_, i) => i !== index),
                    })} className="p-2 text-red-700"><Trash2 className="size-4" /></button>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 border border-sand shadow-sm space-y-4">
              <h3 className="font-display text-2xl text-ink">Footer Details</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="text-[0.65rem] uppercase tracking-widest text-stone">Footer tagline
                  <input maxLength={240} value={content.footer?.tagline || ""} onChange={(event) => setContent({
                    ...content, footer: { ...content.footer, tagline: event.target.value },
                  })} className="mt-1 w-full border border-sand p-2.5 text-xs text-ink" />
                </label>
                <label className="text-[0.65rem] uppercase tracking-widest text-stone">Established label
                  <input maxLength={80} value={content.footer?.established || ""} onChange={(event) => setContent({
                    ...content, footer: { ...content.footer, established: event.target.value },
                  })} className="mt-1 w-full border border-sand p-2.5 text-xs text-ink" placeholder="Est. 2004" />
                </label>
              </div>
              <label className="block text-[0.65rem] uppercase tracking-widest text-stone">Copyright text
                <input maxLength={240} value={content.footer?.copyright || ""} onChange={(event) => setContent({
                  ...content, footer: { ...content.footer, copyright: event.target.value },
                })} className="mt-1 w-full border border-sand p-2.5 text-xs text-ink" placeholder="Leave empty to use the company name and current year" />
              </label>
              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  ["exploreLabel", "Footer navigation heading", "Explore"],
                  ["visitLabel", "Footer contact heading", "Visit"],
                  ["privacyLabel", "Privacy link label", "Privacy Policy"],
                  ["enquiryLabel", "Header enquiry button", "Enquire"],
                  ["enquiryUrl", "Header enquiry destination", "/contact"],
                ].map(([key, label, fallback]) => (
                  <label key={key} className="text-[0.65rem] uppercase tracking-widest text-stone">{label}
                    <input maxLength={key === "enquiryUrl" ? 2048 : 80} value={content.footer?.[key] || ""} placeholder={fallback} onChange={(event) => setContent({
                      ...content, footer: { ...content.footer, [key]: event.target.value },
                    })} className="mt-1 w-full border border-sand p-2.5 text-xs text-ink" />
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Bottom Save Bar */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 bg-ink px-8 py-3 text-[0.7rem] uppercase tracking-[0.26em] text-cream hover:bg-gold hover:text-ink transition disabled:opacity-50"
          >
            <Save className="size-4" />
            {saving ? "Saving Changes..." : "Publish Live Updates"}
          </button>
        </div>
      </form>
    </div>
  );
}
