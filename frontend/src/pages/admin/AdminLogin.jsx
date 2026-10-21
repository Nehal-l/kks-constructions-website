import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { Lock, User, ArrowRight, ShieldCheck, AlertCircle } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { company } from "@data";
import { usePageMeta } from "../../hooks/usePageMeta";

const currentYear = new Date().getFullYear();

export default function AdminLogin() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  usePageMeta("Admin Sign In", `Private portal access for ${company.name} owner.`);

  if (user) {
    return <Navigate to="/admin" replace />;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!identifier.trim() || !password) {
      setError("Please enter your email address and password.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await login(identifier, password);
      navigate("/admin", { replace: true });
    } catch (err) {
      setError(err.message || "Invalid credentials.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-ink text-cream flex flex-col justify-between selection:bg-gold selection:text-ink">
      {/* Top Header */}
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-6 md:px-8">
        <Link to="/" className="flex items-center gap-3 group">
          <img
            src={company.logo || "/images/logo.png"}
            alt={company.name}
            className="h-10 w-auto object-contain rounded border border-gold/40 shadow-sm transition-transform duration-300 group-hover:scale-105"
          />
          <span className="font-display text-xl tracking-wide text-cream">{company.name}</span>
        </Link>
        <Link
          to="/"
          className="text-xs uppercase tracking-[0.24em] text-sand/70 hover:text-gold transition"
        >
          ← Return to Public Site
        </Link>
      </div>

      {/* Main Login Form */}
      <div className="mx-auto w-full max-w-md px-5 py-12">
        <div className="border border-gold/30 bg-ink/70 p-8 md:p-10 shadow-2xl backdrop-blur-md">
          <div className="flex items-center justify-center size-12 mx-auto border border-gold/50 bg-gold/10 text-gold mb-6">
            <Lock className="size-5" />
          </div>

          <div className="text-center">
            <p className="text-[0.68rem] uppercase tracking-[0.32em] text-gold">Owner Portal</p>
            <h1 className="mt-2 font-display text-3xl md:text-4xl text-cream">Sign In to CMS</h1>
            <p className="mt-2 text-xs text-sand/70">
              Manage website content, residences, and portfolio.
            </p>
          </div>

          {error && (
            <div className="mt-6 flex items-start gap-3 border border-red-500/40 bg-red-950/40 p-4 text-xs text-red-200">
              <AlertCircle className="size-4 shrink-0 text-red-400 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div>
              <label
                htmlFor="identifier"
                className="block text-[0.68rem] uppercase tracking-[0.24em] text-sand/80"
              >
                Owner Email
              </label>
              <div className="relative mt-2">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-stone" />
                <input
                  id="identifier"
                  type="email"
                  autoComplete="email"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="constructionskks@gmail.com"
                  className="w-full border border-sand/30 bg-black/40 py-3 pl-10 pr-4 text-sm text-cream placeholder:text-stone/60 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-[0.68rem] uppercase tracking-[0.24em] text-sand/80"
              >
                Password
              </label>
              <div className="relative mt-2">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-stone" />
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full border border-sand/30 bg-black/40 py-3 pl-10 pr-4 text-sm text-cream placeholder:text-stone/60 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-gold py-3.5 text-[0.7rem] uppercase tracking-[0.26em] text-ink font-medium transition hover:bg-gold-deep hover:text-cream disabled:opacity-50"
            >
              {loading ? (
                "Authenticating..."
              ) : (
                <>
                  Access CMS <ArrowRight className="size-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 border-t border-white/10 pt-6 text-center">
            <div className="flex items-center justify-center gap-2 text-xs text-sand/50">
              <ShieldCheck className="size-4 text-gold/70" />
              <span>HTTP-Only Session & Rate-Limit Protected</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-white/10 px-5 py-6 text-center text-xs text-sand/50">
        <p>© {currentYear} {company.name}. Restricted administrative access.</p>
      </div>
    </div>
  );
}
