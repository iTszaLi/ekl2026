import { createRoot, hydrateRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { normalizeRoutePath } from "./lib/seo-config";
import { preloadRoute } from "./lib/route-pages";

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

async function bootstrap() {
  await preloadRoute(currentPath);
  if (isPrerendered) {
    hydrateRoot(container, <App />);
  } else {
    // Unknown/client-only routes must not hydrate another route's markup.
    if (container.firstElementChild) container.innerHTML = "";
    createRoot(container).render(<App />);
  }
}

void bootstrap().catch((error) => {
  console.error("Unable to initialize page interactions", error);
  const notice = document.createElement("p");
  notice.setAttribute("role", "alert");
  notice.className = "p-6 text-white";
  notice.textContent = currentPath.startsWith("/ar")
    ? "تعذر تحميل تفاعلات الصفحة. يرجى تحديث الصفحة."
    : "Page interactions could not load. Please refresh the page.";
  container.appendChild(notice);
});
