import { useState } from "react";
import { StarIcon } from "../../components/Icons";
import { uid, useContent, type Review, type Testimonial } from "../../store/content";
import { DeleteButton, ImagePicker, SaveBar, SelectInput, TextArea, TextInput, VideoPicker, VisibilityToggle, useToast } from "../controls";

const RATING_OPTIONS = [5, 4, 3, 2, 1].map((n) => ({ value: String(n), label: `${n} star${n > 1 ? "s" : ""}` }));

const initialsOf = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() || "??";

/* ------------------------------------------------------------------ */
/*  Reviews                                                            */
/* ------------------------------------------------------------------ */

const emptyReview = (): Review => ({
  id: uid(),
  name: "",
  role: "",
  platform: "Upwork",
  rating: 5,
  text: "",
  when: "Just now",
  photo: "",
  initials: "",
});

function ReviewForm({
  review,
  onSave,
  onCancel,
}: {
  review: Review;
  onSave: (r: Review) => void;
  onCancel: () => void;
}) {
  const [draft, setDraft] = useState<Review>(review);
  const dirty = JSON.stringify(draft) !== JSON.stringify(review);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <h2 className="font-display text-lg font-bold text-white">
          {review.name ? `Edit: ${review.name}` : "New Review"}
        </h2>
        <button
          onClick={onCancel}
          className="rounded-full border border-white/15 px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider text-gray-300 transition-colors hover:border-white hover:text-white"
        >
          ← Back to list
        </button>
      </div>

      <ImagePicker
        label="Client photo"
        value={draft.photo}
        onChange={(v) => setDraft((d) => ({ ...d, photo: v }))}
      />
      <div className="grid gap-5 sm:grid-cols-2">
        <TextInput label="Client name" value={draft.name} onChange={(v) => setDraft((d) => ({ ...d, name: v }))} />
        <TextInput label="Role / company" value={draft.role} onChange={(v) => setDraft((d) => ({ ...d, role: v }))} />
        <TextInput label="Platform" value={draft.platform} onChange={(v) => setDraft((d) => ({ ...d, platform: v }))} hint="Upwork, Fiverr, Google…" />
        <SelectInput
          label="Rating"
          value={String(draft.rating)}
          onChange={(v) => setDraft((d) => ({ ...d, rating: Number(v) }))}
          options={RATING_OPTIONS}
        />
      </div>
      <TextArea label="Review text" value={draft.text} onChange={(v) => setDraft((d) => ({ ...d, text: v }))} rows={3} />
      <TextInput label="When" value={draft.when} onChange={(v) => setDraft((d) => ({ ...d, when: v }))} hint='e.g. "2 weeks ago"' />

      <SaveBar dirty={dirty} onSave={() => onSave(draft)} onDiscard={() => setDraft(review)} />
    </div>
  );
}

export function ReviewsTab() {
  const { content, updateSection } = useContent();
  const toast = useToast();
  const [editing, setEditing] = useState<Review | null>(null);
  const reviews = content.reviews;

  const toggleVisibility = (id: string) => {
    const target = reviews.find((r) => r.id === id);
    updateSection(
      "reviews",
      reviews.map((r) => (r.id === id ? { ...r, hidden: !r.hidden } : r)),
    );
    toast(target?.hidden ? "Review is now visible on the website" : "Review hidden from the website");
  };

  const save = (r: Review) => {
    if (!r.name.trim() || !r.text.trim()) {
      toast("Client name and review text are required", "err");
      return;
    }
    const exists = reviews.some((x) => x.id === r.id);
    updateSection("reviews", exists ? reviews.map((x) => (x.id === r.id ? r : x)) : [r, ...reviews]);
    setEditing(null);
    toast(exists ? "Review updated" : "Review added");
  };

  if (editing) return <ReviewForm review={editing} onSave={save} onCancel={() => setEditing(null)} />;

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-gray-500">
          <span className="font-bold text-white">{reviews.length}</span> reviews. The average
          rating on the site updates automatically.
        </p>
        <button
          onClick={() => setEditing(emptyReview())}
          className="rounded-full bg-accent px-5 py-2 text-[11px] font-bold uppercase tracking-wider text-black transition-all hover:bg-yellow-300"
        >
          + Add Review
        </button>
      </div>

      <div className="mt-6 space-y-3">
        {reviews.map((r) => (
          <article
            key={r.id}
            className={`flex flex-wrap items-center gap-4 rounded-lg border bg-white/[0.02] p-4 transition-all sm:flex-nowrap ${
              r.hidden ? "border-white/10 opacity-50 grayscale" : "border-white/10"
            }`}
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full border border-accent/40 bg-neutral-900">
              {r.photo ? (
                <img src={r.photo} alt="" className="h-full w-full object-cover" />
              ) : (
                <span className="font-display text-xs font-bold text-accent">{initialsOf(r.name)}</span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-2 font-display text-sm font-bold text-white">
                <span className="truncate">{r.name || "(unnamed)"}</span>
                {r.hidden ? (
                  <span className="shrink-0 rounded-full border border-white/20 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-gray-500">
                    Hidden
                  </span>
                ) : null}
              </p>
              <p className="mt-0.5 truncate text-xs text-gray-500">
                {r.platform} · {r.when}
              </p>
              <span className="mt-1 flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((n) => (
                  <StarIcon key={n} className={`h-3 w-3 ${n <= r.rating ? "text-accent" : "text-gray-700"}`} />
                ))}
              </span>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <VisibilityToggle small hidden={!!r.hidden} onToggle={() => toggleVisibility(r.id!)} />
              <button
                onClick={() => setEditing({ ...r })}
                className="rounded-full border border-white/20 px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-300 transition-colors hover:border-accent hover:text-accent"
              >
                Edit
              </button>
              <DeleteButton
                small
                onDelete={() => {
                  updateSection("reviews", reviews.filter((x) => x.id !== r.id));
                  toast("Review deleted");
                }}
              />
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Testimonials                                                       */
/* ------------------------------------------------------------------ */

const emptyTestimonial = (): Testimonial => ({
  id: uid(),
  name: "",
  role: "",
  project: "",
  quote: "",
  rating: 5,
  duration: "0:30",
  video: "",
  initials: "",
});

function TestimonialForm({
  testimonial,
  onSave,
  onCancel,
}: {
  testimonial: Testimonial;
  onSave: (t: Testimonial) => void;
  onCancel: () => void;
}) {
  const [draft, setDraft] = useState<Testimonial>(testimonial);
  const dirty = JSON.stringify(draft) !== JSON.stringify(testimonial);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <h2 className="font-display text-lg font-bold text-white">
          {testimonial.name ? `Edit: ${testimonial.name}` : "New Testimonial"}
        </h2>
        <button
          onClick={onCancel}
          className="rounded-full border border-white/15 px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider text-gray-300 transition-colors hover:border-white hover:text-white"
        >
          ← Back to list
        </button>
      </div>

      <VideoPicker
        label="Client video"
        value={draft.video}
        onChange={(v) => setDraft((d) => ({ ...d, video: v }))}
      />
      <div className="grid gap-5 sm:grid-cols-2">
        <TextInput label="Client name" value={draft.name} onChange={(v) => setDraft((d) => ({ ...d, name: v }))} />
        <TextInput label="Role / company" value={draft.role} onChange={(v) => setDraft((d) => ({ ...d, role: v }))} />
        <TextInput label="Project" value={draft.project} onChange={(v) => setDraft((d) => ({ ...d, project: v }))} />
        <TextInput label="Duration label" value={draft.duration} onChange={(v) => setDraft((d) => ({ ...d, duration: v }))} hint='Shown on the thumbnail, e.g. "0:42"' />
        <SelectInput
          label="Rating"
          value={String(draft.rating)}
          onChange={(v) => setDraft((d) => ({ ...d, rating: Number(v) }))}
          options={RATING_OPTIONS}
        />
      </div>
      <TextArea label="Quote (shown under the video)" value={draft.quote} onChange={(v) => setDraft((d) => ({ ...d, quote: v }))} rows={3} />

      <SaveBar dirty={dirty} onSave={() => onSave(draft)} onDiscard={() => setDraft(testimonial)} />
    </div>
  );
}

export function TestimonialsTab() {
  const { content, updateSection } = useContent();
  const toast = useToast();
  const [editing, setEditing] = useState<Testimonial | null>(null);
  const testimonials = content.testimonials;

  const toggleVisibility = (id: string) => {
    const target = testimonials.find((t) => t.id === id);
    updateSection(
      "testimonials",
      testimonials.map((t) => (t.id === id ? { ...t, hidden: !t.hidden } : t)),
    );
    toast(
      target?.hidden
        ? "Testimonial is now visible on the website"
        : "Testimonial hidden from the website",
    );
  };

  const save = (t: Testimonial) => {
    if (!t.name.trim() || !t.video.trim()) {
      toast("Client name and video are required", "err");
      return;
    }
    const withInitials = { ...t, initials: initialsOf(t.name) };
    const exists = testimonials.some((x) => x.id === t.id);
    updateSection(
      "testimonials",
      exists ? testimonials.map((x) => (x.id === t.id ? withInitials : x)) : [withInitials, ...testimonials],
    );
    setEditing(null);
    toast(exists ? "Testimonial updated" : "Testimonial added");
  };

  if (editing)
    return <TestimonialForm testimonial={editing} onSave={save} onCancel={() => setEditing(null)} />;

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-gray-500">
          <span className="font-bold text-white">{testimonials.length}</span> video testimonials
        </p>
        <button
          onClick={() => setEditing(emptyTestimonial())}
          className="rounded-full bg-accent px-5 py-2 text-[11px] font-bold uppercase tracking-wider text-black transition-all hover:bg-yellow-300"
        >
          + Add Testimonial
        </button>
      </div>

      <div className="mt-6 space-y-3">
        {testimonials.map((t) => (
          <article
            key={t.id}
            className={`flex flex-wrap items-center gap-4 rounded-lg border bg-white/[0.02] p-4 transition-all sm:flex-nowrap ${
              t.hidden ? "border-white/10 opacity-50 grayscale" : "border-white/10"
            }`}
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-accent/40 bg-neutral-900 font-display text-xs font-bold text-accent">
              {t.initials || initialsOf(t.name)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-2 font-display text-sm font-bold text-white">
                <span className="truncate">{t.name || "(unnamed)"}</span>
                {t.hidden ? (
                  <span className="shrink-0 rounded-full border border-white/20 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-gray-500">
                    Hidden
                  </span>
                ) : null}
              </p>
              <p className="mt-0.5 truncate text-xs text-gray-500">
                {t.project || "(no project)"} · {t.duration} · {t.video ? "video attached ✓" : "no video yet"}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <VisibilityToggle small hidden={!!t.hidden} onToggle={() => toggleVisibility(t.id!)} />
              <button
                onClick={() => setEditing({ ...t })}
                className="rounded-full border border-white/20 px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-300 transition-colors hover:border-accent hover:text-accent"
              >
                Edit
              </button>
              <DeleteButton
                small
                onDelete={() => {
                  updateSection("testimonials", testimonials.filter((x) => x.id !== t.id));
                  toast("Testimonial deleted");
                }}
              />
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
