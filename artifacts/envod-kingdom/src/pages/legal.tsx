import { Link } from "wouter";
import { useLanguage } from "@/lib/language-context";

type LegalPageKind = "privacy" | "terms" | "cookies";
type LegalSection = { heading: string; paragraphs: string[] };
type LocalizedDocument = {
  title: string;
  intro: string;
  sections: LegalSection[];
};

const DOCUMENTS: Record<LegalPageKind, { en: LocalizedDocument; ar: LocalizedDocument }> = {
  privacy: {
    en: {
      title: "Privacy Notice",
      intro:
        "This notice explains how ENVOD KINGDOM SHIPPING SERVICES LLC handles information submitted through this website.",
      sections: [
        {
          heading: "Information you provide",
          paragraphs: [
            "Contact and quote forms may ask for your name, company, email address, telephone number, requested service, shipment origin and destination, cargo details, and message.",
            "Please do not submit passwords, payment-card details, government identifiers, or other sensitive information through these forms.",
          ],
        },
        {
          heading: "How we use it",
          paragraphs: [
            "We use enquiry information to review your request, contact you, and prepare a response or quotation. Form submissions are delivered to our team by email through Resend, our email delivery provider; the site does not store enquiry records in an application database.",
            "The form service also processes technical request information, such as an IP address, briefly in memory to limit automated abuse.",
          ],
        },
        {
          heading: "Retention and sharing",
          paragraphs: [
            "Enquiry information may remain in our business email systems for the time needed to respond and maintain relevant business records. Resend processes the information to deliver the email under its own service terms and privacy practices.",
            "We do not sell form information. We may disclose it when required by law or when needed to protect our rights and systems.",
          ],
        },
        {
          heading: "Your choices and contact",
          paragraphs: [
            "To request access, correction, or deletion of information you submitted, contact info@envodkingdom.net and include enough detail for us to locate the enquiry. We will handle requests under applicable requirements.",
          ],
        },
      ],
    },
    ar: {
      title: "إشعار الخصوصية",
      intro:
        "يوضح هذا الإشعار كيفية تعامل شركة إنفود كينغدوم لخدمات الشحن ذ.م.م مع المعلومات المقدمة عبر هذا الموقع.",
      sections: [
        {
          heading: "المعلومات التي تقدمها",
          paragraphs: [
            "قد تطلب نماذج التواصل وطلب التسعير اسمك واسم الشركة والبريد الإلكتروني ورقم الهاتف والخدمة المطلوبة ومنشأ الشحنة ووجهتها وتفاصيل البضاعة والرسالة.",
            "يرجى عدم إرسال كلمات المرور أو بيانات بطاقات الدفع أو أرقام الهوية الحكومية أو أي معلومات حساسة أخرى عبر هذه النماذج.",
          ],
        },
        {
          heading: "كيفية استخدام المعلومات",
          paragraphs: [
            "نستخدم بيانات الاستفسار لمراجعة طلبك والتواصل معك وإعداد رد أو عرض سعر. تُرسل النماذج إلى فريقنا عبر البريد الإلكتروني باستخدام Resend، مزود خدمة توصيل البريد الإلكتروني؛ ولا يحتفظ الموقع بسجلات الاستفسارات في قاعدة بيانات للتطبيق.",
            "تعالج خدمة النماذج أيضاً بعض البيانات التقنية، مثل عنوان IP، لفترة وجيزة في الذاكرة للحد من الإرسال الآلي المسيء.",
          ],
        },
        {
          heading: "الاحتفاظ بالمعلومات ومشاركتها",
          paragraphs: [
            "قد تبقى بيانات الاستفسار في أنظمة البريد الإلكتروني الخاصة بأعمالنا للمدة اللازمة للرد والاحتفاظ بسجلات العمل ذات الصلة. وتعالج Resend المعلومات لإيصال البريد وفق شروط الخدمة وممارسات الخصوصية الخاصة بها.",
            "لا نبيع بيانات النماذج. وقد نفصح عنها إذا أوجب النظام ذلك أو عند الحاجة لحماية حقوقنا وأنظمتنا.",
          ],
        },
        {
          heading: "خياراتك والتواصل",
          paragraphs: [
            "لطلب الاطلاع على المعلومات التي أرسلتها أو تصحيحها أو حذفها، راسل info@envodkingdom.net مع تفاصيل كافية للعثور على الاستفسار. سنتعامل مع الطلب وفق المتطلبات المعمول بها.",
          ],
        },
      ],
    },
  },
  terms: {
    en: {
      title: "Terms of Use",
      intro:
        "These terms apply to your use of the ENVOD KINGDOM website. A logistics service is governed by its separate written quotation and agreement.",
      sections: [
        {
          heading: "Website information",
          paragraphs: [
            "The website is provided for general company and service information. Details may change, and content on the site is not itself a binding offer, service guarantee, or confirmed quotation.",
            "Service scope, price, documentation, timing, and responsibilities are confirmed in a written quotation or service agreement for the specific shipment.",
          ],
        },
        {
          heading: "External services and links",
          paragraphs: [
            "The site may link to third-party websites or services. We do not control their content, availability, or privacy practices.",
          ],
        },
        {
          heading: "Contact",
          paragraphs: [
            "For questions about these website terms, contact info@envodkingdom.net.",
          ],
        },
      ],
    },
    ar: {
      title: "شروط استخدام الموقع",
      intro:
        "تسري هذه الشروط على استخدامك لموقع إنفود كينغدوم. وتخضع الخدمات اللوجستية لعرض السعر والاتفاق المكتوب الخاص بها.",
      sections: [
        {
          heading: "معلومات الموقع",
          paragraphs: [
            "يُقدّم الموقع معلومات عامة عن الشركة وخدماتها. وقد تتغير التفاصيل، ولا يُعد المحتوى بحد ذاته عرضاً ملزماً أو ضماناً للخدمة أو عرض سعر مؤكداً.",
            "يتم تأكيد نطاق الخدمة والسعر والمستندات والمدة والمسؤوليات في عرض سعر أو اتفاق خدمة مكتوب للشحنة المعنية.",
          ],
        },
        {
          heading: "الخدمات والروابط الخارجية",
          paragraphs: [
            "قد يتضمن الموقع روابط إلى مواقع أو خدمات تابعة لأطراف أخرى. ولا نتحكم في محتواها أو توفرها أو ممارسات الخصوصية لديها.",
          ],
        },
        {
          heading: "التواصل",
          paragraphs: [
            "للاستفسار عن شروط استخدام الموقع، راسل info@envodkingdom.net.",
          ],
        },
      ],
    },
  },
  cookies: {
    en: {
      title: "Cookie Notice",
      intro:
        "This notice describes the website's current use of cookies and similar browser storage.",
      sections: [
        {
          heading: "Current use",
          paragraphs: [
            "The current site build does not intentionally set analytics or advertising cookies. It does not include Google Analytics or an advertising pixel. The website may use essential browser functions, and your browser may store data when you follow a third-party link.",
          ],
        },
        {
          heading: "Third-party resources",
          paragraphs: [
            "Some pages load font files from Google Fonts. Requests to third-party resources are subject to the provider's own policies. We will update this notice if the site's tracking or cookie use changes.",
          ],
        },
        {
          heading: "Contact",
          paragraphs: [
            "Questions about this notice can be sent to info@envodkingdom.net.",
          ],
        },
      ],
    },
    ar: {
      title: "إشعار ملفات تعريف الارتباط",
      intro:
        "يوضح هذا الإشعار الاستخدام الحالي لملفات تعريف الارتباط ووسائل التخزين المشابهة في المتصفح.",
      sections: [
        {
          heading: "الاستخدام الحالي",
          paragraphs: [
            "لا يتعمد إصدار الموقع الحالي وضع ملفات تعريف ارتباط للتحليلات أو الإعلانات، ولا يتضمن Google Analytics أو وحدات بكسل إعلانية. وقد يستخدم الموقع وظائف المتصفح الأساسية، كما قد يخزن المتصفح بيانات عند فتح رابط تابع لطرف آخر.",
          ],
        },
        {
          heading: "موارد الجهات الأخرى",
          paragraphs: [
            "تحمّل بعض الصفحات ملفات خطوط من Google Fonts. وتخضع الطلبات إلى الموارد الخارجية لسياسات مزوديها. سنحدّث هذا الإشعار إذا تغير استخدام الموقع للتتبع أو ملفات تعريف الارتباط.",
          ],
        },
        {
          heading: "التواصل",
          paragraphs: [
            "للاستفسار عن هذا الإشعار، راسل info@envodkingdom.net.",
          ],
        },
      ],
    },
  },
};

export default function LegalPage({ page }: { page: LegalPageKind }) {
  const { language, isRtl, t } = useLanguage();
  const document = DOCUMENTS[page][language];

  return (
    <article
      className="min-h-screen bg-background px-4 pb-24 pt-32 text-white"
      dir={isRtl ? "rtl" : "ltr"}
    >
      <div className="mx-auto max-w-3xl">
        <p className="mb-3 text-xs font-black uppercase tracking-[0.2em] text-secondary">
          ENVOD KINGDOM SHIPPING SERVICES LLC
        </p>
        <h1 className="mb-5 text-3xl font-black md:text-4xl">{document.title}</h1>
        <p className="mb-10 text-base leading-8 text-white/65">{document.intro}</p>
        <div className="space-y-8">
          {document.sections.map((section) => (
            <section key={section.heading}>
              <h2 className="mb-3 text-xl font-bold">{section.heading}</h2>
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph} className="mb-3 leading-8 text-white/65">
                  {paragraph}
                </p>
              ))}
            </section>
          ))}
        </div>
        <div className="mt-12 flex flex-wrap gap-5 border-t border-white/10 pt-6 text-sm">
          <Link href="/" className="text-secondary hover:underline">
            {t("Home", "الرئيسية")}
          </Link>
          <Link href="/contact" className="text-secondary hover:underline">
            {t("Contact us", "اتصل بنا")}
          </Link>
        </div>
      </div>
    </article>
  );
}
