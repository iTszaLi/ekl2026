import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight, ArrowLeft, CheckCircle2 } from "lucide-react";
import { useLanguage } from "@/lib/language-context";
import { buildQuoteMailto, CONTACT_EMAIL, CONTACT_WHATSAPP } from "@/lib/quote-mailto";

const SERVICES = [
  { id: "customs",     en: "Customs Clearance",        ar: "التخليص الجمركي",       icon: "🛃" },
  { id: "sea",         en: "Sea / Ocean Freight",       ar: "الشحن البحري",           icon: "🚢" },
  { id: "air",         en: "Air Freight",               ar: "الشحن الجوي",            icon: "✈️" },
  { id: "road",        en: "Road Transportation",       ar: "النقل البري",            icon: "🚛" },
  { id: "exhibition",  en: "Exhibition Logistics",      ar: "لوجستيات المعارض",       icon: "🎪" },
  { id: "project",     en: "Project Cargo",             ar: "بضائع المشاريع",         icon: "🏗️" },
  { id: "warehousing", en: "Warehousing",               ar: "التخزين",                icon: "🏭" },
  { id: "ata",         en: "ATA Carnet",                ar: "كارنيه ATA",             icon: "📋" },
  { id: "gcc",         en: "GCC Cross-Border",          ar: "الشحن الخليجي",          icon: "🌍" },
];

interface FormData {
  serviceType: string;
  origin: string;
  destination: string;
  cargoDescription: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  message: string;
}

const EMPTY: FormData = {
  serviceType: "", origin: "", destination: "", cargoDescription: "",
  name: "", company: "", email: "", phone: "", message: "",
};

interface Props { isOpen: boolean; onClose: () => void; }

const slide = {
  initial: (dir: number) => ({ opacity: 0, x: dir * 32 }),
  animate: { opacity: 1, x: 0 },
  exit:    (dir: number) => ({ opacity: 0, x: dir * -32 }),
};

export function QuoteModal({ isOpen, onClose }: Props) {
  const { t, isRtl } = useLanguage();
  const [step, setStep]   = useState(1);
  const [dir,  setDir]    = useState(1);
  const [data, setData]   = useState<FormData>(EMPTY);
  const [done, setDone]   = useState(false);

  const goTo = (next: number) => {
    setDir(next > step ? 1 : -1);
    setStep(next);
  };

  const reset = () => {
    setStep(1); setDir(1); setData(EMPTY); setDone(false);
  };

  const handleClose = () => { onClose(); setTimeout(reset, 400); };

  const handleSubmit = () => {
    window.location.href = buildQuoteMailto([
      { label: "Customer Name", value: data.name },
      { label: "Company", value: data.company },
      { label: "Email", value: data.email },
      { label: "Phone", value: data.phone },
      { label: "Service Required", value: data.serviceType },
      { label: "Origin", value: data.origin },
      { label: "Destination", value: data.destination },
      { label: "Cargo Information", value: data.cargoDescription },
      { label: "Additional Notes", value: data.message },
    ]);
    setDone(true);
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
            className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-[101] max-w-lg mx-auto"
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
                      ? t("Email Draft Ready!", "مسودة البريد جاهزة!")
                      : step === 1
                        ? t("Select a Service", "اختر الخدمة")
                        : step === 2
                          ? t("Cargo Details", "تفاصيل الشحنة")
                          : t("Your Contact Info", "معلومات التواصل")}
                  </h3>
                </div>
                <button onClick={handleClose} className="w-9 h-9 rounded-xl flex items-center justify-center bg-white/[0.06] hover:bg-white/[0.12] text-white/60 hover:text-white transition-all">
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
                      <p className="text-white font-bold text-lg">{t("Your email draft is ready — just press send!", "مسودة بريدك جاهزة — فقط اضغط إرسال!")}</p>
                      <p className="text-white/40 text-sm max-w-xs">
                        {t("A draft with your request details has been opened in your mail app. If it didn't open, email ", "تم فتح مسودة تحتوي على تفاصيل طلبك في تطبيق البريد لديك. إذا لم تُفتح، راسلنا على ")}
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
                      <div className="grid grid-cols-3 gap-2">
                        {SERVICES.map(s => (
                          <button
                            key={s.id}
                            onClick={() => { set("serviceType", s.en); goTo(2); }}
                            className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-center transition-all duration-200 hover:-translate-y-0.5 ${data.serviceType === s.en ? "bg-secondary/20 border-secondary text-white" : "bg-white/[0.04] border-white/10 text-white/60 hover:border-secondary/40 hover:text-white"}`}
                          >
                            <span className="text-xl leading-none">{s.icon}</span>
                            <span className="text-[10px] font-semibold leading-tight">{isRtl ? s.ar : s.en}</span>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  ) : step === 2 ? (
                    <motion.div key="s2" custom={dir} variants={slide} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.25, ease: "easeOut" }} className="flex flex-col flex-1 gap-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className={labelClass}>{t("Origin", "المنشأ")}</label>
                          <input value={data.origin} onChange={e => set("origin", e.target.value)} placeholder={t("e.g. Shanghai", "مثال: شنغهاي")} className={fieldClass} />
                        </div>
                        <div>
                          <label className={labelClass}>{t("Destination", "الوجهة")}</label>
                          <input value={data.destination} onChange={e => set("destination", e.target.value)} placeholder={t("e.g. Riyadh", "مثال: الرياض")} className={fieldClass} />
                        </div>
                      </div>
                      <div>
                        <label className={labelClass}>{t("Cargo Description", "وصف الشحنة")}</label>
                        <textarea value={data.cargoDescription} onChange={e => set("cargoDescription", e.target.value)} placeholder={t("Type, weight, dimensions, special requirements…", "النوع، الوزن، الأبعاد، متطلبات خاصة...")} className={`${fieldClass} resize-none h-20`} />
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div key="s3" custom={dir} variants={slide} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.25, ease: "easeOut" }} className="flex flex-col flex-1 gap-3">
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
                      disabled={!data.name || !data.email || !data.phone}
                      className={`flex items-center gap-2 bg-secondary hover:bg-secondary/85 disabled:opacity-40 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${isRtl ? "flex-row-reverse" : ""}`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      {t("Submit Request", "إرسال الطلب")}
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
