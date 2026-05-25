import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState, useCallback } from "react";
import { loadEntries, type Entry } from "@/lib/entries";
import { WashiTape } from "@/components/WashiTape";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  StarDoodle,
  HeartDoodle,
  SparkleDoodle,
  UnderlineSquiggle,
  ArrowSquiggle,
} from "@/components/Doodles";
import {
  MapPin,
  Search,
  Download,
  FolderHeart,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Collage } from "@/components/Collage";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/_app/collections")({
  head: () => ({
    meta: [
      { title: "Collections — MomentStash" },
      {
        name: "description",
        content: "Shelves of folded days, grouped your way.",
      },
    ],
  }),
  component: CollectionsPage,
});

const tapeFor = ["pink", "mint", "lavender", "yellow"] as const;

function PlantDoodle1() {
  return (
    <svg
      className="w-[60px] h-[80px]"
      viewBox="0 0 60 80"
      fill="none"
      stroke="var(--color-ink)"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path
        d="M15 55 L45 55 L42 75 L18 75 Z"
        fill="var(--color-paper-deep)"
        stroke="var(--color-ink)"
        strokeWidth="1.5"
      />
      <ellipse
        cx="30"
        cy="55"
        rx="15"
        ry="3"
        fill="var(--color-paper)"
        stroke="var(--color-ink)"
        strokeWidth="1.5"
      />
      <path
        d="M30 55 Q20 40 15 30"
        fill="none"
        stroke="oklch(0.7 0.08 140)"
        strokeWidth="1.5"
      />
      <path
        d="M30 55 Q40 35 45 25"
        fill="none"
        stroke="oklch(0.7 0.08 140)"
        strokeWidth="1.5"
      />
      <path
        d="M30 55 Q30 30 30 20"
        fill="none"
        stroke="oklch(0.7 0.08 140)"
        strokeWidth="1.5"
      />
      <ellipse
        cx="15"
        cy="30"
        rx="6"
        ry="10"
        fill="oklch(0.85 0.06 145)"
        stroke="oklch(0.7 0.08 140)"
        strokeWidth="1"
        transform="rotate(-20 15 30)"
      />
      <ellipse
        cx="45"
        cy="25"
        rx="6"
        ry="10"
        fill="oklch(0.85 0.06 145)"
        stroke="oklch(0.7 0.08 140)"
        strokeWidth="1"
        transform="rotate(20 45 25)"
      />
      <ellipse
        cx="30"
        cy="20"
        rx="5"
        ry="9"
        fill="oklch(0.85 0.06 145)"
        stroke="oklch(0.7 0.08 140)"
        strokeWidth="1"
      />
    </svg>
  );
}

function PlantDoodle2() {
  return (
    <svg
      className="w-[50px] h-[70px]"
      viewBox="0 0 50 70"
      fill="none"
      stroke="var(--color-ink)"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ marginLeft: "-15px" }}
    >
      <path
        d="M12 48 L38 48 L36 65 L14 65 Z"
        fill="var(--color-paper-deep)"
        stroke="var(--color-ink)"
        strokeWidth="1.5"
      />
      <ellipse
        cx="25"
        cy="48"
        rx="13"
        ry="2.5"
        fill="var(--color-paper)"
        stroke="var(--color-ink)"
        strokeWidth="1.5"
      />
      <ellipse
        cx="25"
        cy="38"
        rx="8"
        ry="5"
        fill="oklch(0.85 0.06 145)"
        stroke="oklch(0.7 0.08 140)"
        strokeWidth="1"
        transform="rotate(0 25 38)"
      />
      <ellipse
        cx="25"
        cy="38"
        rx="8"
        ry="5"
        fill="oklch(0.85 0.06 145)"
        stroke="oklch(0.7 0.08 140)"
        strokeWidth="1"
        transform="rotate(60 25 38)"
      />
      <ellipse
        cx="25"
        cy="38"
        rx="8"
        ry="5"
        fill="oklch(0.85 0.06 145)"
        stroke="oklch(0.7 0.08 140)"
        strokeWidth="1"
        transform="rotate(120 25 38)"
      />
      <ellipse
        cx="25"
        cy="38"
        rx="8"
        ry="5"
        fill="oklch(0.85 0.06 145)"
        stroke="oklch(0.7 0.08 140)"
        strokeWidth="1"
        transform="rotate(180 25 38)"
      />
      <ellipse
        cx="25"
        cy="38"
        rx="8"
        ry="5"
        fill="oklch(0.85 0.06 145)"
        stroke="oklch(0.7 0.08 140)"
        strokeWidth="1"
        transform="rotate(240 25 38)"
      />
      <ellipse
        cx="25"
        cy="38"
        rx="8"
        ry="5"
        fill="oklch(0.85 0.06 145)"
        stroke="oklch(0.7 0.08 140)"
        strokeWidth="1"
        transform="rotate(300 25 38)"
      />
      <circle
        cx="25"
        cy="38"
        r="4"
        fill="oklch(0.85 0.12 85)"
        stroke="var(--color-ink)"
        strokeWidth="1"
      />
    </svg>
  );
}

function CoffeeDoodle() {
  return (
    <svg
      className="w-[70px] h-[70px]"
      viewBox="0 0 70 70"
      fill="none"
      stroke="var(--color-ink)"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path
        d="M15 25 L15 50 Q15 58 25 58 L40 58 Q50 58 50 50 L50 25"
        fill="var(--color-paper-deep)"
        stroke="var(--color-ink)"
        strokeWidth="2"
      />
      <ellipse
        cx="32.5"
        cy="25"
        rx="17.5"
        ry="4"
        fill="var(--color-paper)"
        stroke="var(--color-ink)"
        strokeWidth="2"
      />
      <path
        d="M50 32 Q60 32 60 40 Q60 48 50 48"
        fill="none"
        stroke="var(--color-ink)"
        strokeWidth="2"
      />
      <ellipse
        cx="32.5"
        cy="60"
        rx="20"
        ry="4"
        fill="var(--color-paper-deep)"
        stroke="var(--color-ink)"
        strokeWidth="1.5"
      />
      <path
        d="M25 18 Q28 12 25 8"
        stroke="var(--color-ink)"
        strokeWidth="1.5"
        fill="none"
        opacity="0.4"
      />
      <path
        d="M32 15 Q35 9 32 5"
        stroke="var(--color-ink)"
        strokeWidth="1.5"
        fill="none"
        opacity="0.4"
      />
      <path
        d="M40 18 Q43 12 40 8"
        stroke="var(--color-ink)"
        strokeWidth="1.5"
        fill="none"
        opacity="0.4"
      />
      <ellipse
        cx="32.5"
        cy="28"
        rx="14"
        ry="3"
        fill="oklch(0.45 0.05 45)"
        stroke="none"
        opacity="0.75"
      />
    </svg>
  );
}

/* ───────── Custom Scrapbook Dialog Types ───────── */
type ConfirmDialog = {
  kind: "confirm";
  title: string;
  message: string;
  onConfirm: () => void;
};

type PromptDialog = {
  kind: "prompt";
  title: string;
  message: string;
  placeholder: string;
  onSubmit: (value: string) => void;
};

type AlertDialog = {
  kind: "alert";
  title: string;
  message: string;
};

type ScrapbookDialog = ConfirmDialog | PromptDialog | AlertDialog;

function CollectionsPage() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [openCollection, setOpenCollection] = useState<string | null>(null);
  const [customShelves, setCustomShelves] = useState<string[]>([]);
  const [activeEntry, setActiveEntry] = useState<Entry | null>(null);
  const [imagePreview, setImagePreview] = useState<{
    src: string;
    title: string;
  } | null>(null);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    type: "shelf" | "note";
    targetId: string;
  } | null>(null);
  const [month, setMonth] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d;
  });
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [hoveredShelf, setHoveredShelf] = useState<string | null>(null);

  /* ── Scrapbook Dialog State ── */
  const [dialog, setDialog] = useState<ScrapbookDialog | null>(null);
  const [promptValue, setPromptValue] = useState("");

  const refreshEntries = useCallback(() => {
    loadEntries().then(setEntries);
  }, []);

  useEffect(() => {
    refreshEntries();
    import("@/lib/entries").then(({ loadCustomShelves }) => {
      loadCustomShelves().then((stored) => {
        setCustomShelves(stored);
      });
    });

    const closeMenu = () => setContextMenu(null);
    window.addEventListener("click", closeMenu);
    window.addEventListener("scroll", closeMenu, { passive: true });
    return () => {
      window.removeEventListener("click", closeMenu);
      window.removeEventListener("scroll", closeMenu);
    };
  }, [refreshEntries]);

  const collections = useMemo(() => {
    const map = new Map<string, Entry[]>();
    for (const shelf of customShelves) {
      if (shelf.trim()) {
        map.set(shelf.trim(), []);
      }
    }
    for (const e of entries) {
      const shelfName = e.collection.trim() || "";
      if (shelfName) {
        if (!map.has(shelfName)) map.set(shelfName, []);
        map.get(shelfName)!.push(e);
      }
    }
    return Array.from(map.entries()).sort((a, b) => b[1].length - a[1].length);
  }, [entries, customShelves]);

  const datesWithEntries = useMemo(
    () => new Set(entries.map((e) => e.date)),
    [entries],
  );

  const selectedEntries = useMemo(
    () => (selectedDate ? entries.filter((e) => e.date === selectedDate) : []),
    [selectedDate, entries],
  );

  /* ── Actions using custom dialogs ── */
  const handleCreateShelf = () => {
    setPromptValue("");
    setDialog({
      kind: "prompt",
      title: "New Shelf ✿",
      message: "Give your shelf a name — a little jar for your moments.",
      placeholder: "name your shelf...",
      onSubmit: (name: string) => {
        if (!name.trim()) return;
        const trimmed = name.trim();
        if (customShelves.includes(trimmed)) {
          setDialog({
            kind: "alert",
            title: "Already Exists!",
            message: `A shelf named "${trimmed}" already exists. Try a different name.`,
          });
          return;
        }
        const updated = [...customShelves, trimmed];
        setCustomShelves(updated);
        import("@/lib/entries").then(({ saveCustomShelves }) => {
          saveCustomShelves(updated);
        });
        setDialog(null);
      },
    });
  };

  const handleDeleteShelf = (shelfName: string) => {
    setDialog({
      kind: "confirm",
      title: "Delete Shelf?",
      message: `Are you sure you want to fold away "${shelfName}" and all its memories permanently?`,
      onConfirm: async () => {
        const updatedCustom = customShelves.filter((s) => s !== shelfName);
        setCustomShelves(updatedCustom);
        const { saveCustomShelves } = await import("@/lib/entries");
        await saveCustomShelves(updatedCustom);

        const allEntries = await loadEntries();
        const toDelete = allEntries.filter((e) => e.collection === shelfName);
        const { removeEntry } = await import("@/lib/entries");
        await Promise.all(toDelete.map((e) => removeEntry(e.id)));

        const updatedEntries = await loadEntries();
        setEntries(updatedEntries);

        if (openCollection === shelfName) {
          setOpenCollection(null);
        }
        setDialog(null);
      },
    });
  };

  const handleDeleteEntry = (entryId: string) => {
    setDialog({
      kind: "confirm",
      title: "Discard Memory?",
      message:
        "This fold will be gone forever. Are you sure you want to let it go?",
      onConfirm: async () => {
        const { removeEntry } = await import("@/lib/entries");
        await removeEntry(entryId);
        const updatedEntries = await loadEntries();
        setEntries(updatedEntries);
        setActiveEntry(null);
        setDialog(null);
      },
    });
  };

  const handleRemoveEntryFromShelf = async (entryId: string) => {
    const { moveEntry } = await import("@/lib/entries");
    await moveEntry(entryId, "");
    const updatedEntries = await loadEntries();
    setEntries(updatedEntries);
  };

  const isNearRight = useMemo(() => {
    if (!contextMenu) return false;
    return window.innerWidth - contextMenu.x < 240;
  }, [contextMenu]);

  const menuY = useMemo(() => {
    if (!contextMenu) return 0;
    const menuHeight = contextMenu.type === "shelf" ? 80 : 140;
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
    <main className="relative flex min-h-screen flex-col justify-start overflow-x-hidden pt-4 pb-[calc(8.5rem+env(safe-area-inset-bottom))] lg:h-[calc(100vh-4rem)] lg:overflow-hidden lg:pb-6">
      <SparkleDoodle className="absolute top-20 left-8 h-6 w-6 text-secondary opacity-60 pointer-events-none" />
      <StarDoodle
        className="absolute top-56 right-6 h-7 w-7 text-accent animate-float pointer-events-none"
        color="oklch(0.85 0.13 90)"
      />

      {/* Decorative view background Polaroids */}
      <div
        className="fixed top-[120px] -left-[60px] z-0 pointer-events-none opacity-20 dark:opacity-10 hidden xl:block"
        style={{ transform: "rotate(-15deg)" }}
      >
        <div className="bg-paper p-2 pb-6 shadow-md w-[120px] border-2 border-ink/40 rounded-xl">
          <div className="w-full aspect-square bg-tape-pink/40" />
        </div>
      </div>
      <div
        className="fixed top-[320px] -right-[60px] z-0 pointer-events-none opacity-20 dark:opacity-10 hidden xl:block"
        style={{ transform: "rotate(12deg)" }}
      >
        <div className="bg-paper p-2 pb-6 shadow-md w-[110px] border-2 border-ink/40 rounded-xl">
          <div className="w-full aspect-square bg-tape-mint/40" />
        </div>
      </div>
      <div
        className="fixed bottom-[180px] -left-[40px] z-0 pointer-events-none opacity-20 dark:opacity-10 hidden xl:block"
        style={{ transform: "rotate(8deg)" }}
      >
        <div className="bg-paper p-2 pb-6 shadow-md w-[100px] border-2 border-ink/40 rounded-xl">
          <div className="w-full aspect-square bg-tape-lavender/40" />
        </div>
      </div>

      <header className="relative z-30 mx-auto flex w-full max-w-6xl shrink-0 items-center justify-between px-4 py-5 md:px-10 md:hidden">
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

      <section className="mx-auto max-w-6xl w-full px-6 md:px-10 shrink-0">
        <p className="font-accent text-xs uppercase tracking-[0.2em] text-ink-soft">
          your shelves
        </p>
        <div className="relative inline-block">
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl text-ink mt-1">
            Collections
          </h1>
          <UnderlineSquiggle className="absolute -bottom-2 left-0 h-2 w-full text-primary" />
        </div>
        <p className="font-hand text-2xl text-ink-soft mt-3">
          moments, sorted into little jars
        </p>
      </section>

      {/* Unified Open Book spread Container */}
      <section className="relative z-10 mx-auto mt-8 w-full max-w-6xl flex-1 px-4 pb-6 md:px-10 lg:mt-6 lg:min-h-0 lg:pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 rounded-[32px] overflow-hidden relative border-2 border-ink/80 bg-paper/60 backdrop-blur-md shadow-[var(--shadow-paper)] lg:h-full">
          {/* Book Spine */}
          <div
            className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-[4px] -translate-x-1/2 z-10 pointer-events-none"
            style={{
              background:
                "linear-gradient(to right, transparent, color-mix(in oklab, var(--color-ink) 12%, transparent), transparent)",
            }}
          />

          {/* LEFT PAGE - COLLECTIONS */}
          <div className="p-6 md:p-8 relative min-h-[450px] lg:min-h-0 lg:h-full border-b lg:border-b-0 lg:border-r border-ink/30 flex flex-col justify-between overflow-hidden">
            <div className="flex-1 min-h-0 flex flex-col justify-start">
              <div className="flex items-center justify-between mb-6 shrink-0">
                <h2 className="font-display text-2xl text-ink flex items-center gap-2">
                  <FolderHeart className="h-5 w-5 text-primary" /> My Shelves
                </h2>
                <button
                  onClick={handleCreateShelf}
                  className="font-hand text-lg border-2 border-ink px-3.5 py-1 rounded-full bg-accent hover:bg-accent/80 text-ink shadow-[2px_2px_0_var(--color-ink)] active:translate-y-0.5 transition-all cursor-pointer font-bold"
                >
                  + New Shelf
                </button>
              </div>

              {collections.length === 0 ? (
                <p className="font-hand text-2xl text-ink-soft text-center mt-10">
                  no shelves yet — fold a moment first ✿
                </p>
              ) : (
                <div className="-m-4 grid grid-cols-1 gap-6 overflow-visible p-4 pt-10 pb-6 sm:grid-cols-2 lg:min-h-0 lg:flex-1 lg:overflow-y-auto subtle-scroll">
                  {collections.map(([name, items], idx) => {
                    const tape = tapeFor[idx % tapeFor.length];
                    const cover = items.find(
                      (e) => e.photos && e.photos.length > 0,
                    );
                    const rotate =
                      (idx % 2 === 0 ? -1 : 1) * (1 + (idx % 3) * 0.4);
                    const isHovered = hoveredShelf === name;
                    return (
                      <button
                        key={name}
                        onMouseEnter={() => setHoveredShelf(name)}
                        onMouseLeave={() => setHoveredShelf(null)}
                        onClick={() =>
                          setOpenCollection((cur) =>
                            cur === name ? null : name,
                          )
                        }
                        onContextMenu={(e) => {
                          e.preventDefault();
                          setContextMenu({
                            x: e.clientX,
                            y: e.clientY,
                            type: "shelf",
                            targetId: name,
                          });
                        }}
                        className={[
                          "text-left relative paper-card rounded-xl border-2 p-4 transition-all cursor-pointer h-fit",
                          openCollection === name
                            ? "border-primary bg-primary-soft/10 shadow-[var(--shadow-paper)] z-10"
                            : isHovered
                              ? "border-ink/80 bg-accent/20 shadow-[var(--shadow-paper)] z-10"
                              : "border-ink/80 z-0",
                        ].join(" ")}
                        style={{
                          transform: `rotate(${rotate}deg) ${isHovered ? "scale(1.04) translateY(-5px)" : "scale(1) translateY(0)"}`,
                          transition:
                            "transform 0.2s ease, border-width 0.1s ease, box-shadow 0.2s ease",
                        }}
                      >
                        <WashiTape
                          color={tape}
                          rotate={-6}
                          width="4rem"
                          className="absolute -top-2 left-6"
                        />
                        {cover?.photos && cover.photos.length > 0 ? (
                          <img
                            src={cover.photos[0]}
                            alt=""
                            className="w-full h-24 object-cover rounded-lg border border-ink/40"
                          />
                        ) : (
                          <div className="w-full h-24 rounded-lg border border-ink/40 bg-paper-deep/60 grid place-items-center">
                            <span className="text-4xl">
                              {items[0]?.mood ?? "✿"}
                            </span>
                          </div>
                        )}
                        <div className="flex items-end justify-between mt-2.5">
                          <div className="min-w-0">
                            <h3 className="font-display text-lg text-ink leading-tight truncate">
                              {name}
                            </h3>
                            <p className="font-hand text-base text-ink-soft">
                              {items.length}{" "}
                              {items.length === 1 ? "fold" : "folds"}
                            </p>
                          </div>
                          <HeartDoodle className="h-4 w-4 text-primary opacity-60 shrink-0" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Left Page Bottom / Organic Tape style spacer */}
            <div className="mt-8 border-t border-dashed border-ink/20 pt-4 flex items-center justify-between text-xs text-ink-soft uppercase font-accent tracking-widest shrink-0">
              <span>MomentStash © 2026</span>
              <span>Keep details close</span>
            </div>
          </div>

          {/* RIGHT PAGE - CALENDAR */}
          <div className="p-6 md:p-8 relative min-h-[450px] lg:min-h-0 lg:h-full flex flex-col justify-between overflow-hidden">
            <div className="flex-1 min-h-0 flex flex-col justify-start">
              <div className="flex items-center justify-between gap-4 mb-6 flex-wrap shrink-0">
                <h2 className="font-display text-2xl text-ink flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5 text-primary" /> Calendar
                </h2>
                <div className="flex items-center gap-2">
                  <CalNavBtn
                    onClick={() => setMonth(addMonths(month, -1))}
                    dir="left"
                  />
                  <span className="font-hand text-xl text-ink min-w-[8rem] text-center font-bold">
                    {month.toLocaleDateString(undefined, {
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                  <CalNavBtn
                    onClick={() => setMonth(addMonths(month, 1))}
                    dir="right"
                  />
                </div>
              </div>

              <div className="grid grid-cols-7 gap-1.5 mb-2 shrink-0">
                {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
                  <div
                    key={i}
                    className="text-center font-accent text-xs font-bold uppercase tracking-widest text-ink-soft"
                  >
                    {d}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1.5 overflow-visible pr-1 lg:min-h-0 lg:flex-1 lg:overflow-y-auto subtle-scroll">
                {buildMonthCells(month).map((cell, i) => {
                  if (!cell) return <div key={i} />;
                  const iso = isoDate(cell);
                  const has = datesWithEntries.has(iso);
                  const isSelected = selectedDate === iso;
                  const isToday = iso === isoDate(new Date());
                  return (
                    <button
                      key={i}
                      onClick={() => setSelectedDate(isSelected ? null : iso)}
                      className={[
                        "aspect-square rounded-xl border-2 flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer relative h-fit",
                        isSelected
                          ? "bg-primary text-primary-foreground border-ink shadow-[2px_2px_0_var(--color-ink)]"
                          : isToday
                            ? "bg-accent border-ink text-accent-foreground"
                            : "border-ink/40 bg-paper/40 hover:border-ink",
                      ].join(" ")}
                    >
                      <span className="font-accent text-xs font-bold leading-none">
                        {cell.getDate()}
                      </span>
                      {has && (
                        <span
                          className={[
                            "h-1.5 w-1.5 rounded-full absolute bottom-1",
                            isSelected ? "bg-primary-foreground" : "bg-primary",
                          ].join(" ")}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Doodles at the very bottom right of the page */}
            <div className="mt-8 pt-4 flex justify-between items-end relative pointer-events-none shrink-0">
              <div className="flex items-end shrink-0 z-0">
                <PlantDoodle1 />
                <PlantDoodle2 />
              </div>
              <div className="shrink-0 z-0 pr-2 pb-1">
                <CoffeeDoodle />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Expanded shelve/collection details panel */}
      {openCollection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setOpenCollection(null)}
            className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity animate-fade-in"
          />
          <div className="relative w-full max-w-4xl paper-card rounded-[32px] border-2 border-ink p-6 md:p-8 shadow-[var(--shadow-lift)] max-h-[85vh] flex flex-col animate-wobble-in">
            <WashiTape
              color="lavender"
              rotate={-3}
              width="6rem"
              className="absolute -top-3 left-12"
            />
            <button
              onClick={() => setOpenCollection(null)}
              className="absolute top-4 right-4 h-8 w-8 grid place-items-center rounded-full border-2 border-ink bg-paper text-ink hover:bg-accent cursor-pointer transition-colors font-hand text-xl z-10"
            >
              ✕
            </button>
            <div className="flex items-center gap-3 mb-4 pr-8 shrink-0">
              <h3 className="font-display text-3xl text-ink font-bold leading-none truncate">
                {openCollection}
              </h3>
              <ArrowSquiggle className="h-5 w-12 text-secondary shrink-0" />
            </div>

            <div className="flex-1 overflow-y-auto subtle-scroll pr-1 mt-4 pt-2 px-1 -mx-1">
              {entries.filter((e) => e.collection === openCollection).length ===
              0 ? (
                <p className="font-hand text-2xl text-ink-soft text-center py-12">
                  this shelf is empty ✿
                </p>
              ) : (
                <ul className="grid gap-6 sm:grid-cols-2 pb-12">
                  {entries
                    .filter((e) => e.collection === openCollection)
                    .map((e) => (
                      <li
                        key={e.id}
                        onClick={(evt) => {
                          evt.stopPropagation();
                          setActiveEntry(e);
                        }}
                        onContextMenu={(event) => {
                          event.preventDefault();
                          event.stopPropagation();
                          setContextMenu({
                            x: event.clientX,
                            y: event.clientY,
                            type: "note",
                            targetId: e.id,
                          });
                        }}
                        className="rounded-2xl border-2 border-ink/60 bg-paper p-5 shadow-sm hover:shadow-[var(--shadow-paper)] hover:bg-accent/10 transition-all duration-200 relative cursor-pointer"
                      >
                        <WashiTape
                          color={e.tape}
                          rotate={2}
                          width="3.5rem"
                          className="absolute -top-2.5 right-6"
                        />
                        {e.photos && e.photos.length > 0 && (
                          <div className="mb-4">
                            <Collage photos={e.photos} />
                          </div>
                        )}
                        <div className="flex items-start gap-3">
                          <span className="text-3xl leading-none shrink-0">
                            {e.mood}
                          </span>
                          <div className="min-w-0">
                            <p className="font-display text-xl text-ink font-bold leading-tight truncate">
                              {e.title}
                            </p>
                            <p className="font-hand text-lg text-ink-soft leading-none mt-1">
                              {e.date}
                              {e.place && (
                                <>
                                  {" · "}
                                  <MapPin className="inline h-3.5 w-3.5 -mt-0.5 text-primary" />{" "}
                                  {e.place}
                                </>
                              )}
                            </p>
                          </div>
                        </div>
                        <p className="font-body text-sm text-ink-soft mt-3.5 leading-relaxed">
                          {e.note.length > 120
                            ? e.note.slice(0, 120) + "…"
                            : e.note}
                        </p>
                      </li>
                    ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Selected Date Entry Details Panel */}
      {selectedDate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setSelectedDate(null)}
            className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity animate-fade-in"
          />
          <div className="relative w-full max-w-3xl paper-card rounded-[32px] border-2 border-ink p-6 md:p-8 shadow-[var(--shadow-lift)] max-h-[85vh] flex flex-col animate-wobble-in">
            <WashiTape
              color="yellow"
              rotate={4}
              width="5rem"
              className="absolute -top-3 right-12"
            />
            <button
              onClick={() => setSelectedDate(null)}
              className="absolute top-4 right-4 h-8 w-8 grid place-items-center rounded-full border-2 border-ink bg-paper text-ink hover:bg-accent cursor-pointer transition-colors font-hand text-xl z-10"
            >
              ✕
            </button>
            <div className="border-b-2 border-dashed border-ink/30 pb-3 mb-4 pr-8 shrink-0">
              <p className="font-hand text-3xl text-ink font-bold leading-none">
                {new Date(selectedDate + "T00:00").toLocaleDateString(
                  undefined,
                  {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                  },
                )}
              </p>
            </div>

            <div className="flex-1 overflow-y-auto subtle-scroll pr-1 mt-2 pt-2 px-1 -mx-1">
              {selectedEntries.length === 0 ? (
                <p className="font-hand text-2xl text-ink-soft text-center py-6">
                  no folds for this day — perhaps a quiet one ✿
                </p>
              ) : (
                <ul className="grid gap-6 sm:grid-cols-2">
                  {selectedEntries.map((e) => (
                    <li
                      key={e.id}
                      onClick={() => {
                        setSelectedDate(null);
                        setActiveEntry(e);
                      }}
                      onContextMenu={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        setContextMenu({
                          x: event.clientX,
                          y: event.clientY,
                          type: "note",
                          targetId: e.id,
                        });
                      }}
                      className="flex items-start gap-4 rounded-xl border border-ink/40 bg-paper-deep/35 p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer"
                    >
                      {e.photos && e.photos.length > 0 && (
                        <div className="shrink-0 h-16 w-16 md:h-20 md:w-20 rounded-lg overflow-hidden border border-ink/30">
                          <img
                            src={e.photos[0]}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        </div>
                      )}
                      <span className="text-3xl leading-none shrink-0 mt-1">
                        {e.mood}
                      </span>
                      <div className="min-w-0">
                        <p className="font-display text-lg text-ink font-bold leading-tight">
                          {e.title}
                        </p>
                        <p className="font-hand text-base text-ink-soft leading-none mt-1">
                          {e.collection || "Unsorted"}
                        </p>
                        <p className="font-body text-sm text-ink-soft mt-3.5 leading-relaxed">
                          {e.note.length > 120
                            ? e.note.slice(0, 120) + "…"
                            : e.note}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Universal Memory Detail Popup Modal — Joint Scrollable */}
      {activeEntry && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in">
          <div
            onClick={() => setActiveEntry(null)}
            className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity"
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
                      {new Date(activeEntry.date + "T00:00").toLocaleDateString(
                        undefined,
                        { month: "short", day: "numeric" },
                      )}{" "}
                      ({activeEntry.date})
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

              {/* Photos */}
              {activeEntry.photos && activeEntry.photos.length > 0 && (
                <Collage
                  photos={activeEntry.photos}
                  onPhotoClick={(idx) =>
                    setImagePreview({
                      src: activeEntry.photos![idx],
                      title: activeEntry.title,
                    })
                  }
                />
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

      {imagePreview && (
        <div className="fixed inset-0 z-[140] flex items-center justify-center bg-black/70 p-4 backdrop-blur-md">
          <button
            type="button"
            onClick={() => setImagePreview(null)}
            className="absolute inset-0 cursor-zoom-out"
            aria-label="Close enlarged image"
          />
          <div className="relative max-h-[90vh] w-full max-w-5xl">
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="truncate font-display text-2xl text-paper">
                {imagePreview.title}
              </p>
              <div className="flex shrink-0 items-center gap-2">
                <a
                  href={imagePreview.src}
                  download={`${imagePreview.title || "momentstash-image"}.jpg`}
                  className="inline-flex h-10 items-center gap-2 rounded-full border-2 border-paper bg-paper px-4 font-hand text-lg text-ink shadow-[2px_2px_0_var(--color-ink)]"
                >
                  <Download className="h-4 w-4" /> Download
                </a>
                <button
                  type="button"
                  onClick={() => setImagePreview(null)}
                  className="grid h-10 w-10 place-items-center rounded-full border-2 border-paper bg-paper font-hand text-xl text-ink"
                  aria-label="Close enlarged image"
                >
                  ✕
                </button>
              </div>
            </div>
            <img
              src={imagePreview.src}
              alt=""
              className="mx-auto max-h-[calc(90vh-4rem)] max-w-full rounded-2xl border-2 border-paper object-contain shadow-[var(--shadow-lift)]"
            />
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
            width="3rem"
            className="absolute -top-2.5 left-4 pointer-events-none"
          />
          {contextMenu.type === "shelf" ? (
            <button
              onClick={() => {
                handleDeleteShelf(contextMenu.targetId);
                setContextMenu(null);
              }}
              className="text-left font-hand text-lg hover:bg-accent/40 text-red-600 hover:text-red-700 px-3 py-1.5 rounded-lg transition-colors cursor-pointer w-full"
            >
              🗑 Delete Shelf
            </button>
          ) : (
            <>
              <button
                onClick={() => {
                  window.location.href = `/create?edit=${contextMenu.targetId}`;
                  setContextMenu(null);
                }}
                className="text-left font-hand text-lg hover:bg-accent/40 text-ink px-3 py-1.5 rounded-lg transition-colors cursor-pointer w-full flex items-center gap-1.5"
              >
                <span>✏️</span> Edit Fold
              </button>
              <button
                onClick={() => {
                  handleRemoveEntryFromShelf(contextMenu.targetId);
                  setContextMenu(null);
                }}
                className="text-left font-hand text-lg hover:bg-accent/40 text-ink px-3 py-1.5 rounded-lg transition-colors cursor-pointer w-full flex items-center gap-1.5"
              >
                📁 Remove from Shelf
              </button>
              <button
                onClick={() => {
                  handleDeleteEntry(contextMenu.targetId);
                  setContextMenu(null);
                }}
                className="text-left font-hand text-lg hover:bg-accent/40 text-red-600 hover:text-red-700 px-3 py-1.5 rounded-lg transition-colors cursor-pointer w-full flex items-center gap-1.5"
              >
                🗑 Delete Note
              </button>
            </>
          )}
        </div>
      )}

      {/* ── Custom Scrapbook Dialog ── */}
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

            {dialog.kind === "prompt" && (
              <input
                autoFocus
                value={promptValue}
                onChange={(e) => setPromptValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && promptValue.trim()) {
                    dialog.onSubmit(promptValue);
                  }
                }}
                placeholder={dialog.placeholder}
                className="w-full mb-5 border-b-2 border-dashed border-ink/40 bg-transparent py-2 px-1 font-hand text-2xl text-ink outline-none focus:border-primary transition-colors placeholder:text-ink-soft/50"
              />
            )}

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDialog(null)}
                className="font-hand text-lg border-2 border-ink/40 px-5 py-1.5 rounded-full bg-paper text-ink-soft hover:bg-accent/30 cursor-pointer transition-all"
              >
                Cancel
              </button>
              {dialog.kind === "confirm" && (
                <button
                  type="button"
                  onClick={dialog.onConfirm}
                  className="font-hand text-lg border-2 border-ink px-6 py-1.5 rounded-full bg-primary text-primary-foreground hover:bg-primary/80 cursor-pointer shadow-[2px_2px_0_var(--color-ink)] active:translate-y-0.5 transition-all font-bold"
                >
                  Yes, do it
                </button>
              )}
              {dialog.kind === "prompt" && (
                <button
                  type="button"
                  onClick={() => dialog.onSubmit(promptValue)}
                  className="font-hand text-lg border-2 border-ink px-6 py-1.5 rounded-full bg-accent text-ink hover:bg-accent/80 cursor-pointer shadow-[2px_2px_0_var(--color-ink)] active:translate-y-0.5 transition-all font-bold"
                >
                  Create ✿
                </button>
              )}
              {dialog.kind === "alert" && (
                <button
                  type="button"
                  onClick={() => setDialog(null)}
                  className="font-hand text-lg border-2 border-ink px-6 py-1.5 rounded-full bg-accent text-ink hover:bg-accent/80 cursor-pointer shadow-[2px_2px_0_var(--color-ink)] active:translate-y-0.5 transition-all font-bold"
                >
                  Okay ✿
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function CalNavBtn({
  onClick,
  dir,
}: {
  onClick: () => void;
  dir: "left" | "right";
}) {
  return (
    <button
      onClick={onClick}
      className="grid h-10 w-10 place-items-center rounded-full border-2 border-ink bg-paper hover:bg-accent cursor-pointer transition-colors"
      aria-label={dir === "left" ? "Previous month" : "Next month"}
    >
      {dir === "left" ? (
        <ChevronLeft className="h-4 w-4" />
      ) : (
        <ChevronRight className="h-4 w-4" />
      )}
    </button>
  );
}

function addMonths(d: Date, n: number) {
  const nd = new Date(d);
  nd.setMonth(nd.getMonth() + n);
  return nd;
}

function isoDate(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function buildMonthCells(monthStart: Date): (Date | null)[] {
  const year = monthStart.getFullYear();
  const month = monthStart.getMonth();
  const first = new Date(year, month, 1);
  const startWeekday = first.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (Date | null)[] = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}
