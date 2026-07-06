import type { ServicePillar } from "../service-data";

/**
 * Long-form, crawler-friendly "pillar" content for the Exhibition Logistics
 * service page. Rendered as plain semantic HTML (see PillarSections) so the
 * prerendered static HTML exposes visible, indexable copy — no framer-motion
 * initial opacity:0 that would serialize hidden content into the SSG output.
 *
 * Targets: exhibition logistics company, trade show logistics, event logistics
 * company, exhibition freight forwarding, best exhibition logistics.
 * All claims are consistent with existing site copy (25+ years; ATA Carnet 24h;
 * LEAP / Cityscape / Big 5 / Saudi Build / INDEX). Venues and events are real,
 * public KSA exhibition venues/shows; nationwide service is confirmed.
 */
export const EXHIBITION_PILLAR: ServicePillar = {
  seoTitle: "Exhibition Logistics Company in Saudi Arabia | ENVOD KINGDOM",
  seoDescription:
    "Saudi Arabia's specialist exhibition & trade-show logistics company — ATA Carnet typically within 24 hours, on-site handling, temporary import and event freight forwarding to every major venue nationwide.",

  intro: [
    {
      en: "When your stand has to be built, stocked and show-ready before the doors open, exhibition logistics is not something you can improvise. ENVOD KINGDOM SHIPPING SERVICES is a specialist exhibition logistics company in Saudi Arabia, moving exhibition cargo, booth structures and event equipment to every major trade show and venue in the Kingdom — on time, cleared through customs, and delivered directly to your stand.",
      ar: "عندما يجب أن يكون جناحك جاهزاً بالكامل قبل فتح الأبواب، لا يمكن ارتجال لوجستيات المعارض. إنفود كينجدوم لخدمات الشحن شركة متخصصة في لوجستيات المعارض في المملكة العربية السعودية، تنقل شحنات المعارض وهياكل الأجنحة ومعدات الفعاليات إلى كل معرض تجاري ومكان رئيسي في المملكة — في الوقت المحدد، ومُخلَّصة جمركياً، ومُسلَّمة مباشرة إلى جناحك.",
    },
    {
      en: "For more than 25 years we have handled the freight forwarding, ATA Carnet processing, temporary import and on-site handling that keep exhibitors on schedule at events such as LEAP, Cityscape Global, Big 5 Construct Saudi, Saudi Build and INDEX. From a single crate of samples to a full multi-country pavilion, our team manages the entire journey so you can focus on the show floor — not the shipping.",
      ar: "لأكثر من 25 عاماً، تولّينا أعمال الشحن ومعالجة كارنيه ATA والاستيراد المؤقت والمناولة الميدانية التي تُبقي العارضين على الموعد في فعاليات مثل LEAP وCityscape Global وBig 5 وSaudi Build وINDEX. من صندوق عينات واحد إلى جناح وطني متعدد الدول، يدير فريقنا الرحلة بالكامل لتتفرّغ لأرض المعرض — لا للشحن.",
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
          en: "Because most exhibition goods leave the country again after the show, the process also relies on temporary-import instruments such as the ATA Carnet, which let goods enter Saudi Arabia duty-free for the duration of the event and return home without complications. Getting that documentation right is the difference between a stand that opens on time and cargo stuck in customs.",
          ar: "ولأن معظم بضائع المعارض تغادر البلاد مجدداً بعد انتهاء الحدث، تعتمد العملية أيضاً على أدوات الاستيراد المؤقت مثل كارنيه ATA، الذي يتيح دخول البضائع إلى المملكة معفاة من الرسوم طوال مدة الفعالية وإعادتها دون تعقيدات. وضبط هذه الوثائق هو الفرق بين جناح يفتح في موعده وبضائع عالقة في الجمارك.",
        },
      ],
      bullets: [
        {
          en: "Inbound freight forwarding by air, sea and road to the show city",
          ar: "الشحن الوارد جواً وبحراً وبراً إلى مدينة المعرض",
        },
        {
          en: "Customs clearance and temporary import / ATA Carnet handling",
          ar: "التخليص الجمركي والاستيراد المؤقت ومعالجة كارنيه ATA",
        },
        {
          en: "Timed delivery to the venue, hall and stand number",
          ar: "تسليم مُوقَّت إلى المكان والقاعة ورقم الجناح",
        },
        {
          en: "On-site unloading, positioning, installation and dismantling",
          ar: "التفريغ والتموضع والتركيب والتفكيك في الموقع",
        },
        {
          en: "Return logistics and re-export after the event closes",
          ar: "اللوجستيات العكسية وإعادة التصدير بعد انتهاء الفعالية",
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
          en: "Saudi Arabia now hosts one of the busiest exhibition calendars in the region, spread across Riyadh, Jeddah and the Eastern Province. ENVOD provides exhibition and event logistics nationwide, coordinating cargo into the Kingdom's leading convention and exhibition centres and synchronising every delivery window with the organiser's build-up schedule.",
          ar: "تستضيف المملكة العربية السعودية اليوم أحد أكثر أجندات المعارض ازدحاماً في المنطقة، موزّعة على الرياض وجدة والمنطقة الشرقية. تقدّم إنفود لوجستيات المعارض والفعاليات على مستوى المملكة، وتنسّق دخول الشحنات إلى أبرز مراكز المؤتمرات والمعارض، وتُزامن كل نافذة تسليم مع جدول التجهيز الخاص بالمنظّم.",
        },
        {
          en: "Whether you are a first-time exhibitor shipping a single pallet or a national pavilion organiser managing dozens of participants, we scale the same disciplined process: one point of contact, clear documentation, and a delivery plan mapped to each venue's access rules and move-in times.",
          ar: "سواء كنت عارضاً لأول مرة تشحن منصة نقالة واحدة أو منظّم جناح وطني يدير عشرات المشاركين، نطبّق العملية المنضبطة ذاتها على أي حجم: نقطة تواصل واحدة، ووثائق واضحة، وخطة تسليم مرتبطة بقواعد الدخول ومواعيد الإدخال لكل مكان.",
        },
      ],
    },
    {
      id: "ata-carnet-temporary-import",
      heading: {
        en: "ATA Carnet & temporary import — typically cleared within 24 hours",
        ar: "كارنيه ATA والاستيراد المؤقت — تخليص عادةً خلال 24 ساعة",
      },
      paragraphs: [
        {
          en: "The ATA Carnet is one of the fastest and simplest ways to bring exhibition goods into Saudi Arabia temporarily. It replaces multiple customs declarations with a single internationally recognised document, removes the need to pay import duties or deposits up front, and enables a straightforward re-export once the event is over.",
          ar: "كارنيه ATA من أسرع وأبسط الطرق لإدخال بضائع المعارض إلى المملكة بصفة مؤقتة. فهو يستبدل عدة إقرارات جمركية بمستند واحد معترف به دولياً، ويُلغي الحاجة إلى دفع رسوم استيراد أو تأمينات مقدماً، ويتيح إعادة تصدير سلسة بعد انتهاء الفعالية.",
        },
        {
          en: "ENVOD offers ATA Carnet processing typically within 24 hours, and we also arrange temporary-import clearance directly through Saudi Customs when a Carnet is not available in the country of origin. Our team checks every line of your equipment list against the Carnet so nothing is held or penalised on arrival or return.",
          ar: "تُوفّر إنفود معالجة كارنيه ATA عادةً خلال 24 ساعة، كما نُرتّب التخليص للاستيراد المؤقت مباشرة عبر الجمارك السعودية عندما لا يتوفّر الكارنيه في بلد المنشأ. ويُطابق فريقنا كل بند في قائمة معداتك مع الكارنيه حتى لا يُحتجز أي صنف أو يخضع لغرامة عند الوصول أو الإعادة.",
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
          en: "Getting cargo to the venue is only half the job. Exhibition halls run tight, closely-marshalled move-in and move-out schedules, and a missed slot can mean waiting hours for the next access window. Our on-site teams take delivery at the loading dock, move your freight to the correct stand, and handle unpacking, positioning and empty-crate storage during the show.",
          ar: "إيصال البضائع إلى المكان نصف المهمة فقط. تعمل قاعات المعارض وفق جداول دقيقة ومنظّمة للإدخال والإخراج، وقد يعني تفويت الموعد المخصص انتظار ساعات حتى نافذة الدخول التالية. تستلم فرقنا الميدانية الشحنة عند رصيف التحميل، وتنقلها إلى الجناح الصحيح، وتتولى فك التغليف والتموضع وتخزين الصناديق الفارغة أثناء المعرض.",
        },
        {
          en: "When the event closes, we reverse the process — repacking, retrieving empties from storage, and preparing everything for return shipment or onward transport to your next show. A dedicated coordinator stays with your account from booking through re-export.",
          ar: "وعند انتهاء الفعالية نعكس العملية — إعادة التغليف، واستعادة الصناديق الفارغة من التخزين، وتجهيز كل شيء لشحن العودة أو النقل إلى معرضك التالي. ويبقى منسّق مخصص مع حسابك من الحجز حتى إعادة التصدير.",
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
          en: "Exhibitors choose ENVOD because we combine the customs expertise of a Saudi freight forwarder with the show-floor discipline of an events team. We know the venues, the organisers' deadlines and the paperwork Saudi Customs expects — and we plan backwards from your opening time so every step keeps a margin for the unexpected.",
          ar: "يختار العارضون إنفود لأننا نجمع خبرة التخليص الجمركي لوكيل شحن سعودي مع انضباط فريق فعاليات على أرض المعرض. نعرف الأماكن، ومواعيد المنظّمين النهائية، والأوراق التي تتطلبها الجمارك السعودية — ونخطّط انطلاقاً من موعد افتتاحك إلى الوراء بحيث تحتفظ كل خطوة بهامش للطوارئ.",
        },
      ],
      bullets: [
        {
          en: "25+ years supporting Saudi Arabia's largest exhibitions and events",
          ar: "أكثر من 25 عاماً في دعم أكبر معارض وفعاليات المملكة",
        },
        {
          en: "ATA Carnet processing typically within 24 hours",
          ar: "معالجة كارنيه ATA عادةً خلال 24 ساعة",
        },
        {
          en: "Nationwide coverage — Riyadh, Jeddah, Dammam and every major venue",
          ar: "تغطية على مستوى المملكة — الرياض وجدة والدمام وكل مكان رئيسي",
        },
        {
          en: "A dedicated on-site coordinator for the duration of your event",
          ar: "منسّق مخصص في الموقع طوال مدة فعاليتك",
        },
        {
          en: "Integrated air, sea and road freight for time-critical cargo",
          ar: "شحن جوي وبحري وبري متكامل للبضائع الحسّاسة للوقت",
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
    },
    {
      name: "Riyadh Front Exhibition & Convention Center",
      nameAr: "واجهة الرياض للمعارض والمؤتمرات",
      city: "Riyadh",
      cityAr: "الرياض",
    },
    {
      name: "Jeddah Superdome",
      nameAr: "قبة جدة (سوبر دوم)",
      city: "Jeddah",
      cityAr: "جدة",
    },
    {
      name: "Jeddah Center for Forums & Events",
      nameAr: "مركز جدة للمنتديات والفعاليات",
      city: "Jeddah",
      cityAr: "جدة",
    },
    {
      name: "Dhahran Expo",
      nameAr: "ظهران إكسبو",
      city: "Dhahran",
      cityAr: "الظهران",
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
    { label: "Air Freight for Urgent Cargo", labelAr: "الشحن الجوي للبضائع العاجلة", href: "/services/air-freight" },
    { label: "Customs Clearance", labelAr: "التخليص الجمركي", href: "/services/customs-clearance" },
    { label: "Freight Forwarding", labelAr: "الشحن وإدارة النقل", href: "/services/freight-forwarding" },
    { label: "Project Cargo", labelAr: "شحن المشاريع", href: "/services/project-cargo" },
  ],
};
