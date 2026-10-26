import { Link } from "wouter";
import { useEffect } from "react";
import { useLanguage } from "@/lib/language-context";
import { GATEWAY_GUIDANCE, PREPARATION_LINKS, SERVICE_PREPARATION } from "@/lib/service-preparation";
import { FclLclGuide } from "@/components/FclLclGuide";

export function ServicePreparation({ slug }: { slug: string }) {
  const { t } = useLanguage();
  const content = SERVICE_PREPARATION[slug];
  useEffect(() => {
    let frame = 0;
    const revealFragment = () => {
      const id = window.location.hash.slice(1);
      if (!/^(shipment-preparation|fcl-lcl-comparison|gateway-(riyadh|jeddah|dammam))$/.test(id)) return;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView({ block: "start" }));
    };
    revealFragment();
    window.addEventListener("hashchange", revealFragment);
    window.addEventListener("popstate", revealFragment);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("hashchange", revealFragment);
      window.removeEventListener("popstate", revealFragment);
    };
  }, [slug]);
  if (!content) return null;
  return (
    <section id="shipment-preparation" className="scroll-mt-40 border-y border-white/10 bg-white/[0.02] py-16 md:scroll-mt-24">
      <div className="container mx-auto max-w-5xl px-4">
        <h2 className="mb-5 text-2xl font-black text-white md:text-3xl">{t(...content.heading)}</h2>
        <p className="mb-6 leading-relaxed text-white/65">{t(...content.summary)}</p>
        <ul className="mb-6 list-disc space-y-4 ps-6 leading-relaxed text-white/75">
          {content.items.map((item) => <li key={item[0]}>{t(...item)}</li>)}
        </ul>
        <p className="mb-5 rounded-xl border border-white/10 bg-background/50 p-5 text-sm leading-relaxed text-white/60">{t(...content.note)}</p>
        {slug === "ocean-freight" && <FclLclGuide />}
        {["ata-carnet", "exhibition-logistics"].includes(slug) && (
          <p className="mb-6 text-sm">
            <a href="https://zatca.gov.sa/en/MediaCenter/News/Pages/news-1245.aspx" target="_blank" rel="noopener noreferrer" className="text-white/90 underline underline-offset-4 hover:text-white">
              {t("ZATCA: ATA Carnet acceptance and the Saudi guaranteeing association", "هيئة الزكاة والضريبة والجمارك: قبول كارنيه ATA والجهة الضامنة السعودية")}
            </a>
          </p>
        )}
        {["customs-clearance", "ocean-freight", "freight-forwarding"].includes(slug) && (
          <div className="my-8 space-y-6">
            {GATEWAY_GUIDANCE.map((gateway) => (
              <div id={gateway.id} key={gateway.id} className="scroll-mt-40 md:scroll-mt-28">
                <h3 className="mb-3 text-lg font-bold text-white">{t(...gateway.heading)}</h3>
                <p className="text-sm leading-relaxed text-white/65">{t(...gateway.text)}</p>
              </div>
            ))}
            <p className="text-sm leading-relaxed text-white/55">{t(
              "These are gateway planning considerations, not a claim of ENVOD branches, terminal operations or guaranteed access. Confirm current requirements and shipment eligibility.",
              "هذه اعتبارات لتخطيط منافذ الشحن، وليست ادعاءً بوجود فروع لإنفود أو تشغيل محطات أو دخول مضمون. تحقق من المتطلبات الحالية وأهلية الشحنة.",
            )}</p>
            <a href="https://www.spa.gov.sa/en/N2153933" target="_blank" rel="noopener noreferrer" className="inline-block text-sm text-white/90 underline underline-offset-4 hover:text-white">
              {t("Official Saudi Press Agency: Jeddah and Dammam port context", "وكالة الأنباء السعودية: سياق ميناءي جدة والدمام")}
            </a>
          </div>
        )}
        {content.source && (
          <p className="mb-6 text-sm">
            <a href={content.source.url} target="_blank" rel="noopener noreferrer" className="text-white/90 underline underline-offset-4 hover:text-white">
              {t(...content.source.label)}
            </a>
          </p>
        )}
        {content.references && <nav aria-label={t("Official regulatory references", "المراجع الرسمية للمتطلبات التنظيمية")} className="mb-7 flex flex-col items-start gap-3">
          {content.references.map(reference => <a key={reference.url} href={reference.url} target="_blank" rel="noopener noreferrer" className="text-sm text-white/90 underline underline-offset-4 hover:text-white">{t(...reference.label)}</a>)}
        </nav>}
        {PREPARATION_LINKS[slug]?.length > 0 && (
          <nav aria-label={t("Related shipment preparation guides", "أدلة ذات صلة لتجهيز الشحنات")} className="mb-7 flex flex-col items-start gap-3">
            {PREPARATION_LINKS[slug].map((link) => (
              <Link key={link.slug} href={`/services/${link.slug}#shipment-preparation`} className="text-sm text-white/90 underline underline-offset-4 hover:text-white">
                {t(...link.label)}
              </Link>
            ))}
          </nav>
        )}
        <Link href={`/contact?service=${slug}`} className="inline-flex rounded-xl bg-secondary px-6 py-3 font-bold text-white hover:bg-secondary/85">
          {slug === "relocation"
            ? t("Send your move details", "أرسل تفاصيل انتقالك")
            : t("Send your shipment requirements", "أرسل متطلبات شحنتك")}
        </Link>
      </div>
    </section>
  );
}
