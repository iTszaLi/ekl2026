export type ServiceFaq = {
  q: { en: string; ar: string };
  a: { en: string; ar: string };
};

export const SERVICE_FAQS: ServiceFaq[] = [
  {
    q: { en: "What logistics services are available?", ar: "ما الخدمات اللوجستية المتاحة؟" },
    a: {
      en: "ENVOD coordinates 25 enquiry options across core and specialist logistics, from freight and customs to exhibition, project and temperature-sensitive cargo. Availability and scope are confirmed for each shipment.",
      ar: "تنسق إنفود 25 خياراً للاستفسار ضمن الخدمات الأساسية والمتخصصة، من الشحن والجمارك إلى المعارض والمشاريع والبضائع الحساسة للحرارة. تُؤكد إمكانية الخدمة ونطاقها لكل شحنة.",
    },
  },
  {
    q: { en: "Which documents are needed for Saudi customs clearance?", ar: "ما المستندات المطلوبة للتخليص الجمركي في السعودية؟" },
    a: {
      en: "Requirements vary by product, origin, route and importer. A commercial invoice, packing list and transport document may be relevant; certificates, permits or platform steps such as SABER, SFDA, GACA, SASO, IEC, Fasah or ZATCA depend on the shipment. Authorities determine approvals and release.",
      ar: "تختلف المتطلبات حسب المنتج والمنشأ والمسار والمستورد. قد تلزم الفاتورة التجارية وقائمة التعبئة ومستند النقل؛ وتعتمد الشهادات والتصاريح أو إجراءات منصات مثل SABER وSFDA وGACA وSASO وIEC وفسح وزاتكا على الشحنة. تحدد الجهات المختصة الموافقات والفسح.",
    },
  },
  {
    q: { en: "What details help prepare an exhibition logistics quote?", ar: "ما التفاصيل اللازمة لطلب عرض سعر للمعارض؟" },
    a: {
      en: "Share the event and venue, origin and destination, cargo list and dimensions, ready date, delivery window, packing details and return or re-export plan. Temporary import, venue access and handling arrangements are reviewed for that event.",
      ar: "أرسل اسم الفعالية وموقعها والمنشأ والوجهة وقائمة البضائع وأبعادها وتاريخ الجاهزية ونافذة التسليم وتفاصيل التغليف وخطة الإعادة أو إعادة التصدير. تُراجع ترتيبات الإدخال المؤقت ودخول الموقع والمناولة لكل فعالية.",
    },
  },
  {
    q: { en: "Can exhibition cargo be temporarily imported and re-exported?", ar: "هل يمكن إدخال شحنات المعارض مؤقتاً ثم إعادة تصديرها؟" },
    a: {
      en: "Some exhibition goods may qualify for temporary admission. The applicable procedure depends on the goods, intended use, documents and authority acceptance; an ATA Carnet may be one option for eligible items. Confirm eligibility, deadlines and re-export requirements with the authorized issuing association and customs authorities. ENVOD can coordinate shipment information and documents but does not issue a Carnet.",
      ar: "قد تكون بعض بضائع المعارض مؤهلة للإدخال المؤقت. ويعتمد الإجراء المناسب على نوع البضاعة والاستخدام المقصود والمستندات وقبول الجهات المختصة؛ وقد يكون كارنيه ATA خياراً للبضائع المؤهلة. أكّد الأهلية والمواعيد ومتطلبات إعادة التصدير مع جهة الإصدار المخوّلة والسلطات الجمركية. يمكن لإنفود تنسيق معلومات الشحنة ومستنداتها، لكنها لا تصدر كارنيه ATA.",
    },
  },
  {
    q: { en: "Can ENVOD issue an ATA Carnet?", ar: "هل تصدر إنفود كارنيه ATA؟" },
    a: {
      en: "No. ENVOD can coordinate an enquiry and review shipment information for possible ATA Carnet use. Eligibility, issuance and acceptance must be confirmed with the authorized issuing association and relevant customs authorities.",
      ar: "لا. يمكن لإنفود تنسيق الاستفسار ومراجعة معلومات الشحنة لاحتمال استخدام كارنيه ATA. يجب تأكيد الأهلية والإصدار والقبول مع جمعية الإصدار المخوّلة والسلطات الجمركية المعنية.",
    },
  },
  {
    q: { en: "Can you coordinate transport across the GCC?", ar: "هل يمكن تنسيق النقل عبر دول مجلس التعاون؟" },
    a: {
      en: "Send the origin, destination, cargo, requested dates and any border-document details. Route, operator availability, vehicle and customs responsibilities are checked for each request; timings depend on route and border procedures.",
      ar: "أرسل المنشأ والوجهة والبضاعة والتواريخ المطلوبة وأي تفاصيل لمستندات الحدود. يُتحقق من المسار وتوفر المشغّل والمركبة ومسؤوليات الجمارك لكل طلب؛ وتعتمد المواعيد على المسار وإجراءات الحدود.",
    },
  },
  {
    q: { en: "What information is needed for oversized cargo?", ar: "ما المعلومات المطلوبة لشحنة ضخمة؟" },
    a: {
      en: "Provide exact packed dimensions and weight, cargo drawings or photos, pickup and delivery locations, dates, lifting or site constraints and known permits. Route feasibility, equipment and qualified-provider availability need shipment-specific review.",
      ar: "أرسل الأبعاد والوزن بعد التغليف بدقة ورسومات البضاعة أو صورها وموقعي الاستلام والتسليم والتواريخ وقيود الرفع أو الموقع والتصاريح المعروفة. تتطلب ملاءمة المسار والمعدات وتوفر مقدم الخدمة المناسب مراجعة خاصة بالشحنة.",
    },
  },
  {
    q: { en: "Can temperature-controlled transport be arranged?", ar: "هل يمكن ترتيب نقل بدرجة حرارة مضبوطة؟" },
    a: {
      en: "Share the product, required temperature range, route, dates, packaging and monitoring needs. Suitable equipment, carrier acceptance, custody and availability must be confirmed before arrangements are agreed.",
      ar: "أرسل نوع المنتج ونطاق الحرارة المطلوب والمسار والتواريخ والتغليف واحتياجات المراقبة. يجب تأكيد المعدات المناسبة وقبول الناقل والحيازة والتوفر قبل اعتماد الترتيبات.",
    },
  },
  {
    q: { en: "What details should I include in a door-to-door quote request?", ar: "ما التفاصيل التي أضيفها لطلب عرض سعر من الباب إلى الباب؟" },
    a: {
      en: "Include pickup and delivery postcodes or addresses, cargo description, dimensions and weight, ready date, handling needs and any customs requirements. ENVOD will review the route and confirm operators and scope for that shipment.",
      ar: "أدرج عناوين أو رموز مواقع الاستلام والتسليم ووصف البضاعة وأبعادها ووزنها وتاريخ الجاهزية واحتياجات المناولة وأي متطلبات جمركية. تراجع إنفود المسار وتؤكد المشغّلين والنطاق لهذه الشحنة.",
    },
  },
];
