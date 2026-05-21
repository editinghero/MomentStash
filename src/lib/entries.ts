// LocalStorage-backed scrapbook entries store

export type Entry = {
  id: string;
  title: string;
  note: string;
  mood: string; // emoji
  collection: string; // free-form, e.g. "Mornings", "Travel"
  tags: string[];
  place?: string;
  photoDataUrl?: string;
  tape: "pink" | "mint" | "lavender" | "yellow";
  rotate: number; // -3..3
  date: string; // ISO yyyy-mm-dd
  createdAt: number;
};

const KEY = "momentstash_entries";

export function loadEntries(): Entry[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return seed();
    const arr = JSON.parse(raw) as Entry[];
    return arr.sort((a, b) => b.createdAt - a.createdAt);
  } catch {
    return [];
  }
}

export function saveEntries(entries: Entry[]): boolean {
  try {
    localStorage.setItem(KEY, JSON.stringify(entries));
    return true;
  } catch (e) {
    console.error("Failed to save entries to localStorage:", e);
    return false;
  }
}

export function addEntry(entry: Entry): boolean {
  const all = loadEntries();
  all.unshift(entry);
  return saveEntries(all);
}

export function removeEntry(id: string) {
  saveEntries(loadEntries().filter((e) => e.id !== id));
}

export function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

function seed(): Entry[] {
  const today = new Date();
  const iso = (d: Date) => d.toISOString().slice(0, 10);
  const minus = (n: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() - n);
    return iso(d);
  };
  const seeded: Entry[] = [
    {
      id: uid(),
      title: "Morning coffee, no plans",
      note: "First sip before anyone texted. Steam curling against the cold window.",
      mood: "☕",
      collection: "Mornings",
      tags: ["coffee", "slow"],
      place: "kitchen",
      tape: "yellow",
      rotate: -2,
      date: iso(today),
      createdAt: Date.now() - 1000,
    },
    {
      id: uid(),
      title: "Bakery on 5th",
      note: "Warm croissant. The bell on the door has a slightly different tune today.",
      mood: "🥐",
      collection: "Tiny Joys",
      tags: ["pastry", "walk"],
      place: "5th & Pine",
      tape: "pink",
      rotate: 2,
      date: iso(today),
      createdAt: Date.now() - 50_000,
    },
    {
      id: uid(),
      title: "Someone left flowers",
      note: "Tied with kitchen twine on the railing. No note. I left them there.",
      mood: "🌸",
      collection: "Tiny Joys",
      tags: ["flowers", "kindness"],
      tape: "mint",
      rotate: -1,
      date: minus(1),
      createdAt: Date.now() - 90_000_000,
    },
    {
      id: uid(),
      title: "The sky did a thing",
      note: "Rooftop. Whole street paused for ninety seconds of pink.",
      mood: "🌇",
      collection: "Sunsets",
      tags: ["sunset", "rooftop"],
      place: "rooftop",
      tape: "lavender",
      rotate: 1,
      date: minus(2),
      createdAt: Date.now() - 180_000_000,
    },
    {
      id: uid(),
      title: "Library afternoon",
      note: "Sun stripes on the desk, half a chapter of a book I'll forget the title of.",
      mood: "📖",
      collection: "Quiet",
      tags: ["reading", "library"],
      place: "Carnegie branch",
      tape: "yellow",
      rotate: -2,
      date: minus(4),
      createdAt: Date.now() - 350_000_000,
    },
    {
      id: uid(),
      title: "Laundry on the line",
      note: "Cotton shirts moving like flags. Lemon detergent + wind.",
      mood: "🧺",
      collection: "Mornings",
      tags: ["home"],
      tape: "mint",
      rotate: 2,
      date: minus(6),
      createdAt: Date.now() - 520_000_000,
    },
  ];
  saveEntries(seeded);
  return seeded;
}
