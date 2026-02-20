"use client";

import { useEffect, useState } from "react";
import { Calendar, TrendingUp } from "lucide-react";
import PageContainer from "@/components/layouts/PageContainer";
import PageHeader from "@/components/layouts/PageHeader";
import StatsCard from "@/components/dashboard/StatsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DashboardSkeleton } from "@/components/ui/skeleton-loaders";

import visitsData from "@/lib/mock-data/visits.json";
import salesmenData from "@/lib/mock-data/salesmen.json";

export default function VisitReportsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [reportData, setReportData] = useState<any>({});

  useEffect(() => {
    setTimeout(() => {
      const totalVisits = visitsData.length;
      const schoolVisits = visitsData.filter((v) => v.type === "school").length;
      const bookSellerVisits = visitsData.filter((v) => v.type === "bookseller").length;

      const bySalesman = salesmenData.map((sm) => {
        const smVisits = visitsData.filter((v) => v.salesmanId === sm.id);
        return {
          salesman: sm.name,
          totalVisits: smVisits.length,
          schoolVisits: smVisits.filter((v) => v.type === "school").length,
          bookSellerVisits: smVisits.filter((v) => v.type === "bookseller").length,
        };
      });

      setReportData({ totalVisits, schoolVisits, bookSellerVisits, bySalesman });
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
        title="Visit Reports"
        description="Comprehensive visit analytics and reports"
      />

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <StatsCard
          title="Total Visits"
          value={reportData.totalVisits}
          icon={Calendar}
        />
        <StatsCard
          title="School Visits"
          value={reportData.schoolVisits}
          description={`${((reportData.schoolVisits / reportData.totalVisits) * 100).toFixed(1)}%`}
          icon={TrendingUp}
        />
        <StatsCard
          title="Book Seller Visits"
          value={reportData.bookSellerVisits}
          description={`${((reportData.bookSellerVisits / reportData.totalVisits) * 100).toFixed(1)}%`}
          icon={TrendingUp}
        />
      </div>

      {/* Salesman-wise Report */}
      <Card>
        <CardHeader>
          <CardTitle>Salesman-wise Visit Report</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {reportData.bySalesman.map((sm: any, index: number) => (
              <Card key={index} className="hover:shadow-md transition-all">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold mb-2">{sm.salesman}</h3>
                      <div className="flex gap-4">
                        <div>
                          <p className="text-xs text-muted-foreground">Total Visits</p>
                          <p className="text-lg font-bold">{sm.totalVisits}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">School Visits</p>
                          <p className="text-lg font-bold text-blue-600">{sm.schoolVisits}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Bookseller Visits</p>
                          <p className="text-lg font-bold text-green-600">{sm.bookSellerVisits}</p>
                        </div>
                      </div>
                    </div>
                    <Badge>{sm.totalVisits} visits</Badge>
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
