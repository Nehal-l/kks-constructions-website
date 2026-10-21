import { Outlet } from "react-router-dom";
import Footer from "./Footer";
import Navbar from "./Navbar";
import { useSiteContent } from "../../context/ContentContext";

export default function Layout() {
  const { loading, error } = useSiteContent();
  return (
    <div className="min-h-screen bg-cream text-ink">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Navbar />
      {loading && <p className="sr-only" role="status">Loading website content.</p>}
      {error && <p className="border-b border-sand bg-sand/30 px-5 py-2 text-center text-xs text-stone" role="status">Some live website content could not be refreshed. Displaying available content.</p>}
      <main id="main">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
