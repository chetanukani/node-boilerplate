import { Router } from "express";
import { validateRequest } from "../middlewares/zodValidate.middleware.js";
import {
  MAXIMUM_BULK_PRODUCT_COUNT,
  MAXIMUM_SUB_IMAGE_COUNT,
} from "../constants.js";
import uploadFor from "../middlewares/multer.middlewares.js";
import {
  bulkCreateProducts,
  createProduct,
} from "../controllers/products/product.controllers.js";
import {
  bulkCreateProductsValidator,
  createProductValidator,
} from "../validators/product.validator.js";
import { generatePdf } from "../controllers/products/pdf.controllers.js";

const router = Router();

const buildBulkProductUploadFields = () =>
  Array.from({ length: MAXIMUM_BULK_PRODUCT_COUNT }, (_, index) => ({
    name: `media_${index}`,
    maxCount: MAXIMUM_SUB_IMAGE_COUNT,
  }));

router
  .route("/bulk")
  .post(
    uploadFor("products").fields(buildBulkProductUploadFields()),
    validateRequest(bulkCreateProductsValidator),
    bulkCreateProducts
  );

router.route("/").post(
  uploadFor("products").fields([
    {
      name: "media",
      maxCount: MAXIMUM_SUB_IMAGE_COUNT,
    },
  ]),
  validateRequest(createProductValidator),
  createProduct
);

router.get("/generate-pdf", generatePdf);

export default router;
