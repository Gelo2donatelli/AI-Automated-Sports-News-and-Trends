import { Layout } from "@/components/layout";
import { AlertCard } from "@/components/alert-card";
import { useGetBreakingAlerts } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Zap } from "lucide-react";
import { useSport, SPORT_LABELS } from "@/hooks/use-sport";

export default function Breaking() {
  const { sport, sportParam } = useSport();
  const { data: alerts, isLoading } = useGetBreakingAlerts(
    { limit: 50, sport: sportParam },
    { query: { refetchInterval: 30000 } }
  );

  return (
    <Layout>
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-3 border-b border-destructive/20 pb-4">
          <div className="h-10 w-10 bg-destructive/10 rounded flex items-center justify-center text-destructive">
            <Zap className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-destructive uppercase">Breaking News</h1>
            <p className="text-muted-foreground text-sm font-mono mt-1">{SPORT_LABELS[sport]} · High-priority alerts across the league</p>
          </div>
        </div>

        <div className="space-y-4">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="border border-destructive/20 rounded-md p-4 bg-destructive/5">
                <div className="flex items-center gap-3 mb-3">
                  <Skeleton className="h-8 w-12" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))
          ) : alerts && alerts.length > 0 ? (
            alerts.map((alert, i) => (
              <AlertCard key={alert.id} alert={alert} index={i} />
            ))
          ) : (
            <div className="border border-border border-dashed rounded-md p-12 text-center bg-card">
              <Zap className="h-8 w-8 text-muted-foreground mx-auto mb-3 opacity-50" />
              <h3 className="text-lg font-medium">No breaking news</h3>
              <p className="text-sm text-muted-foreground mt-1">
                The wire is quiet. We'll update this automatically when news breaks.
              </p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
