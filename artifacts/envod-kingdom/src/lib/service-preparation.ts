interface Preparation {
  heading: [string, string];
  summary: [string, string];
  items: [string, string][];
  note: [string, string];
  source?: { label: [string, string]; url: string };
}

export const SERVICE_PREPARATION: Record<string, Preparation> = {
  relocation: {
    heading: ["Prepare a Riyadh home-moving enquiry", "جهّز استفسار نقل منزلك في الرياض"],
    summary: [
      "A clear move brief helps ENVOD review the route and requested scope. Share only the details needed for an initial estimate; exact addresses can follow when necessary.",
      "تساعد تفاصيل الانتقال إنفود على مراجعة المسار والنطاق المطلوب. أرسل ما يلزم للاستفسار الأولي فقط؛ ويمكن تقديم العناوين الدقيقة عند الحاجة.",
    ],
    items: [
      ["Identify the move type, approximate home size or room count, major furniture, carton estimate and preferred date.", "حدد نوع الانتقال والحجم التقريبي للمنزل أو عدد الغرف وأبرز قطع الأثاث وعدد الصناديق والموعد المفضل."],
      ["Share origin and destination cities or areas. Note stairs, lift access, parking or entry limits, and fragile or oversized items.", "أرسل مدينتي أو منطقتي المنشأ والوجهة. واذكر السلالم أو المصعد وقيود المواقف أو الدخول والقطع الحساسة أو كبيرة الحجم."],
      ["List requested packing, furniture dismantling or reassembly, storage, or other handling needs; these are not assumed to be included.", "اذكر احتياجات التغليف أو فك الأثاث أو تركيبه أو التخزين أو المناولة الأخرى؛ ولا يُفترض شمولها تلقائياً."],
      ["For an international move, add the origin and destination countries and ask which household goods, customs documents and provider responsibilities apply to that route.", "للانتقال الدولي، أضف دولتي المنشأ والوجهة واستفسر عن أهلية الأمتعة المنزلية ومستندات الجمارك ومسؤوليات مقدم الخدمة للمسار."],
    ],
    note: [
      "Local and intercity routes, provider availability, packing scope, storage, customs, insurance terms, price and timing require case-specific confirmation. Ask for the responsible provider, included work, exclusions and terms before booking.",
      "تتطلب المسارات المحلية وبين المدن وتوفر مقدم الخدمة ونطاق التغليف والتخزين والجمارك وشروط التأمين والسعر والموعد تأكيداً لكل حالة. اطلب تحديد مقدم الخدمة المسؤول والأعمال المشمولة والاستثناءات والشروط قبل الحجز.",
    ],
  },
  "project-cargo": {
    heading: ["Project-cargo planning checklist", "قائمة تجهيز نقل بضائع المشاريع"],
    summary: ["Start with a cargo survey and a shipment-specific transport plan. A vehicle name alone does not establish whether a load can move safely or legally on a proposed route.", "ابدأ بمعاينة البضاعة وخطة نقل خاصة بالشحنة. اسم المركبة وحده لا يثبت إمكانية نقل الحمولة بأمان أو السماح بمرورها على المسار المقترح."],
    items: [
      ["Provide packed length, width, height, gross weight, drawings and the centre of gravity where known. Identify lifting and lashing points with the equipment manufacturer.", "أرسل الطول والعرض والارتفاع بعد التعبئة والوزن الإجمالي والرسومات ومركز الثقل إن كان معروفاً. حدد نقاط الرفع والتثبيت مع مصنع المعدات."],
      ["Share collection and delivery coordinates, access restrictions, ground conditions and unloading arrangements. Review clearance heights, turning space and any route-survey or permit needs with the responsible operator.", "أرسل موقعي الاستلام والتسليم وقيود الدخول وحالة الأرضية وترتيبات التفريغ. راجع الارتفاعات المتاحة ومساحة الدوران والحاجة إلى معاينة المسار أو التصاريح مع المشغل المسؤول."],
      ["Agree responsibilities for engineering, lifting equipment, securing, escorts, insurance and contingency arrangements before selecting a lowbed, flatbed or other vehicle.", "اتفق على مسؤوليات الدراسة الهندسية ومعدات الرفع وتثبيت الحمولة والمرافقة والتأمين وخطة الطوارئ قبل اختيار لوبد أو سطحه أو مركبة أخرى."],
    ],
    note: ["Lowbed and flatbed are planning options, not a statement of ENVOD fleet ownership or confirmed availability. Equipment suitability, competent operators and any required approvals must be confirmed for the actual movement.", "اللوبد والسطحات خيارات للتخطيط، وليست بياناً بملكية إنفود لأسطول أو تأكيداً لتوفره. يجب تأكيد ملاءمة المعدات وكفاءة المشغلين وأي موافقات مطلوبة لعملية النقل الفعلية."],
  },
  "temperature-controlled-logistics": {
    heading: ["Temperature-controlled shipment preparation", "تجهيز الشحنات التي تتطلب ضبط الحرارة"],
    summary: ["Specify the product's handling requirements before requesting a refrigerated vehicle or storage arrangement. A cooling setpoint alone does not prove that the complete supply chain meets those requirements.", "حدد متطلبات مناولة المنتج قبل طلب مركبة مبردة أو ترتيب تخزين. ضبط جهاز التبريد على درجة معينة لا يثبت وحده مطابقة سلسلة الإمداد كاملة لهذه المتطلبات."],
    items: [
      ["Share the product specification, required temperature range, permitted excursions, packaging and dispatch condition. Distinguish chilled, frozen and ambient requirements.", "أرسل مواصفات المنتج ونطاق الحرارة المطلوب والانحرافات المسموح بها والتعبئة وحالة المنتج عند الإرسال. ميّز بين التبريد والتجميد ودرجة الحرارة المحيطة."],
      ["Agree loading duration, preconditioning, product segregation, handover checks and monitoring responsibilities. Ask how temperature records and exceptions will be reviewed.", "اتفق على مدة التحميل والتهيئة المسبقة وفصل المنتجات وفحوص التسليم ومسؤوليات المراقبة. استوضح طريقة مراجعة سجلات الحرارة والحالات الاستثنائية."],
      ["Confirm the proposed operator, equipment, route, any storage stop and receiving-site readiness. Pharmaceutical and food shipments may have different product-specific regulatory requirements.", "أكد المشغل والمعدات والمسار وأي توقف للتخزين وجاهزية موقع الاستلام. قد تختلف المتطلبات التنظيمية الخاصة بالمنتج بين الأدوية والمواد الغذائية."],
    ],
    note: ["This is a preparation guide, not a claim of a validated temperature range, GDP certification, an owned refrigerated fleet or licensed cold stores. Confirm the permitted arrangement and supporting evidence before booking.", "هذا دليل للتجهيز، وليس ادعاءً بنطاق حرارة معتمد أو شهادة GDP أو أسطول تبريد مملوك أو مستودعات تبريد مرخصة. أكد الترتيب المسموح به والأدلة الداعمة قبل الحجز."],
  },
  "freight-forwarding": {
    heading: ["What freight forwarding coordinates", "ما الذي ينسقه وكيل الشحن؟"],
    summary: ["Freight forwarding brings together routing, carrier bookings, shipment documents and handovers. It is different from owning the truck or vessel, operating a warehouse, or granting customs approval.", "يجمع تنسيق الشحن بين تخطيط المسار وحجوزات الناقل ومستندات الشحنة وتسليمها بين الأطراف. وهو يختلف عن امتلاك الشاحنة أو السفينة أو تشغيل المستودع أو منح الموافقة الجمركية."],
    items: [
      ["Specify the collection point, final destination, commodity, packed size, weight and cargo-ready date.", "حدد نقطة الاستلام والوجهة النهائية والسلعة والأبعاد بعد التعبئة والوزن وتاريخ الجاهزية."],
      ["Clarify the agreed Incoterms and which party handles origin charges, main carriage, destination charges and import formalities.", "وضح قاعدة الإنكوترمز المتفق عليها والطرف المسؤول عن تكاليف المنشأ والنقل الرئيسي وتكاليف الوجهة وإجراءات الاستيراد."],
      ["Ask which transport legs, customs coordination and delivery services are included. Storage, consolidation and cargo insurance arrangements need separate confirmation where requested.", "تحقق من مراحل النقل وتنسيق التخليص وخدمات التسليم المشمولة. تتطلب ترتيبات التخزين والتجميع وتأمين البضائع تأكيداً منفصلاً عند طلبها."],
    ],
    note: ["A forwarding quote does not imply an owned fleet, a customs broker license, warehouse ownership or guaranteed carrier space. Confirm the scope, operator responsibilities, exclusions and schedule before booking.", "لا يعني عرض تنسيق الشحن وجود أسطول مملوك أو ترخيص تخليص جمركي أو مستودع مملوك أو سعة ناقل مضمونة. أكد نطاق الخدمة ومسؤوليات المشغلين والاستثناءات والجدول قبل الحجز."],
  },
  "customs-clearance": {
    heading: ["Prepare your Saudi customs clearance enquiry", "جهّز استفسارك عن التخليص الجمركي في السعودية"],
    summary: ["Clearance depends on the goods, transport mode and applicable approvals. Document preparation is different from approval or release by the authorities.", "تختلف إجراءات التخليص حسب البضاعة ووسيلة النقل والموافقات المطلوبة. تجهيز المستندات لا يعني صدور الموافقة أو الفسح من الجهة المختصة."],
    items: [
      ["Provide the commercial invoice, transport document and origin information. ZATCA lists a certificate of origin where origin is not clearly established.", "جهّز الفاتورة التجارية ومستند النقل وبيانات المنشأ. تذكر هيئة الزكاة والضريبة والجمارك شهادة المنشأ عندما لا يكون المنشأ واضحاً."],
      ["Share the commodity description, proposed HS code, importer details, gateway and expected arrival date.", "أرسل وصف البضاعة ورمز النظام المنسق المقترح وبيانات المستورد ومنفذ الدخول وموعد الوصول المتوقع."],
      ["Check product-specific requirements before shipping. SABER conformity or SFDA procedures depend on the goods; they are not blanket company certifications.", "تحقق من متطلبات المنتج قبل الشحن. تعتمد إجراءات المطابقة عبر سابر أو متطلبات هيئة الغذاء والدواء على نوع البضاعة، وليست شهادات عامة للشركة."],
      ["For Riyadh, Jeddah or Dammam enquiries, identify the actual airport, port or inland destination so clearance and onward transport can be planned together.", "لاستفسارات الرياض أو جدة أو الدمام، حدد المطار أو الميناء أو الوجهة الداخلية الفعلية لتنسيق التخليص والنقل اللاحق معاً."],
    ],
    note: ["ZATCA's current import instructions address advance Fasah declarations and commodity-specific conditions. Confirm the rules for your shipment before dispatch. Release times depend on documentation, inspections and authority decisions; no fixed clearance time is promised.", "تتناول تعليمات الاستيراد الحالية لدى الهيئة تقديم البيانات مسبقاً عبر فسح والشروط الخاصة بالسلع. تحقق من متطلبات شحنتك قبل الإرسال. تعتمد مدة الفسح على المستندات والفحص وقرارات الجهات المختصة، ولا توجد مدة تخليص مضمونة."],
    source: { label: ["ZATCA import instructions — checked 17 October 2026", "تعليمات الاستيراد لدى الهيئة — تمت مراجعتها في 17 أكتوبر 2026"], url: "https://zatca.gov.sa/en/RulesRegulations/Taxes/Pages/customs-bussiness/import-pages/Import-Instructions.aspx" },
  },
  "air-freight": {
    heading: ["What we need for an air freight quote", "ما المطلوب لتسعير الشحن الجوي؟"],
    summary: ["Air freight moves cargo by aircraft. It can suit urgent or high-value consignments, but routing, acceptance and transit time vary by shipment.", "ينقل الشحن الجوي البضائع بالطائرات، وقد يناسب الشحنات العاجلة أو مرتفعة القيمة، مع اختلاف المسار والقبول ومدة العبور حسب الشحنة."],
    items: [
      ["Origin and destination airports or complete collection and delivery addresses.", "مطار المنشأ والوجهة أو عنوانا الاستلام والتسليم كاملين."],
      ["Piece count, packed dimensions, gross weight, commodity and cargo-ready date.", "عدد الطرود وأبعادها بعد التغليف والوزن الإجمالي ووصف البضاعة وتاريخ جاهزيتها."],
      ["Declare batteries, chemicals, perishables and temperature requirements before booking.", "أفصح عن البطاريات والمواد الكيميائية والبضائع القابلة للتلف ومتطلبات الحرارة قبل الحجز."],
    ],
    note: ["Chargeable weight may depend on volume as well as actual weight. Carrier capacity, dangerous-goods acceptance and required permits must be confirmed. Typical transit times may vary depending on origin, destination, carrier schedules, customs procedures, and seasonal factors.", "قد يعتمد الوزن الخاضع للتسعير على الحجم إضافة إلى الوزن الفعلي. يجب تأكيد سعة الناقل وقبول البضائع الخطرة والتصاريح المطلوبة. وقد تختلف أوقات العبور المعتادة حسب المنشأ والوجهة وجداول الناقلين وإجراءات الجمارك والعوامل الموسمية."],
  },
  "ocean-freight": {
    heading: ["Choose the right ocean freight enquiry", "حدد متطلبات استفسارك عن الشحن البحري"],
    summary: ["FCL uses a full container; LCL shares container space. Breakbulk is handled outside standard containers, while RoRo is for cargo suitable for rolling on and off a vessel.", "يستخدم FCL حاوية كاملة، بينما يشترك LCL في مساحة الحاوية. تُناول بضائع البريك بلك خارج الحاويات القياسية، ويخصص رورو للبضائع التي يمكن إدخالها وإخراجها من السفينة بالدحرجة."],
    items: [
      ["Identify the loading and discharge ports, final inland destination and requested shipping date.", "حدد ميناءي التحميل والتفريغ والوجهة الداخلية النهائية وموعد الشحن المطلوب."],
      ["Provide packed dimensions, weight, volume and whether the cargo fits a standard container.", "أرسل الأبعاد بعد التعبئة والوزن والحجم ومدى ملاءمة البضاعة للحاويات القياسية."],
      ["Specify whether collection, customs coordination and port-to-door delivery are needed.", "وضح الحاجة إلى الاستلام وتنسيق التخليص والنقل من الميناء إلى الوجهة."],
    ],
    note: ["Saudi gateway selection should follow your route and cargo requirements, not an assumed local branch. Sailing availability, freight charges and inland arrangements require confirmation.", "يُختار المنفذ السعودي وفق المسار ومتطلبات البضاعة، وليس على أساس افتراض وجود فرع محلي. يجب تأكيد الإبحارات والأسعار وترتيبات النقل الداخلي."],
  },
  "gcc-transportation": {
    heading: ["Plan road freight before requesting a truck", "خطط للشحن البري قبل طلب المركبة"],
    summary: ["Full-truckload and part-load enquiries require different planning. Cross-border freight adds border, transit and destination documentation requirements.", "تختلف متطلبات تخطيط حمولة الشاحنة الكاملة عن الشحن الجزئي، ويضيف النقل عبر الحدود متطلبات المنافذ والعبور ومستندات الوجهة."],
    items: [
      ["Share collection and delivery cities, border route if known and required delivery window.", "حدد مدينتي الاستلام والتسليم ومسار الحدود إن كان معروفاً والموعد المطلوب."],
      ["Provide pallet count, dimensions, gross weight, commodity and loading equipment needs.", "أرسل عدد الطبالي والأبعاد والوزن الإجمالي ونوع البضاعة ومتطلبات معدات التحميل."],
      ["Confirm whether a dry, refrigerated or specialist vehicle is required; availability and operator arrangements are confirmed per quotation.", "حدد الحاجة إلى مركبة جافة أو مبردة أو متخصصة؛ ويُؤكد توفرها وترتيب مشغلها ضمن عرض السعر."],
    ],
    note: ["Do not assume daily departures, owned vehicles or a guaranteed border transit time. Permits, carrier availability, cargo acceptance and border processing affect the plan.", "لا تفترض وجود مغادرات يومية أو مركبات مملوكة للشركة أو مدة عبور حدودية مضمونة. تؤثر التصاريح وتوفر الناقل وقبول البضاعة وإجراءات الحدود على الخطة."],
  },
  "exhibition-logistics": {
    heading: ["Prepare an event-specific logistics brief", "جهّز متطلبات الشحن الخاصة بفعاليتك"],
    summary: ["Exhibition cargo planning covers the event schedule as well as transport. Venue access and return arrangements should be considered before booking.", "يراعي تخطيط شحن المعارض جدول الفعالية إلى جانب النقل. ينبغي تحديد دخول الموقع وترتيبات الإعادة قبل الحجز."],
    items: [
      ["Send the event name, venue, stand number, build-up deadline and dismantling window.", "أرسل اسم الفعالية والموقع ورقم الجناح وموعد التجهيز وفترة التفكيك."],
      ["Provide a packing list, dimensions, values and serial numbers where applicable.", "جهّز قائمة التعبئة والأبعاد والقيم والأرقام التسلسلية عند انطباقها."],
      ["Separate goods returning after the event from goods being sold or consumed, and request an eligibility review for temporary admission or ATA Carnet.", "افصل البضائع المعادة بعد الفعالية عن البضائع المعدة للبيع أو الاستهلاك، واطلب مراجعة أهلية الإدخال المؤقت أو كارنيه ATA."],
    ],
    note: ["Venue services, equipment, temporary storage and on-site assistance must be confirmed in the quotation. An event's appearance on this site does not itself establish an official organizer appointment.", "يجب تأكيد خدمات الموقع والمعدات والتخزين المؤقت والمساعدة الميدانية في عرض السعر. لا يعني ذكر فعالية في هذا الموقع وجود تعيين رسمي من منظمها."],
  },
  "ata-carnet": {
    heading: ["Check ATA Carnet suitability before shipping", "تحقق من ملاءمة كارنيه ATA قبل الشحن"],
    summary: ["An ATA Carnet supports temporary movement of eligible goods. It is not a general import permit and does not make every shipment or intended use eligible.", "يساعد كارنيه ATA على نقل البضائع المؤهلة مؤقتاً. وهو ليس تصريح استيراد عاماً ولا يشمل كل شحنة أو استخدام."],
    items: [
      ["Prepare the goods list, values, serial numbers and intended use.", "جهّز قائمة البضائع والقيم والأرقام التسلسلية والاستخدام المقصود."],
      ["Share the country of issue, itinerary, event dates and planned return date.", "حدد بلد الإصدار ومسار الرحلة وتواريخ الفعالية والموعد المخطط للإعادة."],
      ["Ask the issuing association and relevant customs authorities to confirm acceptance and any restrictions before dispatch.", "تحقق من قبول المستند والقيود مع الجهة المصدرة والجهات الجمركية المختصة قبل الإرسال."],
    ],
    note: ["ENVOD can review the logistics enquiry; issuance, guarantees, approvals and release depend on the responsible organizations and applicable rules. No fixed issuance or clearance time is promised.", "يمكن لإنفود مراجعة الاستفسار اللوجستي، بينما يعتمد الإصدار والضمانات والموافقات والفسح على الجهات المسؤولة والقواعد المعمول بها. لا توجد مدة إصدار أو تخليص مضمونة."],
  },
};

export const PREPARATION_LINKS: Record<string, { slug: string; label: [string, string] }[]> = {
  "customs-clearance": [
    { slug: "ocean-freight", label: ["Ocean freight and FCL/LCL planning", "تخطيط الشحن البحري والحاويات الكاملة والجزئية"] },
    { slug: "air-freight", label: ["Air cargo preparation", "تجهيز الشحن الجوي"] },
    { slug: "exhibition-logistics", label: ["Customs planning for exhibition cargo", "التخطيط الجمركي لبضائع المعارض"] },
  ],
  "ocean-freight": [
    { slug: "customs-clearance", label: ["Saudi customs document preparation", "تجهيز مستندات التخليص الجمركي في السعودية"] },
    { slug: "freight-forwarding", label: ["Forwarding and handover responsibilities", "مسؤوليات تنسيق الشحن والتسليم"] },
  ],
  "air-freight": [
    { slug: "customs-clearance", label: ["Import-document checklist", "قائمة مستندات الاستيراد"] },
    { slug: "temperature-controlled-logistics", label: ["Temperature-sensitive cargo questions", "أسئلة الشحنات الحساسة للحرارة"] },
  ],
  "ata-carnet": [
    { slug: "exhibition-logistics", label: ["Exhibition delivery and return planning", "تخطيط تسليم المعارض وإعادة الشحن"] },
  ],
  "exhibition-logistics": [
    { slug: "ata-carnet", label: ["ATA Carnet eligibility and preparation", "أهلية كارنيه ATA وتجهيزه"] },
  ],
  "gcc-transportation": [
    { slug: "customs-clearance", label: ["Border document preparation", "تجهيز مستندات الحدود"] },
    { slug: "exhibition-logistics", label: ["Exhibition cargo delivery and return planning", "تخطيط تسليم بضائع المعارض وإعادتها"] },
  ],
  "freight-forwarding": [
    { slug: "ocean-freight", label: ["Choose a container-shipping arrangement", "اختيار ترتيبات الشحن بالحاويات"] },
    { slug: "gcc-transportation", label: ["GCC road-shipment checklist", "قائمة تجهيز الشحن البري الخليجي"] },
  ],
  "project-cargo": [
    { slug: "freight-forwarding", label: ["Coordinate transport legs and responsibilities", "تنسيق مراحل النقل والمسؤوليات"] },
  ],
  relocation: [
    { slug: "packaging-crating", label: ["Packaging and crating requirements", "متطلبات التغليف والتصنيد"] },
    { slug: "warehousing", label: ["Storage and warehousing enquiries", "استفسارات التخزين والمستودعات"] },
    { slug: "customs-clearance", label: ["Customs documents for international moves", "مستندات الجمارك للانتقالات الدولية"] },
  ],
  "temperature-controlled-logistics": [
    { slug: "air-freight", label: ["Air transport acceptance and preparation", "قبول الشحن الجوي وتجهيزه"] },
  ],
};

export const GATEWAY_GUIDANCE = [
  {
    id: "gateway-riyadh",
    heading: ["Riyadh: inland delivery and dry-port enquiries", "الرياض: النقل الداخلي واستفسارات الميناء الجاف"],
    text: ["Riyadh is inland, not a seaport. Confirm whether the shipment is arriving by air, moving directly from a seaport by road, or using an eligible dry-port/rail arrangement. Identify the actual clearance point and final delivery address before requesting onward transport.", "الرياض مدينة داخلية وليست ميناءً بحرياً. حدد هل تصل الشحنة جواً أو تُنقل براً من الميناء البحري أو تستخدم ترتيباً مناسباً للميناء الجاف والسكك الحديدية. حدد موقع التخليص الفعلي وعنوان التسليم النهائي قبل طلب النقل اللاحق."],
  },
  {
    id: "gateway-jeddah",
    heading: ["Jeddah: Jeddah Islamic Port enquiries", "جدة: استفسارات ميناء جدة الإسلامي"],
    text: ["For a Jeddah Islamic Port enquiry, share the vessel/arrival information, transport documents, container or cargo details, release status and required collection window. Confirm port collection, any handling charges, delivery destination and empty-container return responsibilities rather than assuming they are included.", "لاستفسارات ميناء جدة الإسلامي، أرسل بيانات السفينة والوصول ومستندات النقل وتفاصيل الحاوية أو البضاعة وحالة الفسح وفترة الاستلام المطلوبة. أكد استلام الميناء ورسوم المناولة ووجهة التسليم ومسؤولية إعادة الحاوية الفارغة بدلاً من افتراض شمولها."],
  },
  {
    id: "gateway-dammam",
    heading: ["Dammam: King Abdulaziz Port and the Eastern Province", "الدمام: ميناء الملك عبدالعزيز والمنطقة الشرقية"],
    text: ["For King Abdulaziz Port in Dammam, identify the terminal, cargo dimensions, release requirements and final Eastern Province or inland destination. If a rail/dry-port movement is proposed, confirm eligibility, operator arrangements and the actual clearance location before selecting the last transport leg.", "لاستفسارات ميناء الملك عبدالعزيز بالدمام، حدد المحطة وأبعاد البضاعة ومتطلبات الفسح والوجهة النهائية في المنطقة الشرقية أو الداخل. عند اقتراح النقل بالقطار أو عبر الميناء الجاف، أكد الأهلية وترتيبات المشغل وموقع التخليص الفعلي قبل اختيار مرحلة النقل الأخيرة."],
  },
] satisfies { id: string; heading: [string, string]; text: [string, string] }[];
