import { useEffect, useState } from "react";
import { Quote, Star } from "lucide-react";
import { Link } from "react-router-dom";
import PageHero from "../components/PageHero";
import Reveal from "../components/Reveal";
import { usePageMeta } from "../hooks/usePageMeta";
import { useSiteContent } from "../context/ContentContext";
import { fetchTestimonials } from "../lib/api";
import PageSections from "../components/PageSections";
import { getPageCopy, isSectionVisible } from "../lib/content";

export default function Testimonials() {
  const { content } = useSiteContent();
  const company = content?.company || {};
  const pressMentions = content?.pressMentions || [];
  const hero = content?.pageHeroes?.testimonials || {
    image: "/images/interior-bedroom.jpg",
    eyebrow: "Testimonials",
    title: "Reflections on Living Well.",
    copy: "Notes and experiences from homeowners, architects, and design consultants.",
  };
  const recognitionCopy = getPageCopy(content, "testimonials", "recognition");

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  usePageMeta("Testimonials", `Reflections and testimonials from homeowners and consultants · ${company.name}.`);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const res = await fetchTestimonials();
        if (active && Array.isArray(res?.testimonials)) {
          setItems(res.testimonials);
          setLoadError("");
        }
      } catch (error) {
        console.error("Testimonials could not be loaded:", error);
        if (active) setLoadError("Testimonials are temporarily unavailable.");
      } finally {
        if (active) setLoading(false);
      }
    }

    load();

    return () => {
      active = false;
    };
  }, []);

  return (
    <>
      <PageSections page="testimonials" placement="top" />
      {isSectionVisible(content, "testimonials-hero") && <PageHero
        image={hero.image || "/images/interior-bedroom.jpg"}
        eyebrow={hero.eyebrow || "Testimonials"}
        title={hero.title || "Reflections on Living Well."}
        copy={hero.copy || "Notes and experiences from homeowners, architects, and design consultants."}
      />}

      {/* Main Testimonials Grid */}
      {isSectionVisible(content, "testimonials-list") && content?.pageVisibility?.testimonials !== false && (loading || loadError || items.length === 0) && (
        <section className="mx-auto max-w-6xl px-5 py-16 text-center text-sm text-stone" role="status">
          {loading ? "Loading testimonials…" : loadError || "No published testimonials are available yet."}
        </section>
      )}
      {isSectionVisible(content, "testimonials-list") && content?.pageVisibility?.testimonials !== false && !loading && !loadError && items.length > 0 && <section className="mx-auto max-w-6xl px-5 py-24 md:px-8">
        <div className="grid gap-8 md:grid-cols-3">
          {items.map((item, index) => (
            <Reveal
              key={item._id || item.id || index}
              delay={index * 0.08}
              className="flex flex-col justify-between border border-sand bg-white/70 p-8 shadow-sm transition hover:border-gold"
            >
              <div>
                <div className="flex items-center justify-between text-gold">
                  <div className="flex gap-1">
                    {[...Array(item.rating || 5)].map((_, i) => (
                      <Star key={i} className="size-3.5 fill-gold text-gold" />
                    ))}
                  </div>
                  <Quote className="size-6 text-sand/60" />
                </div>
                <p className="mt-6 font-display text-2xl leading-relaxed text-ink">
                  "{item.quote}"
                </p>
              </div>

              <footer className="mt-8 border-t border-sand/60 pt-4 text-xs">
                <p className="font-medium text-ink">{item.name}</p>
                <span className="mt-0.5 block text-gold-deep">{item.role}</span>
              </footer>
            </Reveal>
          ))}
        </div>
      </section>}

      {/* Critical Recognition / Press */}
      {isSectionVisible(content, "testimonials-recognition") && content?.pageVisibility?.testimonials !== false && <section className="border-t border-sand bg-sand/30 py-20">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <div className="text-center">
            <p className="text-[0.68rem] uppercase tracking-[0.32em] text-gold-deep">{recognitionCopy.eyebrow}</p>
            <h2 className="mt-2 font-display text-4xl">{recognitionCopy.title}</h2>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {pressMentions.map((press, index) => (
              <div key={`${press.publication}-${index}`} className="border border-sand bg-cream p-6 text-center">
                <p className="text-xs uppercase tracking-widest text-gold-deep font-medium">
                  {press.publication}
                </p>
                <p className="mt-3 font-display text-lg text-ink italic leading-snug">
                  "{press.quote}"
                </p>
              </div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <p className="text-xs text-stone mb-4">
              {recognitionCopy.bottomCopy}
            </p>
            <Link
              to={recognitionCopy.buttonUrl || "/contact"}
              className="inline-flex bg-ink px-8 py-3.5 text-[0.68rem] uppercase tracking-[0.24em] text-cream hover:bg-gold hover:text-ink transition"
            >
              {recognitionCopy.buttonLabel}
            </Link>
          </div>
        </div>
      </section>}
      <PageSections page="testimonials" />
    </>
  );
}
