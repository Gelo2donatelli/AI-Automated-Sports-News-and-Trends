import { useRef, useState } from "react";
import { useGetBreakingAlerts, type Alert } from "@workspace/api-client-react";
import { formatDistanceToNowStrict } from "date-fns";

const ALLOWED_CATEGORIES = new Set([
  "injury_report",
  "transaction",
  "disciplinary",
  "game_result",
  "lineup_update",
  "coaching_update",
  "coaching_change",
  "contract",
]);

const SPORT_LABEL: Record<string, string> = {
  nfl: "NFL",
  mlb: "MLB",
  nba: "NBA",
  ncaaf: "NCAA",
  golf: "GOLF",
};

function getTag(alert: Alert): { label: string; color: string } {
  if (alert.priority === "breaking") {
    return { label: "BREAKING", color: "bg-red-600 text-white" };
  }
  switch (alert.category) {
    case "injury_report":
      return { label: "INJURY", color: "bg-orange-500 text-black" };
    case "transaction":
      return { label: "TRADE", color: "bg-sky-500 text-black" };
    case "disciplinary":
      return { label: "SUSPENDED", color: "bg-amber-500 text-black" };
    case "game_result":
      return { label: "FINAL", color: "bg-emerald-500 text-black" };
    case "lineup_update":
      return { label: "LINEUP", color: "bg-violet-500 text-white" };
    case "coaching_update":
    case "coaching_change":
      return { label: "COACHING", color: "bg-purple-500 text-white" };
    case "contract":
      return { label: "SIGNING", color: "bg-teal-500 text-black" };
    default:
      return { label: "MAJOR", color: "bg-yellow-400 text-black" };
  }
}

function timeAgo(dateStr: string) {
  try {
    return formatDistanceToNowStrict(new Date(dateStr), { addSuffix: true });
  } catch {
    return "";
  }
}

function TickerItem({ alert }: { alert: Alert }) {
  const { label, color } = getTag(alert);
  const sport = SPORT_LABEL[alert.sport ?? ""] ?? (alert.sport ?? "").toUpperCase();

  return (
    <span className="inline-flex items-center gap-2 px-4 shrink-0">
      <span
        className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-bold tracking-wider ${color}`}
      >
        {label}
      </span>
      <span className="text-[11px] font-mono font-bold text-primary/80 shrink-0">
        {sport}
      </span>
      <span className="text-[11px] text-foreground/90 leading-tight max-w-[480px] truncate">
        {alert.headline}
      </span>
      <span className="text-[10px] text-muted-foreground shrink-0">
        — {alert.sourceName}
      </span>
      <span className="text-[10px] text-muted-foreground/60 shrink-0">
        {timeAgo(alert.publishedAt)}
      </span>
      <span className="text-muted-foreground/30 shrink-0 select-none ml-2">
        •
      </span>
    </span>
  );
}

export function BreakingTicker() {
  const [paused, setPaused] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);

  const { data: alerts } = useGetBreakingAlerts(
    {},
    { query: { refetchInterval: 60_000 } } as never,
  );

  const filtered = (alerts ?? []).filter((a) =>
    ALLOWED_CATEGORIES.has(a.category)
  );

  const empty = filtered.length === 0;
  const items = empty ? null : [...filtered, ...filtered];

  const duration = empty ? 0 : Math.max(20, filtered.length * 8);

  return (
    <div className="border-t border-border/60 bg-background/95 overflow-hidden h-7 flex items-center select-none">
      <style>{`
        @keyframes ticker-scroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .ticker-track {
          animation: ticker-scroll ${duration}s linear infinite;
        }
        .ticker-track.paused {
          animation-play-state: paused;
        }
      `}</style>

      {/* BREAKING label */}
      <div className="flex items-center gap-1.5 px-3 h-full bg-red-600 shrink-0 z-10">
        <span className="relative flex h-1.5 w-1.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white" />
        </span>
        <span className="text-[10px] font-mono font-black tracking-widest text-white uppercase">
          Breaking
        </span>
      </div>

      {/* Scrolling track */}
      <div
        className="flex-1 overflow-hidden h-full flex items-center"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {empty ? (
          <span className="px-4 text-[11px] font-mono text-muted-foreground/60 italic">
            Monitoring major sports news...
          </span>
        ) : (
          <div
            ref={trackRef}
            className={`ticker-track flex items-center whitespace-nowrap${paused ? " paused" : ""}`}
          >
            {items!.map((alert, i) => (
              <TickerItem key={`${alert.id}-${i}`} alert={alert} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
