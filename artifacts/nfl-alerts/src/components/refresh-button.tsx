import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { 
  useRefreshAlerts, 
  getGetAlertFeedQueryKey,
  getGetOverviewStatsQueryKey,
  getGetTrendingTeamsQueryKey,
  getListAlertsQueryKey,
  getGetBreakingAlertsQueryKey
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function RefreshButton() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const refreshAlerts = useRefreshAlerts();

  const handleRefresh = () => {
    refreshAlerts.mutate(undefined, {
      onSuccess: (result) => {
        toast({
          title: "Refresh Complete",
          description: `Found ${result.newAlerts} new alerts across ${result.teamsRefreshed} teams.`,
        });
        
        // Invalidate all feed-related queries
        queryClient.invalidateQueries({ queryKey: getGetAlertFeedQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetOverviewStatsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetTrendingTeamsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getListAlertsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetBreakingAlertsQueryKey() });
      },
      onError: () => {
        toast({
          title: "Refresh Failed",
          description: "Could not fetch latest news. Will try again later.",
          variant: "destructive"
        });
      }
    });
  };

  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={handleRefresh}
      disabled={refreshAlerts.isPending}
      className="font-mono text-xs"
    >
      <RefreshCw className={`mr-2 h-3 w-3 ${refreshAlerts.isPending ? 'animate-spin' : ''}`} />
      {refreshAlerts.isPending ? 'REFRESHING...' : 'REFRESH FEED'}
    </Button>
  );
}
