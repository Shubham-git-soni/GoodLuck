"use client";

import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown, Minus, Award, School, Download, Save, BookOpen, Calendar, Filter, RotateCcw, SlidersHorizontal, X } from "lucide-react";
import PageContainer from "@/components/layouts/PageContainer";
import PageHeader from "@/components/layouts/PageHeader";
import StatsCard from "@/components/dashboard/StatsCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DataGrid, GridColumn, RowAction } from "@/components/ui/data-grid";
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
  const [filtersOpen, setFiltersOpen] = useState(false);

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

  const YEAR_COLUMNS: GridColumn<YearData>[] = [
    {
      key: "name", header: "School Name", pinned: "left", minWidth: 200, render: (_, row) => (
        <div className="flex flex-col">
          <span className="font-semibold text-sm">{row.name}</span>
          <span className="text-xs text-muted-foreground">{row.board}</span>
        </div>
      )
    },
    { key: "city", header: "City", width: 120 },
    {
      key: "activeYears", header: "Retained", width: 100, align: "center", render: (val: number) => (
        <Badge variant={val === 3 ? "default" : val === 2 ? "secondary" : "outline"} className="text-[10px]">
          {val} Yrs
        </Badge>
      )
    },

    // 2022-2023 Data
    { key: "books2023", header: "22-23 Books", width: 130, render: (val: string) => <div className="truncate text-slate-500 text-xs" title={val}>{val}</div> },
    { key: "sales2023", header: "22-23 Sales", width: 100, align: "right", render: (val: number) => <span className="text-xs text-slate-500">{val > 0 ? `₹${val.toLocaleString()}` : '-'}</span> },

    // 2023-2024 Data
    { key: "books2024", header: "23-24 Books", width: 130, render: (val: string) => <div className="truncate text-blue-800 text-xs" title={val}>{val}</div> },
    { key: "sales2024", header: "23-24 Sales", width: 100, align: "right", render: (val: number) => <span className="text-xs font-medium text-blue-800">{val > 0 ? `₹${val.toLocaleString()}` : '-'}</span> },

    // 2024-2025 Data
    { key: "books2025", header: "24-25 Books", width: 130, render: (val: string) => <div className="truncate text-emerald-800 text-xs" title={val}>{val}</div> },
    { key: "sales2025", header: "24-25 Sales", width: 100, align: "right", render: (val: number) => <span className="text-xs font-bold text-emerald-800">{val > 0 ? `₹${val.toLocaleString()}` : '-'}</span> },

    // Analysis
    { key: "trend", header: "Trend", width: 110, render: (_, row) => getTrendIcon(row.trend, row.growth) },
    {
      key: "salesTarget", header: "Sales Target", width: 120, render: (val: number, row) => (
        <Input
          type="number"
          className="h-8 w-24 text-xs"
          value={val}
          onChange={(e) => handleRowChange(row.id, "salesTarget", Number(e.target.value))}
        />
      )
    },
    {
      key: "growthApproach", header: "Growth Strategy", width: 140, render: (val: string, row) => (
        <Select value={val} onValueChange={(v) => handleRowChange(row.id, "growthApproach", v)}>
          <SelectTrigger className="h-8 w-[120px] text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="Acquisition">Acquisition</SelectItem>
            <SelectItem value="Cross-sell">Cross-sell</SelectItem>
            <SelectItem value="Upsell">Upsell</SelectItem>
            <SelectItem value="Retention">Retention</SelectItem>
          </SelectContent>
        </Select>
      )
    },
    {
      key: "brandLoyalty", header: "Loyalty", width: 120, render: (val: string, row) => (
        <Select value={val} onValueChange={(v) => handleRowChange(row.id, "brandLoyalty", v)}>
          <SelectTrigger className="h-8 w-[90px] text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="High">High</SelectItem>
            <SelectItem value="Medium">Medium</SelectItem>
            <SelectItem value="Low">Low</SelectItem>
          </SelectContent>
        </Select>
      )
    },
  ];

  const rowActions: RowAction<YearData>[] = [
    { label: "Save", icon: <Save className="h-3.5 w-3.5" />, onClick: (row) => handleSave(row.name) }
  ];

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
      <div className="grid grid-cols-3 gap-2 md:gap-4 mb-6">
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

      {/* ── MOBILE: filter toggle button ── */}
      <div className="flex items-center gap-2 mb-3 md:hidden">
        <button
          onClick={() => setFiltersOpen(!filtersOpen)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors bg-card shadow-sm"
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          Filters
          {(() => {
            const cnt = [yearFilter !== "all", stateFilter !== "all", salesmanFilter !== "all"].filter(Boolean).length;
            return cnt > 0 ? (
              <span className="ml-1 h-4 min-w-[16px] px-1 flex items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground font-bold">{cnt}</span>
            ) : null;
          })()}
        </button>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="ghost" size="sm" className="h-8 text-xs text-muted-foreground hover:text-primary"
            onClick={() => { setYearFilter("all"); setStateFilter("all"); setSalesmanFilter("all"); }}>
            <RotateCcw className="h-3.5 w-3.5 mr-1" /> Reset
          </Button>
          <Button size="sm" className="h-8 text-xs" onClick={() => toast.success("Exporting...")}>
            <Download className="h-3.5 w-3.5 mr-1" /> Export
          </Button>
        </div>
      </div>

      {/* ── MOBILE: collapsible filter panel ── */}
      {filtersOpen && (
        <div className="mb-4 md:hidden border rounded-xl bg-card p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Filters</span>
            <button type="button" onClick={() => setFiltersOpen(false)} className="h-6 w-6 flex items-center justify-center rounded-md hover:bg-muted">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <p className="text-[10px] font-semibold uppercase text-muted-foreground tracking-wide">Active</p>
              <Select value={yearFilter} onValueChange={setYearFilter}>
                <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="All School Types" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All School Types</SelectItem>
                  <SelectItem value="1">1-Year</SelectItem>
                  <SelectItem value="2">2-Year</SelectItem>
                  <SelectItem value="3">3-Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-semibold uppercase text-muted-foreground tracking-wide">State</p>
              <Select value={stateFilter} onValueChange={setStateFilter}>
                <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="All States" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All States</SelectItem>
                  {states.map((state) => <SelectItem key={state} value={state}>{state}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1 col-span-2">
              <p className="text-[10px] font-semibold uppercase text-muted-foreground tracking-wide">Person</p>
              <Select value={salesmanFilter} onValueChange={setSalesmanFilter}>
                <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="All Salespersons" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Salespersons</SelectItem>
                  {salesmen.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button variant="outline" size="sm" className="w-full h-9 text-xs bg-muted text-muted-foreground hover:bg-muted/80 border-0"
            onClick={() => { setYearFilter("all"); setStateFilter("all"); setSalesmanFilter("all"); setFiltersOpen(false); }}>
            <RotateCcw className="h-3.5 w-3.5 mr-1.5" /> Reset Filters
          </Button>
        </div>
      )}

      {/* Filters — compact bar (DESKTOP ONLY) */}
      <div className="hidden md:flex mb-6 flex-wrap items-center gap-2 bg-card border rounded-xl px-4 py-2.5 shadow-sm">
        <Filter className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide shrink-0 mr-1">Filters</span>

        {/* Years Active */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-muted-foreground shrink-0">Active:</span>
          <Select value={yearFilter} onValueChange={setYearFilter}>
            <SelectTrigger className="h-8 w-36 text-xs"><SelectValue placeholder="Years Active" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All School Types</SelectItem>
              <SelectItem value="1">1-Year</SelectItem>
              <SelectItem value="2">2-Year</SelectItem>
              <SelectItem value="3">3-Year</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* State */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-muted-foreground shrink-0">State:</span>
          <Select value={stateFilter} onValueChange={setStateFilter}>
            <SelectTrigger className="h-8 w-32 text-xs"><SelectValue placeholder="All States" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All States</SelectItem>
              {states.map((state) => <SelectItem key={state} value={state}>{state}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* Salesperson */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-muted-foreground shrink-0">Person:</span>
          <Select value={salesmanFilter} onValueChange={setSalesmanFilter}>
            <SelectTrigger className="h-8 w-36 text-xs"><SelectValue placeholder="All Salespersons" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Salespersons</SelectItem>
              {salesmen.map((salesman) => <SelectItem key={salesman} value={salesman}>{salesman}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* Actions */}
        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="ghost" size="sm"
            className="h-8 text-xs text-muted-foreground hover:text-primary"
            onClick={() => { setYearFilter("all"); setStateFilter("all"); setSalesmanFilter("all"); }}
          >
            <RotateCcw className="h-3.5 w-3.5 mr-1" /> Reset
          </Button>
          <Button size="sm" className="h-8 text-xs" onClick={() => toast.success("Exporting...")}>
            <Download className="h-3.5 w-3.5 mr-1" /> Export
          </Button>
        </div>
      </div>

      {/* Data Grid Component */}
      <DataGrid
        data={filteredSchools}
        columns={YEAR_COLUMNS}
        rowKey="id"
        defaultPageSize={15}
        title={`School Performance & Projection (${filteredSchools.length})`}
        selectable
        enableRowPinning
        enableColumnPinning
        striped
        inlineFilters
        rowActions={rowActions}
        showStats={false}
        className="border shadow-sm rounded-xl overflow-hidden"
      />
    </PageContainer>
  );
}

