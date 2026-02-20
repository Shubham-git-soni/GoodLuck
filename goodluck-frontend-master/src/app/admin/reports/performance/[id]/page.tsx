"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, TrendingUp, Award } from "lucide-react";
import PageContainer from "@/components/layouts/PageContainer";
import PageHeader from "@/components/layouts/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProfileSkeleton } from "@/components/ui/skeleton-loaders";

import salesmenData from "@/lib/mock-data/salesmen.json";

export default function PerformanceKundliPage() {
  const params = useParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [salesman, setSalesman] = useState<any>(null);
  const [performanceData, setPerformanceData] = useState<any>({});

  useEffect(() => {
    setTimeout(() => {
      const sm = salesmenData.find((s) => s.id === params.id);
      if (sm) {
        setSalesman(sm);

        // Generate 5 years of performance data
        const yearlyPerformance = [
          { year: 2021, sales: 3200000, target: 4000000, achievement: 80 },
          { year: 2022, sales: 3800000, target: 4500000, achievement: 84 },
          { year: 2023, sales: 4200000, target: 5000000, achievement: 84 },
          { year: 2024, sales: 4500000, target: 5500000, achievement: 82 },
          { year: 2025, sales: sm.salesAchieved, target: sm.salesTarget, achievement: Math.round((sm.salesAchieved / sm.salesTarget) * 100) },
        ];

        const metrics = {
          salesVsExpenseRatio: 4.2,
          salesReturnRatio: 2.5,
          specimenUtilizationRatio: Math.round((sm.specimenUsed / sm.specimenBudget) * 100),
          jointWorkingImpact: 15, // % increase with joint working
        };

        setPerformanceData({
          yearlyPerformance,
          metrics,
          yearsOfService: new Date().getFullYear() - new Date(sm.joinedDate).getFullYear(),
        });
      }
      setIsLoading(false);
    }, 800);
  }, [params.id]);

  if (isLoading) {
    return (
      <PageContainer>
        <ProfileSkeleton />
      </PageContainer>
    );
  }

  if (!salesman) {
    return (
      <PageContainer>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Salesman not found</p>
          <Button onClick={() => router.back()} variant="outline" className="mt-4">
            Go Back
          </Button>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="mb-6">
        <Button variant="ghost" size="sm" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Team
        </Button>

        <PageHeader
          title={`Performance Kundli - ${salesman.name}`}
          description={`${performanceData.yearsOfService} years of service • ${salesman.region} Region`}
        />
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Sales vs Expense</p>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold">{performanceData.metrics.salesVsExpenseRatio}:1</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Sales Return Ratio</p>
              <Award className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold">{performanceData.metrics.salesReturnRatio}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Specimen Utilization</p>
              <Award className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold">{performanceData.metrics.specimenUtilizationRatio}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Joint Working Impact</p>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold text-green-600">+{performanceData.metrics.jointWorkingImpact}%</p>
          </CardContent>
        </Card>
      </div>

      {/* Yearly Performance */}
      <Card>
        <CardHeader>
          <CardTitle>5-Year Performance History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {performanceData.yearlyPerformance.map((year: any) => (
              <div key={year.year} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold">{year.year}</h3>
                    <Badge
                      variant={
                        year.achievement >= 85
                          ? "default"
                          : year.achievement >= 70
                          ? "secondary"
                          : "destructive"
                      }
                    >
                      {year.achievement}%
                    </Badge>
                  </div>
                  <div className="flex gap-6 text-sm text-muted-foreground">
                    <span>Sales: ₹{(year.sales / 100000).toFixed(1)}L</span>
                    <span>Target: ₹{(year.target / 100000).toFixed(1)}L</span>
                    <span>
                      Gap: ₹{((year.target - year.sales) / 100000).toFixed(1)}L
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
