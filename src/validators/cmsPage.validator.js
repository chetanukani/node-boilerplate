import { z } from "zod";

export const upsertCmsPageValidator = z.object({
  params: z.object({
    slug: z.string().trim().min(1, "slug is required").toLowerCase(),
  }),
  body: z.object({
    title: z.string().trim().min(1, "title is required"),
    content: z.record(z.string(), {
      required_error: "content map is required",
    }),
  }),
});

export const getCmsPageValidator = z.object({
  params: z.object({
    slug: z.string().trim().min(1, "slug is required").toLowerCase(),
  }),
});
