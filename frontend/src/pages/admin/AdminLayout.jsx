import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Building2,
  Quote,
  FileText,
  PanelsTopLeft,
  Pencil,
  MessageSquare,
  ShieldCheck,
  LogOut,
  ExternalLink,
  Menu,
  X,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { company } from "@data";
import { usePageMeta } from "../../hooks/usePageMeta";
import AdminOverview from "./AdminOverview";
import AdminProjects from "./AdminProjects";
import AdminTestimonials from "./AdminTestimonials";
import AdminContent from "./AdminContent";
import AdminEnquiries from "./AdminEnquiries";
import AdminSecurity from "./AdminSecurity";
import AdminSections from "./AdminSections";
import AdminPageCopy from "./AdminPageCopy";

export default function AdminLayout() {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  usePageMeta("CMS Console", `Admin Content Management System · ${company.name}`);

  if (loading) {
    return (
      <div className="min-h-screen bg-ink flex items-center justify-center text-gold animate-pulse">
        Authenticating owner session...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  async function handleLogout() {
    await logout();
    navigate("/admin/login", { replace: true });
  }

  const tabs = [
    { key: "overview", label: "Overview", icon: LayoutDashboard },
    { key: "projects", label: "Projects", icon: Building2 },
    { key: "testimonials", label: "Testimonials", icon: Quote },
    { key: "content", label: "Website Content", icon: FileText },
    { key: "sections", label: "Page Sections", icon: PanelsTopLeft },
    { key: "page-copy", label: "Page Copy", icon: Pencil },
    { key: "enquiries", label: "Inquiries", icon: MessageSquare },
    { key: "security", label: "Security", icon: ShieldCheck },
  ];

  return (
    <div className="min-h-screen bg-cream text-ink flex flex-col selection:bg-gold selection:text-ink">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-ink text-cream border-b border-gold/30">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-8">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-3 group">
              <img
                src={company.logo || "/images/logo.png"}
                alt={company.name}
                className="h-9 w-auto object-contain rounded border border-gold/40 shadow-sm transition-transform duration-300 group-hover:scale-105"
              />
              <span className="font-display text-xl tracking-wide hidden sm:inline-block">
                {company.name}
              </span>
            </Link>
            <span className="border-l border-gold/40 pl-3 text-[0.62rem] uppercase tracking-[0.24em] text-gold font-medium">
              Admin CMS
            </span>
          </div>

          <div className="hidden lg:flex items-center gap-6">
            <span className="text-xs text-sand/70">
              Logged in as <strong className="text-gold font-mono">{user.username}</strong>
            </span>

            <Link
              to="/"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 text-[0.68rem] uppercase tracking-wider text-sand/80 hover:text-gold transition"
            >
              Public Website <ExternalLink className="size-3.5" />
            </Link>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 border border-red-500/50 bg-red-950/30 px-3 py-1.5 text-[0.65rem] uppercase tracking-wider text-red-200 hover:bg-red-900/60 transition"
            >
              <LogOut className="size-3.5" /> Logout
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden text-cream p-1"
          >
            {mobileMenuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>
        </div>

        {/* Desktop Tab Navigation Bar */}
        <div className="hidden lg:block border-t border-white/10 bg-black/30">
          <div className="mx-auto flex max-w-7xl items-center gap-1 px-5 md:px-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-2 px-5 py-3 text-xs uppercase tracking-widest transition border-b-2 ${
                    active
                      ? "border-gold text-gold font-medium bg-white/5"
                      : "border-transparent text-sand/70 hover:text-cream hover:bg-white/5"
                  }`}
                >
                  <Icon className="size-4" /> {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-white/10 bg-ink px-5 py-6 space-y-4">
            <div className="flex flex-col gap-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const active = activeTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => {
                      setActiveTab(tab.key);
                      setMobileMenuOpen(false);
                    }}
                    className={`flex items-center gap-3 p-3 text-sm uppercase tracking-wider transition ${
                      active ? "bg-gold text-ink font-semibold" : "text-cream hover:bg-white/10"
                    }`}
                  >
                    <Icon className="size-4" /> {tab.label}
                  </button>
                );
              })}
            </div>
            <div className="border-t border-white/10 pt-4 flex items-center justify-between">
              <Link
                to="/"
                target="_blank"
                className="text-xs uppercase tracking-wider text-gold flex items-center gap-1"
              >
                Public Site <ExternalLink className="size-3" />
              </Link>
              <button
                onClick={handleLogout}
                className="text-xs uppercase tracking-wider text-red-400 flex items-center gap-1"
              >
                <LogOut className="size-3" /> Logout
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Main CMS View Body */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-5 py-8 md:px-8">
        {activeTab === "overview" && <AdminOverview onTabChange={setActiveTab} />}
        {activeTab === "projects" && <AdminProjects />}
        {activeTab === "testimonials" && <AdminTestimonials />}
        {activeTab === "content" && <AdminContent />}
        {activeTab === "sections" && <AdminSections />}
        {activeTab === "page-copy" && <AdminPageCopy />}
        {activeTab === "enquiries" && <AdminEnquiries />}
        {activeTab === "security" && <AdminSecurity />}
      </main>

      {/* Footer */}
      <footer className="border-t border-sand bg-white/40 py-4 px-5 text-center text-xs text-stone">
        <p>KKS Constructions CMS Dashboard · Authenticated as {user.username}</p>
      </footer>
    </div>
  );
}
