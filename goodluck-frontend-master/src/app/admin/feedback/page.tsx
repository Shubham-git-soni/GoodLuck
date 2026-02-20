"use client";

import { useEffect, useState } from "react";
import { MessageSquare } from "lucide-react";
import PageContainer from "@/components/layouts/PageContainer";
import PageHeader from "@/components/layouts/PageHeader";
import StatsCard from "@/components/dashboard/StatsCard";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageSkeleton } from "@/components/ui/skeleton-loaders";
import { toast } from "sonner";

import feedbackData from "@/lib/mock-data/feedback.json";

export default function FeedbackManagerPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [feedback, setFeedback] = useState<any[]>([]);

  useEffect(() => {
    setTimeout(() => {
      setFeedback(feedbackData);
      setIsLoading(false);
    }, 800);
  }, []);

  const handleUpdateStatus = (id: string, newStatus: string) => {
    setFeedback((prev) =>
      prev.map((f) =>
        f.id === id
          ? { ...f, status: newStatus, responseDate: new Date().toISOString() }
          : f
      )
    );
    toast.success(`Feedback marked as ${newStatus}!`);
  };

  if (isLoading) {
    return (
      <PageContainer>
        <PageSkeleton />
      </PageContainer>
    );
  }

  const pending = feedback.filter((f) => f.status === "Pending");
  const inProgress = feedback.filter((f) => f.status === "Work in progress");
  const resolved = feedback.filter((f) => f.status === "Resolved");

  return (
    <PageContainer>
      <PageHeader
        title="Feedback Manager"
        description="Manage product feedback from sales team"
      />

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <StatsCard title="Pending" value={pending.length} icon={MessageSquare} />
        <StatsCard title="In Progress" value={inProgress.length} icon={MessageSquare} />
        <StatsCard title="Resolved" value={resolved.length} icon={MessageSquare} />
        <StatsCard title="Total Feedback" value={feedback.length} icon={MessageSquare} />
      </div>

      {/* Feedback Tabs */}
      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">Pending ({pending.length})</TabsTrigger>
          <TabsTrigger value="inProgress">In Progress ({inProgress.length})</TabsTrigger>
          <TabsTrigger value="resolved">Resolved ({resolved.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-6 space-y-3">
          {pending.map((fb) => (
            <Card key={fb.id}>
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{fb.schoolName}</h3>
                        <Badge variant="secondary">{fb.category}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        From: {fb.salesmanName} • {new Date(fb.date).toLocaleDateString()}
                      </p>
                      <p className="text-sm">{fb.comment}</p>
                    </div>
                    <Badge variant="outline">{fb.status}</Badge>
                  </div>
                  <div className="flex gap-2 pt-3 border-t">
                    <Select onValueChange={(value) => handleUpdateStatus(fb.id, value)}>
                      <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Update status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Acknowledged">Acknowledged</SelectItem>
                        <SelectItem value="Work in progress">Work in Progress</SelectItem>
                        <SelectItem value="Resolved">Resolved</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="inProgress" className="mt-6 space-y-3">
          {inProgress.map((fb) => (
            <Card key={fb.id}>
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{fb.schoolName}</h3>
                        <Badge variant="secondary">{fb.category}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        From: {fb.salesmanName}
                      </p>
                      <p className="text-sm">{fb.comment}</p>
                      {fb.response && (
                        <div className="mt-2 p-2 bg-muted rounded text-xs">
                          <p className="font-medium">Response:</p>
                          <p>{fb.response}</p>
                        </div>
                      )}
                    </div>
                    <Badge>{fb.status}</Badge>
                  </div>
                  <Button size="sm" onClick={() => handleUpdateStatus(fb.id, "Resolved")}>
                    Mark as Resolved
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="resolved" className="mt-6 space-y-3">
          {resolved.map((fb) => (
            <Card key={fb.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{fb.schoolName}</h3>
                      <Badge variant="secondary">{fb.category}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {fb.salesmanName} • {new Date(fb.date).toLocaleDateString()}
                    </p>
                    <p className="text-sm">{fb.comment}</p>
                    {fb.response && (
                      <div className="mt-2 p-2 bg-muted rounded text-xs">
                        <p className="font-medium">Response:</p>
                        <p>{fb.response}</p>
                      </div>
                    )}
                  </div>
                  <Badge variant="default">{fb.status}</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}
