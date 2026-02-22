import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  ExternalLink,
  RefreshCw,
  Shield,
  XCircle,
  Info,
  Zap,
} from "lucide-react";

function SeverityBadge({ severity }: { severity: string }) {
  if (severity === "critical") return <Badge variant="destructive" className="gap-1"><XCircle className="h-3 w-3" />Critical</Badge>;
  if (severity === "warning") return <Badge className="gap-1 bg-amber-500 hover:bg-amber-600"><AlertTriangle className="h-3 w-3" />Warning</Badge>;
  return <Badge variant="secondary" className="gap-1"><Info className="h-3 w-3" />Info</Badge>;
}

function SourceBadge({ source }: { source: string }) {
  const colors: Record<string, string> = {
    CMS: "bg-blue-100 text-blue-800 border-blue-200",
    SAMHSA: "bg-green-100 text-green-800 border-green-200",
    LEXISNEXIS: "bg-purple-100 text-purple-800 border-purple-200",
    WESTLAW: "bg-orange-100 text-orange-800 border-orange-200",
    MANUAL: "bg-gray-100 text-gray-800 border-gray-200",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${colors[source] ?? colors.MANUAL}`}>
      {source}
    </span>
  );
}

function StatusIcon({ status }: { status: string }) {
  if (status === "success") return <CheckCircle className="h-4 w-4 text-green-500" />;
  if (status === "failed") return <XCircle className="h-4 w-4 text-red-500" />;
  return <AlertTriangle className="h-4 w-4 text-amber-500" />;
}

export default function ComplianceMonitor() {
  const [syncing, setSyncing] = useState(false);

  const { data: summary, refetch: refetchSummary } = trpc.compliance.getSummary.useQuery();
  const { data: alerts, refetch: refetchAlerts } = trpc.compliance.getAlerts.useQuery();
  const { data: syncLogs, refetch: refetchLogs } = trpc.compliance.getSyncLogs.useQuery();
  const { data: policyUpdates, refetch: refetchPolicies } = trpc.compliance.getPolicyUpdates.useQuery();

  const triggerSync = trpc.compliance.triggerSync.useMutation({
    onSuccess: (data) => {
      const totalChanges = data.results.reduce((sum: number, r: any) => sum + r.changesDetected, 0);
      toast.success(`Sync complete — ${totalChanges} new compliance changes detected.`);
      refetchSummary();
      refetchAlerts();
      refetchLogs();
      refetchPolicies();
      setSyncing(false);
    },
    onError: (err) => {
      toast.error(`Sync failed: ${err.message}`);
      setSyncing(false);
    },
  });

  const dismissAlertMutation = trpc.compliance.dismissAlert.useMutation({
    onSuccess: () => {
      refetchAlerts();
      refetchSummary();
    },
  });

  const handleSync = () => {
    setSyncing(true);
    triggerSync.mutate();
  };

  const formatDate = (d: Date | string | null | undefined) => {
    if (!d) return "Never";
    return new Date(d).toLocaleString();
  };

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="h-6 w-6 text-teal-600" />
            Compliance Monitor
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Automated monitoring from CMS and SAMHSA public feeds. Syncs daily at 02:00 UTC.
          </p>
        </div>
        <Button onClick={handleSync} disabled={syncing} className="gap-2">
          <RefreshCw className={`h-4 w-4 ${syncing ? "animate-spin" : ""}`} />
          {syncing ? "Syncing..." : "Run Sync Now"}
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-red-600">{summary?.criticalAlerts ?? 0}</div>
            <div className="text-sm text-muted-foreground">Critical Alerts</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-amber-600">{summary?.warningAlerts ?? 0}</div>
            <div className="text-sm text-muted-foreground">Warnings</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-blue-600">{summary?.unreadPolicyUpdates ?? 0}</div>
            <div className="text-sm text-muted-foreground">Unread Updates</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-sm font-medium flex items-center gap-1 text-muted-foreground">
              <Clock className="h-3 w-3" /> Last Sync
            </div>
            <div className="text-sm font-semibold mt-1">{formatDate(summary?.lastSyncAt)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Integration Status */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Zap className="h-4 w-4" /> Data Source Integrations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {summary?.integrations && Object.entries(summary.integrations).map(([key, val]: [string, any]) => (
              <div key={key} className={`flex items-center gap-2 p-3 rounded-lg border ${val.enabled ? "bg-green-50 border-green-200" : "bg-gray-50 border-gray-200"}`}>
                {val.enabled
                  ? <CheckCircle className="h-4 w-4 text-green-600 shrink-0" />
                  : <XCircle className="h-4 w-4 text-gray-400 shrink-0" />}
                <div>
                  <div className="text-xs font-medium">{val.label}</div>
                  <div className={`text-xs ${val.enabled ? "text-green-600" : "text-gray-400"}`}>
                    {val.enabled ? "Active" : "API key required"}
                  </div>
                </div>
              </div>
            ))}
          </div>
          {!summary?.integrations?.lexisNexis?.enabled && (
            <p className="text-xs text-muted-foreground mt-3">
              To enable LexisNexis and Westlaw monitoring, add <code className="bg-muted px-1 rounded">LEXISNEXIS_API_KEY</code>, <code className="bg-muted px-1 rounded">WESTLAW_API_KEY</code>, and <code className="bg-muted px-1 rounded">WESTLAW_CLIENT_ID</code> in Settings → Secrets.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="alerts">
        <TabsList>
          <TabsTrigger value="alerts">
            Active Alerts {alerts && alerts.length > 0 && <span className="ml-1.5 bg-red-500 text-white text-xs rounded-full px-1.5">{alerts.length}</span>}
          </TabsTrigger>
          <TabsTrigger value="policies">Policy Updates</TabsTrigger>
          <TabsTrigger value="logs">Sync History</TabsTrigger>
        </TabsList>

        {/* Alerts Tab */}
        <TabsContent value="alerts" className="space-y-3 mt-4">
          {!alerts || alerts.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center text-muted-foreground">
                <CheckCircle className="h-10 w-10 mx-auto mb-3 text-green-500" />
                <p className="font-medium">No active compliance alerts</p>
                <p className="text-sm">All monitored regulations are current.</p>
              </CardContent>
            </Card>
          ) : alerts.map((alert: any) => (
            <Card key={alert.id} className={`border-l-4 ${alert.severity === "critical" ? "border-l-red-500" : alert.severity === "warning" ? "border-l-amber-500" : "border-l-blue-400"}`}>
              <CardContent className="pt-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <SeverityBadge severity={alert.severity} />
                      <SourceBadge source={alert.source} />
                      <span className="text-xs text-muted-foreground">{alert.category.replace(/_/g, " ")}</span>
                    </div>
                    <p className="font-medium text-sm">{alert.title}</p>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-3">{alert.description}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                      <span>{formatDate(alert.createdAt)}</span>
                      {alert.sourceUrl && (
                        <a href={alert.sourceUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-teal-600 hover:underline">
                          <ExternalLink className="h-3 w-3" /> Source
                        </a>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => dismissAlertMutation.mutate({ alertId: alert.id })}
                    className="shrink-0 text-muted-foreground hover:text-foreground"
                  >
                    Dismiss
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Policy Updates Tab */}
        <TabsContent value="policies" className="space-y-3 mt-4">
          {!policyUpdates || policyUpdates.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center text-muted-foreground">
                <Info className="h-10 w-10 mx-auto mb-3 text-blue-400" />
                <p className="font-medium">No policy updates yet</p>
                <p className="text-sm">Run a sync to fetch the latest CMS and SAMHSA updates.</p>
              </CardContent>
            </Card>
          ) : policyUpdates.map((update: any) => (
            <Card key={update.id}>
              <CardContent className="pt-4">
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <SourceBadge source={update.source} />
                      {update.category && <span className="text-xs text-muted-foreground">{update.category.replace(/_/g, " ")}</span>}
                      {!update.isRead && <Badge variant="secondary" className="text-xs">New</Badge>}
                    </div>
                    <p className="font-medium text-sm">{update.title}</p>
                    {update.summary && <p className="text-sm text-muted-foreground mt-1 line-clamp-3">{update.summary}</p>}
                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                      <span>{formatDate(update.publishedAt)}</span>
                      {update.sourceUrl && (
                        <a href={update.sourceUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-teal-600 hover:underline">
                          <ExternalLink className="h-3 w-3" /> Read More
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Sync Logs Tab */}
        <TabsContent value="logs" className="mt-4">
          <Card>
            <CardContent className="pt-4">
              {!syncLogs || syncLogs.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">
                  <Clock className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                  <p>No sync history yet. Run a sync to see results.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-muted-foreground text-xs">
                        <th className="text-left pb-2 pr-4">Status</th>
                        <th className="text-left pb-2 pr-4">Source</th>
                        <th className="text-left pb-2 pr-4">Type</th>
                        <th className="text-right pb-2 pr-4">Checked</th>
                        <th className="text-right pb-2 pr-4">Updated</th>
                        <th className="text-right pb-2 pr-4">Changes</th>
                        <th className="text-left pb-2">Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {syncLogs.map((log: any) => (
                        <tr key={log.id} className="border-b last:border-0">
                          <td className="py-2 pr-4"><StatusIcon status={log.status} /></td>
                          <td className="py-2 pr-4"><SourceBadge source={log.source} /></td>
                          <td className="py-2 pr-4 text-muted-foreground">{log.syncType.replace(/_/g, " ")}</td>
                          <td className="py-2 pr-4 text-right">{log.recordsChecked}</td>
                          <td className="py-2 pr-4 text-right">{log.recordsUpdated}</td>
                          <td className="py-2 pr-4 text-right font-medium text-teal-600">{log.changesDetected}</td>
                          <td className="py-2 text-muted-foreground text-xs">{formatDate(log.syncedAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
