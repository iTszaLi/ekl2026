import type { ServicePillar } from "../service-data";

/**
 * Long-form, crawler-friendly "pillar" content for the ATA Carnet service page.
 * Rendered as plain semantic HTML (see PillarSections) so the prerendered static
 * HTML exposes visible, indexable copy — no framer-motion initial opacity:0 that
 * would serialize hidden content into the SSG output.
 *
 * Targets: ATA Carnet Saudi Arabia, ATA Carnet processing, temporary import
 * Saudi Arabia, carnet for exhibitions / professional equipment / commercial
 * samples. Claims are consistent with existing site copy (24-hour processing;
 * temporary duty-free admission; 80+ countries in the ATA Carnet system).
 * venues / majorEvents intentionally left empty (not relevant to this page).
 */
export const ATA_CARNET_PILLAR: ServicePillar = {
  seoTitle: "ATA Carnet Saudi Arabia — Typically Within 24 Hours | ENVOD KINGDOM",
  seoDescription:
    "ATA Carnet processing in Saudi Arabia typically within 24 hours — the international customs passport for temporary duty-free admission of exhibition goods, professional equipment and commercial samples across 80+ countries.",

  intro: [
    {
      en: "An ATA Carnet is the international customs document that lets goods cross borders temporarily without paying import duties or taxes. ENVOD KINGDOM SHIPPING SERVICES issues, processes and manages ATA Carnets for companies moving exhibition displays, professional equipment and commercial samples into and out of Saudi Arabia — typically cleared within 24 hours so your cargo is never the reason a stand opens late or a project slips.",
      ar: "كارنيه ATA هو المستند الجمركي الدولي الذي يتيح عبور البضائع للحدود مؤقتاً دون دفع رسوم أو ضرائب استيراد. تُصدر إنفود كينجدوم لخدمات الشحن كارنيهات ATA وتعالجها وتديرها للشركات التي تنقل معروضات المعارض والمعدات المهنية والعينات التجارية من وإلى المملكة العربية السعودية — بتخليص عادةً خلال 24 ساعة حتى لا تكون بضائعك سبباً في تأخر افتتاح جناح أو تعثر مشروع.",
    },
    {
      en: "Known as the \"passport for goods\", a single Carnet replaces the temporary-import paperwork that would otherwise be required at every border, guarantees the duties to customs on your behalf, and lets the same goods leave and return without complication. For more than 25 years our customs team has handled that documentation for exhibitors, broadcasters, contractors and manufacturers — so the goods move, the deadlines hold, and nothing gets stuck at the border.",
      ar: "يُعرف كارنيه ATA بـ«جواز سفر البضائع»، إذ يحل كارنيه واحد محل أوراق الاستيراد المؤقت التي كانت ستُطلب عند كل حدود، ويضمن الرسوم للجمارك نيابة عنك، ويتيح لنفس البضائع المغادرة والعودة دون تعقيد. لأكثر من 25 عاماً تولّى فريق التخليص لدينا هذه الوثائق للعارضين وشركات البث والمقاولين والمصنّعين — فتتحرك البضائع، وتُحترم المواعيد، ولا يعلق شيء عند الحدود.",
    },
  ],

  sections: [
    {
      id: "what-is-an-ata-carnet",
      heading: {
        en: "What is an ATA Carnet?",
        ar: "ما هو كارنيه ATA؟",
      },
      paragraphs: [
        {
          en: "An ATA Carnet is an international customs and temporary-export/import document accepted in more than 80 countries and territories. It allows goods to enter a country duty-free and tax-free for up to one year, provided the same goods are re-exported unchanged before the Carnet expires. The name comes from the French and English \"Admission Temporaire / Temporary Admission\".",
          ar: "كارنيه ATA مستند جمركي دولي للتصدير والاستيراد المؤقت مقبول في أكثر من 80 دولة وإقليماً. يتيح دخول البضائع إلى بلدٍ ما معفاة من الرسوم والضرائب لمدة تصل إلى عام واحد، شريطة إعادة تصدير البضائع نفسها دون تغيير قبل انتهاء صلاحية الكارنيه. ويأتي الاسم من العبارة الفرنسية والإنجليزية «القبول المؤقت».",
        },
        {
          en: "Instead of lodging a separate temporary-import bond and clearance at each customs post, the holder presents one Carnet that has already guaranteed any potential duties. This removes cash deposits at the border, standardises the paperwork across countries, and dramatically speeds up clearance both on the way in and on the way back out.",
          ar: "بدلاً من تقديم كفالة استيراد مؤقت وتخليص منفصلين عند كل نقطة جمركية، يقدّم الحامل كارنيهاً واحداً يكون قد ضمن مسبقاً أي رسوم محتملة. وهذا يلغي الودائع النقدية عند الحدود، ويوحّد الأوراق عبر الدول، ويسرّع التخليص بشكل كبير عند الدخول والخروج معاً.",
        },
      ],
      bullets: [
        {
          en: "Duty-free and tax-free temporary admission for up to 12 months",
          ar: "قبول مؤقت معفى من الرسوم والضرائب لمدة تصل إلى 12 شهراً",
        },
        {
          en: "One document accepted across 80+ countries and territories",
          ar: "مستند واحد مقبول في أكثر من 80 دولة وإقليماً",
        },
        {
          en: "No cash deposit or separate bond required at each border",
          ar: "دون وديعة نقدية أو كفالة منفصلة عند كل حدود",
        },
        {
          en: "Covers multiple trips and multiple countries on a single Carnet",
          ar: "يغطي رحلات متعددة ودولاً متعددة على كارنيه واحد",
        },
      ],
    },
    {
      id: "what-does-an-ata-carnet-cover",
      heading: {
        en: "What can you move on an ATA Carnet?",
        ar: "ما الذي يمكن نقله بكارنيه ATA؟",
      },
      paragraphs: [
        {
          en: "The ATA Carnet system covers three broad categories of goods that leave a country temporarily and come back unchanged. It does not apply to consumables, giveaways or anything that will be sold, used up or left behind — those follow standard import and customs clearance.",
          ar: "يغطي نظام كارنيه ATA ثلاث فئات عامة من البضائع التي تغادر البلد مؤقتاً وتعود دون تغيير. ولا ينطبق على المواد الاستهلاكية أو الهدايا أو أي شيء سيُباع أو يُستهلك أو يُترك — فتلك تخضع للاستيراد والتخليص الجمركي المعتاد.",
        },
      ],
      bullets: [
        {
          en: "Exhibition & event goods — stands, displays, samples and demo units",
          ar: "بضائع المعارض والفعاليات — الأجنحة والمعروضات والعينات ووحدات العرض",
        },
        {
          en: "Professional equipment — broadcast, film, survey, medical and test gear",
          ar: "المعدات المهنية — معدات البث والتصوير والمساحة والطب والاختبار",
        },
        {
          en: "Commercial samples — products shown to buyers before an order is placed",
          ar: "العينات التجارية — المنتجات المعروضة على المشترين قبل تقديم الطلب",
        },
        {
          en: "Tools, instruments and equipment for on-site projects and maintenance",
          ar: "الأدوات والأجهزة والمعدات لمشاريع الموقع والصيانة",
        },
      ],
    },
    {
      id: "how-envod-processes-ata-carnets",
      heading: {
        en: "How ENVOD processes your ATA Carnet — typically within 24 hours",
        ar: "كيف تعالج إنفود كارنيه ATA — عادةً خلال 24 ساعة",
      },
      paragraphs: [
        {
          en: "Carnets fail at the border for predictable reasons — an item missing from the general list, a mismatched serial number, an expired validity date, or an endorsement skipped on exit. Our team builds the Carnet correctly the first time and stays with it through every customs endorsement, so the document that leaves is the document that comes back closed and discharged.",
          ar: "تفشل الكارنيهات عند الحدود لأسباب متوقعة — صنف مفقود من القائمة العامة، أو رقم تسلسلي غير مطابق، أو تاريخ صلاحية منتهٍ، أو تصديق فائت عند الخروج. يُعدّ فريقنا الكارنيه بشكل صحيح من المرة الأولى ويرافقه في كل تصديق جمركي، فيكون المستند الذي يغادر هو نفسه الذي يعود مُغلقاً ومُبرَّأً.",
        },
      ],
      bullets: [
        {
          en: "Eligibility review and accurate general list of goods with values",
          ar: "مراجعة الأهلية وإعداد قائمة عامة دقيقة للبضائع بقيمها",
        },
        {
          en: "Carnet issuance and guarantee arranged — typically within 24 hours",
          ar: "إصدار الكارنيه وترتيب الضمان — عادةً خلال 24 ساعة",
        },
        {
          en: "Customs endorsement at export, import, re-export and re-import",
          ar: "التصديق الجمركي عند التصدير والاستيراد وإعادة التصدير وإعادة الاستيراد",
        },
        {
          en: "Discharge tracking so the Carnet is closed cleanly with no claims",
          ar: "متابعة الإبراء لإغلاق الكارنيه بشكل سليم دون أي مطالبات",
        },
      ],
    },
    {
      id: "why-envod-for-ata-carnets",
      heading: {
        en: "Why choose ENVOD for ATA Carnets in Saudi Arabia",
        ar: "لماذا تختار إنفود لكارنيه ATA في السعودية",
      },
      paragraphs: [
        {
          en: "As a Saudi customs specialist, ENVOD KINGDOM pairs Carnet expertise with the freight forwarding and on-the-ground clearance that a temporary import actually needs. That means one team handles the document, the shipment and the customs endorsements — a fast, low-risk way to keep temporary goods moving.",
          ar: "بوصفها متخصصة في الجمارك السعودية، تجمع إنفود كينجدوم بين خبرة الكارنيه والشحن والتخليص الميداني الذي يتطلبه الاستيراد المؤقت فعلياً. وهذا يعني أن فريقاً واحداً يتولى المستند والشحنة والتصديقات الجمركية — وهي طريقة سريعة ومنخفضة المخاطر لإبقاء البضائع المؤقتة في حركة.",
        },
      ],
      bullets: [
        {
          en: "Carnet processing typically within 24 hours for time-critical shipments",
          ar: "معالجة الكارنيه عادةً خلال 24 ساعة للشحنات الحسّاسة للوقت",
        },
        {
          en: "End-to-end handling: document, freight and customs under one team",
          ar: "مناولة متكاملة: المستند والشحن والجمارك تحت فريق واحد",
        },
        {
          en: "Deep Saudi Customs relationships and temporary-import know-how",
          ar: "علاقات عميقة مع الجمارك السعودية وخبرة في الاستيراد المؤقت",
        },
        {
          en: "Integrated air, sea and road freight to and from the venue or site",
          ar: "شحن جوي وبحري وبري متكامل من وإلى المكان أو الموقع",
        },
      ],
    },
  ],

  venues: [],
  majorEvents: [],

  relatedLinks: [
    { label: "Exhibition & Event Logistics", labelAr: "لوجستيات المعارض والفعاليات", href: "/services/exhibition-logistics" },
    { label: "Customs Clearance", labelAr: "التخليص الجمركي", href: "/services/customs-clearance" },
    { label: "Freight Forwarding", labelAr: "الشحن وإدارة النقل", href: "/services/freight-forwarding" },
    { label: "Project Cargo", labelAr: "شحن المشاريع", href: "/services/project-cargo" },
  ],
};
