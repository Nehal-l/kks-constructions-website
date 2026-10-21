import { useEffect } from "react";
import { company } from "@data";

export function usePageMeta(title, description) {
  useEffect(() => {
    document.title = title ? `${title} · ${company.name}` : company.name;
    const meta = document.querySelector('meta[name="description"]');
    if (meta && description) {
      meta.setAttribute("content", description);
    }
  }, [title, description]);
}
