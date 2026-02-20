"use client";

import { useEffect, useState } from "react";
import { Users, School, BookOpen, DollarSign, TrendingUp, CheckCircle2, AlertCircle, BarChart3, Filter, Calendar } from "lucide-react";
import PageContainer from "@/components/layouts/PageContainer";
import PageHeader from "@/components/layouts/PageHeader";
import StatsCard from "@/components/dashboard/StatsCard";
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
  AreaChart,
  Area,
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

// Colors for charts
const COLORS = {
  primary: "#3b82f6",
  success: "#10b981",
  warning: "#f59e0b",
  danger: "#ef4444",
  purple: "#8b5cf6",
  cyan: "#06b6d4",
  indigo: "#6366f1",
  pink: "#ec4899",
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
    // Simulate data loading
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

      // Team Performance Chart Data
      const performanceData = salesmenData.map((salesman) => ({
        name: salesman.name.split(" ")[0],
        achieved: salesman.salesAchieved,
        target: salesman.salesTarget,
        achievement: Math.round((salesman.salesAchieved / salesman.salesTarget) * 100),
      }));
      setTeamPerformance(performanceData);

      // Visit Trends (Last 7 days)
      const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
      const trendsData = days.map((day) => ({
        day,
        schools: Math.floor(Math.random() * 15) + 5,
        booksellers: Math.floor(Math.random() * 8) + 2,
        total: 0,
      }));
      trendsData.forEach(item => {
        item.total = item.schools + item.booksellers;
      });
      setVisitTrends(trendsData);

      updateVisitsData();
      updateMonthlyVisitsData();
      updateSalesmenNoVisitsYesterday();
      updateSpecimenDetailData();

      setIsLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    if (!isLoading) {
      updateVisitsData();
    }
  }, [stateFilter, dateFilter]);

  useEffect(() => {
    if (!isLoading) {
      updateMonthlyVisitsData();
    }
  }, [monthFilter, stateFilter]);

  useEffect(() => {
    if (!isLoading) {
      updateSalesmenNoVisitsYesterday();
    }
  }, [stateFilter]);

  useEffect(() => {
    if (!isLoading) {
      updateSpecimenDetailData();
    }
  }, [stateFilter]);

  useEffect(() => {
    if (!isLoading) {
      updateTeamPerformanceData();
    }
  }, [stateFilter]);

  const updateTeamPerformanceData = () => {
    // Team Performance Chart Data - filtered by state
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
    // Visits per Salesman (filtered by date)
    const visitCounts = salesmenData.map((salesman) => {
      let salesmanVisits = visitsData.filter((v) => v.salesmanId === salesman.id);

      // Apply date filter
      if (dateFilter === "today") {
        salesmanVisits = salesmanVisits.filter((v) => v.date === "2025-11-25");
      } else if (dateFilter === "yesterday") {
        salesmanVisits = salesmanVisits.filter((v) => v.date === "2025-11-24");
      } else if (dateFilter === "week") {
        salesmanVisits = salesmanVisits.filter((v) => v.date >= "2025-11-18");
      }

      // Apply state filter
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
    // Total Visits per Salesman (Monthly) - filtered by state
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
    // Salesmen with No Visits Yesterday - filtered by state
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
    // Specimen Target vs Used Budget (Detailed) - filtered by state
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

  // Get unique states for filter
  const states = Array.from(new Set(salesmenData.map((s) => s.state))).sort();

  // Calculate filtered stats based on state filter
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
        description="Overview of CRM operations and performance"
      />

      {/* Top Stats - KPI Cards First */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <StatsCard
          title="Sales Team"
          value={filteredSalesmen.length}
          description={stateFilter === "all" ? "Active salesmen" : `Salesmen in ${stateFilter}`}
          icon={Users}
        />
        <StatsCard
          title="Total Schools"
          value={stats.totalSchools}
          description={`${stats.pattakatSchools} Pattakat schools`}
          icon={School}
        />
        <StatsCard
          title="Visits Today"
          value={filteredVisitsToday.length}
          description="School & bookseller visits"
          icon={CheckCircle2}
          trend={{ value: 15, isPositive: true }}
        />
        <StatsCard
          title="Pending TA/DA"
          value={filteredTADA.length}
          description="Awaiting approval"
          icon={DollarSign}
        />
      </div>

      {/* State-wise Filter - After KPI Cards */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Global Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">State:</span>
              <Select value={stateFilter} onValueChange={setStateFilter}>
                <SelectTrigger className="w-[180px]">
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

      {/* Visits per Salesman (with Date Filter) */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Visits per Salesman
            </CardTitle>
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-[150px]">
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
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={visitsPerSalesman}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="visits" fill={COLORS.primary} name="Number of Visits" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Salesmen with No Visits Yesterday */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            Salesmen with No Visits Yesterday ({salesmenNoVisitsYesterday.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {salesmenNoVisitsYesterday.length === 0 ? (
            <p className="text-center py-4 text-muted-foreground">All salesmen had visits yesterday!</p>
          ) : (
            <>
              {/* Bar Chart Visualization */}
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={salesmenNoVisitsYesterday.map((s) => ({
                  name: s.name.split(" ")[0],
                  fullName: s.name,
                  noVisits: 1,
                  region: s.region,
                  state: s.state,
                }))} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" hide />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={100}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-background border rounded-lg p-3 shadow-lg">
                            <p className="font-medium">{payload[0].payload.fullName}</p>
                            <p className="text-sm text-muted-foreground">
                              {payload[0].payload.region}, {payload[0].payload.state}
                            </p>
                            <p className="text-sm text-destructive font-medium mt-1">
                              No visits yesterday
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="noVisits" fill={COLORS.danger} name="No Visits" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>

              {/* Details List Below Chart */}
              <div className="mt-4 pt-4 border-t">
                <h4 className="text-sm font-medium mb-3">Details:</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {salesmenNoVisitsYesterday.map((salesman) => (
                    <div key={salesman.id} className="p-2 rounded-lg border border-destructive/20 bg-destructive/5 text-sm">
                      <p className="font-medium">{salesman.name}</p>
                      <p className="text-xs text-muted-foreground">{salesman.region}, {salesman.state}</p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Total Visits per Salesman (Monthly) */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Total Visits per Salesman (Monthly)
            </CardTitle>
            <Select value={monthFilter} onValueChange={setMonthFilter}>
              <SelectTrigger className="w-[150px]">
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
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={monthlyVisitsPerSalesman}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="schoolVisits" stackId="a" fill={COLORS.primary} name="School Visits" />
              <Bar dataKey="booksellerVisits" stackId="a" fill={COLORS.success} name="Bookseller Visits" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Specimen Target vs Used Budget (Detailed) */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Specimen Target vs Used Budget (Detailed)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {specimenDetailData.map((salesman, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{salesman.fullName}</p>
                    <p className="text-xs text-muted-foreground">{salesman.state}</p>
                  </div>
                  <div className="text-right">
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
                  <span>Remaining: ₹{salesman.remaining.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Team Performance Chart - Bar Chart */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Team Sales Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={teamPerformance}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis tickFormatter={(value) => `₹${(value / 100000).toFixed(0)}L`} />
              <Tooltip
                formatter={(value: any) => [`₹${(value / 100000).toFixed(2)}L`, ""]}
                labelStyle={{ color: "#000" }}
              />
              <Legend />
              <Bar dataKey="achieved" fill={COLORS.success} name="Achieved" />
              <Bar dataKey="target" fill={COLORS.primary} name="Target" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Visit Trends */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Visit Trends (Last 7 Days)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={visitTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="schools"
                stroke={COLORS.primary}
                strokeWidth={2}
                name="School Visits"
              />
              <Line
                type="monotone"
                dataKey="booksellers"
                stroke={COLORS.success}
                strokeWidth={2}
                name="Bookseller Visits"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Recent Activities */}
      <div className="grid gap-4 md:grid-cols-2 mb-6">
        {/* Recent TA/DA Claims */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent TA/DA Claims</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {tadaClaimsData.slice(0, 5).map((claim) => (
                <div key={claim.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <p className="font-medium">{claim.salesmanName}</p>
                    <p className="text-sm text-muted-foreground">
                      ₹{claim.amount.toLocaleString()} - {claim.city}
                    </p>
                  </div>
                  <Badge
                    variant={
                      claim.status === "Approved"
                        ? "default"
                        : claim.status === "Rejected"
                        ? "destructive"
                        : claim.status === "Flagged"
                        ? "destructive"
                        : "secondary"
                    }
                  >
                    {claim.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Feedback */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Feedback</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {feedbackData.slice(0, 5).map((feedback) => (
                <div key={feedback.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{feedback.schoolName}</p>
                    <p className="text-sm text-muted-foreground truncate">
                      {feedback.category} - {feedback.salesmanName}
                    </p>
                  </div>
                  <Badge
                    variant={
                      feedback.status === "Resolved"
                        ? "default"
                        : feedback.status === "Pending"
                        ? "secondary"
                        : "outline"
                    }
                    className="ml-2"
                  >
                    {feedback.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Salesman Performance Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Salesman Performance Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {salesmenData
              .filter((s) => stateFilter === "all" || s.state === stateFilter)
              .map((salesman) => {
                const achievement = Math.round((salesman.salesAchieved / salesman.salesTarget) * 100);
                return (
                  <div key={salesman.id} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex-1">
                      <p className="font-medium">{salesman.name}</p>
                      <p className="text-sm text-muted-foreground">{salesman.region} - {salesman.state}</p>
                    </div>
                    <div className="text-right">
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
