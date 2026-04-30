import type { TeamSeed } from "./types";

export const NBA_TEAMS: TeamSeed[] = (([
  // Eastern · Atlantic
  { id: "nba-bos", city: "Boston", name: "Celtics", abbreviation: "BOS", conference: "Eastern", division: "Atlantic", primaryColor: "#007A33", secondaryColor: "#BA9653", slug: "boston-celtics", yardbarkerSlug: "63-boston-celtics" },
  { id: "nba-bkn", city: "Brooklyn", name: "Nets", abbreviation: "BKN", conference: "Eastern", division: "Atlantic", primaryColor: "#000000", secondaryColor: "#FFFFFF", slug: "brooklyn-nets", yardbarkerSlug: "64-brooklyn-nets" },
  { id: "nba-nyk", city: "New York", name: "Knicks", abbreviation: "NYK", conference: "Eastern", division: "Atlantic", primaryColor: "#006BB6", secondaryColor: "#F58426", slug: "new-york-knicks", yardbarkerSlug: "65-new-york-knicks" },
  { id: "nba-phi", city: "Philadelphia", name: "76ers", abbreviation: "PHI", conference: "Eastern", division: "Atlantic", primaryColor: "#006BB6", secondaryColor: "#ED174C", slug: "philadelphia-76ers", yardbarkerSlug: "66-philadelphia-76ers" },
  { id: "nba-tor", city: "Toronto", name: "Raptors", abbreviation: "TOR", conference: "Eastern", division: "Atlantic", primaryColor: "#CE1141", secondaryColor: "#000000", slug: "toronto-raptors", yardbarkerSlug: "67-toronto-raptors" },

  // Eastern · Central
  { id: "nba-chi", city: "Chicago", name: "Bulls", abbreviation: "CHI", conference: "Eastern", division: "Central", primaryColor: "#CE1141", secondaryColor: "#000000", slug: "chicago-bulls", yardbarkerSlug: "68-chicago-bulls" },
  { id: "nba-cle", city: "Cleveland", name: "Cavaliers", abbreviation: "CLE", conference: "Eastern", division: "Central", primaryColor: "#860038", secondaryColor: "#FDBB30", slug: "cleveland-cavaliers", yardbarkerSlug: "69-cleveland-cavaliers" },
  { id: "nba-det", city: "Detroit", name: "Pistons", abbreviation: "DET", conference: "Eastern", division: "Central", primaryColor: "#C8102E", secondaryColor: "#1D42BA", slug: "detroit-pistons", yardbarkerSlug: "70-detroit-pistons" },
  { id: "nba-ind", city: "Indiana", name: "Pacers", abbreviation: "IND", conference: "Eastern", division: "Central", primaryColor: "#002D62", secondaryColor: "#FDBB30", slug: "indiana-pacers", yardbarkerSlug: "71-indiana-pacers" },
  { id: "nba-mil", city: "Milwaukee", name: "Bucks", abbreviation: "MIL", conference: "Eastern", division: "Central", primaryColor: "#00471B", secondaryColor: "#EEE1C6", slug: "milwaukee-bucks", yardbarkerSlug: "72-milwaukee-bucks" },

  // Eastern · Southeast
  { id: "nba-atl", city: "Atlanta", name: "Hawks", abbreviation: "ATL", conference: "Eastern", division: "Southeast", primaryColor: "#E03A3E", secondaryColor: "#C1D32F", slug: "atlanta-hawks", yardbarkerSlug: "73-atlanta-hawks" },
  { id: "nba-cha", city: "Charlotte", name: "Hornets", abbreviation: "CHA", conference: "Eastern", division: "Southeast", primaryColor: "#1D1160", secondaryColor: "#00788C", slug: "charlotte-hornets", yardbarkerSlug: "74-charlotte-hornets" },
  { id: "nba-mia", city: "Miami", name: "Heat", abbreviation: "MIA", conference: "Eastern", division: "Southeast", primaryColor: "#98002E", secondaryColor: "#F9A01B", slug: "miami-heat", yardbarkerSlug: "75-miami-heat" },
  { id: "nba-orl", city: "Orlando", name: "Magic", abbreviation: "ORL", conference: "Eastern", division: "Southeast", primaryColor: "#0077C0", secondaryColor: "#C4CED4", slug: "orlando-magic", yardbarkerSlug: "122-orlando-magic" },
  { id: "nba-wsh", city: "Washington", name: "Wizards", abbreviation: "WAS", conference: "Eastern", division: "Southeast", primaryColor: "#002B5C", secondaryColor: "#E31837", slug: "washington-wizards", yardbarkerSlug: "76-washington-wizards" },

  // Western · Northwest
  { id: "nba-den", city: "Denver", name: "Nuggets", abbreviation: "DEN", conference: "Western", division: "Northwest", primaryColor: "#0E2240", secondaryColor: "#FEC524", slug: "denver-nuggets", yardbarkerSlug: "82-denver-nuggets" },
  { id: "nba-min", city: "Minnesota", name: "Timberwolves", abbreviation: "MIN", conference: "Western", division: "Northwest", primaryColor: "#0C2340", secondaryColor: "#236192", slug: "minnesota-timberwolves", yardbarkerSlug: "83-minnesota-timberwolves" },
  { id: "nba-okc", city: "Oklahoma City", name: "Thunder", abbreviation: "OKC", conference: "Western", division: "Northwest", primaryColor: "#007AC1", secondaryColor: "#EF3B24", slug: "oklahoma-city-thunder", yardbarkerSlug: "85-oklahoma-city-thunder" },
  { id: "nba-por", city: "Portland", name: "Trail Blazers", abbreviation: "POR", conference: "Western", division: "Northwest", primaryColor: "#E03A3E", secondaryColor: "#000000", slug: "portland-trail-blazers", yardbarkerSlug: "84-portland-trail-blazers" },
  { id: "nba-utah", city: "Utah", name: "Jazz", abbreviation: "UTA", conference: "Western", division: "Northwest", primaryColor: "#002B5C", secondaryColor: "#F9A01B", slug: "utah-jazz", yardbarkerSlug: "86-utah-jazz" },

  // Western · Pacific
  { id: "nba-gsw", city: "Golden State", name: "Warriors", abbreviation: "GSW", conference: "Western", division: "Pacific", primaryColor: "#1D428A", secondaryColor: "#FFC72C", slug: "golden-state-warriors", yardbarkerSlug: "87-golden-state-warriors" },
  { id: "nba-lac", city: "Los Angeles", name: "Clippers", abbreviation: "LAC", conference: "Western", division: "Pacific", primaryColor: "#C8102E", secondaryColor: "#1D428A", slug: "los-angeles-clippers", yardbarkerSlug: "88-los-angeles-clippers" },
  { id: "nba-lal", city: "Los Angeles", name: "Lakers", abbreviation: "LAL", conference: "Western", division: "Pacific", primaryColor: "#552583", secondaryColor: "#FDB927", slug: "los-angeles-lakers", yardbarkerSlug: "89-los-angeles-lakers" },
  { id: "nba-phx", city: "Phoenix", name: "Suns", abbreviation: "PHX", conference: "Western", division: "Pacific", primaryColor: "#1D1160", secondaryColor: "#E56020", slug: "phoenix-suns", yardbarkerSlug: "90-phoenix-suns" },
  { id: "nba-sac", city: "Sacramento", name: "Kings", abbreviation: "SAC", conference: "Western", division: "Pacific", primaryColor: "#5A2D81", secondaryColor: "#63727A", slug: "sacramento-kings", yardbarkerSlug: "91-sacramento-kings" },

  // Western · Southwest
  { id: "nba-dal", city: "Dallas", name: "Mavericks", abbreviation: "DAL", conference: "Western", division: "Southwest", primaryColor: "#00538C", secondaryColor: "#002B5E", slug: "dallas-mavericks", yardbarkerSlug: "77-dallas-mavericks" },
  { id: "nba-hou", city: "Houston", name: "Rockets", abbreviation: "HOU", conference: "Western", division: "Southwest", primaryColor: "#CE1141", secondaryColor: "#000000", slug: "houston-rockets", yardbarkerSlug: "78-houston-rockets" },
  { id: "nba-mem", city: "Memphis", name: "Grizzlies", abbreviation: "MEM", conference: "Western", division: "Southwest", primaryColor: "#5D76A9", secondaryColor: "#12173F", slug: "memphis-grizzlies", yardbarkerSlug: "79-memphis-grizzlies" },
  { id: "nba-no", city: "New Orleans", name: "Pelicans", abbreviation: "NOP", conference: "Western", division: "Southwest", primaryColor: "#0C2340", secondaryColor: "#C8102E", slug: "new-orleans-pelicans", yardbarkerSlug: "80-new-orleans-pelicans" },
  { id: "nba-sas", city: "San Antonio", name: "Spurs", abbreviation: "SAS", conference: "Western", division: "Southwest", primaryColor: "#C4CED4", secondaryColor: "#000000", slug: "san-antonio-spurs", yardbarkerSlug: "81-san-antonio-spurs" },
] as const).map((t) => ({ ...t, sport: "nba" as const })));
