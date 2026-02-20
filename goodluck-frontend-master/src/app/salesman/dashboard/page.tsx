"use client";

import { useEffect, useState } from "react";
import { Target, BookOpen, CheckCircle2, Calendar, AlertCircle, Users, Wallet, DollarSign } from "lucide-react";
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

// Colors for charts
const COLORS = {
  primary: "#3b82f6",
  success: "#10b981",
  warning: "#f59e0b",
  danger: "#ef4444",
  purple: "#8b5cf6",
  cyan: "#06b6d4",
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

      {/* Top Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-muted-foreground">Sales Target</p>
              <Target className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold mb-1">
              ₹{(salesmanData.salesTarget / 100000).toFixed(1)}L
            </p>
            <div className="mt-3 pt-3 border-t">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Achieved</span>
                <span className="font-semibold text-green-600">
                  ₹{(salesmanData.salesAchieved / 100000).toFixed(1)}L
                </span>
              </div>
              <div className="flex items-center justify-between text-sm mt-1">
                <span className="text-muted-foreground">Achievement</span>
                <span className="font-semibold">{salesPercentage}%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-muted-foreground">Specimen Budget</p>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold mb-1">
              ₹{(salesmanData.specimenBudget / 100000).toFixed(1)}L
            </p>
            <div className="mt-3 pt-3 border-t">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Remaining</span>
                <span className="font-semibold text-blue-600">
                  ₹{((salesmanData.specimenBudget - salesmanData.specimenUsed) / 100000).toFixed(1)}L
                </span>
              </div>
              <div className="flex items-center justify-between text-sm mt-1">
                <span className="text-muted-foreground">Utilization</span>
                <span className="font-semibold">{specimenPercentage}%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-muted-foreground">Utilized Budget</p>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold mb-1">
              ₹{(salesmanData.specimenUsed / 100000).toFixed(1)}L
            </p>
            <div className="mt-3 pt-3 border-t">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Of Budget</span>
                <span className="font-semibold">
                  ₹{(salesmanData.specimenBudget / 100000).toFixed(1)}L
                </span>
              </div>
              <div className="flex items-center justify-between text-sm mt-1">
                <span className="text-muted-foreground">Used</span>
                <span className={`font-semibold ${specimenPercentage > 80 ? 'text-orange-600' : 'text-green-600'}`}>
                  {specimenPercentage}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-muted-foreground">Payment Collection</p>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold mb-1">
              ₹{(850000 / 100000).toFixed(1)}L
            </p>
            <div className="mt-3 pt-3 border-t">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">This Month</span>
                <span className="font-semibold text-green-600">
                  ₹{(850000 / 100000).toFixed(1)}L
                </span>
              </div>
              <div className="flex items-center justify-between text-sm mt-1">
                <span className="text-muted-foreground">Target</span>
                <span className="font-semibold">₹{(1000000 / 100000).toFixed(1)}L</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 - Target Achievement & Specimen Budget */}
      <div className="grid gap-4 md:grid-cols-2 mb-6">
        {/* Target Achievement - Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="h-5 w-5" />
              Target Achievement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={[
                    { name: "Achieved", value: salesmanData.salesAchieved, color: COLORS.success },
                    { name: "Remaining", value: salesmanData.salesTarget - salesmanData.salesAchieved, color: COLORS.warning },
                  ]}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${((percent as number) * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  <Cell fill={COLORS.success} />
                  <Cell fill={COLORS.warning} />
                </Pie>
                <Tooltip formatter={(value: any) => `₹${(value / 100000).toFixed(2)}L`} />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS.success }} />
                  <span>Achieved</span>
                </div>
                <span className="font-semibold">₹{(salesmanData.salesAchieved / 100000).toFixed(1)}L ({salesPercentage}%)</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS.warning }} />
                  <span>Remaining</span>
                </div>
                <span className="font-semibold">₹{((salesmanData.salesTarget - salesmanData.salesAchieved) / 100000).toFixed(1)}L</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Specimen Budget Utilization - Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Specimen Budget Utilization
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={[
                    { name: "Used", value: salesmanData.specimenUsed, color: COLORS.primary },
                    { name: "Remaining", value: salesmanData.specimenBudget - salesmanData.specimenUsed, color: COLORS.cyan },
                  ]}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${((percent as number) * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  <Cell fill={COLORS.primary} />
                  <Cell fill={COLORS.cyan} />
                </Pie>
                <Tooltip formatter={(value: any) => `₹${(value / 100000).toFixed(2)}L`} />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS.primary }} />
                  <span>Used</span>
                </div>
                <span className="font-semibold">₹{(salesmanData.specimenUsed / 100000).toFixed(1)}L ({specimenPercentage}%)</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS.cyan }} />
                  <span>Remaining</span>
                </div>
                <span className="font-semibold">₹{((salesmanData.specimenBudget - salesmanData.specimenUsed) / 100000).toFixed(1)}L</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 - Visit Distribution & School Coverage */}
      <div className="grid gap-4 md:grid-cols-2 mb-6">
        {/* Visit Distribution - Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Visit Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={visitDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${((percent as number) * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {visitDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {visitDistribution.map((item, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span>{item.name}</span>
                  </div>
                  <span className="font-semibold">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* School Coverage - Radial Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5" />
              School Coverage Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <RadialBarChart
                cx="50%"
                cy="50%"
                innerRadius="20%"
                outerRadius="90%"
                data={schoolCoverage}
                startAngle={90}
                endAngle={-270}
              >
                <RadialBar
                  label={{ position: 'insideStart', fill: '#fff', fontSize: 12 }}
                  background
                  dataKey="value"
                />
                <Legend
                  iconSize={10}
                  layout="vertical"
                  verticalAlign="bottom"
                  align="center"
                  wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                />
                <Tooltip />
              </RadialBarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Progress Cards */}
      <div className="grid gap-4 md:grid-cols-2 mb-6">
        <ProgressCard
          title="Specimen Budget"
          current={salesmanData.specimenUsed}
          total={salesmanData.specimenBudget}
          unit="₹"
          description={`${specimenPercentage}% of budget utilized`}
        />
        <ProgressCard
          title="School Coverage"
          current={schoolStats.visitedTwice}
          total={schoolStats.total}
          description={`${schoolStats.yetToVisit} schools yet to visit`}
        />
      </div>

      {/* Today's Summary & Alerts */}
      <div className="grid gap-4 md:grid-cols-2 mb-6">
        {/* Today's Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Today's Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div>
                <p className="text-sm text-muted-foreground">School Visits</p>
                <p className="text-2xl font-bold">{visitStats.schoolVisitsToday}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div>
                <p className="text-sm text-muted-foreground">Bookseller Visits</p>
                <p className="text-2xl font-bold">{visitStats.bookSellerVisitsToday}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-blue-600" />
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div>
                <p className="text-sm text-muted-foreground">Pending Next Visits</p>
                <p className="text-2xl font-bold">{visitStats.pendingNextVisits}</p>
              </div>
              <Calendar className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        {/* Alerts */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Recent Alerts</CardTitle>
            <Link href="/salesman/notifications">
              <Button variant="ghost" size="sm">View All</Button>
            </Link>
          </CardHeader>
          <CardContent>
            {alerts.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No new alerts
              </p>
            ) : (
              <div className="space-y-3">
                {alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="flex items-start gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
                  >
                    <AlertCircle
                      className={`h-5 w-5 mt-0.5 flex-shrink-0 ${
                        alert.priority === "high"
                          ? "text-red-600"
                          : alert.priority === "medium"
                          ? "text-orange-600"
                          : "text-blue-600"
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{alert.title}</p>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {alert.message}
                      </p>
                    </div>
                    <Badge
                      variant={alert.priority === "high" ? "destructive" : "secondary"}
                      className="text-xs"
                    >
                      {alert.priority}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Monthly Sales Performance Chart - Bar Chart */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Monthly Sales Performance (Last 6 Months)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyPerformance}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis
                tickFormatter={(value) => `₹${(value / 100000).toFixed(0)}L`}
              />
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

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
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
