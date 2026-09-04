import { useEffect, useRef, useState } from "react";
import { useContent } from "../store/content";
import { CheckIcon, ChevronLeftIcon, ChevronRightIcon, StarIcon } from "./Icons";
import Reveal from "./Reveal";
import SectionHeading from "./SectionHeading";

export default function Reviews() {
  const { content } = useContent();
  const reviews = content.reviews.filter((r) => !r.hidden);

  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchX = useRef(0);

  const count = reviews.length;
  const safeIndex = count > 0 ? ((index % count) + count) % count : 0;
  const current = count > 0 ? reviews[safeIndex] : null;

  const avg = count > 0 ? (reviews.reduce((s, r) => s + r.rating, 0) / count).toFixed(1) : "0.0";
  const platforms = Array.from(new Set(reviews.map((r) => r.platform).filter(Boolean)));

  const go = (dir: 1 | -1) => setIndex((i) => (i + dir + count) % count);

  // Auto-rotate every 7 seconds (pauses on hover).
  useEffect(() => {
    if (paused || count <= 1) return;
    const t = window.setInterval(() => setIndex((i) => (i + 1) % count), 7000);
    return () => window.clearInterval(t);
  }, [paused, count]);

  return (
    <section id="reviews" className="relative overflow-hidden py-28">
      <div
        aria-hidden="true"
        className="absolute -left-32 top-24 h-80 w-80 rounded-full bg-accent/[0.04] blur-[120px]"
      />

      <div className="relative mx-auto w-full max-w-6xl px-6 md:px-10">
        <SectionHeading
          watermark="REVIEWS"
          title="Reviews"
          subtitle="What clients say after working with me."
        />

        {/* Rating strip */}
        <Reveal className="mb-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
          <span className="flex items-center gap-2.5">
            <span className="font-display text-3xl font-extrabold text-accent">{avg}</span>
            <span className="flex">
              {[1, 2, 3, 4, 5].map((n) => (
                <StarIcon
                  key={n}
                  className={`h-4 w-4 ${n <= Math.round(Number(avg)) ? "text-accent" : "text-gray-700"}`}
                />
              ))}
            </span>
          </span>
          <span className="text-sm text-gray-400">
            Based on <span className="font-semibold text-white">{count}</span> client reviews
          </span>
          <span className="flex flex-wrap justify-center gap-2">
            {platforms.map((p) => (
              <span
                key={p}
                className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-gray-300"
              >
                {p}
              </span>
            ))}
          </span>
        </Reveal>

        {current ? (
          <Reveal>
            <div
              className="relative mx-auto max-w-3xl"
              onMouseEnter={() => setPaused(true)}
              onMouseLeave={() => setPaused(false)}
              onTouchStart={(e) => {
                touchX.current = e.touches[0].clientX;
              }}
              onTouchEnd={(e) => {
                const dx = e.changedTouches[0].clientX - touchX.current;
                if (Math.abs(dx) > 48) go(dx < 0 ? 1 : -1);
              }}
            >
              {/* Side arrows */}
              <button
                type="button"
                onClick={() => go(-1)}
                aria-label="Previous review"
                className="absolute -left-4 top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black text-white transition-all duration-300 hover:scale-110 hover:border-accent hover:text-accent sm:-left-16 sm:flex"
              >
                <ChevronLeftIcon className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => go(1)}
                aria-label="Next review"
                className="absolute -right-4 top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black text-white transition-all duration-300 hover:scale-110 hover:border-accent hover:text-accent sm:-right-16 sm:flex"
              >
                <ChevronRightIcon className="h-5 w-5" />
              </button>

              {/* The single review card */}
              <div className="relative overflow-hidden rounded-xl border border-white/10 bg-white/[0.02]">
                <span
                  aria-hidden="true"
                  className="absolute -top-5 right-5 font-display text-[8rem] font-extrabold leading-none text-accent/[0.07]"
                >
                  &rdquo;
                </span>

                <div key={safeIndex} className="grid animate-fade-up md:grid-cols-[220px_1fr]">
                  {/* Client photo */}
                  <div className="relative border-b border-white/10 bg-neutral-900 md:border-b-0 md:border-r">
                    {current.photo ? (
                      <img
                        src={current.photo}
                        alt={current.name}
                        loading="lazy"
                        className="h-52 w-full object-cover md:h-full"
                      />
                    ) : (
                      <div className="flex h-52 w-full items-center justify-center md:h-full">
                        <span className="font-display text-4xl font-extrabold text-accent/40">
                          {current.name
                            .split(" ")
                            .filter(Boolean)
                            .map((w) => w[0])
                            .slice(0, 2)
                            .join("")
                            .toUpperCase()}
                        </span>
                      </div>
                    )}
                    <span className="absolute bottom-3 left-1/2 w-max -translate-x-1/2 rounded-full border border-accent/50 bg-black/85 px-3.5 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-accent backdrop-blur-sm">
                      {current.platform}
                    </span>
                  </div>

                  {/* Review body */}
                  <div className="flex flex-col p-7 sm:p-9">
                    <div className="flex items-center gap-2.5">
                      <span className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <StarIcon
                            key={n}
                            className={`h-5 w-5 ${
                              n <= current.rating ? "text-accent" : "text-gray-700"
                            }`}
                          />
                        ))}
                      </span>
                      <span className="font-display text-sm font-bold text-accent">
                        {current.rating}.0
                      </span>
                    </div>

                    <blockquote className="mt-5 grow text-base leading-relaxed text-gray-300 sm:text-lg">
                      &ldquo;{current.text}&rdquo;
                    </blockquote>

                    <div className="mt-7 flex items-end justify-between gap-4 border-t border-white/5 pt-5">
                      <div>
                        <p className="font-display font-bold text-white">{current.name}</p>
                        <p className="mt-0.5 text-xs text-gray-500">{current.role}</p>
                      </div>
                      <div className="text-right">
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent/5 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-accent">
                          <CheckIcon className="h-3 w-3" />
                          Verified
                        </span>
                        <p className="mt-2 text-[11px] text-gray-600">{current.when}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Dots + counter */}
              <div className="mt-7 flex items-center justify-center gap-2.5">
                {reviews.map((r, i) => (
                  <button
                    key={r.id ?? i}
                    type="button"
                    aria-label={`Go to review ${i + 1}`}
                    onClick={() => setIndex(i)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      i === safeIndex ? "w-8 bg-accent" : "w-2 bg-gray-700 hover:bg-gray-500"
                    }`}
                  />
                ))}
                <span className="ml-3 font-display text-xs font-semibold tracking-[0.3em] text-gray-500">
                  {String(safeIndex + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
                </span>
              </div>
            </div>
          </Reveal>
        ) : (
          <p className="text-center text-sm text-gray-500">
            No reviews yet. Add them from the admin panel.
          </p>
        )}
      </div>
    </section>
  );
}
