export type Sport = "nfl" | "mlb" | "nba" | "ncaaf" | "golf";

export const SPORTS: readonly Sport[] = ["nfl", "mlb", "nba", "ncaaf", "golf"] as const;

export const SPORT_LABELS: Record<Sport, string> = {
  nfl: "NFL",
  mlb: "MLB",
  nba: "NBA",
  ncaaf: "NCAAF",
  golf: "Golf",
};

export interface TeamSeed {
  id: string;
  sport: Sport;
  city: string;
  name: string;
  abbreviation: string;
  conference: string;
  division: string;
  primaryColor: string;
  secondaryColor: string;
  slug: string;
  /** Yardbarker RSS path segment, e.g. "34-cleveland-browns" */
  yardbarkerSlug: string;
  /** Override the full RSS feed URL (used for player feeds like golf) */
  feedUrlOverride?: string;
}
