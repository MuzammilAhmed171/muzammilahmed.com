import { useRef, useState, type ChangeEvent } from "react";
import { useContent, type AboutContent, type ContactItem, type HeroContent, type SiteSettings } from "../../store/content";
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
  useToast,
} from "../controls";

const ICON_OPTIONS = [
  { value: "signpost", label: "Signpost (Address)" },
  { value: "phone", label: "Phone" },
  { value: "plane", label: "Paper Plane (Email)" },
  { value: "globe", label: "Globe (Resume / Web)" },
];

/* ------------------------------------------------------------------ */
/*  Hero                                                               */
/* ------------------------------------------------------------------ */

export function HeroTab() {
  const { content, updateSection } = useContent();
  const toast = useToast();
  const [draft, setDraft] = useState<HeroContent>(content.hero);
  const dirty = JSON.stringify(draft) !== JSON.stringify(content.hero);
  const set = <K extends keyof HeroContent>(k: K, v: HeroContent[K]) =>
    setDraft((d) => ({ ...d, [k]: v }));

  return (
    <div>
      <div className="grid gap-5 sm:grid-cols-2">
        <TextInput label="Greeting" value={draft.greeting} onChange={(v) => set("greeting", v)} />
        <TextInput label="Name intro" value={draft.nameIntro} onChange={(v) => set("nameIntro", v)} hint="Shown before the name, e.g. I am" />
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
        <TextInput
          label="Rotating badge text"
          value={draft.orbitText}
          onChange={(v) => set("orbitText", v)}
          hint="The circular rotating text on the right side of the hero."
        />
      </div>
      <SaveBar
        dirty={dirty}
        onSave={() => {
          updateSection("hero", draft);
          toast("Hero section updated");
        }}
        onDiscard={() => setDraft(content.hero)}
      />
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
  const set = <K extends keyof AboutContent>(k: K, v: AboutContent[K]) =>
    setDraft((d) => ({ ...d, [k]: v }));

  return (
    <div className="space-y-6">
      <ImagePicker
        label="Profile picture"
        value={draft.profileImage}
        onChange={(v) => set("profileImage", v)}
        hint="Shown in the yellow offset circle."
      />
      <TextInput
        label="Headline"
        value={draft.headline}
        onChange={(v) => set("headline", v)}
        hint="Wrap any words in [x]…[/x] to highlight them in yellow."
      />
      <ParagraphsEditor
        label="Bio paragraphs"
        items={draft.bioParagraphs}
        onChange={(v) => set("bioParagraphs", v)}
      />
      <PairsEditor
        label="Basic info list"
        items={draft.basicInfo}
        onChange={(v) => set("basicInfo", v)}
        addLabel="Add info row"
      />
      <SkillsEditor label="Skill bars" items={draft.skills} onChange={(v) => set("skills", v)} />
      <PairsEditor
        label="Info grid (Profile / Education / …)"
        items={draft.infoGrid}
        onChange={(v) => set("infoGrid", v)}
        addLabel="Add grid item"
      />
      <div className="grid gap-5 sm:grid-cols-3">
        <TextInput label="Stat number" value={draft.statNumber} onChange={(v) => set("statNumber", v)} hint='e.g. "30+"' />
        <TextInput label="Stat label" value={draft.statLabel} onChange={(v) => set("statLabel", v)} />
        <TextInput label="Button text" value={draft.buttonText} onChange={(v) => set("buttonText", v)} />
      </div>
      <SaveBar
        dirty={dirty}
        onSave={() => {
          updateSection("about", draft);
          toast("About section updated");
        }}
        onDiscard={() => setDraft(content.about)}
      />
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

  const update = (i: number, patch: Partial<ContactItem>) =>
    setDraft((d) => d.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));

  return (
    <div>
      <p className="mb-6 rounded-lg border border-white/10 bg-white/[0.02] p-4 text-xs leading-relaxed text-gray-500">
        These are the four icon cards in the Contact section. <span className="text-gray-300">Link</span>{" "}
        is optional. Use <span className="text-accent">tel:…</span>,{" "}
        <span className="text-accent">mailto:…</span> or any URL.
      </p>
      <div className="space-y-5">
        {draft.map((item, i) => (
          <div key={i} className="rounded-lg border border-white/10 bg-white/[0.02] p-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <TextInput label="Title" value={item.title} onChange={(v) => update(i, { title: v })} />
              <SelectInput
                label="Icon"
                value={item.icon}
                onChange={(v) => update(i, { icon: v as ContactItem["icon"] })}
                options={ICON_OPTIONS}
              />
              <TextInput label="Value" value={item.value} onChange={(v) => update(i, { value: v })} />
              <TextInput label="Link (optional)" value={item.href ?? ""} onChange={(v) => update(i, { href: v || undefined })} />
            </div>
            <div className="mt-3 flex justify-end">
              <DeleteButton small label="Remove card" onDelete={() => setDraft((d) => d.filter((_, idx) => idx !== i))} />
            </div>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() =>
          setDraft((d) => [...d, { title: "New Card", value: "...", icon: "globe" }])
        }
        className="mt-4 inline-flex items-center gap-2 rounded-full border border-dashed border-white/25 px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider text-gray-300 transition-colors hover:border-accent hover:text-accent"
      >
        <span className="text-sm leading-none">+</span> Add contact card
      </button>
      <SaveBar
        dirty={dirty}
        onSave={() => {
          updateSection("contactItems", draft);
          toast("Contact cards updated");
        }}
        onDiscard={() => setDraft(content.contactItems)}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Settings                                                           */
/* ------------------------------------------------------------------ */

/** Change-password card — new password only saves after OTP verification. */
function SecurityCard() {
  const { content, updateSection } = useContent();
  const toast = useToast();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [otpOpen, setOtpOpen] = useState(false);

  const request = () => {
    if (!current) return setError("Enter your current password first.");
    if (current !== content.settings.adminPassword)
      return setError("Current password is incorrect.");
    if (next.length < 6) return setError("New password must be at least 6 characters.");
    if (next !== confirm) return setError("New passwords do not match.");
    setError("");
    setOtpOpen(true);
  };

  const apply = () => {
    updateSection("settings", { ...content.settings, adminPassword: next });
    setOtpOpen(false);
    setCurrent("");
    setNext("");
    setConfirm("");
    toast("Password changed successfully");
  };

  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.02] p-5">
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-full border border-accent/40 bg-accent/10 text-accent">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4"
            aria-hidden="true"
          >
            <rect x="4.5" y="10.5" width="15" height="9.5" rx="2" />
            <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" />
            <path d="M12 14.5v2" />
          </svg>
        </span>
        <div>
          <h3 className="font-display text-sm font-bold text-white">Security: Change Password</h3>
          <p className="text-[11px] text-gray-500">
            New password OTP verification ke baad hi save hota hai.
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        <PasswordInput
          label="Current password"
          value={current}
          onChange={(v) => {
            setCurrent(v);
            setError("");
          }}
        />
        <PasswordInput
          label="New password"
          value={next}
          onChange={(v) => {
            setNext(v);
            setError("");
          }}
          hint="At least 6 characters"
        />
        <PasswordInput
          label="Confirm new password"
          value={confirm}
          onChange={(v) => {
            setConfirm(v);
            setError("");
          }}
        />
      </div>

      {error ? <p className="mt-3 text-xs text-red-400">{error}</p> : null}

      <button
        type="button"
        onClick={request}
        className="mt-4 rounded-full bg-accent px-6 py-2 text-[11px] font-bold uppercase tracking-wider text-black transition-all hover:bg-yellow-300 hover:shadow-[0_8px_28px_rgba(255,193,7,0.35)]"
      >
        Change Password
      </button>

      <OtpModal
        open={otpOpen}
        title="Verify it's you"
        description={`We sent a 6-digit code to ${content.settings.email}. Enter it to confirm the password change.`}
        onClose={() => setOtpOpen(false)}
        onVerified={apply}
      />
    </div>
  );
}

export function SettingsTab() {
  const { content, updateSection, resetAll, importContent } = useContent();
  const toast = useToast();
  const [draft, setDraft] = useState<SiteSettings>(content.settings);
  // Password lives in the Security card — exclude it from the dirty check.
  const dirty =
    JSON.stringify({ ...draft, adminPassword: content.settings.adminPassword }) !==
    JSON.stringify(content.settings);
  const set = <K extends keyof SiteSettings>(k: K, v: SiteSettings[K]) =>
    setDraft((d) => ({ ...d, [k]: v }));
  const importRef = useRef<HTMLInputElement>(null);

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
      if (ok) setDraft((d) => d); // keep draft; content replaced
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-5 sm:grid-cols-2">
        <TextInput label="Logo, first word (white)" value={draft.logoFirst} onChange={(v) => set("logoFirst", v)} />
        <TextInput label="Logo, second word (yellow)" value={draft.logoSecond} onChange={(v) => set("logoSecond", v)} />
        <TextInput
          label="Side signature"
          value={draft.sideSignature}
          onChange={(v) => set("sideSignature", v)}
          hint="Vertical text on the left edge of the website."
        />
        <TextInput label="Copyright name" value={draft.copyrightName} onChange={(v) => set("copyrightName", v)} />
        <TextInput label="Direct email" value={draft.email} onChange={(v) => set("email", v)} hint='Used for the "Prefer writing directly?" link. Also the email that receives OTP codes.' />
      </div>

      <SecurityCard />

      <ResumePicker label="Resume (PDF)" value={draft.resume} onChange={(v) => set("resume", v)} />

      <div>
        <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.16em] text-gray-400">
          Navigation links
        </p>
        <div className="space-y-2">
          {draft.navLinks.map((link, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                value={link.label}
                onChange={(e) =>
                  set(
                    "navLinks",
                    draft.navLinks.map((l, idx) => (idx === i ? { ...l, label: e.target.value } : l)),
                  )
                }
                className="w-full rounded-md border border-white/10 bg-neutral-950 px-3.5 py-2.5 text-sm text-white outline-none focus:border-accent"
              />
              <span className="w-24 shrink-0 text-center text-[10px] uppercase tracking-widest text-gray-600">
                #{link.id}
              </span>
            </div>
          ))}
        </div>
      </div>

      <SaveBar
        dirty={dirty}
        onSave={() => {
          // Password is managed by the Security card — always keep the live one.
          updateSection("settings", {
            ...draft,
            adminPassword: content.settings.adminPassword,
          });
          toast("Settings saved");
        }}
        onDiscard={() => setDraft(content.settings)}
      />

      <div className="mt-10 rounded-lg border border-white/10 bg-white/[0.02] p-5">
        <h3 className="font-display text-sm font-bold text-white">Backup &amp; Data</h3>
        <p className="mt-1.5 text-xs leading-relaxed text-gray-500">
          Export all website content as JSON, or restore from a previous backup. Reset brings
          back the original demo content.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            onClick={exportJson}
            className="rounded-full bg-accent px-5 py-2 text-[11px] font-bold uppercase tracking-wider text-black transition-colors hover:bg-yellow-300"
          >
            Export JSON
          </button>
          <input ref={importRef} type="file" accept="application/json" className="hidden" onChange={onImport} />
          <button
            onClick={() => importRef.current?.click()}
            className="rounded-full border border-white/20 px-5 py-2 text-[11px] font-bold uppercase tracking-wider text-gray-300 transition-colors hover:border-accent hover:text-accent"
          >
            Import JSON
          </button>
          <DeleteButton label="Reset All Content" onDelete={() => { resetAll(); toast("All content restored to defaults"); }} />
        </div>
      </div>
    </div>
  );
}
