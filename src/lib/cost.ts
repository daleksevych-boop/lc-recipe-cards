import type { CostSummary, RecipeView } from "./types";

/**
 * Compute cost summary for a recipe. All ingredient prices are stored as
 * "UAH per base unit" where base unit is kg for unit="kg", liter for "l",
 * piece for "pcs". netWeight is in the same base unit.
 */
export function computeCost(recipe: RecipeView): CostSummary {
  const perItemCost = recipe.items.map(
    (it) => (it.netWeight || 0) * (it.pricePerUnitSnapshot || 0),
  );
  const costTotal = perItemCost.reduce((a, b) => a + b, 0);

  const totalNetKg = recipe.items.reduce((acc, it) => {
    if (it.unit === "kg" || it.unit === "l") return acc + (it.netWeight || 0);
    return acc;
  }, 0);

  const price = recipe.sellingPriceNet;
  const foodcostUah = price != null ? price - costTotal : null;
  const foodcostPct =
    price != null && price > 0 ? (costTotal / price) * 100 : null;

  return { costTotal, perItemCost, foodcostUah, foodcostPct, totalNetKg };
}

/** Format a weight cell value as it appears in the PDF table. */
export function formatWeightCell(value: number, unit: "kg" | "l" | "pcs"): string {
  if (unit === "pcs") {
    // Render "1 pcs.", "0.5 pcs.", "2 pcs." — match original PDF style
    const rounded = Number.isInteger(value) ? value.toString() : value.toString();
    return `${rounded} pcs.`;
  }
  // kg / l — three decimals with comma as the decimal separator (Ukrainian convention)
  return value.toFixed(3).replace(".", ",");
}

/** Format UAH currency. */
export function formatUah(value: number): string {
  return `${value.toFixed(2).replace(".", ",")} грн`;
}
