import { useState } from "react";
import { StarIcon } from "../../components/Icons";
import { uid, useContent, type Project } from "../../store/content";
import { DeleteButton, ImagePicker, SaveBar, TextArea, TextInput, Toggle, VisibilityToggle, useToast } from "../controls";

const newProject = (): Project => ({
  id: uid(),
  title: "",
  gallery: [],
  liveUrl: "https://",
  description: "",
  stack: [],
  featured: false,
});

function ProjectForm({
  project,
  onSave,
  onCancel,
}: {
  project: Project;
  onSave: (p: Project) => void;
  onCancel: () => void;
}) {
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
        <h2 className="font-display text-lg font-bold text-white">
          {project.title ? `Edit: ${project.title}` : "New Project"}
        </h2>
        <button
          onClick={onCancel}
          className="rounded-full border border-white/15 px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider text-gray-300 transition-colors hover:border-white hover:text-white"
        >
          ← Back to list
        </button>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <TextInput label="Project title" value={draft.title} onChange={(v) => setDraft((d) => ({ ...d, title: v }))} />
        <TextInput label="Live demo URL" value={draft.liveUrl} onChange={(v) => setDraft((d) => ({ ...d, liveUrl: v }))} />
      </div>

      <TextArea
        label="Description"
        value={draft.description}
        onChange={(v) => setDraft((d) => ({ ...d, description: v }))}
        rows={3}
      />

      <TextInput
        label="Tech stack (comma separated)"
        value={stackText}
        onChange={setStackText}
        hint='e.g. "React.js, Node.js, MongoDB"'
      />

      <Toggle
        label="Pin as Top Project"
        hint="Pinned projects appear in the highlighted Top Projects area."
        checked={!!draft.featured}
        onChange={(v) => setDraft((d) => ({ ...d, featured: v }))}
      />

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
                  <button
                    onClick={() => moveImage(i, -1)}
                    disabled={i === 0}
                    className="rounded-md border border-white/10 px-2.5 py-1 text-[10px] font-bold text-gray-400 transition-colors enabled:hover:border-accent enabled:hover:text-accent disabled:opacity-30"
                  >
                    ↑ Up
                  </button>
                  <button
                    onClick={() => moveImage(i, 1)}
                    disabled={i === draft.gallery.length - 1}
                    className="rounded-md border border-white/10 px-2.5 py-1 text-[10px] font-bold text-gray-400 transition-colors enabled:hover:border-accent enabled:hover:text-accent disabled:opacity-30"
                  >
                    ↓ Down
                  </button>
                  <button
                    onClick={() => setDraft((d) => ({ ...d, gallery: d.gallery.filter((_, idx) => idx !== i) }))}
                    className="rounded-md border border-red-400/40 px-2.5 py-1 text-[10px] font-bold text-red-400 transition-colors hover:bg-red-400/10"
                  >
                    Remove
                  </button>
                </div>
              </div>
              <ImagePicker
                label=""
                value={img}
                onChange={(v) =>
                  setDraft((d) => ({ ...d, gallery: d.gallery.map((x, idx) => (idx === i ? v : x)) }))
                }
              />
            </div>
          ))}
          <button
            onClick={() => setDraft((d) => ({ ...d, gallery: [...d.gallery, ""] }))}
            className="inline-flex items-center gap-2 rounded-full border border-dashed border-white/25 px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider text-gray-300 transition-colors hover:border-accent hover:text-accent"
          >
            <span className="text-sm leading-none">+</span> Add screenshot
          </button>
        </div>
      </div>

      <SaveBar
        dirty={dirty}
        onSave={() =>
          onSave({
            ...draft,
            stack: stackText.split(",").map((s) => s.trim()).filter(Boolean),
            gallery: draft.gallery.filter(Boolean),
          })
        }
        onDiscard={() => {
          setDraft(project);
          setStackText(project.stack.join(", "));
        }}
      />
    </div>
  );
}

export default function ProjectsTab() {
  const { content, updateSection } = useContent();
  const toast = useToast();
  const [editing, setEditing] = useState<Project | null>(null);
  const projects = content.projects;

  const save = (p: Project) => {
    if (!p.title.trim()) {
      toast("Project title is required", "err");
      return;
    }
    if (p.gallery.length === 0) {
      toast("Add at least one screenshot", "err");
      return;
    }
    const exists = projects.some((x) => x.id === p.id);
    updateSection(
      "projects",
      exists ? projects.map((x) => (x.id === p.id ? p : x)) : [p, ...projects],
    );
    setEditing(null);
    toast(exists ? "Project updated" : "Project added to website");
  };

  const remove = (id: string) => {
    updateSection(
      "projects",
      projects.filter((p) => p.id !== id),
    );
    toast("Project deleted");
  };

  const togglePin = (id: string) => {
    updateSection(
      "projects",
      projects.map((p) => (p.id === id ? { ...p, featured: !p.featured } : p)),
    );
  };

  const toggleVisibility = (id: string) => {
    const target = projects.find((p) => p.id === id);
    updateSection(
      "projects",
      projects.map((p) => (p.id === id ? { ...p, hidden: !p.hidden } : p)),
    );
    toast(target?.hidden ? "Project is now visible on the website" : "Project hidden from the website");
  };

  if (editing) {
    return <ProjectForm project={editing} onSave={save} onCancel={() => setEditing(null)} />;
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-gray-500">
          <span className="font-bold text-white">{projects.length}</span> projects ·{" "}
          <span className="font-bold text-accent">{projects.filter((p) => p.featured).length}</span>{" "}
          pinned as Top Projects
        </p>
        <button
          onClick={() => setEditing(newProject())}
          className="rounded-full bg-accent px-5 py-2 text-[11px] font-bold uppercase tracking-wider text-black transition-all hover:bg-yellow-300 hover:shadow-[0_8px_28px_rgba(255,193,7,0.35)]"
        >
          + Add Project
        </button>
      </div>

      <div className="mt-6 space-y-3">
        {projects.map((p) => (
          <article
            key={p.id}
            className={`flex flex-wrap items-center gap-4 rounded-lg border p-4 transition-all sm:flex-nowrap ${
              p.hidden ? "opacity-50 grayscale" : ""
            } ${
              p.featured && !p.hidden ? "border-accent/40 bg-accent/[0.05]" : "border-white/10 bg-white/[0.02]"
            }`}
          >
            <img
              src={p.gallery[0]}
              alt=""
              className="h-14 w-20 shrink-0 rounded-md border border-white/10 object-cover"
            />
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-2 font-display text-sm font-bold text-white">
                <span className="truncate">{p.title || "(untitled)"}</span>
                {p.featured ? <StarIcon className="h-3.5 w-3.5 shrink-0 text-accent" /> : null}
                {p.hidden ? (
                  <span className="shrink-0 rounded-full border border-white/20 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-gray-500">
                    Hidden
                  </span>
                ) : null}
              </p>
              <p className="mt-0.5 truncate text-xs text-gray-500">
                {p.gallery.length} screenshots · {p.stack.slice(0, 4).join(", ")}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <button
                onClick={() => togglePin(p.id)}
                className={`rounded-full border px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-colors ${
                  p.featured
                    ? "border-accent bg-accent text-black hover:bg-yellow-300"
                    : "border-white/20 text-gray-300 hover:border-accent hover:text-accent"
                }`}
              >
                {p.featured ? "★ Pinned" : "Pin to Top"}
              </button>
              <VisibilityToggle small hidden={!!p.hidden} onToggle={() => toggleVisibility(p.id)} />
              <button
                onClick={() => setEditing({ ...p })}
                className="rounded-full border border-white/20 px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-300 transition-colors hover:border-accent hover:text-accent"
              >
                Edit
              </button>
              <DeleteButton small onDelete={() => remove(p.id)} />
            </div>
          </article>
        ))}
      </div>

      <p className="mt-6 rounded-lg border border-white/10 bg-white/[0.02] p-4 text-xs leading-relaxed text-gray-500">
        Layout is count-safe: 1 pinned project shows as a large spotlight card, 2 as a two-column
        row, and 3+ as a three-column grid, so pinning any number of projects never breaks the design.
      </p>
    </div>
  );
}
