import { Navigate } from "react-router-dom";
import { useSiteContent } from "../context/ContentContext";

export default function PageVisibility({ page, children }) {
  const { content } = useSiteContent();
  if (content.pageVisibility?.[page] === false) return <Navigate to="/" replace />;
  return children;
}
