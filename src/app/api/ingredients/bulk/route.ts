import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";

const rowSchema = z.object({
  nameUk: z.string().min(1),
  nameEn: z.string().nullable().optional(),
  unit: z.enum(["kg", "l", "pcs"]).default("kg"),
  pricePerUnit: z.number().nonnegative().default(0),
  wasteColdPct: z.number().min(0).max(100).default(0),
  wasteHotPct: z.number().min(0).max(100).default(0),
  supplier: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
});

const bodySchema = z.object({
  rows: z.array(rowSchema).min(1).max(2000),
  mode: z.enum(["upsert", "append"]).default("upsert"),
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { rows, mode } = bodySchema.parse(body);

  let created = 0;
  let updated = 0;
  const errors: { row: number; error: string }[] = [];

  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    try {
      if (mode === "upsert") {
        const existing = await prisma.ingredient.findFirst({
          where: { nameUk: r.nameUk },
        });
        if (existing) {
          await prisma.ingredient.update({
            where: { id: existing.id },
            data: r,
          });
          updated++;
        } else {
          await prisma.ingredient.create({ data: r });
          created++;
        }
      } else {
        await prisma.ingredient.create({ data: r });
        created++;
      }
    } catch (e: unknown) {
      errors.push({
        row: i + 1,
        error: e instanceof Error ? e.message : String(e),
      });
    }
  }

  return NextResponse.json({ created, updated, errors });
}
