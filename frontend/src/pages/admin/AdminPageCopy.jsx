import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp, ImagePlus, Plus, Save, Trash2 } from "lucide-react";
import { pageContentDefaults, navLinks as defaultNavLinks } from "@data";
import { useSiteContent } from "../../context/ContentContext";
import { fetchAdminContent, updateAdminContent, uploadAdminImage, getMediaUrl } from "../../lib/api";

const collections = [
  { key: "standards", title: "About page standards", fields: [["icon", "Icon key"], ["title", "Heading"], ["text", "Description"]] },
  { key: "milestones", title: "About page milestones", fields: [["year", "Period"], ["title", "Heading"], ["desc", "Description"]] },
  { key: "faqs", title: "Contact page FAQs", fields: [["q", "Question"], ["a", "Answer"]] },
  { key: "pressMentions", title: "Testimonials page recognition", fields: [["publication", "Publication"], ["quote", "Description"]] },
];

const pageCopySections = [
  { page: "home", key: "projects", title: "Homepage featured residences", fields: [["eyebrow", "Eyebrow"], ["title", "Heading"], ["copy", "Description", "textarea"], ["buttonLabel", "Button label"], ["buttonUrl", "Button link"]] },
  { page: "home", key: "testimonials", title: "Homepage testimonials", fields: [["eyebrow", "Eyebrow"], ["title", "Heading"], ["copy", "Description", "textarea"], ["image", "Background image", "image"]] },
  { page: "home", key: "contact", title: "Homepage contact call-to-action", fields: [["eyebrow", "Eyebrow"], ["title", "Heading"], ["buttonLabel", "Button label"], ["buttonUrl", "Button link"]] },
  { page: "about", key: "story", title: "About story section", fields: [["eyebrow", "Eyebrow"], ["title", "Heading"], ["quote", "Quote", "textarea"], ["image", "Image", "image"], ["imageAlt", "Image description"]] },
  { page: "about", key: "missionVision", title: "Mission and vision labels", fields: [["missionLabel", "Mission heading"], ["visionLabel", "Vision heading"]] },
  { page: "about", key: "standards", title: "Construction standards section", fields: [["eyebrow", "Eyebrow"], ["title", "Heading"], ["copy", "Description", "textarea"]] },
  { page: "about", key: "values", title: "Core values section", fields: [["eyebrow", "Eyebrow"], ["title", "Heading"]] },
  { page: "about", key: "milestones", title: "Milestones section", fields: [["eyebrow", "Eyebrow"], ["title", "Heading"], ["buttonLabel", "Button label"], ["buttonUrl", "Button link"]] },
  { page: "projects", key: "portfolio", title: "Projects portfolio section", fields: [["eyebrow", "Eyebrow"], ["title", "Heading"], ["statusLabel", "Status filter label"], ["typeLabel", "Typology filter label"], ["searchPlaceholder", "Search placeholder"], ["statusAllLabel", "All status label"], ["statusOngoingLabel", "Ongoing status label"], ["statusCompletedLabel", "Completed status label"], ["statusUpcomingLabel", "Upcoming status label"], ["typeAllLabel", "All typologies label"], ["typeResidentialLabel", "Residential type label"], ["typeVillasLabel", "Villas type label"], ["typeMixedUseLabel", "Mixed-use type label"], ["emptyTitle", "Empty results heading"], ["emptyCopy", "Empty results description", "textarea"], ["resetLabel", "Reset button label"]] },
  { page: "contact", key: "details", title: "Contact details section", fields: [["eyebrow", "Office eyebrow"], ["title", "Office heading"], ["inquiryEyebrow", "Enquiry eyebrow"], ["inquiryTitle", "Enquiry heading"], ["inquiryCopy", "Enquiry description", "textarea"], ["whatsappTitle", "WhatsApp heading"], ["whatsappCopy", "WhatsApp description", "textarea"], ["whatsappButtonLabel", "WhatsApp button"], ["submitLabel", "Enquiry submit button"]] },
  { page: "contact", key: "faq", title: "Contact FAQ section", fields: [["eyebrow", "Eyebrow"], ["title", "Heading"]] },
  { page: "testimonials", key: "recognition", title: "Testimonials recognition section", fields: [["eyebrow", "Eyebrow"], ["title", "Heading"], ["bottomCopy", "Description", "textarea"], ["buttonLabel", "Button label"], ["buttonUrl", "Button link"]] },
  { page: "projectDetails", key: "overview", title: "Residence overview details", fields: [["title", "Heading"], ["priceLabel", "Price label"], ["specsTitle", "Specifications heading"], ["specsCopy", "Specifications description", "textarea"], ["mapLabel", "Location card label"]] },
  { page: "projectDetails", key: "videos", title: "Residence video section", fields: [["title", "Heading"]] },
  { page: "projectDetails", key: "amenities", title: "Residence amenities section", fields: [["eyebrow", "Eyebrow"], ["title", "Heading"], ["itemLabel", "Amenity label"]] },
  { page: "projectDetails", key: "location", title: "Residence location section", fields: [["eyebrow", "Eyebrow"], ["title", "Heading"], ["callout", "Description", "textarea"]] },
  { page: "projectDetails", key: "enquiry", title: "Residence enquiry section", fields: [["eyebrow", "Eyebrow"], ["title", "Heading"], ["copy", "Description", "textarea"], ["buttonLabel", "Viewing button"], ["brochureLabel", "Brochure button"], ["brochureRequestLabel", "Brochure request button"], ["brochureReadyLabel", "Brochure ready label"], ["brochureNotice", "Brochure notice", "textarea"], ["backLabel", "Back button"], ["expandLabel", "Gallery expand label"], ["submitLabel", "Enquiry submit button"]] },
  { page: "privacy", key: "body", title: "Privacy policy paragraphs", fields: [["paragraph1", "Paragraph one", "textarea"], ["paragraph2", "Paragraph two", "textarea"], ["paragraph3", "Paragraph three", "textarea"]] },
];

function mergeDefaults(defaults, stored) {
  if (!defaults || typeof defaults !== "object" || Array.isArray(defaults)) return stored ?? defaults;
  if (!stored || typeof stored !== "object" || Array.isArray(stored)) return defaults;
  return Object.fromEntries(Object.keys({ ...defaults, ...stored }).map((key) => [
    key,
    key in defaults ? mergeDefaults(defaults[key], stored[key]) : stored[key],
  ]));
}

function blankEntry(collection) {
  return Object.fromEntries(collection.fields.map(([key]) => [key, ""]));
}

export default function AdminPageCopy() {
  const { refreshContent } = useSiteContent();
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let active = true;
    fetchAdminContent()
      .then(({ content: stored }) => {
        if (!active) return;
        setContent({
          ...stored,
          ...Object.fromEntries(Object.entries(pageContentDefaults)
            .filter(([key]) => stored[key] === undefined)),
          homeIntro: { ...pageContentDefaults.homeIntro, ...stored.homeIntro },
          pageCopy: mergeDefaults(pageContentDefaults.pageCopy, stored.pageCopy),
          navigationItems: stored.navigationItems?.length ? stored.navigationItems : defaultNavLinks,
          sections: stored.sections || [],
          footer: stored.footer || {},
        });
      })
      .catch((error) => {
        console.error("Page content could not be loaded:", error);
        if (active) setNotice(error.message || "Page content could not be loaded.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  function updateCollection(collectionKey, update) {
    setContent((current) => ({
      ...current,
      [collectionKey]: update(current[collectionKey] || []),
    }));
  }

  async function save(publish) {
    setSaving(true);
    setNotice("");
    try {
      await updateAdminContent(content, { publish });
      if (publish && !(await refreshContent({ refresh: true }))) {
        setNotice("Page copy was published, but this preview could not refresh. Reload to verify.");
        return;
      }
      setNotice(publish ? "Page copy published to the public website." : "Page copy saved privately as a draft.");
    } catch (error) {
      setNotice(error.message || "Page copy could not be saved.");
    } finally {
      setSaving(false);
    }
  }

  async function uploadIntroImage(file) {
    if (!file) return;
    setUploading(true);
    try {
      const result = await uploadAdminImage(file);
      setContent((current) => ({ ...current, homeIntro: { ...current.homeIntro, image: result.url } }));
      setNotice("Image uploaded. Save or publish to update the homepage.");
    } catch (error) {
      setNotice(error.message || "Image upload failed.");
    } finally {
      setUploading(false);
    }
  }

  function updatePageCopy(page, section, field, value) {
    setContent((current) => ({
      ...current,
      pageCopy: {
        ...current.pageCopy,
        [page]: {
          ...current.pageCopy?.[page],
          [section]: {
            ...current.pageCopy?.[page]?.[section],
            [field]: value,
          },
        },
      },
    }));
  }

  async function uploadPageCopyImage(page, section, field, file) {
    if (!file) return;
    setUploading(true);
    try {
      const result = await uploadAdminImage(file);
      updatePageCopy(page, section, field, result.url);
      setNotice("Image uploaded. Save or publish to update the website.");
    } catch (error) {
      setNotice(error.message || "Image upload failed.");
    } finally {
      setUploading(false);
    }
  }

  if (loading) return <div className="p-16 text-center text-stone animate-pulse">Loading page copy…</div>;
  if (!content) return <div className="border border-red-200 bg-white p-8 text-sm text-red-800">{notice || "Page copy could not be loaded."}</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 border-b border-sand pb-6 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="font-display text-3xl">Page Copy & Content Lists</h2>
          <p className="mt-1 text-xs text-stone">Edit homepage introduction, FAQs, milestones, standards, and press mentions.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => save(false)} disabled={saving} className="inline-flex items-center gap-2 border border-ink px-4 py-2.5 text-xs uppercase tracking-wider disabled:opacity-50"><Save className="size-4" /> Save drafts</button>
          <button onClick={() => save(true)} disabled={saving} className="inline-flex items-center gap-2 bg-ink px-4 py-2.5 text-xs uppercase tracking-wider text-cream disabled:opacity-50"><Save className="size-4" /> {saving ? "Saving…" : "Publish changes"}</button>
        </div>
      </div>
      {notice && <p role="status" className="border border-sand bg-white px-4 py-3 text-sm text-stone">{notice}</p>}

      <section className="space-y-4 border border-sand bg-white p-5">
        <h3 className="font-display text-2xl">Homepage introduction</h3>
        <div className="grid gap-4 md:grid-cols-2">
          {[
            ["eyebrow", "Eyebrow"],
            ["title", "Heading"],
            ["copy", "Description"],
            ["buttonLabel", "Button label"],
            ["buttonUrl", "Button destination (internal path)"],
            ["imageAlt", "Image description"],
          ].map(([key, label]) => (
            <label key={key} className="text-[0.65rem] uppercase tracking-widest text-stone">
              {label}
              {key === "copy" ? (
                <textarea rows={3} maxLength={2000} value={content.homeIntro?.[key] || ""} onChange={(event) => setContent((current) => ({
                  ...current, homeIntro: { ...current.homeIntro, [key]: event.target.value },
                }))} className="mt-1 w-full border border-sand p-2.5 text-sm text-ink" />
              ) : (
                <input maxLength={2048} value={content.homeIntro?.[key] || ""} onChange={(event) => setContent((current) => ({
                  ...current, homeIntro: { ...current.homeIntro, [key]: event.target.value },
                }))} className="mt-1 w-full border border-sand p-2.5 text-sm text-ink" />
              )}
            </label>
          ))}
        </div>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <img src={getMediaUrl(content.homeIntro?.image || "/images/lobby-interior.jpg")} alt={content.homeIntro?.imageAlt || ""} className="h-24 w-40 object-cover" />
          <div className="flex-1 space-y-2">
            <label className="block text-[0.65rem] uppercase tracking-widest text-stone">Image URL
              <input maxLength={2048} value={content.homeIntro?.image || ""} onChange={(event) => setContent((current) => ({
                ...current, homeIntro: { ...current.homeIntro, image: event.target.value },
              }))} className="mt-1 w-full border border-sand p-2.5 text-sm text-ink" />
            </label>
            <label className="inline-flex cursor-pointer items-center gap-2 border border-ink px-3 py-2 text-xs uppercase">
              <ImagePlus className="size-4" /> {uploading ? "Uploading…" : "Upload image"}
              <input type="file" accept="image/jpeg,image/png,image/webp,image/avif" className="hidden" onChange={(event) => uploadIntroImage(event.target.files?.[0])} />
            </label>
          </div>
        </div>
      </section>

      {pageCopySections.map((section) => (
        <section key={`${section.page}-${section.key}`} className="space-y-4 border border-sand bg-white p-5">
          <div>
            <p className="text-[0.6rem] uppercase tracking-widest text-gold-deep">{section.page}</p>
            <h3 className="font-display text-2xl">{section.title}</h3>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {section.fields.map(([key, label, kind]) => {
              const value = content.pageCopy?.[section.page]?.[section.key]?.[key] || "";
              if (kind === "image") {
                return (
                  <div key={key} className="space-y-2">
                    <label className="block text-[0.65rem] uppercase tracking-widest text-stone">{label}
                      <input maxLength={2048} value={value} onChange={(event) => updatePageCopy(section.page, section.key, key, event.target.value)} className="mt-1 w-full border border-sand p-2.5 text-sm text-ink" />
                    </label>
                    {value && <img src={getMediaUrl(value)} alt="" className="h-24 w-full object-cover" />}
                    <label className="inline-flex cursor-pointer items-center gap-2 border border-ink px-3 py-2 text-xs uppercase">
                      <ImagePlus className="size-4" /> {uploading ? "Uploading..." : "Upload image"}
                      <input type="file" accept="image/jpeg,image/png,image/webp,image/avif" className="hidden" onChange={(event) => uploadPageCopyImage(section.page, section.key, key, event.target.files?.[0])} />
                    </label>
                  </div>
                );
              }
              return (
                <label key={key} className="text-[0.65rem] uppercase tracking-widest text-stone">
                  {label}
                  {kind === "textarea" ? (
                    <textarea rows={3} maxLength={10000} value={value} onChange={(event) => updatePageCopy(section.page, section.key, key, event.target.value)} className="mt-1 w-full border border-sand p-2.5 text-sm text-ink" />
                  ) : (
                    <input maxLength={2048} value={value} onChange={(event) => updatePageCopy(section.page, section.key, key, event.target.value)} className="mt-1 w-full border border-sand p-2.5 text-sm text-ink" />
                  )}
                </label>
              );
            })}
          </div>
        </section>
      ))}

      {collections.map((collection) => (
        <section key={collection.key} className="space-y-4 border border-sand bg-white p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-display text-2xl">{collection.title}</h3>
              <p className="text-xs text-stone">Entries are published in their current order.</p>
            </div>
            <button type="button" onClick={() => updateCollection(collection.key, (items) => [...items, blankEntry(collection)])} className="inline-flex items-center gap-1 text-xs uppercase tracking-wider text-gold-deep"><Plus className="size-4" /> Add entry</button>
          </div>
          {(content[collection.key] || []).length === 0 && <p className="border border-dashed border-sand p-5 text-center text-xs text-stone">No entries. Add one to display this content.</p>}
          {(content[collection.key] || []).map((item, index) => (
            <div key={`${collection.key}-${index}`} className="grid gap-3 border border-sand p-4 md:grid-cols-[1fr_auto]">
              <div className="space-y-3">
                {collection.fields.map(([key, label]) => (
                  <label key={key} className="block text-[0.6rem] uppercase tracking-widest text-stone">
                    {label}
                    {["text", "desc", "a", "quote"].includes(key) ? (
                      <textarea rows={3} maxLength={2000} value={item[key] || ""} onChange={(event) => updateCollection(collection.key, (items) => items.map((entry, i) => i === index ? { ...entry, [key]: event.target.value } : entry))} className="mt-1 w-full border border-sand p-2 text-xs text-ink" />
                    ) : (
                      <input maxLength={2000} value={item[key] || ""} onChange={(event) => updateCollection(collection.key, (items) => items.map((entry, i) => i === index ? { ...entry, [key]: event.target.value } : entry))} className="mt-1 w-full border border-sand p-2 text-xs text-ink" />
                    )}
                  </label>
                ))}
              </div>
              <div className="flex items-start gap-1">
                <button type="button" aria-label="Move entry up" disabled={index === 0} onClick={() => updateCollection(collection.key, (items) => {
                  const next = [...items];
                  [next[index - 1], next[index]] = [next[index], next[index - 1]];
                  return next;
                })} className="p-2 text-stone disabled:opacity-30"><ArrowUp className="size-4" /></button>
                <button type="button" aria-label="Move entry down" disabled={index === content[collection.key].length - 1} onClick={() => updateCollection(collection.key, (items) => {
                  const next = [...items];
                  [next[index + 1], next[index]] = [next[index], next[index + 1]];
                  return next;
                })} className="p-2 text-stone disabled:opacity-30"><ArrowDown className="size-4" /></button>
                <button type="button" aria-label="Delete entry" onClick={() => updateCollection(collection.key, (items) => items.filter((_, i) => i !== index))} className="p-2 text-red-700"><Trash2 className="size-4" /></button>
              </div>
            </div>
          ))}
        </section>
      ))}
    </div>
  );
}
