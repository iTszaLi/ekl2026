import indAutomotive from "@assets/ind_automotive.webp";
import indConstruction from "@assets/ind_construction.webp";
import indRetail from "@assets/ind_retail.webp";
import indFashion from "@assets/ind_fashion.webp";
import indElectronics from "@assets/ind_electronics.webp";
import indAerospace from "@assets/ind_aerospace.webp";
import indHospitality from "@assets/ind_hospitality.webp";
import indFurniture from "@assets/ind_furniture.webp";
import indChemical from "@assets/ind_chemical.webp";
import indTelecom from "@assets/ind_telecom.webp";
import indGovernment from "@assets/ind_government.webp";

/** slug → industry background photo */
export const INDUSTRY_BG: Record<string, string> = {
  "automotive-logistics":         indAutomotive,
  "construction-logistics":       indConstruction,
  "retail-logistics":             indRetail,
  "fashion-logistics":            indFashion,
  "electronics-logistics":        indElectronics,
  "aerospace-logistics":          indAerospace,
  "hospitality-logistics":        indHospitality,
  "furniture-logistics":          indFurniture,
  "chemical-logistics":           indChemical,
  "telecommunications-logistics": indTelecom,
  "government-logistics":         indGovernment,
};
