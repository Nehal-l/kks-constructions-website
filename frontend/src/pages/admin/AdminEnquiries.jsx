import { useEffect, useState } from "react";
import {
  Mail,
  Phone,
  Calendar,
  Building,
  RefreshCw,
  Search,
  CheckCircle2,
  Clock,
  ExternalLink,
  Tag,
  MessageSquare,
} from "lucide-react";
import { fetchAdminEnquiries, updateEnquiryStatus } from "../../lib/api";

const STATUS_CONFIG = {
  new: {
    label: "New",
    badge: "bg-amber-100 text-amber-800 border-amber-300",
    dot: "bg-amber-500",
  },
  read: {
    label: "Read",
    badge: "bg-slate-100 text-slate-700 border-slate-300",
    dot: "bg-slate-400",
  },
  replied: {
    label: "Replied",
    badge: "bg-emerald-100 text-emerald-800 border-emerald-300",
    dot: "bg-emerald-500",
  },
};

export default function AdminEnquiries() {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [updatingId, setUpdatingId] = useState(null);
  const [actionMessage, setActionMessage] = useState("");

  async function load() {
    setLoading(true);
    setActionMessage("");
    try {
      const res = await fetchAdminEnquiries();
      setEnquiries(res.enquiries || []);
    } catch (err) {
      setActionMessage(err.message || "Failed to load enquiries.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleStatusChange(id, nextStatus) {
    setUpdatingId(id);
    setActionMessage("");
    try {
      const res = await updateEnquiryStatus(id, nextStatus);
      if (res.enquiry) {
        setEnquiries((prev) =>
          prev.map((e) => ((e._id || e.id) === id ? { ...e, status: nextStatus } : e))
        );
      }
    } catch (err) {
      setActionMessage(`Failed to update status: ${err.message}`);
    } finally {
      setUpdatingId(null);
    }
  }

  function openGmailReply(item) {
    const to = encodeURIComponent(item.email);
    const subjectText = item.subject
      ? `Re: ${item.subject}`
      : item.project
      ? `Re: Inquiry regarding ${item.project} — KKS Constructions`
      : `Re: Your enquiry — KKS Constructions`;
    const su = encodeURIComponent(subjectText);
    const bodyText = `Dear ${item.name || "Client"},\n\nThank you for contacting KKS Constructions.\n\nRegarding your enquiry:\n"${item.message}"\n\n\nBest regards,\nKKS Constructions Advisory Desk\nwww.kksconstructions.com`;
    const body = encodeURIComponent(bodyText);
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${to}&su=${su}&body=${body}`;
    window.open(gmailUrl, "_blank", "noopener,noreferrer");
  }

  const filtered = enquiries.filter((e) => {
    const q = search.toLowerCase();
    const matchesSearch =
      (e.name || "").toLowerCase().includes(q) ||
      (e.email || "").toLowerCase().includes(q) ||
      (e.phone || "").toLowerCase().includes(q) ||
      (e.subject || "").toLowerCase().includes(q) ||
      (e.project || "").toLowerCase().includes(q) ||
      (e.message || "").toLowerCase().includes(q);

    const matchesStatus =
      statusFilter === "all" || (e.status || "new").toLowerCase() === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const countNew = enquiries.filter((e) => (e.status || "new") === "new").length;
  const countRead = enquiries.filter((e) => e.status === "read").length;
  const countReplied = enquiries.filter((e) => e.status === "replied").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-sand pb-6">
        <div>
          <h2 className="font-display text-3xl text-ink">Client Inquiries</h2>
          <p className="mt-1 text-xs text-stone">
            Prospective buyers and clients who submitted contact or viewing requests.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-stone" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, project..."
              className="border border-sand bg-white py-2 pl-9 pr-4 text-xs tracking-wider text-ink focus:border-gold focus:outline-none"
            />
          </div>
          <button
            onClick={load}
            disabled={loading}
            className="flex items-center gap-1.5 border border-sand bg-white px-3 py-2 text-xs uppercase tracking-wider text-stone hover:text-ink disabled:opacity-50"
            title="Refresh list"
          >
            <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {actionMessage && (
        <div className="bg-sand/30 border border-sand px-4 py-2.5 text-xs text-ink">
          {actionMessage}
        </div>
      )}

      {/* Status Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-sand/60 pb-3 text-xs">
        {[
          { key: "all", label: "All", count: enquiries.length },
          { key: "new", label: "New", count: countNew },
          { key: "read", label: "Read", count: countRead },
          { key: "replied", label: "Replied", count: countReplied },
        ].map((tab) => {
          const active = statusFilter === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              className={`px-3 py-1.5 uppercase tracking-wider transition border ${
                active
                  ? "bg-ink text-cream border-ink font-medium"
                  : "bg-white text-stone border-sand hover:border-gold hover:text-ink"
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          );
        })}
      </div>

      {/* Main List */}
      {loading ? (
        <div className="p-16 text-center text-stone animate-pulse">Loading inquiries...</div>
      ) : filtered.length === 0 ? (
        <div className="border border-dashed border-sand p-12 text-center text-stone">
          No inquiries matching current criteria. Submissions will appear here.
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((item, idx) => {
            const id = item._id || item.id || `idx_${idx}`;
            const currentStatus = (item.status || "new").toLowerCase();
            const statusMeta = STATUS_CONFIG[currentStatus] || STATUS_CONFIG.new;
            const dateStr = item.createdAt
              ? new Date(item.createdAt).toLocaleString("en-IN", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })
              : "Recent";

            const isUpdating = updatingId === id;

            return (
              <div
                key={id}
                className="border border-sand/70 bg-white p-6 shadow-sm space-y-4 transition hover:border-sand"
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 border-b border-sand/40 pb-4">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <h3 className="font-display text-2xl text-ink font-medium">{item.name}</h3>
                      <span
                        className={`inline-flex items-center gap-1.5 border px-2.5 py-0.5 text-[0.62rem] uppercase tracking-wider font-medium ${statusMeta.badge}`}
                      >
                        <span className={`size-1.5 rounded-full ${statusMeta.dot}`} />
                        {statusMeta.label}
                      </span>
                      {item.project && (
                        <span className="inline-flex items-center gap-1 bg-gold/15 text-gold-deep border border-gold/30 px-2.5 py-0.5 text-[0.62rem] uppercase tracking-wider">
                          <Building className="size-3" /> {item.project}
                        </span>
                      )}
                    </div>
                    {item.subject && (
                      <p className="text-xs font-medium text-ink flex items-center gap-1.5">
                        <Tag className="size-3 text-gold-deep shrink-0" />
                        <span className="text-stone">Subject:</span> {item.subject}
                      </p>
                    )}
                  </div>

                  <span className="flex items-center gap-1.5 text-xs text-stone shrink-0">
                    <Calendar className="size-3 text-stone" /> {dateStr}
                  </span>
                </div>

                {/* Message body */}
                <div className="bg-cream/40 p-4 border border-sand/40">
                  <p className="text-xs uppercase tracking-wider text-stone mb-1 flex items-center gap-1">
                    <MessageSquare className="size-3 text-gold-deep" /> Message:
                  </p>
                  <p className="text-sm text-ink leading-relaxed whitespace-pre-wrap">
                    {item.message}
                  </p>
                </div>

                {/* Contact details & Action controls */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pt-2 border-t border-sand/30">
                  <div className="flex flex-wrap items-center gap-5 text-xs">
                    <a
                      href={`mailto:${item.email}`}
                      className="flex items-center gap-1.5 text-gold-deep hover:underline font-medium"
                    >
                      <Mail className="size-3.5" /> {item.email}
                    </a>

                    <a
                      href={`tel:${item.phone?.replace(/[^0-9+]/g, "")}`}
                      className="flex items-center gap-1.5 text-gold-deep hover:underline font-medium"
                    >
                      <Phone className="size-3.5" /> {item.phone}
                    </a>

                    {item.source && (
                      <span className="text-stone/70">Source: {item.source}</span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Reply via Gmail */}
                    <button
                      onClick={() => openGmailReply(item)}
                      className="inline-flex items-center gap-1.5 border border-ink bg-ink text-cream hover:bg-gold hover:border-gold hover:text-ink px-3 py-1.5 text-xs uppercase tracking-wider transition"
                      title="Open draft in Gmail"
                    >
                      <ExternalLink className="size-3" />
                      Reply via Gmail
                    </button>

                    {/* Status Toggle Buttons */}
                    {currentStatus !== "read" && currentStatus !== "replied" && (
                      <button
                        onClick={() => handleStatusChange(id, "read")}
                        disabled={isUpdating}
                        className="inline-flex items-center gap-1 border border-sand bg-white text-stone hover:text-ink hover:border-stone px-2.5 py-1.5 text-xs uppercase tracking-wider transition disabled:opacity-50"
                        title="Mark as read"
                      >
                        <Clock className="size-3" /> Mark as Read
                      </button>
                    )}

                    {currentStatus !== "replied" && (
                      <button
                        onClick={() => handleStatusChange(id, "replied")}
                        disabled={isUpdating}
                        className="inline-flex items-center gap-1 border border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 px-2.5 py-1.5 text-xs uppercase tracking-wider transition disabled:opacity-50"
                        title="Mark as replied"
                      >
                        <CheckCircle2 className="size-3" /> Mark as Replied
                      </button>
                    )}

                    {currentStatus !== "new" && (
                      <button
                        onClick={() => handleStatusChange(id, "new")}
                        disabled={isUpdating}
                        className="inline-flex items-center gap-1 border border-sand bg-white text-stone hover:text-ink px-2.5 py-1.5 text-xs uppercase tracking-wider transition disabled:opacity-50"
                        title="Reset to new"
                      >
                        Mark as New
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
