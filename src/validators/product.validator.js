import { z } from "zod";
import {
  MAXIMUM_BULK_PRODUCT_COUNT,
  MAXIMUM_SUB_IMAGE_COUNT,
  ValidationMessages,
} from "../constants.js";
import { objectIdValidator } from "./common.validator.js";
import { requireFileField, requireIndexedFiles } from "../utils/zodHelpers.js";

const categoryIdValidator = objectIdValidator("category");

/** Fields the client sends — no media urls */
export const productFieldsValidator = z.object({
  name: z.string().trim().min(1, "Name is required"),
  description: z.string().trim().min(1, "Description is required"),
  category: categoryIdValidator,
  price: z.coerce.number().min(0, "Price must be a positive number"),
  stock: z.coerce.number().int().min(0).optional().default(0),
});

export const bulkProductFieldsValidator = z
  .array(productFieldsValidator)
  .min(1, "At least one product is required")
  .max(
    MAXIMUM_BULK_PRODUCT_COUNT,
    `Maximum ${MAXIMUM_BULK_PRODUCT_COUNT} products allowed per request`
  );

export const createProductValidator = z
  .object({
    body: productFieldsValidator,
    files: z.record(z.array(z.any())).optional(),
  })
  .superRefine(requireFileField("media", ValidationMessages.ImageRequired))
  .superRefine((data, ctx) => {
    const mediaCount = data.files?.media?.length ?? 0;

    if (mediaCount > MAXIMUM_SUB_IMAGE_COUNT) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Maximum ${MAXIMUM_SUB_IMAGE_COUNT} media files allowed`,
        path: ["files", "media"],
      });
    }
  });

export const bulkCreateProductsValidator = z
  .object({
    body: z.object({
      products: bulkProductFieldsValidator,
    }),
    files: z.record(z.array(z.any())).optional(),
  })
  .superRefine(
    requireIndexedFiles({
      getItems: (data) => data.body.products,
      filePrefix: "media_",
      message: ValidationMessages.ProductMediaRequired,
    })
  );
