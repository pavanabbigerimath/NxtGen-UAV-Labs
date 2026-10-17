import { apiUser } from "@/lib/session";
import { ok, handleRouteError, unauthorized, badRequest } from "@/lib/api";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

// GET: Fetch all documents for the user
export async function GET(req: Request) {
  try {
    const user = await apiUser();
    if (!user) return unauthorized();

    const documents = await prisma.document.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" }
    });

    return ok({ documents });
  } catch (error) {
    return handleRouteError(error, "documents:GET");
  }
}

// POST: Save document metadata after upload
export async function POST(req: Request) {
  try {
    const user = await apiUser();
    if (!user) return unauthorized();

    const body = await req.json();
    const { name, type, url, size, mimeType } = body;

    if (!name || !url || !type) {
      return badRequest("Missing required document fields");
    }

    const document = await prisma.document.create({
      data: {
        name,
        type,
        url,
        size: size ? Number(size) : null,
        mimeType: mimeType || null,
        userId: user.id
      }
    });

    return ok({ document });
  } catch (error) {
    return handleRouteError(error, "documents:POST");
  }
}