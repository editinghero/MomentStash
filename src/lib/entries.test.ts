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
