import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";

const createSchema = z.object({
  nameUk: z.string().min(1),
  nameEn: z.string().min(1),
});

export async function GET() {
  const list = await prisma.recipe.findMany({
    orderBy: { updatedAt: "desc" },
    include: {
      _count: { select: { items: true, steps: true } },
    },
  });
  return NextResponse.json(list);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = createSchema.parse(body);
  const created = await prisma.recipe.create({
    data: {
      nameUk: parsed.nameUk,
      nameEn: parsed.nameEn,
    },
  });
  return NextResponse.json(created, { status: 201 });
}
