import { EXHIBITION_PILLAR } from "./pillar-data/exhibition";
import { ATA_CARNET_PILLAR } from "./pillar-data/ata-carnet";
import { RESTORED_RELOCATION_OPTIONS } from "./relocation-options";
import { DOOR_TO_DOOR_META, DOOR_TO_DOOR_SERVICE } from "./door-to-door";
import { SERVICE_REVIEW_FAQ } from "./service-review-faq";

export interface Service {
  id: number;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  icon: string;
  category: string;
  sortOrder: number;
  isActive?: boolean;
}

export interface SubService {
  name: string;
  nameAr: string;
  desc: string;
  descAr: string;
}

export interface BiText {
  en: string;
  ar: string;
}

export interface PillarSectionData {
  id: string;
  heading: BiText;
  paragraphs: BiText[];
  bullets?: BiText[];
  references?: { label: BiText; href: string; hrefAr?: string }[];
}

export interface PillarVenue {
  name: string;
  nameAr: string;
  city: string;
  cityAr: string;
}

export interface PillarEvent {
  name: string;
  sector: string;
  sectorAr: string;
  city: string;
  cityAr: string;
}

export interface PillarRelatedLink {
  label: string;
  labelAr: string;
  href: string;
}

/** Optional long-form, crawler-friendly content that promotes a service page to
 *  an SEO "pillar" page. Rendered as plain semantic HTML by PillarSections. */
export interface ServicePillar {
  seoTitle?: string;
  seoDescription?: string;
  intro: BiText[];
  sections: PillarSectionData[];
  venues: PillarVenue[];
  majorEvents: PillarEvent[];
  relatedLinks: PillarRelatedLink[];
}

export interface ServiceMeta {
  id: number;
  slug: string;
  gradient: string;
  accentHex: string;
  industries: string[];
  industriesAr: string[];
  process: { en: string; ar: string }[];
  subServices: SubService[];
  whyEnvod: { en: string; ar: string }[];
  faq: { q: string; a: string; qAr: string; aAr: string }[];
  /** Optional entity-dense, definition-led overview body rendered as crawlable
   *  static HTML on the service page (used by non-pillar services for SEO/GEO/AEO). */
  overview?: BiText[];
  pillar?: ServicePillar;
}

export const SERVICE_META: Record<number, ServiceMeta> = {
  1: {
    id: 1, slug: "ocean-freight",
    gradient: "linear-gradient(135deg,#0a1f3c 0%,#0d2d4a 50%,#071828 100%)",
    accentHex: "#0ea5e9",
    industries: ["Oil & Gas","Construction","Automotive","Retail & FMCG","Industrial Manufacturing"],
    industriesAr: ["النفط والغاز","البناء والتشييد","السيارات","التجزئة والسلع الاستهلاكية","التصنيع الصناعي"],
    process: [
      { en: "Booking & Planning", ar: "الحجز والتخطيط" },
      { en: "Documentation", ar: "التوثيق" },
      { en: "Port Departure", ar: "مغادرة الميناء" },
      { en: "Sea Transit", ar: "العبور البحري" },
      { en: "Customs Clearance", ar: "التخليص الجمركي" },
      { en: "Port Arrival", ar: "وصول الميناء" },
      { en: "Final Delivery", ar: "التسليم النهائي" },
    ],
    subServices: [
      { name: "Full Container Load (FCL)", nameAr: "حاوية كاملة (FCL)", desc: "Exclusive use of a full container for your shipment.", descAr: "استخدام حاوية كاملة حصرياً لشحنتك." },
      { name: "Less-than-Container Load (LCL)", nameAr: "حاوية جزئية (LCL)", desc: "Share container space — ideal for smaller shipments.", descAr: "مشاركة مساحة الحاوية — مثالي للشحنات الصغيرة." },
      { name: "Break Bulk Shipment", nameAr: "شحن بريك بالك", desc: "Non-containerized cargo for oversized or irregular items.", descAr: "بضائع غير حاوية للعناصر الضخمة أو غير المنتظمة." },
      { name: "RoRo Shipping", nameAr: "الشحن الدحرجي (رورو)", desc: "Roll-on/roll-off service for vehicles and wheeled cargo.", descAr: "خدمة الدحرجة للسيارات والبضائع ذات العجلات." },
      { name: "Project Cargo Shipping", nameAr: "شحن بضائع المشاريع", desc: "Heavy and oversized industrial project cargo via sea.", descAr: "شحن بحري لبضائع المشاريع الصناعية الثقيلة والضخمة." },
      { name: "Heavy Lift Shipping", nameAr: "شحن الرفع الثقيل", desc: "Crane-assisted heavy lift sea freight for industrial loads.", descAr: "شحن بحري برافعة للأحمال الصناعية الثقيلة." },
      { name: "Container Consolidation", nameAr: "تجميع الحاويات", desc: "Groupage services combining multiple smaller shipments.", descAr: "خدمات تجميع تضم شحنات أصغر متعددة معاً." },
      { name: "Reefer Containers", nameAr: "حاويات مبردة", desc: "Temperature-controlled containers for perishables.", descAr: "حاويات بدرجات حرارة مضبوطة للبضائع القابلة للتلف." },
      { name: "Door-to-Port", nameAr: "من الباب إلى الميناء", desc: "Pickup from shipper's door to destination port.", descAr: "استلام من باب المُرسِل وتسليم في الميناء المقصود." },
      { name: "Door-to-Door Sea Freight", nameAr: "من الباب للباب بحراً", desc: "Full sea freight service from origin to final destination.", descAr: "خدمة شحن بحري كاملة من المنشأ إلى الوجهة النهائية." },
      { name: "Dangerous Goods Sea Freight", nameAr: "الشحن البحري للبضائع الخطرة", desc: "Classification, documents, packing and carrier acceptance must be confirmed for each cargo.", descAr: "يجب تأكيد التصنيف والمستندات والتعبئة وقبول الناقل لكل شحنة." },
      { name: "Customs Coordination", nameAr: "تنسيق التخليص الجمركي", desc: "Customs responsibilities and the responsible operator are confirmed for each route.", descAr: "يتم تأكيد مسؤوليات التخليص والجهة المسؤولة لكل مسار." },
      { name: "Port Handling", nameAr: "مناولة الميناء", desc: "Terminal and port-handling arrangements depend on the carrier, gateway and booking scope.", descAr: "تعتمد ترتيبات المحطة ومناولة الميناء على الناقل ومنفذ الدخول ونطاق الحجز." },
      { name: "Import & Export Management", nameAr: "إدارة الاستيراد والتصدير", desc: "Import or export coordination is scoped to the cargo, route and responsible operators.", descAr: "يُحدد تنسيق الاستيراد أو التصدير وفق البضاعة والمسار والجهات المسؤولة." },
    ],
    whyEnvod: [
      { en: "Gateway routing checked against the carrier service and inland destination", ar: "مراجعة منفذ الدخول وفق خدمة الناقل والوجهة الداخلية" },
      { en: "Carrier and agent coordination for international shipping", ar: "تنسيق الناقلين والوكلاء للشحن الدولي" },
      { en: "Customs responsibilities confirmed for each booking", ar: "تأكيد مسؤوليات التخليص لكل حجز" },
      { en: "Manual shipment-status enquiries handled by the contact team", ar: "يتولى فريق التواصل استفسارات حالة الشحنة يدوياً" },
      { en: "FCL and LCL options reviewed against route and cargo requirements", ar: "مراجعة خيارات FCL وLCL وفق المسار ومتطلبات البضاعة" },
    ],
    overview: [
      { en: "Ocean freight moves goods by sea in containers or as breakbulk. Common booking types include Full Container Load (FCL) and Less-than-Container Load (LCL); breakbulk and roll-on/roll-off (RoRo) depend on cargo suitability, route and carrier acceptance. Ask ENVOD KINGDOM SHIPPING SERVICES to review the shipment scope and available options.", ar: "ينقل الشحن البحري البضائع عن طريق البحر في حاويات أو كبضائع سائبة غير حاوية. تشمل أنواع الحجز الشائعة الحاوية الكاملة (FCL) والحاوية الجزئية (LCL)، بينما تعتمد خيارات البريك بالك والدحرجة (RoRo) على ملاءمة البضاعة والمسار وقبول الناقل. أرسل لإنفود كينجدوم للخدمات الملاحية تفاصيل الشحنة لمراجعة النطاق والخيارات المتاحة." },
      { en: "Saudi ocean-freight planning can involve Jeddah Islamic Port or King Abdulaziz Port in Dammam, depending on the carrier service and inland destination. Confirm booking acceptance, customs responsibility and local charges for your shipment. Typical transit times may vary depending on origin, destination, carrier schedules, customs procedures, and seasonal factors.", ar: "قد يشمل تخطيط الشحن البحري السعودي ميناء جدة الإسلامي أو ميناء الملك عبدالعزيز بالدمام، وفق خدمة الناقل والوجهة الداخلية. أكّد قبول الحجز ومسؤولية التخليص والرسوم المحلية لشحنتك. قد تختلف أوقات العبور المعتادة حسب المنشأ والوجهة وجداول الناقلين وإجراءات الجمارك والعوامل الموسمية." },
    ],
    faq: [
      { q: "What is the difference between FCL and LCL?", a: "FCL (Full Container Load) means you rent an entire container exclusively. LCL (Less-than-Container Load) means your cargo shares space with others — ideal when your cargo doesn't fill a full container.", qAr: "ما الفرق بين FCL وLCL؟", aAr: "FCL تعني استئجار حاوية كاملة حصرياً. LCL تعني مشاركة الحاوية مع شحنات أخرى — مثالية عندما لا تملأ شحنتك حاوية كاملة." },
      { q: "How long does ocean freight from China take?", a: "Transit time depends on the origin and destination ports, carrier schedule, routing and customs steps. Share the route, cargo details and ready date to ask about current options; no fixed transit time is promised.", qAr: "كم تستغرق الشحنة البحرية من الصين؟", aAr: "تعتمد مدة العبور على ميناء المنشأ والوجهة وجدول الناقل والمسار والإجراءات الجمركية. أرسل المسار وتفاصيل البضاعة وموعد جاهزيتها للاستفسار عن الخيارات الحالية؛ ولا توجد مدة عبور ثابتة مضمونة." },
      { q: "Can you coordinate customs for a Saudi port shipment?", a: "Gateway and customs scope are confirmed per shipment. Common gateways to discuss include Jeddah Islamic Port, King Abdulaziz Port in Dammam and Riyadh Dry Port. Share the cargo type, route and terminal details; customs decisions and release remain with the responsible authorities.", qAr: "هل يمكنكم تنسيق التخليص لشحنة عبر أحد المنافذ السعودية؟", aAr: "يتم تأكيد منفذ الدخول ونطاق التخليص لكل شحنة. من المنافذ التي يمكن مناقشتها ميناء جدة الإسلامي وميناء الملك عبدالعزيز بالدمام والميناء الجاف بالرياض. أرسل نوع البضاعة والمسار وتفاصيل المحطة؛ وتبقى قرارات الجمارك والفسح من اختصاص الجهات المعنية." },
      { q: "How do I arrange container shipping to Saudi Arabia?", a: "Share the origin, Saudi destination, cargo-ready date, package count, dimensions and gross weight. For FCL, include the required container size and loading details; for LCL, provide the packed dimensions and weight of each piece. Carrier, route, port, customs responsibilities, charges and final-delivery scope must be confirmed for the shipment before booking.", qAr: "كيف أرتب شحن حاوية إلى السعودية؟", aAr: "أرسل المنشأ والوجهة في السعودية وتاريخ جاهزية الشحنة وعدد الطرود وأبعادها ووزنها الإجمالي. لشحن FCL، أضف مقاس الحاوية المطلوب وتفاصيل التحميل؛ ولشحن LCL، أرسل الأبعاد والوزن بعد التغليف لكل قطعة. يجب تأكيد الناقل والمسار والميناء ومسؤوليات الجمارك والرسوم ونطاق التسليم النهائي للشحنة قبل الحجز." },
    ],
  },
  2: {
    id: 2, slug: "air-freight",
    gradient: "linear-gradient(135deg,#0c1a3a 0%,#1a0a3a 50%,#070a28 100%)",
    accentHex: "#8b5cf6",
    industries: ["Pharmaceuticals","Electronics","E-commerce","Perishables","Fashion & Luxury"],
    industriesAr: ["الأدوية","الإلكترونيات","التجارة الإلكترونية","البضائع سريعة التلف","الأزياء والفاخرة"],
    process: [
      { en: "Booking", ar: "الحجز" },
      { en: "Pickup", ar: "الاستلام" },
      { en: "Export Docs", ar: "وثائق التصدير" },
      { en: "Airport Departure", ar: "المغادرة" },
      { en: "Air Transit", ar: "العبور الجوي" },
      { en: "Airport Arrival", ar: "الوصول" },
      { en: "Customs & Delivery", ar: "تخليص وتسليم" },
    ],
    subServices: [
      { name: "Express Air Freight", nameAr: "الشحن الجوي السريع", desc: "Urgent cargo routing, subject to carrier capacity and acceptance.", descAr: "تخطيط مسار الشحن العاجل حسب سعة الناقل وقبوله." },
      { name: "Standard Air Freight", nameAr: "الشحن الجوي القياسي", desc: "Review flight options, consolidation and routing for your cargo.", descAr: "مراجعة خيارات الرحلات والتجميع والمسار لشحنتك." },
      { name: "Airport-to-Airport", nameAr: "من مطار لمطار", desc: "Standard cargo handled terminal-to-terminal.", descAr: "الشحن القياسي من صالة إلى صالة." },
      { name: "Door-to-Door Air", nameAr: "من الباب للباب جواً", desc: "Complete pickup, customs, and delivery service.", descAr: "خدمة استلام وتخليص وتسليم كاملة." },
      { name: "Airport Customs Clearance", nameAr: "تخليص جمركي مطاري", desc: "Fast customs handling at all Saudi international airports.", descAr: "تخليص جمركي سريع في جميع مطارات المملكة الدولية." },
      { name: "Charter Aircraft", nameAr: "طائرة مستأجرة", desc: "Dedicated aircraft for urgent or oversized air cargo.", descAr: "طائرة مخصصة للشحن الجوي العاجل أو الضخم." },
      { name: "Dangerous Goods Air Freight", nameAr: "شحن جوي للبضائع الخطرة", desc: "Cargo classification, packaging and carrier acceptance must be reviewed before booking.", descAr: "يجب مراجعة تصنيف البضاعة والتعبئة وقبول الناقل قبل الحجز." },
      { name: "Pharmaceutical Air Freight", nameAr: "الشحن الجوي الدوائي", desc: "Product handling, temperature requirements and permitted arrangements require confirmation.", descAr: "يجب تأكيد مناولة المنتج ومتطلبات الحرارة والترتيبات المسموح بها." },
      { name: "Temperature-Controlled Cargo", nameAr: "شحن جوي بدرجات حرارة مضبوطة", desc: "Cold chain air freight for pharma, food, and biologics.", descAr: "شحن جوي بسلسلة باردة للأدوية والغذاء والمستحضرات البيولوجية." },
      { name: "Priority Cargo", nameAr: "شحن أولوية", desc: "Highest-priority handling for critical time-sensitive cargo.", descAr: "معالجة أولوية قصوى للشحن الحساس للوقت." },
      { name: "Consolidated Air Freight", nameAr: "الشحن الجوي المجمع", desc: "Cost-effective groupage airfreight solutions.", descAr: "حلول شحن جوي مجمع فعالة من حيث التكلفة." },
      { name: "Priority & On-Board Courier", nameAr: "بريد سريع على متن الطائرة", desc: "Hand-carried courier for critical documents and small cargo.", descAr: "بريد محمول باليد للمستندات الحرجة والشحن الصغير." },
    ],
    whyEnvod: [
      { en: "Review of routing and carrier availability", ar: "مراجعة المسار وتوفر الناقل" },
      { en: "Cargo-ready date and collection planning", ar: "تحديد جاهزية البضاعة وتخطيط الاستلام" },
      { en: "Shipment-specific handling requirements review", ar: "مراجعة متطلبات المناولة لكل شحنة" },
      { en: "Manual shipment-status enquiries", ar: "استفسارات يدوية عن حالة الشحنة" },
      { en: "Carrier acceptance and documentation checks", ar: "التحقق من قبول الناقل والمستندات" },
    ],
    overview: [
      { en: "Air freight moves goods by aircraft and can suit urgent or high-value consignments. ENVOD reviews your origin, destination, packed dimensions, gross weight and cargo-ready date to discuss feasible routing and coordination. Express, consolidation or charter options depend on carrier availability and the cargo's acceptance requirements.", ar: "ينقل الشحن الجوي البضائع بالطائرات وقد يناسب الشحنات العاجلة أو مرتفعة القيمة. تراجع إنفود المنشأ والوجهة والأبعاد بعد التغليف والوزن الإجمالي وموعد جاهزية البضاعة لمناقشة المسار والتنسيق الممكنين. تعتمد خيارات الشحن السريع أو التجميع أو الاستئجار على توفر الناقل ومتطلبات قبول البضاعة." },
      { en: "Airport-to-airport and door-to-door enquiries need different collection, clearance and delivery arrangements. Pharmaceutical, temperature-sensitive and dangerous goods require product-specific review; no company certification or universal acceptance is implied. Typical transit times may vary depending on origin, destination, carrier schedules, customs procedures, and seasonal factors.", ar: "تختلف ترتيبات الاستلام والتخليص والتسليم بين الشحن من مطار لمطار والشحن من الباب للباب. تتطلب الأدوية والبضائع الحساسة للحرارة والخطرة مراجعة خاصة بالمنتج؛ ولا يعني ذلك وجود شهادة للشركة أو قبول جميع البضائع. قد تختلف أوقات العبور المعتادة حسب المنشأ والوجهة وجداول الناقلين وإجراءات الجمارك والعوامل الموسمية." },
    ],
    faq: [
      { q: "How fast is express air freight to Saudi Arabia?", a: "A shipment-specific estimate requires the origin, destination, cargo-ready date, flight availability and customs requirements. A fixed transit time is not promised for every route.", qAr: "ما مدى سرعة الشحن الجوي السريع إلى السعودية؟", aAr: "يتطلب تقدير المدة معرفة المنشأ والوجهة وتاريخ جاهزية البضاعة وتوفر الرحلات والمتطلبات الجمركية. لا توجد مدة عبور ثابتة مضمونة لجميع المسارات." },
      { q: "Can you ship pharmaceuticals by air?", a: "Submit the product details, required temperature range, packaging, monitoring and regulatory documents for review. Acceptance and a suitable permitted handling arrangement must be confirmed before booking.", qAr: "هل يمكنكم شحن الأدوية جواً؟", aAr: "أرسل تفاصيل المنتج ونطاق الحرارة المطلوب والتعبئة والمراقبة والمستندات التنظيمية للمراجعة. يجب تأكيد القبول وترتيبات المناولة المناسبة والمسموح بها قبل الحجز." },
      { q: "What is the difference between express and standard air freight?", a: "Express air freight prioritizes speed with the earliest available flights and expedited handling, while standard air freight consolidates cargo at a lower cost over a few business days. We'll recommend the option that fits your deadline and budget.", qAr: "ما الفرق بين الشحن الجوي السريع والقياسي؟", aAr: "يعطي الشحن الجوي السريع الأولوية للسرعة بأقرب الرحلات المتاحة ومناولة معجّلة، بينما يجمّع الشحن القياسي البضائع بتكلفة أقل خلال بضعة أيام عمل. نوصي بالخيار الأنسب لموعدك وميزانيتك." },
    ],
  },
  3: {
    id: 3, slug: "gcc-transportation",
    gradient: "linear-gradient(135deg,#1a1208 0%,#2a1c08 50%,#100c04 100%)",
    accentHex: "#f59e0b",
    industries: ["Construction","Retail","Manufacturing","Agriculture","Government"],
    industriesAr: ["البناء","التجزئة","التصنيع","الزراعة","القطاع الحكومي"],
    process: [
      { en: "Route Planning", ar: "تخطيط المسار" },
      { en: "Loading", ar: "التحميل" },
      { en: "Border Crossing", ar: "عبور الحدود" },
      { en: "Customs Clearance", ar: "التخليص" },
      { en: "Transit", ar: "العبور" },
      { en: "Final Delivery", ar: "التسليم" },
    ],
    subServices: [
      { name: "Flatbed Trailers", nameAr: "مقطورات مسطحة", desc: "Open flatbed transport for machinery, steel, and oversized loads.", descAr: "نقل على مقطورة مسطحة مفتوحة للآلات والحديد والأحمال الضخمة." },
      { name: "Curtain Side Trailers", nameAr: "مقطورات ستائر جانبية", desc: "Flexible side-loading trailers for palletized goods.", descAr: "مقطورات تحميل جانبي مرنة للبضائع المُرصوصة." },
      { name: "Refrigerated (Reefer) Trucks", nameAr: "شاحنات مبردة (ريفر)", desc: "Temperature-controlled refrigerated trucks for food and pharma.", descAr: "شاحنات مبردة بدرجات حرارة مضبوطة للغذاء والدواء." },
      { name: "Dry Van Trucks", nameAr: "شاحنات مغلقة جافة", desc: "Enclosed dry van transport for general cargo protection.", descAr: "نقل في صندوق مغلق جاف لحماية البضائع العامة." },
      { name: "Low Bed Trailers", nameAr: "مقطورات منخفضة", desc: "Low-profile trailers for heavy equipment and tall machinery.", descAr: "مقطورات منخفضة للمعدات الثقيلة والآلات الطويلة." },
      { name: "Extendable Trailers", nameAr: "مقطورات قابلة للتمديد", desc: "Telescopic extendable trailers for extra-long cargo.", descAr: "مقطورات تلسكوبية قابلة للتمديد للبضائع الطويلة جداً." },
      { name: "Skeletal Trailers", nameAr: "مقطورات هيكلية", desc: "Container-ready skeletal trailers for 20ft and 40ft containers.", descAr: "مقطورات هيكلية جاهزة للحاويات 20 و40 قدماً." },
      { name: "Container Transport (20ft / 40ft)", nameAr: "نقل حاويات (20 / 40 قدم)", desc: "Door-to-door container transport across Saudi Arabia and GCC.", descAr: "نقل حاويات من الباب للباب عبر المملكة والخليج." },
      { name: "Side Loader Trucks", nameAr: "شاحنات تحميل جانبي", desc: "Self-loading side lift trucks for container handling.", descAr: "شاحنات رفع ذاتية جانبية لمناولة الحاويات." },
      { name: "Hydraulic Trailer Transport", nameAr: "نقل بمقطورات هيدروليكية", desc: "Multi-axle hydraulic trailers for the heaviest loads.", descAr: "مقطورات هيدروليكية متعددة المحاور للأحمال الأثقل." },
      { name: "Heavy Equipment Transport", nameAr: "نقل المعدات الثقيلة", desc: "Specialist transport for construction and industrial equipment.", descAr: "نقل متخصص للمعدات الإنشائية والصناعية." },
      { name: "Oversized Cargo Transport", nameAr: "نقل البضائع الضخمة", desc: "Permit-managed oversized load transportation.", descAr: "نقل الأحمال الضخمة بإدارة التصاريح اللازمة." },
      { name: "Heavy Lift Transportation", nameAr: "نقل الرفع الثقيل", desc: "Crane and SPMT-assisted heavy lift transport solutions.", descAr: "حلول نقل رفع ثقيل بالرافعات ومركبات SPMT." },
      { name: "Cross-Border GCC Transportation", nameAr: "نقل عابر للحدود الخليجية", desc: "Route, transporter and border-document scope are confirmed for each enquiry.", descAr: "يتم تأكيد المسار والناقل ونطاق مستندات الحدود لكل استفسار." },
      { name: "Local Saudi Transportation", nameAr: "نقل محلي سعودي", desc: "City-to-city and within-city freight across Saudi Arabia.", descAr: "شحن بين المدن وداخلها في جميع أنحاء المملكة." },
      { name: "Dayana Trucks", nameAr: "شاحنات ديانا", desc: "Large-capacity Dayana trucks for bulk regional distribution.", descAr: "شاحنات ديانا كبيرة السعة للتوزيع الإقليمي بالجملة." },
      { name: "Pickup Trucks", nameAr: "شاحنات بيك أب", desc: "Light pickup trucks for small loads and urgent deliveries.", descAr: "شاحنات بيك أب خفيفة للأحمال الصغيرة والتوصيل العاجل." },
      { name: "Dedicated Express Delivery", nameAr: "توصيل سريع مخصص", desc: "Dedicated express transport for time-sensitive shipments, subject to route and vehicle availability.", descAr: "نقل سريع مخصص للشحنات الحساسة للوقت، بحسب توفر المسار والمركبة." },
      { name: "Last-Mile Delivery", nameAr: "توصيل المرحلة الأخيرة", desc: "Final doorstep delivery within Saudi Arabia.", descAr: "التوصيل النهائي للباب داخل المملكة." },
      { name: "Door-to-Door Transportation", nameAr: "نقل من الباب للباب", desc: "Complete pickup and delivery from origin to destination.", descAr: "استلام وتسليم كامل من المنشأ إلى الوجهة." },
    ],
    whyEnvod: [
      { en: "Route, border and operator scope checked for each enquiry", ar: "مراجعة المسار والمنفذ والجهة المشغّلة لكل استفسار" },
      { en: "Border-document requirements reviewed against the proposed route", ar: "مراجعة مستندات الحدود وفق المسار المقترح" },
      { en: "Vehicle type and availability confirmed before booking", ar: "تأكيد نوع المركبة وتوفرها قبل الحجز" },
      { en: "Temperature-sensitive cargo reviewed against provider capability", ar: "مراجعة البضائع الحساسة للحرارة وفق إمكانات مقدم الخدمة" },
    ],
    overview: [
      { en: "GCC road freight connects Saudi Arabia with the other Gulf Cooperation Council states: the UAE, Qatar, Kuwait, Bahrain and Oman. Requests may involve full or part loads and different vehicle types. ENVOD can review the proposed origin, destination, cargo, dates and border-document requirements; route availability, carrier/operator, vehicle and customs scope must be confirmed for each shipment.", ar: "يربط النقل البري الخليجي المملكة العربية السعودية ببقية دول مجلس التعاون: الإمارات وقطر والكويت والبحرين وعُمان. وقد تشمل الطلبات حمولة كاملة أو جزئية وأنواعاً مختلفة من المركبات. يمكن لإنفود مراجعة المنشأ والوجهة والبضاعة والتواريخ ومتطلبات مستندات الحدود المقترحة؛ ويجب تأكيد توفر المسار والناقل أو المشغّل والمركبة ونطاق التخليص لكل شحنة." },
      { en: "Delivery timing depends on the route, carrier schedule, border procedures, documentation and any inspections. Ask for a shipment-specific review rather than relying on a general transit estimate.", ar: "يعتمد موعد التسليم على المسار وجدول الناقل وإجراءات الحدود والمستندات وأي فحوصات. اطلب مراجعة خاصة بالشحنة بدلاً من الاعتماد على تقدير عام لمدة النقل." },
    ],
    faq: [
      { q: "What is GCC transportation?", a: "GCC transportation usually means moving goods by road between Saudi Arabia and another Gulf Cooperation Council country. Route, carrier, vehicle, border documents, customs responsibilities and delivery scope depend on the shipment and must be confirmed before booking.", qAr: "ما المقصود بالنقل الخليجي؟", aAr: "يشير النقل الخليجي عادةً إلى نقل البضائع براً بين السعودية ودولة أخرى من دول مجلس التعاون الخليجي. ويعتمد المسار والناقل والمركبة ومستندات الحدود ومسؤوليات الجمارك ونطاق التسليم على الشحنة ويجب تأكيدها قبل الحجز." },
      { q: "Which GCC routes can you arrange?", a: "Tell us the origin, destination, cargo and requested dates. Route and operator availability, border documents, customs responsibilities and service scope are checked for each request; coverage at every crossing is not assumed.", qAr: "ما المسارات الخليجية التي يمكن ترتيبها؟", aAr: "أرسل المنشأ والوجهة ونوع البضاعة والتواريخ المطلوبة. تتم مراجعة توفر المسار والجهة المشغّلة ومستندات الحدود ومسؤوليات التخليص ونطاق الخدمة لكل طلب؛ ولا يُفترض توفر الخدمة عند كل منفذ." },
      { q: "Can you help review cross-border customs documents?", a: "We can discuss the documents and responsibilities relevant to the proposed route. Requirements vary by goods and jurisdiction, and declarations, permits or release decisions remain with the responsible operators and authorities.", qAr: "هل يمكنكم مراجعة مستندات الجمارك للشحنات العابرة للحدود؟", aAr: "يمكننا مناقشة المستندات والمسؤوليات المرتبطة بالمسار المقترح. تختلف المتطلبات حسب البضاعة والاختصاص، وتبقى الإقرارات والتصاريح وقرارات الفسح لدى الجهات المشغّلة والسلطات المختصة." },
      { q: "How long does delivery across the GCC take?", a: "Transit time depends on the origin and destination, carrier schedule, border procedures, documents and inspections. Share the route and ready date to request a current estimate; no general delivery window is promised.", qAr: "كم يستغرق التوصيل عبر دول الخليج؟", aAr: "تعتمد مدة النقل على المنشأ والوجهة وجدول الناقل وإجراءات الحدود والمستندات والفحوصات. أرسل المسار وموعد الجاهزية لطلب تقدير حالي؛ ولا توجد مدة توصيل عامة مضمونة." },
    ],
  },
  4: {
    id: 4, slug: "customs-clearance",
    gradient: "linear-gradient(135deg,#052a1a 0%,#0a3d28 50%,#031510 100%)",
    accentHex: "#10b981",
    industries: ["All Industries","Pharmaceuticals","Food & Beverage","Electronics","Industrial"],
    industriesAr: ["جميع القطاعات","الأدوية","الغذاء والمشروبات","الإلكترونيات","الصناعية"],
    process: [
      { en: "Document Review", ar: "مراجعة المستندات" },
      { en: "HS Code Classification", ar: "تصنيف HS" },
      { en: "Duty Assessment", ar: "تقييم الرسوم" },
      { en: "Declaration Filing", ar: "تقديم الإقرار" },
      { en: "Customs Inspection", ar: "الفحص الجمركي" },
      { en: "Duty Payment", ar: "سداد الرسوم" },
      { en: "Release & Delivery", ar: "الإفراج والتسليم" },
    ],
    subServices: [
      { name: "Import Customs Clearance", nameAr: "تنسيق تخليص الاستيراد", desc: "Import declarations and document coordination; the responsible operator and gateway scope are confirmed per shipment.", descAr: "تنسيق إقرارات الاستيراد والمستندات؛ ويتم تأكيد الجهة المسؤولة ومنفذ الدخول لكل شحنة." },
      { name: "Export Customs Clearance", nameAr: "تنسيق تخليص التصدير", desc: "Export-document and operator coordination, subject to the cargo and route requirements.", descAr: "تنسيق مستندات التصدير والجهة المشغّلة وفق متطلبات البضاعة والمسار." },
      { name: "Air Customs Clearance", nameAr: "تنسيق التخليص الجمركي الجوي", desc: "Airport and customs scope are confirmed for the requested route and cargo.", descAr: "يتم تأكيد نطاق المطار والتخليص وفق المسار والبضاعة المطلوبة." },
      { name: "Sea Customs Clearance", nameAr: "تنسيق التخليص الجمركي البحري", desc: "Discuss gateway and operator options for Jeddah, Dammam or another requested port; availability is confirmed per shipment.", descAr: "ناقش خيارات منفذ الدخول والجهة المشغّلة في جدة أو الدمام أو ميناء آخر؛ ويتم تأكيد الإتاحة لكل شحنة." },
      { name: "Land Border Customs", nameAr: "تنسيق جمارك الحدود البرية", desc: "Border-document and customs-responsibility review for a proposed GCC road route.", descAr: "مراجعة مستندات الحدود ومسؤولية التخليص لمسار بري خليجي مقترح." },
      { name: "Temporary Import", nameAr: "تنسيق الاستيراد المؤقت", desc: "Check temporary-admission options, eligibility and authority requirements for the cargo.", descAr: "مراجعة خيارات الإدخال المؤقت وأهلية البضاعة ومتطلبات الجهات المختصة." },
      { name: "Temporary Export", nameAr: "تنسيق التصدير المؤقت", desc: "Review documents and return requirements for goods exported temporarily.", descAr: "مراجعة المستندات ومتطلبات العودة للبضائع المصدّرة مؤقتاً." },
      { name: "ATA Carnet Processing", nameAr: "معالجة كارنيه ATA", desc: "Temporary-import documentation coordination, subject to eligibility and authority acceptance.", descAr: "تنسيق مستندات الاستيراد المؤقت حسب الأهلية وقبول الجهات المختصة." },
      { name: "SFDA Requirements Coordination", nameAr: "تنسيق متطلبات هيئة الغذاء والدواء", desc: "Review product-specific food, pharmaceutical or medical-device requirements with the responsible authority and operator.", descAr: "مراجعة متطلبات الغذاء أو الدواء أو الأجهزة الطبية الخاصة بالمنتج مع الجهة المختصة والمشغّل المسؤول." },
      { name: "SABER Requirements Coordination", nameAr: "تنسيق متطلبات سابر", desc: "Discuss applicable conformity steps; product certificates and approvals are subject to the relevant conformity process and authority.", descAr: "مناقشة خطوات المطابقة المنطبقة؛ وتخضع شهادات المنتجات وموافقاتها لإجراءات المطابقة والجهة المختصة." },
      { name: "SASO Requirements Coordination", nameAr: "تنسيق متطلبات المواصفات", desc: "Identify product-standard documentation that may apply; conformity decisions remain with the relevant bodies.", descAr: "تحديد مستندات مواصفات المنتج التي قد تنطبق؛ وتبقى قرارات المطابقة لدى الجهات المختصة." },
      { name: "Dangerous Goods Requirements Review", nameAr: "مراجعة متطلبات البضائع الخطرة", desc: "Classification, documents, packaging and carrier acceptance must be confirmed before a booking.", descAr: "يجب تأكيد التصنيف والمستندات والتعبئة وقبول الناقل قبل الحجز." },
      { name: "Exhibition Customs", nameAr: "جمارك المعارض", desc: "Dedicated customs coordination for exhibition cargo.", descAr: "تنسيق جمركي مخصص لشحن المعارض." },
      { name: "Food Import Requirements", nameAr: "متطلبات استيراد الغذاء", desc: "Review cargo documents and applicable food-import requirements; the competent authority determines approval.", descAr: "مراجعة مستندات الشحنة ومتطلبات استيراد الغذاء المنطبقة؛ وتحدد الجهة المختصة الموافقة." },
      { name: "Medical Device Import Requirements", nameAr: "متطلبات استيراد الأجهزة الطبية", desc: "Check product-specific registration and import documentation with the responsible authority.", descAr: "التحقق من تسجيل المنتج ومستندات الاستيراد الخاصة به مع الجهة المسؤولة." },
      { name: "Electronics Import Requirements", nameAr: "متطلبات استيراد الإلكترونيات", desc: "Review applicable telecom, safety and conformity documentation for the product and route.", descAr: "مراجعة مستندات الاتصالات والسلامة والمطابقة المنطبقة على المنتج والمسار." },
      { name: "Personal Effects Clearance", nameAr: "تخليص المقتنيات الشخصية", desc: "Customs clearance for household goods and personal belongings.", descAr: "تخليص جمركي للأغراض المنزلية والمقتنيات الشخصية." },
    ],
    whyEnvod: [
      { en: "Import and export documentation coordination", ar: "تنسيق مستندات الاستيراد والتصدير" },
      { en: "Shipment-specific clearance planning", ar: "تخطيط التخليص حسب متطلبات الشحنة" },
      { en: "Review of applicable product approval requirements", ar: "مراجعة متطلبات الموافقات الخاصة بالمنتج" },
      { en: "ATA Carnet and temporary-import enquiries", ar: "استفسارات كارنيه ATA والاستيراد المؤقت" },
      { en: "Gateway and onward-delivery coordination", ar: "تنسيق منفذ الدخول والنقل بعد الفسح" },
    ],
    overview: [
      { en: "Customs clearance involves the declarations and supporting documents required for goods to enter or leave a country, together with applicable duties and taxes. Saudi gateway enquiries may involve Riyadh Dry Port, Jeddah Islamic Port or King Abdulaziz Port in Dammam. The gateway, responsible customs operator and ENVOD's available coordination scope must be confirmed for each shipment. Classification, product requirements, inspections and release decisions depend on the cargo and responsible authorities.", ar: "يشمل التخليص الجمركي الإقرارات والمستندات اللازمة لدخول البضائع أو خروجها، إلى جانب الرسوم والضرائب المنطبقة. وقد تشمل الاستفسارات عن المنافذ السعودية الميناء الجاف بالرياض أو ميناء جدة الإسلامي أو ميناء الملك عبدالعزيز بالدمام. يجب تأكيد المنفذ والجهة المسؤولة عن التخليص ونطاق التنسيق المتاح من إنفود لكل شحنة. ويعتمد التصنيف ومتطلبات المنتج والفحص وقرار الفسح على البضاعة والجهات المختصة." },
      { en: "Product conformity, regulated-goods approvals and temporary admission are separate requirements. SABER procedures, SFDA-related requirements or ATA Carnet eligibility may apply depending on the commodity and intended use. Assistance with documentation does not replace authority approval. Clearance timing depends on complete documents, inspections and applicable government processes.", ar: "تعد مطابقة المنتجات وموافقات السلع المنظمة والإدخال المؤقت متطلبات منفصلة. قد تنطبق إجراءات سابر أو متطلبات هيئة الغذاء والدواء أو أهلية كارنيه ATA حسب السلعة والاستخدام المقصود. لا يحل دعم المستندات محل موافقة الجهة المختصة. وتعتمد مدة التخليص على اكتمال الوثائق والفحص والإجراءات الحكومية المنطبقة." },
    ],
    faq: [
      { q: "How long does customs clearance take in Saudi Arabia?", a: "Timing depends on shipment type, complete documentation, inspections, product approvals and authority processing. No fixed release time can be promised before those factors are reviewed.", qAr: "كم يستغرق التخليص الجمركي في المملكة العربية السعودية؟", aAr: "تعتمد المدة على نوع الشحنة واكتمال المستندات والفحص وموافقات المنتج وإجراءات الجهات المختصة. لا يمكن الوعد بمدة فسح ثابتة قبل مراجعة هذه العوامل." },
      { q: "What documents are needed for customs clearance in Saudi Arabia?", a: "ZATCA lists the commercial invoice and bill of lading, with a certificate of origin where origin is not clearly established. Additional documents and approvals depend on the goods; provide a packing list and commodity details for a shipment-specific review.", qAr: "ما المستندات اللازمة للتخليص الجمركي في السعودية؟", aAr: "تذكر الهيئة الفاتورة التجارية وبوليصة الشحن، وشهادة المنشأ عندما لا يكون المنشأ واضحاً. تختلف الوثائق والموافقات الإضافية حسب البضاعة؛ أرسل قائمة التعبئة ووصف السلعة لمراجعة متطلبات شحنتك." },
      { q: "Do you offer ATA Carnet services?", a: "You can enquire about ATA Carnet and temporary-import logistics coordination. Eligibility, issuance and acceptance must be confirmed with the relevant issuing association and customs authorities; not all goods or uses qualify.", qAr: "هل تقدمون خدمات كارنيه ATA؟", aAr: "يمكنك الاستفسار عن تنسيق الخدمات اللوجستية لكارنيه ATA والاستيراد المؤقت. يجب تأكيد الأهلية والإصدار والقبول مع الجهة المصدرة والجمارك المختصة؛ فليست جميع البضائع أو الاستخدامات مؤهلة." },
    ],
  },
  5: {
    id: 5, slug: "warehousing",
    gradient: "linear-gradient(135deg,#0d1520 0%,#162030 50%,#070e18 100%)",
    accentHex: "#64748b",
    industries: ["E-commerce","Retail","FMCG","Pharmaceuticals","Electronics"],
    industriesAr: ["التجارة الإلكترونية","التجزئة","السلع الاستهلاكية","الأدوية","الإلكترونيات"],
    process: [
      { en: "Receiving", ar: "الاستلام" },
      { en: "Inspection", ar: "الفحص" },
      { en: "Storage", ar: "التخزين" },
      { en: "Order Processing", ar: "معالجة الطلبات" },
      { en: "Pick & Pack", ar: "تجميع وتغليف" },
      { en: "Dispatch", ar: "الإرسال" },
      { en: "Delivery", ar: "التسليم" },
    ],
    subServices: [
      { name: "General Warehousing", nameAr: "التخزين العام", desc: "Ask about storage for the cargo type, location and period; facility and capacity are confirmed before booking.", descAr: "استفسر عن تخزين نوع البضاعة وموقعها ومدتها؛ ويتم تأكيد المنشأة والسعة قبل الحجز." },
      { name: "Bonded Warehousing", nameAr: "التخزين الجمركي", desc: "Bonded status, facility authorization and availability must be confirmed for the requested goods and location.", descAr: "يجب تأكيد الصفة الجمركية وترخيص المنشأة والإتاحة للبضائع والموقع المطلوبين." },
      { name: "Temperature-Controlled Storage", nameAr: "تخزين بدرجات حرارة مضبوطة", desc: "Confirm the required temperature range, monitoring, facility and product acceptance for each enquiry.", descAr: "يجب تأكيد نطاق الحرارة والمراقبة والمنشأة وقبول المنتج لكل استفسار." },
      { name: "Cold Storage", nameAr: "التخزين البارد", desc: "Cold-storage enquiries are reviewed against the product, temperature range and facility availability.", descAr: "تتم مراجعة طلبات التخزين البارد وفق المنتج ونطاق الحرارة وتوفر المنشأة." },
      { name: "Inventory Management", nameAr: "إدارة المخزون", desc: "Inventory reporting, system access and update frequency depend on the selected facility and agreed scope.", descAr: "تعتمد تقارير المخزون وإمكانية الوصول إلى النظام وتواتر التحديث على المنشأة والنطاق المتفق عليهما." },
      { name: "Pick & Pack", nameAr: "تجميع وتغليف", desc: "Order-level picking, packing, and labeling.", descAr: "تجميع وتغليف وتسمية على مستوى الطلب." },
      { name: "Packing Services", nameAr: "خدمات التغليف", desc: "Professional packing for all cargo types.", descAr: "تغليف احترافي لجميع أنواع البضائع." },
      { name: "Custom Wooden Industrial Crating", nameAr: "تصنيع الصناديق الخشبية الصناعية حسب الطلب", desc: "In-house carpentry workshops prepare custom wooden crates and pallets for industrial machinery and specialist cargo. Export crates can use ISPM-15 heat-treated timber when required by the destination.", descAr: "تجهز ورش النجارة الداخلية صناديق خشبية ومنصات حسب الطلب للمعدات الصناعية والبضائع المتخصصة. ويمكن استخدام أخشاب معالجة حرارياً وفق ISPM 15 لصناديق التصدير عند اشتراط الوجهة." },
      { name: "Export Packing & Protective Cargo Packaging", nameAr: "تغليف الشحنات للتصدير وحمايتها", desc: "Export preparation and protective packing for freight shipments, including wooden crates and pallets, shock-protection materials and moisture barriers; scope is tailored to the cargo and destination.", descAr: "تجهيز الشحنات للتصدير وتغليفها الواقي، بما في ذلك الصناديق الخشبية والمنصات ومواد الحماية من الصدمات والرطوبة؛ ويحدد النطاق وفق البضاعة والوجهة." },
      { name: "Heavy Equipment Handling & Securing", nameAr: "مناولة المعدات الثقيلة وتثبيتها", desc: "Heavy machinery packing, lashing and securing, with forklift handling and crane-related services planned around cargo dimensions, weight, lift points and the shipment.", descAr: "تغليف المعدات الثقيلة وربطها وتثبيتها للشحن، مع تخطيط مناولة الرافعات الشوكية والخدمات المرتبطة بالرافعات وفق أبعاد الحمولة ووزنها ونقاط الرفع ومتطلبات الشحنة." },
      { name: "Repacking", nameAr: "إعادة التغليف", desc: "Repackaging cargo to meet destination or retail requirements.", descAr: "إعادة تغليف البضائع لتلبية متطلبات الوجهة أو التجزئة." },
      { name: "Labeling & Barcoding", nameAr: "التسمية والترميز الشريطي", desc: "Product labeling, barcode application, and compliance.", descAr: "تسمية المنتجات وتطبيق الباركود والامتثال." },
      { name: "Order Fulfilment", nameAr: "تنفيذ الطلبات", desc: "End-to-end order processing and dispatch.", descAr: "معالجة الطلبات الكاملة من الاستلام إلى الإرسال." },
      { name: "Distribution", nameAr: "التوزيع", desc: "Distribution origin, delivery area, operator and service availability are confirmed per enquiry.", descAr: "يتم تأكيد منشأ التوزيع ومنطقة التسليم والمشغّل وتوفر الخدمة لكل استفسار." },
      { name: "Cross Docking", nameAr: "الشحن المباشر", desc: "Fast transfer between inbound and outbound without long-term storage.", descAr: "نقل سريع بين الوارد والصادر دون تخزين طويل الأمد." },
      { name: "Container Stuffing", nameAr: "تعبئة الحاويات", desc: "Professional cargo packing and stuffing into containers.", descAr: "تعبئة احترافية للبضائع داخل الحاويات." },
      { name: "Container Destuffing", nameAr: "تفريغ الحاويات", desc: "Safe unloading and sorting of containerized cargo.", descAr: "تفريغ وفرز آمن للبضائع المحملة في الحاويات." },
      { name: "Cargo Inspection", nameAr: "فحص البضائع", desc: "Quality checks and condition reports on receipt.", descAr: "فحص الجودة وتقارير الحالة عند الاستلام." },
      { name: "Short-Term Storage", nameAr: "تخزين قصير الأمد", desc: "Flexible short-term storage from daily to monthly.", descAr: "تخزين مرن قصير الأمد من يومي إلى شهري." },
      { name: "Long-Term Storage", nameAr: "تخزين طويل الأمد", desc: "Cost-effective long-term warehouse space with full management.", descAr: "مساحة مستودع طويلة الأمد فعالة بالتكلفة مع الإدارة الكاملة." },
      { name: "Value Added Logistics (VAL)", nameAr: "الخدمات اللوجستية ذات القيمة المضافة", desc: "Kitting, assembly, quality checks, and product customization.", descAr: "تجميع وتركيب وفحوصات جودة وتخصيص المنتج." },
      { name: "E-Commerce Fulfillment", nameAr: "الوفاء بطلبات التجارة الإلكترونية", desc: "Fulfillment center services for online retailers.", descAr: "خدمات مركز الوفاء لتجار التجزئة الإلكترونيين." },
      { name: "Warehouse Handling", nameAr: "مناولة المستودعات", desc: "Full materials handling — forklifts, racking, loading bays.", descAr: "مناولة مواد كاملة — رافعات شوكية ورفوف ومحطات تحميل." },
    ],
    whyEnvod: [
      { en: "Facility location, operator and capacity confirmed for the enquiry", ar: "تأكيد موقع المنشأة ومشغّلها وسعتها لكل استفسار" },
      { en: "Security, access and monitoring arrangements confirmed before storage", ar: "تأكيد ترتيبات الأمن والدخول والمراقبة قبل التخزين" },
      { en: "Bonded status and temperature conditions verified for the selected facility", ar: "التحقق من الصفة الجمركية وظروف الحرارة للمنشأة المختارة" },
      { en: "WMS or ERP access considered only where the facility and agreed scope support it", ar: "تُبحث إمكانية الوصول إلى أنظمة WMS أو ERP فقط إذا دعمتها المنشأة والنطاق المتفق عليه" },
    ],
    overview: [
      { en: "Warehousing and distribution can include storage, receiving, inventory handling, order preparation and onward delivery. ENVOD can review a storage or fulfilment enquiry, but the facility location, operator, capacity, bonded authorization, temperature range, security arrangements and available services must be confirmed for the particular cargo before any commitment.", ar: "قد يشمل التخزين والتوزيع حفظ البضائع واستلامها ومناولة المخزون وتجهيز الطلبات والتوصيل. يمكن لإنفود مراجعة استفسار التخزين أو تنفيذ الطلبات، لكن يجب تأكيد موقع المنشأة ومشغّلها وسعتها وترخيصها الجمركي ونطاق الحرارة وترتيبات الأمن والخدمات المتاحة للبضاعة المعنية قبل أي التزام." },
      { en: "Inventory-system access, reporting frequency, pick-and-pack, cross-docking, container handling and other value-added services depend on the selected facility and agreed scope. Send the goods, storage period, handling requirements and destination to ask what can be arranged.", ar: "تعتمد إمكانية الوصول إلى نظام المخزون وتواتر التقارير وتجهيز الطلبات والشحن المباشر ومناولة الحاويات والخدمات الإضافية على المنشأة المختارة والنطاق المتفق عليه. أرسل نوع البضاعة ومدة التخزين ومتطلبات المناولة والوجهة للاستفسار عما يمكن ترتيبه." },
      { en: "For warehouse and freight enquiries in Saudi Arabia, ENVOD's in-house carpentry workshops prepare custom wooden industrial crates and pallets for machinery and specialist cargo. Export preparation can include ISPM-15 heat-treated timber when required by the destination, shock protection, moisture barriers and protective packing. Heavy-equipment packing, handling, lashing and securing can be requested with forklift or crane-related services; the lift plan, operator, cargo dimensions, weight and lift points are confirmed for each shipment.", ar: "لاستفسارات التخزين والشحن في السعودية، تجهز ورش النجارة الداخلية لدى إنفود صناديق خشبية صناعية ومنصات مخصصة للآلات والمعدات والبضائع المتخصصة. وقد يشمل التجهيز للتصدير أخشاباً معالجة حرارياً وفق ISPM 15 عند اشتراط الوجهة، ووسائل حماية من الصدمات والرطوبة وتغليفاً واقياً. ويمكن طلب تغليف المعدات الثقيلة ومناولتها وربطها وتثبيتها، مع خدمات الرافعات الشوكية أو الخدمات المرتبطة بالرافعات؛ ويتم تأكيد خطة الرفع والمشغّل وأبعاد الحمولة ووزنها ونقاط الرفع لكل شحنة." },
    ],
    faq: [
      { q: "Can you arrange bonded warehousing?", a: "Bonded storage depends on the facility's current authorization, location, cargo eligibility and capacity. Share the goods, destination and storage period so these details can be checked; no bonded status or space is assumed.", qAr: "هل يمكن ترتيب التخزين الجمركي؟", aAr: "يعتمد التخزين الجمركي على الترخيص الحالي للمنشأة وموقعها وأهلية البضاعة والسعة. أرسل نوع البضاعة والوجهة ومدة التخزين للتحقق؛ ولا يُفترض توفر صفة جمركية أو مساحة." },
      { q: "Can you integrate with our inventory or ERP system?", a: "System integration and inventory visibility depend on the facility's technology and the agreed scope. Share your platform and reporting requirements for review; no real-time integration is assumed.", qAr: "هل يمكن التكامل مع نظام المخزون أو ERP لدينا؟", aAr: "يعتمد تكامل الأنظمة وإتاحة بيانات المخزون على تقنية المنشأة والنطاق المتفق عليه. أرسل اسم النظام ومتطلبات التقارير للمراجعة؛ ولا يُفترض توفر تكامل فوري." },
      { q: "Can you arrange temperature-controlled or cold storage?", a: "Availability depends on the cargo, required temperature range, monitoring and the selected facility. Share the product and handling conditions so suitability can be checked before booking.", qAr: "هل يمكن ترتيب تخزين مبرد أو بدرجات حرارة مضبوطة؟", aAr: "يعتمد التوفر على البضاعة ونطاق الحرارة المطلوب والمراقبة والمنشأة المختارة. أرسل المنتج وظروف المناولة للتحقق من الملاءمة قبل الحجز." },
      { q: "Can you crate industrial machinery for export?", a: "Yes. ENVOD's in-house carpentry workshops prepare custom wooden crates and pallets for industrial machinery and specialist cargo. ISPM-15 heat-treated timber, shock or moisture protection, lashing, securing and forklift or crane-related handling can be included according to the cargo and destination requirements. Confirm the dimensions, weight, destination and any packaging standard before dispatch.", qAr: "هل يمكنكم تجهيز صناديق خشبية للمعدات الصناعية للتصدير؟", aAr: "نعم. تجهز ورش النجارة الداخلية لدى إنفود صناديق خشبية ومنصات مخصصة للمعدات الصناعية والبضائع المتخصصة. ويمكن إضافة أخشاب معالجة حرارياً وفق ISPM 15 ووسائل حماية من الصدمات أو الرطوبة والربط والتثبيت ومناولة الرافعات الشوكية أو الخدمات المرتبطة بالرافعات وفق البضاعة ومتطلبات الوجهة. يرجى تأكيد الأبعاد والوزن والوجهة وأي معيار تغليف مطلوب قبل الإرسال." },
    ],
  },
  6: {
    id: 6, slug: "freight-forwarding",
    gradient: "linear-gradient(135deg,#150a2a 0%,#220f3a 50%,#0c0515 100%)",
    accentHex: "#a855f7",
    industries: ["All Sectors","Manufacturing","Oil & Gas","Construction","Technology"],
    industriesAr: ["جميع القطاعات","التصنيع","النفط والغاز","البناء","التكنولوجيا"],
    process: [
      { en: "Consultation", ar: "الاستشارة" },
      { en: "Routing", ar: "تحديد المسار" },
      { en: "Documentation", ar: "التوثيق" },
      { en: "Pickup", ar: "الاستلام" },
      { en: "Transit Management", ar: "إدارة العبور" },
      { en: "Customs Clearance", ar: "التخليص" },
      { en: "Final Delivery", ar: "التسليم" },
    ],
    subServices: [
      { name: "Multimodal Freight Forwarding", nameAr: "الشحن متعدد الوسائط", desc: "Combined sea/air/road routing for cost and time optimization.", descAr: "توجيه مدمج جوياً وبحرياً وبرياً." },
      { name: "Door-to-Door Forwarding", nameAr: "من الباب للباب", desc: "Complete origin-to-destination management.", descAr: "إدارة كاملة من المنشأ إلى الوجهة." },
      { name: "Import Freight Forwarding", nameAr: "شحن الاستيراد", desc: "Managed imports into Saudi Arabia from worldwide origins.", descAr: "واردات مُدارة إلى المملكة من مصادر عالمية." },
      { name: "Export Freight Forwarding", nameAr: "شحن التصدير", desc: "Saudi export coordination to all global markets.", descAr: "تنسيق التصدير السعودي إلى جميع الأسواق العالمية." },
      { name: "Cargo Insurance", nameAr: "تأمين الشحن", desc: "Full cargo cover for door-to-door shipments.", descAr: "تغطية شحن كاملة للشحنات من الباب للباب." },
      { name: "3PL Solutions", nameAr: "حلول الطرف الثالث اللوجستية", desc: "Outsourced logistics management (3PL).", descAr: "إدارة لوجستية مُستعان بها من طرف ثالث." },
      { name: "Project Forwarding", nameAr: "شحن المشاريع", desc: "Specialist forwarding for industrial project cargo.", descAr: "شحن متخصص لبضائع المشاريع الصناعية." },
      { name: "Customs Brokerage", nameAr: "وكالة جمركية", desc: "Customs documentation and responsible-operator coordination.", descAr: "تنسيق المستندات الجمركية مع الجهة المسؤولة عن التخليص." },
    ],
    whyEnvod: [
      { en: "Saudi import and export documentation planning", ar: "تخطيط مستندات الاستيراد والتصدير السعودية" },
      { en: "International routing and agent-scope coordination", ar: "تنسيق المسارات الدولية ونطاق عمل الوكلاء" },
      { en: "Multimodal solutions tailored to your supply chain", ar: "حلول متعددة الوسائط مصممة لسلسلة التوريد الخاصة بك" },
    ],
    overview: [
      { en: "Freight forwarding coordinates transport, documents and handoffs on a shipper's behalf; the forwarder may work with carriers and specialist operators rather than own the transport assets. ENVOD can review a requested sea, air or road shipment and confirm which routing, documentation, customs, insurance or 3PL elements are within scope for that enquiry.", ar: "ينسق الشحن المتكامل النقل والمستندات ومراحل التسليم نيابةً عن المرسل؛ وقد يعمل وكيل الشحن مع الناقلين والمشغّلين المتخصصين بدلاً من امتلاك وسائط النقل. يمكن لإنفود مراجعة طلب شحن بحري أو جوي أو بري وتأكيد عناصر المسار والمستندات والجمارك والتأمين أو 3PL الداخلة ضمن نطاق الاستفسار." },
      { en: "Before booking, confirm the carrier, agent, customs operator, insurance arrangement and delivery responsibilities for the shipment. International availability depends on the route, cargo, current provider capacity and acceptance.", ar: "قبل الحجز، أكّد الناقل والوكيل ومشغّل الجمارك وترتيبات التأمين ومسؤوليات التسليم للشحنة. وتعتمد الإتاحة الدولية على المسار والبضاعة وسعة مقدم الخدمة الحالية وقبوله." },
    ],
    faq: [
      { q: "What does a freight forwarder do?", a: "A freight forwarder organizes shipments on behalf of shippers — arranging transport, handling documentation, managing customs, and coordinating the complete logistics chain.", qAr: "ما دور وكيل الشحن؟", aAr: "يُنظّم وكيل الشحن الشحنات نيابةً عن المرسلين — ترتيب النقل ومعالجة المستندات وإدارة الجمارك وتنسيق سلسلة اللوجستيات الكاملة." },
      { q: "What is the difference between a freight forwarder and a carrier?", a: "A carrier physically moves cargo — a shipping line, airline, or trucking company. A freight forwarder arranges and manages that transport across multiple carriers and modes, handling booking, documentation, and customs on your behalf.", qAr: "ما الفرق بين وكيل الشحن والناقل؟", aAr: "الناقل هو من ينقل البضائع فعلياً — خط ملاحي أو شركة طيران أو شركة نقل بري. أمّا وكيل الشحن فيُرتّب ويدير ذلك النقل عبر ناقلين ووسائط متعددة، متولّياً الحجز والتوثيق والتخليص نيابةً عنك." },
      { q: "Can you coordinate an import or export shipment?", a: "Share the origin, destination, cargo, dates and requested service scope. Routing, carrier, customs operator, documents and delivery responsibilities are checked for each shipment; availability at both ends is not assumed.", qAr: "هل يمكنكم تنسيق شحنة استيراد أو تصدير؟", aAr: "أرسل المنشأ والوجهة والبضاعة والتواريخ ونطاق الخدمة المطلوب. تتم مراجعة المسار والناقل ومشغّل الجمارك والمستندات ومسؤوليات التسليم لكل شحنة؛ ولا يُفترض توفر الخدمة عند الطرفين." },
    ],
  },
  7: {
    id: 7, slug: "supply-chain",
    gradient: "linear-gradient(135deg,#0d0520 0%,#190830 50%,#07030f 100%)",
    accentHex: "#6366f1",
    industries: ["Manufacturing","Retail","FMCG","Automotive","Healthcare"],
    industriesAr: ["التصنيع","التجزئة","السلع الاستهلاكية","السيارات","الرعاية الصحية"],
    process: [
      { en: "Analysis", ar: "التحليل" },
      { en: "Strategy", ar: "الاستراتيجية" },
      { en: "Vendor Setup", ar: "إعداد الموردين" },
      { en: "Implementation", ar: "التنفيذ" },
      { en: "Monitoring", ar: "المراقبة" },
      { en: "Optimization", ar: "التحسين" },
    ],
    subServices: [
      { name: "Supply Chain Consulting", nameAr: "استشارات سلسلة التوريد", desc: "Expert analysis and optimization of your logistics network.", descAr: "تحليل وتحسين متخصص لشبكتك اللوجستية." },
      { name: "Vendor Management", nameAr: "إدارة الموردين", desc: "Supplier selection, onboarding, and performance management.", descAr: "اختيار الموردين وتأهيلهم وإدارة أدائهم." },
      { name: "Demand Planning", nameAr: "تخطيط الطلب", desc: "Data-driven demand forecasting to optimize inventory.", descAr: "توقع الطلب بالبيانات لتحسين المخزون." },
      { name: "Last-Mile Solutions", nameAr: "حلول المرحلة الأخيرة", desc: "Efficient final delivery with route optimization.", descAr: "توصيل نهائي فعّال مع تحسين المسارات." },
      { name: "ERP Integration", nameAr: "تكامل ERP", desc: "Seamless integration with SAP, Oracle, and other ERP systems.", descAr: "تكامل سلس مع SAP وOracle وأنظمة ERP الأخرى." },
      { name: "KPI Reporting & Analytics", nameAr: "تقارير مؤشرات الأداء والتحليلات", desc: "Real-time dashboards and performance analytics.", descAr: "لوحات معلومات في الوقت الفعلي وتحليلات الأداء." },
      { name: "Warehouse Management", nameAr: "إدارة المستودعات", desc: "Integrated WMS solutions for efficient warehouse operations.", descAr: "حلول WMS متكاملة لعمليات مستودعات فعّالة." },
      { name: "Transportation Management", nameAr: "إدارة النقل", desc: "TMS solutions to optimize fleet routing and carrier selection.", descAr: "حلول TMS لتحسين توجيه الأسطول واختيار الناقل." },
    ],
    whyEnvod: [
      { en: "End-to-end visibility across your entire supply chain", ar: "رؤية شاملة عبر سلسلة التوريد بأكملها" },
      { en: "ERP integration with SAP, Oracle, and Odoo", ar: "تكامل ERP مع SAP وOracle وOdoo" },
      { en: "Dedicated KAM assigned to your account", ar: "مدير حسابات مخصص لحسابك" },
    ],
    faq: [
      { q: "Can you integrate with our ERP system?", a: "Integration depends on the selected provider, platform, access permissions and project scope. Share your system and required data flow so technical compatibility can be checked; no integration or real-time visibility is assumed.", qAr: "هل يمكن التكامل مع نظام ERP لدينا؟", aAr: "يعتمد التكامل على مقدم الخدمة المختار والمنصة وصلاحيات الوصول ونطاق المشروع. أرسل اسم النظام وتدفق البيانات المطلوب للتحقق من التوافق التقني؛ ولا يُفترض توفر تكامل أو عرض فوري للبيانات." },
    ],
  },
  8: {
    id: 8, slug: "project-cargo",
    gradient: "linear-gradient(135deg,#1a0a04 0%,#2d1508 50%,#0e0604 100%)",
    accentHex: "#f97316",
    industries: ["Oil & Gas","Renewable Energy","Construction","Mining","Power Generation"],
    industriesAr: ["النفط والغاز","الطاقة المتجددة","البناء","التعدين","توليد الطاقة"],
    process: [
      { en: "Feasibility Study", ar: "دراسة الجدوى" },
      { en: "Route Survey", ar: "مسح المسار" },
      { en: "Engineering Plan", ar: "الخطة الهندسية" },
      { en: "Permits & Approvals", ar: "التصاريح والموافقات" },
      { en: "Transport Execution", ar: "تنفيذ النقل" },
      { en: "Crane & Rigging", ar: "الرافعة والتعليق" },
      { en: "Site Delivery", ar: "التسليم للموقع" },
    ],
    subServices: [
      { name: "Heavy Lift Cargo", nameAr: "شحن الرفع الثقيل", desc: "Crane-assisted heavy lift for oversized industrial equipment.", descAr: "رفع ثقيل بمساعدة الرافعات للمعدات الصناعية الضخمة." },
      { name: "Oversized Cargo Transport", nameAr: "نقل البضائع الضخمة", desc: "Permit-managed oversized load transport by road and sea.", descAr: "نقل الأحمال الضخمة برياً وبحرياً بإدارة التصاريح اللازمة." },
      { name: "Break Bulk Cargo", nameAr: "بضائع بريك بالك", desc: "Non-containerized break bulk transport for large project items.", descAr: "نقل بريك بالك غير حاوية للعناصر الكبيرة للمشاريع." },
      { name: "Industrial Machinery", nameAr: "الآلات الصناعية", desc: "Specialist transport and installation of industrial machinery.", descAr: "نقل وتركيب متخصص للآلات الصناعية." },
      { name: "Power Plant Equipment", nameAr: "معدات محطات الطاقة", desc: "Transformers, generators, and power infrastructure logistics.", descAr: "لوجستيات المحولات والمولدات وبنية الطاقة التحتية." },
      { name: "Oil & Gas Equipment Logistics", nameAr: "لوجستيات معدات النفط والغاز", desc: "Secure transport of drilling, refining, and processing equipment.", descAr: "نقل آمن لمعدات الحفر والتكرير والمعالجة." },
      { name: "Renewable Energy Projects", nameAr: "مشاريع الطاقة المتجددة", desc: "Wind turbines, solar panels, and energy infrastructure logistics.", descAr: "لوجستيات توربينات الرياح والألواح الشمسية وبنية الطاقة." },
      { name: "Construction Equipment", nameAr: "معدات البناء", desc: "Cranes, excavators, and construction plant transport.", descAr: "نقل الرافعات والحفارات ومعدات البناء." },
      { name: "Route Survey", nameAr: "مسح المسار", desc: "Pre-movement route assessment for oversized cargo.", descAr: "تقييم المسار قبل الحركة للبضائع الكبيرة." },
      { name: "Escort Vehicles", nameAr: "مركبات المرافقة", desc: "Police and pilot escort coordination for abnormal loads.", descAr: "تنسيق مرافقة شرطية وطليعية للأحمال غير الاعتيادية." },
      { name: "Crane Coordination", nameAr: "تنسيق الرافعات", desc: "Full lift planning and crane operations on site.", descAr: "تخطيط وتنفيذ الرفع الكامل وعمليات الرافعات في الموقع." },
      { name: "Port Handling", nameAr: "مناولة الميناء", desc: "Specialist stevedoring and port handling for project cargo.", descAr: "مناولة ميناء متخصصة لبضائع المشاريع." },
      { name: "Site Delivery", nameAr: "التسليم للموقع", desc: "Final delivery and unloading directly to the project site.", descAr: "التسليم والتفريغ النهائي مباشرة في موقع المشروع." },
      { name: "Multi-Modal Project Logistics", nameAr: "لوجستيات المشاريع متعددة الوسائط", desc: "Combined sea, air, and road project cargo solutions.", descAr: "حلول بضائع مشاريع مدمجة بحراً وجواً وبراً." },
    ],
    whyEnvod: [
      { en: "Specialist project cargo team in Saudi Arabia", ar: "فريق متخصص في بضائع المشاريع في المملكة" },
      { en: "Full route survey and engineering support", ar: "مسح مسار كامل ودعم هندسي" },
      { en: "Crane and rigging services on-site", ar: "خدمات رافعات وتعليق في الموقع" },
      { en: "Saudi Aramco and SABIC supply chain experience", ar: "خبرة في سلاسل توريد أرامكو وسابك" },
    ],
    overview: [
      { en: "Project cargo logistics is the transport of oversized, overweight, high-value, or complex shipments that cannot move as standard freight. It is common in oil and gas, power generation, renewable energy, construction, and mining, and it demands engineering-led planning. ENVOD KINGDOM SHIPPING SERVICES handles heavy-lift and break-bulk cargo, route surveys, permits, crane and rigging operations, and final site delivery.", ar: "لوجستيات بضائع المشاريع هي نقل الشحنات الضخمة أو الثقيلة أو عالية القيمة أو المعقّدة التي لا يمكن نقلها كشحن قياسي. وهي شائعة في النفط والغاز وتوليد الطاقة والطاقة المتجددة والبناء والتعدين، وتتطلّب تخطيطاً بقيادة هندسية. تتولّى شركة إنفود كينجدوم للخدمات الملاحية الرفع الثقيل وبضائع بريك بالك ومسح المسارات والتصاريح وعمليات الرافعات والتعليق والتسليم النهائي للموقع." },
      { en: "Each project begins with a feasibility study and route survey, followed by an engineering plan, permits and approvals, multimodal transport execution, on-site crane and rigging, and delivery directly to the project site. ENVOD brings specialist experience supporting Saudi industrial supply chains, including Saudi Aramco and SABIC projects.", ar: "يبدأ كل مشروع بدراسة جدوى ومسح للمسار، يليه خطة هندسية والتصاريح والموافقات وتنفيذ النقل متعدد الوسائط وعمليات الرافعات والتعليق في الموقع والتسليم مباشرة إلى موقع المشروع. وتقدّم إنفود خبرة متخصصة في دعم سلاسل التوريد الصناعية السعودية، بما في ذلك مشاريع أرامكو السعودية وسابك." },
    ],
    faq: [
      { q: "What qualifies as project cargo?", a: "Project cargo includes oversized, heavy, or high-value shipments that require specialized handling — typically industrial equipment, power plant components, oil & gas hardware, or infrastructure materials.", qAr: "ما الذي يُصنّف ضمن بضائع المشاريع؟", aAr: "تشمل بضائع المشاريع الشحنات الضخمة أو الثقيلة أو عالية القيمة التي تتطلب مناولة متخصصة." },
      { q: "Do you obtain the permits for oversized loads?", a: "Yes. We manage the full permit process for abnormal and oversized loads, including route surveys and police or pilot escort coordination where required.", qAr: "هل تحصلون على تصاريح الأحمال الضخمة؟", aAr: "نعم. ندير عملية التصاريح الكاملة للأحمال غير الاعتيادية والضخمة، بما في ذلك مسح المسارات وتنسيق المرافقة الشرطية أو الطليعية عند الحاجة." },
      { q: "Can you deliver directly to a remote project site?", a: "Yes. We plan multimodal movements from port or origin to the final site, including heavy-lift, crane operations, and site delivery in remote or restricted locations.", qAr: "هل يمكنكم التسليم مباشرة إلى موقع مشروع ناءٍ؟", aAr: "نعم. نخطّط لعمليات نقل متعددة الوسائط من الميناء أو المنشأ إلى الموقع النهائي، بما في ذلك الرفع الثقيل وعمليات الرافعات والتسليم في المواقع النائية أو المقيّدة." },
    ],
  },
  9: {
    id: 9, slug: "relocation",
    gradient: "linear-gradient(135deg,#180c04 0%,#281408 50%,#0c0604 100%)",
    accentHex: "#fb923c",
    industries: ["Homes & apartments","Villas & private residences","Office & employee moves","International household moves","Corporate","Government","Diplomatic","Individual","Expat Communities"],
    industriesAr: ["المنازل والشقق","الفلل والمساكن الخاصة","نقل المكاتب والموظفين","نقل الأمتعة المنزلية دولياً","الشركات","الحكومة","الدبلوماسية","الأفراد","المغتربون"],
    process: [
      { en: "Send move details", ar: "أرسل تفاصيل الانتقال" },
      { en: "Review inventory & access", ar: "مراجعة المنقولات والدخول" },
      { en: "Check route & provider scope", ar: "التحقق من المسار ونطاق المقدم" },
      { en: "Confirm scope before booking", ar: "تأكيد النطاق قبل الحجز" },
    ],
    subServices: [
      { name: "Home and apartment move enquiries", nameAr: "استفسارات نقل المنازل والشقق", desc: "Share the move type, approximate contents, packing needs, preferred date and origin/destination area. Provider options and the requested scope are confirmed before booking.", descAr: "أرسل نوع الانتقال والحجم التقريبي واحتياجات التغليف والموعد المفضل ومنطقة المنشأ والوجهة. ويتم تأكيد خيارات مقدم الخدمة والنطاق المطلوب قبل الحجز." },
      { name: "Office and employee move enquiries", nameAr: "استفسارات نقل المكاتب والموظفين", desc: "Include the inventory, schedule, building access and requested work so availability and responsibilities can be reviewed for the specific move.", descAr: "أرسل قائمة المنقولات والجدول ومتطلبات دخول المبنى والأعمال المطلوبة لمراجعة التوفر والمسؤوليات لكل انتقال." },
      { name: "International household move enquiries", nameAr: "استفسارات نقل الأمتعة المنزلية دولياً", desc: "Share origin and destination countries, inventory and preferred dates. Route coverage, customs documents, eligibility and provider responsibilities need confirmation.", descAr: "أرسل دولتي المنشأ والوجهة وقائمة المنقولات والتواريخ المفضلة. يجب تأكيد تغطية المسار ومستندات الجمارك والأهلية ومسؤوليات مقدم الخدمة." },
      { name: "Packing, handling and storage requests", nameAr: "طلبات التغليف والمناولة والتخزين", desc: "Describe any packing, furniture dismantling, fragile-item handling or storage needs. Availability, terms and responsibilities are confirmed for the move.", descAr: "اذكر احتياجات التغليف أو فك الأثاث أو مناولة القطع الحساسة أو التخزين. ويتم تأكيد التوفر والشروط والمسؤوليات للانتقال." },
      ...RESTORED_RELOCATION_OPTIONS,
    ],
    whyEnvod: [
      { en: "Move size, inventory, packing and access needs reviewed together", ar: "مراجعة حجم الانتقال والمنقولات والتغليف ومتطلبات الدخول معاً" },
      { en: "Origin, destination and preferred timing checked for the requested route", ar: "مراجعة المنشأ والوجهة والموعد المفضل للمسار المطلوب" },
      { en: "Provider availability, responsibilities and scope confirmed before booking", ar: "تأكيد توفر مقدم الخدمة والمسؤوليات والنطاق قبل الحجز" },
      { en: "Inventory and packing requirements reviewed", ar: "مراجعة قائمة الأثاث ومتطلبات التغليف" },
      { en: "Import rules and customs responsibilities checked", ar: "التحقق من قواعد الاستيراد ومسؤوليات الجمارك" },
      { en: "Route coverage and provider scope confirmed per move", ar: "تأكيد تغطية المسار ونطاق مقدم الخدمة لكل انتقال" },
    ],
    overview: [
      { en: "House moving and furniture relocation in Riyadh can involve a local address change, a move between Saudi cities, or an international household-goods shipment. ENVOD KINGDOM reviews each enquiry by move type, inventory, packing requests, preferred date and route; available providers and the agreed scope must be confirmed before booking.", ar: "قد يشمل نقل المنازل والأثاث في الرياض انتقالاً داخل المدينة أو بين المدن السعودية أو شحنة أمتعة منزلية دولية. تراجع إنفود كينغدوم كل استفسار وفق نوع الانتقال وقائمة المنقولات واحتياجات التغليف والموعد والمسار؛ ويجب تأكيد مقدم الخدمة المتاح والنطاق المتفق عليه قبل الحجز." },
      { en: "For a useful first enquiry, describe the approximate home or office size, main furniture and carton count, fragile or oversized items, packing or dismantling requests, and building access such as stairs, lifts or parking restrictions. For international moves, import eligibility, customs paperwork, insurance terms and the responsibilities of each provider depend on the route and must be checked for that shipment.", ar: "لتقديم استفسار أولي مفيد، اذكر الحجم التقريبي للمنزل أو المكتب وأبرز قطع الأثاث وعدد الصناديق والقطع الحساسة أو كبيرة الحجم واحتياجات التغليف أو الفك ومتطلبات دخول المبنى مثل السلالم أو المصعد أو قيود المواقف. وفي الانتقالات الدولية، تعتمد أهلية الاستيراد والمستندات الجمركية وشروط التأمين ومسؤولية كل مقدم خدمة على المسار ويجب التحقق منها لكل شحنة." },
    ],
    faq: [
      { q: "What details help with a house-moving quote enquiry in Riyadh?", a: "Start with the origin and destination area, move date, home size or approximate inventory, packing needs, fragile or oversized items, and access details such as stairs, lifts and parking restrictions. Exact addresses can be provided later if needed. ENVOD confirms the available provider, requested scope and responsibilities before booking.", qAr: "ما التفاصيل التي تساعد في استفسار عرض سعر نقل منزل في الرياض؟", aAr: "ابدأ بمنطقة المنشأ والوجهة وموعد الانتقال وحجم المنزل أو قائمة المنقولات التقريبية واحتياجات التغليف والقطع الحساسة أو كبيرة الحجم ومتطلبات الدخول مثل السلالم والمصعد والمواقف. ويمكن تقديم العناوين الدقيقة لاحقاً عند الحاجة. تؤكد إنفود مقدم الخدمة المتاح والنطاق المطلوب والمسؤوليات قبل الحجز." },
      { q: "Are packing, furniture dismantling or storage automatically included?", a: "No standard package is assumed. Mention any packing, dismantling or reassembly, fragile-item handling or storage request. Availability, price, terms and the responsible provider must be confirmed for the specific route before booking.", qAr: "هل يشمل النقل التغليف أو فك الأثاث أو التخزين تلقائياً؟", aAr: "لا يُفترض وجود باقة موحدة. اذكر أي طلب للتغليف أو فك الأثاث أو تركيبه أو مناولة القطع الحساسة أو التخزين. يجب تأكيد التوفر والسعر والشروط ومقدم الخدمة المسؤول للمسار المحدد قبل الحجز." },
      { q: "Can ENVOD arrange an international household move?", a: "Send the origin and destination countries and a brief inventory for review. Household-goods eligibility, customs documents, route coverage, insurance terms and provider responsibilities vary by shipment and must be confirmed before any booking.", qAr: "هل يمكن لإنفود تنسيق انتقال دولي للأمتعة المنزلية؟", aAr: "أرسل دولتي المنشأ والوجهة وقائمة مختصرة بالمنقولات للمراجعة. تختلف أهلية الأمتعة المنزلية والمستندات الجمركية وتغطية المسار وشروط التأمين ومسؤوليات مقدم الخدمة حسب الشحنة ويجب تأكيدها قبل أي حجز." },
      { q: "Does every Riyadh or Saudi route have the same moving service?", a: "No. Local, intercity and international requests are reviewed separately. Provider availability, transport, packing, access requirements, customs responsibilities and price depend on the route and requested scope; ENVOD confirms these details before booking.", qAr: "هل تتوفر خدمة النقل نفسها لكل مسارات الرياض أو السعودية؟", aAr: "لا. تتم مراجعة الطلبات المحلية وبين المدن والدولية كلٌّ على حدة. يعتمد توفر مقدم الخدمة والنقل والتغليف ومتطلبات الدخول ومسؤوليات الجمارك والسعر على المسار والنطاق المطلوب؛ وتؤكد إنفود هذه التفاصيل قبل الحجز." },
    ],
  },
  10: {
    id: 10, slug: "ecommerce-logistics",
    gradient: "linear-gradient(135deg,#0a0a28 0%,#12103a 50%,#060615 100%)",
    accentHex: "#3b82f6",
    industries: ["Online Retail","Fashion","Electronics","FMCG","Marketplace Sellers"],
    industriesAr: ["التجزئة الإلكترونية","الأزياء","الإلكترونيات","السلع الاستهلاكية","بائعو المنصات"],
    process: [
      { en: "Order Received", ar: "استلام الطلب" },
      { en: "Pick & Pack", ar: "تجميع وتغليف" },
      { en: "Dispatch", ar: "الإرسال" },
      { en: "Transit", ar: "العبور" },
      { en: "Last Mile", ar: "المرحلة الأخيرة" },
      { en: "Delivery", ar: "التسليم" },
    ],
    subServices: [
      { name: "Fulfillment facility enquiry", nameAr: "استفسار منشأة تجهيز الطلبات", desc: "Facility availability, inventory, order-handling scope, technology and delivery coverage must be checked for the project.", descAr: "يجب التحقق من توفر المنشأة والمخزون ونطاق معالجة الطلبات والتقنية وتغطية التوصيل للمشروع." },
      { name: "Last-Mile Delivery", nameAr: "توصيل المرحلة الأخيرة", desc: "Delivery coverage, operator, schedule and tracking features depend on the route and selected provider.", descAr: "تعتمد تغطية التوصيل والمشغّل والجدول وميزات التتبع على المسار ومقدم الخدمة المختار." },
      { name: "Same-Day Delivery", nameAr: "التوصيل في اليوم ذاته", desc: "Same-day delivery may be available on selected routes, subject to location, cut-off time, and capacity.", descAr: "قد يتوفر التوصيل في اليوم ذاته لبعض المسارات بحسب الموقع وموعد الطلب والسعة المتاحة." },
      { name: "Returns-processing enquiry", nameAr: "استفسار معالجة المرتجعات", desc: "Confirm reverse-logistics route, inspection, disposition and provider scope.", descAr: "أكّد مسار اللوجستيات العكسية والفحص والتصرف بالبضاعة ونطاق مقدم الخدمة." },
      { name: "Cash-on-delivery enquiry", nameAr: "استفسار الدفع عند الاستلام", desc: "Payment collection, reconciliation, settlement timing and operator capability require confirmation.", descAr: "يتطلب تحصيل المدفوعات ومطابقتها وموعد التسوية وقدرة المشغّل تأكيداً." },
      { name: "Cross-border e-commerce enquiry", nameAr: "استفسار تجارة إلكترونية عابرة للحدود", desc: "Route, carrier, destination duties, product eligibility and return responsibilities must be confirmed.", descAr: "يجب تأكيد المسار والناقل ورسوم الوجهة وأهلية المنتج ومسؤوليات الإرجاع." },
      { name: "Platform compatibility review", nameAr: "مراجعة توافق المنصة", desc: "Integration depends on the named platform, provider technology, permissions and agreed scope.", descAr: "يعتمد التكامل على المنصة المحددة وتقنية مقدم الخدمة والصلاحيات والنطاق المتفق عليه." },
      { name: "Inventory-management enquiry", nameAr: "استفسار إدارة المخزون", desc: "Facility, inventory accuracy, reporting frequency and data access must be agreed with the provider.", descAr: "يجب الاتفاق مع مقدم الخدمة على المنشأة ودقة المخزون وتواتر التقارير والوصول إلى البيانات." },
    ],
    whyEnvod: [
      { en: "Dispatch timing and order cut-offs are confirmed for the selected service and shipment", ar: "يتم تأكيد موعد الإرسال والوقت النهائي لقبول الطلب بحسب الخدمة والشحنة" },
      { en: "Platform and payment compatibility reviewed", ar: "مراجعة توافق المنصة والمدفوعات" },
      { en: "Provider, facility and service scope confirmed", ar: "تأكيد مقدم الخدمة والمنشأة ونطاق الخدمة" },
    ],
    faq: [
      { q: "Can you integrate with my online store?", a: "Integration depends on the provider's current platform support, permissions and technical scope. Share the platform and required workflow for review; no connection or automated order handling is assumed.", qAr: "هل يمكن التكامل مع متجري الإلكتروني؟", aAr: "يعتمد التكامل على دعم مقدم الخدمة الحالي للمنصة والصلاحيات والنطاق التقني. أرسل اسم المنصة وسير العمل المطلوب للمراجعة؛ ولا يُفترض توفر اتصال أو معالجة آلية للطلبات." },
    ],
  },
  11: {
    id: 11, slug: "exhibition-logistics",
    pillar: EXHIBITION_PILLAR,
    gradient: "linear-gradient(135deg,#1a0508 0%,#2d080e 50%,#0e0304 100%)",
    accentHex: "#ef4444",
    industries: ["Technology","Construction","Healthcare","Energy","Defense","Food & Agriculture"],
    industriesAr: ["التكنولوجيا","البناء","الرعاية الصحية","الطاقة","الدفاع","الغذاء والزراعة"],
    process: [
      { en: "Consultation", ar: "الاستشارة" },
      { en: "Planning", ar: "التخطيط" },
      { en: "Documentation", ar: "التوثيق" },
      { en: "Transportation", ar: "النقل" },
      { en: "Venue Delivery Planning", ar: "تخطيط التسليم إلى الموقع" },
      { en: "Venue Support Coordination", ar: "تنسيق دعم الموقع" },
      { en: "Return Logistics", ar: "اللوجستيات العكسية" },
    ],
    subServices: [
      { name: "ATA Carnet Coordination", nameAr: "تنسيق كارنيه ATA", desc: "Coordinate shipment information and documents with the authorized issuing association; issuance and acceptance are not controlled by the freight forwarder.", descAr: "تنسيق معلومات الشحنة ومستنداتها مع جهة الإصدار المخوّلة؛ ولا يتحكم وكيل الشحن في الإصدار أو القبول." },
      { name: "ATA Carnet Documentation Coordination", nameAr: "تنسيق مستندات كارنيه ATA", desc: "Documentation and application-step coordination with the authorized issuing association; issuance and acceptance remain with the relevant authorities.", descAr: "تنسيق المستندات وخطوات الطلب مع جهة الإصدار المخوّلة، بينما يبقى الإصدار والقبول من اختصاص الجهات المعنية." },
      { name: "Exhibition Cargo Handling", nameAr: "مناولة شحن المعارض", desc: "Handling requirements, appointed contractors and cargo acceptance are confirmed with the venue and organizer.", descAr: "يتم تأكيد متطلبات المناولة والمقاولين المعتمدين وقبول البضاعة مع الموقع والمنظّم." },
      { name: "Exhibition Booth Logistics", nameAr: "لوجستيات أجنحة المعارض", desc: "Plan transport and venue access for booth structures; lifting, installation and handling scope must be confirmed separately.", descAr: "تخطيط نقل هياكل الأجنحة ودخول الموقع؛ ويجب تأكيد نطاق الرفع والتركيب والمناولة بشكل منفصل." },
      { name: "Trade Show Logistics", nameAr: "لوجستيات معارض التجارة", desc: "Coordinate the proposed freight, documents, venue schedule and return plan for a trade-show shipment.", descAr: "تنسيق الشحن والمستندات وجدول الموقع وخطة العودة المقترحة لشحنة المعرض." },
      { name: "Event Equipment Transport", nameAr: "نقل معدات الفعاليات", desc: "Review equipment dimensions, weight, packing, routing and carrier acceptance before booking.", descAr: "مراجعة أبعاد المعدات ووزنها وتغليفها ومسارها وقبول الناقل قبل الحجز." },
      { name: "Temporary Import Documentation", nameAr: "وثائق الاستيراد المؤقت", desc: "Review temporary-admission documents and eligibility with the responsible association, operator and authorities.", descAr: "مراجعة مستندات الإدخال المؤقت والأهلية مع الجهة والناقل والسلطات المسؤولة." },
      { name: "Temporary Export Documentation", nameAr: "وثائق التصدير المؤقت", desc: "Check export and return-document requirements for the particular goods and destination.", descAr: "التحقق من متطلبات مستندات التصدير والعودة للبضائع والوجهة المعنيتين." },
      { name: "Venue Delivery Planning", nameAr: "تخطيط التسليم إلى الموقع", desc: "Delivery windows, access rules and appointed handling contractors are confirmed with the event organizer.", descAr: "يتم تأكيد نوافذ التسليم وقواعد الدخول ومقاولي المناولة المعتمدين مع منظّم الفعالية." },
      { name: "On-site Cargo Handling Coordination", nameAr: "تنسيق مناولة البضائع في الموقع", desc: "On-site work depends on venue rules, contractor appointment and a separately confirmed service scope.", descAr: "يعتمد العمل في الموقع على قواعد المكان وتعيين المقاول وتأكيد نطاق الخدمة بشكل منفصل." },
      { name: "Installation Support Coordination", nameAr: "تنسيق دعم التركيب", desc: "Installation responsibility and provider availability must be agreed with the organizer and venue.", descAr: "يجب الاتفاق على مسؤولية التركيب وتوفر مقدم الخدمة مع المنظّم والموقع." },
      { name: "Dismantling Support Coordination", nameAr: "تنسيق دعم التفكيك", desc: "Confirm dismantling rules, collection slot and return-shipment arrangements with the event team.", descAr: "تأكيد قواعد التفكيك وموعد الاستلام وترتيبات شحن العودة مع فريق الفعالية." },
      { name: "Customs Coordination", nameAr: "تنسيق الجمارك", desc: "Review the cargo-specific import, temporary-admission and re-export responsibilities; approvals remain with the authorities.", descAr: "مراجعة مسؤوليات الاستيراد والإدخال المؤقت وإعادة التصدير الخاصة بالبضاعة؛ وتبقى الموافقات لدى السلطات." },
      { name: "Return Shipment Planning", nameAr: "تخطيط شحنة العودة", desc: "Plan collection and return routing subject to cargo condition, documents, carrier acceptance and event deadlines.", descAr: "تخطيط الاستلام ومسار العودة وفق حالة البضاعة والمستندات وقبول الناقل ومواعيد الفعالية." },
      { name: "VIP Event Logistics Enquiry", nameAr: "استفسار لوجستيات الفعاليات الخاصة", desc: "Share security, access and handling requirements for review; availability and scope are not assumed.", descAr: "أرسل متطلبات الأمن والدخول والمناولة للمراجعة؛ ولا يُفترض توفر الخدمة أو نطاقها." },
    ],
    whyEnvod: [
      { en: "Event-specific freight and venue-access planning", ar: "تخطيط الشحن ودخول الموقع وفق متطلبات الفعالية" },
      { en: "ATA Carnet and temporary-import documentation coordination", ar: "تنسيق مستندات كارنيه ATA والإدخال المؤقت" },
      { en: "Organizer requirements checked for each exhibition", ar: "مراجعة متطلبات المنظّم لكل معرض" },
      { en: "On-site responsibilities and local providers confirmed with the event organizer", ar: "تأكيد مسؤوليات الموقع ومقدمي الخدمة المحليين مع منظّم الفعالية" },
    ],
    faq: [
      { q: "What is an ATA Carnet?", a: "An ATA Carnet is a customs document for eligible temporary movements under the ATA system. Saudi acceptance depends on the current permitted use and the shipment; official guidance identifies eligible goods for display or use at exhibitions, fairs, meetings and similar events. The issuing association and customs authorities determine eligibility and acceptance. ENVOD can coordinate shipment information and documents but does not issue or guarantee a Carnet.", qAr: "ما هو كارنيه ATA؟", aAr: "كارنيه ATA مستند جمركي لحركات مؤقتة مؤهلة ضمن نظام ATA. ويعتمد قبوله في السعودية على الاستخدام المسموح الحالي والشحنة؛ وتشير الإرشادات الرسمية إلى البضائع المؤهلة للعرض أو الاستخدام في المعارض والأسواق والاجتماعات والفعاليات المشابهة. وتحدد جهة الإصدار والسلطات الجمركية الأهلية والقبول. ويمكن لإنفود تنسيق معلومات الشحنة ومستنداتها لكنها لا تصدر الكارنيه ولا تضمن قبوله." },
      { q: "How far in advance should I plan exhibition logistics?", a: "Start when the organizer's schedule and shipment details are available. The required lead time depends on origin, routing, cargo, approvals, carrier capacity and venue deadlines; there is no universal booking window.", qAr: "متى ينبغي التخطيط للوجستيات المعرض؟", aAr: "ابدأ عند توفر جدول المنظّم وتفاصيل الشحنة. وتعتمد المهلة المطلوبة على المنشأ والمسار والبضاعة والموافقات وسعة الناقل ومواعيد الموقع؛ ولا توجد مهلة حجز موحدة." },
      { q: "Which Saudi exhibition venues can I enquire about?", a: "Enquiries may include venues such as RICEC, Riyadh Front, Jeddah Superdome, Jeddah Center for Forums & Events and Dhahran Expo. A venue listing is planning context only; access, appointed contractors, delivery windows and service availability must be confirmed for the event.", qAr: "ما مواقع المعارض السعودية التي يمكن الاستفسار عنها؟", aAr: "قد تشمل الاستفسارات مواقع مثل مركز الرياض الدولي للمؤتمرات والمعارض وواجهة الرياض وقبة جدة ومركز جدة للمنتديات والفعاليات وظهران إكسبو. ذكر الموقع لغرض التخطيط فقط؛ ويجب تأكيد الدخول والمقاولين المعتمدين ومواعيد التسليم وتوفر الخدمة للفعالية." },
      { q: "Can you coordinate exhibition shipments to Saudi Arabia?", a: "ENVOD can review exhibition shipment enquiries for Riyadh, Jeddah, Dammam and other Saudi destinations. Share the origin, venue, cargo list, packed dimensions and weight, event dates and preferred freight mode. The route, carrier, customs operator, local delivery and venue-access arrangements are confirmed for the shipment.", qAr: "هل يمكنكم تنسيق شحنات المعارض إلى السعودية؟", aAr: "يمكن لإنفود مراجعة استفسارات شحن المعارض إلى الرياض وجدة والدمام وغيرها من الوجهات السعودية. أرسل المنشأ والموقع وقائمة البضائع وأبعادها ووزنها بعد التغليف وتواريخ الفعالية ووسيلة الشحن المفضلة. ويُؤكد المسار والناقل ومشغّل الجمارك والتسليم المحلي وترتيبات دخول الموقع لكل شحنة." },
      { q: "What documents are typically requested for exhibition cargo to Saudi Arabia?", a: "A commercial invoice, packing list, transport document and itemized cargo or equipment list are useful starting points. Certificates of origin, attestations, permits and product documents depend on the goods, importer and route. For temporary admission, confirm whether an ATA Carnet or another procedure applies with the responsible operator and authorities.", qAr: "ما المستندات التي تُطلب عادةً لشحن المعارض إلى السعودية؟", aAr: "تُعد الفاتورة التجارية وقائمة التعبئة ومستند النقل وقائمة البضائع أو المعدات المفصلة نقطة بداية مفيدة. وتعتمد شهادات المنشأ والتصديقات والتصاريح ومستندات المنتج على البضاعة والمستورد والمسار. وللإدخال المؤقت، أكّد مع المشغّل والجهات المختصة ما إذا كان ينطبق كارنيه ATA أو إجراء آخر." },
      { q: "Can you arrange on-site setup or dismantling?", a: "Share the venue, stand, event dates and requested tasks. On-site work may require organizer approval or an appointed contractor; the responsible provider and scope must be confirmed before booking.", qAr: "هل يمكن ترتيب التركيب أو التفكيك في الموقع؟", aAr: "أرسل الموقع ورقم الجناح وتواريخ الفعالية والمهام المطلوبة. قد يتطلب العمل الميداني موافقة المنظّم أو مقاولاً معتمداً؛ ويجب تأكيد مقدم الخدمة والنطاق قبل الحجز." },
      { q: "Can you arrange temporary import without an ATA Carnet?", a: "Alternative temporary-import routes may be available when a Carnet is not used, but requirements, guarantees, and approval depend on the goods and responsible authorities. Share the origin, event purpose, and equipment list so the applicable route can be checked.", qAr: "هل يمكنكم ترتيب الاستيراد المؤقت دون كارنيه ATA؟", aAr: "قد تتاح مسارات أخرى للاستيراد المؤقت عند عدم استخدام كارنيه ATA، لكن المتطلبات والضمانات والموافقة تعتمد على نوع البضاعة والجهات المختصة. أرسل بلد المنشأ والغرض من الاستخدام وقائمة المعدات للتحقق من المسار المناسب." },
      { q: "What event information should I include in an enquiry?", a: "Include the event name, venue and city, move-in and move-out dates, cargo list, dimensions, weight, origin, temporary-import or return needs, and any on-site tasks. This helps review the requested scope; it does not imply an event appointment or past participation.", qAr: "ما معلومات الفعالية التي ينبغي تضمينها في الاستفسار؟", aAr: "أدرج اسم الفعالية والموقع والمدينة ومواعيد الإدخال والإخراج وقائمة البضائع والأبعاد والوزن والمنشأ واحتياجات الإدخال المؤقت أو الإعادة وأي مهام ميدانية. تساعد هذه المعلومات على مراجعة النطاق المطلوب؛ ولا تعني تعييناً للفعالية أو مشاركة سابقة." },
      { q: "Can you plan return shipping after the event?", a: "Return and re-export requirements can be reviewed with the event schedule, cargo list, documents and next destination. Carrier options, venue collection, customs responsibilities and availability must be confirmed for the specific shipment.", qAr: "هل يمكنكم تخطيط شحن العودة بعد الفعالية؟", aAr: "يمكن مراجعة متطلبات العودة وإعادة التصدير مع جدول الفعالية وقائمة البضائع والمستندات والوجهة التالية. ويجب تأكيد خيارات الناقل واستلام الموقع ومسؤوليات الجمارك والتوفر للشحنة المحددة." },
      { q: "How much does exhibition logistics cost?", a: "Cost depends on cargo volume and weight, transport mode, origin, event dates, and requested on-site support. Share your equipment list and event details to request a no-obligation quote.", qAr: "كم تكلفة لوجستيات المعارض؟", aAr: "تعتمد التكلفة على حجم الشحنة ووزنها ووسيلة النقل وبلد المنشأ وتواريخ الفعالية ومستوى الدعم الميداني المطلوب. أرسل قائمة المعدات وتفاصيل الفعالية لطلب عرض سعر دون التزام." },
      { q: "Should I use air or sea freight for exhibition cargo?", a: "Compare the cargo, origin, event deadline, dimensions, budget and carrier options. Air freight may suit tighter schedules when capacity and acceptance are available; sea freight may be considered for larger cargo when the schedule allows for port and inland handling. Transit times and delivery arrangements depend on the route and operators.", qAr: "هل أختار الشحن الجوي أم البحري لبضائع المعارض؟", aAr: "قارن بين نوع البضاعة والمنشأ وموعد الفعالية والأبعاد والميزانية وخيارات الناقل. قد يناسب الشحن الجوي الجداول الأضيق عند توفر السعة وقبول الناقل؛ وقد يُدرس الشحن البحري للبضائع الأكبر عندما يسمح الجدول بمناولة الميناء والنقل الداخلي. وتعتمد مدد العبور وترتيبات التسليم على المسار والمشغّلين." },
    ],
  },
  12: {
    id: 12, slug: "medical-pharma",
    gradient: "linear-gradient(135deg,#042020 0%,#063030 50%,#021010 100%)",
    accentHex: "#14b8a6",
    industries: ["Hospitals","Pharmacies","Biotech","Medical Devices","Clinical Trials"],
    industriesAr: ["المستشفيات","الصيدليات","التقنية الحيوية","الأجهزة الطبية","التجارب السريرية"],
    process: [
      { en: "Order Processing", ar: "معالجة الطلب" },
      { en: "Product handling requirements review", ar: "مراجعة متطلبات مناولة المنتج" },
      { en: "Temperature requirements review", ar: "مراجعة متطلبات الحرارة" },
      { en: "Authority-document review", ar: "مراجعة مستندات الجهات المختصة" },
      { en: "Cold Chain Transit", ar: "عبور السلسلة الباردة" },
      { en: "Delivery & Verification", ar: "التسليم والتحقق" },
    ],
    subServices: [
      { name: "Pharmaceutical temperature-control enquiry", nameAr: "استفسار نقل دوائي بدرجة حرارة مضبوطة", desc: "Product, route, temperature, monitoring and qualified-provider requirements must be verified before any arrangement is confirmed.", descAr: "يجب التحقق من المنتج والمسار والحرارة والمراقبة ومتطلبات مقدم الخدمة المؤهل قبل تأكيد أي ترتيب." },
      { name: "Refrigerated transport availability enquiry", nameAr: "استفسار توفر النقل المبرد", desc: "Vehicle authorization, validated conditions, carrier acceptance and route availability require shipment-specific confirmation.", descAr: "يتطلب ترخيص المركبة وظروف النقل المعتمدة وقبول الناقل وتوفر المسار تأكيداً خاصاً بالشحنة." },
      { name: "Temperature-monitoring requirements", nameAr: "متطلبات مراقبة الحرارة", desc: "Describe the required records, alerts and monitoring interval so available provider arrangements can be reviewed.", descAr: "اذكر السجلات والتنبيهات وفترة المراقبة المطلوبة لمراجعة ترتيبات مقدم الخدمة المتاحة." },
      { name: "Pharmaceutical import-document review", nameAr: "مراجعة مستندات استيراد الأدوية", desc: "Registration, import and clearance requirements are product-specific and determined by the responsible authorities and operators.", descAr: "تختلف متطلبات التسجيل والاستيراد والتخليص حسب المنتج وتحددها الجهات والمشغّلون المسؤولون." },
      { name: "Pharmaceutical cold-chain enquiry", nameAr: "استفسار سلسلة التبريد الدوائية", desc: "Any end-to-end temperature arrangement, custody handoff and supporting evidence must be confirmed before booking.", descAr: "يجب تأكيد أي ترتيب حراري من البداية للنهاية وتسليم العهدة والأدلة الداعمة قبل الحجز." },
      { name: "Climate-Controlled Warehousing Enquiry", nameAr: "استفسار تخزين بدرجات حرارة مضبوطة", desc: "Facility authorization, validated conditions, humidity range and capacity must be confirmed for the product.", descAr: "يجب تأكيد ترخيص المنشأة وظروف التخزين المعتمدة ونطاق الرطوبة والسعة للمنتج." },
      { name: "Healthcare Facility Delivery Enquiry", nameAr: "استفسار توصيل للمرافق الصحية", desc: "Route, receiving requirements, operator and delivery availability are checked per shipment.", descAr: "يتم التحقق من المسار ومتطلبات الاستلام والمشغّل وتوفر التسليم لكل شحنة." },
      { name: "Clinical Trial Logistics Enquiry", nameAr: "استفسار لوجستيات التجارب السريرية", desc: "Product handling, temperature, documentation, permits and qualified-provider requirements need review.", descAr: "تتطلب مناولة المنتج وحرارته ومستنداته وتصاريحه ومتطلبات مقدم الخدمة المؤهل مراجعة." },
      { name: "Medical Device Import Requirements", nameAr: "متطلبات استيراد الأجهزة الطبية", desc: "Registration and import requirements are product-specific and determined through the applicable regulatory process.", descAr: "تختلف متطلبات التسجيل والاستيراد حسب المنتج وتحددها الإجراءات التنظيمية المنطبقة." },
      { name: "Time-Critical Delivery Enquiry", nameAr: "استفسار توصيل حساس للوقت", desc: "Timing depends on route, operator capacity, cargo acceptance, documents and any required approvals.", descAr: "يعتمد التوقيت على المسار وسعة المشغّل وقبول البضاعة والمستندات وأي موافقات لازمة." },
    ],
    whyEnvod: [
      { en: "Product-specific temperature and documentation requirements reviewed", ar: "مراجعة متطلبات الحرارة والمستندات الخاصة بالمنتج" },
      { en: "Regulatory steps checked with the responsible authority", ar: "التحقق من الخطوات التنظيمية مع الجهة المسؤولة" },
      { en: "Equipment, monitoring and qualified-provider evidence confirmed before booking", ar: "تأكيد أدلة المعدات والمراقبة ومقدم الخدمة المؤهل قبل الحجز" },
    ],
    overview: [
      { en: "Medical and pharmaceutical logistics requires product-specific controls for transport, storage, documentation and regulatory approvals. Temperature limits, packaging, monitoring, route, facility and provider qualifications must be verified against the product and applicable rules before booking. ENVOD can review an enquiry and confirm what coordination scope is available; no GDP certification, validated equipment or SFDA approval is claimed here.", ar: "تتطلب لوجستيات الأدوية والمنتجات الطبية ضوابط خاصة بالمنتج للنقل والتخزين والمستندات والموافقات التنظيمية. يجب التحقق من حدود الحرارة والتغليف والمراقبة والمسار والمنشأة ومؤهلات مقدم الخدمة وفق المنتج والأنظمة المنطبقة قبل الحجز. يمكن لإنفود مراجعة الاستفسار وتأكيد نطاق التنسيق المتاح؛ ولا يدّعي هذا الموقع اعتماد GDP أو معدات معتمدة أو موافقة من هيئة الغذاء والدواء." },
      { en: "Share the product type, required temperature range, origin, destination, handling instructions and documents for review. Availability of a suitable carrier or facility, temperature monitoring, delivery route and regulatory support is confirmed per request.", ar: "أرسل نوع المنتج ونطاق الحرارة المطلوب والمنشأ والوجهة وتعليمات المناولة والمستندات للمراجعة. ويتم تأكيد توفر الناقل أو المنشأة المناسبة ومراقبة الحرارة ومسار التسليم والدعم التنظيمي لكل طلب." },
    ],
    faq: [
      { q: "Can you coordinate temperature-sensitive pharmaceutical cargo?", a: "Share the product, temperature range, route and required dates. Carrier, equipment, facility, monitoring and regulatory qualifications must be verified for the specific shipment before any service is confirmed.", qAr: "هل يمكنكم تنسيق شحنة دوائية حساسة للحرارة؟", aAr: "أرسل المنتج ونطاق الحرارة والمسار والتواريخ المطلوبة. يجب التحقق من مؤهلات الناقل والمعدات والمنشأة والمراقبة والمتطلبات التنظيمية للشحنة المحددة قبل تأكيد أي خدمة." },
      { q: "What does GDP require for pharmaceutical logistics?", a: "Good Distribution Practice requirements depend on the applicable rules and product. Ask the responsible regulator or qualified provider to confirm the required temperature controls, validation, records and monitoring; this page does not claim ENVOD certification.", qAr: "ما متطلبات GDP للوجستيات الدوائية؟", aAr: "تعتمد متطلبات ممارسات التوزيع الجيدة على الأنظمة المنطبقة والمنتج. اطلب من الجهة التنظيمية أو مقدم الخدمة المؤهل تأكيد ضوابط الحرارة والتحقق والسجلات والمراقبة المطلوبة؛ ولا يدّعي هذا الموقع اعتماد إنفود." },
      { q: "Can you help with pharmaceutical and medical-device import requirements?", a: "Requirements are specific to the product and intended use. Share the product details for a document-scope review; registration, approvals and clearance decisions belong to the responsible authorities and operators.", qAr: "هل يمكنكم المساعدة في متطلبات استيراد الأدوية والأجهزة الطبية؟", aAr: "تختلف المتطلبات حسب المنتج والاستخدام المقصود. أرسل تفاصيل المنتج لمراجعة نطاق المستندات؛ وتبقى قرارات التسجيل والموافقة والتخليص لدى السلطات والمشغّلين المسؤولين." },
    ],
  },
  13: {
    id: 13, slug: "food-fmcg",
    gradient: "linear-gradient(135deg,#041a04 0%,#072807 50%,#020e02 100%)",
    accentHex: "#22c55e",
    industries: ["Food Retail","Supermarkets","Restaurants","FMCG Brands","Agriculture"],
    industriesAr: ["تجزئة الغذاء","السوبرماركت","المطاعم","العلامات الاستهلاكية","الزراعة"],
    process: [
      { en: "Order", ar: "الطلب" },
      { en: "Product-document requirements review", ar: "مراجعة متطلبات مستندات المنتج" },
      { en: "Temperature requirements review", ar: "مراجعة متطلبات الحرارة" },
      { en: "Transport", ar: "النقل" },
      { en: "Distribution", ar: "التوزيع" },
    ],
    subServices: [
      { name: "Perishable-food transport enquiry", nameAr: "استفسار نقل الأغذية القابلة للتلف", desc: "Product temperature, packaging, route, carrier acceptance and monitoring arrangements must be confirmed per shipment.", descAr: "يجب تأكيد حرارة المنتج والتعبئة والمسار وقبول الناقل وترتيبات المراقبة لكل شحنة." },
      { name: "Refrigerated transport availability enquiry", nameAr: "استفسار توفر النقل المبرد", desc: "Vehicle type, operating temperature, cargo acceptance and route availability require confirmation.", descAr: "يتطلب نوع المركبة ودرجة التشغيل وقبول البضاعة وتوفر المسار تأكيداً." },
      { name: "Temperature-monitoring requirements", nameAr: "متطلبات مراقبة الحرارة", desc: "Share the required temperature records and monitoring interval for a provider-specific review.", descAr: "أرسل سجلات الحرارة وفترة المراقبة المطلوبة لمراجعتها مع مقدم الخدمة." },
      { name: "Fresh-food route enquiry", nameAr: "استفسار مسار الأغذية الطازجة", desc: "Transit and delivery timing depend on route, carrier capacity, handling requirements and any applicable approvals.", descAr: "يعتمد توقيت النقل والتسليم على المسار وسعة الناقل ومتطلبات المناولة وأي موافقات منطبقة." },
      { name: "Frozen-cargo requirements review", nameAr: "مراجعة متطلبات البضائع المجمدة", desc: "Confirm the cargo temperature range, equipment, storage and monitoring arrangements before booking.", descAr: "أكّد نطاق حرارة البضاعة والمعدات والتخزين وترتيبات المراقبة قبل الحجز." },
      { name: "Nutraceutical temperature enquiry", nameAr: "استفسار حرارة المكملات الغذائية", desc: "Handling, temperature and regulatory requirements depend on the product and destination.", descAr: "تعتمد متطلبات المناولة والحرارة والتنظيم على المنتج والوجهة." },
      { name: "Climate-Controlled Warehousing Enquiry", nameAr: "استفسار تخزين غذائي بدرجات حرارة مضبوطة", desc: "Confirm facility availability, temperature range, monitoring and cargo acceptance for the product.", descAr: "أكّد توفر المنشأة ونطاق الحرارة والمراقبة وقبول البضاعة للمنتج." },
      { name: "SFDA Food Requirements", nameAr: "متطلبات الغذاء لدى هيئة الغذاء والدواء", desc: "Review product-specific import documents and approvals with the responsible operator and authority.", descAr: "مراجعة مستندات وموافقات الاستيراد الخاصة بالمنتج مع المشغّل والجهة المسؤولة." },
      { name: "Halal Documentation Enquiry", nameAr: "استفسار مستندات الحلال", desc: "Check the applicable product and destination requirements; certification or approval is not provided by ENVOD.", descAr: "تحقق من متطلبات المنتج والوجهة المنطبقة؛ ولا تصدر إنفود شهادة أو موافقة." },
      { name: "Supermarket Distribution", nameAr: "توزيع للسوبرماركت", desc: "Scheduled direct delivery to retail outlets.", descAr: "توصيل مجدول مباشر إلى منافذ البيع." },
      { name: "Time-Critical Deliveries", nameAr: "توصيلات حرجة بالوقت", desc: "Express delivery options may be available for time-sensitive food cargo, subject to handling and route requirements.", descAr: "قد تتوفر خيارات توصيل سريع للشحنات الغذائية الحساسة للوقت وفقاً لمتطلبات المناولة والمسار." },
    ],
    whyEnvod: [
      { en: "Food-import documents and authority requirements reviewed per product", ar: "مراجعة مستندات استيراد الغذاء ومتطلبات الجهات لكل منتج" },
      { en: "Applicable halal documents confirmed with the responsible bodies", ar: "تأكيد مستندات الحلال المنطبقة مع الجهات المسؤولة" },
    ],
    faq: [
      { q: "Can you review halal and food-import document requirements?", a: "Requirements depend on the product, origin and destination. Share the product details and available documents; the relevant authorities and qualified operators determine certification, approval and clearance requirements.", qAr: "هل يمكن مراجعة متطلبات مستندات الحلال واستيراد الغذاء؟", aAr: "تعتمد المتطلبات على المنتج والمنشأ والوجهة. أرسل تفاصيل المنتج والمستندات المتوفرة؛ وتحدد الجهات المختصة والمشغّلون المؤهلون متطلبات الشهادة والموافقة والتخليص." },
    ],
  },
  14: {
    id: 14, slug: "pet-animal-import",
    gradient: "linear-gradient(135deg,#041520 0%,#082030 50%,#020c10 100%)",
    accentHex: "#06b6d4",
    industries: ["Pet Owners","Veterinary Clinics","Breeders","Zoos & Wildlife","Agriculture"],
    industriesAr: ["أصحاب الحيوانات الأليفة","العيادات البيطرية","المربون","حدائق الحيوان","الزراعة"],
    process: [
      { en: "Vet Documentation", ar: "الوثائق البيطرية" },
      { en: "Health Certification", ar: "شهادة الصحة" },
      { en: "Export Clearance", ar: "تخليص التصدير" },
      { en: "Transport", ar: "النقل" },
      { en: "SFDA Clearance", ar: "تخليص SFDA" },
      { en: "Quarantine", ar: "الحجر الصحي" },
      { en: "Delivery", ar: "التسليم" },
    ],
    subServices: [
      { name: "Pet import requirements enquiry", nameAr: "استفسار متطلبات استيراد الحيوانات الأليفة", desc: "Permit, health-document, microchip, vaccination, carrier and route requirements must be confirmed with the responsible authorities and provider.", descAr: "يجب تأكيد متطلبات التصريح والوثائق الصحية والرقاقة والتطعيم والناقل والمسار مع الجهات ومقدم الخدمة المسؤول." },
      { name: "Live-animal transport enquiry", nameAr: "استفسار نقل الحيوانات الحية", desc: "Species, welfare, container, airline or road-carrier acceptance and applicable transport rules require specific review.", descAr: "يتطلب النوع ورفاه الحيوان والحاوية وقبول الناقل الجوي أو البري وقواعد النقل المنطبقة مراجعة خاصة." },
      { name: "Quarantine and authority requirements review", nameAr: "مراجعة متطلبات الحجر والجهات المختصة", desc: "Facility, permit, inspection and availability requirements are confirmed with the relevant authority and operator.", descAr: "يتم تأكيد متطلبات المنشأة والتصريح والفحص والتوفر مع الجهة والمشغّل المعنيين." },
      { name: "Veterinary Import Documentation", nameAr: "وثائق الاستيراد البيطري", desc: "Health certificates, microchip records, vaccination proofs.", descAr: "شهادات صحة وسجلات الرقاقة الإلكترونية وإثباتات التطعيم." },
      { name: "GCC Animal Movement", nameAr: "تنقل الحيوانات الخليجية", desc: "Cross-border transport of animals within the GCC.", descAr: "نقل عابر للحدود للحيوانات داخل منطقة الخليج." },
      { name: "Wildlife import requirements enquiry", nameAr: "استفسار متطلبات استيراد الحياة البرية", desc: "Species, CITES status, permits, carrier acceptance and destination rules must be confirmed before any shipment is considered.", descAr: "يجب تأكيد النوع وحالة CITES والتصاريح وقبول الناقل وقواعد الوجهة قبل النظر في أي شحنة." },
      { name: "Export of Livestock", nameAr: "تصدير الماشية", desc: "Managed export of livestock with all veterinary paperwork.", descAr: "تصدير مُدار للماشية مع جميع الوثائق البيطرية." },
    ],
    whyEnvod: [
      { en: "Species-specific import rules and documents reviewed", ar: "مراجعة قواعد ووثائق الاستيراد حسب النوع" },
      { en: "Carrier acceptance and welfare requirements confirmed", ar: "تأكيد قبول الناقل ومتطلبات رفاه الحيوان" },
      { en: "Permits, inspections and quarantine arrangements checked", ar: "التحقق من التصاريح والفحوص وترتيبات الحجر" },
    ],
    faq: [
      { q: "What should I check before importing a pet into Saudi Arabia?", a: "Confirm current permits, health certificates, microchip and vaccination rules, carrier acceptance, route and any inspection or quarantine requirements with the responsible authorities and transport provider before booking.", qAr: "ما الذي ينبغي التحقق منه قبل استيراد حيوان أليف إلى السعودية؟", aAr: "أكّد التصاريح الحالية والشهادات الصحية وقواعد الرقاقة والتطعيم وقبول الناقل والمسار وأي متطلبات للفحص أو الحجر مع الجهات ومقدم النقل المسؤول قبل الحجز." },
    ],
  },
  15: {
    id: 15, slug: "breakbulk-shipping",
    gradient: "linear-gradient(135deg,#1a0c04 0%,#2a1608 50%,#0e0804 100%)",
    accentHex: "#b45309",
    industries: ["Construction","Steel & Metals","Energy","Shipping","Ports"],
    industriesAr: ["البناء","الحديد والمعادن","الطاقة","الشحن","الموانئ"],
    process: [
      { en: "Cargo Assessment", ar: "تقييم البضائع" },
      { en: "Port Selection", ar: "اختيار الميناء" },
      { en: "Stowage Planning", ar: "تخطيط الرص" },
      { en: "Loading", ar: "التحميل" },
      { en: "Sea Transit", ar: "العبور البحري" },
      { en: "Port Discharge", ar: "التفريغ" },
      { en: "Delivery", ar: "التسليم" },
    ],
    subServices: [
      { name: "Heavy Machinery Shipping", nameAr: "شحن الآلات الثقيلة", desc: "Non-containerized transport for industrial machinery.", descAr: "نقل آلات صناعية غير حاوية." },
      { name: "Steel Structures Transport", nameAr: "نقل الهياكل الفولاذية", desc: "Port-to-port breakbulk for steel beams and frames.", descAr: "بريك بالك من ميناء لميناء للعوارض والأطر الفولاذية." },
      { name: "Construction Materials", nameAr: "مواد البناء", desc: "Bulk and breakbulk for large construction material shipments.", descAr: "سائبة وبريك بالك لشحنات مواد البناء الكبيرة." },
      { name: "Industrial Equipment", nameAr: "المعدات الصناعية", desc: "Specialist handling for heavy industrial cargo.", descAr: "مناولة متخصصة للشحن الصناعي الثقيل." },
      { name: "Port-to-port breakbulk enquiry", nameAr: "استفسار بريك بالك من ميناء إلى ميناء", desc: "Origin, destination, port operator, carrier, cargo dimensions and handling scope are confirmed per request.", descAr: "يتم تأكيد المنشأ والوجهة ومشغّل الميناء والناقل وأبعاد البضاعة ونطاق المناولة لكل طلب." },
      { name: "Cargo lashing requirements review", nameAr: "مراجعة متطلبات ربط البضائع", desc: "Lashing plan, method statement and qualified-provider responsibilities must be agreed for the cargo.", descAr: "يجب الاتفاق على خطة الربط وطريقة العمل ومسؤوليات مقدم الخدمة المؤهل وفق البضاعة." },
      { name: "Loading and discharge enquiry", nameAr: "استفسار التحميل والتفريغ", desc: "Terminal availability, cargo acceptance, equipment, stevedoring scope and port rules require confirmation.", descAr: "يتطلب توفر المحطة وقبول البضاعة والمعدات ونطاق الشحن والتفريغ وقواعد الميناء تأكيداً." },
      { name: "Port-agent requirements enquiry", nameAr: "استفسار متطلبات وكيل الميناء", desc: "Port representation and vessel-call responsibilities must be confirmed with the appointed local agent.", descAr: "يجب تأكيد التمثيل في الميناء ومسؤوليات زيارة السفينة مع الوكيل المحلي المعيّن." },
      { name: "Timber & Lumber Shipping", nameAr: "شحن الأخشاب", desc: "Specialized breakbulk for timber and lumber cargoes.", descAr: "بريك بالك متخصص لشحنات الأخشاب والمواد الخشبية." },
      { name: "Abnormal Load Transport", nameAr: "نقل الأحمال غير الاعتيادية", desc: "Permit-managed road transport for abnormal breakbulk loads.", descAr: "نقل بري بتصاريح للأحمال غير الاعتيادية في بريك بالك." },
    ],
    whyEnvod: [
      { en: "Port and carrier options reviewed for each route", ar: "مراجعة خيارات الموانئ والناقلين لكل مسار" },
      { en: "Cargo dimensions and handling requirements assessed", ar: "تقييم أبعاد البضاعة ومتطلبات المناولة" },
      { en: "Document and operator responsibilities confirmed", ar: "تأكيد مسؤوليات المستندات والمشغّلين" },
    ],
    overview: [
      { en: "Breakbulk shipping describes cargo loaded individually rather than in standard containers. It may suit machinery, steel structures, timber and other pieces whose dimensions or weight do not fit a standard container. The appropriate vessel, port, terminal, handling method and carrier acceptance depend on the shipment.", ar: "يصف الشحن المنفصل (بريك بالك) البضائع التي تُحمّل بشكل فردي بدلاً من الحاويات القياسية. وقد يناسب الآلات والهياكل الفولاذية والأخشاب وغيرها من القطع التي لا تتسع لها الحاوية القياسية بسبب أبعادها أو وزنها. وتعتمد السفينة والميناء والمحطة وطريقة المناولة وقبول الناقل على الشحنة." },
      { en: "For an enquiry, provide piece count, dimensions, weight, cargo type, origin and destination, loading and discharge requirements, and any delivery date. Port, carrier, terminal and qualified handling-provider availability must be confirmed before a booking.", ar: "للاستفسار، أرسل عدد القطع والأبعاد والوزن ونوع البضاعة والمنشأ والوجهة ومتطلبات التحميل والتفريغ وتاريخ التسليم المطلوب. يجب تأكيد توفر الميناء والناقل والمحطة ومقدم المناولة المؤهل قبل الحجز." },
    ],
    faq: [
      { q: "What is breakbulk shipping?", a: "Breakbulk shipping refers to cargo that must be loaded individually — not in containers. It includes machinery, steel, timber, and other non-standard items too large for standard containers.", qAr: "ما هو الشحن المنفصل (بريك بالك)؟", aAr: "يشير إلى البضائع التي يجب تحميلها بشكل فردي — غير حاوية. يشمل الآلات والحديد والخشب والعناصر غير القياسية." },
      { q: "When might breakbulk be considered instead of containers?", a: "It may be considered when cargo dimensions, weight or shape make standard container loading unsuitable. Compare available equipment, vessel and port options, handling requirements, cost and schedule with a qualified operator for the specific movement.", qAr: "متى يمكن التفكير في بريك بالك بدلاً من الحاويات؟", aAr: "قد يُنظر فيه عندما تجعل أبعاد البضاعة أو وزنها أو شكلها التحميل في حاوية قياسية غير مناسب. قارن خيارات المعدات والسفن والموانئ ومتطلبات المناولة والتكلفة والجدول مع مشغّل مؤهل للحركة المحددة." },
      { q: "Which ports can be considered for a breakbulk enquiry?", a: "Share the origin and destination ports, cargo details and requested dates. Port and terminal capability, carrier acceptance, local handling providers and customs responsibilities must be verified for the route; mentioning a port does not imply ENVOD has a branch or direct terminal access there.", qAr: "ما الموانئ التي يمكن بحثها لاستفسار بريك بالك؟", aAr: "أرسل موانئ المنشأ والوجهة وتفاصيل البضاعة والتواريخ المطلوبة. يجب التحقق من قدرة الميناء والمحطة وقبول الناقل ومقدمي المناولة المحليين ومسؤوليات الجمارك للمسار؛ ولا يعني ذكر ميناء وجود فرع لإنفود أو وصول مباشر إلى محطته." },
    ],
  },
  16: {
    id: 16, slug: "dangerous-goods",
    gradient: "linear-gradient(135deg,#1a1004 0%,#2a1a04 50%,#100c02 100%)",
    accentHex: "#eab308",
    industries: ["Oil & Gas","Chemicals","Mining","Pharmaceuticals","Military"],
    industriesAr: ["النفط والغاز","المواد الكيميائية","التعدين","الأدوية","الجيش"],
    process: [
      { en: "DG Classification", ar: "تصنيف البضائع الخطرة" },
      { en: "Packaging", ar: "التغليف" },
      { en: "Documentation", ar: "التوثيق" },
      { en: "Carrier Approval", ar: "موافقة الناقل" },
      { en: "Transport", ar: "النقل" },
      { en: "Customs", ar: "الجمارك" },
      { en: "Safe Delivery", ar: "التسليم الآمن" },
    ],
    subServices: [
      { name: "DG Air Freight Enquiry", nameAr: "استفسار شحن جوي للبضائع الخطرة", desc: "Classification, packing, declarations, operator qualifications and airline acceptance must be confirmed.", descAr: "يجب تأكيد التصنيف والتعبئة والإقرارات ومؤهلات المشغّل وقبول شركة الطيران." },
      { name: "DG Sea Freight Enquiry", nameAr: "استفسار شحن بحري للبضائع الخطرة", desc: "Confirm the current IMDG requirements, carrier acceptance, packing and route for the cargo.", descAr: "أكّد متطلبات IMDG الحالية وقبول الناقل والتعبئة والمسار للبضاعة." },
      { name: "DG Road Transport Enquiry", nameAr: "استفسار نقل بري للبضائع الخطرة", desc: "Route, vehicle, applicable rules, documents and qualified-operator availability are checked per request.", descAr: "يتم التحقق من المسار والمركبة والأنظمة المنطبقة والمستندات وتوفر المشغّل المؤهل لكل طلب." },
      { name: "Chemical Cargo Enquiry", nameAr: "استفسار شحن المواد الكيميائية", desc: "Review the safety data, classification, packaging, temperature and applicable permits before discussing options.", descAr: "راجع بيانات السلامة والتصنيف والتعبئة والحرارة والتصاريح المنطبقة قبل مناقشة الخيارات." },
      { name: "DG Packaging & Labeling Enquiry", nameAr: "استفسار تغليف وتسمية البضائع الخطرة", desc: "Packaging approval, marking and provider qualifications must be verified for the substance and transport mode.", descAr: "يجب التحقق من اعتماد التعبئة والعلامات ومؤهلات مقدم الخدمة للمادة ووسيلة النقل." },
      { name: "Explosives Transport Enquiry", nameAr: "استفسار نقل المتفجرات", desc: "Do not assume acceptance; licensing, permits, route and specialist operator availability require authority review.", descAr: "لا تفترض قبول الشحنة؛ إذ تتطلب التراخيص والتصاريح والمسار وتوفر المشغّل المتخصص مراجعة الجهات المختصة." },
      { name: "Radioactive Materials Enquiry", nameAr: "استفسار المواد المشعة", desc: "Acceptance, packaging, transport rules, permits and qualified-provider evidence require shipment-specific review.", descAr: "يتطلب القبول والتعبئة وقواعد النقل والتصاريح وأدلة مقدم الخدمة المؤهل مراجعة خاصة بالشحنة." },
      { name: "DG Customs Requirements Review", nameAr: "مراجعة متطلبات جمارك البضائع الخطرة", desc: "Commodity, declaration and permit requirements are confirmed with the responsible customs operator and authorities.", descAr: "تُؤكد متطلبات السلعة والإقرار والتصاريح مع مشغّل الجمارك والسلطات المسؤولة." },
    ],
    whyEnvod: [
      { en: "Cargo classification and acceptance reviewed before any booking", ar: "مراجعة تصنيف البضاعة وقبولها قبل أي حجز" },
      { en: "Applicable mode-specific rules and permits checked with qualified operators", ar: "التحقق من قواعد وسيلة النقل والتصاريح مع المشغّلين المؤهلين" },
      { en: "Responsibilities for declarations, packaging and labels agreed per shipment", ar: "الاتفاق على مسؤوليات الإقرارات والتعبئة والعلامات لكل شحنة" },
    ],
    faq: [
      { q: "Can every class of dangerous goods be shipped?", a: "Acceptance depends on the UN classification, substance, packaging, documents, route, carrier rules, permits and qualified-operator availability. Share the safety data sheet and shipment details for an initial requirements review; no class acceptance or ENVOD license is assumed.", qAr: "هل يمكن شحن جميع فئات البضائع الخطرة؟", aAr: "يعتمد القبول على تصنيف الأمم المتحدة والمادة والتعبئة والمستندات والمسار وقواعد الناقل والتصاريح وتوفر المشغّل المؤهل. أرسل نشرة بيانات السلامة وتفاصيل الشحنة لمراجعة أولية للمتطلبات؛ ولا يُفترض قبول أي فئة أو وجود ترخيص لدى إنفود." },
    ],
  },
  17: {
    id: 17, slug: "oog-cargo",
    gradient: "linear-gradient(135deg,#0a0a20 0%,#141430 50%,#050510 100%)",
    accentHex: "#818cf8",
    industries: ["Oil & Gas","Power","Construction","Mining","Wind Energy"],
    industriesAr: ["النفط والغاز","الطاقة","البناء","التعدين","طاقة الرياح"],
    process: [
      { en: "Cargo Measurement", ar: "قياس البضائع" },
      { en: "Feasibility Study", ar: "دراسة الجدوى" },
      { en: "Permits", ar: "التصاريح" },
      { en: "Route Planning", ar: "تخطيط المسار" },
      { en: "Transport and equipment review", ar: "مراجعة النقل والمعدات" },
      { en: "Lifting-provider requirements", ar: "متطلبات مقدم خدمات الرفع" },
      { en: "Site-access requirements", ar: "متطلبات دخول الموقع" },
    ],
    subServices: [
      { name: "OOG sea-freight enquiry", nameAr: "استفسار شحن بحري خارج القياس", desc: "Flat-rack, open-top, vessel, port and carrier options depend on cargo measurements and route acceptance.", descAr: "تعتمد خيارات الرف المسطح والحاوية المفتوحة والسفينة والميناء والناقل على قياسات البضاعة وقبول المسار." },
      { name: "OOG road-movement enquiry", nameAr: "استفسار نقل بري خارج القياس", desc: "Route survey, permits, escorts, vehicle, schedule and qualified-provider scope require confirmation.", descAr: "يتطلب مسح المسار والتصاريح والمرافقة والمركبة والجدول ونطاق مقدم الخدمة المؤهل تأكيداً." },
      { name: "Flat-Rack Container Shipping", nameAr: "شحن على حاوية ذات رفوف مسطحة", desc: "Flat-rack sea shipping for machinery and structures.", descAr: "شحن بحري على رفوف مسطحة للآلات والهياكل." },
      { name: "Open-Top Container Shipping", nameAr: "شحن في حاوية مفتوحة الأعلى", desc: "Open-top containers for tall or crane-loaded cargo.", descAr: "حاويات مفتوحة الأعلى للبضائع الطويلة المُحمَّلة برافعة." },
      { name: "Wind-blade movement enquiry", nameAr: "استفسار نقل شفرات الرياح", desc: "Dimensions, route geometry, lifting points, permits and provider capacity must be assessed for the individual movement.", descAr: "يجب تقييم الأبعاد وهندسة المسار ونقاط الرفع والتصاريح وسعة مقدم الخدمة للحركة المحددة." },
      { name: "Transformer movement enquiry", nameAr: "استفسار نقل المحولات", desc: "Weight, dimensions, route, permits, lifting requirements and operator availability need shipment-specific review.", descAr: "يتطلب الوزن والأبعاد والمسار والتصاريح ومتطلبات الرفع وتوفر المشغّل مراجعة خاصة بالشحنة." },
      { name: "SPMT availability enquiry", nameAr: "استفسار توفر مركبات SPMT", desc: "Equipment availability, engineering design, route and qualified-provider credentials must be confirmed before booking.", descAr: "يجب تأكيد توفر المعدات والتصميم الهندسي والمسار ومؤهلات مقدم الخدمة قبل الحجز." },
      { name: "Crane-provider requirements review", nameAr: "مراجعة متطلبات مقدم الرافعة", desc: "Lift plan, site conditions, equipment capacity and contractor authorization require independent confirmation.", descAr: "تتطلب خطة الرفع وظروف الموقع وسعة المعدات وترخيص المقاول تأكيداً مستقلاً." },
    ],
    whyEnvod: [
      { en: "Cargo dimensions and route constraints reviewed", ar: "مراجعة أبعاد البضاعة وقيود المسار" },
      { en: "Permit and escort requirements checked with the responsible parties", ar: "التحقق من متطلبات التصاريح والمرافقة مع الجهات المسؤولة" },
      { en: "Equipment and qualified-provider availability confirmed per movement", ar: "تأكيد توفر المعدات ومقدم الخدمة المؤهل لكل حركة" },
    ],
    overview: [
      { en: "Out-of-gauge (OOG) cargo exceeds standard container dimensions. Depending on the cargo and route, possible equipment may include flat-rack or open-top containers, specialized road trailers or lifting equipment. Carrier and operator acceptance, permits, engineering requirements and availability must be checked for the specific shipment.", ar: "تتجاوز البضائع خارج القياس (OOG) أبعاد الحاويات القياسية. وقد تشمل المعدات المحتملة، بحسب البضاعة والمسار، حاويات الرف المسطح أو المفتوحة أو مقطورات برية متخصصة أو معدات رفع. يجب التحقق من قبول الناقل والمشغّل والتصاريح والمتطلبات الهندسية والتوفر للشحنة المحددة." },
      { en: "For an enquiry, provide cargo weight and dimensions, centre of gravity if known, origin, destination, loading and delivery sites, target dates and any site restrictions. A qualified provider must confirm the engineering, equipment and permit plan before any booking.", ar: "للاستفسار، أرسل وزن البضاعة وأبعادها ومركز الثقل إن عُرف والمنشأ والوجهة ومواقع التحميل والتسليم والتواريخ المطلوبة وأي قيود للموقع. يجب أن يؤكد مقدم خدمة مؤهل الخطة الهندسية والمعدات والتصاريح قبل أي حجز." },
    ],
    faq: [
      { q: "What is OOG (Out-of-Gauge) cargo?", a: "OOG refers to cargo that exceeds the standard dimensions of a 20ft or 40ft shipping container. This includes large machinery, turbines, transformers, and other industrial equipment requiring specialized handling.", qAr: "ما هي البضائع خارج القياس (OOG)؟", aAr: "OOG تشير إلى البضائع التي تتجاوز الأبعاد القياسية لحاوية 20 أو 40 قدماً." },
      { q: "What is the difference between OOG and project cargo?", a: "Out-of-gauge describes cargo that exceeds container dimensions, while project cargo is a broader category of oversized, heavy, or complex shipments. Many OOG shipments are part of larger industrial projects and are handled with the same engineering-led planning.", qAr: "ما الفرق بين البضائع خارج القياس وبضائع المشاريع؟", aAr: "يصف مصطلح «خارج القياس» البضائع التي تتجاوز أبعاد الحاوية، بينما بضائع المشاريع فئة أوسع من الشحنات الضخمة أو الثقيلة أو المعقّدة. والعديد من شحنات خارج القياس جزء من مشاريع صناعية أكبر وتُعالَج بالتخطيط الهندسي نفسه." },
      { q: "How might out-of-gauge cargo move by sea?", a: "A flat-rack, open-top or other arrangement may be considered after checking dimensions, weight, lashing, vessel capability, carrier acceptance and port handling. Suitability and availability are shipment-specific; a qualified operator must approve the final plan.", qAr: "كيف يمكن نقل البضائع خارج القياس بحراً؟", aAr: "قد يُنظر في حاوية ذات رف مسطح أو مفتوحة أو ترتيب آخر بعد التحقق من الأبعاد والوزن والربط وقدرة السفينة وقبول الناقل ومناولة الميناء. وتختلف الملاءمة والتوفر حسب الشحنة؛ ويجب أن يعتمد مشغّل مؤهل الخطة النهائية." },
    ],
  },
  18: {
    id: 18, slug: "roro-shipping",
    gradient: "linear-gradient(135deg,#0a1420 0%,#0e1e30 50%,#060e18 100%)",
    accentHex: "#38bdf8",
    industries: ["Automotive","Heavy Equipment","Construction","Agriculture","Government Fleet"],
    industriesAr: ["السيارات","المعدات الثقيلة","البناء","الزراعة","أساطيل حكومية"],
    process: [
      { en: "Vehicle and cargo details", ar: "تفاصيل المركبة والبضاعة" },
      { en: "Route and carrier options", ar: "خيارات المسار والناقل" },
      { en: "Port and vessel availability", ar: "توفر الميناء والسفينة" },
      { en: "Import-document requirements", ar: "متطلبات مستندات الاستيراد" },
      { en: "Customs and operator responsibilities", ar: "مسؤوليات الجمارك والمشغّل" },
      { en: "Collection or delivery planning", ar: "تخطيط الاستلام أو التسليم" },
    ],
    subServices: [
      { name: "Private vehicle RoRo enquiry", nameAr: "استفسار رورو للسيارات الخاصة", desc: "Vehicle eligibility, route, carrier acceptance, port requirements and import documents must be confirmed.", descAr: "يجب تأكيد أهلية المركبة والمسار وقبول الناقل ومتطلبات الميناء ومستندات الاستيراد." },
      { name: "Commercial vehicle RoRo enquiry", nameAr: "استفسار رورو للمركبات التجارية", desc: "Share vehicle count, dimensions, weight, origin and destination to review route and vessel options.", descAr: "أرسل عدد المركبات والأبعاد والوزن والمنشأ والوجهة لمراجعة خيارات المسار والسفينة." },
      { name: "Heavy-equipment RoRo enquiry", nameAr: "استفسار رورو للمعدات الثقيلة", desc: "Cargo dimensions, operating condition, carrier acceptance and port handling requirements need review.", descAr: "تتطلب أبعاد البضاعة وحالتها التشغيلية وقبول الناقل ومتطلبات مناولة الميناء مراجعة." },
      { name: "Agricultural machinery RoRo enquiry", nameAr: "استفسار رورو للآلات الزراعية", desc: "Confirm cargo type, measurements, route and applicable import requirements with the responsible operator.", descAr: "أكّد نوع البضاعة وقياساتها والمسار ومتطلبات الاستيراد المنطبقة مع المشغّل المسؤول." },
      { name: "Bus and truck RoRo enquiry", nameAr: "استفسار رورو للحافلات والشاحنات", desc: "Vehicle dimensions, carrier acceptance, vessel availability and destination requirements are checked per shipment.", descAr: "يتم التحقق من أبعاد المركبة وقبول الناقل وتوفر السفينة ومتطلبات الوجهة لكل شحنة." },
      { name: "Motorcycle RoRo enquiry", nameAr: "استفسار رورو للدراجات النارية", desc: "Review packing, securing, carrier acceptance and destination documents for the requested route.", descAr: "راجع التعبئة والتثبيت وقبول الناقل ومستندات الوجهة للمسار المطلوب." },
      { name: "RoRo import-document review", nameAr: "مراجعة مستندات استيراد رورو", desc: "The responsible customs operator and authorities determine the applicable import and clearance requirements.", descAr: "يحدد مشغّل الجمارك والجهات المختصة متطلبات الاستيراد والتخليص المنطبقة." },
      { name: "RoRo export-document enquiry", nameAr: "استفسار مستندات تصدير رورو", desc: "Export documents, port handling and carrier responsibilities must be scoped and confirmed.", descAr: "يجب تحديد وتأكيد مستندات التصدير ومناولة الميناء ومسؤوليات الناقل." },
      { name: "Vehicle collection or delivery enquiry", nameAr: "استفسار استلام أو تسليم المركبة", desc: "Onward transport availability and delivery address requirements are checked for the route.", descAr: "يتم التحقق من توفر النقل اللاحق ومتطلبات عنوان التسليم للمسار." },
    ],
    whyEnvod: [
      { en: "Carrier, route and port options reviewed", ar: "مراجعة خيارات الناقل والمسار والميناء" },
      { en: "Vehicle documents and import requirements checked", ar: "التحقق من مستندات المركبة ومتطلبات الاستيراد" },
      { en: "Onward-transport scope confirmed separately", ar: "تأكيد نطاق النقل اللاحق بشكل منفصل" },
    ],
    faq: [
      { q: "Which vehicles may be eligible for RoRo?", a: "RoRo may be considered for some cars, trucks, buses and wheeled machinery. Vessel and carrier acceptance, dimensions, operating condition, route and destination rules determine eligibility; confirm with the operator before booking.", qAr: "ما المركبات التي قد تكون مؤهلة للشحن بالرورو؟", aAr: "قد يُنظر في شحن بعض السيارات والشاحنات والحافلات والآلات ذات العجلات. تحدد أهلية الشحنة موافقة السفينة والناقل والأبعاد والحالة التشغيلية والمسار وقواعد الوجهة؛ أكّد ذلك مع المشغّل قبل الحجز." },
    ],
  },
  19: {
    id: 19, slug: "ata-carnet",
    pillar: ATA_CARNET_PILLAR,
    gradient: "linear-gradient(135deg,#0a2342 0%,#3a1206 52%,#07101f 100%)",
    accentHex: "#f59e0b",
    industries: ["Exhibitions & Events","Broadcast & Media","Oil & Gas","Industrial Manufacturing","Professional Services"],
    industriesAr: ["المعارض والفعاليات","البث والإعلام","النفط والغاز","التصنيع الصناعي","الخدمات المهنية"],
    process: [
      { en: "Eligibility Review", ar: "مراجعة الأهلية" },
      { en: "General List & Values", ar: "القائمة العامة والقيم" },
      { en: "Issuing-Association Process", ar: "إجراءات جهة الإصدار" },
      { en: "Export Endorsement", ar: "التصديق عند التصدير" },
      { en: "Temporary Import", ar: "الاستيراد المؤقت" },
      { en: "Re-Export & Re-Import", ar: "إعادة التصدير والاستيراد" },
      { en: "Carnet Discharge", ar: "إبراء الكارنيه" },
    ],
    subServices: [
      { name: "ATA Carnet Application Coordination", nameAr: "تنسيق طلب كارنيه ATA", desc: "Application requirements coordinated with the authorized issuing association.", descAr: "تنسيق متطلبات الطلب مع جهة الإصدار المخوّلة." },
      { name: "Exhibition Goods Carnet", nameAr: "كارنيه بضائع المعارض", desc: "Carnets for stands, displays, samples and demo units at trade shows.", descAr: "كارنيهات للأجنحة والمعروضات والعينات ووحدات العرض في المعارض." },
      { name: "Professional Equipment Carnet Enquiry", nameAr: "استفسار كارنيه المعدات المهنية", desc: "International ATA use may cover professional equipment; confirm current Saudi acceptance and item eligibility with the issuing association and authorities.", descAr: "قد يشمل الاستخدام الدولي لكارنيه ATA المعدات المهنية؛ أكّد القبول الحالي في السعودية وأهلية الأصناف مع جهة الإصدار والسلطات." },
      { name: "Commercial Samples Carnet Enquiry", nameAr: "استفسار كارنيه العينات التجارية", desc: "Do not assume commercial-sample eligibility in Saudi Arabia; confirm the intended use, goods and current rules with the authorized association.", descAr: "لا تفترض أهلية العينات التجارية في السعودية؛ أكّد الغرض والبضاعة والأنظمة الحالية مع الجهة المخوّلة." },
      { name: "Customs Endorsement Handling", nameAr: "معالجة التصديق الجمركي", desc: "In-person endorsement at export, import, re-export and re-import.", descAr: "تصديق شخصي عند التصدير والاستيراد وإعادة التصدير وإعادة الاستيراد." },
      { name: "Carnet Discharge & Closure", nameAr: "إبراء وإغلاق الكارنيه", desc: "Track customs endorsements and re-export evidence for discharge review.", descAr: "متابعة التصديقات الجمركية وإثبات إعادة التصدير لمراجعة الإبراء." },
      { name: "Replacement & Extension Support", nameAr: "دعم الاستبدال والتمديد", desc: "Replacement Carnets and validity guidance when plans change.", descAr: "كارنيهات بديلة وإرشاد بشأن الصلاحية عند تغيّر الخطط." },
      { name: "Integrated Freight & Clearance", nameAr: "شحن وتخليص متكامل", desc: "Air, sea and road freight bundled with the Carnet and customs handling.", descAr: "شحن جوي وبحري وبري مدمج مع الكارنيه والمناولة الجمركية." },
    ],
    whyEnvod: [
      { en: "Document planning for time-critical exhibition cargo", ar: "تخطيط مستندات شحنات المعارض الحسّاسة للوقت" },
      { en: "One team for the document, the freight and customs endorsements", ar: "فريق واحد للمستند والشحن والتصديقات الجمركية" },
      { en: "Eligibility and current acceptance checked for each movement", ar: "التحقق من الأهلية والقبول الحالي لكل حركة" },
      { en: "Temporary-import requirements checked for each shipment", ar: "مراجعة متطلبات الإدخال المؤقت لكل شحنة" },
      { en: "Endorsement and re-export records tracked for discharge", ar: "متابعة التصديقات وسجلات إعادة التصدير للإبراء" },
    ],
    faq: [
      { q: "What is an ATA Carnet?", a: "An ATA Carnet is an international customs document used for eligible temporary movements of goods. Its validity, country acceptance, permitted use and guarantee conditions depend on the issuing terms and authorities. For Saudi Arabia, check the currently accepted purpose and goods before relying on a Carnet; it does not remove customs controls or other product approvals.", qAr: "ما هو كارنيه ATA؟", aAr: "كارنيه ATA مستند جمركي دولي يُستخدم للحركات المؤقتة المؤهلة للبضائع. وتعتمد صلاحيته وقبوله في البلدان والاستخدام المسموح به وشروط الضمان على شروط الإصدار والسلطات. تحقّق من الغرض والبضائع المقبولة حالياً في السعودية قبل الاعتماد على الكارنيه؛ فهو لا يلغي الرقابة الجمركية أو موافقات المنتجات الأخرى." },
      { q: "How quickly can ENVOD process an ATA Carnet?", a: "Timing depends on the issuing association, shipment eligibility, complete documents, any pre-approval and customs examination. Confirm the applicable process before shipping; ENVOD does not promise a fixed issuance or clearance time.", qAr: "ما مدى سرعة إنفود في معالجة كارنيه ATA؟", aAr: "تعتمد المدة على جهة الإصدار وأهلية الشحنة واكتمال المستندات وأي موافقة مسبقة والفحص الجمركي. أكّد الإجراء المطبق قبل الشحن؛ ولا تعد إنفود بمدة إصدار أو فسح ثابتة." },
      { q: "What goods can travel on an ATA Carnet?", a: "The international ATA system covers certain categories, but Saudi acceptance should not be inferred from global eligibility. Confirm the goods, intended use, destination, issuing terms and re-export deadline with the authorized association and customs authorities. Consumables, giveaways and goods left or sold at an event may require a different import procedure.", qAr: "ما البضائع التي يمكن نقلها بكارنيه ATA؟", aAr: "يشمل نظام ATA الدولي فئات معينة، لكن لا ينبغي استنتاج القبول في السعودية من الأهلية العالمية. أكّد البضاعة والغرض والوجهة وشروط الإصدار وموعد إعادة التصدير مع جهة الإصدار المخوّلة والسلطات الجمركية. وقد تحتاج المواد الاستهلاكية والهدايا والبضائع التي تُترك أو تُباع في الفعالية إلى إجراء استيراد مختلف." },
    ],
  },
  20: {
    id: 20, slug: "white-glove-logistics",
    gradient: "linear-gradient(135deg,#1a1028 0%,#241536 50%,#0d0816 100%)",
    accentHex: "#e9b44c",
    industries: ["Luxury Retail","Art & Galleries","Healthcare","Hospitality & Hotels","Real Estate & Villas"],
    industriesAr: ["التجزئة الفاخرة","الفن والمعارض الفنية","الرعاية الصحية","الضيافة والفنادق","العقارات والفلل"],
    process: [
      { en: "Item and site requirements review", ar: "مراجعة متطلبات القطعة والموقع" },
      { en: "Packing and handling scope", ar: "نطاق التغليف والمناولة" },
      { en: "Provider and route availability", ar: "توفر مقدم الخدمة والمسار" },
      { en: "Import-document requirements", ar: "متطلبات مستندات الاستيراد" },
      { en: "Inside-delivery access review", ar: "مراجعة دخول التسليم الداخلي" },
      { en: "Setup responsibilities to confirm", ar: "تأكيد مسؤوليات التركيب" },
    ],
    subServices: [
      { name: "High-care furniture delivery enquiry", nameAr: "استفسار توصيل أثاث بعناية خاصة", desc: "Item list, packing, access, placement and crew availability are reviewed for the requested site.", descAr: "تتم مراجعة قائمة القطع والتغليف والدخول والتموضع وتوفر الطاقم للموقع المطلوب." },
      { name: "Art and antiques handling enquiry", nameAr: "استفسار مناولة الأعمال الفنية والتحف", desc: "Handling, packing, climate and insurance requirements need confirmation with the responsible provider.", descAr: "تتطلب متطلبات المناولة والتغليف والمناخ والتأمين تأكيداً مع مقدم الخدمة المسؤول." },
      { name: "Medical-equipment movement enquiry", nameAr: "استفسار نقل المعدات الطبية", desc: "Dimensions, sensitivity, handling instructions, route and any regulatory requirements must be reviewed.", descAr: "يجب مراجعة الأبعاد والحساسية وتعليمات المناولة والمسار وأي متطلبات تنظيمية." },
      { name: "Hotel FF&E shipment enquiry", nameAr: "استفسار شحن أثاث وتجهيزات الفنادق", desc: "Project dates, inventory, site access, delivery sequence and installation responsibilities are confirmed per project.", descAr: "يتم تأكيد تواريخ المشروع والمخزون ودخول الموقع وتسلسل التسليم ومسؤوليات التركيب لكل مشروع." },
      { name: "Interior-project delivery enquiry", nameAr: "استفسار توصيل لمشروع تصميم داخلي", desc: "Site access, item handling, delivery schedule and provider availability require confirmation.", descAr: "يتطلب دخول الموقع ومناولة القطع وجدول التسليم وتوفر مقدم الخدمة تأكيداً." },
      { name: "Installation and setup requirements", nameAr: "متطلبات التركيب والإعداد", desc: "Confirm whether the venue permits the work and whether a qualified, authorized provider is available.", descAr: "أكّد سماح الموقع بالعمل وتوفر مقدم خدمة مؤهل ومصرح له." },
    ],
    whyEnvod: [
      { en: "Item, access and handling requirements reviewed", ar: "مراجعة متطلبات القطعة والدخول والمناولة" },
      { en: "Packing and specialist-provider availability confirmed", ar: "تأكيد توفر التغليف ومقدم الخدمة المتخصص" },
      { en: "Delivery and setup responsibilities agreed per request", ar: "الاتفاق على مسؤوليات التسليم والتركيب لكل طلب" },
    ],
    faq: [
      { q: "What should be confirmed for high-care delivery?", a: "Confirm item value and fragility, packing method, building access, receiving appointment, placement or setup requirements, insurance and the provider's qualifications. The requested scope and availability must be agreed before booking.", qAr: "ما الذي ينبغي تأكيده للتسليم عالي العناية؟", aAr: "أكّد قيمة القطعة وقابليتها للكسر وطريقة التغليف ودخول المبنى وموعد الاستلام ومتطلبات التموضع أو التركيب والتأمين ومؤهلات مقدم الخدمة. يجب الاتفاق على النطاق المطلوب والتوفر قبل الحجز." },
    ],
  },
  21: {
    id: 21, slug: "temperature-controlled-logistics",
    gradient: "linear-gradient(135deg,#062030 0%,#0a3042 50%,#04141f 100%)",
    accentHex: "#22d3ee",
    industries: ["Food & Beverage","Supermarkets & Retail","Dairy & Meat","Fresh Produce & Agriculture","Chemicals"],
    industriesAr: ["الأغذية والمشروبات","السوبرماركت والتجزئة","الألبان واللحوم","المنتجات الطازجة والزراعة","الكيماويات"],
    process: [
      { en: "Temperature Requirements", ar: "تحديد متطلبات الحرارة" },
      { en: "Pre-Cooling & Loading", ar: "التبريد المسبق والتحميل" },
      { en: "Monitored Transit", ar: "نقل مراقَب" },
      { en: "Cold Storage", ar: "التخزين المبرد" },
      { en: "Customs & Inspection", ar: "الجمارك والفحص" },
      { en: "Chilled Final Delivery", ar: "التسليم النهائي مبرداً" },
    ],
    subServices: [
      { name: "Refrigerated Trucking Enquiry", nameAr: "استفسار نقل بالشاحنات المبردة", desc: "Vehicle, temperature range, route, monitoring and availability must be confirmed for the cargo.", descAr: "يجب تأكيد المركبة ونطاق الحرارة والمسار والمراقبة والتوفر للبضاعة." },
      { name: "Frozen Cargo Enquiry", nameAr: "استفسار شحن البضائع المجمدة", desc: "Confirm the required temperature, loading conditions, monitoring and operator capability before booking.", descAr: "أكّد درجة الحرارة وظروف التحميل والمراقبة وقدرة المشغّل المطلوبة قبل الحجز." },
      { name: "Chilled Distribution Enquiry", nameAr: "استفسار توزيع البضائع المبردة", desc: "Product acceptance, temperature range, destination and receiving schedule are reviewed per request.", descAr: "تتم مراجعة قبول المنتج ونطاق الحرارة والوجهة وجدول الاستلام لكل طلب." },
      { name: "Cold Chain Coordination", nameAr: "تنسيق سلسلة التبريد", desc: "Confirm which party provides equipment, monitoring, temperature records and exception handling.", descAr: "أكّد الجهة التي توفر المعدات والمراقبة وسجلات الحرارة والتعامل مع الانحرافات." },
      { name: "Food Logistics Enquiry", nameAr: "استفسار لوجستيات الأغذية", desc: "Review product, route and applicable food-import requirements; no compliance certification is implied.", descAr: "مراجعة المنتج والمسار ومتطلبات استيراد الغذاء المنطبقة؛ ولا يُفهم من ذلك وجود اعتماد امتثال." },
      { name: "Reefer Container Shipping Enquiry", nameAr: "استفسار شحن الحاويات المبردة", desc: "Carrier, container, temperature and terminal plug-in arrangements are confirmed for each route.", descAr: "يتم تأكيد الناقل والحاوية والحرارة وترتيبات التوصيل الكهربائي بالمحطة لكل مسار." },
    ],
    whyEnvod: [
      { en: "Equipment, temperature monitoring and reporting confirmed per shipment", ar: "تأكيد المعدات ومراقبة الحرارة والتقارير لكل شحنة" },
      { en: "Cargo compatibility and available temperature range checked before booking", ar: "التحقق من ملاءمة البضاعة ونطاق الحرارة المتاح قبل الحجز" },
      { en: "Custody, handoffs and temperature responsibilities documented in the agreed scope", ar: "توثيق الحيازة ومراحل التسليم ومسؤوليات الحرارة ضمن النطاق المتفق عليه" },
    ],
    faq: [
      { q: "How is this different from medical & pharma logistics?", a: "Temperature-controlled logistics refers to cargo requiring specified handling conditions. Equipment, facilities, monitoring, route and regulatory requirements must be confirmed for each product. GDP compliance, validated equipment or SFDA clearance is not assumed.", qAr: "ما الفرق بينها وبين اللوجستيات الطبية والصيدلانية؟", aAr: "تشير اللوجستيات بدرجات حرارة مضبوطة إلى البضائع التي تتطلب ظروف مناولة محددة. يجب تأكيد المعدات والمنشآت والمراقبة والمسار والمتطلبات التنظيمية لكل منتج. ولا يُفترض امتثال GDP أو اعتماد المعدات أو تخليص هيئة الغذاء والدواء." },
    ],
  },
  22: {
    id: 22, slug: "packaging-crating",
    gradient: "linear-gradient(135deg,#201409 0%,#2e1d0c 50%,#140c05 100%)",
    accentHex: "#d97706",
    industries: ["Industrial Manufacturing","Oil & Gas","Electronics","Art & Antiques","Exhibitions & Events"],
    industriesAr: ["التصنيع الصناعي","النفط والغاز","الإلكترونيات","الفن والتحف","المعارض والفعاليات"],
    process: [
      { en: "Cargo Survey", ar: "معاينة البضاعة" },
      { en: "Packing Design", ar: "تصميم التغليف" },
      { en: "Crate Fabrication", ar: "تصنيع الصناديق" },
      { en: "Packing & Sealing", ar: "التغليف والإغلاق" },
      { en: "Marking & Labeling", ar: "الترميز والملصقات" },
      { en: "Handover to Freight", ar: "التسليم للشحن" },
    ],
    subServices: [
      { name: "Export Packing", nameAr: "التغليف للتصدير", desc: "Professional export-grade packing for sea, air, and road shipments.", descAr: "تغليف احترافي بمستوى التصدير للشحن البحري والجوي والبري." },
      { name: "ISPM-15 Wooden Crate Enquiry", nameAr: "استفسار صناديق خشبية وفق ISPM-15", desc: "Treatment, marking and provider records must be verified for the destination and shipment.", descAr: "يجب التحقق من المعالجة والعلامات وسجلات مقدم الخدمة وفق الوجهة والشحنة." },
      { name: "Heavy Equipment Packing", nameAr: "تغليف المعدات الثقيلة", desc: "Skidding, bracing, and crating for machinery and industrial equipment.", descAr: "تثبيت ودعم وتصنيد للآلات والمعدات الصناعية." },
      { name: "Fragile Cargo Packing", nameAr: "تغليف البضائع الهشة", desc: "Shock-absorbing, custom-fit packing for glass, ceramics, and delicate items.", descAr: "تغليف مخصص ماص للصدمات للزجاج والسيراميك والقطع الحساسة." },
      { name: "Vacuum & Barrier Packing", nameAr: "التغليف المفرغ والعازل", desc: "Moisture-barrier and vacuum packing for corrosion-sensitive cargo.", descAr: "تغليف عازل للرطوبة ومفرغ للبضائع الحساسة للتآكل." },
      { name: "On-Site Packing Teams", nameAr: "فرق تغليف ميدانية", desc: "Mobile crews that pack and crate at your factory, site, or warehouse.", descAr: "فرق متنقلة تغلف وتصنّد في مصنعك أو موقعك أو مستودعك." },
    ],
    whyEnvod: [
      { en: "Wood-packaging treatment and marking evidence confirmed for the destination", ar: "تأكيد أدلة معالجة التغليف الخشبي وعلاماته للوجهة" },
      { en: "Packing engineered to the cargo — not off-the-shelf boxes", ar: "تغليف مُهندَس حسب البضاعة — وليس صناديق جاهزة" },
      { en: "Packing, crating, and freight combined under one provider", ar: "تغليف وتصنيد وشحن لدى مزود واحد" },
    ],
    faq: [
      { q: "What is ISPM-15 and why does it matter?", a: "ISPM 15 sets requirements for wood packaging material in international trade. Confirm whether the destination requires treatment and marking, and verify the supplier's records before dispatch. ENVOD does not claim that every packaging item it arranges is certified.", qAr: "ما هو معيار ISPM-15 ولماذا يهم؟", aAr: "يحدد معيار ISPM-15 متطلبات مواد التغليف الخشبية في التجارة الدولية. تحقّق مما إذا كانت الوجهة تتطلب المعالجة والعلامات، وراجع سجلات المورد قبل الإرسال. ولا يدّعي هذا الموقع أن كل مواد التغليف التي تُرتبها إنفود معتمدة." },
    ],
  },
  23: {
    id: 23, slug: "express-courier",
    gradient: "linear-gradient(135deg,#220808 0%,#331010 50%,#140404 100%)",
    accentHex: "#f97316",
    industries: ["Banking & Legal","Healthcare","E-commerce","Manufacturing","Government"],
    industriesAr: ["البنوك والقانون","الرعاية الصحية","التجارة الإلكترونية","التصنيع","الجهات الحكومية"],
    process: [
      { en: "Booking", ar: "الحجز" },
      { en: "Express Pickup", ar: "استلام سريع" },
      { en: "Sort & Dispatch", ar: "الفرز والإرسال" },
      { en: "Line-Haul / Air Uplift", ar: "النقل الرئيسي / الجوي" },
      { en: "Customs (International)", ar: "الجمارك (دولياً)" },
      { en: "Delivery & Proof of Delivery", ar: "التسليم وإثبات الاستلام" },
    ],
    subServices: [
      { name: "Urgent Pickup & Delivery", nameAr: "استلام وتسليم عاجل", desc: "Urgent pickup and delivery options can be checked for the route and requested schedule.", descAr: "يمكن التحقق من خيارات الاستلام والتسليم العاجل بحسب المسار والموعد المطلوب." },
      { name: "Scheduled Delivery", nameAr: "توصيل مجدول", desc: "Delivery estimates depend on origin, destination, service availability, and shipment requirements.", descAr: "تعتمد تقديرات التسليم على المنشأ والوجهة وتوفر الخدمة ومتطلبات الشحنة." },
      { name: "International Express", nameAr: "البريد الدولي السريع", desc: "International express options depend on destination, carrier schedules, cargo acceptance, and customs requirements.", descAr: "تعتمد خيارات البريد الدولي السريع على الوجهة وجداول الناقل وقبول البضاعة ومتطلبات التخليص الجمركي." },
      { name: "Document Shipping", nameAr: "شحن المستندات", desc: "Secure, tracked shipping for contracts, tenders, and legal documents.", descAr: "شحن آمن ومتتبع للعقود والمناقصات والمستندات القانونية." },
      { name: "Time-Critical Spare Parts", nameAr: "قطع الغيار الحرجة زمنياً", desc: "Emergency spare-part logistics to keep production lines and fleets running.", descAr: "لوجستيات طوارئ لقطع الغيار لإبقاء خطوط الإنتاج والأساطيل تعمل." },
    ],
    whyEnvod: [
      { en: "Urgent shipment enquiries are assessed using route, cargo, and deadline details", ar: "يتم تقييم استفسارات الشحنات العاجلة بعد معرفة المسار والبضاعة والموعد المطلوب" },
      { en: "Business accounts with priority handling and one contact", ar: "حسابات أعمال بمناولة ذات أولوية وجهة تواصل واحدة" },
      { en: "Customs handled in-house so express stays express", ar: "جمارك داخلية حتى يبقى السريع سريعاً" },
    ],
    faq: [
      { q: "How fast can an urgent shipment move?", a: "Same-day or next-day options may be available on selected routes. Timing depends on origin, destination, cut-off time, capacity, and cargo requirements. Share the route and deadline for a shipment-specific estimate.", qAr: "ما مدى سرعة نقل شحنة عاجلة؟", aAr: "قد تتوفر خيارات التوصيل في اليوم ذاته أو اليوم التالي لبعض المسارات. وتعتمد المدة على المنشأ والوجهة ووقت قبول الطلب والسعة ومتطلبات البضاعة. أرسل المسار والموعد المطلوب للحصول على تقدير خاص بالشحنة." },
    ],
  },
  24: {
    id: 24, slug: "cross-trade-shipping",
    gradient: "linear-gradient(135deg,#06201a 0%,#0a2f26 50%,#041410 100%)",
    accentHex: "#34d399",
    industries: ["Trading Companies","Manufacturing","Oil & Gas","Retail Chains","Project Contractors"],
    industriesAr: ["الشركات التجارية","التصنيع","النفط والغاز","سلاسل التجزئة","مقاولو المشاريع"],
    process: [
      { en: "Trade Lane Review", ar: "مراجعة مسار التجارة" },
      { en: "Supplier Coordination", ar: "التنسيق مع المورد" },
      { en: "Origin Pickup", ar: "الاستلام من بلد المنشأ" },
      { en: "Documentation & Switch B/L", ar: "التوثيق وتبديل بوليصة الشحن" },
      { en: "International Freight", ar: "الشحن الدولي" },
      { en: "Destination Clearance & Delivery", ar: "التخليص والتسليم بالوجهة" },
    ],
    subServices: [
      { name: "China–GCC Cross Trade", nameAr: "تجارة عابرة الصين–الخليج", desc: "Direct shipping from Chinese factories to the UAE and GCC markets.", descAr: "شحن مباشر من المصانع الصينية إلى الإمارات وأسواق الخليج." },
      { name: "China–USA Cross Trade", nameAr: "تجارة عابرة الصين–أمريكا", desc: "Factory-to-door movements between China and the United States, managed from Riyadh.", descAr: "شحنات من المصنع للباب بين الصين والولايات المتحدة تُدار من الرياض." },
      { name: "Europe–Middle East Cross Trade", nameAr: "تجارة عابرة أوروبا–الشرق الأوسط", desc: "Direct routings such as Germany to Saudi Arabia and the wider region.", descAr: "مسارات مباشرة مثل ألمانيا إلى السعودية والمنطقة الأوسع." },
      { name: "Switch Bill of Lading", nameAr: "تبديل بوليصة الشحن", desc: "Switch B/L handling that keeps your supplier and buyer confidential.", descAr: "معالجة تبديل البوليصة بما يحفظ سرية المورد والمشتري." },
      { name: "Third-Country Documentation", nameAr: "توثيق الدولة الثالثة", desc: "Invoicing, certificates, and compliance for goods that never enter Saudi Arabia.", descAr: "فواتير وشهادات وامتثال لبضائع لا تدخل المملكة إطلاقاً." },
      { name: "Multi-Origin Consolidation", nameAr: "تجميع من مناشئ متعددة", desc: "Consolidating cargo from several origin countries into one destination shipment.", descAr: "تجميع البضائع من عدة دول منشأ في شحنة واحدة للوجهة." },
    ],
    whyEnvod: [
      { en: "Ship supplier-to-customer directly — cargo never transits Saudi", ar: "اشحن من المورد للعميل مباشرة — دون عبور البضاعة للسعودية" },
      { en: "Switch B/L protects your margins and your supplier relationships", ar: "تبديل البوليصة يحمي هوامشك وعلاقاتك مع الموردين" },
      { en: "One Riyadh-based team controlling both origin and destination", ar: "فريق واحد من الرياض يدير المنشأ والوجهة معاً" },
    ],
    faq: [
      { q: "What is cross trade shipping?", a: "Cross trade (triangular) shipping moves cargo directly between two foreign countries without it entering your home country — for example, China to the UAE, China to the USA, or Germany to Saudi Arabia. ENVOD manages the pickup, freight, documentation, and clearance on both ends while you stay in control from Saudi Arabia.", qAr: "ما هو شحن التجارة العابرة؟", aAr: "شحن التجارة العابرة (الثلاثية) ينقل البضائع مباشرة بين دولتين أجنبيتين دون دخولها بلدك — مثل الصين إلى الإمارات، أو الصين إلى أمريكا، أو ألمانيا إلى السعودية. تدير إنفود الاستلام والشحن والتوثيق والتخليص في الطرفين بينما تبقى أنت متحكماً من السعودية." },
      { q: "Will my buyer see my supplier's details?", a: "No. With a switch bill of lading and third-country documentation, the original supplier's identity and pricing are kept confidential from the final buyer.", qAr: "هل سيرى المشتري تفاصيل المورد الخاص بي؟", aAr: "لا. مع تبديل بوليصة الشحن وتوثيق الدولة الثالثة، تبقى هوية المورد الأصلي وأسعاره سرية عن المشتري النهائي." },
    ],
  },
};

SERVICE_META[25] = DOOR_TO_DOOR_META;
for (const meta of Object.values(SERVICE_META)) {
  meta.faq = [...meta.faq, ...(SERVICE_REVIEW_FAQ[meta.slug] ?? [])];
}
export function getServiceById(id: number) {
  return id === 25 ? DOOR_TO_DOOR_SERVICE : SERVICE_CATALOG.find(service => service.id === id);
}
export const SLUG_TO_ID: Record<string, number> = Object.fromEntries(
  Object.values(SERVICE_META).map((m) => [m.slug, m.id])
);

export const ID_TO_SLUG: Record<number, string> = Object.fromEntries(
  Object.values(SERVICE_META).map((m) => [m.id, m.slug])
);

/**
 * Static service catalog — the single source of truth for all service content.
 * Used as the SSR/prerender source and at runtime; there is no backend API.
 */
export const SERVICE_CATALOG: Service[] = [
  { id: 1, name: "Ocean Freight", nameAr: "الشحن البحري", description: "Planning container shipping to Saudi Arabia? Share the origin, destination, FCL or LCL requirement, cargo details and inland delivery needs. Routing, carrier availability and responsibilities are confirmed per shipment.", descriptionAr: "هل تخطط لشحن الحاويات إلى السعودية؟ شارك المنشأ والوجهة ومتطلبات FCL أو LCL وتفاصيل البضاعة والتسليم الداخلي. يُؤكد المسار وتوفر الناقل والمسؤوليات لكل شحنة.", icon: "Ship", category: "core", sortOrder: 1, isActive: true },
  { id: 2, name: "Air Freight", nameAr: "الشحن الجوي", description: "Air freight moves cargo by aircraft. Discuss routing, documentation, carrier acceptance and collection or delivery requirements for your Saudi shipment.", descriptionAr: "ينقل الشحن الجوي البضائع بالطائرات. ناقش المسار والمستندات وقبول الناقل ومتطلبات الاستلام والتسليم لشحنتك في السعودية.", icon: "Plane", category: "core", sortOrder: 2, isActive: true },
  { id: 3, name: "GCC Transportation", nameAr: "النقل الخليجي", description: "Discuss cross-border road-freight requests between Saudi Arabia and GCC destinations. Route, carrier, vehicle and border-document scope are confirmed per shipment.", descriptionAr: "ناقش طلبات الشحن البري العابرة للحدود بين السعودية ووجهات الخليج. يتم تأكيد المسار والناقل والمركبة ونطاق مستندات الحدود لكل شحنة.", icon: "Truck", category: "core", sortOrder: 3, isActive: true },
  { id: 4, name: "Customs Clearance", nameAr: "التخليص الجمركي", description: "Planning customs clearance in Saudi Arabia? Share the goods, origin and destination, shipment documents and intended gateway. ENVOD coordinates document review and handover planning; release and approvals remain subject to the responsible authorities.", descriptionAr: "هل تخطط للتخليص الجمركي في السعودية؟ شارك بيانات البضاعة والمنشأ والوجهة ومستندات الشحنة والمنفذ المقصود. تنسق إنفود مراجعة المستندات والتخطيط للتسليم؛ ويظل الفسح والموافقة خاضعين للجهات المختصة.", icon: "ShieldCheck", category: "core", sortOrder: 4, isActive: true },
  { id: 5, name: "Warehousing & Distribution", nameAr: "التخزين والتوزيع", description: "Discuss storage, inventory, order-handling and distribution requirements. Facility location, operator, temperature range and any bonded status must be confirmed for your enquiry.", descriptionAr: "ناقش متطلبات التخزين والمخزون وتجهيز الطلبات والتوزيع. يجب تأكيد موقع المستودع ومشغله ونطاق الحرارة وأي صفة جمركية حسب الاستفسار.", icon: "Warehouse", category: "core", sortOrder: 5, isActive: true },
  { id: 6, name: "Freight Forwarding", nameAr: "الشحن المتكامل", description: "Freight forwarding coordinates cargo routing, transport documents and handoffs across carriers. Operator, customs and delivery responsibilities are confirmed for each shipment.", descriptionAr: "ينسق الشحن المتكامل مسارات البضائع ومستندات النقل ومراحل التسليم بين الناقلين. ويتم تأكيد مسؤوليات المشغّل والجمارك والتسليم لكل شحنة.", icon: "FileCheck", category: "core", sortOrder: 6, isActive: true },
  { id: 7, name: "Supply Chain Management", nameAr: "إدارة سلسلة التوريد", description: "Discuss vendor, delivery, systems and reporting requirements. Provider roles, system compatibility and available scope are confirmed for each enquiry.", descriptionAr: "ناقش متطلبات الموردين والتوصيل والأنظمة والتقارير. يتم تأكيد أدوار مقدمي الخدمة وتوافق الأنظمة والنطاق المتاح لكل استفسار.", icon: "GitBranch", category: "core", sortOrder: 7, isActive: true },
  { id: 8, name: "Project Cargo Logistics", nameAr: "لوجستيات بضائع المشاريع", description: "Project-cargo enquiries may involve oversized or heavy equipment. Cargo dimensions, route, permits, lifting and qualified-provider availability must be reviewed before booking.", descriptionAr: "قد تشمل استفسارات بضائع المشاريع معدات ضخمة أو ثقيلة. يجب مراجعة أبعاد البضاعة والمسار والتصاريح والرفع وتوفر مقدم الخدمة المؤهل قبل الحجز.", icon: "Package", category: "specialized", sortOrder: 8, isActive: true },
  { id: 9, name: "House Moving & Relocation", nameAr: "نقل المنازل والأثاث", description: "Send a Riyadh or Saudi-route home-moving enquiry with the move type, approximate inventory, packing needs, date and route. Provider availability and scope are confirmed before booking.", descriptionAr: "أرسل استفسار نقل منزل في الرياض أو على مسار سعودي، مع نوع الانتقال وقائمة المنقولات التقريبية واحتياجات التغليف والموعد والمسار. يتم تأكيد توفر مقدم الخدمة والنطاق قبل الحجز.", icon: "MapPin", category: "specialized", sortOrder: 9, isActive: true },
  { id: 10, name: "E-commerce Logistics", nameAr: "لوجستيات التجارة الإلكترونية", description: "Discuss delivery, returns, fulfillment and platform requirements. Local coverage, facility availability, integrations and tracking depend on the selected provider and confirmed scope.", descriptionAr: "ناقش متطلبات التوصيل والمرتجعات وتجهيز الطلبات والمنصة. تعتمد التغطية المحلية وتوفر المنشأة والتكامل والتتبع على مقدم الخدمة والنطاق المؤكد.", icon: "ShoppingCart", category: "specialized", sortOrder: 10, isActive: true },
  { id: 11, name: "Exhibition & Event Logistics", nameAr: "لوجستيات المعارض والفعاليات", description: "Exhibition and event shipment coordination—from freight planning and customs-document coordination to venue-delivery planning. ATA Carnet eligibility and temporary-import requirements are reviewed per shipment; issuance and acceptance rest with authorized bodies and relevant authorities.", descriptionAr: "تنسيق شحنات المعارض والفعاليات، من تخطيط الشحن ومستندات الجمارك إلى التخطيط للتسليم في الموقع. تُراجع أهلية كارنيه ATA ومتطلبات الإدخال المؤقت لكل شحنة؛ ويخضع الإصدار والقبول للجهات المخوّلة والسلطات المختصة.", icon: "Star", category: "specialized", sortOrder: 11, isActive: true },
  { id: 12, name: "Medical & Pharma Logistics", nameAr: "اللوجستيات الطبية والصيدلانية", description: "Medical and pharmaceutical shipment enquiries require product-specific handling, temperature, carrier and regulatory checks. Confirm facility, authorization and route before booking.", descriptionAr: "تتطلب استفسارات شحن الأدوية والمنتجات الطبية مراجعة خاصة بالمنتج والمناولة والحرارة والناقل والأنظمة. أكّد المنشأة والترخيص والمسار قبل الحجز.", icon: "Heart", category: "specialized", sortOrder: 12, isActive: true },
  { id: 13, name: "Food & FMCG Logistics", nameAr: "لوجستيات الغذاء والسلع الاستهلاكية", description: "Review food-cargo documents, temperature requirements, route and operator availability. Product approvals, certification and clearance remain subject to the responsible authorities.", descriptionAr: "راجع مستندات شحنات الغذاء ومتطلبات الحرارة والمسار وتوفر المشغّل. وتبقى موافقات المنتج وشهاداته وتخليصه خاضعة للجهات المختصة.", icon: "UtensilsCrossed", category: "specialized", sortOrder: 13, isActive: true },
  { id: 14, name: "Pet & Animal Import", nameAr: "استيراد الحيوانات الأليفة", description: "Review species-specific permits, health documents, carrier acceptance, route and any inspection or quarantine requirements with responsible authorities and operators.", descriptionAr: "راجع التصاريح والوثائق الصحية وقبول الناقل والمسار ومتطلبات الفحص أو الحجر الخاصة بالنوع مع الجهات والمشغّلين المسؤولين.", icon: "PawPrint", category: "specialized", sortOrder: 14, isActive: true },
  { id: 15, name: "Breakbulk Shipping", nameAr: "الشحن المنفصل (بريك بالك)", description: "Breakbulk describes individually loaded cargo that may not suit standard containers. Port, terminal, vessel, handling provider and carrier acceptance must be confirmed per route and shipment.", descriptionAr: "يصف الشحن المنفصل البضائع التي تُحمّل بشكل فردي وقد لا تناسب الحاويات القياسية. يجب تأكيد الميناء والمحطة والسفينة ومقدم المناولة وقبول الناقل لكل مسار وشحنة.", icon: "Anchor", category: "specialized", sortOrder: 15, isActive: true },
  { id: 16, name: "Dangerous Goods (DG Cargo)", nameAr: "البضائع الخطرة (شحن DG)", description: "Dangerous-goods enquiries are assessed by classification, packaging, documents, route, carrier acceptance and qualified-operator availability. No class or certification is assumed.", descriptionAr: "تُقيّم استفسارات البضائع الخطرة وفق التصنيف والتعبئة والمستندات والمسار وقبول الناقل وتوفر المشغّل المؤهل. ولا يُفترض قبول أي فئة أو وجود اعتماد.", icon: "AlertTriangle", category: "specialized", sortOrder: 16, isActive: true },
  { id: 17, name: "Oversized / Out-of-Gauge (OOG) Cargo", nameAr: "البضائع الضخمة وخارج القياس (OOG)", description: "OOG enquiries require cargo measurements, route and site details, permits, equipment, lifting and qualified-provider availability to be reviewed for each movement.", descriptionAr: "تتطلب استفسارات البضائع خارج القياس مراجعة القياسات والمسار والموقع والتصاريح والمعدات والرفع وتوفر مقدم الخدمة المؤهل لكل حركة.", icon: "Maximize2", category: "specialized", sortOrder: 17, isActive: true },
  { id: 18, name: "RoRo Shipping", nameAr: "الشحن الدحرجي (رورو)", description: "Review RoRo options for vehicles, machinery and wheeled cargo. Route, vessel, port, carrier acceptance, customs responsibilities and onward transport must be confirmed per shipment.", descriptionAr: "راجع خيارات رورو للسيارات والآلات والبضائع ذات العجلات. يجب تأكيد المسار والسفينة والميناء وقبول الناقل ومسؤوليات الجمارك والنقل اللاحق لكل شحنة.", icon: "Car", category: "specialized", sortOrder: 18, isActive: true },
  { id: 19, name: "ATA Carnet Coordination", nameAr: "تنسيق كارنيه ATA", description: "Coordinate shipment information and document checks for a possible ATA Carnet. Eligibility, issuance and Saudi acceptance must be confirmed with the authorized association and customs authorities.", descriptionAr: "تنسيق معلومات الشحنة ومراجعة المستندات لاحتمال استخدام كارنيه ATA. يجب تأكيد الأهلية والإصدار والقبول في السعودية مع الجهة المخوّلة والسلطات الجمركية.", icon: "Stamp", category: "specialized", sortOrder: 19, isActive: true },
  { id: 20, name: "White Glove Logistics", nameAr: "لوجستيات القفاز الأبيض", description: "Discuss high-care handling, packing, inside delivery or setup requirements for delicate or high-value items. Crew, provider, site access and scope must be confirmed before booking.", descriptionAr: "ناقش متطلبات المناولة عالية العناية والتغليف والتسليم الداخلي أو التركيب للقطع الحساسة أو الثمينة. يجب تأكيد الطاقم ومقدم الخدمة ودخول الموقع والنطاق قبل الحجز.", icon: "Gem", category: "specialized", sortOrder: 20, isActive: true },
  { id: 21, name: "Temperature Controlled Logistics", nameAr: "لوجستيات النقل المبرد", description: "Share the cargo temperature range, route, dates and monitoring needs. Suitable equipment, facilities, carrier acceptance, custody and availability require confirmation per shipment.", descriptionAr: "أرسل نطاق حرارة البضاعة والمسار والتواريخ واحتياجات المراقبة. يتطلب توفر المعدات والمنشآت المناسبة وقبول الناقل والحيازة تأكيداً لكل شحنة.", icon: "Snowflake", category: "specialized", sortOrder: 21, isActive: true },
  { id: 22, name: "Packaging & Crating Services", nameAr: "خدمات التغليف والتصنيد الخشبي", description: "Discuss export packing and crating requirements. Material, treatment, marking, dimensions and provider scope must meet the cargo, destination and current standards.", descriptionAr: "ناقش متطلبات التغليف والتصنيد للتصدير. يجب أن تتوافق المواد والمعالجة والعلامات والأبعاد ونطاق مقدم الخدمة مع البضاعة والوجهة والمعايير الحالية.", icon: "Box", category: "specialized", sortOrder: 22, isActive: true },
  { id: 23, name: "Express Courier Logistics", nameAr: "لوجستيات البريد السريع", description: "Discuss urgent business-document or parcel shipments. Route, carrier schedules, security and tracking features, cargo acceptance and delivery estimates depend on the selected operator.", descriptionAr: "ناقش شحن المستندات أو الطرود العاجلة للأعمال. تعتمد خيارات المسار وجداول الناقل والأمان والتتبع وتقديرات التسليم على المشغّل المختار.", icon: "Zap", category: "specialized", sortOrder: 23, isActive: true },
  { id: 24, name: "Cross Trade Shipping", nameAr: "شحن التجارة العابرة (كروس تريد)", description: "Discuss shipments between two countries outside the shipper's home market. Origin, destination, carrier, documentation, customs responsibilities and confidentiality terms are confirmed for each request.", descriptionAr: "ناقش الشحنات بين دولتين خارج السوق المحلي للشاحن. يتم تأكيد المنشأ والوجهة والناقل والمستندات ومسؤوليات الجمارك وشروط السرية لكل طلب.", icon: "Globe2", category: "specialized", sortOrder: 24, isActive: true },
];

/**
 * Display priority for the service directory. Numeric entries reference the
 * canonical catalog; Door-to-Door is a separate enquiry card, not another
 * unique service-detail page.
 */
export const SERVICE_DIRECTORY_ORDER = [
  11, 4, 22, 9, 3, 15, 19, 1, 2, 6, 8, 17, 5, 21, 7, 10, 12, 13, 14, 16,
  18, 20, 23, 24, "door-to-door",
] as const;
