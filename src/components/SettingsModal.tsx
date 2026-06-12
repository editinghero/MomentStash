import React, { useState, useRef, useEffect } from "react";
import { WashiTape } from "@/components/WashiTape";
import {
  Settings,
  Upload,
  Moon,
  Cloud,
  Archive,
  FileText,
  Download,
} from "lucide-react";
import { toast } from "sonner";
import { loadEntries, type Entry } from "@/lib/entries";

interface User {
  name: string;
  email: string;
  avatarDataUrl?: string;
  gdriveLinked?: boolean;
}

interface SettingsModalProps {
  user: User | null;
  theme: "light" | "dark";
  toggleTheme: () => void;
  updateProfile: (data: { name: string; avatarDataUrl?: string }) => void;
  deleteAccount: () => void;
  setEntries: (entries: Entry[]) => void;
  onClose: () => void;
}

export function SettingsModal({
  user,
  theme,
  toggleTheme,
  updateProfile,
  deleteAccount,
  setEntries,
  onClose,
}: SettingsModalProps) {
  const [profileName, setProfileName] = useState(user?.name ?? "");
  const [profilePhoto, setProfilePhoto] = useState<string | undefined>(
    user?.avatarDataUrl,
  );
  const [linkingGdrive, setLinkingGdrive] = useState(false);
  const [exportStartDate, setExportStartDate] = useState("");
  const [exportEndDate, setExportEndDate] = useState("");
  const [isImporting, setIsImporting] = useState(false);

  const profilePhotoRef = useRef<HTMLInputElement>(null);

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

  const handleExportPDF = async () => {
    const all = await loadEntries();
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
    const all = await loadEntries();
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

      const current = await loadEntries();
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
    } catch (err: unknown) {
      console.error("ZIP Import failed:", err);
      toast.error(
        `Failed to import: ${err instanceof Error ? err.message : "Unknown error"} ✿`,
        { id: "zip-import" },
      );
    } finally {
      setIsImporting(false);
      event.target.value = "";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        onClick={onClose}
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
          onClick={onClose}
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
                "font-hand text-lg border-2 border-ink px-4 py-1 rounded-full cursor-pointer transition-all active:translate-y-0.5 whitespace-nowrap",
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
              <Archive className="h-5 w-5 text-primary" /> Backups & Scrapbooks
            </h3>
            <p className="font-body text-xs text-ink-soft">
              We highly recommend backing up your memories periodically as a PDF
              to avoid precious data loss! The PDF only contains text and loaded
              images.
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
                precious data loss (images from Drive will be loaded and saved
                if available).
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
                  <span>{isImporting ? "Importing..." : "Restore Zip"}</span>
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
                onClick={onClose}
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
                  onClose();
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
  );
}
