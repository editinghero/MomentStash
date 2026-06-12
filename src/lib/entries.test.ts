import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { loadEntries } from "./entries";

describe("loadEntries", () => {
  const originalFetch = globalThis.fetch;
  const originalConsoleError = console.error;

  beforeEach(() => {
    // Mock console.error to avoid cluttering test output and to assert it was called
    console.error = vi.fn();
  });

  afterEach(() => {
    // Restore global fetch and console.error after each test
    globalThis.fetch = originalFetch;
    console.error = originalConsoleError;
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

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockApiResponse,
    } as Response);

    const entries = await loadEntries();

    expect(globalThis.fetch).toHaveBeenCalledWith("/api/entries");
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

    globalThis.fetch = vi.fn().mockResolvedValue({
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

    globalThis.fetch = vi.fn().mockResolvedValue({
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

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockApiResponse,
    } as Response);

    const entries = await loadEntries();

    expect(entries).toHaveLength(3);
    expect(entries[0].id).toBe("2"); // 3000
    expect(entries[1].id).toBe("3"); // 2000
    expect(entries[2].id).toBe("1"); // 1000
  });

  it("should return an empty array and log error when fetch rejects", async () => {
    const fetchError = new Error("Network error");
    globalThis.fetch = vi.fn().mockRejectedValue(fetchError);

    const result = await loadEntries();

    expect(result).toEqual([]);
    expect(console.error).toHaveBeenCalledWith(
      "loadEntries error:",
      fetchError,
    );
  });

  it("should return an empty array and log error when fetch response is not ok", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
    });

    const result = await loadEntries();

    expect(result).toEqual([]);
    expect(console.error).toHaveBeenCalledWith(
      "loadEntries error:",
      expect.any(Error),
    );
    expect(console.error).toHaveBeenCalledWith(
      "loadEntries error:",
      expect.objectContaining({ message: "Failed to load entries" }),
    );
  });
});
