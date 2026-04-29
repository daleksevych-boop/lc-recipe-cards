import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";

const ingredientSchema = z.object({
  nameUk: z.string().min(1),
  nameEn: z.string().nullable().optional(),
  unit: z.enum(["kg", "l", "pcs"]),
  pricePerUnit: z.number().nonnegative(),
  wasteColdPct: z.number().min(0).max(100).default(0),
  wasteHotPct: z.number().min(0).max(100).default(0),
  supplier: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
});

export async function GET() {
  const list = await prisma.ingredient.findMany({
    orderBy: [{ nameUk: "asc" }],
  });
  return NextResponse.json(list);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = ingredientSchema.parse(body);
  const created = await prisma.ingredient.create({ data: parsed });
  return NextResponse.json(created, { status: 201 });
}
