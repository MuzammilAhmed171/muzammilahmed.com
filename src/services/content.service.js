const Content = require("../models/content.model");

/* Returns true when the content document has been populated with real data. */
function isPopulated(data) {
  return Boolean(data && data.hero && data.hero.name);
}

/**
 * Deep-merge: when incoming value is an empty string and the existing value
 * is a non-empty string (e.g. a previously stored data-URL or https URL),
 * keep the existing value.  This handles the case where the frontend strips
 * base64 data-URLs before sending to avoid the 4.5 MB Vercel body limit.
 */
function preserveExisting(existing, incoming) {
  if (typeof incoming === "string" && incoming === "" && typeof existing === "string" && existing !== "") {
    return existing;
  }
  if (incoming !== null && typeof incoming === "object" && !Array.isArray(incoming)) {
    const out = { ...incoming };
    for (const key of Object.keys(out)) {
      out[key] = preserveExisting(existing && existing[key], out[key]);
    }
    return out;
  }
  if (Array.isArray(incoming)) {
    return incoming.map((item, i) => preserveExisting(existing && existing[i], item));
  }
  return incoming;
}

/* Public view of the content: strips the admin password so it never leaves
   the server. Everything else is safe for the public site. */
function toPublicView(data) {
  if (!isPopulated(data)) return null;
  const { settings, messages, ...rest } = data;
  return {
    ...rest,
    settings: settings ? { ...settings, adminPassword: "" } : undefined,
  };
}

/* Full view for the authenticated admin panel. */
function toFullView(data) {
  if (!isPopulated(data)) return null;
  return data;
}

/* Merges incoming contact messages with existing ones by id so that a visitor
   submission that lands between the admin's fetch and save is never lost.
   Newest messages first. */
function mergeMessages(existing, incoming) {
  const byId = new Map();
  [...(existing || []), ...(incoming || [])].forEach((m) => {
    if (m && m.id) byId.set(m.id, m);
  });
  return Array.from(byId.values()).sort((a, b) => ((a.date || "") < (b.date || "") ? 1 : -1));
}

async function getContent() {
  const doc = await Content.getSingleton();
  return doc.data || {};
}

/* Replaces the whole content document (admin panel save). Messages are merged
   rather than blindly overwritten. Images that arrive as empty strings (stripped
   by the frontend to avoid the Vercel 4.5 MB body limit) are preserved from
   the existing stored document. */
async function saveContent(content) {
  const doc = await Content.getSingleton();
  const mergedMessages = mergeMessages(doc.data.messages, content.messages);
  const mergedContent = preserveExisting(doc.data, { ...content, messages: mergedMessages });
  doc.data = mergedContent;
  doc.markModified("data");
  await doc.save();
  return doc.data;
}

/* Appends a single contact-form submission (public endpoint). */
async function addMessage(message) {
  const doc = await Content.getSingleton();
  if (!Array.isArray(doc.data.messages)) doc.data.messages = [];
  doc.data.messages.unshift(message);
  doc.markModified("data");
  await doc.save();
  return message;
}

module.exports = {
  isPopulated,
  toPublicView,
  toFullView,
  getContent,
  saveContent,
  addMessage,
};
