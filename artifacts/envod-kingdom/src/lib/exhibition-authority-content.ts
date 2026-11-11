export type LocalizedCopy = { en: string; ar: string };

export type ExhibitionGuide = {
  slug: string;
  title: LocalizedCopy;
  seoTitle?: LocalizedCopy;
  description: LocalizedCopy;
  intro: LocalizedCopy[];
  sections: {
    heading: LocalizedCopy;
    paragraphs: LocalizedCopy[];
    bullets?: LocalizedCopy[];
  }[];
  faqs: { question: LocalizedCopy; answer: LocalizedCopy }[];
  references?: readonly { label: LocalizedCopy; href: string; hrefAr?: string }[];
  relatedLinks: readonly { label: LocalizedCopy; href: string }[];
};

export const EXHIBITION_HUB_PATH = "/exhibition-event-logistics-saudi-arabia";

export const EXHIBITION_HUB = {
  eyebrow: {
    en: "ENVOD KINGDOM · EXHIBITION & EVENT CARGO",
    ar: "إنفود كينغدوم · شحن المعارض والفعاليات",
  },
  title: {
    en: "Exhibition & Event Logistics Company in Saudi Arabia",
    ar: "خدمات لوجستية متكاملة للمعارض والفعاليات في المملكة العربية السعودية",
  },
  subtitle: {
    en: "Exhibition freight, ATA Carnet enquiries, customs-document coordination and venue delivery planning for Riyadh, Jeddah, Dammam and other Saudi destinations.",
    ar: "الشحن الدولي للمعارض، واستفسارات كارنيه ATA، وتنسيق المستندات الجمركية، والتخطيط للتسليم إلى مواقع الفعاليات في الرياض وجدة والدمام وغيرها من الوجهات السعودية.",
  },
  intro: {
    en: "ENVOD KINGDOM SHIPPING SERVICES LLC is based in Al Malaz, Riyadh. We review exhibition and event-cargo enquiries that may involve international air, sea or road freight, customs documentation, temporary-admission questions, delivery scheduling and return movements. The route, customs operator, local provider, venue access and exact responsibilities are confirmed for each shipment.",
    ar: "تقع شركة إنفود كينغدوم للخدمات الملاحية ذ.م.م في حي الملز بالرياض. ونراجع استفسارات شحن المعارض والفعاليات التي قد تشمل الشحن الدولي جواً أو بحراً أو براً والمستندات الجمركية والاستفسارات المتعلقة بالإدخال المؤقت وجدولة التسليم وحركات العودة. ويُؤكد لكل شحنة مسارها ومشغّل الجمارك ومقدم الخدمة المحلي وإمكانية دخول الموقع والمسؤوليات المحددة.",
  },
  capabilityIntro: {
    en: "For businesses comparing leading exhibition logistics providers in KSA, assess freight, documentation, venue delivery and return responsibilities—not only the first transport leg. Explore the parts of the plan that apply to your shipment.",
    ar: "للشركات التي تقارن بين أبرز مزوّدي لوجستيات المعارض في السعودية، راجع مسؤوليات الشحن والمستندات والتسليم للموقع والعودة، لا مرحلة النقل الأولى فقط. استكشف عناصر الخطة التي تنطبق على شحنتك.",
  },
  capabilities: [
    {
      title: { en: "Exhibition freight forwarding", ar: "الشحن الدولي للمعارض" },
      description: {
        en: "Compare air, sea and road options against cargo readiness, route, carrier acceptance and the venue’s move-in window.",
        ar: "قارن خيارات الشحن الجوي والبحري والبري وفق جاهزية البضاعة والمسار وقبول الناقل وموعد إدخال الشحنات إلى الموقع.",
      },
      href: "/services/freight-forwarding",
      linkLabel: { en: "Freight forwarding services", ar: "خدمات الشحن وإدارة النقل" },
    },
    {
      title: { en: "Exhibition customs documentation", ar: "مستندات جمارك المعارض" },
      description: {
        en: "Prepare shipment information and review the applicable import or export documents with the responsible customs operator.",
        ar: "جهّز معلومات الشحنة وراجع مستندات الاستيراد أو التصدير المنطبقة مع مشغّل الجمارك المسؤول.",
      },
      href: "/guides/exhibition-customs-clearance-saudi-arabia",
      linkLabel: { en: "Exhibition customs guide", ar: "دليل جمارك المعارض" },
    },
    {
      title: { en: "ATA Carnet enquiries", ar: "استفسارات كارنيه ATA" },
      description: {
        en: "Check whether the goods and intended exhibition use may qualify; authorized associations issue Carnets and customs authorities decide acceptance.",
        ar: "تحقق مما إذا كانت البضائع والغرض من استخدامها في المعرض قد يؤهلانها؛ فالجهات المخوّلة تصدر الكارنيهات والسلطات الجمركية تقرر قبولها.",
      },
      href: "/services/ata-carnet",
      linkLabel: { en: "ATA Carnet coordination", ar: "تنسيق كارنيه ATA" },
    },
    {
      title: { en: "Temporary import and re-export", ar: "الإدخال المؤقت وإعادة التصدير" },
      description: {
        en: "Separate goods intended to return from items to be sold, consumed or left in Saudi Arabia, then confirm the relevant customs route.",
        ar: "ميّز البضائع المعدّة للعودة عن الأصناف المعدّة للبيع أو الاستهلاك أو البقاء في السعودية، ثم أكّد الإجراء الجمركي المناسب.",
      },
      href: "/guides/temporary-import-re-export-exhibition-goods-saudi-arabia",
      linkLabel: { en: "Read the temporary-import guide", ar: "اقرأ دليل الإدخال المؤقت" },
    },
    {
      title: { en: "Venue delivery and collection", ar: "التسليم والاستلام من موقع الفعالية" },
      description: {
        en: "Plan the gateway-to-venue move using the organizer’s manual, delivery slot, dock instructions and contractor requirements.",
        ar: "خطط للنقل من منفذ الدخول إلى الموقع بالاستناد إلى دليل المنظّم وموعد التسليم وتعليمات رصيف التحميل ومتطلبات المقاول.",
      },
      href: "/services/exhibition-logistics",
      linkLabel: { en: "Exhibition service details", ar: "تفاصيل خدمة المعارض" },
    },
    {
      title: { en: "Exhibition stands and display cargo", ar: "الأجنحة والمعروضات" },
      description: {
        en: "Coordinate transport for modular stands, display structures, samples, furniture and audiovisual equipment. Stand design or construction is not implied.",
        ar: "نسّق نقل الأجنحة المعيارية وهياكل العرض والعينات والأثاث والمعدات السمعية والبصرية. ولا يعني ذلك تقديم تصميم الأجنحة أو إنشائها.",
      },
      href: "/services/exhibition-logistics",
      linkLabel: { en: "Plan an exhibition shipment", ar: "خطط لشحنة معرض" },
    },
    {
      title: { en: "Fine art and museum exhibits", ar: "الأعمال الفنية ومعروضات المتاحف" },
      description: {
        en: "Review object-specific packing, handling, route and documentation needs. Conservation, installation, insurance and specialist-provider availability require separate confirmation.",
        ar: "راجع احتياجات تغليف القطع ومناولتها ومسارها ومستنداتها. ويتطلب توفر خدمات الحفظ والتركيب والتأمين ومقدمي الخدمات المتخصصين تأكيداً مستقلاً.",
      },
      href: "/guides/fine-art-museum-exhibition-logistics-saudi-arabia",
      linkLabel: { en: "Read the fine-art planning guide", ar: "اقرأ دليل تخطيط شحن الأعمال الفنية" },
    },
    {
      title: { en: "Live shows and event equipment", ar: "العروض الحية ومعدات الفعاليات" },
      description: {
        en: "Scope freight and return movements for production equipment around event dates; equipment acceptance, venue access and on-site roles are confirmed per request.",
        ar: "حدّد نطاق الشحن وحركات العودة لمعدات الإنتاج وفق مواعيد الفعالية؛ ويُؤكد قبول المعدات ودخول الموقع والأدوار الميدانية لكل طلب.",
      },
      href: "/guides/live-show-event-logistics-saudi-arabia",
      linkLabel: { en: "Read the live-event guide", ar: "اقرأ دليل الفعاليات والعروض الحية" },
    },
  ],
  workflow: [
    {
      title: { en: "Share the event brief", ar: "أرسل تفاصيل الفعالية" },
      description: { en: "Provide the organizer, venue, event dates, cargo origin and target delivery window.", ar: "أرسل اسم المنظّم والموقع وتواريخ الفعالية ومنشأ البضائع ونافذة التسليم المطلوبة." },
    },
    {
      title: { en: "Build the cargo list", ar: "أعد قائمة البضائع" },
      description: { en: "List packages, dimensions, weights, values, serial numbers and any restricted or fragile items.", ar: "أدرج الطرود والأبعاد والأوزان والقيم والأرقام التسلسلية وأي أصناف مقيدة أو قابلة للكسر." },
    },
    {
      title: { en: "Review route and mode", ar: "راجع المسار ووسيلة الشحن" },
      description: { en: "Assess air, sea or road options, carrier acceptance, transit dependencies and event deadlines.", ar: "قيّم خيارات الشحن الجوي أو البحري أو البري وقبول الناقل ومتطلبات العبور ومواعيد الفعالية." },
    },
    {
      title: { en: "Confirm the customs path", ar: "أكّد الإجراء الجمركي" },
      description: { en: "Check documents, importer responsibilities, permits and whether temporary admission may apply.", ar: "راجع المستندات ومسؤوليات المستورد والتصاريح وما إذا كان الإدخال المؤقت قد ينطبق." },
    },
    {
      title: { en: "Coordinate the movement", ar: "نسّق حركة الشحنة" },
      description: { en: "Confirm the carrier, gateway, customs operator and local-delivery responsibilities before booking.", ar: "أكّد الناقل ومنفذ الدخول ومشغّل الجمارك ومسؤوليات التسليم المحلي قبل الحجز." },
    },
    {
      title: { en: "Plan venue delivery", ar: "خطط للتسليم إلى الموقع" },
      description: { en: "Use the exhibitor manual to check appointment slots, dock access, labels and appointed contractors.", ar: "استخدم دليل العارضين للتحقق من المواعيد والوصول إلى رصيف التحميل والملصقات والمقاولين المعتمدين." },
    },
    {
      title: { en: "Arrange collection or return", ar: "رتّب الاستلام أو العودة" },
      description: { en: "Before the event ends, confirm collection, repacking, customs steps and the return or next-event route.", ar: "قبل انتهاء الفعالية، أكّد الاستلام وإعادة التغليف والإجراءات الجمركية ومسار العودة أو الفعالية التالية." },
    },
  ],
  cities: [
    {
      title: { en: "Exhibition logistics in Riyadh", ar: "لوجستيات المعارض في الرياض" },
      description: {
        en: "ENVOD’s head office is in Al Malaz, Riyadh. For events at RICEC, Riyadh Front (RFECC) or the Malham exhibition centre, share the exact venue, hall, stand and organizer delivery instructions. The gateway and local transport plan depend on the cargo and schedule.",
        ar: "يقع المكتب الرئيسي لإنفود في حي الملز بالرياض. وللفعاليات في مركز الرياض الدولي (RICEC) أو واجهة الرياض (RFECC) أو مركز ملهم، أرسل اسم الموقع الدقيق والقاعة والجناح وتعليمات التسليم من المنظّم. ويعتمد منفذ الدخول وخطة النقل المحلي على البضائع والجدول.",
      },
      venues: { en: "RICEC · Riyadh Front (RFECC) · Malham", ar: "RICEC · واجهة الرياض (RFECC) · ملهم" },
      href: "/services/exhibition-logistics#exhibition-logistics-riyadh",
    },
    {
      title: { en: "Exhibition logistics in Jeddah", ar: "لوجستيات المعارض في جدة" },
      description: {
        en: "Jeddah exhibition enquiries may involve sea freight through Jeddah Islamic Port or air cargo through King Abdulaziz International Airport. Confirm whether the event is at Jeddah Superdome or the Jeddah International Exhibition & Convention Center; the venue address and access plan are not interchangeable.",
        ar: "قد تشمل استفسارات معارض جدة الشحن البحري عبر ميناء جدة الإسلامي أو الشحن الجوي عبر مطار الملك عبدالعزيز الدولي. أكّد ما إذا كانت الفعالية في قبة جدة (سوبر دوم) أو مركز جدة الدولي للمعارض والمؤتمرات؛ فعنوان الموقع وترتيبات الدخول يختلفان.",
      },
      venues: { en: "Jeddah Superdome · Jeddah International Exhibition & Convention Center", ar: "قبة جدة (سوبر دوم) · مركز جدة الدولي للمعارض والمؤتمرات" },
      href: "/services/exhibition-logistics#exhibition-logistics-jeddah",
    },
    {
      title: { en: "Exhibition logistics in Dammam and the Eastern Province", ar: "لوجستيات المعارض في الدمام والمنطقة الشرقية" },
      description: {
        en: "For Dammam, Dhahran Expo, Al Khobar or Jubail, provide the venue or delivery address and access window. Port, airport and inland routing options are reviewed per shipment. These destination references describe service enquiries, not additional ENVOD offices or venue appointments.",
        ar: "للفعاليات في الدمام أو ظهران إكسبو أو الخبر أو الجبيل، أرسل الموقع أو عنوان التسليم ونافذة الدخول. وتُراجع خيارات الميناء والمطار والمسار الداخلي لكل شحنة. وتشير هذه الوجهات إلى نطاق الاستفسارات، لا إلى مكاتب إضافية لإنفود أو تعيين من المواقع.",
      },
      venues: { en: "Dhahran Expo · Dammam · Al Khobar · Jubail", ar: "ظهران إكسبو · الدمام · الخبر · الجبيل" },
      href: "/services/exhibition-logistics#exhibition-logistics-dammam-eastern-province",
    },
  ],
  eventTypes: [
    { en: "Technology and telecommunications", ar: "التقنية والاتصالات" },
    { en: "Defence and industrial exhibitions", ar: "معارض الدفاع والصناعة" },
    { en: "Construction, energy and infrastructure", ar: "البناء والطاقة والبنية التحتية" },
    { en: "Food, hospitality and healthcare", ar: "الأغذية والضيافة والرعاية الصحية" },
    { en: "Automotive, furniture and design", ar: "السيارات والأثاث والتصميم" },
    { en: "Conferences, trade fairs and corporate events", ar: "المؤتمرات والمعارض التجارية والفعاليات المؤسسية" },
    { en: "Fine-art, cultural and museum exhibitions", ar: "معارض الفنون والثقافة والمتاحف" },
    { en: "Live shows and production equipment", ar: "العروض الحية ومعدات الإنتاج" },
  ],
  experience: {
    heading: { en: "Exhibition logistics experience across Saudi Arabia", ar: "خبرة لوجستية للمعارض في أنحاء السعودية" },
    description: {
      en: "Explore ENVOD-provided operational photographs in the gallery. Captions describe visible cargo and handling; specific event appointments, clients and project outcomes are named only when documented and approved.",
      ar: "استكشف الصور التشغيلية التي قدمتها إنفود في المعرض. وتصف التعليقات البضائع والمناولة الظاهرة؛ ولا تُذكر تعيينات الفعاليات أو العملاء أو نتائج المشاريع إلا عند توثيقها واعتمادها.",
    },
    linkLabel: { en: "View exhibition and event cargo photos", ar: "شاهد صور شحن المعارض والفعاليات" },
  },
  faqs: [
    {
      question: { en: "What does exhibition logistics include?", ar: "ماذا تشمل لوجستيات المعارض؟" },
      answer: {
        en: "Exhibition logistics can connect international freight, customs-document coordination, temporary-admission enquiries, venue delivery planning and return movements. The available scope depends on the cargo, route, organizer rules, customs requirements and confirmed providers.",
        ar: "قد تربط لوجستيات المعارض بين الشحن الدولي وتنسيق المستندات الجمركية واستفسارات الإدخال المؤقت والتخطيط للتسليم إلى الموقع وحركات العودة. ويعتمد النطاق المتاح على البضائع والمسار وقواعد المنظّم ومتطلبات الجمارك ومقدمي الخدمات الذين يتم تأكيدهم.",
      },
    },
    {
      question: { en: "Does ENVOD coordinate exhibition cargo to Riyadh, Jeddah and Dammam?", ar: "هل تنسّق إنفود شحن المعارض إلى الرياض وجدة والدمام؟" },
      answer: {
        en: "ENVOD reviews exhibition-cargo enquiries for Riyadh, Jeddah, Dammam and other Saudi destinations from its Riyadh head office. A city mention does not indicate a local branch; route and local-provider availability are confirmed for each shipment.",
        ar: "تراجع إنفود استفسارات شحن المعارض إلى الرياض وجدة والدمام وغيرها من الوجهات السعودية انطلاقاً من مكتبها الرئيسي في الرياض. ولا يعني ذكر مدينة وجود فرع محلي؛ إذ يُؤكد المسار وتوفر مقدم الخدمة المحلي لكل شحنة.",
      },
    },
    {
      question: { en: "Does Saudi Arabia accept ATA Carnets for exhibition goods?", ar: "هل تقبل السعودية كارنيه ATA لبضائع المعارض؟" },
      answer: {
        en: "ZATCA states that Saudi customs accepts ATA Carnets, including for eligible goods displayed or used at exhibitions and fairs. Check the current procedure, goods, purpose, documents and any advance-disclosure requirement with ZATCA and the authorized issuing association before shipping.",
        ar: "تذكر هيئة الزكاة والضريبة والجمارك أن الجمارك السعودية تقبل كارنيه ATA، بما في ذلك للبضائع المؤهلة المعروضة أو المستخدمة في المعارض والأسواق. تحقّق قبل الشحن من الإجراء الحالي والبضائع والغرض والمستندات وأي متطلب للإفصاح المسبق مع الهيئة وجهة الإصدار المخوّلة.",
      },
    },
    {
      question: { en: "Can exhibition cargo be temporarily imported and re-exported?", ar: "هل يمكن إدخال بضائع المعرض مؤقتاً ثم إعادة تصديرها؟" },
      answer: {
        en: "Some goods may qualify for a temporary-admission procedure and later re-export, subject to the goods, importer, purpose, documentation and customs approval. Items for sale, distribution, consumption or permanent use may follow a different import path.",
        ar: "قد تكون بعض البضائع مؤهلة لإجراء إدخال مؤقت ثم إعادة التصدير، وفق نوع البضاعة والمستورد والغرض والمستندات وموافقة الجمارك. وقد تتبع الأصناف المعدّة للبيع أو التوزيع أو الاستهلاك أو الاستخدام الدائم مسار استيراد مختلفاً.",
      },
    },
    {
      question: { en: "What documents should I prepare for an exhibition shipment?", ar: "ما المستندات التي أجهزها لشحنة معرض؟" },
      answer: {
        en: "Start with an itemized packing list, commercial invoice, transport details, cargo values and serial numbers where relevant, plus the event and venue information. Permits, origin documents, product records and temporary-admission papers depend on the goods and route; confirm the final list with the responsible customs operator.",
        ar: "ابدأ بقائمة تعبئة مفصلة وفاتورة تجارية وبيانات النقل وقيم البضائع وأرقامها التسلسلية عند الحاجة، إضافة إلى معلومات الفعالية والموقع. وتعتمد التصاريح ومستندات المنشأ وسجلات المنتج ومستندات الإدخال المؤقت على البضائع والمسار؛ أكّد القائمة النهائية مع مشغّل الجمارك المسؤول.",
      },
    },
    {
      question: { en: "Can ENVOD arrange delivery to an exhibition venue and stand?", ar: "هل يمكن لإنفود ترتيب التسليم إلى موقع المعرض والجناح؟" },
      answer: {
        en: "Venue delivery can be assessed when you provide the exhibitor manual, delivery slot, hall and stand details. Access, unloading, appointed contractors, installation and collection must be permitted by the organizer and confirmed for the specific event.",
        ar: "يمكن تقييم التسليم إلى الموقع عند تقديم دليل العارضين وموعد التسليم وتفاصيل القاعة والجناح. ويجب أن يسمح المنظّم بالدخول والتفريغ والمقاولين المعتمدين والتركيب والاستلام، وأن يتم تأكيدها للفعالية المعنية.",
      },
    },
    {
      question: { en: "Does ENVOD design or build exhibition stands?", ar: "هل تصمم إنفود أجنحة المعارض أو تنفذها؟" },
      answer: {
        en: "This page covers cargo and logistics coordination, not stand design or construction. If a request needs booth build, installation or dismantling, the organizer’s rules and the availability of an appropriate provider must be checked separately.",
        ar: "تتناول هذه الصفحة تنسيق البضائع والخدمات اللوجستية، لا تصميم الأجنحة أو إنشائها. وإذا احتاج الطلب إلى تنفيذ الجناح أو تركيبه أو تفكيكه، فيجب مراجعة قواعد المنظّم وتوفر مقدم خدمة مناسب بشكل مستقل.",
      },
    },
    {
      question: { en: "What details help ENVOD review an exhibition logistics enquiry?", ar: "ما التفاصيل التي تساعد إنفود على مراجعة استفسار لوجستيات المعرض؟" },
      answer: {
        en: "Share the event name, venue, city, dates, cargo origin, requested freight mode, package dimensions and weight, arrival deadline, customs status and return plan. Include the organizer’s delivery instructions and separate goods for return from items intended to remain in Saudi Arabia.",
        ar: "أرسل اسم الفعالية والموقع والمدينة والتواريخ ومنشأ البضائع ووسيلة الشحن المطلوبة وأبعاد الطرود ووزنها والموعد النهائي للوصول والحالة الجمركية وخطة العودة. أرفق تعليمات التسليم من المنظّم، وميّز البضائع المعدّة للعودة عن الأصناف التي ستبقى في السعودية.",
      },
    },
  ],
  authoritativeLinks: [
    {
      label: { en: "ZATCA: ATA Carnet acceptance in Saudi Arabia", ar: "هيئة الزكاة والضريبة والجمارك: قبول كارنيه ATA في السعودية" },
      href: "https://zatca.gov.sa/en/MediaCenter/News/Pages/news-1245.aspx",
      hrefAr: "https://zatca.gov.sa/ar/MediaCenter/News/Pages/news-1245.aspx",
    },
    {
      label: { en: "ZATCA: Temporary admission using an ATA Carnet", ar: "هيئة الزكاة والضريبة والجمارك: الإدخال المؤقت باستخدام كارنيه ATA" },
      href: "https://zatca.gov.sa/en/eServices/Pages/eservices-294.aspx",
      hrefAr: "https://zatca.gov.sa/ar/eServices/Pages/eservices-294.aspx",
    },
    {
      label: { en: "ZATCA: Event disclosure in Saudi Arabia", ar: "هيئة الزكاة والضريبة والجمارك: الإفصاح عن الفعاليات في السعودية" },
      href: "https://www.zatca.gov.sa/en/eServices/Pages/eServices-273.aspx",
      hrefAr: "https://www.zatca.gov.sa/ar/eServices/Pages/eServices-273.aspx",
    },
    {
      label: { en: "ZATCA: Import instructions and cargo documents", ar: "هيئة الزكاة والضريبة والجمارك: إرشادات الاستيراد ومستندات البضائع" },
      href: "https://zatca.gov.sa/en/RulesRegulations/Taxes/Pages/customs-bussiness/import-pages/Import-Instructions.aspx",
      hrefAr: "https://zatca.gov.sa/ar/RulesRegulations/Taxes/Pages/customs-bussiness/import-pages/Import-Instructions.aspx",
    },
  ],
} as const;

export const EXHIBITION_GUIDES: ExhibitionGuide[] = [
  {
    slug: "exhibition-freight-forwarding-saudi-arabia",
    title: {
      en: "Exhibition Freight Forwarding to Saudi Arabia",
      ar: "الشحن الدولي للمعارض إلى السعودية",
    },
    seoTitle: {
      en: "Exhibition Freight Forwarding Saudi Arabia | ENVOD",
      ar: "الشحن الدولي للمعارض في السعودية | إنفود",
    },
    description: {
      en: "A practical guide to planning air, sea and road freight for exhibitions in Saudi Arabia, from cargo lists and routing to venue delivery and return movements.",
      ar: "دليل عملي لتخطيط الشحن الجوي والبحري والبري للمعارض في السعودية، من قوائم البضائع والمسارات إلى التسليم للموقع وحركات العودة.",
    },
    intro: [
      {
        en: "Exhibition freight forwarding connects an exhibitor’s cargo, international transport, customs documentation and event-site schedule. Unlike ordinary replenishment freight, exhibition cargo often has a fixed move-in window, hall and stand reference, organizer rules and a planned return or onward movement.",
        ar: "يربط الشحن الدولي للمعارض بين بضائع العارض والنقل الدولي والمستندات الجمركية وجدول موقع الفعالية. وعلى خلاف شحن الإمدادات المعتاد، غالباً ما تكون لبضائع المعارض نافذة إدخال محددة ورقم قاعة وجناح وقواعد للمنظّم وخطة للعودة أو الانتقال إلى وجهة أخرى.",
      },
      {
        en: "ENVOD reviews exhibition-freight enquiries from its Riyadh head office. Carrier, route, gateway, customs operator, local delivery and the actual service scope are confirmed for each shipment; a page or city reference is not a booking or a guaranteed event appointment.",
        ar: "تراجع إنفود استفسارات شحن المعارض من مكتبها الرئيسي في الرياض. ويُؤكد الناقل والمسار ومنفذ الدخول ومشغّل الجمارك والتسليم المحلي ونطاق الخدمة الفعلي لكل شحنة؛ ولا تعني الإشارة إلى صفحة أو مدينة حجزاً أو تعييناً مضموناً للفعالية.",
      },
    ],
    sections: [
      {
        heading: { en: "Choose the freight mode around the event plan", ar: "اختر وسيلة الشحن وفق خطة الفعالية" },
        paragraphs: [
          {
            en: "Air freight may suit smaller, time-sensitive items when carrier acceptance, flight schedules, customs steps and the available budget align. Sea freight can suit larger or heavier consignments when the event schedule allows for port handling and inland delivery. Road freight can support regional or domestic movements, subject to the route, border documents, vehicle suitability and carrier availability.",
            ar: "قد يناسب الشحن الجوي الأصناف الأصغر والحساسة للوقت عندما يتوافق قبول الناقل ومواعيد الرحلات والخطوات الجمركية والميزانية المتاحة. وقد يناسب الشحن البحري الشحنات الأكبر أو الأثقل عندما يسمح جدول الفعالية بمناولة الميناء والتسليم الداخلي. ويمكن أن يدعم النقل البري الحركات الإقليمية أو المحلية وفق المسار ومستندات الحدود وملاءمة المركبة وتوفر الناقل.",
          },
          {
            en: "Compare the cargo-ready date—not only the event opening date—with transit, customs, inspection, terminal handling, venue delivery appointments and contingency time. No mode removes these dependencies or guarantees a delivery outcome.",
            ar: "قارن تاريخ جاهزية البضائع، لا تاريخ افتتاح الفعالية فقط، مع العبور والجمارك والفحص ومناولة المحطة ومواعيد التسليم للموقع والوقت الاحتياطي. ولا تلغي أي وسيلة هذه المتطلبات أو تضمن نتيجة التسليم.",
          },
        ],
        bullets: [
          { en: "Air: useful to assess for compact or time-sensitive cargo, subject to acceptance and schedule.", ar: "الجوي: يُقيّم للبضائع الصغيرة أو الحساسة للوقت، وفق القبول والجدول." },
          { en: "Sea: assess for larger consignments when port-to-venue time fits the event plan.", ar: "البحري: يُقيّم للشحنات الأكبر عندما يتناسب وقت النقل من الميناء إلى الموقع مع خطة الفعالية." },
          { en: "Road: assess for domestic or GCC routes, border requirements and suitable equipment.", ar: "البري: يُقيّم للمسارات المحلية أو الخليجية ومتطلبات الحدود والمعدات المناسبة." },
        ],
      },
      {
        heading: { en: "Prepare cargo details before requesting a quote", ar: "جهّز تفاصيل البضائع قبل طلب عرض السعر" },
        paragraphs: [
          {
            en: "Provide an itemized packing list with package count, dimensions, gross weight, values and serial numbers where relevant. Describe batteries, liquids, dangerous goods, oversized pieces, fragile objects or special handling needs clearly so acceptance and documentation can be checked before dispatch.",
            ar: "قدّم قائمة تعبئة مفصلة تشمل عدد الطرود وأبعادها ووزنها الإجمالي وقيمها وأرقامها التسلسلية عند الحاجة. ووضّح البطاريات أو السوائل أو البضائع الخطرة أو القطع كبيرة الحجم أو الأشياء القابلة للكسر أو احتياجات المناولة الخاصة، حتى يمكن التحقق من القبول والمستندات قبل الإرسال.",
          },
          {
            en: "Separate items for temporary use and return from goods intended for sale, distribution, consumption or permanent use in Saudi Arabia. Their customs treatment may differ, so confirm the importer, procedure and supporting documents with the responsible customs operator.",
            ar: "افصل الأصناف المعدّة للاستخدام المؤقت والعودة عن البضائع المعدّة للبيع أو التوزيع أو الاستهلاك أو الاستخدام الدائم في السعودية. فقد تختلف معاملتها الجمركية؛ لذا أكّد المستورد والإجراء والمستندات الداعمة مع مشغّل الجمارك المسؤول.",
          },
        ],
      },
      {
        heading: { en: "Coordinate delivery, collection and return freight", ar: "نسّق التسليم والاستلام وشحن العودة" },
        paragraphs: [
          {
            en: "Use the organizer’s exhibitor or freight manual to confirm the event venue, hall, stand number, delivery address, booking slot, cargo labels, dock rules and appointed contractors. The venue may control unloading, movement from dock to stand, empty-case storage, installation and dismantling; these activities must not be assumed to be included in a freight booking.",
            ar: "استخدم دليل العارضين أو الشحن الصادر عن المنظّم لتأكيد موقع الفعالية والقاعة ورقم الجناح وعنوان التسليم وموعد الحجز وملصقات البضائع وقواعد الرصيف والمقاولين المعتمدين. وقد يتحكم الموقع في التفريغ والنقل من الرصيف إلى الجناح وتخزين الصناديق الفارغة والتركيب والتفكيك؛ ولا يُفترض أن هذه الأعمال مشمولة في حجز الشحن.",
          },
          {
            en: "Before dispatch, identify who will collect the cargo after the show, who will repack it, which customs step applies and whether it returns to origin or moves to another event. Confirm the return carrier, destination and documents separately.",
            ar: "قبل الإرسال، حدّد من سيستلم البضائع بعد المعرض ومن سيعيد تغليفها والإجراء الجمركي المنطبق وما إذا كانت ستعود إلى المنشأ أو تنتقل إلى فعالية أخرى. وأكّد ناقل العودة والوجهة والمستندات بشكل منفصل.",
          },
        ],
      },
    ],
    faqs: [
      {
        question: { en: "How do I ship exhibition equipment to Saudi Arabia?", ar: "كيف أشحن معدات المعرض إلى السعودية؟" },
        answer: {
          en: "Start with the event venue and dates, cargo origin, ready date, itemized packing list, dimensions, weight and return plan. The freight mode, carrier, customs documents, importer responsibilities and venue-delivery arrangements must then be checked for the shipment.",
          ar: "ابدأ بموقع الفعالية وتواريخها ومنشأ البضائع وتاريخ جاهزيتها وقائمة التعبئة المفصلة والأبعاد والوزن وخطة العودة. ثم يجب التحقق من وسيلة الشحن والناقل والمستندات الجمركية ومسؤوليات المستورد وترتيبات التسليم للموقع لكل شحنة.",
        },
      },
      {
        question: { en: "When should exhibition freight be arranged?", ar: "متى ينبغي ترتيب شحن المعرض؟" },
        answer: {
          en: "Begin when the event schedule, cargo list and organizer instructions are available. The practical lead time depends on origin, mode, carrier capacity, customs requirements, inspections and the venue’s delivery window; there is no universal booking deadline.",
          ar: "ابدأ عند توفر جدول الفعالية وقائمة البضائع وتعليمات المنظّم. وتعتمد المهلة العملية على المنشأ ووسيلة الشحن وسعة الناقل ومتطلبات الجمارك والفحص ونافذة التسليم للموقع؛ ولا يوجد موعد حجز موحد لجميع الشحنات.",
        },
      },
      {
        question: { en: "Can exhibition freight include a return shipment?", ar: "هل يمكن أن يشمل شحن المعرض شحنة عودة؟" },
        answer: {
          en: "Return freight can be assessed as a separate movement. Confirm which goods will return, who will repack them, the customs procedure and the destination before the event ends.",
          ar: "يمكن تقييم شحن العودة كحركة منفصلة. أكّد البضائع التي ستعود ومن سيعيد تغليفها والإجراء الجمركي والوجهة قبل انتهاء الفعالية.",
        },
      },
    ],
    relatedLinks: [
      { label: { en: "Exhibition & event logistics", ar: "لوجستيات المعارض والفعاليات" }, href: EXHIBITION_HUB_PATH },
      { label: { en: "Freight forwarding", ar: "الشحن وإدارة النقل" }, href: "/services/freight-forwarding" },
      { label: { en: "Air freight", ar: "الشحن الجوي" }, href: "/services/air-freight" },
      { label: { en: "Ocean freight", ar: "الشحن البحري" }, href: "/services/ocean-freight" },
    ],
  },
  {
    slug: "exhibition-customs-clearance-saudi-arabia",
    title: {
      en: "Exhibition Customs Clearance in Saudi Arabia",
      ar: "التخليص الجمركي لشحنات المعارض في السعودية",
    },
    seoTitle: {
      en: "Exhibition Customs Clearance Saudi Arabia | ENVOD",
      ar: "التخليص الجمركي للمعارض في السعودية | إنفود",
    },
    description: {
      en: "Review exhibition cargo documents, importer responsibilities, ZATCA procedures and venue-delivery steps for goods moving into Saudi Arabia.",
      ar: "راجع مستندات بضائع المعارض ومسؤوليات المستورد وإجراءات الهيئة وخطوات التسليم للموقع للبضائع الداخلة إلى السعودية.",
    },
    intro: [
      {
        en: "Exhibition customs clearance planning starts with a correct goods list, a clearly identified importer and the event’s delivery schedule. Cargo for display, demonstration, sale, consumption or permanent use may follow different customs procedures; the organizer’s move-in deadline does not determine the customs treatment.",
        ar: "يبدأ التخطيط للتخليص الجمركي لشحنات المعارض بقائمة دقيقة للبضائع ومستورد محدد بوضوح وجدول تسليم الفعالية. وقد تتبع بضائع العرض أو التجربة أو البيع أو الاستهلاك أو الاستخدام الدائم إجراءات جمركية مختلفة؛ ولا يحدد موعد إدخال الشحنات الذي يضعه المنظّم المعاملة الجمركية.",
      },
      {
        en: "ENVOD can review documentation and coordinate an enquiry with the responsible customs operator. The importer and customs authority remain responsible for the applicable declaration, approvals, release decision and compliance obligations.",
        ar: "يمكن لإنفود مراجعة المستندات وتنسيق الاستفسار مع مشغّل الجمارك المسؤول. ويظل المستورد والجهة الجمركية مسؤولين عن البيان والموافقات وقرار الفسح والتزامات الامتثال المنطبقة.",
      },
    ],
    sections: [
      {
        heading: { en: "Prepare a shipment file that matches the cargo", ar: "جهّز ملف شحنة يطابق البضائع" },
        paragraphs: [
          {
            en: "Provide an itemized commercial invoice and packing list with accurate descriptions, quantities, values, country of origin, package count, weights and dimensions. Add serial numbers or model references where useful, plus the transport document, importer details, event name, venue and requested delivery window.",
            ar: "قدّم فاتورة تجارية وقائمة تعبئة مفصلة بأوصاف دقيقة وكميات وقيم وبلد منشأ وعدد الطرود وأوزان وأبعاد صحيحة. أضف الأرقام التسلسلية أو أرقام الطراز عند الحاجة، إلى جانب مستند النقل وبيانات المستورد واسم الفعالية والموقع ونافذة التسليم المطلوبة.",
          },
          {
            en: "Product permits, certificates, origin evidence, labeling or other approvals can depend on the item and current rules. Confirm classification, duty and tax treatment, document format and any restricted-goods requirements with the responsible customs operator and ZATCA.",
            ar: "قد تعتمد تصاريح المنتج وشهاداته وإثباتات المنشأ والملصقات أو الموافقات الأخرى على الصنف والأنظمة الحالية. أكّد التصنيف والمعاملة الضريبية والجمركية وصيغة المستند وأي متطلبات للبضائع المقيدة مع مشغّل الجمارك المسؤول والهيئة.",
          },
        ],
      },
      {
        heading: { en: "Identify the correct import procedure", ar: "حدّد إجراء الاستيراد المناسب" },
        paragraphs: [
          {
            en: "Separate exhibition equipment intended to return from items intended for sale, distribution, consumption or permanent use in Saudi Arabia. Some goods may be eligible for temporary admission, including through an ATA Carnet where applicable; eligibility, required guarantees and customs acceptance are determined by the authorities and authorized issuing parties.",
            ar: "افصل معدات المعرض المعدّة للعودة عن الأصناف المعدّة للبيع أو التوزيع أو الاستهلاك أو الاستخدام الدائم في السعودية. وقد تكون بعض البضائع مؤهلة للإدخال المؤقت، بما في ذلك عبر كارنيه ATA عند انطباقه؛ وتحدد الجهات المختصة وجهات الإصدار المخوّلة الأهلية والضمانات المطلوبة والقبول الجمركي.",
          },
          {
            en: "ZATCA describes an event-disclosure service for eligible importers working in events and exhibitions. Confirm whether it applies to the importer, event and shipment, what information is required and when the disclosure must be submitted.",
            ar: "تصف الهيئة خدمة للإفصاح عن الفعاليات للمستوردين المؤهلين العاملين في الفعاليات والمعارض. أكّد ما إذا كانت تنطبق على المستورد والفعالية والشحنة والمعلومات المطلوبة وموعد تقديم الإفصاح.",
          },
        ],
      },
      {
        heading: { en: "Keep customs release separate from venue access", ar: "افصل الفسح الجمركي عن دخول موقع الفعالية" },
        paragraphs: [
          {
            en: "A customs release does not itself book a delivery slot or authorize access to a hall or stand. The organizer may require an advance booking, approved freight contractor, vehicle pass, cargo label, security check or specific delivery point. Share the exhibitor manual and confirm the handover with the venue before cargo leaves the gateway.",
            ar: "لا يحجز الفسح الجمركي موعد تسليم ولا يمنح بحد ذاته تصريحاً لدخول القاعة أو الجناح. فقد يطلب المنظّم حجزاً مسبقاً أو مقاول شحن معتمداً أو تصريح مركبة أو ملصقاً للشحنة أو فحصاً أمنياً أو نقطة تسليم محددة. أرسل دليل العارض وأكّد التسليم مع الموقع قبل مغادرة البضائع منفذ الدخول.",
          },
          {
            en: "For goods returning after the show, agree who will collect and repack them, which export or re-export procedure applies and how the return movement will be documented before the event ends.",
            ar: "للبضائع التي ستعود بعد المعرض، اتفق قبل انتهاء الفعالية على الجهة التي ستستلمها وتعيد تغليفها وإجراء التصدير أو إعادة التصدير المنطبق وطريقة توثيق حركة العودة.",
          },
        ],
      },
    ],
    faqs: [
      {
        question: { en: "Who decides whether exhibition goods can enter Saudi Arabia?", ar: "من يقرر السماح بدخول بضائع المعارض إلى السعودية؟" },
        answer: {
          en: "The relevant customs authorities decide entry, classification, approvals and release under current procedures. The importer must provide accurate information and satisfy applicable requirements; a logistics provider cannot guarantee a customs decision.",
          ar: "تقرر الجهات الجمركية المختصة الدخول والتصنيف والموافقات والفسح وفق الإجراءات الحالية. ويجب على المستورد تقديم معلومات دقيقة واستيفاء المتطلبات المنطبقة؛ ولا يستطيع مقدم الخدمات اللوجستية ضمان قرار جمركي.",
        },
      },
      {
        question: { en: "Does an exhibition cargo booking include event-venue access?", ar: "هل يشمل حجز شحن المعرض تصريح دخول موقع الفعالية؟" },
        answer: {
          en: "Not automatically. The event organizer and venue set access, appointment, vehicle and contractor rules. Confirm the delivery slot and handover point separately from customs release.",
          ar: "ليس تلقائياً. يحدد منظّم الفعالية والموقع قواعد الدخول والمواعيد والمركبات والمقاولين. أكّد موعد التسليم ونقطة الاستلام بشكل منفصل عن الفسح الجمركي.",
        },
      },
      {
        question: { en: "What information should an importer send for a customs review?", ar: "ما المعلومات التي يرسلها المستورد لمراجعة جمركية؟" },
        answer: {
          en: "Send the invoice, itemized packing list, goods values, origin, importer details, event and venue information, transport document and the intended use and return plan for each item. Confirm permits and current requirements with the responsible customs operator.",
          ar: "أرسل الفاتورة وقائمة التعبئة المفصلة وقيم البضائع والمنشأ وبيانات المستورد ومعلومات الفعالية والموقع ومستند النقل والغرض وخطة العودة لكل صنف. وأكّد التصاريح والمتطلبات الحالية مع مشغّل الجمارك المسؤول.",
        },
      },
    ],
    references: EXHIBITION_HUB.authoritativeLinks,
    relatedLinks: [
      { label: { en: "Customs clearance services", ar: "خدمات التخليص الجمركي" }, href: "/services/customs-clearance" },
      { label: { en: "ATA Carnet Saudi Arabia", ar: "كارنيه ATA في السعودية" }, href: "/services/ata-carnet" },
      { label: { en: "Temporary import and re-export guide", ar: "دليل الإدخال المؤقت وإعادة التصدير" }, href: "/guides/temporary-import-re-export-exhibition-goods-saudi-arabia" },
      { label: { en: "Exhibition logistics hub", ar: "دليل لوجستيات المعارض" }, href: EXHIBITION_HUB_PATH },
    ],
  },
  {
    slug: "temporary-import-re-export-exhibition-goods-saudi-arabia",
    title: {
      en: "Temporary Import & Re-Export of Exhibition Goods in Saudi Arabia",
      ar: "الإدخال المؤقت وإعادة تصدير بضائع المعارض في السعودية",
    },
    seoTitle: {
      en: "Exhibition Temporary Import & Re-Export Saudi Arabia | ENVOD",
      ar: "الإدخال المؤقت وإعادة التصدير للمعارض السعودية | إنفود",
    },
    description: {
      en: "Understand temporary admission, ATA Carnet enquiries, ZATCA event disclosure and re-export planning for eligible exhibition goods entering Saudi Arabia.",
      ar: "تعرّف على الإدخال المؤقت واستفسارات كارنيه ATA والإفصاح عن الفعاليات لدى الهيئة وتخطيط إعادة التصدير للبضائع المؤهلة الداخلة إلى السعودية.",
    },
    intro: [
      {
        en: "Temporary admission is a customs procedure for eligible goods brought into a country for a limited purpose and period, with conditions for re-export or another approved customs treatment. It is not a blanket exemption for everything an exhibitor ships.",
        ar: "الإدخال المؤقت إجراء جمركي للبضائع المؤهلة التي تدخل دولة لغرض ومدة محددين، مع شروط لإعادة التصدير أو معاملة جمركية أخرى معتمدة. ولا يُعد إعفاءً عاماً لكل ما يشحنه العارض.",
      },
      {
        en: "For Saudi exhibition cargo, ZATCA publishes information on ATA Carnet acceptance, temporary admission using an ATA Carnet and event disclosure. Requirements can depend on the goods, intended use, importer, supporting documents and current customs procedures. Check the live authority instructions before shipping.",
        ar: "تنشر هيئة الزكاة والضريبة والجمارك معلومات عن قبول كارنيه ATA والإدخال المؤقت باستخدامه والإفصاح عن الفعاليات. وقد تعتمد المتطلبات على البضائع والغرض والمستورد والمستندات الداعمة والإجراءات الجمركية الحالية. راجع تعليمات الجهة المختصة قبل الشحن.",
      },
    ],
    sections: [
      {
        heading: { en: "Separate temporary-use goods from permanent imports", ar: "ميّز البضائع المؤقتة عن الواردات الدائمة" },
        paragraphs: [
          {
            en: "Create distinct lines for stands, demonstration equipment, professional tools, samples, giveaways, consumables and goods intended for sale. Items displayed temporarily may be treated differently from goods that will be sold, distributed, consumed or left in the Kingdom. Ask the responsible customs operator to confirm the applicable procedure for each category.",
            ar: "أنشئ بنوداً منفصلة للأجنحة ومعدات العرض والأدوات المهنية والعينات والهدايا والمواد الاستهلاكية والبضائع المعدّة للبيع. فقد تختلف معاملة الأصناف المعروضة مؤقتاً عن البضائع التي ستباع أو توزّع أو تستهلك أو تبقى في المملكة. اطلب من مشغّل الجمارك المسؤول تأكيد الإجراء المنطبق لكل فئة.",
          },
        ],
        bullets: [
          { en: "Describe the use, owner, serial number, quantity, value and planned destination after the event.", ar: "صف الاستخدام والمالك والرقم التسلسلي والكمية والقيمة والوجهة المخططة بعد الفعالية." },
          { en: "Identify goods that may be sold, consumed, gifted or left behind separately.", ar: "حدّد بشكل منفصل البضائع التي قد تُباع أو تُستهلك أو تُهدى أو تُترك." },
          { en: "Confirm the eligible importer, procedure, guarantees, permits and deadlines with the authorized parties.", ar: "أكّد المستورد المؤهل والإجراء والضمانات والتصاريح والمواعيد مع الجهات المخوّلة." },
        ],
      },
      {
        heading: { en: "When an ATA Carnet may be relevant", ar: "متى قد يكون كارنيه ATA مناسباً؟" },
        paragraphs: [
          {
            en: "ZATCA states that Saudi customs accepts ATA Carnets and lists exhibitions and fairs among the uses for eligible goods. A Carnet’s availability and use still depend on the specific goods, purpose, issuing terms, endorsements, destination controls and customs approval. An ATA Carnet does not guarantee automatic clearance or replace other permits or procedures.",
            ar: "تذكر الهيئة أن الجمارك السعودية تقبل كارنيهات ATA وتدرج المعارض والأسواق ضمن استخدامات البضائع المؤهلة. ومع ذلك، يعتمد توفر الكارنيه واستخدامه على البضائع المحددة والغرض وشروط الإصدار والتصديقات وضوابط الوجهة وموافقة الجمارك. ولا يضمن كارنيه ATA التخليص التلقائي ولا يحل محل التصاريح أو الإجراءات الأخرى.",
          },
          {
            en: "Authorized associations issue Carnets. ENVOD can review shipment information and coordinate related freight or documentation enquiries, but it is not the issuing authority. The Carnet holder remains responsible for the document, accurate goods list and required customs endorsements.",
            ar: "تصدر الكارنيهات جهات مخوّلة. ويمكن لإنفود مراجعة معلومات الشحنة وتنسيق استفسارات الشحن أو المستندات ذات الصلة، لكنها ليست جهة إصدار. ويظل حامل الكارنيه مسؤولاً عن المستند وقائمة البضائع الدقيقة والتصديقات الجمركية المطلوبة.",
          },
        ],
      },
      {
        heading: { en: "Plan the re-export before dispatch", ar: "خطط لإعادة التصدير قبل الإرسال" },
        paragraphs: [
          {
            en: "Record which items must return, their identifying details, the person responsible at the venue, the event teardown window and the intended export gateway. Keep arrival and departure evidence, customs endorsements, transport records and any authority instructions together. The applicable time limit and close-out steps must be confirmed for the shipment.",
            ar: "سجّل الأصناف المطلوب إرجاعها وبيانات تعريفها والمسؤول عنها في الموقع ونافذة التفكيك ومنفذ التصدير المقصود. واحتفظ معاً بإثباتات الوصول والمغادرة والتصديقات الجمركية وسجلات النقل وأي تعليمات من الجهة المختصة. ويجب تأكيد المهلة وخطوات الإقفال المنطبقة لكل شحنة.",
          },
          {
            en: "ZATCA’s event-disclosure service is described for importers working in events and exhibitions to notify the Authority in advance. Check who is eligible to submit, what information is required and whether disclosure applies to the event and goods in question.",
            ar: "تصف الهيئة خدمة الإفصاح عن الفعاليات بأنها مخصصة للمستوردين العاملين في مجال الفعاليات والمعارض لإبلاغ الهيئة مسبقاً. تحقّق ممن يحق له التقديم والمعلومات المطلوبة وما إذا كان الإفصاح ينطبق على الفعالية والبضائع المعنية.",
          },
        ],
      },
    ],
    faqs: [
      {
        question: { en: "Does an ATA Carnet guarantee customs clearance in Saudi Arabia?", ar: "هل يضمن كارنيه ATA التخليص الجمركي في السعودية؟" },
        answer: {
          en: "No. Customs acceptance depends on eligibility, the goods, intended use, correct documentation and authority procedures. ZATCA and other responsible authorities retain decision-making authority.",
          ar: "لا. يعتمد القبول الجمركي على الأهلية والبضائع والغرض ودقة المستندات وإجراءات الجهات المختصة. وتبقى سلطة اتخاذ القرار لدى الهيئة والجهات المعنية الأخرى.",
        },
      },
      {
        question: { en: "Can goods for sale use a temporary-admission procedure?", ar: "هل يمكن إدخال البضائع المعدّة للبيع بإجراء الإدخال المؤقت؟" },
        answer: {
          en: "Do not assume so. Goods intended for sale, distribution, consumption or permanent use may need a different import procedure; confirm the treatment with the responsible customs operator and authorities.",
          ar: "لا تفترض ذلك. فقد تحتاج البضائع المعدّة للبيع أو التوزيع أو الاستهلاك أو الاستخدام الدائم إلى إجراء استيراد مختلف؛ أكّد المعاملة مع مشغّل الجمارك والجهات المختصة.",
        },
      },
      {
        question: { en: "What should be ready before a temporary exhibition shipment leaves?", ar: "ما الذي يجب تجهيزه قبل مغادرة شحنة معرض مؤقتة؟" },
        answer: {
          en: "Prepare a detailed goods list, values and serial numbers where relevant, event and importer information, transport documents and the proposed return plan. Confirm current eligibility, approvals and customs deadlines before dispatch.",
          ar: "جهّز قائمة مفصلة بالبضائع وقيمها وأرقامها التسلسلية عند الحاجة ومعلومات الفعالية والمستورد ومستندات النقل وخطة العودة المقترحة. وأكّد الأهلية والموافقات والمواعيد الجمركية الحالية قبل الإرسال.",
        },
      },
    ],
    references: EXHIBITION_HUB.authoritativeLinks,
    relatedLinks: [
      { label: { en: "ATA Carnet coordination", ar: "تنسيق كارنيه ATA" }, href: "/services/ata-carnet" },
      { label: { en: "Exhibition customs clearance", ar: "التخليص الجمركي للمعارض" }, href: "/services/customs-clearance" },
      { label: { en: "Exhibition logistics hub", ar: "دليل لوجستيات المعارض" }, href: EXHIBITION_HUB_PATH },
    ],
  },
  {
    slug: "fine-art-museum-exhibition-logistics-saudi-arabia",
    title: {
      en: "Fine Art & Museum Exhibition Logistics in Saudi Arabia",
      ar: "لوجستيات شحن الأعمال الفنية ومعارض المتاحف في السعودية",
    },
    seoTitle: {
      en: "Fine Art & Museum Logistics Saudi Arabia | ENVOD",
      ar: "لوجستيات الأعمال الفنية والمتاحف في السعودية | إنفود",
    },
    description: {
      en: "Plan Saudi exhibition transport for artwork and museum exhibits. Check packing, documents, routes and specialist-handling needs.",
      ar: "دليل تخطيط لنقل الأعمال الفنية والمنحوتات ومعروضات المتاحف إلى المعارض السعودية، مع نقاط مراجعة للتغليف والمستندات والمسارات والمناولة المتخصصة.",
    },
    intro: [
      {
        en: "Fine-art and museum shipments need item-level planning. A painting, sculpture, framed work or fragile display object can have different packing, handling, customs and insurance requirements. This guide helps an organizer or lender prepare an enquiry; it does not represent conservation, installation or insurance advice.",
        ar: "تحتاج شحنات الأعمال الفنية والمتاحف إلى تخطيط لكل قطعة. فقد تختلف متطلبات التغليف والمناولة والجمارك والتأمين للوحة أو منحوتة أو عمل مؤطر أو قطعة عرض قابلة للكسر. يساعد هذا الدليل المنظّم أو الجهة المُعيرة على إعداد الاستفسار، ولا يُعد نصيحة للحفظ أو التركيب أو التأمين.",
      },
      {
        en: "ENVOD can review a request to coordinate freight and shipment information. A qualified art handler, conservation specialist, crate maker, insurer, venue contractor or customs operator must be identified and confirmed where the shipment needs that specialist role.",
        ar: "يمكن لإنفود مراجعة طلب تنسيق الشحن ومعلوماته. ويجب تحديد وتأكيد مختص مناولة الأعمال الفنية أو الحفظ أو تصنيع الصناديق أو التأمين أو مقاول الموقع أو مشغّل الجمارك عند حاجة الشحنة إلى هذا الدور المتخصص.",
      },
    ],
    sections: [
      {
        heading: { en: "Create a condition-aware inventory", ar: "أعد قائمة تراعي حالة القطع" },
        paragraphs: [
          {
            en: "Record each object separately, including title or reference, creator where appropriate, materials, dimensions, weight, declared value, photographs and current condition. Note fragile points, protruding elements, glass, batteries or other regulated components, plus any restrictions on tilting, stacking, temperature or vibration.",
            ar: "سجّل كل قطعة على حدة، بما في ذلك العنوان أو المرجع والفنان عند الاقتضاء والمواد والأبعاد والوزن والقيمة المصرح بها والصور والحالة الحالية. واذكر نقاط الهشاشة والأجزاء البارزة والزجاج والبطاريات أو المكونات الخاضعة للضوابط، وأي قيود على الإمالة أو التكديس أو الحرارة أو الاهتزاز.",
          },
          {
            en: "The lender, owner, curator or appointed specialist should define handling, packing, unpacking and installation instructions. Do not infer conservation standards or acceptability from a general freight description.",
            ar: "ينبغي للجهة المُعيرة أو المالك أو القيّم أو المختص المعين تحديد تعليمات المناولة والتغليف وفك التغليف والتركيب. ولا تستنتج معايير الحفظ أو صلاحية المناولة المتخصصة من وصف شحن عام.",
          },
        ],
      },
      {
        heading: { en: "Confirm packing, transport and site responsibilities", ar: "أكّد مسؤوليات التغليف والنقل والموقع" },
        paragraphs: [
          {
            en: "Before booking, agree who supplies crates or cases, protective materials, shock or moisture controls, loading equipment, route monitoring and any specialist vehicle. Clarify handovers at origin, border, terminal and venue, including condition checks and the person authorized to receive each object.",
            ar: "قبل الحجز، اتفق على الجهة التي توفر الصناديق أو الحاويات والمواد الواقية وضوابط الصدمات أو الرطوبة ومعدات التحميل ومتابعة المسار وأي مركبة متخصصة. ووضّح عمليات التسليم عند المنشأ والحدود والمحطة والموقع، بما في ذلك فحوص الحالة والشخص المخوّل باستلام كل قطعة.",
          },
          {
            en: "Venue loading docks, appointed art handlers, opening hours, delivery slots and installation access are controlled by the organizer or venue. Obtain written instructions before the cargo leaves its origin.",
            ar: "يتحكم المنظّم أو الموقع في أرصفة التحميل ومناولي الأعمال الفنية المعتمدين وساعات العمل ومواعيد التسليم وإمكانية التركيب. احصل على تعليمات مكتوبة قبل مغادرة الشحنة من منشئها.",
          },
        ],
      },
      {
        heading: { en: "Check temporary admission and return documentation", ar: "تحقق من مستندات الإدخال المؤقت والعودة" },
        paragraphs: [
          {
            en: "For a loaned exhibit intended to leave Saudi Arabia after display, confirm whether temporary admission, an ATA Carnet or another procedure applies to the exact objects and intended use. The issuing association and customs authorities determine eligibility and acceptance; the lender and importer should confirm responsibility for any guarantee, approvals and re-export deadline.",
            ar: "للمعروضات المُعارة والمعدة لمغادرة السعودية بعد العرض، أكّد ما إذا كان الإدخال المؤقت أو كارنيه ATA أو إجراء آخر ينطبق على القطع والغرض المحددين. وتحدد جهة الإصدار والسلطات الجمركية الأهلية والقبول؛ وينبغي للجهة المُعيرة والمستورد تأكيد مسؤولية أي ضمان وموافقات وموعد إعادة التصدير.",
          },
        ],
      },
    ],
    faqs: [
      {
        question: { en: "Does ENVOD provide art conservation or museum installation?", ar: "هل تقدم إنفود خدمات حفظ الأعمال الفنية أو تركيبها في المتاحف؟" },
        answer: {
          en: "This page does not claim conservation or installation services. If a shipment needs those tasks, the qualified specialist, venue approval, scope and insurance arrangements must be confirmed separately.",
          ar: "لا تدّعي هذه الصفحة تقديم خدمات الحفظ أو التركيب. وإذا احتاجت الشحنة إلى هذه المهام، فيجب تأكيد المختص المؤهل وموافقة الموقع والنطاق وترتيبات التأمين بشكل منفصل.",
        },
      },
      {
        question: { en: "What information helps plan artwork transport?", ar: "ما المعلومات التي تساعد في تخطيط نقل الأعمال الفنية؟" },
        answer: {
          en: "Provide an itemized inventory, dimensions, weight, values, current condition, photographs, handling limits, packing requirements, origin, destination, event dates and the planned return date.",
          ar: "قدّم قائمة مفصلة بالقطع وأبعادها وأوزانها وقيمها وحالتها الحالية وصورها وحدود مناولتها ومتطلبات تغليفها والمنشأ والوجهة وتواريخ الفعالية وموعد العودة المخطط.",
        },
      },
    ],
    relatedLinks: [
      { label: { en: "Exhibition logistics hub", ar: "دليل لوجستيات المعارض" }, href: EXHIBITION_HUB_PATH },
      { label: { en: "Packaging and crating", ar: "التغليف والصناديق" }, href: "/services/packaging-crating" },
      { label: { en: "Project cargo", ar: "شحن المشاريع" }, href: "/services/project-cargo" },
    ],
  },
  {
    slug: "live-show-event-logistics-saudi-arabia",
    title: {
      en: "Live Show & Event Logistics in Saudi Arabia",
      ar: "لوجستيات العروض الحية والفعاليات في السعودية",
    },
    seoTitle: {
      en: "Live Show Event Logistics Saudi Arabia | ENVOD",
      ar: "لوجستيات العروض الحية في السعودية | إنفود",
    },
    description: {
      en: "Plan freight and customs questions for concert, show, conference and production equipment moving into Saudi Arabia, to venues and back out after an event.",
      ar: "خطط لاستفسارات الشحن والجمارك لمعدات الحفلات والعروض والمؤتمرات والإنتاج الداخلة إلى السعودية والمتجهة إلى المواقع ثم العائدة بعد الفعالية.",
    },
    intro: [
      {
        en: "Live events combine transport deadlines with production schedules. Touring cases, sound and lighting equipment, LED screens, staging components, broadcast gear and promotional materials may move through different routes and customs procedures. Each item’s carrier acceptance, permits, venue access and available handling must be checked for the actual event.",
        ar: "تجمع الفعاليات الحية بين مواعيد النقل وجداول الإنتاج. فقد تنتقل حقائب الجولات ومعدات الصوت والإضاءة وشاشات LED ومكونات المنصات ومعدات البث والمواد الترويجية عبر مسارات وإجراءات جمركية مختلفة. ويجب التحقق من قبول الناقل والتصاريح ودخول الموقع والمناولة المتاحة لكل صنف وللفعالية المعنية.",
      },
      {
        en: "ENVOD reviews event-cargo coordination enquiries; this is not a claim that every venue, tour or specialist production service is available. Transport, customs, local handling, on-site crew, lifting and return responsibilities are confirmed before booking.",
        ar: "تراجع إنفود استفسارات تنسيق بضائع الفعاليات؛ ولا يعني ذلك توفر كل موقع أو جولة أو خدمة إنتاج متخصصة. ويُؤكد النقل والجمارك والمناولة المحلية والفريق الميداني والرفع ومسؤوليات العودة قبل الحجز.",
      },
    ],
    sections: [
      {
        heading: { en: "Build the production cargo plan", ar: "أنشئ خطة لبضائع الإنتاج" },
        paragraphs: [
          {
            en: "Start with a serialized equipment list, package dimensions and weights, origin, cargo-ready date, venue delivery deadline and post-event destination. Group equipment by owner, function, shipment document and intended return so that freight and customs records can be checked together.",
            ar: "ابدأ بقائمة معدات ذات أرقام تسلسلية وأبعاد الطرود وأوزانها والمنشأ وتاريخ الجاهزية والموعد النهائي للتسليم إلى الموقع والوجهة بعد الفعالية. صنّف المعدات بحسب المالك والاستخدام ومستند الشحنة والعودة المتوقعة حتى يمكن مراجعة سجلات الشحن والجمارك معاً.",
          },
          {
            en: "Identify batteries, wireless devices, lasers, pyrotechnics, liquids, rigging, oversized cases and any controlled or dangerous goods early. Carrier restrictions, permits and authority approvals may apply; do not assume acceptance because similar equipment moved on another route.",
            ar: "حدّد مبكراً البطاريات والأجهزة اللاسلكية والليزر والمؤثرات النارية والسوائل ومعدات التعليق والحقائب كبيرة الحجم وأي بضائع مقيدة أو خطرة. وقد تنطبق قيود الناقل والتصاريح وموافقات الجهات؛ ولا تفترض القبول لأن معدات مشابهة نُقلت عبر مسار آخر.",
          },
        ],
      },
      {
        heading: { en: "Match transport with access and show schedules", ar: "طابق النقل مع مواعيد الدخول والعرض" },
        paragraphs: [
          {
            en: "The production schedule may distinguish freight arrival, customs release, venue move-in, rigging, rehearsal, performance, strike and collection. Confirm the dock booking, vehicle restrictions, security checks, assigned contractor, working hours and person authorized to receive cargo with the event organizer.",
            ar: "قد يميّز جدول الإنتاج بين وصول الشحنات والفسح الجمركي ودخول الموقع وتجهيز المعدات والبروفة والعرض والتفكيك والاستلام. أكّد حجز رصيف التحميل وقيود المركبات والفحوص الأمنية والمقاول المعين وساعات العمل والشخص المخوّل باستلام البضائع مع منظّم الفعالية.",
          },
          {
            en: "For GCC touring or multiple Saudi cities, confirm each leg, border requirements, driver or carrier availability, local unloading and the next venue’s time window. A single event schedule does not automatically authorize access at each site.",
            ar: "للجولات الخليجية أو التنقل بين مدن سعودية متعددة، أكّد كل مرحلة ومتطلبات الحدود وتوفر السائق أو الناقل والتفريغ المحلي ونافذة الموقع التالي. ولا يمنح جدول الفعالية وحده تصريح دخول تلقائياً إلى كل موقع.",
          },
        ],
      },
      {
        heading: { en: "Plan the return movement before the final show", ar: "خطط لحركة العودة قبل العرض الأخير" },
        paragraphs: [
          {
            en: "Before performance close, assign who will count, repack and hand over each case; confirm customs documents and whether the equipment returns to origin, moves to another tour stop or remains in Saudi Arabia. The correct import or export process depends on the item, owner, use and route.",
            ar: "قبل انتهاء العرض، حدّد من سيعدّ كل حقيبة ويعيد تغليفها ويسلمها؛ وأكّد المستندات الجمركية وما إذا كانت المعدات ستعود إلى المنشأ أو تنتقل إلى محطة جولة أخرى أو تبقى في السعودية. وتعتمد إجراءات الاستيراد أو التصدير الصحيحة على الصنف والمالك والاستخدام والمسار.",
          },
        ],
      },
    ],
    faqs: [
      {
        question: { en: "Can live-event equipment enter Saudi Arabia temporarily?", ar: "هل يمكن إدخال معدات العروض الحية إلى السعودية مؤقتاً؟" },
        answer: {
          en: "Some equipment may qualify for temporary admission, subject to the goods, purpose, importer, documents and customs approval. Confirm eligibility and the return or re-export procedure with the responsible customs operator and authorities.",
          ar: "قد تكون بعض المعدات مؤهلة للإدخال المؤقت وفق نوع البضائع والغرض والمستورد والمستندات وموافقة الجمارك. أكّد الأهلية وإجراء العودة أو إعادة التصدير مع مشغّل الجمارك والجهات المختصة.",
        },
      },
      {
        question: { en: "Does event logistics include venue installation or rigging?", ar: "هل تشمل لوجستيات الفعاليات التركيب أو التعليق في الموقع؟" },
        answer: {
          en: "Not by default. The venue or organizer may appoint specific contractors and control access, rigging, unloading and installation. Confirm the provider, permission and responsibilities before booking.",
          ar: "ليس تلقائياً. فقد يعيّن الموقع أو المنظّم مقاولين محددين ويتحكم في الدخول والتعليق والتفريغ والتركيب. أكّد مقدم الخدمة والتصاريح والمسؤوليات قبل الحجز.",
        },
      },
    ],
    relatedLinks: [
      { label: { en: "Exhibition logistics hub", ar: "دليل لوجستيات المعارض" }, href: EXHIBITION_HUB_PATH },
      { label: { en: "Freight forwarding", ar: "الشحن وإدارة النقل" }, href: "/services/freight-forwarding" },
      { label: { en: "ATA Carnet coordination", ar: "تنسيق كارنيه ATA" }, href: "/services/ata-carnet" },
    ],
  },
];

export const EXHIBITION_GUIDE_BY_SLUG = Object.fromEntries(
  EXHIBITION_GUIDES.map((guide) => [guide.slug, guide]),
) as Record<string, ExhibitionGuide | undefined>;
