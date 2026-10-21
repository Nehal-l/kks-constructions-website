import { Link } from "react-router-dom";
import { company } from "@data";
import { usePageMeta } from "../hooks/usePageMeta";

export default function NotFound() {
  usePageMeta("Page not found", `The requested page was not found on the ${company.name} website.`);

  return (
    <section className="relative isolate flex min-h-screen items-end bg-ink px-5 pb-24 pt-32 text-cream md:px-8">
      <img src="/images/tower-night.jpg" alt="" className="absolute inset-0 h-full w-full object-cover opacity-50" />
      <div className="relative mx-auto w-full max-w-7xl">
        <p className="text-[0.68rem] uppercase tracking-[0.32em] text-gold">404</p>
        <h1 className="mt-4 font-display text-6xl md:text-8xl">This page has not been drawn.</h1>
        <p className="mt-6 max-w-lg text-sand/80">
          The address you followed is not part of the {company.name} website.
        </p>
        <Link
          to="/"
          className="mt-10 inline-flex border border-gold px-6 py-3 text-[0.68rem] uppercase tracking-[0.24em] text-gold hover:bg-gold hover:text-ink"
        >
          Return home
        </Link>
      </div>
    </section>
  );
}
