import { useState, type ReactNode } from "react";
import { useNav } from "@/lib/nav";
import { api, type Tx } from "@/lib/api";
import { eur, formatDate } from "@/lib/format";
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
  const nav = useNav();
  return (
    <div className="flex items-center gap-3 px-4 pt-2">
      <button onClick={onSettings} className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-white shadow-card" aria-label="Settings">
        <Settings size={22} className="text-kbc-text" />
      </button>
      <button onClick={() => nav.demo("Kate")} className="flex h-12 min-w-0 flex-1 items-center gap-2 rounded-full border border-[#dbe5ef] bg-white px-4 text-kbc-muted">
        <Search size={18} />
        <span className="flex-1 truncate text-[15px]">How can I help you?</span>
        <KateMark size={16} />
        <span className="text-[15px] font-extrabold text-kbc-navy">Kate</span>
      </button>
      <button onClick={onBell} className="relative grid h-12 w-12 shrink-0 place-items-center rounded-full bg-white shadow-card" aria-label="Notifications">
        <Bell size={22} className="text-kbc-text" />
        {badge && <span className="absolute right-2.5 top-2.5 h-3 w-3 rounded-full bg-kbc-red ring-2 ring-white" />}
      </button>
    </div>
  );
}

export function Chips() {
  const nav = useNav();
  const chip = "flex h-11 items-center gap-2 rounded-full bg-white px-4 text-[15px] font-bold text-kbc-navy shadow-card whitespace-nowrap";
  return (
    <div className="no-scrollbar flex gap-2.5 overflow-x-auto px-4 pt-4">
      <button onClick={nav.home} aria-label="Accounts" className="grid h-11 w-14 shrink-0 place-items-center rounded-full bg-kbc-navy text-white"><Wallet size={20} /></button>
      <button onClick={() => nav.demo("MyNWS")} className={chip}><Newspaper size={18} />MyNWS</button>
      <button onClick={() => nav.demo("MyHome")} className={chip}><Home size={18} />MyHome</button>
      <button onClick={() => nav.demo("MyMobility")} className={chip}><Route size={18} />MyMobility</button>
    </div>
  );
}

function AccountCard({ name, balance, dark }: { name: string; balance: string; dark?: boolean }) {
  const nav = useNav();
  return (
    <button onClick={() => nav.demo(name)} className={`relative flex h-[210px] w-[150px] shrink-0 flex-col overflow-hidden rounded-[20px] text-left text-white shadow-card ${dark ? "bg-gradient-to-br from-[#2A5A96] via-[#1F4B84] to-[#173A67]" : "bg-gradient-to-br from-[#4BC7F4] via-[#2DB0E8] to-[#1A97D6]"}`}>
      <div className="absolute -right-6 -top-10 h-32 w-32 rotate-12 bg-white/10" />
      <div className="absolute -left-10 bottom-0 h-28 w-40 -rotate-12 bg-white/5" />
      <span className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-white/90 text-kbc-blue"><Pencil size={14} /></span>
      <div className="relative grid flex-1 place-items-center"><Wallet size={56} strokeWidth={1.3} /></div>
      <div className="relative bg-white/95 px-3 pb-3 pt-2.5 text-kbc-navy">
        <div className="truncate text-[13px] font-extrabold uppercase tracking-wide">{name}</div>
        <div className="mt-0.5 text-[15px] font-bold">{balance}</div>
        <div className="mt-2 h-1.5 rounded-full bg-kbc-sky" />
      </div>
    </button>
  );
}

export function AccountCards({ name }: { name: string }) {
  const nav = useNav();
  return (
    <div className="no-scrollbar flex gap-3 overflow-x-auto pr-4 pt-4">
      <button onClick={() => nav.demo("Kate Coins")} className="flex h-[210px] w-[46px] shrink-0 flex-col items-center justify-between rounded-r-[20px] bg-gradient-to-b from-kbc-sky to-kbc-navy py-3 text-white">
        <span className="rotate-180 text-[13px] font-bold [writing-mode:vertical-rl]">3.00 KTC</span>
        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white text-[11px] font-black text-kbc-blue">K</span>
      </button>
      <AccountCard name={name} balance="€2,348.12" />
      <AccountCard name="Savings account" balance="€7,415.60" dark />
      <div className="flex shrink-0 flex-col gap-3">
        <button onClick={() => nav.demo("Edit favourites")} className="flex h-[99px] w-[110px] items-center gap-2 rounded-l-[20px] bg-white px-4 text-[15px] font-bold text-kbc-navy shadow-card"><Star size={20} />Edit</button>
        <button onClick={() => nav.demo("New account")} className="flex h-[99px] w-[110px] items-center gap-2 rounded-l-[20px] bg-white px-4 text-[15px] font-bold text-kbc-navy shadow-card"><PlusCircle size={20} className="text-kbc-green" />New</button>
      </div>
    </div>
  );
}

/** Expands the latest payments, like the real app. */
export function ShowPayments() {
  const [open, setOpen] = useState(false);
  const [txs, setTxs] = useState<Tx[] | null>(null);
  const toggle = () => {
    setOpen(!open);
    if (!txs) api.transactions(6).then((r) => setTxs(r.transactions)).catch(() => setTxs([]));
  };
  return (
    <>
      <button onClick={toggle} className="mt-4 flex items-center gap-4 px-6 text-[15px] font-bold text-kbc-blue">
        <ChevronDown size={20} className={`transition ${open ? "rotate-180" : ""}`} /> {open ? "Hide payments" : "Show payments"}
      </button>
      {open && (
        <div className="mx-4 mt-2 overflow-hidden rounded-card bg-white shadow-card">
          {(txs ?? []).map((t, i) => (
            <div key={t.id} className={`flex items-center gap-3 px-4 py-2.5 ${i ? "border-t border-kbc-bg" : ""}`}>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[14px] font-bold text-kbc-text">{t.merchantName}</span>
                <span className="block text-[12px] text-kbc-muted">{formatDate(t.date)}</span>
              </span>
              <span className={`shrink-0 text-[14px] font-bold ${t.amount > 0 ? "text-kbc-green" : "text-kbc-text"}`}>{t.amount > 0 ? "+" : "-"}{eur(Math.abs(t.amount), 2)}</span>
            </div>
          ))}
          {txs === null && <div className="px-4 py-3 text-[13px] text-kbc-muted">Loading…</div>}
        </div>
      )}
    </>
  );
}

export function ForYouCard({ icon, children, onClick, onDismiss, kate, label = "Kate tip", highlight }: { icon: ReactNode; children: ReactNode; onClick?: () => void; onDismiss?: () => void; kate?: boolean; label?: string; highlight?: boolean }) {
  return (
    <div className="relative">
    <button onClick={onClick} className={`relative flex w-full gap-4 rounded-card bg-white p-4 pr-10 text-left shadow-card ${highlight ? "ring-2 ring-kbc-sky" : ""}`}>
      <span className="relative mt-1 shrink-0 self-start text-kbc-navy">
        {icon}
        <span className="absolute -right-1 -top-1 h-3 w-3 shrink-0 rounded-full bg-kbc-red ring-2 ring-white" aria-label="New" />
      </span>
      <span className="min-w-0 flex-1 text-[15px] leading-snug text-kbc-text">
        {kate && (
          <span className="mb-1 flex items-center gap-1.5 font-extrabold text-kbc-navy"><KateMark size={16} />{label}</span>
        )}
        {children}
      </span>
    </button>
      {onDismiss && (
        <button onClick={onDismiss} aria-label="Hide" className="absolute right-3 top-3 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-kbc-bg text-kbc-muted"><X size={12} /></button>
      )}
    </div>
  );
}

export function BottomNav({ active = "start", fab = true }: { active?: string; onStart?: () => void; fab?: boolean }) {
  const nav = useNav();
  const go: Record<string, () => void> = {
    start: nav.home,
    mijn: () => nav.demo("My KBC"),
    beleggen: nav.invest,
    zakelijk: () => nav.demo("Business"),
    aanbod: () => nav.demo("Offers"),
  };
  const items = [
    { id: "start", label: "Home", icon: Wallet },
    { id: "mijn", label: "My KBC", icon: List },
    { id: "beleggen", label: "Invest", icon: PiggyBank },
    { id: "zakelijk", label: "Business", icon: Briefcase },
    { id: "aanbod", label: "Offers", icon: Layers },
  ];
  return (
    <div className="absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-kbc-bg from-40% to-transparent px-3 pb-3 pt-4">
      {fab && <button onClick={() => nav.demo("Transfer")} aria-label="Transfer" className="absolute -top-12 right-5 grid h-16 w-16 shrink-0 place-items-center rounded-full bg-kbc-blue text-white shadow-[0_8px_20px_rgba(0,121,193,0.4)]"><ArrowLeftRight size={26} /></button>}
      <div className="flex items-center justify-between rounded-[28px] bg-white px-2 py-2 shadow-[0_-4px_24px_rgba(10,46,92,0.12)]">
        {items.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={go[id]} className={`flex w-[68px] flex-col items-center gap-1 rounded-[22px] py-2 text-[12px] font-bold ${active === id ? "bg-kbc-bg text-kbc-navy" : "text-kbc-text"}`}>
            <Icon size={24} strokeWidth={active === id ? 2.4 : 1.8} />
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
