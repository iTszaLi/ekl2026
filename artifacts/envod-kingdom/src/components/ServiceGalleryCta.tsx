import { ArrowUpRight, Images } from "lucide-react";
import { useLanguage } from "@/lib/language-context";

export function ServiceGalleryCta() {
  const { t } = useLanguage();
  return <a href="https://www.envodkingdom.net/gallery"
    className="group relative inline-flex items-center justify-center gap-3 overflow-hidden rounded-xl border border-white/30 bg-white/5 px-6 py-3 text-sm font-bold text-white transition duration-300 hover:-translate-y-0.5 hover:border-secondary hover:bg-secondary/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-secondary motion-reduce:transform-none"
    data-testid="service-gallery-cta">
    <span aria-hidden="true" className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-700 group-hover:translate-x-full motion-reduce:transition-none" />
    <Images size={18} aria-hidden="true" />
    {t("Explore Our Gallery", "استكشف معرض أعمالنا")}
    <ArrowUpRight size={17} aria-hidden="true" className="transition-transform group-hover:translate-x-0.5 motion-reduce:transform-none" />
  </a>;
}
