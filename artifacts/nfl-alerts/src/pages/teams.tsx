import { Layout } from "@/components/layout";
import { Link } from "wouter";
import { useListTeams } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { TeamBadge } from "@/components/team-badge";
import { motion } from "framer-motion";
import { Users } from "lucide-react";

export default function Teams() {
  const { data: teams, isLoading } = useListTeams();

  // Group teams by conference and division
  const groupedTeams = teams?.reduce((acc, team) => {
    const key = `${team.conference} ${team.division}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(team);
    return acc;
  }, {} as Record<string, typeof teams>);

  // Sort groups
  const sortedGroups = Object.keys(groupedTeams || {}).sort();

  return (
    <Layout>
      <div className="flex flex-col gap-8">
        <div className="flex items-center gap-3 border-b border-border pb-4">
          <div className="h-10 w-10 bg-primary/10 rounded flex items-center justify-center text-primary">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight uppercase">League Directory</h1>
            <p className="text-muted-foreground text-sm font-mono mt-1">All 32 NFL franchises</p>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 16 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full rounded-md" />
            ))}
          </div>
        ) : (
          <div className="space-y-10">
            {sortedGroups.map(group => (
              <div key={group}>
                <h2 className="text-sm font-bold font-mono uppercase tracking-widest text-muted-foreground mb-4">
                  {group}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {groupedTeams![group].map((team, i) => (
                    <motion.div
                      key={team.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
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
          </div>
        )}
      </div>
    </Layout>
  );
}
