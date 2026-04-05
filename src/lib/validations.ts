import { z } from "zod";

export const registerSchema = z.object({
  firstName: z
    .string()
    .min(1, "First name is required")
    .max(50, "First name too long")
    .trim(),
  lastName: z
    .string()
    .min(1, "Last name is required")
    .max(50, "Last name too long")
    .trim(),
  email: z.string().email("Invalid email address").toLowerCase().trim(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password too long"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address").toLowerCase().trim(),
  password: z.string().min(1, "Password is required"),
});

export const createPostSchema = z.object({
  content: z
    .string()
    .min(1, "Post content is required")
    .max(5000, "Post content too long")
    .trim(),
  visibility: z.enum(["PUBLIC", "PRIVATE"]).default("PUBLIC"),
  imageUrl: z.string().min(1).optional().nullable(),
});

export const createCommentSchema = z.object({
  content: z
    .string()
    .min(1, "Comment cannot be empty")
    .max(1000, "Comment too long")
    .trim(),
});

export const createReplySchema = z.object({
  content: z
    .string()
    .min(1, "Reply cannot be empty")
    .max(1000, "Reply too long")
    .trim(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreatePostInput = z.infer<typeof createPostSchema>;
export type CreateCommentInput = z.infer<typeof createCommentSchema>;
export type CreateReplyInput = z.infer<typeof createReplySchema>;
