import { z } from "zod";
import { PlatformType } from "../constants.js";

const platformValues = Object.values(PlatformType);

export const updateAppVersionSchema = z.object({
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
    forceUpdate: z.boolean({ message: "forceUpdate must be boolean" }),
    maintenance: z.boolean({ message: "maintenance must be boolean" }),
  }),
});
