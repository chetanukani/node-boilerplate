import { Router } from "express";

import { createProduct } from "../controllers/products/product.controllers.js";
import { createProductValidator } from "../validators/product.validators.js";
import { validate } from "../validators/validate.js";
import { MAXIMUM_SUB_IMAGE_COUNT } from "../constants.js";
import { upload } from "../middlewares/multer.middlewares.js";

const router = Router();

router.route("/").post(
  upload.fields([
    {
      name: "media",
      maxCount: MAXIMUM_SUB_IMAGE_COUNT,
    },
  ]),
  createProductValidator(),
  validate,
  createProduct
);

export default router;
