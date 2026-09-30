import { useState } from "react";
import { Home as HomeIcon, Sun, CreditCard } from "lucide-react";
import { useNav } from "@/lib/nav";
import { StatusBar } from "@/components/phone";
import { KbcHeader, Chips, AccountCards, ShowPayments, ForYouCard, BottomNav, KateMark } from "@/components/kbc";
import { eur, periodLabel } from "@/lib/format";
import type { Insight } from "@/lib/api";

export function HomeScreen({ name, off, top, onOpenSwitch, onOpenInsight, onSettings, hasPush }: { name: string; off: boolean; top: Insight | null; onOpenSwitch: () => void; onOpenInsight: (i: Insight) => void; onSettings: () => void; hasPush: boolean }) {
  const nav = useNav();
  const [hidden, setHidden] = useState<Set<string>>(new Set());
  const hide = (id: string) => setHidden(new Set(hidden).add(id));
  return (
    <div className="flex h-full flex-col">
      <StatusBar />
      <div className="no-scrollbar flex-1 overflow-y-auto pb-28">
        <KbcHeader onSettings={onSettings} onBell={onOpenSwitch} badge={hasPush} />
        <Chips />
        <AccountCards name={name} />
        <ShowPayments />
        <div className="mt-6 flex items-center justify-between px-4">
          <h2 className="text-[22px] font-extrabold text-kbc-navy">For you</h2>
          <button onClick={onOpenSwitch} className="text-[15px] font-bold text-kbc-blue">All messages</button>
        </div>
        <div className="mt-3 flex flex-col gap-3 px-4">
          {top ? (
            <ForYouCard kate label="Kate Zoom" highlight icon={<KateMark size={30} />} onClick={onOpenSwitch}>
              <b>Save {eur(top.savingsYear)} {periodLabel(top.period)}</b>
              <span className="block">{top.whyNow}</span>
            </ForYouCard>
          ) : (
            <ForYouCard kate label="Kate Zoom" highlight={!off} icon={<KateMark size={30} />} onClick={onOpenSwitch}>
              {off ? "Kate Zoom is off. Turn it on to start saving." : "Your fixed costs look good. I'll keep an eye on them."}
            </ForYouCard>
          )}
          {!hidden.has("energy") && (
            <ForYouCard kate icon={<HomeIcon size={30} strokeWidth={1.5} />} onClick={() => nav.demo("Energy tips")} onDismiss={() => hide("energy")}>
              High energy prices? These tips keep the warmth in your home and the winter out.
            </ForYouCard>
          )}
          {!hidden.has("solar") && (
            <ForYouCard icon={<Sun size={30} strokeWidth={1.5} />} onClick={() => nav.demo("Solar panels")} onDismiss={() => hide("solar")}>
              Solar panels, worth it? Find out in a few taps what they cost and what they save you.
            </ForYouCard>
          )}
          {!hidden.has("card") && (
            <ForYouCard icon={<CreditCard size={30} strokeWidth={1.5} />} onClick={() => nav.demo("KBC credit card")} onDismiss={() => hide("card")}>
              Do things your way with the free KBC credit card? Apply right away. Note: borrowing money also costs money.
            </ForYouCard>
          )}
        </div>
      </div>
      <BottomNav active="start" />
    </div>
  );
}
