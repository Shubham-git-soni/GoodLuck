"use client";

import { Award, CheckCircle, AlertTriangle, XCircle } from "lucide-react";
import PageContainer from "@/components/layouts/PageContainer";
import PageHeader from "@/components/layouts/PageHeader";
import StatsCard from "@/components/dashboard/StatsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import salesmenData from "@/lib/mock-data/salesmen.json";

export default function ComplianceReportsPage() {
  const complianceData = salesmenData.map((sm) => {
    const policies = [
      { name: "Visit Frequency", status: "Followed", details: "2+ visits per school" },
      { name: "Need Mapping Timing", status: Math.random() > 0.5 ? "Followed" : "Partially Followed", details: "Done in correct month" },
      { name: "Specimen Distribution", status: "Followed", details: "Within budget" },
      { name: "TA/DA Submission", status: Math.random() > 0.7 ? "Followed" : "Missed", details: "Timely submission" },
      { name: "Tour Plan Submission", status: "Followed", details: "Weekly submission" },
    ];

    const followed = policies.filter((p) => p.status === "Followed").length;
    const score = Math.round((followed / policies.length) * 100);

    return {
      salesmanName: sm.name,
      policies,
      overallScore: score,
    };
  });

  const avgCompliance = Math.round(
    complianceData.reduce((sum, d) => sum + d.overallScore, 0) / complianceData.length
  );

  return (
    <PageContainer>
      <PageHeader
        title="Policy Compliance Reports"
        description="Monitor policy adherence across the sales team"
      />

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <StatsCard
          title="Average Compliance"
          value={`${avgCompliance}%`}
          icon={Award}
        />
        <StatsCard
          title="Full Compliance"
          value={complianceData.filter((d) => d.overallScore === 100).length}
          description="Salesmen"
          icon={CheckCircle}
        />
        <StatsCard
          title="Partial Compliance"
          value={complianceData.filter((d) => d.overallScore >= 50 && d.overallScore < 100).length}
          description="Salesmen"
          icon={AlertTriangle}
        />
        <StatsCard
          title="Non-Compliance"
          value={complianceData.filter((d) => d.overallScore < 50).length}
          description="Salesmen"
          icon={XCircle}
        />
      </div>

      {/* Detailed Reports */}
      {complianceData.map((data, index) => (
        <Card key={index} className="mb-4">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{data.salesmanName}</CardTitle>
              <Badge
                variant={
                  data.overallScore >= 80
                    ? "default"
                    : data.overallScore >= 50
                    ? "secondary"
                    : "destructive"
                }
                className="text-base px-4 py-1"
              >
                {data.overallScore}% Compliance
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.policies.map((policy, pIndex) => (
                <div key={pIndex} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {policy.status === "Followed" ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : policy.status === "Partially Followed" ? (
                      <AlertTriangle className="h-5 w-5 text-orange-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600" />
                    )}
                    <div>
                      <p className="font-medium">{policy.name}</p>
                      <p className="text-xs text-muted-foreground">{policy.details}</p>
                    </div>
                  </div>
                  <Badge
                    variant={
                      policy.status === "Followed"
                        ? "default"
                        : policy.status === "Partially Followed"
                        ? "secondary"
                        : "destructive"
                    }
                  >
                    {policy.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </PageContainer>
  );
}
