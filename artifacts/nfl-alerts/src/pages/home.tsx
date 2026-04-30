import { useState } from "react";
import { Link } from "wouter";
import { Activity, Flame, ShieldAlert, ArrowRight, Brain } from "lucide-react";
import { Layout } from "@/components/layout";
import { AlertCard } from "@/components/alert-card";
import { InsightCard } from "@/components/insight-card";
import { RefreshButton } from "@/components/refresh-button";
import { TeamBadge } from "@/components/team-badge";
import { useClientId } from "@/hooks/use-client-id";
import { useSport, SPORT_LABELS } from "@/hooks/use-sport";
import {
  useGetOverviewStats,
  useGetAlertFeed,
  useGetTrendingTeams,
  useGetPreferences,
  useListInsights,
} from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";

export default function Home() {
  const clientId = useClientId();
  const [feedMode, setFeedMode] = useState<"all" | "following">("all");
  const { sport, sportParam } = useSport();

  const { data: stats, isLoading: isStatsLoading } = useGetOverviewStats();
  
  const { data: preferences } = useGetPreferences(
    { clientId: clientId || "" },
    { query: { enabled: !!clientId } }
  );

  const hasFollowedTeams = preferences?.followedTeamIds && preferences.followedTeamIds.length > 0;
  const teamIdsFilter = feedMode === "following" && hasFollowedTeams 
    ? preferences.followedTeamIds.join(",") 
    : undefined;

  const { data: feed, isLoading: isFeedLoading } = useGetAlertFeed(
    { teamIds: teamIdsFilter, limit: 50, sport: sportParam },
    { query: { refetchInterval: 30000 } } // Auto-poll every 30s
  );

  const { data: trending, isLoading: isTrendingLoading } = useGetTrendingTeams({ limit: 5, sport: sportParam });

  const { data: topInsights } = useListInsights(
    { limit: 4, sport: sportParam },
    { query: { refetchInterval: 60_000 } },
  );

  return (
    <Layout>
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 lg:gap-8">
        
        <div className="xl:col-span-3 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight uppercase flex items-center gap-2">
                <Activity className="h-6 w-6 text-primary" />
                Live Wire
              </h1>
              <p className="text-muted-foreground text-sm font-mono mt-1">
                {SPORT_LABELS[sport]} · Real-time league activity • Auto-refreshing
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <Tabs value={feedMode} onValueChange={(v) => setFeedMode(v as any)}>
                <TabsList>
                  <TabsTrigger value="all">League Wide</TabsTrigger>
                  <TabsTrigger value="following" disabled={!hasFollowedTeams}>
                    My Teams {!hasFollowedTeams && "(None)"}
                  </TabsTrigger>
                </TabsList>
              </Tabs>
              <RefreshButton />
            </div>
          </div>

          {topInsights && topInsights.length > 0 && (
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-mono tracking-wider uppercase text-muted-foreground flex items-center gap-2">
                  <Brain className="h-4 w-4 text-primary" />
                  Analyst Desk · Latest Reads
                </h2>
                <Link
                  href="/analyst"
                  className="text-xs font-mono uppercase tracking-wider text-primary hover:text-primary/80 flex items-center gap-1"
                >
                  All insights <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {topInsights.slice(0, 2).map((insight, i) => (
                  <InsightCard key={insight.id} insight={insight} index={i} />
                ))}
              </div>
            </section>
          )}

          <div className="space-y-4">
            {isFeedLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="border border-border rounded-md p-4 bg-card">
                  <div className="flex items-center gap-3 mb-3">
                    <Skeleton className="h-8 w-12" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))
            ) : feed && feed.length > 0 ? (
              feed.map((alert, i) => (
                <AlertCard key={alert.id} alert={alert} index={i} />
              ))
            ) : (
              <div className="border border-border border-dashed rounded-md p-12 text-center bg-card">
                <Activity className="h-8 w-8 text-muted-foreground mx-auto mb-3 opacity-50" />
                <h3 className="text-lg font-medium">No alerts found</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {feedMode === "following" 
                    ? "None of your followed teams have recent activity. Waiting for news to break..."
                    : "The wire is quiet right now. Refreshing automatically..."}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-mono tracking-wider text-muted-foreground uppercase flex items-center gap-2">
                <ShieldAlert className="h-4 w-4" />
                Terminal Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isStatsLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : stats ? (
                <>
                  <div>
                    <div className="text-3xl font-bold font-mono text-primary">{stats.alertsLast24h}</div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wider">Alerts (24H)</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold font-mono text-destructive flex items-center gap-2">
                      {stats.breakingCount}
                      {stats.breakingCount > 0 && (
                        <span className="relative flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-destructive"></span>
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wider">Breaking News</div>
                  </div>
                </>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-mono tracking-wider text-muted-foreground uppercase flex items-center gap-2">
                <Flame className="h-4 w-4 text-orange-500" />
                Trending Teams
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isTrendingLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex gap-3 items-center">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-3 w-20" />
                        <Skeleton className="h-3 w-full" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : trending && trending.length > 0 ? (
                <div className="space-y-5">
                  {trending.map((t, i) => (
                    <motion.div 
                      key={t.team.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="group flex gap-3 items-start"
                    >
                      <TeamBadge 
                        abbreviation={t.team.abbreviation} 
                        primaryColor={t.team.primaryColor} 
                        size="sm" 
                        className="rounded-full h-8 w-8 text-[9px] shrink-0" 
                      />
                      <div className="flex-1 min-w-0">
                        <Link href={`/teams/${t.team.id}`} className="block hover:text-primary transition-colors">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-sm font-bold uppercase truncate">
                              {t.team.city}
                            </span>
                            <span className="text-xs font-mono text-muted-foreground shrink-0 bg-muted px-1.5 rounded">
                              {t.alertsLast24h} alerts
                            </span>
                          </div>
                          {t.latestHeadline && (
                            <p className="text-xs text-muted-foreground truncate mt-0.5 group-hover:text-foreground transition-colors">
                              {t.latestHeadline}
                            </p>
                          )}
                        </Link>
                      </div>
                    </motion.div>
                  ))}
                  
                  <Link 
                    href="/teams" 
                    className="flex items-center gap-2 text-xs font-mono text-primary hover:text-primary/80 transition-colors uppercase tracking-wider mt-4"
                  >
                    View all teams <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground py-4 text-center">
                  No trending teams right now
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
