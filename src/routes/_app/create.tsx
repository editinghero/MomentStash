import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState, useMemo } from "react";
import { addEntry, uid, type Entry, loadEntries } from "@/lib/entries";
import { WashiTape } from "@/components/WashiTape";
import {
  StarDoodle,
  SparkleDoodle,
  UnderlineSquiggle,
} from "@/components/Doodles";
import { StickerButton } from "@/components/StickerButton";
import { Camera, X } from "lucide-react";

export const Route = createFileRoute("/_app/create")({
  head: () => ({
    meta: [
      { title: "New Fold — MomentStash" },
      {
        name: "description",
        content: "Tuck a tiny moment into your scrapbook.",
      },
    ],
  }),
  component: CreatePage,
});

const MOOD_CATEGORIES = [
  {
    name: "Cozy & Quiet",
    items: [
      { emoji: "☕", label: "warm brew / cozy start" },
      { emoji: "📖", label: "lost in a book / slow learning" },
      { emoji: "💌", label: "tender words / keeping in touch" },
      { emoji: "🎶", label: "rhythm & melodies" },
    ]
  },
  {
    name: "Nature & Magic",
    items: [
      { emoji: "🌿", label: "fresh greenery / peaceful path" },
      { emoji: "🌸", label: "blossoming joy / lovely details" },
      { emoji: "🌇", label: "golden hour / sunset thoughts" },
      { emoji: "✨", label: "tiny magic / beautiful wonder" },
    ]
  },
  {
    name: "Flavors & Weather",
    items: [
      { emoji: "🥐", label: "delicious pastry / morning treats" },
      { emoji: "🧺", label: "outdoor picnic / simple escape" },
      { emoji: "🍋", label: "tangy & bright / refreshing ideas" },
      { emoji: "🌧️", label: "gentle rain / introspective mood" },
    ]
  }
];
const TAPES = ["pink", "mint", "lavender", "yellow"] as const;
const SUGGESTED = [
  "Mornings",
  "Tiny Joys",
  "Sunsets",
  "Quiet",
  "Travel",
  "Friends",
];

function CreatePage() {
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [mood, setMood] = useState("☕");
  const [collection, setCollection] = useState("");
  const [existingShelves, setExistingShelves] = useState<string[]>([]);
  const [tagsRaw, setTagsRaw] = useState("");
  const [allUsedTags, setAllUsedTags] = useState<string[]>([]);
  const [place, setPlace] = useState("");
  const [tape, setTape] = useState<(typeof TAPES)[number]>("yellow");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [photo, setPhoto] = useState<string | undefined>();
  const [saving, setSaving] = useState(false);
  const [shelfMode, setShelfMode] = useState<"unsorted" | "existing" | "new">(
    "unsorted",
  );
  const [alertConfig, setAlertConfig] = useState<{
    title: string;
    message: string;
  } | null>(null);

  const previewRotate = -2;

  useEffect(() => {
    const entries = loadEntries();
    const custom = JSON.parse(
      localStorage.getItem("momentstash_custom_shelves") || "[]",
    ) as string[];
    const merged = Array.from(
      new Set([...custom, ...entries.map((e) => e.collection).filter(Boolean)]),
    );
    setExistingShelves(merged.length > 0 ? merged : SUGGESTED);

    // Load unique tags from entries
    const tagsSet = new Set<string>();
    entries.forEach(e => {
      if (e.tags) {
        e.tags.forEach(t => tagsSet.add(t.trim().toLowerCase()));
      }
    });
    setAllUsedTags(Array.from(tagsSet));
  }, []);

  const activeQuery = useMemo(() => {
    const parts = tagsRaw.split(/[,\s#]+/);
    return parts[parts.length - 1]?.trim().toLowerCase() || "";
  }, [tagsRaw]);

  const suggestions = useMemo(() => {
    const currentTags = tagsRaw.split(/[,\s#]+/).map(t => t.trim().toLowerCase()).filter(Boolean);
    if (!activeQuery) {
      return allUsedTags
        .filter(t => !currentTags.includes(t))
        .slice(0, 5);
    }
    return allUsedTags
      .filter(t => t.includes(activeQuery) && !currentTags.includes(t))
      .slice(0, 5);
  }, [allUsedTags, tagsRaw, activeQuery]);

  const handleAddTag = (tag: string) => {
    const cleanParts = tagsRaw.split(/[,\s#]+/).map(t => t.trim()).filter(Boolean);
    if (activeQuery) {
      cleanParts[cleanParts.length - 1] = tag;
    } else {
      cleanParts.push(tag);
    }
    setTagsRaw(cleanParts.join(", ") + ", ");
  };

  const onPickPhoto = (file: File | undefined) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let w = img.width;
        let h = img.height;
        const max = 600; // Optimize dimension limit for smaller base64 size
        if (w > max || h > max) {
          if (w > h) {
            h = Math.round((h * max) / w);
            w = max;
          } else {
            w = Math.round((w * max) / h);
            h = max;
          }
        }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, w, h);
          const compressed = canvas.toDataURL("image/jpeg", 0.55); // High compression for scrapbook aesthetics
          setPhoto(compressed);
        } else {
          setPhoto(reader.result as string);
        }
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  };

  const onSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    const entryCollection = collection.trim();
    const entry: Entry = {
      id: uid(),
      title: title.trim(),
      note: note.trim(),
      mood,
      collection: entryCollection,
      tags: tagsRaw
        .split(/[,\s#]+/)
        .map((t) => t.trim())
        .filter(Boolean),
      place: place.trim() || undefined,
      photoDataUrl: photo,
      tape,
      rotate: previewRotate,
      date,
      createdAt: Date.now(),
    };

    const success = addEntry(entry);
    if (!success) {
      setAlertConfig({
        title: "MomentStash is Full! ⚠️",
        message:
          "Oh no! Your MomentStash is full (browser storage limit exceeded). To save this memory, please delete some older notes/photos first, or use a smaller/different photo!",
      });
      setSaving(false);
      return;
    }

    // Persist dynamic shelf permanently if it is a new shelf
    if (entryCollection) {
      const custom = JSON.parse(
        localStorage.getItem("momentstash_custom_shelves") || "[]",
      ) as string[];
      if (
        !custom.some((s) => s.toLowerCase() === entryCollection.toLowerCase())
      ) {
        const updated = [...custom, entryCollection];
        localStorage.setItem(
          "momentstash_custom_shelves",
          JSON.stringify(updated),
        );
      }
    }

    setTimeout(() => navigate({ to: "/timeline" }), 200);
  };

  return (
    <main className="relative min-h-screen overflow-hidden pt-4 pb-44">
      <SparkleDoodle className="absolute top-20 left-8 h-6 w-6 text-secondary opacity-60" />
      <StarDoodle
        className="absolute top-44 right-10 h-7 w-7 text-accent animate-float"
        color="oklch(0.85 0.13 90)"
      />

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
        <Link
          to="/home"
          className="shrink-0 whitespace-nowrap font-hand text-lg text-ink-soft hover:text-ink"
        >
          ← today
        </Link>
      </header>

      <section className="mx-auto max-w-6xl px-6 md:px-10">
        <p className="font-accent text-xs uppercase tracking-[0.2em] text-ink-soft">
          a new fold
        </p>
        <div className="relative inline-block">
          <h1 className="font-display text-5xl md:text-6xl text-ink mt-1">
            Tuck it in
          </h1>
          <UnderlineSquiggle className="absolute -bottom-2 left-0 h-2 w-full text-primary" />
        </div>
        <p className="font-hand text-2xl text-ink-soft mt-3">
          small moments, kept on purpose
        </p>
      </section>

      <section className="mx-auto max-w-6xl px-6 md:px-10 mt-10 grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-10">
        {/* Form */}
        <form
          onSubmit={onSave}
          className="paper-card rounded-2xl border-2 border-ink/80 p-6 md:p-8 space-y-6"
        >
          <WashiTape
            color={tape}
            rotate={-5}
            width="6rem"
            className="absolute -top-3 left-10"
          />

          <Field label="title">
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="the bakery on 5th, again"
              className="input-line"
            />
          </Field>

          <Field label="note">
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={4}
              placeholder="what made this moment worth folding away?"
              className="input-line resize-none"
            />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="date">
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="input-line"
              />
            </Field>
            <Field label="place (optional)">
              <input
                value={place}
                onChange={(e) => setPlace(e.target.value)}
                placeholder="rooftop, train, kitchen…"
                className="input-line"
              />
            </Field>
          </div>

          <Field label="mood">
            <div className="space-y-4">
              {MOOD_CATEGORIES.map((cat) => (
                <div key={cat.name} className="space-y-1.5">
                  <span className="block font-hand text-lg text-ink-soft italic">{cat.name}</span>
                  <div className="flex flex-wrap gap-2">
                    {cat.items.map((item) => (
                      <div key={item.emoji} className="relative group">
                        <button
                          type="button"
                          onClick={() => setMood(item.emoji)}
                          className={[
                            "h-11 w-11 grid place-items-center rounded-full border-2 text-2xl transition-all cursor-pointer",
                            mood === item.emoji
                              ? "border-ink bg-accent shadow-[2px_2px_0_var(--color-ink)]"
                              : "border-ink/40 bg-paper hover:border-ink",
                          ].join(" ")}
                        >
                          {item.emoji}
                        </button>
                        {/* Custom Speech-bubble Tooltip */}
                        <div className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-ink px-2.5 py-1 text-xs font-accent text-paper opacity-0 shadow-md transition-opacity duration-150 group-hover:opacity-100 uppercase tracking-wider">
                          {item.label}
                          <div className="absolute top-full left-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-0.5 rotate-45 bg-ink" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Field>

          <Field label="shelf (optional)">
            {/* Segmented Selection Tab */}
            <div className="flex border-2 border-ink rounded-xl overflow-hidden mb-4 max-w-md bg-paper shadow-sm">
              <button
                type="button"
                onClick={() => {
                  setShelfMode("unsorted");
                  setCollection("");
                }}
                className={[
                  "flex-1 py-2 text-center font-accent text-xs uppercase tracking-wider transition-colors cursor-pointer",
                  shelfMode === "unsorted"
                    ? "bg-ink text-paper font-bold"
                    : "bg-paper text-ink hover:bg-accent/30",
                ].join(" ")}
              >
                Unsorted
              </button>
              {existingShelves.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setShelfMode("existing");
                    if (!collection || !existingShelves.includes(collection)) {
                      setCollection(existingShelves[0]);
                    }
                  }}
                  className={[
                    "flex-1 py-2 text-center font-accent text-xs uppercase tracking-wider border-l-2 border-r-2 border-ink transition-colors cursor-pointer",
                    shelfMode === "existing"
                      ? "bg-ink text-paper font-bold"
                      : "bg-paper text-ink hover:bg-accent/30",
                  ].join(" ")}
                >
                  Select Shelf
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  setShelfMode("new");
                  setCollection(""); // Clear so placeholder shows up and typing is instant
                }}
                className={[
                  "flex-1 py-2 text-center font-accent text-xs uppercase tracking-wider transition-colors cursor-pointer",
                  shelfMode === "new"
                    ? "bg-ink text-paper font-bold"
                    : "bg-paper text-ink hover:bg-accent/30",
                ].join(" ")}
              >
                Create Shelf
              </button>
            </div>

            {/* Inner Content Based on Mode */}
            {shelfMode === "unsorted" && (
              <p className="font-hand text-lg text-ink-soft italic">
                ✿ This memory will sit directly in your timeline without a
                shelf.
              </p>
            )}

            {shelfMode === "existing" && existingShelves.length > 0 && (
              <div className="flex flex-wrap gap-2 p-3 bg-paper-deep/30 rounded-xl border border-ink/20 animate-fade-in">
                {existingShelves.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setCollection(s)}
                    className={[
                      "font-hand text-lg px-3 py-1 rounded-full border-2 transition-all cursor-pointer",
                      collection === s
                        ? "border-ink bg-primary text-primary-foreground shadow-[1px_1px_0_var(--color-ink)]"
                        : "border-ink/40 bg-paper text-ink hover:border-ink",
                    ].join(" ")}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            {shelfMode === "new" && (
              <div className="space-y-2 animate-fade-in">
                <input
                  required={shelfMode === "new"}
                  value={collection}
                  onChange={(e) => setCollection(e.target.value)}
                  placeholder="name your custom shelf..."
                  className="input-line"
                />
                <p className="font-hand text-base text-ink-soft">
                  ✿ A fresh shelf will be carved for this memory.
                </p>
              </div>
            )}
          </Field>

          <Field label="tags">
            <div className="space-y-2">
              <input
                value={tagsRaw}
                onChange={(e) => setTagsRaw(e.target.value)}
                placeholder="coffee, slow, #morning"
                className="input-line"
              />
              {suggestions.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span className="font-accent text-[10px] uppercase tracking-wider text-ink-soft self-center mr-1">Suggest:</span>
                  {suggestions.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleAddTag(tag)}
                      className="font-hand text-base px-2.5 py-0.5 rounded-full border border-ink/30 bg-paper hover:bg-accent/40 hover:border-ink transition-colors cursor-pointer text-ink-soft hover:text-ink"
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </Field>

          <Field label="tape color">
            <div className="flex gap-2">
              {TAPES.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTape(t)}
                  aria-label={t}
                  className={[
                    "h-10 w-16 rounded-md border-2 transition-all",
                    `bg-tape-${t}`,
                    tape === t
                      ? "border-ink shadow-[2px_2px_0_var(--color-ink)]"
                      : "border-ink/30",
                  ].join(" ")}
                />
              ))}
            </div>
          </Field>

          <Field label="photo (optional)">
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => onPickPhoto(e.target.files?.[0])}
            />
            {photo ? (
              <div className="relative inline-block">
                <img
                  src={photo}
                  alt=""
                  className="h-40 w-40 object-cover rounded-xl border-2 border-ink"
                />
                <button
                  type="button"
                  onClick={() => setPhoto(undefined)}
                  className="absolute -top-2 -right-2 h-7 w-7 grid place-items-center rounded-full bg-paper border-2 border-ink"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="flex items-center gap-2 px-4 py-3 border-2 border-dashed border-ink/50 rounded-xl text-ink-soft font-hand text-xl hover:bg-accent/40 hover:border-ink transition-colors"
              >
                <Camera className="h-4 w-4" /> add a photo
              </button>
            )}
          </Field>

          <div className="flex items-center gap-3 pt-2">
            <StickerButton type="submit" disabled={saving}>
              {saving ? "folding…" : "fold it in ✿"}
            </StickerButton>
            <Link
              to="/home"
              className="font-hand text-xl text-ink-soft hover:text-ink underline-offset-4 hover:underline"
            >
              cancel
            </Link>
          </div>
        </form>

        {/* Live preview */}
        <aside className="lg:sticky lg:top-6 self-start">
          <p className="font-accent text-xs uppercase tracking-[0.2em] text-ink-soft mb-3">
            how it will sit on the page
          </p>
          <article
            className="relative paper-card rounded-2xl border-2 border-ink/80 p-5"
            style={{ transform: `rotate(${previewRotate}deg)` }}
          >
            <WashiTape
              color={tape}
              rotate={-6}
              width="5rem"
              className="absolute -top-3 left-6"
            />
            <div className="flex items-start gap-2">
              <span className="text-3xl">{mood}</span>
              <div className="flex-1 min-w-0">
                <h3 className="font-display text-2xl text-ink leading-tight">
                  {title || "your title here"}
                </h3>
                <p className="font-accent text-xs uppercase tracking-widest text-ink-soft mt-1 truncate">
                  {collection || "Unsorted"}
                  {place && ` · ${place}`}
                </p>
              </div>
            </div>
            {photo && (
              <img
                src={photo}
                alt=""
                className="mt-4 w-full h-36 object-cover rounded-xl border-2 border-ink/60"
              />
            )}
            <p className="font-body text-ink-soft mt-3 leading-relaxed">
              {note || "a few words about the moment…"}
            </p>
          </article>
        </aside>
      </section>

      <style>{`
        .input-line {
          width: 100%;
          background: transparent;
          border: 0;
          border-bottom: 2px dashed color-mix(in oklab, var(--color-ink) 45%, transparent);
          padding: 0.5rem 0.25rem;
          font-family: var(--font-hand);
          font-size: 1.5rem;
          color: var(--color-ink);
          outline: none;
          transition: border-color 0.15s;
        }
        .input-line::placeholder { color: color-mix(in oklab, var(--color-ink-soft) 70%, transparent); }
        .input-line:focus { border-bottom-color: var(--color-primary); border-bottom-style: solid; }
        textarea.input-line { font-family: var(--font-body); font-size: 1rem; line-height: 1.55; }
        input[type="date"].input-line { font-family: var(--font-body); font-size: 1rem; }
      `}</style>

      {alertConfig && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in bg-black/40 backdrop-blur-xs">
          <div
            onClick={() => setAlertConfig(null)}
            className="absolute inset-0 transition-opacity"
          />
          <div className="relative w-full max-w-md paper-card rounded-[24px] border-2 border-ink p-6 md:p-8 shadow-[var(--shadow-lift)] bg-paper animate-wobble-in flex flex-col z-50">
            <WashiTape
              color="pink"
              rotate={-2}
              width="5rem"
              className="absolute -top-3.5 left-12 pointer-events-none"
            />
            <h4 className="font-display text-2xl text-ink font-bold mb-3">
              {alertConfig.title}
            </h4>
            <p className="font-hand text-xl text-ink-soft mb-6 leading-relaxed">
              {alertConfig.message}
            </p>
            <div className="flex items-center justify-end">
              <button
                type="button"
                onClick={() => setAlertConfig(null)}
                className="font-hand text-lg border-2 border-ink px-6 py-1.5 rounded-full bg-accent text-ink hover:bg-accent/80 cursor-pointer shadow-[2px_2px_0_var(--color-ink)] active:translate-y-0.5 transition-all font-bold"
              >
                Okay ✿
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block font-accent text-xs uppercase tracking-[0.2em] text-ink-soft mb-2">
        {label}
      </span>
      {children}
    </label>
  );
}
