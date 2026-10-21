import { ArrowRight, Award, Compass, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import PageHero from "../components/PageHero";
import Reveal from "../components/Reveal";
import SectionHeading from "../components/SectionHeading";
import { usePageMeta } from "../hooks/usePageMeta";
import { useSiteContent } from "../context/ContentContext";
import PageSections from "../components/PageSections";
import { getPageCopy, isSectionVisible } from "../lib/content";
import { getMediaUrl } from "../lib/api";

export default function About() {
  const { content } = useSiteContent();
  const company = content?.company || {};
  const hero = content?.pageHeroes?.about || {
    image: "/images/facade-detail.jpg",
    eyebrow: "About Us",
    title: "A quieter idea of grandeur.",
    copy: company.description,
  };
  const values = content?.values || company.values || [];
  const standards = content?.standards || [];
  const milestones = content?.milestones || [];
  const icons = { Compass, ShieldCheck, Award };
  const storyCopy = getPageCopy(content, "about", "story");
  const missionVisionCopy = getPageCopy(content, "about", "missionVision");
  const standardsCopy = getPageCopy(content, "about", "standards");
  const valuesCopy = getPageCopy(content, "about", "values");
  const milestonesCopy = getPageCopy(content, "about", "milestones");

  usePageMeta("About Us", `Company overview, mission, vision, and values of ${company.name}.`);

  return (
    <>
      <PageSections page="about" placement="top" />
      {isSectionVisible(content, "about-hero") && <PageHero
        image={hero.image || "/images/facade-detail.jpg"}
        eyebrow={hero.eyebrow || "About Us"}
        title={hero.title || "A quieter idea of grandeur."}
        copy={hero.copy || company.description}
      />}

      {/* Story & Philosophy */}
      {isSectionVisible(content, "about-story") && <section className="mx-auto grid max-w-7xl gap-16 px-5 py-24 md:grid-cols-2 md:px-8">
        <Reveal>
          <SectionHeading
            eyebrow={storyCopy.eyebrow}
            title={storyCopy.title.replace("KKS", company.shortName || "KKS")}
            copy={company.overview}
          />
          <div className="mt-8 border-l border-gold pl-6 text-sm text-stone italic">
            {storyCopy.quote}
          </div>
        </Reveal>
        <Reveal delay={0.08}>
          <img
            src={getMediaUrl(storyCopy.image)}
            alt={storyCopy.imageAlt}
            className="h-full min-h-[380px] w-full object-cover shadow-lg"
          />
        </Reveal>
      </section>}

      {/* Mission & Vision */}
      {isSectionVisible(content, "about-mission-vision") && <section className="bg-ink py-24 text-cream">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 md:grid-cols-2 md:px-8">
          <div className="border border-gold/20 bg-ink/50 p-8 backdrop-blur-sm">
            <p className="text-[0.68rem] uppercase tracking-[0.32em] text-gold">{missionVisionCopy.missionLabel}</p>
            <p className="mt-4 font-display text-3xl leading-snug">{company.mission}</p>
          </div>
          <div className="border border-gold/20 bg-ink/50 p-8 backdrop-blur-sm">
            <p className="text-[0.68rem] uppercase tracking-[0.32em] text-gold">{missionVisionCopy.visionLabel}</p>
            <p className="mt-4 font-display text-3xl leading-snug">{company.vision}</p>
          </div>
        </div>
      </section>}

      {/* Construction & Design Pillars */}
      {isSectionVisible(content, "about-standards") && <section className="mx-auto max-w-7xl px-5 py-24 md:px-8">
        <SectionHeading
          eyebrow={standardsCopy.eyebrow}
          title={standardsCopy.title}
          copy={standardsCopy.copy}
        />
        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {standards.map((item, index) => {
            const Icon = icons[item.icon] || Award;
            return (
              <Reveal key={`${item.title}-${index}`} delay={index * 0.08} className="border border-sand bg-cream p-8">
                <div className="flex size-12 items-center justify-center border border-gold/50 text-gold-deep mb-6">
                  <Icon className="size-6" />
                </div>
                <h3 className="font-display text-2xl text-ink">{item.title}</h3>
                <p className="mt-3 text-xs leading-relaxed text-stone">{item.text}</p>
              </Reveal>
            );
          })}
        </div>
      </section>}

      {/* Values */}
      {isSectionVisible(content, "about-values") && values.length > 0 && (
        <section className="border-t border-sand bg-sand/30 py-24">
          <div className="mx-auto max-w-7xl px-5 md:px-8">
            <SectionHeading eyebrow={valuesCopy.eyebrow} title={valuesCopy.title} />
            <div className="mt-12 grid gap-8 md:grid-cols-2">
              {values.map((value, index) => (
                <Reveal key={`${value.title}-${index}`} delay={index * 0.05} className="border-t border-sand pt-6">
                  <h3 className="font-display text-3xl">{value.title}</h3>
                  <p className="mt-3 text-stone leading-relaxed">{value.text}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Development Milestones */}
      {isSectionVisible(content, "about-milestones") && <section className="mx-auto max-w-7xl px-5 py-24 md:px-8">
        <SectionHeading eyebrow={milestonesCopy.eyebrow} title={milestonesCopy.title} />
        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {milestones.map((m, index) => (
            <div key={`${m.year}-${index}`} className="relative border-l border-gold pl-6 py-2">
              <span className="font-display text-2xl text-gold-deep">{m.year}</span>
              <h4 className="mt-2 text-base font-medium text-ink">{m.title}</h4>
              <p className="mt-2 text-xs leading-relaxed text-stone">{m.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 flex justify-center">
          <Link
            to={milestonesCopy.buttonUrl?.startsWith("/") && !milestonesCopy.buttonUrl.startsWith("//") ? milestonesCopy.buttonUrl : "/projects"}
            className="inline-flex items-center gap-2 bg-ink px-8 py-3.5 text-[0.68rem] uppercase tracking-[0.24em] text-cream hover:bg-gold hover:text-ink transition"
          >
            {milestonesCopy.buttonLabel} <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>}
      <PageSections page="about" />
    </>
  );
}
