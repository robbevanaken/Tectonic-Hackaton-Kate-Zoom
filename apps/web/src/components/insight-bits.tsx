import { Zap, Wifi, Smartphone, Tv, Shield, ShoppingCart, Fuel, Shirt, Coffee, MoreHorizontal, TrendingUp, CalendarClock, Receipt, Copy, Snowflake, Sparkles, Star, Headphones, Undo2, TrendingDown } from "lucide-react";
import type { MonthTotal } from "@/lib/api";
import { MOMENT_LABEL, score } from "@/lib/format";

const ICONS: Record<string, typeof Zap> = {
  energy: Zap, telecom: Wifi, mobile: Smartphone, streaming: Tv, insurance: Shield, groceries: ShoppingCart, fuel: Fuel, fashion: Shirt, leisure: Coffee, electronics: Headphones, other: MoreHorizontal, income: MoreHorizontal,
};

export function CategoryIcon({ category, size = 22, className = "" }: { category: string; size?: number; className?: string }) {
  const Icon = ICONS[category] ?? MoreHorizontal;
  return <Icon size={size} className={className} strokeWidth={1.9} />;
}

const MOMENT_ICON: Record<string, typeof Zap> = {
  price_creep: TrendingUp, contract_window: CalendarClock, post_debit: Receipt, overlap: Copy, seasonal: Snowflake, better_deal: Sparkles, return_window: Undo2, price_drop: TrendingDown,
};

export function MomentPill({ type, strong }: { type: string; strong?: boolean }) {
  const Icon = MOMENT_ICON[type] ?? Sparkles;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[12px] font-bold ${strong ? "bg-kbc-navy text-white" : "bg-[#E6F4FB] text-kbc-blue"}`}>
      <Icon size={12} strokeWidth={2.5} />
      {MOMENT_LABEL[type] ?? type}
    </span>
  );
}

export function Quality({ value }: { value: number }) {
  if (!value) return null;
  return (
    <span className="inline-flex items-center gap-1 text-[13px] font-bold text-kbc-text">
      <Star size={13} className="fill-[#F5B400] text-[#F5B400]" />
      {score(value)}
    </span>
  );
}

/** Tiny bar chart of the monthly cost, with a baseline so a 10-20% creep is visible. */
export function MiniBars({ data, alt }: { data: MonthTotal[]; alt?: number }) {
  if (!data.length) return null;
  const values = data.map((d) => d.total).concat(alt !== undefined ? [alt] : []);
  const max = Math.max(...values);
  const floor = Math.min(...values) * 0.8;
  const px = (v: number) => Math.max(4, ((v - floor) / (max - floor)) * 60);
  return (
    <div className="relative flex h-16 items-end gap-[3px]">
      {alt !== undefined && <div className="absolute inset-x-0 border-t-2 border-dashed border-kbc-green" style={{ bottom: px(alt) }} />}
      {data.map((d, i) => (
        <div key={d.month} className={`flex-1 rounded-t-[3px] ${i === data.length - 1 ? "bg-kbc-blue" : "bg-[#BFDFF3]"}`} style={{ height: px(d.total) }} />
      ))}
    </div>
  );
}
