import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";
import { Brain, TrendingUp, Target, BarChart3, Swords } from "lucide-react";
import type { Insight } from "@workspace/api-client-react";
import { TeamBadge } from "./team-badge";
import { cn } from "@/lib/utils";

interface InsightCardProps {
  insight: Insight;
  index?: number;
}

const TYPE_META: Record<
  string,
  { label: string; icon: typeof Brain; color: string }
> = {
  trend: { label: "TREND", icon: TrendingUp, color: "text-emerald-400" },
  prediction: { label: "PREDICTION", icon: Target, color: "text-amber-400" },
  stat: { label: "STAT", icon: BarChart3, color: "text-sky-400" },
  matchup: { label: "MATCHUP", icon: Swords, color: "text-violet-400" },
};

const SPORT_PILL: Record<string, string> = {
  nfl: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  mlb: "bg-sky-500/15 text-sky-400 border-sky-500/30",
  nba: "bg-orange-500/15 text-orange-400 border-orange-500/30",
  ncaaf: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  golf: "bg-teal-500/15 text-teal-400 border-teal-500/30",
};

function confidenceTone(c: number): string {
  if (c >= 80) return "text-emerald-400";
  if (c >= 60) return "text-amber-400";
  return "text-muted-foreground";
}

export function InsightCard({ insight, index = 0 }: InsightCardProps) {
  const meta = TYPE_META[insight.insightType] ?? {
    label: insight.insightType.toUpperCase(),
    icon: Brain,
    color: "text-primary",
  };
  const Icon = meta.icon;

  return (
    <motion.article
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.04 }}
      className={cn(
        "relative overflow-hidden rounded-md border border-primary/30 bg-gradient-to-br from-card to-card/40 p-4",
        "hover:border-primary/60 transition-colors",
      )}
    >
      {/* AI accent glow */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_right,_rgba(34,197,94,0.08),_transparent_60%)]" />

      <div className="flex items-center gap-2 mb-3">
        {insight.teamAbbreviation ? (
          <TeamBadge
            abbreviation={insight.teamAbbreviation}
            primaryColor={insight.teamPrimaryColor ?? "#1f2937"}
            size="sm"
          />
        ) : (
          <div className="px-2 py-1 rounded text-[10px] font-mono font-bold bg-primary/10 text-primary border border-primary/30">
            LEAGUE
          </div>
        )}
        {insight.sport && (
          <span className={cn("rounded border px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider", SPORT_PILL[insight.sport] ?? "bg-muted text-muted-foreground border-border")}>
            {insight.sport}
          </span>
        )}
        <span className={cn("flex items-center gap-1 text-[11px] font-mono font-bold uppercase tracking-wider", meta.color)}>
          <Icon className="h-3.5 w-3.5" />
          {meta.label}
        </span>
        <span className="text-muted-foreground opacity-50 text-xs">•</span>
        <span className="text-[11px] font-mono uppercase text-muted-foreground tracking-wider truncate">
          {insight.teamCity ?? "League-wide"} {insight.teamName ?? ""}
        </span>
        <div className="ml-auto flex items-center gap-2">
          <span className={cn("text-[11px] font-mono font-bold tabular-nums", confidenceTone(insight.confidence))}>
            {insight.confidence}% CONF
          </span>
          <time className="text-[11px] text-muted-foreground font-mono whitespace-nowrap">
            {formatDistanceToNow(new Date(insight.generatedAt), { addSuffix: true })}
          </time>
        </div>
      </div>

      <h3 className="font-bold leading-tight tracking-tight mb-2 text-base md:text-[17px]">
        {insight.title}
      </h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{insight.body}</p>

      {insight.tags && insight.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {insight.tags.map((t: string) => (
            <span
              key={t}
              className="text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded bg-muted text-muted-foreground"
            >
              #{t}
            </span>
          ))}
        </div>
      )}

      <div className="mt-3 pt-3 border-t border-border/50 flex items-center gap-2">
        <Brain className="h-3 w-3 text-primary/60" />
        <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground/70">
          AI analyst • derived from {insight.relatedAlertIds.length} recent {insight.relatedAlertIds.length === 1 ? "alert" : "alerts"}
        </span>
      </div>
    </motion.article>
  );
}
