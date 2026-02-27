"use client";

import { useEffect, useState } from "react";
import { Users, School, BookOpen, DollarSign, TrendingUp, CheckCircle2, AlertCircle, BarChart3, Filter, Calendar, RotateCcw, CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import PageContainer from "@/components/layouts/PageContainer";
import PageHeader from "@/components/layouts/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { DashboardSkeleton } from "@/components/ui/skeleton-loaders";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// Import mock data
import salesmenData from "@/lib/mock-data/salesmen.json";
import schoolsData from "@/lib/mock-data/schools.json";
import visitsData from "@/lib/mock-data/visits.json";
import tadaClaimsData from "@/lib/mock-data/tada-claims.json";
import feedbackData from "@/lib/mock-data/feedback.json";

// Enterprise chart palette — matches salesman dashboard
const COLORS = {
  primary: "#F47B20",   // brand orange
  success: "#2DD4BF",   // teal
  warning: "#94A3B8",   // slate
  danger: "#F43F5E",   // rose
  purple: "#818CF8",   // indigo
  cyan: "#38BDF8",   // sky
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// ─── Compact Month Picker ──────────────────────────────────────────────────────
function MonthPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const parsed = value ? value.split("-") : ["2025", "11"];
  const [year, setYear] = useState(parseInt(parsed[0]));
  const selMonth = value ? parseInt(parsed[1]) - 1 : -1;

  const label = value
    ? `${MONTHS[parseInt(value.split("-")[1]) - 1]} ${value.split("-")[0]}`
    : "Pick month";

  return (
    <div className="flex items-center gap-1.5 relative">
      <span className="text-xs text-muted-foreground shrink-0">Month:</span>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="h-8 w-36 flex items-center gap-2 rounded-md border border-input bg-background px-3 text-xs hover:bg-accent transition-colors"
      >
        <CalendarIcon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
        <span className={value ? "text-foreground" : "text-muted-foreground"}>{label}</span>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute top-10 left-0 z-50 bg-background border rounded-xl shadow-xl p-3 w-52">
            {/* Year nav */}
            <div className="flex items-center justify-between mb-2">
              <button type="button" onClick={() => setYear(y => y - 1)} className="h-7 w-7 rounded-full hover:bg-muted flex items-center justify-center">
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
              <span className="text-sm font-bold">{year}</span>
              <button type="button" onClick={() => setYear(y => y + 1)} className="h-7 w-7 rounded-full hover:bg-muted flex items-center justify-center">
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
            {/* Month grid */}
            <div className="grid grid-cols-3 gap-1">
              {MONTHS.map((m, i) => {
                const isSel = selMonth === i && parseInt(parsed[0]) === year;
                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => { onChange(`${year}-${String(i + 1).padStart(2, "0")}`); setOpen(false); }}
                    className={cn(
                      "text-xs py-1.5 rounded-lg font-medium transition-all",
                      isSel ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                    )}
                  >{m}</button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function AdminDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [stateFilter, setStateFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("today");
  const [monthFilter, setMonthFilter] = useState("2025-11");
  const [visitsFilter, setVisitsFilter] = useState("all");
  const [globalDateFilter, setGlobalDateFilter] = useState("2025-11-25");
  const [performanceFilter, setPerformanceFilter] = useState("all");

  const [stats, setStats] = useState({
    totalSalesmen: 0,
    totalSchools: 0,
    visitsToday: 0,
    pendingTADA: 0,
    totalSpecimenBudget: 0,
    specimenUsed: 0,
    blockedSchools: 0,
    pendingFeedback: 0,
  });

  // Chart data states
  const [teamPerformance, setTeamPerformance] = useState<any[]>([]);
  const [visitTrends, setVisitTrends] = useState<any[]>([]);
  const [visitsPerSalesman, setVisitsPerSalesman] = useState<any[]>([]);
  const [monthlyVisitsPerSalesman, setMonthlyVisitsPerSalesman] = useState<any[]>([]);
  const [specimenDetailData, setSpecimenDetailData] = useState<any[]>([]);

  useEffect(() => {
    setTimeout(() => {
      const todayVisits = visitsData.filter((v) => v.date.startsWith("2025-11"));

      setStats({
        totalSalesmen: salesmenData.length,
        totalSchools: schoolsData.length,
        visitsToday: todayVisits.length,
        pendingTADA: tadaClaimsData.filter((t) => t.status === "Pending").length,
        totalSpecimenBudget: salesmenData.reduce((sum, s) => sum + s.specimenBudget, 0),
        specimenUsed: salesmenData.reduce((sum, s) => sum + s.specimenUsed, 0),
        blockedSchools: schoolsData.filter((s) => s.isBlocked).length,
        pendingFeedback: feedbackData.filter((f) => f.status === "Pending").length,
      });

      const performanceData = salesmenData.map((salesman) => ({
        name: salesman.name.split(" ")[0],
        achieved: salesman.salesAchieved,
        target: salesman.salesTarget,
        achievement: Math.round((salesman.salesAchieved / salesman.salesTarget) * 100),
      }));
      setTeamPerformance(performanceData);

      const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
      const trendsData = days.map((day) => ({
        day,
        schools: Math.floor(Math.random() * 15) + 5,
        booksellers: Math.floor(Math.random() * 8) + 2,
        total: 0,
      }));
      trendsData.forEach(item => { item.total = item.schools + item.booksellers; });
      setVisitTrends(trendsData);

      updateVisitsData();
      updateMonthlyVisitsData();
      updateSpecimenDetailData();

      // Add dummy data for better visualization if data is insufficient
      if (visitsPerSalesman.length < 3) {
        const dummyVisits = [
          { name: "Amit", visits: 8, schoolVisits: 5, booksellerVisits: 3, state: "Demo" },
          { name: "Suresh", visits: 6, schoolVisits: 4, booksellerVisits: 2, state: "Demo" },
          { name: "Rahul", visits: 4, schoolVisits: 2, booksellerVisits: 2, state: "Demo" },
          { name: "Karan", visits: 3, schoolVisits: 2, booksellerVisits: 1, state: "Demo" },
          { name: "Deepak", visits: 0, schoolVisits: 0, booksellerVisits: 0, state: "Demo" },
          { name: "Manish", visits: 0, schoolVisits: 0, booksellerVisits: 0, state: "Demo" },
        ];
        setVisitsPerSalesman(prev => [...prev, ...dummyVisits].sort((a, b) => b.visits - a.visits));
      }

      if (monthlyVisitsPerSalesman.length < 3) {
        const dummyMonthly = [
          { name: "Amit", visits: 25, schoolVisits: 15, booksellerVisits: 10 },
          { name: "Suresh", visits: 20, schoolVisits: 12, booksellerVisits: 8 },
          { name: "Rahul", visits: 18, schoolVisits: 10, booksellerVisits: 8 },
          { name: "Karan", visits: 12, schoolVisits: 7, booksellerVisits: 5 },
          { name: "Deepak", visits: 0, schoolVisits: 0, booksellerVisits: 0 },
          { name: "Manish", visits: 0, schoolVisits: 0, booksellerVisits: 0 },
        ];
        setMonthlyVisitsPerSalesman(prev => [...prev, ...dummyMonthly].sort((a, b) => b.visits - a.visits));
      }

      setIsLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    if (!isLoading) updateVisitsData();
  }, [stateFilter, dateFilter, visitsFilter, globalDateFilter]);

  useEffect(() => {
    if (!isLoading) updateMonthlyVisitsData();
  }, [monthFilter, stateFilter]);

  useEffect(() => {
    if (!isLoading) updateSpecimenDetailData();
  }, [stateFilter]);

  useEffect(() => {
    if (!isLoading) updateTeamPerformanceData();
  }, [stateFilter, performanceFilter]);

  const updateTeamPerformanceData = () => {
    const filteredSalesmen = stateFilter === "all"
      ? salesmenData
      : salesmenData.filter(s => s.state === stateFilter);

    let performanceData = filteredSalesmen.map((salesman) => ({
      name: salesman.name.split(" ")[0],
      fullName: salesman.name,
      achieved: salesman.salesAchieved,
      target: salesman.salesTarget,
      achievement: Math.round((salesman.salesAchieved / salesman.salesTarget) * 100),
    }));

    // Add dummy data for better visualization
    if (performanceData.length < 3) {
      const dummyPerformance = [
        { name: "Ravi", fullName: "Ravi Kumar", achieved: 450000, target: 500000, achievement: 90 },
        { name: "Sanjay", fullName: "Sanjay Sharma", achieved: 380000, target: 500000, achievement: 76 },
        { name: "Neha", fullName: "Neha Gupta", achieved: 320000, target: 400000, achievement: 80 },
        { name: "Pooja", fullName: "Pooja Singh", achieved: 150000, target: 350000, achievement: 43 },
      ];
      performanceData = [...performanceData, ...dummyPerformance];
    }

    // Sort by achievement percentage
    performanceData.sort((a, b) => b.achievement - a.achievement);

    // Apply top filter
    if (performanceFilter === "top5") {
      performanceData = performanceData.slice(0, 5);
    } else if (performanceFilter === "top10") {
      performanceData = performanceData.slice(0, 10);
    }

    setTeamPerformance(performanceData);
  };

  const updateVisitsData = () => {
    const visitCounts = salesmenData.map((salesman) => {
      let salesmanVisits = visitsData.filter((v) => v.salesmanId === salesman.id);

      if (dateFilter === "today") {
        salesmanVisits = salesmanVisits.filter((v) => v.date === globalDateFilter);
      } else if (dateFilter === "yesterday") {
        salesmanVisits = salesmanVisits.filter((v) => v.date === "2025-11-24");
      } else if (dateFilter === "week") {
        salesmanVisits = salesmanVisits.filter((v) => v.date >= "2025-11-18");
      }

      if (stateFilter !== "all") {
        salesmanVisits = salesmanVisits.filter(() => salesman.state === stateFilter);
      }

      return {
        name: salesman.name.split(" ")[0],
        visits: salesmanVisits.length,
        schoolVisits: salesmanVisits.filter((v) => v.type === "school").length,
        booksellerVisits: salesmanVisits.filter((v) => v.type === "bookseller").length,
        state: salesman.state,
      };
    })
      .filter((s) => stateFilter === "all" || s.state === stateFilter)
      .filter((s) => {
        if (visitsFilter === "all") return true;
        if (visitsFilter === "0") return s.visits === 0;
        if (visitsFilter === "1-2") return s.visits >= 1 && s.visits <= 2;
        if (visitsFilter === "3-5") return s.visits >= 3 && s.visits <= 5;
        if (visitsFilter === "5+") return s.visits > 5;
        return true;
      });

    setVisitsPerSalesman(visitCounts.sort((a, b) => b.visits - a.visits));
  };

  const updateMonthlyVisitsData = () => {
    const filteredSalesmen = stateFilter === "all"
      ? salesmenData
      : salesmenData.filter(s => s.state === stateFilter);

    const monthlyVisits = filteredSalesmen.map((salesman) => {
      const salesmanVisits = visitsData.filter((v) =>
        v.salesmanId === salesman.id && v.date.startsWith(monthFilter)
      );

      return {
        name: salesman.name.split(" ")[0],
        visits: salesmanVisits.length,
        schoolVisits: salesmanVisits.filter((v) => v.type === "school").length,
        booksellerVisits: salesmanVisits.filter((v) => v.type === "bookseller").length,
      };
    });

    setMonthlyVisitsPerSalesman(monthlyVisits.sort((a, b) => b.visits - a.visits));
  };

  const updateSpecimenDetailData = () => {
    const filteredSalesmen = stateFilter === "all"
      ? salesmenData
      : salesmenData.filter(s => s.state === stateFilter);

    const specimenData = filteredSalesmen.map((salesman) => ({
      name: salesman.name.split(" ")[0],
      fullName: salesman.name,
      budget: salesman.specimenBudget,
      used: salesman.specimenUsed,
      remaining: salesman.specimenBudget - salesman.specimenUsed,
      utilization: Math.round((salesman.specimenUsed / salesman.specimenBudget) * 100),
      state: salesman.state,
    }));

    setSpecimenDetailData(specimenData.sort((a, b) => b.utilization - a.utilization));
  };

  if (isLoading) {
    return (
      <PageContainer>
        <DashboardSkeleton />
      </PageContainer>
    );
  }

  const states = Array.from(new Set(salesmenData.map((s) => s.state))).sort();

  const filteredSalesmen = stateFilter === "all"
    ? salesmenData
    : salesmenData.filter(s => s.state === stateFilter);

  const filteredSalesmenIds = new Set(filteredSalesmen.map(s => s.id));

  const filteredVisitsToday = visitsData.filter((v) =>
    v.date.startsWith("2025-11") &&
    (stateFilter === "all" || filteredSalesmenIds.has(v.salesmanId))
  );

  const filteredTADA = tadaClaimsData.filter((t) =>
    t.status === "Pending" &&
    (stateFilter === "all" || filteredSalesmenIds.has(t.salesmanId))
  );

  const filteredSpecimenBudget = filteredSalesmen.reduce((sum, s) => sum + s.specimenBudget, 0);
  const filteredSpecimenUsed = filteredSalesmen.reduce((sum, s) => sum + s.specimenUsed, 0);

  return (
    <PageContainer>
      <PageHeader
        title="Admin Dashboard"
        description="Overview of CRM operations"
      />

      {/* ── Hero summary bar ── */}
      <div className="gradient-hero rounded-2xl p-5 mb-6 text-white shadow-lg shadow-primary/25 relative overflow-hidden">
        <div className="absolute -top-8 -right-8 h-36 w-36 rounded-full bg-white/10" />
        <div className="absolute -bottom-6 -right-2 h-24 w-24 rounded-full bg-white/5" />
        <div className="relative">
          <p className="text-xs font-semibold uppercase tracking-widest text-white/70 mb-1">Team Overview</p>
          <p className="text-3xl font-black tracking-tight mb-1">{filteredSalesmen.length} Salesmen</p>
          <p className="text-sm text-white/80">
            {filteredVisitsToday.length} visits this month · <span className="font-bold text-white">{filteredTADA.length} pending TA/DA</span>
          </p>
          <div className="mt-4 flex items-center gap-4 text-xs text-white/70">
            <span>{stats.totalSchools} schools</span>
            <span>·</span>
            <span>{stats.blockedSchools} Blocked</span>
            <span>·</span>
            <span>{stats.pendingFeedback} feedback pending</span>
          </div>
        </div>
      </div>

      {/* ── KPI Cards — 2×2 on mobile, 4-col on desktop ── */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4 mb-6">
        <Card className="border-0 shadow-sm gradient-card-orange">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="p-1.5 rounded-lg bg-primary/10">
                <Users className="h-4 w-4 text-primary" />
              </div>
            </div>
            <p className="text-xl font-bold tracking-tight">{filteredSalesmen.length}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Sales Team</p>
            <div className="mt-2 pt-2 border-t border-border/50">
              <p className="text-xs text-muted-foreground truncate">
                {stateFilter === "all" ? "All states" : stateFilter}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm gradient-card-amber">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="p-1.5 rounded-lg bg-amber-100">
                <School className="h-4 w-4 text-amber-600" />
              </div>
            </div>
            <p className="text-xl font-bold tracking-tight">{stats.totalSchools}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Total Schools</p>
            <div className="mt-2 pt-2 border-t border-border/50">
              <p className="text-xs text-muted-foreground">
                <span className="font-semibold text-amber-600">{stats.blockedSchools}</span> Blocked
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm gradient-card-orange">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="p-1.5 rounded-lg bg-primary/10">
                <CheckCircle2 className="h-4 w-4 text-primary" />
              </div>
            </div>
            <p className="text-xl font-bold tracking-tight">{filteredVisitsToday.length}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Visits (Month)</p>
            <div className="mt-2 pt-2 border-t border-border/50">
              <p className="text-xs text-primary font-semibold">+15% vs last</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm gradient-card-neutral">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="p-1.5 rounded-lg bg-muted">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
            <p className="text-xl font-bold tracking-tight">{filteredTADA.length}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Pending TA/DA</p>
            <div className="mt-2 pt-2 border-t border-border/50">
              <p className="text-xs text-muted-foreground">Awaiting approval</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Global Filters ── */}
      <div className="mb-6 flex flex-wrap items-center gap-2 bg-card border rounded-xl px-4 py-2.5 shadow-sm">
        <Filter className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide shrink-0 mr-1">Filters</span>

        {/* State */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-muted-foreground shrink-0">State:</span>
          <Select value={stateFilter} onValueChange={setStateFilter}>
            <SelectTrigger className="h-8 w-36 text-xs">
              <SelectValue placeholder="All States" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All States</SelectItem>
              {states.map((state) => (
                <SelectItem key={state} value={state}>{state}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Visits */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-muted-foreground shrink-0">Visits:</span>
          <Select value={visitsFilter} onValueChange={setVisitsFilter}>
            <SelectTrigger className="h-8 w-32 text-xs">
              <SelectValue placeholder="All Visits" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Visits</SelectItem>
              <SelectItem value="0">0 Visits</SelectItem>
              <SelectItem value="1-2">1-2 Visits</SelectItem>
              <SelectItem value="3-5">3-5 Visits</SelectItem>
              <SelectItem value="5+">5+ Visits</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Date */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-muted-foreground shrink-0">Date:</span>
          <DatePicker
            value={globalDateFilter}
            onChange={(v) => setGlobalDateFilter(v || "2025-11-25")}
            placeholder="Pick date"
            className="h-8 w-36 text-xs"
          />
        </div>

        {/* Month */}
        <MonthPicker value={monthFilter} onChange={setMonthFilter} />

        {/* Reset */}
        <div className="ml-auto">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-xs text-muted-foreground hover:text-primary"
            onClick={() => {
              setStateFilter("all");
              setVisitsFilter("all");
              setGlobalDateFilter("2025-11-25");
              setMonthFilter("2025-11");
            }}
          >
            <RotateCcw className="h-3.5 w-3.5 mr-1" />
            Reset
          </Button>
        </div>
      </div>

      {/* ── Combined Visits Chart ── */}
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              SalesMan Visit
            </CardTitle>
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Daily View</SelectItem>
                <SelectItem value="yesterday">Yesterday</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">Monthly View</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart
              data={dateFilter === "month" ? monthlyVisitsPerSalesman : visitsPerSalesman}
              margin={{ top: 0, right: 8, left: -20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
              />
              <Legend wrapperStyle={{ fontSize: "12px" }} />
              <Bar dataKey="schoolVisits" stackId="a" fill={COLORS.primary} name="School Visits" radius={[0, 0, 0, 0]} />
              <Bar dataKey="booksellerVisits" stackId="a" fill={COLORS.success} name="Bookseller Visits" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* ── Specimen Budget ── */}
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Specimen Budget Utilization
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {specimenDetailData.map((salesman, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{salesman.fullName}</p>
                    <p className="text-xs text-muted-foreground">{salesman.state}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <Badge variant={
                      salesman.utilization >= 90 ? "destructive" :
                        salesman.utilization >= 75 ? "secondary" : "default"
                    }>
                      {salesman.utilization}%
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      ₹{(salesman.used / 1000).toFixed(1)}K / ₹{(salesman.budget / 1000).toFixed(1)}K
                    </p>
                  </div>
                </div>
                <Progress value={salesman.utilization} className="h-2" />
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Used: ₹{salesman.used.toLocaleString()}</span>
                  <span>Rem: ₹{salesman.remaining.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ── Team Sales Performance ── */}
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Team Sales Performance
            </CardTitle>
            <Select value={performanceFilter} onValueChange={setPerformanceFilter}>
              <SelectTrigger className="w-full sm:w-[140px]">
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Salesmen</SelectItem>
                <SelectItem value="top5">Top 5</SelectItem>
                <SelectItem value="top10">Top 10</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={teamPerformance} margin={{ top: 0, right: 8, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={(v) => `₹${(v / 100000).toFixed(0)}L`} tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip
                formatter={(value: any) => [`₹${(value / 100000).toFixed(2)}L`, ""]}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-background border rounded-lg p-3 shadow-lg">
                        <p className="font-medium text-sm mb-1">{data.fullName || data.name}</p>
                        <p className="text-xs text-muted-foreground mb-2">Achievement: <span className="font-bold text-primary">{data.achievement}%</span></p>
                        <p className="text-xs">Achieved: <span className="font-semibold">₹{(data.achieved / 100000).toFixed(2)}L</span></p>
                        <p className="text-xs">Target: <span className="font-semibold">₹{(data.target / 100000).toFixed(2)}L</span></p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend wrapperStyle={{ fontSize: "12px" }} />
              <Bar dataKey="achieved" fill={COLORS.success} name="Achieved" radius={[4, 4, 0, 0]} />
              <Bar dataKey="target" fill={COLORS.warning} name="Target" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* ── Visit Trends ── */}
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Visit Trends (Last 7 Days)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={visitTrends} margin={{ top: 0, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="day" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: "12px" }} />
              <Line type="monotone" dataKey="schools" stroke={COLORS.primary} strokeWidth={2} name="School" dot={false} />
              <Line type="monotone" dataKey="booksellers" stroke={COLORS.success} strokeWidth={2} name="Bookseller" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* ── Recent Activities ── */}
      <div className="grid gap-4 md:grid-cols-2 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Recent TA/DA Claims</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {tadaClaimsData.slice(0, 5).map((claim) => (
                <div key={claim.id} className="flex items-center justify-between p-3 rounded-xl border gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{claim.salesmanName}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      ₹{claim.amount.toLocaleString()} · {claim.city}
                    </p>
                  </div>
                  <Badge
                    variant={
                      claim.status === "Approved" ? "default" :
                        claim.status === "Rejected" || claim.status === "Flagged" ? "destructive" : "secondary"
                    }
                    className="shrink-0"
                  >
                    {claim.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Recent Feedback</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {feedbackData.slice(0, 5).map((feedback) => (
                <div key={feedback.id} className="flex items-center justify-between p-3 rounded-xl border gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{feedback.schoolName}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {feedback.category} · {feedback.salesmanName}
                    </p>
                  </div>
                  <Badge
                    variant={
                      feedback.status === "Resolved" ? "default" :
                        feedback.status === "Pending" ? "secondary" : "outline"
                    }
                    className="shrink-0"
                  >
                    {feedback.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

    </PageContainer >
  );
}
