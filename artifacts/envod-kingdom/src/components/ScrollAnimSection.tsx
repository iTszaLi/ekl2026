import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import logoIcon from "@assets/image_1780532431289.png";

export interface AnimChapter {
  startProgress: number;
  endProgress: number;
  title: string;
  titleAr?: string;
  subtitle?: string;
  subtitleAr?: string;
  features?: string[];
  featuresAr?: string[];
}

interface Props {
  frameFolder: string;
  /** Retained for API compatibility; playback now uses an encoded video. */
  frameCount?: number;
  chapters: AnimChapter[];
  isRtl?: boolean;
}

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

/* ── Floating particles ── */
const PARTICLES = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  left:     `${5 + Math.random() * 90}%`,
  top:      `${5 + Math.random() * 90}%`,
  size:     1 + Math.random() * 2,
  delay:    Math.random() * 8,
  duration: 6 + Math.random() * 10,
  opacity:  0.06 + Math.random() * 0.12,
}));

export function ScrollAnimSection({
  frameFolder,
  chapters,
  isRtl = false,
}: Props) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const videoRef   = useRef<HTMLVideoElement>(null);

  const [chapterIdx, setChapterIdx] = useState(0);
  const [isVisible,  setIsVisible]  = useState(false);
  const [started,    setStarted]    = useState(false); // src attached after first intersect
  const [isReady,    setIsReady]    = useState(false); // first frame decoded
  const [loadPercent, setLoadPercent] = useState(0);
  const [mouse,      setMouse]      = useState({ x: 0, y: 0 });

  // Mouse parallax
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const handleMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      setMouse({
        x: ((e.clientX - rect.left) / rect.width  - 0.5) * 12,
        y: ((e.clientY - rect.top)  / rect.height - 0.5) * 8,
      });
    };
    el.addEventListener("mousemove", handleMove);
    return () => el.removeEventListener("mousemove", handleMove);
  }, []);

  // IntersectionObserver — attach source on first entry, play/pause thereafter
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries[0].isIntersecting;
        setIsVisible(visible);
        if (visible) setStarted(true);
      },
      { threshold: 0.15 },
    );
    const el = sectionRef.current;
    if (el) observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Lazy-load the video the first time the section is seen
  useEffect(() => {
    if (!started) return;
    const v = videoRef.current;
    if (!v) return;
    v.muted = true;
    v.load();
  }, [started]);

  // Play only while visible; never clear src (avoids re-download on each pass)
  useEffect(() => {
    const v = videoRef.current;
    if (!v || !started) return;
    if (isVisible) {
      v.muted = true;
      const p = v.play();
      if (p && typeof p.catch === "function") p.catch(() => {});
    } else {
      v.pause();
    }
  }, [isVisible, started]);

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

  return (
    <motion.section
      ref={sectionRef}
      className="relative h-screen overflow-hidden bg-[#030b18]"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: false, amount: 0.2 }}
      transition={{ duration: 1, ease: "easeOut" }}
    >
      {/* Video — with subtle mouse parallax (GPU-composited, decoded on the GPU) */}
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        style={{
          opacity: isReady ? 1 : 0,
          transition: "opacity 0.6s ease, transform 0.8s ease",
          transform: `translate(${mouse.x * 0.4}px, ${mouse.y * 0.4}px) scale(1.04)`,
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
              animation: `float-particle ${p.duration}s ease-in-out ${p.delay}s infinite alternate`,
            }}
          />
        ))}
      </div>

      {/* ── ENVOD logo mark — replaces the former sparkle, lower-right ── */}
      <div
        className="absolute right-6 bottom-24 md:right-[7%] md:bottom-[20%] z-[15] pointer-events-none"
        style={{
          transform: `translate(${mouse.x * 0.4}px, ${mouse.y * 0.4}px)`,
          transition: "transform 0.3s ease-out",
        }}
      >
        <div style={{ animation: "logo-float 6s ease-in-out infinite alternate" }}>
          <div
            className="relative w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden ring-1 ring-white/20"
            style={{
              background: "radial-gradient(circle,rgba(255,255,255,.10) 0%,rgba(255,255,255,.03) 100%)",
              boxShadow: "0 0 24px rgba(214,40,40,.35), 0 0 52px rgba(214,40,40,.15), inset 0 0 10px rgba(0,0,0,.25)",
            }}
          >
            <img src={logoIcon} alt="ENVOD KINGDOM" className="w-full h-full object-cover" />
            <div
              className="absolute inset-0 rounded-full pointer-events-none"
              style={{ background: "radial-gradient(circle at 50% 50%,transparent 55%,rgba(0,0,0,.30) 100%)" }}
            />
          </div>
        </div>
      </div>

      {/* Loading bar */}
      {loadPercent < 100 && (
        <div className="absolute top-0 inset-x-0 h-0.5 bg-white/10 z-30">
          <div
            className="h-full bg-secondary transition-all duration-300 ease-out"
            style={{ width: `${loadPercent}%` }}
          />
        </div>
      )}

      {/* Chapter text */}
      <div
        className={`absolute inset-0 z-20 flex flex-col justify-center ${isRtl ? "items-end" : "items-start"}`}
        style={{ transform: `translate(${-mouse.x * 0.15}px, ${-mouse.y * 0.1}px)` }}
      >
        <div className="w-full max-w-7xl mx-auto px-8 md:px-16 xl:px-24">
          <AnimatePresence mode="wait">
            {chapter && (
              <motion.div
                key={chapterIdx}
                initial={{ opacity: 0, y: 48 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -24 }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] as [number,number,number,number] }}
                className={isRtl ? "text-right" : "text-left"}
              >
                {/* Eyebrow */}
                <motion.p
                  initial={{ opacity: 0, x: isRtl ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1, duration: 0.5 }}
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
                      transition={{ delay: 0.15, duration: 0.7, ease: [0.22,1,0.36,1] as [number,number,number,number] }}
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
                        transition={{ delay: 0.15 + i * 0.12, duration: 0.7, ease: [0.22,1,0.36,1] as [number,number,number,number] }}
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
                    transition={{ delay: 0.38, duration: 0.6 }}
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
                    className={`mt-8 flex flex-wrap gap-3 ${isRtl ? "justify-end" : ""}`}
                  >
                    {features.map((feat, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: isRtl ? 16 : -16 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.55 + i * 0.07, duration: 0.45 }}
                        className={`flex items-center gap-2 bg-white/[0.07] backdrop-blur-md border border-white/15 rounded-full px-4 py-2 ${isRtl ? "flex-row-reverse" : ""}`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-secondary flex-none" />
                        <span className="text-white/85 text-xs font-semibold whitespace-nowrap">{feat}</span>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Scroll cue */}
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

      <style>{`
        @keyframes logo-float {
          0%   { transform: translateY(0); }
          100% { transform: translateY(-10px); }
        }
        @keyframes float-particle {
          0%   { transform: translate(0, 0) scale(1); }
          100% { transform: translate(${Math.random() > 0.5 ? "" : "-"}${8 + Math.floor(Math.random() * 16)}px, ${Math.random() > 0.5 ? "" : "-"}${8 + Math.floor(Math.random() * 12)}px) scale(${0.8 + Math.random() * 0.6}); }
        }
      `}</style>
    </motion.section>
  );
}
