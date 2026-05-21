import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Home, Clock, FolderHeart, Plus, Search, X, MapPin, Settings, LogOut } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { WashiTape } from "@/components/WashiTape";
import { loadEntries, type Entry } from "@/lib/entries";
import { useAuth } from "@/lib/auth";

type NavItem = {
  to: "/home" | "/timeline" | "/collections" | "/create";
  label: string;
  icon: typeof Home;
  accent?: boolean;
};

const items: NavItem[] = [
  { to: "/home", label: "today", icon: Home },
  { to: "/timeline", label: "timeline", icon: Clock },
  { to: "/collections", label: "shelves", icon: FolderHeart },
  { to: "/create", label: "new", icon: Plus, accent: true },
];

export function AppNav() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const { logout } = useAuth();
  
  const [searchOpen, setSearchOpen] = useState(false);
  const [q, setQ] = useState("");
  const [entries, setEntries] = useState<Entry[]>([]);
  const [activeEntry, setActiveEntry] = useState<Entry | null>(null);

  // Load entries when search is opened
  useEffect(() => {
    if (searchOpen) {
      setEntries(loadEntries());
    }
  }, [searchOpen]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return [];
    return entries.filter(
      (e) =>
        e.title.toLowerCase().includes(s) ||
        e.note.toLowerCase().includes(s) ||
        e.tags.some((t) => t.toLowerCase().includes(s)) ||
        e.collection.toLowerCase().includes(s) ||
        (e.place && e.place.toLowerCase().includes(s))
    );
  }, [q, entries]);

  const handleCloseSearch = () => {
    setSearchOpen(false);
    setQ("");
    setActiveEntry(null);
  };

  return (
    <>
      {/* 1. TOP NAVBAR (DESKTOP) */}
      <header className="hidden md:flex fixed top-0 left-0 right-0 h-16 border-b-2 border-ink bg-paper/80 backdrop-blur-lg z-40 px-8 py-4 justify-between items-center shadow-sm">
        <Link to="/home" className="font-display text-2xl font-bold text-ink shrink-0">
          Moment<span className="font-hand text-primary text-3xl">Stash</span>
        </Link>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-6">
          {items.map(({ to, label, icon: Icon, accent }) => {
            const active = path === to;
            return (
              <Link
                key={to}
                to={to}
                className={[
                  "relative font-accent text-sm font-semibold tracking-wider transition-colors py-1 px-3 rounded-md",
                  active
                    ? "text-primary bg-primary-soft/10 border-b-2 border-primary"
                    : "text-ink-soft hover:text-ink hover:bg-accent/40"
                ].join(" ")}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Right tools */}
        <div className="flex items-center gap-4 shrink-0">
          {/* Search Button/Input Trigger */}
          <button
            onClick={() => setSearchOpen(true)}
            className="flex items-center gap-2 border-2 border-ink rounded-full bg-paper px-4 py-1.5 font-hand text-lg text-ink hover:bg-accent cursor-pointer transition-all shadow-[2px_2px_0_var(--color-ink)]"
          >
            <Search className="h-4 w-4 text-ink-soft" />
            <span>Search stash...</span>
          </button>

          <ThemeToggle />

          <button
            onClick={() => {
              logout();
              navigate({ to: "/" });
            }}
            className="grid h-10 w-10 place-items-center rounded-full border-2 border-ink bg-paper hover:bg-accent cursor-pointer transition-colors shadow-[2px_2px_0_var(--color-ink)]"
            aria-label="Sign out"
          >
            <LogOut className="h-4 w-4 text-ink" />
          </button>
        </div>
      </header>

      {/* 2. FLOATING BOTTOM NAV (MOBILE) */}
      <div className="md:hidden fixed bottom-5 left-1/2 z-40 -translate-x-1/2 flex items-center gap-2">
        <nav>
          <ul className="flex items-end gap-2 rounded-full border-2 border-ink bg-paper px-3 py-2 shadow-[4px_4px_0_var(--color-ink)]">
            {items.map(({ to, label, icon: Icon, accent }) => {
              const active = path === to;
              return (
                <li key={to}>
                  <Link
                    to={to}
                    className={[
                      "group flex flex-col items-center gap-0.5 rounded-full px-3 py-1.5 transition-all",
                      accent
                        ? "bg-primary text-primary-foreground border-2 border-ink -mt-4 shadow-[2px_2px_0_var(--color-ink)] hover:-translate-y-0.5"
                        : active
                        ? "bg-accent text-ink"
                        : "text-ink-soft hover:text-ink",
                    ].join(" ")}
                    style={accent ? { borderRadius: "22px 18px 24px 16px / 18px 22px 16px 24px" } : undefined}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="font-hand text-xs leading-none">{label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        {/* Mobile Search Button replaces ThemeToggle */}
        <button
          onClick={() => setSearchOpen(true)}
          className="grid h-12 w-12 place-items-center rounded-full border-2 border-ink bg-paper shadow-[4px_4px_0_var(--color-ink)] hover:bg-accent cursor-pointer transition-colors"
          aria-label="Search"
        >
          <Search className="h-5 w-5 text-ink" />
        </button>
      </div>

      {/* 3. GLOBAL SEARCH OVERLAY MODAL */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={handleCloseSearch}
            className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
          />

          <div className="relative w-full max-w-lg paper-card rounded-[32px] border-2 border-ink p-8 shadow-[var(--shadow-lift)] max-h-[80vh] flex flex-col animate-wobble-in">
            <WashiTape color="yellow" rotate={-5} width="6rem" className="absolute -top-3 left-10" />
            <WashiTape color="lavender" rotate={4} width="5rem" className="absolute -top-3 right-10" />

            <button
              onClick={handleCloseSearch}
              className="absolute top-4 right-4 h-8 w-8 grid place-items-center rounded-full border-2 border-ink bg-paper text-ink hover:bg-accent cursor-pointer transition-colors font-hand text-xl"
              aria-label="Close search"
            >
              ✕
            </button>

            <h3 className="font-display text-3xl text-ink mb-4 flex items-center gap-2">
              <Search className="h-6 w-6 text-primary" /> Search Stash
            </h3>

            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-ink-soft" />
              <input
                autoFocus
                type="text"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="search tags, places, feelings..."
                className="w-full rounded-full border-2 border-ink bg-paper pl-12 pr-4 py-3.5 font-hand text-2xl text-ink placeholder:text-ink-soft/60 focus:outline-none focus:shadow-[3px_3px_0_var(--color-ink)] transition-shadow"
              />
            </div>

            <div className="flex-1 overflow-y-auto min-h-0 space-y-4">
              {!q.trim() ? (
                <div className="text-center py-10">
                  <p className="font-hand text-2xl text-ink-soft">type to search your vault... ✿</p>
                </div>
              ) : filtered.length === 0 ? (
                <div className="text-center py-10">
                  <p className="font-hand text-2xl text-ink-soft">nothing fits that memory ✿</p>
                </div>
              ) : (
                <ul className="space-y-3">
                  {filtered.map((e) => (
                    <li key={e.id}>
                      <button
                        onClick={() => setActiveEntry(e)}
                        className="w-full text-left p-4 rounded-xl border border-ink/40 bg-paper-deep/20 hover:bg-accent/30 transition-all flex items-start gap-3 cursor-pointer"
                      >
                        <span className="text-2xl leading-none shrink-0">{e.mood}</span>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-display text-lg text-ink leading-tight truncate">{e.title}</h4>
                          <p className="font-hand text-base text-ink-soft leading-snug mt-0.5 line-clamp-2">{e.note}</p>
                          <div className="flex flex-wrap items-center gap-2 mt-2 font-accent text-[10px] text-ink-soft uppercase tracking-wider">
                            <span>{e.date}</span>
                            {e.place && (
                              <>
                                <span>·</span>
                                <span className="flex items-center gap-0.5">
                                  <MapPin className="h-3 w-3" /> {e.place}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 4. UNIVERSAL IMMERSIVE DETAIL POPUP MODAL (z-index [60] to show above search [50]) */}
      {activeEntry && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 animate-fade-in">
          <div
            onClick={() => setActiveEntry(null)}
            className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity"
          />
          <div className="relative w-full max-w-2xl paper-card rounded-[32px] border-2 border-ink p-6 md:p-8 shadow-[var(--shadow-lift)] max-h-[85vh] flex flex-col animate-wobble-in">
            <WashiTape color={activeEntry.tape} rotate={-3} width="6rem" className="absolute -top-3 left-10 pointer-events-none" />
            <button
              onClick={() => setActiveEntry(null)}
              className="absolute top-4 right-4 h-8 w-8 grid place-items-center rounded-full border-2 border-ink bg-paper text-ink hover:bg-accent cursor-pointer transition-colors font-hand text-xl z-20"
            >
              ✕
            </button>

            {/* Joint Scrollable Container for all content */}
            <div className="flex-1 overflow-y-auto subtle-scroll pr-2 space-y-6 mt-2">
              {/* Header Info */}
              <div className="flex items-start gap-4">
                <span className="text-4xl leading-none shrink-0">{activeEntry.mood}</span>
                <div className="flex-1 min-w-0">
                  <h3 className="font-display text-2xl md:text-3xl text-ink font-bold leading-tight">{activeEntry.title}</h3>
                  <p className="font-accent text-xs md:text-sm uppercase tracking-wider text-ink-soft mt-1.5 flex items-center gap-1.5 flex-wrap">
                    <span>{activeEntry.collection || "Unsorted"}</span>
                    <span>·</span>
                    <span className="font-hand text-xl lowercase">
                      {new Date(activeEntry.date + "T00:00").toLocaleDateString(undefined, { month: "short", day: "numeric" })} ({activeEntry.date})
                    </span>
                    {activeEntry.place && (
                      <>
                        <span>·</span>
                        <span className="flex items-center gap-0.5">
                          <MapPin className="h-3.5 w-3.5" /> {activeEntry.place}
                        </span>
                      </>
                    )}
                  </p>
                </div>
              </div>

              {/* Photo */}
              {activeEntry.photoDataUrl && (
                <div className="relative">
                  <img
                    src={activeEntry.photoDataUrl}
                    alt=""
                    className="w-full max-h-[350px] object-cover rounded-2xl border-2 border-ink/85 shadow-sm"
                  />
                </div>
              )}

              {/* Description */}
              <div>
                <p className="font-body text-ink-soft text-lg leading-relaxed whitespace-pre-wrap">
                  {activeEntry.note}
                </p>
              </div>

              {/* Tags */}
              {activeEntry.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {activeEntry.tags.map((t) => (
                    <span
                      key={t}
                      className="font-hand text-lg text-ink bg-accent/70 px-3.5 py-1 rounded-full border border-ink/40 shadow-xs"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function todayISO() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
