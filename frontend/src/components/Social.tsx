import { useEffect, useRef, useState } from "react";
import { useContent } from "../store/content";
import type { Testimonial } from "../data";
import { CheckIcon, ChevronLeftIcon, ChevronRightIcon, PlayIcon, StarIcon } from "./Icons";
import { Reveal, SectionHeading } from "./ui";

export function Reviews() {
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

  useEffect(() => {
    if (paused || count <= 1) return;
    const t = window.setInterval(() => setIndex((i) => (i + 1) % count), 7000);
    return () => window.clearInterval(t);
  }, [paused, count]);

  return (
    <section id="reviews" className="relative overflow-hidden py-28">
      <div aria-hidden="true" className="absolute -left-32 top-24 h-80 w-80 rounded-full bg-accent/[0.04] blur-[120px]" />

      <div className="relative mx-auto w-full max-w-6xl px-6 md:px-10">
        <SectionHeading watermark="REVIEWS" title="Reviews" subtitle="What clients say after working with me." />

        <Reveal className="mb-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
          <span className="flex items-center gap-2.5">
            <span className="font-display text-3xl font-extrabold text-accent">{avg}</span>
            <span className="flex">
              {[1, 2, 3, 4, 5].map((n) => (
                <StarIcon key={n} className={`h-4 w-4 ${n <= Math.round(Number(avg)) ? "text-accent" : "text-gray-700"}`} />
              ))}
            </span>
          </span>
          <span className="text-sm text-gray-400">
            Based on <span className="font-semibold text-white">{count}</span> client reviews
          </span>
          <span className="flex flex-wrap justify-center gap-2">
            {platforms.map((p) => (
              <span key={p} className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-gray-300">
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

              <div className="relative overflow-hidden rounded-xl border border-white/10 bg-white/[0.02]">
                <span aria-hidden="true" className="absolute -top-5 right-5 font-display text-[8rem] font-extrabold leading-none text-accent/[0.07]">
                  &rdquo;
                </span>

                <div key={safeIndex} className="grid animate-fade-up md:grid-cols-[220px_1fr]">
                  <div className="relative border-b border-white/10 bg-neutral-900 md:border-b-0 md:border-r">
                    {current.photo ? (
                      <img src={current.photo} alt={current.name} loading="lazy" className="h-52 w-full object-cover md:h-full" />
                    ) : (
                      <div className="flex h-52 w-full items-center justify-center md:h-full">
                        <span className="font-display text-4xl font-extrabold text-accent/40">{current.initials}</span>
                      </div>
                    )}
                    <span className="absolute bottom-3 left-1/2 w-max -translate-x-1/2 rounded-full border border-accent/50 bg-black/85 px-3.5 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-accent backdrop-blur-sm">
                      {current.platform}
                    </span>
                  </div>

                  <div className="flex flex-col p-7 sm:p-9">
                    <div className="flex items-center gap-2.5">
                      <span className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <StarIcon key={n} className={`h-5 w-5 ${n <= current.rating ? "text-accent" : "text-gray-700"}`} />
                        ))}
                      </span>
                      <span className="font-display text-sm font-bold text-accent">{current.rating}.0</span>
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
          <p className="text-center text-sm text-gray-500">No reviews yet. Add them from the admin panel.</p>
        )}
      </div>
    </section>
  );
}

function videoEmbed(url: string): { type: "iframe" | "video"; src: string } | null {
  if (!url) return null;
  const yt = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{6,})/);
  if (yt) return { type: "iframe", src: `https://www.youtube.com/embed/${yt[1]}` };
  const vm = url.match(/vimeo\.com\/(\d+)/);
  if (vm) return { type: "iframe", src: `https://player.vimeo.com/video/${vm[1]}` };
  return { type: "video", src: url };
}

function TestimonialCard({ testimonial, index }: { testimonial: Testimonial; index: number }) {
  const [playing, setPlaying] = useState(false);
  const embed = videoEmbed(testimonial.video);

  return (
    <Reveal delay={index * 120} className="h-full">
      <article className="group flex h-full flex-col overflow-hidden rounded-xl border border-white/10 bg-white/[0.02] transition-all duration-300 hover:-translate-y-1.5 hover:border-accent/40 hover:shadow-[0_22px_60px_rgba(255,193,7,0.1)]">
        <div className="relative aspect-video overflow-hidden border-b border-white/10 bg-[radial-gradient(circle_at_30%_20%,#262626,#0a0a0a_75%)]">
          {!playing || !embed ? (
            <button
              type="button"
              onClick={() => embed && setPlaying(true)}
              disabled={!embed}
              aria-label={`Play video testimonial from ${testimonial.name}`}
              className="absolute inset-0 w-full cursor-pointer disabled:cursor-default"
            >
              <span aria-hidden="true" className="absolute left-4 top-3 font-display text-6xl font-extrabold leading-none text-white/[0.06] transition-colors duration-300 group-hover:text-accent/[0.09]">
                {testimonial.initials}
              </span>
              <span className="absolute inset-0 flex items-center justify-center">
                <span
                  className={`flex h-16 w-16 items-center justify-center rounded-full pl-1 transition-transform duration-300 ${
                    embed ? "bg-accent text-black shadow-[0_0_45px_rgba(255,193,7,0.45)] group-hover:scale-110" : "border border-white/20 text-gray-500"
                  }`}
                >
                  <PlayIcon className="h-7 w-7" />
                </span>
              </span>
              <span className="absolute bottom-3 left-3 rounded-md bg-black/80 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-accent backdrop-blur-sm">
                Video Testimonial
              </span>
              <span className="absolute bottom-3 right-3 flex items-center gap-1 rounded-md bg-black/80 px-2.5 py-1 text-[10px] font-semibold tracking-wider text-white/80 backdrop-blur-sm">
                <PlayIcon className="h-2.5 w-2.5 text-accent" />
                {testimonial.duration}
              </span>
            </button>
          ) : embed.type === "iframe" ? (
            <iframe
              src={`${embed.src}?autoplay=1`}
              title={`Video testimonial from ${testimonial.name}`}
              className="h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <video src={embed.src} controls autoPlay playsInline className="h-full w-full object-cover">
              Your browser does not support the video tag.
            </video>
          )}
        </div>

        <div className="flex grow flex-col p-6">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <StarIcon key={n} className={`h-4 w-4 ${n <= testimonial.rating ? "text-accent" : "text-gray-700"}`} />
              ))}
            </span>
            <span className="font-display text-xs font-bold text-accent">{testimonial.rating}.0</span>
          </div>

          <blockquote className="mt-4 text-sm italic leading-relaxed text-gray-400">&ldquo;{testimonial.quote}&rdquo;</blockquote>

          <div className="mt-auto flex items-end justify-between gap-3 border-t border-white/5 pt-5">
            <div className="mt-5 min-w-0">
              <p className="truncate font-display text-sm font-bold text-white">{testimonial.name}</p>
              <p className="mt-0.5 truncate text-xs text-gray-500">{testimonial.role}</p>
              <p className="mt-1 truncate text-[11px] font-semibold uppercase tracking-wider text-accent/80">{testimonial.project}</p>
            </div>
            <span className="flex shrink-0 items-center gap-1 rounded-full border border-accent/30 bg-accent/5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-accent">
              <CheckIcon className="h-3 w-3" />
              Verified
            </span>
          </div>
        </div>
      </article>
    </Reveal>
  );
}

export function Testimonials() {
  const { content } = useContent();
  const testimonials = content.testimonials.filter((t) => !t.hidden);

  return (
    <section id="testimonials" className="relative overflow-hidden py-28">
      <div aria-hidden="true" className="absolute -right-32 top-32 h-80 w-80 rounded-full bg-accent/[0.04] blur-[120px]" />

      <div className="relative mx-auto w-full max-w-7xl px-6 md:px-10 lg:px-16">
        <SectionHeading
          watermark="TESTIMONIALS"
          title="Testimonials"
          subtitle="Watch real clients talk about their experience working with me."
        />

        {testimonials.length > 0 ? (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {testimonials.map((testimonial, i) => (
              <TestimonialCard key={testimonial.id ?? i} testimonial={testimonial} index={i} />
            ))}
          </div>
        ) : (
          <p className="text-center text-sm text-gray-500">No testimonials yet. Add them from the admin panel.</p>
        )}
      </div>
    </section>
  );
}
