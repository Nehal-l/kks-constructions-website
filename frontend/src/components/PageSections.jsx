import { Link } from "react-router-dom";
import { useSiteContent } from "../context/ContentContext";
import { getMediaUrl } from "../lib/api";

const backgroundStyles = {
  cream: "bg-cream text-ink",
  sand: "bg-sand/30 text-ink",
  ink: "bg-ink text-cream",
};

function safeLink(value) {
  if (typeof value !== "string") return "";
  const link = value.trim();
  return link.startsWith("/") && !link.startsWith("//") ||
    /^https?:\/\//i.test(link) ? link : "";
}

function SectionBody({ section }) {
  const isDark = section.background === "ink";
  const textColor = isDark ? "text-sand/80" : "text-stone";
  const link = safeLink(section.buttonUrl);

  if (section.type === "image") {
    return (
      <div className="grid gap-8 md:grid-cols-2 md:items-center">
        {section.image && <img src={getMediaUrl(section.image)} alt={section.imageAlt || section.title} className="w-full object-cover" />}
        <div>
          {section.eyebrow && <p className="text-[0.68rem] uppercase tracking-[0.3em] text-gold-deep">{section.eyebrow}</p>}
          <h2 className="mt-2 font-display text-3xl md:text-4xl">{section.title}</h2>
          {section.body && <p className={`mt-4 whitespace-pre-line leading-relaxed ${textColor}`}>{section.body}</p>}
        </div>
      </div>
    );
  }

  if (section.type === "quote") {
    return (
      <blockquote className="mx-auto max-w-4xl border-l-2 border-gold pl-6 md:pl-10">
        {section.eyebrow && <p className="text-[0.68rem] uppercase tracking-[0.3em] text-gold">{section.eyebrow}</p>}
        <p className="mt-3 font-display text-3xl leading-snug md:text-4xl">{section.body || section.title}</p>
        {section.title && section.body && <cite className="mt-4 block text-xs not-italic text-gold">{section.title}</cite>}
      </blockquote>
    );
  }

  if (section.type === "gallery") {
    const images = (section.gallery || []).filter((image) => safeLink(image));
    return (
      <div>
        {section.eyebrow && <p className="text-[0.68rem] uppercase tracking-[0.3em] text-gold-deep">{section.eyebrow}</p>}
        {section.title && <h2 className="mt-2 font-display text-3xl md:text-4xl">{section.title}</h2>}
        {section.body && <p className={`mt-4 leading-relaxed ${textColor}`}>{section.body}</p>}
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {images.map((image) => <img key={image} src={getMediaUrl(image)} alt="" loading="lazy" className="aspect-[4/3] w-full object-cover" />)}
        </div>
      </div>
    );
  }

  if (section.type === "video") {
    return (
      <div>
        {section.title && <h2 className="mb-6 font-display text-3xl md:text-4xl">{section.title}</h2>}
        {safeLink(section.videoUrl) ? (
          <video className="max-h-[70vh] w-full bg-black" controls preload="metadata" src={section.videoUrl}>
            Your browser does not support video playback.
          </video>
        ) : (
          <p className="text-sm text-stone">Video URL is not available.</p>
        )}
      </div>
    );
  }

  return (
    <div className={section.type === "callout" ? "mx-auto max-w-4xl text-center" : "mx-auto max-w-4xl"}>
      {section.eyebrow && <p className={`text-[0.68rem] uppercase tracking-[0.3em] ${isDark ? "text-gold" : "text-gold-deep"}`}>{section.eyebrow}</p>}
      <h2 className="mt-2 font-display text-3xl md:text-4xl">{section.title}</h2>
      {section.body && <p className={`mt-4 whitespace-pre-line leading-relaxed ${textColor}`}>{section.body}</p>}
      {section.type === "cta" && link && (
        valueIsExternal(link) ? (
          <a href={link} className="mt-7 inline-flex bg-gold px-7 py-3 text-[0.68rem] uppercase tracking-[0.24em] text-ink">{section.buttonLabel || "Learn more"}</a>
        ) : (
          <Link to={link} className="mt-7 inline-flex bg-gold px-7 py-3 text-[0.68rem] uppercase tracking-[0.24em] text-ink">{section.buttonLabel || "Learn more"}</Link>
        )
      )}
    </div>
  );
}

function valueIsExternal(link) {
  return /^https?:\/\//i.test(link);
}

export function PageSectionPreview({ section }) {
  return (
    <div className={`px-6 py-10 md:px-10 ${backgroundStyles[section.background] || backgroundStyles.cream}`}>
      <SectionBody section={section} />
    </div>
  );
}

export default function PageSections({ page, placement = "bottom" }) {
  const { content } = useSiteContent();
  if (content.pageVisibility?.[page] === false) return null;
  const sections = (content.sections || [])
    .filter((section) => section.page === page && (section.placement || "bottom") === placement && section.enabled !== false && section.isPublished !== false)
    .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

  return sections.map((section) => (
    <section key={section.id} className={backgroundStyles[section.background] || backgroundStyles.cream}>
      <div className="mx-auto max-w-7xl px-5 py-16 md:px-8 md:py-20">
        <SectionBody section={section} />
      </div>
    </section>
  ));
}
