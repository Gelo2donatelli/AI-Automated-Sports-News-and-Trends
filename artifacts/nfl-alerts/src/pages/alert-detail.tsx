import { useParams, Link } from "wouter";
import { Layout } from "@/components/layout";
import { useGetAlert } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { TeamBadge } from "@/components/team-badge";
import { ArrowLeft, ExternalLink, Clock, Tag } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export default function AlertDetail() {
  const { alertId } = useParams();

  const { data: alert, isLoading } = useGetAlert(alertId || "", {
    query: { enabled: !!alertId }
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="space-y-6">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-64 w-full rounded-md" />
        </div>
      </Layout>
    );
  }

  if (!alert) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold">Alert not found</h2>
          <Link href="/" className="text-primary hover:underline mt-4 inline-block">
            Back to Live Feed
          </Link>
        </div>
      </Layout>
    );
  }

  const isBreaking = alert.priority === "breaking";
  const isHigh = alert.priority === "high";

  return (
    <Layout>
      <div className="flex flex-col gap-6 max-w-3xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground w-fit">
          <ArrowLeft className="h-4 w-4" /> Back to Feed
        </Link>

        <div className={cn(
          "relative overflow-hidden rounded-md border bg-card",
          isBreaking ? "border-destructive/50" : "border-border"
        )}>
          {isBreaking && (
            <div className="absolute top-0 left-0 w-full h-1 bg-destructive" />
          )}
          {!isBreaking && isHigh && (
            <div className="absolute top-0 left-0 w-full h-1 bg-primary" />
          )}
          
          <div className="p-6 md:p-8">
            <div className="flex flex-wrap items-center gap-4 mb-6">
              <Link href={`/teams/${alert.teamId}`}>
                <TeamBadge 
                  abbreviation={alert.teamAbbreviation} 
                  primaryColor={alert.teamPrimaryColor} 
                  size="md"
                  className="hover:ring-2 hover:ring-offset-2 hover:ring-offset-background hover:ring-primary transition-all"
                />
              </Link>
              
              <div className="flex items-center gap-3 text-sm font-mono">
                {isBreaking && (
                  <span className="flex items-center gap-1.5 text-destructive font-bold">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-destructive"></span>
                    </span>
                    BREAKING
                  </span>
                )}
                
                <span className="flex items-center gap-1.5 text-muted-foreground uppercase">
                  <Tag className="h-3.5 w-3.5" />
                  {alert.category}
                </span>

                <span className="text-muted-foreground opacity-50">•</span>
                
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  {format(new Date(alert.publishedAt), "MMM d, yyyy 'at' h:mm a")}
                </span>
              </div>
            </div>

            <h1 className={cn(
              "font-bold uppercase tracking-tight mb-4",
              isBreaking ? "text-3xl md:text-4xl text-foreground" : "text-2xl md:text-3xl"
            )}>
              {alert.headline}
            </h1>

            {alert.summary && (
              <div className="prose prose-invert max-w-none text-muted-foreground mb-8">
                <p className="text-lg leading-relaxed">{alert.summary}</p>
              </div>
            )}

            <div className="pt-6 border-t border-border flex items-center justify-between">
              <div className="text-sm font-mono text-muted-foreground">
                Source: <span className="text-foreground">{alert.sourceName}</span>
              </div>
              
              {alert.sourceUrl && (
                <a 
                  href={alert.sourceUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                >
                  Read Full Source <ExternalLink className="h-4 w-4" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
