import type { ReactNode } from "react";
import { Signal, Wifi, BellOff } from "lucide-react";

export function StatusBar() {
  return (
    <div className="flex items-center justify-between px-7 pt-3 pb-1 text-[15px] font-bold text-kbc-text">
      <div className="flex items-center gap-1">
        <span>18:39</span>
        <BellOff size={13} strokeWidth={2.5} />
      </div>
      <div className="flex items-center gap-1.5">
        <Signal size={15} strokeWidth={2.5} />
        <Wifi size={15} strokeWidth={2.5} />
        <span className="rounded-[5px] bg-kbc-text px-1 text-[11px] font-extrabold text-white">73</span>
      </div>
    </div>
  );
}

export function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-full items-center justify-center sm:py-6">
      <div className="relative h-[100dvh] w-full overflow-hidden bg-kbc-bg sm:h-[864px] sm:w-[410px] sm:rounded-[48px] sm:border-[10px] sm:border-[#111] sm:shadow-[0_30px_80px_rgba(0,0,0,0.35)]">
        <div className="pointer-events-none absolute left-1/2 top-2 z-30 hidden h-[30px] w-[120px] -translate-x-1/2 rounded-full bg-[#111] sm:block" />
        {children}
      </div>
    </div>
  );
}
