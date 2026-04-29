// Country → VAT rate (%) for food / takeaway. Driven by the country selected
// when the recipe is created. Used for both selling price (gross↔net) and
// for the gross foodcost calculation.
//
// Norway:  25% — standard VAT rate (MVA).
// France:  20% — standard VAT rate (TVA).
export type Country = "NO" | "FR";

export const COUNTRY_VAT: Record<Country, number> = {
  NO: 25,
  FR: 20,
};

export const COUNTRY_LABEL: Record<Country, string> = {
  NO: "Norway",
  FR: "France",
};

export function vatForCountry(country: string | null | undefined): number {
  if (country === "NO" || country === "FR") return COUNTRY_VAT[country];
  return 20;
}
