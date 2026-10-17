import { randomUUID } from "crypto";
import { promises as fs } from "fs";
import path from "path";
import { env, storageProvider } from "./env";

/**
 * Storage abstraction with three backends, selected automatically:
 *   S3 (AWS SDK) → Cloudinary (signed REST) → local disk (/public/uploads).
 *
 * Priority is deliberate: S3 for production object storage, Cloudinary as a
 * hosted fallback, and local disk so the app is fully functional out of the box
 * in development and preview environments.
 */

export type UploadResult = {
  url: string;
  key: string;
  size: number;
  mimeType: string;
  provider: "s3" | "cloudinary" | "local";
};

export const ALLOWED_MIME = new Set([
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain"
]);

export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024; // 8 MB

export function sanitizeFilename(name: string): string {
  return name
    .replace(/\.[^./\\]+$/, "")
    .replace(/[^a-zA-Z0-9-_]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60) || "file";
}

function extensionOf(file: File): string {
  const fromName = file.name.includes(".") ? file.name.split(".").pop() : "";
  if (fromName && fromName.length <= 5) return fromName.toLowerCase();
  const map: Record<string, string> = {
    "application/pdf": "pdf",
    "image/png": "png",
    "image/jpeg": "jpg",
    "image/webp": "webp",
    "image/gif": "gif",
    "text/plain": "txt"
  };
  return map[file.type] ?? "bin";
}

export function buildKey(folder: string, file: File): string {
  return `${folder}/${Date.now()}-${randomUUID().slice(0, 8)}-${sanitizeFilename(file.name)}.${extensionOf(file)}`;
}

// ── S3 ──────────────────────────────────────────────────────────────────────
async function uploadToS3(file: File, key: string): Promise<string> {
  const { S3Client, PutObjectCommand } = await import("@aws-sdk/client-s3");
  const client = new S3Client({
    region: env.S3_REGION || "us-east-1",
    ...(env.S3_ENDPOINT ? { endpoint: env.S3_ENDPOINT, forcePathStyle: true } : {}),
    credentials: {
      accessKeyId: env.S3_ACCESS_KEY_ID as string,
      secretAccessKey: env.S3_SECRET_ACCESS_KEY as string
    }
  });

  await client.send(
    new PutObjectCommand({
      Bucket: env.S3_BUCKET as string,
      Key: key,
      Body: Buffer.from(await file.arrayBuffer()),
      ContentType: file.type || "application/octet-stream",
      CacheControl: "public, max-age=31536000, immutable"
    })
  );

  if (env.S3_ENDPOINT) {
    return `${env.S3_ENDPOINT.replace(/\/$/, "")}/${env.S3_BUCKET}/${key}`;
  }
  return `https://${env.S3_BUCKET}.s3.${env.S3_REGION || "us-east-1"}.amazonaws.com/${key}`;
}

// ── Cloudinary (signed, no SDK) ─────────────────────────────────────────────
async function uploadToCloudinary(file: File, key: string): Promise<string> {
  const { createHash } = await import("crypto");
  const timestamp = Math.floor(Date.now() / 1000);
  const folder = key.split("/").slice(0, -1).join("/") || "general";
  const publicId = sanitizeFilename(file.name);

  const signatureBase = `folder=${folder}&public_id=${publicId}&timestamp=${timestamp}${env.CLOUDINARY_API_SECRET}`;
  const signature = createHash("sha1").update(signatureBase).digest("hex");

  const form = new FormData();
  form.append("file", file);
  form.append("api_key", env.CLOUDINARY_API_KEY as string);
  form.append("timestamp", String(timestamp));
  form.append("folder", folder);
  form.append("public_id", publicId);
  form.append("signature", signature);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${env.CLOUDINARY_CLOUD_NAME}/auto/upload`,
    { method: "POST", body: form }
  );

  if (!res.ok) throw new Error(`Cloudinary upload failed (${res.status}): ${await res.text()}`);
  const json = (await res.json()) as { secure_url?: string };
  if (!json.secure_url) throw new Error("Cloudinary response did not include secure_url");
  return json.secure_url;
}

// ── Local disk ──────────────────────────────────────────────────────────────
async function uploadToLocal(file: File, key: string): Promise<string> {
  const dest = path.join(process.cwd(), "public", "uploads", key);
  await fs.mkdir(path.dirname(dest), { recursive: true });
  await fs.writeFile(dest, Buffer.from(await file.arrayBuffer()));
  return `/uploads/${key}`;
}

export async function uploadFile(file: File, folder = "documents"): Promise<UploadResult> {
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error(`File exceeds the ${Math.round(MAX_UPLOAD_BYTES / 1024 / 1024)}MB limit.`);
  }
  if (!ALLOWED_MIME.has(file.type)) {
    throw new Error("Unsupported file type. Allowed: PDF, PNG, JPG, WEBP, GIF, DOC, DOCX, TXT.");
  }

  const key = buildKey(folder, file);

  let url: string;
  if (storageProvider === "s3") url = await uploadToS3(file, key);
  else if (storageProvider === "cloudinary") url = await uploadToCloudinary(file, key);
  else url = await uploadToLocal(file, key);

  return { url, key, size: file.size, mimeType: file.type, provider: storageProvider };
}

export { storageProvider };
