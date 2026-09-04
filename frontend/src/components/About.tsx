import { useContent } from "../store/content";
import { Reveal, SectionHeading, useInView } from "./ui";

/* Words wrapped in [x]…[/x] render in the accent color. */
function renderHeadline(text: string) {
  const parts = text.split(/\[x\]|\[\/x\]/g);
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <span key={i} className="text-accent">
        {part}
      </span>
    ) : (
      <span key={i}>{part}</span>
    ),
  );
}

function SkillBars() {
  const { content } = useContent();
  const skills = content.about.skills;
  const { ref, inView } = useInView<HTMLDivElement>(0.3);

  return (
    <div ref={ref} className="mt-12">
      <h3 className="font-display text-xl font-semibold text-white">Skills</h3>
      <div className="mt-6 space-y-6">
        {skills.map((skill, i) => (
          <div key={`${skill.name}-${i}`}>
            <div className="mb-2 flex items-center justify-between text-sm font-medium text-white">
              <span>{skill.name}</span>
              <span className="text-accent">{skill.level}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-gray-800">
              <div
                className="h-full rounded-full bg-accent shadow-[0_0_12px_rgba(255,193,7,0.45)] transition-[width] duration-[1300ms] ease-out"
                style={{
                  width: inView ? `${skill.level}%` : "0%",
                  transitionDelay: `${i * 140}ms`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function About() {
  const { content } = useContent();
  const about = content.about;

  return (
    <section id="about" className="relative overflow-hidden py-28">
      <div aria-hidden="true" className="absolute right-0 top-1/3 h-96 w-96 rounded-full bg-accent/[0.04] blur-[130px]" />

      <div className="relative mx-auto w-full max-w-6xl px-6 md:px-10">
        <SectionHeading watermark="ABOUT" title="About Me" />

        <div className="grid gap-16 lg:grid-cols-2 lg:gap-14">
          <Reveal>
            <div className="relative h-52 w-52 sm:h-56 sm:w-56">
              <div aria-hidden="true" className="absolute -inset-3 animate-spin-slow rounded-full border border-dashed border-white/10" />
              <div aria-hidden="true" className="absolute inset-0 translate-x-4 translate-y-4 rounded-full bg-accent" />
              <img
                src={about.profileImage}
                alt={`Portrait of ${content.hero.name}`}
                loading="lazy"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
                className="relative h-full w-full rounded-full border-4 border-black bg-neutral-900 object-cover"
              />
            </div>

            <ul className="mt-12">
              {about.basicInfo.map((row, i) => (
                <li
                  key={`${row.label}-${i}`}
                  className="group flex items-center justify-between gap-6 border-b border-white/5 py-3.5 transition-colors hover:border-accent/30"
                >
                  <span className="text-sm font-bold text-white">{row.label}</span>
                  <span className="text-right text-sm text-gray-400 transition-colors group-hover:text-gray-300">
                    {row.value}
                  </span>
                </li>
              ))}
            </ul>

            <SkillBars />
          </Reveal>

          <Reveal delay={150}>
            <h3 className="font-display text-2xl font-bold leading-snug text-white sm:text-[1.7rem]">
              {renderHeadline(about.headline)}
            </h3>

            {about.bioParagraphs.map((para, i) =>
              para.trim() ? (
                <p key={i} className="mt-6 leading-relaxed text-gray-400">
                  {para}
                </p>
              ) : null,
            )}

            <dl className="mt-10 grid grid-cols-1 gap-x-10 gap-y-7 sm:grid-cols-2">
              {about.infoGrid.map((item, i) => (
                <div key={`${item.label}-${i}`} className="border-l-2 border-accent/60 pl-4">
                  <dt className="text-sm font-bold uppercase tracking-wider text-white">{item.label}</dt>
                  <dd className="mt-1.5 text-sm text-gray-400">{item.value}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-12 flex flex-wrap items-center gap-x-10 gap-y-6">
              <p className="flex items-center font-display leading-none">
                <span className="text-5xl font-extrabold text-accent">{about.statNumber}</span>
                <span className="ml-3 max-w-[11rem] text-2xl font-bold leading-tight text-white">
                  {about.statLabel}
                </span>
              </p>
              <a
                href="#projects"
                className="rounded-full bg-accent px-6 py-2 text-xs font-bold uppercase tracking-[0.22em] text-black transition-all duration-300 hover:-translate-y-0.5 hover:bg-yellow-300 hover:shadow-[0_12px_40px_rgba(255,193,7,0.35)]"
              >
                {about.buttonText}
              </a>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
