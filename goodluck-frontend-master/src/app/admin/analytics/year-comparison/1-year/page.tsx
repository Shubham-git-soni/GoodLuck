"use client";

import { useEffect, useState } from "react";
import { TrendingUp, Calendar, School, Download, Save, BookOpen } from "lucide-react";
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

// Updated Interface to include new CRM fields
interface OneYearData {
  id: string;
  name: string;
  city: string;
  state: string;
  board: string;
  strength: number;
  assignedTo: string;
  sales2025: number;
  // New Fields
  booksCount: number;
  salesTarget: number;
  engagementApproach: string;
  growthApproach: string;
  brandLoyalty: string;
}

export default function OneYearComparisonPage() {
  const [isLoading, setIsLoading] = useState(true);
  
  // Filters
  const [stateFilter, setStateFilter] = useState("all");
  const [cityFilter, setCityFilter] = useState("all");
  
  // Data State
  const [schools, setSchools] = useState<OneYearData[]>([]);
  const [filteredSchools, setFilteredSchools] = useState<OneYearData[]>([]);

  // Mapping helper
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
      const oneYearSchools: OneYearData[] = [];

      schoolsData.forEach((school) => {
        const sales2025 = school.businessHistory.find((h) => h.year === 2025)?.revenue || 0;
        const yearsActive = school.businessHistory.filter((h) => h.revenue > 0).length;

        // Logic: Only schools active in 2025 and no other years
        if (yearsActive === 1 && sales2025 > 0) {
          oneYearSchools.push({
            id: school.id,
            name: school.name,
            city: school.city,
            state: stateMap[school.city] || "Unknown",
            board: school.board,
            strength: school.strength,
            assignedTo: school.assignedTo,
            sales2025,
            // Simulating Missing Data for the Mockup
            booksCount: Math.floor(Math.random() * 400) + 50, // Mock books count
            salesTarget: Math.ceil((sales2025 * 1.2) / 1000) * 1000, // Target +20%
            engagementApproach: ["Visit", "Call", "Workshop"][Math.floor(Math.random() * 3)],
            growthApproach: ["Cross-sell", "Upsell", "Retention"][Math.floor(Math.random() * 3)],
            brandLoyalty: ["High", "Medium", "Low"][Math.floor(Math.random() * 3)],
          });
        }
      });

      const sorted = oneYearSchools.sort((a, b) => b.sales2025 - a.sales2025);
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

  // Handle Input Changes in Table
  const handleRowChange = (id: string, field: keyof OneYearData, value: string | number) => {
    setFilteredSchools((prev) =>
      prev.map((school) => (school.id === id ? { ...school, [field]: value } : school))
    );
  };

  const handleSave = (schoolName: string) => {
    toast.success(`Updated data for ${schoolName}`);
  };

  if (isLoading) {
    return (
      <PageContainer>
        <DashboardSkeleton />
      </PageContainer>
    );
  }

  // Derived lists for filters
  const states = Array.from(new Set(schools.map((s) => s.state))).sort();
  const cities = Array.from(new Set(schools.map((s) => s.city))).sort();
  const totalSales = filteredSchools.reduce((sum, s) => sum + s.sales2025, 0);

  return (
    <PageContainer>
      <PageHeader
        title="1-Year User Comparison (2024-25)"
        description="Analysis of schools with business in the current year only"
      />

      {/* Top Stats */}
      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <StatsCard
          title="Total 1-Year Schools"
          value={schools.length}
          description="New customers"
          icon={Calendar}
        />
        <StatsCard
          title="Total Books Distributed"
          value={filteredSchools.reduce((a,b) => a + b.booksCount, 0).toLocaleString()}
          description="Estimated volume"
          icon={BookOpen}
        />
        <StatsCard
          title="Total Sales (24-25)"
          value={`₹${totalSales.toLocaleString()}`}
          description="Current year revenue"
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

      {/* Schools Table */}
      <Card>
        <CardHeader>
          <CardTitle>1-Year User Schools ({filteredSchools.length})</CardTitle>
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
                  {/* Requested New Columns */}
                  <TableHead>Books</TableHead>
                  <TableHead>Sales (24-25)</TableHead>
                  <TableHead className="min-w-[120px]">Sales Target</TableHead>
                  <TableHead className="min-w-[140px]">Engagement</TableHead>
                  <TableHead className="min-w-[140px]">Growth</TableHead>
                  <TableHead className="min-w-[120px]">Loyalty</TableHead>
                  <TableHead>Save</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSchools.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={12} className="text-center py-8 text-muted-foreground">
                      No schools found matching your criteria
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSchools.map((school, index) => (
                    <TableRow key={school.id}>
                      <TableCell className="font-medium text-muted-foreground">
                        {index + 1}
                      </TableCell>
                      
                      {/* School Name */}
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-semibold text-sm">{school.name}</span>
                          <span className="text-xs text-muted-foreground">{school.state}</span>
                        </div>
                      </TableCell>

                      {/* Static Info */}
                      <TableCell>{school.city}</TableCell>
                      <TableCell>{school.strength}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[10px]">{school.board}</Badge>
                      </TableCell>
                      
                      {/* Books (Simulated) */}
                      <TableCell>{school.booksCount}</TableCell>

                      {/* Sales (Read Only) */}
                      <TableCell className="font-bold text-emerald-600">
                        ₹{school.sales2025.toLocaleString()}
                      </TableCell>

                      {/* Editable: Sales Target */}
                      <TableCell>
                        <Input 
                          type="number"
                          className="h-8 w-24"
                          value={school.salesTarget}
                          onChange={(e) => handleRowChange(school.id, "salesTarget", Number(e.target.value))}
                        />
                      </TableCell>

                      {/* Editable: Engagement Approach */}
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
                            <SelectItem value="Email">Email</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>

                      {/* Editable: Growth Approach */}
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

                      {/* Editable: Brand Loyalty */}
                      <TableCell>
                         <Select 
                          value={school.brandLoyalty} 
                          onValueChange={(val) => handleRowChange(school.id, "brandLoyalty", val)}
                        >
                          <SelectTrigger className="h-8 w-[100px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="High">High</SelectItem>
                            <SelectItem value="Medium">Medium</SelectItem>
                            <SelectItem value="Low">Low</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>

                      {/* Save Action */}
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