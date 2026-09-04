import { useContent } from "../../store/content";
import { DeleteButton, useToast } from "../controls";

export default function DashboardTab() {
  const { content, updateSection } = useContent();
  const toast = useToast();

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

  const toggleRead = (id: string) =>
    updateSection(
      "messages",
      messages.map((m) => (m.id === id ? { ...m, read: !m.read } : m)),
    );

  const markAllRead = () => {
    updateSection(
      "messages",
      messages.map((m) => ({ ...m, read: true })),
    );
    toast("All messages marked as read");
  };

  const removeMessage = (id: string) => {
    updateSection(
      "messages",
      messages.filter((m) => m.id !== id),
    );
    toast("Message deleted");
  };

  return (
    <div>
      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {stats.map((s) => (
          <div
            key={s.label}
            className={`rounded-lg border p-4 transition-colors ${
              s.accent ? "border-accent/50 bg-accent/10" : "border-white/10 bg-white/[0.02]"
            }`}
          >
            <p className={`font-display text-2xl font-extrabold ${s.accent ? "text-accent" : "text-white"}`}>
              {s.value}
            </p>
            <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.14em] text-gray-500">
              {s.label}
            </p>
          </div>
        ))}
      </div>

      {/* Inbox */}
      <div className="mt-10">
        <div className="flex items-center justify-between gap-4">
          <h2 className="font-display text-lg font-bold text-white">
            Contact Form Messages{" "}
            <span className="ml-1 text-sm font-medium text-gray-500">({messages.length})</span>
          </h2>
          {unread > 0 ? (
            <button
              onClick={markAllRead}
              className="rounded-full border border-accent/50 px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider text-accent transition-colors hover:bg-accent hover:text-black"
            >
              Mark all read
            </button>
          ) : null}
        </div>

        {messages.length === 0 ? (
          <div className="mt-5 rounded-lg border border-dashed border-white/15 p-10 text-center">
            <p className="font-display text-sm font-semibold text-gray-400">No messages yet</p>
            <p className="mt-1.5 text-xs text-gray-600">
              When someone submits the contact form on your website, their message will appear
              here instantly.
            </p>
          </div>
        ) : (
          <div className="mt-5 space-y-3">
            {messages.map((m) => (
              <article
                key={m.id}
                className={`rounded-lg border p-5 transition-colors ${
                  m.read ? "border-white/10 bg-white/[0.02]" : "border-accent/40 bg-accent/[0.05]"
                }`}
              >
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                  {!m.read ? (
                    <span className="rounded-full bg-accent px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-widest text-black">
                      New
                    </span>
                  ) : null}
                  <p className="font-display text-sm font-bold text-white">{m.name}</p>
                  <a
                    href={`mailto:${m.email}`}
                    className="text-xs text-accent underline decoration-accent/40 underline-offset-4 hover:text-yellow-300"
                  >
                    {m.email}
                  </a>
                  <span className="ml-auto text-[11px] text-gray-600">
                    {new Date(m.date).toLocaleString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <p className="mt-2.5 text-sm font-semibold text-gray-300">{m.subject}</p>
                <p className="mt-1.5 whitespace-pre-line text-sm leading-relaxed text-gray-400">
                  {m.message}
                </p>
                <div className="mt-4 flex items-center gap-2.5">
                  <button
                    onClick={() => toggleRead(m.id)}
                    className="rounded-full border border-white/15 px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-300 transition-colors hover:border-accent hover:text-accent"
                  >
                    {m.read ? "Mark unread" : "Mark read"}
                  </button>
                  <a
                    href={`mailto:${m.email}?subject=Re: ${encodeURIComponent(m.subject)}`}
                    className="rounded-full bg-accent px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-black transition-colors hover:bg-yellow-300"
                  >
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
