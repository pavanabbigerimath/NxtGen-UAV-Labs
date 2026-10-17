import { z } from "zod";

// ── Auth ────────────────────────────────────────────────────────────────────
export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(72, "Password must be 72 characters or fewer")
  .regex(/[A-Za-z]/, "Password must contain at least one letter")
  .regex(/[0-9]/, "Password must contain at least one number");

export const registerSchema = z.object({
  name: z.string().min(2, "Name is required").max(80),
  email: z.string().email("Enter a valid email address").toLowerCase(),
  password: passwordSchema,
  institution: z.string().max(120).optional().or(z.literal("")),
  city: z.string().max(80).optional().or(z.literal("")),
  phone: z
    .string()
    .regex(/^[+()\-\s0-9]{7,20}$/, "Enter a valid phone number")
    .optional()
    .or(z.literal(""))
});

export const loginSchema = z.object({
  email: z.string().email().toLowerCase(),
  password: z.string().min(1, "Password is required")
});

export const profileSchema = z.object({
  name: z.string().min(2).max(80).optional(),
  phone: z.string().max(20).optional().or(z.literal("")),
  city: z.string().max(80).optional().or(z.literal("")),
  institution: z.string().max(120).optional().or(z.literal("")),
  bio: z.string().max(600).optional().or(z.literal("")),
  avatarUrl: z.string().url().optional().or(z.literal(""))
});

// ── Programs ────────────────────────────────────────────────────────────────
export const programTypeEnum = z.enum(["INTERNSHIP", "WORKSHOP"]);
export const programStatusEnum = z.enum(["LIVE", "UPCOMING", "ARCHIVED"]);

export const programCreateSchema = z.object({
  title: z.string().min(3).max(140),
  type: programTypeEnum,
  description: z.string().min(20).max(4000),
  duration: z.string().min(1).max(60),
  status: programStatusEnum.default("UPCOMING"),
  summary: z.string().max(300).optional().or(z.literal("")),
  image: z.string().url().optional().or(z.literal("")),
  curriculum: z.array(z.string().min(1)).max(40).optional(),
  outcomes: z.array(z.string().min(1)).max(40).optional(),
  seats: z.number().int().min(1).max(1000).optional(),
  stipend: z.string().max(60).optional().or(z.literal("")),
  mode: z.string().max(40).optional().or(z.literal("")),
  location: z.string().max(120).optional().or(z.literal("")),
  startDate: z.string().datetime().optional().or(z.literal("")),
  endDate: z.string().datetime().optional().or(z.literal("")),
  published: z.boolean().optional()
});

export const programUpdateSchema = programCreateSchema.partial();

// ── Applications ────────────────────────────────────────────────────────────
export const applicationStatusEnum = z.enum([
  "PENDING",
  "UNDER_REVIEW",
  "APPROVED",
  "REJECTED",
  "WITHDRAWN"
]);

export const applicationCreateSchema = z.object({
  programId: z.string().min(1),
  coverNote: z.string().max(1500).optional().or(z.literal("")),
  resumeUrl: z.string().optional().or(z.literal("")), // .url() badalige .string() madiddeve
  department: z.string().max(100).optional().or(z.literal("")),
  year: z.string().max(50).optional().or(z.literal("")),
  skills: z.string().max(300).optional().or(z.literal(""))
});

export const applicationUpdateSchema = z.object({
  status: applicationStatusEnum.optional(),
  reviewNote: z.string().max(1000).optional().or(z.literal("")),
  score: z.number().int().min(0).max(100).optional()
});

// ── Documents / certificates ────────────────────────────────────────────────
export const documentTypeEnum = z.enum(["RESUME", "ID_PROOF", "TRANSCRIPT", "CERTIFICATE", "OTHER"]);

export const documentCreateSchema = z.object({
  name: z.string().min(1).max(160),
  type: documentTypeEnum.default("OTHER"),
  url: z.string().min(1),
  size: z.number().int().nonnegative().optional(),
  mimeType: z.string().max(120).optional()
});

export const certificateCreateSchema = z.object({
  userId: z.string().min(1),
  title: z.string().min(3).max(160),
  programName: z.string().min(2).max(160),
  url: z.string().url().optional().or(z.literal(""))
});

// ── Admin ───────────────────────────────────────────────────────────────────
export const userUpdateSchema = z.object({
  role: z.enum(["STUDENT", "ADMIN"]).optional(),
  status: z.enum(["ACTIVE", "PENDING", "SUSPENDED"]).optional(),
  name: z.string().min(2).max(80).optional()
});

export const droneComponentSchema = z.object({
  name: z.string().min(2).max(120),
  description: z.string().min(10).max(1200),
  category: z.string().min(2).max(60),
  specs: z.array(z.string().min(1)).max(20).optional(),
  imageUrl: z.string().url().optional().or(z.literal("")),
  order: z.number().int().min(0).max(999).optional()
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ProgramCreateInput = z.infer<typeof programCreateSchema>;
export type ApplicationCreateInput = z.infer<typeof applicationCreateSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
