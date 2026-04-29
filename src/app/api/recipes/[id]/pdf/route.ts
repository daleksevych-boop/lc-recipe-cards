import { NextRequest, NextResponse } from "next/server";
import { renderPdfFromUrl } from "@/lib/pdf";
import { getRecipeView } from "@/lib/recipeQuery";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const recipe = await getRecipeView(params.id);
  if (!recipe) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  const origin = req.nextUrl.origin;
  const url = `${origin}/print/${params.id}`;
  const pdf = await renderPdfFromUrl(url);

  const safeName = recipe.nameEn.replace(/[^a-z0-9]+/gi, "_");
  return new NextResponse(new Uint8Array(pdf), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${safeName}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
