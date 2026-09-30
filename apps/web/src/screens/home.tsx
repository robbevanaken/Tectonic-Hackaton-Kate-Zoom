import { Home as HomeIcon, Sun, CreditCard } from "lucide-react";
import { StatusBar } from "@/components/phone";
import { KbcHeader, Chips, AccountCards, ShowPayments, ForYouCard, BottomNav, KateMark } from "@/components/kbc";
import { eur, periodLabel } from "@/lib/format";
import type { Insight } from "@/lib/api";

export function HomeScreen({ name, top, onOpenSwitch, onOpenInsight, onSettings, hasPush }: { name: string; top: Insight | null; onOpenSwitch: () => void; onOpenInsight: (i: Insight) => void; onSettings: () => void; hasPush: boolean }) {
  return (
    <div className="flex h-full flex-col">
      <StatusBar />
      <div className="no-scrollbar flex-1 overflow-y-auto pb-28">
        <KbcHeader onSettings={onSettings} badge={hasPush} />
        <Chips />
        <AccountCards name={name} />
        <ShowPayments />
        <div className="mt-6 flex items-center justify-between px-4">
          <h2 className="text-[22px] font-extrabold text-kbc-navy">Voor jou</h2>
          <button onClick={onOpenSwitch} className="text-[15px] font-bold text-kbc-blue">Alle communicatie</button>
        </div>
        <div className="mt-3 flex flex-col gap-3 px-4">
          {top ? (
            <ForYouCard kate highlight icon={<KateMark size={30} />} onClick={() => onOpenInsight(top)}>
              {top.whyNow} Bij {top.alternative?.provider ?? "een alternatief"} bespaar je zo'n <b>{eur(top.savingsYear)} {periodLabel(top.period)}</b> zonder in te boeten op kwaliteit.
            </ForYouCard>
          ) : (
            <ForYouCard kate icon={<KateMark size={30} />} onClick={onOpenSwitch}>
              Je uitgaven zitten goed. Ik hou je vaste kosten in het oog en verwittig je enkel als het écht loont.
            </ForYouCard>
          )}
          <ForYouCard kate icon={<HomeIcon size={30} strokeWidth={1.5} />}>
            Hoge energieprijzen? Met deze tips hou je de warmte binnen in je woning, en de winter buiten.
          </ForYouCard>
          <ForYouCard icon={<Sun size={30} strokeWidth={1.5} />}>
            Zonnepanelen, de moeite waard? Ontdek in enkele tikken hoeveel het je kost én hoeveel het je bespaart.
          </ForYouCard>
          <ForYouCard icon={<CreditCard size={30} strokeWidth={1.5} />}>
            Je eigen zin doen met de gratis KBC-Kredietkaart? Vraag ze meteen aan. Let op, geld lenen kost ook geld.
          </ForYouCard>
        </div>
      </div>
      <BottomNav active="start" />
    </div>
  );
}
