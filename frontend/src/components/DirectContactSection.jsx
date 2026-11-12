import { Phone, ArrowUpRight } from "lucide-react";
import { useSiteContent } from "../context/ContentContext";
import { getPageCopy } from "../lib/content";

/**
 * Professional direct contact component.
 * Displays direct communication channels (Phone, WhatsApp, Instagram).
 * All labels and text are fully editable through the CMS admin portal.
 */
export default function DirectContactSection({ title }) {
  const { content } = useSiteContent();
  const company = content?.company || {};

  // All text is now driven from the CMS (pageCopy.contact.privateDesk)
  const copy = getPageCopy(content, "contact", "privateDesk");

  // Resolve title: prefer CMS copy, then the prop override, then the CMS default
  const cardTitle = title || copy.title || "Private Advisory Desk";
  const eyebrow = copy.eyebrow || "Direct Contact";
  const description = copy.description || "For any enquiries, please contact us directly through phone, WhatsApp, or Instagram.";
  const phoneLabel = copy.phoneLabel || "Phone";
  const whatsappLabel = copy.whatsappLabel || "WhatsApp";
  const instagramLabel = copy.instagramLabel || "Instagram";
  const hoursPrefix = copy.hoursPrefix || "Advisory Desk:";
  const cityFallback = copy.cityFallback || "Hyderabad, India";
  const instagramPlaceholder = copy.instagramPlaceholder || "@[YOUR_INSTAGRAM_HANDLE]";

  // Configurable contact details from CMS company section
  const phone = company.contact?.phone || "+91 98490 12345";
  const whatsapp = company.contact?.whatsapp || phone || "+91 98490 12345";
  const cleanPhone = phone.replace(/[^0-9+]/g, "");
  const cleanWhatsApp = whatsapp.replace(/[^0-9]/g, "");

  // Instagram: uses configured social link if provided, otherwise the CMS placeholder
  const rawInstagram = company.social?.instagram;
  const isCustomInstagram = rawInstagram && rawInstagram !== "https://instagram.com" && rawInstagram.trim() !== "";
  const instagramUrl = isCustomInstagram
    ? rawInstagram
    : `https://instagram.com/${instagramPlaceholder.replace(/^@/, "")}`;

  const instagramDisplay = isCustomInstagram
    ? `@${rawInstagram.replace(/\/$/, "").split("/").pop()}`
    : instagramPlaceholder;

  return (
    <div className="border border-sand bg-white/70 p-6 sm:p-8 md:p-10 shadow-sm space-y-6 transition-all">
      <div>
        <span className="text-[0.68rem] uppercase tracking-[0.32em] text-gold-deep font-medium">{eyebrow}</span>
        <h3 className="mt-2 font-display text-2xl sm:text-3xl text-ink font-normal leading-tight">{cardTitle}</h3>
        <p className="mt-3 text-stone leading-relaxed text-sm sm:text-base font-light">
          {description}
        </p>
      </div>

      <div className="grid gap-3 sm:gap-4 pt-2 grid-cols-1 sm:grid-cols-3">
        {/* Phone Link */}
        <a
          href={`tel:${cleanPhone}`}
          className="group flex flex-col justify-between border border-sand/80 bg-cream/40 p-4 sm:p-3.5 lg:p-4 transition hover:border-gold hover:bg-white hover:shadow-sm cursor-pointer min-w-0"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="flex size-9 items-center justify-center border border-gold/40 text-gold-deep shrink-0 transition group-hover:bg-gold group-hover:text-ink">
              <Phone className="size-4" />
            </span>
            <ArrowUpRight className="size-4 text-stone group-hover:text-gold transition shrink-0" />
          </div>
          <div className="mt-4 min-w-0">
            <p className="text-[0.62rem] uppercase tracking-[0.24em] text-stone">{phoneLabel}</p>
            <p className="mt-1 text-xs sm:text-xs md:text-sm font-medium text-ink group-hover:text-gold transition truncate" title={phone}>
              {phone}
            </p>
          </div>
        </a>

        {/* WhatsApp Link */}
        <a
          href={`https://wa.me/${cleanWhatsApp}`}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex flex-col justify-between border border-sand/80 bg-cream/40 p-4 sm:p-3.5 lg:p-4 transition hover:border-gold hover:bg-white hover:shadow-sm cursor-pointer min-w-0"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="flex size-9 items-center justify-center border border-gold/40 text-gold-deep shrink-0 transition group-hover:bg-gold group-hover:text-ink">
              <WhatsAppIcon className="size-4" />
            </span>
            <ArrowUpRight className="size-4 text-stone group-hover:text-gold transition shrink-0" />
          </div>
          <div className="mt-4 min-w-0">
            <p className="text-[0.62rem] uppercase tracking-[0.24em] text-stone">{whatsappLabel}</p>
            <p className="mt-1 text-xs sm:text-xs md:text-sm font-medium text-ink group-hover:text-gold transition truncate" title={whatsapp}>
              {whatsapp}
            </p>
          </div>
        </a>

        {/* Instagram Link */}
        <a
          href={instagramUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex flex-col justify-between border border-sand/80 bg-cream/40 p-4 sm:p-3.5 lg:p-4 transition hover:border-gold hover:bg-white hover:shadow-sm cursor-pointer min-w-0"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="flex size-9 items-center justify-center border border-gold/40 text-gold-deep shrink-0 transition group-hover:bg-gold group-hover:text-ink">
              <InstagramIcon className="size-4" />
            </span>
            <ArrowUpRight className="size-4 text-stone group-hover:text-gold transition shrink-0" />
          </div>
          <div className="mt-4 min-w-0">
            <p className="text-[0.62rem] uppercase tracking-[0.24em] text-stone">{instagramLabel}</p>
            <p className="mt-1 text-xs sm:text-xs md:text-sm font-medium text-ink group-hover:text-gold transition truncate" title={instagramDisplay}>
              {instagramDisplay}
            </p>
          </div>
        </a>
      </div>

      <div className="border-t border-sand/40 pt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 text-xs text-stone">
        <span className="leading-relaxed">{hoursPrefix} {company.contact?.hours || "Monday–Saturday, 10:00 AM – 6:30 PM IST"}</span>
        <span className="leading-relaxed shrink-0 font-medium sm:text-right">{company.contact?.city || cityFallback}</span>
      </div>
    </div>
  );
}

function WhatsAppIcon({ className = "size-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" />
      <path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1" />
    </svg>
  );
}

function InstagramIcon({ className = "size-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}
