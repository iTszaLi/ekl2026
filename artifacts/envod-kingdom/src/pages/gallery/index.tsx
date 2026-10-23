import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Camera, Images, ArrowRight, MapPin, Calendar } from "lucide-react";
import { useLanguage } from "@/lib/language-context";
import { GALLERY_ITEMS } from "@/lib/gallery-content";
import {
  type GalleryItem,
  buildSrcSet,
  defaultSrc,
  largestSrc,
  GRID_SIZES,
  GALLERY_CATEGORIES,
  galleryBadgeLabel,
  formatMonthYear,
  groupByMonth,
  galleryTitle,
  galleryDescription,
  galleryLocation,
  galleryAltText,
  galleryServicePath,
} from "@/lib/gallery";
import { GalleryLightbox } from "@/components/gallery/GalleryLightbox";

/* ─────────────────────── Animated counter ─────────────────────── */
function useCounter(target: number, duration = 2000) {
  const [count, setCount] = useState(target);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const reduceMotion = shouldReduceMotion ?? false;

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
    if (reduceMotion) {
      setCount(target);
      return;
    }
    setCount(0);
    const start = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(target * eased));
      if (progress < 1) frame = requestAnimationFrame(tick);
      else setCount(target);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [started, target, duration, reduceMotion]);

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

/* ─────────────────────── Gallery card ─────────────────────── */
function GalleryCard({ item, onOpen, t, isRtl }: { item: GalleryItem; onOpen: () => void; t: (en: string, ar: string) => string; isRtl: boolean }) {
  const [loaded, setLoaded] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const monthLabel = formatMonthYear(item.monthYear);
  const title = galleryTitle(item, isRtl);
  const description = galleryDescription(item, isRtl);
  const location = galleryLocation(item, isRtl);

  return (
    <article className="mb-4 break-inside-avoid">
      <button
        onClick={onOpen}
        className="group relative block w-full overflow-hidden rounded-xl bg-[#0c1a30] text-left focus:outline-none focus:ring-2 focus:ring-secondary/70"
        aria-label={t(`Open photo: ${title}`, `عرض الصورة: ${title}`)}
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
          alt={imageFailed ? "" : galleryAltText(item, isRtl)}
          loading="lazy"
          decoding="async"
          onLoad={() => {
            setLoaded(true);
            setImageFailed(false);
          }}
          onError={() => setImageFailed(true)}
          aria-hidden={imageFailed}
          className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-105 ${
            loaded && !imageFailed ? "opacity-100" : "opacity-0"
          }`}
        />
        {imageFailed && (
          <div
            role="status"
            className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[#0c1a30] text-center text-xs text-white/65"
          >
            <Camera className="h-6 w-6 text-secondary/80" aria-hidden="true" />
            <span>{t("Image temporarily unavailable", "الصورة غير متاحة مؤقتاً")}</span>
          </div>
        )}

        {/* Category badge */}
        <span className="absolute top-3 left-3 z-10 text-[10px] font-black uppercase tracking-wider bg-black/45 backdrop-blur-sm text-white/90 px-2.5 py-1 rounded-full border border-white/15">
          {galleryBadgeLabel(item, t)}
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
      {item.servicePath && (
        <a
          href={galleryServicePath(item.servicePath, isRtl)}
          aria-label={t(`Explore service: ${title}`, `استكشف الخدمة: ${title}`)}
          className="mt-2 inline-flex items-center gap-2 rounded-md px-1 py-1 text-xs font-semibold text-secondary hover:text-white focus:outline-none focus:ring-2 focus:ring-secondary/70"
        >
          {t("Explore related service", "استكشف الخدمة المرتبطة")}
          <ArrowRight aria-hidden="true" className={`h-3.5 w-3.5 ${isRtl ? "rotate-180" : ""}`} />
        </a>
      )}
    </article>
  );
}

/* ─────────────────────── Page ─────────────────────── */
export default function Gallery() {
  const { t, isRtl } = useLanguage();
  const [activeCategory, setActiveCategory] = useState("all");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const items = GALLERY_ITEMS;

  const presentCategories = useMemo(() => {
    const present = new Set(items.map((i) => i.category));
    return GALLERY_CATEGORIES.filter((c) => c.id === "all" || present.has(c.id));
  }, [items]);

  const filtered = useMemo(
    () => (activeCategory === "all" ? items : items.filter((i) => i.category === activeCategory)),
    [items, activeCategory],
  );

  const monthGroups = useMemo(() => groupByMonth(items).slice(0, 3), [items]);

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
                "A selection of ENVOD-provided photos showing freight transport, warehouse handling, project cargo, and exhibition equipment. Captions describe only what is visible; customer names, locations, and project details are omitted unless approved.",
                "مجموعة من الصور التي قدمتها إنفود كينغدوم وتُظهر نقل الشحنات ومناولة المستودعات وشحنات المشاريع ومعدات المعارض. تصف التعليقات ما يظهر فقط، ولا تذكر أسماء العملاء أو المواقع أو تفاصيل المشاريع إلا بعد الموافقة.",
              )}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filters + grid */}
      <section className="container mx-auto px-4 py-14">
        {presentCategories.length > 1 && (
          <div
            role="group"
            aria-label={t("Filter gallery by category", "تصفية المعرض حسب الفئة")}
            className="flex flex-wrap justify-center gap-2.5 mb-10"
          >
            {presentCategories.map((cat) => {
              const active = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  aria-pressed={active}
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
          <EmptyState t={t} isRtl={isRtl} />
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
function EmptyState({
  t,
  isRtl,
}: {
  t: (en: string, ar: string) => string;
  isRtl: boolean;
}) {
  return (
    <div className="relative isolate max-w-5xl mx-auto overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#102039] via-[#0a1628] to-[#07111f] p-7 sm:p-10 md:p-14 shadow-2xl shadow-black/20">
      <div
        aria-hidden="true"
        className="absolute -top-28 -right-20 h-72 w-72 rounded-full bg-secondary/10 blur-3xl"
      />
      <div className="relative grid gap-7 md:grid-cols-[auto_minmax(0,1fr)] md:items-start md:gap-10">
        <div
          aria-hidden="true"
          className="flex h-16 w-16 items-center justify-center rounded-2xl border border-secondary/25 bg-secondary/10 text-secondary shadow-lg shadow-secondary/5"
        >
          <Camera className="h-7 w-7" />
        </div>
        <div className="max-w-3xl">
          <p className="mb-3 text-xs font-black uppercase tracking-[0.24em] text-secondary">
            {t("Verified photography only", "صور موثّقة فقط")}
          </p>
          <h2 className="mb-4 text-2xl font-black leading-tight text-white sm:text-3xl md:text-4xl">
            {t("Our Gallery Is Being Curated", "يجري إعداد معرضنا")}
          </h2>
          <p className="mb-8 max-w-2xl leading-relaxed text-white/65">
            {t(
              "No verified ENVOD operation photos are published here yet. We will add images only after confirming they represent ENVOD work and are approved for public use.",
              "لا توجد صور موثّقة لعمليات إنفود كينغدوم منشورة هنا حتى الآن. لن نضيف الصور إلا بعد التأكد من أنها توثّق أعمال الشركة والحصول على موافقة نشرها.",
            )}
          </p>
          <div className="flex flex-wrap gap-3">
            <a
              href={`${import.meta.env.BASE_URL}contact`.replace(/\/+/g, "/")}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-secondary px-5 py-3 font-bold text-white transition-colors hover:bg-secondary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a1628]"
            >
              {t("Discuss Your Shipment", "ناقش شحنتك")}
              <ArrowRight
                aria-hidden="true"
                className={`h-4 w-4 transition-transform ${isRtl ? "rotate-180" : ""}`}
              />
            </a>
            <a
              href={`${import.meta.env.BASE_URL}services`.replace(/\/+/g, "/")}
              className="inline-flex min-h-11 items-center justify-center rounded-lg border border-white/15 px-5 py-3 font-semibold text-white/85 transition-colors hover:border-white/30 hover:bg-white/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a1628]"
            >
              {t("Explore Services", "استكشف الخدمات")}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
