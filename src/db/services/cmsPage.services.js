import { CmsPage } from "../models/cmsPage.models.js";

async function getCmsPageBySlug(slug) {
  if (!slug) return null;
  return await CmsPage.findOne({ slug: slug.toString().toLowerCase() }).lean();
}

async function upsertCmsPage(slug, payload) {
  if (!slug || !payload) return null;
  const key = slug.toString().toLowerCase();

  const values = {
    slug: key,
    title: payload.title,
    content: payload.content, // Map content will be handled by mongoose Map schema type
  };

  const doc = await CmsPage.findOneAndUpdate({ slug: key }, values, {
    upsert: true,
    new: true,
    setDefaultsOnInsert: true,
  });
  return doc;
}

export default {
  getCmsPageBySlug,
  upsertCmsPage,
};
