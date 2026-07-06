import { MapPin, CalendarDays, CheckCircle2 } from "lucide-react";
import type { ServicePillar } from "@/lib/service-data";

/**
 * Renders the long-form "pillar" content for a service page as PLAIN semantic
 * HTML (h2/p/ul). Intentionally NOT wrapped in framer-motion with
 * initial opacity:0 — that would serialize hidden content into the prerendered
 * SSG HTML and undermine crawlability. All copy is bilingual + RTL-aware.
 */
export default function PillarSections({
  pillar,
  isRtl,
  accentHex,
}: {
  pillar: ServicePillar;
  isRtl: boolean;
  accentHex: string;
}) {
  const dir = isRtl ? "rtl" : "ltr";

  return (
    <section
      className={`border-t border-white/6 ${isRtl ? "text-right" : ""}`}
      dir={dir}
      aria-label={isRtl ? "دليل لوجستيات المعارض" : "Exhibition logistics guide"}
    >
      {/* Intro lede + content sections */}
      <div className="container mx-auto px-4 py-16 md:py-20 max-w-4xl">
        <div className="space-y-5">
          {pillar.intro.map((p, i) => (
            <p
              key={i}
              className={
                i === 0
                  ? "text-white/85 text-lg md:text-xl leading-relaxed"
                  : "text-white/65 text-base leading-relaxed"
              }
            >
              {isRtl ? p.ar : p.en}
            </p>
          ))}
        </div>

        <div className="mt-14 space-y-12">
          {pillar.sections.map((s) => (
            <article key={s.id} id={s.id} className="scroll-mt-28">
              <h2 className="text-2xl md:text-3xl font-black text-white mb-4 leading-tight">
                {isRtl ? s.heading.ar : s.heading.en}
              </h2>
              <div className="space-y-4">
                {s.paragraphs.map((p, i) => (
                  <p key={i} className="text-white/60 text-[15px] leading-relaxed">
                    {isRtl ? p.ar : p.en}
                  </p>
                ))}
              </div>
              {s.bullets && s.bullets.length > 0 && (
                <ul className="mt-6 space-y-3">
                  {s.bullets.map((b, i) => (
                    <li
                      key={i}
                      className={`flex items-start gap-3 ${isRtl ? "flex-row-reverse" : ""}`}
                    >
                      <CheckCircle2
                        className="w-4 h-4 mt-0.5 shrink-0"
                        style={{ color: accentHex }}
                      />
                      <span className="text-white/70 text-sm leading-relaxed">
                        {isRtl ? b.ar : b.en}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </article>
          ))}
        </div>
      </div>

      {/* Venues */}
      {pillar.venues.length > 0 && (
        <div
          className="border-t border-white/6"
          style={{
            background:
              "linear-gradient(180deg, hsl(var(--background)) 0%, #020d1c 100%)",
          }}
        >
          <div className="container mx-auto px-4 py-16 max-w-5xl">
            <p className="text-secondary text-[10px] font-bold tracking-[0.4em] uppercase mb-3">
              {isRtl ? "أماكن المعارض" : "EXHIBITION VENUES"}
            </p>
            <h2 className="text-2xl md:text-3xl font-black text-white mb-3">
              {isRtl
                ? "نُسلّم إلى أبرز مراكز المعارض في المملكة"
                : "We deliver to Saudi Arabia's leading exhibition venues"}
            </h2>
            <p className="text-white/45 text-sm max-w-2xl mb-8">
              {isRtl
                ? "تغطية على مستوى المملكة لكل مركز مؤتمرات ومعارض رئيسي."
                : "Nationwide coverage to every major convention and exhibition centre."}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {pillar.venues.map((v, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-white/8 bg-white/[0.03] p-5"
                >
                  <div className={`flex items-start gap-3 ${isRtl ? "flex-row-reverse text-right" : ""}`}>
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: `${accentHex}18` }}
                    >
                      <MapPin className="w-4 h-4" style={{ color: accentHex }} />
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-sm leading-snug">
                        {isRtl ? v.nameAr : v.name}
                      </h3>
                      <p className="text-white/45 text-xs mt-1">
                        {isRtl ? v.cityAr : v.city}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Major events */}
      {pillar.majorEvents.length > 0 && (
        <div className="container mx-auto px-4 py-16 max-w-5xl">
          <p className="text-secondary text-[10px] font-bold tracking-[0.4em] uppercase mb-3">
            {isRtl ? "المعارض الكبرى" : "MAJOR EXHIBITIONS"}
          </p>
          <h2 className="text-2xl md:text-3xl font-black text-white mb-3">
            {isRtl
              ? "معارض ندعم العارضين فيها"
              : "Exhibitions we support exhibitors at"}
          </h2>
          <p className="text-white/45 text-sm max-w-2xl mb-8">
            {isRtl
              ? "خبرة ميدانية في أهم فعاليات المملكة عبر مختلف القطاعات."
              : "On-the-ground experience at the Kingdom's flagship events across every sector."}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {pillar.majorEvents.map((e, i) => (
              <div
                key={i}
                className={`flex items-center justify-between gap-4 rounded-xl border border-white/8 bg-white/[0.03] px-5 py-4 ${isRtl ? "flex-row-reverse text-right" : ""}`}
              >
                <div className={`flex items-center gap-3 ${isRtl ? "flex-row-reverse" : ""}`}>
                  <CalendarDays className="w-4 h-4 shrink-0" style={{ color: accentHex }} />
                  <span className="text-white font-bold text-sm">{e.name}</span>
                </div>
                <span className="text-white/40 text-xs whitespace-nowrap">
                  {(isRtl ? e.sectorAr : e.sector)} · {(isRtl ? e.cityAr : e.city)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
