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
      <div className="relative mx-auto flex min-h-[58vh] max-w-7xl flex-col justify-end px-5 pb-16 pt-32 md:px-8">
        <p className="text-[0.68rem] uppercase tracking-[0.32em] text-gold">{eyebrow}</p>
        <h1 className="mt-4 max-w-3xl font-display text-5xl leading-tight md:text-7xl">{title}</h1>
        {copy ? <p className="mt-5 max-w-xl text-base text-sand/85">{copy}</p> : null}
      </div>
    </section>
  );
}
