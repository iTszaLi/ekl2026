import { geoMercator, geoPath } from "d3-geo";
import { feature } from "topojson-client";
import worldTopo from "world-atlas/countries-110m.json";

const VB_W = 1000;
const VB_H = 600;
const PAD = 28;

const REGION_BOUNDS = {
  type: "MultiPoint" as const,
  coordinates: [
    [-16, -6],
    [92, -6],
    [-16, 60],
    [92, 60],
  ] as [number, number][],
};

interface OfficeCoordinate {
  id: string;
  lng: number;
  lat: number;
}

export function buildGlobalNetworkMapGeometry(offices: readonly OfficeCoordinate[]) {
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
    .map((country) => ({ name: country.properties?.name ?? "", d: pathGen(country as never) }))
    .filter((country): country is { name: string; d: string } => !!country.d);

  const pts: Record<string, { x: number; y: number }> = {};
  for (const office of offices) {
    const point = projection([office.lng, office.lat]);
    if (point) pts[office.id] = { x: point[0], y: point[1] };
  }

  return { countryPaths, pts };
}
