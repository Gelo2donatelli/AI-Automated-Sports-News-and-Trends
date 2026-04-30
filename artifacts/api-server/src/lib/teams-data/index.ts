import { NFL_TEAMS } from "./nfl";
import { MLB_TEAMS } from "./mlb";
import { NBA_TEAMS } from "./nba";
import { NCAAF_TEAMS } from "./ncaaf";
import { GOLF_PLAYERS } from "./golf";
import { GLOBAL_SOURCES } from "./sources";
import type { Sport, TeamSeed } from "./types";

export { NFL_TEAMS, MLB_TEAMS, NBA_TEAMS, NCAAF_TEAMS, GOLF_PLAYERS, GLOBAL_SOURCES };
export * from "./types";

export const ALL_TEAMS: TeamSeed[] = [
  ...NFL_TEAMS,
  ...MLB_TEAMS,
  ...NBA_TEAMS,
  ...NCAAF_TEAMS,
  ...GOLF_PLAYERS,
  ...GLOBAL_SOURCES,
];

export function teamsForSport(sport: Sport): TeamSeed[] {
  return ALL_TEAMS.filter((t) => t.sport === sport);
}
