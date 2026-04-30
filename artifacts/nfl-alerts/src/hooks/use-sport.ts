import { useCallback, useEffect, useState } from "react";

export type Sport = "all" | "nfl" | "mlb" | "nba" | "ncaaf" | "golf";

const SPORTS: Sport[] = ["all", "nfl", "mlb", "nba", "ncaaf", "golf"];
const STORAGE_KEY = "pressbox.sport";

function readFromUrl(): Sport | null {
  try {
    const params = new URLSearchParams(window.location.search);
    const v = (params.get("sport") ?? "").toLowerCase();
    return SPORTS.includes(v as Sport) ? (v as Sport) : null;
  } catch {
    return null;
  }
}

function readFromStorage(): Sport | null {
  try {
    const v = localStorage.getItem(STORAGE_KEY) as Sport | null;
    return v && SPORTS.includes(v) ? v : null;
  } catch {
    return null;
  }
}

function getInitial(): Sport {
  return readFromUrl() ?? readFromStorage() ?? "all";
}

const subscribers = new Set<(s: Sport) => void>();
let current: Sport | null = null;

function ensureInit() {
  if (current === null) current = getInitial();
}

function broadcast(next: Sport) {
  current = next;
  subscribers.forEach((cb) => cb(next));
}

export function useSport(): {
  sport: Sport;
  setSport: (s: Sport) => void;
  /** Pass to API hooks: undefined when "all" */
  sportParam: "nfl" | "mlb" | "nba" | "ncaaf" | "golf" | undefined;
} {
  ensureInit();
  const [sport, setSportState] = useState<Sport>(current ?? "all");

  useEffect(() => {
    const cb = (s: Sport) => setSportState(s);
    subscribers.add(cb);
    return () => {
      subscribers.delete(cb);
    };
  }, []);

  const setSport = useCallback((next: Sport) => {
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
    try {
      const url = new URL(window.location.href);
      if (next === "all") url.searchParams.delete("sport");
      else url.searchParams.set("sport", next);
      window.history.replaceState({}, "", url.toString());
    } catch {
      /* ignore */
    }
    broadcast(next);
  }, []);

  const sportParam = sport === "all" ? undefined : (sport as "nfl" | "mlb" | "nba" | "ncaaf" | "golf");
  return { sport, setSport, sportParam };
}

export const SPORT_LABELS: Record<Sport, string> = {
  all: "All Sports",
  nfl: "NFL",
  mlb: "MLB",
  nba: "NBA",
  ncaaf: "NCAAF",
  golf: "Golf",
};

export const SPORT_LIST: Sport[] = SPORTS;
