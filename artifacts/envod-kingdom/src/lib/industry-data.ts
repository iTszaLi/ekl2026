/**
 * Industry-based logistics pages — data layer.
 *
 * 11 industry verticals, each with bilingual (EN/AR) SEO content, hedged
 * per the claims-accuracy policy (no guarantees/superlatives; customs and
 * transit statements use the mandated hedged phrasing). Solutions link to
 * existing service pages for internal linking equity.
 */

export interface IndustrySolution {
  titleEn: string;
  titleAr: string;
  descEn: string;
  descAr: string;
  /** Optional internal link to a service detail page. */
  serviceSlug?: string;
}

export interface IndustryFaq {
  q: string;
  a: string;
  qAr: string;
  aAr: string;
}

export interface IndustryMeta {
  slug: string;
  /** lucide-react icon name (mapped in the page components). */
  icon: string;
  accentHex: string;
  gradient: string;
  nameEn: string;
  nameAr: string;
  /** Short card description. */
  shortEn: string;
  shortAr: string;
  /** Hero intro paragraph. */
  introEn: string;
  introAr: string;
  /** SEO body paragraphs (always-visible static HTML). */
  overview: { en: string; ar: string }[];
  /** Industry pain points we address. */
  challenges: { en: string; ar: string }[];
  /** What we do for this industry (with internal service links). */
  solutions: IndustrySolution[];
  /** Related service slugs for the links row. */
  relatedServiceSlugs: string[];
  faq: IndustryFaq[];
  seoTitle: string;
  seoDescription: string;
}

const G = (a: string, b: string) => `linear-gradient(135deg, ${a} 0%, ${b} 100%)`;

export const INDUSTRY_META: IndustryMeta[] = [
  {
    slug: "automotive-logistics",
    icon: "Car",
    accentHex: "#3B82F6",
    gradient: G("#071426", "#0A2342"),
    nameEn: "Automotive Logistics",
    nameAr: "لوجستيات السيارات",
    shortEn: "Vehicle shipping, spare parts distribution, and RoRo services for dealers, importers, and workshops across Saudi Arabia.",
    shortAr: "شحن المركبات وتوزيع قطع الغيار وخدمات الدحرجة للوكلاء والمستوردين والورش في السعودية.",
    introEn: "From complete vehicles on RoRo vessels to time-critical spare parts for workshops, ENVOD KINGDOM supports automotive importers, dealerships, and aftermarket distributors across Saudi Arabia and the GCC.",
    introAr: "من المركبات الكاملة على سفن الدحرجة إلى قطع الغيار العاجلة للورش، تدعم إنفود كينجدم مستوردي السيارات والوكلاء وموزعي قطع الغيار في السعودية والخليج.",
    overview: [
      {
        en: "Automotive logistics covers the movement of complete vehicles, spare parts, tyres, batteries, and workshop equipment into and across Saudi Arabia. The sector depends on precise coordination: dealers need showroom stock on schedule, workshops need parts quickly, and importers need clean customs documentation for every VIN.",
        ar: "تشمل لوجستيات السيارات نقل المركبات الكاملة وقطع الغيار والإطارات والبطاريات ومعدات الورش إلى داخل المملكة وعبرها. يعتمد القطاع على تنسيق دقيق: فالوكلاء يحتاجون مخزون المعارض في موعده، والورش تحتاج القطع بسرعة، والمستوردون يحتاجون مستندات جمركية سليمة لكل رقم هيكل.",
      },
      {
        en: "We handle RoRo bookings for driveable units, containerised shipments for parts and accessories, and SABER conformity coordination for regulated automotive products. Customs clearance completed as quickly as possible, with many shipments typically cleared within 24 hours depending on shipment type, documentation, customs requirements, and regulatory approvals.",
        ar: "نتولى حجوزات سفن الدحرجة للمركبات القابلة للقيادة، والشحنات المحواة لقطع الغيار والإكسسوارات، وتنسيق شهادات مطابقة سابر للمنتجات الخاضعة للتنظيم. ويُنجز التخليص الجمركي بأسرع وقت ممكن، إذ تُخلَّص العديد من الشحنات عادةً خلال 24 ساعة حسب نوع الشحنة والمستندات والمتطلبات الجمركية والموافقات التنظيمية.",
      },
    ],
    challenges: [
      { en: "SABER / SASO conformity requirements for vehicles and parts", ar: "متطلبات مطابقة سابر / ساسو للمركبات وقطع الغيار" },
      { en: "Workshop downtime while waiting for critical spare parts", ar: "توقف الورش أثناء انتظار قطع الغيار الحرجة" },
      { en: "Damage risk for vehicles and fragile components in transit", ar: "مخاطر تضرر المركبات والمكونات الحساسة أثناء النقل" },
      { en: "Seasonal demand swings for tyres, batteries, and accessories", ar: "تقلبات الطلب الموسمية على الإطارات والبطاريات والإكسسوارات" },
    ],
    solutions: [
      { titleEn: "RoRo Vehicle Shipping", titleAr: "شحن المركبات بالدحرجة", descEn: "Roll-on/roll-off bookings for cars, trucks, buses, and driveable machinery through Saudi ports.", descAr: "حجوزات الدحرجة للسيارات والشاحنات والحافلات والمعدات القابلة للقيادة عبر الموانئ السعودية.", serviceSlug: "roro-shipping" },
      { titleEn: "Spare Parts Air Freight", titleAr: "الشحن الجوي لقطع الغيار", descEn: "Air freight for urgent parts and workshop equipment — air freight is the fastest mode of international shipping.", descAr: "شحن جوي للقطع العاجلة ومعدات الورش — الشحن الجوي هو أسرع وسائل الشحن الدولي.", serviceSlug: "air-freight" },
      { titleEn: "Customs & SABER Coordination", titleAr: "التخليص الجمركي وتنسيق سابر", descEn: "Import clearance, VIN documentation, and conformity certificate coordination for automotive products.", descAr: "تخليص الاستيراد ومستندات أرقام الهياكل وتنسيق شهادات المطابقة لمنتجات السيارات.", serviceSlug: "customs-clearance" },
      { titleEn: "Parts Warehousing & Distribution", titleAr: "تخزين وتوزيع قطع الغيار", descEn: "Storage, inventory management, and scheduled replenishment to dealer and workshop networks.", descAr: "تخزين وإدارة مخزون وتجديد مجدول لشبكات الوكلاء والورش.", serviceSlug: "warehousing" },
      { titleEn: "Express Courier for Critical Parts", titleAr: "بريد سريع للقطع الحرجة", descEn: "Same-day and next-day delivery options for vehicle-off-road situations.", descAr: "خيارات توصيل في نفس اليوم واليوم التالي لحالات توقف المركبات.", serviceSlug: "express-courier" },
    ],
    relatedServiceSlugs: ["roro-shipping", "air-freight", "customs-clearance", "warehousing", "express-courier"],
    faq: [
      {
        q: "Can you ship complete vehicles to Saudi Arabia?",
        a: "Yes. We arrange RoRo shipping for driveable vehicles and containerised shipping for high-value or non-running units, plus import customs clearance and SABER conformity coordination.",
        qAr: "هل تشحنون مركبات كاملة إلى السعودية؟",
        aAr: "نعم. نرتب الشحن بالدحرجة للمركبات القابلة للقيادة والشحن بالحاويات للوحدات عالية القيمة أو غير العاملة، مع التخليص الجمركي وتنسيق مطابقة سابر.",
      },
      {
        q: "How fast can spare parts be delivered to a workshop?",
        a: "For urgent vehicle-off-road cases we offer express courier and air freight options. Typical transit times may vary depending on origin, destination, carrier schedules, customs procedures, and seasonal factors.",
        qAr: "ما مدى سرعة توصيل قطع الغيار إلى الورشة؟",
        aAr: "للحالات العاجلة نوفر خيارات البريد السريع والشحن الجوي. وقد تختلف أوقات النقل المعتادة حسب المنشأ والوجهة وجداول الناقلين والإجراءات الجمركية والعوامل الموسمية.",
      },
      {
        q: "Do you handle SABER certificates for automotive parts?",
        a: "We coordinate SABER shipment certificates and guide you on product certificate requirements for regulated automotive categories as part of the clearance process.",
        qAr: "هل تتعاملون مع شهادات سابر لقطع غيار السيارات؟",
        aAr: "ننسق شهادات سابر للشحنات ونرشدكم بشأن متطلبات شهادات المنتج للفئات الخاضعة للتنظيم كجزء من عملية التخليص.",
      },
    ],
    seoTitle: "Automotive Logistics in Saudi Arabia | ENVOD KINGDOM",
    seoDescription: "Automotive logistics across Saudi Arabia & the GCC — RoRo vehicle shipping, spare parts air freight, SABER coordination, customs clearance, and parts warehousing for dealers and importers.",
  },
  {
    slug: "construction-logistics",
    icon: "HardHat",
    accentHex: "#F59E0B",
    gradient: G("#1c1206", "#0A2342"),
    nameEn: "Construction Logistics",
    nameAr: "لوجستيات البناء والإنشاء",
    shortEn: "Building materials, heavy equipment, and project cargo delivered to construction sites across the Kingdom.",
    shortAr: "مواد البناء والمعدات الثقيلة وبضائع المشاريع تصل إلى مواقع الإنشاء في أنحاء المملكة.",
    introEn: "Saudi Arabia is building at an extraordinary pace. ENVOD KINGDOM moves building materials, machinery, and oversized components for contractors and suppliers working on projects across the Kingdom — from city developments to Vision 2030 giga-project supply chains.",
    introAr: "تشهد السعودية نهضة عمرانية استثنائية. تنقل إنفود كينجدم مواد البناء والآلات والمكونات الضخمة للمقاولين والموردين العاملين في مشاريع المملكة — من التطويرات الحضرية إلى سلاسل إمداد مشاريع رؤية 2030 الكبرى.",
    overview: [
      {
        en: "Construction logistics is about sequence: steel, cement, MEP equipment, and finishing materials must arrive in the right order, at the right laydown area, with the right paperwork. Delays ripple through project schedules, so reliable inland transport and clean import clearance matter as much as price.",
        ar: "لوجستيات البناء تقوم على التسلسل: يجب أن يصل الحديد والأسمنت ومعدات الكهروميكانيك ومواد التشطيب بالترتيب الصحيح إلى منطقة التخزين الصحيحة وبالمستندات الصحيحة. فالتأخير ينعكس على جداول المشاريع، لذا فإن موثوقية النقل الداخلي وسلامة التخليص لا تقل أهمية عن السعر.",
      },
      {
        en: "We support contractors and building-material suppliers with project cargo handling, out-of-gauge transport for plant and machinery, breakbulk shipments, and scheduled deliveries to site — including remote locations. Customs clearance completed as quickly as possible, with many shipments typically cleared within 24 hours depending on shipment type, documentation, customs requirements, and regulatory approvals.",
        ar: "ندعم المقاولين وموردي مواد البناء بمناولة بضائع المشاريع والنقل خارج الأبعاد للمعدات والآلات وشحنات البضائع العامة والتسليم المجدول إلى المواقع — بما فيها المواقع النائية. ويُنجز التخليص الجمركي بأسرع وقت ممكن، إذ تُخلَّص العديد من الشحنات عادةً خلال 24 ساعة حسب نوع الشحنة والمستندات والمتطلبات الجمركية والموافقات التنظيمية.",
      },
    ],
    challenges: [
      { en: "Oversized and heavy-lift machinery requiring permits and escorts", ar: "معدات ضخمة وثقيلة تتطلب تصاريح ومرافقة" },
      { en: "Tight site-delivery windows tied to project milestones", ar: "نوافذ تسليم ضيقة مرتبطة بمراحل المشروع" },
      { en: "Deliveries to remote or newly developed project locations", ar: "التسليم إلى مواقع نائية أو حديثة التطوير" },
      { en: "Coordinating multiple suppliers into one site schedule", ar: "تنسيق موردين متعددين ضمن جدول موقع واحد" },
    ],
    solutions: [
      { titleEn: "Project Cargo Management", titleAr: "إدارة بضائع المشاريع", descEn: "End-to-end planning for plant, machinery, and multi-shipment project moves.", descAr: "تخطيط متكامل للمعدات والآلات وعمليات النقل متعددة الشحنات.", serviceSlug: "project-cargo" },
      { titleEn: "Out-of-Gauge & Heavy Transport", titleAr: "النقل خارج الأبعاد والثقيل", descEn: "Lowbed trailers, permits, and route surveys for oversized construction equipment.", descAr: "مقطورات منخفضة وتصاريح ومسوحات طرق للمعدات الإنشائية الضخمة.", serviceSlug: "oog-cargo" },
      { titleEn: "Breakbulk Shipping", titleAr: "شحن البضائع العامة", descEn: "Steel structures, precast elements, and non-containerised materials via Saudi ports.", descAr: "الهياكل الحديدية والعناصر مسبقة الصب والمواد غير المحواة عبر الموانئ السعودية.", serviceSlug: "breakbulk-shipping" },
      { titleEn: "Import Clearance for Materials", titleAr: "تخليص استيراد المواد", descEn: "HS classification, SABER coordination, and duty handling for building materials.", descAr: "التصنيف الجمركي وتنسيق سابر ومعالجة الرسوم لمواد البناء.", serviceSlug: "customs-clearance" },
      { titleEn: "Site Delivery & GCC Trucking", titleAr: "التسليم للمواقع والنقل الخليجي", descEn: "Scheduled FTL/LTL deliveries to laydown areas across Saudi Arabia and the GCC.", descAr: "تسليم مجدول بحمولات كاملة وجزئية إلى مناطق التخزين في السعودية والخليج.", serviceSlug: "gcc-transportation" },
    ],
    relatedServiceSlugs: ["project-cargo", "oog-cargo", "breakbulk-shipping", "customs-clearance", "gcc-transportation"],
    faq: [
      {
        q: "Can you deliver to remote construction sites?",
        a: "Yes. We plan routes, permits, and delivery schedules for sites across the Kingdom, including newly developed and remote project locations, and coordinate laydown-area access with your site team.",
        qAr: "هل يمكنكم التوصيل إلى مواقع إنشاء نائية؟",
        aAr: "نعم. نخطط الطرق والتصاريح وجداول التسليم للمواقع في أنحاء المملكة، بما فيها المواقع النائية وحديثة التطوير، وننسق الوصول إلى مناطق التخزين مع فريق موقعكم.",
      },
      {
        q: "Do you move heavy construction machinery?",
        a: "We handle out-of-gauge and heavy-lift moves — excavators, cranes, generators, batching plants — including lowbed transport, escort coordination, and lifting supervision.",
        qAr: "هل تنقلون معدات البناء الثقيلة؟",
        aAr: "نتولى النقل خارج الأبعاد والرفع الثقيل — الحفارات والرافعات والمولدات ومحطات الخلط — بما يشمل النقل بالمقطورات المنخفضة وتنسيق المرافقة والإشراف على الرفع.",
      },
      {
        q: "Can you support giga-project suppliers?",
        a: "We support suppliers and subcontractors delivering into Vision 2030 programmes with import clearance, warehousing, and scheduled site deliveries aligned to their contractors' requirements.",
        qAr: "هل تدعمون موردي المشاريع الكبرى؟",
        aAr: "ندعم الموردين ومقاولي الباطن الذين يوردون لبرامج رؤية 2030 من خلال التخليص والتخزين والتسليم المجدول للمواقع وفق متطلبات مقاوليهم.",
      },
    ],
    seoTitle: "Construction Logistics in Saudi Arabia | ENVOD KINGDOM",
    seoDescription: "Construction logistics for contractors & suppliers in Saudi Arabia — project cargo, heavy equipment transport, breakbulk shipping, customs clearance, and scheduled site deliveries.",
  },
  {
    slug: "retail-logistics",
    icon: "ShoppingBag",
    accentHex: "#10B981",
    gradient: G("#051a12", "#0A2342"),
    nameEn: "Retail Logistics",
    nameAr: "لوجستيات التجزئة",
    shortEn: "Store replenishment, distribution-centre operations, and omnichannel fulfilment for retailers across Saudi Arabia.",
    shortAr: "تجديد مخزون المتاجر وعمليات مراكز التوزيع وتلبية الطلبات متعددة القنوات لتجار التجزئة في السعودية.",
    introEn: "Retail runs on availability. ENVOD KINGDOM helps brands, distributors, and store networks keep shelves stocked — combining import clearance, warehousing, and scheduled distribution across Saudi cities and malls.",
    introAr: "تجارة التجزئة تقوم على توفر البضاعة. تساعد إنفود كينجدم العلامات التجارية والموزعين وشبكات المتاجر على إبقاء الرفوف ممتلئة — عبر التخليص والتخزين والتوزيع المجدول في المدن والمولات السعودية.",
    overview: [
      {
        en: "Retail logistics in Saudi Arabia spans imported consumer goods, mall deliveries with restricted receiving hours, seasonal peaks around Ramadan and back-to-school, and the growing overlap with e-commerce fulfilment. Success depends on stock accuracy and dependable replenishment cycles.",
        ar: "تمتد لوجستيات التجزئة في السعودية من السلع الاستهلاكية المستوردة إلى التسليم للمولات ذات ساعات الاستلام المحددة، والذروات الموسمية في رمضان والعودة للمدارس، والتداخل المتنامي مع تلبية طلبات التجارة الإلكترونية. والنجاح يعتمد على دقة المخزون ودورات تجديد موثوقة.",
      },
      {
        en: "We provide import consolidation, bonded and standard warehousing, pick-and-pack, and scheduled store deliveries — plus e-commerce fulfilment when your channels converge. Customs clearance completed as quickly as possible, with many shipments typically cleared within 24 hours depending on shipment type, documentation, customs requirements, and regulatory approvals.",
        ar: "نوفر تجميع الواردات والتخزين العادي والجمركي والتجهيز والتغليف والتسليم المجدول للمتاجر — إضافة إلى تلبية طلبات التجارة الإلكترونية عند تقاطع قنواتكم. ويُنجز التخليص الجمركي بأسرع وقت ممكن، إذ تُخلَّص العديد من الشحنات عادةً خلال 24 ساعة حسب نوع الشحنة والمستندات والمتطلبات الجمركية والموافقات التنظيمية.",
      },
    ],
    challenges: [
      { en: "Mall receiving windows and multi-store delivery routing", ar: "نوافذ استلام المولات وجدولة التوصيل لعدة متاجر" },
      { en: "Seasonal demand peaks that strain warehouse capacity", ar: "ذروات موسمية تضغط على سعة المستودعات" },
      { en: "SKU-level accuracy across imports and replenishment", ar: "دقة على مستوى الصنف عبر الاستيراد والتجديد" },
      { en: "Blending store replenishment with e-commerce orders", ar: "الدمج بين تجديد المتاجر وطلبات التجارة الإلكترونية" },
    ],
    solutions: [
      { titleEn: "Import Consolidation & Clearance", titleAr: "تجميع الواردات والتخليص", descEn: "Consolidated ocean and air imports with clean documentation and duty handling.", descAr: "واردات بحرية وجوية مجمعة بمستندات سليمة ومعالجة للرسوم.", serviceSlug: "customs-clearance" },
      { titleEn: "Distribution-Centre Warehousing", titleAr: "التخزين في مراكز التوزيع", descEn: "Racked storage, inventory control, and pick-and-pack for store replenishment.", descAr: "تخزين على أرفف وضبط مخزون وتجهيز وتغليف لتجديد المتاجر.", serviceSlug: "warehousing" },
      { titleEn: "Store & Mall Distribution", titleAr: "التوزيع للمتاجر والمولات", descEn: "Scheduled multi-drop deliveries aligned with mall receiving windows across Saudi cities.", descAr: "توصيل مجدول متعدد النقاط وفق نوافذ استلام المولات في المدن السعودية.", serviceSlug: "gcc-transportation" },
      { titleEn: "E-commerce Fulfilment", titleAr: "تلبية طلبات التجارة الإلكترونية", descEn: "Order fulfilment, returns handling, and last-mile coordination for online channels.", descAr: "تلبية الطلبات ومعالجة المرتجعات وتنسيق التوصيل النهائي للقنوات الإلكترونية.", serviceSlug: "ecommerce-logistics" },
      { titleEn: "Supply Chain Management", titleAr: "إدارة سلسلة الإمداد", descEn: "Forecast-aligned inbound planning and vendor coordination for retail networks.", descAr: "تخطيط واردات وفق التوقعات وتنسيق الموردين لشبكات التجزئة.", serviceSlug: "supply-chain" },
    ],
    relatedServiceSlugs: ["warehousing", "ecommerce-logistics", "customs-clearance", "gcc-transportation", "supply-chain"],
    faq: [
      {
        q: "Can you deliver to malls across Saudi Arabia?",
        a: "Yes. We run scheduled multi-drop distribution aligned to mall receiving windows in Riyadh, Jeddah, Dammam, and other Saudi cities, with proof-of-delivery reporting.",
        qAr: "هل توصلون إلى المولات في أنحاء السعودية؟",
        aAr: "نعم. ننفذ توزيعاً مجدولاً متعدد النقاط وفق نوافذ استلام المولات في الرياض وجدة والدمام وغيرها، مع تقارير إثبات التسليم.",
      },
      {
        q: "Do you handle seasonal retail peaks?",
        a: "We plan warehouse capacity and delivery schedules around Ramadan, Eid, back-to-school, and sale seasons, scaling pick-and-pack teams to match your forecast.",
        qAr: "هل تتعاملون مع الذروات الموسمية للتجزئة؟",
        aAr: "نخطط سعة التخزين وجداول التوصيل حول رمضان والأعياد والعودة للمدارس ومواسم التخفيضات، مع توسيع فرق التجهيز حسب توقعاتكم.",
      },
      {
        q: "Can one warehouse serve stores and online orders?",
        a: "Yes. We support omnichannel setups where the same inventory pool feeds store replenishment and e-commerce fulfilment, with SKU-level inventory visibility.",
        qAr: "هل يمكن لمستودع واحد خدمة المتاجر والطلبات الإلكترونية؟",
        aAr: "نعم. ندعم النماذج متعددة القنوات حيث يغذي مخزون واحد تجديد المتاجر وتلبية الطلبات الإلكترونية، مع رؤية للمخزون على مستوى الصنف.",
      },
    ],
    seoTitle: "Retail Logistics in Saudi Arabia | ENVOD KINGDOM",
    seoDescription: "Retail logistics in Saudi Arabia — import consolidation, distribution-centre warehousing, mall & store deliveries, and omnichannel e-commerce fulfilment for brands and distributors.",
  },
  {
    slug: "fashion-logistics",
    icon: "Shirt",
    accentHex: "#EC4899",
    gradient: G("#1c0714", "#0A2342"),
    nameEn: "Fashion Logistics",
    nameAr: "لوجستيات الأزياء",
    shortEn: "Seasonal collections, boutique distribution, and careful garment handling for fashion brands and retailers.",
    shortAr: "المجموعات الموسمية وتوزيع البوتيكات ومناولة عناية بالملابس لعلامات الأزياء وتجار التجزئة.",
    introEn: "Fashion moves in seasons — and missing a launch window costs sell-through. ENVOD KINGDOM moves apparel, footwear, and accessories for brands, franchises, and boutiques across Saudi Arabia with speed and careful handling.",
    introAr: "الأزياء تتحرك بالمواسم — وتفويت نافذة الإطلاق يكلف المبيعات. تنقل إنفود كينجدم الملابس والأحذية والإكسسوارات للعلامات والامتيازات والبوتيكات في السعودية بسرعة وعناية.",
    overview: [
      {
        en: "Fashion logistics is calendar-driven: spring/summer and autumn/winter drops, capsule launches, Ramadan collections, and sale-season replenishment all arrive in compressed windows. Garments need careful handling — cartons managed to preserve retail-ready presentation and packaging.",
        ar: "لوجستيات الأزياء تحكمها الرزنامة: مجموعات الربيع/الصيف والخريف/الشتاء والإصدارات الخاصة ومجموعات رمضان وتجديد مواسم التخفيضات كلها تصل في نوافذ ضيقة. والملابس تحتاج مناولة بعناية — إدارة الكراتين بما يحفظ جاهزية العرض والتغليف.",
      },
      {
        en: "We combine air freight for launch-critical stock with ocean freight for volume replenishment, plus warehousing, quality-check support, and boutique-level distribution. Customs clearance completed as quickly as possible, with many shipments typically cleared within 24 hours depending on shipment type, documentation, customs requirements, and regulatory approvals.",
        ar: "نمزج الشحن الجوي للبضائع الحرجة للإطلاق مع الشحن البحري لتجديد الكميات، إضافة إلى التخزين ودعم الفحص والتوزيع على مستوى البوتيكات. ويُنجز التخليص الجمركي بأسرع وقت ممكن، إذ تُخلَّص العديد من الشحنات عادةً خلال 24 ساعة حسب نوع الشحنة والمستندات والمتطلبات الجمركية والموافقات التنظيمية.",
      },
    ],
    challenges: [
      { en: "Compressed launch windows for seasonal collections", ar: "نوافذ إطلاق ضيقة للمجموعات الموسمية" },
      { en: "Retail-ready packaging that must arrive undamaged", ar: "تغليف جاهز للعرض يجب أن يصل سليماً" },
      { en: "Split deliveries across boutiques, malls, and online", ar: "توزيع مجزأ بين البوتيكات والمولات والمتاجر الإلكترونية" },
      { en: "Returns and end-of-season stock consolidation", ar: "المرتجعات وتجميع مخزون نهاية الموسم" },
    ],
    solutions: [
      { titleEn: "Launch-Critical Air Freight", titleAr: "الشحن الجوي للإطلاقات", descEn: "Air freight for new-collection drops — air freight is the fastest mode of international shipping.", descAr: "شحن جوي لإصدارات المجموعات الجديدة — الشحن الجوي هو أسرع وسائل الشحن الدولي.", serviceSlug: "air-freight" },
      { titleEn: "Volume Ocean Replenishment", titleAr: "التجديد البحري للكميات", descEn: "FCL/LCL ocean freight for core lines and season-volume stock.", descAr: "شحن بحري بحاويات كاملة وجزئية للخطوط الأساسية وكميات الموسم.", serviceSlug: "ocean-freight" },
      { titleEn: "Apparel Warehousing", titleAr: "تخزين الملابس", descEn: "Clean, organised storage with carton-level control and retail-ready handling.", descAr: "تخزين نظيف ومنظم بضبط على مستوى الكرتون ومناولة جاهزة للعرض.", serviceSlug: "warehousing" },
      { titleEn: "Boutique & Mall Distribution", titleAr: "التوزيع للبوتيكات والمولات", descEn: "Scheduled deliveries to boutiques and mall stores across Saudi cities.", descAr: "توصيل مجدول للبوتيكات ومتاجر المولات في المدن السعودية.", serviceSlug: "gcc-transportation" },
      { titleEn: "E-commerce Fulfilment", titleAr: "تلبية الطلبات الإلكترونية", descEn: "Order fulfilment and returns processing for fashion online channels.", descAr: "تلبية الطلبات ومعالجة المرتجعات لقنوات الأزياء الإلكترونية.", serviceSlug: "ecommerce-logistics" },
    ],
    relatedServiceSlugs: ["air-freight", "ocean-freight", "warehousing", "ecommerce-logistics", "express-courier"],
    faq: [
      {
        q: "Can you hit a fixed collection launch date?",
        a: "We plan backwards from your launch date, combining air freight and priority clearance for critical stock. Typical transit times may vary depending on origin, destination, carrier schedules, customs procedures, and seasonal factors.",
        qAr: "هل يمكنكم الالتزام بتاريخ إطلاق محدد للمجموعة؟",
        aAr: "نخطط عكسياً من تاريخ الإطلاق، بمزيج من الشحن الجوي والتخليص ذي الأولوية للبضائع الحرجة. وقد تختلف أوقات النقل المعتادة حسب المنشأ والوجهة وجداول الناقلين والإجراءات الجمركية والعوامل الموسمية.",
      },
      {
        q: "How do you protect retail-ready packaging?",
        a: "We use careful carton handling, palletisation where appropriate, and clean warehousing so garments and boxed footwear arrive presentation-ready.",
        qAr: "كيف تحمون التغليف الجاهز للعرض؟",
        aAr: "نعتمد مناولة كراتين بعناية وتجهيزاً على منصات عند الحاجة وتخزيناً نظيفاً لتصل الملابس والأحذية المعلبة جاهزة للعرض.",
      },
      {
        q: "Do you handle end-of-season returns?",
        a: "Yes. We consolidate end-of-season stock from stores, process returns, and arrange storage or re-export according to your instructions.",
        qAr: "هل تتعاملون مع مرتجعات نهاية الموسم؟",
        aAr: "نعم. نجمع مخزون نهاية الموسم من المتاجر ونعالج المرتجعات ونرتب التخزين أو إعادة التصدير حسب تعليماتكم.",
      },
    ],
    seoTitle: "Fashion Logistics in Saudi Arabia | ENVOD KINGDOM",
    seoDescription: "Fashion & apparel logistics in Saudi Arabia — launch-critical air freight, ocean replenishment, apparel warehousing, boutique and mall distribution, and e-commerce fulfilment.",
  },
  {
    slug: "electronics-logistics",
    icon: "Cpu",
    accentHex: "#6366F1",
    gradient: G("#0b0a26", "#0A2342"),
    nameEn: "Electronics Logistics",
    nameAr: "لوجستيات الإلكترونيات",
    shortEn: "High-value handling, protective packing, and secure distribution for consumer and industrial electronics.",
    shortAr: "مناولة عالية القيمة وتغليف واقٍ وتوزيع آمن للإلكترونيات الاستهلاكية والصناعية.",
    introEn: "Electronics combine high value, fragility, and strict conformity requirements. ENVOD KINGDOM moves consumer devices, components, and industrial electronics into Saudi Arabia with protective handling and careful documentation.",
    introAr: "تجمع الإلكترونيات بين القيمة العالية والحساسية ومتطلبات المطابقة الصارمة. تنقل إنفود كينجدم الأجهزة الاستهلاكية والمكونات والإلكترونيات الصناعية إلى السعودية بمناولة واقية وتوثيق دقيق.",
    overview: [
      {
        en: "Electronics logistics demands secure, traceable handling from origin to shelf: high-value cartons attract pilferage risk, lithium batteries carry dangerous-goods rules, and regulated devices need SABER/CITC-related conformity paperwork managed before arrival.",
        ar: "تتطلب لوجستيات الإلكترونيات مناولة آمنة وقابلة للتتبع من المنشأ إلى الرف: فالكراتين عالية القيمة معرضة لمخاطر السرقة، وبطاريات الليثيوم تخضع لقواعد البضائع الخطرة، والأجهزة المنظمة تحتاج إدارة مستندات المطابقة قبل الوصول.",
      },
      {
        en: "We provide protective packing, secure warehousing, DG-compliant battery shipping, and coordinated conformity documentation. Customs clearance completed as quickly as possible, with many shipments typically cleared within 24 hours depending on shipment type, documentation, customs requirements, and regulatory approvals.",
        ar: "نوفر تغليفاً واقياً وتخزيناً آمناً وشحن بطاريات متوافقاً مع اشتراطات البضائع الخطرة وتنسيقاً لمستندات المطابقة. ويُنجز التخليص الجمركي بأسرع وقت ممكن، إذ تُخلَّص العديد من الشحنات عادةً خلال 24 ساعة حسب نوع الشحنة والمستندات والمتطلبات الجمركية والموافقات التنظيمية.",
      },
    ],
    challenges: [
      { en: "Lithium battery dangerous-goods compliance (UN3480/UN3481)", ar: "الامتثال لاشتراطات بطاريات الليثيوم (UN3480/UN3481)" },
      { en: "High-value cargo security through the supply chain", ar: "أمن البضائع عالية القيمة عبر سلسلة الإمداد" },
      { en: "Conformity certificates for regulated devices", ar: "شهادات المطابقة للأجهزة الخاضعة للتنظيم" },
      { en: "Fragile products needing shock-protected packing", ar: "منتجات حساسة تتطلب تغليفاً مقاوماً للصدمات" },
    ],
    solutions: [
      { titleEn: "High-Value Air Freight", titleAr: "الشحن الجوي عالي القيمة", descEn: "Secure air freight for devices and components with chain-of-custody focus.", descAr: "شحن جوي آمن للأجهزة والمكونات مع تركيز على تسلسل العهدة.", serviceSlug: "air-freight" },
      { titleEn: "DG Battery Shipping", titleAr: "شحن البطاريات كبضائع خطرة", descEn: "Compliant handling and documentation for lithium-battery shipments.", descAr: "مناولة وتوثيق متوافقان لشحنات بطاريات الليثيوم.", serviceSlug: "dangerous-goods" },
      { titleEn: "Protective Packing & Crating", titleAr: "التغليف الواقي والتصنيد", descEn: "Shock-protected export packing for sensitive equipment and displays.", descAr: "تغليف تصديري مقاوم للصدمات للمعدات والشاشات الحساسة.", serviceSlug: "packaging-crating" },
      { titleEn: "Secure Warehousing", titleAr: "التخزين الآمن", descEn: "Controlled-access storage with serial-level inventory for high-value stock.", descAr: "تخزين بوصول مضبوط وجرد على مستوى الرقم التسلسلي للمخزون عالي القيمة.", serviceSlug: "warehousing" },
      { titleEn: "Conformity & Customs Coordination", titleAr: "تنسيق المطابقة والتخليص", descEn: "SABER shipment certificates and clearance paperwork for regulated electronics.", descAr: "شهادات سابر للشحنات ومستندات التخليص للإلكترونيات المنظمة.", serviceSlug: "customs-clearance" },
    ],
    relatedServiceSlugs: ["air-freight", "dangerous-goods", "packaging-crating", "warehousing", "customs-clearance"],
    faq: [
      {
        q: "Can you ship products containing lithium batteries?",
        a: "Yes. We handle lithium-battery shipments under the applicable dangerous-goods provisions, including correct packing, marking, labelling, and declarations for air and sea transport.",
        qAr: "هل تشحنون منتجات تحتوي بطاريات ليثيوم؟",
        aAr: "نعم. نتعامل مع شحنات بطاريات الليثيوم وفق أحكام البضائع الخطرة المعمول بها، بما يشمل التغليف والعلامات والملصقات والإقرارات الصحيحة للنقل الجوي والبحري.",
      },
      {
        q: "How do you secure high-value electronics shipments?",
        a: "We use trusted carriers, controlled-access warehousing, serial-level inventory checks, and continuous shipment visibility to reduce pilferage and handling risk.",
        qAr: "كيف تؤمنون شحنات الإلكترونيات عالية القيمة؟",
        aAr: "نعتمد ناقلين موثوقين وتخزيناً بوصول مضبوط وفحوصات جرد على مستوى الرقم التسلسلي ورؤية مستمرة للشحنة لتقليل مخاطر السرقة والمناولة.",
      },
      {
        q: "Do you manage conformity paperwork for devices?",
        a: "We coordinate SABER shipment certificates and advise on conformity documentation requirements for regulated device categories as part of import clearance.",
        qAr: "هل تديرون مستندات المطابقة للأجهزة؟",
        aAr: "ننسق شهادات سابر للشحنات ونقدم الإرشاد حول متطلبات مستندات المطابقة لفئات الأجهزة المنظمة ضمن تخليص الاستيراد.",
      },
    ],
    seoTitle: "Electronics Logistics in Saudi Arabia | ENVOD KINGDOM",
    seoDescription: "Electronics logistics in Saudi Arabia — secure high-value air freight, lithium battery DG compliance, protective packing, secure warehousing, and conformity coordination.",
  },
  {
    slug: "aerospace-logistics",
    icon: "Rocket",
    accentHex: "#0EA5E9",
    gradient: G("#03151f", "#0A2342"),
    nameEn: "Aerospace Logistics",
    nameAr: "لوجستيات الطيران والفضاء",
    shortEn: "AOG spares, aircraft components, and airshow logistics for aviation operators, MROs, and suppliers.",
    shortAr: "قطع غيار الطائرات المتوقفة ومكونات الطيران ولوجستيات معارض الطيران للمشغلين ومراكز الصيانة والموردين.",
    introEn: "When an aircraft is on ground, every hour counts. ENVOD KINGDOM supports aviation operators, MRO providers, and aerospace suppliers in Saudi Arabia with time-critical spares movement, oversized component transport, and event logistics for airshows.",
    introAr: "عندما تتوقف طائرة على الأرض، كل ساعة لها ثمن. تدعم إنفود كينجدم مشغلي الطيران ومزودي الصيانة وموردي قطاع الطيران في السعودية بنقل قطع الغيار الحرجة والمكونات الضخمة ولوجستيات معارض الطيران.",
    overview: [
      {
        en: "Aerospace logistics splits into two very different jobs: urgent AOG (aircraft-on-ground) spares that need door-to-door speed with full traceability, and planned moves of engines, landing gear, and ground-support equipment that need specialised crating, tilt-monitoring, and careful lifting.",
        ar: "تنقسم لوجستيات الطيران إلى مهمتين مختلفتين: قطع غيار عاجلة للطائرات المتوقفة تتطلب سرعة من الباب إلى الباب مع تتبع كامل، ونقل مخطط للمحركات ومعدات الهبوط ومعدات الدعم الأرضي يتطلب تصنيداً متخصصاً ومراقبة للميل ورفعاً بعناية.",
      },
      {
        en: "Saudi Arabia's aviation ambitions — new carriers, expanding airports, and events like the World Defense Show — are growing demand for both. We support suppliers with express spares handling, project moves, and ATA Carnet processing for demo equipment. Customs clearance completed as quickly as possible, with many shipments typically cleared within 24 hours depending on shipment type, documentation, customs requirements, and regulatory approvals.",
        ar: "طموحات المملكة في الطيران — ناقلات جديدة ومطارات متوسعة وفعاليات مثل معرض الدفاع العالمي — تزيد الطلب على النوعين. ندعم الموردين بمناولة سريعة لقطع الغيار ونقل المشاريع ومعالجة كارنيه ATA لمعدات العرض. ويُنجز التخليص الجمركي بأسرع وقت ممكن، إذ تُخلَّص العديد من الشحنات عادةً خلال 24 ساعة حسب نوع الشحنة والمستندات والمتطلبات الجمركية والموافقات التنظيمية.",
      },
    ],
    challenges: [
      { en: "AOG situations demanding round-the-clock coordination", ar: "حالات توقف الطائرات تتطلب تنسيقاً على مدار الساعة" },
      { en: "Oversized engines and components needing special handling", ar: "محركات ومكونات ضخمة تحتاج مناولة خاصة" },
      { en: "Temporary imports for airshows and demo equipment", ar: "الاستيراد المؤقت لمعارض الطيران ومعدات العرض" },
      { en: "Full traceability and documentation for certified parts", ar: "تتبع وتوثيق كاملان للقطع المعتمدة" },
    ],
    solutions: [
      { titleEn: "AOG Express Spares", titleAr: "قطع الغيار العاجلة للطائرات المتوقفة", descEn: "Time-critical door-to-door movement of aircraft spares with priority handling.", descAr: "نقل عاجل من الباب إلى الباب لقطع غيار الطائرات بمناولة ذات أولوية.", serviceSlug: "express-courier" },
      { titleEn: "Component Air Freight", titleAr: "الشحن الجوي للمكونات", descEn: "Chartered and scheduled air freight for engines, APUs, and rotables.", descAr: "شحن جوي مستأجر ومجدول للمحركات ووحدات الطاقة والقطع الدوارة.", serviceSlug: "air-freight" },
      { titleEn: "Specialised Crating", titleAr: "التصنيد المتخصص", descEn: "Engineered crates and shock-protected packing for sensitive aerospace hardware.", descAr: "صناديق مصممة هندسياً وتغليف مقاوم للصدمات لمعدات الطيران الحساسة.", serviceSlug: "packaging-crating" },
      { titleEn: "ATA Carnet for Airshows", titleAr: "كارنيه ATA لمعارض الطيران", descEn: "Temporary import processing for demo aircraft equipment and exhibition stands.", descAr: "معالجة الاستيراد المؤقت لمعدات العرض وأجنحة المعارض.", serviceSlug: "ata-carnet" },
      { titleEn: "Project & Oversized Moves", titleAr: "النقل الضخم ونقل المشاريع", descEn: "Ground-support equipment and oversized component transport with route planning.", descAr: "نقل معدات الدعم الأرضي والمكونات الضخمة مع تخطيط المسارات.", serviceSlug: "oog-cargo" },
    ],
    relatedServiceSlugs: ["express-courier", "air-freight", "packaging-crating", "ata-carnet", "oog-cargo"],
    faq: [
      {
        q: "Can you handle AOG shipments outside working hours?",
        a: "AOG cases are treated as priority movements. Contact us via WhatsApp for urgent coordination — we align pickup, uplift, and clearance to get parts moving as quickly as the situation allows.",
        qAr: "هل تتعاملون مع شحنات الطائرات المتوقفة خارج أوقات الدوام؟",
        aAr: "تُعامل حالات توقف الطائرات كتحركات ذات أولوية. تواصلوا معنا عبر واتساب للتنسيق العاجل — ننسق الاستلام والشحن والتخليص لتحريك القطع بأسرع ما تسمح به الحالة.",
      },
      {
        q: "Do you support airshow and defence exhibition logistics?",
        a: "Yes. We handle exhibition logistics and ATA Carnet temporary imports for aviation and defence events in Saudi Arabia, including stand materials and demo equipment.",
        qAr: "هل تدعمون لوجستيات معارض الطيران والدفاع؟",
        aAr: "نعم. نتولى لوجستيات المعارض والاستيراد المؤقت بكارنيه ATA لفعاليات الطيران والدفاع في السعودية، بما يشمل مواد الأجنحة ومعدات العرض.",
      },
      {
        q: "Can you move aircraft engines and large components?",
        a: "We arrange specialised crating, tilt- and shock-monitored transport, and careful lifting for engines, landing gear, and other oversized aerospace hardware.",
        qAr: "هل تنقلون محركات الطائرات والمكونات الكبيرة؟",
        aAr: "نرتب التصنيد المتخصص والنقل المراقب للميل والصدمات والرفع بعناية للمحركات ومعدات الهبوط وغيرها من المعدات الضخمة.",
      },
    ],
    seoTitle: "Aerospace Logistics in Saudi Arabia | ENVOD KINGDOM",
    seoDescription: "Aerospace logistics in Saudi Arabia — AOG express spares, aircraft component air freight, specialised crating, ATA Carnet for airshows, and oversized aviation moves.",
  },
  {
    slug: "hospitality-logistics",
    icon: "Hotel",
    accentHex: "#EAB308",
    gradient: G("#1c1503", "#0A2342"),
    nameEn: "Hospitality Logistics",
    nameAr: "لوجستيات الضيافة",
    shortEn: "Hotel FF&E, pre-opening programmes, and white glove installation for hotels, resorts, and restaurants.",
    shortAr: "أثاث وتجهيزات الفنادق وبرامج ما قبل الافتتاح والتركيب الفاخر للفنادق والمنتجعات والمطاعم.",
    introEn: "Saudi Arabia is opening hotels at record pace. ENVOD KINGDOM supports hotel operators, FF&E procurement teams, and fit-out contractors with consolidated imports, staged warehousing, and floor-by-floor white glove delivery.",
    introAr: "تفتتح السعودية الفنادق بوتيرة قياسية. تدعم إنفود كينجدم مشغلي الفنادق وفرق مشتريات الأثاث والتجهيزات ومقاولي التشطيب بواردات مجمعة وتخزين مرحلي وتسليم فاخر طابقاً بطابق.",
    overview: [
      {
        en: "Hospitality logistics peaks at pre-opening: hundreds of containers of furniture, fixtures, and equipment (FF&E) and operating supplies (OS&E) arriving from dozens of vendors, all needing consolidation, staging, and sequenced delivery to site as floors complete.",
        ar: "تبلغ لوجستيات الضيافة ذروتها قبل الافتتاح: مئات الحاويات من الأثاث والتجهيزات والمعدات ومستلزمات التشغيل تصل من عشرات الموردين، وكلها تحتاج تجميعاً وتخزيناً مرحلياً وتسليماً متسلسلاً للموقع مع اكتمال الطوابق.",
      },
      {
        en: "We consolidate vendor shipments, manage staged warehousing, and deliver room-by-room with unpacking, placement, and debris removal — the white glove standard hotel openings demand. Customs clearance completed as quickly as possible, with many shipments typically cleared within 24 hours depending on shipment type, documentation, customs requirements, and regulatory approvals.",
        ar: "نجمع شحنات الموردين وندير التخزين المرحلي ونسلم غرفة بغرفة مع الفك والتموضع وإزالة المخلفات — وهو معيار الخدمة الفاخرة الذي تتطلبه افتتاحات الفنادق. ويُنجز التخليص الجمركي بأسرع وقت ممكن، إذ تُخلَّص العديد من الشحنات عادةً خلال 24 ساعة حسب نوع الشحنة والمستندات والمتطلبات الجمركية والموافقات التنظيمية.",
      },
    ],
    challenges: [
      { en: "Multi-vendor FF&E consolidation from many origins", ar: "تجميع أثاث وتجهيزات من موردين ومناشئ متعددين" },
      { en: "Sequenced deliveries matched to fit-out progress", ar: "تسليم متسلسل يواكب تقدم أعمال التشطيب" },
      { en: "High-value furniture needing careful inside delivery", ar: "أثاث عالي القيمة يتطلب توصيلاً داخلياً بعناية" },
      { en: "Fixed opening dates with no room for slippage", ar: "تواريخ افتتاح ثابتة لا تحتمل التأجيل" },
    ],
    solutions: [
      { titleEn: "FF&E Consolidation", titleAr: "تجميع الأثاث والتجهيزات", descEn: "Multi-origin vendor consolidation into managed shipments for hotel projects.", descAr: "تجميع الموردين متعددي المناشئ في شحنات مُدارة لمشاريع الفنادق.", serviceSlug: "freight-forwarding" },
      { titleEn: "Pre-Opening Warehousing", titleAr: "التخزين لما قبل الافتتاح", descEn: "Staged storage with room-level tagging ready for sequenced site delivery.", descAr: "تخزين مرحلي بترميز على مستوى الغرف جاهز للتسليم المتسلسل للموقع.", serviceSlug: "warehousing" },
      { titleEn: "White Glove Installation", titleAr: "التسليم والتركيب الفاخر", descEn: "Inside delivery, unpacking, placement, and setup floor by floor.", descAr: "توصيل داخلي وفك وتموضع وتركيب طابقاً بطابق.", serviceSlug: "white-glove-logistics" },
      { titleEn: "Hotel Project Cargo", titleAr: "بضائع مشاريع الفنادق", descEn: "Kitchens, laundry plant, and back-of-house equipment moves with lifting plans.", descAr: "نقل المطابخ ومعدات المغاسل وتجهيزات الخدمات مع خطط الرفع.", serviceSlug: "project-cargo" },
      { titleEn: "F&B Supply Logistics", titleAr: "لوجستيات إمدادات الأغذية", descEn: "Temperature-controlled supply chains for restaurant and banqueting operations.", descAr: "سلاسل إمداد مبردة لعمليات المطاعم والولائم.", serviceSlug: "temperature-controlled-logistics" },
    ],
    relatedServiceSlugs: ["white-glove-logistics", "warehousing", "project-cargo", "freight-forwarding", "temperature-controlled-logistics"],
    faq: [
      {
        q: "Can you manage a full hotel pre-opening programme?",
        a: "Yes. We consolidate vendor shipments, clear imports, stage FF&E and OS&E in our warehousing, and deliver in sequence as floors are handed over — coordinated with your project team.",
        qAr: "هل تديرون برنامج ما قبل افتتاح فندق كاملاً؟",
        aAr: "نعم. نجمع شحنات الموردين ونخلص الواردات ونخزن الأثاث والتجهيزات مرحلياً ونسلم بالتسلسل مع تسليم الطوابق — بالتنسيق مع فريق مشروعكم.",
      },
      {
        q: "Do you deliver inside the property?",
        a: "Our white glove service covers inside delivery, unpacking, placement in the designated room or area, light assembly, and packaging removal.",
        qAr: "هل توصلون داخل المنشأة؟",
        aAr: "تشمل خدمتنا الفاخرة التوصيل الداخلي والفك والتموضع في الغرفة أو المنطقة المحددة والتجميع الخفيف وإزالة مواد التغليف.",
      },
      {
        q: "Can you support resorts in remote destinations?",
        a: "We plan multi-leg deliveries to coastal and remote resort destinations, aligning transport modes and site access requirements with your construction schedule.",
        qAr: "هل تدعمون منتجعات في وجهات نائية؟",
        aAr: "نخطط عمليات تسليم متعددة المراحل للوجهات الساحلية والنائية، بمواءمة وسائل النقل ومتطلبات الوصول للموقع مع جدول الإنشاء.",
      },
    ],
    seoTitle: "Hospitality Logistics in Saudi Arabia | ENVOD KINGDOM",
    seoDescription: "Hospitality & hotel logistics in Saudi Arabia — FF&E consolidation, pre-opening warehousing, white glove installation, and project cargo for hotels, resorts, and restaurants.",
  },
  {
    slug: "furniture-logistics",
    icon: "Armchair",
    accentHex: "#8B5CF6",
    gradient: G("#120826", "#0A2342"),
    nameEn: "Furniture Logistics",
    nameAr: "لوجستيات الأثاث",
    shortEn: "Furniture imports, showroom distribution, and white glove home delivery for retailers and designers.",
    shortAr: "استيراد الأثاث وتوزيع المعارض والتوصيل المنزلي الفاخر لتجار التجزئة والمصممين.",
    introEn: "Furniture is bulky, fragile, and unforgiving of poor handling. ENVOD KINGDOM moves furniture for retailers, interior designers, and project fit-outs — from container imports to assembled placement in the customer's room.",
    introAr: "الأثاث ضخم وحساس ولا يغفر سوء المناولة. تنقل إنفود كينجدم الأثاث لتجار التجزئة والمصممين ومشاريع التشطيب — من الاستيراد بالحاويات إلى التركيب والتموضع في غرفة العميل.",
    overview: [
      {
        en: "Furniture logistics combines volume shipping economics with delicate last-mile execution. Flat-packed lines move efficiently in containers, while assembled and designer pieces need blanket wrapping, crating, and two-person inside delivery to arrive unmarked.",
        ar: "تجمع لوجستيات الأثاث بين اقتصاديات الشحن بالحجم والتنفيذ الدقيق للمرحلة الأخيرة. فالخطوط المفككة تُنقل بكفاءة في الحاويات، بينما تحتاج القطع المجمعة والتصميمية لفاً بالبطانيات وتصنيداً وتوصيلاً داخلياً بفريق مزدوج لتصل دون خدش.",
      },
      {
        en: "We handle container imports, showroom and DC warehousing, scheduled store distribution, and white glove home delivery with assembly. Customs clearance completed as quickly as possible, with many shipments typically cleared within 24 hours depending on shipment type, documentation, customs requirements, and regulatory approvals.",
        ar: "نتولى الاستيراد بالحاويات وتخزين المعارض ومراكز التوزيع والتوزيع المجدول للمتاجر والتوصيل المنزلي الفاخر مع التجميع. ويُنجز التخليص الجمركي بأسرع وقت ممكن، إذ تُخلَّص العديد من الشحنات عادةً خلال 24 ساعة حسب نوع الشحنة والمستندات والمتطلبات الجمركية والموافقات التنظيمية.",
      },
    ],
    challenges: [
      { en: "Bulky items with high per-unit damage cost", ar: "قطع ضخمة بتكلفة تلف مرتفعة لكل وحدة" },
      { en: "Home deliveries requiring assembly and placement", ar: "توصيل منزلي يتطلب تجميعاً وتموضعاً" },
      { en: "Mixed flat-pack and assembled inventory profiles", ar: "مخزون مختلط بين المفكك والمجمع" },
      { en: "Showroom launches tied to collection arrivals", ar: "إطلاقات معارض مرتبطة بوصول المجموعات" },
    ],
    solutions: [
      { titleEn: "Container Imports", titleAr: "الاستيراد بالحاويات", descEn: "FCL/LCL ocean freight for furniture lines from global manufacturing origins.", descAr: "شحن بحري بحاويات كاملة وجزئية لخطوط الأثاث من مناشئ التصنيع العالمية.", serviceSlug: "ocean-freight" },
      { titleEn: "Furniture Warehousing", titleAr: "تخزين الأثاث", descEn: "Clean, racked storage with piece-level tracking for showroom and DC stock.", descAr: "تخزين نظيف على أرفف بتتبع لكل قطعة لمخزون المعارض ومراكز التوزيع.", serviceSlug: "warehousing" },
      { titleEn: "White Glove Home Delivery", titleAr: "التوصيل المنزلي الفاخر", descEn: "Two-person inside delivery, unpacking, assembly, placement, and debris removal.", descAr: "توصيل داخلي بفريق مزدوج وفك وتجميع وتموضع وإزالة المخلفات.", serviceSlug: "white-glove-logistics" },
      { titleEn: "Crating for Designer Pieces", titleAr: "تصنيد القطع التصميمية", descEn: "Custom crates and blanket-wrap protection for high-value and fragile items.", descAr: "صناديق مخصصة وحماية بالبطانيات للقطع عالية القيمة والحساسة.", serviceSlug: "packaging-crating" },
      { titleEn: "Store & Project Distribution", titleAr: "التوزيع للمتاجر والمشاريع", descEn: "Scheduled deliveries to showrooms, stores, and fit-out sites across the Kingdom.", descAr: "توصيل مجدول للمعارض والمتاجر ومواقع التشطيب في أنحاء المملكة.", serviceSlug: "gcc-transportation" },
    ],
    relatedServiceSlugs: ["white-glove-logistics", "ocean-freight", "warehousing", "packaging-crating", "relocation"],
    faq: [
      {
        q: "Do you offer home delivery with assembly?",
        a: "Yes. Our white glove teams deliver inside the home, unpack, assemble, place items in the chosen room, and remove all packaging debris.",
        qAr: "هل توفرون توصيلاً منزلياً مع التجميع؟",
        aAr: "نعم. تقوم فرقنا الفاخرة بالتوصيل داخل المنزل والفك والتجميع ووضع القطع في الغرفة المختارة وإزالة كل مخلفات التغليف.",
      },
      {
        q: "How do you protect furniture from transit damage?",
        a: "We combine export packing at origin, careful container loading, blanket wrapping, and custom crating for fragile or high-value pieces.",
        qAr: "كيف تحمون الأثاث من أضرار النقل؟",
        aAr: "نمزج بين التغليف التصديري في المنشأ والتحميل الدقيق للحاويات واللف بالبطانيات والتصنيد المخصص للقطع الحساسة أو عالية القيمة.",
      },
      {
        q: "Can you support furniture retailers with regular imports?",
        a: "We run recurring container programmes with clearance, warehousing, and store replenishment, so collections arrive predictably each season.",
        qAr: "هل تدعمون تجار الأثاث بواردات منتظمة؟",
        aAr: "ننفذ برامج حاويات دورية تشمل التخليص والتخزين وتجديد المتاجر، لتصل المجموعات بانتظام كل موسم.",
      },
    ],
    seoTitle: "Furniture Logistics in Saudi Arabia | ENVOD KINGDOM",
    seoDescription: "Furniture logistics in Saudi Arabia — container imports, furniture warehousing, showroom distribution, custom crating, and white glove home delivery with assembly.",
  },
  {
    slug: "chemical-logistics",
    icon: "FlaskConical",
    accentHex: "#EF4444",
    gradient: G("#1c0606", "#0A2342"),
    nameEn: "Chemical Logistics",
    nameAr: "لوجستيات الكيماويات",
    shortEn: "Compliant dangerous goods handling, documentation, and transport for chemical producers and importers.",
    shortAr: "مناولة متوافقة للبضائع الخطرة وتوثيق ونقل لمنتجي ومستوردي الكيماويات.",
    introEn: "Chemicals demand discipline: correct classification, compliant packing, and complete documentation at every step. ENVOD KINGDOM moves industrial chemicals, coatings, and laboratory reagents for producers, importers, and distributors in Saudi Arabia.",
    introAr: "الكيماويات تتطلب انضباطاً: تصنيف صحيح وتغليف متوافق وتوثيق كامل في كل خطوة. تنقل إنفود كينجدم الكيماويات الصناعية والدهانات والكواشف المخبرية للمنتجين والمستوردين والموزعين في السعودية.",
    overview: [
      {
        en: "Chemical logistics is governed by classification: the UN number, packing group, and hazard class of each product determine how it may be packed, documented, stowed, and moved. Errors cause rejected bookings, port holds, and safety risk.",
        ar: "تحكم لوجستيات الكيماويات قواعد التصنيف: فرقم الأمم المتحدة ومجموعة التعبئة وفئة الخطورة لكل منتج تحدد طريقة تعبئته وتوثيقه وتستيفه ونقله. والأخطاء تسبب رفض الحجوزات واحتجاز الشحنات في الموانئ ومخاطر على السلامة.",
      },
      {
        en: "Our team manages MSDS review, DG declarations, compliant packing, and coordination with SFDA, SASO, or other authority requirements where applicable. Customs clearance completed as quickly as possible, with many shipments typically cleared within 24 hours depending on shipment type, documentation, customs requirements, and regulatory approvals.",
        ar: "يدير فريقنا مراجعة نشرات سلامة المواد وإقرارات البضائع الخطرة والتغليف المتوافق والتنسيق مع متطلبات الجهات المختصة عند الانطباق. ويُنجز التخليص الجمركي بأسرع وقت ممكن، إذ تُخلَّص العديد من الشحنات عادةً خلال 24 ساعة حسب نوع الشحنة والمستندات والمتطلبات الجمركية والموافقات التنظيمية.",
      },
    ],
    challenges: [
      { en: "Correct UN classification and DG declarations", ar: "التصنيف الصحيح وفق الأمم المتحدة وإقرارات البضائع الخطرة" },
      { en: "Authority approvals for regulated substances", ar: "موافقات الجهات المختصة للمواد المنظمة" },
      { en: "Segregation rules for incompatible cargo", ar: "قواعد الفصل بين البضائع غير المتوافقة" },
      { en: "Temperature-sensitive formulations in Gulf heat", ar: "تركيبات حساسة للحرارة في مناخ الخليج" },
    ],
    solutions: [
      { titleEn: "Dangerous Goods Shipping", titleAr: "شحن البضائع الخطرة", descEn: "IMDG/IATA-compliant handling, declarations, and booking for classified chemicals.", descAr: "مناولة وإقرارات وحجوزات متوافقة مع IMDG/IATA للكيماويات المصنفة.", serviceSlug: "dangerous-goods" },
      { titleEn: "Compliant Packing", titleAr: "التغليف المتوافق", descEn: "UN-specification packaging, labelling, and marking for hazardous products.", descAr: "عبوات وملصقات وعلامات وفق مواصفات الأمم المتحدة للمنتجات الخطرة.", serviceSlug: "packaging-crating" },
      { titleEn: "Temperature-Controlled Transport", titleAr: "النقل المبرد", descEn: "Reefer solutions for heat-sensitive formulations and specialty chemicals.", descAr: "حلول مبردة للتركيبات الحساسة للحرارة والكيماويات المتخصصة.", serviceSlug: "temperature-controlled-logistics" },
      { titleEn: "Import Clearance & Permits", titleAr: "تخليص الاستيراد والتصاريح", descEn: "HS classification, authority coordination, and clearance for chemical imports.", descAr: "التصنيف الجمركي والتنسيق مع الجهات والتخليص لواردات الكيماويات.", serviceSlug: "customs-clearance" },
      { titleEn: "Bulk & Project Moves", titleAr: "النقل بالجملة ونقل المشاريع", descEn: "IBC, drum, and ISO-tank coordination plus plant-equipment project cargo.", descAr: "تنسيق الحاويات الوسيطة والبراميل وصهاريج ISO وبضائع معدات المصانع.", serviceSlug: "project-cargo" },
    ],
    relatedServiceSlugs: ["dangerous-goods", "customs-clearance", "temperature-controlled-logistics", "packaging-crating", "project-cargo"],
    faq: [
      {
        q: "Which hazard classes can you handle?",
        a: "We handle the common industrial classes — including flammables, corrosives, oxidisers, and miscellaneous class 9 — subject to carrier acceptance and applicable regulations. Share your MSDS and we will confirm routing options.",
        qAr: "ما فئات الخطورة التي تتعاملون معها؟",
        aAr: "نتعامل مع الفئات الصناعية الشائعة — بما فيها القابلة للاشتعال والأكّالة والمؤكسدات والفئة 9 — وفق قبول الناقل واللوائح المعمول بها. شاركونا نشرة سلامة المادة وسنؤكد خيارات النقل.",
      },
      {
        q: "Do you review our MSDS documentation?",
        a: "Yes. We review MSDS sheets to confirm UN numbers, packing groups, and documentation requirements before booking, reducing the risk of rejections and holds.",
        qAr: "هل تراجعون نشرات سلامة المواد لدينا؟",
        aAr: "نعم. نراجع النشرات للتأكد من أرقام الأمم المتحدة ومجموعات التعبئة ومتطلبات التوثيق قبل الحجز، لتقليل مخاطر الرفض والاحتجاز.",
      },
      {
        q: "Can you transport heat-sensitive chemicals in summer?",
        a: "We arrange temperature-controlled transport and storage for formulations that degrade in Gulf summer conditions, maintaining your specified range end to end.",
        qAr: "هل تنقلون كيماويات حساسة للحرارة صيفاً؟",
        aAr: "نرتب نقلاً وتخزيناً مبردين للتركيبات التي تتأثر بحرارة صيف الخليج، مع الحفاظ على النطاق المحدد من البداية للنهاية.",
      },
    ],
    seoTitle: "Chemical Logistics in Saudi Arabia | ENVOD KINGDOM",
    seoDescription: "Chemical & dangerous goods logistics in Saudi Arabia — IMDG/IATA-compliant DG shipping, UN-spec packing, temperature-controlled transport, and chemical import clearance.",
  },
  {
    slug: "telecommunications-logistics",
    icon: "RadioTower",
    accentHex: "#14B8A6",
    gradient: G("#04211d", "#0A2342"),
    nameEn: "Telecommunications Logistics",
    nameAr: "لوجستيات الاتصالات",
    shortEn: "Network equipment, tower components, and data-centre hardware logistics for operators and integrators.",
    shortAr: "لوجستيات معدات الشبكات ومكونات الأبراج وأجهزة مراكز البيانات للمشغلين والمتكاملين.",
    introEn: "Network rollouts live or die on site-ready kit. ENVOD KINGDOM moves telecom equipment — from radio units and antennas to racks and data-centre hardware — for operators, vendors, and system integrators across Saudi Arabia.",
    introAr: "نجاح نشر الشبكات يعتمد على جاهزية المعدات في الموقع. تنقل إنفود كينجدم معدات الاتصالات — من وحدات الراديو والهوائيات إلى الخزائن وأجهزة مراكز البيانات — للمشغلين والموردين والمتكاملين في السعودية.",
    overview: [
      {
        en: "Telecom logistics pairs high-value electronics handling with distributed field delivery: thousands of sites, staged rollout waves, and swap programmes that generate reverse logistics. Data-centre builds add heavy, sensitive racks needing specialised handling and tilt monitoring.",
        ar: "تجمع لوجستيات الاتصالات بين مناولة الإلكترونيات عالية القيمة والتوصيل الميداني الموزع: آلاف المواقع وموجات نشر مرحلية وبرامج استبدال تولّد لوجستيات عكسية. وتضيف مشاريع مراكز البيانات خزائن ثقيلة وحساسة تتطلب مناولة متخصصة ومراقبة للميل.",
      },
      {
        en: "We provide import clearance with conformity coordination, staged warehousing by rollout wave, site deliveries, and return-unit consolidation. Customs clearance completed as quickly as possible, with many shipments typically cleared within 24 hours depending on shipment type, documentation, customs requirements, and regulatory approvals.",
        ar: "نوفر تخليص الواردات مع تنسيق المطابقة والتخزين المرحلي حسب موجات النشر والتوصيل للمواقع وتجميع الوحدات المرتجعة. ويُنجز التخليص الجمركي بأسرع وقت ممكن، إذ تُخلَّص العديد من الشحنات عادةً خلال 24 ساعة حسب نوع الشحنة والمستندات والمتطلبات الجمركية والموافقات التنظيمية.",
      },
    ],
    challenges: [
      { en: "Rollout waves needing staged, site-level delivery", ar: "موجات نشر تتطلب تسليماً مرحلياً على مستوى المواقع" },
      { en: "High-value, serial-tracked hardware security", ar: "أمن أجهزة عالية القيمة متتبعة بالأرقام التسلسلية" },
      { en: "Conformity requirements for radio equipment", ar: "متطلبات المطابقة لمعدات الراديو" },
      { en: "Heavy racks and batteries with special handling rules", ar: "خزائن ثقيلة وبطاريات بقواعد مناولة خاصة" },
    ],
    solutions: [
      { titleEn: "Network Equipment Imports", titleAr: "استيراد معدات الشبكات", descEn: "Air and ocean programmes for radio, transmission, and core network hardware.", descAr: "برامج جوية وبحرية لمعدات الراديو والإرسال والشبكة الأساسية.", serviceSlug: "freight-forwarding" },
      { titleEn: "Rollout Warehousing", titleAr: "تخزين موجات النشر", descEn: "Staged storage with serial-level control, kitting, and wave-based dispatch.", descAr: "تخزين مرحلي بضبط تسلسلي وتجهيز حزم وإرسال حسب الموجات.", serviceSlug: "warehousing" },
      { titleEn: "Site & Tower Deliveries", titleAr: "التوصيل للمواقع والأبراج", descEn: "Distributed field delivery to urban rooftops and remote tower sites.", descAr: "توصيل ميداني موزع لأسطح المدن ومواقع الأبراج النائية.", serviceSlug: "gcc-transportation" },
      { titleEn: "Data-Centre Hardware Moves", titleAr: "نقل أجهزة مراكز البيانات", descEn: "Shock- and tilt-monitored transport and positioning for racks and servers.", descAr: "نقل وتموضع مراقبان للصدمات والميل للخزائن والخوادم.", serviceSlug: "white-glove-logistics" },
      { titleEn: "DG Battery Handling", titleAr: "مناولة البطاريات الخطرة", descEn: "Compliant shipping for lithium backup batteries and power systems.", descAr: "شحن متوافق لبطاريات الليثيوم الاحتياطية وأنظمة الطاقة.", serviceSlug: "dangerous-goods" },
    ],
    relatedServiceSlugs: ["freight-forwarding", "warehousing", "white-glove-logistics", "dangerous-goods", "express-courier"],
    faq: [
      {
        q: "Can you deliver to remote tower sites?",
        a: "Yes. We plan field-delivery routes for tower sites across the Kingdom, including remote and desert locations, coordinating access and offloading with your rollout teams.",
        qAr: "هل توصلون إلى مواقع أبراج نائية؟",
        aAr: "نعم. نخطط مسارات التوصيل الميداني لمواقع الأبراج في أنحاء المملكة، بما فيها المواقع النائية والصحراوية، بالتنسيق مع فرق النشر لديكم.",
      },
      {
        q: "How do you handle data-centre rack deliveries?",
        a: "Racks move on air-ride, tilt-monitored transport with white glove positioning into the data hall — including ramp access checks and final placement.",
        qAr: "كيف تتعاملون مع تسليم خزائن مراكز البيانات؟",
        aAr: "تُنقل الخزائن بنقل مراقب للميل وبتعليق هوائي مع تموضع فاخر داخل قاعة البيانات — بما يشمل فحص المنحدرات والتموضع النهائي.",
      },
      {
        q: "Do you manage return and swap-out units?",
        a: "We consolidate removed units from sites, manage serial-level reconciliation, and arrange storage, redeployment, or re-export as required.",
        qAr: "هل تديرون الوحدات المرتجعة والمستبدلة؟",
        aAr: "نجمع الوحدات المزالة من المواقع وندير المطابقة التسلسلية ونرتب التخزين أو إعادة النشر أو إعادة التصدير حسب الحاجة.",
      },
    ],
    seoTitle: "Telecommunications Logistics in Saudi Arabia | ENVOD KINGDOM",
    seoDescription: "Telecom logistics in Saudi Arabia — network equipment imports, rollout warehousing, tower site deliveries, data-centre hardware moves, and DG battery handling.",
  },
  {
    slug: "government-logistics",
    icon: "Landmark",
    accentHex: "#94A3B8",
    gradient: G("#0d1420", "#0A2342"),
    nameEn: "Government Logistics",
    nameAr: "اللوجستيات الحكومية",
    shortEn: "Tender-compliant logistics for suppliers and contractors serving ministries, agencies, and public projects.",
    shortAr: "لوجستيات متوافقة مع المناقصات للموردين والمقاولين الذين يخدمون الوزارات والجهات والمشاريع العامة.",
    introEn: "Public-sector deliveries carry their own rules: tender terms, documented chains of custody, and precise delivery protocols. ENVOD KINGDOM supports suppliers and contractors delivering goods and equipment to government entities across Saudi Arabia.",
    introAr: "التسليم للقطاع العام له قواعده: شروط المناقصات وسلاسل عهدة موثقة وبروتوكولات تسليم دقيقة. تدعم إنفود كينجدم الموردين والمقاولين الذين يوردون البضائع والمعدات للجهات الحكومية في السعودية.",
    overview: [
      {
        en: "Government logistics is documentation-first: delivery notes matching purchase orders, inspection-ready consignments, and receiving procedures that vary by entity. Suppliers winning public tenders need a logistics partner who treats paperwork as seriously as transport.",
        ar: "اللوجستيات الحكومية تبدأ بالمستندات: إشعارات تسليم مطابقة لأوامر الشراء وشحنات جاهزة للفحص وإجراءات استلام تختلف بين الجهات. والموردون الفائزون بالمناقصات العامة يحتاجون شريكاً لوجستياً يتعامل مع المستندات بجدية النقل نفسها.",
      },
      {
        en: "We support tender suppliers with import clearance, compliant documentation, secure warehousing, and coordinated deliveries to ministries, universities, hospitals, and public projects — including event and exhibition logistics for government-hosted programmes. Customs clearance completed as quickly as possible, with many shipments typically cleared within 24 hours depending on shipment type, documentation, customs requirements, and regulatory approvals.",
        ar: "ندعم موردي المناقصات بتخليص الواردات والتوثيق المتوافق والتخزين الآمن والتسليم المنسق للوزارات والجامعات والمستشفيات والمشاريع العامة — بما يشمل لوجستيات الفعاليات والمعارض للبرامج الحكومية. ويُنجز التخليص الجمركي بأسرع وقت ممكن، إذ تُخلَّص العديد من الشحنات عادةً خلال 24 ساعة حسب نوع الشحنة والمستندات والمتطلبات الجمركية والموافقات التنظيمية.",
      },
    ],
    challenges: [
      { en: "Tender delivery terms with strict documentation", ar: "شروط تسليم مناقصات بتوثيق صارم" },
      { en: "Entity-specific receiving and inspection procedures", ar: "إجراءات استلام وفحص تختلف بين الجهات" },
      { en: "Multi-site deliveries across regions and cities", ar: "تسليم متعدد المواقع عبر المناطق والمدن" },
      { en: "Sensitive equipment needing secure handling", ar: "معدات حساسة تتطلب مناولة آمنة" },
    ],
    solutions: [
      { titleEn: "Tender Delivery Coordination", titleAr: "تنسيق تسليم المناقصات", descEn: "PO-matched documentation, inspection-ready consignments, and delivery protocols.", descAr: "توثيق مطابق لأوامر الشراء وشحنات جاهزة للفحص وبروتوكولات تسليم.", serviceSlug: "supply-chain" },
      { titleEn: "Import Clearance", titleAr: "تخليص الواردات", descEn: "Clean clearance with exemption handling where applicable for public-sector goods.", descAr: "تخليص سليم مع معالجة الإعفاءات عند الانطباق لبضائع القطاع العام.", serviceSlug: "customs-clearance" },
      { titleEn: "Secure Warehousing", titleAr: "التخزين الآمن", descEn: "Controlled-access storage and staging ahead of scheduled handovers.", descAr: "تخزين بوصول مضبوط وتجهيز قبل مواعيد التسليم المجدولة.", serviceSlug: "warehousing" },
      { titleEn: "Multi-Region Distribution", titleAr: "التوزيع متعدد المناطق", descEn: "Coordinated deliveries to entities across Riyadh, Jeddah, Dammam, and beyond.", descAr: "تسليم منسق للجهات في الرياض وجدة والدمام وغيرها.", serviceSlug: "gcc-transportation" },
      { titleEn: "Event & Exhibition Support", titleAr: "دعم الفعاليات والمعارض", descEn: "Logistics for government-hosted conferences, exhibitions, and national events.", descAr: "لوجستيات المؤتمرات والمعارض والفعاليات الوطنية التي تستضيفها الجهات الحكومية.", serviceSlug: "exhibition-logistics" },
    ],
    relatedServiceSlugs: ["customs-clearance", "supply-chain", "warehousing", "exhibition-logistics", "project-cargo"],
    faq: [
      {
        q: "Do you work directly with government entities?",
        a: "We primarily support the suppliers and contractors who hold government contracts — handling their import, storage, and delivery obligations in line with tender terms.",
        qAr: "هل تتعاملون مباشرة مع الجهات الحكومية؟",
        aAr: "ندعم بشكل أساسي الموردين والمقاولين الحاصلين على عقود حكومية — بإدارة التزاماتهم في الاستيراد والتخزين والتسليم وفق شروط المناقصات.",
      },
      {
        q: "Can you match deliveries to purchase-order requirements?",
        a: "Yes. We prepare delivery documentation aligned to your PO and contract terms, and coordinate receiving appointments and inspection requirements with the receiving entity.",
        qAr: "هل تطابقون التسليم مع متطلبات أوامر الشراء؟",
        aAr: "نعم. نجهز مستندات التسليم وفق أوامر الشراء وشروط العقد، وننسق مواعيد الاستلام ومتطلبات الفحص مع الجهة المستلمة.",
      },
      {
        q: "Do you support national events and exhibitions?",
        a: "We provide exhibition and event logistics for programmes hosted by public entities, including temporary import processing and on-site handling.",
        qAr: "هل تدعمون الفعاليات والمعارض الوطنية؟",
        aAr: "نوفر لوجستيات المعارض والفعاليات للبرامج التي تستضيفها الجهات العامة، بما يشمل معالجة الاستيراد المؤقت والمناولة الميدانية.",
      },
    ],
    seoTitle: "Government Logistics in Saudi Arabia | ENVOD KINGDOM",
    seoDescription: "Government-sector logistics in Saudi Arabia — tender-compliant deliveries, import clearance, secure warehousing, and multi-region distribution for public-sector suppliers.",
  },
];

/** slug → IndustryMeta lookup. */
export const INDUSTRY_BY_SLUG: Record<string, IndustryMeta> = Object.fromEntries(
  INDUSTRY_META.map((i) => [i.slug, i]),
);
