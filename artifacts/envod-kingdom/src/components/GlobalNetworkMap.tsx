import { useMemo, useRef, useState, useEffect } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence, useReducedMotion, useInView } from "framer-motion";
import { geoMercator, geoPath } from "d3-geo";
import { feature } from "topojson-client";
import worldTopo from "world-atlas/countries-110m.json";
import type { LucideIcon } from "lucide-react";
import {
  Building2, Plane, Ship, Truck, Anchor, Warehouse, Globe2, Package,
  FileCheck2, Boxes, ArrowRight, ChevronRight,
  MapPin, Clock, Phone, Mail, Navigation, MessageSquare,
} from "lucide-react";
import { useLanguage } from "@/lib/language-context";
import SAFlag from "country-flag-icons/react/3x2/SA";
import AEFlag from "country-flag-icons/react/3x2/AE";
import BHFlag from "country-flag-icons/react/3x2/BH";
import INFlag from "country-flag-icons/react/3x2/IN";

/* ───────────────────────────── Country flags ─────────────────────────── */
type CountryCode = "SA" | "AE" | "BH" | "IN";
const FLAGS: Record<CountryCode, typeof SAFlag> = { SA: SAFlag, AE: AEFlag, BH: BHFlag, IN: INFlag };
const mapsUrl = (q: string) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;

/** Crisp circular country flag — a 3:2 SVG cropped into a ring-bordered circle. */
function CircleFlag({ code, size = 22, className = "" }: { code: CountryCode; size?: number; className?: string }) {
  const Flag = FLAGS[code];
  return (
    <span
      aria-hidden="true"
      className={`inline-flex items-center justify-center overflow-hidden rounded-full ring-1 ring-white/20 shadow-sm shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      <Flag style={{ height: "100%", width: "auto", maxWidth: "none" }} />
    </span>
  );
}

/** One labelled line (icon + label + value) inside the office info panel. */
function DetailRow({
  icon: Icon, label, value, href, ltr,
}: { icon: LucideIcon; label: string; value: string; href?: string; ltr?: boolean }) {
  const text = (
    <div className="min-w-0">
      <div className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-0.5">{label}</div>
      <div className="text-white/85 text-[13px] leading-snug break-words" dir={ltr ? "ltr" : undefined}>
        {value}
      </div>
    </div>
  );
  return (
    <div className="flex items-start gap-3">
      <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/[0.05] border border-white/10 shrink-0">
        <Icon className="w-4 h-4 text-secondary" />
      </span>
      {href ? (
        <a href={href} className="min-w-0 hover:opacity-80 transition-opacity">{text}</a>
      ) : text}
    </div>
  );
}

/* ───────────────────────── Geometry constants ───────────────────────── */
const VB_W = 1000;
const VB_H = 600;
const PAD = 28;
const EASE = [0.22, 1, 0.36, 1] as const;

// Corner points of the visible region (MultiPoint carries no winding ambiguity).
// Frames Europe (top-left), Africa (bottom-left), the full Middle East / Gulf
// (centre) and India (right) — the geography ENVOD's offices span.
const REGION_BOUNDS = {
  type: "MultiPoint" as const,
  coordinates: [
    [-16, -6],
    [92, -6],
    [-16, 60],
    [92, 60],
  ] as [number, number][],
};

/* ───────────────────────────── Service model ─────────────────────────── */
type ServiceKey =
  | "air" | "sea" | "ocean" | "customs" | "warehouse"
  | "exhibition" | "project" | "intl" | "cross" | "gcc" | "forwarding";

const SERVICE: Record<ServiceKey, { en: string; ar: string; Icon: LucideIcon }> = {
  air: { en: "Air Freight", ar: "الشحن الجوي", Icon: Plane },
  sea: { en: "Sea Freight", ar: "الشحن البحري", Icon: Ship },
  ocean: { en: "Ocean Freight", ar: "الشحن البحري", Icon: Ship },
  customs: { en: "Customs Clearance", ar: "التخليص الجمركي", Icon: FileCheck2 },
  warehouse: { en: "Warehousing", ar: "التخزين", Icon: Warehouse },
  exhibition: { en: "Exhibition Logistics", ar: "لوجستيات المعارض", Icon: Building2 },
  project: { en: "Project Cargo", ar: "بضائع المشاريع", Icon: Boxes },
  intl: { en: "International Freight Forwarding", ar: "الشحن الدولي", Icon: Globe2 },
  cross: { en: "Cross-border Logistics", ar: "الخدمات اللوجستية العابرة للحدود", Icon: Truck },
  gcc: { en: "GCC Distribution", ar: "التوزيع الخليجي", Icon: Truck },
  forwarding: { en: "Freight Forwarding", ar: "وكالة الشحن والتخليص", Icon: Package },
};

/* ───────────────────────────── Office model ──────────────────────────── */
interface Office {
  id: string;
  city: string;
  cityAr: string;
  country: string;
  countryAr: string;
  countryName: string; // world-atlas match
  code: CountryCode;
  lat: number;
  lng: number;
  isHub?: boolean;
  address: string;
  addressAr: string;
  hours: string;
  hoursAr: string;
  phone: string;
  email: string;
  mapsQuery: string;
  gateways: [string, string][]; // [en, ar]
  services: ServiceKey[];
  icon: LucideIcon; // card accent
}

// Single shared point of contact for every office (per company records).
const OFFICE_PHONE = "+966 50 226 0256";
const OFFICE_EMAIL = "info@envodkingdom.net";

const OFFICES: Office[] = [
  {
    id: "riyadh", city: "Riyadh", cityAr: "الرياض",
    country: "Saudi Arabia", countryAr: "المملكة العربية السعودية",
    countryName: "Saudi Arabia", code: "SA", lat: 24.71, lng: 46.68, isHub: true,
    address: "Prince Mansour Bin Abdulaziz St., Al Malaz District, Riyadh 12831",
    addressAr: "شارع الأمير منصور بن عبدالعزيز، حي الملز، الرياض 12831",
    hours: "Sun – Thu · 8:00 AM – 6:00 PM · Sat · 9:00 AM – 2:00 PM", hoursAr: "الأحد – الخميس · 8:00 ص – 6:00 م · السبت · 9:00 ص – 2:00 م",
    phone: OFFICE_PHONE, email: OFFICE_EMAIL,
    mapsQuery: "Envod Kingdom Shipping Services LLC, Al Malaz, Riyadh",
    gateways: [["King Khalid International Airport", "مطار الملك خالد الدولي"]],
    services: ["air", "customs", "warehouse", "exhibition", "project"],
    icon: Building2,
  },
  {
    id: "jeddah", city: "Jeddah", cityAr: "جدة",
    country: "Saudi Arabia", countryAr: "المملكة العربية السعودية",
    countryName: "Saudi Arabia", code: "SA", lat: 21.49, lng: 39.19,
    address: "Near Jeddah Islamic Port, Jeddah",
    addressAr: "بالقرب من ميناء جدة الإسلامي، جدة",
    hours: "Sun – Thu · 8:00 AM – 6:00 PM", hoursAr: "الأحد – الخميس · 8:00 ص – 6:00 م",
    phone: OFFICE_PHONE, email: OFFICE_EMAIL,
    mapsQuery: "Jeddah Islamic Port, Jeddah, Saudi Arabia",
    gateways: [
      ["Jeddah Islamic Port", "ميناء جدة الإسلامي"],
      ["King Abdulaziz International Airport", "مطار الملك عبدالعزيز الدولي"],
    ],
    services: ["sea", "air", "customs", "exhibition"],
    icon: Ship,
  },
  {
    id: "dammam", city: "Dammam", cityAr: "الدمام",
    country: "Saudi Arabia", countryAr: "المملكة العربية السعودية",
    countryName: "Saudi Arabia", code: "SA", lat: 26.43, lng: 50.1,
    address: "King Abdulaziz Port area, Dammam",
    addressAr: "منطقة ميناء الملك عبدالعزيز، الدمام",
    hours: "Sun – Thu · 8:00 AM – 6:00 PM", hoursAr: "الأحد – الخميس · 8:00 ص – 6:00 م",
    phone: OFFICE_PHONE, email: OFFICE_EMAIL,
    mapsQuery: "King Abdulaziz Port, Dammam, Saudi Arabia",
    gateways: [
      ["King Abdulaziz Port", "ميناء الملك عبدالعزيز"],
      ["King Fahd International Airport", "مطار الملك فهد الدولي"],
    ],
    services: ["sea", "air", "project"],
    icon: Anchor,
  },
  {
    id: "dubai", city: "Dubai", cityAr: "دبي",
    country: "United Arab Emirates", countryAr: "الإمارات العربية المتحدة",
    countryName: "United Arab Emirates", code: "AE", lat: 25.2, lng: 55.27,
    address: "Jebel Ali, Dubai",
    addressAr: "جبل علي، دبي",
    hours: "Sun – Thu · 8:00 AM – 6:00 PM", hoursAr: "الأحد – الخميس · 8:00 ص – 6:00 م",
    phone: OFFICE_PHONE, email: OFFICE_EMAIL,
    mapsQuery: "Jebel Ali Port, Dubai, United Arab Emirates",
    gateways: [
      ["Jebel Ali Port", "ميناء جبل علي"],
      ["Al Maktoum International Airport", "مطار آل مكتوم الدولي"],
    ],
    services: ["intl", "cross", "customs"],
    icon: Plane,
  },
  {
    id: "manama", city: "Manama", cityAr: "المنامة",
    country: "Bahrain", countryAr: "البحرين",
    countryName: "Bahrain", code: "BH", lat: 26.23, lng: 50.58,
    address: "Khalifa Bin Salman Port area, Manama",
    addressAr: "منطقة ميناء خليفة بن سلمان، المنامة",
    hours: "Sun – Thu · 8:00 AM – 6:00 PM", hoursAr: "الأحد – الخميس · 8:00 ص – 6:00 م",
    phone: OFFICE_PHONE, email: OFFICE_EMAIL,
    mapsQuery: "Khalifa Bin Salman Port, Manama, Bahrain",
    gateways: [
      ["Khalifa Bin Salman Port", "ميناء خليفة بن سلمان"],
      ["Bahrain International Airport", "مطار البحرين الدولي"],
    ],
    services: ["gcc", "forwarding", "customs"],
    icon: Truck,
  },
  {
    id: "karnataka", city: "Udupi", cityAr: "أودوبي",
    country: "India", countryAr: "الهند",
    countryName: "India", code: "IN", lat: 13.34, lng: 74.75,
    address: "Udupi, Karnataka",
    addressAr: "أودوبي، كارناتاكا",
    hours: "Mon – Sat · 9:00 AM – 6:00 PM", hoursAr: "الاثنين – السبت · 9:00 ص – 6:00 م",
    phone: OFFICE_PHONE, email: OFFICE_EMAIL,
    mapsQuery: "Udupi, Karnataka, India",
    gateways: [
      ["Mangaluru International Airport", "مطار مانجالورو الدولي"],
      ["New Mangalore Port", "ميناء مانجالور الجديد"],
    ],
    services: ["air", "ocean", "exhibition"],
    icon: Warehouse,
  },
];

const OFFICE_COUNTRIES = new Set(OFFICES.map((o) => o.countryName));
// Subtle tint for the wider region ENVOD serves (no route lines — context only).
const SERVED_COUNTRIES = new Set([
  "Qatar", "Kuwait", "Oman", "Yemen", "Jordan", "Iraq", "Egypt", "Turkey",
]);

const STATS: { value: number; suffix: string; en: string; ar: string }[] = [
  { value: 25, suffix: "+", en: "Years Experience", ar: "سنة خبرة" },
  { value: 6, suffix: "", en: "Strategic Offices", ar: "مكاتب استراتيجية" },
  { value: 100, suffix: "+", en: "Global Partners", ar: "شريك عالمي" },
  { value: 24, suffix: "/7", en: "Operations", ar: "عمليات مستمرة" },
];

/* Curved hub-and-spoke route between two projected points. */
function routeD(a: { x: number; y: number }, b: { x: number; y: number }) {
  const mx = (a.x + b.x) / 2;
  const my = (a.y + b.y) / 2;
  const dist = Math.hypot(b.x - a.x, b.y - a.y);
  const lift = Math.min(dist * 0.22, 120);
  return `M ${a.x} ${a.y} Q ${mx} ${my - lift} ${b.x} ${b.y}`;
}

const gatewayIcon = (name: string): LucideIcon => (name.includes("Port") ? Anchor : Plane);

/* ───────────────────────── Animated stat counter ─────────────────────── */
function AnimatedCounter({ value, suffix }: { value: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const reduce = useReducedMotion();
  const [n, setN] = useState(0);

  useEffect(() => {
    if (!inView) return;
    if (reduce) { setN(value); return; }
    let raf = 0;
    const start = performance.now();
    const dur = 1400;
    const tick = (now: number) => {
      const t = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setN(Math.round(eased * value));
      if (t < 1) raf = requestAnimationFrame(tick);
      else setN(value);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, value, reduce]);

  return (
    <span ref={ref}>
      {n}
      <span className="text-secondary">{suffix}</span>
    </span>
  );
}

/* ─────────────────────────── Main component ──────────────────────────── */
export function GlobalNetworkMap() {
  const { t, isRtl } = useLanguage();
  const reduce = useReducedMotion();

  const [hoverId, setHoverId] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);

  // Projection + geometry (language-independent, computed once)
  const { countryPaths, pts } = useMemo(() => {
    const projection = geoMercator().fitExtent(
      [[PAD, PAD], [VB_W - PAD, VB_H - PAD]],
      REGION_BOUNDS as never,
    );
    const pathGen = geoPath(projection);

    const world = feature(
      worldTopo as never,
      (worldTopo as unknown as { objects: { countries: unknown } }).objects.countries as never,
    ) as unknown as { features: Array<{ properties?: { name?: string } }> };

    const countryPaths = world.features
      .map((f) => ({ name: f.properties?.name ?? "", d: pathGen(f as never) }))
      .filter((c): c is { name: string; d: string } => !!c.d);

    const pts: Record<string, { x: number; y: number }> = {};
    for (const o of OFFICES) {
      const p = projection([o.lng, o.lat]);
      if (p) pts[o.id] = { x: p[0], y: p[1] };
    }
    return { countryPaths, pts };
  }, []);

  const hub = pts["riyadh"];

  // Hub-and-spoke routes: Riyadh (HQ) → every branch office.
  const routes = useMemo(() => {
    if (!hub) return [];
    return OFFICES.filter((o) => !o.isHub)
      .map((o) => {
        const p = pts[o.id];
        return p ? { id: o.id, d: routeD(hub, p) } : null;
      })
      .filter((r): r is { id: string; d: string } => !!r);
  }, [hub, pts]);

  // The office the user is interacting with (hover wins over click); may be null.
  const interactId = hoverId ?? activeId;
  // The panel always shows something meaningful — defaults to the HQ.
  const displayId = interactId ?? "riyadh";
  const office = OFFICES.find((o) => o.id === displayId) ?? OFFICES[0];

  // A route is "hot" only during user interaction (static at rest).
  const routeHot = (rid: string) =>
    interactId !== null && (interactId === rid || interactId === "riyadh");

  return (
    <section className="relative overflow-hidden bg-[#040c18]" dir={isRtl ? "rtl" : "ltr"}>
      {/* Static premium backdrop (no moving decoration) */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,#0a1c33_0%,#040c18_72%)] pointer-events-none" />

      <div className="container mx-auto px-5 sm:px-6 pt-24 pb-20 relative z-10">
        {/* ── Header ── */}
        <div className="max-w-3xl mb-12 md:mb-16">
          <motion.div
            initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.5, ease: EASE }}
            className="flex items-center gap-3 mb-5"
          >
            <span className="w-10 h-[2px] bg-secondary" />
            <span className="text-secondary text-xs font-black uppercase tracking-[0.4em]">
              {t("Global Reach", "حضور عالمي")}
            </span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.05, ease: EASE }}
            className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight leading-[1.05]"
          >
            {t("Our Global", "شبكتنا")}{" "}
            <span className="text-secondary">{t("Logistics Network", "اللوجستية العالمية")}</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.1, ease: EASE }}
            className="text-white/60 text-lg md:text-xl leading-relaxed max-w-2xl"
          >
            {t(
              "Connecting Saudi Arabia with the GCC, Asia, Europe and Africa through strategically located offices and trusted, round-the-clock logistics operations.",
              "نربط المملكة العربية السعودية بدول الخليج وآسيا وأوروبا وأفريقيا عبر مكاتب موزعة استراتيجياً وعمليات لوجستية موثوقة على مدار الساعة.",
            )}
          </motion.p>
        </div>

        {/* ── Key statistics ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5 mb-10 md:mb-12">
          {STATS.map((s, i) => (
            <motion.div
              key={s.en}
              initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.45, delay: i * 0.06, ease: EASE }}
              className="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-6 transition-colors duration-300 hover:border-white/20"
            >
              <div className="text-3xl md:text-4xl font-black text-white mb-1.5 tabular-nums">
                <AnimatedCounter value={s.value} suffix={s.suffix} />
              </div>
              <div className="text-[11px] md:text-xs font-semibold text-white/50 uppercase tracking-widest">
                {t(s.en, s.ar)}
              </div>
            </motion.div>
          ))}
        </div>

        {/* ── Map + info panel ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.6, ease: EASE }}
          className="grid lg:grid-cols-[1.55fr_1fr] gap-5 items-stretch"
        >
          {/* Map card */}
          <div
            className="relative rounded-[24px] border border-white/10 overflow-hidden shadow-[0_30px_80px_-40px_rgba(0,0,0,0.85)] flex items-center justify-center min-h-[320px]"
            style={{ background: "linear-gradient(160deg,#071628 0%,#040c18 100%)" }}
            dir="ltr"
          >
            {/* Aspect-locked stage — the svg map and markers align to this box */}
            <div className="relative w-full" style={{ aspectRatio: `${VB_W} / ${VB_H}` }}>
            <svg viewBox={`0 0 ${VB_W} ${VB_H}`} preserveAspectRatio="xMidYMid meet" className="absolute inset-0 w-full h-full">
              <defs>
                <filter id="routeGlow" x="-30%" y="-30%" width="160%" height="160%">
                  <feGaussianBlur stdDeviation="3" />
                </filter>
              </defs>

              {/* Countries */}
              {countryPaths.map((c, i) => {
                const isOffice = OFFICE_COUNTRIES.has(c.name);
                const isServed = SERVED_COUNTRIES.has(c.name);
                return (
                  <path
                    key={`c-${i}`}
                    d={c.d}
                    fill={isOffice ? "#163a5c" : isServed ? "#0f2740" : "#0c1e33"}
                    stroke={isOffice ? "rgba(214,40,40,0.35)" : "rgba(255,255,255,0.06)"}
                    strokeWidth={isOffice ? 0.9 : 0.5}
                    vectorEffect="non-scaling-stroke"
                  />
                );
              })}

              {/* Routes (thin, static; brighten only when connected office is active) */}
              {routes.map((r) => {
                const hot = routeHot(r.id);
                return (
                  <g key={`route-${r.id}`}>
                    <path
                      d={r.d} fill="none" strokeLinecap="round"
                      stroke="#D62828" strokeWidth={6} filter="url(#routeGlow)"
                      vectorEffect="non-scaling-stroke"
                      style={{ opacity: hot ? 0.4 : 0, transition: "opacity 250ms ease" }}
                    />
                    <path
                      d={r.d} fill="none" strokeLinecap="round"
                      vectorEffect="non-scaling-stroke"
                      style={{
                        stroke: hot ? "#ff7a5a" : "rgba(255,255,255,0.16)",
                        strokeWidth: hot ? 1.8 : 1.1,
                        opacity: hot ? 1 : 0.65,
                        transition: "stroke 250ms ease, stroke-width 250ms ease, opacity 250ms ease",
                      }}
                    />
                    {/* single slow pulse — one pass only, never loops at rest */}
                    {hot && !reduce && (
                      <circle r={3} fill="#ffd0c0">
                        <animateMotion dur="3s" repeatCount="1" fill="freeze" path={r.d} />
                        <animate attributeName="opacity" values="0;1;1;0" dur="3s" repeatCount="1" fill="freeze" />
                      </circle>
                    )}
                  </g>
                );
              })}
            </svg>

            {/* Office markers */}
            {OFFICES.map((o) => {
              const p = pts[o.id];
              if (!p) return null;
              const isPanel = displayId === o.id;
              const isHot = interactId === o.id;
              const active = isHot || isPanel;
              const dimmed = interactId !== null && interactId !== o.id;
              return (
                <button
                  key={o.id}
                  type="button"
                  aria-label={t(o.city, o.cityAr)}
                  className="absolute cursor-pointer"
                  style={{
                    left: `${(p.x / VB_W) * 100}%`,
                    top: `${(p.y / VB_H) * 100}%`,
                    transform: "translate(-50%,-50%)",
                    opacity: dimmed ? 0.35 : 1,
                    zIndex: active ? 30 : 20,
                    transition: "opacity 250ms ease",
                  }}
                  onMouseEnter={() => setHoverId(o.id)}
                  onMouseLeave={() => setHoverId(null)}
                  onClick={() => setActiveId(o.id)}
                >
                  <span className="relative flex items-center justify-center">
                    {/* soft highlight ring (hover / active) */}
                    <span
                      className="absolute rounded-full"
                      style={{
                        width: o.isHub ? 44 : 34,
                        height: o.isHub ? 44 : 34,
                        background: o.isHub
                          ? "radial-gradient(circle,rgba(214,40,40,0.55),transparent 70%)"
                          : "radial-gradient(circle,rgba(232,240,251,0.45),transparent 70%)",
                        opacity: active ? 1 : 0,
                        transition: "opacity 250ms ease",
                      }}
                    />
                    {/* selection ring (panel target) */}
                    <span
                      className="absolute rounded-full"
                      style={{
                        width: o.isHub ? 26 : 20,
                        height: o.isHub ? 26 : 20,
                        boxShadow: isPanel
                          ? `0 0 0 2px ${o.isHub ? "rgba(214,40,40,0.9)" : "rgba(232,240,251,0.85)"}`
                          : "none",
                        transition: "box-shadow 250ms ease",
                      }}
                    />
                    {/* dot */}
                    <span
                      className="relative rounded-full ring-2 ring-[#040c18]"
                      style={{
                        width: o.isHub ? 16 : 11,
                        height: o.isHub ? 16 : 11,
                        background: o.isHub ? "#D62828" : "#e8f0fb",
                        boxShadow: o.isHub ? "0 0 14px 2px rgba(214,40,40,0.5)" : "0 0 8px 1px rgba(255,255,255,0.3)",
                        transform: active ? "scale(1.25)" : "scale(1)",
                        transition: "transform 250ms ease",
                      }}
                    />
                  </span>
                  {/* HQ label */}
                  {o.isHub && (
                    <span className="absolute left-1/2 -translate-x-1/2 top-full mt-2 whitespace-nowrap rounded-full bg-secondary px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-white shadow-lg">
                      {t("Head Office", "المقر الرئيسي")}
                    </span>
                  )}
                </button>
              );
            })}
            </div>

            {/* Corner caption */}
            <div className="absolute left-3 top-3 z-30 flex items-center gap-2 rounded-lg border border-white/10 bg-[#06101e]/70 backdrop-blur px-3 py-1.5">
              <Globe2 className="w-3.5 h-3.5 text-secondary" />
              <span className="text-[11px] font-semibold tracking-wide text-white/80">
                {t("Global Operations Network", "شبكة العمليات العالمية")}
              </span>
            </div>

            {/* Legend */}
            <div className="absolute left-3 bottom-3 z-30 hidden sm:flex flex-col gap-2 rounded-xl border border-white/10 bg-[#06101e]/80 backdrop-blur px-3.5 py-3 text-[11px] font-medium text-white/70">
              <span className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-secondary shadow-[0_0_6px_rgba(214,40,40,0.6)] shrink-0" />
                {t("Head Office", "المقر الرئيسي")}
              </span>
              <span className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#e8f0fb] ring-2 ring-[#e8f0fb]/20 shrink-0" />
                {t("Branch Office", "مكتب فرعي")}
              </span>
              <span className="flex items-center gap-2.5">
                <span className="w-4 border-t-2 border-dashed border-white/45 shrink-0" />
                {t("Logistics Network", "الشبكة اللوجستية")}
              </span>
            </div>
          </div>

          {/* Info panel */}
          <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-6 lg:p-7 flex flex-col" dir={isRtl ? "rtl" : "ltr"}>
            <AnimatePresence mode="wait">
              <motion.div
                key={office.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.22, ease: EASE }}
                className="flex flex-col h-full"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <CircleFlag code={office.code} size={34} />
                    <div>
                      <div className="text-white font-black text-xl leading-tight">
                        {isRtl ? office.cityAr : office.city}
                      </div>
                      <div className="text-white/50 text-sm">
                        {isRtl ? office.countryAr : office.country}
                      </div>
                    </div>
                  </div>
                  <span
                    className={`shrink-0 inline-flex items-center rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-wider ${
                      office.isHub ? "bg-secondary/20 text-secondary" : "bg-white/10 text-white/70"
                    }`}
                  >
                    {office.isHub ? t("Head Office", "المقر الرئيسي") : t("Branch Office", "مكتب فرعي")}
                  </span>
                </div>

                {/* Online status */}
                <div className="mt-4 inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
                  {t("Operational · 24/7", "قيد التشغيل · 24/7")}
                </div>

                {/* Contact details */}
                <div className="mt-6 space-y-3.5">
                  <DetailRow icon={MapPin} label={t("Address", "العنوان")} value={isRtl ? office.addressAr : office.address} />
                  <DetailRow icon={Clock} label={t("Business Hours", "ساعات العمل")} value={isRtl ? office.hoursAr : office.hours} />
                  <DetailRow icon={Phone} label={t("Phone", "الهاتف")} value={office.phone} href={`tel:${office.phone.replace(/\s/g, "")}`} ltr />
                  <DetailRow icon={Mail} label={t("Email", "البريد الإلكتروني")} value={office.email} href={`mailto:${office.email}`} ltr />
                </div>

                {/* Nearest gateway */}
                <div className="mt-6">
                  <div className="text-white/40 text-[11px] font-bold uppercase tracking-widest mb-3">
                    {t("Nearest Logistics Gateway", "أقرب منفذ لوجستي")}
                  </div>
                  <ul className="space-y-2.5">
                    {office.gateways.map((g) => {
                      const GwIcon = gatewayIcon(g[0]);
                      return (
                        <li key={g[0]} className="flex items-center gap-3">
                          <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/[0.05] border border-white/10 shrink-0">
                            <GwIcon className="w-4 h-4 text-secondary" />
                          </span>
                          <span className="text-white/85 text-sm leading-snug">{isRtl ? g[1] : g[0]}</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>

                {/* Services */}
                <div className="mt-6">
                  <div className="text-white/40 text-[11px] font-bold uppercase tracking-widest mb-3">
                    {t("Services", "الخدمات")}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {office.services.map((k) => {
                      const s = SERVICE[k];
                      return (
                        <span
                          key={k}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1.5 text-[12px] text-white/80"
                        >
                          <s.Icon className="w-3.5 h-3.5 text-secondary" />
                          {isRtl ? s.ar : s.en}
                        </span>
                      );
                    })}
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-auto pt-6 flex flex-col sm:flex-row gap-2.5">
                  <a
                    href={mapsUrl(office.mapsQuery)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[0.04] px-4 py-2.5 text-[13px] font-bold text-white transition-colors hover:border-white/30 hover:bg-white/[0.08]"
                  >
                    <Navigation className="w-4 h-4 text-secondary" />
                    {t("View on Google Maps", "عرض على خرائط جوجل")}
                  </a>
                  <Link
                    href="/contact"
                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-secondary px-4 py-2.5 text-[13px] font-bold text-white transition-colors hover:bg-secondary/90"
                  >
                    <MessageSquare className="w-4 h-4" />
                    {t("Contact this Office", "تواصل مع المكتب")}
                  </Link>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>

        {/* ── Office cards ── */}
        <div className="mt-10 md:mt-12">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-white font-bold text-lg md:text-xl">{t("Our Offices", "مكاتبنا")}</h3>
            <span className="text-white/40 text-xs hidden md:block">
              {t("Hover a card to explore on the map", "مرّر فوق البطاقة للاستكشاف على الخريطة")}
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {OFFICES.map((o, i) => {
              const isSel = displayId === o.id;
              return (
                <motion.button
                  key={o.id}
                  type="button"
                  initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.05, ease: EASE }}
                  onClick={() => setActiveId(o.id)}
                  onMouseEnter={() => setHoverId(o.id)}
                  onMouseLeave={() => setHoverId(null)}
                  className={`group h-full flex flex-col text-left rounded-2xl border p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_-24px_rgba(0,0,0,0.9)] ${
                    isSel
                      ? "border-secondary/60 bg-secondary/[0.08]"
                      : "border-white/10 bg-white/[0.03] hover:border-secondary/30 hover:bg-white/[0.05]"
                  }`}
                  dir={isRtl ? "rtl" : "ltr"}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className={`flex items-center justify-center w-9 h-9 rounded-xl ${o.isHub ? "bg-secondary/20" : "bg-white/[0.06]"}`}>
                      <o.icon className={`w-4 h-4 ${o.isHub ? "text-secondary" : "text-white/70"}`} />
                    </span>
                    <CircleFlag code={o.code} size={24} />
                  </div>
                  <div className="text-white font-bold text-[15px] leading-tight">{isRtl ? o.cityAr : o.city}</div>
                  <div className="text-white/45 text-xs mb-3">{isRtl ? o.countryAr : o.country}</div>

                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wider ${o.isHub ? "bg-secondary/20 text-secondary" : "bg-white/[0.07] text-white/60"}`}>
                      {o.isHub ? t("Head Office", "المقر الرئيسي") : t("Branch", "فرع")}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-400 shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      {t("Online", "متصل")}
                    </span>
                  </div>

                  {/* Service icons */}
                  <div className="flex items-center gap-1.5">
                    {o.services.slice(0, 4).map((k) => {
                      const s = SERVICE[k];
                      return (
                        <span
                          key={k}
                          title={isRtl ? s.ar : s.en}
                          className="flex items-center justify-center w-6 h-6 rounded-md bg-white/[0.05] border border-white/10"
                        >
                          <s.Icon className="w-3 h-3 text-white/60" />
                        </span>
                      );
                    })}
                  </div>

                  <div className="mt-auto pt-3 flex items-center gap-1 text-[11px] font-semibold text-secondary opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {t("View details", "عرض التفاصيل")}
                    {isRtl ? <ChevronRight className="w-3 h-3 rotate-180" /> : <ArrowRight className="w-3 h-3" />}
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
