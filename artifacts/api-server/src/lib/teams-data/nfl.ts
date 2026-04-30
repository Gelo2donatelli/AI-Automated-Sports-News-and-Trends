import type { TeamSeed } from "./types";

export const NFL_TEAMS: TeamSeed[] = (([
  // AFC East
  { id: "buf", city: "Buffalo", name: "Bills", abbreviation: "BUF", conference: "AFC", division: "East", primaryColor: "#00338D", secondaryColor: "#C60C30", slug: "buffalo-bills", yardbarkerSlug: "32-buffalo-bills" },
  { id: "mia", city: "Miami", name: "Dolphins", abbreviation: "MIA", conference: "AFC", division: "East", primaryColor: "#008E97", secondaryColor: "#FC4C02", slug: "miami-dolphins", yardbarkerSlug: "40-miami-dolphins" },
  { id: "ne", city: "New England", name: "Patriots", abbreviation: "NE", conference: "AFC", division: "East", primaryColor: "#002244", secondaryColor: "#C60C30", slug: "new-england-patriots", yardbarkerSlug: "41-new-england-patriots" },
  { id: "nyj", city: "New York", name: "Jets", abbreviation: "NYJ", conference: "AFC", division: "East", primaryColor: "#125740", secondaryColor: "#FFFFFF", slug: "new-york-jets", yardbarkerSlug: "42-new-york-jets" },

  // AFC North
  { id: "bal", city: "Baltimore", name: "Ravens", abbreviation: "BAL", conference: "AFC", division: "North", primaryColor: "#241773", secondaryColor: "#9E7C0C", slug: "baltimore-ravens", yardbarkerSlug: "31-baltimore-ravens" },
  { id: "cin", city: "Cincinnati", name: "Bengals", abbreviation: "CIN", conference: "AFC", division: "North", primaryColor: "#FB4F14", secondaryColor: "#000000", slug: "cincinnati-bengals", yardbarkerSlug: "33-cincinnati-bengals" },
  { id: "cle", city: "Cleveland", name: "Browns", abbreviation: "CLE", conference: "AFC", division: "North", primaryColor: "#311D00", secondaryColor: "#FF3C00", slug: "cleveland-browns", yardbarkerSlug: "34-cleveland-browns" },
  { id: "pit", city: "Pittsburgh", name: "Steelers", abbreviation: "PIT", conference: "AFC", division: "North", primaryColor: "#FFB612", secondaryColor: "#101820", slug: "pittsburgh-steelers", yardbarkerSlug: "44-pittsburgh-steelers" },

  // AFC South
  { id: "hou", city: "Houston", name: "Texans", abbreviation: "HOU", conference: "AFC", division: "South", primaryColor: "#03202F", secondaryColor: "#A71930", slug: "houston-texans", yardbarkerSlug: "36-houston-texans" },
  { id: "ind", city: "Indianapolis", name: "Colts", abbreviation: "IND", conference: "AFC", division: "South", primaryColor: "#002C5F", secondaryColor: "#A2AAAD", slug: "indianapolis-colts", yardbarkerSlug: "37-indianapolis-colts" },
  { id: "jax", city: "Jacksonville", name: "Jaguars", abbreviation: "JAX", conference: "AFC", division: "South", primaryColor: "#101820", secondaryColor: "#D7A22A", slug: "jacksonville-jaguars", yardbarkerSlug: "38-jacksonville-jaguars" },
  { id: "ten", city: "Tennessee", name: "Titans", abbreviation: "TEN", conference: "AFC", division: "South", primaryColor: "#0C2340", secondaryColor: "#4B92DB", slug: "tennessee-titans", yardbarkerSlug: "46-tennessee-titans" },

  // AFC West
  { id: "den", city: "Denver", name: "Broncos", abbreviation: "DEN", conference: "AFC", division: "West", primaryColor: "#FB4F14", secondaryColor: "#002244", slug: "denver-broncos", yardbarkerSlug: "35-denver-broncos" },
  { id: "kc", city: "Kansas City", name: "Chiefs", abbreviation: "KC", conference: "AFC", division: "West", primaryColor: "#E31837", secondaryColor: "#FFB81C", slug: "kansas-city-chiefs", yardbarkerSlug: "39-kansas-city-chiefs" },
  { id: "lv", city: "Las Vegas", name: "Raiders", abbreviation: "LV", conference: "AFC", division: "West", primaryColor: "#000000", secondaryColor: "#A5ACAF", slug: "las-vegas-raiders", yardbarkerSlug: "43-las-vegas-raiders" },
  { id: "lac", city: "Los Angeles", name: "Chargers", abbreviation: "LAC", conference: "AFC", division: "West", primaryColor: "#0080C6", secondaryColor: "#FFC20E", slug: "los-angeles-chargers", yardbarkerSlug: "45-los-angeles-chargers" },

  // NFC East
  { id: "dal", city: "Dallas", name: "Cowboys", abbreviation: "DAL", conference: "NFC", division: "East", primaryColor: "#003594", secondaryColor: "#869397", slug: "dallas-cowboys", yardbarkerSlug: "51-dallas-cowboys" },
  { id: "nyg", city: "New York", name: "Giants", abbreviation: "NYG", conference: "NFC", division: "East", primaryColor: "#0B2265", secondaryColor: "#A71930", slug: "new-york-giants", yardbarkerSlug: "56-new-york-giants" },
  { id: "phi", city: "Philadelphia", name: "Eagles", abbreviation: "PHI", conference: "NFC", division: "East", primaryColor: "#004C54", secondaryColor: "#A5ACAF", slug: "philadelphia-eagles", yardbarkerSlug: "57-philadelphia-eagles" },
  { id: "wsh", city: "Washington", name: "Commanders", abbreviation: "WSH", conference: "NFC", division: "East", primaryColor: "#5A1414", secondaryColor: "#FFB612", slug: "washington-commanders", yardbarkerSlug: "62-washington-commanders" },

  // NFC North
  { id: "chi", city: "Chicago", name: "Bears", abbreviation: "CHI", conference: "NFC", division: "North", primaryColor: "#0B162A", secondaryColor: "#C83803", slug: "chicago-bears", yardbarkerSlug: "50-chicago-bears" },
  { id: "det", city: "Detroit", name: "Lions", abbreviation: "DET", conference: "NFC", division: "North", primaryColor: "#0076B6", secondaryColor: "#B0B7BC", slug: "detroit-lions", yardbarkerSlug: "52-detroit-lions" },
  { id: "gb", city: "Green Bay", name: "Packers", abbreviation: "GB", conference: "NFC", division: "North", primaryColor: "#203731", secondaryColor: "#FFB612", slug: "green-bay-packers", yardbarkerSlug: "53-green-bay-packers" },
  { id: "min", city: "Minnesota", name: "Vikings", abbreviation: "MIN", conference: "NFC", division: "North", primaryColor: "#4F2683", secondaryColor: "#FFC62F", slug: "minnesota-vikings", yardbarkerSlug: "54-minnesota-vikings" },

  // NFC South
  { id: "atl", city: "Atlanta", name: "Falcons", abbreviation: "ATL", conference: "NFC", division: "South", primaryColor: "#A71930", secondaryColor: "#000000", slug: "atlanta-falcons", yardbarkerSlug: "48-atlanta-falcons" },
  { id: "car", city: "Carolina", name: "Panthers", abbreviation: "CAR", conference: "NFC", division: "South", primaryColor: "#0085CA", secondaryColor: "#101820", slug: "carolina-panthers", yardbarkerSlug: "49-carolina-panthers" },
  { id: "no", city: "New Orleans", name: "Saints", abbreviation: "NO", conference: "NFC", division: "South", primaryColor: "#D3BC8D", secondaryColor: "#101820", slug: "new-orleans-saints", yardbarkerSlug: "55-new-orleans-saints" },
  { id: "tb", city: "Tampa Bay", name: "Buccaneers", abbreviation: "TB", conference: "NFC", division: "South", primaryColor: "#D50A0A", secondaryColor: "#0A0A08", slug: "tampa-bay-buccaneers", yardbarkerSlug: "61-tampa-bay-buccaneers" },

  // NFC West
  { id: "ari", city: "Arizona", name: "Cardinals", abbreviation: "ARI", conference: "NFC", division: "West", primaryColor: "#97233F", secondaryColor: "#000000", slug: "arizona-cardinals", yardbarkerSlug: "47-arizona-cardinals" },
  { id: "lar", city: "Los Angeles", name: "Rams", abbreviation: "LAR", conference: "NFC", division: "West", primaryColor: "#003594", secondaryColor: "#FFA300", slug: "los-angeles-rams", yardbarkerSlug: "60-los-angeles-rams" },
  { id: "sf", city: "San Francisco", name: "49ers", abbreviation: "SF", conference: "NFC", division: "West", primaryColor: "#AA0000", secondaryColor: "#B3995D", slug: "san-francisco-49ers", yardbarkerSlug: "58-san-francisco-49ers" },
  { id: "sea", city: "Seattle", name: "Seahawks", abbreviation: "SEA", conference: "NFC", division: "West", primaryColor: "#002244", secondaryColor: "#69BE28", slug: "seattle-seahawks", yardbarkerSlug: "59-seattle-seahawks" },
] as const).map((t) => ({ ...t, sport: "nfl" as const })));
