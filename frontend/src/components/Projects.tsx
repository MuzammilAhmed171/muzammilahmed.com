import { useCallback, useEffect, useState, type TouchEvent } from "react";
import { useContent } from "../store/content";
import type { Project } from "../data";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  CloseIcon,
  ExpandIcon,
  ExternalLinkIcon,
  StarIcon,
} from "./Icons";
import { Reveal, SectionHeading, SmartImage } from "./ui";

function gridClassFor(count: number) {
  if (count <= 1) return "";
  if (count === 2) return "md:grid-cols-2";
  return "md:grid-cols-2 lg:grid-cols-3";
}

function ProjectCard({
  project,
  index,
  onOpen,
  spotlight = false,
}: {
  project: Project;
  index: number;
  onOpen: (p: Project) => void;
  spotlight?: boolean;
}) {
  return (
    <Reveal delay={index * 120} className="h-full">
      <article
        className={`group relative flex h-full flex-col overflow-hidden rounded-lg border bg-white/[0.02] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_22px_60px_rgba(255,193,7,0.12)] ${
          project.featured ? "border-accent/30 hover:border-accent/60" : "border-white/10 hover:border-accent/40"
        } ${spotlight ? "md:flex-row" : ""}`}
      >
        {project.featured ? (
          <span className="absolute left-4 top-4 z-20 inline-flex items-center gap-1.5 rounded-full border border-accent/60 bg-black/85 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-accent backdrop-blur-sm">
            <StarIcon className="h-3 w-3" />
            Top Project
          </span>
        ) : null}

        <button
          type="button"
          onClick={() => onOpen(project)}
          aria-label={`Open screenshot slider for ${project.title}`}
          className={`relative block w-full cursor-pointer overflow-hidden text-left focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent ${
            spotlight ? "shrink-0 md:w-[54%]" : ""
          }`}
        >
          <SmartImage
            src={project.gallery[0]}
            alt={`${project.title} website screenshot`}
            label={project.title}
            className={spotlight ? "aspect-[16/10] w-full md:aspect-auto md:h-full" : "aspect-[3/2] w-full"}
            imgClassName="transition-transform duration-700 ease-out group-hover:scale-110"
          />
          <span className="absolute inset-0 flex items-center justify-center bg-black/55 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <span className="flex h-14 w-14 items-center justify-center rounded-full border border-accent bg-black/70 text-accent transition-transform duration-300 group-hover:scale-110">
              <ExpandIcon className="h-5 w-5" />
            </span>
          </span>
          <span className="absolute bottom-3 right-3 rounded-full bg-black/80 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white/80 backdrop-blur-sm">
            {project.gallery.length} Screens
          </span>
        </button>

        <div className={`flex grow flex-col p-6 ${spotlight ? "md:w-[46%] md:p-8" : ""}`}>
          <h3 className={`font-display font-bold text-white ${spotlight ? "text-2xl" : "text-lg"}`}>
            {project.title} <span className="ml-1 text-sm font-medium text-accent">(Click on Image)</span>
          </h3>
          <p className="mt-2.5 text-sm leading-relaxed text-gray-400">{project.description}</p>
          <ul className="mt-4 flex flex-wrap gap-2">
            {project.stack.map((tech) => (
              <li
                key={tech}
                className="rounded-full border border-accent/25 bg-accent/5 px-2.5 py-1 text-[11px] font-medium uppercase tracking-wider text-accent/90"
              >
                {tech}
              </li>
            ))}
          </ul>

          <div className="mt-auto flex flex-wrap items-center gap-3 pt-6">
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-black transition-all duration-300 hover:-translate-y-0.5 hover:bg-yellow-300 hover:shadow-[0_10px_30px_rgba(255,193,7,0.35)]"
            >
              <ExternalLinkIcon className="h-3.5 w-3.5" />
              Live Demo
            </a>
            <button
              type="button"
              onClick={() => onOpen(project)}
              className="inline-flex items-center gap-2 rounded-full border border-white/20 px-5 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-white transition-all duration-300 hover:border-accent hover:text-accent"
            >
              <ExpandIcon className="h-3.5 w-3.5" />
              Screenshots
            </button>
          </div>
        </div>
      </article>
    </Reveal>
  );
}

function SectionLabel({ title, note, star = false }: { title: string; note: string; star?: boolean }) {
  return (
    <div className="flex items-center gap-4">
      {star ? <StarIcon className="h-4 w-4 text-accent" /> : null}
      <h3 className="font-display text-xl font-bold text-white">{title}</h3>
      <span aria-hidden="true" className="h-px flex-1 bg-white/10" />
      <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-gray-500">{note}</span>
    </div>
  );
}

export default function Projects() {
  const { content } = useContent();
  const visible = content.projects.filter((p) => !p.hidden);
  const featured = visible.filter((p) => p.featured);
  const regular = visible.filter((p) => !p.featured);

  const [selected, setSelected] = useState<Project | null>(null);
  const [slide, setSlide] = useState(0);
  const [touchX, setTouchX] = useState(0);

  const openProject = useCallback((project: Project) => {
    setSelected(project);
    setSlide(0);
  }, []);

  const close = useCallback(() => setSelected(null), []);

  const galleryCount = selected?.gallery.length ?? 0;
  const nextSlide = useCallback(() => setSlide((s) => (s + 1) % galleryCount), [galleryCount]);
  const prevSlide = useCallback(() => setSlide((s) => (s - 1 + galleryCount) % galleryCount), [galleryCount]);

  useEffect(() => {
    if (!selected) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") nextSlide();
      if (e.key === "ArrowLeft") prevSlide();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [selected, close, nextSlide, prevSlide]);

  const onTouchStart = (e: TouchEvent) => setTouchX(e.touches[0].clientX);
  const onTouchEnd = (e: TouchEvent) => {
    const dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 48) (dx < 0 ? nextSlide : prevSlide)();
  };

  return (
    <section id="projects" className="relative overflow-hidden py-28">
      <div aria-hidden="true" className="absolute -left-40 top-1/2 h-96 w-96 rounded-full bg-accent/[0.04] blur-[130px]" />

      <div className="relative mx-auto w-full max-w-7xl px-6 md:px-10 lg:px-16">
        <SectionHeading watermark="PROJECTS" title="Projects" subtitle="Below are the sample Web Projects." />

        <Reveal>
          <h3 className="font-display text-2xl font-bold">
            <span className="text-white">Web </span>
            <span className="text-accent">Projects</span>
          </h3>
          <span aria-hidden="true" className="mt-4 block h-px w-full bg-gradient-to-r from-accent via-accent/50 to-transparent" />
        </Reveal>

        {featured.length > 0 ? (
          <div className="mt-14">
            <Reveal>
              <SectionLabel star title="Top Projects" note={`${featured.length} Featured`} />
            </Reveal>
            {featured.length === 1 ? (
              <div className="mt-8">
                <ProjectCard project={featured[0]} index={0} onOpen={openProject} spotlight />
              </div>
            ) : (
              <div className={`mt-8 grid grid-cols-1 gap-8 ${gridClassFor(featured.length)}`}>
                {featured.map((project, i) => (
                  <ProjectCard key={project.id} project={project} index={i} onOpen={openProject} />
                ))}
              </div>
            )}
          </div>
        ) : null}

        {regular.length > 0 ? (
          <div className={featured.length > 0 ? "mt-20" : "mt-14"}>
            <Reveal>
              <SectionLabel title="More Projects" note={`${regular.length} in archive`} />
            </Reveal>
            <div className={`mt-8 grid grid-cols-1 gap-8 ${gridClassFor(regular.length)} ${regular.length === 1 ? "md:max-w-2xl" : ""}`}>
              {regular.map((project, i) => (
                <ProjectCard key={project.id} project={project} index={i} onOpen={openProject} />
              ))}
            </div>
          </div>
        ) : null}
      </div>

      {selected ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${selected.title} screenshot slider`}
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm sm:p-8"
          onClick={close}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <div
            className="relative w-full animate-pop-in"
            style={{ maxWidth: "min(64rem, calc((100vh - 13rem) * 1.5))" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <h3 className="truncate font-display text-lg font-bold text-white sm:text-xl">{selected.title}</h3>
                <p className="text-xs text-gray-500">
                  Screenshot {slide + 1} of {selected.gallery.length}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <a
                  href={selected.liveUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="hidden items-center gap-2 rounded-full bg-accent px-5 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-black transition-colors hover:bg-yellow-300 sm:inline-flex"
                >
                  <ExternalLinkIcon className="h-3.5 w-3.5" />
                  Live Demo
                </a>
                <button
                  type="button"
                  onClick={close}
                  aria-label="Close slider"
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/15 text-white transition-all duration-300 hover:rotate-90 hover:border-accent hover:text-accent"
                >
                  <CloseIcon className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-lg border border-white/10 shadow-[0_30px_90px_rgba(0,0,0,0.8)]">
              <div
                className="flex transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
                style={{ transform: `translateX(-${slide * 100}%)` }}
              >
                {selected.gallery.map((img, i) => (
                  <SmartImage
                    key={img}
                    src={img}
                    alt={`${selected.title} screenshot ${i + 1}`}
                    label={`${selected.title}, screen ${i + 1}`}
                    className="aspect-[3/2] w-full shrink-0"
                  />
                ))}
              </div>

              {selected.gallery.length > 1 ? (
                <>
                  <button
                    type="button"
                    onClick={prevSlide}
                    aria-label="Previous screenshot"
                    className="absolute left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/60 text-white backdrop-blur-sm transition-all duration-300 hover:scale-110 hover:border-accent hover:text-accent sm:left-4"
                  >
                    <ChevronLeftIcon className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    onClick={nextSlide}
                    aria-label="Next screenshot"
                    className="absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/60 text-white backdrop-blur-sm transition-all duration-300 hover:scale-110 hover:border-accent hover:text-accent sm:right-4"
                  >
                    <ChevronRightIcon className="h-5 w-5" />
                  </button>
                </>
              ) : null}
            </div>

            <div className="mt-5 flex items-center justify-center gap-3 sm:gap-4">
              {selected.gallery.map((img, i) => (
                <button
                  key={img}
                  type="button"
                  onClick={() => setSlide(i)}
                  aria-label={`Go to screenshot ${i + 1}`}
                  className={`overflow-hidden rounded-md border-2 transition-all duration-300 ${
                    i === slide ? "border-accent opacity-100" : "border-transparent opacity-45 hover:opacity-80"
                  }`}
                >
                  <SmartImage src={img} alt="" label={`Screen ${i + 1}`} className="h-14 w-20 sm:h-16 sm:w-24" />
                </button>
              ))}
              <span className="ml-2 font-display text-xs font-semibold tracking-[0.3em] text-gray-500">
                {String(slide + 1).padStart(2, "0")} / {String(selected.gallery.length).padStart(2, "0")}
              </span>
            </div>

            <a
              href={selected.liveUrl}
              target="_blank"
              rel="noreferrer"
              className="mx-auto mt-5 flex w-fit items-center gap-2 rounded-full bg-accent px-5 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-black transition-colors hover:bg-yellow-300 sm:hidden"
            >
              <ExternalLinkIcon className="h-3.5 w-3.5" />
              Live Demo
            </a>
          </div>
        </div>
      ) : null}
    </section>
  );
}
