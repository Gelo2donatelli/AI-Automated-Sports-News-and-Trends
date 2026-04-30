import type { TeamSeed } from "./types";

const playerFeed = (id: number, slug: string) =>
  `https://www.yardbarker.com/rss/player/${id}-${slug}`;

export const GOLF_PLAYERS: TeamSeed[] = (([
  // Top PGA Tour Players
  { id: "golf-scheffler", city: "PGA Tour", name: "Scottie Scheffler", abbreviation: "SCH", conference: "PGA Tour", division: "PGA", primaryColor: "#00843D", secondaryColor: "#FFFFFF", slug: "scottie-scheffler", yardbarkerSlug: "906685-scottie-scheffler", feedUrlOverride: playerFeed(906685, "scottie-scheffler") },
  { id: "golf-mcilroy", city: "PGA Tour", name: "Rory McIlroy", abbreviation: "MCI", conference: "PGA Tour", division: "PGA", primaryColor: "#0057A8", secondaryColor: "#FFFFFF", slug: "rory-mcilroy", yardbarkerSlug: "127069-rory-mcilroy", feedUrlOverride: playerFeed(127069, "rory-mcilroy") },
  { id: "golf-woods", city: "PGA Tour", name: "Tiger Woods", abbreviation: "TWD", conference: "PGA Tour", division: "PGA", primaryColor: "#000000", secondaryColor: "#CC0000", slug: "tiger-woods", yardbarkerSlug: "24118-tiger-woods", feedUrlOverride: playerFeed(24118, "tiger-woods") },
  { id: "golf-rahm", city: "LIV Golf", name: "Jon Rahm", abbreviation: "RAH", conference: "LIV Golf", division: "LIV", primaryColor: "#C41E3A", secondaryColor: "#FFFFFF", slug: "jon-rahm", yardbarkerSlug: "409219-jon-rahm", feedUrlOverride: playerFeed(409219, "jon-rahm") },
  { id: "golf-dechambeau", city: "LIV Golf", name: "Bryson DeChambeau", abbreviation: "DEC", conference: "LIV Golf", division: "LIV", primaryColor: "#1E3A5F", secondaryColor: "#FFFFFF", slug: "bryson-dechambeau", yardbarkerSlug: "408772-bryson-dechambeau", feedUrlOverride: playerFeed(408772, "bryson-dechambeau") },
  { id: "golf-koepka", city: "LIV Golf", name: "Brooks Koepka", abbreviation: "KOE", conference: "LIV Golf", division: "LIV", primaryColor: "#C41E3A", secondaryColor: "#000000", slug: "brooks-koepka", yardbarkerSlug: "409021-brooks-koepka", feedUrlOverride: playerFeed(409021, "brooks-koepka") },
  { id: "golf-fitzpatrick", city: "PGA Tour", name: "Matt Fitzpatrick", abbreviation: "FIT", conference: "PGA Tour", division: "PGA", primaryColor: "#003087", secondaryColor: "#FFFFFF", slug: "matt-fitzpatrick", yardbarkerSlug: "926924-matt-fitzpatrick", feedUrlOverride: playerFeed(926924, "matt-fitzpatrick") },
  { id: "golf-korda", city: "LPGA Tour", name: "Nelly Korda", abbreviation: "KOR", conference: "LPGA Tour", division: "LPGA", primaryColor: "#8B1A4A", secondaryColor: "#FFFFFF", slug: "nelly-korda", yardbarkerSlug: "911835-nelly-korda", feedUrlOverride: playerFeed(911835, "nelly-korda") },
  { id: "golf-kim", city: "LIV Golf", name: "Anthony Kim", abbreviation: "KIM", conference: "LIV Golf", division: "LIV", primaryColor: "#1A1A1A", secondaryColor: "#FFD700", slug: "anthony-kim", yardbarkerSlug: "24164-anthony-kim", feedUrlOverride: playerFeed(24164, "anthony-kim") },
] as const).map((t) => ({ ...t, sport: "golf" as const })));
