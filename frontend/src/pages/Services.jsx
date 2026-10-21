import PageHero from "../components/PageHero";
import PageSections from "../components/PageSections";
import { usePageMeta } from "../hooks/usePageMeta";
import { useSiteContent } from "../context/ContentContext";
import { isSectionVisible } from "../lib/content";

export default function Services() {
  const { content } = useSiteContent();
  const company = content?.company || {};
  const hero = content?.pageHeroes?.services || {};

  usePageMeta("Services", `Resident services from ${company.name || "KKS Constructions"}.`);

  return (
    <>
      <PageSections page="services" placement="top" />
      {isSectionVisible(content, "services-hero") && <PageHero
        image={hero.image || "/images/aerial-campus.jpg"}
        eyebrow={hero.eyebrow || "Our Services"}
        title={hero.title || "Services shaped around your home."}
        copy={hero.copy || "Explore the services available to our residents."}
      />}
      <PageSections page="services" />
    </>
  );
}