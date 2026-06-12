import { describe, it, expect } from "vitest";
import { uid } from "../entries";

describe("uid", () => {
  it("should generate a string", () => {
    const id = uid();
    expect(typeof id).toBe("string");
  });

  it("should generate a string of expected length", () => {
    const id = uid();
    // Math.random().toString(36).slice(2, 10) gives 8 chars
    // Date.now().toString(36) gives ~8 chars
    // Total should be around 16 chars
    expect(id.length).toBeGreaterThan(14);
    expect(id.length).toBeLessThan(20);
  });

  it("should generate unique strings", () => {
    const id1 = uid();
    const id2 = uid();
    expect(id1).not.toBe(id2);
  });

  it("should consist of alphanumeric characters", () => {
    const id = uid();
    expect(id).toMatch(/^[a-z0-9]+$/);
  });
});
