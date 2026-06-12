import { describe, it, expect } from "vitest";
import { cn } from "./utils";

describe("cn", () => {
  it("merges multiple class strings", () => {
    expect(cn("class1", "class2")).toBe("class1 class2");
  });

  it("handles conditional classes correctly", () => {
    expect(cn("class1", { class2: true, class3: false })).toBe("class1 class2");
  });

  it("handles array inputs", () => {
    expect(cn(["class1", "class2"])).toBe("class1 class2");
  });

  it("resolves tailwind css class conflicts using tailwind-merge", () => {
    // Both define a margin-top, mt-4 should override mt-2
    expect(cn("mt-2", "mt-4")).toBe("mt-4");

    // padding x overrides overall padding
    expect(cn("p-4", "px-2")).toBe("p-4 px-2");

    // text colors override each other
    expect(cn("text-red-500", "text-blue-500")).toBe("text-blue-500");
  });

  it("handles falsy values gracefully", () => {
    expect(cn("class1", null, undefined, false, 0, "", "class2")).toBe(
      "class1 class2",
    );
  });
});
