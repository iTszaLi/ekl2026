import { useLanguage } from "@/lib/language-context";
import { getEnquiryServiceById } from "@/lib/enquiry-services";

interface Props {
  serviceId: string;
  values: Record<string, string>;
  onChange: (id: string, value: string) => void;
  idPrefix: string;
  fieldClass: string;
  labelClass: string;
}

export function ServiceRequirementFields({
  serviceId, values, onChange, idPrefix, fieldClass, labelClass,
}: Props) {
  const { t, isRtl } = useLanguage();
  const service = getEnquiryServiceById(serviceId);
  if (!service?.fields.length) return null;

  return (
    <section className="space-y-3" aria-labelledby={`${idPrefix}-heading`} data-testid={`service-requirements-${serviceId}`}>
      <div>
        <h4 id={`${idPrefix}-heading`} className="text-sm font-semibold text-white/85">
          {t("Service requirements", "متطلبات الخدمة")}
        </h4>
        <p className="mt-1 text-[11px] leading-relaxed text-white/45">
          {t("All service details are optional. Choose “Not sure yet” if you need guidance.", "جميع تفاصيل الخدمة اختيارية. اختر «غير متأكد بعد» إذا كنت بحاجة إلى توجيه.")}
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {service.fields.map((field) => {
          const id = `${idPrefix}-${field.id}`;
          const value = values[field.id] ?? "";
          const placeholder = field.placeholderEn || field.placeholderAr
            ? t(field.placeholderEn ?? "", field.placeholderAr ?? "")
            : "";
          const controlClass = `${fieldClass} ${field.kind === "textarea" ? "min-h-20 resize-y" : ""}`;

          return (
            <div key={field.id} className={field.kind === "textarea" ? "sm:col-span-2" : ""}>
              <label htmlFor={id} className={labelClass}>
                {t(field.en, field.ar)}
                <span className="ml-1 font-normal normal-case text-white/40">({t("optional", "اختياري")})</span>
              </label>
              {field.kind === "textarea" ? (
                <textarea
                  id={id}
                  name={field.id}
                  rows={3}
                  maxLength={field.maxLength}
                  value={value}
                  onChange={(event) => onChange(field.id, event.target.value)}
                  placeholder={placeholder}
                  dir={isRtl ? "auto" : undefined}
                  className={controlClass}
                />
              ) : field.kind === "select" ? (
                <select
                  id={id}
                  name={field.id}
                  value={value}
                  onChange={(event) => onChange(field.id, event.target.value)}
                  className={controlClass}
                  dir={isRtl ? "rtl" : "ltr"}
                >
                  <option value="" className="bg-[#0b1728]">{t("Select if known (optional)", "اختر إن كنت تعرف (اختياري)")}</option>
                  {field.options?.map((option) => (
                    <option key={option.value} value={option.value} className="bg-[#0b1728]">
                      {t(option.en, option.ar)}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  id={id}
                  name={field.id}
                  type={field.kind === "number" ? "number" : field.kind}
                  min={field.kind === "number" ? "0" : undefined}
                  step={field.kind === "number" ? "any" : undefined}
                  inputMode={field.kind === "number" ? "decimal" : undefined}
                  maxLength={field.kind === "date" ? undefined : field.maxLength}
                  max={field.kind === "date" ? "9999-12-31" : undefined}
                  value={value}
                  onChange={(event) => onChange(field.id, event.target.value)}
                  placeholder={placeholder}
                  dir={isRtl ? "auto" : undefined}
                  className={controlClass}
                />
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
