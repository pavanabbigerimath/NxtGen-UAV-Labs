import { z } from "zod";

/**
 * Runtime environment contract.
 * Only DATABASE_URL and NEXTAUTH_SECRET are hard requirements — every optional
 * integration (S3, Cloudinary, Upstash) degrades gracefully when unset.
 */
const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  DIRECT_URL: z.string().optional(),
  NEXTAUTH_SECRET: z.string().min(1).default("uav-labs-development-only-secret-change-me"),
  NEXTAUTH_URL: z.string().optional(),
  NEXT_PUBLIC_APP_URL: z.string().optional(),

  UPSTASH_REDIS_REST_URL: z.string().optional().or(z.literal("")),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional().or(z.literal("")),

  S3_REGION: z.string().optional().or(z.literal("")),
  S3_BUCKET: z.string().optional().or(z.literal("")),
  S3_ACCESS_KEY_ID: z.string().optional().or(z.literal("")),
  S3_SECRET_ACCESS_KEY: z.string().optional().or(z.literal("")),
  S3_ENDPOINT: z.string().optional().or(z.literal("")),

  CLOUDINARY_CLOUD_NAME: z.string().optional().or(z.literal("")),
  CLOUDINARY_API_KEY: z.string().optional().or(z.literal("")),
  CLOUDINARY_API_SECRET: z.string().optional().or(z.literal(""))
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const issues = parsed.error.issues.map((i) => `  • ${i.path.join(".")}: ${i.message}`).join("\n");
  throw new Error(`Invalid environment configuration:\n${issues}`);
}

export const env = parsed.data;

export const appUrl =
  env.NEXT_PUBLIC_APP_URL ?? env.NEXTAUTH_URL ?? "http://localhost:3000";

export const storageProvider: "s3" | "cloudinary" | "local" = env.S3_BUCKET
  ? "s3"
  : env.CLOUDINARY_CLOUD_NAME
    ? "cloudinary"
    : "local";

export const rateLimitProvider: "upstash" | "memory" =
  env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN ? "upstash" : "memory";
