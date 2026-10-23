import { renderToString } from "react-dom/server";
import App from "./App";
import { preloadRoute } from "./lib/route-pages";

export {
  SITE_URL,
  OG_IMAGE,
  CONTENT_ROUTES,
  getSeoForPath,
  toAbsolute,
  normalizeRoutePath,
} from "./lib/seo-config";

/** Render the app to an HTML string for a given route path (build-time SSG). */
export async function render(path: string): Promise<string> {
  await preloadRoute(path);
  return renderToString(<App ssrPath={path} />);
}
