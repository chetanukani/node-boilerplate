import { Router } from "express";

import { createProduct } from "../controllers/products/product.controllers.js";
import { createProductValidator } from "../validators/product.validators.js";
import { validate } from "../validators/validate.js";
import { MAXIMUM_SUB_IMAGE_COUNT } from "../constants.js";
import uploadFor from "../middlewares/multer.middlewares.js";
// import uploadFor from "../middlewares/multerFactory.js";

const router = Router();

router.route("/").post(
  uploadFor("products").fields([
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
