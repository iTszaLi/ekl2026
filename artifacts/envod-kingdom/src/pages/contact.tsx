import React, { useState } from "react";
import { useLanguage } from "@/lib/language-context";
import { buildQuoteMailto, CONTACT_EMAIL, CONTACT_WHATSAPP } from "@/lib/quote-mailto";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MapPin,
  Phone,
  Printer,
  Mail,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
} from "lucide-react";

type FieldKey = "name" | "company" | "email" | "phone" | "service" | "message";

const SERVICES: { value: string; en: string; ar: string }[] = [
  { value: "Customs Clearance", en: "Customs Clearance", ar: "التخليص الجمركي" },
  { value: "Ocean & Sea Freight", en: "Ocean & Sea Freight", ar: "الشحن البحري" },
  { value: "Air Freight", en: "Air Freight", ar: "الشحن الجوي" },
  { value: "GCC Transportation", en: "GCC Transportation", ar: "النقل داخل دول الخليج" },
  { value: "Exhibition Logistics", en: "Exhibition Logistics", ar: "الخدمات اللوجستية للمعارض" },
  { value: "ATA Carnet Services", en: "ATA Carnet Services", ar: "خدمات دفتر ATA" },
  { value: "Project Cargo", en: "Project Cargo", ar: "شحن المشاريع" },
  { value: "Warehousing & Distribution", en: "Warehousing & Distribution", ar: "التخزين والتوزيع" },
  { value: "Freight Forwarding", en: "Freight Forwarding", ar: "التوكيل الملاحي" },
  { value: "RoRo Shipping", en: "RoRo Shipping", ar: "الشحن الدحرجي (رورو)" },
  { value: "Door-to-Door Logistics", en: "Door-to-Door Logistics", ar: "الخدمات من الباب إلى الباب" },
  { value: "Cross-Border Transportation", en: "Cross-Border Transportation", ar: "النقل عبر الحدود" },
  { value: "Temporary Import & Export", en: "Temporary Import & Export", ar: "الاستيراد والتصدير المؤقت" },
  { value: "Event Logistics", en: "Event Logistics", ar: "الخدمات اللوجستية للفعاليات" },
  { value: "Other", en: "Other", ar: "أخرى" },
];

const EMPTY = { name: "", company: "", email: "", phone: "", service: "", message: "" };

export default function Contact() {
  const { t, isRtl } = useLanguage();

  const [values, setValues] = useState<Record<FieldKey, string>>({ ...EMPTY });
  const [errors, setErrors] = useState<Partial<Record<FieldKey, string>>>({});
  const [honeypot, setHoneypot] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  const setField = (key: FieldKey, val: string) => {
    setValues((prev) => ({ ...prev, [key]: val }));
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const validate = (): boolean => {
    const e: Partial<Record<FieldKey, string>> = {};
    if (!values.name.trim()) e.name = t("Please enter your name.", "الرجاء إدخال اسمك.");
    if (!values.email.trim()) {
      e.email = t("Please enter your email address.", "الرجاء إدخال بريدك الإلكتروني.");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
      e.email = t("Please enter a valid email address.", "الرجاء إدخال بريد إلكتروني صحيح.");
    }
    if (!values.phone.trim()) e.phone = t("Please enter your phone number.", "الرجاء إدخال رقم هاتفك.");
    if (!values.service) e.service = t("Please select a service.", "الرجاء اختيار خدمة.");
    if (!values.message.trim()) e.message = t("Please enter your message.", "الرجاء إدخال رسالتك.");
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (ev: React.FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    if (honeypot) {
      setShowSuccess(true);
      return;
    }
    if (!validate()) return;
    window.location.href = buildQuoteMailto([
      { label: "Customer Name", value: values.name },
      { label: "Company", value: values.company },
      { label: "Email", value: values.email },
      { label: "Phone", value: values.phone },
      { label: "Service Required", value: values.service },
      { label: "Message", value: values.message },
    ]);
    setShowSuccess(true);
  };

  const resetForm = () => {
    setValues({ ...EMPTY });
    setErrors({});
    setHoneypot("");
    setShowSuccess(false);
  };

  const fieldClass = (hasError: boolean) =>
    `w-full h-12 px-4 rounded-xl bg-[#0a1526] border text-white text-[15px] placeholder:text-white/30 outline-none focus:ring-2 transition-all duration-200 ${
      hasError
        ? "border-red-500/60 focus:border-red-500/70 focus:ring-red-500/25"
        : "border-white/10 hover:border-white/20 focus:border-secondary/60 focus:ring-secondary/30"
    }`;

  const contactCards = [
    {
      icon: MapPin,
      title: t("Head Office", "المقر الرئيسي"),
      lines: [
        "Prince Mansour Bin Abdulaziz Street, Al Malaz District, Riyadh 12831",
        "P.O. Box 2383, Saudi Arabia",
      ],
    },
    {
      icon: Phone,
      title: t("Phone & WhatsApp", "الهاتف والواتساب"),
      lines: ["+966 50 226 0256"],
      ltr: true,
    },
    {
      icon: Printer,
      title: t("Fax", "فاكس"),
      lines: ["+966 11 238 0517"],
      ltr: true,
    },
    {
      icon: Mail,
      title: t("Email", "البريد الإلكتروني"),
      lines: ["info@envodkingdom.net"],
      ltr: true,
    },
  ];

  return (
    <div className="pt-24 pb-24 min-h-screen bg-background">
      <div className="container mx-auto px-4">
        {/* Heading */}
        <div className="max-w-3xl mx-auto text-center mb-14">
          <span className="inline-block text-secondary text-xs font-black uppercase tracking-[0.3em] mb-4">
            {t("Contact Us", "اتصل بنا")}
          </span>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-5 leading-tight">
            {t("Let's Move Your Business Forward", "لننقل عملك إلى الأمام")}
          </h1>
          <p className="text-lg text-white/60">
            {t(
              "Request a quote, ask a question, or tell us how we can support your logistics operations. Our team responds promptly.",
              "اطلب عرض سعر، اطرح سؤالاً، أو أخبرنا كيف يمكننا دعم عملياتك اللوجستية. يستجيب فريقنا بسرعة.",
            )}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-10 max-w-6xl mx-auto">
          {/* Left — contact info */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-bold text-white mb-6">{t("Get in Touch", "تواصل معنا")}</h2>
            <div className="space-y-4">
              {contactCards.map((c) => (
                <div
                  key={c.title}
                  className="flex items-start gap-4 p-5 rounded-2xl bg-[#0a1526] border border-white/10 hover:border-secondary/30 transition-colors duration-300"
                >
                  <div className="w-11 h-11 rounded-xl bg-secondary/10 border border-secondary/20 flex items-center justify-center shrink-0">
                    <c.icon className="text-secondary w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-white font-semibold text-[15px] mb-1">{c.title}</h3>
                    {c.lines.map((line) => (
                      <p
                        key={line}
                        className="text-white/55 text-[14px] leading-relaxed"
                        dir={c.ltr ? "ltr" : undefined}
                        style={c.ltr && isRtl ? { textAlign: "right" } : undefined}
                      >
                        {line}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-5 rounded-2xl bg-gradient-to-br from-secondary/15 to-transparent border border-secondary/20">
              <p className="text-white font-semibold text-[15px] mb-1">
                {t("Working Hours", "ساعات العمل")}
              </p>
              <p className="text-white/60 text-[14px]">
                {t("Sunday – Thursday · 8:00 AM – 6:00 PM", "الأحد – الخميس · 8:00 صباحاً – 6:00 مساءً")}
              </p>
              <p className="text-white/60 text-[14px]">
                {t("Saturday · 9:00 AM – 2:00 PM", "السبت · 9:00 صباحاً – 2:00 مساءً")}
              </p>
              <p className="text-white/60 text-[14px]">
                {t("24/7 shipment tracking & support", "تتبع ودعم الشحنات على مدار الساعة")}
              </p>
            </div>
          </div>

          {/* Right — form / success */}
          <div className="lg:col-span-3">
            <div className="bg-gradient-to-b from-[#0c1a2e] to-[#0a1526] p-6 sm:p-8 md:p-10 rounded-3xl border border-white/10 shadow-2xl">
              {showSuccess ? (
                <div className="py-8 text-center flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full bg-green-500/15 border border-green-500/30 flex items-center justify-center mb-6">
                    <CheckCircle2 className="w-8 h-8 text-green-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-3">
                    {t("Your Email Draft Is Ready", "مسودة بريدك الإلكتروني جاهزة")}
                  </h2>
                  <p className="text-white/60 max-w-md leading-relaxed mb-4">
                    {t(
                      "An email draft with your enquiry details has been opened in your mail app — just press send and our team will get back to you as soon as possible.",
                      "تم فتح مسودة بريد إلكتروني تحتوي على تفاصيل استفسارك في تطبيق البريد لديك — فقط اضغط إرسال وسيتواصل معك فريقنا في أقرب وقت ممكن.",
                    )}
                  </p>
                  <p className="text-white/45 text-[14px] max-w-md leading-relaxed mb-8">
                    {t("If it didn't open, email us directly at ", "إذا لم تُفتح المسودة، راسلنا مباشرة على ")}
                    <a href={`mailto:${CONTACT_EMAIL}`} className="text-secondary hover:underline" dir="ltr">
                      {CONTACT_EMAIL}
                    </a>
                    {t(" or reach us on WhatsApp at ", " أو تواصل معنا عبر واتساب على ")}
                    <a href="https://wa.me/966502260256" target="_blank" rel="noopener noreferrer" className="text-secondary hover:underline" dir="ltr">
                      {CONTACT_WHATSAPP}
                    </a>
                    .
                  </p>
                  <button
                    onClick={resetForm}
                    className="inline-flex items-center gap-2 px-6 h-12 rounded-xl border border-white/15 text-white font-semibold text-[14px] hover:bg-white/5 hover:border-white/25 transition-all duration-200"
                  >
                    {t("Send another message", "إرسال رسالة أخرى")}
                  </button>
                </div>
              ) : (
                <>
                  <h2 className="text-2xl font-bold text-white mb-1.5">
                    {t("Send a Message", "إرسال رسالة")}
                  </h2>
                  <p className="text-white/50 text-[14px] mb-7">
                    {t("Fields marked with * are required.", "الحقول المميزة بعلامة * مطلوبة.")}
                  </p>

                  <form onSubmit={handleSubmit} noValidate className="space-y-5">
                    {/* Honeypot — hidden from users, catches bots */}
                    <div className="absolute w-px h-px overflow-hidden -m-px p-0 border-0" aria-hidden="true">
                      <label htmlFor="company_website">Company website</label>
                      <input
                        id="company_website"
                        name="company_website"
                        type="text"
                        tabIndex={-1}
                        autoComplete="off"
                        value={honeypot}
                        onChange={(e) => setHoneypot(e.target.value)}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label htmlFor="name" className="block text-[13.5px] font-semibold text-white/85 mb-2">
                          {t("Full Name", "الاسم الكامل")} <span className="text-secondary">*</span>
                        </label>
                        <input
                          id="name"
                          name="name"
                          value={values.name}
                          onChange={(e) => setField("name", e.target.value)}
                          aria-invalid={!!errors.name}
                          aria-describedby={errors.name ? "name-error" : undefined}
                          placeholder={t("e.g. Ahmed Al-Saud", "مثال: أحمد آل سعود")}
                          className={fieldClass(!!errors.name)}
                        />
                        {errors.name && (
                          <p id="name-error" className="mt-1.5 text-[12.5px] text-red-400 flex items-center gap-1.5">
                            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                            {errors.name}
                          </p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="company" className="block text-[13.5px] font-semibold text-white/85 mb-2">
                          {t("Company", "الشركة")}
                        </label>
                        <input
                          id="company"
                          name="company"
                          value={values.company}
                          onChange={(e) => setField("company", e.target.value)}
                          placeholder={t("Company name", "اسم الشركة")}
                          className={fieldClass(false)}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label htmlFor="email" className="block text-[13.5px] font-semibold text-white/85 mb-2">
                          {t("Email", "البريد الإلكتروني")} <span className="text-secondary">*</span>
                        </label>
                        <input
                          id="email"
                          name="email"
                          type="email"
                          dir="ltr"
                          value={values.email}
                          onChange={(e) => setField("email", e.target.value)}
                          aria-invalid={!!errors.email}
                          aria-describedby={errors.email ? "email-error" : undefined}
                          placeholder="name@company.com"
                          className={`${fieldClass(!!errors.email)} ${isRtl ? "text-right" : ""}`}
                        />
                        {errors.email && (
                          <p id="email-error" className="mt-1.5 text-[12.5px] text-red-400 flex items-center gap-1.5">
                            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                            {errors.email}
                          </p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="phone" className="block text-[13.5px] font-semibold text-white/85 mb-2">
                          {t("Phone", "رقم الهاتف")} <span className="text-secondary">*</span>
                        </label>
                        <input
                          id="phone"
                          name="phone"
                          type="tel"
                          dir="ltr"
                          value={values.phone}
                          onChange={(e) => setField("phone", e.target.value)}
                          aria-invalid={!!errors.phone}
                          aria-describedby={errors.phone ? "phone-error" : undefined}
                          placeholder="+966 5X XXX XXXX"
                          className={`${fieldClass(!!errors.phone)} ${isRtl ? "text-right" : ""}`}
                        />
                        {errors.phone && (
                          <p id="phone-error" className="mt-1.5 text-[12.5px] text-red-400 flex items-center gap-1.5">
                            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                            {errors.phone}
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label htmlFor="service" className="block text-[13.5px] font-semibold text-white/85 mb-2">
                        {t("Service Interested In", "الخدمة المطلوبة")} <span className="text-secondary">*</span>
                      </label>
                      <Select value={values.service} onValueChange={(v) => setField("service", v)}>
                        <SelectTrigger
                          id="service"
                          aria-invalid={!!errors.service}
                          aria-describedby={errors.service ? "service-error" : undefined}
                          className={`${fieldClass(!!errors.service)} justify-between data-[placeholder]:text-white/30 [&>svg]:opacity-60`}
                        >
                          <SelectValue placeholder={t("Select a service", "اختر خدمة")} />
                        </SelectTrigger>
                        <SelectContent
                          className="bg-[#0b1728] border-white/10 text-white rounded-xl max-h-72"
                          position="popper"
                        >
                          {SERVICES.map((s) => (
                            <SelectItem
                              key={s.value}
                              value={s.value}
                              className="text-white/85 focus:bg-secondary/15 focus:text-white data-[state=checked]:text-white rounded-lg py-2.5 pl-3 pr-8 cursor-pointer"
                            >
                              {t(s.en, s.ar)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.service && (
                        <p id="service-error" className="mt-1.5 text-[12.5px] text-red-400 flex items-center gap-1.5">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          {errors.service}
                        </p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="message" className="block text-[13.5px] font-semibold text-white/85 mb-2">
                        {t("Message", "الرسالة")} <span className="text-secondary">*</span>
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        rows={5}
                        value={values.message}
                        onChange={(e) => setField("message", e.target.value)}
                        aria-invalid={!!errors.message}
                        aria-describedby={errors.message ? "message-error" : undefined}
                        placeholder={t(
                          "Tell us about your shipment, origin & destination, cargo type, and timeline…",
                          "أخبرنا عن شحنتك، نقطة المنشأ والوجهة، نوع البضاعة، والجدول الزمني…",
                        )}
                        className={`w-full px-4 py-3 rounded-xl bg-[#0a1526] border text-white text-[15px] placeholder:text-white/30 outline-none focus:ring-2 transition-all duration-200 resize-none ${
                          errors.message
                            ? "border-red-500/60 focus:border-red-500/70 focus:ring-red-500/25"
                            : "border-white/10 hover:border-white/20 focus:border-secondary/60 focus:ring-secondary/30"
                        }`}
                      />
                      {errors.message && (
                        <p id="message-error" className="mt-1.5 text-[12.5px] text-red-400 flex items-center gap-1.5">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          {errors.message}
                        </p>
                      )}
                    </div>

                    <button
                      type="submit"
                      className="group w-full h-14 rounded-xl bg-secondary hover:bg-secondary/90 text-white font-bold text-[15px] tracking-wide uppercase flex items-center justify-center gap-2.5 shadow-lg shadow-secondary/25 hover:shadow-secondary/40 hover:-translate-y-0.5 transition-all duration-200"
                    >
                      {t("Send Message", "إرسال الرسالة")}
                      <ArrowRight
                        className={`w-4 h-4 transition-transform duration-200 group-hover:translate-x-1 ${
                          isRtl ? "rotate-180 group-hover:-translate-x-1" : ""
                        }`}
                      />
                    </button>

                    <p className="text-center text-white/35 text-[12.5px] pt-1">
                      {t(
                        "Your information is kept confidential and used only to respond to your enquiry.",
                        "معلوماتك سرية وتُستخدم فقط للرد على استفسارك.",
                      )}
                    </p>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
