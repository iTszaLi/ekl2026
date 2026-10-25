import { isValidShippingDate } from "./enquiry-cargo-validation.js";

export interface RequirementChoice {
  value: string;
  en: string;
  ar: string;
}

export interface ServiceRequirementField {
  id: string;
  en: string;
  ar: string;
  kind: "text" | "number" | "date" | "textarea" | "select";
  maxLength: number;
  integer?: boolean;
  placeholderEn?: string;
  placeholderAr?: string;
  options?: readonly RequirementChoice[];
}

export interface EnquiryServiceOption {
  id: string;
  en: string;
  ar: string;
  icon: string;
  catalogIds: readonly number[];
  aliases: readonly string[];
  fields: readonly ServiceRequirementField[];
}

const text = (id: string, en: string, ar: string, placeholderEn = "", placeholderAr = ""): ServiceRequirementField => ({
  id, en, ar, kind: "text", maxLength: 240, placeholderEn, placeholderAr,
});
const number = (id: string, en: string, ar: string, placeholderEn = "", placeholderAr = ""): ServiceRequirementField => ({
  id, en, ar, kind: "number", maxLength: 30, integer: true, placeholderEn, placeholderAr,
});
const date = (id: string, en: string, ar: string): ServiceRequirementField => ({
  id, en, ar, kind: "date", maxLength: 10,
});
const area = (id: string, en: string, ar: string, placeholderEn = "", placeholderAr = ""): ServiceRequirementField => ({
  id, en, ar, kind: "textarea", maxLength: 1200, placeholderEn, placeholderAr,
});
const select = (
  id: string,
  en: string,
  ar: string,
  choices: readonly (readonly [string, string, string])[],
): ServiceRequirementField => ({
  id, en, ar, kind: "select", maxLength: 100,
  options: choices.map(([value, english, arabic]) => ({ value, en: english, ar: arabic })),
});

const unsure: readonly [string, string, string] = ["Not sure yet", "Not sure yet", "غير متأكد بعد"];
const yesNoUnsure: readonly (readonly [string, string, string])[] = [
  ["Yes", "Yes", "نعم"], ["No", "No", "لا"], unsure,
];
const vehicles: readonly (readonly [string, string, string])[] = [
  ["Van", "Van", "فان"],
  ["Dayana", "Dayana truck", "شاحنة ديانا"],
  ["Closed-box truck", "Closed-box truck", "شاحنة صندوق مغلق"],
  ["Refrigerated vehicle", "Refrigerated vehicle", "مركبة مبردة"],
  ["Flatbed", "Flatbed", "سطحة"],
  ["Curtain-side trailer", "Curtain-side trailer", "مقطورة ستائرية"],
  ["Lowbed", "Lowbed", "ناقلة منخفضة"],
  ["Not sure yet", "Not sure yet", "غير متأكد بعد"],
];

const ENQUIRY_SERVICE_DEFINITIONS = [
  {
    id: "customs", en: "Customs Clearance", ar: "التخليص الجمركي", icon: "🛃", catalogIds: [4],
    aliases: ["Customs Clearance"],
    fields: [
      select("tradeDirection", "Import or export?", "استيراد أم تصدير؟", [
        ["Import", "Import", "استيراد"], ["Export", "Export", "تصدير"], unsure,
      ]),
      text("borderCrossing", "Port, airport or border crossing", "الميناء أو المطار أو المنفذ الحدودي", "e.g. Jeddah Islamic Port", "مثال: ميناء جدة الإسلامي"),
      text("hsCode", "HS code, if known", "رمز النظام المنسق، إن عُرف", "Optional", "اختياري"),
      select("documentsAvailable", "Commercial invoice or packing list available?", "هل الفاتورة التجارية أو قائمة التعبئة متوفرة؟", yesNoUnsure),
      area("approvalRequirements", "SABER, SFDA, SASO or other approvals", "متطلبات سابر أو هيئة الغذاء والدواء أو المواصفات أو موافقات أخرى", "List any approvals you know may apply.", "اذكر أي موافقات تعتقد أنها مطلوبة."),
    ],
  },
  {
    id: "forwarding", en: "Freight Forwarding", ar: "الشحن المتكامل", icon: "🌐", catalogIds: [6, 24],
    aliases: ["Freight Forwarding", "Cross Trade Shipping", "Door-to-Door Logistics"],
    fields: [
      select("freightMode", "Freight mode", "وسيلة الشحن", [
        ["Sea freight", "Sea freight", "شحن بحري"], ["Air freight", "Air freight", "شحن جوي"],
        ["Road freight", "Road freight", "شحن بري"], ["Multimodal", "Multimodal", "متعدد الوسائط"],
        ["Cross-trade", "Cross-trade", "تجارة عابرة"], unsure,
      ]),
      text("incoterms", "Incoterms, if known", "الإنكوترمز، إن عُرفت", "e.g. EXW, FOB or DAP", "مثال: EXW أو FOB أو DAP"),
      area("forwardingScope", "Coordination or handling requirements", "متطلبات التنسيق أو المناولة", "Optional service requirements.", "متطلبات الخدمة، إن وجدت."),
    ],
  },
  {
    id: "sea", en: "Sea Freight (Ocean Freight)", ar: "الشحن البحري", icon: "🚢", catalogIds: [1, 15, 18],
      aliases: ["Sea Freight", "Ocean Freight", "Ocean & Sea Freight", "Sea / Ocean Freight", "RoRo Shipping"],
    fields: [
      select("seaFreightType", "FCL or LCL?", "شحن حاوية كاملة أم جزئية؟", [
        ["FCL", "FCL — full container", "حاوية كاملة"], ["LCL", "LCL — shared container", "شحنة مجمعة"],
        ["Breakbulk", "Breakbulk", "بضائع سائبة"], ["RoRo", "RoRo", "رورو"], unsure,
      ]),
      text("containerType", "Container type and quantity", "نوع الحاوية وعددها", "e.g. 1 × 40 ft high cube", "مثال: حاوية واحدة 40 قدم"),
      text("incoterms", "Incoterms, if known", "الإنكوترمز، إن عُرفت", "e.g. FOB or CIF", "مثال: FOB أو CIF"),
    ],
  },
  {
    id: "air", en: "Air Freight", ar: "الشحن الجوي", icon: "✈️", catalogIds: [2],
    aliases: ["Air Freight"],
    fields: [
      select("urgency", "Urgency", "درجة الاستعجال", [
        ["Standard", "Standard", "عادي"], ["Urgent", "Urgent", "عاجل"], ["Express", "Express", "سريع"], unsure,
      ]),
      date("cargoReadyDate", "Cargo ready date", "تاريخ جاهزية البضاعة"),
      date("deliveryDeadline", "Required delivery date, if known", "تاريخ التسليم المطلوب، إن عُرف"),
      area("specialHandling", "Special handling requirements", "متطلبات المناولة الخاصة", "e.g. fragile, temperature or dangerous-goods handling.", "مثال: قابل للكسر أو درجة حرارة محددة أو بضائع خطرة."),
    ],
  },
  {
    id: "road", en: "Road Transportation — Saudi Arabia & GCC", ar: "النقل البري — السعودية ودول الخليج", icon: "🚛", catalogIds: [3],
    aliases: ["Road Transportation", "GCC Transportation", "GCC Cross-Border", "Road Transportation — Saudi Arabia & GCC"],
    fields: [
      select("vehicleType", "Vehicle or trailer preference", "نوع المركبة أو المقطورة", vehicles),
      number("vehicleCount", "Number of vehicles or loads", "عدد المركبات أو الحمولات"),
      date("pickupDate", "Pickup date", "تاريخ الاستلام"),
      date("deliveryDeadline", "Delivery deadline", "الموعد النهائي للتسليم"),
      area("loadingRequirements", "Special loading or handling requirements", "متطلبات التحميل أو المناولة الخاصة"),
    ],
  },
  {
    id: "breakbulk", en: "Breakbulk Shipping", ar: "الشحن المنفصل (بريك بالك)", icon: "⚓", catalogIds: [15],
    aliases: ["Breakbulk Shipping", "Break Bulk Shipping", "Non-containerized Cargo"],
    fields: [
      select("breakbulkLoad", "Cargo loading type", "طريقة تحميل البضاعة", [
        ["Breakbulk", "Breakbulk / piece-loaded", "بريك بالك / تحميل بالقطع"],
        ["Flat-rack", "Flat-rack", "حاوية رف مسطح"],
        ["Not sure yet", "Not sure yet", "غير متأكد بعد"],
      ]),
      area("handlingRequirements", "Loading, lashing or port requirements", "متطلبات التحميل أو الربط أو الميناء"),
    ],
  },
  {
    id: "warehouse", en: "Warehousing & Storage", ar: "التخزين والمستودعات", icon: "🏭", catalogIds: [5],
    aliases: ["Warehousing", "Warehousing & Distribution", "Warehousing & Storage"],
    fields: [
      text("warehouseCity", "Preferred city or warehouse location", "المدينة أو موقع المستودع المفضل", "e.g. Riyadh or Jeddah", "مثال: الرياض أو جدة"),
      text("storageVolume", "Approximate volume, pallets or space", "الحجم التقريبي أو عدد الطبالي أو المساحة", "e.g. 10 pallets or 40 m³", "مثال: 10 طبالي أو 40 م³"),
      text("storageDuration", "Expected storage duration", "مدة التخزين المتوقعة", "e.g. 3 months", "مثال: 3 أشهر"),
      select("storageTemperature", "Storage temperature", "درجة حرارة التخزين", [
        ["Ambient", "Ambient", "محيط"], ["Chilled", "Chilled", "مبرد"], ["Frozen", "Frozen", "مجمد"], unsure,
      ]),
      text("inboundOutboundFrequency", "Expected inbound / outbound frequency", "وتيرة الإدخال والإخراج المتوقعة", "e.g. weekly", "مثال: أسبوعية"),
      area("warehouseServices", "Inventory, distribution, loading or other services", "المخزون أو التوزيع أو التحميل أو خدمات أخرى"),
    ],
  },
  {
    id: "temperature", en: "Temperature-Controlled Logistics", ar: "النقل والتخزين المبرد", icon: "❄️", catalogIds: [21],
    aliases: ["Temperature-Controlled Transportation & Warehousing", "Temperature Controlled Logistics"],
    fields: [
      select("temperatureMode", "Temperature requirement", "متطلبات درجة الحرارة", [
        ["Chilled", "Chilled", "مبرد"], ["Frozen", "Frozen", "مجمد"], ["Controlled ambient", "Controlled ambient", "درجة محيطة مضبوطة"],
        ["Other temperature range", "Other temperature range", "نطاق حراري آخر"], unsure,
      ]),
      text("temperatureRange", "Temperature range, if known", "نطاق درجة الحرارة، إن عُرف", "e.g. +2 to +8 °C", "مثال: من +2 إلى +8 مئوية"),
      date("deliveryDeadline", "Required delivery date", "تاريخ التسليم المطلوب"),
      area("temperatureHandling", "Monitoring or special handling", "المراقبة أو المناولة الخاصة"),
    ],
  },
  {
    id: "exhibition", en: "Exhibition, Event & Trade Show Logistics", ar: "لوجستيات المعارض والفعاليات", icon: "🎪", catalogIds: [11],
    aliases: ["Exhibition Logistics", "Exhibition & Event Logistics", "Event Logistics"],
    fields: [
      text("eventName", "Event or exhibition name", "اسم الفعالية أو المعرض"),
      text("eventVenue", "Venue and city", "الموقع والمدينة", "e.g. Riyadh Front", "مثال: واجهة الرياض"),
      text("eventDates", "Event dates", "تواريخ الفعالية", "e.g. 10–14 November", "مثال: 10–14 نوفمبر"),
      select("ataAssistance", "Temporary import or ATA Carnet assistance?", "هل تحتاج إلى استيراد مؤقت أو مساعدة بشأن دفتر ATA؟", yesNoUnsure),
      area("eventServices", "Delivery, setup, dismantling, storage or return shipping", "التسليم أو التركيب أو التفكيك أو التخزين أو إعادة الشحن"),
    ],
  },
  {
    id: "project", en: "Project Cargo & Heavy Transport", ar: "شحن المشاريع والنقل الثقيل", icon: "🏗️", catalogIds: [8, 17],
    aliases: ["Project Cargo", "Project Cargo Logistics", "Oversized / Out-of-Gauge (OOG) Cargo"],
    fields: [
      text("transportEquipment", "Trailer or equipment preference", "المقطورة أو المعدّات المفضلة", "e.g. lowbed", "مثال: ناقلة منخفضة"),
      area("liftingPlan", "Lifting, loading or unloading requirements", "متطلبات الرفع أو التحميل أو التفريغ"),
      date("plannedTransportDate", "Planned transport date", "تاريخ النقل المخطط"),
      area("routeRestrictions", "Route, access or permit considerations", "اعتبارات المسار أو الوصول أو التصاريح"),
    ],
  },
  {
    id: "relocation", en: "Packing, Moving & Relocation", ar: "التغليف والنقل والانتقال", icon: "📦", catalogIds: [9],
    aliases: ["House Moving & Relocation", "Packing, Moving & Relocation", "Packing & Relocation / Household Moving"],
    fields: [
      select("moveType", "Residential or commercial move?", "انتقال سكني أم تجاري؟", [
        ["Residential", "Residential", "سكني"], ["Commercial", "Commercial", "تجاري"], unsure,
      ]),
      text("propertySize", "Home or office size", "حجم المنزل أو المكتب", "Optional", "اختياري"),
      text("estimatedContents", "Approximate rooms, furniture or cartons", "عدد الغرف أو الأثاث أو الصناديق التقريبي"),
      select("packingService", "Packing and unpacking", "خدمة التغليف وفك التغليف", [
        ["Packing", "Packing", "التغليف"], ["Packing and unpacking", "Packing and unpacking", "التغليف وفكه"],
        ["No packing needed", "No packing needed", "لا حاجة للتغليف"], unsure,
      ]),
      select("furnitureAssembly", "Furniture dismantling or assembly", "فك الأثاث أو تركيبه", yesNoUnsure),
      date("preferredMoveDate", "Preferred moving date", "تاريخ الانتقال المفضل"),
      select("storageNeeded", "Storage required?", "هل تحتاج إلى تخزين؟", yesNoUnsure),
      area(
        "buildingAccess",
        "Building access and special handling",
        "دخول المبنى ومتطلبات المناولة الخاصة",
        "Optional: stairs or lift, parking/entry restrictions, fragile or oversized items.",
        "اختياري: السلالم أو المصعد وقيود المواقف أو الدخول والقطع الحساسة أو كبيرة الحجم.",
      ),
    ],
  },
  {
    id: "delivery", en: "Local Delivery & Distribution", ar: "التوصيل المحلي والتوزيع", icon: "🚚", catalogIds: [10, 23],
    aliases: ["Local Delivery & Distribution", "Express Courier Logistics", "E-commerce Logistics"],
    fields: [
      select("deliveryPattern", "Single delivery or recurring distribution?", "توصيل واحد أم توزيع متكرر؟", [
        ["Single delivery", "Single delivery", "توصيل واحد"], ["Recurring distribution", "Recurring distribution", "توزيع متكرر"], unsure,
      ]),
      select("vehicleType", "Vehicle type, if known", "نوع المركبة، إن عُرف", vehicles),
      date("preferredDeliveryDate", "Preferred delivery date or schedule", "موعد أو جدول التوصيل المفضل"),
      area("deliveryInstructions", "Special delivery instructions", "تعليمات توصيل خاصة"),
    ],
  },
  {
    id: "packaging", en: "Packaging, Crating & Site Handling", ar: "التغليف والصناديق ومناولة الموقع", icon: "🧰", catalogIds: [22],
    aliases: ["Packaging & Crating Services", "Packaging, Crating & Site Handling", "Site Handling & On-Site Logistics"],
    fields: [
      select("packagingType", "Packaging or handling service", "خدمة التغليف أو المناولة", [
        ["Export crating", "Export crating", "صناديق شحن للتصدير"],
        ["Protective packaging", "Protective packaging", "تغليف واقٍ"],
        ["On-site handling", "On-site handling", "مناولة في الموقع"], ["Loading or unloading", "Loading or unloading", "تحميل أو تفريغ"],
        unsure,
      ]),
      text("projectLocation", "Pickup or project-site location", "موقع الاستلام أو المشروع"),
      area("siteHandling", "On-site loading or unloading requirements", "متطلبات التحميل أو التفريغ في الموقع"),
      date("completionDate", "Required completion date", "تاريخ الإكمال المطلوب"),
    ],
  },
  {
    id: "ata", en: "ATA Carnet & Temporary Imports", ar: "دفتر ATA والاستيراد المؤقت", icon: "📋", catalogIds: [19],
    aliases: ["ATA Carnet", "ATA Carnet Coordination", "ATA Carnet Services", "ATA Carnet Processing", "Temporary Import & Export", "Temporary Import and Export"],
    fields: [
      text("eventPurpose", "Event or temporary-import purpose", "الفعالية أو غرض الاستيراد المؤقت"),
      text("goodsValue", "Approximate value of goods", "القيمة التقريبية للبضائع", "Optional", "اختياري"),
      text("temporaryImportPeriod", "Expected arrival and departure dates", "تاريخ الوصول والمغادرة المتوقع", "e.g. 10–20 November", "مثال: 10–20 نوفمبر"),
      select("carnetStatus", "ATA Carnet status", "حالة دفتر ATA", [
        ["Carnet available", "Carnet available", "الدفتر متوفر"],
        ["Need assistance", "Need assistance", "أحتاج إلى مساعدة"], unsure,
      ]),
      select("returnShipment", "Re-export or return shipment required?", "هل تحتاج إلى إعادة تصدير أو شحن مرتجع؟", yesNoUnsure),
    ],
  },
  {
    id: "supply-chain", en: "Supply Chain Management", ar: "إدارة سلسلة التوريد", icon: "🔄", catalogIds: [7],
    aliases: ["Supply Chain Management"],
    fields: [
      text("supplyChainScope", "Supply-chain coordination needed", "تنسيق سلسلة التوريد المطلوب"),
      text("supplyChainLocations", "Countries or locations involved", "الدول أو المواقع المعنية"),
      area("systemsAndReporting", "Inventory, systems or reporting needs", "احتياجات المخزون أو الأنظمة أو التقارير"),
    ],
  },
  {
    id: "medical", en: "Medical & Pharma Logistics", ar: "لوجستيات الطب والأدوية", icon: "🩺", catalogIds: [12],
    aliases: ["Medical & Pharma Logistics", "Medical Logistics", "Pharmaceutical Logistics"],
    fields: [
      text("medicalProductType", "Product or commodity type", "نوع المنتج أو السلعة"),
      select("medicalTemperature", "Temperature requirement", "متطلبات درجة الحرارة", [
        ["Ambient", "Ambient", "درجة حرارة محيطة"], ["Chilled", "Chilled", "مبرد"],
        ["Frozen", "Frozen", "مجمد"], ["Controlled ambient", "Controlled ambient", "درجة محيطة مضبوطة"], unsure,
      ]),
      area("medicalDocuments", "Product documents or approvals, if known", "مستندات المنتج أو الموافقات، إن عُرفت"),
    ],
  },
  {
    id: "food", en: "Food & FMCG Logistics", ar: "لوجستيات الأغذية والسلع الاستهلاكية", icon: "🥫", catalogIds: [13],
    aliases: ["Food & FMCG Logistics", "Food Logistics", "FMCG Logistics"],
    fields: [
      text("foodProductType", "Food or FMCG product type", "نوع المنتج الغذائي أو الاستهلاكي"),
      select("foodTemperature", "Temperature requirement", "متطلبات درجة الحرارة", [
        ["Ambient", "Ambient", "درجة حرارة محيطة"], ["Chilled", "Chilled", "مبرد"],
        ["Frozen", "Frozen", "مجمد"], ["Controlled ambient", "Controlled ambient", "درجة محيطة مضبوطة"], unsure,
      ]),
      area("foodDocuments", "Product documents or approvals, if known", "مستندات المنتج أو الموافقات، إن عُرفت"),
    ],
  },
  {
    id: "pet", en: "Pet & Animal Import", ar: "استيراد الحيوانات الأليفة", icon: "🐾", catalogIds: [14],
    aliases: ["Pet & Animal Import", "Pet Relocation", "Animal Import"],
    fields: [
      text("animalSpecies", "Animal species or type", "نوع الحيوان أو فصيلته"),
      number("animalCount", "Number of animals", "عدد الحيوانات"),
      area("animalDocuments", "Health documents or permits available, if known", "المستندات الصحية أو التصاريح المتوفرة، إن عُرفت"),
    ],
  },
  {
    id: "dangerous-goods", en: "Dangerous Goods (DG Cargo)", ar: "البضائع الخطرة (شحن DG)", icon: "⚠️", catalogIds: [16],
    aliases: ["Dangerous Goods (DG Cargo)", "Dangerous Goods", "DG Cargo"],
    fields: [
      text("dangerousGoodsClass", "UN number or dangerous-goods class, if known", "رقم الأمم المتحدة أو فئة البضائع الخطرة، إن عُرفت"),
      select("safetyDataSheet", "Safety Data Sheet available?", "هل تتوفر صحيفة بيانات السلامة؟", yesNoUnsure),
      area("dangerousGoodsHandling", "Packaging, handling or carrier constraints", "قيود التعبئة أو المناولة أو الناقل"),
    ],
  },
  {
    id: "white-glove", en: "White Glove Logistics", ar: "لوجستيات القفاز الأبيض", icon: "🧤", catalogIds: [20],
    aliases: ["White Glove Logistics", "White Glove Delivery", "High-Care Handling"],
    fields: [
      text("whiteGloveCargo", "Item type and handling needs", "نوع القطعة واحتياجات المناولة"),
      select("whiteGloveService", "Service requirements", "متطلبات الخدمة", [
        ["Protective packing", "Protective packing", "تغليف واقٍ"], ["Inside delivery", "Inside delivery", "تسليم داخلي"],
        ["Setup or placement", "Setup or placement", "تركيب أو وضع"], ["On-site handling", "On-site handling", "مناولة في الموقع"], unsure,
      ]),
      area("whiteGloveSite", "Site access or delivery requirements", "متطلبات الوصول إلى الموقع أو التسليم"),
    ],
  },
  {
    id: "documentation", en: "Import & Export Documentation", ar: "مستندات الاستيراد والتصدير", icon: "📄", catalogIds: [],
    aliases: ["Import Documentation", "Export Documentation", "Import & Export Documents"],
    fields: [
      select("tradeDirection", "Import or export?", "استيراد أم تصدير؟", [
        ["Import", "Import", "استيراد"], ["Export", "Export", "تصدير"], unsure,
      ]),
      select("documentsAvailable", "Which core shipment documents are available?", "ما مستندات الشحنة الأساسية المتوفرة؟", [
        ["Commercial invoice", "Commercial invoice", "الفاتورة التجارية"],
        ["Packing list", "Packing list", "قائمة التعبئة"],
        ["Certificate of origin", "Certificate of origin", "شهادة المنشأ"],
        ["More than one document", "More than one document", "أكثر من مستند"],
        unsure,
      ]),
      area("documentRequirements", "Document preparation or destination requirements", "متطلبات إعداد المستندات أو الوجهة", "Describe any known documents, attestations or destination requirements.", "اذكر المستندات أو التصديقات أو متطلبات الوجهة المعروفة."),
    ],
  },
  {
    id: "other", en: "Other Logistics Requirements", ar: "متطلبات لوجستية أخرى", icon: "💬", catalogIds: [],
    aliases: ["Other", "Other Logistics Requirements"],
    fields: [],
  },
] as const satisfies readonly EnquiryServiceOption[];

export type EnquiryServiceId = (typeof ENQUIRY_SERVICE_DEFINITIONS)[number]["id"];

const ENQUIRY_SERVICE_PRIORITY = [
  "exhibition",
  "customs",
  "relocation",
  "road",
  "breakbulk",
  "ata",
  "supply-chain",
  "forwarding",
  "sea",
  "air",
  "project",
  "warehouse",
  "temperature",
  "delivery",
  "packaging",
  "medical",
  "food",
  "pet",
  "dangerous-goods",
  "white-glove",
  "documentation",
  "other",
] as const satisfies readonly EnquiryServiceId[];

export const ENQUIRY_SERVICES = ENQUIRY_SERVICE_PRIORITY.map((id) => {
  const service = ENQUIRY_SERVICE_DEFINITIONS.find((candidate) => candidate.id === id);
  if (!service) throw new Error(`Missing enquiry service definition: ${id}`);
  return service;
});

const ENQUIRY_SERVICE_FORM_LABELS: Partial<Record<EnquiryServiceId, { en: string; ar: string }>> = {
  exhibition: { en: "Exhibition & Event Logistics", ar: "لوجستيات المعارض والفعاليات" },
  relocation: { en: "Packing & Relocation / Household Moving", ar: "التغليف والانتقال / نقل الأثاث المنزلي" },
  breakbulk: { en: "Breakbulk", ar: "الشحن المنفصل (بريك بالك)" },
  project: { en: "Project Cargo & OOG", ar: "بضائع المشاريع والبضائع خارج القياس" },
  packaging: { en: "Site Handling & On-Site Logistics", ar: "مناولة الموقع والخدمات اللوجستية الميدانية" },
  other: { en: "Other / General Enquiry", ar: "استفسار عام / خدمات أخرى" },
};

export function getEnquiryServiceFormLabel(
  service: Pick<EnquiryServiceOption, "id" | "en" | "ar">,
  language: "en" | "ar",
) {
  return ENQUIRY_SERVICE_FORM_LABELS[service.id as EnquiryServiceId]?.[language] ?? service[language];
}

export const COMMON_SHIPMENT_FIELD_LABELS: Record<string, { en: string; ar: string }> = {
  origin: { en: "Shipment origin", ar: "منشأ الشحنة" },
  destination: { en: "Shipment destination", ar: "وجهة الشحنة" },
  cargoDescription: { en: "Commodity or cargo description", ar: "وصف السلعة أو البضاعة" },
  packageCount: { en: "Number of packages or pieces", ar: "عدد الطرود أو القطع" },
  dimensions: { en: "Cargo dimensions (include units)", ar: "أبعاد البضاعة (اذكر الوحدات)" },
  weightKg: { en: "Gross weight (kg)", ar: "الوزن الإجمالي (كجم)" },
  preferredShippingDate: { en: "Ready or preferred shipping date", ar: "تاريخ الجاهزية أو الشحن المفضل" },
};

export type CommonShipmentField =
  | "locations"
  | "cargo"
  | "packageCount"
  | "dimensions"
  | "weightKg"
  | "preferredShippingDate";

export interface CommonShipmentValues {
  origin: string;
  destination: string;
  cargoDescription: string;
  packageCount: string;
  dimensions: string;
  weightKg: string;
  preferredShippingDate: string;
}

export const EMPTY_COMMON_SHIPMENT: CommonShipmentValues = {
  origin: "", destination: "", cargoDescription: "", packageCount: "",
  dimensions: "", weightKg: "", preferredShippingDate: "",
};

export const SERVICE_COMMON_FIELDS = {
  customs: ["locations", "cargo", "packageCount", "dimensions", "weightKg", "preferredShippingDate"],
  forwarding: ["locations", "cargo", "packageCount", "dimensions", "weightKg", "preferredShippingDate"],
  sea: ["locations", "cargo", "packageCount", "dimensions", "weightKg", "preferredShippingDate"],
  air: ["locations", "cargo", "packageCount", "dimensions", "weightKg", "preferredShippingDate"],
  road: ["locations", "cargo", "packageCount", "dimensions", "weightKg", "preferredShippingDate"],
  breakbulk: ["locations", "cargo", "packageCount", "dimensions", "weightKg", "preferredShippingDate"],
  warehouse: ["cargo"],
  temperature: ["locations", "cargo", "packageCount", "dimensions", "weightKg", "preferredShippingDate"],
  exhibition: ["locations", "cargo", "packageCount", "dimensions", "weightKg", "preferredShippingDate"],
  project: ["locations", "cargo", "packageCount", "dimensions", "weightKg", "preferredShippingDate"],
  relocation: ["locations", "cargo", "packageCount", "dimensions", "weightKg", "preferredShippingDate"],
  delivery: ["locations", "cargo", "packageCount", "dimensions", "weightKg", "preferredShippingDate"],
  packaging: ["locations", "cargo", "packageCount", "dimensions", "weightKg", "preferredShippingDate"],
  ata: ["locations", "cargo", "packageCount", "dimensions", "weightKg", "preferredShippingDate"],
  "supply-chain": ["locations", "cargo", "packageCount", "dimensions", "weightKg", "preferredShippingDate"],
  medical: ["locations", "cargo", "packageCount", "dimensions", "weightKg", "preferredShippingDate"],
  food: ["locations", "cargo", "packageCount", "dimensions", "weightKg", "preferredShippingDate"],
  pet: ["locations", "cargo", "packageCount", "dimensions", "weightKg", "preferredShippingDate"],
  "dangerous-goods": ["locations", "cargo", "packageCount", "dimensions", "weightKg", "preferredShippingDate"],
  "white-glove": ["locations", "cargo", "packageCount", "dimensions", "weightKg", "preferredShippingDate"],
  documentation: ["locations", "cargo", "packageCount", "dimensions", "weightKg", "preferredShippingDate"],
  other: ["locations", "cargo", "packageCount", "dimensions", "weightKg", "preferredShippingDate"],
} as const satisfies Record<EnquiryServiceId, readonly CommonShipmentField[]>;

const normalized = (value: string) => value.replace(/^\[TEST\]\s*/i, "").trim().toLocaleLowerCase("en-US");

export function getEnquiryServiceById(id: string | undefined) {
  return ENQUIRY_SERVICES.find((service) => service.id === id);
}

export function getEnquiryServiceByValue(value: string) {
  const candidate = normalized(value);
  return ENQUIRY_SERVICES.find((service) => {
    const formLabels = ENQUIRY_SERVICE_FORM_LABELS[service.id as EnquiryServiceId];
    return [service.en, service.ar, formLabels?.en, formLabels?.ar, ...service.aliases]
      .some((alias) => typeof alias === "string" && normalized(alias) === candidate);
  });
}

export function getEnquiryServiceForCatalogId(id: number | undefined) {
  return ENQUIRY_SERVICES.find((service) => (service.catalogIds as readonly number[]).includes(id ?? -1));
}

export function getServiceRequirementLabel(serviceId: string, fieldId: string, language: "en" | "ar") {
  const field = getEnquiryServiceById(serviceId)?.fields.find((item) => item.id === fieldId);
  return field ? field[language] : undefined;
}

export function formatServiceRequirementValue(serviceId: string, fieldId: string, value: string, language: "en" | "ar") {
  const options = getEnquiryServiceById(serviceId)?.fields.find((item) => item.id === fieldId)?.options;
  const choice = options?.find((option) => option.value === value);
  return choice ? choice[language] : value;
}

export function validServiceDetails(serviceValue: string, values: Record<string, string>): boolean {
  if (Object.keys(values).length > 20) return false;
  const service = getEnquiryServiceByValue(serviceValue);
  const allowed = new Set(service?.fields.map(({ id }) => id) ?? []);
  return Object.entries(values).every(([id, value]) => {
    if (typeof value !== "string" || id.length > 48) return false;
    const field = service?.fields.find((item) => item.id === id);
    if (!field || value.length > field.maxLength) return false;
    if (field.kind === "date" && value && !isValidShippingDate(value)) return false;
    if (field.kind === "number" && value &&
      (!/^\d+(?:\.\d{1,3})?$/.test(value) || !Number.isFinite(Number(value)) ||
        Number(value) <= 0 || Number(value) > 1_000_000_000 ||
        (field.integer && !Number.isInteger(Number(value))))) return false;
    if (field.kind === "select" && value && !field.options?.some((option) => option.value === value)) return false;
    return allowed.has(id);
  });
}

export const OTHER_SERVICE_VALUE = ENQUIRY_SERVICES.find(({ id }) => id === "other")!.en;
