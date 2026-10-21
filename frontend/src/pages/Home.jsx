import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { company as defaultCompany, pageContentDefaults } from "@data";
import ProjectCard from "../components/ProjectCard";
import Reveal from "../components/Reveal";
import SectionHeading from "../components/SectionHeading";
import { usePageMeta } from "../hooks/usePageMeta";
import { useSiteContent } from "../context/ContentContext";
import { fetchProjects, fetchTestimonials, getMediaUrl } from "../lib/api";
import PageSections from "../components/PageSections";
import { getPageCopy, isSectionVisible } from "../lib/content";

export default function Home() {
  const { content } = useSiteContent();
  const company = content?.company || defaultCompany;
  const hero = content?.pageHeroes?.home || {
    eyebrow: company.name,
    title: "Architecture that holds the light.",
    copy: `${company.tagline}. Residences, gardens, and quiet interiors imagined for a slower kind of city living.`,
    image: "/images/hero-tower.jpg",
  };
  const heroLink = (value, fallback) =>
    value?.startsWith("/") && !value.startsWith("//") ? value : fallback;
  const intro = content?.homeIntro || pageContentDefaults.homeIntro;
  const introLink = intro.buttonUrl?.startsWith("/") && !intro.buttonUrl.startsWith("//")
    ? intro.buttonUrl : "/about";
  const highlights = content?.highlights || [];
  const projectsCopy = getPageCopy(content, "home", "projects");
  const testimonialsCopy = getPageCopy(content, "home", "testimonials");
  const contactCopy = getPageCopy(content, "home", "contact");

  const [featured, setFeatured] = useState([]);
  const [testimonialsList, setTestimonialsList] = useState([]);
  const [dataError, setDataError] = useState("");

  usePageMeta(
    "Home",
    `${company.name} — ${company.tagline}. Premium residential and mixed-use concept website.`
  );

  useEffect(() => {
    let active = true;

    async function loadData() {
      try {
        const [projRes, testRes] = await Promise.allSettled([
          fetchProjects("all"),
          fetchTestimonials(),
        ]);

        if (!active) return;

        if (projRes.status === "fulfilled" && projRes.value?.projects) {
          const all = projRes.value.projects;
          const feat = all.filter((p) => p.featured);
          setFeatured(feat.length > 0 ? feat.slice(0, 4) : all.slice(0, 4));
        } else {
          setDataError("Project content could not be loaded.");
        }

        if (testRes.status === "fulfilled" && testRes.value?.testimonials) {
          setTestimonialsList(testRes.value.testimonials);
        } else {
          setDataError((current) => current || "Some website content could not be loaded.");
        }
      } catch (error) {
        console.error("Homepage content request failed:", error);
        setDataError("Some website content could not be loaded.");
      }
    }

    loadData();

    return () => {
      active = false;
    };
  }, []);

  return (
    <>
      <PageSections page="home" placement="top" />
      {isSectionVisible(content, "home-hero") && <section className="relative isolate min-h-screen overflow-hidden bg-ink text-cream">
        <img
          src={getMediaUrl(hero.image || "/images/hero-tower.jpg")}
          alt="Concept architectural photograph of a luxury residential tower at golden hour"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ink/85 via-ink/45 to-ink/20" />
        <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col justify-end px-5 pb-20 pt-32 md:px-8">
          <p className="text-[0.72rem] uppercase tracking-[0.38em] text-gold">
            {hero.eyebrow || company.name}
          </p>
          <h1 className="mt-6 max-w-3xl font-display text-5xl leading-[0.95] md:text-7xl lg:text-8xl">
            {hero.title || "Architecture that holds the light."}
          </h1>
          <p className="mt-6 max-w-lg text-base leading-relaxed text-sand/85">
            {hero.copy || `${company.tagline}. Residences, gardens, and quiet interiors imagined for a slower kind of city living.`}
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              to={heroLink(hero.primaryButtonUrl, "/projects")}
              className="inline-flex items-center gap-2 bg-gold px-7 py-3 text-[0.68rem] uppercase tracking-[0.24em] text-ink"
            >
              {hero.primaryButtonLabel || "View projects"} <ArrowRight className="size-4" aria-hidden />
            </Link>
            <Link
              to={heroLink(hero.secondaryButtonUrl, "/about")}
              className="inline-flex items-center border border-cream/40 px-7 py-3 text-[0.68rem] uppercase tracking-[0.24em] text-cream hover:border-gold hover:text-gold"
            >
              {hero.secondaryButtonLabel || "Our story"}
            </Link>
          </div>
          <p className="mt-8 max-w-xl text-[0.7rem] leading-relaxed text-sand/55">
            {company.disclaimers?.visuals}
          </p>
        </div>
      </section>}
      {dataError && <p role="status" className="bg-sand/30 px-5 py-3 text-center text-xs text-stone">{dataError}</p>}

      {isSectionVisible(content, "home-intro") && <section className="mx-auto grid max-w-7xl gap-12 px-5 py-24 md:grid-cols-2 md:px-8">
        <Reveal>
          <img
            src={getMediaUrl(intro.image || "/images/lobby-interior.jpg")}
            alt={intro.imageAlt || ""}
            className="h-full min-h-[420px] w-full object-cover"
          />
        </Reveal>
        <Reveal delay={0.1} className="flex flex-col justify-center">
          <SectionHeading
            eyebrow={intro.eyebrow || `The house of ${company.shortName || "KKS"}`}
            title={intro.title || "Measured luxury, made to last."}
            copy={intro.copy || company.overview}
          />
          <Link
            to={introLink}
            className="mt-8 inline-flex w-fit items-center gap-2 text-[0.7rem] uppercase tracking-[0.24em] text-gold-deep"
          >
            {intro.buttonLabel || `About ${company.name}`} <ArrowRight className="size-4" />
          </Link>
        </Reveal>
      </section>}

      {isSectionVisible(content, "home-highlights") && highlights.length > 0 && (
        <section className="bg-ink text-cream">
          <div className="mx-auto grid max-w-7xl gap-8 px-5 py-20 md:grid-cols-4 md:px-8">
            {highlights.map((item) => (
              <Reveal key={item.label}>
                <p className="font-display text-5xl text-gold">{item.value}</p>
                <p className="mt-3 text-[0.72rem] uppercase tracking-[0.22em] text-sand/70">
                  {item.label}
                </p>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {isSectionVisible(content, "home-projects") && <section className="mx-auto max-w-7xl px-5 py-24 md:px-8">
        <div className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <SectionHeading
            eyebrow={projectsCopy.eyebrow}
            title={projectsCopy.title}
            copy={projectsCopy.copy}
          />
          <Link
            to={heroLink(projectsCopy.buttonUrl, "/projects")}
            className="text-[0.7rem] uppercase tracking-[0.24em] text-gold-deep"
          >
            {projectsCopy.buttonLabel}
          </Link>
        </div>
        {featured.length > 0 ? <div className="grid gap-6 md:grid-cols-2">
          {featured.map((project, index) => (
            <Reveal key={project.slug} delay={index * 0.05}>
              <ProjectCard project={project} />
            </Reveal>
          ))}
        </div> : <p className="border border-dashed border-sand p-8 text-center text-sm text-stone">No published projects are available yet.</p>}
      </section>}

      {isSectionVisible(content, "home-testimonials") && content?.pageVisibility?.testimonials !== false && testimonialsList.length > 0 && (
        <section className="relative overflow-hidden bg-ink py-24 text-cream">
          <img
            src={getMediaUrl(testimonialsCopy.image)}
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-25"
          />
          <div className="relative mx-auto max-w-7xl px-5 md:px-8">
            <SectionHeading
              eyebrow={testimonialsCopy.eyebrow}
              title={testimonialsCopy.title.replace("KKS", company.shortName || "KKS")}
              copy={testimonialsCopy.copy}
              light
            />
            <div className="mt-12 grid gap-8 md:grid-cols-3">
              {testimonialsList.slice(0, 3).map((item) => (
                <blockquote
                  key={item._id || item.id}
                  className="border border-gold/25 bg-ink/60 p-8 backdrop-blur-sm"
                >
                  <p className="font-display text-2xl leading-snug text-cream">"{item.quote}"</p>
                  <footer className="mt-6 text-sm text-gold">
                    {item.name}
                    <span className="mt-1 block text-sand/60">{item.role}</span>
                  </footer>
                </blockquote>
              ))}
            </div>
          </div>
        </section>
      )}

      {isSectionVisible(content, "home-contact") && <section className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 px-5 py-24 md:flex-row md:items-center md:px-8">
        <div>
          <p className="text-[0.68rem] uppercase tracking-[0.32em] text-gold-deep">{contactCopy.eyebrow}</p>
          <h2 className="mt-4 font-display text-4xl md:text-6xl">{contactCopy.title}</h2>
        </div>
        <Link
          to={heroLink(contactCopy.buttonUrl, "/contact")}
          className="inline-flex bg-ink px-8 py-4 text-[0.7rem] uppercase tracking-[0.24em] text-cream hover:bg-gold hover:text-ink"
        >
          {contactCopy.buttonLabel.replace("KKS Constructions", company.name)}
        </Link>
      </section>}
      <PageSections page="home" />
    </>
  );
}
