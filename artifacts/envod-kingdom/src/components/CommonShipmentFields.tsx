import { useLanguage } from "@/lib/language-context";
import { COMMON_SHIPMENT_FIELD_LABELS, SERVICE_COMMON_FIELDS, type CommonShipmentField, type CommonShipmentValues } from "@/lib/enquiry-services";

interface Props {
  serviceId: string;
  values: CommonShipmentValues;
  onChange: (key: keyof CommonShipmentValues, value: string) => void;
  idPrefix: string;
  fieldClass: string;
  labelClass: string;
  errorId?: string;
}

export function CommonShipmentFields({
  serviceId, values, onChange, idPrefix, fieldClass, labelClass, errorId,
}: Props) {
  const { t } = useLanguage();
  const available = SERVICE_COMMON_FIELDS[serviceId as keyof typeof SERVICE_COMMON_FIELDS] ?? [];
  const has = (field: CommonShipmentField) => (available as readonly CommonShipmentField[]).includes(field);
  const label = (key: keyof CommonShipmentValues) => {
    const copy = COMMON_SHIPMENT_FIELD_LABELS[key];
    return t(copy.en, copy.ar);
  };
  const id = (key: string) => `${idPrefix}-${key}`;

  return (
    <div className="space-y-3" data-testid={`common-shipment-fields-${serviceId}`}>
      {has("locations") && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {(["origin", "destination"] as const).map((key) => (
            <div key={key}>
              <label htmlFor={id(key)} className={labelClass}>{label(key)} <span className="font-normal normal-case text-white/40">({t("optional", "اختياري")})</span></label>
              <input id={id(key)} name={key} maxLength={160} value={values[key]} onChange={(event) => onChange(key, event.target.value)} placeholder={key === "origin" ? t("e.g. Shanghai or Jeddah", "مثال: شنغهاي أو جدة") : t("e.g. Riyadh or Dubai", "مثال: الرياض أو دبي")} className={fieldClass} />
            </div>
          ))}
        </div>
      )}
      {has("cargo") && (
        <div>
          <label htmlFor={id("cargoDescription")} className={labelClass}>{label("cargoDescription")} <span className="font-normal normal-case text-white/40">({t("optional", "اختياري")})</span></label>
          <textarea id={id("cargoDescription")} name="cargoDescription" rows={3} maxLength={1200} value={values.cargoDescription} onChange={(event) => onChange("cargoDescription", event.target.value)} placeholder={t("Describe the goods or cargo, if known.", "صف البضائع أو الشحنة إن كنت تعرفها.")} className={`${fieldClass} min-h-20 resize-y`} />
        </div>
      )}
      {(has("packageCount") || has("dimensions") || has("weightKg") || has("preferredShippingDate")) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {has("packageCount") && (
            <div>
              <label htmlFor={id("packageCount")} className={labelClass}>{label("packageCount")} <span className="font-normal normal-case text-white/40">({t("optional", "اختياري")})</span></label>
              <input id={id("packageCount")} name="packageCount" maxLength={80} inputMode="text" value={values.packageCount} onChange={(event) => onChange("packageCount", event.target.value)} placeholder={t("e.g. 12 cartons or 2 pallets", "مثال: 12 صندوقاً أو طبلتان")} className={fieldClass} />
            </div>
          )}
          {has("dimensions") && (
            <div>
              <label htmlFor={id("dimensions")} className={labelClass}>{label("dimensions")} <span className="font-normal normal-case text-white/40">({t("optional", "اختياري")})</span></label>
              <input id={id("dimensions")} name="dimensions" maxLength={160} value={values.dimensions} onChange={(event) => onChange("dimensions", event.target.value)} placeholder={t("e.g. 120 × 80 × 100 cm", "مثال: 120 × 80 × 100 سم")} className={fieldClass} />
            </div>
          )}
          {has("weightKg") && (
            <div>
              <label htmlFor={id("weightKg")} className={labelClass}>{label("weightKg")} <span className="font-normal normal-case text-white/40">({t("optional", "اختياري")})</span></label>
              <input id={id("weightKg")} name="weightKg" type="number" min="0.001" max="1000000000" step="0.001" inputMode="decimal" value={values.weightKg} onChange={(event) => onChange("weightKg", event.target.value)} aria-describedby={errorId} className={fieldClass} />
            </div>
          )}
          {has("preferredShippingDate") && (
            <div>
              <label htmlFor={id("preferredShippingDate")} className={labelClass}>{label("preferredShippingDate")} <span className="font-normal normal-case text-white/40">({t("optional", "اختياري")})</span></label>
              <input id={id("preferredShippingDate")} name="preferredShippingDate" type="date" value={values.preferredShippingDate} onChange={(event) => onChange("preferredShippingDate", event.target.value)} aria-describedby={errorId} className={fieldClass} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
