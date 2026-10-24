import React, { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import { useLanguage } from "@/lib/language-context";
import { CONTACT_EMAIL, CONTACT_PHONE_DISPLAY, CONTACT_WHATSAPP } from "@/lib/quote-mailto";
import { EnquiryApiError, submitEnquiry } from "@/lib/enquiry-api";
import { emitAnalyticsEvent } from "@/lib/analytics";
import { SERVICE_CATALOG, SLUG_TO_ID } from "@/lib/service-data";
import { CommonShipmentFields } from "@/components/CommonShipmentFields";
import { ServiceRequirementFields } from "@/components/ServiceRequirementFields";
import { EMPTY_COMMON_SHIPMENT, ENQUIRY_SERVICES, getEnquiryServiceById, getEnquiryServiceByValue, getEnquiryServiceForCatalogId, getEnquiryServiceFormLabel, OTHER_SERVICE_VALUE, validServiceDetails, type CommonShipmentValues } from "@/lib/enquiry-services";
import { isQuoteCargoValid } from "@/lib/enquiry-cargo-validation";
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

interface ContactValues {
  name: string;
  company: string;
  email: string;
  phone: string;
  service: string;
  requirementsText: string;
  message: string;
}

type FieldKey = keyof ContactValues;
type ValidationKey = FieldKey | "shipmentDetails";

const EMPTY: ContactValues = {
  name: "", company: "", email: "", phone: "", service: "",
  requirementsText: "", message: "",
};

export default function Contact() {
  const { t, isRtl, language } = useLanguage();

  const [values, setValues] = useState<ContactValues>({ ...EMPTY });
  const [errors, setErrors] = useState<Partial<Record<ValidationKey, string>>>({});
  const [shipmentByService, setShipmentByService] = useState<Record<string, CommonShipmentValues>>({});
  const [serviceDetailsByService, setServiceDetailsByService] = useState<Record<string, Record<string, string>>>({});
  const serviceDetailsByServiceRef = useRef<Record<string, Record<string, string>>>({});
  const [honeypot, setHoneypot] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [privacyConsent, setPrivacyConsent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submitLock = useRef(false);
  const [submitError, setSubmitError] = useState("");
  const formStarted = useRef(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const slug = params.get("service");
    const selected = slug ? SERVICE_CATALOG.find((item) => item.id === SLUG_TO_ID[slug]) : undefined;
    if (!selected) return;
    const isDoorToDoorEnquiry =
      slug === "freight-forwarding" && params.get("topic") === "door-to-door";
    const option = getEnquiryServiceForCatalogId(selected.id) ?? getEnquiryServiceById("other")!;
    setValues((previous) => ({
      ...previous,
      service: option.en,
      requirementsText: previous.requirementsText.trim() ? previous.requirementsText : language === "ar"
        ? isDoorToDoorEnquiry
          ? "أرغب في الاستفسار عن تنسيق الشحن من الباب إلى الباب."
          : `أرغب في الاستفسار عن: ${selected.nameAr}`
        : isDoorToDoorEnquiry
          ? "I would like to enquire about Door-to-Door Logistics."
          : `I would like to enquire about ${selected.name}.`,
    }));
  }, [language]);

  const setField = (key: FieldKey, val: string) => {
    setValues((prev) => ({ ...prev, [key]: val }));
    setErrors((prev) => {
      const cargoField = ["dimensions", "packageCount", "weightKg", "preferredShippingDate"].includes(key);
      const clearOtherDescriptionError = key === "service" && val !== OTHER_SERVICE_VALUE && !!prev.requirementsText;
      if (!prev[key] && !(cargoField && prev.shipmentDetails) && !clearOtherDescriptionError) return prev;
      const next = { ...prev };
      delete next[key];
      if (cargoField) delete next.shipmentDetails;
      if (clearOtherDescriptionError) delete next.requirementsText;
      return next;
    });
  };

  const validate = (): boolean => {
    const e: Partial<Record<ValidationKey, string>> = {};
    if (!values.name.trim()) e.name = t("Please enter your name.", "الرجاء إدخال اسمك.");
    if (!values.email.trim()) {
      e.email = t("Please enter your email address.", "الرجاء إدخال بريدك الإلكتروني.");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
      e.email = t("Please enter a valid email address.", "الرجاء إدخال بريد إلكتروني صحيح.");
    }
    if (!values.phone.trim()) e.phone = t("Please enter your phone number.", "الرجاء إدخال رقم هاتفك.");
    if (!values.service) e.service = t("Please select a service.", "الرجاء اختيار خدمة.");
    if (values.service === OTHER_SERVICE_VALUE && !values.requirementsText.trim()) {
      e.requirementsText = t("Please describe the logistics service you need.", "يرجى وصف الخدمة اللوجستية التي تحتاج إليها.");
    }
    const serviceId = getEnquiryServiceByValue(values.service)?.id;
    if (serviceId && !isQuoteCargoValid(shipmentByService[serviceId] ?? EMPTY_COMMON_SHIPMENT)) {
      e.shipmentDetails = t(
        "Check the shipment quantities, dimensions, weight and date.",
        "راجع الكميات والأبعاد والوزن وتاريخ الشحنة.",
      );
    }
    if (serviceId && !validServiceDetails(values.service, serviceDetailsByService[serviceId] ?? {})) {
      e.service = t("Please check the optional service details.", "يرجى التحقق من تفاصيل الخدمة الاختيارية.");
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: React.FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    if (submitLock.current || isSubmitting || showSuccess) return;
    if (!validate()) return;
    if (!privacyConsent) {
      setSubmitError(
        t(
          "Please agree to the privacy notice before sending your enquiry.",
          "يرجى الموافقة على إشعار الخصوصية قبل إرسال استفسارك.",
        ),
      );
      return;
    }

    const activeService = getEnquiryServiceByValue(values.service);
    const serviceId = activeService?.id ?? "";
    const shipmentValues = shipmentByService[serviceId] ?? EMPTY_COMMON_SHIPMENT;
    const shipment = Object.fromEntries(
      Object.entries(shipmentValues).filter(([, value]) => value.trim().length > 0),
    ) as Partial<CommonShipmentValues>;
    const activeServiceDetails = Object.fromEntries(
      Object.entries(serviceDetailsByServiceRef.current[serviceId] ?? {})
        .filter(([, value]) => value.trim().length > 0),
    );

    submitLock.current = true;
    setIsSubmitting(true);
    setSubmitError("");
    try {
      await submitEnquiry({
        formType: "contact",
        language,
        name: values.name,
        company: values.company,
        email: values.email,
        phone: values.phone,
        service: values.service,
        ...shipment,
        requirementsText: values.requirementsText,
        serviceDetails: activeServiceDetails,
        message: values.message,
        privacyConsent: true,
        website: honeypot,
      });
      emitAnalyticsEvent("contact_form_submit_success", {
        page_path: window.location.pathname,
        language,
        service_category: values.service,
        cta_location: "contact_form",
      });
      setShowSuccess(true);
    } catch (error) {
      emitAnalyticsEvent("contact_form_submit_failure", {
        page_path: window.location.pathname,
        language,
        service_category: values.service,
        cta_location: "contact_form",
      });
      setSubmitError(
        error instanceof EnquiryApiError && error.rateLimited
          ? t("Too many attempts. Please wait before retrying, or contact us by phone or WhatsApp.", "محاولات كثيرة. يرجى الانتظار قبل المحاولة مجدداً، أو التواصل معنا هاتفياً أو عبر واتساب.")
          : t(
          "Your enquiry could not be sent. Please try again or contact us directly.",
          "تعذر إرسال استفسارك. يرجى المحاولة مرة أخرى أو التواصل معنا مباشرة.",
        ),
      );
    } finally {
      submitLock.current = false;
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setValues({ ...EMPTY });
    setErrors({});
    setServiceDetailsByService({});
    serviceDetailsByServiceRef.current = {};
    setHoneypot("");
    setShowSuccess(false);
    setPrivacyConsent(false);
    setSubmitError("");
    formStarted.current = false;
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
      title: t("Call Us", "اتصل بنا"),
      lines: [CONTACT_PHONE_DISPLAY],
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
    <div className="pt-32 pb-24 min-h-screen bg-background sm:pt-24">
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
              "Request a quote, ask a question, or share your shipment details for assessment.",
              "اطلب عرض سعر أو اطرح سؤالاً أو أرسل تفاصيل شحنتك لتقييمها.",
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
                {t("Office Hours", "ساعات عمل المكتب")}
              </p>
              <p className="text-white/60 text-[14px]">
                {t("Sunday–Thursday · 8:00 AM–6:00 PM", "الأحد–الخميس · 8:00 صباحاً–6:00 مساءً")}
              </p>
              <p className="text-white/60 text-[14px]">
                {t("Saturday · 9:00 AM–2:00 PM", "السبت · 9:00 صباحاً–2:00 مساءً")}
              </p>
              <p className="text-white/60 text-[14px]">
                {t("Friday · Closed", "الجمعة · مغلق")}
              </p>
              <p className="text-white/45 text-[12px]">
                {t("Saudi Arabia local time (AST, UTC+3)", "التوقيت المحلي للمملكة العربية السعودية (AST، UTC+3)")}
              </p>
              <p className="text-white/60 text-[14px]">
                {t("Shipment status enquiries", "استفسارات حالة الشحنات")}
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
                    {t("Your Enquiry Was Accepted", "تم قبول استفسارك")}
                  </h2>
                  <p className="text-white/60 max-w-md leading-relaxed mb-4">
                    {t(
                      "The email provider accepted your enquiry for processing. Acceptance does not confirm inbox delivery.",
                      "قبل مزوّد البريد استفسارك للمعالجة. القبول لا يؤكد الوصول إلى صندوق البريد.",
                    )}
                  </p>
                  <p className="text-white/45 text-[14px] max-w-md leading-relaxed mb-8">
                    {t("You can also email us at ", "يمكنك أيضاً مراسلتنا على ")}
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

                    <form
                      onSubmit={handleSubmit}
                      onFocusCapture={() => {
                        if (!formStarted.current) {
                          formStarted.current = true;
                          emitAnalyticsEvent("contact_form_start", {
                            page_path: window.location.pathname,
                            language,
                            cta_location: "contact_form",
                          });
                        }
                      }}
                      noValidate
                      className="space-y-5"
                    >
                    <h3 className="text-base font-bold text-white">{t("Contact details", "معلومات التواصل")}</h3>
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
                      <Select value={values.service} onValueChange={(v) => { if (v) setField("service", v); }}>
                        <SelectTrigger
                          id="service"
                          aria-invalid={!!errors.service}
                          aria-describedby={errors.service ? "service-error" : undefined}
                          className={`${fieldClass(!!errors.service)} justify-between data-[placeholder]:text-white/30 [&>svg]:opacity-60`}
                        >
                          <SelectValue placeholder={t("Select a service", "اختر خدمة")} />
                        </SelectTrigger>
                        <SelectContent
                          className="bg-[#0b1728] border-white/10 text-white rounded-xl"
                          position="popper"
                          sideOffset={4}
                          collisionPadding={12}
                        >
                          {ENQUIRY_SERVICES.map((s) => (
                            <SelectItem
                              key={s.id}
                              value={s.en}
                              className="text-white/85 focus:bg-secondary/15 focus:text-white data-[state=checked]:text-white rounded-lg py-2.5 pl-3 pr-8 cursor-pointer"
                            >
                              {t(getEnquiryServiceFormLabel(s, "en"), getEnquiryServiceFormLabel(s, "ar"))}
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

                    <section aria-labelledby="shipment-details-heading" className="space-y-4">
                      <h3 id="shipment-details-heading" className="text-base font-bold text-white">{t("Shipment or project details", "تفاصيل الشحنة أو المشروع")}</h3>
                      {(() => {
                        const selectedService = getEnquiryServiceByValue(values.service);
                        if (!selectedService) {
                          return <p className="text-sm text-white/45">{t("Select a service to see relevant optional questions.", "اختر الخدمة لعرض الأسئلة الاختيارية المناسبة.")}</p>;
                        }
                        const shipment = shipmentByService[selectedService.id] ?? EMPTY_COMMON_SHIPMENT;
                        return (
                          <>
                            <CommonShipmentFields
                              serviceId={selectedService.id}
                              values={shipment}
                              onChange={(key, value) => {
                                setShipmentByService((previous) => ({
                                  ...previous,
                                  [selectedService.id]: { ...(previous[selectedService.id] ?? EMPTY_COMMON_SHIPMENT), [key]: value },
                                }));
                                setErrors((previous) => {
                                  if (!previous.shipmentDetails) return previous;
                                  const next = { ...previous };
                                  delete next.shipmentDetails;
                                  return next;
                                });
                              }}
                              idPrefix="contact"
                              fieldClass={fieldClass(false)}
                              labelClass="block text-[13.5px] font-semibold text-white/85 mb-2"
                              errorId={errors.shipmentDetails ? "contact-shipment-error" : undefined}
                            />
                            {errors.shipmentDetails && <p id="contact-shipment-error" role="alert" className="text-xs text-red-300">{errors.shipmentDetails}</p>}
                            <ServiceRequirementFields
                              serviceId={selectedService.id}
                              values={serviceDetailsByService[selectedService.id] ?? {}}
                              onChange={(fieldId, value) => {
                                const next = {
                                  ...serviceDetailsByServiceRef.current,
                                  [selectedService.id]: {
                                    ...(serviceDetailsByServiceRef.current[selectedService.id] ?? {}),
                                    [fieldId]: value,
                                  },
                                };
                                serviceDetailsByServiceRef.current = next;
                                console.log("DETAILS_REF_CHANGE", selectedService.id, fieldId, value);
                                setServiceDetailsByService(next);
                                setErrors((previous) => {
                                  if (!previous.service) return previous;
                                  const next = { ...previous };
                                  delete next.service;
                                  return next;
                                });
                              }}
                              idPrefix="contact-service"
                              fieldClass={fieldClass(false)}
                              labelClass="block text-[13.5px] font-semibold text-white/85 mb-2"
                            />
                          </>
                        );
                      })()}
                    </section>

                    <section aria-labelledby="additional-requirements-heading" className="space-y-4">
                      <h3 id="additional-requirements-heading" className="text-base font-bold text-white">{t("Additional requirements", "متطلبات إضافية")}</h3>
                      <div>
                        <label htmlFor="requirementsText" className="block text-[13.5px] font-semibold text-white/85 mb-2">
                          {t("Tell us about your requirements", "أخبرنا عن متطلباتك")}
                          {values.service === OTHER_SERVICE_VALUE
                            ? <span className="text-secondary"> *</span>
                            : <span className="ml-1 font-normal text-white/45">({t("optional", "اختياري")})</span>}
                        </label>
                        <textarea
                          id="requirementsText"
                          name="requirementsText"
                          rows={5}
                          maxLength={4000}
                          value={values.requirementsText}
                          onChange={(event) => setField("requirementsText", event.target.value)}
                          aria-invalid={!!errors.requirementsText}
                          aria-describedby={errors.requirementsText ? "requirementsText-error" : undefined}
                          placeholder={t(
                            "Describe what you need, your cargo or goods, quantities, locations, deadlines, and any special requirements.",
                            "اشرح ما تحتاج إليه، والبضائع والكميات والمواقع والمواعيد وأي متطلبات خاصة.",
                          )}
                          className={`w-full px-4 py-3 rounded-xl bg-[#0a1526] border text-white text-[15px] placeholder:text-white/30 outline-none focus:ring-2 transition-all duration-200 resize-y ${
                            errors.requirementsText
                              ? "border-red-500/60 focus:border-red-500/70 focus:ring-red-500/25"
                              : "border-white/10 hover:border-white/20 focus:border-secondary/60 focus:ring-secondary/30"
                          }`}
                        />
                        {errors.requirementsText && (
                          <p id="requirementsText-error" role="alert" className="mt-1.5 text-[12.5px] text-red-400 flex items-center gap-1.5">
                            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                            {errors.requirementsText}
                          </p>
                        )}
                      </div>
                      <div>
                        <label htmlFor="additional-notes" className="block text-[13.5px] font-semibold text-white/85 mb-2">
                          {t("Additional notes or special instructions", "ملاحظات إضافية أو تعليمات خاصة")}
                          <span className="ml-1 font-normal text-white/45">({t("optional", "اختياري")})</span>
                        </label>
                        <textarea
                          id="additional-notes"
                          name="message"
                          rows={3}
                          maxLength={4000}
                          value={values.message}
                          onChange={(event) => setField("message", event.target.value)}
                          className="w-full px-4 py-3 rounded-xl bg-[#0a1526] border border-white/10 text-white text-[15px] placeholder:text-white/30 outline-none focus:ring-2 focus:border-secondary/60 focus:ring-secondary/30 transition-all duration-200 resize-y"
                        />
                      </div>
                    </section>

                    <div>
                      <label className="flex items-start gap-3 text-[13px] leading-relaxed text-white/60">
                        <input
                          type="checkbox"
                          checked={privacyConsent}
                          onChange={(event) => {
                            setPrivacyConsent(event.target.checked);
                            setSubmitError("");
                          }}
                          required
                          className="mt-1 accent-secondary"
                        />
                        <span>
                          {t(
                            "I agree that ENVOD KINGDOM may use these details to respond to my enquiry.",
                            "أوافق على استخدام إنفود كينغدوم لهذه البيانات للرد على استفساري.",
                          )}
                        </span>
                      </label>
                      <Link
                        href="/privacy-policy"
                        className="ms-7 mt-1 inline-flex text-xs font-semibold text-secondary underline decoration-secondary/40 underline-offset-4 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary"
                      >
                        {t("Privacy Notice", "إشعار الخصوصية")}
                      </Link>
                    </div>

                    {submitError && (
                      <p role="alert" className="text-[13px] text-red-300">
                        {submitError}
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="group w-full h-14 rounded-xl bg-secondary hover:bg-secondary/90 disabled:opacity-60 disabled:cursor-wait text-white font-bold text-[15px] tracking-wide uppercase flex items-center justify-center gap-2.5 shadow-lg shadow-secondary/25 hover:shadow-secondary/40 hover:-translate-y-0.5 transition-all duration-200"
                    >
                      {isSubmitting
                        ? t("Sending…", "جارٍ الإرسال…")
                        : t("Send Message", "إرسال الرسالة")}
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
