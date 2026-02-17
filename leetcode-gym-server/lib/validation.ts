import { z } from "zod";

export const authBodySchema = z.object({
  type: z.enum(["login", "signup"]),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email"),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token required"),
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password required"),
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
});

export const logPostBodySchema = z.object({
  slug: z.string().min(1, "slug required"),
  title: z.string().min(1, "title required"),
  confidence: z.number().int().min(1).max(3),
  category: z.string().optional().nullable(),
  approach: z.string().optional().nullable(),
  complexity: z.string().optional().nullable(),
  codeSnippet: z.string().optional().nullable(),
  timeTaken: z.number().int().min(0).optional().nullable(),
  timeLimit: z.number().int().min(0).optional().nullable(),
  metTimeLimit: z.boolean().optional().nullable(),
  language: z.string().optional().nullable(),
  solution: z.string().optional().nullable(),
  optimalSolution: z.string().optional().nullable(),
});

export const chatPostBodySchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(["user", "assistant", "system"]),
      content: z.string(),
    })
  ),
  problemContext: z.object({
    title: z.string(),
    difficulty: z.string().optional(),
    description: z.string().optional(),
  }),
  userApiKey: z.string().optional(),
});

export const generateNotesBodySchema = z.object({
  messages: z.array(
    z.object({
      role: z.string(),
      content: z.string(),
    })
  ),
  problemContext: z.object({
    title: z.string(),
    difficulty: z.string().optional(),
    description: z.string().optional(),
  }),
  userApiKey: z.string().optional(),
  language: z.string().optional(),
});
