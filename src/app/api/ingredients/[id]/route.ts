import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";

const updateSchema = z.object({
  nameUk: z.string().min(1).optional(),
  nameEn: z.string().nullable().optional(),
  unit: z.enum(["kg", "l", "pcs"]).optional(),
  pricePerUnit: z.number().nonnegative().optional(),
  wasteColdPct: z.number().min(0).max(100).optional(),
  wasteHotPct: z.number().min(0).max(100).optional(),
  supplier: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const body = await req.json();
  const parsed = updateSchema.parse(body);
  const updated = await prisma.ingredient.update({
    where: { id: params.id },
    data: parsed,
  });
  return NextResponse.json(updated);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  await prisma.ingredient.delete({ where: { id: params.id } });
  return new NextResponse(null, { status: 204 });
}
