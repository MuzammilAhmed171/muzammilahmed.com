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

  /* Debounced push to the backend when an admin is signed in */
  const queuePush = useCallback(() => {
    if (!apiEnabled || !getToken()) return;
    if (pushTimer.current) window.clearTimeout(pushTimer.current);
    pushTimer.current = window.setTimeout(() => {
      api.content.push(contentRef.current).catch(() => {});
    }, 900);
  }, []);

  /* Hydrate from the backend once (public view) */
  useEffect(() => {
    if (!apiEnabled) return;
    let cancelled = false;
    api.content
      .fetchPublic()
      .then(({ content: remote, empty }) => {
        if (cancelled || empty || !remote) return;
        setContent((prev) => ({ ...prev, ...remote, messages: prev.messages }));
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
        if (!empty && full) setContent(mergeContent(full));
      })
      .catch(() => {});
  }, []);

  const updateSection = useCallback(
    <K extends keyof SiteContent>(key: K, value: SiteContent[K]) => {
      setContent((c) => ({ ...c, [key]: value }));
      queuePush();
    },
    [queuePush],
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
