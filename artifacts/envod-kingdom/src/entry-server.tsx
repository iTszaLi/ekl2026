import { renderToString } from "react-dom/server";
import App from "./App";

export {
  SITE_URL,
  OG_IMAGE,
  CONTENT_ROUTES,
  getSeoForPath,
  toAbsolute,
  normalizeRoutePath,
} from "./lib/seo-config";

/** Render the app to an HTML string for a given route path (build-time SSG). */
export function render(path: string): string {
  return renderToString(<App ssrPath={path} />);
}
