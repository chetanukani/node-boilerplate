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
      name: "mainImage",
      maxCount: 1,
    },
    {
      // frontend will send at max 4 `subImages` keys with file object which we will save in the backend
      name: "subImages",
      maxCount: MAXIMUM_SUB_IMAGE_COUNT, // maximum number of subImages is 4
    },
  ]),
  createProductValidator(),
  validate,
  createProduct
);

export default router;
