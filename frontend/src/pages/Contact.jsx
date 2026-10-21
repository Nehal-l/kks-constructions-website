import { Clock, HelpCircle, Mail, MessageSquare, Phone } from "lucide-react";
import DirectContactSection from "../components/DirectContactSection";
import PageHero from "../components/PageHero";
import { usePageMeta } from "../hooks/usePageMeta";
import { useSiteContent } from "../context/ContentContext";
import PageSections from "../components/PageSections";
import { getPageCopy, isSectionVisible } from "../lib/content";

export default function Contact() {
  const { content } = useSiteContent();
  const company = content?.company || {};
  const faqs = content?.faqs || [];
  const hero = content?.pageHeroes?.contact || {
    image: "/images/penthouse-terrace.jpg",
    eyebrow: "Contact Us",
    title: "We would like to hear from you.",
    copy: "Reach our private advisory desk for site viewings, portfolio brochures, or bespoke consultation.",
  };
  const contactCopy = getPageCopy(content, "contact", "details");
  const faqCopy = getPageCopy(content, "contact", "faq");

  usePageMeta("Contact Us", `Get in touch with ${company.name}.`);

  const phone = company.contact?.phone || "+91 98490 12345";
  const whatsappNum = company.contact?.whatsapp || phone;
  const cleanPhone = phone.replace(/[^0-9+]/g, "");
  const cleanWhatsApp = whatsappNum.replace(/[^0-9+]/g, "");

  return (
    <>
      <PageSections page="contact" placement="top" />
      {isSectionVisible(content, "contact-hero") && <PageHero
        image={hero.image || "/images/penthouse-terrace.jpg"}
        eyebrow={hero.eyebrow || "Contact Us"}
        title={hero.title || "We would like to hear from you."}
        copy={hero.copy || "Reach our private advisory desk for site viewings, portfolio brochures, or bespoke consultation."}
      />}

      {isSectionVisible(content, "contact-details") && <section className="mx-auto grid max-w-7xl gap-16 px-5 py-24 lg:grid-cols-2 md:px-8">
        <div>
          <span className="text-[0.68rem] uppercase tracking-[0.32em] text-gold-deep">{contactCopy.eyebrow}</span>
          <h2 className="mt-2 font-display text-4xl">{contactCopy.title}</h2>
          <p className="mt-6 text-stone leading-relaxed text-base">
            {company.contact?.addressLine}
            <br />
            {company.contact?.city}
          </p>

          <div className="mt-8 space-y-6">
            <div className="flex items-start gap-4">
              <div className="flex size-10 items-center justify-center border border-gold/40 text-gold-deep shrink-0">
                <Phone className="size-4" />
              </div>
              <div>
                <dt className="text-[0.65rem] uppercase tracking-[0.24em] text-gold-deep">Telephone</dt>
                <dd className="mt-1 font-medium text-ink">
                  <a href={`tel:${cleanPhone}`} className="hover:text-gold transition">
                    {company.contact?.phone}
                  </a>
                </dd>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex size-10 items-center justify-center border border-gold/40 text-gold-deep shrink-0">
                <Mail className="size-4" />
              </div>
              <div>
                <dt className="text-[0.65rem] uppercase tracking-[0.24em] text-gold-deep">Direct Email</dt>
                <dd className="mt-1 font-medium text-ink">
                  <a href={`mailto:${company.contact?.email}`} className="hover:text-gold transition">
                    {company.contact?.email}
                  </a>
                </dd>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex size-10 items-center justify-center border border-gold/40 text-gold-deep shrink-0">
                <Clock className="size-4" />
              </div>
              <div>
                <dt className="text-[0.65rem] uppercase tracking-[0.24em] text-gold-deep">Advisory Hours</dt>
                <dd className="mt-1 text-ink">{company.contact?.hours}</dd>
              </div>
            </div>
          </div>

          {/* Quick WhatsApp / Direct Connect */}
          <div className="mt-10 border border-sand bg-white/60 p-6">
            <h4 className="flex items-center gap-2 font-display text-xl text-ink">
              <MessageSquare className="size-4 text-gold-deep" /> {contactCopy.whatsappTitle}
            </h4>
            <p className="mt-2 text-xs text-stone leading-relaxed">
              {contactCopy.whatsappCopy}
            </p>
            <a
              href={`https://wa.me/${cleanWhatsApp.replace("+", "")}`}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex items-center gap-2 bg-ink px-5 py-2.5 text-[0.65rem] uppercase tracking-[0.22em] text-cream hover:bg-gold hover:text-ink transition"
            >
              {contactCopy.whatsappButtonLabel}
            </a>
          </div>
        </div>

        <div>
          <DirectContactSection title="Private Advisory Desk" />
        </div>
      </section>}

      {/* Frequently Asked Questions */}
      {isSectionVisible(content, "contact-faq") && <section className="border-t border-sand bg-sand/25 py-20">
        <div className="mx-auto max-w-5xl px-5 md:px-8">
          <div className="text-center">
            <p className="text-[0.68rem] uppercase tracking-[0.32em] text-gold-deep">{faqCopy.eyebrow}</p>
            <h2 className="mt-2 font-display text-4xl">{faqCopy.title}</h2>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {faqs.map((faq, index) => (
              <div key={`${faq.q}-${index}`} className="border border-sand bg-cream p-6">
                <h3 className="flex items-start gap-3 font-display text-xl text-ink">
                  <HelpCircle className="size-5 text-gold-deep shrink-0 mt-0.5" />
                  {faq.q}
                </h3>
                <p className="mt-3 text-xs leading-relaxed text-stone pl-8">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>}
      <PageSections page="contact" />
    </>
  );
}
