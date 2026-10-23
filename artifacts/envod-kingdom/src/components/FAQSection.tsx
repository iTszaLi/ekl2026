import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Minus } from "lucide-react";
import { useLanguage } from "@/lib/language-context";

interface FAQ {
  category: string;
  categoryAr: string;
  question: string;
  questionAr: string;
  answer: string;
  answerAr: string;
}

const FAQS: FAQ[] = [
  {
    category: "Customs Clearance",
    categoryAr: "التخليص الجمركي",
    question: "How long does customs clearance take in Saudi Arabia?",
    questionAr: "كم يستغرق التخليص الجمركي في المملكة العربية السعودية؟",
    answer: "Customs-clearance timing depends on the goods, document readiness, customs procedures, and any required approvals. ZATCA's import guidance sets shipment-preparation requirements but does not promise a release time. Share the origin, destination, and cargo details for a shipment-specific estimate.",
    answerAr: "تعتمد مدة التخليص الجمركي على نوع البضاعة وجاهزية المستندات والإجراءات الجمركية وأي موافقات لازمة. تحدد إرشادات هيئة الزكاة والضريبة والجمارك متطلبات تجهيز الشحنة ولا تضمن مدة للإفراج. أرسل المنشأ والوجهة وتفاصيل البضاعة للحصول على تقدير خاص بالشحنة.",
  },
  {
    category: "Customs Clearance",
    categoryAr: "التخليص الجمركي",
    question: "What documents are required for customs clearance in Saudi Arabia?",
    questionAr: "ما هي المستندات المطلوبة للتخليص الجمركي في المملكة؟",
    answer: "ZATCA's general import instructions list a commercial invoice and bill of lading, and a certificate of origin unless origin is clearly established. Other documents may be required based on the goods and applicable product controls. Check the current tariff and regulator requirements for the shipment; share its HS code, cargo type, and route for a case-specific document list.",
    answerAr: "تذكر الإرشادات العامة للاستيراد لدى هيئة الزكاة والضريبة والجمارك الفاتورة التجارية وبوليصة الشحن، وشهادة المنشأ ما لم يكن بلد المنشأ واضحاً. وقد تُطلب مستندات أخرى بحسب نوع البضاعة والضوابط المطبقة. راجع التعرفة الجمركية ومتطلبات الجهة المختصة للشحنة، وأرسل رمز النظام المنسق ونوع البضاعة والمسار للحصول على قائمة خاصة بالحالة.",
  },
  {
    category: "Customs Clearance",
    categoryAr: "التخليص الجمركي",
    question: "Can ENVOD KINGDOM handle customs clearance at all Saudi ports?",
    questionAr: "هل يمكن لانفود كينجدم التخليص في جميع موانئ المملكة؟",
    answer: "ENVOD does not claim coverage at every Saudi port, airport or border. Requests involving Jeddah Islamic Port, King Abdulaziz Port in Dammam, Riyadh Dry Port or a named airport are reviewed against the shipment, gateway, responsible operator and available scope. Customs release decisions remain with the responsible authorities.",
    answerAr: "لا تدّعي إنفود تغطية جميع الموانئ أو المطارات أو المنافذ البرية السعودية. تتم مراجعة الطلبات المتعلقة بميناء جدة الإسلامي أو ميناء الملك عبدالعزيز بالدمام أو الميناء الجاف بالرياض أو مطار محدد وفق الشحنة والمنفذ والجهة المسؤولة والنطاق المتاح. وتبقى قرارات الفسح الجمركي من اختصاص السلطات المعنية.",
  },
  {
    category: "Road Transportation",
    categoryAr: "النقل البري",
    question: "Do you provide road transportation across Saudi Arabia?",
    questionAr: "هل تقدمون خدمات النقل البري عبر المملكة العربية السعودية؟",
    answer: "Route, vehicle type, operator, capacity and availability are confirmed for each request; the website does not publish a fleet count or imply coverage of every city. Share the origin, destination, cargo dimensions, weight and requested dates so the options can be checked.",
    answerAr: "يتم تأكيد المسار ونوع المركبة والمشغّل والسعة والتوفر لكل طلب؛ ولا ينشر الموقع عدداً للأسطول أو يدّعي تغطية كل مدينة. أرسل المنشأ والوجهة وأبعاد البضاعة ووزنها والتواريخ المطلوبة للتحقق من الخيارات.",
  },
  {
    category: "Road Transportation",
    categoryAr: "النقل البري",
    question: "Do you offer GCC cross-border trucking?",
    questionAr: "هل تقدمون خدمات الشحن البري العابر لدول الخليج؟",
    answer: "Send the origin, destination, cargo and requested dates for a route review. Availability, carrier/operator, border crossing, transit documents and customs responsibilities must be confirmed for the particular shipment; coverage of every GCC crossing is not assumed.",
    answerAr: "أرسل المنشأ والوجهة والبضاعة والتواريخ المطلوبة لمراجعة المسار. يجب تأكيد التوفر والناقل أو المشغّل والمنفذ الحدودي ومستندات العبور ومسؤوليات الجمارك للشحنة المعنية؛ ولا يُفترض توفر الخدمة عند جميع منافذ الخليج.",
  },
  {
    category: "Road Transportation",
    categoryAr: "النقل البري",
    question: "Can you transport oversized or heavy cargo?",
    questionAr: "هل تستطيعون نقل الحمولات الكبيرة والثقيلة؟",
    answer: "Heavy or oversized cargo requires a shipment-specific feasibility review. Send the dimensions, weight, cargo type, origin, destination and timing; route surveys, vehicle availability, permits and escorts must be confirmed with the relevant operator and authorities.",
    answerAr: "تتطلب البضائع الثقيلة أو الضخمة مراجعة جدوى خاصة بالشحنة. أرسل الأبعاد والوزن ونوع البضاعة والمنشأ والوجهة والتوقيت؛ ويجب تأكيد المسوحات ونوع المركبة والتصاريح والمرافقة مع المشغّل والجهات المختصة.",
  },
  {
    category: "Sea Freight",
    categoryAr: "الشحن البحري",
    question: "Do you provide Full Container Load (FCL) and Less than Container Load (LCL) shipping?",
    questionAr: "هل تقدمون خدمات شحن الحاوية الكاملة وشحن التجميع؟",
    answer: "FCL and LCL are common ocean-freight booking types. Availability, origin/destination gateways, consolidation, charges and transit time depend on the route, cargo and carrier. Share the shipment details to check current options; no savings or schedule is guaranteed.",
    answerAr: "تُعد FCL وLCL من أنواع حجز الشحن البحري الشائعة. ويعتمد التوفر ومنافذ المنشأ والوجهة والتجميع والرسوم ومدة النقل على المسار والبضاعة والناقل. أرسل تفاصيل الشحنة للتحقق من الخيارات الحالية؛ ولا يوجد ضمان للتوفير أو الجدول الزمني.",
  },
  {
    category: "Sea Freight",
    categoryAr: "الشحن البحري",
    question: "Which international ports does ENVOD KINGDOM serve?",
    questionAr: "ما هي الموانئ الدولية التي يخدمها انفود كينجدم؟",
    answer: "International destinations depend on the origin, destination, carrier service and current routing. Send the requested ports and cargo details so the available routing and responsible operators can be checked; no country count or direct service is assumed.",
    answerAr: "تعتمد الوجهات الدولية على المنشأ والوجهة وخدمة الناقل والمسار الحالي. أرسل الموانئ المطلوبة وتفاصيل البضاعة للتحقق من المسار المتاح والجهات المشغّلة؛ ولا يُفترض عدد محدد للدول أو وجود خدمة مباشرة.",
  },
  {
    category: "Air Freight",
    categoryAr: "الشحن الجوي",
    question: "Do you provide urgent or express air freight from Saudi Arabia?",
    questionAr: "هل تقدمون خدمات الشحن الجوي العاجل من المملكة العربية السعودية؟",
    answer: "Urgent and express air options depend on route, flight capacity, cargo acceptance, documentation and airport arrangements. Share the cargo-ready date, dimensions, weight, commodity and route for a feasibility check; no booking or departure time is guaranteed.",
    answerAr: "تعتمد خيارات الشحن الجوي العاجل والسريع على المسار وسعة الرحلات وقبول البضاعة والمستندات وترتيبات المطار. أرسل موعد جاهزية البضاعة وأبعادها ووزنها ونوعها والمسار للتحقق من إمكانية التنفيذ؛ ولا يُضمن الحجز أو موعد المغادرة.",
  },
  {
    category: "Air Freight",
    categoryAr: "الشحن الجوي",
    question: "Can ENVOD KINGDOM ship dangerous goods or hazardous materials by air?",
    questionAr: "هل يمكن شحن البضائع الخطرة والمواد الكيميائية جواً؟",
    answer: "Dangerous-goods acceptance depends on classification, packaging, documents, route, carrier rules and the availability of appropriately qualified operators. Send the UN number or classification and route for review; no company certification or acceptance of every class is claimed here.",
    answerAr: "يعتمد قبول البضائع الخطرة على التصنيف والتعبئة والمستندات والمسار وقواعد الناقل وتوفر الجهات المؤهلة. أرسل رقم الأمم المتحدة أو التصنيف والمسار للمراجعة؛ ولا يدّعي هذا الموقع اعتماداً للشركة أو قبول جميع الفئات.",
  },
  {
    category: "Warehousing",
    categoryAr: "التخزين",
    question: "Do you offer bonded or short-term warehousing in Saudi Arabia?",
    questionAr: "هل تقدمون خدمات التخزين الجمركي أو التخزين قصير المدى في المملكة؟",
    answer: "Storage requests are checked against the selected facility's location, operator, capacity, authorization, cargo acceptance and storage conditions. Bonded status and any duty treatment must be verified with the responsible facility and customs authorities; no warehouse locations or bonded capacity are assumed.",
    answerAr: "تتم مراجعة طلبات التخزين وفق موقع المنشأة المختارة ومشغّلها وسعتها وترخيصها وقبولها للبضاعة وظروف التخزين. ويجب التحقق من الصفة الجمركية وأي معاملة للرسوم مع المنشأة والسلطات الجمركية المسؤولة؛ ولا يُفترض توفر مواقع مستودعات أو سعة جمركية.",
  },
  {
    category: "Warehousing",
    categoryAr: "التخزين",
    question: "Do you provide inventory management and distribution services?",
    questionAr: "هل تقدمون خدمات إدارة المخزون والتوزيع؟",
    answer: "Ask about the specific storage, inventory, order-handling or distribution scope you need. Availability, facility, technology, coverage and system integrations must be checked and agreed for the project; the site does not promise a full 3PL network or real-time inventory access.",
    answerAr: "استفسر عن نطاق التخزين أو المخزون أو تجهيز الطلبات أو التوزيع الذي تحتاجه. يجب التحقق والاتفاق على توفر الخدمة والمنشأة والتقنية والتغطية وتكامل الأنظمة للمشروع؛ ولا يَعِد الموقع بشبكة 3PL كاملة أو وصول فوري للمخزون.",
  },
  {
    category: "Exhibition Logistics",
    categoryAr: "لوجستيات المعارض",
    question: "Can ENVOD KINGDOM transport exhibition equipment and trade show cargo?",
    questionAr: "هل يمكن لانفود كينجدم نقل معدات المعارض والمؤتمرات؟",
    answer: "ENVOD can review exhibition-shipment enquiries involving freight planning, shipment documents, temporary-admission questions, venue schedules and return routing. Service availability, customs operator, ATA eligibility, venue contractor and on-site responsibilities must be confirmed for each event; ATA Carnets are issued by an authorized association, not ENVOD.",
    answerAr: "يمكن لإنفود مراجعة استفسارات شحن المعارض المتعلقة بتخطيط الشحن ومستندات الشحنة والاستيراد المؤقت وجداول الموقع ومسار العودة. يجب تأكيد توفر الخدمة ومشغّل التخليص وأهلية كارنيه ATA ومقاول الموقع والمسؤوليات الميدانية لكل فعالية؛ وتصدر الكارنيهات جهة مخوّلة لا إنفود.",
  },
  {
    category: "Exhibition Logistics",
    categoryAr: "لوجستيات المعارض",
    question: "Do you handle ATA Carnet shipments for Saudi Arabia?",
    questionAr: "هل تتعاملون مع شحنات كارنيه ATA للمملكة العربية السعودية؟",
    answer: "The ICC identifies the Federation of Saudi Chambers (FSC) as Saudi Arabia's national guaranteeing and issuing association. Since 1 June 2024, Saudi Customs has accepted ATA Carnets for eligible goods for display or use at exhibitions, fairs, meetings, and similar events under Istanbul Convention Annex B1. Confirm item eligibility, documents, acceptance, and re-export conditions with the issuing association and customs authorities. ENVOD KINGDOM can coordinate shipment information and documentation; it does not issue or guarantee a Carnet.",
    answerAr: "تحدد غرفة التجارة الدولية اتحاد الغرف السعودية بوصفه الجهة الوطنية الضامنة والمصدرة لدفاتر ATA في المملكة. ومنذ 1 يونيو 2024 تقبل الجمارك السعودية دفاتر ATA للبضائع المؤهلة للعرض أو الاستخدام في المعارض والأسواق والاجتماعات والفعاليات المماثلة ضمن الملحق B1 لاتفاقية إسطنبول. يجب تأكيد أهلية البضاعة والمستندات والقبول وشروط إعادة التصدير مع جهة الإصدار والسلطات الجمركية. ويمكن لإنفود كينغدوم تنسيق معلومات الشحنة ومستنداتها، لكنها لا تصدر الدفتر ولا تضمن قبوله.",
  },
];

function AccordionItem({
  faq,
  isOpen,
  onToggle,
  index,
}: {
  faq: FAQ;
  isOpen: boolean;
  onToggle: () => void;
  index: number;
}) {
  const { isRtl } = useLanguage();
  const q = isRtl ? faq.questionAr : faq.question;
  const a = isRtl ? faq.answerAr : faq.answer;

  return (
    <div className={`border-b border-[#E2E8F0] last:border-0 ${isRtl ? "rtl" : ""}`}>
      <h3 className="m-0">
        <button
          type="button"
          onClick={onToggle}
          className={`w-full py-5 flex items-start gap-4 text-left group ${isRtl ? "flex-row-reverse text-right" : ""}`}
          aria-expanded={isOpen}
          id={`faq-question-${index}`}
          aria-controls={`faq-answer-${index}`}
        >
          <span className={`flex-none mt-0.5 w-6 h-6 rounded-full flex items-center justify-center border transition-all duration-300 ${isOpen ? "bg-secondary border-secondary" : "border-[#CBD5E1] group-hover:border-secondary/50"}`}>
            {isOpen
              ? <Minus className="w-3 h-3 text-white" />
              : <Plus className="w-3 h-3 text-[#94A3B8] group-hover:text-secondary transition-colors" />
            }
          </span>
          <span className={`font-semibold text-sm md:text-base leading-snug transition-colors duration-200 ${isOpen ? "text-secondary" : "text-[#475569] group-hover:text-[#0A2342]"}`}>
            {q}
          </span>
        </button>
      </h3>
      <div
        id={`faq-answer-${index}`}
        role="region"
        aria-labelledby={`faq-question-${index}`}
        aria-hidden={!isOpen}
        className="grid overflow-hidden transition-[grid-template-rows] duration-300 ease-out"
        style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
      >
        <div className="min-h-0 overflow-hidden">
          <p className={`pb-5 pl-10 pr-4 text-sm leading-relaxed ${isRtl ? "pr-10 pl-4" : ""}`} style={{ color: "#64748B" }}>
            {a}
          </p>
        </div>
      </div>
    </div>
  );
}

const CATEGORIES = [...new Set(FAQS.map(f => f.category))];

export function FAQSection() {
  const { t, isRtl } = useLanguage();
  const [openIdx, setOpenIdx] = useState<number | null>(0);
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const filtered = activeCategory === "all"
    ? FAQS
    : FAQS.filter(f => f.category === activeCategory);

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": FAQS.map(f => ({
      "@type": "Question",
      "name": isRtl ? f.questionAr : f.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": isRtl ? f.answerAr : f.answer,
      },
    })),
  };

  return (
    <section
      className="py-28 relative overflow-hidden"
      id="faq"
      aria-labelledby="faq-heading"
      style={{ background: "#F8FAFC" }}
    >
      {/* FAQ Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* Subtle decoration */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] pointer-events-none opacity-[0.03]"
        style={{ background: "radial-gradient(circle, #0A2342 0%, transparent 70%)" }} />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#0A2342]/10 to-transparent" />

      <div className="container mx-auto px-4 relative z-10">

        {/* Heading */}
        <div className={`text-center mb-12 ${isRtl ? "rtl" : ""}`}>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-secondary text-[10px] font-bold tracking-[0.4em] uppercase mb-3"
          >
            {t("FREQUENTLY ASKED QUESTIONS", "الأسئلة الشائعة")}
          </motion.p>
          <motion.h2
            id="faq-heading"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.08 }}
            className="text-3xl md:text-4xl font-black mb-4"
          style={{ color: "#0A2342" }}
          >
            {t("Everything You Need to Know About", "كل ما تحتاج معرفته عن")}
            <span className="text-secondary"> {t("Our Logistics Services", "خدماتنا اللوجستية")}</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.16 }}
            className="max-w-2xl mx-auto text-sm"
            style={{ color: "#64748B" }}
          >
            {t(
              "Common questions about customs clearance, road freight, air freight, sea freight, warehousing, and exhibition logistics in Saudi Arabia.",
              "أسئلة شائعة حول التخليص الجمركي والنقل البري والجوي والبحري والتخزين ولوجستيات المعارض في المملكة.",
            )}
          </motion.p>
        </div>

        {/* Category filter */}
        <div className={`flex flex-wrap gap-2 justify-center mb-10 ${isRtl ? "flex-row-reverse" : ""}`}>
          {["all", ...CATEGORIES].map((cat) => {
            const active = activeCategory === cat;
            const label = cat === "all" ? t("All Questions", "جميع الأسئلة") : (isRtl ? FAQS.find(f => f.category === cat)?.categoryAr : cat) ?? cat;
            return (
              <button
                key={cat}
                onClick={() => { setActiveCategory(cat); setOpenIdx(null); }}
                className={`text-[11px] font-bold uppercase tracking-wider px-4 py-2 rounded-full border transition-all duration-200 ${active ? "bg-secondary border-secondary text-white shadow-lg shadow-secondary/20" : "border-[#E2E8F0] text-[#64748B] hover:border-secondary/40 hover:text-secondary bg-white"}`}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Accordion */}
        <div className="max-w-3xl mx-auto bg-white border border-[#E2E8F0] rounded-2xl px-6 md:px-8 shadow-sm">
          {filtered.map((faq, i) => (
            <AccordionItem
              key={faq.question}
              faq={faq}
              index={i}
              isOpen={openIdx === i}
              onToggle={() => setOpenIdx(openIdx === i ? null : i)}
            />
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-10"
        >
          <p className="text-sm mb-4" style={{ color: "#64748B" }}>
            {t("Still have questions? Our team is ready to help.", "لا تزال لديك أسئلة؟ فريقنا جاهز للمساعدة.")}
          </p>
          <a
            href="https://wa.me/966502260256"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#1EBE5D] text-white px-8 py-3 rounded-xl font-bold text-sm uppercase tracking-wide transition-all hover:-translate-y-0.5 shadow-lg shadow-green-500/20"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
            </svg>
            {t("Ask Us on WhatsApp", "اسألنا عبر واتساب")}
          </a>
        </motion.div>
      </div>
    </section>
  );
}
