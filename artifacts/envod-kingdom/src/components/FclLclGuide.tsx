import { useLanguage } from "@/lib/language-context";

const rows: { criterion: [string, string]; fcl: [string, string]; lcl: [string, string] }[] = [
  {
    criterion: ["Container use", "استخدام الحاوية"],
    fcl: ["A container is booked for your consignment; it does not have to be physically full.", "تُحجز الحاوية لشحنتك، ولا يشترط أن تكون ممتلئة فعلياً."],
    lcl: ["Your cargo shares container space with other consignments through consolidation.", "تشارك بضاعتك مساحة الحاوية مع شحنات أخرى عبر التجميع."],
  },
  {
    criterion: ["Quote inputs", "بيانات عرض السعر"],
    fcl: ["Container requirements, cargo weight, ports, collection and delivery arrangements.", "متطلبات الحاوية ووزن البضاعة والموانئ وترتيبات الاستلام والتسليم."],
    lcl: ["Packed dimensions, volume, weight, stackability and consolidation/deconsolidation charges.", "الأبعاد بعد التعبئة والحجم والوزن وقابلية الرص ورسوم التجميع وفك التجميع."],
  },
  {
    criterion: ["Handling", "المناولة"],
    fcl: ["Plan loading, securing and unloading; customs or other inspections may still occur.", "خطط للتحميل والتثبيت والتفريغ؛ وقد تظل هناك فحوص جمركية أو فحوص أخرى."],
    lcl: ["Allow for cargo grouping, separation and suitable packaging at shared handling points.", "راعِ تجميع البضائع وفصلها والتعبئة المناسبة في نقاط المناولة المشتركة."],
  },
  {
    criterion: ["Cost and timing", "التكلفة والمدة"],
    fcl: ["Compare a complete route-specific quote, not the ocean rate alone.", "قارن عرضاً شاملاً للمسار المحدد، لا أجرة النقل البحري وحدها."],
    lcl: ["Check minimum charges, local handling and availability; smaller does not always mean cheaper.", "تحقق من الحد الأدنى للرسوم والمناولة المحلية والتوفر؛ فالحجم الأصغر لا يعني دائماً تكلفة أقل."],
  },
];

export function FclLclGuide() {
  const { t } = useLanguage();
  return (
    <div id="fcl-lcl-comparison" className="my-10 scroll-mt-40 md:scroll-mt-28">
      <h3 className="mb-4 text-xl font-bold text-white">{t("FCL or LCL: what should you compare?", "حاوية كاملة أم شحن جزئي: ما الذي تقارنه؟")}</h3>
      <p className="mb-5 leading-relaxed text-white/65">{t(
        "FCL and LCL describe container-use arrangements, not guaranteed prices or transit times. Select the arrangement using cargo compatibility, handling needs and the full origin-to-destination scope.",
        "يصف FCL وLCL ترتيبات استخدام الحاوية، لا أسعاراً أو مدد عبور مضمونة. اختر الترتيب وفق توافق البضاعة ومتطلبات المناولة والنطاق الكامل من المنشأ إلى الوجهة.",
      )}</p>
      <div className="overflow-x-auto rounded-xl border border-white/10" role="region" aria-label={t("FCL and LCL comparison", "مقارنة الشحن الكامل والجزئي")} tabIndex={0}>
        <table className="w-full min-w-[600px] text-start text-sm leading-relaxed">
          <caption className="sr-only">{t("Container-shipping planning comparison", "مقارنة لتخطيط الشحن بالحاويات")}</caption>
          <thead className="bg-white/[0.06] text-white">
            <tr>
              {[t("Consideration", "وجه المقارنة"), t("FCL — Full Container Load", "FCL — حاوية كاملة"), t("LCL — Less than Container Load", "LCL — شحن جزئي")].map((label) => <th key={label} scope="col" className="p-4 text-start">{label}</th>)}
            </tr>
          </thead>
          <tbody className="text-white/70">
            {rows.map((row) => <tr key={row.criterion[0]} className="border-t border-white/10">
              <th scope="row" className="p-4 text-start font-semibold text-white/90">{t(...row.criterion)}</th>
              <td className="p-4 align-top">{t(...row.fcl)}</td>
              <td className="p-4 align-top">{t(...row.lcl)}</td>
            </tr>)}
          </tbody>
        </table>
      </div>
      <p className="mt-4 text-sm text-white/55">{t(
        "Confirm carrier acceptance, import requirements, Incoterms, excluded charges and any destination delivery obligations before booking.",
        "أكد قبول الناقل ومتطلبات الاستيراد والإنكوترمز والرسوم المستثناة وأي التزامات للتسليم في الوجهة قبل الحجز.",
      )}</p>
      <a href="https://www.maersk.com/support/faqs/what-is-fcl" target="_blank" rel="noopener noreferrer" className="mt-4 inline-block text-sm text-secondary underline underline-offset-4">
        {t("Carrier reference: what FCL means", "مرجع من ناقل بحري: معنى FCL")}
      </a>
    </div>
  );
}
