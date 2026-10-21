import { useEffect, useMemo, useState } from "react";
import { ArrowDown, ArrowUp, Eye, EyeOff, ImagePlus, Plus, Save, Trash2 } from "lucide-react";
import { getMediaUrl, fetchAdminContent, updateAdminContent, uploadAdminImage } from "../../lib/api";
import { useSiteContent } from "../../context/ContentContext";
import { PageSectionPreview } from "../../components/PageSections";
import { navLinks as defaultNavLinks } from "@data";

const pages = ["home", "about", "projects", "services", "contact", "testimonials", "privacy", "projectDetails"];
const types = ["text", "image", "gallery", "callout", "cta", "quote", "video"];
const managedSections = {
  home: [
    ["home-hero", "Main hero"], ["home-intro", "Company introduction"],
    ["home-highlights", "Highlights"], ["home-projects", "Featured projects"],
    ["home-testimonials", "Testimonials"], ["home-contact", "Contact call-to-action"],
  ],
  about: [
    ["about-hero", "Page banner"],
    ["about-story", "Company story"], ["about-mission-vision", "Mission and vision"],
    ["about-standards", "Construction standards"], ["about-values", "Core values"],
    ["about-milestones", "Milestones"],
  ],
  projects: [["projects-hero", "Page banner"], ["projects-list", "Project portfolio"]],
  contact: [["contact-hero", "Page banner"], ["contact-details", "Contact and enquiry form"], ["contact-faq", "Frequently asked questions"]],
  testimonials: [["testimonials-hero", "Page banner"], ["testimonials-list", "Testimonial list"], ["testimonials-recognition", "Recognition"]],
  services: [["services-hero", "Page banner"]],
  privacy: [["privacy-hero", "Page banner"], ["privacy-content", "Privacy policy"]],
  projectDetails: [["project-detail-content", "Residence details"]],
};
const essentialSections = new Set(["home-hero", "projects-list", "contact-details"]);
const blankSection = (page, sortOrder) => ({
  id: `section_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`,
  page,
  placement: "bottom",
  type: "text",
  title: "New section",
  eyebrow: "",
  body: "",
  image: "",
  imageAlt: "",
  gallery: [],
  videoUrl: "",
  buttonLabel: "",
  buttonUrl: "",
  background: "cream",
  enabled: true,
  isPublished: false,
  sortOrder,
});

export default function AdminSections() {
  const { refreshContent } = useSiteContent();
  const [content, setContent] = useState(null);
  const [page, setPage] = useState("home");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState("");
  const [previewId, setPreviewId] = useState("");
  const [notice, setNotice] = useState("");

  async function load() {
    setLoading(true);
    try {
      const result = await fetchAdminContent();
      setContent({
        ...result.content,
        sections: result.content.sections || [],
        navigationItems: result.content.navigationItems?.length ? result.content.navigationItems : defaultNavLinks,
        footer: result.content.footer || {},
      });
    } catch (error) {
      setNotice(error.message || "Unable to load sections.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const sections = useMemo(
    () => (content?.sections || []).filter((item) => item.page === page).sort((a, b) => a.sortOrder - b.sortOrder),
    [content, page]
  );

  function updateSection(id, patch) {
    setContent((current) => ({
      ...current,
      sections: current.sections.map((item) => item.id === id ? { ...item, ...patch } : item),
    }));
  }

  function addSection() {
    setContent((current) => ({
      ...current,
      sections: [...(current.sections || []), blankSection(page, sections.length)],
    }));
  }

  function removeSection(id) {
    if (!window.confirm("Delete this section? This change takes effect when you save.")) return;
    setContent((current) => ({ ...current, sections: current.sections.filter((item) => item.id !== id) }));
  }

  function moveSection(index, direction) {
    const destination = index + direction;
    if (destination < 0 || destination >= sections.length) return;
    const reordered = [...sections];
    [reordered[index], reordered[destination]] = [reordered[destination], reordered[index]];
    const orderById = new Map(reordered.map((section, position) => [section.id, position]));
    setContent((current) => ({
      ...current,
      sections: current.sections.map((section) => orderById.has(section.id)
        ? { ...section, sortOrder: orderById.get(section.id) }
        : section),
    }));
  }

  async function uploadImage(sectionId, file) {
    if (!file) return;
    setUploading(sectionId);
    try {
      const result = await uploadAdminImage(file);
      updateSection(sectionId, { image: result.url });
      setNotice("Image uploaded. Save sections to publish the URL.");
    } catch (error) {
      setNotice(error.message || "Image upload failed.");
    } finally {
      setUploading("");
    }
  }

  async function save(publish = false) {
    setSaving(true);
    setNotice("");
    try {
      const nextContent = {
        ...content,
        sections: content.sections.map((section) => ({
          ...section,
          // When publishing: mark enabled sections as published, hidden sections as unpublished.
          // When saving draft: preserve the existing isPublished value (default to false for new sections).
          isPublished: publish ? section.enabled !== false : (section.isPublished ?? false),
        })),
      };
      await updateAdminContent(nextContent, { publish });
      setContent(nextContent);
      if (publish && !(await refreshContent({ refresh: true }))) {
        setNotice("Changes were published, but this preview could not refresh. Reload to verify.");
        return;
      }
      setNotice(publish ? "Changes published to the public website." : "Draft changes saved.");
    } catch (error) {
      setNotice(error.message || "Unable to save sections.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="p-16 text-center text-stone animate-pulse">Loading section editor…</div>;
  if (!content) return <div className="p-8 text-red-700">{notice || "Sections could not be loaded."}</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 border-b border-sand pb-6 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="font-display text-3xl text-ink">Page Sections</h2>
          <p className="mt-1 text-xs text-stone">Create reusable content sections, choose a page, preview, reorder, and publish without changing code.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => save(false)} disabled={saving} className="inline-flex items-center gap-2 border border-ink px-4 py-2.5 text-xs uppercase tracking-wider disabled:opacity-50">
            <Save className="size-4" /> Save drafts
          </button>
          <button onClick={() => save(true)} disabled={saving} className="inline-flex items-center gap-2 bg-ink px-4 py-2.5 text-xs uppercase tracking-wider text-cream disabled:opacity-50">
            <Eye className="size-4" /> {saving ? "Saving…" : "Save & publish"}
          </button>
        </div>
      </div>

      {notice && <p role="status" className="border border-sand bg-white px-4 py-3 text-sm text-stone">{notice}</p>}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Page sections">
          {pages.map((item) => (
            <button key={item} type="button" onClick={() => setPage(item)} aria-pressed={page === item}
              className={`border px-4 py-2 text-xs uppercase tracking-wider ${page === item ? "border-gold bg-gold text-ink" : "border-sand bg-white text-stone"}`}>
              {item}
            </button>
          ))}
        </div>
        <button onClick={addSection} className="inline-flex items-center gap-2 bg-gold px-4 py-2 text-xs uppercase tracking-wider text-ink">
          <Plus className="size-4" /> Add section
        </button>
      </div>

      <div className="border border-sand bg-white p-5">
        <h3 className="font-display text-xl">Public page visibility</h3>
        <p className="mt-1 text-xs text-stone">Core routes stay available, but a page’s public content and navigation entry can be hidden safely.</p>
        <div className="mt-4 flex flex-wrap gap-4">
          {pages.map((item) => (
            <label key={item} className="inline-flex items-center gap-2 text-xs capitalize text-stone">
              <input
                type="checkbox"
                disabled={["home", "projects", "contact"].includes(item)}
                checked={content.pageVisibility?.[item] !== false}
                onChange={(event) => setContent((current) => ({
                  ...current,
                  pageVisibility: { ...current.pageVisibility, [item]: event.target.checked },
                }))}
              />
              {item} visible
            </label>
          ))}
        </div>
      </div>

      <div className="border border-sand bg-white p-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display text-xl capitalize">Built-in {page} sections</h3>
            <p className="mt-1 text-xs text-stone">
              Hide optional built-in sections from the public page. Essential sections are always protected.
              Use the toggle below to show or hide each section — changes take effect when you{" "}
              <strong>Save &amp; Publish</strong>.
            </p>
          </div>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {managedSections[page].map(([id, label]) => {
            const isEssential = essentialSections.has(id);
            const isVisible = content.sectionVisibility?.[id] !== false;
            return (
              <div
                key={id}
                className={`flex items-center justify-between gap-3 border p-3 ${
                  isVisible ? "border-sand bg-cream/30" : "border-dashed border-sand bg-white opacity-60"
                }`}
              >
                <div className="min-w-0">
                  <p className={`text-sm font-medium truncate ${isVisible ? "text-ink" : "text-stone line-through"}`}>{label}</p>
                  <p className="text-[0.6rem] uppercase tracking-wider mt-0.5 text-stone">
                    {isEssential ? "Protected — always visible" : isVisible ? "Visible on page" : "Hidden from page"}
                  </p>
                </div>
                {isEssential ? (
                  <span className="shrink-0 border border-sand px-2 py-1 text-[0.6rem] uppercase tracking-wider text-stone">
                    Required
                  </span>
                ) : isVisible ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm(`Hide "${label}" from the public ${page} page? You can restore it at any time.`)) {
                        setContent((current) => ({
                          ...current,
                          sectionVisibility: { ...(current.sectionVisibility || {}), [id]: false },
                        }));
                      }
                    }}
                    className="shrink-0 inline-flex items-center gap-1.5 border border-stone/40 px-2.5 py-1.5 text-[0.6rem] uppercase tracking-wider text-stone hover:border-red-300 hover:text-red-700 hover:bg-red-50 transition"
                  >
                    <EyeOff className="size-3" /> Hide
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() =>
                      setContent((current) => ({
                        ...current,
                        sectionVisibility: { ...(current.sectionVisibility || {}), [id]: true },
                      }))
                    }
                    className="shrink-0 inline-flex items-center gap-1.5 border border-emerald-300 bg-emerald-50 px-2.5 py-1.5 text-[0.6rem] uppercase tracking-wider text-emerald-800 hover:bg-emerald-100 transition"
                  >
                    <Eye className="size-3" /> Restore
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {sections.length === 0 && <div className="border border-dashed border-sand bg-white p-10 text-center text-sm text-stone">No custom sections on this page. Essential page features remain protected.</div>}

      <div className="space-y-5">
        {sections.map((section, index) => (
          <article key={section.id} className="space-y-4 border border-sand bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-sand pb-3">
              <div className="flex items-center gap-2">
                <h3 className="font-display text-xl">{section.title || "Untitled section"}</h3>
                <span className={`px-2 py-1 text-[0.6rem] uppercase tracking-wider ${section.isPublished ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-800"}`}>
                  {section.isPublished ? "Published" : "Draft"}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button aria-label="Move section up" onClick={() => moveSection(index, -1)} disabled={index === 0} className="p-2 text-stone hover:text-ink disabled:opacity-30"><ArrowUp className="size-4" /></button>
                <button aria-label="Move section down" onClick={() => moveSection(index, 1)} disabled={index === sections.length - 1} className="p-2 text-stone hover:text-ink disabled:opacity-30"><ArrowDown className="size-4" /></button>
                <button
                  aria-label={section.enabled !== false ? "Hide section" : "Show section"}
                  title={section.enabled !== false ? "Hide this section from the public page" : "Show this section on the public page"}
                  onClick={() => updateSection(section.id, { enabled: section.enabled !== false ? false : true })}
                  className="p-2 text-stone hover:text-ink"
                >
                  {section.enabled !== false ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
                <button aria-label="Delete section" onClick={() => removeSection(section.id)} className="p-2 text-red-700 hover:bg-red-50"><Trash2 className="size-4" /></button>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
              <label className="text-[0.65rem] uppercase tracking-widest text-stone">Section type
                <select value={section.type} onChange={(event) => updateSection(section.id, { type: event.target.value })} className="mt-1 w-full border border-sand bg-white p-2.5 text-xs text-ink">
                  {types.map((type) => <option key={type} value={type}>{type}</option>)}
                </select>
              </label>
              <label className="text-[0.65rem] uppercase tracking-widest text-stone">Background
                <select value={section.background} onChange={(event) => updateSection(section.id, { background: event.target.value })} className="mt-1 w-full border border-sand bg-white p-2.5 text-xs text-ink">
                  {["cream", "sand", "ink"].map((color) => <option key={color} value={color}>{color}</option>)}
                </select>
              </label>
              <label className="text-[0.65rem] uppercase tracking-widest text-stone">Page
                <select value={section.page} onChange={(event) => updateSection(section.id, { page: event.target.value })} className="mt-1 w-full border border-sand bg-white p-2.5 text-xs text-ink">
                  {pages.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
              </label>
              <label className="text-[0.65rem] uppercase tracking-widest text-stone">Placement
                <select value={section.placement || "bottom"} onChange={(event) => updateSection(section.id, { placement: event.target.value })} className="mt-1 w-full border border-sand bg-white p-2.5 text-xs text-ink">
                  <option value="top">Before built-in content</option>
                  <option value="bottom">After built-in content</option>
                </select>
              </label>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="text-[0.65rem] uppercase tracking-widest text-stone">Heading
                <input maxLength={200} value={section.title || ""} onChange={(event) => updateSection(section.id, { title: event.target.value })} className="mt-1 w-full border border-sand p-2.5 text-sm text-ink" />
              </label>
              <label className="text-[0.65rem] uppercase tracking-widest text-stone">Eyebrow
                <input maxLength={120} value={section.eyebrow || ""} onChange={(event) => updateSection(section.id, { eyebrow: event.target.value })} className="mt-1 w-full border border-sand p-2.5 text-sm text-ink" />
              </label>
            </div>
            <label className="block text-[0.65rem] uppercase tracking-widest text-stone">Description
              <textarea maxLength={10000} rows={4} value={section.body || ""} onChange={(event) => updateSection(section.id, { body: event.target.value })} className="mt-1 w-full border border-sand p-2.5 text-sm text-ink" />
            </label>

            {(section.type === "image" || section.type === "gallery" || section.type === "video") && (
              <div className="grid gap-4 md:grid-cols-2">
                {section.type === "image" ? (
                  <div className="space-y-2">
                    <label className="block text-[0.65rem] uppercase tracking-widest text-stone">Image URL</label>
                    <input maxLength={2048} value={section.image || ""} onChange={(event) => updateSection(section.id, { image: event.target.value })} className="w-full border border-sand p-2.5 text-sm text-ink" />
                    <label className="inline-flex cursor-pointer items-center gap-2 border border-ink px-3 py-2 text-xs uppercase">
                      <ImagePlus className="size-4" /> {uploading === section.id ? "Uploading…" : "Upload image"}
                      <input type="file" accept="image/jpeg,image/png,image/webp,image/avif" className="hidden" onChange={(event) => uploadImage(section.id, event.target.files?.[0])} />
                    </label>
                    <label className="block text-[0.65rem] uppercase tracking-widest text-stone">Image description
                      <input maxLength={250} value={section.imageAlt || ""} onChange={(event) => updateSection(section.id, { imageAlt: event.target.value })} className="mt-1 w-full border border-sand p-2.5 text-sm text-ink" />
                    </label>
                  </div>
                ) : section.type === "gallery" ? (
                  <label className="text-[0.65rem] uppercase tracking-widest text-stone">Gallery image URLs (one per line)
                    <textarea rows={5} maxLength={10000} value={(section.gallery || []).join("\n")} onChange={(event) => updateSection(section.id, {
                      gallery: event.target.value.split(/\r?\n/).map((url) => url.trim()).filter(Boolean),
                    })} className="mt-1 w-full border border-sand p-2.5 text-sm text-ink" />
                  </label>
                ) : (
                  <label className="text-[0.65rem] uppercase tracking-widest text-stone">Video URL (MP4, WebM, or compatible hosted video)
                    <input maxLength={2048} value={section.videoUrl || ""} onChange={(event) => updateSection(section.id, { videoUrl: event.target.value })} className="mt-1 w-full border border-sand p-2.5 text-sm text-ink" />
                  </label>
                )}
                {section.image && section.type === "image" && <img src={getMediaUrl(section.image)} alt={section.imageAlt || ""} className="max-h-56 w-full object-cover" />}
              </div>
            )}

            {section.type === "cta" && (
              <div className="grid gap-4 md:grid-cols-2">
                <label className="text-[0.65rem] uppercase tracking-widest text-stone">Button label
                  <input maxLength={80} value={section.buttonLabel || ""} onChange={(event) => updateSection(section.id, { buttonLabel: event.target.value })} className="mt-1 w-full border border-sand p-2.5 text-sm text-ink" />
                </label>
                <label className="text-[0.65rem] uppercase tracking-widest text-stone">Button link
                  <input maxLength={2048} value={section.buttonUrl || ""} onChange={(event) => updateSection(section.id, { buttonUrl: event.target.value })} className="mt-1 w-full border border-sand p-2.5 text-sm text-ink" placeholder="/contact or https://…" />
                </label>
              </div>
            )}

            <button onClick={() => setPreviewId(previewId === section.id ? "" : section.id)} type="button" className="border border-sand px-3 py-2 text-xs uppercase tracking-wider text-stone hover:border-gold hover:text-ink">
              {previewId === section.id ? "Close preview" : "Preview section"}
            </button>
            {previewId === section.id && <PageSectionPreview section={section} />}
          </article>
        ))}
      </div>
    </div>
  );
}
