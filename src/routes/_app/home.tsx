import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@/lib/auth";
import { useTheme } from "@/lib/theme";
import { loadEntries, type Entry } from "@/lib/entries";
import { Collage } from "@/components/Collage";
import { Polaroid } from "@/components/Polaroid";
import { StickerButton } from "@/components/StickerButton";
import { WashiTape } from "@/components/WashiTape";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  StarDoodle,
  HeartDoodle,
  SparkleDoodle,
  UnderlineSquiggle,
  ArrowSquiggle,
} from "@/components/Doodles";
import { Calendar, MapPin, Camera, Plus, LogOut, Settings } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import coffeeFallback from "@/assets/photo-coffee.jpg";
import sunsetFallback from "@/assets/photo-sunset.jpg";
import flowersFallback from "@/assets/photo-flowers.jpg";
import croissantFallback from "@/assets/photo-croissant.jpg";
import { SettingsModal } from "@/components/SettingsModal";
import { MemoryDetailModal } from "@/components/MemoryDetailModal";
import { ImagePreviewModal } from "@/components/ImagePreviewModal";
import { ContextMenu } from "@/components/ContextMenu";
import { ConfirmDialog } from "@/components/ConfirmDialog";

gsap.registerPlugin(ScrollTrigger);
const spreadFallbacks = [
  coffeeFallback,
  croissantFallback,
  flowersFallback,
  sunsetFallback,
];

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
  const { user, logout, updateProfile, deleteAccount } = useAuth();
  const navigate = useNavigate();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [activeEntry, setActiveEntry] = useState<Entry | null>(null);
  const [imagePreview, setImagePreview] = useState<{
    src: string;
    title: string;
  } | null>(null);
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    loadEntries().then(setEntries);
  }, []);

  /* ── GSAP ScrollTrigger Parallax & Entrance Animations ── */
  useEffect(() => {
    if (!mainRef.current || entries.length === 0) return;
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
        },
      });

      // Stat cards entrance
      ScrollTrigger.batch(".stat-card", {
        onEnter: (elements) => {
          gsap.fromTo(
            elements,
            { opacity: 0, y: 30, scale: 0.92 },
            {
              opacity: 1,
              y: 0,
              scale: 1,
              stagger: 0.1,
              duration: 0.5,
              ease: "back.out(1.6)",
              overwrite: true,
            },
          );
        },
        start: "top 88%",
      });

      // Polaroid spread entrance
      ScrollTrigger.batch(".polaroid-item", {
        onEnter: (elements) => {
          gsap.fromTo(
            elements,
            { opacity: 0, y: 50, rotateZ: -5 },
            {
              opacity: 1,
              y: 0,
              rotateZ: 0,
              stagger: 0.12,
              duration: 0.7,
              ease: "elastic.out(1, 0.6)",
              overwrite: true,
            },
          );
        },
        start: "top 85%",
      });

      // Featured card entrance
      gsap.fromTo(
        ".featured-card",
        { opacity: 0, y: 60 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power2.out",
          scrollTrigger: {
            trigger: ".featured-card",
            start: "top 85%",
            toggleActions: "play none none none",
          },
        },
      );
    }, mainRef);
    return () => ctx.revert();
  }, [entries]);

  const { theme, toggle: toggleTheme } = useTheme();
  const [settingsOpen, setSettingsOpen] = useState(false);

  const [shelves, setShelves] = useState<string[]>([]);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    targetId: string;
  } | null>(null);

  /* ── Scrapbook Dialog State ── */
  const [dialog, setDialog] = useState<{
    kind: "confirm";
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);

  useEffect(() => {
    if (entries.length === 0) return;
    // Load dynamic shelves
    import("@/lib/entries").then(({ loadCustomShelves }) => {
      loadCustomShelves().then((stored) => {
        const activeShelves = entries.map((e) => e.collection).filter(Boolean);
        const merged = Array.from(new Set([...stored, ...activeShelves]));
        setShelves(merged);
      });
    });

    const closeMenu = () => setContextMenu(null);
    window.addEventListener("click", closeMenu);
    window.addEventListener("scroll", closeMenu, { passive: true });
    return () => {
      window.removeEventListener("click", closeMenu);
      window.removeEventListener("scroll", closeMenu);
    };
  }, [entries]);

  const handleDeleteEntry = async (entryId: string) => {
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

  const handleMoveEntry = async (entryId: string, newShelf: string) => {
    const { moveEntry } = await import("@/lib/entries");
    await moveEntry(entryId, newShelf.trim());
    const updatedEntries = await loadEntries();
    setEntries(updatedEntries);

    // Update shelves if moved to a new one
    if (newShelf.trim() && !shelves.includes(newShelf.trim())) {
      const updatedShelves = [...shelves, newShelf.trim()];
      setShelves(updatedShelves);
      const custom = JSON.parse(
        localStorage.getItem("momentstash_custom_shelves") || "[]",
      ) as string[];
      if (!custom.includes(newShelf.trim())) {
        const updated = [...custom, newShelf.trim()];
        import("@/lib/entries").then(({ saveCustomShelves }) => {
          saveCustomShelves(updated);
        });
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

  const today = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const todayKey = todayISO();
  const todays = useMemo(
    () => entries.filter((e) => e.date === todayKey),
    [entries, todayKey],
  );
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
    <main
      ref={mainRef}
      className="relative min-h-screen overflow-hidden pt-4 pb-36"
    >
      <div className="home-doodle-float">
        <SparkleDoodle className="absolute top-16 right-8 h-6 w-6 text-secondary opacity-60 pointer-events-none" />
        <StarDoodle
          className="absolute top-40 left-6 h-7 w-7 text-accent animate-float pointer-events-none"
          color="oklch(0.85 0.13 90)"
        />
      </div>

      <div
        className={
          activeEntry
            ? "blur-[2px] opacity-40 select-none pointer-events-none transition-all duration-300"
            : "transition-all duration-300"
        }
      >
        <header className="relative z-30 mx-auto flex max-w-6xl items-center justify-between px-4 py-5 md:px-10 md:hidden">
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
            <span className="hidden sm:inline font-hand text-xl text-ink-soft">
              hi, {user?.name.split(" ")[0]}
            </span>
            <ThemeToggle className="h-9 w-9 shrink-0" />
            <button
              onClick={() => {
                logout();
                navigate({ to: "/" });
              }}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-full border-2 border-ink bg-paper transition-colors hover:bg-accent"
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
              <h1 className="font-display text-5xl md:text-6xl text-ink mt-1">
                {today}
              </h1>
              <div className="relative inline-block mt-2">
                <p className="font-hand text-3xl text-primary">
                  tiny magic, gathered
                </p>
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
            <Stat
              icon={<Camera className="h-4 w-4" />}
              label="moments"
              value={String(entries.length)}
              tape="pink"
              className="stat-card"
            />
            <Stat
              icon={<MapPin className="h-4 w-4" />}
              label="places"
              value={String(places)}
              tape="mint"
              className="stat-card"
            />
            <Stat
              icon={<Calendar className="h-4 w-4" />}
              label="streak"
              value={streak > 0 ? `${streak}d` : "—"}
              tape="yellow"
              className="stat-card"
            />
            <Stat
              icon={<HeartDoodle className="h-4 w-4 text-primary" />}
              label="today"
              value={String(todays.length)}
              tape="lavender"
              className="stat-card"
            />
          </div>
        </section>

        <section className="relative mx-auto max-w-6xl px-6 md:px-10 mt-16">
          <h2 className="font-display text-2xl text-ink mb-6 flex items-center gap-2">
            your spread
            <ArrowSquiggle className="h-5 w-10 text-secondary" />
          </h2>

          {spread.length === 0 ? (
            <div className="paper-card rounded-2xl border-2 border-ink/80 p-10 text-center">
              <p className="font-hand text-2xl text-ink-soft">
                your scrapbook is empty ✿
              </p>
              <Link to="/create" className="inline-block mt-4">
                <StickerButton>fold your first moment</StickerButton>
              </Link>
            </div>
          ) : (
            <div className="grid max-w-3xl grid-cols-2 gap-6 sm:grid-cols-3 md:gap-8">
              {spread.map((e, i) => (
                <div
                  key={e.id}
                  className="polaroid-item flex justify-center"
                  onContextMenu={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    setContextMenu({
                      x: event.clientX,
                      y: event.clientY,
                      targetId: e.id,
                    });
                  }}
                >
                  <Polaroid
                    alt={e.title}
                    caption={
                      e.title.length > 28 ? e.title.slice(0, 28) + "…" : e.title
                    }
                    rotate={0}
                    tape={e.tape}
                    className="w-full max-w-[12rem] sm:max-w-[13rem] md:max-w-[14rem]"
                    onClick={() => setActiveEntry(e)}
                  >
                    {e.photos && e.photos.length > 0 ? (
                      <div className="w-full h-full">
                        <Collage photos={e.photos} />
                      </div>
                    ) : (
                      <span className="text-6xl">{e.mood}</span>
                    )}
                  </Polaroid>
                </div>
              ))}
            </div>
          )}
        </section>

        {featured && (
          <section className="relative mx-auto max-w-6xl px-6 md:px-10 mt-20">
            <div
              className="featured-card relative paper-card rounded-[32px] border-2 border-ink/80 overflow-hidden cursor-pointer hover:shadow-[var(--shadow-lift)] transition-all duration-300"
              onClick={() => setActiveEntry(featured)}
              onContextMenu={(event) => {
                event.preventDefault();
                event.stopPropagation();
                setContextMenu({
                  x: event.clientX,
                  y: event.clientY,
                  targetId: featured.id,
                });
              }}
            >
              <WashiTape
                color="lavender"
                rotate={-4}
                width="8rem"
                className="absolute -top-3 left-12"
              />
              <div className="grid grid-cols-1 md:grid-cols-2">
                {featured.photos && featured.photos.length > 0 ? (
                  <div className="h-72 md:h-96 w-full flex items-center justify-center p-6 bg-paper-deep/30 overflow-hidden relative">
                    <div className="w-full max-w-[280px]">
                      <Collage photos={featured.photos} className="!mt-0" />
                    </div>
                  </div>
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
                  <p className="font-body text-ink-soft mt-4 leading-relaxed line-clamp-4">
                    {featured.note}
                  </p>
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
        <MemoryDetailModal
          activeEntry={activeEntry}
          onClose={() => setActiveEntry(null)}
          onImageClick={(idx) => {
            if (activeEntry.photos) {
              setImagePreview({
                src: activeEntry.photos[idx],
                title: activeEntry.title,
              });
            }
          }}
        />
      )}

      {settingsOpen && (
        <SettingsModal
          user={user}
          theme={theme}
          toggleTheme={toggleTheme}
          updateProfile={updateProfile}
          deleteAccount={deleteAccount}
          setEntries={setEntries}
          onClose={() => setSettingsOpen(false)}
        />
      )}

      {imagePreview && (
        <ImagePreviewModal
          imagePreview={imagePreview}
          onClose={() => setImagePreview(null)}
        />
      )}

      {/* Floating Scrapbook Custom Context Menu */}
      <ContextMenu
        contextMenu={contextMenu}
        shelves={shelves}
        isNearRight={isNearRight}
        menuX={menuX}
        menuY={menuY}
        onEdit={(id) => navigate({ to: "/create", search: { edit: id } })}
        onDelete={(id) => handleDeleteEntry(id)}
        onMove={(id, shelf) => handleMoveEntry(id, shelf)}
        onClose={() => setContextMenu(null)}
      />

      {/* ── Custom Scrapbook Confirm Dialog ── */}
      <ConfirmDialog dialog={dialog} onClose={() => setDialog(null)} />
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
    <div
      className={`relative paper-card rounded-2xl border-2 border-ink/70 p-4 ${className}`}
    >
      <WashiTape
        color={tape}
        rotate={-6}
        width="3rem"
        className="absolute -top-2 left-4"
      />
      <div className="flex items-center gap-2 text-ink-soft">
        {icon}
        <span className="font-accent text-xs uppercase tracking-widest">
          {label}
        </span>
      </div>
      <p className="font-display text-3xl text-ink mt-1">{value}</p>
    </div>
  );
}
