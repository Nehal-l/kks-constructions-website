import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useSiteContent } from "../context/ContentContext";
import { getPageCopy } from "../lib/content";
import { getMediaUrl } from "../lib/api";

export default function ProjectCard({ project }) {
  const { content } = useSiteContent();
  const portfolioCopy = getPageCopy(content, "projects", "portfolio");
  const statusLabels = {
    ongoing: portfolioCopy.statusOngoingLabel,
    completed: portfolioCopy.statusCompletedLabel,
    upcoming: portfolioCopy.statusUpcomingLabel,
  };
  return (
    <article className="group">
      <Link to={`/projects/${project.slug}`} className="block">
        <div className="relative overflow-hidden bg-ink aspect-[4/5] md:aspect-[5/6]">
          <img
            src={getMediaUrl(project.cover)}
            alt={`Concept view of ${project.name}`}
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/10 to-transparent" />
          <span className="absolute left-5 top-5 border border-gold/50 bg-ink/40 px-3 py-1 text-[0.62rem] uppercase tracking-[0.22em] text-cream backdrop-blur-sm">
            {statusLabels[project.status] || project.status}
          </span>
          <div className="absolute inset-x-0 bottom-0 p-5 md:p-6">
            <p className="text-[0.7rem] uppercase tracking-[0.22em] text-gold">
              {project.location}
            </p>
            <div className="mt-2 flex items-end justify-between gap-3">
              <h3 className="font-display text-2xl md:text-3xl text-cream leading-tight">
                {project.name}
              </h3>
              <ArrowUpRight
                className="mb-1 size-5 text-gold transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                aria-hidden
              />
            </div>
            <p className="mt-2 text-sm text-sand/80 line-clamp-2">{project.summary}</p>
          </div>
        </div>
      </Link>
    </article>
  );
}
