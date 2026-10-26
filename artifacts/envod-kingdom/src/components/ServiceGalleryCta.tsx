import { ArrowRight, Images } from "lucide-react";
import { useLanguage } from "@/lib/language-context";

export function ServiceGalleryCta() {
  const { language } = useLanguage();
  return (
    <a
      href="https://www.envodkingdom.net/gallery"
      dir="ltr"
      className="group relative inline-flex min-h-11 items-center justify-center gap-2.5 overflow-hidden rounded-xl border border-white/35 bg-slate-950/35 px-5 py-3 text-xs font-extrabold uppercase tracking-wide text-white shadow-[0_0_16px_rgba(255,255,255,0.07)] transition duration-300 hover:-translate-y-0.5 hover:border-secondary/70 hover:bg-secondary/10 hover:shadow-[0_0_20px_rgba(255,255,255,0.14)] active:translate-y-0 active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-secondary motion-reduce:transform-none motion-reduce:transition-none"
      data-testid="service-gallery-cta"
    >
      <Images size={16} aria-hidden="true" />
      <span dir={language === "ar" ? "rtl" : "ltr"}>
        {language === "ar" ? "شاهد أعمالنا" : "CHECK OUR WORK"}
      </span>
      <ArrowRight
        size={16}
        aria-hidden="true"
        className="transition-transform duration-300 group-hover:translate-x-0.5 motion-reduce:transition-none"
      />
    </a>
  );
}
