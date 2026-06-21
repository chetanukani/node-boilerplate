import { z } from "zod";
import { AvailableUserRoles } from "../constants.js";

export const userRegisterValidator = z.object({
  body: z.object({
    email: z
      .string()
      .trim()
      .min(1, "Email is required")
      .email("Email is invalid"),
    username: z
      .string()
      .trim()
      .min(1, "Username is required")
      .min(3, "Username must be at least 3 characters long")
      .refine((value) => value === value.toLowerCase(), {
        message: "Username must be lowercase",
      }),
    password: z.string().trim().min(1, "Password is required"),
    role: z.enum(AvailableUserRoles).optional(),
  }),
});

export const userLoginValidator = z.object({
  body: z
    .object({
      email: z.string().trim().email("Email is invalid").optional(),
      username: z.string().trim().optional(),
      password: z.string().min(1, "Password is required"),
    })
    .superRefine((data, ctx) => {
      if (!data.email && !data.username) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Email or username is required",
          path: ["email"],
        });
      }
    }),
});

export const forgotPasswordValidator = z.object({
  body: z.object({
    email: z.string().trim().email("Email is invalid"),
  }),
});

export const resetPasswordValidator = z.object({
  body: z.object({
    token: z.string().trim().min(1, "Token is required"),
    password: z
      .string()
      .trim()
      .min(8, "Password must be at least 8 characters"),
  }),
});
