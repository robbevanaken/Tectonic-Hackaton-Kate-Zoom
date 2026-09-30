import type { ReactNode } from "react";
import { Settings, Search, Bell, Wallet, Newspaper, Home, Route, Pencil, ChevronDown, Star, PlusCircle, ArrowLeftRight, PiggyBank, Briefcase, Layers, List, X } from "lucide-react";

/** Kate's little "sound-wave" mark. */
export function KateMark({ size = 18, className = "" }: { size?: number; className?: string }) {
  return (
    <span className={`inline-flex items-center justify-center rounded-full bg-kbc-blue text-white ${className}`} style={{ width: size, height: size }}>
      <svg viewBox="0 0 20 20" width={size * 0.6} height={size * 0.6} fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
        <path d="M4 10h2M8 6v8M12 3v14M16 7v6" />
      </svg>
    </span>
  );
}

export function KbcHeader({ onSettings, onBell, badge }: { onSettings: () => void; onBell?: () => void; badge?: boolean }) {
  return (
    <div className="flex items-center gap-3 px-4 pt-2">
      <button onClick={onSettings} className="grid h-12 w-12 place-items-center rounded-full bg-white shadow-card" aria-label="Instellingen">
        <Settings size={22} className="text-kbc-text" />
      </button>
      <div className="flex h-12 flex-1 items-center gap-2 rounded-full border border-[#dbe5ef] bg-white px-4 text-kbc-muted">
        <Search size={18} />
        <span className="flex-1 truncate text-[15px]">Hoe kan ik je helpen?</span>
        <KateMark size={16} />
        <span className="text-[15px] font-extrabold text-kbc-navy">Kate</span>
      </div>
      <button onClick={onBell} className="relative grid h-12 w-12 place-items-center rounded-full bg-white shadow-card" aria-label="Meldingen">
        <Bell size={22} className="text-kbc-text" />
        {badge && <span className="absolute right-2.5 top-2.5 h-3 w-3 rounded-full bg-kbc-red ring-2 ring-white" />}
      </button>
    </div>
  );
}

export function Chips() {
  const chip = "flex h-11 items-center gap-2 rounded-full bg-white px-4 text-[15px] font-bold text-kbc-navy shadow-card whitespace-nowrap";
  return (
    <div className="no-scrollbar flex gap-2.5 overflow-x-auto px-4 pt-4">
      <span className="grid h-11 w-14 shrink-0 place-items-center rounded-full bg-kbc-navy text-white"><Wallet size={20} /></span>
      <span className={chip}><Newspaper size={18} />MyNWS</span>
      <span className={chip}><Home size={18} />MyHome</span>
      <span className={chip}><Route size={18} />MyMobility</span>
    </div>
  );
}

function AccountCard({ name, balance, dark }: { name: string; balance: string; dark?: boolean }) {
  return (
    <div className={`relative h-[210px] w-[150px] shrink-0 overflow-hidden rounded-[20px] p-3 text-white shadow-card ${dark ? "bg-gradient-to-br from-[#2A5A96] via-[#1F4B84] to-[#173A67]" : "bg-gradient-to-br from-[#4BC7F4] via-[#2DB0E8] to-[#1A97D6]"}`}>
      <div className="absolute -right-6 -top-10 h-32 w-32 rotate-12 bg-white/10" />
      <div className="absolute -left-10 bottom-0 h-28 w-40 -rotate-12 bg-white/5" />
      <span className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-white/90 text-kbc-blue"><Pencil size={14} /></span>
      <div className="mt-6 flex justify-center"><Wallet size={64} strokeWidth={1.3} /></div>
      <div className="mt-4 rounded-b-[16px] bg-white/95 px-2 pb-2 pt-2 text-kbc-navy">
        <div className="truncate text-[13px] font-extrabold uppercase tracking-wide">{name}</div>
        <div className="mt-0.5 text-[15px] font-bold">{balance}</div>
        <div className="mt-2 h-1.5 rounded-full bg-kbc-sky" />
      </div>
    </div>
  );
}

export function AccountCards({ name }: { name: string }) {
  return (
    <div className="no-scrollbar flex gap-3 overflow-x-auto px-4 pt-4">
      <div className="flex h-[210px] w-[46px] shrink-0 flex-col items-center justify-between rounded-r-[20px] bg-gradient-to-b from-kbc-sky to-kbc-navy py-3 text-white">
        <span className="rotate-180 text-[13px] font-bold [writing-mode:vertical-rl]">3,00 KTC</span>
        <span className="grid h-7 w-7 place-items-center rounded-full bg-white text-[11px] font-black text-kbc-blue">K</span>
      </div>
      <AccountCard name={name} balance="2 348,12 EUR" />
      <AccountCard name="Spaarrekening" balance="7 415,60 EUR" dark />
      <div className="flex shrink-0 flex-col gap-3">
        <span className="flex h-[99px] w-[110px] items-center gap-2 rounded-l-[20px] bg-white px-4 text-[15px] font-bold text-kbc-navy shadow-card"><Star size={20} />Wijzig</span>
        <span className="flex h-[99px] w-[110px] items-center gap-2 rounded-l-[20px] bg-white px-4 text-[15px] font-bold text-kbc-navy shadow-card"><PlusCircle size={20} className="text-kbc-green" />Nieuw</span>
      </div>
    </div>
  );
}

export function ShowPayments() {
  return (
    <button className="mt-4 flex items-center gap-4 px-6 text-[15px] font-bold text-kbc-blue">
      <ChevronDown size={20} /> Toon betalingen
    </button>
  );
}

export function ForYouCard({ icon, children, onClick, kate, highlight }: { icon: ReactNode; children: ReactNode; onClick?: () => void; kate?: boolean; highlight?: boolean }) {
  return (
    <button onClick={onClick} className={`relative flex w-full gap-4 rounded-card bg-white p-4 pr-10 text-left shadow-card ${highlight ? "ring-2 ring-kbc-sky" : ""}`}>
      <span className="absolute -left-1 top-3 h-2.5 w-2.5 rounded-full bg-kbc-red" />
      <span className="mt-1 shrink-0 text-kbc-navy">{icon}</span>
      <span className="min-w-0 flex-1 text-[15px] leading-snug text-kbc-text">
        {kate && (
          <span className="mb-1 flex items-center gap-1.5 font-extrabold text-kbc-navy"><KateMark size={16} />Kate tip</span>
        )}
        {children}
      </span>
      <span className="absolute right-3 top-3 grid h-7 w-7 place-items-center rounded-full bg-kbc-bg text-kbc-muted"><X size={12} /></span>
    </button>
  );
}

export function BottomNav({ active = "start", onStart, fab = true }: { active?: string; onStart?: () => void; fab?: boolean }) {
  const items = [
    { id: "start", label: "Start", icon: Wallet },
    { id: "mijn", label: "Mijn KBC", icon: List },
    { id: "beleggen", label: "Beleggen", icon: PiggyBank },
    { id: "zakelijk", label: "Zakelijk", icon: Briefcase },
    { id: "aanbod", label: "Aanbod", icon: Layers },
  ];
  return (
    <div className="absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-kbc-bg from-40% to-transparent px-3 pb-3 pt-4">
      {fab && <div className="absolute -top-12 right-5 grid h-16 w-16 place-items-center rounded-full bg-kbc-blue text-white shadow-[0_8px_20px_rgba(0,121,193,0.4)]"><ArrowLeftRight size={26} /></div>}
      <div className="flex items-center justify-between rounded-[28px] bg-white px-2 py-2 shadow-[0_-4px_24px_rgba(10,46,92,0.12)]">
        {items.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={id === "start" ? onStart : undefined} className={`flex w-[68px] flex-col items-center gap-1 rounded-[22px] py-2 text-[12px] font-bold ${active === id ? "bg-kbc-bg text-kbc-navy" : "text-kbc-text"}`}>
            <Icon size={24} strokeWidth={active === id ? 2.4 : 1.8} />
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
