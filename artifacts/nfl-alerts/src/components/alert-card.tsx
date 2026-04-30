import { Link } from "wouter";
import { formatDistanceToNow } from "date-fns";
import { Alert } from "@workspace/api-client-react/src/generated/api.schemas";
import { cn } from "@/lib/utils";
import { TeamBadge } from "./team-badge";
import { motion } from "framer-motion";
import {
  Zap,
  TrendingUp,
  ArrowLeftRight,
  Activity,
  AlertTriangle,
  ShieldAlert,
  Users,
  FileText,
} from "lucide-react";

interface AlertCardProps {
  alert: Alert;
  index?: number;
}

const SPORT_PILL: Record<string, string> = {
  nfl: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  mlb: "bg-sky-500/15 text-sky-400 border-sky-500/30",
  nba: "bg-orange-500/15 text-orange-400 border-orange-500/30",
  ncaaf: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  golf: "bg-teal-500/15 text-teal-400 border-teal-500/30",
};

interface CategoryMeta {
  label: string;
  icon: React.ElementType;
  className: string;
}

const CATEGORY_META: Record<string, CategoryMeta> = {
  injury_report: {
    label: "INJURY",
    icon: Activity,
    className: "text-red-400 bg-red-500/10 border-red-500/30",
  },
  transaction: {
    label: "TRADE/SIGN",
    icon: ArrowLeftRight,
    className: "text-violet-400 bg-violet-500/10 border-violet-500/30",
  },
  disciplinary: {
    label: "DISCIPLINE",
    icon: ShieldAlert,
    className: "text-amber-400 bg-amber-500/10 border-amber-500/30",
  },
  coaching_update: {
    label: "COACHING",
    icon: Users,
    className: "text-blue-400 bg-blue-500/10 border-blue-500/30",
  },
  player_update: {
    label: "PLAYER",
    icon: TrendingUp,
    className: "text-primary bg-primary/10 border-primary/30",
  },
  team_update: {
    label: "TEAM",
    icon: FileText,
    className: "text-muted-foreground bg-muted/50 border-border",
  },
  general: {
    label: "GENERAL",
    icon: FileText,
    className: "text-muted-foreground bg-muted/50 border-border",
  },
};

export function AlertCard({ alert, index = 0 }: AlertCardProps) {
  const isBreaking = alert.priority === "breaking";
  const isHigh = alert.priority === "high";
  const catMeta = CATEGORY_META[alert.category ?? "general"] ?? CATEGORY_META.general;
  const CatIcon = catMeta.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="group"
    >
      <Link href={`/alerts/${alert.id}`} className="block">
        <div
          className={cn(
            "relative overflow-hidden rounded-md border p-4 transition-all hover:bg-muted/30",
            isBreaking
              ? "border-destructive/50 bg-destructive/5"
              : isHigh
                ? "border-primary/30 bg-primary/5"
                : "border-border bg-card",
          )}
        >
          {/* Priority side stripe */}
          {isBreaking && <div className="absolute top-0 left-0 w-1 h-full bg-destructive" />}
          {!isBreaking && isHigh && (
            <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
          )}

          <div className="flex items-start justify-between gap-4 mb-3">
            <div className="flex items-center gap-2 flex-wrap">
              <TeamBadge
                abbreviation={alert.teamAbbreviation}
                primaryColor={alert.teamPrimaryColor}
                size="sm"
              />

              <div className="flex items-center gap-1.5 flex-wrap text-xs font-mono">
                {/* Breaking pulse */}
                {isBreaking && (
                  <span className="flex items-center gap-1.5 text-destructive font-bold">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-destructive" />
                    </span>
                    BREAKING
                  </span>
                )}

                {/* High Impact badge */}
                {!isBreaking && isHigh && (
                  <span className="flex items-center gap-1 text-primary font-bold">
                    <Zap className="h-3 w-3" />
                    HIGH IMPACT
                  </span>
                )}

                {/* Sport pill */}
                {alert.sport && (
                  <span
                    className={cn(
                      "rounded border px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                      SPORT_PILL[alert.sport] ?? "bg-muted text-muted-foreground border-border",
                    )}
                  >
                    {alert.sport.toUpperCase()}
                  </span>
                )}

                {/* Category badge */}
                <span
                  className={cn(
                    "flex items-center gap-1 rounded border px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                    catMeta.className,
                  )}
                >
                  <CatIcon className="h-2.5 w-2.5" />
                  {catMeta.label}
                </span>

                {/* Team name */}
                <span className="text-muted-foreground uppercase tracking-wider hidden sm:inline">
                  {alert.teamCity} {alert.teamName}
                </span>
              </div>
            </div>

            <time className="text-xs text-muted-foreground whitespace-nowrap font-mono shrink-0">
              {formatDistanceToNow(new Date(alert.publishedAt), { addSuffix: true })}
            </time>
          </div>

          <h3
            className={cn(
              "font-semibold leading-tight tracking-tight mb-2 uppercase",
              isBreaking ? "text-lg md:text-xl text-foreground" : "text-base",
            )}
          >
            {alert.headline}
          </h3>

          {alert.summary && (
            <p className="text-sm text-muted-foreground line-clamp-2">{alert.summary}</p>
          )}

          {/* Fantasy/betting signal footer for high-value items */}
          {(isBreaking || isHigh) &&
            (alert.category === "injury_report" || alert.category === "transaction" || alert.category === "disciplinary") && (
              <div className="mt-3 pt-2 border-t border-border/50 flex items-center gap-3">
                {alert.category === "injury_report" && (
                  <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                    <Activity className="h-3 w-3 text-red-400" /> Fantasy/Betting Relevant
                  </span>
                )}
                {alert.category === "transaction" && (
                  <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                    <ArrowLeftRight className="h-3 w-3 text-violet-400" /> Roster Impact
                  </span>
                )}
                {alert.category === "disciplinary" && (
                  <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3 text-amber-400" /> Availability Risk
                  </span>
                )}
              </div>
            )}
        </div>
      </Link>
    </motion.div>
  );
}
