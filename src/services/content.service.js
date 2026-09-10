const Content = require("../models/content.model");

/* Returns true when the content document has been populated with real data. */
function isPopulated(data) {
  return Boolean(data && data.hero && data.hero.name);
}

/**
 * Deep-merge: when incoming value is an empty string and the existing value
 * is an image URL (data-URL or http URL), keep the existing value.
 * Plain text fields (like description, title) are left as incoming even if empty.
 * For arrays of objects with an `id`, matching is done by `id` (not by index).
 */
function preserveExisting(existing, incoming) {
  if (existing === undefined || existing === null) return incoming;
  if (incoming === undefined || incoming === null) return incoming;

  if (typeof incoming === "string" && incoming === "") {
    if (typeof existing === "string" && (existing.startsWith("data:") || existing.startsWith("http"))) {
      return existing;
    }
    return incoming;
  }

  if (Array.isArray(incoming)) {
    if (!Array.isArray(existing)) return incoming;
    const isObjectArray =
      incoming.length > 0 && typeof incoming[0] === "object" && incoming[0] !== null && "id" in incoming[0];
    if (isObjectArray) {
      const existingById = new Map();
      existing.forEach((item) => {
        if (item && typeof item === "object" && item.id) {
          existingById.set(item.id, item);
        }
      });
      return incoming.map((incItem) => {
        if (incItem && typeof incItem === "object" && incItem !== null && incItem.id) {
          const extItem = existingById.get(incItem.id);
          return extItem ? preserveExisting(extItem, incItem) : incItem;
        }
        return incItem;
      });
    }
    return incoming.map((item, i) => preserveExisting(existing[i], item));
  }

  if (typeof incoming === "object" && typeof existing === "object") {
    const out = { ...incoming };
    for (const key of Object.keys(out)) {
      if (key in existing) {
        out[key] = preserveExisting(existing[key], out[key]);
      }
    }
    return out;
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
