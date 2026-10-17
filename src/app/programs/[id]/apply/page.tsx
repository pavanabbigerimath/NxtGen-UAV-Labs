import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireStudent } from "@/lib/session";
import { ApplyFormClient } from "./apply-form-client";

export const dynamic = "force-dynamic";

export default async function ProgramApplyPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const session = await requireStudent();

  const program = await prisma.program.findUnique({
    where: { id: resolvedParams.id },
    select: { id: true, title: true, type: true, duration: true }
  });

  if (!program) {
    redirect("/programs");
  }

  const existing = await prisma.application.findFirst({
    where: { userId: session.id, programId: program.id }
  });

  if (existing) {
    redirect("/dashboard");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    select: { name: true, email: true, phone: true, institution: true }
  });

  return (
    <ApplyFormClient
      programId={program.id}
      programTitle={program.title}
      defaultPhone={user?.phone ?? ""}
      defaultCollege={user?.institution ?? ""}
    />
  );
}