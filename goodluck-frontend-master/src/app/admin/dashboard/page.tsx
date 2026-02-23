"use client";

import { useEffect, useState } from "react";
import { Users, School, BookOpen, DollarSign, TrendingUp, CheckCircle2, AlertCircle, BarChart3, Filter, Calendar } from "lucide-react";
import PageContainer from "@/components/layouts/PageContainer";
import PageHeader from "@/components/layouts/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DashboardSkeleton } from "@/components/ui/skeleton-loaders";
import { Progress } from "@/components/ui/progress";
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
  danger:  "#F43F5E",   // rose
  purple:  "#818CF8",   // indigo
  cyan:    "#38BDF8",   // sky
};

export default function AdminDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [stateFilter, setStateFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("today");
  const [monthFilter, setMonthFilter] = useState("2025-11");

  const [stats, setStats] = useState({
    totalSalesmen: 0,
    totalSchools: 0,
    visitsToday: 0,
    pendingTADA: 0,
    totalSpecimenBudget: 0,
    specimenUsed: 0,
    pattakatSchools: 0,
    pendingFeedback: 0,
  });

  // Chart data states
  const [teamPerformance, setTeamPerformance] = useState<any[]>([]);
  const [visitTrends, setVisitTrends] = useState<any[]>([]);
  const [visitsPerSalesman, setVisitsPerSalesman] = useState<any[]>([]);
  const [monthlyVisitsPerSalesman, setMonthlyVisitsPerSalesman] = useState<any[]>([]);
  const [salesmenNoVisitsYesterday, setSalesmenNoVisitsYesterday] = useState<any[]>([]);
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
        pattakatSchools: schoolsData.filter((s) => s.isPattakat).length,
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
      updateSalesmenNoVisitsYesterday();
      updateSpecimenDetailData();

      setIsLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    if (!isLoading) updateVisitsData();
  }, [stateFilter, dateFilter]);

  useEffect(() => {
    if (!isLoading) updateMonthlyVisitsData();
  }, [monthFilter, stateFilter]);

  useEffect(() => {
    if (!isLoading) updateSalesmenNoVisitsYesterday();
  }, [stateFilter]);

  useEffect(() => {
    if (!isLoading) updateSpecimenDetailData();
  }, [stateFilter]);

  useEffect(() => {
    if (!isLoading) updateTeamPerformanceData();
  }, [stateFilter]);

  const updateTeamPerformanceData = () => {
    const filteredSalesmen = stateFilter === "all"
      ? salesmenData
      : salesmenData.filter(s => s.state === stateFilter);

    const performanceData = filteredSalesmen.map((salesman) => ({
      name: salesman.name.split(" ")[0],
      achieved: salesman.salesAchieved,
      target: salesman.salesTarget,
      achievement: Math.round((salesman.salesAchieved / salesman.salesTarget) * 100),
    }));
    setTeamPerformance(performanceData);
  };

  const updateVisitsData = () => {
    const visitCounts = salesmenData.map((salesman) => {
      let salesmanVisits = visitsData.filter((v) => v.salesmanId === salesman.id);

      if (dateFilter === "today") {
        salesmanVisits = salesmanVisits.filter((v) => v.date === "2025-11-25");
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
        state: salesman.state,
      };
    }).filter((s) => stateFilter === "all" || s.state === stateFilter);

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

  const updateSalesmenNoVisitsYesterday = () => {
    const yesterday = "2025-11-24";
    const filteredSalesmen = stateFilter === "all"
      ? salesmenData
      : salesmenData.filter(s => s.state === stateFilter);

    const salesmenWithNoVisits = filteredSalesmen.filter((salesman) => {
      const yesterdayVisits = visitsData.filter((v) =>
        v.salesmanId === salesman.id && v.date === yesterday
      );
      return yesterdayVisits.length === 0;
    }).map((salesman) => ({
      id: salesman.id,
      name: salesman.name,
      state: salesman.state,
      region: salesman.region,
    }));

    setSalesmenNoVisitsYesterday(salesmenWithNoVisits);
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
            <span>{stats.pattakatSchools} Pattakat</span>
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
                <span className="font-semibold text-amber-600">{stats.pattakatSchools}</span> Pattakat
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
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Global Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex items-center gap-2 flex-1">
              <span className="text-sm font-medium shrink-0">State:</span>
              <Select value={stateFilter} onValueChange={setStateFilter}>
                <SelectTrigger className="flex-1 sm:w-[180px] sm:flex-none">
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
          </div>
        </CardContent>
      </Card>

      {/* ── Visits per Salesman (with Date Filter) ── */}
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Visits per Salesman
            </CardTitle>
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="yesterday">Yesterday</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={visitsPerSalesman} margin={{ top: 0, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip />
              <Bar dataKey="visits" fill={COLORS.primary} name="Visits" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* ── Salesmen with No Visits Yesterday ── */}
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-destructive" />
            No Visits Yesterday
            <Badge variant="destructive" className="ml-auto">{salesmenNoVisitsYesterday.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {salesmenNoVisitsYesterday.length === 0 ? (
            <p className="text-center py-6 text-sm text-muted-foreground">All salesmen had visits yesterday!</p>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart
                  data={salesmenNoVisitsYesterday.map((s) => ({
                    name: s.name.split(" ")[0],
                    fullName: s.name,
                    noVisits: 1,
                    region: s.region,
                    state: s.state,
                  }))}
                  layout="vertical"
                  margin={{ top: 0, right: 8, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                  <XAxis type="number" hide />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={80}
                    tick={{ fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-background border rounded-lg p-3 shadow-lg">
                            <p className="font-medium text-sm">{payload[0].payload.fullName}</p>
                            <p className="text-xs text-muted-foreground">{payload[0].payload.region}, {payload[0].payload.state}</p>
                            <p className="text-xs text-destructive font-medium mt-1">No visits yesterday</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="noVisits" fill={COLORS.danger} name="No Visits" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>

              <div className="mt-4 pt-4 border-t">
                <p className="text-xs font-medium text-muted-foreground mb-3">Details</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {salesmenNoVisitsYesterday.map((salesman) => (
                    <div key={salesman.id} className="p-3 rounded-xl border border-destructive/20 bg-destructive/5">
                      <p className="text-sm font-medium">{salesman.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{salesman.region}, {salesman.state}</p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* ── Total Visits per Salesman (Monthly) ── */}
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Monthly Visits
            </CardTitle>
            <Select value={monthFilter} onValueChange={setMonthFilter}>
              <SelectTrigger className="w-full sm:w-[160px]">
                <SelectValue placeholder="Select month" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2025-11">November 2025</SelectItem>
                <SelectItem value="2025-10">October 2025</SelectItem>
                <SelectItem value="2025-09">September 2025</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={monthlyVisitsPerSalesman} margin={{ top: 0, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: "12px" }} />
              <Bar dataKey="schoolVisits" stackId="a" fill={COLORS.primary} name="School" radius={[0, 0, 0, 0]} />
              <Bar dataKey="booksellerVisits" stackId="a" fill={COLORS.success} name="Bookseller" radius={[4, 4, 0, 0]} />
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
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Team Sales Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={teamPerformance} margin={{ top: 0, right: 8, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={(v) => `₹${(v / 100000).toFixed(0)}L`} tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(value: any) => [`₹${(value / 100000).toFixed(2)}L`, ""]} />
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

      {/* ── Salesman Performance Overview ── */}
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Salesman Performance Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {salesmenData
              .filter((s) => stateFilter === "all" || s.state === stateFilter)
              .map((salesman) => {
                const achievement = Math.round((salesman.salesAchieved / salesman.salesTarget) * 100);
                return (
                  <div key={salesman.id} className="flex items-center justify-between p-3 rounded-xl border gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{salesman.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{salesman.region} · {salesman.state}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <Badge variant={achievement >= 75 ? "default" : achievement >= 50 ? "secondary" : "destructive"}>
                        {achievement}%
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        ₹{(salesman.salesAchieved / 100000).toFixed(1)}L / ₹{(salesman.salesTarget / 100000).toFixed(1)}L
                      </p>
                    </div>
                  </div>
                );
              })}
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
