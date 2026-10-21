import { useEffect, useState } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
  Upload,
  X,
  Search,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import {
  fetchAdminProjects,
  createAdminProject,
  updateAdminProject,
  deleteAdminProject,
  toggleAdminProjectPublish,
  reorderAdminProjects,
  uploadAdminImage,
  getMediaUrl,
} from "../../lib/api";

const projectPayloadKeys = [
  "name", "slug", "status", "type", "location", "price", "headline", "summary",
  "overview", "specs", "amenities", "locationNotes", "cover", "gallery", "videos",
  "brochure", "featured", "isPublished", "sortOrder",
];

function buildProjectPayload(formData) {
  return Object.fromEntries(
    projectPayloadKeys.map((key) => [key, formData[key]]).filter(([, value]) => value !== undefined)
  );
}

const initialProjectForm = {
  name: "",
  slug: "",
  status: "ongoing",
  type: "Residential",
  location: "",
  price: "",
  headline: "",
  summary: "",
  overview: "",
  locationNotes: "",
  cover: "/images/hero-tower.jpg",
  gallery: ["/images/hero-tower.jpg"],
  videos: [],
  brochure: "",
  specs: [
    { label: "Typology", value: "3 & 4 BHK Luxury Residences" },
    { label: "Storeys", value: "36 Floors" },
    { label: "Possession", value: "Q2 2027" },
    { label: "RERA Reg.", value: "P02400003891" },
  ],
  amenities: [
    "Double-height arrival lobby",
    "Pergola podium gardens",
    "Temperature-controlled lap pool",
  ],
  featured: false,
  isPublished: true,
};

export default function AdminProjects() {
  const [projects, setProjects] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSlug, setEditingSlug] = useState(null);
  const [formData, setFormData] = useState(initialProjectForm);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState(null);

  function showToast(message, type = "success") {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  }

  async function loadProjects() {
    setLoading(true);
    try {
      const res = await fetchAdminProjects();
      setProjects(res.projects || []);
    } catch (err) {
      showToast(err.message || "Failed to load projects.", "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProjects();
  }, []);

  function handleOpenCreate() {
    setEditingSlug(null);
    setFormData(initialProjectForm);
    setModalOpen(true);
  }

  function handleOpenEdit(project) {
    setEditingSlug(project.slug);
    setFormData({
      ...project,
      specs: project.specs?.length ? project.specs : [{ label: "Typology", value: "" }],
      amenities: project.amenities?.length ? project.amenities : [""],
      gallery: project.gallery?.length ? project.gallery : [project.cover || "/images/hero-tower.jpg"],
    });
    setModalOpen(true);
  }

  async function handleTogglePublish(slug) {
    try {
      const res = await toggleAdminProjectPublish(slug);
      setProjects((prev) =>
        prev.map((p) => (p.slug === slug ? { ...p, isPublished: res.isPublished } : p))
      );
      showToast(res.message);
    } catch (err) {
      showToast(err.message || "Failed to change status.", "error");
    }
  }

  async function handleDelete(slug, name) {
    if (!window.confirm(`Are you sure you want to delete "${name}"? This cannot be undone.`)) {
      return;
    }
    try {
      await deleteAdminProject(slug);
      setProjects((prev) => prev.filter((p) => p.slug !== slug));
      showToast(`Project "${name}" has been deleted.`);
    } catch (err) {
      showToast(err.message || "Failed to delete project.", "error");
    }
  }

  async function handleMove(index, direction) {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= projects.length) return;

    const reordered = [...projects];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);

    setProjects(reordered);

    try {
      const slugs = reordered.map((p) => p.slug);
      await reorderAdminProjects(slugs);
      showToast("Order updated successfully.");
    } catch (err) {
      showToast(err.message || "Failed to save reorder.", "error");
      loadProjects();
    }
  }

  async function handleImageUpload(e, targetField) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const res = await uploadAdminImage(file);
      if (targetField === "cover") {
        setFormData((prev) => ({ ...prev, cover: res.url }));
      } else if (targetField === "gallery") {
        setFormData((prev) => ({ ...prev, gallery: [...prev.gallery, res.url] }));
      }
      showToast(`Image uploaded (${res.storage === "cloudinary" ? "Cloudinary" : "Local"}).`);
    } catch (err) {
      showToast(err.message || "Upload failed.", "error");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!formData.name.trim() || !formData.location.trim() || !formData.cover.trim()) {
      showToast("Please provide project name, location, and cover image.", "error");
      return;
    }

    try {
      const cleanedSpecs = (formData.specs || []).filter((s) => s.label.trim() && s.value.trim());
      const cleanedAmenities = (formData.amenities || []).filter((a) => a.trim());
      const payload = buildProjectPayload({
        ...formData,
        specs: cleanedSpecs,
        amenities: cleanedAmenities,
      });

      if (editingSlug) {
        await updateAdminProject(editingSlug, payload);
        showToast("Project updated successfully.");
      } else {
        await createAdminProject(payload);
        showToast("Project created successfully.");
      }
      setModalOpen(false);
      loadProjects();
    } catch (err) {
      showToast(err.message || "Failed to save project.", "error");
    }
  }

  const filtered = projects.filter((p) => {
    const q = search.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.location.toLowerCase().includes(q) ||
      p.type.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 text-xs uppercase tracking-wider shadow-2xl transition-all ${
            toast.type === "error"
              ? "bg-red-900 text-cream border border-red-500"
              : "bg-ink text-gold border border-gold"
          }`}
        >
          {toast.type === "error" ? <AlertCircle className="size-4" /> : <CheckCircle className="size-4" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-sand pb-6">
        <div>
          <h2 className="font-display text-3xl text-ink">Residences & Projects</h2>
          <p className="mt-1 text-xs text-stone">
            Manage your project portfolio, specifications, galleries, and visibility.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-stone" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search projects..."
              className="border border-sand bg-white py-2 pl-9 pr-4 text-xs tracking-wider text-ink focus:border-gold focus:outline-none"
            />
          </div>
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-2 bg-ink px-5 py-2.5 text-[0.68rem] uppercase tracking-[0.24em] text-cream hover:bg-gold hover:text-ink transition"
          >
            <Plus className="size-4" /> Add Residence
          </button>
        </div>
      </div>

      {/* Projects Table / List */}
      {loading ? (
        <div className="p-16 text-center text-stone animate-pulse">Loading residences...</div>
      ) : filtered.length === 0 ? (
        <div className="border border-dashed border-sand p-12 text-center text-stone">
          No projects match your search query.
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((project, index) => (
            <div
              key={project.slug}
              className={`flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border p-4 transition bg-white shadow-sm ${
                project.isPublished ? "border-sand/70" : "border-amber-300/80 bg-amber-50/20"
              }`}
            >
              {/* Left Details */}
              <div className="flex items-center gap-4">
                {/* Reorder Buttons */}
                <div className="flex flex-col gap-1 text-stone">
                  <button
                    onClick={() => handleMove(index, -1)}
                    disabled={index === 0}
                    className="p-1 hover:text-gold disabled:opacity-20"
                    title="Move up"
                  >
                    <ArrowUp className="size-3.5" />
                  </button>
                  <button
                    onClick={() => handleMove(index, 1)}
                    disabled={index === filtered.length - 1}
                    className="p-1 hover:text-gold disabled:opacity-20"
                    title="Move down"
                  >
                    <ArrowDown className="size-3.5" />
                  </button>
                </div>

                {/* Cover Image */}
                <img
                  src={getMediaUrl(project.cover)}
                  alt=""
                  className="h-16 w-24 object-cover border border-sand shrink-0 bg-ink"
                />

                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-display text-xl text-ink font-medium">{project.name}</h3>
                    {project.featured && (
                      <span className="bg-gold/20 text-gold-deep border border-gold/40 px-2 py-0.5 text-[0.55rem] uppercase tracking-widest font-semibold">
                        Featured
                      </span>
                    )}
                    <span
                      className={`px-2 py-0.5 text-[0.55rem] uppercase tracking-widest border ${
                        project.isPublished
                          ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                          : "border-amber-300 bg-amber-50 text-amber-800"
                      }`}
                    >
                      {project.isPublished ? "Published" : "Hidden (Draft)"}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-stone">
                    {project.type} · {project.location} · {project.specs?.[0]?.value || project.status}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 self-end md:self-auto">
                <button
                  onClick={() => handleTogglePublish(project.slug)}
                  className={`inline-flex items-center gap-1.5 border px-3 py-1.5 text-[0.62rem] uppercase tracking-wider transition ${
                    project.isPublished
                      ? "border-stone/40 text-stone hover:border-ink hover:text-ink"
                      : "border-emerald-600 bg-emerald-600 text-white"
                  }`}
                  title={project.isPublished ? "Hide from public website" : "Publish to website"}
                >
                  {project.isPublished ? (
                    <>
                      <EyeOff className="size-3.5" /> Hide
                    </>
                  ) : (
                    <>
                      <Eye className="size-3.5" /> Publish
                    </>
                  )}
                </button>

                <button
                  onClick={() => handleOpenEdit(project)}
                  className="inline-flex items-center gap-1.5 border border-sand px-3 py-1.5 text-[0.62rem] uppercase tracking-wider text-ink hover:border-gold hover:text-gold-deep transition"
                >
                  <Edit className="size-3.5" /> Edit
                </button>

                <button
                  onClick={() => handleDelete(project.slug, project.name)}
                  className="inline-flex items-center gap-1.5 border border-red-200 px-3 py-1.5 text-[0.62rem] uppercase tracking-wider text-red-700 hover:bg-red-50 transition"
                >
                  <Trash2 className="size-3.5" /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Project Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-4xl max-h-[92vh] flex flex-col bg-cream text-ink border border-gold/40 shadow-2xl my-8">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-sand px-6 py-4 bg-ink text-cream">
              <div>
                <p className="text-[0.62rem] uppercase tracking-[0.28em] text-gold">CMS Editor</p>
                <h3 className="font-display text-2xl">
                  {editingSlug ? `Edit Residence: ${formData.name}` : "Create New Residence"}
                </h3>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="text-stone hover:text-cream transition"
              >
                <X className="size-6" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-6">
              {/* Row 1: Name, Slug, Status, Type */}
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-[0.65rem] uppercase tracking-widest text-stone mb-1">
                    Project Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full border border-sand bg-white p-2.5 text-xs text-ink focus:border-gold focus:outline-none"
                    placeholder="e.g. Aurelia Residences"
                  />
                </div>
                <div>
                  <label className="block text-[0.65rem] uppercase tracking-widest text-stone mb-1">
                    URL Slug
                  </label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="w-full border border-sand bg-white p-2.5 text-xs text-ink focus:border-gold focus:outline-none"
                    placeholder="auto-generated-from-name"
                  />
                </div>
              </div>

              {/* Row 2: Location, Status, Typology */}
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <label className="block text-[0.65rem] uppercase tracking-widest text-stone mb-1">
                    Location *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full border border-sand bg-white p-2.5 text-xs text-ink focus:border-gold focus:outline-none"
                    placeholder="e.g. Jubilee Hills, Hyderabad"
                  />
                </div>
                <div>
                  <label className="block text-[0.65rem] uppercase tracking-widest text-stone mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full border border-sand bg-white p-2.5 text-xs text-ink focus:border-gold focus:outline-none"
                  >
                    <option value="ongoing">Ongoing</option>
                    <option value="completed">Completed</option>
                    <option value="upcoming">Upcoming</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[0.65rem] uppercase tracking-widest text-stone mb-1">
                    Typology
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full border border-sand bg-white p-2.5 text-xs text-ink focus:border-gold focus:outline-none"
                  >
                    <option value="Residential">Residential</option>
                    <option value="Villas">Villas</option>
                    <option value="Mixed-use">Mixed-use</option>
                  </select>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="block text-[0.65rem] uppercase tracking-widest text-stone">
                  Price / Price guidance
                  <input type="text" maxLength={120} value={formData.price || ""} onChange={(e) => setFormData({ ...formData, price: e.target.value })} className="mt-1 w-full border border-sand bg-white p-2.5 text-xs text-ink" placeholder="Contact for pricing, or starting price" />
                </label>
                <label className="block text-[0.65rem] uppercase tracking-widest text-stone">
                  Brochure URL
                  <input type="text" maxLength={2048} value={formData.brochure || ""} onChange={(e) => setFormData({ ...formData, brochure: e.target.value })} className="mt-1 w-full border border-sand bg-white p-2.5 text-xs text-ink" placeholder="https://… or /uploads/brochure.pdf" />
                </label>
              </div>
              <label className="block text-[0.65rem] uppercase tracking-widest text-stone">
                Project video URLs (one URL per line)
                <textarea rows={3} maxLength={10000} value={(formData.videos || []).join("\n")} onChange={(e) => setFormData({
                  ...formData,
                  videos: e.target.value.split(/\r?\n/).map((url) => url.trim()).filter(Boolean),
                })} className="mt-1 w-full border border-sand bg-white p-2.5 text-xs text-ink" placeholder="https://…/project-tour.mp4" />
              </label>

              {/* Headline & Summary */}
              <div>
                <label className="block text-[0.65rem] uppercase tracking-widest text-stone mb-1">
                  Headline
                </label>
                <input
                  type="text"
                  value={formData.headline}
                  onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                  className="w-full border border-sand bg-white p-2.5 text-xs text-ink focus:border-gold focus:outline-none"
                  placeholder="e.g. A calm tower of stone, bronze, and sky."
                />
              </div>

              <div>
                <label className="block text-[0.65rem] uppercase tracking-widest text-stone mb-1">
                  Summary (Card Copy)
                </label>
                <textarea
                  rows={2}
                  value={formData.summary}
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                  className="w-full border border-sand bg-white p-2.5 text-xs text-ink focus:border-gold focus:outline-none"
                  placeholder="Short description shown on project cards"
                />
              </div>

              {/* Overview & Location Notes */}
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-[0.65rem] uppercase tracking-widest text-stone mb-1">
                    Architectural Overview
                  </label>
                  <textarea
                    rows={3}
                    value={formData.overview}
                    onChange={(e) => setFormData({ ...formData, overview: e.target.value })}
                    className="w-full border border-sand bg-white p-2.5 text-xs text-ink focus:border-gold focus:outline-none"
                    placeholder="Full architectural design write-up"
                  />
                </div>
                <div>
                  <label className="block text-[0.65rem] uppercase tracking-widest text-stone mb-1">
                    Neighbourhood & Location Notes
                  </label>
                  <textarea
                    rows={3}
                    value={formData.locationNotes}
                    onChange={(e) => setFormData({ ...formData, locationNotes: e.target.value })}
                    className="w-full border border-sand bg-white p-2.5 text-xs text-ink focus:border-gold focus:outline-none"
                    placeholder="Transit, proximity, surroundings description"
                  />
                </div>
              </div>

              {/* Cover Image Upload */}
              <div className="border border-sand bg-white p-4">
                <label className="block text-[0.65rem] uppercase tracking-widest text-stone mb-2">
                  Cover Image (Hero Banner & Card View) *
                </label>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <img
                    src={getMediaUrl(formData.cover)}
                    alt="Cover preview"
                    className="h-20 w-32 object-cover border border-sand bg-ink"
                  />
                  <div className="flex-1 space-y-2">
                    <input
                      type="text"
                      required
                      value={formData.cover}
                      onChange={(e) => setFormData({ ...formData, cover: e.target.value })}
                      className="w-full border border-sand p-2 text-xs text-ink"
                      placeholder="Image URL or upload below"
                    />
                    <label className="inline-flex items-center gap-2 border border-ink bg-cream px-3 py-1.5 text-xs uppercase tracking-wider text-ink cursor-pointer hover:bg-gold transition">
                      <Upload className="size-3.5" />
                      {uploading ? "Uploading..." : "Upload Cover Image"}
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/avif"
                        className="hidden"
                        onChange={(e) => handleImageUpload(e, "cover")}
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* Gallery Images */}
              <div className="border border-sand bg-white p-4">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-[0.65rem] uppercase tracking-widest text-stone">
                    Photo Gallery ({formData.gallery.length} images)
                  </label>
                  <label className="inline-flex items-center gap-1.5 border border-ink bg-cream px-3 py-1 text-xs uppercase tracking-wider text-ink cursor-pointer hover:bg-gold transition">
                    <Plus className="size-3" /> Add Image
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/avif"
                      className="hidden"
                      onChange={(e) => handleImageUpload(e, "gallery")}
                    />
                  </label>
                </div>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                  {formData.gallery.map((img, i) => (
                    <div key={i} className="relative group aspect-square border border-sand bg-ink">
                      <img src={getMediaUrl(img)} alt="" className="h-full w-full object-cover" />
                      <button
                        type="button"
                        onClick={() =>
                          setFormData({
                            ...formData,
                            gallery: formData.gallery.filter((_, idx) => idx !== i),
                          })
                        }
                        className="absolute top-1 right-1 bg-black/80 text-white p-1 opacity-0 group-hover:opacity-100 transition"
                      >
                        <X className="size-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Specifications (Key-Value) */}
              <div className="border border-sand bg-white p-4">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-[0.65rem] uppercase tracking-widest text-stone">
                    Specifications
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        specs: [...formData.specs, { label: "", value: "" }],
                      })
                    }
                    className="inline-flex items-center gap-1 text-xs uppercase tracking-wider text-gold-deep hover:underline"
                  >
                    <Plus className="size-3" /> Add Spec
                  </button>
                </div>
                <div className="space-y-2">
                  {formData.specs.map((spec, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <input
                        type="text"
                        placeholder="Label (e.g. Typology)"
                        value={spec.label}
                        onChange={(e) => {
                          const updated = [...formData.specs];
                          updated[i].label = e.target.value;
                          setFormData({ ...formData, specs: updated });
                        }}
                        className="w-1/3 border border-sand p-2 text-xs"
                      />
                      <input
                        type="text"
                        placeholder="Value (e.g. 3 & 4 BHK)"
                        value={spec.value}
                        onChange={(e) => {
                          const updated = [...formData.specs];
                          updated[i].value = e.target.value;
                          setFormData({ ...formData, specs: updated });
                        }}
                        className="flex-1 border border-sand p-2 text-xs"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setFormData({
                            ...formData,
                            specs: formData.specs.filter((_, idx) => idx !== i),
                          })
                        }
                        className="text-stone hover:text-red-700 p-1"
                      >
                        <X className="size-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Curated Amenities */}
              <div className="border border-sand bg-white p-4">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-[0.65rem] uppercase tracking-widest text-stone">
                    Amenities & Facilities
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        amenities: [...formData.amenities, ""],
                      })
                    }
                    className="inline-flex items-center gap-1 text-xs uppercase tracking-wider text-gold-deep hover:underline"
                  >
                    <Plus className="size-3" /> Add Amenity
                  </button>
                </div>
                <div className="grid sm:grid-cols-2 gap-2">
                  {formData.amenities.map((item, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <input
                        type="text"
                        value={item}
                        onChange={(e) => {
                          const updated = [...formData.amenities];
                          updated[i] = e.target.value;
                          setFormData({ ...formData, amenities: updated });
                        }}
                        placeholder="Amenity name"
                        className="flex-1 border border-sand p-2 text-xs"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setFormData({
                            ...formData,
                            amenities: formData.amenities.filter((_, idx) => idx !== i),
                          })
                        }
                        className="text-stone hover:text-red-700 p-1"
                      >
                        <X className="size-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Toggles: Featured, Published */}
              <div className="flex flex-wrap items-center gap-8 border-t border-sand pt-4">
                <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    className="size-4 accent-gold"
                  />
                  <span>Featured on Homepage</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isPublished}
                    onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                    className="size-4 accent-gold"
                  />
                  <span>Published (Visible to all public visitors)</span>
                </label>
              </div>

              {/* Modal Footer Actions */}
              <div className="flex items-center justify-end gap-3 border-t border-sand pt-4">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="border border-sand px-5 py-2.5 text-[0.68rem] uppercase tracking-wider text-stone hover:text-ink"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-ink px-7 py-2.5 text-[0.68rem] uppercase tracking-widest text-cream hover:bg-gold hover:text-ink transition"
                >
                  {editingSlug ? "Save Residence Changes" : "Create & Publish Residence"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
