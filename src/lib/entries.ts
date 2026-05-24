// API-backed scrapbook entries store

export type Entry = {
  id: string;
  title: string;
  note: string;
  mood: string; // emoji
  collection: string; // free-form, e.g. "Mornings", "Travel"
  tags: string[];
  place?: string;
  photos?: string[]; // Array of image URLs
  tape: "pink" | "mint" | "lavender" | "yellow";
  rotate: number; // -3..3
  date: string; // ISO yyyy-mm-dd
  createdAt: number;
};

export async function loadEntries(): Promise<Entry[]> {
  try {
    const res = await fetch("/api/entries");
    if (!res.ok) throw new Error("Failed to load entries");
    const arr = await res.json();
    return arr
      .map((row: any) => {
        const photos: string[] = [];

        // Handle legacy single photo string or multiple Drive IDs
        if (row.photoDataUrl && String(row.photoDataUrl).startsWith("data:")) {
          photos.push(row.photoDataUrl);
        } else if (row.gdrive_file_id) {
          const ids = String(row.gdrive_file_id).split(",");
          for (let i = 0; i < ids.length; i++) {
            const idStr = ids[i].trim();
            if (idStr) {
              photos.push(`/api/photo?id=${row.id}&index=${i}`);
            }
          }
        }

        return {
          ...row,
          tags:
            typeof row.tags_json === "string" ? JSON.parse(row.tags_json) : [],
          collection: row.collection_name,
          createdAt: row.created_at,
          photos: photos.length > 0 ? photos : undefined,
        };
      })
      .sort((a: Entry, b: Entry) => b.createdAt - a.createdAt);
  } catch (err) {
    console.error("loadEntries error:", err);
    return [];
  }
}

export async function addEntry(entry: Entry): Promise<boolean> {
  try {
    const res = await fetch("/api/entries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(entry),
    });
    return res.ok;
  } catch (err) {
    console.error("Failed to save entry to API:", err);
    return false;
  }
}

export async function updateEntry(entry: Entry): Promise<boolean> {
  try {
    const res = await fetch("/api/entries", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(entry),
    });
    return res.ok;
  } catch (err) {
    console.error("Failed to update entry in API:", err);
    return false;
  }
}

export async function removeEntry(id: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/entries?id=${id}`, { method: "DELETE" });
    return res.ok;
  } catch (err) {
    console.error("Failed to delete entry:", err);
    return false;
  }
}

export async function moveEntry(
  id: string,
  collection: string,
): Promise<boolean> {
  try {
    const res = await fetch(`/api/entries`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, collection }),
    });
    return res.ok;
  } catch (err) {
    console.error("Failed to move entry:", err);
    return false;
  }
}

export function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}
