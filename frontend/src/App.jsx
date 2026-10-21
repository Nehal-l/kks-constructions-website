import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/layout/Layout";
import ScrollToTop from "./components/layout/ScrollToTop";
import { AuthProvider } from "./context/AuthContext";
import { ContentProvider } from "./context/ContentContext";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import Privacy from "./pages/Privacy";
import ProjectDetails from "./pages/ProjectDetails";
import Projects from "./pages/Projects";
import Services from "./pages/Services";
import Testimonials from "./pages/Testimonials";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminLayout from "./pages/admin/AdminLayout";
import PageVisibility from "./components/PageVisibility";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ContentProvider>
          <ScrollToTop />
          <Routes>
            {/* Admin CMS Portal Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/*" element={<AdminLayout />} />

            {/* Public Website Routes */}
            <Route element={<Layout />}>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<PageVisibility page="about"><About /></PageVisibility>} />
              <Route path="/about-us" element={<Navigate to="/about" replace />} />
              <Route path="/projects" element={<PageVisibility page="projects"><Projects /></PageVisibility>} />
              <Route path="/projects/:slug" element={<PageVisibility page="projectDetails"><ProjectDetails /></PageVisibility>} />
              <Route path="/services" element={<PageVisibility page="services"><Services /></PageVisibility>} />
              <Route path="/testimonials" element={<PageVisibility page="testimonials"><Testimonials /></PageVisibility>} />
              <Route path="/contact" element={<PageVisibility page="contact"><Contact /></PageVisibility>} />
              <Route path="/privacy" element={<PageVisibility page="privacy"><Privacy /></PageVisibility>} />
              <Route path="/contact-us" element={<Navigate to="/contact" replace />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </ContentProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
