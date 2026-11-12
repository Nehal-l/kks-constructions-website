import { Link } from "react-router-dom";
import { navLinks } from "@data";
import { useSiteContent } from "../../context/ContentContext";

const currentYear = new Date().getFullYear();

export default function Footer() {
  const { content } = useSiteContent();
  const company = content?.company || {};
  const links = (Array.isArray(content.navigationItems) && content.navigationItems.length
    ? content.navigationItems : navLinks)
    .filter((link) => link && typeof link.label === "string" && typeof link.to === "string" &&
      content.pageVisibility?.[({ "/": "home", "/about": "about", "/projects": "projects", "/services": "services", "/testimonials": "testimonials", "/contact": "contact", "/privacy": "privacy" })[link.to]] !== false &&
      (link.to.startsWith("/") && !link.to.startsWith("//") || /^https?:\/\//i.test(link.to)));

  return (
    <footer className="bg-ink text-cream">
      <div className="mx-auto grid max-w-7xl gap-10 sm:gap-12 px-5 py-14 sm:py-16 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 md:px-8">
        <div>
          <Link to="/" className="inline-block mb-4 cursor-pointer">
            <img
              src={company.logo || "/images/logo.png"}
              alt={company.name}
              className="h-12 w-auto object-contain rounded border border-gold/40 shadow-sm transition hover:scale-105"
              style={{ height: "48px", maxHeight: "48px", width: "auto", maxWidth: "180px", objectFit: "contain" }}
            />
          </Link>
          <p className="text-[0.68rem] uppercase tracking-[0.28em] text-gold font-medium">{content.footer?.established || "Est. 2004"}</p>
          <h2 className="mt-2 font-display text-2xl">{company.name}</h2>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-sand/70">{content.footer?.tagline || company.tagline}</p>
        </div>
        <div>
          <p className="text-[0.68rem] uppercase tracking-[0.24em] text-gold font-medium">{content.footer?.exploreLabel || "Explore"}</p>
          <ul className="mt-4 space-y-2.5 text-sm text-cream/80">
            {links.map((link) => (
              <li key={link.to}>
                {/^https?:\/\//i.test(link.to)
                  ? <a href={link.to} target="_blank" rel="noreferrer" className="hover:text-gold transition cursor-pointer">{link.label}</a>
                  : <Link to={link.to} className="hover:text-gold transition cursor-pointer">{link.label}</Link>}
              </li>
            ))}
            {content.pageVisibility?.privacy !== false && <li>
              <Link to="/privacy" className="hover:text-gold transition cursor-pointer">
                {content.footer?.privacyLabel || "Privacy Policy"}
              </Link>
            </li>}
            <li>
              <Link to="/admin" className="text-sand/50 hover:text-gold text-xs transition cursor-pointer">
                Owner Portal
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-[0.68rem] uppercase tracking-[0.24em] text-gold font-medium">{content.footer?.visitLabel || "Visit"}</p>
          <p className="mt-4 text-sm leading-relaxed text-cream/80">
            {company.contact?.addressLine}
            <br />
            {company.contact?.city}
          </p>
          <p className="mt-4 text-sm space-y-1">
            <a className="hover:text-gold transition cursor-pointer block" href={`tel:${(company.contact?.phone || "").replace(/\s/g, "")}`}>
              {company.contact?.phone}
            </a>
            <a className="hover:text-gold transition cursor-pointer block break-all text-sand/90" href={`mailto:${company.contact?.email}`}>
              {company.contact?.email}
            </a>
          </p>
        </div>
      </div>
      <div className="border-t border-white/10 px-5 py-6 md:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 text-xs text-sand/50 md:flex-row md:justify-between">
          <p>
            {content.footer?.copyright || `© ${currentYear} ${company.name}. All rights reserved.`}
          </p>
          <p className="max-w-xl">{company.disclaimers?.visuals}</p>
        </div>
      </div>
    </footer>
  );
}
