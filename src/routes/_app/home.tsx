import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@/lib/auth";
import { useTheme } from "@/lib/theme";
import { loadEntries, type Entry } from "@/lib/entries";
import { Polaroid } from "@/components/Polaroid";
import { StickerButton } from "@/components/StickerButton";
import { WashiTape } from "@/components/WashiTape";
import { ThemeToggle } from "@/components/ThemeToggle";
import { StarDoodle, HeartDoodle, SparkleDoodle, UnderlineSquiggle, ArrowSquiggle } from "@/components/Doodles";
import { Calendar, MapPin, Camera, Plus, LogOut, Settings, Cloud, Bell, FileDown, Search, User, Moon } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import coffeeFallback from "@/assets/photo-coffee.jpg";
import sunsetFallback from "@/assets/photo-sunset.jpg";
import flowersFallback from "@/assets/photo-flowers.jpg";
import croissantFallback from "@/assets/photo-croissant.jpg";

gsap.registerPlugin(ScrollTrigger);
const fallbacks = [coffeeFallback, croissantFallback, flowersFallback, sunsetFallback];

export const Route = createFileRoute("/_app/home")({
  head: () => ({
    meta: [
      { title: "Today's Fold — MomentStash" },
      { name: "description", content: "Your daily scrapbook of tiny magic." },
    ],
  }),
  component: HomePage,
});

function todayISO() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function HomePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [activeEntry, setActiveEntry] = useState<Entry | null>(null);
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => setEntries(loadEntries()), []);

  /* ── GSAP ScrollTrigger Parallax & Entrance Animations ── */
  useEffect(() => {
    if (!mainRef.current) return;
    const ctx = gsap.context(() => {
      // Parallax on doodles — they float slower while content scrolls over fixed dot bg
      gsap.to(".home-doodle-float", {
        yPercent: -40,
        ease: "none",
        scrollTrigger: {
          trigger: mainRef.current,
          start: "top top",
          end: "bottom top",
          scrub: 0.5,
        }
      });

      // Stat cards entrance
      ScrollTrigger.batch(".stat-card", {
        onEnter: (elements) => {
          gsap.fromTo(elements,
            { opacity: 0, y: 30, scale: 0.92 },
            { opacity: 1, y: 0, scale: 1, stagger: 0.1, duration: 0.5, ease: "back.out(1.6)", overwrite: true }
          );
        },
        start: "top 88%",
      });

      // Polaroid spread entrance
      ScrollTrigger.batch(".polaroid-item", {
        onEnter: (elements) => {
          gsap.fromTo(elements,
            { opacity: 0, y: 50, rotateZ: -5 },
            { opacity: 1, y: 0, rotateZ: 0, stagger: 0.12, duration: 0.7, ease: "elastic.out(1, 0.6)", overwrite: true }
          );
        },
        start: "top 85%",
      });

      // Featured card entrance
      gsap.fromTo(".featured-card",
        { opacity: 0, y: 60 },
        {
          opacity: 1, y: 0, duration: 0.8, ease: "power2.out",
          scrollTrigger: {
            trigger: ".featured-card",
            start: "top 85%",
            toggleActions: "play none none none",
          }
        }
      );
    }, mainRef);
    return () => ctx.revert();
  }, [entries]);

  const { theme, toggle: toggleTheme } = useTheme();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [connectingDrive, setConnectingDrive] = useState(false);
  const [driveConnected, setDriveConnected] = useState(false);
  const [remindersEnabled, setRemindersEnabled] = useState(true);
  const [reminderTime, setReminderTime] = useState("20:00");
  const [profileSearch, setProfileSearch] = useState("");

  const matchedTags = useMemo(() => {
    if (!profileSearch.trim()) return [];
    const allTags = Array.from(new Set(entries.flatMap((e) => e.tags)));
    return allTags.filter((t) => t.toLowerCase().includes(profileSearch.toLowerCase()));
  }, [entries, profileSearch]);

  const handleExportPDF = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    const entriesHtml = entries
      .map(
        (e) => `
      <div style="border: 2px solid #2C2420; padding: 20px; margin-bottom: 20px; page-break-inside: avoid; background: #FFF; font-family: sans-serif; position: relative; border-radius: 12px; box-shadow: 4px 4px 0px rgba(0,0,0,0.1);">
        <div style="display: flex; justify-content: space-between; border-bottom: 1px dashed #CCC; padding-bottom: 10px; margin-bottom: 10px;">
          <span style="font-size: 24px;">${e.mood} <strong>${e.title}</strong></span>
          <span style="color: #666; font-size: 14px;">${e.date}</span>
        </div>
        <p style="color: #444; font-size: 16px; line-height: 1.6;">${e.note}</p>
        ${e.place ? `<div style="font-style: italic; color: #888; margin-top: 5px;">📍 ${e.place}</div>` : ""}
        ${
          e.photoDataUrl
            ? `<img src="${e.photoDataUrl}" style="max-height: 250px; border-radius: 8px; border: 1.5px solid #2C2420; margin-top: 10px; display: block; max-width: 100%; object-fit: cover;" />`
            : ""
        }
      </div>
    `,
      )
      .join("");

    printWindow.document.write(`
      <html>
        <head>
          <title>My MomentStash Scrapbook</title>
          <style>
            body { background-color: #FAF6EE; padding: 40px; font-family: sans-serif; }
            h1 { text-align: center; color: #2C2420; margin-bottom: 40px; }
          </style>
        </head>
        <body>
          <h1>📖 My MomentStash Scrapbook</h1>
          ${entriesHtml}
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const today = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const todayKey = todayISO();
  const todays = useMemo(() => entries.filter((e) => e.date === todayKey), [entries, todayKey]);
  const featured = useMemo(() => {
    return entries.find((e) => {
      if (e.date !== todayKey) return false;
      const wordCount = e.note.trim().split(/\s+/).filter(Boolean).length;
      return wordCount > 20;
    });
  }, [entries, todayKey]);

  // streak: consecutive days with at least one entry ending today
  const streak = useMemo(() => {
    const set = new Set(entries.map((e) => e.date));
    let n = 0;
    const d = new Date();
    while (set.has(d.toISOString().slice(0, 10))) {
      n++;
      d.setDate(d.getDate() - 1);
    }
    return n;
  }, [entries]);

  const places = useMemo(
    () => new Set(entries.filter((e) => e.place).map((e) => e.place)).size,
    [entries],
  );

  const spread = todays.length > 0 ? todays.slice(0, 3) : entries.slice(0, 3);

  return (
    <main ref={mainRef} className="relative min-h-screen overflow-hidden pt-4 pb-36">
      <div className="home-doodle-float">
        <SparkleDoodle className="absolute top-16 right-8 h-6 w-6 text-secondary opacity-60 pointer-events-none" />
        <StarDoodle className="absolute top-40 left-6 h-7 w-7 text-accent animate-float pointer-events-none" color="oklch(0.85 0.13 90)" />
      </div>

      <div className={activeEntry ? "blur-[2px] opacity-40 select-none pointer-events-none transition-all duration-300" : "transition-all duration-300"}>
        <header className="relative z-30 mx-auto flex max-w-6xl items-center justify-between px-6 py-6 md:px-10 md:hidden">
          <Link to="/home" className="font-display text-2xl font-bold text-ink">
            Moment<span className="font-hand text-primary text-3xl">Stash</span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline font-hand text-xl text-ink-soft">
              hi, {user?.name.split(" ")[0]}
            </span>
            <ThemeToggle />
            <button
              onClick={() => {
                logout();
                navigate({ to: "/" });
              }}
              className="grid h-10 w-10 place-items-center rounded-full border-2 border-ink bg-paper hover:bg-accent transition-colors"
              aria-label="Sign out"
            >
              <LogOut className="h-4 w-4 text-ink" />
            </button>
          </div>
        </header>

        <section className="relative mx-auto max-w-6xl px-6 md:px-10">
          <div className="flex items-end justify-between flex-wrap gap-4">
            <div>
              <p className="font-accent text-xs uppercase tracking-[0.2em] text-ink-soft">
                today's fold
              </p>
              <h1 className="font-display text-5xl md:text-6xl text-ink mt-1">{today}</h1>
              <div className="relative inline-block mt-2">
                <p className="font-hand text-3xl text-primary">tiny magic, gathered</p>
                <UnderlineSquiggle className="absolute -bottom-2 left-0 h-2 w-full text-primary" />
              </div>
            </div>
            <Link to="/create">
              <StickerButton>
                <Plus className="inline h-4 w-4 mr-1 -mt-0.5" /> New entry
              </StickerButton>
            </Link>
          </div>

          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
            <Stat icon={<Camera className="h-4 w-4" />} label="moments" value={String(entries.length)} tape="pink" className="stat-card" />
            <Stat icon={<MapPin className="h-4 w-4" />} label="places" value={String(places)} tape="mint" className="stat-card" />
            <Stat icon={<Calendar className="h-4 w-4" />} label="streak" value={streak > 0 ? `${streak}d` : "—"} tape="yellow" className="stat-card" />
            <Stat icon={<HeartDoodle className="h-4 w-4 text-primary" />} label="today" value={String(todays.length)} tape="lavender" className="stat-card" />
          </div>
        </section>

        <section className="relative mx-auto max-w-6xl px-6 md:px-10 mt-16">
          <h2 className="font-display text-2xl text-ink mb-6 flex items-center gap-2">
            your spread
            <ArrowSquiggle className="h-5 w-10 text-secondary" />
          </h2>

          {spread.length === 0 ? (
            <div className="paper-card rounded-2xl border-2 border-ink/80 p-10 text-center">
              <p className="font-hand text-2xl text-ink-soft">your scrapbook is empty ✿</p>
              <Link to="/create" className="inline-block mt-4">
                <StickerButton>fold your first moment</StickerButton>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {spread.map((e, i) => (
                <div key={e.id} className="polaroid-item">
                  <Polaroid
                    src={e.photoDataUrl || fallbacks[i % fallbacks.length]}
                    alt={e.title}
                    caption={e.title.length > 28 ? e.title.slice(0, 28) + "…" : e.title}
                    rotate={e.rotate || (i % 2 === 0 ? -3 : 2)}
                    tape={e.tape}
                    onClick={() => setActiveEntry(e)}
                  />
                </div>
              ))}
            </div>
          )}
        </section>

        {featured && (
          <section className="relative mx-auto max-w-6xl px-6 md:px-10 mt-20">
            <div className="featured-card relative paper-card rounded-[32px] border-2 border-ink/80 overflow-hidden cursor-pointer hover:shadow-[var(--shadow-lift)] transition-all duration-300" onClick={() => setActiveEntry(featured)}>
              <WashiTape color="lavender" rotate={-4} width="8rem" className="absolute -top-3 left-12" />
              <div className="grid grid-cols-1 md:grid-cols-2">
                {featured.photoDataUrl ? (
                  <img
                    src={featured.photoDataUrl}
                    alt={featured.title}
                    className="h-72 md:h-96 w-full object-cover"
                  />
                ) : (
                  <div className="h-72 md:h-96 w-full bg-paper-deep/60 grid place-items-center">
                    <span className="text-7xl">{featured.mood}</span>
                  </div>
                )}
                <div className="p-8 md:p-10">
                  <p className="font-accent text-xs uppercase tracking-[0.2em] text-ink-soft">
                    featured fold
                  </p>
                  <h3 className="font-display text-3xl md:text-4xl text-ink mt-2">
                    {featured.title}
                  </h3>
                  <p className="font-hand text-2xl text-primary mt-1">
                    {featured.mood} {featured.place ?? featured.collection}
                  </p>
                  <p className="font-body text-ink-soft mt-4 leading-relaxed line-clamp-4">{featured.note}</p>
                  {featured.tags.length > 0 && (
                    <div className="mt-6 flex flex-wrap gap-2">
                      {featured.tags.map((t) => (
                        <span
                          key={t}
                          className="font-hand text-lg text-ink bg-accent/60 px-3 py-1 rounded-full border border-ink/40"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        )}

        <div className="mt-20 flex flex-col items-center gap-4">
          <button
            onClick={() => setSettingsOpen(true)}
            className="font-hand text-3xl text-ink-soft hover:text-primary hover:scale-105 transition-all flex items-center gap-2 border-2 border-dashed border-ink/40 rounded-2xl px-6 py-2.5 bg-paper/60 hover:bg-accent/40 cursor-pointer shadow-sm"
          >
            <Settings className="h-6 w-6 animate-spin-slow" />
            Settings
          </button>
        </div>
      </div>

      {/* Immersive Memory Detail Popup Modal */}
      {activeEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setActiveEntry(null)}
            className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity animate-fade-in"
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

      {settingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setSettingsOpen(false)}
            className="absolute inset-0 bg-black/55 backdrop-blur-xs transition-opacity"
          />

          <div className="relative w-full max-w-lg paper-card rounded-[32px] border-2 border-ink p-8 shadow-[var(--shadow-lift)] overflow-y-auto max-h-[85vh] animate-wobble-in">
            <WashiTape color="pink" rotate={-4} width="7rem" className="absolute -top-3 left-10" />
            <WashiTape color="mint" rotate={6} width="6rem" className="absolute -top-3 right-10" />

            <button
              onClick={() => setSettingsOpen(false)}
              className="absolute top-4 right-4 h-8 w-8 grid place-items-center rounded-full border-2 border-ink bg-paper text-ink hover:bg-accent cursor-pointer transition-colors font-hand text-xl"
              aria-label="Close settings"
            >
              ✕
            </button>

            <h2 className="font-display text-4xl text-ink mb-6 flex items-center gap-3">
              <Settings className="h-7 w-7 text-primary animate-spin-slow" /> Settings
            </h2>

            <div className="space-y-6">
              {/* Profile Card */}
              <div className="rounded-2xl border-2 border-ink/80 bg-paper-deep/40 p-5 relative overflow-hidden">
                <div className="absolute top-2 right-2 flex items-center gap-1 font-hand text-lg text-ink-soft opacity-60">
                  <User className="h-4 w-4" /> id card
                </div>
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-full border-2 border-ink bg-accent/60 flex items-center justify-center text-3xl text-ink">
                    🌸
                  </div>
                  <div>
                    <h3 className="font-display text-xl text-ink font-bold leading-tight">{user?.name}</h3>
                    <p className="font-accent text-xs text-ink-soft tracking-wider mt-0.5">{user?.email}</p>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-dashed border-ink/30">
                  <label className="block">
                    <span className="font-hand text-lg text-ink block mb-1">Search Profile tags / memories</span>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-soft" />
                      <input
                        type="text"
                        placeholder="cozy, cafe, thrift..."
                        value={profileSearch}
                        onChange={(e) => setProfileSearch(e.target.value)}
                        className="w-full rounded-xl border border-ink/40 bg-paper pl-9 pr-4 py-2 font-hand text-lg text-ink focus:outline-none focus:border-primary"
                      />
                    </div>
                  </label>

                  {profileSearch && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {matchedTags.length === 0 ? (
                        <span className="font-hand text-sm text-ink-soft">no matched tags found</span>
                      ) : (
                        matchedTags.map((t) => (
                          <span
                            key={t}
                            className="font-hand text-base text-ink bg-accent px-2.5 py-0.5 rounded-full border border-ink/30"
                          >
                            #{t}
                          </span>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Google Drive Connect */}
              <div className="rounded-xl border-2 border-ink bg-paper p-4 flex items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 shrink-0 grid place-items-center rounded-lg border border-ink bg-accent/30 text-ink">
                    <Cloud className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-display text-lg text-ink font-bold leading-snug">Google Drive</h4>
                    <p className="font-body text-xs text-ink-soft leading-tight">Backup your memories to the cloud</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    if (driveConnected) {
                      setDriveConnected(false);
                      return;
                    }
                    setConnectingDrive(true);
                    setTimeout(() => {
                      setConnectingDrive(false);
                      setDriveConnected(true);
                    }, 1200);
                  }}
                  disabled={connectingDrive}
                  className={[
                    "font-hand text-lg border-2 border-ink px-4 py-1.5 rounded-full shadow-[2px_2px_0_var(--color-ink)] active:translate-y-0.5 transition-all cursor-pointer",
                    driveConnected
                      ? "bg-tape-mint text-ink font-semibold"
                      : connectingDrive
                      ? "bg-accent/40 text-ink-soft cursor-wait"
                      : "bg-paper hover:bg-accent text-ink",
                  ].join(" ")}
                >
                  {driveConnected ? "Connected ✓" : connectingDrive ? "Connecting..." : "Connect"}
                </button>
              </div>

              {/* Dark Mode */}
              <div className="rounded-xl border-2 border-ink bg-paper p-4 flex items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 shrink-0 grid place-items-center rounded-lg border border-ink bg-accent/30 text-ink">
                    <Moon className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-display text-lg text-ink font-bold leading-snug">Dark Mode</h4>
                    <p className="font-body text-xs text-ink-soft leading-tight">Easier on the eyes at night</p>
                  </div>
                </div>
                <button
                  onClick={toggleTheme}
                  className="w-14 h-8 border-2 border-ink rounded-full p-0.5 bg-paper-deep relative transition-all"
                  aria-label="Toggle dark mode"
                >
                  <div
                    className={[
                      "w-6 h-6 rounded-full border border-ink bg-primary transition-transform duration-200 flex items-center justify-center text-xs",
                      theme === "dark" ? "translate-x-6" : "translate-x-0",
                    ].join(" ")}
                  >
                    {theme === "dark" ? "🌙" : "☀️"}
                  </div>
                </button>
              </div>

              {/* Reminders */}
              <div className="rounded-xl border-2 border-ink bg-paper p-4 space-y-3">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 shrink-0 grid place-items-center rounded-lg border border-ink bg-accent/30 text-ink">
                      <Bell className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-display text-lg text-ink font-bold leading-snug">Reminders</h4>
                      <p className="font-body text-xs text-ink-soft leading-tight">Daily prompts to fold a memory</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setRemindersEnabled(!remindersEnabled)}
                    className="w-14 h-8 border-2 border-ink rounded-full p-0.5 bg-paper-deep relative transition-all"
                    aria-label="Toggle reminders"
                  >
                    <div
                      className={[
                        "w-6 h-6 rounded-full border border-ink transition-transform duration-200",
                        remindersEnabled ? "translate-x-6 bg-primary" : "translate-x-0 bg-ink-soft",
                      ].join(" ")}
                    />
                  </button>
                </div>
                {remindersEnabled && (
                  <div className="flex items-center gap-2 pl-12 font-hand text-lg text-ink">
                    <span>Prompt me every day at</span>
                    <input
                      type="time"
                      value={reminderTime}
                      onChange={(e) => setReminderTime(e.target.value)}
                      className="border-2 border-ink rounded-lg bg-paper px-2 py-0.5 outline-none font-body text-xs"
                    />
                  </div>
                )}
              </div>

              {/* Export Scrapbook */}
              <div className="rounded-xl border-2 border-ink bg-paper p-4 flex items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 shrink-0 grid place-items-center rounded-lg border border-ink bg-accent/30 text-ink">
                    <FileDown className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-display text-lg text-ink font-bold leading-snug">Export Scrapbook</h4>
                    <p className="font-body text-xs text-ink-soft leading-tight">Download your journal as PDF</p>
                  </div>
                </div>
                <button
                  onClick={handleExportPDF}
                  className="font-hand text-lg border-2 border-ink px-4 py-1.5 rounded-full bg-primary hover:bg-primary-soft text-primary-foreground shadow-[2px_2px_0_var(--color-ink)] active:translate-y-0.5 transition-all cursor-pointer font-bold"
                >
                  Export
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function Stat({
  icon,
  label,
  value,
  tape,
  className = "",
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tape: "pink" | "mint" | "yellow" | "lavender";
  className?: string;
}) {
  return (
    <div className={`relative paper-card rounded-2xl border-2 border-ink/70 p-4 ${className}`}>
      <WashiTape color={tape} rotate={-6} width="3rem" className="absolute -top-2 left-4" />
      <div className="flex items-center gap-2 text-ink-soft">
        {icon}
        <span className="font-accent text-xs uppercase tracking-widest">{label}</span>
      </div>
      <p className="font-display text-3xl text-ink mt-1">{value}</p>
    </div>
  );
}
