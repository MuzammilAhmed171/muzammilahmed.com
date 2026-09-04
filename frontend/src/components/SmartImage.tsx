import { useState } from "react";

type SmartImageProps = {
  src: string;
  alt: string;
  className?: string;
  imgClassName?: string;
  label?: string;
};

/**
 * Image with a designed fallback: if the remote asset fails to load, a dark
 * placeholder panel with a code glyph is shown instead of a broken image.
 */
export default function SmartImage({
  src,
  alt,
  className = "",
  imgClassName = "",
  label = "Preview",
}: SmartImageProps) {
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
