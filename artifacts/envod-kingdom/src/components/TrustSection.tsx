import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useLanguage } from "@/lib/language-context";

interface StatDef {
  value: number;
  suffix: string;
  en: string;
  ar: string;
}

const STATS: StatDef[] = [
  { value: 500,  suffix: "+", en: "Clients Served",      ar: "عميل نخدمهم" },
  { value: 50,   suffix: "+", en: "Fleet Vehicles",       ar: "مركبة في الأسطول" },
  { value: 25,   suffix: "+", en: "Years Experience",     ar: "عاماً من الخبرة" },
  { value: 100,  suffix: "%", en: "Shipment Tracking",    ar: "تتبع الشحنات" },
  { value: 24,   suffix: "/7", en: "Customer Support",   ar: "دعم العملاء" },
  { value: 98,   suffix: "%", en: "On-Time Delivery",     ar: "نسبة التسليم في الموعد" },
];

function useCounter(target: number, duration = 1800) {
  const [count, setCount]     = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setStarted(true); obs.disconnect(); }
    }, { threshold: 0.4 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return;
    let current = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      current += step;
      if (current >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(current));
    }, 16);
    return () => clearInterval(timer);
  }, [started, target, duration]);

  return { count, ref };
}

function StatCard({ stat }: { stat: StatDef }) {
  const { isRtl } = useLanguage();
  const { count, ref } = useCounter(stat.value);
  const label = isRtl ? stat.ar : stat.en;

  return (
    <div ref={ref} className="text-center group">
      <div className="text-4xl md:text-5xl font-black text-white mb-2 transition-colors duration-300 group-hover:text-secondary">
        {count.toLocaleString()}
        <span className="text-secondary">{stat.suffix}</span>
      </div>
      <div className="text-xs font-bold uppercase tracking-[0.2em] text-white/40 group-hover:text-white/60 transition-colors duration-300">
        {label}
      </div>
    </div>
  );
}

export function TrustSection() {
  const { t, isRtl } = useLanguage();

  return (
    <section
      className="py-20 relative overflow-hidden"
      style={{ background: "linear-gradient(180deg,#030c1c 0%,#040e20 100%)" }}
      aria-label={t("Trusted Across Saudi Arabia & GCC", "موثوق به عبر المملكة والخليج")}
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-secondary/25 to-transparent" />
      {/* Ambient glow — no grid */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 80% 50% at 50% 50%, rgba(214,40,40,0.04) 0%, transparent 70%)" }} />

      <div className="container mx-auto px-4 relative z-10">
        <div className={`text-center mb-14 ${isRtl ? "rtl" : ""}`}>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-secondary text-[10px] font-bold tracking-[0.4em] uppercase mb-3"
          >
            {t("BY THE NUMBERS", "بالأرقام")}
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.08 }}
            className="text-3xl md:text-4xl font-black text-white"
          >
            {t("Trusted Across", "موثوق به عبر")}
            <span className="text-secondary"> {t("Saudi Arabia & GCC", "المملكة ودول الخليج")}</span>
          </motion.h2>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-10 md:gap-8"
        >
          {STATS.map((s, i) => <StatCard key={i} stat={s} />)}
        </motion.div>
      </div>
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
    </section>
  );
}
