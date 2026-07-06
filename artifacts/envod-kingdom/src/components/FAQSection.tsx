import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
    answer: "ENVOD KINGDOM completes most customs clearance processes within 24 hours at major Saudi ports including Riyadh Dry Port, King Abdulaziz Port in Dammam, and Islamic Port in Jeddah. Complex shipments involving special permits — such as food, pharmaceuticals, or hazardous materials — may take 2–5 business days depending on SFDA and Saudi Customs Authority requirements.",
    answerAr: "يُتم انفود كينجدم معظم عمليات التخليص الجمركي خلال 24 ساعة في المنافذ السعودية الرئيسية بما فيها الميناء الجاف بالرياض وميناء الملك عبدالعزيز بالدمام وميناء الإسلامي بجدة. قد تستغرق الشحنات ذات التصاريح الخاصة من 2 إلى 5 أيام عمل.",
  },
  {
    category: "Customs Clearance",
    categoryAr: "التخليص الجمركي",
    question: "What documents are required for customs clearance in Saudi Arabia?",
    questionAr: "ما هي المستندات المطلوبة للتخليص الجمركي في المملكة؟",
    answer: "Standard documents required include: Commercial Invoice, Packing List, Bill of Lading or Airway Bill, Certificate of Origin, SABER certificate for regulated products, and SFDA approval for food and pharmaceutical imports. ENVOD KINGDOM's licensed customs brokers in Riyadh, Jeddah, and Dammam guide clients through every document requirement.",
    answerAr: "تشمل المستندات المطلوبة: الفاتورة التجارية، قائمة التعبئة، بوليصة الشحن، شهادة المنشأ، شهادة سابر للمنتجات الخاضعة للتنظيم، وموافقة هيئة الغذاء والدواء. يرشدك وسطاؤنا الجمركيون المرخصون في الرياض وجدة والدمام.",
  },
  {
    category: "Customs Clearance",
    categoryAr: "التخليص الجمركي",
    question: "Can ENVOD KINGDOM handle customs clearance at all Saudi ports?",
    questionAr: "هل يمكن لانفود كينجدم التخليص في جميع موانئ المملكة؟",
    answer: "Yes. ENVOD KINGDOM operates at all major Saudi Arabian ports and border crossings including Jeddah Islamic Port, King Abdulaziz Port (Dammam), King Fahad Industrial Port (Jubail), Riyadh Dry Port, King Khalid International Airport (Riyadh), King Abdulaziz International Airport (Jeddah), and King Fahd International Airport (Dammam), as well as all Saudi land border crossings into the GCC.",
    answerAr: "نعم. يعمل انفود كينجدم في جميع موانئ المملكة ومنافذها الحدودية بما فيها ميناء جدة الإسلامي وميناء الملك عبدالعزيز بالدمام وميناء الملك فهد الصناعي بالجبيل والميناء الجاف بالرياض وجميع المطارات الدولية.",
  },
  {
    category: "Road Transportation",
    categoryAr: "النقل البري",
    question: "Do you provide road transportation across Saudi Arabia?",
    questionAr: "هل تقدمون خدمات النقل البري عبر المملكة العربية السعودية؟",
    answer: "ENVOD KINGDOM operates a fleet of 50+ vehicles providing full road freight coverage across Saudi Arabia — from Riyadh to Jeddah, Dammam, Jubail, Yanbu, Makkah, Madinah, Taif, Tabuk, and all other major cities. Our fleet includes flatbeds, curtain-siders, reefer trucks, low-loaders for heavy cargo, and box trucks for general freight.",
    answerAr: "يمتلك انفود كينجدم أسطولاً يضم أكثر من 50 مركبة يغطي جميع مناطق المملكة من الرياض إلى جدة والدمام والجبيل وينبع ومكة المكرمة والمدينة المنورة وطائف وتبوك. يشمل أسطولنا شاحنات مسطحة ومبردة ورافعات منخفضة للحمولات الثقيلة.",
  },
  {
    category: "Road Transportation",
    categoryAr: "النقل البري",
    question: "Do you offer GCC cross-border trucking?",
    questionAr: "هل تقدمون خدمات الشحن البري العابر لدول الخليج؟",
    answer: "Yes. ENVOD KINGDOM provides cross-border road freight services connecting Saudi Arabia to the UAE (Dubai, Abu Dhabi), Bahrain, Kuwait, Oman, and Qatar through all GCC border crossings. All our GCC shipments are covered by the appropriate customs transit documents (T1) and ATA Carnets where applicable.",
    answerAr: "نعم. يقدم انفود كينجدم خدمات الشحن البري العابر التي تربط المملكة بالإمارات والبحرين والكويت وعُمان وقطر عبر جميع المنافذ الخليجية.",
  },
  {
    category: "Road Transportation",
    categoryAr: "النقل البري",
    question: "Can you transport oversized or heavy cargo?",
    questionAr: "هل تستطيعون نقل الحمولات الكبيرة والثقيلة؟",
    answer: "ENVOD KINGDOM specialises in oversized and heavy cargo transportation across Saudi Arabia. Our project cargo team handles oil and gas equipment, construction machinery, industrial plant components, and wind turbine parts. We manage all route surveys, escort vehicles, permits from the Saudi Ministry of Transport, and police escorts where required.",
    answerAr: "يتخصص انفود كينجدم في نقل الحمولات الضخمة والثقيلة. يتولى فريق بضائع المشاريع لدينا معدات النفط والغاز وآلات البناء ومكونات المصانع الصناعية، مع إدارة جميع التصاريح اللازمة.",
  },
  {
    category: "Sea Freight",
    categoryAr: "الشحن البحري",
    question: "Do you provide Full Container Load (FCL) and Less than Container Load (LCL) shipping?",
    questionAr: "هل تقدمون خدمات شحن الحاوية الكاملة وشحن التجميع؟",
    answer: "ENVOD KINGDOM offers both FCL (Full Container Load) and LCL (Less than Container Load) sea freight services from all major Saudi ports. LCL consolidation is ideal for smaller shipments, allowing businesses in Riyadh, Jeddah, and Dammam to share container space and reduce costs while maintaining reliable transit times to global destinations.",
    answerAr: "يوفر انفود كينجدم خدمات شحن الحاوية الكاملة (FCL) وشحن التجميع (LCL) من جميع موانئ المملكة الرئيسية. شحن التجميع مثالي للشحنات الصغيرة للشركات في الرياض وجدة والدمام.",
  },
  {
    category: "Sea Freight",
    categoryAr: "الشحن البحري",
    question: "Which international ports does ENVOD KINGDOM serve?",
    questionAr: "ما هي الموانئ الدولية التي يخدمها انفود كينجدم؟",
    answer: "We provide sea freight connectivity to 50+ countries from Saudi Arabia. Key destinations include ports in China (Shanghai, Ningbo, Guangzhou), Europe (Rotterdam, Hamburg, Antwerp), USA (Los Angeles, New York), India (Mumbai, Chennai), and all GCC and MENA region ports. Our partnerships with global shipping lines ensure competitive rates and reliable schedules.",
    answerAr: "نوفر اتصالاً بحرياً بأكثر من 50 دولة من المملكة، تشمل الموانئ الرئيسية في الصين وأوروبا والولايات المتحدة والهند وجميع موانئ منطقة الخليج والشرق الأوسط.",
  },
  {
    category: "Air Freight",
    categoryAr: "الشحن الجوي",
    question: "Do you provide urgent or express air freight from Saudi Arabia?",
    questionAr: "هل تقدمون خدمات الشحن الجوي العاجل من المملكة العربية السعودية؟",
    answer: "Yes. ENVOD KINGDOM offers Next Flight Out (NFO) and express air freight services from Riyadh's King Khalid International Airport, Jeddah's King Abdulaziz International Airport, and Dammam's King Fahd International Airport. Urgent shipments can be arranged within hours for time-critical cargo such as spare parts, medical equipment, and exhibition materials.",
    answerAr: "نعم. يقدم انفود كينجدم خدمات الشحن الجوي العاجل من مطارات الرياض وجدة والدمام، ويمكن ترتيب الشحنات العاجلة خلال ساعات للبضائع الحساسة للوقت.",
  },
  {
    category: "Air Freight",
    categoryAr: "الشحن الجوي",
    question: "Can ENVOD KINGDOM ship dangerous goods or hazardous materials by air?",
    questionAr: "هل يمكن شحن البضائع الخطرة والمواد الكيميائية جواً؟",
    answer: "ENVOD KINGDOM is trained and certified in IATA Dangerous Goods Regulations (DGR). We handle Class 1–9 hazardous materials with proper MSDS documentation, packaging to IATA/ICAO standards, and coordination with airline carriers that accept dangerous goods. All shipments comply with Saudi GACOM regulations and international air transport safety standards.",
    answerAr: "انفود كينجدم حاصل على شهادة أنظمة البضائع الخطرة من IATA، ونتعامل مع جميع فئات المواد الخطرة مع الوثائق والتغليف المناسبين وفق المعايير الدولية.",
  },
  {
    category: "Warehousing",
    categoryAr: "التخزين",
    question: "Do you offer bonded or short-term warehousing in Saudi Arabia?",
    questionAr: "هل تقدمون خدمات التخزين الجمركي أو التخزين قصير المدى في المملكة؟",
    answer: "ENVOD KINGDOM provides bonded warehousing, short-term storage, and long-term distribution warehousing across Saudi Arabia in Riyadh, Jeddah, and Dammam. Our bonded facilities allow importers to defer duty payment until goods are released for sale, ideal for exhibition cargo, temporary imports, and just-in-time supply chain operations.",
    answerAr: "يوفر انفود كينجدم خدمات التخزين الجمركي والتخزين قصير وطويل المدى في مستودعاتنا بالرياض وجدة والدمام، بما يشمل تأجيل دفع الرسوم الجمركية حتى إطلاق البضائع.",
  },
  {
    category: "Warehousing",
    categoryAr: "التخزين",
    question: "Do you provide inventory management and distribution services?",
    questionAr: "هل تقدمون خدمات إدارة المخزون والتوزيع؟",
    answer: "Yes. ENVOD KINGDOM offers full 3PL (Third-Party Logistics) services including inventory management, pick-and-pack fulfilment, labelling, and last-mile distribution to retailers and consumers across Saudi Arabia. Our warehouse management system provides real-time visibility into stock levels, movements, and order status.",
    answerAr: "نعم. يوفر انفود كينجدم خدمات اللوجستيات من الطرف الثالث (3PL) بما فيها إدارة المخزون والتعبئة والتوزيع عبر المملكة مع نظام إدارة مستودعات يوفر رؤية فورية للمخزون.",
  },
  {
    category: "Exhibition Logistics",
    categoryAr: "لوجستيات المعارض",
    question: "Can ENVOD KINGDOM transport exhibition equipment and trade show cargo?",
    questionAr: "هل يمكن لانفود كينجدم نقل معدات المعارض والمؤتمرات؟",
    answer: "Exhibition and event logistics is one of ENVOD KINGDOM's core specialisations. We manage end-to-end exhibition logistics including international transport (air and sea), customs clearance, temporary import permits, ATA Carnet processing, venue delivery and setup, on-site handling, and re-export of all cargo after the event — serving major venues in Riyadh (Riyadh Front, JAX), Jeddah, and Dammam.",
    answerAr: "تُعدّ لوجستيات المعارض والفعاليات من أبرز تخصصات انفود كينجدم، إذ نتولى اللوجستيات الكاملة من النقل الدولي إلى التخليص الجمركي والتسليم في المعرض وإعادة التصدير بعد الفعالية.",
  },
  {
    category: "Exhibition Logistics",
    categoryAr: "لوجستيات المعارض",
    question: "Do you handle ATA Carnet shipments for Saudi Arabia?",
    questionAr: "هل تتعاملون مع شحنات كارنيه ATA للمملكة العربية السعودية؟",
    answer: "ENVOD KINGDOM is an ATA Carnet specialist. We process ATA Carnets for temporary importation of exhibition goods, professional equipment, and commercial samples into Saudi Arabia without paying import duties. Our team coordinates with the Saudi Customs Authority and relevant chambers of commerce to ensure fast, compliant processing — typically within 1–3 business days.",
    answerAr: "انفود كينجدم متخصص في كارنيه ATA للاستيراد المؤقت للبضائع والمعدات المهنية والعينات التجارية إلى المملكة دون دفع رسوم جمركية، مع متوسط معالجة 1-3 أيام عمل.",
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
      <button
        onClick={onToggle}
        className={`w-full py-5 flex items-start gap-4 text-left group ${isRtl ? "flex-row-reverse text-right" : ""}`}
        aria-expanded={isOpen}
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
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="answer"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <p className={`pb-5 pl-10 pr-4 text-sm leading-relaxed ${isRtl ? "pr-10 pl-4" : ""}`} style={{ color: "#64748B" }}>
              {a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
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
      "name": f.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": f.answer,
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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto bg-white border border-[#E2E8F0] rounded-2xl px-6 md:px-8 shadow-sm"
        >
          {filtered.map((faq, i) => (
            <AccordionItem
              key={faq.question}
              faq={faq}
              index={i}
              isOpen={openIdx === i}
              onToggle={() => setOpenIdx(openIdx === i ? null : i)}
            />
          ))}
        </motion.div>

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
