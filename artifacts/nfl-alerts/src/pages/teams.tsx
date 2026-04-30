import { Layout } from "@/components/layout";
import { Link } from "wouter";
import { useListTeams } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { TeamBadge } from "@/components/team-badge";
import { motion } from "framer-motion";
import { Users } from "lucide-react";
import { useSport, SPORT_LABELS } from "@/hooks/use-sport";

const SPORT_ORDER: Record<string, number> = { nfl: 0, mlb: 1, nba: 2 };
const SPORT_HEADER: Record<string, string> = {
  nfl: "NFL — National Football League",
  mlb: "MLB — Major League Baseball",
  nba: "NBA — National Basketball Association",
};

export default function Teams() {
  const { sport, sportParam } = useSport();
  const { data: teams, isLoading } = useListTeams({ sport: sportParam });

  // Group teams by sport, then conference and division
  const groupedTeams = teams?.reduce((acc, team) => {
    const sportKey = team.sport ?? "nfl";
    const divKey = `${team.conference} ${team.division}`;
    if (!acc[sportKey]) acc[sportKey] = {};
    if (!acc[sportKey][divKey]) acc[sportKey][divKey] = [];
    acc[sportKey][divKey].push(team);
    return acc;
  }, {} as Record<string, Record<string, NonNullable<typeof teams>>>);

  const sortedSports = Object.keys(groupedTeams || {}).sort(
    (a, b) => (SPORT_ORDER[a] ?? 99) - (SPORT_ORDER[b] ?? 99),
  );
  const totalCount = teams?.length ?? 0;

  return (
    <Layout>
      <div className="flex flex-col gap-8">
        <div className="flex items-center gap-3 border-b border-border pb-4">
          <div className="h-10 w-10 bg-primary/10 rounded flex items-center justify-center text-primary">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight uppercase">League Directory</h1>
            <p className="text-muted-foreground text-sm font-mono mt-1">{SPORT_LABELS[sport]} · {totalCount} franchises</p>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 16 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full rounded-md" />
            ))}
          </div>
        ) : (
          <div className="space-y-12">
            {sortedSports.map((sportKey) => (
              <section key={sportKey} className="space-y-6">
                {sortedSports.length > 1 && (
                  <h2 className="text-xs font-bold font-mono uppercase tracking-[0.25em] text-primary border-b border-primary/30 pb-2">
                    {SPORT_HEADER[sportKey] ?? sportKey.toUpperCase()}
                  </h2>
                )}
                {Object.keys(groupedTeams![sportKey]).sort().map((group) => (
                  <div key={`${sportKey}-${group}`}>
                    <h3 className="text-sm font-bold font-mono uppercase tracking-widest text-muted-foreground mb-4">
                      {group}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {groupedTeams![sportKey][group].map((team, i) => (
                        <motion.div
                          key={team.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.03 }}
                        >
                          <Link href={`/teams/${team.id}`} className="block h-full">
                            <div className="border border-border bg-card hover:bg-muted/50 transition-colors rounded-md p-4 h-full flex flex-col items-center justify-center text-center gap-3 relative overflow-hidden group">
                              <div
                                className="absolute top-0 left-0 w-full h-1 opacity-50 group-hover:opacity-100 transition-opacity"
                                style={{ backgroundColor: team.primaryColor }}
                              />
                              <TeamBadge abbreviation={team.abbreviation} primaryColor={team.primaryColor} size="lg" />
                              <div>
                                <div className="font-bold uppercase text-lg leading-tight">{team.city}</div>
                                <div className="text-muted-foreground text-sm">{team.name}</div>
                              </div>
                              {team.alertCount !== undefined && team.alertCount > 0 && (
                                <div className="absolute top-2 right-2 text-[10px] font-mono bg-muted text-muted-foreground px-1.5 py-0.5 rounded">
                                  {team.alertCount} ALERTS
                                </div>
                              )}
                            </div>
                          </Link>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                ))}
              </section>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
