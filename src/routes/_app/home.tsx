import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@/lib/auth";
import { useTheme } from "@/lib/theme";
import { loadEntries, type Entry } from "@/lib/entries";
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
import {
  Calendar,
  MapPin,
  Camera,
  Plus,
  LogOut,
  Settings,
  Moon,
  Upload,
  Download,
} from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import coffeeFallback from "@/assets/photo-coffee.jpg";
import sunsetFallback from "@/assets/photo-sunset.jpg";
import flowersFallback from "@/assets/photo-flowers.jpg";
import croissantFallback from "@/assets/photo-croissant.jpg";

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
  const { user, logout, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [activeEntry, setActiveEntry] = useState<Entry | null>(null);
  const [imagePreview, setImagePreview] = useState<{
    src: string;
    title: string;
  } | null>(null);
  const mainRef = useRef<HTMLElement>(null);
  const profilePhotoRef = useRef<HTMLInputElement>(null);

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
  const [profileName, setProfileName] = useState(user?.name ?? "");
  const [profilePhoto, setProfilePhoto] = useState<string | undefined>(
    user?.avatarDataUrl,
  );

  useEffect(() => {
    setProfileName(user?.name ?? "");
    setProfilePhoto(user?.avatarDataUrl);
  }, [user?.avatarDataUrl, user?.name]);

  const handleProfilePhoto = (file: File | undefined) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setProfilePhoto(reader.result as string);
    reader.readAsDataURL(file);
  };

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
                <div key={e.id} className="polaroid-item flex justify-center">
                  <Polaroid
                    src={
                      e.photoDataUrl ||
                      spreadFallbacks[i % spreadFallbacks.length]
                    }
                    alt={e.title}
                    caption={
                      e.title.length > 28 ? e.title.slice(0, 28) + "…" : e.title
                    }
                    rotate={e.rotate || (i % 2 === 0 ? -3 : 2)}
                    tape={e.tape}
                    className="w-full max-w-[12rem] sm:max-w-[13rem] md:max-w-[14rem]"
                    onClick={() => setActiveEntry(e)}
                  />
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
            >
              <WashiTape
                color="lavender"
                rotate={-4}
                width="8rem"
                className="absolute -top-3 left-12"
              />
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

              {/* Photo */}
              {activeEntry.photoDataUrl && (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() =>
                      setImagePreview({
                        src: activeEntry.photoDataUrl!,
                        title: activeEntry.title,
                      })
                    }
                    className="block w-full cursor-zoom-in"
                    aria-label="Enlarge image"
                  >
                    <img
                      src={activeEntry.photoDataUrl}
                      alt=""
                      className="w-full max-h-[350px] object-cover rounded-2xl border-2 border-ink/85 shadow-sm"
                    />
                  </button>
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
            <WashiTape
              color="pink"
              rotate={-4}
              width="7rem"
              className="absolute -top-3 left-10"
            />
            <WashiTape
              color="mint"
              rotate={6}
              width="6rem"
              className="absolute -top-3 right-10"
            />

            <button
              onClick={() => setSettingsOpen(false)}
              className="absolute top-4 right-4 h-8 w-8 grid place-items-center rounded-full border-2 border-ink bg-paper text-ink hover:bg-accent cursor-pointer transition-colors font-hand text-xl"
              aria-label="Close settings"
            >
              ✕
            </button>

            <h2 className="font-display text-4xl text-ink mb-6 flex items-center gap-3">
              <Settings className="h-7 w-7 text-primary animate-spin-slow" />{" "}
              Settings
            </h2>

            <div className="space-y-5">
              <div className="rounded-2xl border-2 border-ink/80 bg-paper-deep/35 p-5">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                  <input
                    ref={profilePhotoRef}
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={(event) =>
                      handleProfilePhoto(event.target.files?.[0])
                    }
                  />
                  <button
                    type="button"
                    onClick={() => profilePhotoRef.current?.click()}
                    className="group relative h-24 w-24 shrink-0 overflow-hidden rounded-full border-2 border-ink bg-accent/35"
                    aria-label="Change profile photo"
                  >
                    {profilePhoto ? (
                      <img
                        src={profilePhoto}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="grid h-full w-full place-items-center font-display text-4xl text-ink">
                        {profileName.trim().charAt(0).toUpperCase() || "M"}
                      </span>
                    )}
                    <span className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-1 bg-ink/70 py-1 font-accent text-[10px] uppercase tracking-wider text-paper opacity-0 transition-opacity group-hover:opacity-100">
                      <Upload className="h-3 w-3" /> photo
                    </span>
                  </button>

                  <div className="min-w-0 flex-1">
                    <label className="block">
                      <span className="mb-2 block font-accent text-xs uppercase tracking-[0.2em] text-ink-soft">
                        display name
                      </span>
                      <input
                        value={profileName}
                        onChange={(event) => setProfileName(event.target.value)}
                        className="w-full rounded-xl border-2 border-ink/50 bg-paper px-4 py-3 font-hand text-2xl text-ink outline-none transition-colors focus:border-primary"
                      />
                    </label>
                    <p className="mt-2 truncate font-accent text-xs tracking-wider text-ink-soft">
                      {user?.email}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border-2 border-ink bg-paper p-4 flex items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 shrink-0 grid place-items-center rounded-lg border border-ink bg-accent/30 text-ink">
                    <Moon className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-display text-lg text-ink font-bold leading-snug">
                      Dark Mode
                    </h4>
                    <p className="font-body text-xs text-ink-soft leading-tight">
                      Easier on the eyes at night
                    </p>
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

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSettingsOpen(false)}
                  className="font-hand text-lg border-2 border-ink/50 px-5 py-1.5 rounded-full bg-paper text-ink-soft hover:bg-accent/30 cursor-pointer transition-all"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    updateProfile({
                      name: profileName,
                      avatarDataUrl: profilePhoto,
                    });
                    setSettingsOpen(false);
                  }}
                  className="font-hand text-lg border-2 border-ink px-6 py-1.5 rounded-full bg-primary text-primary-foreground hover:bg-primary-soft cursor-pointer shadow-[2px_2px_0_var(--color-ink)] active:translate-y-0.5 transition-all font-bold"
                >
                  Save Profile
                </button>
              </div>
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
