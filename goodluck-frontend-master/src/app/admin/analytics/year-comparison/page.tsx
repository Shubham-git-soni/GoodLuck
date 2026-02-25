"use client";

import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown, Minus, Award, School, Download, Save, BookOpen, Calendar } from "lucide-react";
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

interface YearData {
  id: string;
  name: string;
  city: string;
  state: string;
  board: string;
  strength: number;
  assignedTo: string;

  // Year 1 (2022-2023)
  sales2023: number;
  books2023: string;

  // Year 2 (2023-2024)
  sales2024: number;
  books2024: string;

  // Year 3 (2024-2025)
  sales2025: number;
  books2025: string;

  // Analysis
  activeYears: number;
  totalSales: number;
  growth: number;
  trend: "up" | "stable" | "down";

  // CRM Editable Fields
  salesTarget: number;
  engagementApproach: string;
  growthApproach: string;
  brandLoyalty: string;
}

export default function YearComparisonPage() {
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [yearFilter, setYearFilter] = useState("all"); // '1', '2', '3', 'all'
  const [stateFilter, setStateFilter] = useState("all");
  const [salesmanFilter, setSalesmanFilter] = useState("all");

  // Data
  const [schools, setSchools] = useState<YearData[]>([]);
  const [filteredSchools, setFilteredSchools] = useState<YearData[]>([]);

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
      const yearSchools: YearData[] = [];

      schoolsData.forEach((school) => {
        const h23 = school.businessHistory.find((h) => h.year === 2023);
        const h24 = school.businessHistory.find((h) => h.year === 2024);
        const h25 = school.businessHistory.find((h) => h.year === 2025);

        const sales2023 = h23?.revenue || 0;
        const sales2024 = h24?.revenue || 0;
        const sales2025 = h25?.revenue || 0;

        // Count active years based on revenue
        const activeYears = [sales2023, sales2024, sales2025].filter(s => s > 0).length;

        if (activeYears > 0) {
          const totalSales = sales2023 + sales2024 + sales2025;

          // Growth calculation: latest active year compared to earliest active year in the 3-year window
          let growth = 0;
          let earliestSales = 0;
          let latestSales = 0;

          if (sales2023 > 0) earliestSales = sales2023;
          else if (sales2024 > 0) earliestSales = sales2024;
          else earliestSales = sales2025;

          if (sales2025 > 0) latestSales = sales2025;
          else if (sales2024 > 0) latestSales = sales2024;
          else latestSales = sales2023;

          if (earliestSales > 0 && earliestSales !== latestSales) {
            growth = ((latestSales - earliestSales) / earliestSales) * 100;
          }

          let trend: "up" | "stable" | "down" = "stable";
          if (growth > 15) trend = "up";
          else if (growth < -10) trend = "down";

          const getBooks = (h: any) => (h?.products ? h.products.join(", ") : "Math, Science");

          yearSchools.push({
            id: school.id,
            name: school.name,
            city: school.city,
            state: stateMap[school.city] || "Unknown",
            board: school.board,
            strength: school.strength,
            assignedTo: school.assignedTo,

            sales2023,
            books2023: sales2023 > 0 ? getBooks(h23) : "-",
            sales2024,
            books2024: sales2024 > 0 ? getBooks(h24) : "-",
            sales2025,
            books2025: sales2025 > 0 ? getBooks(h25) : "-",

            activeYears,
            totalSales,
            growth,
            trend,

            salesTarget: Math.ceil((latestSales * 1.15) / 1000) * 1000,
            engagementApproach: "Visit",
            growthApproach: activeYears === 1 ? "Acquisition" : "Retention",
            brandLoyalty: activeYears >= 3 ? "High" : activeYears === 2 ? "Medium" : "Low",
          });
        }
      });

      const sorted = yearSchools.sort((a, b) => b.totalSales - a.totalSales);
      setSchools(sorted);
      setFilteredSchools(sorted);
      setIsLoading(false);
    }, 800);
  }, []);

  // Filter Logic
  useEffect(() => {
    let filtered = schools;

    if (yearFilter !== "all") {
      filtered = filtered.filter((s) => s.activeYears === parseInt(yearFilter));
    }

    if (stateFilter !== "all") filtered = filtered.filter((s) => s.state === stateFilter);
    if (salesmanFilter !== "all") filtered = filtered.filter((s) => s.assignedTo === salesmanFilter);

    setFilteredSchools(filtered);
  }, [schools, yearFilter, stateFilter, salesmanFilter]);

  // Handlers
  const handleRowChange = (id: string, field: keyof YearData, value: string | number) => {
    setFilteredSchools((prev) =>
      prev.map((school) => (school.id === id ? { ...school, [field]: value } : school))
    );
  };

  const handleSave = (schoolName: string) => {
    toast.success(`Updated strategy for ${schoolName}`);
  };

  const getTrendIcon = (trend: string, growth: number) => {
    if (trend === "up") return <div className="flex items-center text-emerald-600 font-bold"><TrendingUp className="h-4 w-4 mr-1" />{Math.abs(growth).toFixed(0)}%</div>;
    if (trend === "down") return <div className="flex items-center text-rose-600 font-bold"><TrendingDown className="h-4 w-4 mr-1" />{Math.abs(growth).toFixed(0)}%</div>;
    return <div className="flex items-center text-slate-500"><Minus className="h-4 w-4 mr-1" />Stable</div>;
  };

  if (isLoading) {
    return (
      <PageContainer>
        <DashboardSkeleton />
      </PageContainer>
    );
  }

  const states = Array.from(new Set(schools.map((s) => s.state))).sort();
  const salesmen = Array.from(new Set(schools.map((s) => s.assignedTo))).sort();
  const totalSalesAll = filteredSchools.reduce((sum, s) => sum + s.totalSales, 0);

  return (
    <PageContainer>
      <PageHeader
        title="Consolidated Yearly Analysis"
        description="Comprehensive analysis of user retention, growth, and trends across 3 years."
      />

      {/* Top Stats */}
      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <StatsCard
          title="Total Active Schools"
          value={filteredSchools.length}
          description="Matching filters"
          icon={School}
        />
        <StatsCard
          title="Avg Active Years"
          value={(filteredSchools.reduce((acc, s) => acc + s.activeYears, 0) / (filteredSchools.length || 1)).toFixed(1)}
          description="Out of 3 years"
          icon={Calendar}
        />
        <StatsCard
          title="Total Revenue Selected"
          value={`₹${totalSalesAll.toLocaleString()}`}
          description="Across active years"
          icon={TrendingUp}
        />
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Analytics Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <Select value={yearFilter} onValueChange={setYearFilter}>
              <SelectTrigger><SelectValue placeholder="Years Active" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All School Types</SelectItem>
                <SelectItem value="1">1-Year</SelectItem>
                <SelectItem value="2">2-Year</SelectItem>
                <SelectItem value="3">3-Year</SelectItem>
              </SelectContent>
            </Select>

            <Select value={stateFilter} onValueChange={setStateFilter}>
              <SelectTrigger><SelectValue placeholder="All States" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All States</SelectItem>
                {states.map((state) => <SelectItem key={state} value={state}>{state}</SelectItem>)}
              </SelectContent>
            </Select>

            <Select value={salesmanFilter} onValueChange={setSalesmanFilter}>
              <SelectTrigger><SelectValue placeholder="All Salespersons" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Salespersons</SelectItem>
                {salesmen.map((salesman) => <SelectItem key={salesman} value={salesman}>{salesman}</SelectItem>)}
              </SelectContent>
            </Select>

            <Button onClick={() => toast.success("Exporting...")} variant="outline" className="w-full h-10 border-slate-300">
              <Download className="h-4 w-4 mr-2" /> Export
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Complex Data Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>School Performance & Projection ({filteredSchools.length})</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                {/* Header Row 1: Grouping Years */}
                <TableRow className="bg-slate-50 hover:bg-slate-50 text-xs">
                  <TableHead rowSpan={2} className="w-[50px]">S.No</TableHead>
                  <TableHead rowSpan={2} className="min-w-[150px]">School Name</TableHead>
                  <TableHead rowSpan={2}>City</TableHead>
                  <TableHead rowSpan={2}>Retained</TableHead>

                  {/* Grouped Headers */}
                  <TableHead colSpan={2} className="text-center border-l border-r border-slate-200 bg-slate-100/50 text-slate-700 font-bold">2022-2023</TableHead>
                  <TableHead colSpan={2} className="text-center border-r border-slate-200 bg-blue-50/50 text-blue-900 font-bold">2023-2024</TableHead>
                  <TableHead colSpan={2} className="text-center border-r border-slate-200 bg-emerald-50/50 text-emerald-900 font-bold">2024-2025</TableHead>

                  <TableHead rowSpan={2} className="border-l">Trend</TableHead>
                  <TableHead rowSpan={2} className="min-w-[100px]">Sales Target</TableHead>
                  <TableHead rowSpan={2} className="min-w-[130px]">Growth Strategy</TableHead>
                  <TableHead rowSpan={2} className="min-w-[110px]">Loyalty</TableHead>
                  <TableHead rowSpan={2}>Save</TableHead>
                </TableRow>

                {/* Header Row 2: Sub-columns */}
                <TableRow>
                  {/* 2022-23 Sub-columns */}
                  <TableHead className="border-l border-slate-200 bg-slate-100/30 text-[10px] uppercase">Books</TableHead>
                  <TableHead className="bg-slate-100/30 text-[10px] uppercase border-r">Sales</TableHead>

                  {/* 2023-24 Sub-columns */}
                  <TableHead className="bg-blue-50/30 text-[10px] uppercase text-blue-900">Books</TableHead>
                  <TableHead className="bg-blue-50/30 text-[10px] uppercase text-blue-900 border-r">Sales</TableHead>

                  {/* 2024-25 Sub-columns */}
                  <TableHead className="bg-emerald-50/30 text-[10px] uppercase text-emerald-900">Books</TableHead>
                  <TableHead className="bg-emerald-50/30 text-[10px] uppercase text-emerald-900 border-r">Sales</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredSchools.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={15} className="text-center py-8 text-muted-foreground">
                      No schools found matching your criteria
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSchools.map((school, index) => (
                    <TableRow key={school.id} className="group hover:bg-slate-50/50">
                      <TableCell className="font-medium text-muted-foreground">{index + 1}</TableCell>

                      {/* Fixed Info */}
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-semibold text-sm">{school.name}</span>
                          <span className="text-xs text-muted-foreground">{school.board}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-slate-600">{school.city}</TableCell>
                      <TableCell>
                        <Badge variant={school.activeYears === 3 ? "default" : school.activeYears === 2 ? "secondary" : "outline"} className="text-[10px]">
                          {school.activeYears} Yrs
                        </Badge>
                      </TableCell>

                      {/* 2022-2023 Data */}
                      <TableCell className="border-l text-xs max-w-[120px]">
                        <div className="truncate text-slate-500" title={school.books2023}>{school.books2023}</div>
                      </TableCell>
                      <TableCell className="text-xs text-slate-500 border-r">{school.sales2023 > 0 ? `₹${school.sales2023.toLocaleString()}` : '-'}</TableCell>

                      {/* 2023-2024 Data */}
                      <TableCell className="text-xs max-w-[120px] bg-blue-50/10">
                        <div className="truncate text-blue-800" title={school.books2024}>{school.books2024}</div>
                      </TableCell>
                      <TableCell className="text-xs font-medium text-blue-800 bg-blue-50/10 border-r">{school.sales2024 > 0 ? `₹${school.sales2024.toLocaleString()}` : '-'}</TableCell>

                      {/* 2024-2025 Data */}
                      <TableCell className="text-xs max-w-[120px] bg-emerald-50/10">
                        <div className="truncate text-emerald-800" title={school.books2025}>{school.books2025}</div>
                      </TableCell>
                      <TableCell className="text-xs font-bold text-emerald-800 bg-emerald-50/10 border-r">{school.sales2025 > 0 ? `₹${school.sales2025.toLocaleString()}` : '-'}</TableCell>

                      {/* Trend */}
                      <TableCell className="border-l">
                        {getTrendIcon(school.trend, school.growth)}
                      </TableCell>

                      {/* Inputs */}
                      <TableCell>
                        <Input
                          type="number"
                          className="h-8 w-24 text-xs"
                          value={school.salesTarget}
                          onChange={(e) => handleRowChange(school.id, "salesTarget", Number(e.target.value))}
                        />
                      </TableCell>

                      <TableCell>
                        <Select value={school.growthApproach} onValueChange={(val) => handleRowChange(school.id, "growthApproach", val)}>
                          <SelectTrigger className="h-8 w-[120px] text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Acquisition">Acquisition</SelectItem>
                            <SelectItem value="Cross-sell">Cross-sell</SelectItem>
                            <SelectItem value="Upsell">Upsell</SelectItem>
                            <SelectItem value="Retention">Retention</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>

                      <TableCell>
                        <Select value={school.brandLoyalty} onValueChange={(val) => handleRowChange(school.id, "brandLoyalty", val)}>
                          <SelectTrigger className="h-8 w-[90px] text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="High">High</SelectItem>
                            <SelectItem value="Medium">Medium</SelectItem>
                            <SelectItem value="Low">Low</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>

                      <TableCell>
                        <Button size="icon" variant="ghost" onClick={() => handleSave(school.name)} className="h-8 w-8 text-blue-600 hover:bg-blue-50">
                          <Save className="h-4 w-4" />
                        </Button>
                      </TableCell>

                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  );
}

