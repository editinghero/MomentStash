import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function fuzzyMatch(
  query: string,
  target: string | undefined | null,
): boolean {
  if (!target) return false;
  const qStr = query.toLowerCase().trim();
  if (!qStr) return false;

  // Direct includes check as a fast path
  const tStr = target.toLowerCase().trim();
  if (tStr.includes(qStr) || qStr.includes(tStr)) return true;

  // Split into word tokens
  const qWords = qStr.split(/[\s,._#\-:()]+/).filter(Boolean);
  const tWords = tStr.split(/[\s,._#\-:()]+/).filter(Boolean);

  if (qWords.length === 0 || tWords.length === 0) return false;

  // Check if any query word token matches any target word token (substring or reverse substring)
  return qWords.some((qw) =>
    tWords.some((tw) => tw.includes(qw) || qw.includes(tw)),
  );
}
