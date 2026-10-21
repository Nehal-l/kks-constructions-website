import { useEffect, useState } from "react";
import { Building2, MessageSquare, Quote, Database, Cloud, RefreshCw, Eye, EyeOff } from "lucide-react";
import { fetchAdminOverview } from "../../lib/api";

export default function AdminOverview({ onTabChange }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const res = await fetchAdminOverview();
      setData(res);
    } catch (err) {
      setError(err.message || "Failed to load overview data.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-20 text-stone animate-pulse">
        Loading CMS Overview...
      </div>
    );
  }

  if (error) {
    return (
      <div className="border border-red-500/30 bg-red-950/20 p-6 text-red-300">
        <p className="font-medium">Error loading overview</p>
        <p className="mt-1 text-xs">{error}</p>
        <button
          onClick={load}
          className="mt-4 inline-flex items-center gap-2 border border-red-400/40 px-4 py-2 text-xs uppercase"
        >
          <RefreshCw className="size-3" /> Retry
        </button>
      </div>
    );
  }

  const { stats, system } = data;

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="border border-gold/30 bg-ink p-8 text-cream">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-[0.68rem] uppercase tracking-[0.32em] text-gold">Management Console</p>
            <h1 className="mt-2 font-display text-3xl md:text-4xl">Platform Health & Metrics</h1>
            <p className="mt-2 text-xs text-sand/70 max-w-xl">
              Changes published in this CMS reflect live immediately across the entire public website.
            </p>
          </div>
          <button
            onClick={load}
            className="self-start md:self-auto inline-flex items-center gap-2 border border-gold/50 px-4 py-2 text-xs uppercase tracking-widest text-gold hover:bg-gold hover:text-ink transition"
          >
            <RefreshCw className="size-3.5" /> Refresh Metrics
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* Projects Card */}
        <div
          onClick={() => onTabChange("projects")}
          className="cursor-pointer border border-sand/40 bg-white p-6 shadow-sm hover:border-gold transition group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[0.68rem] uppercase tracking-[0.24em] text-stone">Residences</span>
            <Building2 className="size-5 text-gold-deep group-hover:scale-110 transition-transform" />
          </div>
          <p className="mt-4 font-display text-4xl text-ink font-medium">{stats.totalProjects}</p>
          <div className="mt-3 flex items-center gap-4 text-xs text-stone border-t border-sand/40 pt-3">
            <span className="flex items-center gap-1 text-emerald-700">
              <Eye className="size-3" /> {stats.publishedProjects} Published
            </span>
            {stats.hiddenProjects > 0 && (
              <span className="flex items-center gap-1 text-amber-700">
                <EyeOff className="size-3" /> {stats.hiddenProjects} Hidden
              </span>
            )}
          </div>
        </div>

        {/* Testimonials Card */}
        <div
          onClick={() => onTabChange("testimonials")}
          className="cursor-pointer border border-sand/40 bg-white p-6 shadow-sm hover:border-gold transition group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[0.68rem] uppercase tracking-[0.24em] text-stone">Testimonials</span>
            <Quote className="size-5 text-gold-deep group-hover:scale-110 transition-transform" />
          </div>
          <p className="mt-4 font-display text-4xl text-ink font-medium">{stats.totalTestimonials}</p>
          <div className="mt-3 flex items-center gap-4 text-xs text-stone border-t border-sand/40 pt-3">
            <span className="flex items-center gap-1 text-emerald-700">
              <Eye className="size-3" /> {stats.publishedTestimonials} Published
            </span>
          </div>
        </div>

                {/* Inquiries card temporarily hidden */}

        {/* Storage Health */}
        <div className="border border-sand/40 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[0.68rem] uppercase tracking-[0.24em] text-stone">System Engine</span>
            <Database className="size-5 text-gold-deep" />
          </div>
          <div className="mt-4 space-y-2 text-xs">
            <div className="flex items-center justify-between border-b border-sand/30 pb-2">
              <span className="text-stone">Database:</span>
              <span className="font-medium text-ink flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                {system.database}
              </span>
            </div>
            <div className="flex items-center justify-between pt-1">
              <span className="text-stone">Media CDN:</span>
              <span className="font-medium text-ink flex items-center gap-1.5">
                <Cloud className="size-3 text-gold-deep" />
                {system.media}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <button
          onClick={() => onTabChange("projects")}
          className="flex flex-col items-start p-6 border border-sand bg-cream hover:border-gold hover:bg-white transition text-left"
        >
          <span className="text-[0.62rem] uppercase tracking-widest text-gold-deep font-medium">Residences</span>
          <h3 className="mt-2 font-display text-xl text-ink">Add or Edit Projects</h3>
          <p className="mt-2 text-xs text-stone">
            Update project galleries, RERA numbers, specs, amenities, and visibility status.
          </p>
        </button>

        <button
          onClick={() => onTabChange("content")}
          className="flex flex-col items-start p-6 border border-sand bg-cream hover:border-gold hover:bg-white transition text-left"
        >
          <span className="text-[0.62rem] uppercase tracking-widest text-gold-deep font-medium">Text & Media</span>
          <h3 className="mt-2 font-display text-xl text-ink">Edit Website Content</h3>
          <p className="mt-2 text-xs text-stone">
            Customize company bio, contact telephone, address, key metrics, and page banners.
          </p>
        </button>

        <button
          onClick={() => onTabChange("sections")}
          className="flex flex-col items-start p-6 border border-sand bg-cream hover:border-gold hover:bg-white transition text-left"
        >
          <span className="text-[0.62rem] uppercase tracking-widest text-gold-deep font-medium">Layout</span>
          <h3 className="mt-2 font-display text-xl text-ink">Manage Page Sections</h3>
          <p className="mt-2 text-xs text-stone">
            Toggle visibility and reorder modular sections across all pages.
          </p>
        </button>
      </div>
    </div>
  );
}

