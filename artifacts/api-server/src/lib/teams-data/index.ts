import { NFL_TEAMS } from "./nfl";
import { MLB_TEAMS } from "./mlb";
import { NBA_TEAMS } from "./nba";
import type { Sport, TeamSeed } from "./types";

export { NFL_TEAMS, MLB_TEAMS, NBA_TEAMS };
export * from "./types";

export const ALL_TEAMS: TeamSeed[] = [
  ...NFL_TEAMS,
  ...MLB_TEAMS,
  ...NBA_TEAMS,
];

export function teamsForSport(sport: Sport): TeamSeed[] {
  return ALL_TEAMS.filter((t) => t.sport === sport);
}
