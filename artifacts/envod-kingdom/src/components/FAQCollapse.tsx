import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

/**
 * SEO-safe FAQ collapsible: the answer stays mounted in the DOM (crawlable,
 * matches FAQPage JSON-LD) and collapses via CSS grid-template-rows.
 */
export default function FAQCollapse({
  q,
  a,
  qAr,
  aAr,
  isRtl,
}: {
  q: string;
  a: string;
  qAr: string;
  aAr: string;
  isRtl: boolean;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-white/10 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className={`w-full flex items-center justify-between gap-4 px-6 py-4 text-left hover:bg-white/[0.03] transition-colors ${isRtl ? "flex-row-reverse text-right" : ""}`}
      >
        <span className="text-white font-semibold text-sm leading-snug">{isRtl ? qAr : q}</span>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.25 }}>
          <ChevronDown className="w-4 h-4 text-secondary shrink-0" />
        </motion.div>
      </button>
      <div
        className="grid transition-[grid-template-rows] duration-300 ease-out"
        style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          <div className={`px-6 pb-5 text-white/55 text-sm leading-relaxed border-t border-white/8 pt-4 ${isRtl ? "text-right" : ""}`}>
            {isRtl ? aAr : a}
          </div>
        </div>
      </div>
    </div>
  );
}
