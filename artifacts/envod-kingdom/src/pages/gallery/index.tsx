import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Camera, Images, ArrowRight, MapPin, Calendar } from "lucide-react";
import { useLanguage } from "@/lib/language-context";
import { useJsonLd } from "@/lib/seo";
import { SITE_URL } from "@/lib/seo-config";
import {
  type GalleryItem,
  buildSrcSet,
  defaultSrc,
  largestSrc,
  GRID_SIZES,
  GALLERY_CATEGORIES,
  categoryLabel,
  formatMonthYear,
  groupByMonth,
  galleryTitle,
  galleryDescription,
  galleryLocation,
  galleryAltText,
} from "@/lib/gallery";
import { GalleryLightbox } from "@/components/gallery/GalleryLightbox";

/* ─────────────────────── Animated counter ─────────────────────── */
function useCounter(target: number, duration = 2000) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setStarted(true);
          obs.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return;
    let current = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      current += step;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else setCount(Math.floor(current));
    }, 16);
    return () => clearInterval(timer);
  }, [started, target, duration]);

  return { count, ref };
}

function StatItem({ value, suffix, label }: { value: number; suffix: string; label: string }) {
  const { count, ref } = useCounter(value);
  return (
    <div ref={ref} className="text-center group">
      <div className="text-3xl md:text-4xl font-black text-white mb-1 group-hover:text-secondary transition-colors">
        {count.toLocaleString()}
        <span className="text-secondary">{suffix}</span>
      </div>
      <div className="text-[11px] font-semibold text-white/45 uppercase tracking-widest">{label}</div>
    </div>
  );
}

function StaticStat({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <div className="text-3xl md:text-4xl font-black text-secondary mb-1">{value}</div>
      <div className="text-[11px] font-semibold text-white/45 uppercase tracking-widest">{label}</div>
    </div>
  );
}

/* ─────────────────────── Gallery card ─────────────────────── */
function GalleryCard({ item, onOpen, t, isRtl }: { item: GalleryItem; onOpen: () => void; t: (en: string, ar: string) => string; isRtl: boolean }) {
  const [loaded, setLoaded] = useState(false);
  const monthLabel = formatMonthYear(item.monthYear);
  const title = galleryTitle(item, isRtl);
  const description = galleryDescription(item, isRtl);
  const location = galleryLocation(item, isRtl);

  return (
    <button
      onClick={onOpen}
      className="group relative block w-full overflow-hidden rounded-xl bg-[#0c1a30] mb-4 break-inside-avoid text-left focus:outline-none focus:ring-2 focus:ring-secondary/70"
      aria-label={title}
    >
      <div
        className="relative w-full"
        style={{
          aspectRatio: `${item.width} / ${item.height}`,
          backgroundImage: item.blurDataUrl ? `url(${item.blurDataUrl})` : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <img
          src={defaultSrc(item)}
          srcSet={buildSrcSet(item)}
          sizes={GRID_SIZES}
          width={item.width}
          height={item.height}
          alt={galleryAltText(item, isRtl)}
          loading="lazy"
          decoding="async"
          onLoad={() => setLoaded(true)}
          className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-105 ${
            loaded ? "opacity-100" : "opacity-0"
          }`}
        />

        {/* Category badge */}
        <span className="absolute top-3 left-3 z-10 text-[10px] font-black uppercase tracking-wider bg-black/45 backdrop-blur-sm text-white/90 px-2.5 py-1 rounded-full border border-white/15">
          {categoryLabel(item.category, t)}
        </span>

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400 flex flex-col justify-end p-4">
          <h3 className="text-white font-bold text-base leading-snug mb-1.5 line-clamp-2">{title}</h3>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-white/70">
            {location && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-secondary" />
                {location}
              </span>
            )}
            {monthLabel && (
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3 text-secondary" />
                {monthLabel}
              </span>
            )}
          </div>
          {description && (
            <p className="text-white/55 text-xs mt-1.5 line-clamp-2 leading-relaxed">{description}</p>
          )}
        </div>
      </div>
    </button>
  );
}

/* ─────────────────────── Page ─────────────────────── */
export default function Gallery() {
  const { t, isRtl } = useLanguage();
  const [activeCategory, setActiveCategory] = useState("all");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Static build: no CMS-backed gallery items; the curated empty state renders.
  const items = useMemo<GalleryItem[]>(() => [], []);

  const presentCategories = useMemo(() => {
    const present = new Set(items.map((i) => i.category));
    return GALLERY_CATEGORIES.filter((c) => c.id === "all" || present.has(c.id));
  }, [items]);

  const filtered = useMemo(
    () => (activeCategory === "all" ? items : items.filter((i) => i.category === activeCategory)),
    [items, activeCategory],
  );

  const monthGroups = useMemo(() => groupByMonth(items).slice(0, 3), [items]);

  // Page-level title/description/canonical + breadcrumb come from SeoManager
  // (getSeoForPath). Here we only contribute the dynamic, gallery-specific
  // structured data (WebPage + ImageGallery) that a static config can't build.
  const jsonLd = useMemo<Array<Record<string, unknown>>>(() => {
    const origin = SITE_URL;
    const pageUrl = `${origin}${import.meta.env.BASE_URL}gallery`.replace(/([^:]\/)\/+/g, "$1");
    const blocks: Array<Record<string, unknown>> = [
      {
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: "Operations Gallery — ENVOD KINGDOM",
        url: pageUrl,
        description:
          "A visual showcase of ENVOD KINGDOM's real logistics operations: customs clearance, exhibitions, project cargo, warehousing, and freight forwarding across Saudi Arabia and the GCC.",
      },
    ];

    if (items.length) {
      blocks.push({
        "@context": "https://schema.org",
        "@type": "ImageGallery",
        name: "ENVOD KINGDOM Operations Gallery",
        url: pageUrl,
        associatedMedia: items.map((item) => ({
          "@type": "ImageObject",
          contentUrl: `${origin}${largestSrc(item)}`.replace(/([^:]\/)\/+/g, "$1"),
          name: galleryTitle(item, isRtl),
          description: galleryDescription(item, isRtl) || galleryAltText(item, isRtl),
          width: item.width,
          height: item.height,
        })),
      });
    }

    return blocks;
  }, [items, isRtl]);

  useJsonLd(jsonLd);

  return (
    <div dir={isRtl ? "rtl" : "ltr"} className="bg-[#050c18] min-h-screen">
      {/* Hero */}
      <section className="relative pt-36 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary via-[#081428] to-[#050c18]" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-secondary/10 rounded-full blur-[140px] pointer-events-none -translate-y-1/3 translate-x-1/4" />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="inline-flex items-center gap-2 text-secondary text-xs font-black uppercase tracking-[0.3em] mb-5">
              <Camera className="w-4 h-4" />
              {t("Operations Gallery", "معرض العمليات")}
            </span>
            <h1 className="text-4xl md:text-6xl font-black text-white mb-5 leading-tight">
              {t("Logistics in Motion", "الخدمات اللوجستية أثناء العمل")}
            </h1>
            <p className="text-white/60 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
              {t(
                "A behind-the-scenes look at ENVOD KINGDOM's real operations — customs clearance, exhibitions, project cargo, warehousing, and freight moving across Saudi Arabia and beyond.",
                "نظرة من الداخل على عمليات إنفود كينغدوم الحقيقية — التخليص الجمركي والمعارض وبضائع المشاريع والتخزين والشحن عبر المملكة وخارجها.",
              )}
            </p>
          </motion.div>

          {/* Stats */}
          <div className="mt-14 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6 max-w-4xl mx-auto">
            <StatItem value={25} suffix="+" label={t("Years", "سنة")} />
            <StatItem value={12000} suffix="+" label={t("Shipments", "شحنة")} />
            <StatItem value={250} suffix="+" label={t("Clients", "عميل")} />
            <StatItem value={15} suffix="+" label={t("Cities", "مدينة")} />
            <StaticStat value="24/7" label={t("Support", "دعم")} />
          </div>
        </div>
      </section>

      {/* Filters + grid */}
      <section className="container mx-auto px-4 py-14">
        {presentCategories.length > 1 && (
          <div className="flex flex-wrap justify-center gap-2.5 mb-10">
            {presentCategories.map((cat) => {
              const active = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-all border ${
                    active
                      ? "bg-secondary text-white border-secondary shadow-lg shadow-secondary/25"
                      : "bg-white/[0.03] text-white/60 border-white/10 hover:border-secondary/40 hover:text-white"
                  }`}
                >
                  {t(cat.en, cat.ar)}
                </button>
              );
            })}
          </div>
        )}

        {items.length === 0 ? (
          <EmptyState t={t} />
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-white/40">
            {t("No photos in this category yet.", "لا توجد صور في هذه الفئة بعد.")}
          </div>
        ) : (
          <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4">
            {filtered.map((item, i) => (
              <GalleryCard key={item.id} item={item} t={t} isRtl={isRtl} onOpen={() => setLightboxIndex(i)} />
            ))}
          </div>
        )}
      </section>

      {/* Latest Operations */}
      {monthGroups.length > 0 && (
        <section className="container mx-auto px-4 pb-24">
          <div className="flex items-center gap-3 mb-10">
            <Images className="w-6 h-6 text-secondary" />
            <h2 className="text-2xl md:text-3xl font-black text-white">
              {t("Latest Operations", "أحدث العمليات")}
            </h2>
          </div>
          <div className="space-y-12">
            {monthGroups.map((group) => (
              <div key={group.key}>
                <div className="flex items-center gap-3 mb-5">
                  <span className="text-secondary font-bold text-sm uppercase tracking-widest">{group.label}</span>
                  <span className="flex-1 h-px bg-white/10" />
                  <span className="text-white/40 text-xs">
                    {group.items.length} {t("photos", "صورة")}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {group.items.slice(0, 12).map((item) => {
                    const idx = filtered.findIndex((f) => f.id === item.id);
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          if (idx >= 0) setLightboxIndex(idx);
                          else {
                            setActiveCategory("all");
                            setLightboxIndex(items.findIndex((f) => f.id === item.id));
                          }
                        }}
                        className="group relative aspect-square overflow-hidden rounded-lg bg-[#0c1a30] focus:outline-none focus:ring-2 focus:ring-secondary/70"
                        aria-label={galleryTitle(item, isRtl)}
                        style={{
                          backgroundImage: item.blurDataUrl ? `url(${item.blurDataUrl})` : undefined,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                        }}
                      >
                        <img
                          src={defaultSrc(item, 480)}
                          srcSet={buildSrcSet(item)}
                          sizes="(max-width: 768px) 33vw, 16vw"
                          width={item.width}
                          height={item.height}
                          alt={galleryAltText(item, isRtl)}
                          loading="lazy"
                          decoding="async"
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors" />
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {lightboxIndex !== null && filtered[lightboxIndex] && (
        <GalleryLightbox
          items={filtered}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onNavigate={setLightboxIndex}
        />
      )}
    </div>
  );
}

/* ─────────────────────── Empty state ─────────────────────── */
function EmptyState({ t }: { t: (en: string, ar: string) => string }) {
  return (
    <div className="max-w-xl mx-auto text-center py-20">
      <div className="relative inline-flex items-center justify-center w-24 h-24 rounded-full bg-secondary/10 mb-8">
        <div className="absolute inset-0 rounded-full bg-secondary/10 animate-ping opacity-40" />
        <Camera className="w-11 h-11 text-secondary relative z-10" />
      </div>
      <h2 className="text-2xl md:text-3xl font-black text-white mb-4">
        {t("Our Gallery Is Being Curated", "جارٍ إعداد معرضنا")}
      </h2>
      <p className="text-white/55 leading-relaxed mb-8">
        {t(
          "We're preparing a visual showcase of ENVOD KINGDOM's operations across customs, exhibitions, project cargo, and warehousing. Check back soon to see logistics in action.",
          "نعمل على إعداد عرض بصري لعمليات إنفود كينغدوم في التخليص الجمركي والمعارض وبضائع المشاريع والتخزين. عد قريباً لمشاهدة الخدمات اللوجستية أثناء العمل.",
        )}
      </p>
      <a
        href={`${import.meta.env.BASE_URL}contact`.replace(/\/+/g, "/")}
        className="inline-flex items-center gap-2 text-secondary font-bold hover:gap-3 transition-all"
      >
        {t("Request a Quote", "اطلب عرض سعر")}
        <ArrowRight className="w-4 h-4" />
      </a>
    </div>
  );
}
