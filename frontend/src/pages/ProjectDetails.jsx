import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  FileText,
  MapPin,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { statusLabels } from "@data";
import DirectContactSection from "../components/DirectContactSection";
import { fetchProject, getMediaUrl } from "../lib/api";
import { usePageMeta } from "../hooks/usePageMeta";
import { useSiteContent } from "../context/ContentContext";
import PageSections from "../components/PageSections";
import { getPageCopy, isSectionVisible } from "../lib/content";

export default function ProjectDetails() {
  const { content } = useSiteContent();
  const company = content?.company || {};
  const { slug } = useParams();
  const overviewCopy = getPageCopy(content, "projectDetails", "overview");
  const videosCopy = getPageCopy(content, "projectDetails", "videos");
  const amenitiesCopy = getPageCopy(content, "projectDetails", "amenities");
  const locationCopy = getPageCopy(content, "projectDetails", "location");
  const enquiryCopy = getPageCopy(content, "projectDetails", "enquiry");
  const [project, setProject] = useState(null);
  const [active, setActive] = useState("");
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [brochureRequested, setBrochureRequested] = useState(false);

  usePageMeta(
    project?.name || "Project",
    project
      ? `${project.name} — ${project.headline} Concept project page for ${company.name}.`
      : `Project details · ${company.name}`,
  );

  useEffect(() => {
    let activeRequest = true;

    async function load() {
      try {
        const data = await fetchProject(slug);
        if (!activeRequest) return;
        if (data?.project) {
          setProject(data.project);
          setActive(data.project.gallery?.[0] || "");
          setError("");
        } else {
          setProject(null);
        }
      } catch (requestError) {
        if (!activeRequest) return;
        console.error("Project details could not be loaded:", requestError);
        setError("This project could not be loaded.");
      } finally {
        if (activeRequest) setLoading(false);
      }
    }

    load();

    return () => {
      activeRequest = false;
    };
  }, [slug]);

  // Handle keyboard navigation for lightbox
  useEffect(() => {
    if (!lightboxOpen || !project) return;
    const onKey = (e) => {
      if (e.key === "Escape") setLightboxOpen(false);
      if (e.key === "ArrowRight") {
        setLightboxIndex((curr) => (curr + 1) % project.gallery.length);
      }
      if (e.key === "ArrowLeft") {
        setLightboxIndex((curr) => (curr - 1 + project.gallery.length) % project.gallery.length);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxOpen, project]);

  function openLightbox(index) {
    setLightboxIndex(index);
    setLightboxOpen(true);
  }

  function nextImage() {
    if (!project) return;
    setLightboxIndex((curr) => (curr + 1) % project.gallery.length);
  }

  function prevImage() {
    if (!project) return;
    setLightboxIndex((curr) => (curr - 1 + project.gallery.length) % project.gallery.length);
  }

  if (loading && !project) {
    return (
      <section className="px-5 py-40 text-center text-stone">
        <p className="animate-pulse">Loading residence details…</p>
      </section>
    );
  }

  if (!project) {
    return (
      <section className="px-5 py-40 text-center">
        <h1 className="font-display text-4xl">Residence not found</h1>
        <p className="mt-4 text-stone">{error || "This address is not in the demonstration collection."}</p>
        <Link
          to="/projects"
          className="mt-8 inline-flex items-center gap-2 border border-ink px-6 py-3 text-[0.68rem] uppercase tracking-[0.24em] text-ink hover:bg-ink hover:text-cream"
        >
          <ArrowLeft className="size-4" /> Back to projects
        </Link>
      </section>
    );
  }

  return (
    <>
      <PageSections page="projectDetails" placement="top" />
      {/* Hero Header */}
      {isSectionVisible(content, "project-detail-hero") && <section className="relative isolate min-h-[75vh] bg-ink text-cream">
        <img
          src={getMediaUrl(project.cover)}
          alt={`Concept banner for ${project.name}`}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/60 to-ink/30" />
        <div className="relative mx-auto flex min-h-[75vh] max-w-7xl flex-col justify-end px-5 pb-16 pt-32 md:px-8">
          <Link
            to="/projects"
            className="mb-8 inline-flex items-center gap-2 text-[0.65rem] uppercase tracking-[0.26em] text-gold hover:text-cream transition w-fit"
          >
            <ArrowLeft className="size-3.5" /> {enquiryCopy.backLabel}
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <span className="border border-gold/50 bg-ink/40 px-3 py-1 text-[0.62rem] uppercase tracking-[0.24em] text-cream backdrop-blur-sm">
              {{ ongoing: getPageCopy(content, "projects", "portfolio").statusOngoingLabel, completed: getPageCopy(content, "projects", "portfolio").statusCompletedLabel, upcoming: getPageCopy(content, "projects", "portfolio").statusUpcomingLabel }[project.status] || statusLabels[project.status]}
            </span>
            <span className="text-[0.68rem] uppercase tracking-[0.24em] text-gold">
              {project.type} · {project.location}
            </span>
          </div>
          <h1 className="mt-4 font-display text-5xl md:text-7xl lg:text-8xl leading-none">
            {project.name}
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-sand/85 leading-relaxed font-light">
            {project.headline}
          </p>

          {/* Quick Actions */}
          <div className="mt-8 flex flex-wrap gap-4">
            <a
              href="#contact-section"
              className="inline-flex items-center gap-2 bg-gold px-7 py-3 text-[0.68rem] uppercase tracking-[0.24em] text-ink transition hover:bg-gold-deep hover:text-cream"
            >
              Contact Us
            </a>
            {project.brochure && (/^https?:\/\//i.test(project.brochure) || (project.brochure.startsWith("/") && !project.brochure.startsWith("//"))) ? (
              <a href={project.brochure} target="_blank" rel="noreferrer" download className="inline-flex items-center gap-2 border border-cream/40 px-6 py-3 text-[0.68rem] uppercase tracking-[0.24em] text-cream hover:border-gold hover:text-gold transition">
                <Download className="size-3.5" /> {enquiryCopy.brochureLabel}
              </a>
            ) : (
              <button type="button" onClick={() => setBrochureRequested(true)} className="inline-flex items-center gap-2 border border-cream/40 px-6 py-3 text-[0.68rem] uppercase tracking-[0.24em] text-cream hover:border-gold hover:text-gold transition">
                <Download className="size-3.5" />
                {brochureRequested ? enquiryCopy.brochureReadyLabel : enquiryCopy.brochureRequestLabel}
              </button>
            )}
          </div>
        </div>
      </section>}

      {/* Brochure notification alert if clicked */}
      {brochureRequested && (
        <aside aria-label="Brochure details" className="border-b border-gold/30 bg-gold/10 px-5 py-4 text-center text-xs text-ink">
          <span>
            Digital portfolio prepared. For any enquiries or floor plans, please contact us directly through phone, WhatsApp, or Instagram.
          </span>
        </aside>
      )}

      {isSectionVisible(content, "project-detail-content") && <>
      {/* Main Showcase: Gallery & Overview Specs */}
      <section className="mx-auto grid max-w-7xl gap-12 px-5 py-20 lg:grid-cols-[1.3fr_0.9fr] md:px-8">
        <div>
          {/* Active Featured Image with Expand Trigger */}
          <div className="group relative overflow-hidden bg-ink cursor-pointer" onClick={() => openLightbox(project.gallery.indexOf(active))}>
            <img
              src={getMediaUrl(active)}
              alt={`Gallery view of ${project.name}`}
              className="aspect-[16/10] w-full object-cover transition-transform duration-500 group-hover:scale-102"
            />
            <div className="absolute inset-0 bg-ink/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="flex items-center gap-2 bg-ink/80 px-4 py-2 text-xs uppercase tracking-widest text-cream backdrop-blur-sm">
                <Eye className="size-4 text-gold" /> {enquiryCopy.expandLabel}
              </span>
            </div>
          </div>

          {/* Thumbnails */}
          <div className="mt-3 grid grid-cols-5 gap-2">
            {project.gallery.map((image, idx) => (
              <button
                key={image}
                type="button"
                onClick={() => {
                  setActive(image);
                }}
                className={`overflow-hidden border transition ${
                  active === image ? "border-gold ring-1 ring-gold" : "border-transparent opacity-75 hover:opacity-100"
                }`}
                aria-label={`Thumbnail ${idx + 1}`}
              >
                <img src={getMediaUrl(image)} alt="" className="aspect-square w-full object-cover" />
              </button>
            ))}
          </div>
          <p className="mt-4 text-xs text-stone">{company.disclaimers.visuals}</p>
        </div>

        {/* Overview & Specs Column */}
        <aside className="flex flex-col justify-between">
          <div>
            <p className="text-[0.68rem] uppercase tracking-[0.24em] text-gold-deep">
              {project.location}
            </p>
            <h2 className="mt-3 font-display text-4xl">{overviewCopy.title}</h2>
            <p className="mt-5 leading-relaxed text-stone text-base">{project.overview}</p>
            {project.price && <p className="mt-5 text-sm"><span className="text-stone">{overviewCopy.priceLabel}: </span><strong className="text-ink">{project.price}</strong></p>}

            <dl className="mt-8 divide-y divide-sand/70 border-t border-b border-sand/70">
              {project.specs.map((spec) => (
                <div key={spec.label} className="flex justify-between py-3.5 text-sm">
                  <dt className="text-stone">{spec.label}</dt>
                  <dd className="font-medium text-ink">{spec.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="mt-8 border border-sand bg-white/60 p-6">
            <div className="flex items-start gap-4">
              <FileText className="size-6 text-gold-deep shrink-0 mt-0.5" />
              <div>
                <h4 className="font-display text-xl text-ink">{overviewCopy.specsTitle}</h4>
                <p className="mt-1 text-xs text-stone leading-relaxed">{overviewCopy.specsCopy}</p>
              </div>
            </div>
          </div>
        </aside>
      </section>

      {project.videos?.length > 0 && (
        <section className="mx-auto max-w-7xl px-5 py-16 md:px-8">
          <h2 className="font-display text-4xl">{videosCopy.title}</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {project.videos.map((url) => /^https?:\/\//i.test(url) || (url.startsWith("/") && !url.startsWith("//")) ? (
              <video key={url} controls preload="metadata" src={url} className="w-full bg-ink">Your browser does not support video playback.</video>
            ) : null)}
          </div>
        </section>
      )}

      {/* Amenities Section */}
      <section className="bg-sand/35 py-20">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <p className="text-[0.68rem] uppercase tracking-[0.3em] text-gold-deep">{amenitiesCopy.eyebrow}</p>
          <h2 className="mt-2 font-display text-4xl">{amenitiesCopy.title}</h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {project.amenities.map((item) => (
              <div
                key={item}
                className="border border-sand bg-cream p-5 text-sm transition hover:border-gold hover:shadow-sm"
              >
                <span className="block text-[0.62rem] uppercase tracking-[0.22em] text-gold-deep mb-1">
                  {amenitiesCopy.itemLabel}
                </span>
                <span className="font-medium text-ink">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Location & Enquiry Form */}
      <section id="contact-section" className="mx-auto grid max-w-7xl gap-16 px-5 py-24 md:grid-cols-2 md:px-8">
        <div>
          <p className="text-[0.68rem] uppercase tracking-[0.3em] text-gold-deep">{locationCopy.eyebrow}</p>
          <h2 className="mt-2 font-display text-4xl">{locationCopy.title}</h2>
          <p className="mt-5 leading-relaxed text-stone text-base">{project.locationNotes}</p>

          <div className="mt-8 border border-sand bg-white/60 p-6 space-y-4">
            <div className="flex items-start gap-3">
              <MapPin className="size-5 text-gold-deep shrink-0 mt-0.5" />
              <div>
                <p className="text-xs uppercase tracking-widest text-ink font-medium">{overviewCopy.mapLabel}</p>
                <p className="mt-1 text-xs text-stone">{project.location}</p>
                <p className="mt-2 text-xs text-stone/80">{company.contact.mapNote}</p>
              </div>
            </div>
          </div>

          <div className="mt-6 border-l-2 border-gold pl-5 py-2">
            <p className="text-xs text-stone italic">
              {locationCopy.callout}
            </p>
          </div>
        </div>

        <div>
          <DirectContactSection title={`Inquire About ${project.name}`} />
        </div>
      </section>
      </>}
      <PageSections page="projectDetails" />

      {/* Full Screen Lightbox Modal */}
      {lightboxOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-4"
        >
          <button
            type="button"
            onClick={() => setLightboxOpen(false)}
            className="absolute top-6 right-6 text-cream/80 hover:text-gold p-2 transition"
            aria-label="Close fullscreen gallery"
          >
            <X className="size-7" />
          </button>

          <button
            type="button"
            onClick={prevImage}
            className="absolute left-6 text-cream/80 hover:text-gold p-3 transition"
            aria-label="Previous photograph"
          >
            <ChevronLeft className="size-8" />
          </button>

          <button
            type="button"
            onClick={nextImage}
            className="absolute right-6 text-cream/80 hover:text-gold p-3 transition"
            aria-label="Next photograph"
          >
            <ChevronRight className="size-8" />
          </button>

          <div className="max-h-[85vh] max-w-[90vw] flex flex-col items-center">
            <img
              src={getMediaUrl(project.gallery[lightboxIndex])}
              alt={`Fullscreen visual ${lightboxIndex + 1} of ${project.name}`}
              className="max-h-[75vh] w-auto max-w-full object-contain border border-gold/30 shadow-2xl"
            />
            <div className="mt-4 flex items-center gap-4 text-xs text-sand/70 tracking-widest uppercase">
              <span>{project.name}</span>
              <span>·</span>
              <span>
                {lightboxIndex + 1} of {project.gallery.length}
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
