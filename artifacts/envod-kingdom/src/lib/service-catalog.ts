/**
 * Lightweight service list (names, short descriptions, icons and page slugs).
 * Kept apart from service-data.ts, which also holds every service page's full
 * content, so the home and contact pages can load just this list.
 * service-data.ts re-exports SERVICE_CATALOG and Service unchanged.
 */

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
 * Service page slug for each service id (including Door-to-Door, id 25).
 * Must equal ID_TO_SLUG in service-data.ts; server/service-catalog-split.test.ts
 * checks this so the two never drift.
 */
export const SERVICE_SLUG_BY_ID: Record<number, string> = {
  1: "ocean-freight",
  2: "air-freight",
  3: "gcc-transportation",
  4: "customs-clearance",
  5: "warehousing",
  6: "freight-forwarding",
  7: "supply-chain",
  8: "project-cargo",
  9: "relocation",
  10: "ecommerce-logistics",
  11: "exhibition-logistics",
  12: "medical-pharma",
  13: "food-fmcg",
  14: "pet-animal-import",
  15: "breakbulk-shipping",
  16: "dangerous-goods",
  17: "oog-cargo",
  18: "roro-shipping",
  19: "ata-carnet",
  20: "white-glove-logistics",
  21: "temperature-controlled-logistics",
  22: "packaging-crating",
  23: "express-courier",
  24: "cross-trade-shipping",
  25: "door-to-door",
};

export const SERVICE_ID_BY_SLUG: Record<string, number> = Object.fromEntries(
  Object.entries(SERVICE_SLUG_BY_ID).map(([id, slug]) => [slug, Number(id)]),
);
