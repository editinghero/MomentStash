import { describe, it, expect, vi, beforeEach } from "vitest";
import { loadEntries } from "./entries";

describe("loadEntries", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("should correctly map a successful API response to Entry objects", async () => {
    const mockApiResponse = [
      {
        id: "1",
        title: "Test Entry 1",
        note: "Hello",
        mood: "😀",
        collection_name: "Test Collection",
        tags_json: '["tag1", "tag2"]',
        created_at: 1000,
      },
    ];

    vi.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      json: async () => mockApiResponse,
    } as Response);

    const entries = await loadEntries();

    expect(global.fetch).toHaveBeenCalledWith("/api/entries");
    expect(entries).toHaveLength(1);
    expect(entries[0]).toMatchObject({
      id: "1",
      title: "Test Entry 1",
      note: "Hello",
      mood: "😀",
      collection: "Test Collection",
      tags: ["tag1", "tag2"],
      createdAt: 1000,
    });
  });

  it("should handle legacy single photo string correctly", async () => {
    const mockApiResponse = [
      {
        id: "2",
        title: "Photo Entry",
        created_at: 2000,
        photoDataUrl: "data:image/jpeg;base64,abc...",
      },
    ];

    vi.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      json: async () => mockApiResponse,
    } as Response);

    const entries = await loadEntries();

    expect(entries[0].photos).toBeDefined();
    expect(entries[0].photos).toHaveLength(1);
    expect(entries[0].photos?.[0]).toBe("data:image/jpeg;base64,abc...");
  });

  it("should properly parse gdrive_file_id into API endpoints", async () => {
    const mockApiResponse = [
      {
        id: "3",
        title: "GDrive Entry",
        created_at: 3000,
        gdrive_file_id: "id1, id2,  id3 ", // includes spaces to test trimming
      },
    ];

    vi.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      json: async () => mockApiResponse,
    } as Response);

    const entries = await loadEntries();

    expect(entries[0].photos).toBeDefined();
    expect(entries[0].photos).toHaveLength(3);
    expect(entries[0].photos).toEqual([
      "/api/photo?id=3&index=0",
      "/api/photo?id=3&index=1",
      "/api/photo?id=3&index=2",
    ]);
  });

  it("should sort returned entries descending by createdAt", async () => {
    const mockApiResponse = [
      { id: "1", created_at: 1000 },
      { id: "2", created_at: 3000 },
      { id: "3", created_at: 2000 },
    ];

    vi.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      json: async () => mockApiResponse,
    } as Response);

    const entries = await loadEntries();

    expect(entries).toHaveLength(3);
    expect(entries[0].id).toBe("2"); // 3000
    expect(entries[1].id).toBe("3"); // 2000
    expect(entries[2].id).toBe("1"); // 1000
  });

  it("should handle non-ok response by returning an empty array", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue({
      ok: false,
    } as Response);

    // Suppress console.error for this expected failure
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const entries = await loadEntries();

    expect(entries).toEqual([]);
    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it("should handle fetch throwing an error by returning an empty array", async () => {
    vi.spyOn(global, "fetch").mockRejectedValue(new Error("Network Error"));

    // Suppress console.error for this expected failure
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const entries = await loadEntries();

    expect(entries).toEqual([]);
    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });
});
