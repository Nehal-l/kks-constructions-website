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
    homeIntro: pageContentDefaults.homeIntro,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function refreshContent(options) {
    let refreshed = false;
    try {
      const data = await fetchSiteContent(options);
      if (data?.ok && data.content) {
        setContent((prev) => ({
          ...prev,
          ...data.content,
          sections: data.content.sections || [],
          sectionVisibility: {
            ...(prev.sectionVisibility || {}),
            ...(data.content.sectionVisibility || {}),
          },
          pageVisibility: {
            ...(prev.pageVisibility || {}),
            ...(data.content.pageVisibility || {}),
          },
          company: {
            ...prev.company,
            ...data.content.company,
            contact: {
              ...prev.company.contact,
              ...(data.content.company?.contact || {}),
            },
            social: {
              ...prev.company.social,
              ...(data.content.company?.social || {}),
            },
            disclaimers: {
              ...prev.company.disclaimers,
              ...(data.content.company?.disclaimers || {}),
            },
          },
          pageHeroes: {
            ...prev.pageHeroes,
            ...(data.content.pageHeroes || {}),
            home: {
              ...prev.pageHeroes?.home,
              ...(data.content.pageHeroes?.home || {}),
            },
          },
          homeIntro: {
            ...pageContentDefaults.homeIntro,
            ...(prev.homeIntro || {}),
            ...(data.content.homeIntro || {}),
          },
          pageCopy: mergeContentDefaults(pageContentDefaults.pageCopy, data.content.pageCopy),
        }));
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
