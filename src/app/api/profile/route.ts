import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiUser } from "@/lib/session";

export async function PATCH(request: Request) {
  try {
    const session = await apiUser();
    if (!session || !session.id) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, phone, institution, city, bio } = body;

    // Update user profile in database with correct schema fields (institution instead of college)
    const updatedUser = await prisma.user.update({
      where: { id: session.id },
      data: {
        ...(name !== undefined && { name }),
        ...(phone !== undefined && { phone }),
        ...(institution !== undefined && { institution }),
        ...(city !== undefined && { city }),
        ...(bio !== undefined && { bio })
      }
    });

    return NextResponse.json({ ok: true, user: updatedUser });
  } catch (error: any) {
    console.error("Profile update error:", error);
    return NextResponse.json({ ok: false, error: error.message || "Internal Server Error" }, { status: 500 });
  }
}