const Content = require("../models/content.model");

/* Returns true when the content document has been populated with real data. */
function isPopulated(data) {
  return Boolean(data && data.hero && data.hero.name);
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
   rather than blindly overwritten. */
async function saveContent(content) {
  const doc = await Content.getSingleton();
  const mergedMessages = mergeMessages(doc.data.messages, content.messages);
  doc.data = { ...content, messages: mergedMessages };
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
