import { useEffect, useRef, useState } from "react";
import { AnimatePresence, MotionConfig, motion, useReducedMotion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import logoIcon from "@assets/image_1780532431289.png";
import { getIntrinsicImageDimensions } from "@/lib/image-dimensions";

export interface AnimChapter {
  startProgress: number;
  endProgress: number;
  title: string;
  titleAr?: string;
  subtitle?: string;
  subtitleAr?: string;
  features?: string[];
  featuresAr?: string[];
  documentSupport?: string[];
  documentSupportAr?: string[];
}

interface Props {
  frameFolder: string;
  /** Retained for API compatibility; playback now uses an encoded video. */
  frameCount?: number;
  chapters: AnimChapter[];
  isRtl?: boolean;
}

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const READABLE_PLAYBACK_RATE = 0.86;

/* ── Floating particles ── */
function particleNoise(index: number, salt: number): number {
  const value = Math.sin((index + 1) * 127.1 + salt * 311.7) * 43758.5453;
  return value - Math.floor(value);
}

const PARTICLES = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  left: `${5 + particleNoise(i, 1) * 90}%`,
  top: `${5 + particleNoise(i, 2) * 90}%`,
  size: 1 + particleNoise(i, 3) * 2,
  delay: particleNoise(i, 4) * 8,
  duration: 6 + particleNoise(i, 5) * 10,
  opacity: 0.06 + particleNoise(i, 6) * 0.12,
}));

export function ScrollAnimSection({
  frameFolder,
  chapters,
  isRtl = false,
}: Props) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const videoRef   = useRef<HTMLVideoElement>(null);
  const logoParallaxRef = useRef<HTMLDivElement>(null);
  const chapterTextRef = useRef<HTMLDivElement>(null);
  const pointerRef = useRef({ clientX: 0, clientY: 0, reset: true });
  const pointerFrameRef = useRef<number | null>(null);
  const shouldReduceMotion = useReducedMotion();
  const reduceMotion = shouldReduceMotion ?? false;

  const [chapterIdx, setChapterIdx] = useState(0);
  const [isVisible,  setIsVisible]  = useState(false);
  const [started,    setStarted]    = useState(false); // src attached after first intersect
  const [isReady,    setIsReady]    = useState(false); // first frame decoded
  const [loadPercent, setLoadPercent] = useState(0);

  // Apply pointer parallax directly once per animation frame, without rerendering
  // the full chapter tree for every mouse event.
  useEffect(() => {
    const el = sectionRef.current;
    if (!el || reduceMotion) return;
    const applyParallax = () => {
      pointerFrameRef.current = null;
      const point = pointerRef.current;
      let x = 0;
      let y = 0;
      if (!point.reset) {
        const rect = el.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          x = ((point.clientX - rect.left) / rect.width - 0.5) * 12;
          y = ((point.clientY - rect.top) / rect.height - 0.5) * 8;
        }
      }
      if (videoRef.current) {
        videoRef.current.style.transform = `translate3d(${x * 0.4}px, ${y * 0.4}px, 0) scale(1.04)`;
      }
      if (logoParallaxRef.current) {
        logoParallaxRef.current.style.transform = `translate3d(${x * 0.4}px, ${y * 0.4}px, 0)`;
      }
      if (chapterTextRef.current) {
        chapterTextRef.current.style.transform = `translate3d(${-x * 0.15}px, ${-y * 0.1}px, 0)`;
      }
    };
    const scheduleParallax = () => {
      if (pointerFrameRef.current === null) {
        pointerFrameRef.current = requestAnimationFrame(applyParallax);
      }
    };
    const handleMove = (e: MouseEvent) => {
      pointerRef.current = { clientX: e.clientX, clientY: e.clientY, reset: false };
      scheduleParallax();
    };
    const handleLeave = () => {
      pointerRef.current.reset = true;
      scheduleParallax();
    };
    el.addEventListener("mousemove", handleMove);
    el.addEventListener("mouseleave", handleLeave);
    return () => {
      el.removeEventListener("mousemove", handleMove);
      el.removeEventListener("mouseleave", handleLeave);
      if (pointerFrameRef.current !== null) {
        cancelAnimationFrame(pointerFrameRef.current);
        pointerFrameRef.current = null;
      }
      if (videoRef.current) videoRef.current.style.transform = "translate3d(0px, 0px, 0) scale(1.04)";
      if (logoParallaxRef.current) logoParallaxRef.current.style.transform = "translate3d(0px, 0px, 0)";
      if (chapterTextRef.current) chapterTextRef.current.style.transform = "translate3d(0px, 0px, 0)";
    };
  }, [reduceMotion]);

  // IntersectionObserver — attach source on first entry, play/pause thereafter
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries[0].isIntersecting;
        setIsVisible(visible);
        if (visible && !reduceMotion) setStarted(true);
      },
      { threshold: 0.15 },
    );
    const el = sectionRef.current;
    if (el) observer.observe(el);
    return () => observer.disconnect();
  }, [reduceMotion]);

  // Keep the poster visible as a sharp fallback; reduced-motion users never
  // download or autoplay the animated background.
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (reduceMotion) {
      v.pause();
      setIsReady(true);
      setLoadPercent(100);
      return;
    }
    if (!started) return;
    v.muted = true;
    v.load();
  }, [reduceMotion, started]);

  // Play only while visible; never clear src (avoids re-download on each pass)
  useEffect(() => {
    const v = videoRef.current;
    if (!v || !started) return;
    if (reduceMotion) {
      v.pause();
    } else if (isVisible) {
      v.muted = true;
      v.playbackRate = READABLE_PLAYBACK_RATE;
      const p = v.play();
      if (p && typeof p.catch === "function") p.catch(() => {});
    } else {
      v.pause();
    }
  }, [isVisible, reduceMotion, started]);

  // Chapter switching + readiness + buffered progress — all driven by the video
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    const onTime = () => {
      const dur = v.duration || 1;
      const progress = v.currentTime / dur;
      let ci = 0;
      for (let i = chapters.length - 1; i >= 0; i--) {
        if (progress >= chapters[i].startProgress) { ci = i; break; }
      }
      setChapterIdx(ci);
    };
    const onLoaded = () => setIsReady(true);
    const onProgress = () => {
      try {
        if (v.buffered.length && v.duration) {
          const pct = Math.min(100, Math.round((v.buffered.end(v.buffered.length - 1) / v.duration) * 100));
          setLoadPercent(pct);
        }
      } catch { /* buffered can throw before metadata */ }
    };
    const onCanPlayThrough = () => setLoadPercent(100);

    v.addEventListener("timeupdate", onTime);
    v.addEventListener("loadeddata", onLoaded);
    v.addEventListener("progress", onProgress);
    v.addEventListener("canplaythrough", onCanPlayThrough);
    return () => {
      v.removeEventListener("timeupdate", onTime);
      v.removeEventListener("loadeddata", onLoaded);
      v.removeEventListener("progress", onProgress);
      v.removeEventListener("canplaythrough", onCanPlayThrough);
    };
  }, [chapters]);

  const chapter     = chapters[chapterIdx];
  const titleParts  = chapter?.title.split(". ").filter(Boolean) ?? [];
  const features    = isRtl ? chapter?.featuresAr : chapter?.features;
  const documentSupport = isRtl ? chapter?.documentSupportAr : chapter?.documentSupport;

  return (
    <MotionConfig reducedMotion="user">
      <motion.section
        ref={sectionRef}
        className="relative h-screen overflow-hidden bg-[#030b18]"
        initial={reduceMotion ? false : { opacity: 0 }}
        whileInView={reduceMotion ? undefined : { opacity: 1 }}
        viewport={{ once: false, amount: 0.2 }}
        transition={{ duration: reduceMotion ? 0 : 1, ease: "easeOut" }}
      >
      {/* Video — with subtle mouse parallax (GPU-composited, decoded on the GPU) */}
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        style={{
          opacity: 1,
          transition: "opacity 0.6s ease",
          transform: "translate3d(0px, 0px, 0) scale(1.04)",
        }}
        muted
        loop
        playsInline
        preload="none"
        poster={`${BASE}/media/${frameFolder}.jpg`}
        aria-hidden="true"
      >
        {started && (
          <>
            <source src={`${BASE}/media/${frameFolder}.webm`} type="video/webm" />
            <source src={`${BASE}/media/${frameFolder}.mp4`} type="video/mp4" />
          </>
        )}
      </video>

      {/* ── Stronger cinematic overlay matching spec ── */}
      <div
        className="absolute inset-0 pointer-events-none z-10"
        style={{ background: "linear-gradient(rgba(5,10,20,.70), rgba(5,10,20,.45), rgba(5,10,20,.75))" }}
      />
      {/* Vignette edges */}
      <div className="absolute inset-0 pointer-events-none z-10" style={{ background: "radial-gradient(ellipse 100% 100% at 50% 50%, transparent 40%, rgba(0,0,0,0.45) 100%)" }} />
      {/* Bottom bleed into next section */}
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background to-transparent pointer-events-none z-10" />

      {/* ── Floating particles ── */}
      <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
        {PARTICLES.map(p => (
          <div
            key={p.id}
            className="absolute rounded-full bg-white"
            style={{
              left: p.left,
              top: p.top,
              width: p.size,
              height: p.size,
              opacity: p.opacity,
              animation: reduceMotion || !isVisible ? "none" : `float-particle ${p.duration}s ease-in-out ${p.delay}s infinite alternate`,
            }}
          />
        ))}
      </div>

      {/* ── ENVOD logo mark — replaces the former sparkle, lower-right ── */}
      <div
        ref={logoParallaxRef}
        className="absolute right-6 bottom-24 md:right-[7%] md:bottom-[20%] z-[15] pointer-events-none"
        style={{ transform: "translate3d(0px, 0px, 0)" }}
      >
        <div style={{ animation: reduceMotion || !isVisible ? "none" : "logo-float 6s ease-in-out infinite alternate" }}>
          <div
            className="relative w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden ring-1 ring-white/20"
            style={{
              background: "radial-gradient(circle,rgba(255,255,255,.10) 0%,rgba(255,255,255,.03) 100%)",
              boxShadow: "0 0 24px rgba(214,40,40,.35), 0 0 52px rgba(214,40,40,.15), inset 0 0 10px rgba(0,0,0,.25)",
            }}
          >
            <img {...getIntrinsicImageDimensions(logoIcon)} src={logoIcon} alt="ENVOD KINGDOM" className="w-full h-full object-cover" />
            <div
              className="absolute inset-0 rounded-full pointer-events-none"
              style={{ background: "radial-gradient(circle at 50% 50%,transparent 55%,rgba(0,0,0,.30) 100%)" }}
            />
          </div>
        </div>
      </div>

      {/* Loading bar */}
      {!reduceMotion && loadPercent < 100 && (
        <div className="absolute top-0 inset-x-0 h-0.5 bg-white/10 z-30">
          <div
            className="h-full bg-secondary transition-all duration-300 ease-out"
            style={{ width: `${loadPercent}%` }}
          />
        </div>
      )}

      {/* Chapter text */}
      <div
        ref={chapterTextRef}
        className={`absolute inset-0 z-20 flex flex-col justify-center ${isRtl ? "items-end" : "items-start"}`}
        style={{ transform: "translate3d(0px, 0px, 0)" }}
        aria-live={reduceMotion ? "polite" : undefined}
      >
        <div className="w-full max-w-7xl mx-auto px-8 md:px-16 xl:px-24">
          <AnimatePresence mode="wait">
            {chapter && (
              <motion.div
                key={chapterIdx}
                initial={{ opacity: 0, y: 36 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -24 }}
                transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] as [number,number,number,number] }}
                className={isRtl ? "text-right" : "text-left"}
              >
                {/* Eyebrow */}
                <motion.p
                  initial={{ opacity: 0, x: isRtl ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15, duration: 0.65 }}
                  className="text-secondary text-xs font-bold tracking-[0.35em] uppercase mb-5"
                >
                  ENVOD KINGDOM SHIPPING SERVICES LLC
                </motion.p>

                {/* Title — word-by-word reveal */}
                <h2 className="text-4xl sm:text-5xl md:text-6xl xl:text-7xl font-black text-white uppercase tracking-tight leading-[1.05] max-w-4xl overflow-hidden">
                  {isRtl && chapter.titleAr ? (
                    <motion.span
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2, duration: 0.9, ease: [0.22,1,0.36,1] as [number,number,number,number] }}
                      className="block"
                    >
                      {chapter.titleAr}
                    </motion.span>
                  ) : (
                    titleParts.map((part, i) => (
                      <motion.span
                        key={i}
                        className="block overflow-hidden"
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 + i * 0.16, duration: 0.9, ease: [0.22,1,0.36,1] as [number,number,number,number] }}
                      >
                        {i === 1 ? (
                          <span className="text-secondary">{part}.</span>
                        ) : (
                          `${part}${i < titleParts.length - 1 ? "." : ""}`
                        )}
                      </motion.span>
                    ))
                  )}
                </h2>

                {/* Subtitle */}
                {chapter.subtitle && (
                  <motion.p
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.75 }}
                    className="mt-6 text-base md:text-lg text-white/65 max-w-2xl font-light leading-relaxed"
                  >
                    {isRtl && chapter.subtitleAr ? chapter.subtitleAr : chapter.subtitle}
                  </motion.p>
                )}

                {/* Premium feature checkmarks */}
                {features && features.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.6 }}
                    className={`mt-5 flex flex-wrap gap-2 md:mt-8 md:gap-3 ${isRtl ? "justify-end" : ""}`}
                  >
                    {features.map((feat, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: isRtl ? 16 : -16 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.55 + i * 0.07, duration: 0.45 }}
                        className={`flex items-center gap-1.5 bg-white/[0.07] backdrop-blur-md border border-white/15 rounded-full px-3 py-1.5 md:gap-2 md:px-4 md:py-2 ${isRtl ? "flex-row-reverse" : ""}`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-secondary flex-none" />
                        <span className="text-white/85 text-[11px] md:text-xs font-semibold whitespace-nowrap">{feat}</span>
                      </motion.div>
                    ))}
                  </motion.div>
                )}

                {documentSupport && documentSupport.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.55, duration: 0.4 }}
                    className={`mt-4 md:mt-5 ${isRtl ? "text-right" : "text-left"}`}
                    role="group"
                    aria-label={isRtl ? "دعم إعداد المستندات حسب الاقتضاء" : "Applicable document preparation support"}
                  >
                    <div className="mb-2 flex flex-wrap items-baseline gap-x-2 gap-y-1 text-[10px] font-bold tracking-[0.16em] uppercase">
                      <span className="text-white/80">
                        {isRtl ? "دعم إعداد المستندات" : "DOCUMENT PREPARATION SUPPORT"}
                      </span>
                      <span className="font-medium tracking-normal normal-case text-[9px] text-white/60">
                        {isRtl ? "حسب ما ينطبق" : "where applicable"}
                      </span>
                    </div>
                    <div dir="ltr" className="flex w-fit max-w-full flex-wrap gap-1 md:gap-2">
                      {documentSupport.map((standard, i) => (
                        <motion.span
                          key={standard}
                          initial={{ opacity: 0, scale: 0.85 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.6 + i * 0.02, duration: 0.2 }}
                          className="inline-flex size-9 md:size-11 shrink-0 items-center justify-center rounded-full border border-white/40 bg-white/[0.12] text-[9px] md:text-[10px] font-bold tracking-tight text-white ring-1 ring-white/20 transition-colors hover:border-secondary/70 hover:bg-secondary/20"
                        >
                          {standard}
                        </motion.span>
                      ))}
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {reduceMotion ? (
        chapters.length > 1 && (
          <div className="absolute inset-x-0 bottom-6 z-30 flex justify-start px-4 md:justify-center">
            <div className="flex items-center gap-3 rounded-full border border-white/15 bg-[#030b18]/90 px-4 py-2 text-white shadow-lg" dir="ltr">
              <button
                type="button"
                aria-label={isRtl ? "المشهد السابق" : "Previous scene"}
                onClick={() => setChapterIdx((current) => (current - 1 + chapters.length) % chapters.length)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-lg hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-secondary"
              >
                <span aria-hidden="true">←</span>
              </button>
              <span aria-live="polite" className="min-w-24 text-center text-xs font-semibold">
                {isRtl ? `المشهد ${chapterIdx + 1} من ${chapters.length}` : `Scene ${chapterIdx + 1} of ${chapters.length}`}
              </span>
              <button
                type="button"
                aria-label={isRtl ? "المشهد التالي" : "Next scene"}
                onClick={() => setChapterIdx((current) => (current + 1) % chapters.length)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-lg hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-secondary"
              >
                <span aria-hidden="true">→</span>
              </button>
            </div>
          </div>
        )
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isReady ? 0.6 : 0 }}
          transition={{ delay: 1 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2"
        >
          <span className="text-white/40 text-[10px] tracking-[0.25em] uppercase">Scroll</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
            className="w-px h-10 bg-gradient-to-b from-white/40 to-transparent"
          />
        </motion.div>
      )}

      <style>{`
        @keyframes logo-float {
          0%   { transform: translateY(0); }
          100% { transform: translateY(-10px); }
        }
        @keyframes float-particle {
          0%   { transform: translate(0, 0) scale(1); }
          100% { transform: translate(12px, -10px) scale(1.12); }
        }
      `}</style>
      </motion.section>
    </MotionConfig>
  );
}
