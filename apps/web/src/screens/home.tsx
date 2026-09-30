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
          <h2 className="text-[22px] font-extrabold text-kbc-navy">Voor jou</h2>
          <button onClick={onOpenSwitch} className="text-[15px] font-bold text-kbc-blue">Alle communicatie</button>
        </div>
        <div className="mt-3 flex flex-col gap-3 px-4">
          {top ? (
            <ForYouCard kate label="Kate Zoom" highlight icon={<KateMark size={30} />} onClick={() => onOpenInsight(top)}>
              <b>Bespaar {eur(top.savingsYear)} {periodLabel(top.period)}</b>
              <span className="block">{top.whyNow}</span>
            </ForYouCard>
          ) : (
            <ForYouCard kate label="Kate Zoom" highlight={!off} icon={<KateMark size={30} />} onClick={off ? onSettings : onOpenSwitch}>
              {off ? "Kate Zoom staat uit. Zet aan om te besparen." : "Je vaste kosten zitten goed. Ik hou ze in het oog."}
            </ForYouCard>
          )}
          {!hidden.has("energy") && (
            <ForYouCard kate icon={<HomeIcon size={30} strokeWidth={1.5} />} onClick={() => nav.demo("Energietips")} onDismiss={() => hide("energy")}>
              Hoge energieprijzen? Met deze tips hou je de warmte binnen in je woning, en de winter buiten.
            </ForYouCard>
          )}
          {!hidden.has("solar") && (
            <ForYouCard icon={<Sun size={30} strokeWidth={1.5} />} onClick={() => nav.demo("Zonnepanelen")} onDismiss={() => hide("solar")}>
              Zonnepanelen, de moeite waard? Ontdek in enkele tikken hoeveel het je kost én hoeveel het je bespaart.
            </ForYouCard>
          )}
          {!hidden.has("card") && (
            <ForYouCard icon={<CreditCard size={30} strokeWidth={1.5} />} onClick={() => nav.demo("KBC-Kredietkaart")} onDismiss={() => hide("card")}>
              Je eigen zin doen met de gratis KBC-Kredietkaart? Vraag ze meteen aan. Let op, geld lenen kost ook geld.
            </ForYouCard>
          )}
        </div>
      </div>
      <BottomNav active="start" />
    </div>
  );
}
