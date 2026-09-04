import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

/* useInView: flips true the first time an element enters the viewport. */
export function useInView<T extends HTMLElement>(threshold = 0.15) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold, rootMargin: "0px 0px -8% 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, inView };
}

/* Reveal: scroll-reveal wrapper. */
export function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const { ref, inView } = useInView<HTMLDivElement>(0.12);
  const style: CSSProperties = delay ? { transitionDelay: `${delay}ms` } : {};
  return (
    <div
      ref={ref}
      style={style}
      className={`reveal ${inView ? "is-visible" : ""} ${className}`}
    >
      {children}
    </div>
  );
}

/* SectionHeading: giant faint watermark behind a solid heading + subtitle. */
export function SectionHeading({
  watermark,
  title,
  subtitle,
}: {
  watermark: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <Reveal className="relative mb-16 select-none text-center md:mb-20">
      <span
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-[58%] whitespace-nowrap font-display text-[24vw] font-extrabold uppercase leading-none tracking-tight text-neutral-500 opacity-10 sm:text-[18vw] lg:text-[10rem]"
      >
        {watermark}
      </span>
      <h2 className="relative z-10 font-display text-4xl font-bold text-white sm:text-5xl">{title}</h2>
      {subtitle ? (
        <p className="relative z-10 mt-4 text-sm text-gray-400 sm:text-base">{subtitle}</p>
      ) : null}
    </Reveal>
  );
}

/* SmartImage: image with a designed fallback when the asset fails. */
export function SmartImage({
  src,
  alt,
  className = "",
  imgClassName = "",
  label = "Preview",
}: {
  src: string;
  alt: string;
  className?: string;
  imgClassName?: string;
  label?: string;
}) {
  const [failed, setFailed] = useState(false);

  return (
    <div className={`relative overflow-hidden bg-neutral-900 ${className}`}>
      {!failed ? (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          onError={() => setFailed(true)}
          className={`h-full w-full object-cover ${imgClassName}`}
        />
      ) : null}
      {failed ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[radial-gradient(circle_at_30%_20%,#232323,#0a0a0a_70%)]">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-10 w-10 text-accent/80"
            aria-hidden="true"
          >
            <path d="m8 7-5 5 5 5" />
            <path d="m16 7 5 5-5 5" />
            <path d="m13.5 4-3 16" />
          </svg>
          <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gray-500">
            {label}
          </span>
        </div>
      ) : null}
    </div>
  );
}
