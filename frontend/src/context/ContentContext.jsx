import { createContext, useContext, useEffect, useState } from "react";
import { fetchSiteContent } from "../lib/api";
import { company as defaultCompany, pageContentDefaults, pageHeroDefaults } from "@data";

function mergeContentDefaults(defaults, stored) {
  if (Array.isArray(defaults)) return Array.isArray(stored) ? stored : defaults;
  if (!defaults || typeof defaults !== "object") return stored ?? defaults;
  if (!stored || typeof stored !== "object" || Array.isArray(stored)) return defaults;
  return Object.fromEntries(Object.keys({ ...defaults, ...stored }).map((key) => [
    key,
    key in defaults ? mergeContentDefaults(defaults[key], stored[key]) : stored[key],
  ]));
}

const ContentContext = createContext(null);

export function ContentProvider({ children }) {
  const [content, setContent] = useState({
    company: defaultCompany,
    values: defaultCompany.values || [],
    highlights: defaultCompany.highlights || [],
    pageHeroes: pageHeroDefaults,
    sections: [],
    pageCopy: pageContentDefaults.pageCopy,
    sectionVisibility: {},
    pageVisibility: {},
    navigationItems: [],
    standards: pageContentDefaults.standards || [],
    milestones: pageContentDefaults.milestones || [],
    faqs: pageContentDefaults.faqs || [],
    pressMentions: pageContentDefaults.pressMentions || [],
    homeIntro: pageContentDefaults.homeIntro,
    footer: {},
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function refreshContent(options) {
    let refreshed = false;
    try {
      const data = await fetchSiteContent(options);
      if (data?.ok && data.content) {
        const sc = data.content;
        setContent({
          company: mergeContentDefaults(defaultCompany, sc.company),
          values: Array.isArray(sc.company?.values) ? sc.company.values : (defaultCompany.values || []),
          highlights: Array.isArray(sc.company?.highlights) ? sc.company.highlights : (defaultCompany.highlights || []),
          pageHeroes: mergeContentDefaults(pageHeroDefaults, sc.pageHeroes),
          sections: Array.isArray(sc.sections) ? sc.sections : [],
          sectionVisibility: sc.sectionVisibility && typeof sc.sectionVisibility === "object" ? sc.sectionVisibility : {},
          pageVisibility: sc.pageVisibility && typeof sc.pageVisibility === "object" ? sc.pageVisibility : {},
          navigationItems: Array.isArray(sc.navigationItems) ? sc.navigationItems : [],
          standards: Array.isArray(sc.standards) ? sc.standards : (pageContentDefaults.standards || []),
          milestones: Array.isArray(sc.milestones) ? sc.milestones : (pageContentDefaults.milestones || []),
          faqs: Array.isArray(sc.faqs) ? sc.faqs : (pageContentDefaults.faqs || []),
          pressMentions: Array.isArray(sc.pressMentions) ? sc.pressMentions : (pageContentDefaults.pressMentions || []),
          homeIntro: {
            ...pageContentDefaults.homeIntro,
            ...(sc.homeIntro || {}),
          },
          pageCopy: mergeContentDefaults(pageContentDefaults.pageCopy, sc.pageCopy),
          footer: sc.footer || {},
        });
        setError("");
        refreshed = true;
      } else {
        setError("The website returned no published content.");
      }
    } catch (loadError) {
      // Graceful fallback to default content
      console.error("Live website content could not be refreshed:", loadError);
      setError(loadError.message || "Unable to load live website content.");
    } finally {
      setLoading(false);
    }
    return refreshed;
  }

  useEffect(() => {
    refreshContent();
  }, []);

  return (
    <ContentContext.Provider value={{ content, loading, error, refreshContent }}>
      {children}
    </ContentContext.Provider>
  );
}

export function useSiteContent() {
  const context = useContext(ContentContext);
  if (!context) {
    throw new Error("useSiteContent must be used within a ContentProvider");
  }
  return context;
}
