import { useEffect, useState } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
  Star,
  X,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import {
  fetchAdminTestimonials,
  createAdminTestimonial,
  updateAdminTestimonial,
  deleteAdminTestimonial,
  toggleAdminTestimonialPublish,
  reorderAdminTestimonials,
} from "../../lib/api";

const initialForm = {
  quote: "",
  name: "",
  role: "",
  rating: 5,
  isPublished: true,
};

export default function AdminTestimonials() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(initialForm);
  const [toast, setToast] = useState(null);

  function showToast(message, type = "success") {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  }

  async function loadTestimonials() {
    setLoading(true);
    try {
      const res = await fetchAdminTestimonials();
      setItems(res.testimonials || []);
    } catch (err) {
      showToast(err.message || "Failed to load testimonials.", "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTestimonials();
  }, []);

  function handleOpenCreate() {
    setEditingId(null);
    setFormData(initialForm);
    setModalOpen(true);
  }

  function handleOpenEdit(item) {
    setEditingId(item._id || item.id);
    setFormData({
      quote: item.quote,
      name: item.name,
      role: item.role,
      rating: item.rating || 5,
      isPublished: item.isPublished !== false,
    });
    setModalOpen(true);
  }

  async function handleTogglePublish(id) {
    try {
      const res = await toggleAdminTestimonialPublish(id);
      setItems((prev) =>
        prev.map((t) =>
          t._id === id || t.id === id ? { ...t, isPublished: res.isPublished } : t
        )
      );
      showToast(res.message);
    } catch (err) {
      showToast(err.message || "Failed to update visibility.", "error");
    }
  }

  async function handleDelete(id, name) {
    if (!window.confirm(`Delete testimonial from "${name}"?`)) return;
    try {
      await deleteAdminTestimonial(id);
      setItems((prev) => prev.filter((t) => t._id !== id && t.id !== id));
      showToast("Testimonial deleted successfully.");
    } catch (err) {
      showToast(err.message || "Failed to delete.", "error");
    }
  }

  async function handleMove(index, direction) {
    const target = index + direction;
    if (target < 0 || target >= items.length) return;

    const reordered = [...items];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(target, 0, moved);

    setItems(reordered);

    try {
      const ids = reordered.map((t) => t._id || t.id);
      await reorderAdminTestimonials(ids);
      showToast("Testimonial order saved.");
    } catch (err) {
      showToast(err.message || "Failed to reorder.", "error");
      loadTestimonials();
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!formData.quote.trim() || !formData.name.trim() || !formData.role.trim()) {
      showToast("Quote, Name, and Role are required.", "error");
      return;
    }

    try {
      if (editingId) {
        await updateAdminTestimonial(editingId, formData);
        showToast("Testimonial updated.");
      } else {
        await createAdminTestimonial(formData);
        showToast("Testimonial created & published.");
      }
      setModalOpen(false);
      loadTestimonials();
    } catch (err) {
      showToast(err.message || "Failed to save.", "error");
    }
  }

  return (
    <div className="space-y-6">
      {/* Toast */}
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

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-sand pb-6">
        <div>
          <h2 className="font-display text-3xl text-ink">Homeowner & Press Testimonials</h2>
          <p className="mt-1 text-xs text-stone">
            Manage feedback from homeowners, principal architects, and press reviews.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 bg-ink px-5 py-2.5 text-[0.68rem] uppercase tracking-[0.24em] text-cream hover:bg-gold hover:text-ink transition self-start sm:self-auto"
        >
          <Plus className="size-4" /> Add Testimonial
        </button>
      </div>

      {/* List */}
      {loading ? (
        <div className="p-16 text-center text-stone animate-pulse">Loading testimonials...</div>
      ) : items.length === 0 ? (
        <div className="border border-dashed border-sand p-12 text-center text-stone">
          No testimonials added yet. Click above to add the first one.
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item, index) => {
            const id = item._id || item.id;
            return (
              <div
                key={id}
                className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border p-4 bg-white shadow-sm transition ${
                  item.isPublished !== false ? "border-sand/70" : "border-amber-300/80 bg-amber-50/20"
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Reorder Buttons */}
                  <div className="flex flex-col gap-1 text-stone pt-1">
                    <button
                      onClick={() => handleMove(index, -1)}
                      disabled={index === 0}
                      className="p-1 hover:text-gold disabled:opacity-20"
                    >
                      <ArrowUp className="size-3.5" />
                    </button>
                    <button
                      onClick={() => handleMove(index, 1)}
                      disabled={index === items.length - 1}
                      className="p-1 hover:text-gold disabled:opacity-20"
                    >
                      <ArrowDown className="size-3.5" />
                    </button>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <div className="flex gap-0.5 text-gold">
                        {[...Array(item.rating || 5)].map((_, i) => (
                          <Star key={i} className="size-3 fill-gold text-gold" />
                        ))}
                      </div>
                      <span className="font-display text-lg font-medium text-ink">{item.name}</span>
                      <span className="text-xs text-stone">· {item.role}</span>
                      <span
                        className={`px-2 py-0.5 text-[0.55rem] uppercase tracking-widest border ${
                          item.isPublished !== false
                            ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                            : "border-amber-300 bg-amber-50 text-amber-800"
                        }`}
                      >
                        {item.isPublished !== false ? "Published" : "Hidden"}
                      </span>
                    </div>
                    <p className="mt-2 text-xs italic text-stone max-w-2xl leading-relaxed">
                      "{item.quote}"
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    onClick={() => handleTogglePublish(id)}
                    className="inline-flex items-center gap-1 border border-sand px-3 py-1.5 text-[0.62rem] uppercase tracking-wider text-stone hover:text-ink"
                  >
                    {item.isPublished !== false ? (
                      <>
                        <EyeOff className="size-3" /> Hide
                      </>
                    ) : (
                      <>
                        <Eye className="size-3" /> Publish
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => handleOpenEdit(item)}
                    className="inline-flex items-center gap-1 border border-sand px-3 py-1.5 text-[0.62rem] uppercase tracking-wider text-ink hover:text-gold-deep"
                  >
                    <Edit className="size-3" /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(id, item.name)}
                    className="inline-flex items-center gap-1 border border-red-200 px-3 py-1.5 text-[0.62rem] uppercase tracking-wider text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="size-3" /> Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl bg-cream text-ink border border-gold/40 shadow-2xl p-6">
            <div className="flex items-center justify-between border-b border-sand pb-3 mb-6">
              <h3 className="font-display text-2xl text-ink">
                {editingId ? "Edit Testimonial" : "Add Testimonial"}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-stone hover:text-ink">
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[0.65rem] uppercase tracking-widest text-stone mb-1">
                  Homeowner / Author Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Vikram & Ananya Singhania"
                  className="w-full border border-sand bg-white p-2.5 text-xs text-ink focus:border-gold focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[0.65rem] uppercase tracking-widest text-stone mb-1">
                  Residence / Role / Designation *
                </label>
                <input
                  type="text"
                  required
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  placeholder="e.g. Homeowners · Aurelia Residences, Jubilee Hills"
                  className="w-full border border-sand bg-white p-2.5 text-xs text-ink focus:border-gold focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[0.65rem] uppercase tracking-widest text-stone mb-1">
                  Testimonial Quote *
                </label>
                <textarea
                  rows={4}
                  required
                  value={formData.quote}
                  onChange={(e) => setFormData({ ...formData, quote: e.target.value })}
                  placeholder="Enter their feedback or reflection on living with KKS..."
                  className="w-full border border-sand bg-white p-2.5 text-xs text-ink focus:border-gold focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[0.65rem] uppercase tracking-widest text-stone mb-1">
                    Rating (Stars)
                  </label>
                  <select
                    value={formData.rating}
                    onChange={(e) => setFormData({ ...formData, rating: Number(e.target.value) })}
                    className="w-full border border-sand bg-white p-2.5 text-xs text-ink"
                  >
                    <option value={5}>5 Stars ★★★★★</option>
                    <option value={4}>4 Stars ★★★★☆</option>
                    <option value={3}>3 Stars ★★★☆☆</option>
                  </select>
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 text-xs cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isPublished}
                      onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                      className="size-4 accent-gold"
                    />
                    <span>Published immediately</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-sand">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="border border-sand px-4 py-2 text-xs uppercase"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-ink px-6 py-2 text-xs uppercase tracking-widest text-cream hover:bg-gold hover:text-ink transition"
                >
                  Save Testimonial
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
