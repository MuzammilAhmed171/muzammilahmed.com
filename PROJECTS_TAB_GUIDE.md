# 📄 Code Guide for `frontend/src/admin/tabs.tsx`

> **Target File:** [`frontend/src/admin/tabs.tsx`](file:///d:/Downloads/Potfolio-main/frontend/src/admin/tabs.tsx)

This guide documents the exact changes made to `frontend/src/admin/tabs.tsx` for adding 4-way project reordering buttons (**Top**, **Up ↑**, **Down ↓**, **Bottom**) and position indicators (`#1`, `#2`...).

---

## 🛠️ Summary of Changes Made to `frontend/src/admin/tabs.tsx`

1. **Icons Import Updated** (`Line 2`): Added `MoveToTopIcon` and `MoveToBottomIcon`.
2. **`ProjectsTab()` Function Updated** (`Lines 309–492`):
   - Added `moveProject(id, direction)` state handler for 4-way reordering (`top`, `up`, `down`, `bottom`).
   - Redesigned project list items with a dedicated responsive bottom bar.
   - Displayed `#idx + 1` order badge for each project.
   - Added 4 action buttons: **Top**, **Up (↑)**, **Down (↓)**, and **Bottom**.

---

## 📍 Line-by-Line Changes for `frontend/src/admin/tabs.tsx`

### 1️⃣ Update Icons Import (Top of File - Line 2)

**Replace:**
```tsx
import { ArrowDownIcon, ArrowUpIcon, CheckIcon, ChevronLeftIcon, StarIcon } from "../components/Icons";
```

**With:**
```tsx
import { ArrowDownIcon, ArrowUpIcon, CheckIcon, ChevronLeftIcon, MoveToBottomIcon, MoveToTopIcon, StarIcon } from "../components/Icons";
```

---

### 2️⃣ Full Replacement Code for `export function ProjectsTab()` inside `tabs.tsx`

Below is the complete `ProjectsTab` component code as written in `frontend/src/admin/tabs.tsx`:

```tsx
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

  const moveProject = (id: string, direction: "up" | "down" | "top" | "bottom") => {
    const index = projects.findIndex((p) => p.id === id);
    if (index === -1) return;

    const reordered = [...projects];
    const [project] = reordered.splice(index, 1);

    switch (direction) {
      case "up":
        if (index > 0) reordered.splice(index - 1, 0, project);
        else reordered.unshift(project);
        break;
      case "down":
        if (index < reordered.length) reordered.splice(index + 1, 0, project);
        else reordered.push(project);
        break;
      case "top":
        reordered.unshift(project);
        break;
      case "bottom":
        reordered.push(project);
        break;
    }

    updateSection("projects", reordered);
    toast(`Project moved ${direction}`);
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

      <div className="mt-6 space-y-4">
        {projects.map((p, idx) => (
          <article
            key={p.id}
            className={`rounded-lg border p-4 transition-all space-y-4 ${
              p.hidden ? "opacity-50 grayscale" : ""
            } ${
              p.featured && !p.hidden ? "border-accent/40 bg-accent/[0.05]" : "border-white/10 bg-white/[0.02]"
            }`}
          >
            {/* Main row: Thumbnail, Title/Details, Action buttons */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3.5 min-w-0 flex-1">
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
              </div>

              {/* Top-right action buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => togglePin(p.id!)}
                  className={`rounded-full border px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-colors ${
                    p.featured
                      ? "border-accent bg-accent text-black hover:bg-yellow-300"
                      : "border-white/20 text-gray-300 hover:border-accent hover:text-accent"
                  }`}
                >
                  {p.featured ? "★ Pinned" : "Pin to Top"}
                </button>
                <VisibilityToggle small hidden={!!p.hidden} onToggle={() => toggleVisibility(p.id!)} />
                <button
                  onClick={() => setEditing({ ...p })}
                  className="rounded-full border border-white/20 px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-300 transition-colors hover:border-accent hover:text-accent"
                >
                  Edit
                </button>
                <DeleteButton small onDelete={() => remove(p.id!)} />
              </div>
            </div>

            {/* Bottom Row: Reorder Buttons Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-accent flex items-center gap-1.5">
                <span>↕ Order Position:</span>
                <span className="text-gray-300 font-bold bg-white/10 px-2 py-0.5 rounded text-[10px]">#{idx + 1}</span>
              </span>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => moveProject(p.id!, "top")}
                  disabled={idx === 0}
                  title="Move to top position"
                  className="flex items-center gap-1.5 rounded-md bg-accent px-3 py-1.5 text-xs font-bold text-black transition-all hover:bg-yellow-300 disabled:opacity-30 disabled:hover:bg-accent"
                >
                  <MoveToTopIcon className="h-4 w-4" />
                  <span>Top</span>
                </button>
                <button
                  onClick={() => moveProject(p.id!, "up")}
                  disabled={idx === 0}
                  title="Move one position up"
                  className="flex items-center gap-1.5 rounded-md bg-white/15 px-3 py-1.5 text-xs font-bold text-white transition-all hover:bg-white hover:text-black disabled:opacity-30 disabled:hover:bg-white/15 disabled:hover:text-white"
                >
                  <ArrowUpIcon className="h-4 w-4" />
                  <span>Up (↑)</span>
                </button>
                <button
                  onClick={() => moveProject(p.id!, "down")}
                  disabled={idx === projects.length - 1}
                  title="Move one position down"
                  className="flex items-center gap-1.5 rounded-md bg-white/15 px-3 py-1.5 text-xs font-bold text-white transition-all hover:bg-white hover:text-black disabled:opacity-30 disabled:hover:bg-white/15 disabled:hover:text-white"
                >
                  <ArrowDownIcon className="h-4 w-4" />
                  <span>Down (↓)</span>
                </button>
                <button
                  onClick={() => moveProject(p.id!, "bottom")}
                  disabled={idx === projects.length - 1}
                  title="Move to bottom position"
                  className="flex items-center gap-1.5 rounded-md bg-white/15 px-3 py-1.5 text-xs font-bold text-white transition-all hover:bg-white hover:text-black disabled:opacity-30 disabled:hover:bg-white/15 disabled:hover:text-white"
                >
                  <MoveToBottomIcon className="h-4 w-4" />
                  <span>Bottom</span>
                </button>
              </div>
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
```
