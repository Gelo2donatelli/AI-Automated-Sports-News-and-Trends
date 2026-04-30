import { useSport, SPORT_LIST, SPORT_LABELS, type Sport } from "@/hooks/use-sport";
import { cn } from "@/lib/utils";

const SPORT_ACCENT: Record<Sport, string> = {
  all: "data-[active=true]:bg-foreground data-[active=true]:text-background",
  nfl: "data-[active=true]:bg-emerald-500 data-[active=true]:text-black",
  mlb: "data-[active=true]:bg-sky-500 data-[active=true]:text-black",
  nba: "data-[active=true]:bg-orange-500 data-[active=true]:text-black",
  nhl: "data-[active=true]:bg-cyan-400 data-[active=true]:text-black",
  ncaaf: "data-[active=true]:bg-yellow-500 data-[active=true]:text-black",
  ncaab: "data-[active=true]:bg-indigo-500 data-[active=true]:text-white",
  golf: "data-[active=true]:bg-teal-500 data-[active=true]:text-black",
};

export function SportTabs() {
  const { sport, setSport } = useSport();

  return (
    <div className="border-b border-border bg-card/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-1 py-2 overflow-x-auto">
          <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground mr-2 hidden sm:inline">
            Sport
          </span>
          {SPORT_LIST.map((s) => {
            const isActive = sport === s;
            return (
              <button
                key={s}
                type="button"
                data-active={isActive}
                onClick={() => setSport(s)}
                className={cn(
                  "rounded-md px-3 py-1 text-xs font-mono font-bold uppercase tracking-wider transition-colors",
                  "hover:bg-muted/50 text-muted-foreground",
                  SPORT_ACCENT[s],
                )}
              >
                {SPORT_LABELS[s]}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
