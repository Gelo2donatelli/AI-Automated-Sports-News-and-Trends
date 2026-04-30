import { useParams, Link } from "wouter";
import { Layout } from "@/components/layout";
import { useGetTeam, useListAlerts } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { TeamBadge } from "@/components/team-badge";
import { AlertCard } from "@/components/alert-card";
import { ArrowLeft, Activity } from "lucide-react";

export default function TeamDetail() {
  const { teamId } = useParams();

  const { data: team, isLoading: isTeamLoading } = useGetTeam(teamId || "", {
    query: { enabled: !!teamId }
  });

  const { data: alerts, isLoading: isAlertsLoading } = useListAlerts(
    { teamId },
    { query: { enabled: !!teamId, refetchInterval: 30000 } }
  );

  if (isTeamLoading) {
    return (
      <Layout>
        <div className="space-y-6">
          <Skeleton className="h-40 w-full rounded-md" />
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-32 w-full rounded-md" />
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  if (!team) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold">Team not found</h2>
          <Link href="/teams" className="text-primary hover:underline mt-4 inline-block">
            Back to Teams
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex flex-col gap-6">
        <Link href="/teams" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground w-fit">
          <ArrowLeft className="h-4 w-4" /> Back to Teams
        </Link>

        <div className="relative overflow-hidden rounded-md border border-border bg-card p-6 md:p-8">
          <div 
            className="absolute top-0 left-0 w-2 h-full" 
            style={{ backgroundColor: team.primaryColor }}
          />
          <div className="flex items-center gap-6">
            <TeamBadge abbreviation={team.abbreviation} primaryColor={team.primaryColor} size="lg" className="h-20 w-20 text-2xl" />
            <div>
              <div className="flex items-center gap-2 text-sm font-mono text-muted-foreground mb-1 uppercase">
                <span>{team.conference}</span>
                <span>•</span>
                <span>{team.division}</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold uppercase tracking-tight">
                {team.city} <span className="text-muted-foreground">{team.name}</span>
              </h1>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-bold uppercase tracking-wide flex items-center gap-2 mb-4">
            <Activity className="h-5 w-5 text-primary" />
            Team Wire
          </h2>
          
          <div className="space-y-4">
            {isAlertsLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-32 w-full rounded-md" />
              ))
            ) : alerts && alerts.length > 0 ? (
              alerts.map((alert, i) => (
                <AlertCard key={alert.id} alert={alert} index={i} />
              ))
            ) : (
              <div className="border border-border border-dashed rounded-md p-12 text-center bg-card">
                <Activity className="h-8 w-8 text-muted-foreground mx-auto mb-3 opacity-50" />
                <h3 className="text-lg font-medium">No recent alerts</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  The wire is quiet for {team.city}.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
