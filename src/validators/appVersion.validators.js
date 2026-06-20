import { body, param } from "express-validator";

const appVersionRequestBodyValidator = () => {
  return [
    body("platform")
      .optional()
      .isString()
      .trim()
      .notEmpty()
      .withMessage("platform is required"),
    body("version")
      .exists()
      .isString()
      .trim()
      .withMessage("version is required"),
    body("forceUpdate").isBoolean().withMessage("forceUpdate must be boolean"),
    body("maintenance").isBoolean().withMessage("maintenance must be boolean"),
  ];
};

export { appVersionRequestBodyValidator };
