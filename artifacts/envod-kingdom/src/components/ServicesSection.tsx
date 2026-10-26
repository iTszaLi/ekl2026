import { motion } from "framer-motion";
import { Link } from "wouter";
import { useLanguage } from "@/lib/language-context";
import {
  Star, ShieldCheck, Stamp, Package, Ship, Plane, Truck,
  Warehouse, FileCheck, GitBranch, MapPin, ShoppingCart,
  Heart, UtensilsCrossed, PawPrint, Anchor, AlertTriangle,
  Maximize2, Car, CheckCircle2, ArrowRight,
} from "lucide-react";
import { type Service, SERVICE_CATALOG, SERVICE_META } from "@/lib/service-data";
import { DOOR_TO_DOOR_IMAGE, SERVICE_IMAGES } from "@/lib/service-images";
import { getIntrinsicImageDimensions } from "@/lib/image-dimensions";

// ─── Icon resolver (catalog `icon` string → lucide component) ────────────────
function ServiceIcon({ name, className = "w-6 h-6" }: { name: string; className?: string }) {
  const map: Record<string, React.ElementType> = {
    Ship, Plane, Truck, Package, Warehouse, FileCheck, GitBranch,
    Container: Package, MapPin, ShoppingCart, Calendar: Star, Star,
    Heart, UtensilsCrossed, PawPrint, ShieldCheck,
    Anchor, AlertTriangle, Maximize2, Car, Stamp,
  };
  const Icon = map[name] ?? Package;
  return <Icon className={className} />;
}

// Featured specialties, ordered to match the owner's requested homepage sequence.
const FEATURED_IDS = [11, 19, 4]; // Exhibition · ATA Carnet · Customs Clearance
// Remaining homepage services, in the owner's requested sequence.
const MORE_SERVICE_IDS = [9, 2, 1, 8, 3, 5, 6, 15, 17, 12, 13, 21];
const HOMEPAGE_SERVICE_IDS = new Set([...FEATURED_IDS, ...MORE_SERVICE_IDS]);
const DISCOVERY_SERVICES = SERVICE_CATALOG.filter((service) => !HOMEPAGE_SERVICE_IDS.has(service.id));
const DISCOVERY_HIGHLIGHT_IDS = [7, 16, 23]; // Supply chain · Dangerous goods · Express courier

// Short proof-point bullets for the featured trio.
const HERO_FEATURES: Record<number, { en: string[]; ar: string[] }> = {
  11: {
    en: ["Event freight planning", "Venue access requirements", "Return-routing enquiries"],
    ar: ["تخطيط شحن الفعاليات", "متطلبات دخول الموقع", "استفسارات مسار العودة"],
  },
  19: {
    en: ["Eligibility & document coordination", "Country acceptance varies", "Exhibitions, equipment & samples"],
    ar: ["تنسيق الأهلية والمستندات", "تختلف شروط القبول حسب الدولة", "معارض ومعدات وعينات"],
  },
  4: {
    en: ["Shipment-specific document coordination", "Product approvals where applicable", "Requirements vary by commodity"],
    ar: ["تنسيق المستندات حسب الشحنة", "الموافقات الخاصة بالمنتج عند انطباقها", "تختلف المتطلبات بحسب نوع البضاعة"],
  },
};

const byId = (id: number) => SERVICE_CATALOG.find((s) => s.id === id);

function DiscoverMoreServicesCard({ index }: { index: number }) {
  const { t, isRtl } = useLanguage();
  const highlights = DISCOVERY_HIGHLIGHT_IDS
    .map(byId)
    .filter((service): service is Service => Boolean(service));

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ delay: (index % 3) * 0.07, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="h-full"
    >
      <motion.div
        whileHover={{ y: -5 }}
        transition={{ type: "spring", stiffness: 300, damping: 22 }}
        className="h-full"
      >
        <Link
          href="/services"
          data-testid="discover-more-services-card"
          aria-label={t("Explore all logistics services", "استكشف جميع الخدمات اللوجستية")}
          className={`group relative flex h-full min-h-[260px] flex-col overflow-hidden rounded-[16px] border border-[#DCE5EF] bg-white p-5 shadow-sm transition-all duration-300 hover:border-secondary/40 hover:shadow-[0_18px_44px_-16px_rgba(10,35,66,0.22)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2 ${isRtl ? "text-right" : "text-left"}`}
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-16 -right-12 h-44 w-44 rounded-full bg-secondary/[0.06] transition-transform duration-500 group-hover:scale-125 rtl:right-auto rtl:-left-12"
          />
          <div className={`relative mb-4 flex items-center justify-between gap-3 ${isRtl ? "flex-row-reverse" : ""}`}>
            <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-secondary/10 bg-[#F8FAFC] text-secondary shadow-sm">
              <Package className="h-5 w-5" aria-hidden="true" />
            </span>
            <span className="rounded-full border border-secondary/15 bg-secondary/[0.06] px-2.5 py-1 text-[10px] font-bold tracking-wide text-secondary">
              {t(`${DISCOVERY_SERVICES.length} More Services`, `${DISCOVERY_SERVICES.length} خدمات إضافية`)}
            </span>
          </div>

          <h3 className="relative mb-2 text-base font-black leading-tight text-[#0A2342]">
            {t("Discover More Logistics Services", "اكتشف المزيد من الخدمات اللوجستية")}
          </h3>
          <p className="relative mb-4 text-[12px] leading-relaxed text-[#475569]">
            {t(
              "Explore our complete range of freight, specialist cargo, transportation and logistics solutions for your shipment requirements.",
              "استكشف مجموعة خدمات الشحن والبضائع المتخصصة والنقل والحلول اللوجستية لتلبية متطلبات شحنتك.",
            )}
          </p>

          <div className={`relative mb-4 flex flex-wrap gap-1.5 ${isRtl ? "flex-row-reverse" : ""}`}>
            {highlights.map((service) => (
              <span
                key={service.id}
                className="rounded-full border border-[#E2E8F0] bg-[#F8FAFC] px-2.5 py-1 text-[10px] font-medium text-[#475569]"
              >
                {isRtl ? service.nameAr : service.name}
              </span>
            ))}
          </div>

          <span className={`relative mt-auto inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-secondary transition-all group-hover:gap-3 ${isRtl ? "flex-row-reverse" : ""}`}>
            {t("Explore All Services", "استكشف جميع الخدمات")}
            <ArrowRight className={`h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 ${isRtl ? "rotate-180 group-hover:-translate-x-0.5" : ""}`} />
          </span>
        </Link>
      </motion.div>
    </motion.div>
  );
}

// ─── Featured specialty card ─────────────────────────────────────────────────
function FeaturedCard({ service, index }: { service: Service; index: number }) {
  const { t, isRtl } = useLanguage();
  const meta = SERVICE_META[service.id];
  const slug = meta?.slug ?? "";
  const name = isRtl ? service.nameAr : service.name;
  const desc = isRtl ? service.descriptionAr : service.description;
  const feats = HERO_FEATURES[service.id];
  const features = feats ? (isRtl ? feats.ar : feats.en) : [];
  const image = SERVICE_IMAGES[service.id];

  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ delay: index * 0.08, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className="h-full"
    >
      <motion.div
        whileHover={{ y: -8 }}
        transition={{ type: "spring", stiffness: 300, damping: 22 }}
        className="group relative h-full rounded-[20px] p-[1.5px]"
        style={{ background: "linear-gradient(135deg, rgba(10,35,66,0.35), rgba(214,40,40,0.45))" }}
      >
        <Link
          href={`/services/${slug}`}
          className="relative h-full rounded-[19px] bg-white flex flex-col overflow-hidden shadow-[0_12px_44px_-14px_rgba(10,35,66,0.22)] group-hover:shadow-[0_24px_60px_-16px_rgba(10,35,66,0.30)] transition-shadow duration-300"
        >
          {/* photo header */}
          {image && (
            <div className="relative h-44 overflow-hidden">
              <img
                src={image}
                {...getIntrinsicImageDimensions(image)}
                alt={name}
                loading="lazy"
                decoding="async"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-[600ms] ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-black/5 to-transparent" />
              <span className="absolute top-3.5 right-3.5 rtl:right-auto rtl:left-3.5 z-10 text-[9px] font-black tracking-[0.25em] uppercase text-white bg-secondary/95 px-2.5 py-1 rounded-full shadow-lg shadow-secondary/30">
                {t("Specialty", "تخصص")}
              </span>
            </div>
          )}

          {/* body */}
          <div className="relative p-7 flex flex-col flex-1">
            {/* corner wash for depth */}
            <div
              className="absolute -top-20 -right-20 rtl:right-auto rtl:-left-20 w-52 h-52 rounded-full pointer-events-none"
              style={{ background: "radial-gradient(circle, rgba(214,40,40,0.09), transparent 70%)" }}
            />

            <div className={`relative flex items-center justify-between mb-4 ${isRtl ? "flex-row-reverse" : ""}`}>
              <motion.div
                whileHover={{ rotate: 6, scale: 1.08 }}
                transition={{ type: "spring", stiffness: 300 }}
                className={`w-14 h-14 rounded-2xl flex items-center justify-center ${image ? "-mt-14 bg-white border border-secondary/15 shadow-[0_10px_28px_-10px_rgba(10,35,66,0.45)]" : "bg-secondary/12 border border-secondary/20"}`}
              >
                <ServiceIcon name={service.icon} className="w-7 h-7 text-secondary" />
              </motion.div>
              {!image && (
                <span className="text-[9px] font-black tracking-[0.25em] uppercase text-secondary bg-secondary/10 border border-secondary/20 px-2.5 py-1 rounded-full">
                  {t("Specialty", "تخصص")}
                </span>
              )}
            </div>

            <h3 className={`relative font-black text-lg leading-tight mb-2 ${isRtl ? "text-right" : ""}`} style={{ color: "#0A2342" }}>
              {name}
            </h3>
            <p className={`relative text-sm leading-relaxed mb-5 ${isRtl ? "text-right" : ""}`} style={{ color: "#475569" }}>
              {desc}
            </p>

            <ul className="relative space-y-2.5 mb-7 flex-1">
              {features.map((f, i) => (
                <li key={i} className={`flex items-center gap-2.5 text-[13px] ${isRtl ? "flex-row-reverse text-right" : ""}`} style={{ color: "#334155" }}>
                  <CheckCircle2 className="w-4 h-4 text-secondary shrink-0" />
                  {f}
                </li>
              ))}
            </ul>

            <span
              className={`relative mt-auto inline-flex items-center gap-2 text-sm font-bold text-secondary transition-all group-hover:gap-3 ${isRtl ? "flex-row-reverse" : ""}`}
            >
              {t("Explore Service", "استكشف الخدمة")}
              <ArrowRight className={`w-4 h-4 transition-transform group-hover:translate-x-0.5 ${isRtl ? "rotate-180 group-hover:-translate-x-0.5" : ""}`} />
            </span>
          </div>
        </Link>
      </motion.div>
    </motion.div>
  );
}

// ─── Compact service card ────────────────────────────────────────────────────
function CompactCard({ service, index, doorToDoor = false }: {
  service: Service;
  index: number;
  doorToDoor?: boolean;
}) {
  const { t, isRtl } = useLanguage();
  const meta = SERVICE_META[service.id];
  const slug = meta?.slug ?? "";
  const name = doorToDoor
    ? t("Door-to-Door Logistics", "الخدمات اللوجستية من الباب إلى الباب")
    : isRtl ? service.nameAr : service.name;
  const desc = doorToDoor
    ? t(
      "A single enquiry for coordinated collection and delivery. Route, customs responsibilities, operators and service scope are confirmed for each shipment.",
      "استفسار واحد لتنسيق الاستلام والتسليم. يُؤكد المسار ومسؤوليات الجمارك والجهات المشغّلة ونطاق الخدمة لكل شحنة.",
    )
    : isRtl ? service.descriptionAr : service.description;
  const image = doorToDoor ? DOOR_TO_DOOR_IMAGE : SERVICE_IMAGES[service.id];
  const detailHref = doorToDoor ? "/services/door-to-door" : `/services/${slug}`;

  const content = (
    <>
      {/* photo header */}
      {image && (
        <div className="relative h-32 overflow-hidden">
          <img
            src={image}
            {...getIntrinsicImageDimensions(image)}
            alt={name}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-[600ms] ease-out group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-black/5 to-transparent" />
        </div>
      )}

      {/* body */}
      <div className="relative p-6 flex flex-col flex-1">
        <motion.div
          whileHover={{ rotate: 6, scale: 1.08 }}
          transition={{ type: "spring", stiffness: 300 }}
          className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${image ? "-mt-12 bg-white border border-secondary/10 shadow-[0_10px_24px_-10px_rgba(10,35,66,0.45)]" : "mb-5 bg-[#F1F5F9] group-hover:bg-secondary/12 transition-colors"}`}
        >
          <ServiceIcon name={doorToDoor ? "Truck" : service.icon} className="w-6 h-6 text-secondary" />
        </motion.div>

        <h3 className={`font-bold text-[15px] leading-tight mb-2 ${isRtl ? "text-right" : ""}`} style={{ color: "#0A2342" }}>
          {name}
        </h3>
        <p className={`text-[13px] leading-relaxed mb-5 flex-1 line-clamp-3 ${isRtl ? "text-right" : ""}`} style={{ color: "#475569" }}>
          {desc}
        </p>

        {doorToDoor ? (
          <div className={`mt-auto flex flex-col items-start gap-2 ${isRtl ? "items-end text-right" : ""}`}>
            <span className={`inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-secondary transition-all group-hover:gap-2.5 ${isRtl ? "flex-row-reverse" : ""}`}>
              {t("Explore Service", "استكشف الخدمة")}
              <ArrowRight className={`w-3.5 h-3.5 ${isRtl ? "rotate-180" : ""}`} />
            </span>
            <Link
              href="/contact?service=freight-forwarding&topic=door-to-door"
              className="relative z-20 inline-flex min-h-8 items-center text-xs font-semibold text-[#475569] underline decoration-[#CBD5E1] underline-offset-4 transition-colors hover:text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2"
            >
              {t("Request a Door-to-Door Quote", "اطلب عرض سعر للشحن من الباب إلى الباب")}
            </Link>
          </div>
        ) : (
          <span className={`mt-auto inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-secondary transition-all group-hover:gap-2.5 ${isRtl ? "flex-row-reverse" : ""}`}>
            {t("Explore Service", "استكشف الخدمة")}
            <ArrowRight className={`w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 ${isRtl ? "rotate-180 group-hover:-translate-x-0.5" : ""}`} />
          </span>
        )}
      </div>
    </>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ delay: (index % 3) * 0.07, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="h-full"
    >
      <motion.div
        whileHover={{ y: -6 }}
        transition={{ type: "spring", stiffness: 300, damping: 22 }}
        className="group relative h-full rounded-[18px] p-[1.5px]"
        style={{ background: "linear-gradient(135deg,#E2E8F0,#EEF2F7)" }}
      >
        {/* hover gradient border (navy → red) fades in over the base ring */}
        <div
          className="absolute inset-0 rounded-[18px] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{ background: "linear-gradient(135deg,#0A2342,#D62828)" }}
        />
        {doorToDoor ? (
          <div className="group relative h-full rounded-[16px] bg-white flex flex-col overflow-hidden shadow-sm group-hover:shadow-[0_18px_44px_-16px_rgba(10,35,66,0.22)] transition-shadow duration-300">
            {content}
            <Link
              href={detailHref}
              aria-label={t("Door-to-Door Logistics service details", "تفاصيل خدمة الخدمات اللوجستية من الباب إلى الباب")}
              data-testid="door-to-door-service-card-link"
              className="absolute inset-0 z-10 rounded-[16px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2"
            />
          </div>
        ) : (
          <Link
            href={detailHref}
            className="relative h-full rounded-[16px] bg-white flex flex-col overflow-hidden shadow-sm group-hover:shadow-[0_18px_44px_-16px_rgba(10,35,66,0.22)] transition-shadow duration-300"
          >
            {content}
          </Link>
        )}
      </motion.div>
    </motion.div>
  );
}

export function ServicesSection() {
  const { t, isRtl } = useLanguage();

  const featured = FEATURED_IDS.map(byId).filter((s): s is Service => Boolean(s));
  const grid = MORE_SERVICE_IDS.map(byId).filter((s): s is Service => Boolean(s));

  return (
    <section className="py-32 relative overflow-hidden" style={{ background: "#F8FAFC" }}>
      {/* Subtle light decorative blobs */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] pointer-events-none opacity-[0.04]"
        style={{ background: "radial-gradient(circle, #0A2342 0%, transparent 70%)" }} />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] pointer-events-none opacity-[0.03]"
        style={{ background: "radial-gradient(circle, #D62828 0%, transparent 70%)" }} />

      <div className="container mx-auto px-4 relative z-10">
        {/* ── Heading ── */}
        <div className={`text-center mb-14 ${isRtl ? "rtl" : ""}`}>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-secondary text-[10px] font-bold tracking-[0.4em] uppercase mb-3"
          >
            {t("OUR SPECIALIZATIONS", "تخصصاتنا")}
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-5xl font-black mb-4"
            style={{ color: "#0A2342" }}
          >
            {t("Comprehensive", "خدمات لوجستية")}
            <span className="text-secondary"> {t("Logistics Solutions", "شاملة ومتخصصة")}</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="max-w-2xl mx-auto text-[15px] leading-relaxed"
            style={{ color: "#475569" }}
          >
            {t(
              "Plan your request across customs clearance, exhibition logistics, ATA Carnet documentation, project cargo and GCC freight. Eligibility, route and service scope are confirmed for each shipment.",
              "جهّز طلبك للتخليص الجمركي ولوجستيات المعارض ومستندات كارنيه ATA وشحن المشاريع والنقل الخليجي. وتُؤكد الأهلية والمسار ونطاق الخدمة لكل شحنة على حدة.",
            )}
          </motion.p>
        </div>

        {/* ── Featured specialties ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-6">
          {featured.map((service, i) => (
            <FeaturedCard key={service.id} service={service} index={i} />
          ))}
        </div>

        {/* ── More services ── */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className={`text-[10px] font-bold tracking-[0.35em] uppercase mt-16 mb-6 ${isRtl ? "text-right" : ""}`}
          style={{ color: "#94A3B8" }}
        >
          {t("MORE LOGISTICS SERVICES", "المزيد من الخدمات اللوجستية")}
        </motion.p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {grid.map((service, i) => (
            <CompactCard key={service.id} service={service} index={i} />
          ))}
          {byId(6) && (
            <CompactCard
              key="door-to-door"
              service={byId(6)!}
              index={grid.length}
              doorToDoor
            />
          )}
          <DiscoverMoreServicesCard index={grid.length + 1} />
        </div>

        {/* ── Dual CTA ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15 }}
          className={`flex flex-col sm:flex-row items-center justify-center gap-4 mt-16 ${isRtl ? "sm:flex-row-reverse" : ""}`}
        >
          <Link
            href="/contact"
            className={`inline-flex items-center justify-center gap-2 bg-secondary hover:bg-secondary/90 text-white py-3.5 px-10 rounded-xl font-bold text-sm tracking-wide transition-all shadow-lg shadow-secondary/25 hover:-translate-y-0.5 ${isRtl ? "flex-row-reverse" : ""}`}
          >
            {t("Get a Free Quote", "احصل على عرض سعر مجاني")}
            <ArrowRight className={`w-4 h-4 ${isRtl ? "rotate-180" : ""}`} />
          </Link>
          <Link
            href="/services"
            className="inline-flex items-center justify-center border-2 border-[#0A2342] hover:border-secondary hover:text-secondary text-[#0A2342] py-3.5 px-10 rounded-xl font-bold transition-all text-sm tracking-wide hover:-translate-y-0.5"
          >
            {t("Explore all services", "استكشف جميع الخدمات")}
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
