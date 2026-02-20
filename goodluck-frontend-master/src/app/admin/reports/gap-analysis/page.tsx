"use client";

import { AlertTriangle, TrendingDown, CheckCircle } from "lucide-react";
import PageContainer from "@/components/layouts/PageContainer";
import PageHeader from "@/components/layouts/PageHeader";
import StatsCard from "@/components/dashboard/StatsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import visitsData from "@/lib/mock-data/visits.json";
import schoolsData from "@/lib/mock-data/schools.json";

export default function GapAnalysisPage() {
  // Analyze gaps between planned and actual specimen distribution
  const gapAnalysis = schoolsData
    .map((school) => {
      const visits = visitsData.filter(
        (v) => v.schoolId === school.id && v.type === "school"
      );

      const totalSpecimensGiven = visits.reduce((sum, v) => {
        return sum + (v.specimensGiven?.length || 0);
      }, 0);

      const targetBooks = school.salesPlan.subjects.length * 2; // Assume 2 books per subject
      const gap = targetBooks - totalSpecimensGiven;
      const gapPercentage = targetBooks > 0 ? Math.round((gap / targetBooks) * 100) : 0;

      return {
        school: school.name,
        city: school.city,
        board: school.board,
        targetBooks,
        actualBooks: totalSpecimensGiven,
        gap,
        gapPercentage,
        status:
          gap <= 0
            ? "On Track"
            : gapPercentage > 50
            ? "Critical"
            : gapPercentage > 25
            ? "Warning"
            : "Minor Gap",
      };
    })
    .filter((a) => a.gap > 0)
    .sort((a, b) => b.gap - a.gap);

  const critical = gapAnalysis.filter((a) => a.status === "Critical").length;
  const warning = gapAnalysis.filter((a) => a.status === "Warning").length;
  const minor = gapAnalysis.filter((a) => a.status === "Minor Gap").length;

  return (
    <PageContainer>
      <PageHeader
        title="Pre/Post-Visit Gap Analysis"
        description="Identify gaps between sales plans and actual specimen distribution"
      />

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <StatsCard
          title="Total Gaps"
          value={gapAnalysis.length}
          icon={TrendingDown}
        />
        <StatsCard
          title="Critical"
          value={critical}
          description="> 50% gap"
          icon={AlertTriangle}
        />
        <StatsCard
          title="Warning"
          value={warning}
          description="25-50% gap"
          icon={AlertTriangle}
        />
        <StatsCard
          title="Minor Gap"
          value={minor}
          description="< 25% gap"
          icon={CheckCircle}
        />
      </div>

      {/* Gap Analysis Details */}
      <Card>
        <CardHeader>
          <CardTitle>Schools with Specimen Distribution Gaps</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {gapAnalysis.map((analysis, index) => (
              <Card
                key={index}
                className={
                  analysis.status === "Critical"
                    ? "border-destructive/50"
                    : analysis.status === "Warning"
                    ? "border-orange-500/50"
                    : ""
                }
              >
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold">{analysis.school}</h3>
                        <Badge
                          variant={
                            analysis.status === "Critical"
                              ? "destructive"
                              : analysis.status === "Warning"
                              ? "secondary"
                              : "outline"
                          }
                        >
                          {analysis.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {analysis.city} • {analysis.board}
                      </p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-xs text-muted-foreground">Target Books</p>
                          <p className="font-bold">{analysis.targetBooks}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Actually Given</p>
                          <p className="font-bold">{analysis.actualBooks}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Gap</p>
                          <p className="font-bold text-destructive">{analysis.gap} books</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Gap %</p>
                          <p className="font-bold">{analysis.gapPercentage}%</p>
                        </div>
                      </div>
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
