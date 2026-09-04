/* Types and default content for the whole site.
   Every field here is editable from the admin panel. */

export type LabelValue = { label: string; value: string };
export type SkillRow = { name: string; level: number };

export type Project = {
  id?: string;
  title: string;
  gallery: string[];
  liveUrl: string;
  description: string;
  stack: string[];
  featured?: boolean;
  hidden?: boolean;
};

export type Review = {
  id?: string;
  name: string;
  role: string;
  platform: string;
  rating: number;
  text: string;
  when: string;
  photo: string;
  initials: string;
  hidden?: boolean;
};

export type Testimonial = {
  id?: string;
  quote: string;
  name: string;
  role: string;
  project: string;
  initials: string;
  rating: number;
  video: string;
  duration: string;
  hidden?: boolean;
};

export type ContactItem = {
  title: string;
  value: string;
  icon: "signpost" | "phone" | "plane" | "globe";
  href?: string;
};

export type Message = {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  date: string;
  read: boolean;
};

export type HeroContent = {
  greeting: string;
  nameIntro: string;
  name: string;
  roleLine1: string;
  roleLine2: string;
  buttonText: string;
  buttonLink: string;
  orbitText: string;
};

export type AboutContent = {
  profileImage: string;
  headline: string;
  bioParagraphs: string[];
  basicInfo: LabelValue[];
  skills: SkillRow[];
  infoGrid: LabelValue[];
  statNumber: string;
  statLabel: string;
  buttonText: string;
};

export type SiteSettings = {
  logoFirst: string;
  logoSecond: string;
  sideSignature: string;
  copyrightName: string;
  email: string;
  adminPassword: string;
  navLinks: { id: string; label: string }[];
  resume: { fileName: string; data: string };
};

export type SiteContent = {
  settings: SiteSettings;
  hero: HeroContent;
  about: AboutContent;
  projects: Project[];
  reviews: Review[];
  testimonials: Testimonial[];
  contactItems: ContactItem[];
  messages: Message[];
};

export const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

const IMG = {
  profile: "https://image.qwenlm.ai/generated-images/a2a5520c-4b4f-4892-81fb-19e08690cd2e/_result.png",
  ecommerce: "https://image.qwenlm.ai/generated-images/2bf42015-b754-496d-af6e-210b0ca545e5/_result.png",
  foodhub: "https://image.qwenlm.ai/generated-images/b5fb1e87-a2bb-450a-9c35-00b0861d2488/_result.png",
  analytics: "https://image.qwenlm.ai/generated-images/4d17d53f-5ee1-422b-96b1-382250e2a823/_result.png",
};

const shot = (seed: string) => `https://picsum.photos/seed/${seed}/1200/800`;

export const BASIC_INFO: LabelValue[] = [
  { label: "Name", value: "Muzammil Ahmed" },
  { label: "Job Role", value: "Senior MERN Stack Developer" },
  { label: "Experience", value: "7 Years" },
  { label: "Address", value: "Hyderabad, Pakistan" },
];

export const SKILLS: SkillRow[] = [
  { name: "React.js", level: 95 },
  { name: "Node.js", level: 90 },
  { name: "MongoDB / Express", level: 88 },
  { name: "AI / ML (Python)", level: 85 },
];

export const INFO_GRID: LabelValue[] = [
  { label: "Profile", value: "FullStack + AI/ML Engineer" },
  { label: "Education", value: "BS Computer Science" },
  { label: "Language", value: "English, Urdu, Sindhi" },
  { label: "Other Skills", value: "Deep Learning, MLOps" },
];

export const PROJECTS: Project[] = [
  {
    id: "pj1",
    title: "UrbanSole Store",
    gallery: [IMG.ecommerce, shot("sole-cart"), shot("sole-product")],
    liveUrl: "https://example.com/urbansole",
    description:
      "A full e-commerce platform with cart, checkout, Stripe payments and an admin dashboard. Built on a MERN stack with Redux for state and JWT auth.",
    stack: ["React.js", "Node.js", "MongoDB", "Stripe"],
    featured: true,
  },
  {
    id: "pj2",
    title: "FoodHub Delivery",
    gallery: [IMG.foodhub, shot("food-menu"), shot("food-track")],
    liveUrl: "https://example.com/foodhub",
    description:
      "Real-time food ordering with live rider tracking, restaurant dashboards and push notifications. WebSockets power the live updates.",
    stack: ["React.js", "Express", "Socket.io", "MongoDB"],
    featured: true,
  },
  {
    id: "pj3",
    title: "InsightHQ Analytics",
    gallery: [IMG.analytics, shot("hq-reports"), shot("hq-team")],
    liveUrl: "https://example.com/insighthq",
    description:
      "A SaaS analytics dashboard with charts, cohort reports and role based access. Charts rendered with Recharts over aggregated Mongo pipelines.",
    stack: ["React.js", "Node.js", "Recharts", "MongoDB"],
    featured: true,
  },
  {
    id: "pj4",
    title: "TravelNest Bookings",
    gallery: [shot("travel-home"), shot("travel-search"), shot("travel-pay")],
    liveUrl: "https://example.com/travelnest",
    description:
      "Hotel and trip booking engine with search filters, date range availability and secure payments.",
    stack: ["React.js", "Node.js", "MongoDB"],
  },
  {
    id: "pj5",
    title: "MedicoCare Appointments",
    gallery: [shot("med-home"), shot("med-book"), shot("med-record")],
    liveUrl: "https://example.com/medicare",
    description:
      "Doctor appointment system with calendars, reminders and patient records portal.",
    stack: ["React.js", "Express", "MongoDB"],
  },
  {
    id: "pj6",
    title: "EduSpark LMS",
    gallery: [shot("edu-home"), shot("edu-course"), shot("edu-quiz")],
    liveUrl: "https://example.com/eduspark",
    description:
      "An e-learning platform with video courses, quizzes, progress tracking and auto generated certificates.",
    stack: ["React.js", "Node.js", "MongoDB", "AWS S3"],
  },
  {
    id: "pj7",
    title: "CryptoPulse Tracker",
    gallery: [shot("cry-home"), shot("cry-chart"), shot("cry-alert")],
    liveUrl: "https://example.com/cryptopulse",
    description:
      "Live crypto price tracker with charts, watchlists and price alerts over public market APIs.",
    stack: ["React.js", "Node.js", "WebSockets"],
  },
  {
    id: "pj8",
    title: "FitTrack Gym",
    gallery: [shot("fit-home"), shot("fit-plan"), shot("fit-stats")],
    liveUrl: "https://example.com/fittrack",
    description:
      "Workout and nutrition planner with progress charts and trainer programs.",
    stack: ["React.js", "Express", "MongoDB"],
  },
  {
    id: "pj9",
    title: "EstateHub Realty",
    gallery: [shot("est-home"), shot("est-list"), shot("est-map")],
    liveUrl: "https://example.com/estatehub",
    description:
      "Property listings with map search, agent profiles and enquiry forms.",
    stack: ["React.js", "Node.js", "MongoDB", "Maps API"],
  },
  {
    id: "pj10",
    title: "TaskFlow Manager",
    gallery: [shot("task-home"), shot("task-board"), shot("task-report")],
    liveUrl: "https://example.com/taskflow",
    description:
      "Kanban project manager with drag and drop boards, labels and team activity feeds.",
    stack: ["React.js", "Node.js", "MongoDB"],
  },
  {
    id: "pj11",
    title: "ChatSphere Messenger",
    gallery: [shot("chat-home"), shot("chat-room"), shot("chat-media")],
    liveUrl: "https://example.com/chatsphere",
    description:
      "A real-time chat app with group rooms, typing indicators and media sharing over WebSockets.",
    stack: ["React.js", "Socket.io", "MongoDB"],
  },
  {
    id: "pj12",
    title: "HireLink Jobs",
    gallery: [shot("hire-home"), shot("hire-post"), shot("hire-apply")],
    liveUrl: "https://example.com/hirelink",
    description:
      "Job board with recruiter dashboards, applications tracking and resume parsing.",
    stack: ["React.js", "Express", "MongoDB"],
  },
];

export const REVIEWS: Review[] = [
  {
    id: "rv1",
    name: "Sarah Mitchell",
    role: "Product Lead, UrbanSole",
    platform: "Upwork",
    rating: 5,
    text: "Delivered pixel-perfect React dashboards ahead of schedule. Clean, well-documented code and a smooth handover, and our in-house team picked it up with zero friction.",
    when: "2 weeks ago",
    photo: "https://randomuser.me/api/portraits/women/44.jpg",
    initials: "SM",
  },
  {
    id: "rv2",
    name: "Daniyal Khan",
    role: "Founder, FoodHub",
    platform: "Fiverr",
    rating: 5,
    text: "This is our third project together with zero bugs in production every single time. He treats your product like his own. Highly recommended!",
    when: "1 month ago",
    photo: "https://randomuser.me/api/portraits/men/32.jpg",
    initials: "DK",
  },
  {
    id: "rv3",
    name: "Lena Hoffman",
    role: "CTO, InsightHQ",
    platform: "Upwork",
    rating: 5,
    text: "Strong architecture decisions and great communication. He also suggested an ML model for churn that we ended up shipping. Rare mix of skills.",
    when: "2 months ago",
    photo: "https://randomuser.me/api/portraits/women/68.jpg",
    initials: "LH",
  },
  {
    id: "rv4",
    name: "Omar Farooq",
    role: "CEO, Karvaan Tech",
    platform: "Google",
    rating: 4,
    text: "Reliable and fast. Rebuilt our legacy app into a modern MERN stack and it has been stable since launch.",
    when: "3 months ago",
    photo: "https://randomuser.me/api/portraits/men/75.jpg",
    initials: "OF",
  },
];

export const TESTIMONIALS: Testimonial[] = [
  {
    id: "tm1",
    quote: "Muzammil rebuilt our store from scratch. Page loads dropped from 6 seconds to under 1, and conversions jumped 40% in the first month.",
    name: "Sarah Mitchell",
    role: "Founder, UrbanSole, United Kingdom",
    project: "UrbanSole Store",
    initials: "SM",
    rating: 5,
    video: "",
    duration: "0:42",
  },
  {
    id: "tm2",
    quote: "The live tracking feature he built is the reason our customers keep coming back. Flawless execution.",
    name: "Daniyal Khan",
    role: "CEO, FoodHub, Pakistan",
    project: "FoodHub Delivery",
    initials: "DK",
    rating: 5,
    video: "",
    duration: "0:35",
  },
  {
    id: "tm3",
    quote: "He is one of the few developers who can do the web app and the ML model. A true full stack plus AI engineer.",
    name: "Lena Hoffman",
    role: "Product Manager, InsightHQ, Germany",
    project: "InsightHQ Analytics",
    initials: "LH",
    rating: 5,
    video: "",
    duration: "0:50",
  },
  {
    id: "tm4",
    quote: "Clear communication, honest timelines and a codebase our team loves working in.",
    name: "Omar Farooq",
    role: "COO, Karvaan Tech, Karachi",
    project: "Karvaan Web Portal",
    initials: "OF",
    rating: 5,
    video: "",
    duration: "0:28",
  },
];

export const CONTACT_ITEMS: ContactItem[] = [
  {
    title: "Address",
    value: "Hyderabad, Pakistan",
    icon: "signpost",
  },
  {
    title: "Contact Number",
    value: "+92 314 3580908",
    icon: "phone",
    href: "tel:+923143580908",
  },
  {
    title: "Email",
    value: "muzammil.ahmed.dev@gmail.com",
    icon: "plane",
    href: "mailto:muzammil.ahmed.dev@gmail.com",
  },
  {
    title: "Resume",
    value: "Download my resume",
    icon: "globe",
  },
];

export const PROFILE_IMAGE = IMG.profile;
