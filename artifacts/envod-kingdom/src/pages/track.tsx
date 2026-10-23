import React, { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import { useLanguage } from "@/lib/language-context";
import { submitEnquiry } from "@/lib/enquiry-api";
import { emitAnalyticsEvent } from "@/lib/analytics";
import { CONTACT_PHONE_DISPLAY, CONTACT_PHONE_E164 } from "@/lib/quote-mailto";
import { AlertCircle, CheckCircle2, Headset, Mail, PhoneCall, Search } from "lucide-react";

export default function Track() {
  const { t, isRtl, language } = useLanguage();
  const [reference, setReference] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [privacyConsent, setPrivacyConsent] = useState(false);
  const [honeypot, setHoneypot] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const formStarted = useRef(false);

  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("id");
    if (id) setReference(id.slice(0, 160));
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;
    if (
      reference.trim().length < 2 ||
      name.trim().length < 2 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ||
      phone.trim().length < 6 ||
      !privacyConsent
    ) {
      setError(
        t(
          "Enter the reference and valid contact details, then agree to the privacy notice.",
          "أدخل المرجع وبيانات التواصل الصحيحة، ثم وافق على إشعار الخصوصية.",
        ),
      );
      return;
    }

    setIsSubmitting(true);
    setError("");
    try {
      await submitEnquiry({
        formType: "contact",
        language,
        name,
        email,
        phone,
        service: "Shipment status request",
        message: `Shipment or booking reference: ${reference.trim()}`,
        privacyConsent: true,
        website: honeypot,
      });
      emitAnalyticsEvent("contact_form_submit_success", {
        page_path: window.location.pathname,
        language,
        service_category: "shipment_status",
        cta_location: "shipment_status_form",
      });
      setSent(true);
    } catch {
      setError(
        t(
          "We could not send your request. Please try again or contact our team directly.",
          "تعذر إرسال طلبك. يرجى المحاولة مرة أخرى أو التواصل مع فريقنا مباشرة.",
        ),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background px-4 pb-24 pt-32">
      <div className="mx-auto max-w-5xl">
        <header className="mx-auto mb-12 max-w-3xl text-center">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-secondary/30 bg-secondary/10">
            <Headset className="h-7 w-7 text-secondary" />
          </div>
          <p className="mb-3 text-xs font-black uppercase tracking-[0.25em] text-secondary">
            {t("Shipment support", "دعم الشحنات")}
          </p>
          <h1 className="mb-4 text-4xl font-black text-white md:text-5xl">
            {t("Request a Shipment Status Update", "اطلب تحديثاً عن حالة الشحنة")}
          </h1>
          <p className="text-lg leading-relaxed text-muted-foreground">
            {t(
              "This page does not provide live online tracking. Send your booking or shipment reference to our team and we will review your request.",
              "لا توفر هذه الصفحة تتبعاً مباشراً للشحنات عبر الإنترنت. أرسل رقم الحجز أو مرجع الشحنة إلى فريقنا لمراجعة طلبك.",
            )}
          </p>
        </header>

        {sent ? (
          <section
            role="status"
            className="mx-auto max-w-2xl rounded-2xl border border-green-500/25 bg-card p-8 text-center shadow-xl"
          >
            <CheckCircle2 className="mx-auto mb-4 h-12 w-12 text-green-400" />
            <h2 className="mb-3 text-2xl font-bold text-white">
              {t("Your request was sent", "تم إرسال طلبك")}
            </h2>
            <p className="text-muted-foreground">
              {t(
                "Our team received your status request. We will contact you using the details you provided.",
                "استلم فريقنا طلب تحديث الحالة. سنتواصل معك باستخدام البيانات التي قدمتها.",
              )}
            </p>
          </section>
        ) : (
          <form
            onSubmit={handleSubmit}
            onFocusCapture={() => {
              if (!formStarted.current) {
                formStarted.current = true;
                emitAnalyticsEvent("contact_form_start", {
                  page_path: window.location.pathname,
                  language,
                  service_category: "shipment_status",
                  cta_location: "shipment_status_form",
                });
              }
            }}
            noValidate
            className="mx-auto max-w-2xl space-y-5 rounded-2xl border border-white/10 bg-card p-6 shadow-2xl md:p-9"
            dir={isRtl ? "rtl" : "ltr"}
          >
            <div>
              <label htmlFor="shipment-reference" className="mb-2 block font-semibold text-white">
                {t("Booking or shipment reference", "رقم الحجز أو مرجع الشحنة")} *
              </label>
              <div className="relative">
                <Search className={`absolute ${isRtl ? "right-4" : "left-4"} top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground`} />
                <input
                  id="shipment-reference"
                  value={reference}
                  onChange={(event) => setReference(event.target.value)}
                  maxLength={160}
                  autoComplete="off"
                  required
                  className={`h-12 w-full rounded-xl border border-white/10 bg-background text-white outline-none focus:border-secondary ${isRtl ? "pr-12 pl-4" : "pl-12 pr-4"}`}
                />
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="shipment-name" className="mb-2 block font-semibold text-white">
                  {t("Name", "الاسم")} *
                </label>
                <input
                  id="shipment-name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  maxLength={120}
                  autoComplete="name"
                  required
                  className="h-12 w-full rounded-xl border border-white/10 bg-background px-4 text-white outline-none focus:border-secondary"
                />
              </div>
              <div>
                <label htmlFor="shipment-phone" className="mb-2 block font-semibold text-white">
                  {t("Phone / WhatsApp", "الهاتف / واتساب")} *
                </label>
                <input
                  id="shipment-phone"
                  type="tel"
                  dir="ltr"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  maxLength={40}
                  autoComplete="tel"
                  required
                  className="h-12 w-full rounded-xl border border-white/10 bg-background px-4 text-white outline-none focus:border-secondary"
                />
              </div>
            </div>

            <div>
              <label htmlFor="shipment-email" className="mb-2 block font-semibold text-white">
                {t("Email", "البريد الإلكتروني")} *
              </label>
              <input
                id="shipment-email"
                type="email"
                dir="ltr"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                maxLength={254}
                autoComplete="email"
                required
                className="h-12 w-full rounded-xl border border-white/10 bg-background px-4 text-white outline-none focus:border-secondary"
              />
            </div>

            <input
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              value={honeypot}
              onChange={(event) => setHoneypot(event.target.value)}
              className="sr-only"
            />

            <label className="flex items-start gap-3 text-sm leading-relaxed text-white/60">
              <input
                type="checkbox"
                checked={privacyConsent}
                onChange={(event) => setPrivacyConsent(event.target.checked)}
                required
                className="mt-1 accent-secondary"
              />
              <span>
                {t(
                  "I agree to the use of these details to respond to my request.",
                  "أوافق على استخدام هذه البيانات للرد على طلبي.",
                )}
              </span>
            </label>

            {error && (
              <p role="alert" className="flex items-start gap-2 text-sm text-red-300">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-secondary px-6 font-bold text-white transition hover:bg-secondary/90 disabled:cursor-wait disabled:opacity-60"
            >
              {isSubmitting
                ? t("Sending…", "جارٍ الإرسال…")
                : t("Request status update", "اطلب تحديث الحالة")}
            </button>
          </form>
        )}

        <section className="mx-auto mt-12 max-w-2xl rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <h2 className="mb-3 text-xl font-bold text-white">
            {t("Need help right away?", "هل تحتاج إلى مساعدة الآن؟")}
          </h2>
          <p className="mb-5 leading-relaxed text-muted-foreground">
            {t(
              "For an existing shipment, include the booking or shipment reference when you contact us.",
              "للاستفسار عن شحنة قائمة، اذكر رقم الحجز أو مرجع الشحنة عند التواصل معنا.",
            )}
          </p>
          <div className="flex flex-wrap gap-3">
            <a href={`tel:${CONTACT_PHONE_E164}`} className="inline-flex items-center gap-2 rounded-lg bg-secondary px-4 py-2.5 font-semibold text-white">
              <PhoneCall className="h-4 w-4" />
              <span>{t("Call Us:", "اتصل بنا:")}</span>
              <span dir="ltr">{CONTACT_PHONE_DISPLAY}</span>
            </a>
            <a href="mailto:info@envodkingdom.net" className="inline-flex items-center gap-2 rounded-lg border border-white/15 px-4 py-2.5 font-semibold text-white">
              <Mail className="h-4 w-4" />
              info@envodkingdom.net
            </a>
            <Link href="/contact" className="inline-flex items-center rounded-lg border border-white/15 px-4 py-2.5 font-semibold text-white hover:border-secondary">
              {t("Contact page", "صفحة التواصل")}
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
