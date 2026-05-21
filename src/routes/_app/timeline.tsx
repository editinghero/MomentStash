import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { loadEntries, type Entry } from "@/lib/entries";
import { WashiTape } from "@/components/WashiTape";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  StarDoodle,
  HeartDoodle,
  SparkleDoodle,
  UnderlineSquiggle,
} from "@/components/Doodles";
import { MapPin, Search } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export const Route = createFileRoute("/_app/timeline")({
  head: () => ({
    meta: [
      { title: "Timeline — MomentStash" },
      { name: "description", content: "Scroll back through your folded days." },
    ],
  }),
  component: TimelinePage,
});

/* ── Custom Dialog Types ── */
type ConfirmDialog = {
  kind: "confirm";
  title: string;
  message: string;
  onConfirm: () => void;
};

function TimelinePage() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [q, setQ] = useState("");
  const [activeEntry, setActiveEntry] = useState<Entry | null>(null);
  const [shelves, setShelves] = useState<string[]>([]);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    targetId: string;
  } | null>(null);

  /* ── Scrapbook Dialog State ── */
  const [dialog, setDialog] = useState<ConfirmDialog | null>(null);

  /* ── GSAP refs ── */
  const mainRef = useRef<HTMLElement>(null);
  const timelineRef = useRef<HTMLElement>(null);

  const refreshEntries = useCallback(() => {
    setEntries(loadEntries());
  }, []);

  useEffect(() => {
    refreshEntries();

    // Load dynamic shelves
    const stored = JSON.parse(
      localStorage.getItem("momentstash_custom_shelves") || "[]",
    ) as string[];
    const activeShelves = loadEntries()
      .map((e) => e.collection)
      .filter(Boolean);
    const merged = Array.from(new Set([...stored, ...activeShelves]));
    setShelves(merged);

    const closeMenu = () => setContextMenu(null);
    window.addEventListener("click", closeMenu);
    window.addEventListener("scroll", closeMenu, { passive: true });
    return () => {
      window.removeEventListener("click", closeMenu);
      window.removeEventListener("scroll", closeMenu);
    };
  }, [refreshEntries]);

  /* ── GSAP ScrollTrigger animations ── */
  useEffect(() => {
    if (!timelineRef.current) return;

    const ctx = gsap.context(() => {
      // Animate timeline cards on scroll
      ScrollTrigger.batch(".timeline-card", {
        onEnter: (elements) => {
          gsap.fromTo(
            elements,
            { opacity: 0, y: 40, scale: 0.96 },
            {
              opacity: 1,
              y: 0,
              scale: 1,
              stagger: 0.1,
              duration: 0.6,
              ease: "back.out(1.4)",
              overwrite: true,
            },
          );
        },
        start: "top 88%",
      });

      // Animate date pins
      ScrollTrigger.batch(".date-pin", {
        onEnter: (elements) => {
          gsap.fromTo(
            elements,
            { opacity: 0, x: -20, scale: 0.8 },
            {
              opacity: 1,
              x: 0,
              scale: 1,
              stagger: 0.08,
              duration: 0.5,
              ease: "back.out(2)",
              overwrite: true,
            },
          );
        },
        start: "top 90%",
      });

      // Animate the header section with a subtle parallax
      gsap.to(".timeline-header-doodles", {
        yPercent: -30,
        ease: "none",
        scrollTrigger: {
          trigger: mainRef.current,
          start: "top top",
          end: "bottom top",
          scrub: 0.5,
        },
      });
    }, timelineRef);

    return () => ctx.revert();
  }, [entries]); // re-run when entries change to re-animate newly loaded cards

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return entries;
    return entries.filter(
      (e) =>
        e.title.toLowerCase().includes(s) ||
        e.note.toLowerCase().includes(s) ||
        e.tags.some((t) => t.toLowerCase().includes(s)) ||
        e.collection.toLowerCase().includes(s),
    );
  }, [q, entries]);

  // group by date
  const groups = useMemo(() => {
    const map = new Map<string, Entry[]>();
    for (const e of filtered) {
      if (!map.has(e.date)) map.set(e.date, []);
      map.get(e.date)!.push(e);
    }
    return Array.from(map.entries());
  }, [filtered]);

  const handleDeleteEntry = (entryId: string) => {
    setDialog({
      kind: "confirm",
      title: "Discard Memory?",
      message:
        "This fold will be gone forever. Are you sure you want to let it go?",
      onConfirm: () => {
        const allEntries = loadEntries();
        const updatedEntries = allEntries.filter((e) => e.id !== entryId);
        localStorage.setItem(
          "momentstash_entries",
          JSON.stringify(updatedEntries),
        );
        setEntries(updatedEntries);
        setActiveEntry(null);
        setDialog(null);
      },
    });
  };

  const handleMoveEntry = (entryId: string, newShelf: string) => {
    const allEntries = loadEntries();
    const updatedEntries = allEntries.map((e) => {
      if (e.id === entryId) {
        return { ...e, collection: newShelf.trim() };
      }
      return e;
    });
    localStorage.setItem("momentstash_entries", JSON.stringify(updatedEntries));
    setEntries(updatedEntries);

    // Update shelves if moved to a new one
    if (newShelf.trim() && !shelves.includes(newShelf.trim())) {
      const updatedShelves = [...shelves, newShelf.trim()];
      setShelves(updatedShelves);
      const custom = JSON.parse(
        localStorage.getItem("momentstash_custom_shelves") || "[]",
      ) as string[];
      if (!custom.includes(newShelf.trim())) {
        localStorage.setItem(
          "momentstash_custom_shelves",
          JSON.stringify([...custom, newShelf.trim()]),
        );
      }
    }
  };

  const isNearRight = useMemo(() => {
    if (!contextMenu) return false;
    return window.innerWidth - contextMenu.x < 240;
  }, [contextMenu]);

  const menuY = useMemo(() => {
    if (!contextMenu) return 0;
    const menuHeight = 160;
    if (window.innerHeight - contextMenu.y < menuHeight) {
      return Math.max(10, contextMenu.y - menuHeight);
    }
    return contextMenu.y;
  }, [contextMenu]);

  const menuX = useMemo(() => {
    if (!contextMenu) return 0;
    const menuWidth = 180;
    if (window.innerWidth - contextMenu.x < menuWidth) {
      return Math.max(10, contextMenu.x - menuWidth);
    }
    return contextMenu.x;
  }, [contextMenu]);

  return (
    <main
      ref={mainRef}
      className="relative min-h-screen overflow-hidden pt-4 pb-44"
    >
      <div className="timeline-header-doodles">
        <SparkleDoodle className="absolute top-20 right-10 h-6 w-6 text-secondary opacity-60 pointer-events-none" />
        <StarDoodle
          className="absolute top-72 left-4 h-7 w-7 text-accent animate-float pointer-events-none"
          color="oklch(0.85 0.13 90)"
        />
      </div>

      <header className="relative z-30 mx-auto flex max-w-5xl items-center justify-between px-4 py-5 md:px-10 md:hidden">
        <Link
          to="/home"
          className="min-w-0 whitespace-nowrap font-display text-xl font-bold text-ink sm:text-2xl"
        >
          Moment
          <span className="font-hand text-2xl text-primary sm:text-3xl">
            Stash
          </span>
        </Link>
        <div className="flex shrink-0 items-center gap-2">
          <Link
            to="/home"
            className="whitespace-nowrap font-hand text-lg text-ink-soft hover:text-ink"
          >
            ← today
          </Link>
          <ThemeToggle className="h-9 w-9 shrink-0" />
        </div>
      </header>

      <section
        className={[
          "mx-auto max-w-5xl px-6 md:px-10 transition-all duration-300",
          activeEntry
            ? "blur-[2px] opacity-40 select-none pointer-events-none"
            : "",
        ].join(" ")}
      >
        <p className="font-accent text-xs uppercase tracking-[0.2em] text-ink-soft">
          all your folds
        </p>
        <div className="relative inline-block">
          <h1 className="font-display text-5xl md:text-6xl text-ink mt-1">
            Timeline
          </h1>
          <UnderlineSquiggle className="absolute -bottom-2 left-0 h-2 w-full text-primary" />
        </div>
        <p className="font-hand text-2xl text-ink-soft mt-3">
          scroll back, gently
        </p>

        {/* Search */}
        <div className="relative mt-6 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-soft" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="search a feeling, a place, a #tag…"
            className="w-full rounded-full border-2 border-ink bg-paper pl-11 pr-4 py-3 font-hand text-xl text-ink placeholder:text-ink-soft/70 focus:outline-none focus:shadow-[3px_3px_0_var(--color-ink)] transition-shadow"
          />
        </div>
      </section>

      {/* Timeline */}
      <section
        ref={timelineRef}
        className={[
          "relative mx-auto max-w-5xl px-6 md:px-10 mt-12 transition-all duration-300",
          activeEntry
            ? "blur-[2px] opacity-40 select-none pointer-events-none"
            : "",
        ].join(" ")}
      >
        {/* dashed axis */}
        <div
          aria-hidden
          className="pointer-events-none absolute top-0 bottom-0 left-10 md:left-1/2 md:-translate-x-1/2 w-px"
          style={{
            backgroundImage:
              "repeating-linear-gradient(to bottom, var(--color-ink) 0 6px, transparent 6px 14px)",
          }}
        />

        {groups.length === 0 && (
          <p className="font-hand text-2xl text-ink-soft text-center mt-10">
            nothing fits that yet ✿
          </p>
        )}

        <ol className="space-y-12">
          {groups.map(([date, items], gi) => (
            <li key={date} className="relative">
              {/* date pin */}
              <div className="date-pin relative z-10 mb-6 flex items-center gap-3 md:justify-center">
                <span className="ml-2 md:ml-0 grid place-items-center h-10 min-w-[3rem] rounded-full bg-primary text-primary-foreground border-2 border-ink shadow-[3px_3px_0_var(--color-ink)] px-3">
                  <span className="font-hand text-xl leading-none">
                    {prettyDate(date)}
                  </span>
                </span>
              </div>

              <ul className="space-y-8">
                {items.map((e, i) => (
                  <li
                    key={e.id}
                    className={[
                      "relative pl-16",
                      "md:pl-0 md:w-1/2",
                      (gi + i) % 2 === 0
                        ? "md:mr-auto md:pr-10"
                        : "md:ml-auto md:pl-10",
                    ].join(" ")}
                  >
                    {/* node */}
                    <span
                      aria-hidden
                      className="absolute top-6 left-8 md:left-auto h-4 w-4 rounded-full bg-accent border-2 border-ink"
                      style={
                        (gi + i) % 2 === 0
                          ? { right: "calc(0px - 0.5rem)" }
                          : { left: "calc(-0.5rem)" }
                      }
                    />
                    <EntryCard
                      entry={e}
                      onClick={() => setActiveEntry(e)}
                      onContextMenu={(event) => {
                        event.preventDefault();
                        setContextMenu({
                          x: event.clientX,
                          y: event.clientY,
                          targetId: e.id,
                        });
                      }}
                    />
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </section>

      {/* Immersive Memory Detail Popup Modal — Joint Scrollable */}
      {activeEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setActiveEntry(null)}
            className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity animate-fade-in"
          />
          <div className="relative w-full max-w-2xl paper-card rounded-[32px] border-2 border-ink p-6 md:p-8 shadow-[var(--shadow-lift)] max-h-[85vh] flex flex-col animate-wobble-in">
            <WashiTape
              color={activeEntry.tape}
              rotate={-3}
              width="6rem"
              className="absolute -top-3 left-10 pointer-events-none"
            />
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
                <span className="text-4xl leading-none shrink-0">
                  {activeEntry.mood}
                </span>
                <div className="flex-1 min-w-0">
                  <h3 className="font-display text-2xl md:text-3xl text-ink font-bold leading-tight">
                    {activeEntry.title}
                  </h3>
                  <p className="font-accent text-xs md:text-sm uppercase tracking-wider text-ink-soft mt-1.5 flex items-center gap-1.5 flex-wrap">
                    <span>{activeEntry.collection || "Unsorted"}</span>
                    <span>·</span>
                    <span className="font-hand text-xl lowercase">
                      {prettyDate(activeEntry.date)} ({activeEntry.date})
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

      {/* Floating Scrapbook Custom Context Menu */}
      {contextMenu && (
        <div
          className="fixed z-[110] bg-paper border-2 border-ink p-2 rounded-xl shadow-[var(--shadow-paper)] flex flex-col min-w-[170px] animate-fade-in"
          style={{
            top: menuY,
            left: menuX,
          }}
          onContextMenu={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <WashiTape
            color="yellow"
            rotate={-2}
            width="3.5rem"
            className="absolute -top-2.5 left-4 pointer-events-none"
          />

          <button
            onClick={() => {
              handleDeleteEntry(contextMenu.targetId);
              setContextMenu(null);
            }}
            className="text-left font-hand text-lg hover:bg-accent/40 text-red-600 hover:text-red-700 px-3 py-1.5 rounded-lg transition-colors cursor-pointer w-full flex items-center gap-1.5"
          >
            <span>🗑</span> Delete Fold
          </button>

          {/* Submenu for moving to shelf */}
          <div className="relative group/shelf">
            <button className="text-left font-hand text-lg hover:bg-accent/40 text-ink px-3 py-1.5 rounded-lg transition-colors cursor-pointer w-full flex items-center justify-between gap-2">
              <span>📁 Move to Shelf</span>
              <span className="text-xs">➜</span>
            </button>

            <div
              className={[
                "absolute top-0 bg-paper border-2 border-ink p-2 rounded-xl shadow-[var(--shadow-paper)] flex flex-col min-w-[150px] hidden group-hover/shelf:block animate-fade-in",
                isNearRight ? "right-full mr-1" : "left-full ml-1",
              ].join(" ")}
            >
              <button
                onClick={() => {
                  handleMoveEntry(contextMenu.targetId, "");
                  setContextMenu(null);
                }}
                className="text-left font-hand text-base hover:bg-accent/40 text-ink-soft hover:text-ink px-3 py-1 rounded-lg transition-colors cursor-pointer w-full"
              >
                ✿ Unsorted
              </button>

              {shelves.length > 0 && (
                <div className="border-t border-dashed border-ink/20 my-1" />
              )}

              {shelves.map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    handleMoveEntry(contextMenu.targetId, s);
                    setContextMenu(null);
                  }}
                  className="text-left font-hand text-base hover:bg-accent/40 text-ink-soft hover:text-ink px-3 py-1 rounded-lg transition-colors cursor-pointer w-full truncate"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Custom Scrapbook Confirm Dialog ── */}
      {dialog && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 animate-fade-in">
          <div
            onClick={() => setDialog(null)}
            className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
          />
          <div className="relative w-full max-w-md paper-card rounded-[24px] border-2 border-ink p-6 md:p-8 shadow-[var(--shadow-lift)] bg-paper animate-wobble-in flex flex-col z-50">
            <WashiTape
              color="pink"
              rotate={-2}
              width="5rem"
              className="absolute -top-3.5 left-12 pointer-events-none"
            />
            <h4 className="font-display text-2xl text-ink font-bold mb-3">
              {dialog.title}
            </h4>
            <p className="font-hand text-xl text-ink-soft mb-5 leading-relaxed">
              {dialog.message}
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDialog(null)}
                className="font-hand text-lg border-2 border-ink/40 px-5 py-1.5 rounded-full bg-paper text-ink-soft hover:bg-accent/30 cursor-pointer transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={dialog.onConfirm}
                className="font-hand text-lg border-2 border-ink px-6 py-1.5 rounded-full bg-primary text-primary-foreground hover:bg-primary/80 cursor-pointer shadow-[2px_2px_0_var(--color-ink)] active:translate-y-0.5 transition-all font-bold"
              >
                Yes, do it
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function prettyDate(iso: string) {
  const d = new Date(iso + "T00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.round((today.getTime() - d.getTime()) / 86_400_000);
  if (diff === 0) return "today";
  if (diff === 1) return "yesterday";
  if (diff < 7) return `${diff}d ago`;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function EntryCard({
  entry,
  onClick,
  onContextMenu,
}: {
  entry: Entry;
  onClick: () => void;
  onContextMenu?: (e: React.MouseEvent) => void;
}) {
  const isLong = entry.note.length > 100;
  const summary = isLong ? entry.note.slice(0, 100) + "..." : entry.note;

  return (
    <article
      onClick={onClick}
      onContextMenu={onContextMenu}
      className="timeline-card relative paper-card rounded-2xl border-2 border-ink/80 p-5 shadow-[var(--shadow-paper)] cursor-pointer hover:shadow-[var(--shadow-lift)] transition-all duration-300 hover:-translate-y-1 hover:scale-[1.01] group"
      style={{ transform: `rotate(${entry.rotate * 0.5}deg)` }}
    >
      <WashiTape
        color={entry.tape}
        rotate={-5}
        width="4.5rem"
        className="absolute -top-3 left-6"
      />
      <div className="flex items-start gap-3">
        <span className="text-3xl leading-none">{entry.mood}</span>
        <div className="flex-1">
          <h3 className="font-display text-2xl text-ink leading-tight group-hover:text-primary transition-colors">
            {entry.title}
          </h3>
          <p className="font-accent text-xs uppercase tracking-widest text-ink-soft mt-1">
            {entry.collection || "Unsorted"}
            {entry.place && (
              <>
                {" · "}
                <MapPin className="inline h-3 w-3 -mt-0.5" /> {entry.place}
              </>
            )}
          </p>
        </div>
        <HeartDoodle className="h-4 w-4 text-primary opacity-60" />
      </div>

      {entry.photoDataUrl && (
        <img
          src={entry.photoDataUrl}
          alt=""
          className="mt-4 w-full h-44 object-cover rounded-xl border-2 border-ink/60"
        />
      )}

      <p className="font-body text-ink-soft mt-3 leading-relaxed">
        {summary}
        {isLong && (
          <span className="text-primary font-hand text-base ml-2 inline-block">
            read fold ➜
          </span>
        )}
      </p>

      {entry.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {entry.tags.map((t) => (
            <span
              key={t}
              className="font-hand text-base text-ink bg-accent/60 px-2.5 py-0.5 rounded-full border border-ink/40"
            >
              #{t}
            </span>
          ))}
        </div>
      )}
    </article>
  );
}
