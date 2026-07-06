import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, MapPin, Calendar, Tag } from "lucide-react";
import { useLanguage } from "@/lib/language-context";
import {
  type GalleryItem,
  buildSrcSet,
  largestSrc,
  categoryLabel,
  formatMonthYear,
  galleryTitle,
  galleryDescription,
  galleryLocation,
  galleryAltText,
} from "@/lib/gallery";

interface GalleryLightboxProps {
  items: GalleryItem[];
  index: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

export function GalleryLightbox({ items, index, onClose, onNavigate }: GalleryLightboxProps) {
  const { t, isRtl } = useLanguage();
  const item = items[index];
  const total = items.length;
  const [zoomed, setZoomed] = useState(false);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const dragState = useRef<{
    dragging: boolean;
    moved: boolean;
    startX: number;
    startY: number;
    baseX: number;
    baseY: number;
  }>({
    dragging: false,
    moved: false,
    startX: 0,
    startY: 0,
    baseX: 0,
    baseY: 0,
  });
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  const goPrev = useCallback(() => {
    if (total <= 1) return;
    onNavigate((index - 1 + total) % total);
  }, [index, total, onNavigate]);

  const goNext = useCallback(() => {
    if (total <= 1) return;
    onNavigate((index + 1) % total);
  }, [index, total, onNavigate]);

  // Reset zoom/pan whenever the visible item changes
  useEffect(() => {
    setZoomed(false);
    setPan({ x: 0, y: 0 });
  }, [index]);

  // Keyboard navigation + lock body scroll
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowLeft") goPrev();
      else if (e.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose, goPrev, goNext]);

  if (!item) return null;

  const handleTouchStart = (e: React.TouchEvent) => {
    if (zoomed) return;
    const touch = e.touches[0];
    touchStart.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (zoomed || !touchStart.current) return;
    const touch = e.changedTouches[0];
    const dx = touch.clientX - touchStart.current.x;
    const dy = touch.clientY - touchStart.current.y;
    touchStart.current = null;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
      if (dx > 0) goPrev();
      else goNext();
    }
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (!zoomed) return;
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    dragState.current = {
      dragging: true,
      moved: false,
      startX: e.clientX,
      startY: e.clientY,
      baseX: pan.x,
      baseY: pan.y,
    };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!zoomed || !dragState.current.dragging) return;
    const dx = e.clientX - dragState.current.startX;
    const dy = e.clientY - dragState.current.startY;
    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) dragState.current.moved = true;
    setPan({ x: dragState.current.baseX + dx, y: dragState.current.baseY + dy });
  };

  const onPointerUp = () => {
    dragState.current.dragging = false;
  };

  const toggleZoom = () => {
    setZoomed((z) => {
      if (z) setPan({ x: 0, y: 0 });
      return !z;
    });
  };

  // Suppress the zoom toggle if this click concluded a pan drag.
  const handleImageClick = () => {
    if (dragState.current.moved) {
      dragState.current.moved = false;
      return;
    }
    toggleZoom();
  };

  const monthLabel = formatMonthYear(item.monthYear);
  const title = galleryTitle(item, isRtl);
  const description = galleryDescription(item, isRtl);
  const location = galleryLocation(item, isRtl);

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] flex flex-col bg-black/95 backdrop-blur-sm select-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onContextMenu={(e) => e.preventDefault()}
      >
        {/* Top bar */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 text-white/80 relative z-20">
          <span className="text-sm font-semibold tracking-wide tabular-nums">
            {index + 1} / {total}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleZoom}
              aria-label={zoomed ? t("Zoom out", "تصغير") : t("Zoom in", "تكبير")}
              className="p-2 rounded-full hover:bg-white/10 transition-colors"
            >
              {zoomed ? <ZoomOut className="w-5 h-5" /> : <ZoomIn className="w-5 h-5" />}
            </button>
            <button
              onClick={onClose}
              aria-label={t("Close", "إغلاق")}
              className="p-2 rounded-full hover:bg-white/10 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Stage */}
        <div
          className="flex-1 relative flex items-center justify-center overflow-hidden px-2 sm:px-16"
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {total > 1 && (
            <button
              onClick={goPrev}
              aria-label={t("Previous", "السابق")}
              className="hidden sm:flex absolute left-4 z-20 p-3 rounded-full bg-white/5 hover:bg-white/15 text-white transition-colors"
            >
              <ChevronLeft className="w-7 h-7" />
            </button>
          )}

          <AnimatePresence mode="wait">
            <motion.img
              key={item.id}
              src={largestSrc(item)}
              srcSet={buildSrcSet(item)}
              sizes="100vw"
              width={item.width}
              height={item.height}
              alt={galleryAltText(item, isRtl)}
              draggable={false}
              onClick={handleImageClick}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="max-h-[72vh] max-w-full object-contain rounded-lg shadow-2xl"
              style={{
                cursor: zoomed ? "grab" : "zoom-in",
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoomed ? 2 : 1})`,
                transition: dragState.current.dragging ? "none" : "transform 0.25s ease",
                WebkitUserSelect: "none",
                userSelect: "none",
                WebkitUserDrag: "none",
              } as React.CSSProperties}
            />
          </AnimatePresence>

          {total > 1 && (
            <button
              onClick={goNext}
              aria-label={t("Next", "التالي")}
              className="hidden sm:flex absolute right-4 z-20 p-3 rounded-full bg-white/5 hover:bg-white/15 text-white transition-colors"
            >
              <ChevronRight className="w-7 h-7" />
            </button>
          )}
        </div>

        {/* Caption */}
        <div className="px-4 sm:px-8 py-5 bg-gradient-to-t from-black/80 to-transparent relative z-20">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-white text-lg sm:text-2xl font-bold mb-2">{title}</h2>
            <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 text-xs sm:text-sm text-white/60 mb-2">
              <span className="flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-secondary" />
                {categoryLabel(item.category, t)}
              </span>
              {location && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-secondary" />
                  {location}
                </span>
              )}
              {monthLabel && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-secondary" />
                  {monthLabel}
                </span>
              )}
            </div>
            {description && (
              <p className="text-white/50 text-sm max-w-2xl mx-auto leading-relaxed">{description}</p>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
