import { useEffect, useRef, useState, type ChangeEvent, type FormEvent, type ReactNode } from "react";
import { useContent } from "../store/content";
import { CheckIcon, CONTACT_ICONS, PlaneIcon } from "./Icons";
import { Reveal, SectionHeading } from "./ui";

type FormData = { name: string; email: string; subject: string; message: string };
type FormErrors = Partial<Record<keyof FormData, string>>;
type Status = "idle" | "sending" | "sent";

const EMPTY_FORM: FormData = { name: "", email: "", subject: "", message: "" };
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function ContactForm() {
  const { addMessage } = useContent();
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<Status>("idle");
  const timers = useRef<number[]>([]);

  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);

  const update =
    (field: keyof FormData) =>
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((f) => ({ ...f, [field]: e.target.value }));
      setErrors((err) => ({ ...err, [field]: undefined }));
    };

  const validate = (): FormErrors => {
    const errs: FormErrors = {};
    if (!form.name.trim()) errs.name = "Please enter your name.";
    if (!form.email.trim()) errs.email = "Please enter your email.";
    else if (!EMAIL_RE.test(form.email)) errs.email = "That email doesn't look right.";
    if (!form.subject.trim()) errs.subject = "A short subject helps me reply faster.";
    if (form.message.trim().length < 10) errs.message = "Tell me a little more, at least 10 characters.";
    return errs;
  };

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.values(errs).some(Boolean)) return;

    const submission = { ...form };
    setStatus("sending");
    timers.current.push(
      window.setTimeout(() => {
        addMessage(submission);
        setStatus("sent");
        setForm(EMPTY_FORM);
        timers.current.push(window.setTimeout(() => setStatus("idle"), 6000));
      }, 1200),
    );
  };

  const inputClass = (hasError: boolean) =>
    `w-full rounded-md border bg-neutral-950 px-4 py-3 text-sm text-white placeholder-gray-600 outline-none transition-all duration-300 focus:ring-1 ${
      hasError
        ? "border-red-400/60 focus:border-red-400 focus:ring-red-400/30"
        : "border-white/10 focus:border-accent focus:ring-accent/40"
    }`;

  return (
    <form
      id="contact-form"
      onSubmit={onSubmit}
      noValidate
      className="rounded-xl border border-white/10 bg-white/[0.02] p-7 transition-colors duration-300 hover:border-accent/25 sm:p-9"
    >
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="contact-name" className="mb-2 block text-[11px] font-bold uppercase tracking-[0.18em] text-gray-400">
            Your Name
          </label>
          <input id="contact-name" type="text" value={form.name} onChange={update("name")} placeholder="John Carter" className={inputClass(!!errors.name)} />
          {errors.name ? <p className="mt-1.5 text-xs text-red-400">{errors.name}</p> : null}
        </div>

        <div>
          <label htmlFor="contact-email" className="mb-2 block text-[11px] font-bold uppercase tracking-[0.18em] text-gray-400">
            Email Address
          </label>
          <input id="contact-email" type="email" value={form.email} onChange={update("email")} placeholder="john@company.com" className={inputClass(!!errors.email)} />
          {errors.email ? <p className="mt-1.5 text-xs text-red-400">{errors.email}</p> : null}
        </div>
      </div>

      <div className="mt-5">
        <label htmlFor="contact-subject" className="mb-2 block text-[11px] font-bold uppercase tracking-[0.18em] text-gray-400">
          Subject
        </label>
        <input id="contact-subject" type="text" value={form.subject} onChange={update("subject")} placeholder="Project inquiry: MERN web app" className={inputClass(!!errors.subject)} />
        {errors.subject ? <p className="mt-1.5 text-xs text-red-400">{errors.subject}</p> : null}
      </div>

      <div className="mt-5">
        <label htmlFor="contact-message" className="mb-2 block text-[11px] font-bold uppercase tracking-[0.18em] text-gray-400">
          Message
        </label>
        <textarea id="contact-message" rows={5} value={form.message} onChange={update("message")} placeholder="Tell me about your project, timeline and budget..." className={`${inputClass(!!errors.message)} resize-none`} />
        {errors.message ? <p className="mt-1.5 text-xs text-red-400">{errors.message}</p> : null}
      </div>

      {status === "sent" ? (
        <div className="mt-6 flex items-center gap-3 rounded-md border border-accent/40 bg-accent/10 px-4 py-3 text-sm text-accent">
          <CheckIcon className="h-4 w-4 shrink-0" />
          Message sent! It&apos;s now in my inbox, and I&apos;ll reply within 24 hours.
        </div>
      ) : null}

      <button
        type="submit"
        disabled={status === "sending"}
        className="mt-7 inline-flex items-center gap-2.5 rounded-full bg-accent px-8 py-3 text-xs font-bold uppercase tracking-[0.22em] text-black transition-all duration-300 hover:-translate-y-0.5 hover:bg-yellow-300 hover:shadow-[0_14px_40px_rgba(255,193,7,0.35)] disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
      >
        {status === "sending" ? (
          <>
            <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 animate-spin" aria-hidden="true">
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.5" opacity="0.25" />
              <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
            Sending...
          </>
        ) : (
          <>
            <PlaneIcon className="h-4 w-4" />
            Send Message
          </>
        )}
      </button>
    </form>
  );
}

export default function Contact() {
  const { content } = useContent();
  const { contactItems } = content;
  const { email, copyrightName, resume } = content.settings;

  const resumeReady = !!resume.data;

  const scrollToForm = () => {
    document.getElementById("contact-form")?.scrollIntoView({ behavior: "smooth", block: "center" });
    window.setTimeout(
      () =>
        (document.getElementById("contact-name") as HTMLInputElement | null)?.focus({ preventScroll: true }),
      650,
    );
  };

  return (
    <section id="contact" className="relative overflow-hidden py-28">
      <div aria-hidden="true" className="absolute -right-32 top-16 h-96 w-96 rounded-full bg-accent/[0.04] blur-[130px]" />

      <div className="relative mx-auto w-full max-w-6xl px-6 md:px-10">
        <SectionHeading watermark="CONTACT" title="Contact Me" subtitle="Below are the details to reach out to me!" />

        <div className="grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
          {contactItems.map((item, i) => {
            const Icon = CONTACT_ICONS[item.icon] ?? CONTACT_ICONS.globe;
            const inner = (
              <span className="flex flex-col items-center gap-5 text-center">
                <span className="flex h-24 w-24 items-center justify-center rounded-full border border-transparent bg-[#1a1a1a] text-accent shadow-[0_10px_30px_rgba(0,0,0,0.5)] transition-all duration-300 group-hover:-translate-y-1 group-hover:border-accent group-hover:shadow-[0_10px_40px_rgba(255,193,7,0.3)] sm:h-28 sm:w-28">
                  <Icon className="h-9 w-9 sm:h-10 sm:w-10" />
                </span>
                <span>
                  <span className="block font-display text-sm font-bold uppercase tracking-[0.18em] text-white">{item.title}</span>
                  <span className="mt-2 block text-sm text-gray-400 transition-colors group-hover:text-gray-300">{item.value}</span>
                </span>
              </span>
            );

            const isResumeCard = item.title.toLowerCase().includes("resume");
            let wrapper: ReactNode;
            if (isResumeCard && resumeReady) {
              wrapper = (
                <a href={resume.data} download={resume.fileName || "Muzammil-Ahmed-Resume.pdf"} className="group inline-block" aria-label={`Download ${resume.fileName || "resume"}`}>
                  {inner}
                </a>
              );
            } else if (item.href) {
              wrapper = (
                <a href={item.href} className="group inline-block" aria-label={item.title}>
                  {inner}
                </a>
              );
            } else {
              wrapper = <div className="group inline-block">{inner}</div>;
            }

            return (
              <Reveal key={`${item.title}-${i}`} delay={i * 110} className="text-center">
                {wrapper}
              </Reveal>
            );
          })}
        </div>

        <div className="mt-24 grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-14">
          <Reveal>
            <ContactForm />
          </Reveal>

          <Reveal delay={150}>
            <div className="flex h-full flex-col justify-center">
              <span className="flex w-fit items-center gap-2.5 rounded-full border border-accent/30 bg-accent/5 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
                </span>
                Available for new projects
              </span>

              <h3 className="mt-6 font-display text-2xl font-bold leading-snug text-white sm:text-3xl">
                Let&apos;s build something <span className="text-accent">great</span> together.
              </h3>
              <p className="mt-4 leading-relaxed text-gray-400">
                Whether it&apos;s a brand-new MERN platform, an AI feature, or rescuing a stuck project, drop a
                message and I&apos;ll personally get back to you.
              </p>

              <ul className="mt-8 space-y-4">
                {["Response within 24 hours, guaranteed", "Free 30-minute consultation call", "Remote-friendly, working worldwide from Pakistan"].map(
                  (point) => (
                    <li key={point} className="flex items-start gap-3.5 text-sm text-gray-300">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rotate-45 bg-accent" />
                      {point}
                    </li>
                  ),
                )}
              </ul>

              <div className="mt-10 border-t border-white/10 pt-7">
                <p className="text-sm text-gray-500">
                  Prefer writing directly?{" "}
                  <a href={`mailto:${email}`} className="font-semibold text-accent underline decoration-accent/40 underline-offset-4 transition-colors hover:text-yellow-300">
                    {email}
                  </a>
                </p>
              </div>
            </div>
          </Reveal>
        </div>

        <Reveal className="mt-24 flex flex-col items-center justify-center gap-5 sm:flex-row sm:gap-7">
          <h3 className="font-display text-2xl font-bold text-white sm:text-3xl">Have a Question?</h3>
          <button
            type="button"
            onClick={scrollToForm}
            className="rounded-full bg-accent px-8 py-3 text-xs font-bold uppercase tracking-[0.22em] text-black transition-all duration-300 hover:-translate-y-0.5 hover:bg-yellow-300 hover:shadow-[0_14px_40px_rgba(255,193,7,0.35)]"
          >
            Click Here
          </button>
        </Reveal>

        <footer className="mt-20 border-t border-white/5 pt-8 pb-2 text-center">
          <p className="text-xs text-gray-500 sm:text-sm">
            Copyright ©2026 All rights reserved | <span className="text-gray-400">{copyrightName}</span>
          </p>
        </footer>
      </div>
    </section>
  );
}
