import type { TeamSeed } from "./types";

export const MLB_TEAMS: TeamSeed[] = (([
  // AL East
  { id: "mlb-bal", city: "Baltimore", name: "Orioles", abbreviation: "BAL", conference: "AL", division: "East", primaryColor: "#DF4601", secondaryColor: "#000000", slug: "baltimore-orioles", yardbarkerSlug: "3-baltimore-orioles" },
  { id: "mlb-bos", city: "Boston", name: "Red Sox", abbreviation: "BOS", conference: "AL", division: "East", primaryColor: "#BD3039", secondaryColor: "#0C2340", slug: "boston-red-sox", yardbarkerSlug: "4-boston-red-sox" },
  { id: "mlb-nyy", city: "New York", name: "Yankees", abbreviation: "NYY", conference: "AL", division: "East", primaryColor: "#003087", secondaryColor: "#E4002C", slug: "new-york-yankees", yardbarkerSlug: "18-new-york-yankees" },
  { id: "mlb-tb", city: "Tampa Bay", name: "Rays", abbreviation: "TB", conference: "AL", division: "East", primaryColor: "#092C5C", secondaryColor: "#8FBCE6", slug: "tampa-bay-rays", yardbarkerSlug: "27-tampa-bay-rays" },
  { id: "mlb-tor", city: "Toronto", name: "Blue Jays", abbreviation: "TOR", conference: "AL", division: "East", primaryColor: "#134A8E", secondaryColor: "#1D2D5C", slug: "toronto-blue-jays", yardbarkerSlug: "29-toronto-blue-jays" },

  // AL Central
  { id: "mlb-cws", city: "Chicago", name: "White Sox", abbreviation: "CWS", conference: "AL", division: "Central", primaryColor: "#27251F", secondaryColor: "#C4CED4", slug: "chicago-white-sox", yardbarkerSlug: "5-chicago-white-sox" },
  { id: "mlb-cle", city: "Cleveland", name: "Guardians", abbreviation: "CLE", conference: "AL", division: "Central", primaryColor: "#00385D", secondaryColor: "#E50022", slug: "cleveland-guardians", yardbarkerSlug: "8-cleveland-guardians" },
  { id: "mlb-det", city: "Detroit", name: "Tigers", abbreviation: "DET", conference: "AL", division: "Central", primaryColor: "#0C2340", secondaryColor: "#FA4616", slug: "detroit-tigers", yardbarkerSlug: "10-detroit-tigers" },
  { id: "mlb-kc", city: "Kansas City", name: "Royals", abbreviation: "KC", conference: "AL", division: "Central", primaryColor: "#004687", secondaryColor: "#BD9B60", slug: "kansas-city-royals", yardbarkerSlug: "13-kansas-city-royals" },
  { id: "mlb-min", city: "Minnesota", name: "Twins", abbreviation: "MIN", conference: "AL", division: "Central", primaryColor: "#002B5C", secondaryColor: "#D31145", slug: "minnesota-twins", yardbarkerSlug: "17-minnesota-twins" },

  // AL West
  { id: "mlb-ath", city: "Athletics", name: "Athletics", abbreviation: "ATH", conference: "AL", division: "West", primaryColor: "#003831", secondaryColor: "#EFB21E", slug: "athletics", yardbarkerSlug: "20-athletics" },
  { id: "mlb-hou", city: "Houston", name: "Astros", abbreviation: "HOU", conference: "AL", division: "West", primaryColor: "#002D62", secondaryColor: "#EB6E1F", slug: "houston-astros", yardbarkerSlug: "12-houston-astros" },
  { id: "mlb-laa", city: "Los Angeles", name: "Angels", abbreviation: "LAA", conference: "AL", division: "West", primaryColor: "#BA0021", secondaryColor: "#003263", slug: "los-angeles-angels", yardbarkerSlug: "14-los-angeles-angels" },
  { id: "mlb-sea", city: "Seattle", name: "Mariners", abbreviation: "SEA", conference: "AL", division: "West", primaryColor: "#0C2C56", secondaryColor: "#005C5C", slug: "seattle-mariners", yardbarkerSlug: "25-seattle-mariners" },
  { id: "mlb-tex", city: "Texas", name: "Rangers", abbreviation: "TEX", conference: "AL", division: "West", primaryColor: "#003278", secondaryColor: "#C0111F", slug: "texas-rangers", yardbarkerSlug: "28-texas-rangers" },

  // NL East
  { id: "mlb-atl", city: "Atlanta", name: "Braves", abbreviation: "ATL", conference: "NL", division: "East", primaryColor: "#13274F", secondaryColor: "#CE1141", slug: "atlanta-braves", yardbarkerSlug: "2-atlanta-braves" },
  { id: "mlb-mia", city: "Miami", name: "Marlins", abbreviation: "MIA", conference: "NL", division: "East", primaryColor: "#00A3E0", secondaryColor: "#EF3340", slug: "miami-marlins", yardbarkerSlug: "11-miami-marlins" },
  { id: "mlb-nym", city: "New York", name: "Mets", abbreviation: "NYM", conference: "NL", division: "East", primaryColor: "#002D72", secondaryColor: "#FF5910", slug: "new-york-mets", yardbarkerSlug: "19-new-york-mets" },
  { id: "mlb-phi", city: "Philadelphia", name: "Phillies", abbreviation: "PHI", conference: "NL", division: "East", primaryColor: "#E81828", secondaryColor: "#002D72", slug: "philadelphia-phillies", yardbarkerSlug: "21-philadelphia-phillies" },
  { id: "mlb-wsh", city: "Washington", name: "Nationals", abbreviation: "WSH", conference: "NL", division: "East", primaryColor: "#AB0003", secondaryColor: "#14225A", slug: "washington-nationals", yardbarkerSlug: "30-washington-nationals" },

  // NL Central
  { id: "mlb-chc", city: "Chicago", name: "Cubs", abbreviation: "CHC", conference: "NL", division: "Central", primaryColor: "#0E3386", secondaryColor: "#CC3433", slug: "chicago-cubs", yardbarkerSlug: "6-chicago-cubs" },
  { id: "mlb-cin", city: "Cincinnati", name: "Reds", abbreviation: "CIN", conference: "NL", division: "Central", primaryColor: "#C6011F", secondaryColor: "#000000", slug: "cincinnati-reds", yardbarkerSlug: "7-cincinnati-reds" },
  { id: "mlb-mil", city: "Milwaukee", name: "Brewers", abbreviation: "MIL", conference: "NL", division: "Central", primaryColor: "#12284B", secondaryColor: "#FFC52F", slug: "milwaukee-brewers", yardbarkerSlug: "16-milwaukee-brewers" },
  { id: "mlb-pit", city: "Pittsburgh", name: "Pirates", abbreviation: "PIT", conference: "NL", division: "Central", primaryColor: "#27251F", secondaryColor: "#FDB827", slug: "pittsburgh-pirates", yardbarkerSlug: "22-pittsburgh-pirates" },
  { id: "mlb-stl", city: "St. Louis", name: "Cardinals", abbreviation: "STL", conference: "NL", division: "Central", primaryColor: "#C41E3A", secondaryColor: "#0C2340", slug: "st-louis-cardinals", yardbarkerSlug: "26-st-louis-cardinals" },

  // NL West
  { id: "mlb-ari", city: "Arizona", name: "Diamondbacks", abbreviation: "ARI", conference: "NL", division: "West", primaryColor: "#A71930", secondaryColor: "#E3D4AD", slug: "arizona-diamondbacks", yardbarkerSlug: "1-arizona-diamondbacks" },
  { id: "mlb-col", city: "Colorado", name: "Rockies", abbreviation: "COL", conference: "NL", division: "West", primaryColor: "#33006F", secondaryColor: "#C4CED4", slug: "colorado-rockies", yardbarkerSlug: "9-colorado-rockies" },
  { id: "mlb-lad", city: "Los Angeles", name: "Dodgers", abbreviation: "LAD", conference: "NL", division: "West", primaryColor: "#005A9C", secondaryColor: "#EF3E42", slug: "los-angeles-dodgers", yardbarkerSlug: "15-los-angeles-dodgers" },
  { id: "mlb-sd", city: "San Diego", name: "Padres", abbreviation: "SD", conference: "NL", division: "West", primaryColor: "#2F241D", secondaryColor: "#FFC425", slug: "san-diego-padres", yardbarkerSlug: "23-san-diego-padres" },
  { id: "mlb-sf", city: "San Francisco", name: "Giants", abbreviation: "SF", conference: "NL", division: "West", primaryColor: "#FD5A1E", secondaryColor: "#27251F", slug: "san-francisco-giants", yardbarkerSlug: "24-san-francisco-giants" },
] as const).map((t) => ({ ...t, sport: "mlb" as const })));
