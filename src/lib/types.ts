// Shared types used across the app and PDF templates.

export type Unit = "kg" | "l" | "pcs";

export interface RecipeItemView {
  displayName: string;
  unit: Unit;
  /** For unit=kg/l — kilograms/liters. For unit=pcs — number of pieces (can be fractional, e.g. 0.5). */
  grossWeight: number;
  netWeight: number;
  pricePerUnitSnapshot: number;
}

export interface RecipeStepView {
  stepNumber: number;
  text: string;
}

export interface RecipeView {
  nameUk: string;
  nameEn: string;
  versionCode: string;
  /** Selling price net of VAT, UAH. */
  sellingPriceNet: number | null;
  totalWeightKg: number | null;
  items: RecipeItemView[];
  steps: RecipeStepView[];
}

export interface CostSummary {
  costTotal: number; // UAH, sum of (netWeight * pricePerUnitSnapshot) per item
  perItemCost: number[]; // UAH per recipe item (same order as items)
  /** Foodcost in UAH = sellingPriceNet - costTotal (per user's formula). null if no price. */
  foodcostUah: number | null;
  /** Foodcost in % = costTotal / sellingPriceNet * 100. null if no price. */
  foodcostPct: number | null;
  /** Sum of net weights converted to kg (kg/l → kg, pcs → not summed; pcs items contribute 0 to total weight). */
  totalNetKg: number;
}
