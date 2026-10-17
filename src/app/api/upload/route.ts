import { NextResponse } from "next/server";
import { apiUser } from "@/lib/session";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const user = await apiUser();
    if (!user) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = (formData.get("file") || formData.get("document") || formData.get("attachment")) as File;

    if (!file) {
      return NextResponse.json({ ok: false, error: "No file provided" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Sanitize file name
    const cleanName = file.name ? file.name.replace(/\s+/g, "_") : "file";
    const filename = `${Date.now()}-${cleanName}`;
    const uploadDir = path.join(process.cwd(), "public", "uploads");

    await mkdir(uploadDir, { recursive: true });
    await writeFile(path.join(uploadDir, filename), buffer);

    const fileUrl = `/uploads/${filename}`;

    return NextResponse.json({
      ok: true,
      upload: {
        url: fileUrl,
        size: file.size,
        mimeType: file.type || "application/octet-stream"
      }
    });
  } catch (error: any) {
    console.error("[api:upload:POST Error]:", error);
    return NextResponse.json(
      { ok: false, error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}