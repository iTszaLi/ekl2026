import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { getLocalizedPath, useLanguage } from "@/lib/language-context";

const NETWORKS = [
  {
    name: "JCtrans",
    description: "International freight-forwarding network.",
    descriptionAr: "شبكة دولية لوكلاء الشحن.",
    href: "https://www.jctrans.com/en/company/07f1r7u/",
    logo: "/images/affiliations/jctrans.webp",
    width: 520,
    height: 138,
  },
  {
    name: "The Cooperative Logistics Network",
    description: "Independent freight-forwarding network.",
    descriptionAr: "شبكة مستقلة لوكلاء الشحن.",
    href: "https://www.thecooperativelogisticsnetwork.com/",
    logo: "/images/affiliations/cooperative-logistics-network.webp",
    width: 180,
    height: 170,
  },
  {
    name: "WCAworld",
    description: "Global network of independent freight forwarders.",
    descriptionAr: "شبكة عالمية مستقلة لوكلاء الشحن.",
    href: "https://www.wcaworld.com/",
    logo: "/images/affiliations/wcaworld.webp",
    width: 225,
    height: 123,
  },
  {
    name: "FIATA",
    description: "International freight-forwarding association.",
    descriptionAr: "اتحاد دولي لوكلاء الشحن.",
    href: "https://fiata.org/directory/sa/",
    width: 133,
    height: 126,
  },
  {
    name: "Planet Logistics Network",
    description: "International logistics network.",
    descriptionAr: "شبكة لوجستية دولية.",
    href: "https://www.planetlogisticsnetwork.com/",
    logo: "/images/affiliations/planet-logistics-network.webp",
    width: 241,
    height: 86,
  },
  {
    name: "ICON Logistics Network",
    description: "International freight-forwarding network.",
    descriptionAr: "شبكة دولية للشحن.",
    href: "https://www.iconlogisticsnetwork.com/",
    logo: "/images/affiliations/icon-logistics-network.webp",
    width: 159,
    height: 103,
  },
];

export function GlobalLogisticsNetworks() {
  const { t, isRtl, language } = useLanguage();
  const shouldReduceMotion = useReducedMotion();
  const reduceMotion = shouldReduceMotion ?? false;

  return (
    <section
      aria-labelledby="global-networks-heading"
      className="relative overflow-hidden bg-[#f6f8fb] py-16 md:py-20"
      dir={isRtl ? "rtl" : "ltr"}
    >
      <div className="container relative z-10 mx-auto max-w-6xl px-5 md:px-8">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0.96, y: 6 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: reduceMotion ? 0 : 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto max-w-5xl"
        >
          <div className={`mb-8 ${isRtl ? "text-right" : "text-left"}`}>
            <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.24em] text-[#0c2b4d] sm:text-[11px]">
              {t(
                "GLOBAL NETWORKS & PROFESSIONAL AFFILIATIONS",
                "الشبكات العالمية والانتسابات المهنية",
              )}
            </p>
            <span aria-hidden="true" className="mb-3 block h-0.5 w-10 bg-secondary" />
            <h2
              id="global-networks-heading"
              className="max-w-3xl text-2xl font-black leading-tight tracking-tight text-[#0c2b4d] md:text-3xl"
            >
              {t(
                "Connected to Global Freight-Forwarding Networks",
                "ارتباط بشبكات الشحن العالمية",
              )}
            </h2>
            <p className="mt-4 max-w-3xl text-sm leading-6 text-[#526174] sm:text-base sm:leading-7">
              {t(
                "International freight-forwarding connections supporting shipments to and from Saudi Arabia and the GCC.",
                "تدعم علاقات الشحن الدولي تنسيق الشحنات من المملكة العربية السعودية ودول مجلس التعاون الخليجي وإليها.",
              )}
            </p>
          </div>

          <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 xl:grid-cols-6">
            {NETWORKS.map((network, index) => (
              <motion.li
                key={network.name}
                initial={reduceMotion ? false : { opacity: 0.96, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-30px" }}
                transition={{
                  delay: reduceMotion ? 0 : index * 0.06,
                  duration: reduceMotion ? 0 : 0.36,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="group min-w-0 rounded-xl border border-[#0c2b4d]/10 bg-white p-4 shadow-[0_4px_16px_rgba(12,43,77,0.04)] transition-[transform,box-shadow,border-color] duration-200 ease-out hover:-translate-y-1 hover:border-secondary/40 hover:shadow-[0_12px_26px_rgba(12,43,77,0.1)] focus-within:-translate-y-1 focus-within:border-secondary/50 focus-within:shadow-[0_12px_26px_rgba(12,43,77,0.1)] motion-reduce:transform-none motion-reduce:transition-none"
              >
                <article className="flex h-full min-h-[220px] flex-col items-center text-center">
                  <span
                    aria-hidden="true"
                    className="mb-4 h-0.5 w-8 rounded-full bg-secondary transition-[width] duration-200 group-hover:w-12 group-focus-within:w-12 motion-reduce:transition-none"
                  />
                  <div className="flex h-[70px] w-full items-center justify-center">
                    {network.logo ? (
                      <img
                        src={network.logo}
                        alt={`${network.name} logo`}
                        width={network.width}
                        height={network.height}
                        loading="lazy"
                        decoding="async"
                        className="max-h-[64px] max-w-full object-contain"
                      />
                    ) : (
                      <span
                        aria-hidden="true"
                        className="text-2xl font-black tracking-[0.08em] text-[#0c2b4d]"
                      >
                        FIATA
                      </span>
                    )}
                  </div>
                  <h3 className="mt-3 min-h-[44px] break-words text-sm font-bold leading-5 text-[#0c2b4d]" dir="ltr">
                    {network.name}
                  </h3>
                  <p className="mt-2 text-xs leading-5 text-[#526174]">
                    {t(network.description, network.descriptionAr)}
                  </p>
                  <a
                    href={network.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={t(
                      `Visit ${network.name} official website or directory (opens in a new tab)`,
                      `زيارة الموقع الرسمي أو الدليل لـ ${network.name} (يفتح في علامة تبويب جديدة)`,
                    )}
                    className="mt-auto inline-flex min-h-10 items-center gap-1 pt-3 text-xs font-semibold text-[#0c2b4d] underline decoration-secondary/70 underline-offset-4 transition-colors hover:decoration-secondary focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2"
                  >
                    {t("Explore network", "استكشف الشبكة")}
                    <ArrowUpRight
                      aria-hidden="true"
                      className={`h-3.5 w-3.5 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:transition-none ${
                        isRtl ? "rotate-[-90deg]" : ""
                      }`}
                    />
                  </a>
                </article>
              </motion.li>
            ))}
          </ul>

          <div className="mt-8 flex flex-col items-start justify-between gap-4 border-t border-[#0c2b4d]/10 pt-5 sm:flex-row sm:items-center">
            <p className="text-sm font-semibold leading-6 text-[#0c2b4d]">
              {t(
                "Global connections. Local shipment coordination.",
                "علاقات عالمية وتنسيق محلي للشحنات.",
              )}
            </p>
            <a
              href={getLocalizedPath("/contact", language)}
              className="inline-flex min-h-10 items-center gap-1 border-b border-secondary/70 pb-1 text-sm font-semibold text-[#0c2b4d] transition-colors hover:border-secondary focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2"
            >
              {t("Discuss your shipping requirements", "ناقش متطلبات الشحن الخاصة بك")}
              <ArrowUpRight
                aria-hidden="true"
                className={`h-4 w-4 ${isRtl ? "rotate-[-90deg]" : ""}`}
              />
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
