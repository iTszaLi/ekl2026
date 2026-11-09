import type { PillarRelatedLink } from "./service-data";

/**
 * Contextual "Related services" links for non-pillar service pages.
 * Added 2026-11-09 (exhibition city coverage): before this, customs,
 * GCC transport and warehousing pages linked to the exhibition page only
 * from the site-wide footer. Pillar pages keep using pillar.relatedLinks.
 */
export const SERVICE_RELATED_LINKS: Record<string, PillarRelatedLink[]> = {
  "customs-clearance": [
    { label: "Exhibition & Event Logistics", labelAr: "لوجستيات المعارض والفعاليات", href: "/services/exhibition-logistics" },
    { label: "ATA Carnet Coordination", labelAr: "تنسيق كارنيه ATA", href: "/services/ata-carnet" },
    { label: "Freight Forwarding", labelAr: "الشحن وإدارة النقل", href: "/services/freight-forwarding" },
    { label: "GCC Transportation", labelAr: "النقل البري داخل دول مجلس التعاون", href: "/services/gcc-transportation" },
  ],
  "gcc-transportation": [
    { label: "Exhibition Cargo by Road", labelAr: "نقل بضائع المعارض براً", href: "/services/exhibition-logistics" },
    { label: "Customs Clearance", labelAr: "التخليص الجمركي", href: "/services/customs-clearance" },
    { label: "Freight Forwarding", labelAr: "الشحن وإدارة النقل", href: "/services/freight-forwarding" },
    { label: "Project Cargo", labelAr: "شحن المشاريع", href: "/services/project-cargo" },
  ],
  warehousing: [
    { label: "Exhibition Storage & Returns", labelAr: "تخزين المعارض وشحنات العودة", href: "/services/exhibition-logistics" },
    { label: "Packaging & Crating Services", labelAr: "خدمات التغليف والصناديق", href: "/services/packaging-crating" },
    { label: "Customs Clearance", labelAr: "التخليص الجمركي", href: "/services/customs-clearance" },
    { label: "Freight Forwarding", labelAr: "الشحن وإدارة النقل", href: "/services/freight-forwarding" },
  ],
};
