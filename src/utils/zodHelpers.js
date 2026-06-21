import { z } from "zod";

/**
 * Reusable Zod superRefine — validates indexed file fields (media_0, icon_1, …).
 * Use in any module schema; no per-module middleware needed.
 *
 * @param {object} options
 * @param {(data: { body: any, files: any }) => unknown[]} options.getItems
 * @param {string} options.filePrefix
 * @param {string} options.message
 */
export const requireIndexedFiles =
  ({ getItems, filePrefix, message }) =>
  (data, ctx) => {
    const items = getItems(data) ?? [];

    items.forEach((_, index) => {
      const fieldName = `${filePrefix}${index}`;

      if (!data.files?.[fieldName]?.length) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `${message} at index ${index}`,
          path: ["files", fieldName],
        });
      }
    });
  };

/**
 * Reusable Zod superRefine — validates a single named file field (media, avatar, …).
 *
 * @param {string} fieldName
 * @param {string} message
 */
export const requireFileField = (fieldName, message) => (data, ctx) => {
  if (!data.files?.[fieldName]?.length) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message,
      path: ["files", fieldName],
    });
  }
};
