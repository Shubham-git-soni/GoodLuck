"use client";

import { useEffect, useState } from "react";
import { Target, BookOpen, CheckCircle2, Calendar, AlertCircle, Users, Wallet, DollarSign, MapPin, Clock, ChevronRight, ArrowRight } from "lucide-react";
import PageContainer from "@/components/layouts/PageContainer";
import PageHeader from "@/components/layouts/PageHeader";
import ProgressCard from "@/components/dashboard/ProgressCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DashboardSkeleton } from "@/components/ui/skeleton-loaders";
import Link from "next/link";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  RadialBarChart,
  RadialBar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// Import mock data
import salesmenData from "@/lib/mock-data/salesmen.json";
import notificationsData from "@/lib/mock-data/notifications.json";
import visitsData from "@/lib/mock-data/visits.json";
import schoolsData from "@/lib/mock-data/schools.json";

// Enterprise chart palette — orange accent + professional neutrals
const COLORS = {
  primary: "#F47B20",   // brand orange (primary)
  success: "#2DD4BF",   // teal — achieved/positive
  warning: "#94A3B8",   // slate — remaining/neutral
  danger: "#F43F5E",   // rose — alert/violation
  purple: "#818CF8",   // indigo — secondary metric
  cyan: "#38BDF8",   // sky — tertiary metric
};

export default function SalesmanDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [salesmanData, setSalesmanData] = useState<any>(null);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [visitStats, setVisitStats] = useState({
    schoolVisitsToday: 0,
    bookSellerVisitsToday: 0,
    pendingNextVisits: 0,
  });
  const [schoolStats, setSchoolStats] = useState({
    visitedTwice: 0,
    yetToVisit: 0,
    total: 120,
  });

  const [nextScheduledVisits, setNextScheduledVisits] = useState<any[]>([]);

  // Chart data states
  const [monthlyPerformance, setMonthlyPerformance] = useState<any[]>([]);
  const [visitDistribution, setVisitDistribution] = useState<any[]>([]);
  const [schoolCoverage, setSchoolCoverage] = useState<any[]>([]);

  useEffect(() => {
    // Simulate data loading
    setTimeout(() => {
      // Get salesman data (using first salesman as example)
      const salesman = salesmenData[0];
      setSalesmanData(salesman);

      // Get unread notifications
      const userNotifications = notificationsData
        .filter((n) => n.userId === salesman.id && !n.read)
        .slice(0, 5);
      setAlerts(userNotifications);

      // Calculate visit stats (mock data)
      const today = new Date().toISOString().split("T")[0];
      const todayVisits = visitsData.filter(
        (v) => v.salesmanId === salesman.id && v.date.startsWith("2025-11")
      );

      setVisitStats({
        schoolVisitsToday: todayVisits.filter((v) => v.type === "school").length,
        bookSellerVisitsToday: todayVisits.filter((v) => v.type === "bookseller").length,
        pendingNextVisits: visitsData.filter(
          (v) => v.status === "Scheduled" && v.salesmanId === salesman.id
        ).length,
      });

      // Next scheduled visits — derived from nextVisit field on completed visits
      const upcomingVisits = visitsData
        .filter((v) => v.salesmanId === salesman.id && v.nextVisit?.date)
        .map((v) => ({
          id: v.id,
          schoolName: v.schoolName,
          date: v.nextVisit?.date || "",
          purpose: v.nextVisit?.purpose || "",
          type: v.type,
        }))
        .filter((v) => v.date >= new Date().toISOString().split("T")[0])
        .sort((a, b) => a.date.localeCompare(b.date))
        .slice(0, 5);

      // If no real upcoming data, add sensible mock entries
      const fallbackVisits = [
        { id: "NV1", schoolName: "Delhi Public School", date: "2025-12-20", purpose: "Follow-Up", type: "school" },
        { id: "NV2", schoolName: "Ryan International School", date: "2025-12-22", purpose: "Specimen Distribution", type: "school" },
        { id: "NV3", schoolName: "Modern Book Depot", date: "2025-12-24", purpose: "Order Collection", type: "bookseller" },
        { id: "NV4", schoolName: "St. Mary's School", date: "2025-12-26", purpose: "Need Mapping", type: "school" },
        { id: "NV5", schoolName: "City Booksellers", date: "2025-12-28", purpose: "Relationship Building", type: "bookseller" },
      ];
      setNextScheduledVisits(upcomingVisits.length > 0 ? upcomingVisits : fallbackVisits);

      // Calculate school stats
      const assignedSchools = schoolsData.filter((s) => s.assignedTo === salesman.id);
      setSchoolStats({
        visitedTwice: assignedSchools.filter((s) => s.visitCount >= 2).length,
        yetToVisit: assignedSchools.filter((s) => s.visitCount === 0).length,
        total: assignedSchools.length,
      });

      // Generate monthly performance data (last 6 months)
      const months = ["Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const performanceData = months.map((month, index) => {
        const baseAchieved = 600000 + index * 80000;
        const baseTarget = 800000 + index * 50000;
        return {
          month,
          achieved: baseAchieved,
          target: baseTarget,
          achievementRate: Math.round((baseAchieved / baseTarget) * 100),
        };
      });
      setMonthlyPerformance(performanceData);

      // Visit distribution data
      const schoolVisitCount = visitsData.filter(
        (v) => v.salesmanId === salesman.id && v.type === "school"
      ).length;
      const booksellerVisitCount = visitsData.filter(
        (v) => v.salesmanId === salesman.id && v.type === "bookseller"
      ).length;

      setVisitDistribution([
        { name: "School Visits", value: schoolVisitCount, color: COLORS.primary },
        { name: "Bookseller Visits", value: booksellerVisitCount, color: COLORS.success },
      ]);

      // School coverage data
      const visited = assignedSchools.filter((s) => s.visitCount >= 2).length;
      const visitedOnce = assignedSchools.filter((s) => s.visitCount === 1).length;
      const notVisited = assignedSchools.filter((s) => s.visitCount === 0).length;

      setSchoolCoverage([
        { name: "Visited 2+ times", value: visited, fill: COLORS.success },
        { name: "Visited once", value: visitedOnce, fill: COLORS.warning },
        { name: "Yet to visit", value: notVisited, fill: COLORS.danger },
      ]);

      setIsLoading(false);
    }, 1000);
  }, []);

  if (isLoading) {
    return (
      <PageContainer>
        <DashboardSkeleton />
      </PageContainer>
    );
  }

  const salesPercentage = Math.round((salesmanData.salesAchieved / salesmanData.salesTarget) * 100);
  const specimenPercentage = Math.round((salesmanData.specimenUsed / salesmanData.specimenBudget) * 100);

  return (
    <PageContainer>
      <PageHeader
        title="Dashboard"
        description={`Welcome back, ${salesmanData.name}!`}
      />

      {/* ── Airwallex-style Hero Card ── */}
      <div className="gradient-hero rounded-2xl p-5 mb-6 text-white shadow-lg shadow-primary/25 relative overflow-hidden">
        {/* Decorative circle */}
        <div className="absolute -top-8 -right-8 h-36 w-36 rounded-full bg-white/10" />
        <div className="absolute -bottom-6 -right-2 h-24 w-24 rounded-full bg-white/5" />

        <div className="relative">
          <p className="text-xs font-semibold uppercase tracking-widest text-white/70 mb-1">
            Sales Achievement
          </p>
          <p className="text-3xl font-black tracking-tight mb-1">
            ₹{(salesmanData.salesAchieved / 100000).toFixed(1)}L
          </p>
          <p className="text-sm text-white/80">
            of ₹{(salesmanData.salesTarget / 100000).toFixed(1)}L target · <span className="font-bold text-white">{salesPercentage}%</span>
          </p>

          {/* Progress bar */}
          <div className="mt-4 h-1.5 rounded-full bg-white/20">
            <div
              className="h-1.5 rounded-full bg-white transition-all"
              style={{ width: `${Math.min(salesPercentage, 100)}%` }}
            />
          </div>

          <div className="flex items-center justify-between mt-3">
            <p className="text-xs text-white/70">Welcome back, {salesmanData.name}</p>
            <Link href="/salesman/schools/add-visit">
              <span className="text-xs font-bold bg-white/20 hover:bg-white/30 transition-colors px-3 py-1.5 rounded-full">
                + Add Visit
              </span>
            </Link>
          </div>
        </div>
      </div>

      {/* Top Stats Cards — 2×2 on mobile, 4-col on desktop */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4 mb-6">
        <Card className="border-0 shadow-sm gradient-card-orange">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="p-1.5 rounded-lg bg-primary/10">
                <Target className="h-4 w-4 text-primary" />
              </div>
              <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                {salesPercentage}%
              </span>
            </div>
            <p className="text-xl font-bold tracking-tight">
              ₹{(salesmanData.salesTarget / 100000).toFixed(1)}L
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">Sales Target</p>
            <div className="mt-2 pt-2 border-t border-border/50">
              <p className="text-xs text-muted-foreground">
                Achieved <span className="font-semibold text-primary">₹{(salesmanData.salesAchieved / 100000).toFixed(1)}L</span>
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm gradient-card-amber">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-900/30">
                <BookOpen className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              </div>
              <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30 px-2 py-0.5 rounded-full">
                {specimenPercentage}%
              </span>
            </div>
            <p className="text-xl font-bold tracking-tight">
              ₹{(salesmanData.specimenBudget / 100000).toFixed(1)}L
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">Specimen Budget</p>
            <div className="mt-2 pt-2 border-t border-border/50">
              <p className="text-xs text-muted-foreground">
                Remaining <span className="font-semibold text-amber-600">₹{((salesmanData.specimenBudget - salesmanData.specimenUsed) / 100000).toFixed(1)}L</span>
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm gradient-card-orange">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="p-1.5 rounded-lg bg-primary/10">
                <DollarSign className="h-4 w-4 text-primary" />
              </div>
              <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                {specimenPercentage}%
              </span>
            </div>
            <p className="text-xl font-bold tracking-tight">
              ₹{(salesmanData.specimenUsed / 100000).toFixed(1)}L
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">Utilized Budget</p>
            <div className="mt-2 pt-2 border-t border-border/50">
              <p className="text-xs text-muted-foreground">
                Of <span className="font-semibold">₹{(salesmanData.specimenBudget / 100000).toFixed(1)}L</span>
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm gradient-card-neutral">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="p-1.5 rounded-lg bg-muted">
                <Wallet className="h-4 w-4 text-muted-foreground" />
              </div>
              <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                85%
              </span>
            </div>
            <p className="text-xl font-bold tracking-tight">
              ₹{(850000 / 100000).toFixed(1)}L
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">Payment Collection</p>
            <div className="mt-2 pt-2 border-t border-border/50">
              <p className="text-xs text-muted-foreground">
                Target <span className="font-semibold">₹{(1000000 / 100000).toFixed(1)}L</span>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 - Target Achievement & Specimen Budget */}
      <div className="grid gap-4 md:grid-cols-2 mb-6">
        {/* Target Achievement - Donut */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              Target Achievement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={[
                    { name: "Achieved", value: salesmanData.salesAchieved },
                    { name: "Remaining", value: salesmanData.salesTarget - salesmanData.salesAchieved },
                  ]}
                  cx="50%" cy="50%"
                  innerRadius={60} outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                  stroke="none"
                >
                  <Cell fill={COLORS.primary} />
                  <Cell fill="#94a3b8" />
                </Pie>
                <Tooltip
                  formatter={(value: any) => `₹${(value / 100000).toFixed(2)}L`}
                  contentStyle={{ borderRadius: "10px", border: "1px solid #e5e7eb", fontSize: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 mt-1">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: COLORS.primary }} />
                  <span className="text-muted-foreground">Achieved</span>
                </div>
                <span className="font-semibold text-foreground">₹{(salesmanData.salesAchieved / 100000).toFixed(1)}L <span className="text-primary font-bold">({salesPercentage}%)</span></span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-sm bg-slate-400" />
                  <span className="text-muted-foreground">Remaining</span>
                </div>
                <span className="font-semibold text-foreground">₹{((salesmanData.salesTarget - salesmanData.salesAchieved) / 100000).toFixed(1)}L</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Specimen Budget - Donut */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-primary" />
              Specimen Budget Utilization
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={[
                    { name: "Used", value: salesmanData.specimenUsed },
                    { name: "Remaining", value: salesmanData.specimenBudget - salesmanData.specimenUsed },
                  ]}
                  cx="50%" cy="50%"
                  innerRadius={60} outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                  stroke="none"
                >
                  <Cell fill={COLORS.success} />
                  <Cell fill="#94a3b8" />
                </Pie>
                <Tooltip
                  formatter={(value: any) => `₹${(value / 100000).toFixed(2)}L`}
                  contentStyle={{ borderRadius: "10px", border: "1px solid #e5e7eb", fontSize: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 mt-1">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: COLORS.success }} />
                  <span className="text-muted-foreground">Used</span>
                </div>
                <span className="font-semibold text-foreground">₹{(salesmanData.specimenUsed / 100000).toFixed(1)}L <span className="font-bold" style={{ color: COLORS.success }}>({specimenPercentage}%)</span></span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-sm bg-slate-400" />
                  <span className="text-muted-foreground">Remaining</span>
                </div>
                <span className="font-semibold text-foreground">₹{((salesmanData.specimenBudget - salesmanData.specimenUsed) / 100000).toFixed(1)}L</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Visit Distribution + Today's Summary — same row */}
      <div className="grid gap-4 md:grid-cols-2 mb-6">
        {/* Visit Distribution - Donut */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-primary" />
              Visit Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={visitDistribution}
                  cx="50%" cy="50%"
                  innerRadius={60} outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                  stroke="none"
                >
                  {visitDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ borderRadius: "10px", border: "1px solid #e5e7eb", fontSize: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 mt-1">
              {visitDistribution.map((item, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: item.color }} />
                    <span className="text-muted-foreground">{item.name}</span>
                  </div>
                  <span className="font-semibold text-foreground">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Today's Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Today's Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-xl bg-primary/5 border border-primary/10">
              <div>
                <p className="text-xs text-muted-foreground">School Visits</p>
                <p className="text-2xl font-bold">{visitStats.schoolVisitsToday}</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-primary" />
              </div>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
              <div>
                <p className="text-xs text-muted-foreground">Bookseller Visits</p>
                <p className="text-2xl font-bold">{visitStats.bookSellerVisitsToday}</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-muted-foreground" />
              </div>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-amber-50 border border-amber-100 dark:bg-amber-950/20 dark:border-amber-900/30">
              <div>
                <p className="text-xs text-muted-foreground">Pending Next Visits</p>
                <p className="text-2xl font-bold">{visitStats.pendingNextVisits}</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Alerts — full width */}
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-primary" />
            Recent Alerts
          </CardTitle>
          <Link href="/salesman/notifications">
            <Button variant="ghost" size="sm" className="h-8 text-xs gap-1 text-primary">
              View All <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="pt-0">
          {alerts.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No new alerts
            </p>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-start gap-3 p-3 rounded-xl border hover:bg-muted/50 transition-colors cursor-pointer"
                >
                  <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${alert.priority === "high" ? "bg-destructive/10" :
                    alert.priority === "medium" ? "bg-primary/10" : "bg-muted"
                    }`}>
                    <AlertCircle className={`h-4 w-4 ${alert.priority === "high" ? "text-destructive" :
                      alert.priority === "medium" ? "text-primary" : "text-muted-foreground"
                      }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{alert.title}</p>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                      {alert.message}
                    </p>
                  </div>
                  <Badge
                    variant={alert.priority === "high" ? "destructive" : "secondary"}
                    className="text-xs shrink-0"
                  >
                    {alert.priority}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Next Scheduled Visits ── */}
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              Next Scheduled Visits
            </CardTitle>
            <Link href="/salesman/tour-plans">
              <Button variant="ghost" size="sm" className="h-8 text-xs gap-1 text-primary">
                View All <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {nextScheduledVisits.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No upcoming visits scheduled</p>
            </div>
          ) : (
            <div className="space-y-2">
              {nextScheduledVisits.map((visit, index) => {
                const visitDate = new Date(visit.date);
                const day = visitDate.toLocaleDateString("en-IN", { day: "2-digit" });
                const month = visitDate.toLocaleDateString("en-IN", { month: "short" });
                const weekday = visitDate.toLocaleDateString("en-IN", { weekday: "short" });
                const isSchool = visit.type === "school";
                return (
                  <div
                    key={visit.id}
                    className="flex items-center gap-3 p-3 rounded-xl bg-muted/40 hover:bg-muted/70 transition-colors"
                  >
                    {/* Date badge */}
                    <div className={`flex flex-col items-center justify-center h-12 w-12 rounded-xl shrink-0 ${isSchool ? "bg-primary/10" : "bg-amber-100"}`}>
                      <span className={`text-[10px] font-bold uppercase ${isSchool ? "text-primary" : "text-amber-600"}`}>{month}</span>
                      <span className={`text-lg font-black leading-tight ${isSchool ? "text-primary" : "text-amber-600"}`}>{day}</span>
                      <span className={`text-[9px] font-medium ${isSchool ? "text-primary/60" : "text-amber-500"}`}>{weekday}</span>
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{visit.schoolName}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${isSchool ? "bg-primary/10 text-primary" : "bg-amber-100 text-amber-700"}`}>
                          {isSchool ? "School" : "Bookseller"}
                        </span>
                        <span className="text-[11px] text-muted-foreground truncate">{visit.purpose}</span>
                      </div>
                    </div>

                    <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Monthly Sales Performance Chart - Bar Chart */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            Monthly Sales Performance (Last 6 Months)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyPerformance} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 12, fill: "#94a3b8" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tickFormatter={(value) => `₹${(value / 100000).toFixed(0)}L`}
                tick={{ fontSize: 12, fill: "#94a3b8" }}
                axisLine={false}
                tickLine={false}
                width={52}
              />
              <Tooltip
                formatter={(value: any) => [`₹${(value / 100000).toFixed(2)}L`, ""]}
                contentStyle={{ borderRadius: "12px", border: "1px solid #e5e7eb", boxShadow: "0 4px 12px rgba(0,0,0,0.08)", fontSize: "13px" }}
                cursor={{ fill: "rgba(0,0,0,0.03)" }}
              />
              <Legend wrapperStyle={{ fontSize: "13px", paddingTop: "12px" }} />
              <Bar dataKey="achieved" fill={COLORS.primary} name="Achieved" radius={[4, 4, 0, 0]} />
              <Bar dataKey="target" fill="#94a3b8" name="Target" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Quick Actions — desktop only (mobile uses the sticky bottom bar) */}
      <Card className="hidden md:block">
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-3">
            <Link href="/salesman/schools/add-visit">
              <Button variant="outline" className="w-full h-auto flex-col py-4">
                <BookOpen className="h-5 w-5 mb-2" />
                <span className="text-sm">Add Visit</span>
              </Button>
            </Link>
            <Link href="/salesman/attendance">
              <Button variant="outline" className="w-full h-auto flex-col py-4">
                <CheckCircle2 className="h-5 w-5 mb-2" />
                <span className="text-sm">Attendance</span>
              </Button>
            </Link>
            <Link href="/salesman/schools">
              <Button variant="outline" className="w-full h-auto flex-col py-4">
                <Target className="h-5 w-5 mb-2" />
                <span className="text-sm">My Schools</span>
              </Button>
            </Link>
            <Link href="/salesman/tada">
              <Button variant="outline" className="w-full h-auto flex-col py-4">
                <Calendar className="h-5 w-5 mb-2" />
                <span className="text-sm">TA/DA</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
