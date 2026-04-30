import { useState } from "react";
import { Brain, Loader2, RefreshCcw } from "lucide-react";
import { Layout } from "@/components/layout";
import { InsightCard } from "@/components/insight-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useListInsights,
  useGenerateInsights,
  getListInsightsQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export default function Analyst() {
  const [filter, setFilter] = useState<string>("all");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: insights, isLoading } = useListInsights(
    { limit: 50 },
    { query: { refetchInterval: 60_000 } },
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

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight uppercase flex items-center gap-2">
              <Brain className="h-6 w-6 text-primary" />
              Analyst Desk
            </h1>
            <p className="text-muted-foreground text-sm font-mono mt-1">
              AI-generated trends, predictions & matchup intel from live news
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
              <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
                Insights are generated automatically every 30 minutes from the
                latest team news. Hit "Run Analyst" to trigger one now.
              </p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
