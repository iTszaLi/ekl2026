import { createRoot, hydrateRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { normalizeRoutePath } from "./lib/seo-config";

const container = document.getElementById("root")!;
const base = import.meta.env.BASE_URL.replace(/\/$/, "");

function stripBase(pathname: string): string {
  let out = pathname;
  if (base && out.startsWith(base)) out = out.slice(base.length);
  return normalizeRoutePath(out);
}

const ssrPath = container.getAttribute("data-ssr-path");
const currentPath = stripBase(window.location.pathname);
const isPrerendered =
  ssrPath !== null &&
  container.firstElementChild !== null &&
  normalizeRoutePath(ssrPath) === currentPath;

if (isPrerendered) {
  hydrateRoot(container, <App />);
} else {
  // Fallback HTML (e.g. SPA-only routes served the home shell) — render fresh
  // to avoid hydrating markup that does not match the current route.
  if (container.firstElementChild) container.innerHTML = "";
  createRoot(container).render(<App />);
}
