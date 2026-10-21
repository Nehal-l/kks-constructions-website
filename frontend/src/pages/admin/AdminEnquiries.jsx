import { useEffect, useState } from "react";
import { Mail, Phone, Calendar, Building, RefreshCw, Search } from "lucide-react";
import { fetchAdminEnquiries } from "../../lib/api";

export default function AdminEnquiries() {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  async function load() {
    setLoading(true);
    try {
      const res = await fetchAdminEnquiries();
      setEnquiries(res.enquiries || []);
    } catch {
      // Handled
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = enquiries.filter((e) => {
    const q = search.toLowerCase();
    return (
      (e.name || "").toLowerCase().includes(q) ||
      (e.email || "").toLowerCase().includes(q) ||
      (e.phone || "").toLowerCase().includes(q) ||
      (e.project || "").toLowerCase().includes(q) ||
      (e.message || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-sand pb-6">
        <div>
          <h2 className="font-display text-3xl text-ink">Inbound Client Inquiries</h2>
          <p className="mt-1 text-xs text-stone">
            Prospective buyers and clients who submitted an advisory or viewing request.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-stone" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search leads..."
              className="border border-sand bg-white py-2 pl-9 pr-4 text-xs tracking-wider text-ink focus:border-gold focus:outline-none"
            />
          </div>
          <button
            onClick={load}
            className="flex items-center gap-1.5 border border-sand bg-white px-3 py-2 text-xs uppercase tracking-wider text-stone hover:text-ink"
            title="Refresh list"
          >
            <RefreshCw className="size-3.5" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-16 text-center text-stone animate-pulse">Loading inquiries...</div>
      ) : filtered.length === 0 ? (
        <div className="border border-dashed border-sand p-12 text-center text-stone">
          No inquiries found. Any submissions from the contact or project pages will appear here.
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((item, idx) => {
            const dateStr = item.createdAt
              ? new Date(item.createdAt).toLocaleString("en-US", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })
              : "Recent";

            return (
              <div
                key={item._id || item.id || idx}
                className="border border-sand/70 bg-white p-6 shadow-sm space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-sand/40 pb-3">
                  <div className="flex items-center gap-3">
                    <h3 className="font-display text-2xl text-ink font-medium">{item.name}</h3>
                    {item.project && (
                      <span className="inline-flex items-center gap-1 bg-gold/15 text-gold-deep border border-gold/30 px-2.5 py-0.5 text-[0.62rem] uppercase tracking-wider">
                        <Building className="size-3" /> {item.project}
                      </span>
                    )}
                  </div>
                  <span className="flex items-center gap-1.5 text-xs text-stone">
                    <Calendar className="size-3 text-stone" /> {dateStr}
                  </span>
                </div>

                <p className="text-sm text-ink leading-relaxed whitespace-pre-wrap bg-cream/30 p-4 border border-sand/40">
                  {item.message}
                </p>

                <div className="flex flex-wrap items-center gap-6 pt-2 text-xs">
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
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

