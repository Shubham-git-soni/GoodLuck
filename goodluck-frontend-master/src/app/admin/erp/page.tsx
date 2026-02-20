"use client";

import { useState } from "react";
import { Database, Upload, CheckCircle, XCircle, Clock } from "lucide-react";
import PageContainer from "@/components/layouts/PageContainer";
import PageHeader from "@/components/layouts/PageHeader";
import StatsCard from "@/components/dashboard/StatsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function ERPIntegrationPage() {
  const [syncLogs] = useState([
    {
      id: "SYNC001",
      date: "2025-11-22T10:30:00",
      type: "Specimen Inventory",
      status: "Success",
      records: 120,
    },
    {
      id: "SYNC002",
      date: "2025-11-22T09:15:00",
      type: "Payment Data",
      status: "Success",
      records: 45,
    },
    {
      id: "SYNC003",
      date: "2025-11-21T18:30:00",
      type: "Sales Returns",
      status: "Success",
      records: 12,
    },
    {
      id: "SYNC004",
      date: "2025-11-21T15:45:00",
      type: "Credit Notes",
      status: "Failed",
      records: 0,
      error: "Connection timeout",
    },
  ]);

  const handleSync = (type: string) => {
    toast.success(`${type} sync initiated!`);
  };

  const successful = syncLogs.filter((s) => s.status === "Success").length;
  const failed = syncLogs.filter((s) => s.status === "Failed").length;

  return (
    <PageContainer>
      <PageHeader
        title="ERP Integration Console"
        description="Manage data synchronization with ERP system"
      />

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <StatsCard
          title="Total Syncs"
          value={syncLogs.length}
          icon={Database}
        />
        <StatsCard
          title="Successful"
          value={successful}
          icon={CheckCircle}
        />
        <StatsCard
          title="Failed"
          value={failed}
          icon={XCircle}
        />
        <StatsCard
          title="Last Sync"
          value="2 hours ago"
          icon={Clock}
        />
      </div>

      {/* Quick Sync Actions */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Quick Sync Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button onClick={() => handleSync("Specimen Inventory")} className="h-20 flex-col gap-2">
              <Database className="h-5 w-5" />
              <span>Sync Specimens</span>
            </Button>
            <Button onClick={() => handleSync("Payment Data")} className="h-20 flex-col gap-2">
              <Database className="h-5 w-5" />
              <span>Sync Payments</span>
            </Button>
            <Button onClick={() => handleSync("Sales Returns")} className="h-20 flex-col gap-2">
              <Database className="h-5 w-5" />
              <span>Sync Returns</span>
            </Button>
            <Button onClick={() => handleSync("Credit Notes")} className="h-20 flex-col gap-2">
              <Database className="h-5 w-5" />
              <span>Sync Credits</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Sync Logs */}
      <Card>
        <CardHeader>
          <CardTitle>Sync History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {syncLogs.map((log) => (
              <Card key={log.id} className={log.status === "Failed" ? "border-destructive/50" : ""}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-semibold">{log.type}</h3>
                        <Badge
                          variant={
                            log.status === "Success"
                              ? "default"
                              : "destructive"
                          }
                        >
                          {log.status === "Success" ? (
                            <CheckCircle className="h-3 w-3 mr-1" />
                          ) : (
                            <XCircle className="h-3 w-3 mr-1" />
                          )}
                          {log.status}
                        </Badge>
                      </div>
                      <div className="flex gap-4 text-sm text-muted-foreground">
                        <span>
                          {new Date(log.date).toLocaleString()}
                        </span>
                        <span>{log.records} records</span>
                      </div>
                      {log.error && (
                        <p className="text-xs text-destructive mt-2">Error: {log.error}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
