import { motion, useReducedMotion } from "framer-motion";
import { useLanguage } from "@/lib/language-context";

export function FIATAAffiliation() {
  const { t, isRtl } = useLanguage();
  const shouldReduceMotion = useReducedMotion();
  const reduceMotion = shouldReduceMotion ?? false;

  return (
    <section
      aria-labelledby="fiata-affiliation-heading"
      className="relative overflow-hidden border-y border-white/10 bg-[#07162a] py-12 md:py-14"
      dir={isRtl ? "rtl" : "ltr"}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          background:
            "radial-gradient(ellipse 60% 110% at 50% 0%, hsl(var(--secondary) / 0.08), transparent 70%)",
        }}
      />
      <motion.div
        initial={reduceMotion ? false : { opacity: 0.96, y: 6 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: reduceMotion ? 0 : 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="container relative z-10 mx-auto max-w-6xl px-5 md:px-8"
      >
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-5 text-center md:flex-row md:justify-between md:gap-10 md:text-start">
          <div className="max-w-2xl">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.32em] text-white/70">
              {t("PROFESSIONAL AFFILIATION", "الانتساب المهني")}
            </p>
            <span aria-hidden="true" className="mb-3 block h-0.5 w-10 bg-secondary" />
            <h2
              id="fiata-affiliation-heading"
              className="text-xl font-semibold leading-snug text-white md:text-2xl"
            >
              {t("FIATA Association Member", "عضو في FIATA")}
            </h2>
            <p className="mt-2 text-sm leading-6 text-white/75">
              {t(
                "Listed in FIATA’s Saudi directory under “Association Members”; this is not an accreditation, certification or endorsement.",
                "تظهر الشركة في دليل FIATA للسعودية ضمن فئة “Association Members”؛ ولا يعني ذلك اعتمادًا أو شهادة أو تزكية.",
              )}
            </p>
          </div>
          <a
            href="https://fiata.org/directory/sa/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-10 shrink-0 items-center gap-2 border-b border-secondary/80 pb-1 text-sm font-semibold text-white transition-colors hover:border-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-4 focus-visible:ring-offset-[#07162a]"
          >
            {t("View FIATA Saudi directory", "عرض دليل FIATA للسعودية")}
            <span aria-hidden="true" className="text-secondary">
              {isRtl ? "←" : "→"}
            </span>
          </a>
        </div>
      </motion.div>
    </section>
  );
}
