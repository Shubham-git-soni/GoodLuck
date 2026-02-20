"use client";

import { useEffect, useState } from "react";
import { Heart, TrendingUp, AlertTriangle } from "lucide-react";
import PageContainer from "@/components/layouts/PageContainer";
import PageHeader from "@/components/layouts/PageHeader";
import StatsCard from "@/components/dashboard/StatsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DashboardSkeleton } from "@/components/ui/skeleton-loaders";

import schoolsData from "@/lib/mock-data/schools.json";

export default function LoyaltyReportsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [loyaltyData, setLoyaltyData] = useState<any>({});

  useEffect(() => {
    setTimeout(() => {
      // Categorize schools based on business history
      const threeYearLoyal = schoolsData.filter((s) => {
        const history = s.businessHistory;
        return history.length >= 3 && history.every((h) => h.revenue > 0);
      });

      const twoYearLoyal = schoolsData.filter((s) => {
        const history = s.businessHistory;
        return (
          history.length >= 2 &&
          history.slice(-2).every((h) => h.revenue > 0) &&
          !threeYearLoyal.includes(s)
        );
      });

      const churnRisk = schoolsData.filter((s) => {
        const history = s.businessHistory;
        if (history.length < 2) return false;
        const lastYear = history[history.length - 1];
        const prevYear = history[history.length - 2];
        return lastYear.revenue < prevYear.revenue * 0.7; // 30% drop
      });

      setLoyaltyData({
        threeYearLoyal,
        twoYearLoyal,
        churnRisk,
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
        title="Loyalty Reports"
        description="Customer loyalty and retention analysis"
      />

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <StatsCard
          title="3-Year Loyal"
          value={loyaltyData.threeYearLoyal.length}
          description="Consistent revenue"
          icon={Heart}
        />
        <StatsCard
          title="2-Year Loyal"
          value={loyaltyData.twoYearLoyal.length}
          description="Growing relationship"
          icon={TrendingUp}
        />
        <StatsCard
          title="Churn Risk"
          value={loyaltyData.churnRisk.length}
          description="Revenue declining"
          icon={AlertTriangle}
        />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="3year">
        <TabsList>
          <TabsTrigger value="3year">
            3-Year Loyal ({loyaltyData.threeYearLoyal.length})
          </TabsTrigger>
          <TabsTrigger value="2year">
            2-Year Loyal ({loyaltyData.twoYearLoyal.length})
          </TabsTrigger>
          <TabsTrigger value="churn">
            Churn Risk ({loyaltyData.churnRisk.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="3year" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>3-Year Loyal Schools</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {loyaltyData.threeYearLoyal.map((school: any) => (
                  <Card key={school.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold">{school.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {school.city} • {school.board}
                          </p>
                          <div className="flex gap-3 mt-2 text-xs">
                            {school.businessHistory.map((h: any) => (
                              <span key={h.year}>
                                {h.year}: ₹{(h.revenue / 100000).toFixed(1)}L
                              </span>
                            ))}
                          </div>
                        </div>
                        <Badge variant="default">Loyal</Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="2year" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>2-Year Loyal Schools</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {loyaltyData.twoYearLoyal.map((school: any) => (
                  <Card key={school.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold">{school.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {school.city} • {school.board}
                          </p>
                          <div className="flex gap-3 mt-2 text-xs">
                            {school.businessHistory.slice(-2).map((h: any) => (
                              <span key={h.year}>
                                {h.year}: ₹{(h.revenue / 100000).toFixed(1)}L
                              </span>
                            ))}
                          </div>
                        </div>
                        <Badge variant="secondary">Growing</Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="churn" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Churn Risk Schools</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {loyaltyData.churnRisk.map((school: any) => (
                  <Card key={school.id} className="border-destructive/50">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold">{school.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {school.city} • {school.board}
                          </p>
                          <div className="flex gap-3 mt-2 text-xs">
                            {school.businessHistory.map((h: any) => (
                              <span key={h.year}>
                                {h.year}: ₹{(h.revenue / 100000).toFixed(1)}L
                              </span>
                            ))}
                          </div>
                        </div>
                        <Badge variant="destructive">At Risk</Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}
