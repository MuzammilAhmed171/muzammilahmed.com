import { useEffect, useState } from "react";
import AdminApp from "./admin/AdminApp";
import About from "./components/About";
import Contact from "./components/Contact";
import Hero from "./components/Hero";
import Navbar from "./components/Navbar";
import Projects from "./components/Projects";
import { Reviews, Testimonials } from "./components/Social";
import { ContentProvider, useContent } from "./store/content";

const NOISE_TEXTURE =
  "url(\"image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.6'/%3E%3C/svg%3E\")";

function useHashRoute() {
  const [hash, setHash] = useState(() => window.location.hash);
  useEffect(() => {
    const onChange = () => setHash(window.location.hash);
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);
  return hash;
}

// function AdminButton() {
//   return (
//     <button
//       type="button"
//       onClick={() => {
//         window.location.hash = "#/admin";
//       }}
//       title="Admin Panel"
//       aria-label="Open admin panel"
//       className="fixed bottom-6 right-6 z-40 flex h-12 w-12 items-center justify-center rounded-full border border-white/15 bg-black/80 text-gray-500 shadow-[0_10px_30px_rgba(0,0,0,0.6)] backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:border-accent hover:text-accent hover:shadow-[0_10px_35px_rgba(255,193,7,0.25)]"
//     >
//       <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" className="h-5 w-5" aria-hidden="true">
//         <path d="M4 7h16" />
//         <path d="M4 12h16" />
//         <path d="M4 17h16" />
//         <circle cx="9" cy="7" r="2.1" className="fill-black" />
//         <circle cx="15" cy="12" r="2.1" className="fill-black" />
//         <circle cx="7" cy="17" r="2.1" className="fill-black" />
//       </svg>
//     </button>
//   );
// }

function Site() {
  const { content } = useContent();

  return (
    <div className="relative min-h-screen bg-black font-sans text-white antialiased">
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[90] opacity-[0.028]" style={{ backgroundImage: NOISE_TEXTURE }} />

      <div aria-hidden="true" className="fixed bottom-0 left-7 z-40 hidden flex-col items-center gap-5 xl:flex">
        <span className="text-[10px] font-semibold uppercase tracking-[0.4em] text-gray-600 [writing-mode:vertical-rl]">
          {content.settings.sideSignature}
        </span>
        <span className="h-24 w-px bg-gradient-to-b from-gray-700 to-transparent" />
      </div>

      <Navbar />

      <main>
        <Hero />
        <About />
        <Projects />
        <Reviews />
        <Testimonials />
        <Contact />
      </main>

      {/* <AdminButton /> */}
    </div>
  );
}

function Root() {
  const hash = useHashRoute();
  return hash.startsWith("#/admin") ? <AdminApp /> : <Site />;
}

export default function App() {
  return (
    <ContentProvider>
      <Root />
    </ContentProvider>
  );
}
