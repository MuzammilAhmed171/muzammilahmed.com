const mongoose = require("mongoose");

/* The entire website content lives in a single document.

   Why one document?
   The admin panel edits the whole site as one unit and the public site reads
   the whole site in one request. Keeping it in a single document means:
     - one atomic read for the public site
     - one atomic write from the admin panel
     - no joins, no referential drift

   `data` mirrors the frontend SiteContent object exactly, so it is stored as a
   schemaless Mixed field. Shape:
   {
     settings: {...}, hero: {...}, about: {...},
     projects: [...], reviews: [...], testimonials: [...],
     contactItems: [...], messages: [...]
   } */
const ContentSchema = new mongoose.Schema(
  {
    data: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true },
);

/* Only ever one content document exists. */
ContentSchema.statics.getSingleton = async function () {
  let doc = await this.findOne();
  if (!doc) doc = await this.create({ data: {} });
  return doc;
};

module.exports = mongoose.model("Content", ContentSchema);
