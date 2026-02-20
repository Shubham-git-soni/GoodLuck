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
} from "lucide-react";
import PageContainer from "@/components/layouts/PageContainer";
import PageHeader from "@/components/layouts/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

// Mock school sales plan data
const generateSchoolSalesPlan = (schools: any[]) => {
  const purposes = [
    "New Adoption",
    "Renewal",
    "Specimen Distribution",
    "Relationship Building",
    "Follow-up",
    "Introduction",
  ];

  return schools.map((school, index) => ({
    sno: index + 1,
    schoolId: school.id,
    schoolName: school.name,
    purpose: purposes[Math.floor(Math.random() * purposes.length)],
    tryToPrescribe: Math.floor(Math.random() * 50) + 10,
    specimenGiven: Math.floor(Math.random() * 40) + 5,
    target: Math.floor(Math.random() * 200000) + 50000,
    achieved: Math.floor(Math.random() * 150000) + 20000,
  }));
};

export default function SchoolSalesPlanPage() {
  const params = useParams();
  const salesmanId = params.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [salesman, setSalesman] = useState<any>(null);
  const [salesPlanData, setSalesPlanData] = useState<any[]>([]);
  const [filteredData, setFilteredData] = useState<any[]>([]);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [purposeFilter, setPurposeFilter] = useState("all");

  useEffect(() => {
    setTimeout(() => {
      const foundSalesman = salesmenData.find((s) => s.id === salesmanId);
      if (foundSalesman) {
        setSalesman(foundSalesman);

        // Get assigned schools and generate sales plan
        const assignedSchools = schoolsData.filter(
          (s) => s.assignedTo === foundSalesman.name
        );
        const planData = generateSchoolSalesPlan(assignedSchools);
        setSalesPlanData(planData);
        setFilteredData(planData);
      }
      setIsLoading(false);
    }, 500);
  }, [salesmanId]);

  // Apply filters
  useEffect(() => {
    let filtered = [...salesPlanData];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter((item) =>
        item.schoolName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Purpose filter
    if (purposeFilter !== "all") {
      filtered = filtered.filter((item) => item.purpose === purposeFilter);
    }

    setFilteredData(filtered);
  }, [searchQuery, purposeFilter, salesPlanData]);

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
  const totalTarget = filteredData.reduce((sum, item) => sum + item.target, 0);
  const totalAchieved = filteredData.reduce((sum, item) => sum + item.achieved, 0);
  const totalTryToPrescribe = filteredData.reduce(
    (sum, item) => sum + item.tryToPrescribe,
    0
  );
  const totalSpecimenGiven = filteredData.reduce(
    (sum, item) => sum + item.specimenGiven,
    0
  );
  const achievementPercentage = totalTarget > 0
    ? Math.round((totalAchieved / totalTarget) * 100)
    : 0;

  // Get unique purposes for filter
  const purposes = Array.from(new Set(salesPlanData.map((item) => item.purpose))).sort();

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
          title="School Sales Plan"
          description={`Sales plan and targets for ${salesman.name}`}
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
            <p className="text-2xl font-bold">{filteredData.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Total Target</p>
            </div>
            <p className="text-2xl font-bold">₹{(totalTarget / 100000).toFixed(1)}L</p>
            <p className="text-xs text-muted-foreground mt-1">
              Achieved: ₹{(totalAchieved / 100000).toFixed(1)}L
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Achievement</p>
            </div>
            <p className="text-2xl font-bold">{achievementPercentage}%</p>
            <div className="w-full bg-muted rounded-full h-2 mt-2">
              <div
                className="bg-primary h-2 rounded-full transition-all"
                style={{ width: `${Math.min(achievementPercentage, 100)}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Specimens</p>
            </div>
            <p className="text-2xl font-bold">{totalSpecimenGiven}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Try to Prescribe: {totalTryToPrescribe}
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

            <Select value={purposeFilter} onValueChange={setPurposeFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Filter by purpose" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Purposes</SelectItem>
                {purposes.map((purpose) => (
                  <SelectItem key={purpose} value={purpose}>
                    {purpose}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* School Sales Plan Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <SchoolIcon className="h-5 w-5" />
            School Sales Plan ({filteredData.length} schools)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[60px]">S.No</TableHead>
                  <TableHead className="min-w-[200px]">School Name</TableHead>
                  <TableHead className="min-w-[150px]">Purpose</TableHead>
                  <TableHead className="text-right">Try to Prescribe</TableHead>
                  <TableHead className="text-right">Specimen Given</TableHead>
                  <TableHead className="text-right">Target (₹)</TableHead>
                  <TableHead className="text-right">Achieved (₹)</TableHead>
                  <TableHead className="text-center">Achievement %</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No schools found matching your criteria
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredData.map((item) => {
                    const achievementPercent = Math.round(
                      (item.achieved / item.target) * 100
                    );

                    return (
                      <TableRow key={item.sno}>
                        <TableCell className="font-medium">{item.sno}</TableCell>
                        <TableCell className="font-medium">{item.schoolName}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{item.purpose}</Badge>
                        </TableCell>
                        <TableCell className="text-right">{item.tryToPrescribe}</TableCell>
                        <TableCell className="text-right">{item.specimenGiven}</TableCell>
                        <TableCell className="text-right">
                          ₹{(item.target / 1000).toFixed(1)}K
                        </TableCell>
                        <TableCell className="text-right">
                          ₹{(item.achieved / 1000).toFixed(1)}K
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge
                            variant={
                              achievementPercent >= 80
                                ? "default"
                                : achievementPercent >= 50
                                ? "secondary"
                                : "destructive"
                            }
                          >
                            {achievementPercent}%
                          </Badge>
                        </TableCell>
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
                  <p className="font-bold text-lg">{filteredData.length}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Total Try to Prescribe</p>
                  <p className="font-bold text-lg">{totalTryToPrescribe}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Total Specimen Given</p>
                  <p className="font-bold text-lg">{totalSpecimenGiven}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Overall Achievement</p>
                  <p className="font-bold text-lg">{achievementPercentage}%</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </PageContainer>
  );
}
