"use client";

import { useEffect, useState } from "react";
import { BookOpen, TrendingDown, TrendingUp } from "lucide-react";
import PageContainer from "@/components/layouts/PageContainer";
import PageHeader from "@/components/layouts/PageHeader";
import StatsCard from "@/components/dashboard/StatsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { DashboardSkeleton } from "@/components/ui/skeleton-loaders";

import specimensData from "@/lib/mock-data/specimens.json";
import salesmenData from "@/lib/mock-data/salesmen.json";

export default function SpecimenTrackingPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<any>({});

  useEffect(() => {
    setTimeout(() => {
      const totalBudget = salesmenData.reduce((sum, s) => sum + s.specimenBudget, 0);
      const totalUsed = salesmenData.reduce((sum, s) => sum + s.specimenUsed, 0);
      const totalStock = specimensData.reduce((sum, s) => sum + s.stockAvailable, 0);

      const bySalesman = salesmenData.map((sm) => ({
        name: sm.name,
        budget: sm.specimenBudget,
        used: sm.specimenUsed,
        remaining: sm.specimenBudget - sm.specimenUsed,
        percentage: Math.round((sm.specimenUsed / sm.specimenBudget) * 100),
      }));

      setStats({
        totalBudget,
        totalUsed,
        totalRemaining: totalBudget - totalUsed,
        totalStock,
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
        title="Specimen Tracking"
        description="Monitor specimen inventory and budget utilization"
      />

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <StatsCard
          title="Total Budget"
          value={`₹${(stats.totalBudget / 100000).toFixed(1)}L`}
          icon={BookOpen}
        />
        <StatsCard
          title="Used"
          value={`₹${(stats.totalUsed / 100000).toFixed(1)}L`}
          description={`${Math.round((stats.totalUsed / stats.totalBudget) * 100)}% utilized`}
          icon={TrendingDown}
        />
        <StatsCard
          title="Remaining"
          value={`₹${(stats.totalRemaining / 100000).toFixed(1)}L`}
          icon={TrendingUp}
        />
        <StatsCard
          title="Total Stock"
          value={stats.totalStock}
          description="Books available"
          icon={BookOpen}
        />
      </div>

      {/* Salesman-wise Tracking */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Salesman-wise Specimen Budget</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.bySalesman.map((sm: any, index: number) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{sm.name}</p>
                    <p className="text-sm text-muted-foreground">
                      ₹{(sm.used / 100000).toFixed(2)}L / ₹{(sm.budget / 100000).toFixed(2)}L
                    </p>
                  </div>
                  <Badge
                    variant={
                      sm.percentage >= 80
                        ? "destructive"
                        : sm.percentage >= 50
                        ? "secondary"
                        : "outline"
                    }
                  >
                    {sm.percentage}%
                  </Badge>
                </div>
                <Progress value={sm.percentage} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Specimen Inventory */}
      <Card>
        <CardHeader>
          <CardTitle>Specimen Inventory</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {specimensData.slice(0, 10).map((specimen) => (
              <div key={specimen.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <p className="font-medium">{specimen.bookName}</p>
                  <p className="text-sm text-muted-foreground">
                    Class {specimen.class} • {specimen.subject}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium">{specimen.stockAvailable} books</p>
                  <p className="text-xs text-muted-foreground">MRP: ₹{specimen.mrp}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
