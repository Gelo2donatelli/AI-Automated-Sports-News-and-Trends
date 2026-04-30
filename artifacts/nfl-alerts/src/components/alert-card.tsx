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
  Trophy,
  ListOrdered,
  ShieldCheck,
  Newspaper,
  Globe,
  ExternalLink,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Source credibility tiers — mirrors the server classification in news-fetcher.ts
// ---------------------------------------------------------------------------
const TIER1_HOSTS = new Set([
  "nfl.com", "nba.com", "mlb.com", "nhl.com", "ncaa.com", "pgatour.com",
  "wnba.com", "mls.com", "ufc.com", "espn.com", "espnfc.com",
]);
const TIER2_HOSTS = new Set([
  "cbssports.com", "foxsports.com", "nbcsports.com",
  "profootballtalk.nbcsports.com", "theathletic.com", "si.com",
  "sportingnews.com", "bleacherreport.com", "yardbarker.com",
  "usatoday.com", "nypost.com", "washingtonpost.com",
  "nytimes.com", "reuters.com", "apnews.com", "sportsnet.ca",
  "tsn.ca", "thescore.com",
]);

function getSourceTier(sourceUrl: string, sourceName: string): 1 | 2 | 3 {
  let host = "";
  try { host = new URL(sourceUrl).hostname.replace(/^www\./, ""); } catch { /* noop */ }
  if (host) {
    if (TIER1_HOSTS.has(host) || [...TIER1_HOSTS].some(d => host.endsWith(`.${d}`))) return 1;
    if (TIER2_HOSTS.has(host) || [...TIER2_HOSTS].some(d => host.endsWith(`.${d}`))) return 2;
  }
  const sn = sourceName.toLowerCase();
  if (sn.includes("espn") || sn.includes("nfl.com") || sn.includes("nba.com")) return 1;
  if (sn.includes("cbs") || sn.includes("fox sports") || sn.includes("nbc sports") ||
    sn.includes("pro football talk") || sn.includes("the athletic") ||
    sn.includes("yardbarker") || sn.includes("sporting news")) return 2;
  return 3;
}

const TIER_META: Record<1 | 2 | 3, { label: string; icon: React.ElementType; className: string; title: string }> = {
  1: {
    label: "VERIFIED",
    icon: ShieldCheck,
    className: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
    title: "Tier 1 — Official or major verified outlet",
  },
  2: {
    label: "TRUSTED",
    icon: Newspaper,
    className: "text-sky-400 bg-sky-500/10 border-sky-500/30",
    title: "Tier 2 — Major national sports media",
  },
  3: {
    label: "UNVERIFIED",
    icon: Globe,
    className: "text-amber-400 bg-amber-500/10 border-amber-500/30",
    title: "Tier 3 — Blog or aggregator · Breaking withheld until confirmed",
  },
};

interface AlertCardProps {
  alert: Alert;
  index?: number;
}

const SPORT_PILL: Record<string, string> = {
  nfl: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  mlb: "bg-sky-500/15 text-sky-400 border-sky-500/30",
  nba: "bg-orange-500/15 text-orange-400 border-orange-500/30",
  nhl: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
  ncaaf: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  ncaab: "bg-indigo-500/15 text-indigo-400 border-indigo-500/30",
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
  lineup_update: {
    label: "LINEUP",
    icon: ListOrdered,
    className: "text-violet-400 bg-violet-500/10 border-violet-500/30",
  },
  game_result: {
    label: "FINAL",
    icon: Trophy,
    className: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
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
  const tier = getSourceTier(alert.sourceUrl ?? "", alert.sourceName ?? "");
  const tierMeta = TIER_META[tier];
  const TierIcon = tierMeta.icon;

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

          {/* Source credibility footer */}
          <div className="mt-2.5 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 min-w-0">
              <button
                type="button"
                onClick={e => { e.preventDefault(); e.stopPropagation(); if (alert.sourceUrl) window.open(alert.sourceUrl, "_blank", "noopener,noreferrer"); }}
                className="flex items-center gap-1 text-[10px] font-mono text-muted-foreground hover:text-foreground transition-colors truncate max-w-[200px] cursor-pointer"
              >
                <ExternalLink className="h-2.5 w-2.5 shrink-0" />
                {alert.sourceName ?? "Unknown"}
              </button>
            </div>
            <span
              title={tierMeta.title}
              className={cn(
                "flex items-center gap-1 rounded border px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider shrink-0",
                tierMeta.className,
              )}
            >
              <TierIcon className="h-2.5 w-2.5" />
              {tierMeta.label}
            </span>
          </div>

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
