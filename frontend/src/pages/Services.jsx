import { ArrowRight, Compass, Shield, Sparkles, Building, Briefcase, HeartHandshake } from "lucide-react";
import { Link } from "react-router-dom";
import PageHero from "../components/PageHero";
import PageSections from "../components/PageSections";
import Reveal from "../components/Reveal";
import SectionHeading from "../components/SectionHeading";
import { usePageMeta } from "../hooks/usePageMeta";
import { useSiteContent } from "../context/ContentContext";
import { getPageCopy, isSectionVisible } from "../lib/content";

const serviceIcons = [Compass, Sparkles, Building, Shield, Briefcase, HeartHandshake];

export default function Services() {
  const { content } = useSiteContent();
  const company = content?.company || {};
  const hero = content?.pageHeroes?.services || {};
  const listCopy = getPageCopy(content, "services", "servicesList");
  const ctaCopy = getPageCopy(content, "services", "servicesCta");

  usePageMeta("Services", `Resident services and disciplines from ${company.name || "KKS Constructions"}.`);

  const services = [
    {
      num: "01",
      category: listCopy.service1Category || "Spatial Design",
      title: listCopy.service1Title || "Architectural Masterplanning",
      desc: listCopy.service1Desc || "Holistic site analysis, passive solar orientation, natural ventilation corridors, and iconic structural geometry engineered for longevity.",
      Icon: serviceIcons[0],
    },
    {
      num: "02",
      category: listCopy.service2Category || "Interior Craft",
      title: listCopy.service2Title || "Bespoke Interior Architecture",
      desc: listCopy.service2Desc || "Custom stonework, hand-patinated metal detailing, acoustic wall assemblies, and private sanctuaries designed for sensorial calm.",
      Icon: serviceIcons[1],
    },
    {
      num: "03",
      category: listCopy.service3Category || "Environment",
      title: listCopy.service3Title || "Landscape & Botanical Design",
      desc: listCopy.service3Desc || "Indigenous biophilic environments, reflecting lotus courts, stepped terrace gardens, and water-harvesting microclimates.",
      Icon: serviceIcons[2],
    },
    {
      num: "04",
      category: listCopy.service4Category || "Execution",
      title: listCopy.service4Title || "Construction Management & Engineering",
      desc: listCopy.service4Desc || "Zero-tolerance engineering precision, seismic resistance, thermal glazing benchmarks, and transparent execution schedules.",
      Icon: serviceIcons[3],
    },
    {
      num: "05",
      category: listCopy.service5Category || "Client Advisory",
      title: listCopy.service5Title || "Private Advisory & Acquisitions",
      desc: listCopy.service5Desc || "Discreet advisory for bespoke acquisitions, customized floor plans, private site viewings, and confidential transaction management.",
      Icon: serviceIcons[4],
    },
    {
      num: "06",
      category: listCopy.service6Category || "Continuity",
      title: listCopy.service6Title || "Homeowner Aftercare Stewardship",
      desc: listCopy.service6Desc || "Lifetime homeowner concierge, preventative maintenance regimens, MEP audits, and dedicated asset preservation.",
      Icon: serviceIcons[5],
    },
  ];

  return (
    <>
      <PageSections page="services" placement="top" />

      {/* Services Hero */}
      {isSectionVisible(content, "services-hero") && (
        <PageHero
          image={hero.image || "/images/aerial-campus.jpg"}
          eyebrow={hero.eyebrow || "Our Services"}
          title={hero.title || "Services shaped around your home."}
          copy={hero.copy || "Explore the services available to our residents."}
        />
      )}

      {/* Capabilities & Disciplines List */}
      {isSectionVisible(content, "services-list") && (
        <section className="mx-auto max-w-7xl px-5 py-16 sm:py-20 md:py-24 md:px-8">
          <SectionHeading
            eyebrow={listCopy.eyebrow || "Our Capabilities"}
            title={listCopy.title || "Disciplines of Architectural Practice"}
            copy={listCopy.copy || "From visionary masterplanning to meticulous interior detailing and lifelong aftercare, our multidisciplinary team delivers spaces of enduring quiet luxury."}
          />

          <div className="mt-12 sm:mt-16 grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
            {services.map((item, index) => {
              const Icon = item.Icon;
              return (
                <Reveal
                  key={item.num}
                  delay={index * 0.06}
                  className="group relative flex flex-col justify-between border border-sand bg-white/70 p-6 sm:p-8 shadow-sm transition hover:border-gold hover:bg-white hover:shadow-md"
                >
                  <div>
                    <div className="flex items-center justify-between border-b border-sand/60 pb-4">
                      <span className="font-display text-2xl text-gold-deep">{item.num}</span>
                      <div className="flex size-10 items-center justify-center border border-gold/40 text-gold-deep transition group-hover:bg-gold group-hover:text-ink">
                        <Icon className="size-5" />
                      </div>
                    </div>
                    <span className="mt-5 sm:mt-6 block text-[0.62rem] uppercase tracking-[0.24em] text-stone font-medium">
                      {item.category}
                    </span>
                    <h3 className="mt-2 font-display text-xl sm:text-2xl text-ink group-hover:text-gold-deep transition">
                      {item.title}
                    </h3>
                    <p className="mt-3 sm:mt-4 text-xs sm:text-sm leading-relaxed text-stone font-light">
                      {item.desc}
                    </p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </section>
      )}

      {/* Consultation Call to Action */}
      {isSectionVisible(content, "services-cta") && (
        <section className="border-t border-sand bg-sand/30 py-16 sm:py-24">
          <div className="mx-auto max-w-5xl px-5 text-center md:px-8">
            <p className="text-[0.68rem] uppercase tracking-[0.32em] text-gold-deep font-medium">
              {ctaCopy.eyebrow || "Begin an Engagement"}
            </p>
            <h2 className="mt-3 font-display text-3xl sm:text-4xl md:text-5xl text-ink">
              {ctaCopy.title || "Commission a Private Advisory Consultation"}
            </h2>
            <p className="mx-auto mt-4 sm:mt-6 max-w-2xl text-sm sm:text-base leading-relaxed text-stone font-light">
              {ctaCopy.copy || "Whether acquiring a signature residence or discussing a bespoke development commission, our private office is at your service."}
            </p>
            <div className="mt-8 sm:mt-10 flex justify-center">
              <Link
                to={ctaCopy.buttonUrl || "/contact"}
                className="inline-flex items-center gap-2 bg-ink px-8 py-3.5 text-[0.68rem] uppercase tracking-[0.24em] text-cream hover:bg-gold hover:text-ink transition cursor-pointer shadow-sm"
              >
                {ctaCopy.buttonLabel || "Contact Advisory Desk"} <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      <PageSections page="services" />
    </>
  );
}
