export default function SectionHeading({ eyebrow, title, copy, light = false }) {
  return (
    <div className="max-w-2xl">
      {eyebrow ? (
        <p
          className={`text-[0.68rem] tracking-[0.32em] uppercase mb-4 ${
            light ? "text-gold" : "text-gold-deep"
          }`}
        >
          {eyebrow}
        </p>
      ) : null}
      <h2
        className={`font-display text-3xl sm:text-4xl md:text-5xl font-medium leading-tight ${
          light ? "text-cream" : "text-ink"
        }`}
      >
        {title}
      </h2>
      {copy ? (
        <p className={`mt-3 sm:mt-5 text-sm sm:text-base leading-relaxed font-light ${light ? "text-sand/80" : "text-stone"}`}>
          {copy}
        </p>
      ) : null}
    </div>
  );
}
