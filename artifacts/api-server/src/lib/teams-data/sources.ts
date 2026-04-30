import type { TeamSeed } from "./types";

/**
 * Global news source feeds — league-level and credible reporter aggregators.
 * These use feedUrlOverride instead of Yardbarker slugs.
 * City/Name/Abbreviation fields represent the source, not a team.
 */
export const GLOBAL_SOURCES: TeamSeed[] = [
  // ─── NFL Sources ────────────────────────────────────────────────────────────
  {
    id: "source-pft-nfl",
    sport: "nfl",
    city: "Pro Football Talk",
    name: "Pro Football Talk",
    abbreviation: "PFT",
    conference: "National",
    division: "Feed",
    primaryColor: "#003087",
    secondaryColor: "#ffffff",
    slug: "source-pft-nfl",
    yardbarkerSlug: "",
    feedUrlOverride: "https://profootballtalk.nbcsports.com/feed/",
  },
  {
    id: "source-cbs-nfl",
    sport: "nfl",
    city: "CBS Sports",
    name: "CBS Sports NFL",
    abbreviation: "CBS",
    conference: "National",
    division: "Feed",
    primaryColor: "#003087",
    secondaryColor: "#ffffff",
    slug: "source-cbs-nfl",
    yardbarkerSlug: "",
    feedUrlOverride: "https://www.cbssports.com/rss/headlines/nfl/",
  },

  // ─── MLB Sources ─────────────────────────────────────────────────────────────
  {
    id: "source-cbs-mlb",
    sport: "mlb",
    city: "CBS Sports",
    name: "CBS Sports MLB",
    abbreviation: "CBS",
    conference: "National",
    division: "Feed",
    primaryColor: "#003087",
    secondaryColor: "#ffffff",
    slug: "source-cbs-mlb",
    yardbarkerSlug: "",
    feedUrlOverride: "https://www.cbssports.com/rss/headlines/mlb/",
  },

  // ─── NBA Sources ─────────────────────────────────────────────────────────────
  {
    id: "source-cbs-nba",
    sport: "nba",
    city: "CBS Sports",
    name: "CBS Sports NBA",
    abbreviation: "CBS",
    conference: "National",
    division: "Feed",
    primaryColor: "#003087",
    secondaryColor: "#ffffff",
    slug: "source-cbs-nba",
    yardbarkerSlug: "",
    feedUrlOverride: "https://www.cbssports.com/rss/headlines/nba/",
  },

  // ─── NHL Sources ─────────────────────────────────────────────────────────────
  {
    id: "source-cbs-nhl",
    sport: "nhl",
    city: "CBS Sports",
    name: "CBS Sports NHL",
    abbreviation: "CBS",
    conference: "National",
    division: "Feed",
    primaryColor: "#003087",
    secondaryColor: "#ffffff",
    slug: "source-cbs-nhl",
    yardbarkerSlug: "",
    feedUrlOverride: "https://www.cbssports.com/rss/headlines/nhl/",
  },

  // ─── NCAAF Sources ───────────────────────────────────────────────────────────
  {
    id: "source-cbs-ncaaf",
    sport: "ncaaf",
    city: "CBS Sports",
    name: "CBS Sports College Football",
    abbreviation: "CBS",
    conference: "National",
    division: "Feed",
    primaryColor: "#003087",
    secondaryColor: "#ffffff",
    slug: "source-cbs-ncaaf",
    yardbarkerSlug: "",
    feedUrlOverride: "https://www.cbssports.com/rss/headlines/college-football/",
  },

  // ─── NCAAB Sources ───────────────────────────────────────────────────────────
  {
    id: "source-cbs-ncaab",
    sport: "ncaab",
    city: "CBS Sports",
    name: "CBS Sports College Basketball",
    abbreviation: "CBS",
    conference: "National",
    division: "Feed",
    primaryColor: "#003087",
    secondaryColor: "#ffffff",
    slug: "source-cbs-ncaab",
    yardbarkerSlug: "",
    feedUrlOverride: "https://www.cbssports.com/rss/headlines/college-basketball/",
  },
];
