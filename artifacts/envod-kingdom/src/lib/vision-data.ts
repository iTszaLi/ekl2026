/**
 * Vision 2030 pillar page — data layer.
 *
 * One pillar page targeting: NEOM Logistics, Red Sea Project Logistics,
 * Qiddiya Logistics, Diriyah Project Logistics, Vision 2030 Infrastructure
 * Logistics, and Smart Logistics Solutions.
 *
 * CLAIMS POLICY: ENVOD is NOT an official partner of NEOM, Red Sea Global,
 * Qiddiya, or Diriyah. All copy uses "support for suppliers / contractors /
 * exhibitors delivering into..." framing. Customs/transit statements use the
 * mandated hedged sentences. EN and AR are always edited together.
 */

export interface VisionSection {
  id: string;
  icon: string;
  accentHex: string;
  titleEn: string;
  titleAr: string;
  kickerEn: string;
  kickerAr: string;
  body: { en: string; ar: string }[];
  points: { en: string; ar: string }[];
  links: { href: string; labelEn: string; labelAr: string }[];
}

export const VISION_INTRO = {
  en: "Saudi Vision 2030 is reshaping the Kingdom's economy — and every giga-project, new city, and infrastructure programme runs on logistics. ENVOD KINGDOM supports the suppliers, contractors, and exhibitors delivering into these programmes with customs clearance, project cargo, warehousing, and scheduled site delivery across Saudi Arabia.",
  ar: "تعيد رؤية السعودية 2030 تشكيل اقتصاد المملكة — وكل مشروع عملاق ومدينة جديدة وبرنامج بنية تحتية يقوم على اللوجستيات. تدعم إنفود كينجدم الموردين والمقاولين والعارضين الذين يوردون لهذه البرامج بالتخليص الجمركي وبضائع المشاريع والتخزين والتسليم المجدول للمواقع في أنحاء المملكة.",
};

export const VISION_SECTIONS: VisionSection[] = [
  {
    id: "neom",
    icon: "Hexagon",
    accentHex: "#22D3EE",
    titleEn: "NEOM Logistics",
    titleAr: "لوجستيات نيوم",
    kickerEn: "THE LINE · OXAGON · TROJENA",
    kickerAr: "ذا لاين · أوكساجون · تروجينا",
    body: [
      {
        en: "NEOM, in Saudi Arabia's north-west Tabuk region, is one of the world's most ambitious development programmes — spanning THE LINE, the Oxagon industrial city, and the Trojena mountain destination. For the suppliers and contractors delivering into NEOM, logistics is a long-haul challenge: materials and equipment typically arrive through Saudi ports and travel significant inland distances to site gates with strict access procedures.",
        ar: "نيوم، في منطقة تبوك شمال غرب المملكة، من أكثر البرامج التنموية طموحاً في العالم — وتشمل ذا لاين ومدينة أوكساجون الصناعية ووجهة تروجينا الجبلية. وبالنسبة للموردين والمقاولين الذين يوردون لنيوم، تمثل اللوجستيات تحدياً طويل المدى: فالمواد والمعدات تصل عادةً عبر الموانئ السعودية وتقطع مسافات داخلية كبيرة إلى بوابات مواقع ذات إجراءات دخول صارمة.",
      },
      {
        en: "We support NEOM-bound suppliers with import clearance, staging warehousing, out-of-gauge transport for construction plant, and delivery scheduling aligned to contractor site-access requirements.",
        ar: "ندعم الموردين المتجهين إلى نيوم بتخليص الواردات والتخزين المرحلي والنقل خارج الأبعاد لمعدات الإنشاء وجدولة التسليم وفق متطلبات دخول مواقع المقاولين.",
      },
    ],
    points: [
      { en: "Long-haul inland transport planning to the Tabuk region", ar: "تخطيط النقل الداخلي الطويل إلى منطقة تبوك" },
      { en: "Staging warehousing before site-call-off", ar: "تخزين مرحلي قبل طلبات الموقع" },
      { en: "Heavy and oversized construction equipment moves", ar: "نقل معدات الإنشاء الثقيلة والضخمة" },
      { en: "Documentation aligned to contractor gate procedures", ar: "مستندات متوافقة مع إجراءات بوابات المقاولين" },
    ],
    links: [
      { href: "/services/project-cargo", labelEn: "Project Cargo", labelAr: "بضائع المشاريع" },
      { href: "/services/oog-cargo", labelEn: "Out-of-Gauge Transport", labelAr: "النقل خارج الأبعاد" },
      { href: "/industries/construction-logistics", labelEn: "Construction Logistics", labelAr: "لوجستيات البناء" },
    ],
  },
  {
    id: "red-sea",
    icon: "Waves",
    accentHex: "#2DD4BF",
    titleEn: "Red Sea Project Logistics",
    titleAr: "لوجستيات مشروع البحر الأحمر",
    kickerEn: "REGENERATIVE TOURISM · ISLAND RESORTS",
    kickerAr: "سياحة متجددة · منتجعات جزرية",
    body: [
      {
        en: "The Red Sea destination is building luxury resorts across an archipelago on Saudi Arabia's west coast — with some properties reachable only by sea or air. Hospitality suppliers face multi-leg deliveries: ocean or air freight into the Kingdom, inland transport to coastal marshalling points, and final delivery coordinated with island construction schedules.",
        ar: "تبني وجهة البحر الأحمر منتجعات فاخرة عبر أرخبيل على الساحل الغربي للمملكة — وبعض المنشآت لا يمكن الوصول إليها إلا بحراً أو جواً. ويواجه موردو الضيافة تسليماً متعدد المراحل: شحن بحري أو جوي إلى المملكة، ثم نقل داخلي إلى نقاط التجميع الساحلية، ثم تسليم نهائي منسق مع جداول إنشاء الجزر.",
      },
      {
        en: "We support FF&E and OS&E suppliers delivering into Red Sea destination properties with consolidation, staged warehousing, careful handling for high-value furnishings, and delivery sequencing built around your contractor's programme.",
        ar: "ندعم موردي الأثاث والتجهيزات ومستلزمات التشغيل الذين يوردون لمنشآت وجهة البحر الأحمر بالتجميع والتخزين المرحلي والمناولة بعناية للمفروشات عالية القيمة وتسلسل التسليم وفق برنامج مقاولكم.",
      },
    ],
    points: [
      { en: "Multi-leg delivery planning to coastal and island sites", ar: "تخطيط تسليم متعدد المراحل للمواقع الساحلية والجزرية" },
      { en: "Hotel FF&E consolidation and staging", ar: "تجميع أثاث الفنادق وتخزينه مرحلياً" },
      { en: "White glove handling for luxury furnishings", ar: "مناولة فاخرة للمفروشات الراقية" },
      { en: "Sequenced call-off aligned to resort handovers", ar: "طلبات متسلسلة وفق تسليم المنتجعات" },
    ],
    links: [
      { href: "/industries/hospitality-logistics", labelEn: "Hospitality Logistics", labelAr: "لوجستيات الضيافة" },
      { href: "/services/white-glove-logistics", labelEn: "White Glove Logistics", labelAr: "اللوجستيات الفاخرة" },
      { href: "/services/warehousing", labelEn: "Warehousing", labelAr: "التخزين" },
    ],
  },
  {
    id: "qiddiya",
    icon: "FerrisWheel",
    accentHex: "#F472B6",
    titleEn: "Qiddiya Logistics",
    titleAr: "لوجستيات القدية",
    kickerEn: "ENTERTAINMENT · SPORTS · CULTURE",
    kickerAr: "ترفيه · رياضة · ثقافة",
    body: [
      {
        en: "Qiddiya, on the outskirts of Riyadh, is being built as Saudi Arabia's capital of entertainment, sports, and culture — theme parks, arenas, a motorsport circuit, and water attractions. The cargo profile is unusual: ride components and show equipment are often oversized, highly engineered, and single-source, making careful transport and lifting plans essential.",
        ar: "تُبنى القدية في محيط الرياض لتكون عاصمة الترفيه والرياضة والثقافة في المملكة — مدن ملاهٍ وصالات وحلبة سباقات ومرافق مائية. وطبيعة البضائع غير اعتيادية: فمكونات الألعاب ومعدات العروض غالباً ضخمة وعالية الهندسة وأحادية المصدر، ما يجعل خطط النقل والرفع الدقيقة أمراً أساسياً.",
      },
      {
        en: "We support suppliers and installation contractors delivering into Qiddiya-area projects with port clearance, oversized component transport, secure staging near Riyadh, and coordinated site delivery windows.",
        ar: "ندعم الموردين ومقاولي التركيب الذين يوردون لمشاريع منطقة القدية بالتخليص في الموانئ ونقل المكونات الضخمة والتخزين الآمن قرب الرياض ونوافذ تسليم منسقة للمواقع.",
      },
    ],
    points: [
      { en: "Oversized ride and show-equipment transport", ar: "نقل مكونات الألعاب ومعدات العروض الضخمة" },
      { en: "Riyadh-area staging and secure storage", ar: "تخزين مرحلي وآمن في محيط الرياض" },
      { en: "Lifting and installation-window coordination", ar: "تنسيق الرفع ونوافذ التركيب" },
      { en: "Event and venue logistics support", ar: "دعم لوجستيات الفعاليات والمرافق" },
    ],
    links: [
      { href: "/services/oog-cargo", labelEn: "Out-of-Gauge Cargo", labelAr: "البضائع خارج الأبعاد" },
      { href: "/services/project-cargo", labelEn: "Project Cargo", labelAr: "بضائع المشاريع" },
      { href: "/services/exhibition-logistics", labelEn: "Exhibition Logistics", labelAr: "لوجستيات المعارض" },
    ],
  },
  {
    id: "diriyah",
    icon: "Castle",
    accentHex: "#FBBF24",
    titleEn: "Diriyah Project Logistics",
    titleAr: "لوجستيات مشروع الدرعية",
    kickerEn: "HERITAGE · CULTURE · HOSPITALITY",
    kickerAr: "تراث · ثقافة · ضيافة",
    body: [
      {
        en: "Diriyah is restoring the birthplace of the Saudi state into a global heritage, culture, and hospitality destination minutes from central Riyadh. Urban heritage sites mean constrained access: narrow delivery corridors, restricted hours, and finish materials — stone, joinery, artisan fixtures — that cannot tolerate rough handling.",
        ar: "تعيد الدرعية إحياء مهد الدولة السعودية لتصبح وجهة عالمية للتراث والثقافة والضيافة على دقائق من وسط الرياض. والمواقع التراثية الحضرية تعني وصولاً محدوداً: ممرات تسليم ضيقة وساعات مقيدة ومواد تشطيب — حجر وأعمال خشبية وتجهيزات حرفية — لا تحتمل المناولة القاسية.",
      },
      {
        en: "We support contractors and suppliers on Diriyah-area developments with careful import handling, protective packing coordination, staging warehousing in Riyadh, and delivery scheduling within restricted access windows.",
        ar: "ندعم المقاولين والموردين في تطويرات منطقة الدرعية بمناولة استيراد دقيقة وتنسيق التغليف الواقي والتخزين المرحلي في الرياض وجدولة التسليم ضمن نوافذ الوصول المقيدة.",
      },
    ],
    points: [
      { en: "Restricted-access urban delivery planning", ar: "تخطيط تسليم حضري ضمن وصول مقيد" },
      { en: "Careful handling for finish and heritage materials", ar: "مناولة دقيقة لمواد التشطيب والتراث" },
      { en: "Riyadh staging with call-off delivery", ar: "تخزين في الرياض مع تسليم عند الطلب" },
      { en: "Hotel and F&B fit-out logistics", ar: "لوجستيات تجهيز الفنادق والمطاعم" },
    ],
    links: [
      { href: "/services/packaging-crating", labelEn: "Packaging & Crating", labelAr: "التغليف والتصنيد" },
      { href: "/industries/hospitality-logistics", labelEn: "Hospitality Logistics", labelAr: "لوجستيات الضيافة" },
      { href: "/services/customs-clearance", labelEn: "Customs Clearance", labelAr: "التخليص الجمركي" },
    ],
  },
  {
    id: "infrastructure",
    icon: "TrainFront",
    accentHex: "#60A5FA",
    titleEn: "Vision 2030 Infrastructure Logistics",
    titleAr: "لوجستيات البنية التحتية لرؤية 2030",
    kickerEn: "TRANSPORT · UTILITIES · INDUSTRIAL CITIES",
    kickerAr: "نقل · مرافق · مدن صناعية",
    body: [
      {
        en: "Beyond the headline giga-projects, Vision 2030 is funding a wave of infrastructure: airport expansions, rail and metro lines, port upgrades, renewable-energy plants, water networks, and new industrial cities. Each programme pulls in imported plant, equipment, and materials that need compliant clearance and disciplined delivery to active work sites.",
        ar: "إلى جانب المشاريع العملاقة، تمول رؤية 2030 موجة من البنية التحتية: توسعات مطارات وخطوط قطارات ومترو وترقية موانئ ومحطات طاقة متجددة وشبكات مياه ومدن صناعية جديدة. وكل برنامج يستقطب معدات وآلات ومواد مستوردة تحتاج تخليصاً متوافقاً وتسليماً منضبطاً لمواقع عمل نشطة.",
      },
      {
        en: "We move infrastructure cargo — transformers, generators, pipes, cable drums, structural steel — with breakbulk and out-of-gauge expertise, route surveys, and permits. Customs clearance completed as quickly as possible, with many shipments typically cleared within 24 hours depending on shipment type, documentation, customs requirements, and regulatory approvals.",
        ar: "ننقل بضائع البنية التحتية — محولات ومولدات وأنابيب وبكرات كابلات وحديداً إنشائياً — بخبرة في البضائع العامة وخارج الأبعاد ومسوحات الطرق والتصاريح. ويُنجز التخليص الجمركي بأسرع وقت ممكن، إذ تُخلَّص العديد من الشحنات عادةً خلال 24 ساعة حسب نوع الشحنة والمستندات والمتطلبات الجمركية والموافقات التنظيمية.",
      },
    ],
    points: [
      { en: "Breakbulk and heavy-lift port handling", ar: "مناولة البضائع العامة والرفع الثقيل في الموانئ" },
      { en: "Route surveys, permits, and escort coordination", ar: "مسوحات الطرق والتصاريح وتنسيق المرافقة" },
      { en: "Phased deliveries matched to construction milestones", ar: "تسليم مرحلي وفق مراحل الإنشاء" },
      { en: "Cross-GCC inland transport corridors", ar: "ممرات نقل داخلي عبر دول الخليج" },
    ],
    links: [
      { href: "/services/breakbulk-shipping", labelEn: "Breakbulk Shipping", labelAr: "شحن البضائع العامة" },
      { href: "/services/project-cargo", labelEn: "Project Cargo", labelAr: "بضائع المشاريع" },
      { href: "/services/gcc-transportation", labelEn: "GCC Transportation", labelAr: "النقل الخليجي" },
    ],
  },
  {
    id: "smart-logistics",
    icon: "BrainCircuit",
    accentHex: "#A78BFA",
    titleEn: "Smart Logistics Solutions",
    titleAr: "حلول اللوجستيات الذكية",
    kickerEn: "VISIBILITY · DATA · DIGITAL CUSTOMS",
    kickerAr: "رؤية · بيانات · جمارك رقمية",
    body: [
      {
        en: "Vision 2030's National Transport and Logistics Strategy aims to position Saudi Arabia as a global logistics hub — and digitalisation is central to it. Customs platforms like FASAH, the SABER conformity system, and port community systems are turning paperwork into data flows that reward well-prepared shippers.",
        ar: "تهدف الاستراتيجية الوطنية للنقل والخدمات اللوجستية ضمن رؤية 2030 إلى جعل المملكة مركزاً لوجستياً عالمياً — والرقمنة في صميمها. فمنصات الجمارك مثل فسح ونظام سابر للمطابقة وأنظمة مجتمع الموانئ تحول المستندات إلى تدفقات بيانات تكافئ الشاحنين المستعدين جيداً.",
      },
      {
        en: "We work digitally by default: electronic customs submissions, shipment tracking through our online portal, proactive milestone updates, and clean data handovers to your systems — so your team always knows where cargo is and what happens next.",
        ar: "نعمل رقمياً افتراضياً: تقديمات جمركية إلكترونية وتتبع للشحنات عبر بوابتنا الإلكترونية وتحديثات استباقية للمراحل وتسليم بيانات منظم لأنظمتكم — ليعرف فريقكم دائماً أين البضاعة وما الخطوة التالية.",
      },
    ],
    points: [
      { en: "Online shipment tracking portal", ar: "بوابة إلكترونية لتتبع الشحنات" },
      { en: "Electronic customs and FASAH submissions", ar: "تقديمات إلكترونية للجمارك ومنصة فسح" },
      { en: "Proactive milestone and exception alerts", ar: "تنبيهات استباقية للمراحل والاستثناءات" },
      { en: "Data-ready reporting for your supply chain team", ar: "تقارير جاهزة للبيانات لفريق سلسلة الإمداد" },
    ],
    links: [
      { href: "/track", labelEn: "Track Your Shipment", labelAr: "تتبع شحنتك" },
      { href: "/services/supply-chain", labelEn: "Supply Chain Management", labelAr: "إدارة سلسلة الإمداد" },
      { href: "/services/customs-clearance", labelEn: "Customs Clearance", labelAr: "التخليص الجمركي" },
    ],
  },
];

export const VISION_FAQ = [
  {
    q: "Is ENVOD KINGDOM an official partner of NEOM or other giga-projects?",
    a: "No — we are an independent logistics provider. We support the suppliers, contractors, and exhibitors who deliver goods and equipment into Vision 2030 programmes, handling their customs clearance, transport, warehousing, and site-delivery logistics.",
    qAr: "هل إنفود كينجدم شريك رسمي لنيوم أو المشاريع العملاقة الأخرى؟",
    aAr: "لا — نحن مزود لوجستي مستقل. ندعم الموردين والمقاولين والعارضين الذين يوردون البضائع والمعدات لبرامج رؤية 2030، بإدارة التخليص الجمركي والنقل والتخزين والتسليم للمواقع.",
  },
  {
    q: "Can you deliver to giga-project construction sites?",
    a: "Yes, subject to the site-access procedures set by each project's contractors. We plan deliveries around gate requirements, documentation protocols, and call-off schedules agreed with your receiving team.",
    qAr: "هل يمكنكم التسليم لمواقع إنشاء المشاريع العملاقة؟",
    aAr: "نعم، وفق إجراءات الدخول التي يحددها مقاولو كل مشروع. نخطط التسليم حول متطلبات البوابات وبروتوكولات المستندات وجداول الطلب المتفق عليها مع فريق الاستلام لديكم.",
  },
  {
    q: "How long does customs clearance take for project shipments?",
    a: "Customs clearance completed as quickly as possible, with many shipments typically cleared within 24 hours depending on shipment type, documentation, customs requirements, and regulatory approvals.",
    qAr: "كم يستغرق التخليص الجمركي لشحنات المشاريع؟",
    aAr: "يُنجز التخليص الجمركي بأسرع وقت ممكن، إذ تُخلَّص العديد من الشحنات عادةً خلال 24 ساعة حسب نوع الشحنة والمستندات والمتطلبات الجمركية والموافقات التنظيمية.",
  },
  {
    q: "Do you handle oversized cargo for these projects?",
    a: "Yes. We arrange out-of-gauge and heavy-lift transport with route surveys, permits, and escorts — from port discharge to positioning at the work site.",
    qAr: "هل تتعاملون مع البضائع الضخمة لهذه المشاريع؟",
    aAr: "نعم. نرتب النقل خارج الأبعاد والرفع الثقيل مع مسوحات الطرق والتصاريح والمرافقة — من تفريغ الميناء حتى التموضع في موقع العمل.",
  },
];

export const VISION_SEO = {
  title: "Vision 2030 Logistics — NEOM, Red Sea, Qiddiya & Diriyah Project Support | ENVOD KINGDOM",
  description:
    "Logistics support for Vision 2030 suppliers & contractors — NEOM logistics, Red Sea Project logistics, Qiddiya, Diriyah, infrastructure cargo, and smart logistics solutions across Saudi Arabia.",
};
