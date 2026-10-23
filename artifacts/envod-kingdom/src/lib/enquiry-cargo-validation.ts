// Shared, dependency-free predicates: the quote UI must not download Zod just
// to validate four optional cargo fields. The server still validates with Zod.
export const CARGO_FIELD_LIMITS = {
  dimensions: 160,
  packageCount: 80,
  weightKg: 30,
  preferredShippingDate: 10,
  eventDetails: 300,
} as const;

type CargoField = keyof typeof CARGO_FIELD_LIMITS;
type CargoInput = Partial<Record<CargoField, unknown>>;

export function isValidCargoWeight(value: string): boolean {
  return value === "" || (/^\d+(?:\.\d{1,3})?$/.test(value) &&
    Number(value) > 0 && Number(value) <= 1_000_000_000);
}

export function isValidShippingDate(value: string): boolean {
  if (value === "") return true;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export function isQuoteCargoValid(values: CargoInput): boolean {
  const fields = Object.keys(CARGO_FIELD_LIMITS) as CargoField[];
  if (fields.some((field) => values[field] !== undefined && typeof values[field] !== "string")) return false;
  const text = (field: CargoField) => (values[field] as string | undefined)?.trim() ?? "";
  return fields.every((field) => text(field).length <= CARGO_FIELD_LIMITS[field]) &&
    isValidCargoWeight(text("weightKg")) && isValidShippingDate(text("preferredShippingDate"));
}
