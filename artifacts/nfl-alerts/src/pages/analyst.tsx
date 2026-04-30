import { useState } from "react";
import {
  Brain,
  Loader2,
  RefreshCcw,
  TrendingUp,
  Activity,
  ArrowLeftRight,
  AlertTriangle,
  Zap,
} from "lucide-react";
import { Link } from "wouter";
import { formatDistanceToNow } from "date-fns";
import { Layout } from "@/components/layout";
import { InsightCard } from "@/components/insight-card";
import { TeamBadge } from "@/components/team-badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useListInsights,
  useGenerateInsights,
  useGetAlertFeed,
  getListInsightsQueryKey,
  type Alert,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useSport, SPORT_LABELS, SPORT_LIST } from "@/hooks/use-sport";
import { cn } from "@/lib/utils";

const FANTASY_CATEGORIES = ["injury_report", "transaction", "disciplinary"] as const;
type FantasyCategory = (typeof FANTASY_CATEGORIES)[number];

const SPORT_PILL: Record<string, string> = {
  nfl: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  mlb: "bg-sky-500/15 text-sky-400 border-sky-500/30",
  nba: "bg-orange-500/15 text-orange-400 border-orange-500/30",
  ncaaf: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  golf: "bg-teal-500/15 text-teal-400 border-teal-500/30",
};

const CATEGORY_CONFIG: Record<
  FantasyCategory,
  { label: string; tag: string; icon: React.ElementType; color: string; tagColor: string }
> = {
  injury_report: {
    label: "Injury Report",
    tag: "Fantasy/Betting Relevant",
    icon: Activity,
    color: "text-red-400",
    tagColor: "text-red-400",
  },
  transaction: {
    label: "Roster Move",
    tag: "Roster Impact",
    icon: ArrowLeftRight,
    color: "text-violet-400",
    tagColor: "text-violet-400",
  },
  disciplinary: {
    label: "Availability Risk",
    tag: "Availability Risk",
    icon: AlertTriangle,
    color: "text-amber-400",
    tagColor: "text-amber-400",
  },
};

const SPORT_ORDER = ["nfl", "mlb", "nba", "ncaaf", "golf"];

function FantasyAlertCard({ alert, index }: { alert: Alert; index: number }) {
  const cat = alert.category as FantasyCategory | undefined;
  const config = cat ? CATEGORY_CONFIG[cat] : null;
  const Icon = config?.icon ?? Activity;

  return (
    <Link href={`/alerts/${alert.id}`}>
      <div
        className={cn(
          "group relative flex flex-col gap-2 rounded-md border p-3 transition-all hover:bg-muted/30 cursor-pointer",
          alert.priority === "breaking"
            ? "border-destructive/50 bg-destructive/5"
            : "border-primary/30 bg-primary/5",
        )}
      >
        {/* Left priority stripe */}
        <div
          className={cn(
            "absolute top-0 left-0 w-1 h-full rounded-l-md",
            alert.priority === "breaking" ? "bg-destructive" : "bg-primary",
          )}
        />

        <div className="flex items-center gap-2 flex-wrap pl-1">
          <TeamBadge
            abbreviation={alert.teamAbbreviation}
            primaryColor={alert.teamPrimaryColor}
            size="sm"
          />
          {alert.priority === "breaking" && (
            <span className="flex items-center gap-1 text-[10px] font-mono font-bold text-destructive uppercase">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-destructive" />
              </span>
              Breaking
            </span>
          )}
          {alert.priority === "high" && (
            <span className="flex items-center gap-1 text-[10px] font-mono font-bold text-primary uppercase">
              <Zap className="h-2.5 w-2.5" />
              High Impact
            </span>
          )}
          {alert.sport && (
            <span
              className={cn(
                "rounded border px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                SPORT_PILL[alert.sport] ?? "bg-muted text-muted-foreground border-border",
              )}
            >
              {alert.sport === "ncaaf" ? "NCAAF" : alert.sport.toUpperCase()}
            </span>
          )}
          <time className="ml-auto text-[10px] font-mono text-muted-foreground">
            {formatDistanceToNow(new Date(alert.publishedAt), { addSuffix: true })}
          </time>
        </div>

        <p className="text-sm font-semibold leading-snug tracking-tight uppercase pl-1 line-clamp-2">
          {alert.headline}
        </p>

        {config && (
          <div className="flex items-center gap-1 pl-1 pt-1 border-t border-border/40">
            <Icon className={cn("h-3 w-3", config.tagColor)} />
            <span className={cn("text-[10px] font-mono uppercase tracking-wider", config.tagColor)}>
              {config.tag}
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}

function SportSection({
  sport,
  alerts,
}: {
  sport: string;
  alerts: Alert[];
}) {
  const byCategory: Partial<Record<FantasyCategory, Alert[]>> = {};
  for (const a of alerts) {
    const cat = a.category as FantasyCategory;
    if (!byCategory[cat]) byCategory[cat] = [];
    byCategory[cat]!.push(a);
  }

  const sportLabel = SPORT_LABELS[sport as keyof typeof SPORT_LABELS] ?? sport.toUpperCase();

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span
          className={cn(
            "rounded border px-2 py-0.5 text-xs font-bold uppercase tracking-wider",
            SPORT_PILL[sport] ?? "bg-muted text-muted-foreground border-border",
          )}
        >
          {sportLabel}
        </span>
        <span className="text-xs text-muted-foreground font-mono">
          {alerts.length} alert{alerts.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {(["injury_report", "transaction", "disciplinary"] as FantasyCategory[]).map((cat) => {
          const catAlerts = byCategory[cat] ?? [];
          const config = CATEGORY_CONFIG[cat];
          const Icon = config.icon;
          return (
            <div key={cat} className="space-y-2">
              <div className={cn("flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider", config.color)}>
                <Icon className="h-3.5 w-3.5" />
                {config.label}
                <span className="ml-auto text-muted-foreground font-normal">
                  {catAlerts.length}
                </span>
              </div>
              {catAlerts.length > 0 ? (
                catAlerts.slice(0, 4).map((alert, i) => (
                  <FantasyAlertCard key={alert.id} alert={alert} index={i} />
                ))
              ) : (
                <div className="rounded-md border border-dashed border-border/50 p-3 text-center">
                  <p className="text-[10px] text-muted-foreground font-mono uppercase">No alerts</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function Analyst() {
  const [filter, setFilter] = useState<string>("all");
  const [fantasyFilter, setFantasyFilter] = useState<string>("all");
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { sport, sportParam } = useSport();

  const { data: insights, isLoading } = useListInsights(
    { limit: 50, sport: sportParam },
    { query: { refetchInterval: 60_000 } },
  );

  const { data: fantasyAlerts, isLoading: fantasyLoading } = useGetAlertFeed(
    { limit: 150, showAll: false },
    { query: { refetchInterval: 120_000 } },
  );

  const generate = useGenerateInsights({
    mutation: {
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: getListInsightsQueryKey() });
        toast({
          title: "Analyst run complete",
          description: `${data.generated} new ${
            data.generated === 1 ? "insight" : "insights"
          } added.`,
        });
      },
      onError: () => {
        toast({
          title: "Generation failed",
          description: "Try again in a moment.",
          variant: "destructive",
        });
      },
    },
  });

  const filtered = (insights ?? []).filter((i) =>
    filter === "all" ? true : i.insightType === filter,
  );

  // Fantasy/betting relevant = high/breaking priority + specific categories
  const allFantasyAlerts = (fantasyAlerts ?? []).filter(
    (a) =>
      (a.priority === "high" || a.priority === "breaking") &&
      FANTASY_CATEGORIES.includes(a.category as FantasyCategory),
  );

  // Apply the sport tab filter for the fantasy section
  const visibleFantasyAlerts =
    fantasyFilter === "all"
      ? allFantasyAlerts
      : allFantasyAlerts.filter((a) => a.sport === fantasyFilter);

  // Group visible alerts by sport in display order
  const sportGroups: { sport: string; alerts: Alert[] }[] = [];
  if (fantasyFilter === "all") {
    for (const sp of SPORT_ORDER) {
      const group = visibleFantasyAlerts.filter((a) => a.sport === sp);
      if (group.length > 0) sportGroups.push({ sport: sp, alerts: group });
    }
    // Any sport not in SPORT_ORDER
    const extra = visibleFantasyAlerts.filter((a) => !SPORT_ORDER.includes(a.sport ?? ""));
    if (extra.length > 0) sportGroups.push({ sport: "other", alerts: extra });
  } else {
    if (visibleFantasyAlerts.length > 0) {
      sportGroups.push({ sport: fantasyFilter, alerts: visibleFantasyAlerts });
    }
  }

  // Sports that actually have fantasy alerts
  const activeSports = SPORT_ORDER.filter((s) =>
    allFantasyAlerts.some((a) => a.sport === s),
  );

  return (
    <Layout>
      <div className="space-y-10">
        {/* ── AI Analyst Desk ── */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight uppercase flex items-center gap-2">
                <Brain className="h-6 w-6 text-primary" />
                Analyst Desk
              </h1>
              <p className="text-muted-foreground text-sm font-mono mt-1">
                {SPORT_LABELS[sport]} · AI-generated trends, predictions & matchup intel from live news
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Tabs value={filter} onValueChange={setFilter}>
                <TabsList>
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="trend">Trends</TabsTrigger>
                  <TabsTrigger value="prediction">Predictions</TabsTrigger>
                  <TabsTrigger value="stat">Stats</TabsTrigger>
                </TabsList>
              </Tabs>
              <Button
                variant="outline"
                size="sm"
                disabled={generate.isPending}
                onClick={() => generate.mutate()}
              >
                {generate.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCcw className="h-4 w-4" />
                )}
                <span className="ml-2 font-mono text-xs uppercase tracking-wider">
                  Run Analyst
                </span>
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="border border-border rounded-md p-4 bg-card">
                  <Skeleton className="h-4 w-1/3 mb-3" />
                  <Skeleton className="h-5 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-4/5 mt-1" />
                </div>
              ))
            ) : filtered.length > 0 ? (
              filtered.map((insight, i) => (
                <InsightCard key={insight.id} insight={insight} index={i} />
              ))
            ) : (
              <div className="col-span-full border border-border border-dashed rounded-md p-12 text-center bg-card">
                <Brain className="h-8 w-8 text-muted-foreground mx-auto mb-3 opacity-50" />
                <h3 className="text-lg font-medium">Analyst is warming up</h3>
                <p className="text-sm text-muted-foreground mt-1 max-md mx-auto">
                  Insights are generated automatically every 30 minutes from the
                  latest team news. Hit "Run Analyst" to trigger one now.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ── Fantasy & Betting Intel ── */}
        <div className="space-y-5 border-t border-border pt-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-bold tracking-tight uppercase flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Fantasy &amp; Betting Intel
              </h2>
              <p className="text-muted-foreground text-sm font-mono mt-1">
                High-impact injuries, roster moves &amp; availability risks — grouped by sport
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
              <span className="flex items-center gap-1">
                <Activity className="h-3 w-3 text-red-400" /> Injury
              </span>
              <span className="flex items-center gap-1">
                <ArrowLeftRight className="h-3 w-3 text-violet-400" /> Roster
              </span>
              <span className="flex items-center gap-1">
                <AlertTriangle className="h-3 w-3 text-amber-400" /> Risk
              </span>
            </div>
          </div>

          {/* Sport filter tabs */}
          <div className="flex gap-1.5 flex-wrap">
            <button
              onClick={() => setFantasyFilter("all")}
              className={cn(
                "px-3 py-1 rounded text-xs font-mono font-bold uppercase tracking-wider border transition-colors",
                fantasyFilter === "all"
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground",
              )}
            >
              All Sports
            </button>
            {activeSports.map((sp) => (
              <button
                key={sp}
                onClick={() => setFantasyFilter(sp)}
                className={cn(
                  "px-3 py-1 rounded text-xs font-mono font-bold uppercase tracking-wider border transition-colors",
                  fantasyFilter === sp
                    ? cn("border-transparent", SPORT_PILL[sp])
                    : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground",
                )}
              >
                {SPORT_LABELS[sp as keyof typeof SPORT_LABELS] ?? sp.toUpperCase()}
                <span className="ml-1.5 opacity-60">
                  {allFantasyAlerts.filter((a) => a.sport === sp).length}
                </span>
              </button>
            ))}
          </div>

          {/* Content */}
          {fantasyLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="border border-border rounded-md p-3 bg-card space-y-2">
                  <Skeleton className="h-3 w-1/3" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-4/5" />
                </div>
              ))}
            </div>
          ) : sportGroups.length > 0 ? (
            <div className="space-y-8">
              {sportGroups.map(({ sport: sp, alerts }) => (
                <SportSection key={sp} sport={sp} alerts={alerts} />
              ))}
            </div>
          ) : (
            <div className="border border-dashed border-border rounded-md p-10 text-center bg-card">
              <TrendingUp className="h-7 w-7 text-muted-foreground mx-auto mb-3 opacity-40" />
              <p className="text-sm text-muted-foreground">
                No high-impact fantasy or betting alerts right now.
              </p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
