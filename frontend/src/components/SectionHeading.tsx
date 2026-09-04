import Reveal from "./Reveal";

type SectionHeadingProps = {
  watermark: string;
  title: string;
  subtitle?: string;
};

/**
 * Signature section header: a giant faint uppercase watermark centered behind
 * a solid white heading, with a small gray subtitle underneath.
 */
export default function SectionHeading({ watermark, title, subtitle }: SectionHeadingProps) {
  return (
    <Reveal className="relative mb-16 select-none text-center md:mb-20">
      <span
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-[58%] whitespace-nowrap font-display text-[24vw] font-extrabold uppercase leading-none tracking-tight text-neutral-500 opacity-10 sm:text-[18vw] lg:text-[10rem]"
      >
        {watermark}
      </span>
      <h2 className="relative z-10 font-display text-4xl font-bold text-white sm:text-5xl">
        {title}
      </h2>
      {subtitle ? (
        <p className="relative z-10 mt-4 text-sm text-gray-400 sm:text-base">{subtitle}</p>
      ) : null}
    </Reveal>
  );
}
