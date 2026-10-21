import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { navLinks } from "@data";
import { useSiteContent } from "../../context/ContentContext";

export default function Navbar() {
  const { content } = useSiteContent();
  const company = content?.company || {};
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const home = location.pathname === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const solid = !home || scrolled || open;
  const links = (Array.isArray(content.navigationItems) && content.navigationItems.length
    ? content.navigationItems : navLinks)
    .filter((link) => {
      const page = {
        "/": "home",
        "/about": "about",
        "/projects": "projects",
        "/services": "services",
        "/testimonials": "testimonials",
        "/contact": "contact",
        "/privacy": "privacy",
      }[link.to];
      return (!page || content.pageVisibility?.[page] !== false) &&
        typeof link.label === "string" && typeof link.to === "string" &&
        (link.to.startsWith("/") && !link.to.startsWith("//") || /^https?:\/\//i.test(link.to));
    });

  function NavigationLink({ link, mobile = false }) {
    const className = mobile
      ? ({ isActive }) => `font-display text-3xl ${isActive ? "text-gold" : "text-cream"}`
      : ({ isActive }) => `text-[0.68rem] uppercase tracking-[0.24em] transition hover:text-gold ${
        isActive ? "text-gold" : "text-cream/85"
      }`;
    if (/^https?:\/\//i.test(link.to)) {
      return <a href={link.to} target="_blank" rel="noreferrer" className={mobile ? "font-display text-3xl text-cream" : "text-[0.68rem] uppercase tracking-[0.24em] text-cream/85 hover:text-gold"}>{link.label}</a>;
    }
    return <NavLink to={link.to} className={className} end={link.to === "/"}>{link.label}</NavLink>;
  }

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        solid ? "bg-ink/95 text-cream backdrop-blur-md" : "bg-transparent text-cream"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-8">
        <Link to="/" className="flex items-center gap-3.5 group" aria-label={`${company.name} home`}>
          <img
            src={company.logo || "/images/logo.png"}
            alt={`${company.name} Logo`}
            className="h-10 md:h-11 w-auto object-contain rounded border border-gold/40 shadow-sm transition-transform duration-300 group-hover:scale-105"
          />
          <span className="font-display text-xl tracking-wide hidden sm:inline-block">{company.name}</span>
        </Link>
        <nav className="hidden items-center gap-8 lg:flex" aria-label="Primary">
          {links.map((link) => <NavigationLink key={`${link.to}-${link.label}`} link={link} />)}
        </nav>
        <Link
          to={content.footer?.enquiryUrl?.startsWith("/") && !content.footer.enquiryUrl.startsWith("//") ? content.footer.enquiryUrl : "/contact"}
          className="hidden border border-gold/70 px-4 py-2 text-[0.62rem] uppercase tracking-[0.24em] text-gold transition hover:bg-gold hover:text-ink lg:inline-flex"
        >
          {content.footer?.enquiryLabel || "Enquire"}
        </Link>
        <button
          type="button"
          className="lg:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X aria-hidden /> : <Menu aria-hidden />}
          <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
        </button>
      </div>
      {open ? (
        <div id="mobile-menu" className="border-t border-white/10 bg-ink px-5 py-8 lg:hidden">
          <nav className="flex flex-col gap-5" aria-label="Mobile" onClick={() => setOpen(false)}>
            {links.map((link) => <NavigationLink key={`${link.to}-${link.label}`} link={link} mobile />)}
            <Link to="/contact" className="mt-4 text-[0.7rem] uppercase tracking-[0.24em] text-gold">
              Enquire
            </Link>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
