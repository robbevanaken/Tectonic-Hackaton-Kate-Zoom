import { useEffect } from "react";
import { motion, AnimatePresence, type PanInfo } from "framer-motion";
import { KateMark } from "./kbc";
import { eur, periodLabel } from "@/lib/format";
import type { Insight } from "@/lib/api";

export function Push({ insight, lead, onOpen, onClose }: { insight: Insight | null; lead?: string; onOpen: () => void; onClose: () => void }) {
  // Like a real banner: it slides away on its own; the tip stays in "For you" and Kate Zoom.
  useEffect(() => {
    if (!insight) return;
    const t = setTimeout(onClose, 7000);
    return () => clearTimeout(t);
  }, [insight, onClose]);
  return (
    <AnimatePresence>
      {insight && (
        <motion.div
          key={insight.id}
          initial={{ y: -120, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -120, opacity: 0 }}
          transition={{ type: "spring", stiffness: 380, damping: 32 }}
          drag="y"
          dragConstraints={{ top: 0, bottom: 0 }}
          onDragEnd={(_: unknown, info: PanInfo) => info.offset.y < -40 && onClose()}
          className="absolute inset-x-3 top-12 z-40"
        >
          <button onClick={onOpen} className="flex w-full items-start gap-3 rounded-[22px] bg-white/95 p-3.5 text-left shadow-[0_12px_40px_rgba(0,0,0,0.25)] backdrop-blur">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[10px] bg-kbc-blue text-[13px] font-black text-white">KBC</span>
            <span className="min-w-0 flex-1">
              <span className="flex items-center justify-between text-[12px] text-kbc-muted">
                <span className="flex items-center gap-1 font-bold text-kbc-text"><KateMark size={14} /> Kate</span>
                <span>now</span>
              </span>
              <span className="block text-[14px] font-extrabold leading-tight text-kbc-text">Save about {eur(insight.savingsYear)} {periodLabel(insight.period)}</span>
              <span className="line-clamp-3 block text-[13px] leading-snug text-kbc-text">{lead && <b>{lead} </b>}{insight.moments.filter((m) => m.type !== "budget_squeeze").sort((a, b) => b.weight - a.weight)[0]?.reason ?? insight.whyNow}</span>
            </span>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
