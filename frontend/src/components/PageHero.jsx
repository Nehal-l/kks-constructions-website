import { getMediaUrl } from "../lib/api";

export default function PageHero({ image, eyebrow, title, copy }) {
  return (
    <section className="relative isolate min-h-[58vh] overflow-hidden bg-ink text-cream">
      <img
        src={getMediaUrl(image)}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-ink/60" />
      <div className="relative mx-auto flex min-h-[58vh] max-w-7xl flex-col justify-end px-5 pb-12 sm:pb-16 pt-28 sm:pt-32 md:px-8">
        <p className="text-[0.68rem] uppercase tracking-[0.32em] text-gold font-medium">{eyebrow}</p>
        <h1 className="mt-3 sm:mt-4 max-w-3xl font-display text-3xl sm:text-5xl md:text-7xl leading-tight font-normal">{title}</h1>
        {copy ? <p className="mt-4 sm:mt-5 max-w-xl text-sm sm:text-base text-sand/85 font-light leading-relaxed">{copy}</p> : null}
      </div>
    </section>
  );
}
