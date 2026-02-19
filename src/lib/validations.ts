import { z } from "zod";

// Auth validations
export const loginSchema = z.object({
  identifier: z
    .string()
    .min(3, "Username or email must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be at most 20 characters")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers, and underscores"
    ),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(100, "Password must be at most 100 characters"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(100, "Password must be at most 100 characters"),
});

export const completeProfileSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be at most 20 characters")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers, and underscores"
    ),
});

// Media validations
export const createMediaSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title is too long"),
  type: z.enum(["ANIME", "DONGHUA", "MANGA", "MANHWA", "OTHER"]),
  imageUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
  totalUnits: z.number().int().positive().optional().nullable(),
  status: z.enum([
    "WATCHING",
    "READING",
    "COMPLETED",
    "DROPPED",
    "ON_HOLD",
    "PLAN_TO_WATCH",
    "PLAN_TO_READ",
    "PLAN_TO_CONSUME",
  ]),
  progress: z.number().int().min(0).default(0),
  rating: z.number().int().min(1).max(10).optional().nullable(),
  notes: z.string().max(1000, "Notes are too long").optional(),
});

export const updateMediaSchema = createMediaSchema.partial();

export const updateProgressSchema = z.object({
  progress: z.number().int().min(0),
});

// Types
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type CompleteProfileInput = z.infer<typeof completeProfileSchema>;
export type CreateMediaInput = z.infer<typeof createMediaSchema>;
export type UpdateMediaInput = z.infer<typeof updateMediaSchema>;
export type UpdateProgressInput = z.infer<typeof updateProgressSchema>;
