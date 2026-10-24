import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight, ArrowLeft, CheckCircle2 } from "lucide-react";
import { useLanguage } from "@/lib/language-context";
import { CONTACT_EMAIL, CONTACT_WHATSAPP } from "@/lib/quote-mailto";
import { EnquiryApiError, submitEnquiry } from "@/lib/enquiry-api";
import { emitAnalyticsEvent } from "@/lib/analytics";
import { isQuoteCargoValid } from "@/lib/enquiry-cargo-validation";
import { ServiceRequirementFields } from "@/components/ServiceRequirementFields";
import { ENQUIRY_SERVICES, getEnquiryServiceByValue, getEnquiryServiceFormLabel, OTHER_SERVICE_VALUE } from "@/lib/enquiry-services";
import { CommonShipmentFields } from "@/components/CommonShipmentFields";
import { EMPTY_COMMON_SHIPMENT, type CommonShipmentValues } from "@/lib/enquiry-services";

interface FormData {
  serviceType: string;
  eventDetails: string;
  requirementsText: string;
  shipmentByService: Record<string, CommonShipmentValues>;
  serviceDetails: Record<string, Record<string, string>>;
  name: string;
  company: string;
  email: string;
  phone: string;
  message: string;
}

const EMPTY: FormData = {
  serviceType: "", eventDetails: "", requirementsText: "",
  shipmentByService: {}, serviceDetails: {},
  name: "", company: "", email: "", phone: "", message: "",
};

interface Props { isOpen: boolean; onClose: () => void; }

const slide = {
  initial: (dir: number) => ({ opacity: 0, x: dir * 32 }),
  animate: { opacity: 1, x: 0 },
  exit:    (dir: number) => ({ opacity: 0, x: dir * -32 }),
};

export function QuoteModal({ isOpen, onClose }: Props) {
  const { t, isRtl, language } = useLanguage();
  const [step, setStep]   = useState(1);
  const [dir,  setDir]    = useState(1);
  const [data, setData]   = useState<FormData>(EMPTY);
  const [done, setDone]   = useState(false);
  const [privacyConsent, setPrivacyConsent] = useState(false);
  const [honeypot, setHoneypot] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [cargoError, setCargoError] = useState("");
  const [requirementsError, setRequirementsError] = useState("");
  const quoteWasOpen = useRef(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const requestPending = useRef(false);

  useEffect(() => {
    if (!isOpen) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const timer = window.setTimeout(() => dialogRef.current?.querySelector<HTMLButtonElement>("button")?.focus(), 0);
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        handleClose();
      }
      if (event.key !== "Tab") return;
      const controls = Array.from(dialogRef.current?.querySelectorAll<HTMLElement>(
        'button:not(:disabled),a[href],input:not(:disabled),textarea:not(:disabled),[tabindex="0"]',
      ) ?? []).filter((element) => element.offsetParent !== null && element.tabIndex >= 0);
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus();
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && !quoteWasOpen.current) {
      quoteWasOpen.current = true;
      emitAnalyticsEvent("quote_form_start", {
        page_path: window.location.pathname,
        language,
        cta_location: "quote_modal",
      });
    } else if (!isOpen) {
      quoteWasOpen.current = false;
    }
  }, [isOpen, language]);

  const goTo = (next: number) => {
    const serviceId = getEnquiryServiceByValue(data.serviceType)?.id;
    const shipment = serviceId ? data.shipmentByService[serviceId] ?? EMPTY_COMMON_SHIPMENT : EMPTY_COMMON_SHIPMENT;
    if (step === 2 && next === 3 && !isQuoteCargoValid(shipment)) {
      setCargoError(t(
        "Check the shipping date and cargo fields. Weight must be a positive number in kg (up to three decimal places); dimensions must be under 160 characters.",
        "راجع تاريخ الشحن وبيانات البضاعة. يجب أن يكون الوزن رقماً موجباً بالكيلوغرام بحد أقصى ثلاث خانات عشرية، وأن تقل الأبعاد عن 160 حرفاً.",
      ));
      return;
    }
    if (step === 2 && next === 3 && data.serviceType === OTHER_SERVICE_VALUE && !data.requirementsText.trim()) {
      setRequirementsError(t(
        "Please describe the logistics service you need.",
        "يرجى وصف الخدمة اللوجستية التي تحتاج إليها.",
      ));
      return;
    }
    setCargoError("");
    setRequirementsError("");
    setDir(next > step ? 1 : -1);
    setStep(next);
  };

  const reset = () => {
    setStep(1);
    setDir(1);
    setData(EMPTY);
    setDone(false);
    setPrivacyConsent(false);
    setHoneypot("");
    setIsSubmitting(false);
    setSubmitError("");
    setCargoError("");
    setRequirementsError("");
  };

  const handleClose = () => {
    if (requestPending.current) return;
    onClose();
    if (resetTimer.current) clearTimeout(resetTimer.current);
    resetTimer.current = setTimeout(reset, 400);
  };

  useEffect(() => {
    if (!isOpen) return;
    if (resetTimer.current) clearTimeout(resetTimer.current);
    reset();
  }, [isOpen]);

  useEffect(() => () => {
    if (resetTimer.current) clearTimeout(resetTimer.current);
  }, []);

  const handleSubmit = async () => {
    if (!privacyConsent || requestPending.current) return;
    requestPending.current = true;
    setIsSubmitting(true);
    setSubmitError("");
    try {
      const serviceId = getEnquiryServiceByValue(data.serviceType)?.id ?? "";
      const shipmentValues = data.shipmentByService[serviceId] ?? EMPTY_COMMON_SHIPMENT;
      const shipment = Object.fromEntries(
        Object.entries(shipmentValues).filter(([, value]) => value.trim().length > 0),
      ) as Partial<CommonShipmentValues>;
      await submitEnquiry({
        formType: "quote",
        language,
        name: data.name,
        company: data.company,
        email: data.email,
        phone: data.phone,
        service: data.serviceType,
        ...shipment,
        eventDetails: data.eventDetails,
        requirementsText: data.requirementsText,
        serviceDetails: data.serviceDetails[serviceId] ?? {},
        message: data.message,
        privacyConsent: true,
        website: honeypot,
      });
      emitAnalyticsEvent("quote_form_submit_success", {
        page_path: window.location.pathname,
        language,
        service_category: data.serviceType,
        cta_location: "quote_modal",
      });
      setDone(true);
    } catch (error) {
      emitAnalyticsEvent("quote_form_submit_failure", {
        page_path: window.location.pathname,
        language,
        service_category: data.serviceType,
        cta_location: "quote_modal",
      });
      setSubmitError(
        error instanceof EnquiryApiError && error.rateLimited
          ? t("Too many attempts. Please wait before retrying, or contact us by phone or WhatsApp.", "محاولات كثيرة. يرجى الانتظار قبل المحاولة مجدداً، أو التواصل معنا هاتفياً أو عبر واتساب.")
          : t(
          "Your request could not be sent. Please try again or contact us directly.",
          "تعذر إرسال طلبك. يرجى المحاولة مرة أخرى أو التواصل معنا مباشرة.",
        ),
      );
    } finally {
      requestPending.current = false;
      setIsSubmitting(false);
    }
  };

  const set = (k: keyof FormData, v: string) => setData(prev => ({ ...prev, [k]: v }));

  const fieldClass = "w-full bg-white/[0.05] border border-white/15 focus:border-secondary/60 text-white text-sm rounded-xl px-4 py-3 outline-none transition-colors placeholder:text-white/30";
  const labelClass = "text-[11px] font-semibold uppercase tracking-wider text-white/45 mb-1.5 block";

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 z-[100] bg-black/75 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 360, damping: 30 }}
            className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-[101] max-w-lg mx-auto max-h-[90dvh] overflow-y-auto"
            role="dialog"
            ref={dialogRef}
            aria-modal="true"
            aria-label={t("Request a shipping quote", "طلب عرض سعر للشحن")}
            dir={isRtl ? "rtl" : "ltr"}
          >
            <div className="relative rounded-2xl overflow-hidden shadow-2xl" style={{ background: "linear-gradient(135deg,#0b1929 0%,#0d2035 100%)", border: "1px solid rgba(255,255,255,0.1)" }}>
              {/* Header */}
              <div className="px-6 pt-6 pb-4 border-b border-white/8 flex items-center justify-between">
                <div>
                  <p className="text-secondary text-[10px] font-bold tracking-[0.35em] uppercase mb-0.5">
                    {t("FREE QUOTE", "عرض سعر مجاني")}
                  </p>
                  <h3 className="text-white font-black text-lg">
                    {done
                      ? t("Request Accepted", "تم قبول الطلب")
                      : step === 1
                        ? t("Select a Service", "اختر الخدمة")
                        : step === 2
                          ? t("Shipment or Project Details", "تفاصيل الشحنة أو المشروع")
                          : t("Contact Details", "معلومات التواصل")}
                  </h3>
                </div>
                <button onClick={handleClose} disabled={isSubmitting} aria-label={t("Close quote form", "إغلاق نموذج عرض السعر")} className="w-9 h-9 rounded-xl flex items-center justify-center bg-white/[0.06] hover:bg-white/[0.12] text-white/60 hover:text-white disabled:opacity-40 transition-all">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Step progress */}
              {!done && (
                <div className="px-6 pt-4 flex items-center gap-2">
                  {[1, 2, 3].map(s => (
                    <div key={s} className={`h-1 rounded-full flex-1 transition-all duration-400 ${s <= step ? "bg-secondary" : "bg-white/10"}`} />
                  ))}
                </div>
              )}

              {/* Body */}
              <div className="px-6 py-5 min-h-[280px] flex flex-col">
                <AnimatePresence mode="wait" custom={dir}>
                  {done ? (
                    <motion.div
                      key="done"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex flex-col items-center justify-center flex-1 text-center gap-4 py-8"
                    >
                      <div className="w-16 h-16 rounded-full bg-green-500/15 border border-green-500/30 flex items-center justify-center">
                        <CheckCircle2 className="w-8 h-8 text-green-400" />
                      </div>
                      <p className="text-white font-bold text-lg">{t("The email provider accepted your request for processing.", "قبل مزوّد البريد طلبك للمعالجة.")}</p>
                      <p className="text-white/40 text-sm max-w-xs">
                        {t("Acceptance does not confirm inbox delivery. You can also email ", "القبول لا يؤكد الوصول إلى صندوق البريد. يمكنك أيضاً مراسلتنا على ")}
                        <a href={`mailto:${CONTACT_EMAIL}`} className="text-secondary hover:underline" dir="ltr">{CONTACT_EMAIL}</a>
                        {t(" or WhatsApp ", " أو واتساب ")}
                        <a href="https://wa.me/966502260256" target="_blank" rel="noopener noreferrer" className="text-secondary hover:underline" dir="ltr">{CONTACT_WHATSAPP}</a>
                        .
                      </p>
                      <button onClick={handleClose} className="mt-2 bg-secondary hover:bg-secondary/85 text-white px-8 py-2.5 rounded-xl font-bold text-sm transition-all">
                        {t("Close", "إغلاق")}
                      </button>
                    </motion.div>
                  ) : step === 1 ? (
                    <motion.div key="s1" custom={dir} variants={slide} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.25, ease: "easeOut" }} className="flex flex-col flex-1 gap-3">
                      <p className="text-white/40 text-xs mb-1">{t("What service do you need?", "ما الخدمة التي تحتاجها؟")}</p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {ENQUIRY_SERVICES.map(s => (
                          <button
                            key={s.id}
                            onClick={() => {
                              setData(previous => ({
                                ...previous,
                                serviceType: s.en,
                              }));
                              setRequirementsError("");
                              goTo(2);
                            }}
                            aria-pressed={data.serviceType === s.en}
                            className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-center transition-all duration-200 hover:-translate-y-0.5 ${data.serviceType === s.en ? "bg-secondary/20 border-secondary text-white" : "bg-white/[0.04] border-white/10 text-white/60 hover:border-secondary/40 hover:text-white"}`}
                          >
                            <span className="text-xl leading-none">{s.icon}</span>
                            <span className="text-[10px] font-semibold leading-tight">{getEnquiryServiceFormLabel(s, isRtl ? "ar" : "en")}</span>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  ) : step === 2 ? (
                    <motion.div key="s2" custom={dir} variants={slide} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.25, ease: "easeOut" }} className="flex flex-col flex-1 gap-4">
                      {(() => {
                        const service = getEnquiryServiceByValue(data.serviceType);
                        if (!service) return null;
                        const shipment = data.shipmentByService[service.id] ?? EMPTY_COMMON_SHIPMENT;
                        return (
                          <>
                            <CommonShipmentFields
                              serviceId={service.id}
                              values={shipment}
                              onChange={(key, value) => {
                                setData((previous) => ({
                                  ...previous,
                                  shipmentByService: {
                                    ...previous.shipmentByService,
                                    [service.id]: { ...(previous.shipmentByService[service.id] ?? EMPTY_COMMON_SHIPMENT), [key]: value },
                                  },
                                }));
                              }}
                              idPrefix="quote"
                              fieldClass={fieldClass}
                              labelClass={labelClass}
                              errorId={cargoError ? "quote-cargo-error" : undefined}
                            />
                            <ServiceRequirementFields
                              serviceId={service.id}
                              values={data.serviceDetails[service.id] ?? {}}
                              onChange={(key, value) => {
                                setData((previous) => ({
                                  ...previous,
                                  serviceDetails: {
                                    ...previous.serviceDetails,
                                    [service.id]: { ...(previous.serviceDetails[service.id] ?? {}), [key]: value },
                                  },
                                }));
                              }}
                              idPrefix="quote-service"
                              fieldClass={fieldClass}
                              labelClass={labelClass}
                            />
                          </>
                        );
                      })()}
                      <div>
                        <label htmlFor="quote-requirements" className={labelClass}>
                          {t("Tell us about your requirements", "أخبرنا عن متطلباتك")}
                          {data.serviceType === OTHER_SERVICE_VALUE
                            ? <span className="ml-1 text-secondary">*</span>
                            : <span className="ml-1 font-normal normal-case text-white/40">({t("optional", "اختياري")})</span>}
                        </label>
                        <p className="mb-1.5 text-[11px] leading-relaxed text-white/45">
                          {t("Describe your cargo, quantity, locations, deadlines or anything else that helps us understand what you need.", "صف شحنتك وكميتها ومواقعها ومواعيدها وأي تفاصيل تساعدنا على فهم احتياجك.")}
                        </p>
                        <textarea
                          id="quote-requirements"
                          rows={4}
                          maxLength={4000}
                          value={data.requirementsText}
                          onChange={(event) => {
                            set("requirementsText", event.target.value);
                            if (event.target.value.trim()) setRequirementsError("");
                          }}
                          aria-invalid={!!requirementsError}
                          aria-describedby={requirementsError ? "quote-requirements-error" : undefined}
                          placeholder={t("Describe what you need, your cargo or goods, quantities, locations, deadlines, and any special requirements.", "اشرح ما تحتاج إليه، والبضائع والكميات والمواقع والمواعيد وأي متطلبات خاصة.")}
                          className={`${fieldClass} min-h-24 resize-y`}
                        />
                        {requirementsError && <p id="quote-requirements-error" role="alert" className="mt-1 text-xs text-red-300">{requirementsError}</p>}
                      </div>
                      <div>
                        <label htmlFor="quote-additional-notes" className={labelClass}>{t("Additional notes or special instructions", "ملاحظات إضافية أو تعليمات خاصة")} <span className="font-normal normal-case text-white/40">({t("optional", "اختياري")})</span></label>
                        <textarea id="quote-additional-notes" rows={3} maxLength={4000} value={data.message} onChange={e => set("message", e.target.value)} className={`${fieldClass} min-h-20 resize-y`} />
                      </div>
                      {cargoError && <p id="quote-cargo-error" role="alert" className="text-xs text-red-300">{cargoError}</p>}
                    </motion.div>
                  ) : (
                    <motion.div key="s3" custom={dir} variants={slide} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.25, ease: "easeOut" }} className="flex flex-col flex-1 gap-3">
                      <input
                        type="text"
                        tabIndex={-1}
                        autoComplete="off"
                        aria-hidden="true"
                        value={honeypot}
                        onChange={(event) => setHoneypot(event.target.value)}
                        className="sr-only"
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className={labelClass}>{t("Full Name", "الاسم الكامل")} *</label>
                          <input value={data.name} onChange={e => set("name", e.target.value)} placeholder={t("Your name", "اسمك")} className={fieldClass} />
                        </div>
                        <div>
                          <label className={labelClass}>{t("Company", "الشركة")}</label>
                          <input value={data.company} onChange={e => set("company", e.target.value)} placeholder={t("Company name", "اسم الشركة")} className={fieldClass} />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className={labelClass}>{t("Email", "البريد الإلكتروني")} *</label>
                          <input type="email" value={data.email} onChange={e => set("email", e.target.value)} placeholder="email@company.com" className={fieldClass} />
                        </div>
                        <div>
                          <label className={labelClass}>{t("Phone / WhatsApp", "هاتف / واتساب")} *</label>
                          <input type="tel" value={data.phone} onChange={e => set("phone", e.target.value)} placeholder="+966 5X XXX XXXX" className={fieldClass} />
                        </div>
                      </div>
                      <div>
                        <label className={labelClass}>{t("Additional Notes", "ملاحظات إضافية")}</label>
                        <textarea value={data.message} onChange={e => set("message", e.target.value)} placeholder={t("Any other details…", "أي تفاصيل أخرى...")} className={`${fieldClass} resize-none h-16`} />
                      </div>
                      <div>
                        <label className="flex items-start gap-2 text-[11px] leading-relaxed text-white/55">
                          <input
                            type="checkbox"
                            checked={privacyConsent}
                            onChange={(event) => setPrivacyConsent(event.target.checked)}
                            required
                            className="mt-0.5 accent-secondary"
                          />
                          <span>
                            {t(
                              "I agree that ENVOD KINGDOM may use these details to respond.",
                              "أوافق على استخدام إنفود كينغدوم لهذه البيانات للرد.",
                            )}
                          </span>
                        </label>
                        <Link
                          href="/privacy-policy"
                          className="ms-6 mt-1 inline-flex text-[11px] font-semibold text-secondary underline decoration-secondary/40 underline-offset-4 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary"
                        >
                          {t("Privacy Notice", "إشعار الخصوصية")}
                        </Link>
                      </div>
                      {submitError && (
                        <p role="alert" className="text-xs text-red-300">
                          {submitError}
                        </p>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Footer nav */}
              {!done && (
                <div className="px-6 pb-5 flex items-center justify-between gap-3 border-t border-white/8 pt-4">
                  <button
                    onClick={() => step > 1 ? goTo(step - 1) : handleClose()}
                    className={`flex items-center gap-1.5 text-sm font-semibold text-white/40 hover:text-white transition-colors ${isRtl ? "flex-row-reverse" : ""}`}
                  >
                    <ArrowLeft className={`w-4 h-4 ${isRtl ? "rotate-180" : ""}`} />
                    {step > 1 ? t("Back", "السابق") : t("Cancel", "إلغاء")}
                  </button>

                  {step < 3 ? (
                    <button
                      onClick={() => goTo(step + 1)}
                      disabled={step === 1 && !data.serviceType}
                      className={`flex items-center gap-2 bg-secondary hover:bg-secondary/85 disabled:opacity-40 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${isRtl ? "flex-row-reverse" : ""}`}
                    >
                      {t("Next", "التالي")}
                      <ArrowRight className={`w-4 h-4 ${isRtl ? "rotate-180" : ""}`} />
                    </button>
                  ) : (
                    <button
                      onClick={handleSubmit}
                      disabled={
                        !data.name.trim() ||
                        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim()) ||
                        data.phone.trim().length < 6 ||
                        !privacyConsent ||
                        isSubmitting
                      }
                      className={`flex items-center gap-2 bg-secondary hover:bg-secondary/85 disabled:opacity-40 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${isRtl ? "flex-row-reverse" : ""}`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      {isSubmitting
                        ? t("Sending…", "جارٍ الإرسال…")
                        : t("Submit Request", "إرسال الطلب")}
                    </button>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
