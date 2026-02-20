"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  School as SchoolIcon,
  Download,
  Filter,
  Search,
  Calendar,
} from "lucide-react";
import PageContainer from "@/components/layouts/PageContainer";
import PageHeader from "@/components/layouts/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PageSkeleton } from "@/components/ui/skeleton-loaders";

import salesmenData from "@/lib/mock-data/salesmen.json";
import schoolsData from "@/lib/mock-data/schools.json";

// Visit purposes
const visitPurposes = [
  "New Adoption",
  "Renewal",
  "Specimen",
  "Follow-up",
  "Relationship",
  "Introduction",
  "Complaint",
  "Payment",
  "Meeting",
  "Event",
  "-", // No visit planned
];

// Mock sales plan visit data
const generateSalesPlanVisit = (schools: any[]) => {
  return schools.map((school) => {
    // Random number of visits (1-10)
    const totalVisits = Math.floor(Math.random() * 10) + 1;

    // Generate visit purposes for V1-V10
    const visits = Array.from({ length: 10 }, (_, index) => {
      if (index < totalVisits) {
        // Assign a random purpose for visits that are planned
        return visitPurposes[Math.floor(Math.random() * (visitPurposes.length - 1))];
      }
      return "-"; // No visit
    });

    return {
      schoolId: school.id,
      schoolName: school.name,
      totalVisits,
      v1: visits[0],
      v2: visits[1],
      v3: visits[2],
      v4: visits[3],
      v5: visits[4],
      v6: visits[5],
      v7: visits[6],
      v8: visits[7],
      v9: visits[8],
      v10: visits[9],
    };
  });
};

export default function SalesPlanVisitPage() {
  const params = useParams();
  const salesmanId = params.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [salesman, setSalesman] = useState<any>(null);
  const [visitPlanData, setVisitPlanData] = useState<any[]>([]);
  const [filteredData, setFilteredData] = useState<any[]>([]);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    setTimeout(() => {
      const foundSalesman = salesmenData.find((s) => s.id === salesmanId);
      if (foundSalesman) {
        setSalesman(foundSalesman);

        // Get assigned schools and generate visit plan
        const assignedSchools = schoolsData.filter(
          (s) => s.assignedTo === foundSalesman.name
        );
        const planData = generateSalesPlanVisit(assignedSchools);
        setVisitPlanData(planData);
        setFilteredData(planData);
      }
      setIsLoading(false);
    }, 500);
  }, [salesmanId]);

  // Apply search filter
  useEffect(() => {
    let filtered = [...visitPlanData];

    if (searchQuery) {
      filtered = filtered.filter((item) =>
        item.schoolName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredData(filtered);
  }, [searchQuery, visitPlanData]);

  if (isLoading) {
    return (
      <PageContainer>
        <PageSkeleton />
      </PageContainer>
    );
  }

  if (!salesman) {
    return (
      <PageContainer>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-2">Salesman Not Found</h2>
          <Link href="/admin/team">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Team
            </Button>
          </Link>
        </div>
      </PageContainer>
    );
  }

  // Calculate summary statistics
  const totalSchools = filteredData.length;
  const totalVisitsPlanned = filteredData.reduce(
    (sum, item) => sum + item.totalVisits,
    0
  );
  const avgVisitsPerSchool = totalSchools > 0
    ? (totalVisitsPlanned / totalSchools).toFixed(1)
    : 0;

  // Get visit purpose distribution
  const purposeCount: { [key: string]: number } = {};
  filteredData.forEach((item) => {
    [item.v1, item.v2, item.v3, item.v4, item.v5, item.v6, item.v7, item.v8, item.v9, item.v10].forEach((purpose) => {
      if (purpose !== "-") {
        purposeCount[purpose] = (purposeCount[purpose] || 0) + 1;
      }
    });
  });

  const topPurpose = Object.entries(purposeCount).sort((a, b) => b[1] - a[1])[0];

  return (
    <PageContainer>
      {/* Header */}
      <div className="mb-6">
        <Link href={`/admin/team/${salesmanId}`}>
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
        <PageHeader
          title="Sales Plan Visit"
          description={`Visit plan schedule for ${salesman.name}`}
        />
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Total Schools</p>
              <SchoolIcon className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold">{totalSchools}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Total Visits Planned</p>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold">{totalVisitsPlanned}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Avg Visits/School</p>
            </div>
            <p className="text-2xl font-bold">{avgVisitsPerSchool}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Top Purpose</p>
            </div>
            <p className="text-lg font-bold">{topPurpose?.[0] || "N/A"}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {topPurpose?.[1] || 0} visits
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters & Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by school name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Sales Plan Visit Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Visit Plan Schedule ({filteredData.length} schools)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[200px] sticky left-0 bg-background z-10">
                    School List
                  </TableHead>
                  <TableHead className="text-center">Total Visits</TableHead>
                  <TableHead className="text-center min-w-[120px]">V1</TableHead>
                  <TableHead className="text-center min-w-[120px]">V2</TableHead>
                  <TableHead className="text-center min-w-[120px]">V3</TableHead>
                  <TableHead className="text-center min-w-[120px]">V4</TableHead>
                  <TableHead className="text-center min-w-[120px]">V5</TableHead>
                  <TableHead className="text-center min-w-[120px]">V6</TableHead>
                  <TableHead className="text-center min-w-[120px]">V7</TableHead>
                  <TableHead className="text-center min-w-[120px]">V8</TableHead>
                  <TableHead className="text-center min-w-[120px]">V9</TableHead>
                  <TableHead className="text-center min-w-[120px]">V10</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={12} className="text-center py-8 text-muted-foreground">
                      No schools found matching your criteria
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredData.map((item) => {
                    const renderVisitBadge = (purpose: string) => {
                      if (purpose === "-") {
                        return <span className="text-muted-foreground">-</span>;
                      }
                      return (
                        <Badge variant="outline" className="text-xs whitespace-nowrap">
                          {purpose}
                        </Badge>
                      );
                    };

                    return (
                      <TableRow key={item.schoolId}>
                        <TableCell className="font-medium sticky left-0 bg-background z-10">
                          {item.schoolName}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="default">{item.totalVisits}</Badge>
                        </TableCell>
                        <TableCell className="text-center">{renderVisitBadge(item.v1)}</TableCell>
                        <TableCell className="text-center">{renderVisitBadge(item.v2)}</TableCell>
                        <TableCell className="text-center">{renderVisitBadge(item.v3)}</TableCell>
                        <TableCell className="text-center">{renderVisitBadge(item.v4)}</TableCell>
                        <TableCell className="text-center">{renderVisitBadge(item.v5)}</TableCell>
                        <TableCell className="text-center">{renderVisitBadge(item.v6)}</TableCell>
                        <TableCell className="text-center">{renderVisitBadge(item.v7)}</TableCell>
                        <TableCell className="text-center">{renderVisitBadge(item.v8)}</TableCell>
                        <TableCell className="text-center">{renderVisitBadge(item.v9)}</TableCell>
                        <TableCell className="text-center">{renderVisitBadge(item.v10)}</TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* Table Footer Summary */}
          {filteredData.length > 0 && (
            <div className="mt-4 p-4 bg-muted/50 rounded-lg">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Total Schools</p>
                  <p className="font-bold text-lg">{totalSchools}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Total Visits Planned</p>
                  <p className="font-bold text-lg">{totalVisitsPlanned}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Average Visits/School</p>
                  <p className="font-bold text-lg">{avgVisitsPerSchool}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Most Common Purpose</p>
                  <p className="font-bold text-lg">{topPurpose?.[0] || "N/A"}</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </PageContainer>
  );
}
