import { useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { useLanguage } from "@/lib/language-context";

interface ServiceFocus {
  titleEn: string;
  titleAr: string;
  detailEn: string;
  detailAr: string;
}

interface StatDef {
  value?: number;
  displayValue?: string;
  displayValueAr?: string;
  suffix?: string;
  en: string;
  ar: string;
}

const SERVICE_FOCUSES: ServiceFocus[] = [
  { titleEn: "Customs Clearance", titleAr: "التخليص الجمركي", detailEn: "Shipment-specific documentation", detailAr: "مستندات بحسب الشحنة" },
  { titleEn: "Freight Forwarding", titleAr: "خدمات الشحن", detailEn: "Sea and air options", detailAr: "خيارات الشحن البحري والجوي" },
  { titleEn: "GCC Transportation", titleAr: "النقل الخليجي", detailEn: "Route and border planning", detailAr: "تخطيط المسار والإجراءات الحدودية" },
  { titleEn: "Exhibition Logistics", titleAr: "لوجستيات المعارض", detailEn: "Event and venue coordination", detailAr: "تنسيق الفعاليات والمواقع" },
  { titleEn: "ATA Carnet", titleAr: "كارنيه ATA", detailEn: "Eligibility and document coordination", detailAr: "تنسيق الأهلية والمستندات" },
  { titleEn: "Project Cargo", titleAr: "شحن المشاريع", detailEn: "Cargo-specific handling plans", detailAr: "خطط مناولة بحسب نوع الشحنة" },
];

const STATS: StatDef[] = [
  {
    displayValue: "Business",
    displayValueAr: "الأعمال",
    en: "Logistics Support",
    ar: "دعم لوجستي",
  },
  { value: 50, suffix: "+", en: "Fleet Vehicles", ar: "مركبة في الأسطول" },
  { value: 25, suffix: "+", en: "Years Experience", ar: "عاماً من الخبرة" },
  { value: 100, suffix: "%", en: "Shipment Tracking Support", ar: "دعم تحديث حالة الشحنات" },
  { value: 24, suffix: "/7", en: "Customer Support", ar: "دعم العملاء" },
  { value: 98, suffix: "%", en: "On-Time Delivery", ar: "نسبة التسليم في الموعد" },
];

function ServiceCard({ item }: { item: ServiceFocus }) {
  const { isRtl } = useLanguage();

  return (
    <div className="text-center group">
      <div className="text-xl md:text-2xl font-black text-white mb-2 transition-colors duration-300 group-hover:text-secondary">
        {isRtl ? item.titleAr : item.titleEn}
      </div>
      <div className="text-xs font-bold uppercase tracking-[0.2em] text-white/40 group-hover:text-white/60 transition-colors duration-300">
        {isRtl ? item.detailAr : item.detailEn}
      </div>
    </div>
  );
}

function CountUpMetric({
  target,
  active,
  reduceMotion,
}: {
  target: number;
  active: boolean;
  reduceMotion: boolean;
}) {
  const [count, setCount] = useState(target);

  useEffect(() => {
    if (reduceMotion || !active) {
      setCount(target);
      return;
    }

    const duration = 1800;
    let startTime: number | null = null;
    let animationFrame = 0;
    const step = (timestamp: number) => {
      if (startTime === null) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(target * easedProgress));
      if (progress < 1) animationFrame = requestAnimationFrame(step);
      else setCount(target);
    };

    animationFrame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animationFrame);
  }, [active, reduceMotion, target]);

  return count.toLocaleString("en-US");
}

function StatCard({
  stat,
  index,
  active,
  reduceMotion,
}: {
  stat: StatDef;
  index: number;
  active: boolean;
  reduceMotion: boolean;
}) {
  const { isRtl } = useLanguage();

  return (
    <motion.div
      initial={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 1, y: 20 }}
      animate={active || reduceMotion ? { opacity: 1, y: 0 } : { opacity: 1, y: 20 }}
      transition={{
        delay: reduceMotion ? 0 : index * 0.08,
        duration: reduceMotion ? 0 : 0.6,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="text-center group py-5"
      data-testid={`card-trust-stat-${index + 1}`}
    >
      <div
        className="text-4xl md:text-5xl font-black text-white mb-2 tabular-nums transition-colors duration-300 group-hover:text-secondary"
        dir="ltr"
        aria-hidden="true"
      >
        {typeof stat.value === "number" ? (
          <CountUpMetric target={stat.value} active={active} reduceMotion={reduceMotion} />
        ) : (
          <span>{isRtl ? stat.displayValueAr : stat.displayValue}</span>
        )}
        <span className="text-secondary">{stat.suffix ?? ""}</span>
      </div>
      <span className="sr-only" data-testid={`text-trust-stat-${index + 1}`}>
        {typeof stat.value === "number"
          ? `${stat.value.toLocaleString("en-US")}${stat.suffix ?? ""}`
          : isRtl
            ? stat.displayValueAr
            : stat.displayValue}{" "}
        {isRtl ? stat.ar : stat.en}
      </span>
      <div className="text-xs font-bold uppercase tracking-[0.16em] text-white/50 group-hover:text-white/70 transition-colors duration-300">
        {isRtl ? stat.ar : stat.en}
      </div>
    </motion.div>
  );
}

export function TrustSection() {
  const { t, isRtl } = useLanguage();
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const shouldReduceMotion = useReducedMotion();
  const reduceMotion = shouldReduceMotion ?? false;

  return (
    <>
      <section
        className="py-20 relative overflow-hidden"
        style={{ background: "linear-gradient(180deg,#030c1c 0%,#040e20 100%)" }}
        aria-label={t("Logistics Services Across Saudi Arabia & GCC", "خدمات لوجستية في السعودية والخليج")}
      >
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-secondary/25 to-transparent" />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 80% 50% at 50% 50%, rgba(214,40,40,0.04) 0%, transparent 70%)" }}
        />
        <div className="container mx-auto px-4 relative z-10">
          <div className={`text-center mb-14 ${isRtl ? "rtl" : ""}`}>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-secondary text-[10px] font-bold tracking-[0.4em] uppercase mb-3"
            >
              {t("SERVICE AREAS", "مجالات الخدمة")}
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.08 }}
              className="text-3xl md:text-4xl font-black text-white"
            >
              {t("Logistics for", "خدمات لوجستية في")}
              <span className="text-secondary"> {t("Saudi Arabia & GCC", "السعودية والخليج")}</span>
            </motion.h2>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-10 md:gap-8"
          >
            {SERVICE_FOCUSES.map((item) => <ServiceCard key={item.titleEn} item={item} />)}
          </motion.div>
        </div>
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </section>

      <section
        ref={ref}
        id="trusted-across-saudi-arabia-gcc"
        aria-labelledby="trusted-across-heading"
        className="py-20 relative overflow-hidden"
        style={{ background: "linear-gradient(180deg,#030c1c 0%,#040e20 100%)" }}
      >
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-secondary/25 to-transparent" />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 80% 50% at 50% 50%, rgba(214,40,40,0.04) 0%, transparent 70%)" }}
        />
        <div className="container mx-auto px-4 relative z-10">
          <div className={`text-center mb-14 ${isRtl ? "rtl" : ""}`}>
            <motion.p
              initial={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 1, y: 10 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: reduceMotion ? 0 : 0.5 }}
              className="text-secondary text-[10px] font-bold tracking-[0.4em] uppercase mb-3"
            >
              {t("BY THE NUMBERS", "بالأرقام")}
            </motion.p>
            <motion.h2
              id="trusted-across-heading"
              initial={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 1, y: 14 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: reduceMotion ? 0 : 0.08, duration: reduceMotion ? 0 : 0.6 }}
              className="text-3xl md:text-4xl font-black text-white"
            >
              {t("Trusted Across", "موثوق به عبر")}
              <span className="text-secondary"> {t("Saudi Arabia & GCC", "المملكة ودول الخليج")}</span>
            </motion.h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-x-4 gap-y-2 md:gap-x-8 max-w-6xl mx-auto">
            {STATS.map((stat, index) => (
              <StatCard
                key={stat.en}
                stat={stat}
                index={index}
                active={isInView}
                reduceMotion={reduceMotion}
              />
            ))}
          </div>
        </div>
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </section>
    </>
  );
}
