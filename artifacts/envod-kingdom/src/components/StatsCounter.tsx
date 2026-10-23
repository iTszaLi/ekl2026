import { useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { useLanguage } from "@/lib/language-context";

interface Stat {
  value?: number;
  displayValue?: string;
  displayValueAr?: string;
  decimals?: number;
  suffix: string;
  label: string;
  labelAr: string;
}

const STATS: Stat[] = [
  {
    displayValue: "Shipment",
    displayValueAr: "الشحنات",
    suffix: "",
    label: "Coordination",
    labelAr: "والتنسيق",
  },
  {
    displayValue: "Business",
    displayValueAr: "الأعمال",
    suffix: "",
    label: "Logistics Support",
    labelAr: "الدعم اللوجستي",
  },
  {
    displayValue: "Worldwide",
    displayValueAr: "عالمي",
    suffix: "",
    label: "Freight Options",
    labelAr: "خيارات الشحن",
  },
  { value: 98, suffix: "%", label: "On-Time Delivery Rate", labelAr: "نسبة التسليم في الموعد" },
  { value: 25, suffix: "+", label: "Years of Excellence", labelAr: "عاماً من التميز" },
  {
    displayValue: "Customs",
    displayValueAr: "دعم",
    suffix: "",
    label: "Documentation Support",
    labelAr: "المستندات الجمركية",
  },
];

function CountUpNumber({
  target,
  decimals = 0,
  active,
  reduceMotion,
}: {
  target: number;
  decimals?: number;
  active: boolean;
  reduceMotion: boolean;
}) {
  // The prerendered and pre-animation value must be truthful; count-up motion
  // starts only when the metric is visible.
  const [count, setCount] = useState(target);

  useEffect(() => {
    if (reduceMotion) {
      setCount(target);
      return;
    }
    if (!active) {
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
      setCount(Number((target * easedProgress).toFixed(decimals)));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(step);
      } else {
        setCount(target);
      }
    };

    animationFrame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animationFrame);
  }, [active, decimals, reduceMotion, target]);

  return decimals > 0 ? count.toFixed(decimals) : Math.round(count).toLocaleString("en-US");
}

function StatCard({
  stat,
  index,
  active,
  reduceMotion,
}: {
  stat: Stat;
  index: number;
  active: boolean;
  reduceMotion: boolean;
}) {
  const { isRtl } = useLanguage();

  return (
    <motion.div
      initial={reduceMotion ? { opacity: 1, y: 0, scale: 1 } : { opacity: 1, y: 22, scale: 0.98 }}
      animate={
        active || reduceMotion
          ? { opacity: 1, y: 0, scale: 1 }
          : { opacity: 1, y: 22, scale: 0.98 }
      }
      whileHover={reduceMotion ? undefined : { y: -5 }}
      transition={{
        delay: reduceMotion ? 0 : index * 0.13,
        duration: reduceMotion ? 0 : 0.68,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="flex flex-col items-center text-center px-4 py-8 relative group"
      data-testid={`card-company-stat-${index + 1}`}
    >
      {/* Subtle divider between cards (not on last in row) */}
      <div className="absolute inset-x-0 top-0 h-px bg-white/5" />

      {/* Glowing count-up number */}
      <div
        className="text-4xl md:text-5xl xl:text-6xl font-black tabular-nums tracking-tight leading-none"
        dir="ltr"
        style={{
          background: "linear-gradient(135deg, #ffffff 30%, #D62828 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          filter: "drop-shadow(0 0 24px rgba(214,40,40,0.25))",
        }}
        aria-hidden="true"
      >
        {typeof stat.value === "number" ? (
          <CountUpNumber
            target={stat.value}
            decimals={stat.decimals}
            active={active}
            reduceMotion={reduceMotion}
          />
        ) : (
          <span>{isRtl ? stat.displayValueAr : stat.displayValue}</span>
        )}
        <span
          className="text-2xl md:text-3xl xl:text-4xl font-bold"
          style={{
            background: "linear-gradient(135deg, #D62828 0%, #ff4444 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          {stat.suffix}
        </span>
      </div>
      <span className="sr-only" data-testid={`text-company-stat-${index + 1}`}>
        {typeof stat.value === "number"
          ? `${stat.value.toLocaleString("en-US")}${stat.suffix}`
          : isRtl
            ? stat.displayValueAr
            : stat.displayValue}{" "}
        {isRtl ? stat.labelAr : stat.label}
      </span>

      <motion.span
        aria-hidden="true"
        initial={reduceMotion ? { opacity: 1, scaleX: 1 } : { opacity: 0, scaleX: 0 }}
        animate={
          active || reduceMotion
            ? { opacity: 1, scaleX: 1 }
            : { opacity: 0, scaleX: 0 }
        }
        transition={{
          delay: reduceMotion ? 0 : index * 0.13 + 0.22,
          duration: reduceMotion ? 0 : 0.42,
          ease: "easeOut",
        }}
        className="mt-3 h-0.5 w-10 rounded-full bg-secondary shadow-[0_0_14px_rgba(214,40,40,0.55)]"
        style={{ transformOrigin: isRtl ? "right center" : "left center" }}
      />

      <p className="mt-3 text-xs md:text-sm font-medium text-white/55 uppercase tracking-wider">
        {isRtl ? stat.labelAr : stat.label}
      </p>
    </motion.div>
  );
}

export function StatsCounter() {
  const { t } = useLanguage();
  const ref = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const reduceMotion = shouldReduceMotion ?? false;
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      ref={ref}
      id="company-results"
      aria-labelledby="company-results-heading"
      className="relative py-0 overflow-hidden"
      style={{ background: "linear-gradient(180deg, #020d1c 0%, #030b18 50%, #020d1c 100%)" }}
    >
      {/* Ambient glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% 50%, rgba(214,40,40,0.06) 0%, transparent 70%)",
        }}
      />

      {/* Section label */}
      <div className="text-center pt-16 pb-4">
        <motion.p
          initial={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 1, y: 12 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: reduceMotion ? 0 : 0.5 }}
          className="text-secondary text-[10px] font-bold tracking-[0.4em] uppercase"
        >
          {t("COMPANY HIGHLIGHTS", "لمحة عن الشركة")}
        </motion.p>
        <motion.h2
          id="company-results-heading"
          initial={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 1, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: reduceMotion ? 0 : 0.1, duration: reduceMotion ? 0 : 0.6 }}
          className="mt-3 text-2xl md:text-4xl font-bold text-white"
        >
          {t("More Than 25 Years of", "أكثر من 25 عاماً من")}
          <span className="text-secondary"> {t("Trusted Logistics", "الخدمات اللوجستية الموثوقة")}</span>
        </motion.h2>
      </div>

      {/* Company results */}
      <div className="max-w-6xl mx-auto px-4 pb-16">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-0 relative">
          {/* Vertical separators */}
          <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-px bg-white/5 hidden md:block" style={{ left: "33.33%" }} />
          <div className="absolute inset-y-0 w-px bg-white/5 hidden md:block" style={{ left: "66.66%" }} />
          <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-px bg-white/5 md:hidden" />

          {STATS.map((stat, i) => (
            <StatCard key={stat.label} stat={stat} index={i} active={isInView} reduceMotion={reduceMotion} />
          ))}
        </div>
      </div>

      {/* Bottom fade to next section */}
      <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-background to-transparent pointer-events-none" />
    </section>
  );
}
