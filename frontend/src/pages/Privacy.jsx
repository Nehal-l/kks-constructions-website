import PageHero from "../components/PageHero";
import { usePageMeta } from "../hooks/usePageMeta";
import { useSiteContent } from "../context/ContentContext";
import PageSections from "../components/PageSections";
import { getPageCopy, isSectionVisible } from "../lib/content";

export default function Privacy() {
  const { content } = useSiteContent();
  const company = content?.company || {};
  const hero = content?.pageHeroes?.privacy || {};
  const privacyCopy = getPageCopy(content, "privacy", "body");

  usePageMeta("Privacy Policy", `Privacy policy and data handling for ${company.name}.`);

  return (
    <>
      <PageSections page="privacy" placement="top" />
      {isSectionVisible(content, "privacy-hero") && <PageHero
        image={hero.image || "/images/interior-kitchen.jpg"}
        eyebrow={hero.eyebrow || "Legal"}
        title={hero.title || "Privacy Policy"}
        copy={hero.copy || "Data stewardship and confidentiality principles for our private advisory clients."}
      />}
      {isSectionVisible(content, "privacy-content") && <article className="mx-auto max-w-3xl space-y-8 px-5 py-20 text-stone leading-relaxed md:px-8">
        <p>{company.name} {privacyCopy.paragraph1}</p>
        <p>{privacyCopy.paragraph2}</p>
        <p>{privacyCopy.paragraph3} {company.contact?.email}.</p>
        <p>{company.disclaimers?.legal}</p>
      </article>}
      <PageSections page="privacy" />
    </>
  );
}
