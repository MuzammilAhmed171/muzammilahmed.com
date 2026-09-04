import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type ReactNode,
} from "react";
import { CloseIcon, EyeIcon, EyeOffIcon } from "../components/Icons";
import type { LabelValue, SkillRow } from "../data";
import { api, apiEnabled } from "../lib/api";

/* ------------------------------------------------------------------ */
/*  Toasts                                                             */
/* ------------------------------------------------------------------ */

type Toast = { id: number; text: string; tone: "ok" | "err" };
const ToastContext = createContext<(text: string, tone?: "ok" | "err") => void>(() => {});

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const push = useCallback((text: string, tone: "ok" | "err" = "ok") => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, text, tone }]);
    window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3400);
  }, []);

  return (
    <ToastContext.Provider value={push}>
      {children}
      <div className="pointer-events-none fixed bottom-5 right-5 z-[110] flex w-72 flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto animate-pop-in rounded-lg border px-4 py-3 text-sm shadow-[0_12px_40px_rgba(0,0,0,0.6)] backdrop-blur ${
              t.tone === "ok" ? "border-accent/40 bg-black/90 text-accent" : "border-red-400/40 bg-black/90 text-red-400"
            }`}
          >
            {t.text}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);

/* ------------------------------------------------------------------ */
/*  Basic fields                                                       */
/* ------------------------------------------------------------------ */

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block">
      {label ? (
        <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.16em] text-gray-400">{label}</span>
      ) : null}
      {children}
      {hint ? <span className="mt-1.5 block text-xs text-gray-600">{hint}</span> : null}
    </label>
  );
}

const inputCls =
  "w-full rounded-md border border-white/10 bg-neutral-950 px-3.5 py-2.5 text-sm text-white placeholder-gray-600 outline-none transition-colors focus:border-accent";

export function TextInput({
  label,
  value,
  onChange,
  placeholder,
  hint,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  hint?: string;
  type?: string;
}) {
  return (
    <Field label={label} hint={hint}>
      <input type={type} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} className={inputCls} />
    </Field>
  );
}

export function TextArea({
  label,
  value,
  onChange,
  rows = 4,
  placeholder,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  placeholder?: string;
  hint?: string;
}) {
  return (
    <Field label={label} hint={hint}>
      <textarea value={value} rows={rows} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} className={`${inputCls} resize-y`} />
    </Field>
  );
}

export function SelectInput({
  label,
  value,
  onChange,
  options,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  hint?: string;
}) {
  return (
    <Field label={label} hint={hint}>
      <select value={value} onChange={(e) => onChange(e.target.value)} className={inputCls}>
        {options.map((o) => (
          <option key={o.value} value={o.value} className="bg-neutral-950">
            {o.label}
          </option>
        ))}
      </select>
    </Field>
  );
}

export function Toggle({ label, checked, onChange, hint }: { label: string; checked: boolean; onChange: (v: boolean) => void; hint?: string }) {
  return (
    <button type="button" onClick={() => onChange(!checked)} className="flex items-center gap-3 text-left">
      <span className={`relative h-6 w-11 shrink-0 rounded-full transition-colors duration-300 ${checked ? "bg-accent" : "bg-gray-700"}`}>
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-black transition-all duration-300 ${checked ? "left-[22px]" : "left-0.5"}`} />
      </span>
      <span>
        <span className="block text-sm font-medium text-white">{label}</span>
        {hint ? <span className="block text-xs text-gray-600">{hint}</span> : null}
      </span>
    </button>
  );
}

/* Password input with show/hide eye button. */
export function PasswordInput({
  label,
  value,
  onChange,
  placeholder,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  hint?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <Field label={label} hint={hint}>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className={`${inputCls} pr-11`}
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          aria-label={show ? "Hide password" : "Show password"}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 transition-colors hover:text-accent"
        >
          {show ? <EyeOffIcon className="h-4.5 w-4.5" /> : <EyeIcon className="h-4.5 w-4.5" />}
        </button>
      </div>
    </Field>
  );
}

/* ------------------------------------------------------------------ */
/*  Media helpers                                                      */
/* ------------------------------------------------------------------ */

export function fileToImage(file: File, maxW = 1400): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxW / img.width);
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(img.width * scale));
        canvas.height = Math.max(1, Math.round(img.height * scale));
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(String(reader.result));
          return;
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.85));
      };
      img.onerror = () => reject(new Error("Invalid image file"));
      img.src = String(reader.result);
    };
    reader.onerror = () => reject(new Error("Could not read file"));
    reader.readAsDataURL(file);
  });
}

export function videoEmbed(url: string): { type: "iframe" | "video"; src: string } | null {
  if (!url) return null;
  const yt = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{6,})/);
  if (yt) return { type: "iframe", src: `https://www.youtube.com/embed/${yt[1]}` };
  const vm = url.match(/vimeo\.com\/(\d+)/);
  if (vm) return { type: "iframe", src: `https://player.vimeo.com/video/${vm[1]}` };
  return { type: "video", src: url };
}

/* Upload a file: uses the backend when available, else local data-URL. */
async function uploadOrLocal(file: File, local: () => Promise<string>): Promise<string> {
  if (apiEnabled) {
    const { url } = await api.upload(file);
    return url;
  }
  return local();
}

/* ------------------------------------------------------------------ */
/*  Media pickers                                                      */
/* ------------------------------------------------------------------ */

export function ImagePicker({ label, value, onChange, hint }: { label: string; value: string; onChange: (v: string) => void; hint?: string }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const toast = useToast();

  const onFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setBusy(true);
    try {
      onChange(await uploadOrLocal(file, () => fileToImage(file)));
      toast("Image ready. Don't forget to Save");
    } catch {
      toast("Could not read that image file", "err");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Field label={label} hint={hint}>
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFile} />
      <div className="flex items-start gap-4">
        <div className="flex h-24 w-32 shrink-0 items-center justify-center overflow-hidden rounded-md border border-white/10 bg-neutral-950">
          {value ? <img src={value} alt="" className="h-full w-full object-cover" /> : <span className="text-[10px] uppercase tracking-widest text-gray-600">No image</span>}
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <input
            value={value.startsWith("data:") ? "(uploaded image data)" : value}
            placeholder="…or paste an image URL"
            onChange={(e) => onChange(e.target.value)}
            className={inputCls}
          />
          <div className="flex gap-2">
            <button type="button" onClick={() => fileRef.current?.click()} className="rounded-full border border-accent/50 px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider text-accent transition-colors hover:bg-accent hover:text-black">
              {busy ? "Reading…" : "Upload"}
            </button>
            {value ? (
              <button type="button" onClick={() => onChange("")} className="rounded-full border border-white/15 px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider text-gray-400 transition-colors hover:border-red-400 hover:text-red-400">
                Remove
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </Field>
  );
}

export function VideoPicker({ label, value, onChange, hint }: { label: string; value: string; onChange: (v: string) => void; hint?: string }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const toast = useToast();
  const embed = value ? videoEmbed(value) : null;

  const onFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!apiEnabled && file.size > 4 * 1024 * 1024) {
      toast("Video too big (max 4MB). Paste a YouTube/Vimeo link instead", "err");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      onChange(String(reader.result));
      toast("Video attached. Don't forget to Save");
    };
    reader.readAsDataURL(file);
  };

  return (
    <Field label={label} hint={hint ?? "Paste a YouTube / Vimeo link, or upload a small video file."}>
      <input ref={fileRef} type="file" accept="video/*" className="hidden" onChange={onFile} />
      <div className="space-y-2">
        {embed ? (
          <div className="overflow-hidden rounded-md border border-white/10">
            {embed.type === "iframe" ? (
              <iframe src={embed.src} title="Video preview" className="h-40 w-full" allowFullScreen />
            ) : (
              <video src={embed.src} controls className="h-40 w-full bg-black object-cover" />
            )}
          </div>
        ) : null}
        <input
          value={value.startsWith("data:") ? "(uploaded video data)" : value}
          placeholder="https://www.youtube.com/watch?v=…"
          onChange={(e) => onChange(e.target.value)}
          className={inputCls}
        />
        <div className="flex gap-2">
          <button type="button" onClick={() => fileRef.current?.click()} className="rounded-full border border-accent/50 px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider text-accent transition-colors hover:bg-accent hover:text-black">
            Upload Video
          </button>
          {value ? (
            <button type="button" onClick={() => onChange("")} className="rounded-full border border-white/15 px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider text-gray-400 transition-colors hover:border-red-400 hover:text-red-400">
              Remove
            </button>
          ) : null}
        </div>
      </div>
    </Field>
  );
}

export function ResumePicker({ label, value, onChange, hint }: { label: string; value: { fileName: string; data: string }; onChange: (v: { fileName: string; data: string }) => void; hint?: string }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

  const onFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!apiEnabled && file.size > 3 * 1024 * 1024) {
      toast("Resume too big (max 3MB) for browser storage. Use a Drive/Dropbox link", "err");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      onChange({ fileName: file.name, data: String(reader.result) });
      toast("Resume attached. Don't forget to Save");
    };
    reader.readAsDataURL(file);
  };

  return (
    <Field label={label} hint={hint ?? "Upload a PDF, or paste a Drive/Dropbox link. Visitors download it from the Resume card."}>
      <input ref={fileRef} type="file" accept="application/pdf,.pdf" className="hidden" onChange={onFile} />
      <div className="space-y-2">
        <input
          value={value.data.startsWith("data:") ? `(uploaded) ${value.fileName}` : value.data}
          placeholder="https://drive.google.com/…  (or upload below)"
          onChange={(e) => onChange({ fileName: value.fileName, data: e.target.value })}
          className={inputCls}
        />
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => fileRef.current?.click()} className="rounded-full border border-accent/50 px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider text-accent transition-colors hover:bg-accent hover:text-black">
            Upload PDF
          </button>
          {value.data ? (
            <>
              <a
                href={value.data}
                download={value.fileName || "resume.pdf"}
                target={value.data.startsWith("data:") ? undefined : "_blank"}
                rel="noreferrer"
                className="rounded-full border border-white/15 px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider text-gray-300 transition-colors hover:border-accent hover:text-accent"
              >
                Test Download
              </a>
              <button type="button" onClick={() => onChange({ fileName: "", data: "" })} className="rounded-full border border-white/15 px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider text-gray-400 transition-colors hover:border-red-400 hover:text-red-400">
                Remove
              </button>
            </>
          ) : null}
        </div>
      </div>
    </Field>
  );
}

/* ------------------------------------------------------------------ */
/*  List editors                                                       */
/* ------------------------------------------------------------------ */

function RowRemove({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} aria-label="Remove row" className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-white/10 text-gray-500 transition-colors hover:border-red-400/60 hover:text-red-400">
      <CloseIcon className="h-4 w-4" />
    </button>
  );
}

export function PairsEditor({ label, items, onChange, addLabel = "Add item", hint }: { label: string; items: LabelValue[]; onChange: (v: LabelValue[]) => void; addLabel?: string; hint?: string }) {
  return (
    <Field label={label} hint={hint}>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex items-start gap-2">
            <input value={item.label} placeholder="Label" onChange={(e) => onChange(items.map((it, idx) => (idx === i ? { ...it, label: e.target.value } : it)))} className={`${inputCls} w-2/5`} />
            <input value={item.value} placeholder="Value" onChange={(e) => onChange(items.map((it, idx) => (idx === i ? { ...it, value: e.target.value } : it)))} className={`${inputCls} flex-1`} />
            <RowRemove onClick={() => onChange(items.filter((_, idx) => idx !== i))} />
          </div>
        ))}
        <AddButton onClick={() => onChange([...items, { label: "", value: "" }])}>{addLabel}</AddButton>
      </div>
    </Field>
  );
}

export function SkillsEditor({ label, items, onChange }: { label: string; items: SkillRow[]; onChange: (v: SkillRow[]) => void }) {
  return (
    <Field label={label}>
      <div className="space-y-2">
        {items.map((skill, i) => (
          <div key={i} className="flex items-center gap-3">
            <input value={skill.name} placeholder="Skill name" onChange={(e) => onChange(items.map((s, idx) => (idx === i ? { ...s, name: e.target.value } : s)))} className={`${inputCls} flex-1`} />
            <input type="range" min={0} max={100} value={skill.level} onChange={(e) => onChange(items.map((s, idx) => (idx === i ? { ...s, level: Number(e.target.value) } : s)))} className="w-28 accent-[#ffc107]" />
            <span className="w-11 text-right font-display text-sm font-bold text-accent">{skill.level}%</span>
            <RowRemove onClick={() => onChange(items.filter((_, idx) => idx !== i))} />
          </div>
        ))}
        <AddButton onClick={() => onChange([...items, { name: "", level: 80 }])}>Add skill</AddButton>
      </div>
    </Field>
  );
}

export function ParagraphsEditor({ label, items, onChange }: { label: string; items: string[]; onChange: (v: string[]) => void }) {
  return (
    <Field label={label}>
      <div className="space-y-3">
        {items.map((p, i) => (
          <div key={i} className="flex items-start gap-2">
            <textarea value={p} rows={4} onChange={(e) => onChange(items.map((x, idx) => (idx === i ? e.target.value : x)))} className={`${inputCls} flex-1 resize-y`} />
            <RowRemove onClick={() => onChange(items.filter((_, idx) => idx !== i))} />
          </div>
        ))}
        <AddButton onClick={() => onChange([...items, ""])}>Add paragraph</AddButton>
      </div>
    </Field>
  );
}

/* ------------------------------------------------------------------ */
/*  Action buttons                                                     */
/* ------------------------------------------------------------------ */

export function AddButton({ onClick, children }: { onClick: () => void; children: ReactNode }) {
  return (
    <button type="button" onClick={onClick} className="inline-flex items-center gap-2 rounded-full border border-dashed border-white/25 px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider text-gray-300 transition-colors hover:border-accent hover:text-accent">
      <span className="text-sm leading-none">+</span>
      {children}
    </button>
  );
}

export function SaveBar({ dirty, onSave, onDiscard }: { dirty: boolean; onSave: () => void; onDiscard: () => void }) {
  return (
    <div className={`sticky bottom-4 z-30 mt-10 flex items-center gap-3 rounded-lg border px-5 py-3.5 backdrop-blur transition-all duration-300 ${dirty ? "border-accent/40 bg-black/90 shadow-[0_14px_44px_rgba(0,0,0,0.7)]" : "border-white/10 bg-black/60"}`}>
      <span className={`h-2 w-2 rounded-full ${dirty ? "animate-pulse bg-accent" : "bg-gray-700"}`} />
      <span className="text-xs text-gray-400">{dirty ? "Unsaved changes" : "All changes saved"}</span>
      <div className="ml-auto flex gap-2.5">
        <button type="button" onClick={onDiscard} disabled={!dirty} className="rounded-full border border-white/15 px-5 py-2 text-[11px] font-bold uppercase tracking-wider text-gray-300 transition-colors enabled:hover:border-white enabled:hover:text-white disabled:opacity-40">
          Discard
        </button>
        <button type="button" onClick={onSave} disabled={!dirty} className="rounded-full bg-accent px-6 py-2 text-[11px] font-bold uppercase tracking-wider text-black transition-all enabled:hover:bg-yellow-300 enabled:hover:shadow-[0_8px_28px_rgba(255,193,7,0.35)] disabled:opacity-40">
          Save Changes
        </button>
      </div>
    </div>
  );
}

export function VisibilityToggle({ hidden, onToggle, small = false }: { hidden: boolean; onToggle: () => void; small?: boolean }) {
  const cls = small ? "rounded-md px-3 py-1.5 text-[10px] gap-1.5" : "rounded-full px-3.5 py-1.5 text-[10px] gap-1.5";
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={!hidden}
      title={hidden ? "Show on website" : "Hide from website"}
      className={`inline-flex items-center font-bold uppercase tracking-wider transition-colors ${cls} ${
        hidden
          ? "border border-white/15 bg-white/5 text-gray-500 hover:border-white/40 hover:text-gray-200"
          : "border border-accent/50 bg-accent/10 text-accent hover:bg-accent hover:text-black"
      }`}
    >
      {hidden ? <EyeOffIcon className="h-3.5 w-3.5" /> : <EyeIcon className="h-3.5 w-3.5" />}
      {hidden ? "Hidden" : "Public"}
    </button>
  );
}

export function DeleteButton({ onDelete, label = "Delete", small = false }: { onDelete: () => void; label?: string; small?: boolean }) {
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    if (!armed) return;
    const t = window.setTimeout(() => setArmed(false), 2600);
    return () => window.clearTimeout(t);
  }, [armed]);

  const cls = small ? "rounded-md px-3 py-1.5 text-[10px]" : "rounded-full px-4 py-1.5 text-[11px]";

  return armed ? (
    <button type="button" onClick={() => { onDelete(); setArmed(false); }} className={`${cls} font-bold uppercase tracking-wider bg-red-500 text-black transition-colors hover:bg-red-400`}>
      Confirm?
    </button>
  ) : (
    <button type="button" onClick={() => setArmed(true)} className={`${cls} font-bold uppercase tracking-wider border border-red-400/40 text-red-400 transition-colors hover:bg-red-400/10`}>
      {label}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  OTP modal                                                          */
/* ------------------------------------------------------------------ */

export function OtpModal({
  email,
  demoCode,
  onClose,
  onVerified,
  verifyRemote,
}: {
  email: string;
  demoCode: string;
  onClose: () => void;
  /* Receives the verified (or collected) code. */
  onVerified: (code: string) => void;
  /* When provided (backend mode) the code is checked on the server instead. */
  verifyRemote?: (code: string) => Promise<void>;
}) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setError("");
    const trimmed = code.trim();
    if (trimmed.length !== 6) {
      setError("Please enter the complete 6-digit code.");
      return;
    }
    if (verifyRemote) {
      setBusy(true);
      try {
        await verifyRemote(trimmed);
        onVerified(trimmed);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Incorrect code. Try again.");
      } finally {
        setBusy(false);
      }
      return;
    }
    if (trimmed === demoCode) {
      onVerified(trimmed);
    } else {
      setError("Incorrect code. Please check and try again.");
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-sm animate-pop-in rounded-xl border border-white/10 bg-[#0d0d0d] p-7" onClick={(e) => e.stopPropagation()}>
        <h3 className="font-display text-lg font-bold text-white">Verify it&apos;s you</h3>
        <p className="mt-1.5 text-xs text-gray-500">
          A 6-digit code was sent to <span className="text-gray-300">{email}</span>
        </p>

        {!verifyRemote && demoCode ? (
          <div className="mt-4 rounded-md border border-accent/40 bg-accent/10 px-4 py-3 text-center">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent/80">Demo mode: no email service yet</p>
            <p className="mt-1 font-display text-2xl font-extrabold tracking-[0.4em] text-accent">{demoCode}</p>
          </div>
        ) : null}

        <input
          autoFocus
          value={code}
          onChange={(e) => {
            setCode(e.target.value.replace(/\D/g, "").slice(0, 6));
            setError("");
          }}
          placeholder="••••••"
          inputMode="numeric"
          className="mt-5 w-full rounded-md border border-white/10 bg-neutral-950 px-4 py-3 text-center font-display text-xl font-bold tracking-[0.5em] text-white placeholder-gray-700 outline-none transition-colors focus:border-accent"
        />
        {error ? <p className="mt-2 text-xs text-red-400">{error}</p> : null}

        <div className="mt-5 flex gap-2.5">
          <button type="button" onClick={onClose} className="flex-1 rounded-full border border-white/15 py-2.5 text-[11px] font-bold uppercase tracking-wider text-gray-300 transition-colors hover:border-white hover:text-white">
            Cancel
          </button>
          <button type="button" onClick={submit} disabled={busy} className="flex-1 rounded-full bg-accent py-2.5 text-[11px] font-bold uppercase tracking-wider text-black transition-colors hover:bg-yellow-300 disabled:opacity-60">
            {busy ? "Verifying…" : "Verify"}
          </button>
        </div>
      </div>
    </div>
  );
}
