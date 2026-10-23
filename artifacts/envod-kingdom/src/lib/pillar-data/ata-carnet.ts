import type { ServicePillar } from "../service-data";

/**
 * Long-form, crawler-friendly "pillar" content for the ATA Carnet service page.
 * Rendered as plain semantic HTML (see PillarSections) so the prerendered static
 * HTML exposes visible, indexable copy — no framer-motion initial opacity:0 that
 * would serialize hidden content into the SSG output.
 *
 * Targets: ATA Carnet Saudi Arabia, ATA Carnet processing, temporary import
 * Saudi Arabia, carnet for exhibitions / professional equipment / commercial
 * samples. Issuance belongs to authorized associations; coordination and
 * destination customs review do not imply a fixed clearance time.
 * venues / majorEvents intentionally left empty (not relevant to this page).
 */
export const ATA_CARNET_PILLAR: ServicePillar = {
  seoTitle: "ATA Carnet Saudi Arabia & Temporary Import | ENVOD KINGDOM",
  seoDescription:
    "ATA Carnet and temporary-import coordination in Saudi Arabia: equipment lists, customs endorsements, eligibility checks and re-export planning for exhibition cargo.",

  intro: [
    {
      en: "An ATA Carnet is an international customs document for eligible goods moving temporarily under the ATA guarantee system. ENVOD KINGDOM SHIPPING SERVICES coordinates shipment documentation, customs endorsements and re-export planning for exhibition cargo entering or leaving Saudi Arabia. Carnets are issued by authorized associations, not automatically by the freight forwarder; confirm the goods, intended use and destination requirements before dispatch.",
      ar: "كارنيه ATA مستند جمركي دولي للبضائع المؤهلة التي تُنقل مؤقتاً ضمن نظام الضمان الخاص بالكارنيه. تنسّق إنفود كينجدوم لخدمات الشحن مستندات الشحنة والتصديقات الجمركية وخطة إعادة التصدير لشحنات المعارض الداخلة إلى السعودية أو الخارجة منها. تُصدر الكارنيهات جهات مخوّلة، وليس وكيل الشحن تلقائياً؛ لذا تحقق من البضائع والغرض من استخدامها ومتطلبات الوجهة قبل الإرسال.",
    },
    {
      en: "Known as the \"passport for goods\", a Carnet works through an international guarantee chain. The holder remains responsible for accurate item descriptions, values and serial numbers, correct customs endorsements, and re-export within the period customs permits, which can be earlier than the Carnet expiry date. Issuance, pre-approval, inspection and release depend on the responsible authorities; no fixed processing time or claim-free outcome is promised.",
      ar: "يُعرف الكارنيه بـ«جواز سفر البضائع» ويعمل عبر سلسلة ضمان دولية. ويظل حامله مسؤولاً عن دقة أوصاف الأصناف وقيمها وأرقامها التسلسلية، وصحة التصديقات الجمركية، وإعادة التصدير ضمن المهلة التي تسمح بها الجمارك، وقد تكون أقصر من صلاحية الكارنيه. ويعتمد الإصدار والموافقة المسبقة والفحص والفسح على الجهات المختصة، دون وعد بمدة معالجة ثابتة أو خلوّ العملية من المطالبات.",
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
          en: "An ATA Carnet is an international customs document used for eligible temporary movements of goods under the ATA system. Country acceptance, permitted purpose, validity and guarantee terms depend on the issuing terms and authorities. For Saudi Arabia, confirm the current accepted use and shipment eligibility before relying on a Carnet.",
          ar: "كارنيه ATA مستند جمركي دولي يُستخدم للحركات المؤقتة المؤهلة للبضائع ضمن نظام ATA. ويعتمد قبول البلدان والغرض المسموح به والصلاحية وشروط الضمان على شروط الإصدار والسلطات. وفي السعودية، يجب تأكيد الاستخدام المقبول حالياً وأهلية الشحنة قبل الاعتماد على الكارنيه.",
        },
        {
          en: "Where the authorities accept a Carnet for the specific goods and use, its guarantee mechanism may apply under the relevant terms. Issuing-association fees or security requirements can still apply. Customs controls, prior approvals, examination and other cargo-specific permits remain separate requirements.",
          ar: "عندما تقبل السلطات الكارنيه للبضاعة والاستخدام المحددين، قد تنطبق آلية الضمان وفق الشروط ذات الصلة. وقد تظل رسوم جهة الإصدار أو متطلبات التأمين قائمة. وتبقى الرقابة الجمركية والموافقات المسبقة والفحص والتصاريح الخاصة بالبضاعة متطلبات منفصلة.",
        },
      ],
      bullets: [
        {
          en: "Temporary admission only where the goods and intended use are eligible",
          ar: "إدخال مؤقت فقط عند أهلية البضاعة والغرض المقصود",
        },
        {
          en: "Country acceptance and permitted use vary; confirm before dispatch",
          ar: "يختلف قبول البلدان والاستخدام المسموح؛ أكّد ذلك قبل الإرسال",
        },
        {
          en: "A recognized guarantee mechanism, subject to shipment acceptance and issuing terms",
          ar: "آلية ضمان معترف بها، وفق قبول الشحنة وشروط جهة الإصدار",
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
          en: "International ATA guidance describes broad categories such as exhibition goods, professional equipment and commercial samples. That global description does not establish Saudi eligibility for every category: confirm the destination, intended use and specific items with the authorized issuing association and customs authorities. Consumables, giveaways or goods to be sold or left behind may require another import procedure.",
          ar: "تذكر الإرشادات الدولية لكارنيه ATA فئات عامة مثل بضائع المعارض والمعدات المهنية والعينات التجارية. ولا تثبت هذه الفئات العالمية أهلية جميع الأصناف في السعودية؛ لذا أكّد الوجهة والغرض والأصناف المحددة مع جهة الإصدار المخوّلة والسلطات الجمركية. وقد تحتاج المواد الاستهلاكية والهدايا والبضائع المعدة للبيع أو التي ستُترك إلى إجراء استيراد آخر.",
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
        en: "How ENVOD coordinates your ATA Carnet shipment",
        ar: "كيف تنسّق إنفود شحنتك بكارنيه ATA",
      },
      paragraphs: [
        {
          en: "Before dispatch, check that the item list, values and serial numbers match the goods, and confirm the validity period, required endorsements and re-export deadline. ENVOD can coordinate shipment information and document checks; the holder remains responsible for the Carnet, while the issuing association and customs authorities determine issuance, acceptance and discharge.",
          ar: "قبل الإرسال، تحقّق من تطابق قائمة الأصناف والقيم والأرقام التسلسلية مع البضائع، وأكّد مدة الصلاحية والتصديقات المطلوبة وموعد إعادة التصدير. يمكن لإنفود تنسيق معلومات الشحنة ومراجعة المستندات؛ ويظل حامل الكارنيه مسؤولاً عنه، بينما تحدد جهة الإصدار والسلطات الجمركية الإصدار والقبول والإبراء.",
        },
      ],
      bullets: [
        {
          en: "Eligibility review and accurate general list of goods with values",
          ar: "مراجعة الأهلية وإعداد قائمة عامة دقيقة للبضائع بقيمها",
        },
        {
          en: "Issuance and guarantee requirements confirmed with the authorized association",
          ar: "تأكيد متطلبات الإصدار والضمان مع الجهة المخوّلة",
        },
        {
          en: "Customs endorsement at export, import, re-export and re-import",
          ar: "التصديق الجمركي عند التصدير والاستيراد وإعادة التصدير وإعادة الاستيراد",
        },
        {
          en: "Keep endorsement and re-export evidence for the issuing association's discharge review",
          ar: "الاحتفاظ بإثباتات التصديق وإعادة التصدير لمراجعة الإبراء لدى جهة الإصدار",
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
          en: "An ATA shipment involves separate responsibilities for the holder, issuing association, carrier, customs broker and authorities. ENVOD can review the requested transport and document-coordination scope; confirm who issues the Carnet, who files declarations and who obtains any approvals before booking.",
          ar: "تتضمن شحنة ATA مسؤوليات منفصلة لحامل الكارنيه وجهة الإصدار والناقل والمخلّص والسلطات. يمكن لإنفود مراجعة نطاق النقل وتنسيق المستندات المطلوب؛ أكّد جهة إصدار الكارنيه والجهة التي تقدم الإقرارات وتحصل على أي موافقات قبل الحجز.",
        },
      ],
      bullets: [
        {
          en: "Documentation and deadline planning for time-critical shipments",
          ar: "تخطيط المستندات والمواعيد للشحنات الحسّاسة للوقت",
        },
        {
          en: "Shipment, customs and document responsibilities scoped before booking",
          ar: "تحديد مسؤوليات الشحنة والجمارك والمستندات قبل الحجز",
        },
        {
          en: "Coordination with the authorized issuing association and responsible authorities",
          ar: "التنسيق مع جهة الإصدار المخوّلة والسلطات المسؤولة",
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
