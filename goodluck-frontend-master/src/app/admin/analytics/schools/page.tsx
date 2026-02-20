"use client";

import { useEffect, useState } from "react";
import { School, TrendingUp, AlertCircle, Users } from "lucide-react";
import PageContainer from "@/components/layouts/PageContainer";
import PageHeader from "@/components/layouts/PageHeader";
import StatsCard from "@/components/dashboard/StatsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { DashboardSkeleton } from "@/components/ui/skeleton-loaders";

import schoolsData from "@/lib/mock-data/schools.json";
import salesmenData from "@/lib/mock-data/salesmen.json";

export default function SchoolAnalyticsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [analytics, setAnalytics] = useState<any>({});

  useEffect(() => {
    setTimeout(() => {
      const total = schoolsData.length;
      const pattakat = schoolsData.filter((s) => s.isPattakat).length;
      const notVisited = schoolsData.filter((s) => s.visitCount === 0).length;
      const visitedOnce = schoolsData.filter((s) => s.visitCount === 1).length;
      const visitedTwicePlus = schoolsData.filter((s) => s.visitCount >= 2).length;

      const byBoard = schoolsData.reduce((acc: any, s) => {
        acc[s.board] = (acc[s.board] || 0) + 1;
        return acc;
      }, {});

      const bySalesman = salesmenData.map((sm) => {
        const assigned = schoolsData.filter((s) => s.assignedTo === sm.id);
        return {
          salesman: sm.name,
          total: assigned.length,
          pattakat: assigned.filter((s) => s.isPattakat).length,
          notVisited: assigned.filter((s) => s.visitCount === 0).length,
          visitedTwicePlus: assigned.filter((s) => s.visitCount >= 2).length,
        };
      });

      setAnalytics({
        total,
        pattakat,
        notVisited,
        visitedOnce,
        visitedTwicePlus,
        byBoard,
        bySalesman,
      });
      setIsLoading(false);
    }, 800);
  }, []);

  if (isLoading) {
    return (
      <PageContainer>
        <DashboardSkeleton />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="School Analytics"
        description="Analyze school portfolio and performance"
      />

      {/* Top Stats */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <StatsCard
          title="Total Schools"
          value={analytics.total}
          icon={School}
        />
        <StatsCard
          title="Pattakat Schools"
          value={analytics.pattakat}
          description={`${((analytics.pattakat / analytics.total) * 100).toFixed(1)}% of total`}
          icon={AlertCircle}
        />
        <StatsCard
          title="Not Visited"
          value={analytics.notVisited}
          description="Need first visit"
          icon={TrendingUp}
        />
        <StatsCard
          title="Visited 2+ Times"
          value={analytics.visitedTwicePlus}
          description="Regular engagement"
          icon={Users}
        />
      </div>

      {/* Visit Status Breakdown */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Visit Status Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Not Visited</span>
                <span className="text-sm text-muted-foreground">
                  {analytics.notVisited} schools ({((analytics.notVisited / analytics.total) * 100).toFixed(1)}%)
                </span>
              </div>
              <Progress value={(analytics.notVisited / analytics.total) * 100} className="h-2" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Visited Once</span>
                <span className="text-sm text-muted-foreground">
                  {analytics.visitedOnce} schools ({((analytics.visitedOnce / analytics.total) * 100).toFixed(1)}%)
                </span>
              </div>
              <Progress value={(analytics.visitedOnce / analytics.total) * 100} className="h-2" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Visited 2+ Times</span>
                <span className="text-sm text-muted-foreground">
                  {analytics.visitedTwicePlus} schools ({((analytics.visitedTwicePlus / analytics.total) * 100).toFixed(1)}%)
                </span>
              </div>
              <Progress value={(analytics.visitedTwicePlus / analytics.total) * 100} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Board-wise Distribution */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Board-wise Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(analytics.byBoard).map(([board, count]: [string, any]) => (
              <div key={board} className="flex items-center justify-between p-3 border rounded-lg">
                <span className="font-medium">{board}</span>
                <Badge variant="secondary">{count} schools</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Salesman-wise Analytics */}
      <Card>
        <CardHeader>
          <CardTitle>Salesman-wise School Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.bySalesman.map((sm: any, index: number) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-3">{sm.salesman}</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Total Schools</p>
                      <p className="text-lg font-bold">{sm.total}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Pattakat</p>
                      <p className="text-lg font-bold text-destructive">{sm.pattakat}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Not Visited</p>
                      <p className="text-lg font-bold text-orange-600">{sm.notVisited}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Visited 2+ Times</p>
                      <p className="text-lg font-bold text-green-600">{sm.visitedTwicePlus}</p>
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
