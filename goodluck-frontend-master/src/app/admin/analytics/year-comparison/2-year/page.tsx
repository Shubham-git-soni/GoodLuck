"use client";

import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown, Minus, Calendar, School, Download, Save } from "lucide-react";
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

interface TwoYearData {
  id: string;
  name: string;
  city: string;
  state: string;
  board: string;
  strength: number;
  assignedTo: string;
  // Year 1 Data (2022-2023)
  salesPrev: number; 
  booksPrev: string; // Changed to string (Name of books)
  // Year 2 Data (2023-2024)
  salesCurr: number;
  booksCurr: string; // Changed to string (Name of books)
  // Analysis
  totalSales: number;
  growth: number;
  trend: "up" | "stable" | "down";
  // CRM Editable Fields
  salesTarget: number;
  engagementApproach: string;
  growthApproach: string;
  brandLoyalty: string;
}

export default function TwoYearComparisonPage() {
  const [isLoading, setIsLoading] = useState(true);
  
  // Filters
  const [stateFilter, setStateFilter] = useState("all");
  const [cityFilter, setCityFilter] = useState("all");
  
  // Data
  const [schools, setSchools] = useState<TwoYearData[]>([]);
  const [filteredSchools, setFilteredSchools] = useState<TwoYearData[]>([]);

  // State Mapping
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
      const twoYearSchools: TwoYearData[] = [];

      schoolsData.forEach((school) => {
        // Find history records
        const historyPrev = school.businessHistory.find((h) => h.year === 2024);
        const historyCurr = school.businessHistory.find((h) => h.year === 2025);
        
        const salesPrev = historyPrev?.revenue || 0;
        const salesCurr = historyCurr?.revenue || 0;
        const yearsActive = school.businessHistory.filter((h) => h.revenue > 0).length;

        // Logic: Schools active in both years
        if (yearsActive >= 2 && salesPrev > 0 && salesCurr > 0) {
          const totalSales = salesPrev + salesCurr;
          const growth = salesPrev > 0 ? ((salesCurr - salesPrev) / salesPrev) * 100 : 0;

          let trend: "up" | "stable" | "down" = "stable";
          if (growth > 10) trend = "up";
          else if (growth < -10) trend = "down";

          // Extract Book Names
          // Note: If your JSON has a field 'products' or 'bookList' inside businessHistory, map it here.
          // Since the mock structure wasn't fully provided, I am checking for a property or falling back to a string.
          const booksPrevList = (historyPrev as any).products || ["Math Magic", "Science Vol 1"];
          const booksCurrList = (historyCurr as any).products || ["Math Magic", "Science Vol 1", "History 24"];

          twoYearSchools.push({
            id: school.id,
            name: school.name,
            city: school.city,
            state: stateMap[school.city] || "Unknown",
            board: school.board,
            strength: school.strength,
            assignedTo: school.assignedTo,
            salesPrev,
            salesCurr,
            // Join array to string for display
            booksPrev: Array.isArray(booksPrevList) ? booksPrevList.join(", ") : String(booksPrevList),
            booksCurr: Array.isArray(booksCurrList) ? booksCurrList.join(", ") : String(booksCurrList),
            totalSales,
            growth,
            trend,
            // Simulating CRM Data Defaults
            salesTarget: Math.ceil((salesCurr * 1.15) / 1000) * 1000, 
            engagementApproach: "Visit",
            growthApproach: "Upsell",
            brandLoyalty: "Medium",
          });
        }
      });

      const sorted = twoYearSchools.sort((a, b) => b.totalSales - a.totalSales);
      setSchools(sorted);
      setFilteredSchools(sorted);
      setIsLoading(false);
    }, 800);
  }, []);

  // Filter Logic
  useEffect(() => {
    let filtered = schools;

    if (stateFilter !== "all") {
      filtered = filtered.filter((s) => s.state === stateFilter);
    }
    if (cityFilter !== "all") {
      filtered = filtered.filter((s) => s.city === cityFilter);
    }

    setFilteredSchools(filtered);
  }, [schools, stateFilter, cityFilter]);

  // Handlers
  const handleRowChange = (id: string, field: keyof TwoYearData, value: string | number) => {
    setFilteredSchools((prev) =>
      prev.map((school) => (school.id === id ? { ...school, [field]: value } : school))
    );
  };

  const handleSave = (schoolName: string) => {
    toast.success(`Updated strategy for ${schoolName}`);
  };

  const getTrendIcon = (trend: string, growth: number) => {
    if (trend === "up") return <div className="flex items-center text-emerald-600"><TrendingUp className="h-4 w-4 mr-1" />{Math.abs(growth).toFixed(0)}%</div>;
    if (trend === "down") return <div className="flex items-center text-rose-600"><TrendingDown className="h-4 w-4 mr-1" />{Math.abs(growth).toFixed(0)}%</div>;
    return <div className="flex items-center text-slate-500"><Minus className="h-4 w-4 mr-1" />0%</div>;
  };

  if (isLoading) {
    return (
      <PageContainer>
        <DashboardSkeleton />
      </PageContainer>
    );
  }

  // Filter Options
  const states = Array.from(new Set(schools.map((s) => s.state))).sort();
  const cities = Array.from(new Set(schools.map((s) => s.city))).sort();
  const totalSalesCurr = filteredSchools.reduce((sum, s) => sum + s.salesCurr, 0);

  return (
    <PageContainer>
      <PageHeader
        title="2-Year User Comparison"
        description="Comparative analysis: 2022-23 vs 2023-24"
      />

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 mb-6">
        <StatsCard
          title="Schools Retained"
          value={schools.length}
          description="Active in both years"
          icon={Calendar}
        />
        <StatsCard
          title="Total Sales (23-24)"
          value={`₹${totalSalesCurr.toLocaleString()}`}
          description="Current Revenue"
          icon={TrendingUp}
        />
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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

            <Button onClick={() => toast.success("Exporting...")} variant="outline" className="w-full">
              <Download className="h-4 w-4 mr-2" />
              Export to Excel
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>School Comparison List ({filteredSchools.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">S.No</TableHead>
                  <TableHead className="min-w-[150px]">School Name</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead>Strength</TableHead>
                  <TableHead>Board</TableHead>
                  
                  {/* Comparison Columns */}
                  <TableHead className="bg-slate-50 text-slate-600 min-w-[150px]">Books (22-23)</TableHead>
                  <TableHead className="bg-slate-50 text-slate-600">Sales (22-23)</TableHead>
                  <TableHead className="bg-blue-50 text-blue-900 min-w-[150px]">Books (23-24)</TableHead>
                  <TableHead className="bg-blue-50 text-blue-900">Sales (23-24)</TableHead>
                  
                  <TableHead>Trend</TableHead>
                  
                  {/* Actionable Columns */}
                  <TableHead className="min-w-[100px]">Sales Target</TableHead>
                  <TableHead className="min-w-[130px]">Engagement</TableHead>
                  <TableHead className="min-w-[130px]">Growth</TableHead>
                  <TableHead className="min-w-[110px]">Brand Loyalty</TableHead>
                  <TableHead>Save</TableHead>
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
                    <TableRow key={school.id}>
                      <TableCell className="font-medium text-muted-foreground">{index + 1}</TableCell>
                      
                      {/* Basic Info */}
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-semibold text-sm">{school.name}</span>
                          <span className="text-xs text-muted-foreground">{school.state}</span>
                        </div>
                      </TableCell>
                      <TableCell>{school.city}</TableCell>
                      <TableCell>{school.strength}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[10px]">{school.board}</Badge>
                      </TableCell>

                      {/* Previous Year Books */}
                      <TableCell className="bg-slate-50 text-xs">
                        <div className="max-w-[150px] truncate" title={school.booksPrev}>
                          {school.booksPrev}
                        </div>
                      </TableCell>
                      <TableCell className="bg-slate-50 text-muted-foreground font-medium">₹{school.salesPrev.toLocaleString()}</TableCell>

                      {/* Current Year Books */}
                      <TableCell className="bg-blue-50 text-xs">
                        <div className="max-w-[150px] truncate text-blue-900" title={school.booksCurr}>
                          {school.booksCurr}
                        </div>
                      </TableCell>
                      <TableCell className="bg-blue-50 font-bold text-blue-700">₹{school.salesCurr.toLocaleString()}</TableCell>

                      {/* Trend */}
                      <TableCell>
                        {getTrendIcon(school.trend, school.growth)}
                      </TableCell>

                      {/* Editable Target */}
                      <TableCell>
                         <Input 
                          type="number"
                          className="h-8 w-24"
                          value={school.salesTarget}
                          onChange={(e) => handleRowChange(school.id, "salesTarget", Number(e.target.value))}
                        />
                      </TableCell>

                       {/* Editable Engagement */}
                      <TableCell>
                        <Select 
                          value={school.engagementApproach} 
                          onValueChange={(val) => handleRowChange(school.id, "engagementApproach", val)}
                        >
                          <SelectTrigger className="h-8 w-[130px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Visit">Visit</SelectItem>
                            <SelectItem value="Call">Call</SelectItem>
                            <SelectItem value="Workshop">Workshop</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>

                      {/* Editable Growth */}
                      <TableCell>
                        <Select 
                          value={school.growthApproach} 
                          onValueChange={(val) => handleRowChange(school.id, "growthApproach", val)}
                        >
                          <SelectTrigger className="h-8 w-[130px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Cross-sell">Cross-sell</SelectItem>
                            <SelectItem value="Upsell">Upsell</SelectItem>
                            <SelectItem value="Retention">Retention</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>

                      {/* Editable Loyalty */}
                      <TableCell>
                        <Select 
                          value={school.brandLoyalty} 
                          onValueChange={(val) => handleRowChange(school.id, "brandLoyalty", val)}
                        >
                          <SelectTrigger className="h-8 w-[110px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="High">High</SelectItem>
                            <SelectItem value="Medium">Medium</SelectItem>
                            <SelectItem value="Low">Low</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>

                      {/* Save */}
                      <TableCell>
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          onClick={() => handleSave(school.name)}
                          className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        >
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