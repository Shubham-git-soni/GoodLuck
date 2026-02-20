"use client";

import { useEffect, useState } from "react";
import { Search, TrendingUp, TrendingDown, Minus, Award, Calendar, School, Download } from "lucide-react";
import PageContainer from "@/components/layouts/PageContainer";
import PageHeader from "@/components/layouts/PageHeader";
import StatsCard from "@/components/dashboard/StatsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DashboardSkeleton } from "@/components/ui/skeleton-loaders";
import { toast } from "sonner";

// Import mock data
import schoolsData from "@/lib/mock-data/schools.json";

interface YearComparisonData {
  id: string;
  name: string;
  city: string;
  state: string;
  board: string;
  strength: number;
  assignedTo: string;
  sales2023: number;
  sales2024: number;
  sales2025: number;
  totalSales: number;
  growth: number;
  trend: "up" | "stable" | "down";
}

export default function YearComparisonPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [stateFilter, setStateFilter] = useState("all");
  const [cityFilter, setCityFilter] = useState("all");
  const [salesmanFilter, setSalesmanFilter] = useState("all");

  const [oneYearSchools, setOneYearSchools] = useState<YearComparisonData[]>([]);
  const [twoYearSchools, setTwoYearSchools] = useState<YearComparisonData[]>([]);
  const [threeYearSchools, setThreeYearSchools] = useState<YearComparisonData[]>([]);

  // Derive state from city (mock mapping)
  const stateMap: Record<string, string> = {
    Delhi: "Delhi",
    Mumbai: "Maharashtra",
    Ahmedabad: "Gujarat",
    Jaipur: "Rajasthan",
    Hyderabad: "Telangana",
    Bangalore: "Karnataka",
    Pune: "Maharashtra",
  };

  useEffect(() => {
    setTimeout(() => {
      const oneYear: YearComparisonData[] = [];
      const twoYear: YearComparisonData[] = [];
      const threeYear: YearComparisonData[] = [];

      schoolsData.forEach((school) => {
        const sales2023 = school.businessHistory.find((h) => h.year === 2023)?.revenue || 0;
        const sales2024 = school.businessHistory.find((h) => h.year === 2024)?.revenue || 0;
        const sales2025 = school.businessHistory.find((h) => h.year === 2025)?.revenue || 0;

        const yearsActive = school.businessHistory.filter((h) => h.revenue > 0).length;

        const data: YearComparisonData = {
          id: school.id,
          name: school.name,
          city: school.city,
          state: stateMap[school.city] || "Unknown",
          board: school.board,
          strength: school.strength,
          assignedTo: school.assignedTo,
          sales2023,
          sales2024,
          sales2025,
          totalSales: sales2023 + sales2024 + sales2025,
          growth: sales2023 > 0 ? ((sales2025 - sales2023) / sales2023) * 100 : 0,
          trend: "stable",
        };

        // Determine trend
        if (data.growth > 10) data.trend = "up";
        else if (data.growth < -10) data.trend = "down";

        // Categorize by years active
        if (yearsActive === 1) oneYear.push(data);
        else if (yearsActive === 2) twoYear.push(data);
        else if (yearsActive === 3) threeYear.push(data);
      });

      // Sort by total sales
      setOneYearSchools(oneYear.sort((a, b) => b.totalSales - a.totalSales));
      setTwoYearSchools(twoYear.sort((a, b) => b.totalSales - a.totalSales));
      setThreeYearSchools(threeYear.sort((a, b) => b.totalSales - a.totalSales));

      setIsLoading(false);
    }, 800);
  }, []);

  // Apply filters
  const applyFilters = (schools: YearComparisonData[]) => {
    let filtered = schools;

    if (stateFilter !== "all") {
      filtered = filtered.filter((s) => s.state === stateFilter);
    }

    if (cityFilter !== "all") {
      filtered = filtered.filter((s) => s.city === cityFilter);
    }

    if (salesmanFilter !== "all") {
      filtered = filtered.filter((s) => s.assignedTo === salesmanFilter);
    }

    return filtered;
  };

  const filteredOneYear = applyFilters(oneYearSchools);
  const filteredTwoYear = applyFilters(twoYearSchools);
  const filteredThreeYear = applyFilters(threeYearSchools);

  if (isLoading) {
    return (
      <PageContainer>
        <DashboardSkeleton />
      </PageContainer>
    );
  }

  // Get unique values for filters
  const allSchools = [...oneYearSchools, ...twoYearSchools, ...threeYearSchools];
  const states = Array.from(new Set(allSchools.map((s) => s.state))).sort();
  const cities = Array.from(new Set(allSchools.map((s) => s.city))).sort();
  const salesmen = Array.from(new Set(allSchools.map((s) => s.assignedTo))).sort();

  const handleExport = () => {
    toast.success("Exporting year comparison data to Excel...");
  };

  const getTrendIcon = (trend: string) => {
    if (trend === "up") return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (trend === "down") return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <Minus className="h-4 w-4 text-blue-600" />;
  };

  const getTrendBadge = (trend: string) => {
    if (trend === "up") return <Badge variant="secondary" className="bg-green-100 text-green-700">Growing</Badge>;
    if (trend === "down") return <Badge variant="secondary" className="bg-red-100 text-red-700">Declining</Badge>;
    return <Badge variant="secondary">Stable</Badge>;
  };

  const renderSchoolTable = (schools: YearComparisonData[], title: string, year: number) => {
    if (schools.length === 0) {
      return (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center py-8 text-muted-foreground">
              No schools found for {title.toLowerCase()}
            </p>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>S.No</TableHead>
                  <TableHead>School Name</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead>Strength</TableHead>
                  <TableHead>Board</TableHead>
                  {year >= 3 && <TableHead>Sales (22-23)</TableHead>}
                  {year >= 2 && <TableHead>Sales (23-24)</TableHead>}
                  <TableHead>Sales (24-25)</TableHead>
                  <TableHead>Total Sales</TableHead>
                  {year >= 2 && <TableHead>Growth %</TableHead>}
                  {year >= 2 && <TableHead>Trend</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {schools.map((school, index) => (
                  <TableRow key={school.id}>
                    <TableCell className="font-medium">{index + 1}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <School className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{school.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{school.city}</TableCell>
                    <TableCell>{school.strength.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{school.board}</Badge>
                    </TableCell>
                    {year >= 3 && (
                      <TableCell>
                        {school.sales2023 > 0 ? `₹${school.sales2023.toLocaleString()}` : "-"}
                      </TableCell>
                    )}
                    {year >= 2 && (
                      <TableCell>
                        {school.sales2024 > 0 ? `₹${school.sales2024.toLocaleString()}` : "-"}
                      </TableCell>
                    )}
                    <TableCell>
                      {school.sales2025 > 0 ? `₹${school.sales2025.toLocaleString()}` : "-"}
                    </TableCell>
                    <TableCell className="font-bold">
                      ₹{school.totalSales.toLocaleString()}
                    </TableCell>
                    {year >= 2 && (
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {getTrendIcon(school.trend)}
                          <span className={`font-medium ${
                            school.growth > 0 ? "text-green-600" :
                            school.growth < 0 ? "text-red-600" : "text-muted-foreground"
                          }`}>
                            {school.growth > 0 ? "+" : ""}
                            {school.growth.toFixed(1)}%
                          </span>
                        </div>
                      </TableCell>
                    )}
                    {year >= 2 && <TableCell>{getTrendBadge(school.trend)}</TableCell>}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <PageContainer>
      <PageHeader
        title="Year-wise Business Comparison"
        description="Identify consistent performers and growth trends"
      />

      {/* Top Stats */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <StatsCard
          title="1-Year Schools"
          value={oneYearSchools.length}
          description={`₹${oneYearSchools.reduce((sum, s) => sum + s.totalSales, 0).toLocaleString()}`}
          icon={Calendar}
        />
        <StatsCard
          title="2-Year Schools"
          value={twoYearSchools.length}
          description={`₹${twoYearSchools.reduce((sum, s) => sum + s.totalSales, 0).toLocaleString()}`}
          icon={TrendingUp}
        />
        <StatsCard
          title="3-Year Schools"
          value={threeYearSchools.length}
          description={`₹${threeYearSchools.reduce((sum, s) => sum + s.totalSales, 0).toLocaleString()}`}
          icon={Award}
        />
        <StatsCard
          title="Total Schools"
          value={allSchools.length}
          description={`₹${allSchools.reduce((sum, s) => sum + s.totalSales, 0).toLocaleString()}`}
          icon={School}
        />
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Select value={stateFilter} onValueChange={setStateFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All States" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All States</SelectItem>
                {states.map((state) => (
                  <SelectItem key={state} value={state}>{state}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={cityFilter} onValueChange={setCityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Cities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cities</SelectItem>
                {cities.map((city) => (
                  <SelectItem key={city} value={city}>{city}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={salesmanFilter} onValueChange={setSalesmanFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Salesmen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Salesmen</SelectItem>
                {salesmen.map((salesman) => (
                  <SelectItem key={salesman} value={salesman}>{salesman}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button onClick={handleExport} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export All to Excel
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 1-Year Users Section */}
      {renderSchoolTable(filteredOneYear, `1-Year Comparison (${filteredOneYear.length} Schools)`, 1)}

      {/* 2-Year Users Section */}
      {renderSchoolTable(filteredTwoYear, `2-Year Comparison (${filteredTwoYear.length} Schools)`, 2)}

      {/* 3-Year Users Section */}
      {renderSchoolTable(filteredThreeYear, `3-Year Comparison (${filteredThreeYear.length} Schools)`, 3)}
    </PageContainer>
  );
}
