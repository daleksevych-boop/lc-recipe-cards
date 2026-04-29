// Server-rendered print-ready HTML page used both for live preview in the
// editor (iframe) and as the source of truth Puppeteer renders to PDF.

import { RecipeCard } from "@/components/RecipeCard";
import { getRecipeView } from "@/lib/recipeQuery";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function PrintPage({
  params,
}: {
  params: { id: string };
}) {
  const recipe = await getRecipeView(params.id);
  if (!recipe) notFound();
  return <RecipeCard recipe={recipe} />;
}
