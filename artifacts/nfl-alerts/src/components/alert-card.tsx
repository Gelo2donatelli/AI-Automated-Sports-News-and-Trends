import { Link } from "wouter";
import { formatDistanceToNow } from "date-fns";
import { Alert } from "@workspace/api-client-react/src/generated/api.schemas";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { TeamBadge } from "./team-badge";
import { motion } from "framer-motion";

interface AlertCardProps {
  alert: Alert;
  index?: number;
}

const SPORT_PILL: Record<string, string> = {
  nfl: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  mlb: "bg-sky-500/15 text-sky-400 border-sky-500/30",
  nba: "bg-orange-500/15 text-orange-400 border-orange-500/30",
};

export function AlertCard({ alert, index = 0 }: AlertCardProps) {
  const isBreaking = alert.priority === "breaking";
  const isHigh = alert.priority === "high";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="group"
    >
      <Link href={`/alerts/${alert.id}`} className="block">
        <div className={cn(
          "relative overflow-hidden rounded-md border p-4 transition-all hover:bg-muted/50",
          isBreaking ? "border-destructive/50 bg-destructive/5" : "border-border bg-card",
        )}>
          {isBreaking && (
            <div className="absolute top-0 left-0 w-1 h-full bg-destructive" />
          )}
          {!isBreaking && isHigh && (
            <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
          )}
          
          <div className="flex items-start justify-between gap-4 mb-3">
            <div className="flex items-center gap-3">
              <TeamBadge 
                abbreviation={alert.teamAbbreviation} 
                primaryColor={alert.teamPrimaryColor} 
                size="sm"
              />
              <div className="flex items-center gap-2 text-xs font-mono flex-wrap">
                {isBreaking && (
                  <span className="flex items-center gap-1.5 text-destructive font-bold">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-destructive"></span>
                    </span>
                    BREAKING
                  </span>
                )}
                {alert.sport && (
                  <span className={cn("rounded border px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider", SPORT_PILL[alert.sport] ?? "bg-muted text-muted-foreground border-border")}>
                    {alert.sport}
                  </span>
                )}
                <span className="text-muted-foreground uppercase tracking-wider">
                  {alert.teamCity} {alert.teamName}
                </span>
                <span className="text-muted-foreground opacity-50">•</span>
                <span className="text-muted-foreground uppercase tracking-wider">
                  {alert.category}
                </span>
              </div>
            </div>
            
            <time className="text-xs text-muted-foreground whitespace-nowrap font-mono shrink-0">
              {formatDistanceToNow(new Date(alert.publishedAt), { addSuffix: true })}
            </time>
          </div>

          <h3 className={cn(
            "font-semibold leading-tight tracking-tight mb-2 uppercase",
            isBreaking ? "text-lg md:text-xl" : "text-base"
          )}>
            {alert.headline}
          </h3>

          {alert.summary && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {alert.summary}
            </p>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
