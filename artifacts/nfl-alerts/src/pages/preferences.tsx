import { useState, useEffect } from "react";
import { Layout } from "@/components/layout";
import { useClientId } from "@/hooks/use-client-id";
import { useGetPreferences, useUpdatePreferences, useListTeams } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { TeamBadge } from "@/components/team-badge";
import { useToast } from "@/hooks/use-toast";
import { Settings, Save } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSport } from "@/hooks/use-sport";

const CATEGORIES = [
  { id: "player_update", label: "Player Updates", desc: "Injuries, trades, signings, depth chart, props & performance" },
  { id: "team_update", label: "Team Updates", desc: "Standings, results, scheme, front office & matchup news" },
  { id: "coaching_update", label: "Coaching Updates", desc: "Hires, fires, coordinator changes & playcaller news" },
  { id: "general", label: "General News", desc: "Stadium, ownership, league-wide and miscellaneous" },
];

const SPORT_HEADER: Record<string, string> = {
  nfl: "NFL",
  mlb: "MLB",
  nba: "NBA",
};
const SPORT_ORDER: Record<string, number> = { nfl: 0, mlb: 1, nba: 2 };

export default function Preferences() {
  const clientId = useClientId();
  const { toast } = useToast();
  
  const { sportParam } = useSport();
  const { data: teams, isLoading: isTeamsLoading } = useListTeams({ sport: sportParam });
  const { data: prefs, isLoading: isPrefsLoading } = useGetPreferences(
    { clientId: clientId || "" },
    { query: { enabled: !!clientId } }
  );

  const updatePrefs = useUpdatePreferences();

  const [followedTeams, setFollowedTeams] = useState<Set<string>>(new Set());
  const [enabledCategories, setEnabledCategories] = useState<Set<string>>(new Set(CATEGORIES.map(c => c.id)));

  useEffect(() => {
    if (prefs) {
      setFollowedTeams(new Set(prefs.followedTeamIds));
      setEnabledCategories(new Set(prefs.categoriesEnabled));
    }
  }, [prefs]);

  const toggleTeam = (teamId: string) => {
    const newSet = new Set(followedTeams);
    if (newSet.has(teamId)) {
      newSet.delete(teamId);
    } else {
      newSet.add(teamId);
    }
    setFollowedTeams(newSet);
  };

  const toggleCategory = (catId: string) => {
    const newSet = new Set(enabledCategories);
    if (newSet.has(catId)) {
      newSet.delete(catId);
    } else {
      newSet.add(catId);
    }
    setEnabledCategories(newSet);
  };

  const handleSave = () => {
    if (!clientId) return;
    
    updatePrefs.mutate(
      { 
        data: {
          clientId,
          followedTeamIds: Array.from(followedTeams),
          categoriesEnabled: Array.from(enabledCategories)
        }
      },
      {
        onSuccess: () => {
          toast({
            title: "Preferences Saved",
            description: "Your terminal feed has been updated.",
          });
        },
        onError: () => {
          toast({
            title: "Error",
            description: "Failed to save preferences.",
            variant: "destructive"
          });
        }
      }
    );
  };

  const isLoaded = !isTeamsLoading && !isPrefsLoading && teams && clientId;

  return (
    <Layout>
      <div className="flex flex-col gap-6 max-w-4xl mx-auto">
        <div className="flex items-center gap-3 border-b border-border pb-4">
          <div className="h-10 w-10 bg-primary/10 rounded flex items-center justify-center text-primary">
            <Settings className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight uppercase">Terminal Preferences</h1>
            <p className="text-muted-foreground text-sm font-mono mt-1">Configure your alert feeds and filters</p>
          </div>
        </div>

        {!isLoaded ? (
          <div className="space-y-6">
            <Skeleton className="h-[200px] w-full" />
            <Skeleton className="h-[400px] w-full" />
          </div>
        ) : (
          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="uppercase tracking-wide">Alert Categories</CardTitle>
                <CardDescription>Select which types of news you want to see on your dashboard.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-6">
                {CATEGORIES.map(category => (
                  <div key={category.id} className="flex items-center justify-between space-x-2">
                    <Label htmlFor={`cat-${category.id}`} className="flex flex-col space-y-1 cursor-pointer">
                      <span className="font-semibold uppercase tracking-wider">{category.label}</span>
                      <span className="font-normal text-muted-foreground text-sm">{category.desc}</span>
                    </Label>
                    <Switch
                      id={`cat-${category.id}`}
                      checked={enabledCategories.has(category.id)}
                      onCheckedChange={() => toggleCategory(category.id)}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="uppercase tracking-wide">Followed Teams</CardTitle>
                    <CardDescription>Select teams to prioritize in your "My Teams" feed.</CardDescription>
                  </div>
                  <div className="text-sm font-mono text-muted-foreground bg-muted px-2 py-1 rounded">
                    {followedTeams.size} Selected
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {Object.entries(
                  teams.reduce((acc, t) => {
                    const k = t.sport ?? "nfl";
                    (acc[k] ||= []).push(t);
                    return acc;
                  }, {} as Record<string, typeof teams>),
                )
                  .sort(([a], [b]) => (SPORT_ORDER[a] ?? 99) - (SPORT_ORDER[b] ?? 99))
                  .map(([sportKey, sportTeams]) => (
                    <div key={sportKey}>
                      <h3 className="text-xs font-bold font-mono uppercase tracking-[0.2em] text-muted-foreground mb-3">
                        {SPORT_HEADER[sportKey] ?? sportKey.toUpperCase()} · {sportTeams.length} teams
                      </h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {sportTeams.map((team) => {
                          const isSelected = followedTeams.has(team.id);
                          return (
                            <button
                              key={team.id}
                              onClick={() => toggleTeam(team.id)}
                              className={cn(
                                "flex flex-col items-center justify-center p-3 rounded-md border transition-all",
                                isSelected
                                  ? "border-primary bg-primary/5 ring-1 ring-primary"
                                  : "border-border bg-card hover:bg-muted/50 hover:border-muted-foreground/50",
                              )}
                            >
                              <TeamBadge
                                abbreviation={team.abbreviation}
                                primaryColor={team.primaryColor}
                                size="md"
                                className="mb-2 shadow-md"
                              />
                              <span className="text-xs font-bold uppercase tracking-wider">{team.city}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
              </CardContent>
            </Card>

            <div className="flex justify-end sticky bottom-6 z-10 pt-4">
              <Button 
                onClick={handleSave} 
                disabled={updatePrefs.isPending}
                size="lg"
                className="font-mono shadow-lg shadow-primary/20"
              >
                <Save className="mr-2 h-4 w-4" />
                {updatePrefs.isPending ? "SAVING..." : "SAVE PREFERENCES"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
