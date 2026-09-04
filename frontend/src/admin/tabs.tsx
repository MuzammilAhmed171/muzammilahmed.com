import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { ArrowDownIcon, ArrowUpIcon, CheckIcon, ChevronLeftIcon, StarIcon } from "../components/Icons";
import {
  uid,
  type AboutContent,
  type ContactItem,
  type HeroContent,
  type Project,
  type Review,
  type SiteSettings,
  type Testimonial,
} from "../data";
import { api, apiEnabled } from "../lib/api";
import { useContent } from "../store/content";
import {
  DeleteButton,
  ImagePicker,
  OtpModal,
  PairsEditor,
  ParagraphsEditor,
  PasswordInput,
  ResumePicker,
  SaveBar,
  SelectInput,
  SkillsEditor,
  TextArea,
  TextInput,
  Toggle,
  VideoPicker,
  VisibilityToggle,
  useToast,
} from "./controls";

function BackToList({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider text-gray-300 transition-colors hover:border-white hover:text-white"
    >
      <ChevronLeftIcon className="h-3.5 w-3.5" />
      Back to list
    </button>
  );
}

const ICON_OPTIONS = [
  { value: "signpost", label: "Signpost (Address)" },
  { value: "phone", label: "Phone" },
  { value: "plane", label: "Paper Plane (Email)" },
  { value: "globe", label: "Globe (Resume / Web)" },
];

const RATING_OPTIONS = [5, 4, 3, 2, 1].map((n) => ({ value: String(n), label: `${n} star${n > 1 ? "s" : ""}` }));

const initialsOf = (name: string) =>
  name.split(" ").filter(Boolean).map((w) => w[0]).slice(0, 2).join("").toUpperCase() || "??";

/* ------------------------------------------------------------------ */
/*  Dashboard                                                          */
/* ------------------------------------------------------------------ */

export function DashboardTab() {
  const { content, updateSection, refreshFromServer } = useContent();
  const toast = useToast();

  useEffect(() => {
    if (apiEnabled) refreshFromServer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const messages = content.messages;
  const unread = messages.filter((m) => !m.read).length;
  const avg = content.reviews.length
    ? (content.reviews.reduce((s, r) => s + r.rating, 0) / content.reviews.length).toFixed(1)
    : "0.0";

  const stats = [
    { label: "Total Projects", value: String(content.projects.length) },
    { label: "Top / Pinned", value: String(content.projects.filter((p) => p.featured).length) },
    { label: "Avg. Rating", value: avg },
    { label: "Testimonials", value: String(content.testimonials.length) },
    { label: "New Messages", value: String(unread), accent: unread > 0 },
  ];

  const toggleRead = (id: string) => updateSection("messages", messages.map((m) => (m.id === id ? { ...m, read: !m.read } : m)));
  const markAllRead = () => {
    updateSection("messages", messages.map((m) => ({ ...m, read: true })));
    toast("All messages marked as read");
  };
  const removeMessage = (id: string) => {
    updateSection("messages", messages.filter((m) => m.id !== id));
    toast("Message deleted");
  };

  return (
    <div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {stats.map((s) => (
          <div key={s.label} className={`rounded-lg border p-4 transition-colors ${s.accent ? "border-accent/50 bg-accent/10" : "border-white/10 bg-white/[0.02]"}`}>
            <p className={`font-display text-2xl font-extrabold ${s.accent ? "text-accent" : "text-white"}`}>{s.value}</p>
            <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.14em] text-gray-500">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-10">
        <div className="flex items-center justify-between gap-4">
          <h2 className="font-display text-lg font-bold text-white">
            Contact Form Messages <span className="ml-1 text-sm font-medium text-gray-500">({messages.length})</span>
          </h2>
          {unread > 0 ? (
            <button onClick={markAllRead} className="rounded-full border border-accent/50 px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider text-accent transition-colors hover:bg-accent hover:text-black">
              Mark all read
            </button>
          ) : null}
        </div>

        {messages.length === 0 ? (
          <div className="mt-5 rounded-lg border border-dashed border-white/15 p-10 text-center">
            <p className="font-display text-sm font-semibold text-gray-400">No messages yet</p>
            <p className="mt-1.5 text-xs text-gray-600">
              When someone submits the contact form on your website, their message will appear here instantly.
            </p>
          </div>
        ) : (
          <div className="mt-5 space-y-3">
            {messages.map((m) => (
              <article key={m.id} className={`rounded-lg border p-5 transition-colors ${m.read ? "border-white/10 bg-white/[0.02]" : "border-accent/40 bg-accent/[0.05]"}`}>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                  {!m.read ? <span className="rounded-full bg-accent px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-widest text-black">New</span> : null}
                  <p className="font-display text-sm font-bold text-white">{m.name}</p>
                  <a href={`mailto:${m.email}`} className="text-xs text-accent underline decoration-accent/40 underline-offset-4 hover:text-yellow-300">
                    {m.email}
                  </a>
                  <span className="ml-auto text-[11px] text-gray-600">
                    {new Date(m.date).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
                <p className="mt-2.5 text-sm font-semibold text-gray-300">{m.subject}</p>
                <p className="mt-1.5 whitespace-pre-line text-sm leading-relaxed text-gray-400">{m.message}</p>
                <div className="mt-4 flex items-center gap-2.5">
                  <button onClick={() => toggleRead(m.id)} className="rounded-full border border-white/15 px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-300 transition-colors hover:border-accent hover:text-accent">
                    {m.read ? "Mark unread" : "Mark read"}
                  </button>
                  <a href={`mailto:${m.email}?subject=Re: ${encodeURIComponent(m.subject)}`} className="rounded-full bg-accent px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-black transition-colors hover:bg-yellow-300">
                    Reply
                  </a>
                  <span className="ml-auto">
                    <DeleteButton small onDelete={() => removeMessage(m.id)} />
                  </span>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Hero                                                               */
/* ------------------------------------------------------------------ */

export function HeroTab() {
  const { content, updateSection } = useContent();
  const toast = useToast();
  const [draft, setDraft] = useState<HeroContent>(content.hero);
  const dirty = JSON.stringify(draft) !== JSON.stringify(content.hero);
  const set = <K extends keyof HeroContent>(k: K, v: HeroContent[K]) => setDraft((d) => ({ ...d, [k]: v }));

  return (
    <div>
      <div className="grid gap-5 sm:grid-cols-2">
        <TextInput label="Greeting" value={draft.greeting} onChange={(v) => set("greeting", v)} />
        <TextInput label="Name intro" value={draft.nameIntro} onChange={(v) => set("nameIntro", v)} hint="Shown before the name, e.g. I'm" />
        <TextInput label="Your name (yellow)" value={draft.name} onChange={(v) => set("name", v)} />
        <TextInput label="Role (Line 1)" value={draft.roleLine1} onChange={(v) => set("roleLine1", v)} />
      </div>
      <div className="mt-5">
        <TextInput label="Role (Line 2)" value={draft.roleLine2} onChange={(v) => set("roleLine2", v)} />
      </div>
      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        <TextInput label="Button text" value={draft.buttonText} onChange={(v) => set("buttonText", v)} />
        <TextInput label="Button link" value={draft.buttonLink} onChange={(v) => set("buttonLink", v)} hint="e.g. #projects" />
      </div>
      <div className="mt-5">
        <TextInput label="Rotating badge text" value={draft.orbitText} onChange={(v) => set("orbitText", v)} hint="The circular rotating text on the right side of the hero." />
      </div>
      <SaveBar dirty={dirty} onSave={() => { updateSection("hero", draft); toast("Hero section updated"); }} onDiscard={() => setDraft(content.hero)} />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  About                                                              */
/* ------------------------------------------------------------------ */

export function AboutTab() {
  const { content, updateSection } = useContent();
  const toast = useToast();
  const [draft, setDraft] = useState<AboutContent>(content.about);
  const dirty = JSON.stringify(draft) !== JSON.stringify(content.about);
  const set = <K extends keyof AboutContent>(k: K, v: AboutContent[K]) => setDraft((d) => ({ ...d, [k]: v }));

  return (
    <div className="space-y-6">
      <ImagePicker label="Profile picture" value={draft.profileImage} onChange={(v) => set("profileImage", v)} hint="Shown in the yellow offset circle." />
      <TextInput label="Headline" value={draft.headline} onChange={(v) => set("headline", v)} hint="Wrap any words in [x]…[/x] to highlight them in yellow." />
      <ParagraphsEditor label="Bio paragraphs" items={draft.bioParagraphs} onChange={(v) => set("bioParagraphs", v)} />
      <PairsEditor label="Basic info list" items={draft.basicInfo} onChange={(v) => set("basicInfo", v)} addLabel="Add info row" />
      <SkillsEditor label="Skill bars" items={draft.skills} onChange={(v) => set("skills", v)} />
      <PairsEditor label="Info grid (Profile / Education / …)" items={draft.infoGrid} onChange={(v) => set("infoGrid", v)} addLabel="Add grid item" />
      <div className="grid gap-5 sm:grid-cols-3">
        <TextInput label="Stat number" value={draft.statNumber} onChange={(v) => set("statNumber", v)} hint='e.g. "30+"' />
        <TextInput label="Stat label" value={draft.statLabel} onChange={(v) => set("statLabel", v)} />
        <TextInput label="Button text" value={draft.buttonText} onChange={(v) => set("buttonText", v)} />
      </div>
      <SaveBar dirty={dirty} onSave={() => { updateSection("about", draft); toast("About section updated"); }} onDiscard={() => setDraft(content.about)} />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Projects                                                           */
/* ------------------------------------------------------------------ */

const newProject = (): Project => ({
  id: uid(),
  title: "",
  gallery: [],
  liveUrl: "https://",
  description: "",
  stack: [],
  featured: false,
});

function ProjectForm({ project, onSave, onCancel }: { project: Project; onSave: (p: Project) => void; onCancel: () => void }) {
  const [draft, setDraft] = useState<Project>(project);
  const [stackText, setStackText] = useState(project.stack.join(", "));
  const dirty = JSON.stringify(draft) !== JSON.stringify(project) || stackText !== project.stack.join(", ");

  const moveImage = (i: number, dir: -1 | 1) => {
    const g = [...draft.gallery];
    const j = i + dir;
    if (j < 0 || j >= g.length) return;
    [g[i], g[j]] = [g[j], g[i]];
    setDraft((d) => ({ ...d, gallery: g }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h2 className="font-display text-lg font-bold text-white">{project.title ? `Edit: ${project.title}` : "New Project"}</h2>
        <BackToList onClick={onCancel} />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <TextInput label="Project title" value={draft.title} onChange={(v) => setDraft((d) => ({ ...d, title: v }))} />
        <TextInput label="Live demo URL" value={draft.liveUrl} onChange={(v) => setDraft((d) => ({ ...d, liveUrl: v }))} />
      </div>
      <TextArea label="Description" value={draft.description} onChange={(v) => setDraft((d) => ({ ...d, description: v }))} rows={3} />
      <TextInput label="Tech stack (comma separated)" value={stackText} onChange={setStackText} hint='e.g. "React.js, Node.js, MongoDB"' />
      <Toggle label="Pin as Top Project" hint="Pinned projects appear in the highlighted Top Projects area." checked={!!draft.featured} onChange={(v) => setDraft((d) => ({ ...d, featured: v }))} />

      <div>
        <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.16em] text-gray-400">
          Screenshots ({draft.gallery.length}). First one is the card thumbnail
        </p>
        <div className="space-y-4">
          {draft.gallery.map((img, i) => (
            <div key={i} className="rounded-lg border border-white/10 bg-white/[0.02] p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs font-bold text-gray-400">
                  Screenshot {i + 1} {i === 0 ? <span className="ml-1 text-accent">(thumbnail)</span> : null}
                </span>
                <div className="flex gap-2">
                  <button onClick={() => moveImage(i, -1)} disabled={i === 0} className="inline-flex items-center gap-1 rounded-md border border-white/10 px-2.5 py-1 text-[10px] font-bold text-gray-400 transition-colors enabled:hover:border-accent enabled:hover:text-accent disabled:opacity-30">
                    <ArrowUpIcon className="h-3 w-3" />
                    Up
                  </button>
                  <button onClick={() => moveImage(i, 1)} disabled={i === draft.gallery.length - 1} className="inline-flex items-center gap-1 rounded-md border border-white/10 px-2.5 py-1 text-[10px] font-bold text-gray-400 transition-colors enabled:hover:border-accent enabled:hover:text-accent disabled:opacity-30">
                    <ArrowDownIcon className="h-3 w-3" />
                    Down
                  </button>
                  <button onClick={() => setDraft((d) => ({ ...d, gallery: d.gallery.filter((_, idx) => idx !== i) }))} className="rounded-md border border-red-400/40 px-2.5 py-1 text-[10px] font-bold text-red-400 transition-colors hover:bg-red-400/10">
                    Remove
                  </button>
                </div>
              </div>
              <ImagePicker label="" value={img} onChange={(v) => setDraft((d) => ({ ...d, gallery: d.gallery.map((x, idx) => (idx === i ? v : x)) }))} />
            </div>
          ))}
          <button onClick={() => setDraft((d) => ({ ...d, gallery: [...d.gallery, ""] }))} className="inline-flex items-center gap-2 rounded-full border border-dashed border-white/25 px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider text-gray-300 transition-colors hover:border-accent hover:text-accent">
            <span className="text-sm leading-none">+</span> Add screenshot
          </button>
        </div>
      </div>

      <SaveBar
        dirty={dirty}
        onSave={() => onSave({ ...draft, stack: stackText.split(",").map((s) => s.trim()).filter(Boolean), gallery: draft.gallery.filter(Boolean) })}
        onDiscard={() => { setDraft(project); setStackText(project.stack.join(", ")); }}
      />
    </div>
  );
}

export function ProjectsTab() {
  const { content, updateSection } = useContent();
  const toast = useToast();
  const [editing, setEditing] = useState<Project | null>(null);
  const projects = content.projects;

  const save = (p: Project) => {
    if (!p.title.trim()) { toast("Project title is required", "err"); return; }
    if (p.gallery.length === 0) { toast("Add at least one screenshot", "err"); return; }
    const exists = projects.some((x) => x.id === p.id);
    updateSection("projects", exists ? projects.map((x) => (x.id === p.id ? p : x)) : [p, ...projects]);
    setEditing(null);
    toast(exists ? "Project updated" : "Project added to website");
  };

  const remove = (id: string) => {
    updateSection("projects", projects.filter((p) => p.id !== id));
    toast("Project deleted");
  };

  const togglePin = (id: string) =>
    updateSection("projects", projects.map((p) => (p.id === id ? { ...p, featured: !p.featured } : p)));

  const toggleVisibility = (id: string) => {
    const target = projects.find((p) => p.id === id);
    updateSection("projects", projects.map((p) => (p.id === id ? { ...p, hidden: !p.hidden } : p)));
    toast(target?.hidden ? "Project is now visible on the website" : "Project hidden from the website");
  };

  if (editing) return <ProjectForm project={editing} onSave={save} onCancel={() => setEditing(null)} />;

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-gray-500">
          <span className="font-bold text-white">{projects.length}</span> projects ·{" "}
          <span className="font-bold text-accent">{projects.filter((p) => p.featured).length}</span> pinned as Top Projects
        </p>
        <button onClick={() => setEditing(newProject())} className="rounded-full bg-accent px-5 py-2 text-[11px] font-bold uppercase tracking-wider text-black transition-all hover:bg-yellow-300 hover:shadow-[0_8px_28px_rgba(255,193,7,0.35)]">
          + Add Project
        </button>
      </div>

      <div className="mt-6 space-y-3">
        {projects.map((p) => (
          <article key={p.id} className={`flex flex-wrap items-center gap-4 rounded-lg border p-4 transition-all sm:flex-nowrap ${p.hidden ? "opacity-50 grayscale" : ""} ${p.featured && !p.hidden ? "border-accent/40 bg-accent/[0.05]" : "border-white/10 bg-white/[0.02]"}`}>
            <img src={p.gallery[0]} alt="" className="h-14 w-20 shrink-0 rounded-md border border-white/10 object-cover" />
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-2 font-display text-sm font-bold text-white">
                <span className="truncate">{p.title || "(untitled)"}</span>
                {p.featured ? <StarIcon className="h-3.5 w-3.5 shrink-0 text-accent" /> : null}
                {p.hidden ? <span className="shrink-0 rounded-full border border-white/20 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-gray-500">Hidden</span> : null}
              </p>
              <p className="mt-0.5 truncate text-xs text-gray-500">
                {p.gallery.length} screenshots · {p.stack.slice(0, 4).join(", ")}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <button onClick={() => togglePin(p.id!)} className={`rounded-full border px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-colors ${p.featured ? "border-accent bg-accent text-black hover:bg-yellow-300" : "border-white/20 text-gray-300 hover:border-accent hover:text-accent"}`}>
                {p.featured ? "★ Pinned" : "Pin to Top"}
              </button>
              <VisibilityToggle small hidden={!!p.hidden} onToggle={() => toggleVisibility(p.id!)} />
              <button onClick={() => setEditing({ ...p })} className="rounded-full border border-white/20 px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-300 transition-colors hover:border-accent hover:text-accent">
                Edit
              </button>
              <DeleteButton small onDelete={() => remove(p.id!)} />
            </div>
          </article>
        ))}
      </div>

      <p className="mt-6 rounded-lg border border-white/10 bg-white/[0.02] p-4 text-xs leading-relaxed text-gray-500">
        Layout is count-safe: 1 pinned project shows as a large spotlight card, 2 as a two-column row, and 3+ as a
        three-column grid, so pinning any number of projects never breaks the design.
      </p>
    </div>
  );
}

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

function ReviewForm({ review, onSave, onCancel }: { review: Review; onSave: (r: Review) => void; onCancel: () => void }) {
  const [draft, setDraft] = useState<Review>(review);
  const dirty = JSON.stringify(draft) !== JSON.stringify(review);
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <h2 className="font-display text-lg font-bold text-white">{review.name ? `Edit: ${review.name}` : "New Review"}</h2>
        <BackToList onClick={onCancel} />
      </div>
      <ImagePicker label="Client photo" value={draft.photo} onChange={(v) => setDraft((d) => ({ ...d, photo: v }))} />
      <div className="grid gap-5 sm:grid-cols-2">
        <TextInput label="Client name" value={draft.name} onChange={(v) => setDraft((d) => ({ ...d, name: v }))} />
        <TextInput label="Role / company" value={draft.role} onChange={(v) => setDraft((d) => ({ ...d, role: v }))} />
        <TextInput label="Platform" value={draft.platform} onChange={(v) => setDraft((d) => ({ ...d, platform: v }))} hint="Upwork, Fiverr, Google…" />
        <SelectInput label="Rating" value={String(draft.rating)} onChange={(v) => setDraft((d) => ({ ...d, rating: Number(v) }))} options={RATING_OPTIONS} />
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
    updateSection("reviews", reviews.map((r) => (r.id === id ? { ...r, hidden: !r.hidden } : r)));
    toast(target?.hidden ? "Review is now visible on the website" : "Review hidden from the website");
  };

  const save = (r: Review) => {
    if (!r.name.trim() || !r.text.trim()) { toast("Client name and review text are required", "err"); return; }
    const withInitials = { ...r, initials: initialsOf(r.name) };
    const exists = reviews.some((x) => x.id === r.id);
    updateSection("reviews", exists ? reviews.map((x) => (x.id === r.id ? withInitials : x)) : [withInitials, ...reviews]);
    setEditing(null);
    toast(exists ? "Review updated" : "Review added");
  };

  if (editing) return <ReviewForm review={editing} onSave={save} onCancel={() => setEditing(null)} />;

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-gray-500">
          <span className="font-bold text-white">{reviews.length}</span> reviews. The average rating on the site updates automatically.
        </p>
        <button onClick={() => setEditing(emptyReview())} className="rounded-full bg-accent px-5 py-2 text-[11px] font-bold uppercase tracking-wider text-black transition-all hover:bg-yellow-300">
          + Add Review
        </button>
      </div>

      <div className="mt-6 space-y-3">
        {reviews.map((r) => (
          <article key={r.id} className={`flex flex-wrap items-center gap-4 rounded-lg border bg-white/[0.02] p-4 transition-all sm:flex-nowrap ${r.hidden ? "border-white/10 opacity-50 grayscale" : "border-white/10"}`}>
            <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full border border-accent/40 bg-neutral-900">
              {r.photo ? <img src={r.photo} alt="" className="h-full w-full object-cover" /> : <span className="font-display text-xs font-bold text-accent">{r.initials || initialsOf(r.name)}</span>}
            </div>
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-2 font-display text-sm font-bold text-white">
                <span className="truncate">{r.name || "(unnamed)"}</span>
                {r.hidden ? <span className="shrink-0 rounded-full border border-white/20 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-gray-500">Hidden</span> : null}
              </p>
              <p className="mt-0.5 truncate text-xs text-gray-500">{r.platform} · {r.when}</p>
              <span className="mt-1 flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((n) => (
                  <StarIcon key={n} className={`h-3 w-3 ${n <= r.rating ? "text-accent" : "text-gray-700"}`} />
                ))}
              </span>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <VisibilityToggle small hidden={!!r.hidden} onToggle={() => toggleVisibility(r.id!)} />
              <button onClick={() => setEditing({ ...r })} className="rounded-full border border-white/20 px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-300 transition-colors hover:border-accent hover:text-accent">
                Edit
              </button>
              <DeleteButton small onDelete={() => { updateSection("reviews", reviews.filter((x) => x.id !== r.id)); toast("Review deleted"); }} />
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

function TestimonialForm({ testimonial, onSave, onCancel }: { testimonial: Testimonial; onSave: (t: Testimonial) => void; onCancel: () => void }) {
  const [draft, setDraft] = useState<Testimonial>(testimonial);
  const dirty = JSON.stringify(draft) !== JSON.stringify(testimonial);
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <h2 className="font-display text-lg font-bold text-white">{testimonial.name ? `Edit: ${testimonial.name}` : "New Testimonial"}</h2>
        <BackToList onClick={onCancel} />
      </div>
      <VideoPicker label="Client video" value={draft.video} onChange={(v) => setDraft((d) => ({ ...d, video: v }))} />
      <div className="grid gap-5 sm:grid-cols-2">
        <TextInput label="Client name" value={draft.name} onChange={(v) => setDraft((d) => ({ ...d, name: v }))} />
        <TextInput label="Role / company" value={draft.role} onChange={(v) => setDraft((d) => ({ ...d, role: v }))} />
        <TextInput label="Project" value={draft.project} onChange={(v) => setDraft((d) => ({ ...d, project: v }))} />
        <TextInput label="Duration label" value={draft.duration} onChange={(v) => setDraft((d) => ({ ...d, duration: v }))} hint='Shown on the thumbnail, e.g. "0:42"' />
        <SelectInput label="Rating" value={String(draft.rating)} onChange={(v) => setDraft((d) => ({ ...d, rating: Number(v) }))} options={RATING_OPTIONS} />
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
    updateSection("testimonials", testimonials.map((t) => (t.id === id ? { ...t, hidden: !t.hidden } : t)));
    toast(target?.hidden ? "Testimonial is now visible on the website" : "Testimonial hidden from the website");
  };

  const save = (t: Testimonial) => {
    if (!t.name.trim() || !t.video.trim()) { toast("Client name and video are required", "err"); return; }
    const withInitials = { ...t, initials: initialsOf(t.name) };
    const exists = testimonials.some((x) => x.id === t.id);
    updateSection("testimonials", exists ? testimonials.map((x) => (x.id === t.id ? withInitials : x)) : [withInitials, ...testimonials]);
    setEditing(null);
    toast(exists ? "Testimonial updated" : "Testimonial added");
  };

  if (editing) return <TestimonialForm testimonial={editing} onSave={save} onCancel={() => setEditing(null)} />;

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-gray-500">
          <span className="font-bold text-white">{testimonials.length}</span> video testimonials
        </p>
        <button onClick={() => setEditing(emptyTestimonial())} className="rounded-full bg-accent px-5 py-2 text-[11px] font-bold uppercase tracking-wider text-black transition-all hover:bg-yellow-300">
          + Add Testimonial
        </button>
      </div>

      <div className="mt-6 space-y-3">
        {testimonials.map((t) => (
          <article key={t.id} className={`flex flex-wrap items-center gap-4 rounded-lg border bg-white/[0.02] p-4 transition-all sm:flex-nowrap ${t.hidden ? "border-white/10 opacity-50 grayscale" : "border-white/10"}`}>
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-accent/40 bg-neutral-900 font-display text-xs font-bold text-accent">
              {t.initials || initialsOf(t.name)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-2 font-display text-sm font-bold text-white">
                <span className="truncate">{t.name || "(unnamed)"}</span>
                {t.hidden ? <span className="shrink-0 rounded-full border border-white/20 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-gray-500">Hidden</span> : null}
              </p>
              <p className="mt-0.5 truncate text-xs text-gray-500">
                {t.project || "(no project)"} · {t.duration} · {t.video ? "video attached ✓" : "no video yet"}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <VisibilityToggle small hidden={!!t.hidden} onToggle={() => toggleVisibility(t.id!)} />
              <button onClick={() => setEditing({ ...t })} className="rounded-full border border-white/20 px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-300 transition-colors hover:border-accent hover:text-accent">
                Edit
              </button>
              <DeleteButton small onDelete={() => { updateSection("testimonials", testimonials.filter((x) => x.id !== t.id)); toast("Testimonial deleted"); }} />
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Contact info cards                                                 */
/* ------------------------------------------------------------------ */

export function ContactInfoTab() {
  const { content, updateSection } = useContent();
  const toast = useToast();
  const [draft, setDraft] = useState<ContactItem[]>(content.contactItems);
  const dirty = JSON.stringify(draft) !== JSON.stringify(content.contactItems);

  const update = (i: number, patch: Partial<ContactItem>) => setDraft((d) => d.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));

  return (
    <div>
      <p className="mb-6 rounded-lg border border-white/10 bg-white/[0.02] p-4 text-xs leading-relaxed text-gray-500">
        These are the four icon cards in the Contact section. <span className="text-gray-300">Link</span> is optional.
        Use <span className="text-accent">tel:…</span>, <span className="text-accent">mailto:…</span> or any URL.
      </p>
      <div className="space-y-5">
        {draft.map((item, i) => (
          <div key={i} className="rounded-lg border border-white/10 bg-white/[0.02] p-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <TextInput label="Title" value={item.title} onChange={(v) => update(i, { title: v })} />
              <SelectInput label="Icon" value={item.icon} onChange={(v) => update(i, { icon: v as ContactItem["icon"] })} options={ICON_OPTIONS} />
              <TextInput label="Value" value={item.value} onChange={(v) => update(i, { value: v })} />
              <TextInput label="Link (optional)" value={item.href ?? ""} onChange={(v) => update(i, { href: v || undefined })} />
            </div>
            <div className="mt-3 flex justify-end">
              <DeleteButton small label="Remove card" onDelete={() => setDraft((d) => d.filter((_, idx) => idx !== i))} />
            </div>
          </div>
        ))}
      </div>
      <button onClick={() => setDraft((d) => [...d, { title: "New Card", value: "...", icon: "globe" }])} className="mt-4 inline-flex items-center gap-2 rounded-full border border-dashed border-white/25 px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider text-gray-300 transition-colors hover:border-accent hover:text-accent">
        <span className="text-sm leading-none">+</span> Add contact card
      </button>
      <SaveBar dirty={dirty} onSave={() => { updateSection("contactItems", draft); toast("Contact cards updated"); }} onDiscard={() => setDraft(content.contactItems)} />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Settings + Security                                                */
/* ------------------------------------------------------------------ */

function SecurityCard() {
  const { content, updateSection } = useContent();
  const toast = useToast();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [showOtp, setShowOtp] = useState(false);
  const [demoCode, setDemoCode] = useState("");
  const [busy, setBusy] = useState(false);

  const start = async () => {
    setError("");
    if (!current || !next || !confirm) { setError("Fill in all three password fields."); return; }
    if (next.length < 6) { setError("New password must be at least 6 characters."); return; }
    if (next !== confirm) { setError("New passwords do not match."); return; }
    if (!apiEnabled && current !== content.settings.adminPassword) { setError("Current password is incorrect."); return; }
    if (apiEnabled) {
      setBusy(true);
      try {
        /* Ask the server to email a real code to the admin address. */
        await api.auth.requestOtp(content.settings.email);
        setDemoCode("");
        setShowOtp(true);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not send the code.");
      } finally {
        setBusy(false);
      }
    } else {
      setDemoCode(String(Math.floor(100000 + Math.random() * 900000)));
      setShowOtp(true);
    }
  };

  /* Backend mode: the OTP modal hands us the typed code and we verify it on the
     server together with the current + new password. */
  const verifyRemote = apiEnabled
    ? async (code: string) => {
        await api.auth.changePassword(current, code, next);
      }
    : undefined;

  const finish = () => {
    setShowOtp(false);
    if (!apiEnabled) {
      updateSection("settings", { ...content.settings, adminPassword: next });
    }
    toast("Password changed");
    setCurrent(""); setNext(""); setConfirm("");
  };

  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.02] p-5">
      <h3 className="font-display text-sm font-bold text-white">Security: Change Password</h3>
      <p className="mt-1.5 text-xs text-gray-500">
        {apiEnabled
          ? "Verified with your current password plus an OTP sent to your admin email."
          : "Stored in this browser for now. An OTP step verifies it's really you."}
      </p>
      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <PasswordInput label="Current password" value={current} onChange={setCurrent} />
        <PasswordInput label="New password" value={next} onChange={setNext} hint="Min 6 characters" />
        <PasswordInput label="Confirm new password" value={confirm} onChange={setConfirm} />
      </div>
      {error ? <p className="mt-3 text-xs text-red-400">{error}</p> : null}
      <button onClick={start} disabled={busy} className="mt-4 rounded-full bg-accent px-6 py-2.5 text-[11px] font-bold uppercase tracking-wider text-black transition-all hover:bg-yellow-300 hover:shadow-[0_8px_28px_rgba(255,193,7,0.3)] disabled:opacity-60">
        {busy ? "Saving…" : "Change Password"}
      </button>

      {showOtp ? (
        <OtpModal
          email={content.settings.email}
          demoCode={demoCode}
          onClose={() => setShowOtp(false)}
          onVerified={finish}
          verifyRemote={verifyRemote}
        />
      ) : null}
    </div>
  );
}

export function SettingsTab() {
  const { content, updateSection, resetAll, importContent } = useContent();
  const toast = useToast();
  const [draft, setDraft] = useState<SiteSettings>(content.settings);
  const set = <K extends keyof SiteSettings>(k: K, v: SiteSettings[K]) => setDraft((d) => ({ ...d, [k]: v }));
  const importRef = useRef<HTMLInputElement>(null);

  /* Password lives in the Security card, exclude it from the dirty check. */
  const dirty = JSON.stringify({ ...draft, adminPassword: "" }) !== JSON.stringify({ ...content.settings, adminPassword: "" });

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(content, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "portfolio-content-backup.json";
    a.click();
    URL.revokeObjectURL(url);
    toast("Backup downloaded");
  };

  const onImport = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const ok = importContent(String(reader.result));
      toast(ok ? "Backup imported successfully" : "Invalid backup file", ok ? "ok" : "err");
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-5 sm:grid-cols-2">
        <TextInput label="Logo, first word (white)" value={draft.logoFirst} onChange={(v) => set("logoFirst", v)} />
        <TextInput label="Logo, second word (yellow)" value={draft.logoSecond} onChange={(v) => set("logoSecond", v)} />
        <TextInput label="Side signature" value={draft.sideSignature} onChange={(v) => set("sideSignature", v)} hint="Vertical text on the left edge of the website." />
        <TextInput label="Copyright name" value={draft.copyrightName} onChange={(v) => set("copyrightName", v)} />
        <TextInput label="Direct email" value={draft.email} onChange={(v) => set("email", v)} hint="Used for the direct contact link. Also the email that receives OTP codes." />
      </div>

      <SecurityCard />

      <ResumePicker label="Resume (PDF)" value={draft.resume} onChange={(v) => set("resume", v)} />

      <div>
        <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.16em] text-gray-400">Navigation links</p>
        <div className="space-y-2">
          {draft.navLinks.map((link, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                value={link.label}
                onChange={(e) => set("navLinks", draft.navLinks.map((l, idx) => (idx === i ? { ...l, label: e.target.value } : l)))}
                className="w-full rounded-md border border-white/10 bg-neutral-950 px-3.5 py-2.5 text-sm text-white outline-none focus:border-accent"
              />
              <span className="w-24 shrink-0 text-center text-[10px] uppercase tracking-widest text-gray-600">#{link.id}</span>
            </div>
          ))}
        </div>
      </div>

      <SaveBar
        dirty={dirty}
        onSave={() => {
          /* Password is managed by the Security card, always keep the live one. */
          updateSection("settings", { ...draft, adminPassword: content.settings.adminPassword });
          toast("Settings saved");
        }}
        onDiscard={() => setDraft(content.settings)}
      />

      <div className="rounded-lg border border-white/10 bg-white/[0.02] p-5">
        <h3 className="font-display text-sm font-bold text-white">Backup &amp; Data</h3>
        <p className="mt-1.5 text-xs leading-relaxed text-gray-500">
          Export all website content as JSON, or restore from a previous backup. Reset brings back the original demo content.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <button onClick={exportJson} className="rounded-full bg-accent px-5 py-2 text-[11px] font-bold uppercase tracking-wider text-black transition-colors hover:bg-yellow-300">
            Export JSON
          </button>
          <input ref={importRef} type="file" accept="application/json" className="hidden" onChange={onImport} />
          <button onClick={() => importRef.current?.click()} className="rounded-full border border-white/20 px-5 py-2 text-[11px] font-bold uppercase tracking-wider text-gray-300 transition-colors hover:border-accent hover:text-accent">
            Import JSON
          </button>
          <DeleteButton label="Reset All Content" onDelete={() => { resetAll(); toast("All content restored to defaults"); }} />
        </div>
      </div>
    </div>
  );
}
