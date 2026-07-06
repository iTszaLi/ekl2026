// Dedicated hero photography for individual services. Keys are the service id
// (see SERVICE_META in service-data.ts). Services without an entry keep their
// gradient banner/hero. Imported via the Vite @assets alias so the build emits
// hashed, optimizable asset URLs.
import ocean from "@assets/image_1783175444439.webp";
import air from "@assets/image_1783175451933.webp";
import gcc from "@assets/T1_1783175639406.webp";
import customs from "@assets/image_1783174016086.webp";
import warehousing from "@assets/image_1783175755090.webp";
import freightForwarding from "@assets/image_1783175872287.webp";
import supplyChain from "@assets/image_1783198657064.webp";
import projectCargo from "@assets/image_1783174152080.webp";
import relocation from "@assets/image_1783195652393.webp";
import ecommerce from "@assets/image_1783197074233.webp";
import exhibition from "@assets/image_1783173229953.webp";
import medicalPharma from "@assets/image_1783176444016.webp";
import foodFmcg from "@assets/image_1783195818421.webp";
import petAnimal from "@assets/image_1783197631734.webp";
import breakbulk from "@assets/image_1783176090687.webp";
import dangerousGoods from "@assets/image_1783197745221.webp";
import oog from "@assets/image_1783176354422.webp";
import roro from "@assets/image_1783198399466.webp";
import ataCarnet from "@assets/image_1783173712084.webp";
import whiteGlove from "@assets/service_white_glove_1783201001.webp";
import tempControlled from "@assets/service_temp_controlled_1783201002.webp";
import packagingCrating from "@assets/service_packaging_1783201003.webp";
import expressCourier from "@assets/service_courier_1783201004.webp";
import crossTrade from "@assets/service_cross_trade_1783201005.webp";

/** Service id → dedicated hero image URL. */
export const SERVICE_IMAGES: Record<number, string> = {
  1: ocean, // Ocean Freight
  2: air, // Air Freight
  3: gcc, // GCC Transportation
  4: customs, // Customs Clearance
  5: warehousing, // Warehousing & Distribution
  6: freightForwarding, // Freight Forwarding
  7: supplyChain, // Supply Chain Management
  8: projectCargo, // Project Cargo Logistics
  9: relocation, // House Moving & Relocation
  10: ecommerce, // E-commerce Logistics
  11: exhibition, // Exhibition & Event Logistics
  12: medicalPharma, // Medical & Pharma Logistics
  13: foodFmcg, // Food & FMCG Logistics
  14: petAnimal, // Pet & Animal Import
  15: breakbulk, // Breakbulk Shipping
  16: dangerousGoods, // Dangerous Goods (DG Cargo)
  17: oog, // Oversized / OOG Cargo
  18: roro, // RoRo Shipping
  19: ataCarnet, // ATA Carnet Processing
  20: whiteGlove, // White Glove Logistics
  21: tempControlled, // Temperature Controlled Logistics
  22: packagingCrating, // Packaging & Crating Services
  23: expressCourier, // Express Courier Logistics
  24: crossTrade, // Cross Trade Shipping
};
