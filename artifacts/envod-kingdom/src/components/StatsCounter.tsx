import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { useLanguage } from "@/lib/language-context";

interface Stat {
  value: number;
  suffix: string;
  label: string;
  labelAr: string;
  decimals?: number;
}

const STATS: Stat[] = [
  { value: 10000,  suffix: "+",  label: "Shipments Delivered",     labelAr: "شحنة مسلّمة",             decimals: 0 },
  { value: 500,    suffix: "+",  label: "Corporate Clients",        labelAr: "عميل مؤسسي",              decimals: 0 },
  { value: 50,     suffix: "+",  label: "Countries Served",         labelAr: "دولة حول العالم",         decimals: 0 },
  { value: 99.8,   suffix: "%",  label: "On-Time Delivery Rate",    labelAr: "نسبة التسليم في الموعد",  decimals: 1 },
  { value: 25,     suffix: "+",  label: "Years of Excellence",      labelAr: "عاماً من التميز",         decimals: 0 },
  { value: 24,     suffix: "hr", label: "Customs Clearance",        labelAr: "تخليص جمركي",             decimals: 0 },
];

function useCountUp(target: number, duration: number, active: boolean, decimals = 0) {
  const [count, setCount] = useState(0);
  const startTime = useRef<number | null>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (!active) return;

    startTime.current = null;

    function ease(t: number) {
      return 1 - Math.pow(1 - t, 3); // cubic ease-out
    }

    function step(ts: number) {
      if (startTime.current === null) startTime.current = ts;
      const elapsed = ts - startTime.current;
      const progress = Math.min(elapsed / duration, 1);
      setCount(parseFloat((ease(progress) * target).toFixed(decimals)));
      if (progress < 1) rafRef.current = requestAnimationFrame(step);
      else setCount(target);
    }

    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [active, target, duration, decimals]);

  return count;
}

function StatCard({ stat, index, active }: { stat: Stat; index: number; active: boolean }) {
  const { t, isRtl } = useLanguage();
  const count = useCountUp(stat.value, 1800, active, stat.decimals);

  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      animate={active ? { opacity: 1, y: 0 } : { opacity: 0, y: 32 }}
      transition={{ delay: index * 0.08, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col items-center text-center px-4 py-8 relative group"
    >
      {/* Subtle divider between cards (not on last in row) */}
      <div className="absolute inset-x-0 top-0 h-px bg-white/5" />

      {/* Glowing number */}
      <div
        className="text-5xl md:text-6xl xl:text-7xl font-black tabular-nums tracking-tight leading-none"
        style={{
          background: "linear-gradient(135deg, #ffffff 30%, #D62828 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          filter: "drop-shadow(0 0 24px rgba(214,40,40,0.25))",
        }}
      >
        {stat.decimals ? count.toFixed(stat.decimals) : Math.round(count).toLocaleString()}
        <span
          className="text-3xl md:text-4xl font-bold"
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

      <p className="mt-3 text-sm md:text-base font-medium text-white/50 uppercase tracking-widest">
        {isRtl ? stat.labelAr : stat.label}
      </p>
    </motion.div>
  );
}

export function StatsCounter() {
  const { t } = useLanguage();
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      ref={ref}
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
          initial={{ opacity: 0, y: 12 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-secondary text-[10px] font-bold tracking-[0.4em] uppercase"
        >
          {t("BY THE NUMBERS", "بالأرقام")}
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.1, duration: 0.6 }}
          className="mt-3 text-2xl md:text-4xl font-bold text-white"
        >
          {t("A Decade of", "عقود من")}
          <span className="text-secondary"> {t("Trusted Results", "النتائج الموثوقة")}</span>
        </motion.h2>
      </div>

      {/* Stats grid */}
      <div className="max-w-6xl mx-auto px-4 pb-16">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-0 relative">
          {/* Vertical separators */}
          <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-px bg-white/5 hidden md:block" style={{ left: "33.33%" }} />
          <div className="absolute inset-y-0 w-px bg-white/5 hidden md:block" style={{ left: "66.66%" }} />
          <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-px bg-white/5 md:hidden" />

          {STATS.map((stat, i) => (
            <StatCard key={i} stat={stat} index={i} active={isInView} />
          ))}
        </div>
      </div>

      {/* Bottom fade to next section */}
      <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-background to-transparent pointer-events-none" />
    </section>
  );
}
