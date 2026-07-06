import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "@studio-freight/lenis";

let lenis: Lenis | null = null;
let pluginRegistered = false;
let tickerCallback: ((time: number) => void) | null = null;

export function initScrollEngine() {
  if (lenis) return lenis;

  if (!pluginRegistered) {
    gsap.registerPlugin(ScrollTrigger);
    pluginRegistered = true;
  }

  lenis = new Lenis({
    lerp: 0.08,
    wheelMultiplier: 0.9,
  });

  lenis.on("scroll", ScrollTrigger.update);

  tickerCallback = (time: number) => {
    lenis?.raf(time * 1000);
  };
  gsap.ticker.add(tickerCallback);

  gsap.ticker.lagSmoothing(0);

  return lenis;
}

export function destroyScrollEngine() {
  if (tickerCallback) {
    gsap.ticker.remove(tickerCallback);
    tickerCallback = null;
  }
  if (lenis) {
    lenis.destroy();
    lenis = null;
  }
}

export function scrollToTop(immediate = true) {
  if (lenis) {
    lenis.scrollTo(0, { immediate, force: true });
    return;
  }
  if (typeof window !== "undefined") {
    window.scrollTo(0, 0);
  }
}

export { gsap, ScrollTrigger };
