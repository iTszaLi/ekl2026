import type { ServicePillar } from "../service-data";

/**
 * Long-form, crawler-friendly "pillar" content for the Exhibition Logistics
 * service page. Rendered as plain semantic HTML (see PillarSections) so the
 * prerendered static HTML exposes visible, indexable copy — no framer-motion
 * initial opacity:0 that would serialize hidden content into the SSG output.
 *
 * Targets: exhibition logistics company, trade show logistics, event logistics
 * company, exhibition freight forwarding, best exhibition logistics.
 * Named venues and events provide planning context, not evidence of an
 * appointment or completed project. Preserve the useful structure without
 * unverified company-age, event-relationship or clearance-time claims.
 */
export const EXHIBITION_PILLAR: ServicePillar = {
  seoTitle: "Exhibition Logistics in Riyadh & Saudi Arabia | ENVOD KINGDOM",
  seoDescription:
    "Exhibition shipments to Saudi Arabia from Riyadh: freight forwarding, customs clearance, ATA Carnet coordination and venue delivery in Riyadh, Jeddah, Dammam.",
  seoTitleAr: "لوجستيات المعارض في الرياض والسعودية | إنفود كينغدوم",
  schemaServiceType: "Exhibition logistics",
  schemaCities: ["Riyadh", "Jeddah", "Dammam"],

  intro: [
    {
      en: "ENVOD KINGDOM SHIPPING SERVICES LLC is a freight forwarding and logistics company based in Al Malaz, Riyadh. For trade shows and events in Riyadh, Jeddah and Dammam, we coordinate international freight to Saudi Arabia, customs clearance documents, temporary import and ATA Carnet arrangements (subject to eligibility and Saudi customs acceptance), delivery to the venue, and return or re-export after the show.",
      ar: "إنفود كينغدوم لخدمات الشحن ذ.م.م شركة شحن وخدمات لوجستية مقرها حي الملز في الرياض. وللمعارض التجارية والفعاليات في الرياض وجدة والدمام، ننسّق الشحن الدولي إلى السعودية، ومستندات التخليص الجمركي، وترتيبات الإدخال المؤقت وكارنيه ATA (وفق الأهلية وقبول الجمارك السعودية)، والتسليم إلى موقع المعرض، وشحن العودة أو إعادة التصدير بعد انتهاء المعرض.",
    },
    {
      en: "Businesses comparing leading exhibition logistics providers in KSA can explore ENVOD KINGDOM’s specialist exhibition and event cargo coordination services. For trade shows, expos and corporate events in Saudi Arabia, enquiries may cover international freight, customs documentation and clearance coordination, ATA Carnet enquiries, venue delivery and on-site setup planning, and return or re-export shipments. Routes, responsibilities, provider availability and venue access are confirmed for each shipment.",
      ar: "يمكن للشركات التي تبحث عن مزودي خدمات لوجستيات المعارض في السعودية استكشاف خدمات إنفود كينغدوم المتخصصة في تنسيق شحنات المعارض والفعاليات. وقد تشمل الاستفسارات الخاصة بالمعارض التجارية والفعاليات المؤسسية في المملكة الشحن الدولي، وتنسيق المستندات الجمركية وترتيبات التخليص، واستفسارات كارنيه ATA، والتخطيط للتسليم للموقع والتجهيز الميداني، وشحنات العودة أو إعادة التصدير. ويُؤكد المسار والمسؤوليات وتوفر مقدمي الخدمة وإمكانية دخول الموقع لكل شحنة.",
    },
    {
      en: "From a single crate of samples to a multi-country pavilion, confirm freight routing, itemized equipment lists, temporary-import eligibility, on-site responsibilities and return transport before booking. LEAP, Cityscape Global, Big 5 Construct Saudi, Saudi Build and INDEX are examples of events to research when preparing an exhibition shipment, not a claim of ENVOD's official appointment or past participation.",
      ar: "من صندوق عينات واحد إلى جناح متعدد الدول، أكّد مسار الشحن وقائمة المعدات المفصّلة وأهلية الإدخال المؤقت ومسؤوليات الموقع ونقل العودة قبل الحجز. وتُذكر LEAP وCityscape Global وBig 5 Construct Saudi وSaudi Build وINDEX كأمثلة لفعاليات يُبحث عن متطلباتها عند التخطيط، لا كادعاء بتعيين إنفود رسمياً أو مشاركتها السابقة.",
    },
  ],

  sections: [
    {
      id: "what-is-exhibition-logistics",
      heading: {
        en: "What is exhibition logistics?",
        ar: "ما هي لوجستيات المعارض؟",
      },
      paragraphs: [
        {
          en: "Exhibition logistics is the specialised transport, customs and on-site handling of everything an exhibitor needs to present at a trade show or event — stand structures, display materials, product samples, audiovisual and technical equipment, marketing collateral and giveaways. Unlike ordinary freight, it runs to an immovable deadline: the cargo must arrive, clear customs and reach the correct hall and stand number before build-up ends.",
          ar: "لوجستيات المعارض هي النقل المتخصص والتخليص الجمركي والمناولة الميدانية لكل ما يحتاجه العارض للمشاركة في معرض تجاري أو فعالية — هياكل الأجنحة، ومواد العرض، وعينات المنتجات، والمعدات السمعية والبصرية والتقنية، والمواد التسويقية والهدايا. وخلافاً للشحن العادي، تخضع لموعد نهائي لا يتغيّر: يجب أن تصل البضائع وتُخلَّص جمركياً وتصل إلى القاعة ورقم الجناح الصحيحين قبل انتهاء فترة التجهيز.",
        },
        {
          en: "Some exhibition goods may qualify for temporary admission under an ATA Carnet or another procedure. Saudi acceptance depends on the goods, intended use and current authority requirements; confirm eligibility, endorsements, deadlines and any separate approvals before dispatch. A Carnet does not guarantee release or remove customs controls.",
          ar: "قد تكون بعض بضائع المعارض مؤهلة للإدخال المؤقت بموجب كارنيه ATA أو إجراء آخر. ويعتمد القبول في السعودية على البضاعة والغرض من استخدامها ومتطلبات الجهات الحالية؛ لذا يجب تأكيد الأهلية والتصديقات والمواعيد وأي موافقات منفصلة قبل الإرسال. ولا يضمن الكارنيه الفسح أو يلغي الرقابة الجمركية.",
        },
      ],
      bullets: [
        {
          en: "Review air, sea or road freight options for the event route, subject to carrier acceptance",
          ar: "مراجعة خيارات الشحن الجوي أو البحري أو البري لمسار الفعالية وفق قبول الناقل",
        },
        {
          en: "Customs, temporary-admission and ATA Carnet document coordination, subject to eligibility",
          ar: "تنسيق مستندات الجمارك والإدخال المؤقت وكارنيه ATA وفق الأهلية",
        },
        {
          en: "Venue-delivery planning against organizer access rules and appointed contractors",
          ar: "تخطيط التسليم للموقع وفق قواعد دخول المنظّم والمقاولين المعتمدين",
        },
        {
          en: "On-site unloading, installation or dismantling only where the venue permits and a provider is confirmed",
          ar: "التفريغ أو التركيب أو التفكيك في الموقع فقط إذا سمح المكان وتم تأكيد مقدم الخدمة",
        },
        {
          en: "Return-routing and re-export planning after the event",
          ar: "تخطيط مسار العودة وإعادة التصدير بعد الفعالية",
        },
      ],
    },
    {
      id: "trade-show-logistics-saudi-arabia",
      heading: {
        en: "Trade show & event logistics across Saudi Arabia",
        ar: "لوجستيات المعارض والفعاليات في جميع أنحاء المملكة",
      },
      paragraphs: [
        {
          en: "ENVOD KINGDOM is based in Al Malaz, Riyadh, and reviews exhibition-freight enquiries for Saudi venues. Depending on the shipment, the requested scope may include international show freight, customs-clearance arrangements at ports or airports, ATA Carnet eligibility and document coordination, door-to-door delivery planning, venue delivery, nationwide destination-delivery requests and on-site setup coordination. Each element is confirmed per shipment; local-provider availability, venue-appointed contractors, organizer rules, customs approval and site access can affect the scope.",
          ar: "يقع مقر إنفود كينغدوم في حي الملز بالرياض، وتراجع الشركة استفسارات شحن المعارض إلى المواقع السعودية. وقد يشمل النطاق المطلوب، بحسب الشحنة، الشحن الدولي للمعارض وترتيبات التخليص الجمركي في الموانئ أو المطارات وأهلية كارنيه ATA وتنسيق مستنداته والتخطيط للتوصيل من الباب إلى الباب والتسليم للموقع وطلبات التوصيل إلى وجهات في أنحاء المملكة وتنسيق التركيب الميداني. ويُؤكد كل عنصر لكل شحنة؛ إذ قد يؤثر توفر مقدمي الخدمة المحليين ومقاولو الموقع المعتمدون وقواعد المنظّم والموافقات الجمركية وإمكانية الدخول في النطاق المتاح.",
        },
        {
          en: "Requests can include exhibition cargo to Riyadh, Jeddah, Dammam and other Saudi destinations. The port or airport gateway, inland route, customs operator and local-delivery scope are confirmed for each shipment; city references do not imply venue appointment or fixed clearance timing.",
          ar: "قد تشمل الاستفسارات شحن المعارض إلى الرياض وجدة والدمام وغيرها من الوجهات السعودية. ويتم تأكيد بوابة الميناء أو المطار والمسار الداخلي ومشغّل الجمارك ونطاق التسليم المحلي لكل شحنة؛ ولا يعني ذكر المدن وجود تعيين من الموقع أو توقيت ثابت للتخليص.",
        },
        {
          en: "Planning references include Riyadh Front Exhibition & Conference Center (RFECC), Riyadh International Convention & Exhibition Center (RICEC), Riyadh Exhibition and Convention Center (Malham), Jeddah International Exhibition & Convention Center (also called Jeddah Center for Forums & Events), Jeddah Superdome and Dhahran Expo. These are possible destinations for planning only; the list does not imply venue or organizer appointment, or a completed ENVOD project at any location.",
          ar: "تشمل مراجع التخطيط مركز واجهة الرياض للمعارض والمؤتمرات (RFECC)، ومركز الرياض الدولي للمؤتمرات والمعارض (RICEC)، ومركز الرياض للمعارض والمؤتمرات (ملهم)، ومركز جدة الدولي للمعارض والمؤتمرات (ويُعرف أيضاً بمركز جدة للمنتديات والفعاليات)، وقبة جدة (سوبر دوم)، وظهران إكسبو. هذه وجهات محتملة لأغراض التخطيط فقط؛ ولا تعني القائمة وجود تعيين من أي موقع أو منظّم أو تنفيذ إنفود مشروعاً في أي منها.",
        },
        {
          en: "For Jubail event or exhibition-cargo enquiries, provide the venue or site, event dates, cargo details, gateway and access window. The route, local handling and any return movement are confirmed for each shipment; this city reference does not imply a local branch or fixed service availability.",
          ar: "لاستفسارات شحن المعارض أو الفعاليات إلى الجبيل، أرسل الموقع أو مكان الفعالية وتواريخها وتفاصيل البضاعة ومنفذ الدخول ونافذة الوصول. ويُؤكد المسار والمناولة المحلية وأي حركة عودة لكل شحنة؛ ولا يعني ذكر المدينة وجود فرع محلي أو توفر خدمة ثابتة.",
        },
        {
          en: "For a single pallet or a multi-exhibitor pavilion, send the itemized cargo list, dimensions, weight, origin, event dates and venue instructions. The proposed freight, customs and on-site responsibilities can then be scoped; availability, partners and organizer approval are confirmed before booking.",
          ar: "سواء كانت الشحنة منصة واحدة أو جناحاً يضم عدة عارضين، أرسل قائمة البضائع المفصلة والأبعاد والوزن والمنشأ وتواريخ الفعالية وتعليمات الموقع. عندها يمكن تحديد نطاق الشحن والجمارك والمسؤوليات الميدانية المقترحة؛ ويتم تأكيد الإتاحة والشركاء وموافقة المنظّم قبل الحجز.",
        },
      ],
      bullets: [
        {
          en: "Planning target: start 4–6 weeks before the event; for large events such as LEAP or Cityscape, allow 8 weeks or more where practical. This is guidance, not a guaranteed booking lead time.",
          ar: "المدة التخطيطية المقترحة: ابدأ قبل الفعالية بأربعة إلى ستة أسابيع؛ وللفعاليات الكبيرة مثل LEAP أو Cityscape، يُفضّل إتاحة ثمانية أسابيع أو أكثر متى أمكن. هذه إرشادات وليست مهلة حجز مضمونة.",
        },
        {
          en: "Before dispatch, check the commercial invoice, packing list, certificate of origin and any required attestations, permits or product documents against current requirements for the goods and route.",
          ar: "قبل الإرسال، راجع الفاتورة التجارية وقائمة التعبئة وشهادة المنشأ وأي تصديقات أو تصاريح أو مستندات للمنتج مطلوبة، وفق المتطلبات الحالية للبضاعة والمسار.",
        },
        {
          en: "For eligible goods, confirm ATA Carnet availability, the authorized issuing association, customs acceptance and re-export deadlines before dispatch.",
          ar: "للبضائع المؤهلة، أكّد توفر كارنيه ATA والجهة المخوّلة بإصداره وقبوله الجمركي ومواعيد إعادة التصدير قبل الإرسال.",
        },
      ],
    },
    // City sections added 2026-11-09 after a live Saudi Google check: the page
    // ranked for Riyadh/Jeddah provider queries but not for any Dammam or
    // Eastern Province query. Gateways and road distances are public facts;
    // ENVOD's only office is Riyadh, so no local branch is claimed.
    {
      id: "exhibition-logistics-riyadh",
      heading: {
        en: "Exhibition logistics in Riyadh",
        ar: "لوجستيات المعارض في الرياض",
      },
      paragraphs: [
        {
          en: "Riyadh hosts many of the Kingdom’s largest trade shows. For Riyadh events, the enquiry is handled by our team in Al Malaz, in the same city as the Riyadh International Convention & Exhibition Center (RICEC), Riyadh Front (RFECC) and the Malham exhibition centre. We coordinate the freight booking, the customs-document review, local trucking and the delivery appointment set out in the organizer’s exhibitor manual.",
          ar: "تستضيف الرياض كثيراً من أكبر المعارض التجارية في المملكة. ولفعاليات الرياض، يتابع فريقنا في حي الملز الاستفسار من المدينة نفسها التي يقع فيها مركز الرياض الدولي للمؤتمرات والمعارض (RICEC) ومركز واجهة الرياض (RFECC) ومركز ملهم للمعارض. وننسّق حجز الشحن ومراجعة المستندات الجمركية والنقل بالشاحنات داخل المدينة وموعد التسليم المحدد في دليل العارضين الصادر عن المنظّم.",
        },
        {
          en: "Air shipments for Riyadh events usually arrive through King Khalid International Airport. Sea freight normally lands at Jeddah Islamic Port on the Red Sea or King Abdulaziz Port in Dammam on the Arabian Gulf, then continues inland by road, or by rail to the Riyadh Dry Port where that option suits the cargo. The gateway is chosen for each shipment against the cargo-ready date, transit time and the venue’s move-in window.",
          ar: "تصل الشحنات الجوية لفعاليات الرياض عادةً عبر مطار الملك خالد الدولي. أما الشحن البحري فيصل غالباً إلى ميناء جدة الإسلامي على البحر الأحمر أو ميناء الملك عبدالعزيز بالدمام على الخليج العربي، ثم يُستكمل إلى الرياض براً، أو بالقطار إلى ميناء الرياض الجاف إذا كان هذا الخيار مناسباً للبضاعة. ويُختار منفذ الدخول لكل شحنة وفق تاريخ جاهزية البضاعة ومدة العبور ونافذة التجهيز في موقع المعرض.",
        },
      ],
      bullets: [
        {
          en: "Exhibition freight to Riyadh by air through King Khalid International Airport, or by sea through Jeddah or Dammam with an inland road or rail leg",
          ar: "شحن المعارض إلى الرياض جواً عبر مطار الملك خالد الدولي، أو بحراً عبر جدة أو الدمام مع نقل داخلي براً أو بالقطار",
        },
        {
          en: "Exhibition transportation within Riyadh, with truck size, loading-dock access and delivery appointment matched to the venue’s rules",
          ar: "نقل المعارض داخل الرياض، مع مطابقة حجم الشاحنة والوصول إلى رصيف التحميل وموعد التسليم لقواعد الموقع",
        },
        {
          en: "Customs-document review for Riyadh shows before dispatch; declarations are lodged by the responsible licensed operator and release rests with ZATCA",
          ar: "مراجعة المستندات الجمركية لمعارض الرياض قبل الإرسال؛ ويقدّم البيان الجمركي المشغّل المرخّص المسؤول، ويبقى قرار الفسح لهيئة الزكاة والضريبة والجمارك",
        },
        {
          en: "Exhibition cargo handling at RICEC, RFECC and Malham, following the organizer’s rules on which appointed contractor moves cargo from the dock to the stand",
          ar: "مناولة بضائع المعارض في RICEC وRFECC وملهم وفق قواعد المنظّم بشأن المقاول المعتمد الذي ينقل البضائع من الرصيف إلى الجناح",
        },
      ],
      links: [
        { label: { en: "Customs clearance", ar: "التخليص الجمركي" }, href: "/services/customs-clearance" },
        { label: { en: "Air freight for urgent exhibition cargo", ar: "الشحن الجوي لبضائع المعارض العاجلة" }, href: "/services/air-freight" },
      ],
    },
    {
      id: "exhibition-logistics-jeddah",
      heading: {
        en: "Exhibition logistics in Jeddah",
        ar: "لوجستيات المعارض في جدة",
      },
      paragraphs: [
        {
          en: "Jeddah events are coordinated from our Riyadh office, with local trucking and any handling partner confirmed for each shipment. Jeddah Islamic Port is the Kingdom’s main Red Sea container gateway, so sea freight for a Jeddah show can often be cleared close to the venue instead of moving across the country from another port.",
          ar: "تُنسَّق فعاليات جدة من مكتبنا في الرياض، مع تأكيد النقل المحلي بالشاحنات وأي شريك مناولة لكل شحنة. ويُعد ميناء جدة الإسلامي البوابة الرئيسية للحاويات على البحر الأحمر، لذلك يمكن في كثير من الحالات تخليص الشحن البحري لمعارض جدة بالقرب من موقع الفعالية بدلاً من نقله عبر المملكة من ميناء آخر.",
        },
        {
          en: "Air cargo for Jeddah usually arrives at King Abdulaziz International Airport. Before booking delivery, check whether your event is at the Jeddah Superdome on Madinah Road or the Jeddah International Exhibition & Convention Center (Jeddah Center for Forums & Events); they are separate venues with separate access arrangements.",
          ar: "تصل الشحنات الجوية إلى جدة عادةً عبر مطار الملك عبدالعزيز الدولي. وقبل حجز التسليم، تحقّق مما إذا كانت فعاليتك في قبة جدة (سوبر دوم) على طريق المدينة أو في مركز جدة الدولي للمعارض والمؤتمرات (مركز جدة للمنتديات والفعاليات)؛ فهما موقعان منفصلان لكل منهما ترتيبات دخول خاصة.",
        },
        {
          en: "Moving a stand or exhibits between Riyadh and Jeddah is a road journey of roughly 950 km, so build the transit time into the plan and book the vehicle against the venue’s delivery appointment.",
          ar: "نقل الجناح أو المعروضات بين الرياض وجدة رحلة برية تقارب 950 كيلومتراً، لذا احسب مدة النقل ضمن الخطة واحجز المركبة وفق موعد التسليم في موقع المعرض.",
        },
      ],
      bullets: [
        {
          en: "Exhibition cargo to Jeddah by sea through Jeddah Islamic Port or by air through King Abdulaziz International Airport",
          ar: "شحن المعارض إلى جدة بحراً عبر ميناء جدة الإسلامي أو جواً عبر مطار الملك عبدالعزيز الدولي",
        },
        {
          en: "Trade show freight between Riyadh and Jeddah by road, with the vehicle type and loading plan confirmed for the stand and exhibits",
          ar: "نقل بضائع المعارض بين الرياض وجدة براً، مع تأكيد نوع المركبة وخطة التحميل بحسب الجناح والمعروضات",
        },
        {
          en: "Exhibition transportation to the Jeddah Superdome or the Jeddah Center for Forums & Events, booked against the organizer’s delivery slots",
          ar: "نقل المعارض إلى قبة جدة (سوبر دوم) أو مركز جدة للمنتديات والفعاليات وفق مواعيد التسليم التي يحددها المنظّم",
        },
      ],
      links: [
        { label: { en: "Ocean freight", ar: "الشحن البحري" }, href: "/services/ocean-freight" },
        { label: { en: "Freight forwarding", ar: "الشحن وإدارة النقل" }, href: "/services/freight-forwarding" },
      ],
    },
    {
      id: "exhibition-logistics-dammam-eastern-province",
      heading: {
        en: "Exhibition logistics in Dammam, Al Khobar & the Eastern Province",
        ar: "لوجستيات المعارض في الدمام والخبر والمنطقة الشرقية",
      },
      paragraphs: [
        {
          en: "Eastern Province shows, including events at Dhahran Expo, are coordinated from our Riyadh office, roughly 400 km from Dammam by road. Local trucking and any handling partner are confirmed for each shipment; naming these cities does not imply an ENVOD branch there.",
          ar: "تُنسَّق معارض المنطقة الشرقية، ومنها فعاليات ظهران إكسبو، من مكتبنا في الرياض الذي يبعد عن الدمام نحو 400 كيلومتر براً. ويُؤكد النقل المحلي وأي شريك مناولة لكل شحنة؛ ولا يعني ذكر هذه المدن وجود فرع لإنفود فيها.",
        },
        {
          en: "Sea freight for Eastern Province events usually arrives through King Abdulaziz Port in Dammam, and air cargo through King Fahd International Airport. Stands and products trucked from Bahrain or the UAE enter by road at the King Fahd Causeway or the Al Batha border crossing. Border documents, the carrier’s GCC permits and the customs procedure for goods that will return after the show need to be settled before the truck leaves.",
          ar: "يصل الشحن البحري لفعاليات المنطقة الشرقية عادةً عبر ميناء الملك عبدالعزيز بالدمام، والشحن الجوي عبر مطار الملك فهد الدولي. أما الأجنحة والمنتجات المنقولة بالشاحنات من البحرين أو الإمارات فتدخل براً عبر جسر الملك فهد أو منفذ البطحاء. ويجب استكمال مستندات العبور وتصاريح الناقل الخليجية والإجراء الجمركي للبضائع التي ستعود بعد المعرض قبل انطلاق الشاحنة.",
        },
        {
          en: "For Al Khobar hotel and conference venues or Jubail industrial sites, send the exact site address, access rules and delivery window. For Dhahran Expo, use the address in the organizer’s manual on the waybill rather than the city name alone.",
          ar: "لمواقع الفنادق والمؤتمرات في الخبر أو المواقع الصناعية في الجبيل، أرسل العنوان الدقيق للموقع وقواعد الدخول ونافذة التسليم. ولظهران إكسبو، استخدم العنوان الوارد في دليل المنظّم على بوليصة الشحن بدلاً من اسم المدينة وحده.",
        },
      ],
      bullets: [
        {
          en: "Exhibition cargo to Dammam through King Abdulaziz Port or King Fahd International Airport",
          ar: "شحن المعارض إلى الدمام عبر ميناء الملك عبدالعزيز أو مطار الملك فهد الدولي",
        },
        {
          en: "Exhibition freight from Riyadh to the Eastern Province by road, including the return movement after the show",
          ar: "نقل بضائع المعارض من الرياض إلى المنطقة الشرقية براً، بما في ذلك نقل العودة بعد المعرض",
        },
        {
          en: "GCC road freight for exhibitions from Bahrain via the King Fahd Causeway or from the UAE via Al Batha, subject to border documents and carrier acceptance",
          ar: "النقل البري الخليجي للمعارض من البحرين عبر جسر الملك فهد أو من الإمارات عبر منفذ البطحاء، وفق مستندات العبور وقبول الناقل",
        },
        {
          en: "Delivery planning for Dhahran Expo, Al Khobar venues and Jubail sites against the organizer’s move-in schedule",
          ar: "تخطيط التسليم إلى ظهران إكسبو ومواقع الخبر والجبيل وفق جدول التجهيز الصادر عن المنظّم",
        },
      ],
      links: [
        { label: { en: "GCC road transportation", ar: "النقل البري داخل دول مجلس التعاون" }, href: "/services/gcc-transportation" },
        { label: { en: "Customs clearance", ar: "التخليص الجمركي" }, href: "/services/customs-clearance" },
      ],
    },
    {
      id: "ata-carnet-temporary-import",
      heading: {
        en: "ATA Carnet & temporary-import preparation",
        ar: "تجهيز كارنيه ATA والإدخال المؤقت",
      },
      paragraphs: [
        {
          en: "Saudi Arabia accepts ATA Carnets for eligible exhibition goods under applicable procedures. Confirm the goods, intended use, current acceptance, any pre-approval, authorized issuing association and re-export deadline for each shipment. A Carnet does not remove customs controls, organizer rules or all issuing and handling costs.",
          ar: "تقبل المملكة العربية السعودية كارنيهات ATA لبضائع المعارض المؤهلة وفق الإجراءات المعمول بها. أكّد نوع البضاعة والغرض من استخدامها والقبول الحالي وأي موافقة مسبقة وجهة الإصدار المخوّلة وموعد إعادة التصدير لكل شحنة. ولا يلغي الكارنيه الرقابة الجمركية أو قواعد المنظّم أو جميع تكاليف الإصدار والمناولة.",
        },
        {
          en: "ENVOD coordinates the equipment-list and shipment-document review. If a Carnet is unavailable or unsuitable, discuss the applicable temporary-import procedure with the responsible customs operator before dispatch. Customs clearance times vary depending on documentation, commodity type, inspection requirements, and regulatory approvals.",
          ar: "تنسّق إنفود مراجعة قائمة المعدات ومستندات الشحنة. وإذا تعذّر استخدام الكارنيه أو لم يناسب البضاعة، فناقش إجراء الإدخال المؤقت المطبق مع مسؤول التخليص المختص قبل الإرسال. تختلف مدد التخليص الجمركي حسب المستندات ونوع البضاعة ومتطلبات الفحص والموافقات التنظيمية.",
        },
      ],
      references: [
        {
          label: { en: "ZATCA: Temporary Admission Using ATA Carnet", ar: "هيئة الزكاة والضريبة والجمارك: الإدخال المؤقت (كارنيه)" },
          href: "https://zatca.gov.sa/en/eServices/Pages/eServices-294.aspx",
          hrefAr: "https://zatca.gov.sa/ar/eServices/Pages/eServices-294.aspx",
        },
        {
          label: { en: "ICC: Find the ATA Carnet association for your country", ar: "غرفة التجارة الدولية: ابحث عن جهة كارنيه ATA في بلدك (بالإنجليزية)" },
          href: "https://iccwbo.org/business-solutions/ata-carnet/ata-carnet-in-your-country/",
        },
      ],
    },
    {
      id: "on-site-handling",
      heading: {
        en: "On-site handling, installation & dismantling",
        ar: "المناولة والتركيب والتفكيك في الموقع",
      },
      paragraphs: [
        {
          en: "Confirm who is authorized to receive cargo at the loading dock, move it to the stand, unpack it, position it and store empty crates. These tasks may be restricted to venue-appointed contractors and must be included in the confirmed service scope.",
          ar: "أكّد الجهة المخولة باستلام البضائع عند رصيف التحميل ونقلها إلى الجناح وفك تغليفها وتموضعها وتخزين الصناديق الفارغة. وقد تقتصر هذه المهام على مقاولي الموقع المعتمدين، لذا يجب إدراجها ضمن نطاق الخدمة المؤكد.",
        },
        {
          en: "The return plan should confirm the collection slot, repacking responsibility, stored-crate access, export documents and next destination. Assign a named event contact and confirm any coordinator or on-site support as part of the booking.",
          ar: "ينبغي أن تحدد خطة العودة موعد الاستلام ومسؤولية إعادة التغليف والوصول إلى الصناديق المخزنة ومستندات التصدير والوجهة التالية. عيّن جهة تواصل للفعالية وأكّد أي تنسيق أو دعم ميداني ضمن الحجز.",
        },
      ],
    },
    {
      id: "exhibition-storage-returns-roadshows",
      heading: {
        en: "Exhibition storage, return shipments & multi-city roadshows",
        ar: "تخزين المعارض وشحنات العودة والجولات بين المدن",
      },
      paragraphs: [
        {
          en: "Exhibitors often need somewhere to hold crates before move-in, keep empty packaging during the show, and park the stand after breakdown if it is going on to another event. Storage before or after an exhibition can be requested as part of the plan; the facility, its location, customs status and access hours are confirmed for each shipment. Goods under temporary admission must stay within the conditions and deadlines of that procedure while they are stored.",
          ar: "يحتاج العارضون غالباً إلى مكان لحفظ الصناديق قبل التجهيز، وحفظ مواد التغليف الفارغة أثناء المعرض، وإيداع الجناح بعد التفكيك إذا كان سينتقل إلى فعالية أخرى. ويمكن طلب التخزين قبل المعرض أو بعده ضمن الخطة؛ ويُؤكد المرفق وموقعه ووضعه الجمركي وساعات الوصول إليه لكل شحنة. ويجب أن تبقى البضائع الخاضعة للإدخال المؤقت ضمن شروط ذلك الإجراء ومواعيده طوال مدة تخزينها.",
        },
        {
          en: "When the same stand travels to several Saudi cities, for example Riyadh, then Jeddah, then Dammam, plan the sequence as one route: each venue’s move-out slot, the road transit to the next city, storage between dates, and the final return or re-export. If the goods entered under an ATA Carnet or another temporary-import procedure, every movement and the final exit must fit that document’s validity and conditions.",
          ar: "عندما ينتقل الجناح نفسه إلى عدة مدن سعودية، كالرياض ثم جدة ثم الدمام، خطّط للتسلسل كمسار واحد: موعد الإخلاء في كل موقع، والنقل البري إلى المدينة التالية، والتخزين بين التواريخ، ثم العودة النهائية أو إعادة التصدير. وإذا دخلت البضائع بكارنيه ATA أو بإجراء إدخال مؤقت آخر، فيجب أن تتوافق كل حركة والخروج النهائي مع صلاحية ذلك المستند وشروطه.",
        },
        {
          en: "After the show, the return plan covers collection from the venue, repacking, export documents and transport to the next destination. Re-export deadlines matter: goods that are not re-exported in time may become liable for duties or guarantee claims under the procedure used.",
          ar: "بعد انتهاء المعرض، تشمل خطة العودة الاستلام من الموقع وإعادة التغليف ومستندات التصدير والنقل إلى الوجهة التالية. ولمواعيد إعادة التصدير أهمية كبيرة: فالبضائع التي لا يُعاد تصديرها في الوقت المحدد قد تخضع للرسوم أو للمطالبة بالضمان وفق الإجراء المستخدم.",
        },
      ],
      bullets: [
        {
          en: "Pre-show and post-show storage requests, with the facility and its customs status confirmed",
          ar: "طلبات التخزين قبل المعرض وبعده، مع تأكيد المرفق ووضعه الجمركي",
        },
        {
          en: "Empty-crate storage during the event where the venue or its appointed contractor allows it",
          ar: "تخزين الصناديق الفارغة أثناء الفعالية حيث يسمح الموقع أو مقاوله المعتمد",
        },
        {
          en: "Roadshow routing between Riyadh, Jeddah and Dammam",
          ar: "تخطيط مسار الجولات بين الرياض وجدة والدمام",
        },
        {
          en: "Return shipments and re-export after the exhibition, planned against document deadlines",
          ar: "شحنات العودة وإعادة التصدير بعد المعرض وفق مواعيد المستندات",
        },
      ],
      links: [
        { label: { en: "Warehousing & distribution", ar: "التخزين والتوزيع" }, href: "/services/warehousing" },
        { label: { en: "ATA Carnet coordination", ar: "تنسيق كارنيه ATA" }, href: "/services/ata-carnet" },
        { label: { en: "Packaging & crating", ar: "التغليف والصناديق" }, href: "/services/packaging-crating" },
      ],
    },
    {
      id: "live-events-and-specialist-cargo",
      heading: {
        en: "Fairs, live events & specialist cargo",
        ar: "المعارض والفعاليات الحية والبضائع المتخصصة",
      },
      paragraphs: [
        {
          en: "Alongside trade shows, event enquiries may involve concerts, sports tournaments, broadcast productions and high-value showcases. ENVOD can review the requested freight, customs-document, venue-delivery, temporary-storage and return or re-export scope. Cargo acceptance, organizer rules, venue access, schedules and operating partners are checked for each event.",
          ar: "إلى جانب المعارض التجارية، قد تشمل استفسارات الفعاليات الحفلات الموسيقية والبطولات الرياضية والإنتاجات الإعلامية والعروض عالية القيمة. يمكن لإنفود مراجعة نطاق الشحن ومستندات الجمارك والتسليم للموقع والتخزين المؤقت والعودة أو إعادة التصدير. ويُراجع قبول البضائع وقواعد المنظّم ودخول الموقع والجدول وشركاء التشغيل لكل فعالية.",
        },
        {
          en: "The categories below are examples of enquiries, not a guarantee of availability or a claim of special authorization. Any specialist provider, equipment, permit, security requirement or on-site role must be confirmed before booking. Relocation and warehousing requirements are assessed as separate service enquiries.",
          ar: "الفئات أدناه أمثلة لأنواع الاستفسارات، وليست ضماناً للتوفر أو ادعاءً بوجود تفويض خاص. يجب تأكيد مقدم الخدمة المتخصص والمعدات والتصاريح ومتطلبات الأمن وأدوار الموقع قبل الحجز. وتُقيّم متطلبات الانتقال والتخزين كاستفسارات خدمات منفصلة.",
        },
      ],
      bullets: [
        {
          en: "Concert, sports and broadcast equipment: cargo lists, freight route, venue windows and on-site handling, where permitted and confirmed.",
          ar: "معدات الحفلات والرياضة والبث: قوائم البضائع ومسار الشحن ومواعيد الموقع والمناولة الميدانية عند السماح والتأكيد.",
        },
        {
          en: "Fine art, vehicles and high-value media equipment: packing, handling, route, carrier acceptance and required approvals are reviewed; specialist capability is confirmed separately.",
          ar: "الأعمال الفنية والمركبات ومعدات الإعلام عالية القيمة: تُراجع متطلبات التغليف والمناولة والمسار وقبول الناقل والموافقات اللازمة؛ ويُؤكد توفر الخبرة المتخصصة بشكل منفصل.",
        },
        {
          en: "Project cargo and oversized exhibits: dimensions, weight, route, permits, lifting or handling plans and equipment availability are assessed.",
          ar: "بضائع المشاريع والمعروضات الضخمة: تُقيّم الأبعاد والوزن والمسار والتصاريح وخطط الرفع أو المناولة وتوفر المعدات.",
        },
        {
          en: "Temporary storage and international removals: facility and provider availability, customs scope, access and timing are confirmed separately.",
          ar: "التخزين المؤقت والنقل الدولي للأثاث: يُؤكد توفر المنشأة ومقدم الخدمة ونطاق الجمارك ودخول الموقع والتوقيت بشكل منفصل.",
        },
        {
          en: "Government, defense or controlled-venue requests: eligibility, security and regulatory requirements must be reviewed before any service commitment.",
          ar: "طلبات الجهات الحكومية أو الدفاعية أو المواقع الخاضعة للضوابط: يجب مراجعة الأهلية ومتطلبات الأمن واللوائح قبل أي التزام بتقديم الخدمة.",
        },
      ],
    },
    {
      id: "exhibition-logistics-quote-checklist",
      heading: {
        en: "What information is needed for an exhibition logistics quote?",
        ar: "ما المعلومات المطلوبة لعرض سعر لوجستيات المعارض؟",
      },
      paragraphs: [
        {
          en: "Send the event brief and cargo details together so the proposed freight, customs-document support, venue delivery and return movements can be reviewed as one plan. Pricing depends on the route, freight mode, cargo, required handling, customs procedure and venue requirements; a written quote should clarify included work, exclusions and each provider’s responsibilities.",
          ar: "أرسل تفاصيل الفعالية والبضائع معاً حتى يمكن مراجعة الشحن ودعم المستندات الجمركية والتسليم للموقع وشحنات العودة ضمن خطة واحدة. يعتمد السعر على المسار ووسيلة الشحن والبضاعة والمناولة المطلوبة والإجراء الجمركي ومتطلبات الموقع؛ وينبغي أن يوضح العرض المكتوب الأعمال المشمولة والاستثناءات ومسؤوليات كل مقدم خدمة.",
        },
      ],
      bullets: [
        {
          en: "Event name, venue, hall and stand number, organizer’s freight manual, and confirmed build-up, delivery and collection windows.",
          ar: "اسم الفعالية والموقع والقاعة ورقم الجناح ودليل الشحن الصادر عن المنظّم ومواعيد التجهيز والتسليم والاستلام المؤكدة.",
        },
        {
          en: "Collection address, origin country, destination, cargo-ready date, preferred freight mode and the return or next-event destination.",
          ar: "عنوان الاستلام وبلد المنشأ والوجهة وتاريخ جاهزية البضاعة ووسيلة الشحن المفضلة ووجهة العودة أو الفعالية التالية.",
        },
        {
          en: "Itemized packing list, number of packages, dimensions, gross weight and declared values; identify restricted goods, batteries, liquids or special handling needs.",
          ar: "قائمة تعبئة مفصلة وعدد الطرود وأبعادها وأوزانها الإجمالية والقيم المصرح بها؛ مع توضيح البضائع المقيدة أو البطاريات أو السوائل أو احتياجات المناولة الخاصة.",
        },
        {
          en: "Identify goods intended for return separately from items intended for sale, use or distribution. Confirm the applicable import procedure, importer or consignee and required approvals with the responsible customs operator.",
          ar: "ميّز البضائع المخصصة للعودة عن المواد المخصصة للبيع أو الاستخدام أو التوزيع. وأكّد إجراء الاستيراد المطبق والمستورد أو المرسل إليه والموافقات المطلوبة مع مشغّل الجمارك المسؤول.",
        },
        {
          en: "Clarify unloading, lifting, unpacking, empty-crate storage, repacking, insurance and return collection requirements. Venue-appointed contractors and access permissions must be confirmed rather than assumed.",
          ar: "وضّح متطلبات التفريغ والرفع وفك التغليف وتخزين الصناديق الفارغة وإعادة التغليف والتأمين والاستلام للعودة. ويجب تأكيد المقاولين المعتمدين من الموقع وتصاريح الدخول، لا افتراض توفرها.",
        },
      ],
      references: [
        {
          label: { en: "ZATCA: Import instructions and cargo-dependent document requirements", ar: "هيئة الزكاة والضريبة والجمارك: إرشادات الاستيراد والمستندات بحسب البضاعة" },
          href: "https://zatca.gov.sa/en/RulesRegulations/Taxes/Pages/customs-bussiness/import-pages/Import-Instructions.aspx",
          hrefAr: "https://zatca.gov.sa/ar/RulesRegulations/Taxes/Pages/customs-bussiness/import-pages/Import-Instructions.aspx",
        },
      ],
    },
    {
      id: "why-envod-exhibition-logistics",
      heading: {
        en: "Why choose ENVOD as your exhibition logistics company",
        ar: "لماذا تختار إنفود شركةً للوجستيات معارضك",
      },
      paragraphs: [
        {
          en: "Before choosing an exhibition logistics provider, confirm who arranges the freight, who is responsible for customs, which venue contractor handles the cargo, and what happens if a schedule or inspection changes. ENVOD can review the requested shipment scope; any operator, venue access, on-site work and timing must be confirmed for the event.",
          ar: "قبل اختيار مقدم لوجستيات المعارض، أكّد من يرتب الشحن ومن يتحمل مسؤولية الجمارك ومقاول الموقع الذي يناول البضائع وما الإجراء عند تغيّر الجدول أو الفحص. يمكن لإنفود مراجعة نطاق الشحنة المطلوبة؛ ويجب تأكيد المشغّل ودخول الموقع والعمل الميداني والتوقيت للفعالية المعنية.",
        },
      ],
      bullets: [
        {
          en: "Event-specific planning around venue access and organizer deadlines",
          ar: "تخطيط خاص بالفعالية حسب دخول الموقع ومواعيد المنظم",
        },
        {
          en: "ATA Carnet eligibility and documentation review",
          ar: "مراجعة أهلية كارنيه ATA ومستنداته",
        },
        {
          en: "Confirm routing and venue arrangements for your event location",
          ar: "تأكيد المسار وترتيبات الموقع لوجهة فعاليتك",
        },
        {
          en: "On-site roles and support only when permitted, available and separately confirmed",
          ar: "تُقدّم الأدوار والدعم الميداني عند السماح والتوفر والتأكيد بشكل منفصل",
        },
        {
          en: "Freight mode and carrier options assessed against cargo, route and event deadlines",
          ar: "تقييم وسيلة الشحن والناقل وفق البضاعة والمسار ومواعيد الفعالية",
        },
      ],
    },
    {
      id: "event-transport-and-specialist-support",
      heading: {
        en: "Exhibition transport, packing & event-site support",
        ar: "نقل المعارض والتغليف والدعم في موقع الفعالية",
      },
      paragraphs: [
        {
          en: "An event plan may combine GCC cross-border and domestic Saudi movements, international air or sea freight, temporary storage, packing, venue delivery and return routing. The route, carrier, customs operator, permits, service providers and event deadlines are assessed for the cargo and confirmed before booking.",
          ar: "قد تجمع خطة الفعالية بين النقل عبر الحدود داخل دول مجلس التعاون والنقل المحلي داخل السعودية والشحن الدولي الجوي أو البحري والتخزين المؤقت والتغليف والتسليم للموقع ومسار العودة. ويُقيّم المسار والناقل ومشغّل الجمارك والتصاريح ومقدمو الخدمات ومواعيد الفعالية وفق البضاعة، ثم تُؤكد قبل الحجز.",
        },
        {
          en: "For temperature-controlled or heavy equipment, share the required temperature range, weight, dimensions, handling instructions and schedule early. Suitable vehicles, monitoring, lifting equipment, permits and on-site teams are not assumed; they must be verified for the shipment and venue.",
          ar: "للبضائع التي تتطلب تحكماً حرارياً أو للمعدات الثقيلة، أرسل نطاق الحرارة المطلوب والوزن والأبعاد وتعليمات المناولة والجدول مبكراً. ولا يُفترض توفر المركبات المناسبة أو المراقبة أو معدات الرفع أو التصاريح أو الفرق الميدانية؛ بل يجب التحقق منها للشحنة والموقع.",
        },
      ],
      bullets: [
        {
          en: "GCC cross-border transport and domestic or multi-city KSA movements: route, border documents, carrier acceptance and local coverage are confirmed.",
          ar: "النقل عبر الحدود داخل دول مجلس التعاون والنقل المحلي أو متعدد المدن في السعودية: يُؤكد المسار ومستندات الحدود وقبول الناقل والتغطية المحلية.",
        },
        {
          en: "Temperature-controlled transport requests: confirm equipment, required range, monitoring, carrier acceptance and handover conditions.",
          ar: "طلبات النقل المتحكم بدرجة حرارته: أكّد المعدات ونطاق الحرارة والمراقبة وقبول الناقل وشروط التسليم.",
        },
        {
          en: "Heavy or oversized event equipment: review dimensions, weight, road restrictions, permits, lifting and handling plans.",
          ar: "معدات الفعاليات الثقيلة أو كبيرة الحجم: تُراجع الأبعاد والوزن وقيود الطرق والتصاريح وخطط الرفع والمناولة.",
        },
        {
          en: "Packing, custom cases or crates, fragile or high-value items, temporary storage and return transport: confirm the scope and any specialist provider.",
          ar: "التغليف والصناديق أو الحاويات المصممة حسب الطلب والبضائع الهشة أو عالية القيمة والتخزين المؤقت ونقل العودة: يُؤكد النطاق وأي مقدم خدمة متخصص.",
        },
        {
          en: "Booth, stage, décor and lighting design/build enquiries, transport, installation or teardown, and on-site project coordination: subject to qualified-provider availability, venue access, appointed contractors and confirmed responsibilities.",
          ar: "استفسارات تصميم الأجنحة والمنصات والديكور والإضاءة أو تنفيذها ونقلها وتركيبها أو تفكيكها والتنسيق الميداني للمشروع: تخضع لتوفر مقدم خدمة مؤهل ودخول الموقع ومقاوليه المعتمدين وتأكيد المسؤوليات.",
        },
        {
          en: "Door-to-door international air or sea freight, temporary-import/export documents and return or re-export planning: eligibility, route and customs requirements are checked for each shipment.",
          ar: "الشحن الدولي الجوي أو البحري من الباب إلى الباب ومستندات الإدخال أو التصدير المؤقت وتخطيط العودة أو إعادة التصدير: تُراجع الأهلية والمسار والمتطلبات الجمركية لكل شحنة.",
        },
        {
          en: "Fine-art, fragile and other high-value cargo: packing, crating, handling, insurance requirements and specialist-provider capability must be reviewed for the items and route.",
          ar: "الأعمال الفنية والبضائع الهشة وغيرها من الشحنات عالية القيمة: تُراجع متطلبات التغليف والصناديق والمناولة والتأمين وقدرات مقدمي الخدمات المتخصصين حسب البضائع والمسار.",
        },
        {
          en: "Temporary admission for overseas exhibitors without a Saudi commercial presence: the eligible importer or consignee, procedure and supporting documents must be confirmed with the responsible customs operator and authorities.",
          ar: "الإدخال المؤقت للعارضين من خارج المملكة الذين لا يملكون حضوراً تجارياً سعودياً: يجب تأكيد المستورد أو المرسل إليه المؤهل والإجراء والمستندات الداعمة مع مشغّل الجمارك والجهات المختصة.",
        },
        {
          en: "Aircraft or VIP charter and relocation meet-and-greet requests may be reviewed separately; licensed-operator availability, approvals, timing and exact scope must be confirmed before commitment.",
          ar: "يمكن مراجعة طلبات استئجار الطائرات أو الرحلات الخاصة وخدمات الاستقبال المرتبطة بالانتقال بشكل منفصل؛ ويجب تأكيد توفر المشغّل المرخّص والموافقات والتوقيت والنطاق قبل الالتزام.",
        },
      ],
    },
    {
      id: "event-logistics-coordination-benefits",
      heading: {
        en: "Benefits of coordinated event logistics",
        ar: "مزايا تنسيق لوجستيات الفعاليات",
      },
      paragraphs: [
        {
          en: "Exhibition and event enquiries are coordinated by the same Riyadh logistics team that coordinates ENVOD KINGDOM’s freight, storage and delivery requests. A shipment-specific plan can bring these requirements together while you focus on the event; each service, provider and responsibility is confirmed before booking.",
          ar: "يتولى الفريق اللوجستي نفسه في الرياض تنسيق استفسارات المعارض والفعاليات، وهو الفريق الذي ينسق طلبات الشحن والتخزين والتسليم لدى إنفود كينغدوم. ويمكن لخطة خاصة بالشحنة جمع هذه المتطلبات مع إتاحة تركيزك على الفعالية؛ ويُؤكد كلٌّ من الخدمة ومقدمها والمسؤولية قبل الحجز.",
        },
      ],
      bullets: [
        {
          en: "A dedicated enquiry contact and coordination plan, with response timing and any on-site attendance agreed for the specific booking.",
          ar: "جهة تواصل مخصصة للاستفسار وخطة تنسيق، مع الاتفاق على وقت الاستجابة وأي حضور ميداني للحجز المعني.",
        },
        {
          en: "Shipment updates based on tracking and reporting supplied by the selected carrier or provider; visibility and update frequency vary by route and operator.",
          ar: "تحديثات الشحنة وفق بيانات التتبع والتقارير التي يقدمها الناقل أو مقدم الخدمة المختار؛ إذ تختلف الرؤية وتكرار التحديث حسب المسار والمشغّل.",
        },
        {
          en: "A tailored scope can coordinate available freight, customs-document support, packing, storage, venue delivery and return routing, with provider roles clarified before dispatch.",
          ar: "يمكن للنطاق المصمم حسب الطلب تنسيق خدمات الشحن المتاحة ودعم المستندات الجمركية والتغليف والتخزين والتسليم للموقع ومسار العودة، مع توضيح أدوار مقدمي الخدمات قبل الإرسال.",
        },
      ],
    },
  ],

  venues: [
    {
      name: "Riyadh International Convention & Exhibition Center (RICEC)",
      nameAr: "مركز الرياض الدولي للمؤتمرات والمعارض",
      city: "Riyadh",
      cityAr: "الرياض",
      note: {
        en: "On King Abdullah Road, Riyadh. Not the same venue as Riyadh Front (RFECC), so check the venue name in your exhibitor manual before booking delivery.",
        ar: "يقع على طريق الملك عبدالله في الرياض. وهو موقع مختلف عن مركز واجهة الرياض (RFECC)، لذا تحقّق من اسم الموقع في دليل العارضين قبل حجز التسليم.",
      },
    },
    {
      name: "Riyadh Front Exhibition & Conference Center (RFECC)",
      nameAr: "مركز واجهة الرياض للمعارض والمؤتمرات (RFECC)",
      city: "Riyadh",
      cityAr: "الرياض",
      note: {
        en: "Not the same venue as RICEC or the Malham center, although the names are similar. Confirm the venue named in the organizer’s shipping manual, plus the official freight contractor and move-in schedule it lists.",
        ar: "موقع مختلف عن مركز الرياض الدولي (RICEC) وعن مركز ملهم رغم تشابه الأسماء. أكّد الموقع المذكور في دليل الشحن الصادر عن المنظّم، ومقاول الشحن الرسمي وجدول التجهيز الواردين فيه.",
      },
    },
    {
      name: "Riyadh Exhibition and Convention Center (Malham)",
      nameAr: "مركز الرياض للمعارض والمؤتمرات (ملهم)",
      city: "Malham",
      cityAr: "ملهم",
      note: {
        en: "In Malham, outside central Riyadh. Allow for the inland journey when planning the delivery truck’s arrival, and confirm vehicle access and the delivery window with the organizer.",
        ar: "يقع في ملهم خارج وسط الرياض. احسب مدة النقل الداخلي عند تحديد موعد وصول شاحنة التسليم، وأكّد دخول المركبات ونافذة التسليم مع المنظّم.",
      },
    },
    {
      name: "Jeddah International Exhibition & Convention Center (Jeddah Forums and Events Center)",
      nameAr: "مركز جدة الدولي للمعارض والمؤتمرات (مركز جدة للمنتديات والفعاليات)",
      city: "Jeddah",
      cityAr: "جدة",
      note: {
        en: "Not the same venue as the Jeddah Superdome. Many Jeddah shows now use the Superdome, so check which venue your event is booked at before arranging delivery.",
        ar: "موقع مختلف عن قبة جدة (سوبر دوم). تُقام معارض كثيرة في جدة حالياً في قبة جدة، لذا تحقّق من موقع فعاليتك قبل ترتيب التسليم.",
      },
    },
    {
      name: "Jeddah Superdome",
      nameAr: "قبة جدة (سوبر دوم)",
      city: "Jeddah",
      cityAr: "جدة",
      note: {
        en: "On Madinah Road, Jeddah; opened in 2021. Not the same venue as the historic Jeddah Dome in Al-Sharafiyah, so make sure the delivery address on the waybill is the Superdome.",
        ar: "يقع على طريق المدينة في جدة، وافتُتح عام 2021. وهو موقع مختلف عن قبة جدة التاريخية في حي الشرفية، لذا تأكّد أن عنوان التسليم في بوليصة الشحن هو قبة جدة (سوبر دوم).",
      },
    },
    {
      name: "Dhahran Expo",
      nameAr: "ظهران إكسبو",
      city: "Dhahran",
      cityAr: "الظهران",
      note: {
        en: "Venue listings put it on Exhibition Road in Dammam, despite the Dhahran name. Use the address in the organizer’s manual on the waybill, not just the city name.",
        ar: "تشير قوائم المواقع إلى أنه يقع على طريق المعارض في الدمام رغم اسمه. استخدم العنوان الوارد في دليل المنظّم في بوليصة الشحن، وليس اسم المدينة فقط.",
      },
    },
  ],

  majorEvents: [
    { name: "LEAP", sector: "Technology", sectorAr: "التقنية", city: "Riyadh", cityAr: "الرياض" },
    { name: "Cityscape Global", sector: "Real Estate", sectorAr: "العقارات", city: "Riyadh", cityAr: "الرياض" },
    { name: "Big 5 Construct Saudi", sector: "Construction", sectorAr: "البناء والتشييد", city: "Riyadh", cityAr: "الرياض" },
    { name: "Saudi Build", sector: "Construction", sectorAr: "البناء والتشييد", city: "Riyadh", cityAr: "الرياض" },
    { name: "INDEX Saudi Arabia", sector: "Interiors & Design", sectorAr: "التصميم الداخلي", city: "Riyadh", cityAr: "الرياض" },
    { name: "Global Health Exhibition", sector: "Healthcare", sectorAr: "الرعاية الصحية", city: "Riyadh", cityAr: "الرياض" },
    { name: "Foodex Saudi", sector: "Food & Beverage", sectorAr: "الأغذية والمشروبات", city: "Jeddah", cityAr: "جدة" },
    { name: "Automechanika Riyadh", sector: "Automotive", sectorAr: "السيارات", city: "Riyadh", cityAr: "الرياض" },
  ],

  relatedLinks: [
    { label: "ATA Carnet Coordination", labelAr: "تنسيق كارنيه ATA", href: "/services/ata-carnet" },
    { label: "Air Freight for Urgent Cargo", labelAr: "الشحن الجوي للبضائع العاجلة", href: "/services/air-freight" },
    { label: "Ocean Freight", labelAr: "الشحن البحري", href: "/services/ocean-freight" },
    { label: "Customs Clearance", labelAr: "التخليص الجمركي", href: "/services/customs-clearance" },
    { label: "Freight Forwarding", labelAr: "الشحن وإدارة النقل", href: "/services/freight-forwarding" },
    { label: "Project Cargo", labelAr: "شحن المشاريع", href: "/services/project-cargo" },
    { label: "Warehousing & Distribution", labelAr: "التخزين والتوزيع", href: "/services/warehousing" },
    { label: "House Moving & Relocation", labelAr: "نقل المنازل والانتقال", href: "/services/relocation" },
    { label: "GCC Transportation", labelAr: "النقل البري داخل دول مجلس التعاون", href: "/services/gcc-transportation" },
    { label: "Packaging & Crating Services", labelAr: "خدمات التغليف والصناديق", href: "/services/packaging-crating" },
  ],
};
