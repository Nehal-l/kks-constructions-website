import { Phone, ArrowUpRight } from "lucide-react";
import { useSiteContent } from "../context/ContentContext";

/**
 * Professional direct contact component.
 * Displays direct communication channels (Phone, WhatsApp, Instagram).
 */
export default function DirectContactSection({ title = "Direct Consultation" }) {
  const { content } = useSiteContent();
  const company = content?.company || {};

  // Configurable contact details from existing content / configuration
  const phone = company.contact?.phone || "+91 98490 12345";
  const whatsapp = company.contact?.whatsapp || phone || "+91 98490 12345";
  const cleanPhone = phone.replace(/[^0-9+]/g, "");
  const cleanWhatsApp = whatsapp.replace(/[^0-9]/g, "");

  // Instagram: uses existing configured social link if provided, otherwise a clearly marked placeholder
  const rawInstagram = company.social?.instagram;
  const isCustomInstagram = rawInstagram && rawInstagram !== "https://instagram.com" && rawInstagram.trim() !== "";
  const instagramUrl = isCustomInstagram
    ? rawInstagram
    : "https://instagram.com/[YOUR_INSTAGRAM_HANDLE]";

  const instagramDisplay = isCustomInstagram
    ? `@${rawInstagram.replace(/\/$/, "").split("/").pop()}`
    : "@[YOUR_INSTAGRAM_HANDLE]";

  return (
    <div className="border border-sand bg-white/70 p-8 md:p-10 shadow-sm space-y-6">
      <div>
        <span className="text-[0.68rem] uppercase tracking-[0.32em] text-gold-deep font-medium">Direct Contact</span>
        <h3 className="mt-2 font-display text-3xl text-ink font-normal">{title}</h3>
        <p className="mt-4 text-stone leading-relaxed text-base font-light">
          For any enquiries, please contact us directly through phone, WhatsApp, or Instagram.
        </p>
      </div>

      <div className="grid gap-4 pt-2 sm:grid-cols-3">
        {/* Phone Link */}
        <a
          href={`tel:${cleanPhone}`}
          className="group flex flex-col justify-between border border-sand/80 bg-cream/40 p-5 transition hover:border-gold hover:bg-white"
        >
          <div className="flex items-center justify-between">
            <span className="flex size-9 items-center justify-center border border-gold/40 text-gold-deep">
              <Phone className="size-4" />
            </span>
            <ArrowUpRight className="size-4 text-stone group-hover:text-gold transition" />
          </div>
          <div className="mt-4">
            <p className="text-[0.62rem] uppercase tracking-[0.24em] text-stone">Phone</p>
            <p className="mt-1 text-sm font-medium text-ink group-hover:text-gold transition">{phone}</p>
          </div>
        </a>

        {/* WhatsApp Link */}
        <a
          href={`https://wa.me/${cleanWhatsApp}`}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex flex-col justify-between border border-sand/80 bg-cream/40 p-5 transition hover:border-gold hover:bg-white"
        >
          <div className="flex items-center justify-between">
            <span className="flex size-9 items-center justify-center border border-gold/40 text-gold-deep">
              <WhatsAppIcon className="size-4" />
            </span>
            <ArrowUpRight className="size-4 text-stone group-hover:text-gold transition" />
          </div>
          <div className="mt-4">
            <p className="text-[0.62rem] uppercase tracking-[0.24em] text-stone">WhatsApp</p>
            <p className="mt-1 text-sm font-medium text-ink group-hover:text-gold transition">{whatsapp}</p>
          </div>
        </a>

        {/* Instagram Link */}
        <a
          href={instagramUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex flex-col justify-between border border-sand/80 bg-cream/40 p-5 transition hover:border-gold hover:bg-white"
        >
          <div className="flex items-center justify-between">
            <span className="flex size-9 items-center justify-center border border-gold/40 text-gold-deep">
              <InstagramIcon className="size-4" />
            </span>
            <ArrowUpRight className="size-4 text-stone group-hover:text-gold transition" />
          </div>
          <div className="mt-4">
            <p className="text-[0.62rem] uppercase tracking-[0.24em] text-stone">Instagram</p>
            <p className="mt-1 text-sm font-medium text-ink group-hover:text-gold transition">{instagramDisplay}</p>
          </div>
        </a>
      </div>

      <div className="border-t border-sand/40 pt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-stone">
        <span>Advisory Desk: {company.contact?.hours || "Monday–Saturday, 10:00 AM – 6:30 PM IST"}</span>
        <span>{company.contact?.city || "Hyderabad, India"}</span>
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

