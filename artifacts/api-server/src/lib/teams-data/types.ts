export type Sport = "nfl" | "mlb" | "nba";

export const SPORTS: readonly Sport[] = ["nfl", "mlb", "nba"] as const;

export const SPORT_LABELS: Record<Sport, string> = {
  nfl: "NFL",
  mlb: "MLB",
  nba: "NBA",
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
}
