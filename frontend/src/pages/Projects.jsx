import { Search, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { statusLabels } from "@data";
import PageHero from "../components/PageHero";
import ProjectCard from "../components/ProjectCard";
import { fetchProjects } from "../lib/api";
import { usePageMeta } from "../hooks/usePageMeta";
import { useSiteContent } from "../context/ContentContext";
import PageSections from "../components/PageSections";
import { getPageCopy, isSectionVisible } from "../lib/content";

const statusFilters = ["all", "ongoing", "completed", "upcoming"];
const typologyFilters = ["all", "Residential", "Villas", "Mixed-use"];

export default function Projects() {
  const { content } = useSiteContent();
  const company = content?.company || {};
  const hero = content?.pageHeroes?.projects || {
    image: "/images/aerial-campus.jpg",
    eyebrow: "Projects",
    title: "A collection in stone, glass, and garden.",
    copy: "Filter by development status or typology, or search by landmark and name.",
  };
  const portfolioCopy = getPageCopy(content, "projects", "portfolio");
  const statusNames = {
    all: portfolioCopy.statusAllLabel,
    ongoing: portfolioCopy.statusOngoingLabel,
    completed: portfolioCopy.statusCompletedLabel,
    upcoming: portfolioCopy.statusUpcomingLabel,
  };
  const typeNames = {
    all: portfolioCopy.typeAllLabel,
    Residential: portfolioCopy.typeResidentialLabel,
    Villas: portfolioCopy.typeVillasLabel,
    "Mixed-use": portfolioCopy.typeMixedUseLabel,
  };

  const [params, setParams] = useSearchParams();
  const requestedStatus = params.get("status") || "all";
  const status = statusFilters.includes(requestedStatus) ? requestedStatus : "all";

  const requestedType = params.get("type") || "all";
  const type = typologyFilters.includes(requestedType) ? requestedType : "all";

  const [search, setSearch] = useState("");
  const [fetchedProjects, setFetchedProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  usePageMeta("Projects", `Ongoing, completed, and upcoming demonstration projects by ${company.name}.`);

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      try {
        const data = await fetchProjects(status);
        if (active) {
          setFetchedProjects(Array.isArray(data.projects) ? data.projects : []);
          setError("");
          setLoading(false);
        }
      } catch {
        if (active) {
          setFetchedProjects([]);
          setError("Live project data is unavailable. Please try again later.");
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      active = false;
    };
  }, [status]);

  function setStatus(next) {
    const nextParams = new URLSearchParams(params);
    if (next === "all") nextParams.delete("status");
    else nextParams.set("status", next);
    setParams(nextParams, { replace: true });
  }

  function setType(next) {
    const nextParams = new URLSearchParams(params);
    if (next === "all") nextParams.delete("type");
    else nextParams.set("type", next);
    setParams(nextParams, { replace: true });
  }

  const displayedProjects = useMemo(() => {
    return fetchedProjects.filter((project) => {
      const matchesType = type === "all" || project.type.toLowerCase() === type.toLowerCase();
      const query = search.trim().toLowerCase();
      const matchesSearch =
        !query ||
        project.name.toLowerCase().includes(query) ||
        project.location.toLowerCase().includes(query) ||
        project.headline.toLowerCase().includes(query) ||
        project.type.toLowerCase().includes(query);
      return matchesType && matchesSearch;
    });
  }, [fetchedProjects, type, search]);

  return (
    <>
      <PageSections page="projects" placement="top" />
      {isSectionVisible(content, "projects-hero") && <PageHero
        image={hero.image || "/images/aerial-campus.jpg"}
        eyebrow={hero.eyebrow || "Projects"}
        title={hero.title || "A collection in stone, glass, and garden."}
        copy={hero.copy || "Filter by development status or typology, or search by landmark and name."}
      />}
      {isSectionVisible(content, "projects-list") && <section className="mx-auto max-w-7xl px-5 py-16 md:px-8">
        <div className="mb-8">
          <p className="text-[0.68rem] uppercase tracking-[0.3em] text-gold-deep">{portfolioCopy.eyebrow}</p>
          <h2 className="mt-2 font-display text-3xl text-ink">{portfolioCopy.title}</h2>
        </div>
        {/* Controls: Filters + Search */}
        <div className="flex flex-col gap-6 border-b border-sand pb-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-6">
            {/* Status tabs */}
            <div>
              <p className="mb-2 text-[0.62rem] uppercase tracking-[0.26em] text-stone">{portfolioCopy.statusLabel}</p>
              <div className="flex flex-wrap gap-2" role="tablist" aria-label="Project status">
                {statusFilters.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setStatus(item)}
                    aria-pressed={status === item}
                    className={`border px-4 py-2 text-[0.65rem] uppercase tracking-[0.22em] transition ${
                      status === item
                        ? "border-ink bg-ink text-cream"
                        : "border-sand text-stone hover:border-gold hover:text-ink"
                    }`}
                  >
                    {statusNames[item]}
                  </button>
                ))}
              </div>
            </div>

            {/* Typology tabs */}
            <div>
              <p className="mb-2 text-[0.62rem] uppercase tracking-[0.26em] text-stone">{portfolioCopy.typeLabel}</p>
              <div className="flex flex-wrap gap-2" role="tablist" aria-label="Project typology">
                {typologyFilters.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setType(item)}
                    aria-pressed={type === item}
                    className={`border px-3.5 py-1.5 text-[0.62rem] uppercase tracking-[0.2em] transition ${
                      type === item
                        ? "border-gold bg-gold text-ink font-medium"
                        : "border-sand/70 text-stone hover:border-gold hover:text-ink"
                    }`}
                  >
                    {typeNames[item]}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Search bar */}
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-stone" aria-hidden />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={portfolioCopy.searchPlaceholder}
              className="w-full border border-sand bg-white/70 py-2.5 pl-9 pr-9 text-xs tracking-wider text-ink placeholder:text-stone/60 focus:border-gold focus:bg-white focus:outline-none"
            />
            {search ? (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone hover:text-ink"
                aria-label="Clear search"
              >
                <X className="size-3.5" />
              </button>
            ) : null}
          </div>
        </div>

        {/* Results status banner */}
        <div className="mt-6 flex items-center justify-between text-xs text-stone">
          <span>
            Showing <strong className="text-ink">{displayedProjects.length}</strong> {displayedProjects.length === 1 ? "residence" : "residences"}
            {status !== "all" && ` · ${statusLabels[status]}`}
            {type !== "all" && ` · ${type}`}
            {search && ` matching "${search}"`}
          </span>
          {loading ? (
            <span className="text-gold-deep animate-pulse" role="status">
              Updating list…
            </span>
          ) : null}
        </div>

        {error ? (
          <p className="mt-4 text-xs text-stone/80" role="status">
            {error}
          </p>
        ) : null}

        {/* Project Grid */}
        {displayedProjects.length === 0 ? (
          <div className="mt-16 border border-dashed border-sand p-12 text-center">
            <p className="font-display text-2xl text-ink">{portfolioCopy.emptyTitle}</p>
            <p className="mt-2 text-xs text-stone">{portfolioCopy.emptyCopy}</p>
            <button
              type="button"
              onClick={() => {
                setStatus("all");
                setType("all");
                setSearch("");
              }}
              className="mt-6 inline-flex border border-ink px-5 py-2 text-[0.65rem] uppercase tracking-[0.24em] text-ink hover:bg-ink hover:text-cream"
            >
              {portfolioCopy.resetLabel}
            </button>
          </div>
        ) : (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {displayedProjects.map((project) => (
              <ProjectCard key={project.slug} project={project} />
            ))}
          </div>
        )}
      </section>}
      <PageSections page="projects" />
    </>
  );
}
