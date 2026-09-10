import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  BASIC_INFO,
  CONTACT_ITEMS,
  INFO_GRID,
  PROFILE_IMAGE,
  PROJECTS,
  REVIEWS,
  SKILLS,
  TESTIMONIALS,
  uid,
  type SiteContent,
} from "../data";
import { api, apiEnabled, getToken } from "../lib/api";

export type { SiteContent };

/* Defaults (the original site content) */
const DEFAULT_CONTENT: SiteContent = {
  settings: {
    logoFirst: "Muzammil",
    logoSecond: "Ahmed",
    sideSignature: "Muzammil Ahmed • 2026",
    copyrightName: "Muzammil Ahmed",
    email: "muzammil.ahmed.dev@gmail.com",
    adminPassword: "admin123",
    navLinks: [
      { id: "home", label: "Home" },
      { id: "about", label: "About" },
      { id: "projects", label: "Projects" },
      { id: "contact", label: "Contact" },
    ],
    resume: { fileName: "Muzammil-Ahmed-Resume.pdf", data: "" },
  },
  hero: {
    greeting: "Hello!",
    nameIntro: "I'm",
    name: "Muzammil Ahmed",
    roleLine1: "Web Developer",
    roleLine2: "A Senior MERN Stack Developer and AI/ML Engineer",
    buttonText: "My Works",
    buttonLink: "#projects",
    orbitText: "MERN Stack Developer • React • Node • AI • ML •",
  },
  about: {
    profileImage: PROFILE_IMAGE,
    headline: "Professional FullStack Developer with [x]Three Years[/x] of Experience",
    bioParagraphs: [
      "I am Muzammil Ahmed, a Senior MERN Stack Web Developer and AI/ML Engineer from Hyderabad, Pakistan. I craft fast, scalable and pixel-perfect web applications with React.js on the front end and Node.js, Express and MongoDB on the back end, handling everything from REST APIs and secure auth to real-time features and cloud deployments.",
      "Beyond the web, I train and deploy machine learning and deep learning models, from recommendation engines to computer vision, and I love shipping AI features inside real products.",
    ],
    basicInfo: BASIC_INFO,
    skills: SKILLS,
    infoGrid: INFO_GRID,
    statNumber: "30+",
    statLabel: "Projects completed",
    buttonText: "Visit",
  },
  projects: PROJECTS,
  reviews: REVIEWS,
  testimonials: TESTIMONIALS,
  contactItems: CONTACT_ITEMS,
  messages: [],
};

const STORAGE_KEY = "ma_portfolio_content_v2";

function withIds<T extends { id?: string }>(arr: T[], prefix: string): T[] {
  return arr.map((x, i) => (x.id ? x : { ...x, id: `${prefix}_${i}` }));
}

/**
 * Deep-merge `remote` onto `local`, but when the remote value is an empty
 * string and the local value is non-empty, keep the local value.
 * This prevents backend-stored "" (stripped data-URLs) from wiping good
 * images that are cached in localStorage.
 *
 * For arrays of objects that have an `id` field, matching is done by id
 * (not by index) so that adding/reordering items doesn't corrupt images.
 */
function mergePreferLocal(local: unknown, remote: unknown): unknown {
  // "" remote → keep local non-empty string (e.g. base64 data URL)
  if (typeof remote === "string" && remote === "" && typeof local === "string" && local !== "") {
    return local;
  }

  // objects → recurse key-by-key
  if (
    remote !== null &&
    typeof remote === "object" &&
    !Array.isArray(remote) &&
    local !== null &&
    typeof local === "object" &&
    !Array.isArray(local)
  ) {
    const out: Record<string, unknown> = { ...(remote as Record<string, unknown>) };
    for (const key of Object.keys(out)) {
      out[key] = mergePreferLocal(
        (local as Record<string, unknown>)[key],
        (remote as Record<string, unknown>)[key],
      );
    }
    return out;
  }

  // arrays of objects with id → id-based lookup so indices don't matter
  if (Array.isArray(remote) && Array.isArray(local)) {
    const localById = new Map<string, unknown>();
    for (const item of local) {
      if (item && typeof item === "object" && (item as Record<string, unknown>).id) {
        localById.set(String((item as Record<string, unknown>).id), item);
      }
    }

    return remote.map((item, i) => {
      const remoteId = item && typeof item === "object" ? (item as Record<string, unknown>).id : undefined;
      // For objects with id: look up by id first, then fall back to position
      const localItem = remoteId ? (localById.get(String(remoteId)) ?? local[i]) : local[i];
      return mergePreferLocal(localItem, item);
    });
  }

  return remote;
}

function mergeContent(saved: Partial<SiteContent> | null): SiteContent {
  if (!saved || typeof saved !== "object") return DEFAULT_CONTENT;
  return {
    settings: {
      ...DEFAULT_CONTENT.settings,
      ...(saved.settings ?? {}),
      resume: saved.settings?.resume ?? DEFAULT_CONTENT.settings.resume,
    },
    hero: { ...DEFAULT_CONTENT.hero, ...(saved.hero ?? {}) },
    about: { ...DEFAULT_CONTENT.about, ...(saved.about ?? {}) },
    projects: withIds(Array.isArray(saved.projects) ? saved.projects : DEFAULT_CONTENT.projects, "pj"),
    reviews: withIds(Array.isArray(saved.reviews) ? saved.reviews : DEFAULT_CONTENT.reviews, "rv"),
    testimonials: withIds(
      Array.isArray(saved.testimonials) ? saved.testimonials : DEFAULT_CONTENT.testimonials,
      "tm",
    ),
    contactItems: Array.isArray(saved.contactItems) ? saved.contactItems : DEFAULT_CONTENT.contactItems,
    messages: Array.isArray(saved.messages) ? saved.messages : [],
  };
}

export function loadContent(): SiteContent {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? mergeContent(JSON.parse(raw) as Partial<SiteContent>) : DEFAULT_CONTENT;
  } catch {
    return DEFAULT_CONTENT;
  }
}

type ContentStore = {
  content: SiteContent;
  updateSection: <K extends keyof SiteContent>(key: K, value: SiteContent[K]) => void;
  addMessage: (m: { name: string; email: string; subject: string; message: string }) => void;
  resetAll: () => void;
  importContent: (json: string) => boolean;
  refreshFromServer: () => void;
};

const ContentContext = createContext<ContentStore | null>(null);

export function ContentProvider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState<SiteContent>(loadContent);
  const contentRef = useRef(content);
  const pushTimer = useRef<number | null>(null);

  useEffect(() => {
    contentRef.current = content;
  }, [content]);

  /* Persist locally always (offline fallback + cache) */
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(content));
    } catch {
      /* storage full, content stays in memory */
    }
  }, [content]);

  /* Hydrate from the backend once (public view) */
  useEffect(() => {
    if (!apiEnabled) return;
    let cancelled = false;
    api.content
      .fetchPublic()
      .then(({ content: remote, empty }) => {
        if (cancelled || empty || !remote) return;
        // mergePreferLocal keeps local images (base64) when backend has ""
        setContent((prev) => ({
          ...(mergePreferLocal(prev, remote) as SiteContent),
          messages: prev.messages,
        }));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const refreshFromServer = useCallback(() => {
    if (!apiEnabled || !getToken()) return;
    api.content
      .fetchFull()
      .then(({ content: full, empty }) => {
        if (!empty && full)
          // preserve local images (base64) that the backend stripped to ""
          setContent((prev) => ({
            ...(mergePreferLocal(prev, mergeContent(full)) as SiteContent),
          }));
      })
      .catch(() => {});
  }, []);

  /* Immediately sync section update to backend & local storage */
  const updateSection = useCallback(
    async <K extends keyof SiteContent>(key: K, value: SiteContent[K]) => {
      const nextContent = { ...contentRef.current, [key]: value };
      setContent(nextContent);
      contentRef.current = nextContent;

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(nextContent));
      } catch {
        /* storage full, content stays in memory */
      }

      if (apiEnabled && getToken()) {
        if (pushTimer.current) window.clearTimeout(pushTimer.current);
        try {
          await api.content.push(nextContent);
        } catch (err) {
          console.error("[store] Instant push to backend failed:", err);
        }
      }
    },
    [],
  );

  const addMessage = useCallback(
    (m: { name: string; email: string; subject: string; message: string }) => {
      setContent((c) => ({
        ...c,
        messages: [{ ...m, id: uid(), date: new Date().toISOString(), read: false }, ...c.messages],
      }));
      if (apiEnabled) api.messages.send(m).catch(() => {});
    },
    [],
  );

  const resetAll = useCallback(() => {
    setContent(DEFAULT_CONTENT);
  }, []);

  const importContent = useCallback((json: string): boolean => {
    try {
      const parsed = JSON.parse(json) as Partial<SiteContent>;
      if (!parsed || typeof parsed !== "object" || !parsed.hero) return false;
      setContent(mergeContent(parsed));
      return true;
    } catch {
      return false;
    }
  }, []);

  return (
    <ContentContext.Provider
      value={{ content, updateSection, addMessage, resetAll, importContent, refreshFromServer }}
    >
      {children}
    </ContentContext.Provider>
  );
}

export function useContent() {
  const ctx = useContext(ContentContext);
  if (!ctx) throw new Error("useContent must be used inside ContentProvider");
  return ctx;
}
