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
  Cloud,
  FileText,
  Archive,
} from "lucide-react";
import { toast } from "sonner";
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
  const { user, logout, updateProfile, deleteAccount } = useAuth();
  const navigate = useNavigate();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [activeEntry, setActiveEntry] = useState<Entry | null>(null);
  const [imagePreview, setImagePreview] = useState<{
    src: string;
    title: string;
  } | null>(null);
  const mainRef = useRef<HTMLElement>(null);
  const profilePhotoRef = useRef<HTMLInputElement>(null);

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
  const [profileName, setProfileName] = useState(user?.name ?? "");
  const [profilePhoto, setProfilePhoto] = useState<string | undefined>(
    user?.avatarDataUrl,
  );

  useEffect(() => {
    setProfileName(user?.name ?? "");
    setProfilePhoto(user?.avatarDataUrl);
  }, [user?.avatarDataUrl, user?.name]);

  const [linkingGdrive, setLinkingGdrive] = useState(false);
  const [exportStartDate, setExportStartDate] = useState("");
  const [exportEndDate, setExportEndDate] = useState("");
  const [isImporting, setIsImporting] = useState(false);

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
    const stored = JSON.parse(
      localStorage.getItem("momentstash_custom_shelves") || "[]",
    ) as string[];
    const activeShelves = entries.map((e) => e.collection).filter(Boolean);
    const merged = Array.from(new Set([...stored, ...activeShelves]));
    setShelves(merged);

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

  const handleExportPDF = () => {
    const all = loadEntries();
    let filtered = [...all].sort((a, b) => b.date.localeCompare(a.date));

    if (exportStartDate) {
      filtered = filtered.filter((e) => e.date >= exportStartDate);
    }
    if (exportEndDate) {
      filtered = filtered.filter((e) => e.date <= exportEndDate);
    }

    if (filtered.length === 0) {
      toast.error("No folded memories found in this date range to print! ✿");
      return;
    }

    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast.error("Failed to open print window. Please allow popups! ✿");
      return;
    }

    const titleStr =
      exportStartDate || exportEndDate
        ? `MomentStash Scrapbook (${exportStartDate || "Beginning"} to ${exportEndDate || "Today"})`
        : "My Complete MomentStash Scrapbook";

    const entriesHtml = filtered
      .map((e) => {
        const dateStr = new Date(e.date + "T00:00").toLocaleDateString(
          undefined,
          {
            weekday: "long",
            month: "long",
            day: "numeric",
            year: "numeric",
          },
        );

        const tapeColors: Record<string, string> = {
          pink: "#ffccd5",
          mint: "#d8f3dc",
          yellow: "#fefae0",
          lavender: "#e8e8ff",
        };
        const tapeColor = tapeColors[e.tape] || "#fefae0";

        const tagsHtml =
          e.tags.length > 0
            ? `<div class="tags-container">${e.tags.map((t) => `<span class="tag">#${t}</span>`).join(" ")}</div>`
            : "";

        const photoHtml =
          e.photos && e.photos.length > 0
            ? `<div class="polaroid">
               ${e.photos.map((p) => `<img src="${p}" alt="" />`).join("")}
             </div>`
            : "";

        return `
          <div class="entry-card">
            <div class="washi-tape" style="background-color: ${tapeColor};"></div>
            <div class="header">
              <span class="mood">${e.mood}</span>
              <div class="header-text">
                <h3 class="entry-title">${e.title}</h3>
                <div class="entry-meta">
                  <span class="entry-date">${dateStr}</span>
                  ${e.place ? `<span class="entry-place">· 📍 ${e.place}</span>` : ""}
                  ${e.collection ? `<span class="entry-shelf">· 📁 ${e.collection}</span>` : ""}
                </div>
              </div>
            </div>
            ${photoHtml}
            <p class="entry-note">${e.note.replace(/\n/g, "<br/>")}</p>
            ${tagsHtml}
          </div>
        `;
      })
      .join("\n");

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${titleStr}</title>
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Caveat:wght@700&family=Playfair+Display:ital,wght@0,700;1,400&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
          <style>
            @media print {
              body {
                background: white !important;
                color: #1a1a1a !important;
              }
              .page-break {
                page-break-after: always;
              }
            }
            @page {
              size: A4;
              margin: 20mm;
            }
            body {
              font-family: 'Inter', sans-serif;
              color: #1a1a1a;
              background-color: #faf7f2;
              background-image: radial-gradient(#d3c3b3 1px, transparent 1px);
              background-size: 24px 24px;
              margin: 0;
              padding: 40px;
            }
            .scrapbook-container {
              max-w: 800px;
              margin: 0 auto;
            }
            .scrapbook-title {
              font-family: 'Playfair Display', serif;
              font-size: 3.5rem;
              text-align: center;
              margin-bottom: 5px;
              color: #2b2d42;
            }
            .scrapbook-subtitle {
              font-family: 'Caveat', cursive;
              font-size: 2rem;
              text-align: center;
              margin-bottom: 40px;
              color: #e63946;
            }
            .entry-card {
              page-break-inside: avoid;
              position: relative;
              background: #fff;
              border: 2px solid #1a1a1a;
              border-radius: 20px;
              padding: 30px;
              margin-bottom: 40px;
              box-shadow: 6px 6px 0px #1a1a1a;
            }
            .washi-tape {
              position: absolute;
              top: -12px;
              left: 50%;
              transform: translateX(-50%) rotate(-2deg);
              width: 120px;
              height: 28px;
              opacity: 0.85;
              border-left: 2px dashed rgba(0,0,0,0.1);
              border-right: 2px dashed rgba(0,0,0,0.1);
              box-shadow: 0 1px 3px rgba(0,0,0,0.05);
            }
            .header {
              display: flex;
              align-items: flex-start;
              gap: 15px;
              margin-bottom: 20px;
            }
            .mood {
              font-size: 2.5rem;
              line-height: 1;
            }
            .header-text {
              flex: 1;
            }
            .entry-title {
              font-family: 'Playfair Display', serif;
              font-size: 1.8rem;
              margin: 0 0 5px 0;
              color: #1a1a1a;
            }
            .entry-meta {
              font-size: 0.85rem;
              color: #666;
              text-transform: uppercase;
              letter-spacing: 1px;
              display: flex;
              flex-wrap: wrap;
              gap: 8px;
            }
            .polaroid {
              background: white;
              padding: 12px 12px 35px 12px;
              border: 1px solid #e0e0e0;
              box-shadow: 0 4px 10px rgba(0,0,0,0.06);
              margin: 20px 0;
              display: inline-block;
              max-width: 100%;
              box-sizing: border-box;
            }
            .polaroid img {
              max-width: 100%;
              max-height: 350px;
              object-fit: cover;
              border: 1px solid #f0f0f0;
            }
            .entry-note {
              font-family: 'Inter', sans-serif;
              font-size: 1.05rem;
              line-height: 1.7;
              color: #2b2d42;
              white-space: pre-wrap;
              margin: 15px 0;
            }
            .tags-container {
              display: flex;
              flex-wrap: wrap;
              gap: 8px;
              margin-top: 15px;
            }
            .tag {
              font-family: 'Caveat', cursive;
              font-size: 1.3rem;
              background-color: #f1faee;
              border: 1px solid #1a1a1a;
              padding: 2px 10px;
              border-radius: 8px;
              color: #457b9d;
            }
          </style>
        </head>
        <body>
          <div class="scrapbook-container">
            <h1 class="scrapbook-title">MomentStash</h1>
            <p class="scrapbook-subtitle">A collection of quiet wonders</p>
            <div class="entries-list">
              ${entriesHtml}
            </div>
          </div>
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
              }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
    toast.success("Opened printable scrapbook layout! ✿");
  };

  const handleExportZip = async () => {
    const all = loadEntries();
    let filtered = [...all];

    if (exportStartDate) {
      filtered = filtered.filter((e) => e.date >= exportStartDate);
    }
    if (exportEndDate) {
      filtered = filtered.filter((e) => e.date <= exportEndDate);
    }

    if (filtered.length === 0) {
      toast.error("No folded memories found in this date range to backup! ✿");
      return;
    }

    toast.loading("Gathering your memories into a parcel...", {
      id: "zip-export",
    });

    try {
      const JSZipLib = (await import("jszip")).default;
      const zip = new JSZipLib();
      const modifiedEntries = filtered.map((e) => {
        const entryClone = { ...e };
        if (entryClone.photos && entryClone.photos.length > 0) {
          // For ZIP exports, since we proxy from /api/photo, we'd need to fetch them.
          // Because fetching all of them could be slow or complex in the browser sync,
          // we'll keep the URLs as they are (proxied) so they'll work if the user imports them back!
          // We don't try to base64 encode them here to save time and memory.
        }
        return entryClone;
      });

      zip.file("entries.json", JSON.stringify(modifiedEntries, null, 2));
      const blob = await zip.generateAsync({ type: "blob" });

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const timestamp = new Date().toISOString().slice(0, 10);
      a.href = url;
      a.download = `momentstash-backup-${timestamp}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success("Your scrapbook parcel has been successfully exported! ✿", {
        id: "zip-export",
      });
    } catch (err) {
      console.error("ZIP Export failed:", err);
      toast.error("Oops! Something went wrong while packaging the backup. ✿", {
        id: "zip-export",
      });
    }
  };

  const handleImportZip = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    toast.loading("Unpacking your scrapbook parcel...", { id: "zip-import" });

    try {
      const JSZipLib = (await import("jszip")).default;
      const zip = await JSZipLib.loadAsync(file);

      const jsonFile = zip.file("entries.json");
      if (!jsonFile) {
        throw new Error("Missing entries.json in the zip archive.");
      }

      const jsonContent = await jsonFile.async("string");
      const imported: Entry[] = JSON.parse(jsonContent);

      if (!Array.isArray(imported)) {
        throw new Error("Invalid entries format in entries.json.");
      }

      const restoredEntries = await Promise.all(
        imported.map(async (entry) => {
          const entryClone = { ...entry };
          if (
            entryClone.photoDataUrl &&
            entryClone.photoDataUrl.startsWith("images/")
          ) {
            try {
              const imgFile = zip.file(entryClone.photoDataUrl);
              if (imgFile) {
                const base64 = await imgFile.async("base64");
                const ext = entryClone.photoDataUrl.split(".").pop() || "jpg";
                const mime = ext === "png" ? "image/png" : "image/jpeg";
                entryClone.photoDataUrl = `data:${mime};base64,${base64}`;
              }
            } catch (err) {
              console.error(
                "Failed to restore photo for entry:",
                entryClone.id,
                err,
              );
            }
          }
          return entryClone;
        }),
      );

      const current = loadEntries();
      const merged = [...current];
      let addedCount = 0;
      let updatedCount = 0;

      for (const entry of restoredEntries) {
        const index = merged.findIndex((e) => e.id === entry.id);
        if (index >= 0) {
          merged[index] = entry;
          updatedCount++;
        } else {
          merged.push(entry);
          addedCount++;
        }
      }

      localStorage.setItem("momentstash_entries", JSON.stringify(merged));
      setEntries(merged);

      toast.success(
        `Scrapbook restored! Added ${addedCount} and updated ${updatedCount} memories. ✿`,
        { id: "zip-import" },
      );
    } catch (err: any) {
      console.error("ZIP Import failed:", err);
      toast.error(
        `Failed to import: ${err.message || "Invalid or corrupt backup parcel."} ✿`,
        { id: "zip-import" },
      );
    } finally {
      setIsImporting(false);
      event.target.value = "";
    }
  };

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
                    src={
                      e.photos && e.photos.length > 0
                        ? undefined
                        : spreadFallbacks[i % spreadFallbacks.length]
                    }
                    alt={e.title}
                    caption={
                      e.title.length > 28 ? e.title.slice(0, 28) + "…" : e.title
                    }
                    rotate={e.rotate || (i % 2 === 0 ? -3 : 2)}
                    tape={e.tape}
                    className="w-full max-w-[12rem] sm:max-w-[13rem] md:max-w-[14rem]"
                    onClick={() => setActiveEntry(e)}
                  >
                    {e.photos && e.photos.length > 0 && (
                      <div className="w-full h-full">
                        <Collage photos={e.photos} />
                      </div>
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
            <div className="flex-1 overflow-y-auto subtle-scroll pr-2 space-y-6 mt-2 pt-2 px-1 -mx-1">
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

              {/* Google Drive Integration */}
              <div className="rounded-xl border-2 border-ink bg-paper p-4 flex items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 shrink-0 grid place-items-center rounded-lg border border-ink bg-primary/20 text-primary">
                    <Cloud className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-display text-lg text-ink font-bold leading-snug">
                      Google Drive Backup
                    </h4>
                    <p className="font-body text-xs text-ink-soft leading-tight">
                      {linkingGdrive ? (
                        <span className="text-primary font-bold animate-pulse">
                          Connecting to Drive...
                        </span>
                      ) : user?.gdriveLinked ? (
                        <span className="text-green-600 font-semibold">
                          Linked to {user?.email || "your Google Drive"}
                        </span>
                      ) : (
                        "Keep your journal synced in the cloud"
                      )}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  disabled={linkingGdrive || user?.gdriveLinked}
                  onClick={() => {
                    if (!user?.gdriveLinked) {
                      window.location.href = "/api/auth/google";
                    }
                  }}
                  className={[
                    "font-hand text-lg border-2 border-ink px-4 py-1 rounded-full cursor-pointer transition-all active:translate-y-0.5",
                    user?.gdriveLinked
                      ? "bg-paper text-green-600 border-ink/40 cursor-default"
                      : "bg-accent hover:bg-accent/80 text-ink shadow-[2px_2px_0_var(--color-ink)]",
                  ].join(" ")}
                >
                  {linkingGdrive
                    ? "Connecting..."
                    : user?.gdriveLinked
                      ? "Connected"
                      : "Link Drive"}
                </button>
              </div>

              {/* Backups & Scrapbook Exports */}
              <div className="rounded-2xl border-2 border-ink/80 bg-paper-deep/35 p-5 space-y-4">
                <h3 className="font-display text-xl text-ink flex items-center gap-2 border-b border-dashed border-ink/30 pb-2">
                  <Archive className="h-5 w-5 text-primary" /> Backups &
                  Scrapbooks
                </h3>
                <p className="font-body text-xs text-ink-soft">
                  We highly recommend backing up your memories periodically as a
                  PDF to avoid precious data loss! The PDF only contains text
                  and loaded images.
                </p>

                {/* Optional Date Range Fields */}
                <div className="space-y-3">
                  <span className="block font-accent text-xs uppercase tracking-[0.15em] text-ink-soft">
                    Filter by dates (optional)
                  </span>
                  <div className="grid grid-cols-2 gap-3">
                    <label className="block">
                      <span className="mb-1 block font-hand text-sm text-ink-soft">
                        Start Date
                      </span>
                      <input
                        type="date"
                        value={exportStartDate}
                        onChange={(e) => setExportStartDate(e.target.value)}
                        className="w-full rounded-xl border-2 border-ink/40 bg-paper px-3 py-1.5 font-hand text-lg text-ink focus:outline-none focus:border-primary"
                      />
                    </label>
                    <label className="block">
                      <span className="mb-1 block font-hand text-sm text-ink-soft">
                        End Date
                      </span>
                      <input
                        type="date"
                        value={exportEndDate}
                        onChange={(e) => setExportEndDate(e.target.value)}
                        className="w-full rounded-xl border-2 border-ink/40 bg-paper px-3 py-1.5 font-hand text-lg text-ink focus:outline-none focus:border-primary"
                      />
                    </label>
                  </div>
                  {(exportStartDate || exportEndDate) && (
                    <button
                      type="button"
                      onClick={() => {
                        setExportStartDate("");
                        setExportEndDate("");
                      }}
                      className="font-hand text-sm text-primary hover:underline"
                    >
                      Clear date filters
                    </button>
                  )}
                </div>

                <div className="border-t border-dashed border-ink/20 pt-4 space-y-3">
                  {/* PDF Export Button */}
                  <button
                    type="button"
                    onClick={handleExportPDF}
                    className="w-full font-hand text-xl border-2 border-ink rounded-full bg-accent hover:bg-accent/80 text-ink py-2 cursor-pointer shadow-[2px_2px_0_var(--color-ink)] active:translate-y-0.5 transition-all font-bold flex items-center justify-center gap-2"
                  >
                    <FileText className="h-5 w-5" /> Export Scrapbook to PDF
                  </button>
                  <p className="text-center font-hand text-sm text-ink-soft">
                    Please backup your scrapbook to PDF periodically to avoid
                    precious data loss (images from Drive will be loaded and
                    saved if available).
                  </p>

                  <div className="grid grid-cols-2 gap-3">
                    {/* JSON+Zip Export Button */}
                    <button
                      type="button"
                      onClick={handleExportZip}
                      className="font-hand text-lg border-2 border-ink rounded-full bg-paper hover:bg-accent/30 text-ink py-2 cursor-pointer shadow-[2px_2px_0_var(--color-ink)] active:translate-y-0.5 transition-all font-bold flex items-center justify-center gap-1.5"
                    >
                      <Download className="h-4.5 w-4.5" /> Zip Backup
                    </button>

                    {/* JSON+Zip Import Trigger */}
                    <label className="font-hand text-lg border-2 border-ink rounded-full bg-paper hover:bg-accent/30 text-ink py-2 cursor-pointer shadow-[2px_2px_0_var(--color-ink)] active:translate-y-0.5 transition-all font-bold flex items-center justify-center gap-1.5 text-center">
                      <Upload className="h-4.5 w-4.5" />
                      <span>
                        {isImporting ? "Importing..." : "Restore Zip"}
                      </span>
                      <input
                        type="file"
                        accept=".zip"
                        hidden
                        disabled={isImporting}
                        onChange={handleImportZip}
                      />
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex justify-between gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => {
                    if (
                      confirm(
                        "Are you absolutely sure you want to permanently delete your account and all local memories? This cannot be undone!",
                      )
                    ) {
                      deleteAccount();
                    }
                  }}
                  className="font-hand text-lg border-2 border-red-600/50 px-5 py-1.5 rounded-full bg-red-50 text-red-600 hover:bg-red-100 cursor-pointer transition-all"
                >
                  Delete Account
                </button>
                <div className="flex gap-3">
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
          className="fixed z-[150] bg-paper border-2 border-ink p-2 rounded-xl shadow-[var(--shadow-paper)] flex flex-col min-w-[170px] animate-fade-in"
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
              navigate({
                to: "/create",
                search: { edit: contextMenu.targetId },
              });
              setContextMenu(null);
            }}
            className="text-left font-hand text-lg hover:bg-accent/40 text-ink px-3 py-1.5 rounded-lg transition-colors cursor-pointer w-full flex items-center gap-1.5"
          >
            <span>✏️</span> Edit Fold
          </button>

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
        <div className="fixed inset-0 z-[160] flex items-center justify-center p-4 animate-fade-in">
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
                className="font-hand text-lg border-2 border-ink bg-primary px-6 py-1.5 rounded-full text-paper shadow-sm hover:shadow-md cursor-pointer transition-all hover:-translate-y-0.5 active:translate-y-0"
              >
                Confirm
              </button>
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
