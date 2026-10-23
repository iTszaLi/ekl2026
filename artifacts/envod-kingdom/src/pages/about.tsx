import type { ReactNode } from "react";
import {
  ArrowUpRight,
  Boxes,
  CalendarDays,
  Check,
  ClipboardList,
  Compass,
  FileText,
  Handshake,
  MessageCircle,
  PackageCheck,
  Phone,
  Plane,
  Route,
  ShieldCheck,
  Ship,
  Truck,
  Warehouse,
} from "lucide-react";
import { Link } from "wouter";
import { AboutNetworkMap } from "@/components/AboutNetworkMap";
import { useLanguage } from "@/lib/language-context";
import { CONTACT_EMAIL, CONTACT_PHONE_DISPLAY, CONTACT_PHONE_E164, CONTACT_WHATSAPP } from "@/lib/quote-mailto";

type BiText = { en: string; ar: string };

const services: Array<BiText & { slug: string; label: BiText; icon: typeof Ship }> = [
  {
    slug: "exhibition-logistics",
    label: { en: "Exhibition & event logistics", ar: "لوجستيات المعارض والفعاليات" },
    icon: CalendarDays,
    en: "Event freight planning starts with the venue schedule, delivery window, cargo dimensions and collection plan. For eligible temporary movements, documentation and ATA Carnet questions can be reviewed with the responsible parties. Availability and venue arrangements are shipment-specific.",
    ar: "يبدأ تخطيط شحن الفعاليات من جدول الموقع ونافذة التسليم وأبعاد البضائع وخطة الاستلام. ويمكن مراجعة المستندات واستفسارات دفتر ATA للحركات المؤقتة المؤهلة مع الجهات المعنية. ويُحدد التوفر وترتيبات الموقع بحسب كل شحنة.",
  },
  {
    slug: "customs-clearance",
    label: { en: "Customs clearance & documentation", ar: "التخليص الجمركي والمستندات" },
    icon: FileText,
    en: "Invoice, packing details, cargo description and product-specific requirements shape the customs file. ENVOD can coordinate shipment information and customs-clearance enquiries; declarations, formal representation and release remain subject to the appointed qualified representative and relevant authorities.",
    ar: "تُبنى مستندات الجمارك على الفاتورة وبيانات التعبئة ووصف البضاعة والمتطلبات الخاصة بالمنتج. يمكن لإنفود تنسيق معلومات الشحنة واستفسارات التخليص؛ أما الإقرارات والتمثيل الرسمي والفسح فتخضع للممثل المؤهل والجهات المختصة.",
  },
  {
    slug: "ata-carnet",
    label: { en: "ATA Carnet & temporary admission", ar: "دفتر ATA والإدخال المؤقت" },
    icon: ClipboardList,
    en: "Certain professional equipment, commercial samples and exhibition goods may qualify for temporary admission. Eligibility, acceptance, documents and re-export obligations depend on the goods and applicable rules, so each movement needs a case-specific review.",
    ar: "قد تكون بعض المعدات المهنية والعينات التجارية وبضائع المعارض مؤهلة للإدخال المؤقت. وتعتمد الأهلية والقبول والمستندات والتزامات إعادة التصدير على البضائع والأنظمة ذات الصلة، لذلك يلزم تقييم كل حركة على حدة.",
  },
  {
    slug: "air-freight",
    label: { en: "International air freight", ar: "الشحن الجوي الدولي" },
    icon: Plane,
    en: "Air freight may suit urgent, high-value or compact cargo. Routing depends on packed dimensions, gross weight, readiness, carrier capacity, cargo acceptance and destination-side arrangements.",
    ar: "قد يناسب الشحن الجوي البضائع العاجلة أو مرتفعة القيمة أو صغيرة الحجم. ويتوقف المسار على الأبعاد بعد التغليف والوزن الإجمالي والجاهزية وسعة الناقل وقبول البضاعة وترتيبات الوجهة.",
  },
  {
    slug: "ocean-freight",
    label: { en: "Ocean freight", ar: "الشحن البحري" },
    icon: Ship,
    en: "FCL and LCL options can be considered against shipment volume, timing and destination. Container or consolidation planning also depends on cargo readiness, carrier schedules and the responsibilities agreed for each movement.",
    ar: "يمكن دراسة خيارات الحاوية الكاملة FCL والجزئية LCL وفق حجم الشحنة والوقت والوجهة. كما يعتمد تخطيط الحاويات أو التجميع على جاهزية البضائع وجداول الناقلين والمسؤوليات المتفق عليها لكل حركة.",
  },
  {
    slug: "gcc-transportation",
    label: { en: "Road transport & GCC coordination", ar: "النقل البري والتنسيق الخليجي" },
    icon: Truck,
    en: "Domestic and cross-border road enquiries are reviewed against origin, destination, cargo dimensions, border documents, vehicle type and delivery constraints. Route and operator availability must be confirmed for the specific request.",
    ar: "تُراجع استفسارات النقل المحلي والعابر للحدود وفق المنشأ والوجهة وأبعاد البضاعة ومستندات الحدود ونوع المركبة وقيود التسليم. ويجب تأكيد توفر المسار والجهة المشغلة لكل طلب.",
  },
  {
    slug: "project-cargo",
    label: { en: "Project, breakbulk & oversized cargo", ar: "بضائع المشاريع والبضائع السائبة والأحمال الخارجة عن القياس" },
    icon: Boxes,
    en: "Heavy or out-of-gauge freight needs accurate weight and dimensions, loading details, suitable handling equipment and route review. Permits, surveys and qualified-provider scope depend on cargo and destination.",
    ar: "تتطلب بضائع المشاريع الثقيلة أو الخارجة عن القياس بيانات دقيقة للوزن والأبعاد وتفاصيل التحميل ومعدات مناولة مناسبة ومراجعة للمسار. وتعتمد التصاريح والمسح ونطاق مقدم الخدمة المؤهل على البضاعة والوجهة.",
  },
  {
    slug: "packaging-crating",
    label: { en: "Packing, crating & relocation", ar: "التعبئة والصناديق والنقل" },
    icon: PackageCheck,
    en: "Shipment preparation considers handling exposure, packaging strength, cargo marking, dimensions and transport mode. Packing and crating requirements should be assessed against the item and its planned movement.",
    ar: "يراعي تجهيز الشحنة ظروف المناولة ومتانة التغليف ووضع العلامات والأبعاد ووسيلة النقل. وينبغي تقييم احتياجات التعبئة والصناديق وفق طبيعة القطعة والحركة المخطط لها.",
  },
  {
    slug: "warehousing",
    label: { en: "Warehousing & distribution enquiries", ar: "استفسارات التخزين والتوزيع" },
    icon: Warehouse,
    en: "Storage and distribution requests can be discussed as part of a broader movement. Facility location, handling scope, inventory processes and any special conditions must be verified before a proposal is made.",
    ar: "يمكن بحث طلبات التخزين والتوزيع ضمن حركة لوجستية أوسع. ويجب التحقق من موقع المنشأة ونطاق المناولة وإجراءات المخزون وأي شروط خاصة قبل تقديم المقترح.",
  },
  {
    slug: "freight-forwarding",
    label: { en: "Freight forwarding & shipment coordination", ar: "الشحن الدولي وتنسيق الشحنات" },
    icon: Route,
    en: "A movement may involve several stages, modes and providers. ENVOD coordinates the agreed scope and available updates with the customer and relevant parties; shipment-status enquiries are handled through the contact team, not a live tracking portal.",
    ar: "قد تتضمن الحركة عدة مراحل ووسائل نقل ومقدمي خدمات. تنسق إنفود النطاق المتفق عليه والتحديثات المتاحة مع العميل والجهات المعنية؛ وتُعالج استفسارات حالة الشحنة عبر فريق التواصل وليس من خلال بوابة تتبع مباشر.",
  },
];

const industries: Array<BiText & { slug: string; detail: BiText }> = [
  { slug: "automotive-logistics", en: "Automotive", ar: "السيارات", detail: { en: "Vehicle or parts dimensions, packing and shipment documents.", ar: "أبعاد المركبات أو القطع وتغليفها ومستندات الشحنة." } },
  { slug: "construction-logistics", en: "Construction & infrastructure", ar: "البناء والبنية التحتية", detail: { en: "Equipment measurements, access constraints and site delivery sequence.", ar: "قياسات المعدات وقيود الوصول وتسلسل التسليم للموقع." } },
  { slug: "retail-logistics", en: "Retail & consumer goods", ar: "التجزئة والسلع الاستهلاكية", detail: { en: "Cargo descriptions, packaging units and delivery or receiving windows.", ar: "وصف البضائع ووحدات التغليف ونوافذ التسليم أو الاستلام." } },
  { slug: "electronics-logistics", en: "Electronics & technology", ar: "الإلكترونيات والتقنية", detail: { en: "Protective packing, handling needs and product-specific documents.", ar: "التغليف الوقائي واحتياجات المناولة والمستندات الخاصة بالمنتج." } },
  { slug: "government-logistics", en: "Government & public sector", ar: "الحكومة والقطاع العام", detail: { en: "Procurement scope, receiving conditions and shipment documentation.", ar: "نطاق المشتريات وشروط الاستلام ومستندات الشحنة." } },
  { slug: "fashion-logistics", en: "Fashion", ar: "الأزياء", detail: { en: "Collection timing, carton presentation and destination requirements.", ar: "توقيت المجموعات ومظهر الكراتين ومتطلبات الوجهة." } },
  { slug: "aerospace-logistics", en: "Aerospace", ar: "الطيران والفضاء", detail: { en: "Cargo dimensions, handling instructions and precise document descriptions.", ar: "أبعاد البضائع وتعليمات المناولة والوصف الدقيق في المستندات." } },
  { slug: "hospitality-logistics", en: "Hospitality", ar: "الضيافة", detail: { en: "Bulky equipment, protective preparation and staged receiving plans.", ar: "المعدات كبيرة الحجم والتجهيز الوقائي وخطط الاستلام المرحلية." } },
  { slug: "furniture-logistics", en: "Furniture", ar: "الأثاث", detail: { en: "Packed measurements, protection and access at the final destination.", ar: "الأبعاد بعد التغليف والحماية وإمكانية الوصول إلى الوجهة النهائية." } },
  { slug: "chemical-logistics", en: "Chemical", ar: "المواد الكيميائية", detail: { en: "Accurate cargo classification, packaging information and applicable checks.", ar: "التصنيف الدقيق للبضائع وبيانات التغليف والتحققات المنطبقة." } },
  { slug: "telecommunications-logistics", en: "Telecommunications", ar: "الاتصالات", detail: { en: "Equipment dimensions, handling needs and delivery coordination.", ar: "أبعاد المعدات واحتياجات المناولة وتنسيق التسليم." } },
];

const processSteps: Array<BiText & { number: string }> = [
  { number: "01", en: "Understand the shipment", ar: "فهم تفاصيل الشحنة" },
  { number: "02", en: "Review requirements", ar: "مراجعة المتطلبات" },
  { number: "03", en: "Plan the movement", ar: "تخطيط الحركة" },
  { number: "04", en: "Coordinate the agreed scope", ar: "تنسيق النطاق المتفق عليه" },
  { number: "05", en: "Communicate available updates", ar: "مشاركة التحديثات المتاحة" },
  { number: "06", en: "Coordinate delivery or collection", ar: "تنسيق التسليم أو الاستلام" },
];

const faqs: Array<{ q: BiText; a: BiText }> = [
  {
    q: { en: "What is ENVOD KINGDOM SHIPPING SERVICES LLC?", ar: "ما هي شركة ENVOD KINGDOM SHIPPING SERVICES LLC؟" },
    a: { en: "ENVOD KINGDOM SHIPPING SERVICES LLC is a Riyadh-based shipping and logistics coordination business. ENVOD KINGDOM LOGISTICS is another name used on this website for the same business and its services.", ar: "إنفود كينغدوم لخدمات الشحن ذ.م.م هي شركة لتنسيق الشحن والخدمات اللوجستية مقرها الرياض. ويُستخدم اسم ENVOD KINGDOM LOGISTICS في هذا الموقع للدلالة على الشركة نفسها وخدماتها." },
  },
  {
    q: { en: "Where is ENVOD KINGDOM's head office?", ar: "أين يقع المقر الرئيسي لإنفود كينغدوم؟" },
    a: { en: "The listed head office is in Riyadh, Saudi Arabia. The shared locations map shows the Riyadh address and the other locations currently listed by the company.", ar: "المقر الرئيسي المدرج في الرياض، المملكة العربية السعودية. وتعرض خريطة المواقع المشتركة عنوان الرياض والمواقع الأخرى المدرجة حالياً من الشركة." },
  },
  {
    q: { en: "What shipping and logistics services can I enquire about?", ar: "ما خدمات الشحن واللوجستيات التي يمكن الاستفسار عنها؟" },
    a: { en: "Enquiries may include exhibition logistics, customs-clearance coordination, ATA Carnet and temporary-admission questions, air, sea and road freight, project cargo, packing, warehousing and freight forwarding. Availability and scope are confirmed for each shipment.", ar: "قد تشمل الاستفسارات لوجستيات المعارض وتنسيق التخليص الجمركي واستفسارات دفتر ATA والإدخال المؤقت والشحن الجوي والبحري والبري وبضائع المشاريع والتعبئة والتخزين والشحن الدولي. ويُؤكد التوفر والنطاق لكل شحنة." },
  },
  {
    q: { en: "Does ENVOD coordinate customs-clearance enquiries in Saudi Arabia?", ar: "هل تنسق إنفود استفسارات التخليص الجمركي في السعودية؟" },
    a: { en: "ENVOD can coordinate shipment information and customs-clearance enquiries. Required documents and procedures vary by goods and transaction; formal declarations, representation and release are subject to the responsible qualified parties and authorities.", ar: "يمكن لإنفود تنسيق معلومات الشحنة واستفسارات التخليص الجمركي. وتختلف المستندات والإجراءات بحسب البضائع والمعاملة؛ وتخضع الإقرارات والتمثيل الرسمي والفسح للجهات المؤهلة والسلطات المسؤولة." },
  },
  {
    q: { en: "What is exhibition and event logistics?", ar: "ما المقصود بلوجستيات المعارض والفعاليات؟" },
    a: { en: "It is the planning and coordination of cargo movements around event timelines, venue delivery and collection requirements, cargo identification, and—where applicable—temporary admission and return planning.", ar: "هي تخطيط وتنسيق حركة البضائع وفق مواعيد الفعالية ومتطلبات التسليم والاستلام في الموقع وتعريف البضائع، إضافة إلى الإدخال المؤقت وخطة الإعادة عند انطباق ذلك." },
  },
  {
    q: { en: "Can ENVOD assist with ATA Carnet and temporary-admission enquiries?", ar: "هل تساعد إنفود في استفسارات دفتر ATA والإدخال المؤقت؟" },
    a: { en: "Yes, enquiries can be reviewed for eligible goods and the relevant documentation coordinated. Eligibility, acceptance, timing and re-export obligations depend on the circumstances and applicable rules; approval is not guaranteed.", ar: "نعم، يمكن مراجعة الاستفسارات المتعلقة بالبضائع المؤهلة وتنسيق المستندات ذات الصلة. وتعتمد الأهلية والقبول والتوقيت والتزامات إعادة التصدير على الظروف والأنظمة؛ ولا يُضمن الحصول على الموافقة." },
  },
  {
    q: { en: "What information is needed for an international freight quotation?", ar: "ما المعلومات المطلوبة للحصول على عرض سعر للشحن الدولي؟" },
    a: { en: "Share origin and destination, cargo description, number of pieces, packed dimensions, gross weight, ready date, preferred timing and any handling or documentation needs. For an event or site delivery, include venue or site constraints and deadlines.", ar: "أرسل المنشأ والوجهة ووصف البضاعة وعدد القطع والأبعاد بعد التغليف والوزن الإجمالي وموعد الجاهزية والتوقيت المفضل وأي احتياجات للمناولة أو المستندات. وللتسليم إلى فعالية أو موقع، أرفق قيود الموقع والمواعيد النهائية." },
  },
  {
    q: { en: "Does ENVOD support air, sea and road freight?", ar: "هل تدعم إنفود الشحن الجوي والبحري والبري؟" },
    a: { en: "The company accepts enquiries across air, ocean and road freight. Suitable mode, route, carrier or operator availability and service scope depend on the cargo and shipment details.", ar: "تستقبل الشركة استفسارات الشحن الجوي والبحري والبري. وتعتمد الوسيلة والمسار وتوفر الناقل أو المشغل ونطاق الخدمة المناسب على تفاصيل البضاعة والشحنة." },
  },
  {
    q: { en: "What should businesses check before importing goods into Saudi Arabia?", ar: "ما الذي ينبغي للشركات التحقق منه قبل استيراد البضائع إلى السعودية؟" },
    a: { en: "Confirm the accurate cargo description, value, packing details, classification information, importer responsibilities and any product-specific permits or conformity requirements before dispatch. Requirements vary; verify them with the responsible authorities or qualified specialists.", ar: "تحقق قبل الإرسال من وصف البضاعة وقيمتها وبيانات التعبئة ومعلومات التصنيف ومسؤوليات المستورد وأي تصاريح أو متطلبات مطابقة خاصة بالمنتج. تختلف المتطلبات؛ لذا تحقق منها مع السلطات أو المختصين المؤهلين." },
  },
  {
    q: { en: "Which listed company locations appear on ENVOD's map?", ar: "ما المواقع المدرجة على خريطة إنفود؟" },
    a: { en: "Riyadh is the listed head-office location. The shared map also displays Jeddah, Dammam, Dubai, Manama and Udupi as company-listed locations. These listings provide location context, not confirmation of staffing, fixed service coverage or a particular route; confirm scope for your shipment.", ar: "الرياض هي موقع المقر الرئيسي المدرج. وتعرض الخريطة المشتركة أيضاً جدة والدمام ودبي والمنامة وأودوبي ضمن المواقع المدرجة للشركة. وتوضح هذه المواقع السياق المكاني، ولا تؤكد وجود موظفين أو تغطية ثابتة للخدمة أو مساراً معيناً؛ يُرجى تأكيد نطاق شحنتك." },
  },
  {
    q: { en: "How can I ask about project cargo, breakbulk or oversized freight?", ar: "كيف أستفسر عن بضائع المشاريع أو البريك بالك أو الشحنات الضخمة؟" },
    a: { en: "Send the cargo description, exact dimensions and weight, origin, destination, loading details, required dates and any known access constraints. Route, permits, equipment and qualified-provider availability can then be reviewed.", ar: "أرسل وصف البضاعة وأبعادها الدقيقة ووزنها والمنشأ والوجهة وتفاصيل التحميل والتواريخ المطلوبة وأي قيود معروفة على الوصول. بعد ذلك يمكن مراجعة المسار والتصاريح والمعدات وتوفر مقدم الخدمة المؤهل." },
  },
  {
    q: { en: "How can I contact ENVOD for a shipment-specific quotation?", ar: "كيف أتواصل مع إنفود للحصول على عرض خاص بشحنتي؟" },
    a: { en: "Use the contact page to send a quotation enquiry, email info@envodkingdom.net, call +966 58 367 1739, or discuss the shipment on WhatsApp at +966 50 226 0256.", ar: "استخدم صفحة التواصل لإرسال طلب عرض سعر، أو راسل info@envodkingdom.net، أو اتصل على +966 58 367 1739، أو ناقش الشحنة عبر واتساب على +966 50 226 0256." },
  },
  {
    q: { en: "How can a customer request shipment-status information?", ar: "كيف يمكن للعميل طلب معلومات عن حالة الشحنة؟" },
    a: { en: "Contact the team with the shipment reference and relevant details. Status enquiries are handled by the contact team; this page does not claim a live tracking portal.", ar: "تواصل مع الفريق وأرسل مرجع الشحنة والتفاصيل ذات الصلة. يتولى فريق التواصل استفسارات الحالة؛ ولا تدّعي هذه الصفحة وجود بوابة تتبع مباشر." },
  },
];

function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <div className="mb-4 flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.24em] text-secondary">
      <span className="h-px w-8 bg-secondary" aria-hidden="true" />
      {children}
    </div>
  );
}

function SectionTitle({ kicker, title, intro, id }: { kicker: string; title: string; intro: string; id?: string }) {
  return (
    <header className="mb-10 max-w-3xl">
      <Eyebrow>{kicker}</Eyebrow>
      <h2 id={id} className="text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl">{title}</h2>
      <p className="mt-4 text-base leading-7 text-slate-300 sm:text-lg">{intro}</p>
    </header>
  );
}

export default function About() {
  const { t, isRtl } = useLanguage();

  return (
    <main className="min-h-[100dvh] overflow-hidden bg-[#071321] pt-20 text-slate-100" dir={isRtl ? "rtl" : "ltr"} data-testid="about-page">
      <section className="relative isolate border-b border-white/10 bg-[#081727]">
        <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
          <div className="absolute inset-0 bg-[linear-gradient(112deg,rgba(7,19,33,0.98)_0%,rgba(9,30,50,0.94)_52%,rgba(7,19,33,0.82)_100%)]" />
          <div className="absolute inset-y-0 right-0 w-[42%] opacity-50" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.055) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.055) 1px, transparent 1px)", backgroundSize: "48px 48px", maskImage: "linear-gradient(to left, black, transparent)" }} />
          <div className="absolute right-[13%] top-1/2 hidden h-72 w-72 -translate-y-1/2 rounded-full border border-secondary/15 md:block" />
          <div className="absolute right-[17%] top-1/2 hidden h-52 w-52 -translate-y-1/2 rounded-full border border-secondary/20 md:block" />
          <div className="absolute right-[23%] top-1/2 hidden h-3 w-3 -translate-y-1/2 rounded-full bg-secondary md:block" />
        </div>
        <div className="mx-auto grid max-w-7xl gap-12 px-5 pb-20 pt-16 sm:px-8 md:min-h-[560px] md:grid-cols-[1.2fr_.8fr] md:items-center md:py-24">
          <div className="max-w-3xl">
            <Eyebrow>{t("Company profile · Riyadh, Saudi Arabia", "نبذة عن الشركة · الرياض، المملكة العربية السعودية")}</Eyebrow>
            <h1 className="text-4xl font-black leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-[4.4rem]" data-testid="heading-about">
              {t("About ENVOD KINGDOM: Saudi shipping & logistics", "عن إنفود كينغدوم: الشحن والخدمات اللوجستية في السعودية")}
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-300 sm:text-xl">
              {t(
                "ENVOD KINGDOM SHIPPING SERVICES LLC is a Riyadh-based B2B shipping and logistics coordinator. We help businesses assess international and regional freight options, customs-document requirements, exhibition cargo and delivery arrangements—with details and responsible providers confirmed for each movement.",
                "إنفود كينغدوم لخدمات الشحن ذ.م.م هي شركة لتنسيق الشحن والخدمات اللوجستية بين الشركات، مقرها الرياض. نساعد الشركات على تقييم خيارات الشحن الدولي والإقليمي ومتطلبات المستندات الجمركية وبضائع المعارض وترتيبات التسليم، مع تأكيد التفاصيل ومقدمي الخدمات المسؤولين لكل حركة."
              )}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/contact" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-sm bg-secondary px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-secondary/85 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary" data-testid="link-about-quote">
                {t("Request a shipment quote", "اطلب عرضاً لشحنتك")} <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <a href={`https://wa.me/${CONTACT_WHATSAPP.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-sm border border-white/20 bg-white/[0.03] px-5 py-3 text-sm font-bold text-white transition-colors hover:border-white/40 hover:bg-white/[0.07] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary" data-testid="link-about-whatsapp">
                <MessageCircle className="h-4 w-4 text-secondary" aria-hidden="true" /> {t("Discuss on WhatsApp", "ناقش شحنتك عبر واتساب")}
              </a>
              <a href={`tel:${CONTACT_PHONE_E164}`} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-sm px-3 py-3 text-sm font-semibold text-slate-300 transition-colors hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary" data-testid="link-about-call">
                <Phone className="h-4 w-4 text-secondary" aria-hidden="true" /> {t("Call Us", "اتصل بنا")} <span dir="ltr">{CONTACT_PHONE_DISPLAY}</span>
              </a>
            </div>
          </div>
          <aside className="relative mt-2 min-h-[232px] w-full md:mt-0 md:min-h-[680px]" aria-label={t("Shipment planning and field operations", "تخطيط الشحنة والعمليات الميدانية")}>
            <figure className="absolute inset-x-0 top-0 mx-auto h-[232px] w-full max-w-[440px] overflow-hidden rounded-sm border border-white/10 md:inset-x-8 md:top-8 md:h-[200px] md:max-w-none">
              <img
                src="/gallery/relocation/movers-carrying-item-to-home/800.webp"
                srcSet="/gallery/relocation/movers-carrying-item-to-home/480.webp 480w, /gallery/relocation/movers-carrying-item-to-home/800.webp 800w, /gallery/relocation/movers-carrying-item-to-home/1254.webp 1254w"
                sizes="(min-width: 1280px) 440px, (min-width: 768px) 38vw, calc(100vw - 40px)"
                alt={t(
                  "Two movers carry a wrapped household item toward a residence.",
                  "عاملان من فريق النقل يحملان قطعة منزلية مغلفة باتجاه منزل."
                )}
                width={1254}
                height={1254}
                loading="eager"
                decoding="async"
                fetchPriority="high"
                className="h-full w-full object-cover object-[50%_62%]"
              />
            </figure>
            <div className="absolute inset-x-4 bottom-0 top-[248px] hidden border border-white/10 bg-[#0b1c2e]/80 p-6 shadow-2xl shadow-black/20 md:inset-x-8 md:bottom-4 md:top-[244px] md:block">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">{t("Movement brief", "ملخص الحركة")}</span>
                <span className="h-2 w-2 rounded-full bg-secondary" />
              </div>
              <div className="mt-7 flex items-center justify-between gap-3">
                <div>
                  <span className="block text-[10px] uppercase tracking-widest text-slate-500">{t("Origin", "المنشأ")}</span>
                  <strong className="mt-1 block text-xl text-white">{t("Supplier", "المورّد")}</strong>
                </div>
                <div className="flex flex-1 items-center px-2">
                  <span className="h-px flex-1 bg-secondary/60" />
                  <ArrowUpRight className="mx-1 h-4 w-4 text-secondary" aria-hidden="true" />
                </div>
                <div className="text-end">
                  <span className="block text-[10px] uppercase tracking-widest text-slate-500">{t("Destination", "الوجهة")}</span>
                  <strong className="mt-1 block text-xl text-white">{t("Saudi Arabia", "السعودية")}</strong>
                </div>
              </div>
              <div className="mt-10 grid grid-cols-2 gap-3">
                {[
                  { Icon: Route, title: t("Mode & route", "الوسيلة والمسار"), value: t("Cargo-specific", "وفق البضاعة") },
                  { Icon: FileText, title: t("Documents", "المستندات"), value: t("Reviewed early", "مراجعة مسبقة") },
                  { Icon: Handshake, title: t("Providers", "مقدمو الخدمة"), value: t("Scope confirmed", "تأكيد النطاق") },
                  { Icon: Check, title: t("Delivery", "التسليم"), value: t("Details aligned", "مواءمة التفاصيل") },
                ].map(({ Icon, title, value }) => (
                  <div key={title} className="border border-white/10 bg-white/[0.025] p-3">
                    <Icon className="mb-3 h-4 w-4 text-secondary" aria-hidden="true" />
                    <span className="block text-xs font-semibold text-white">{title}</span>
                    <span className="mt-1 block text-[10px] text-slate-500">{value}</span>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-[10px] tracking-wide text-slate-500">{t("Illustrative planning framework · scope varies by shipment", "تصور توضيحي للتخطيط · يختلف النطاق بحسب الشحنة")}</p>
            </div>
          </aside>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 md:py-24" aria-labelledby="company-overview">
        <div className="grid gap-12 md:grid-cols-[.72fr_1.28fr]">
          <div>
            <Eyebrow>{t("Who we are", "من نحن")}</Eyebrow>
            <h2 id="company-overview" className="text-3xl font-extrabold leading-tight text-white sm:text-4xl">{t("A local point of coordination for complex movements.", "جهة تنسيق محلية للحركات اللوجستية متعددة المراحل.")}</h2>
          </div>
          <div className="space-y-5 text-base leading-8 text-slate-300">
            <p>{t(
              "ENVOD KINGDOM SHIPPING SERVICES LLC works with importers, exporters, procurement teams, manufacturers, event organisers and freight-forwarding counterparts. ENVOD KINGDOM and ENVOD KINGDOM LOGISTICS refer to the same business. Our role is to understand the cargo and movement, identify questions that need resolving, and coordinate the agreed scope with the customer and relevant service providers.",
              "تعمل إنفود كينغدوم لخدمات الشحن ذ.م.م مع المستوردين والمصدرين وفرق المشتريات والمصنعين ومنظمي الفعاليات ونظرائنا في الشحن. ويشير اسما ENVOD KINGDOM وENVOD KINGDOM LOGISTICS إلى النشاط التجاري نفسه. يتمثل دورنا في فهم البضاعة والحركة وتحديد المسائل التي تحتاج إلى معالجة وتنسيق النطاق المتفق عليه مع العميل ومقدمي الخدمات المعنيين."
            )}</p>
            <p>{t(
              "Air, sea and road freight are different tools rather than interchangeable promises. Cargo size, weight, readiness, value, delivery deadline, carrier acceptance and destination arrangements all influence the options. Documentation and customs questions also vary by commodity and transaction. We help bring these considerations into the conversation early, while formal decisions remain with the responsible operators and authorities.",
              "الشحن الجوي والبحري والبري وسائل مختلفة وليست وعوداً متبادلة. تؤثر أبعاد البضاعة ووزنها وجاهزيتها وقيمتها وموعد التسليم وقبول الناقل وترتيبات الوجهة في الخيارات المتاحة. كما تختلف أسئلة المستندات والجمارك بحسب السلعة والمعاملة. نساعد على طرح هذه الاعتبارات مبكراً، مع بقاء القرارات الرسمية لدى المشغلين والسلطات المسؤولة."
            )}</p>
            <p>{t(
              "For exhibitions and other temporary cargo movements, planning may include event schedules, venue handling, temporary-admission questions, and the return movement after the event. For project freight, the conversation may begin with measurements, loading points, access restrictions and route feasibility. In each case, a useful plan is built from the actual shipment—not a generic service promise.",
              "في المعارض وغيرها من حركات البضائع المؤقتة، قد يشمل التخطيط مواعيد الفعالية ومناولة الموقع واستفسارات الإدخال المؤقت وحركة الإعادة بعد الفعالية. أما بضائع المشاريع فقد يبدأ بحثها بالأبعاد ونقاط التحميل وقيود الوصول وإمكانية المسار. وفي كل حالة تُبنى الخطة المفيدة على تفاصيل الشحنة الفعلية، لا على وعد عام بالخدمة."
            )}</p>
          </div>
        </div>
        <div className="mt-14 border-y border-white/10 pt-5">
          <h3 className="mb-2 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">
            {t("Company at a glance", "لمحة عن الشركة")}
          </h3>
          <div className="grid sm:grid-cols-3">
          {[
            { label: t("Business identity", "الهوية التجارية"), value: t("ENVOD KINGDOM SHIPPING SERVICES LLC", "ENVOD KINGDOM SHIPPING SERVICES LLC") },
            { label: t("Head office", "المقر الرئيسي"), value: t("Riyadh, Saudi Arabia", "الرياض، المملكة العربية السعودية") },
            { label: t("Operating role", "الدور التشغيلي"), value: t("Shipment coordination", "تنسيق الشحنات") },
          ].map((item, index) => (
            <div key={item.label} className={`py-5 ${index !== 0 ? "sm:border-s border-white/10 sm:px-6" : ""}`}>
              <span className="block text-[10px] font-bold uppercase tracking-[0.19em] text-slate-500">{item.label}</span>
              <span className="mt-2 block text-sm font-semibold leading-6 text-white">{item.value}</span>
            </div>
          ))}
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-[#0a1a2b]">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 sm:px-8 md:grid-cols-[.62fr_1.38fr] md:py-20">
          <div>
            <Eyebrow>{t("Our journey in shipping and logistics", "مسيرتنا في الشحن والخدمات اللوجستية")}</Eyebrow>
            <h2 className="text-3xl font-extrabold leading-tight text-white sm:text-4xl">{t("A working story, told through the movement.", "حكاية عمل تُروى من خلال حركة الشحنة.")}</h2>
          </div>
          <div className="space-y-5 text-base leading-8 text-slate-300">
            <p>{t(
              "ENVOD KINGDOM's story is best understood through the coordination work itself, rather than an unverified timeline. A movement begins with the business need: cargo entering Saudi Arabia, leaving the Kingdom, or moving onward through a regional or international chain. From Riyadh, the company provides a point to bring the shipment facts, documentation questions and delivery hand-offs into one discussion.",
              "تُفهم حكاية إنفود كينغدوم من خلال عمل التنسيق نفسه، لا من خلال تسلسل زمني غير موثق. تبدأ الحركة بحاجة العمل: بضاعة تدخل السعودية أو تغادرها أو تتابع ضمن سلسلة إقليمية أو دولية. ومن الرياض، توفر الشركة نقطة تجمع بيانات الشحنة وأسئلة المستندات ونقاط التسليم في نقاش واحد."
            )}</p>
            <p>{t(
              "That work connects a practical understanding of Saudi shipment requirements with freight-mode planning, event and temporary cargo questions, and the extra dimensions, weight and access checks associated with project or oversized shipments. Each enquiry is different; the responsible provider, availability and exact scope are established for that movement.",
              "يربط هذا العمل بين فهم متطلبات الشحن في السعودية وتخطيط وسيلة النقل واستفسارات بضائع الفعاليات والحركات المؤقتة، إضافة إلى التحقق من الأبعاد والوزن وإمكانية الوصول في شحنات المشاريع والأحمال الضخمة. يختلف كل استفسار عن الآخر؛ ويُحدد مقدم الخدمة المسؤول والتوفر والنطاق الدقيق لكل حركة."
            )}</p>
            <div className="border-s-2 border-secondary ps-5 text-sm leading-7 text-slate-200">
              {t("No invented dates or milestones: the journey is the work of understanding, planning and coordinating each shipment.", "لا تواريخ أو محطات غير موثقة؛ فالمسيرة هي فهم كل شحنة وتخطيطها وتنسيقها.")}
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-[#0a1a2b]">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 md:py-20">
          <SectionTitle
            kicker={t("Draft direction · owner review", "توجه مقترح · لمراجعة المالك")}
            title={t("Purpose, vision, mission and values", "الغرض والرؤية والرسالة والقيم")}
            intro={t(
              "The statements below are proposed page language for owner review. They are not approved corporate policy.",
              "الصياغات أدناه مقترحة للصفحة ولمراجعة المالك، ولا تمثل سياسة مؤسسية معتمدة."
            )}
          />
          <div className="grid gap-4 md:grid-cols-3">
            {[
              {
                label: t("Purpose · draft", "الغرض · مسودة"),
                body: t("Help businesses coordinate cargo into, out of and across Saudi Arabia through practical shipment planning, documentation coordination and relevant service-provider hand-offs.", "مساعدة الشركات على تنسيق حركة البضائع إلى السعودية ومنها وعبرها من خلال التخطيط العملي للشحنة وتنسيق المستندات وتسليم المسؤوليات لمقدمي الخدمات المعنيين."),
              },
              {
                label: t("Vision · draft", "الرؤية · مسودة"),
                body: t("Develop as a considered logistics coordination partner for businesses arranging shipments connected with Saudi Arabia and relevant regional markets.", "التطور كشريك تنسيق لوجستي مهني للشركات التي ترتب شحنات مرتبطة بالسعودية والأسواق الإقليمية ذات الصلة."),
              },
              {
                label: t("Mission · draft", "الرسالة · مسودة"),
                body: t("Understand each shipment, review its requirements, discuss suitable freight options and coordinate confirmed arrangements with clear communication.", "فهم كل شحنة ومراجعة متطلباتها ومناقشة خيارات النقل المناسبة وتنسيق الترتيبات المؤكدة بتواصل واضح."),
              },
            ].map((item) => (
              <article key={item.label} className="border border-white/10 bg-[#0b1c2e] p-6">
                <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-secondary">{item.label}</h3>
                <p className="mt-4 text-sm leading-7 text-slate-200">{item.body}</p>
              </article>
            ))}
          </div>
          <div className="mt-10 border-t border-white/10 pt-8">
            <div className="mb-5 flex flex-wrap items-baseline justify-between gap-3">
              <h3 className="text-xl font-bold text-white">{t("Values · draft for owner review", "القيم · مسودة لمراجعة المالك")}</h3>
              <p className="text-xs text-slate-500">{t("Proposed language, not approved policy", "صياغة مقترحة وليست سياسة معتمدة")}</p>
            </div>
            <p className="mb-5 max-w-3xl text-sm leading-7 text-slate-300">
              {t(
                "Proposed values: professionalism, reliability, integrity, clear communication, customer focus and responsible coordination. The examples below describe how these principles could show up in a shipment enquiry.",
                "القيم المقترحة: المهنية والموثوقية والنزاهة ووضوح التواصل والتركيز على العميل والتنسيق المسؤول. وتوضح الأمثلة أدناه كيف يمكن أن تظهر هذه المبادئ عند الاستفسار عن شحنة."
              )}
            </p>
            <div className="grid gap-x-12 md:grid-cols-2">
              {[
                { icon: ClipboardList, title: t("Careful information", "عناية بالمعلومات"), body: t("Ask for the commercial description, packing details and dimensions early so the proposed mode and handling can be assessed on useful facts.", "طلب الوصف التجاري وبيانات التعبئة والأبعاد مبكراً لتقييم وسيلة النقل والمناولة وفق معلومات مفيدة.") },
                { icon: ShieldCheck, title: t("Integrity & clear responsibilities", "النزاهة ووضوح المسؤوليات"), body: t("Distinguish coordination from carrier operation, customs authority decisions and formal representation. Identify who is responsible for each stage.", "التمييز بين التنسيق وتشغيل الناقل وقرارات السلطات الجمركية والتمثيل الرسمي، وتحديد مسؤول كل مرحلة.") },
                { icon: Compass, title: t("Shipment-specific planning", "تخطيط خاص بالشحنة"), body: t("Consider timing, route, cargo characteristics and delivery constraints together; confirm availability before relying on an option.", "دراسة التوقيت والمسار وخصائص البضاعة وقيود التسليم معاً، وتأكيد التوفر قبل الاعتماد على خيار معين.") },
                { icon: MessageCircle, title: t("Direct communication", "تواصل مباشر"), body: t("Explain what is known, what remains to be checked and which details would help the next decision—without implying an outcome that is not confirmed.", "توضيح المعلومات المتاحة وما يحتاج إلى تحقق والتفاصيل التي تساعد على اتخاذ الخطوة التالية، دون الإيحاء بنتيجة غير مؤكدة.") },
                { icon: CalendarDays, title: t("Respect for deadlines", "احترام المواعيد"), body: t("Use event, receiving and site deadlines as planning inputs, and raise dependencies that may affect the proposed timing rather than presenting a deadline as guaranteed.", "اعتبار مواعيد الفعاليات والاستلام والمواقع مدخلات للتخطيط، وتوضيح العوامل التي قد تؤثر في التوقيت المقترح بدلاً من ضمان موعد غير مؤكد.") },
                { icon: Handshake, title: t("Responsible customer coordination", "تنسيق مسؤول يراعي العميل"), body: t("Keep customer, provider and destination responsibilities visible across hand-offs, and use shipment feedback to inform future coordination.", "إبقاء مسؤوليات العميل ومقدم الخدمة والوجهة واضحة عند نقاط التسليم، والاستفادة من ملاحظات الشحنة لتحسين التنسيق مستقبلاً.") },
              ].map(({ icon: Icon, title, body }) => (
                <article key={title} className="flex gap-4 border-t border-white/10 py-6">
                  <Icon className="mt-1 h-5 w-5 shrink-0 text-secondary" aria-hidden="true" />
                  <div><h4 className="text-base font-bold text-white">{title}</h4><p className="mt-2 text-sm leading-7 text-slate-400">{body}</p></div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-[#091827]" aria-labelledby="credentials-heading">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 md:py-20">
          <SectionTitle
            id="credentials-heading"
            kicker={t("Industry connections", "الروابط القطاعية")}
            title={t("Professional Memberships, Licensing & Industry Connections", "العضويات المهنية والتراخيص والروابط القطاعية")}
            intro={t(
              "Each entry distinguishes management-confirmed information from details displayed in official public records. Linked authority pages provide general references and do not independently confirm every company-specific detail.",
              "يوضح كل بيان ما تؤكده الإدارة وما يظهر في السجلات العامة الرسمية. وتوفر روابط الجهات مراجع عامة، لكنها لا تؤكد بصورة مستقلة جميع التفاصيل الخاصة بالشركة."
            )}
          />
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <article className="flex h-full flex-col border border-white/10 bg-[#0b1c2e] p-6 sm:p-7">
              <div className="mb-5 flex h-10 w-10 items-center justify-center border border-secondary/25 bg-secondary/10 text-secondary">
                <Handshake className="h-5 w-5" aria-hidden="true" />
              </div>
              <h3 className="text-lg font-bold text-white">JCtrans</h3>
              <p className="mt-3 flex-1 text-sm leading-7 text-slate-300">
                {t(
                  "JCtrans’s Riyadh profile lists “ENVOD KINGDOM SHIPPING SERVICES CO” as JC Premium (Member ID 160391; the page displays 9 Mar 2027). Management confirms this is the profile associated with ENVOD KINGDOM’s network participation. The profile does not independently establish a legal-entity match to the LLC.",
                  "يعرض ملف JCtrans في الرياض اسم “ENVOD KINGDOM SHIPPING SERVICES CO” بصفة JC Premium (رقم العضوية 160391؛ ويعرض الملف تاريخ 9 مارس 2027). وتؤكد الإدارة أن هذا هو الملف المرتبط بمشاركة ENVOD KINGDOM في الشبكة. ولا يثبت الملف بصورة مستقلة تطابق الكيان القانوني مع الشركة ذات المسؤولية المحدودة."
                )}
              </p>
              <a
                href="https://www.jctrans.com/en/company/07f1r7u/"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-secondary underline decoration-secondary/40 underline-offset-4 transition-colors hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-secondary"
              >
                {t("View the JCtrans member profile", "عرض ملف العضوية على JCtrans")}
                <ArrowUpRight className="h-4 w-4 shrink-0" aria-hidden="true" />
              </a>
            </article>

            <article className="flex h-full flex-col border border-white/10 bg-[#0b1c2e] p-6 sm:p-7">
              <div className="mb-5 flex h-10 w-10 items-center justify-center border border-secondary/25 bg-secondary/10 text-secondary">
                <ShieldCheck className="h-5 w-5" aria-hidden="true" />
              </div>
              <h3 className="text-lg font-bold text-white">{t("TGA freight-brokerage licence", "ترخيص نشاط الوساطة في نقل البضائع")}</h3>
              <p className="mt-3 flex-1 text-sm leading-7 text-slate-300">
                {t(
                  "Management confirms that ENVOD KINGDOM holds a TGA licence for freight-brokerage activity. The primary licence record has not been reviewed, so its exact holder, activity wording, number and current validity are not stated.",
                  "تؤكد الإدارة أن لدى ENVOD KINGDOM ترخيصاً من الهيئة العامة للنقل (TGA) لممارسة نشاط الوساطة في نقل البضائع. ولم تتم مراجعة سجل الترخيص الأصلي؛ لذلك لا نورد الاسم الدقيق لحامله أو الصياغة الرسمية للنشاط أو رقم الترخيص أو حالة سريانه."
                )}
              </p>
              <a
                href="https://tga.gov.sa/en/media-center/news-details/launch-of-the-licensed-brokers-guide-in-freight-transport"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-secondary underline decoration-secondary/40 underline-offset-4 transition-colors hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-secondary"
              >
                {t("Read TGA’s licensed-brokers guidance", "اقرأ دليل الهيئة للوسطاء المرخصين")}
                <ArrowUpRight className="h-4 w-4 shrink-0" aria-hidden="true" />
              </a>
            </article>

            <article className="flex h-full flex-col border border-white/10 bg-[#0b1c2e] p-6 sm:p-7">
              <div className="mb-5 flex h-10 w-10 items-center justify-center border border-secondary/25 bg-secondary/10 text-secondary">
                <Boxes className="h-5 w-5" aria-hidden="true" />
              </div>
              <h3 className="text-lg font-bold text-white">{t("FIATA — International Federation of Freight Forwarders Associations", "FIATA — الاتحاد الدولي لوكلاء الشحن")}</h3>
              <p className="mt-3 flex-1 text-sm leading-7 text-slate-300">
                {t(
                  "Management confirms an affiliation with FIATA, the International Federation of Freight Forwarders Associations. The exact membership category and a company-specific directory entry have not been independently confirmed; this is not a certification or endorsement.",
                  "تؤكد الإدارة وجود ارتباط مع FIATA، الاتحاد الدولي لوكلاء الشحن. ولم يتم التحقق بصورة مستقلة من فئة العضوية الدقيقة أو من وجود قيد خاص بالشركة في الدليل؛ ولا يُعد ذلك شهادة اعتماد أو تزكية."
                )}
              </p>
              <a
                href="https://fiata.org/members/"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-secondary underline decoration-secondary/40 underline-offset-4 transition-colors hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-secondary"
              >
                {t("View FIATA’s membership overview", "اطلع على نظرة عامة للعضوية لدى FIATA")}
                <ArrowUpRight className="h-4 w-4 shrink-0" aria-hidden="true" />
              </a>
            </article>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 md:py-24">
        <SectionTitle
          kicker={t("Saudi operating context", "السياق التشغيلي السعودي")}
          title={t("Local coordination begins before dispatch.", "يبدأ التنسيق المحلي قبل الإرسال.")}
          intro={t(
            "For cargo moving into, out of or within Saudi Arabia, a plan is stronger when the shipment facts and responsibilities are understood before booking. The specific requirements must be checked for the goods, route and transaction.",
            "تكون خطة البضائع الداخلة إلى المملكة أو الخارجة منها أو المنقولة داخلها أكثر وضوحاً عندما تُفهم بيانات الشحنة والمسؤوليات قبل الحجز. ويجب التحقق من المتطلبات المحددة وفق البضاعة والمسار والمعاملة."
          )}
        />
        <div className="grid gap-px overflow-hidden border border-white/10 bg-white/10 md:grid-cols-2">
          {[
            { n: "01", title: t("Freight & routing", "الشحن والمسار"), desc: t("Compare a suitable mode and gateway against cargo dimensions, readiness, destination and the available carrier or transport scope.", "قارن وسيلة النقل ومنفذ الدخول المناسبين وفق أبعاد البضاعة وجاهزيتها ووجهتها ونطاق الناقل أو النقل المتاح.") },
            { n: "02", title: t("Documents & product requirements", "المستندات ومتطلبات المنتج"), desc: t("Review cargo descriptions, values and packing information, then identify questions about import or export documents and applicable product requirements.", "راجع وصف البضاعة وقيمتها وبيانات التعبئة، ثم حدد أسئلة مستندات الاستيراد أو التصدير ومتطلبات المنتج المنطبقة.") },
            { n: "03", title: t("Customs & temporary movements", "الجمارك والحركات المؤقتة"), desc: t("Clarify who is responsible for declarations and formal clearance. Temporary admission and re-export need separate eligibility and document checks.", "حدد الجهة المسؤولة عن الإقرارات والتخليص الرسمي. ويتطلب الإدخال المؤقت وإعادة التصدير تحققاً مستقلاً من الأهلية والمستندات.") },
            { n: "04", title: t("Delivery & receiving conditions", "شروط التسليم والاستلام"), desc: t("Account for delivery windows, site access, appointments, venue schedules and any handling or collection constraints.", "راعِ نوافذ التسليم ودخول المواقع والمواعيد وجداول الفعاليات وأي قيود على المناولة أو الاستلام.") },
          ].map((item) => (
            <article key={item.n} className="bg-[#0b1c2e] p-6 sm:p-8">
              <span className="font-mono text-xs tracking-widest text-secondary">{item.n} / {t("PLAN", "خطة")}</span>
              <h3 className="mt-5 text-xl font-bold text-white">{item.title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-300">{item.desc}</p>
            </article>
          ))}
        </div>
        <p className="mt-6 max-w-4xl text-sm leading-7 text-slate-300">
          {t(
            "Depending on the goods and transaction, checks may involve ZATCA and Fasah procedures or product-related requirements associated with SABER / SASO, SFDA, GACA or IECEE. These are not universal requirements or approvals by ENVOD. Coordination does not itself mean licensed customs-broker activity: formal declarations and representation must be handled by appropriately authorized parties, and decisions remain with the responsible authorities.",
            "بحسب البضائع والمعاملة، قد تشمل المراجعة إجراءات زاتكا وفسح أو متطلبات مرتبطة بالمنتج لدى سابر / ساسو أو هيئة الغذاء والدواء أو هيئة الطيران المدني أو IECEE. ولا تمثل هذه متطلبات عامة أو موافقات من إنفود. كما أن التنسيق لا يعني بحد ذاته ممارسة نشاط التخليص الجمركي المرخص؛ إذ يجب أن تتولاها جهات مخولة حسب الأصول، وتبقى القرارات للسلطات المختصة."
          )}
        </p>
        <p className="mt-5 max-w-4xl text-xs leading-6 text-slate-500">
          {t("General information only. Applicable customs, conformity and product rules vary by shipment and should be verified with the relevant Saudi authorities or qualified specialists. References to gateways or cities are contextual and do not imply a guaranteed route.", "معلومات عامة فقط. تختلف الأنظمة الجمركية ومتطلبات المطابقة والمنتج بحسب الشحنة، وينبغي التحقق منها لدى السلطات السعودية المعنية أو المختصين المؤهلين. والإشارة إلى المنافذ أو المدن سياقية ولا تعني ضمان مسار معين.")}
        </p>
      </section>

      <section className="border-y border-white/10 bg-[#091827]">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 md:py-24">
          <SectionTitle
            kicker={t("How we coordinate", "كيف ننسق")}
            title={t("A clear sequence. A scope shaped by the cargo.", "خطوات واضحة ونطاق تحدده البضاعة.")}
            intro={t("Not every movement follows the same steps. This is the practical framework used to understand an enquiry and coordinate the scope that can be confirmed.", "لا تتبع جميع الحركات الخطوات نفسها. هذا إطار عملي لفهم الاستفسار وتنسيق النطاق الذي يمكن تأكيده.")}
          />
          <ol className="grid gap-0 md:grid-cols-2 xl:grid-cols-3">
            {processSteps.map((step, index) => (
              <li key={step.number} className={`relative border-t border-white/15 py-6 md:px-5 ${index % 2 === 1 ? "md:border-s" : ""} xl:odd:border-s-0 xl:even:border-s`}>
                <span className="font-mono text-sm text-secondary">{step.number}</span>
                <h3 className="mt-3 text-lg font-bold text-white">{t(step.en, step.ar)}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  {[
                    t("Cargo type, origin, destination, weight, dimensions, timing and handling needs.", "نوع البضاعة والمنشأ والوجهة والوزن والأبعاد والتوقيت واحتياجات المناولة."),
                    t("Identify documentation, customs, product-compliance or temporary-admission questions.", "تحديد أسئلة المستندات والجمارك ومطابقة المنتج أو الإدخال المؤقت."),
                    t("Consider mode, routing, handling and onward delivery against the shipment details.", "دراسة الوسيلة والمسار والمناولة والتوصيل اللاحق وفق تفاصيل الشحنة."),
                    t("Confirm provider responsibilities, availability and the services included in the request.", "تأكيد مسؤوليات مقدمي الخدمة والتوفر والخدمات المشمولة في الطلب."),
                    t("Share updates available from the relevant parties and respond to shipment enquiries.", "مشاركة التحديثات المتاحة من الجهات ذات الصلة والرد على استفسارات الشحنة."),
                    t("Align the delivery, collection, event venue or site-receiving requirements.", "مواءمة متطلبات التسليم أو الاستلام أو موقع الفعالية أو استلام الموقع."),
                  ][index]}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 md:py-24" aria-labelledby="services-heading">
        <SectionTitle
          id="services-heading"
          kicker={t("Areas of coordination", "مجالات التنسيق")}
          title={t("One enquiry, scoped to the real movement.", "استفسار واحد يُحدد نطاقه وفق الحركة الفعلية.")}
          intro={t("Explore the service pages for details. Service scope, responsible operators and availability are confirmed against the cargo, route and timing.", "استكشف صفحات الخدمات للتفاصيل. ويُؤكد نطاق الخدمة والجهات المشغلة المسؤولة والتوفر وفق البضاعة والمسار والتوقيت.")}
        />
        <div className="grid gap-4 md:grid-cols-2">
          {services.map(({ slug, label, icon: Icon, en, ar }, index) => (
            <article key={slug} className="group border border-white/10 bg-[#0a1b2d] p-6 transition-colors hover:border-secondary/40 sm:p-7" data-testid={`service-overview-${slug}`}>
              <div className="flex items-start justify-between gap-5">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center border border-secondary/25 bg-secondary/10 text-secondary">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <span className="font-mono text-xs text-slate-600">{String(index + 1).padStart(2, "0")}</span>
              </div>
              <h3 className="mt-5 text-xl font-bold text-white">{t(label.en, label.ar)}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-300">{t(en, ar)}</p>
              <Link href={`/services/${slug}`} className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-secondary transition-colors hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-secondary" data-testid={`link-service-${slug}`}>
                {t(`Explore ${label.en.toLowerCase()}`, `استكشف ${label.ar}`)} <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              {slug === "project-cargo" && (
                <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 border-t border-white/10 pt-4 text-xs font-semibold">
                  <Link href="/services/breakbulk-shipping" className="text-slate-300 underline decoration-white/20 underline-offset-4 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary" data-testid="link-service-breakbulk-shipping">{t("Breakbulk shipping", "شحن البضائع غير المحواة")}</Link>
                  <Link href="/services/oog-cargo" className="text-slate-300 underline decoration-white/20 underline-offset-4 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary" data-testid="link-service-oog-cargo">{t("Out-of-gauge cargo", "البضائع الخارجة عن القياس")}</Link>
                </div>
              )}
              {slug === "packaging-crating" && (
                <div className="mt-4 border-t border-white/10 pt-4 text-xs font-semibold">
                  <Link href="/services/relocation" className="text-slate-300 underline decoration-white/20 underline-offset-4 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary" data-testid="link-service-relocation">{t("Explore relocation enquiries", "استكشف استفسارات النقل")}</Link>
                </div>
              )}
            </article>
          ))}
        </div>
        <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 border-t border-white/10 pt-6 text-sm">
          <Link href="/services" className="font-semibold text-white underline decoration-secondary underline-offset-4 hover:text-secondary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-secondary" data-testid="link-all-services">{t("View all logistics services", "عرض جميع الخدمات اللوجستية")}</Link>
          <Link href="/track" className="font-semibold text-slate-300 underline decoration-white/20 underline-offset-4 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-secondary" data-testid="link-shipment-status">{t("Ask about shipment status", "استفسر عن حالة الشحنة")}</Link>
        </div>
      </section>

      <section className="border-y border-white/10 bg-[#0a1a2b]">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 md:py-20">
          <div className="grid gap-10 md:grid-cols-[.72fr_1.28fr]">
            <div>
              <Eyebrow>{t("Industries", "القطاعات")}</Eyebrow>
              <h2 className="text-3xl font-extrabold leading-tight text-white sm:text-4xl">{t("Different cargo. Different planning questions.", "بضائع مختلفة وأسئلة تخطيط مختلفة.")}</h2>
              <p className="mt-4 text-base leading-7 text-slate-300">{t("Equipment dimensions, product documentation, protective packaging, delivery sequence and receiving conditions can all change the coordination required.", "قد تؤثر أبعاد المعدات ومستندات المنتج والتغليف الوقائي وتسلسل التسليم وظروف الاستلام في متطلبات التنسيق.")}</p>
            </div>
            <div className="grid grid-cols-1 gap-x-6 sm:grid-cols-2">
              {industries.map((industry) => (
                <Link key={industry.slug} href={`/industries/${industry.slug}`} className="group flex gap-3 border-t border-white/10 py-4 text-sm transition-colors hover:text-secondary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary" data-testid={`link-industry-${industry.slug}`}>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between gap-3 font-semibold text-slate-200 group-hover:text-secondary">
                      {t(industry.en, industry.ar)} <ArrowUpRight className="h-4 w-4 shrink-0 text-secondary" aria-hidden="true" />
                    </span>
                    <span className="mt-1 block text-xs leading-5 text-slate-500">{t(industry.detail.en, industry.detail.ar)}</span>
                  </span>
                </Link>
              ))}
              <Link href="/industries" className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-secondary hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary" data-testid="link-all-industries">
                {t("Browse all industry pages", "استعرض صفحات القطاعات")} <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-[#0a1a2b]">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 md:py-20">
          <SectionTitle
            kicker={t("Before you request a quote", "قبل طلب عرض السعر")}
            title={t("A few details make the first conversation more useful.", "تفاصيل بسيطة تجعل الاستفسار الأول أكثر فائدة.")}
            intro={t("Prepare the shipment facts you have. Missing information can be identified and confirmed during the review.", "جهّز بيانات الشحنة المتاحة لديك. ويمكن تحديد المعلومات الناقصة والتحقق منها أثناء المراجعة.")}
          />
          <div className="grid gap-8 md:grid-cols-[1fr_.8fr]">
            <ul className="grid gap-3 sm:grid-cols-2">
              {[
                t("Origin, destination and requested delivery date", "المنشأ والوجهة وتاريخ التسليم المطلوب"),
                t("Cargo description and number of packages", "وصف البضاعة وعدد الطرود"),
                t("Packed length, width, height and gross weight", "الطول والعرض والارتفاع بعد التغليف والوزن الإجمالي"),
                t("Cargo-ready date and preferred freight mode", "موعد جاهزية البضاعة ووسيلة الشحن المفضلة"),
                t("Available invoice, packing list and product details", "الفاتورة وقائمة التعبئة وتفاصيل المنتج المتاحة"),
                t("Handling, site access, event or receiving constraints", "قيود المناولة أو دخول الموقع أو الفعالية أو الاستلام"),
              ].map((item) => (
                <li key={item} className="flex gap-3 border border-white/10 bg-[#0b1c2e] p-4 text-sm leading-6 text-slate-200">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-secondary" aria-hidden="true" /> {item}
                </li>
              ))}
            </ul>
            <aside className="border-s-2 border-secondary bg-[#0b1c2e] p-6 sm:p-7">
              <h3 className="text-xl font-bold text-white">{t("Why measure and check early?", "لماذا نقيس ونتحقق مبكراً؟")}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-300">{t("Dimensions and weight can affect freight pricing, vehicle or container suitability and handling. Product requirements can affect documents and import steps. Event and site deadlines may require earlier coordination with venues or receiving teams.", "قد تؤثر الأبعاد والوزن في تسعير الشحن وملاءمة المركبة أو الحاوية والمناولة. وقد تؤثر متطلبات المنتج في المستندات وخطوات الاستيراد. كما قد تتطلب مواعيد الفعاليات والمواقع تنسيقاً مسبقاً مع الموقع أو فرق الاستلام.")}</p>
              <p className="mt-4 text-sm leading-7 text-slate-400">{t("For temporary admission, include the goods' purpose, intended period, destination and return plan. Any eligibility or document requirement must be verified for the case.", "للإدخال المؤقت، اذكر الغرض من البضائع والمدة المقصودة والوجهة وخطة الإعادة. ويجب التحقق من الأهلية والمستندات المطلوبة لكل حالة.")}</p>
              <Link href="/contact" className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-secondary hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary" data-testid="link-quote-checklist">
                {t("Send shipment details", "أرسل تفاصيل الشحنة")} <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </aside>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 md:py-24" aria-labelledby="network-heading">
        <div className="mb-10 max-w-3xl">
          <Eyebrow>{t("Locations & coordination", "المواقع والتنسيق")}</Eyebrow>
          <h2 id="network-heading" className="text-3xl font-extrabold leading-tight text-white sm:text-4xl">{t("A Riyadh head office, with listed locations shown on the shared map.", "مقر رئيسي في الرياض ومواقع مدرجة على الخريطة المشتركة.")}</h2>
          <p className="mt-4 text-base leading-7 text-slate-300">{t("Location markers describe the company's listed locations and network context; map connectors are visual guides, not verified freight routes. A location listing does not independently confirm staffing or service availability. Contact the team to confirm the arrangements relevant to a shipment.", "تعرض العلامات المواقع المدرجة للشركة وسياق الشبكة؛ والروابط على الخريطة إرشادية وليست مسارات شحن مؤكدة. ولا يؤكد إدراج الموقع وحده وجود موظفين أو توفر الخدمة. تواصل مع الفريق لتأكيد الترتيبات المناسبة للشحنة.")}</p>
        </div>
        <AboutNetworkMap aboutContext />
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 md:py-24" aria-labelledby="faq-heading">
        <div className="mb-9 max-w-3xl">
          <Eyebrow>{t("Customer questions", "أسئلة العملاء")}</Eyebrow>
          <h2 id="faq-heading" className="text-3xl font-extrabold leading-tight text-white sm:text-4xl">{t("About ENVOD KINGDOM — frequently asked", "أسئلة متكررة عن إنفود كينغدوم")}</h2>
        </div>
        <div className="grid gap-x-12 md:grid-cols-2">
          {faqs.map(({ q, a }, index) => (
            <article key={q.en} className="border-t border-white/15 py-6" data-testid={`faq-about-${index + 1}`}>
              <h3 className="text-base font-bold leading-7 text-white">{t(q.en, q.ar)}</h3>
              <p className="mt-2 text-sm leading-7 text-slate-300">{t(a.en, a.ar)}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-16 sm:px-8 md:pb-24">
        <div className="relative overflow-hidden border border-white/10 bg-[#0b1d30] p-7 sm:p-10 md:flex md:items-center md:justify-between md:gap-10">
          <div className="pointer-events-none absolute inset-y-0 right-0 w-1/3" style={{ backgroundImage: "linear-gradient(100deg, transparent, hsl(var(--secondary) / 0.11))" }} aria-hidden="true" />
          <div className="relative max-w-2xl">
            <Eyebrow>{t("Start with the shipment", "ابدأ بتفاصيل الشحنة")}</Eyebrow>
            <h2 className="text-3xl font-extrabold leading-tight text-white">{t("Tell us what is moving, and where it needs to go.", "أخبرنا بما تريد شحنه وإلى أين ينبغي أن يصل.")}</h2>
            <p className="mt-3 text-sm leading-7 text-slate-300">{t("Share the cargo, route and timing. The team can review the enquiry and confirm the next practical step.", "شاركنا بيانات البضاعة والمسار والتوقيت. يمكن للفريق مراجعة الاستفسار وتأكيد الخطوة العملية التالية.")}</p>
          </div>
          <div className="relative mt-7 flex flex-col gap-3 sm:flex-row md:mt-0 md:shrink-0 md:flex-col">
            <Link href="/contact" className="inline-flex min-h-12 items-center justify-center gap-2 bg-secondary px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-secondary/85 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary" data-testid="link-about-contact-final">
              {t("Request a quotation", "اطلب عرض سعر")} <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <a href={`mailto:${CONTACT_EMAIL}`} className="inline-flex min-h-12 items-center justify-center gap-2 border border-white/20 px-5 py-3 text-sm font-semibold text-slate-200 hover:border-white/40 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary" data-testid="link-about-email">
              {CONTACT_EMAIL}
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
