import { z } from "zod";
import { PlatformType } from "../constants.js";
import { booleanValidator } from "./common.validator.js";

const platformValues = Object.values(PlatformType);

export const updateAppVersionValidator = z.object({
  params: z.object({
    platform: z
      .string()
      .trim()
      .toLowerCase()
      .refine((value) => platformValues.includes(value), {
        message: "Invalid platform",
      }),
  }),
  body: z.object({
    version: z.string().trim().min(1, "version is required"),
    forceUpdate: booleanValidator("forceUpdate must be boolean"),
    maintenance: booleanValidator("maintenance must be boolean"),
  }),
});
