"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  Target,
  TrendingUp,
  BookOpen,
  FileText,
  School,
  Store,
  CalendarCheck,
  BarChart3,
  List,
  Plus,
  Edit,
} from "lucide-react";
import PageContainer from "@/components/layouts/PageContainer";
import PageHeader from "@/components/layouts/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { PageSkeleton } from "@/components/ui/skeleton-loaders";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import salesmenData from "@/lib/mock-data/salesmen.json";
import schoolsData from "@/lib/mock-data/schools.json";

const COLORS = {
  primary: "#3b82f6",
  success: "#10b981",
  warning: "#f59e0b",
  danger: "#ef4444",
  purple: "#8b5cf6",
  cyan: "#06b6d4",
};

export default function SalesmanDashboard() {
  const params = useParams();
  const salesmanId = params.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [salesman, setSalesman] = useState<any>(null);
  const [assignedSchools, setAssignedSchools] = useState<any[]>([]);

  useEffect(() => {
    setTimeout(() => {
      const foundSalesman = salesmenData.find((s) => s.id === salesmanId);
      if (foundSalesman) {
        setSalesman(foundSalesman);

        // Get assigned schools
        const schools = schoolsData.filter((s) => s.assignedTo === foundSalesman.name);
        setAssignedSchools(schools);
      }
      setIsLoading(false);
    }, 800);
  }, [salesmanId]);

  if (isLoading) {
    return (
      <PageContainer>
        <PageSkeleton />
      </PageContainer>
    );
  }

  if (!salesman) {
    return (
      <PageContainer>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-2">Salesman Not Found</h2>
          <p className="text-muted-foreground mb-4">The requested salesman does not exist.</p>
          <Link href="/admin/users">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to User Master
            </Button>
          </Link>
        </div>
      </PageContainer>
    );
  }

  const salesAchievement = Math.round((salesman.salesAchieved / salesman.salesTarget) * 100);
  const specimenUtilization = Math.round((salesman.specimenUsed / salesman.specimenBudget) * 100);
  const remainingBudget = salesman.specimenBudget - salesman.specimenUsed;

  // Mock data for charts
  const monthlyPerformance = [
    { month: "Jan", achieved: 450000, target: 500000 },
    { month: "Feb", achieved: 520000, target: 550000 },
    { month: "Mar", achieved: 580000, target: 600000 },
    { month: "Apr", achieved: 620000, target: 650000 },
    { month: "May", achieved: 680000, target: 700000 },
    { month: "Jun", achieved: salesman.salesAchieved, target: salesman.salesTarget },
  ];

  const specimenBudgetData = [
    { name: "Used Budget", value: salesman.specimenUsed, color: COLORS.primary },
    { name: "Remaining Budget", value: remainingBudget, color: COLORS.success },
  ];

  // Sales Policy Compliance (School Wise) - Mock data
  const policyComplianceData = assignedSchools.slice(0, 10).map((school) => ({
    school: school.name,
    compliance: Math.floor(Math.random() * 40) + 60, // 60-100%
  }));

  // Try to Prescribe vs Specimen Given (School Wise) - Mock data
  const prescribeVsSpecimenData = assignedSchools.slice(0, 8).map((school) => ({
    school: school.name,
    tryToPrescribe: Math.floor(Math.random() * 50) + 20,
    specimenGiven: Math.floor(Math.random() * 40) + 10,
  }));

  return (
    <PageContainer>
      {/* Header */}
      <div className="mb-4 md:mb-6">
        <Link href="/admin/users">
          <Button variant="ghost" size="sm" className="mb-2 md:mb-4 text-xs md:text-sm">
            <ArrowLeft className="h-3.5 w-3.5 md:h-4 md:w-4 mr-1.5 md:mr-2" />
            <span className="hidden md:inline">Back to User Master</span>
            <span className="md:hidden">Back</span>
          </Button>
        </Link>
        <h1 className="text-lg md:text-2xl font-bold tracking-tight">{salesman.name}&apos;s Dashboard</h1>
        <p className="text-xs md:text-sm text-muted-foreground mt-0.5">Comprehensive view of salesman performance and activities</p>
      </div>

      {/* Profile Section */}
      <Card className="mb-4 md:mb-6">
        <CardHeader className="px-4 md:px-6 py-3 md:py-4">
          <CardTitle className="text-sm md:text-lg flex items-center gap-2">
            <User className="h-4 w-4 md:h-5 md:w-5" />
            Profile Information
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4 md:px-6 md:pb-6">
          {/* Mobile: compact 2-col grid with grouped sections */}
          <div className="md:hidden space-y-3">
            {/* Identity group */}
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-muted/40 rounded-lg px-3 py-2.5 border-l-2 border-primary">
                <p className="text-[9px] text-muted-foreground font-semibold uppercase tracking-wider">ID</p>
                <p className="text-[13px] font-bold text-primary mt-0.5 truncate">{salesman.id}</p>
              </div>
              <div className="bg-muted/40 rounded-lg px-3 py-2.5 border-l-2 border-primary">
                <p className="text-[9px] text-muted-foreground font-semibold uppercase tracking-wider">Name</p>
                <p className="text-[13px] font-bold text-foreground mt-0.5 truncate">{salesman.name}</p>
              </div>
            </div>
            {/* Contact group */}
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-muted/40 rounded-lg px-3 py-2.5 border-l-2 border-sky-400 col-span-2">
                <p className="text-[9px] text-muted-foreground font-semibold uppercase tracking-wider">Email</p>
                <p className="text-[13px] font-bold text-foreground mt-0.5 truncate">{salesman.email}</p>
              </div>
              <div className="bg-muted/40 rounded-lg px-3 py-2.5 border-l-2 border-sky-400">
                <p className="text-[9px] text-muted-foreground font-semibold uppercase tracking-wider">Phone</p>
                <p className="text-[13px] font-bold text-foreground mt-0.5">{salesman.phone || "N/A"}</p>
              </div>
              <div className="bg-muted/40 rounded-lg px-3 py-2.5 border-l-2 border-teal-400">
                <p className="text-[9px] text-muted-foreground font-semibold uppercase tracking-wider">State</p>
                <p className="text-[13px] font-bold text-foreground mt-0.5 truncate">{salesman.state}</p>
              </div>
            </div>
            {/* Targets group */}
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-emerald-50 rounded-lg px-3 py-2.5 border-l-2 border-emerald-500">
                <p className="text-[9px] text-emerald-600 font-semibold uppercase tracking-wider">Sales</p>
                <p className="text-[13px] font-bold text-emerald-800 mt-0.5">₹{(salesman.salesTarget / 100000).toFixed(1)}L</p>
              </div>
              <div className="bg-amber-50 rounded-lg px-3 py-2.5 border-l-2 border-amber-400">
                <p className="text-[9px] text-amber-600 font-semibold uppercase tracking-wider">Spec %</p>
                <p className="text-[13px] font-bold text-amber-800 mt-0.5">{salesman.specimenTargetPercent || 15}%</p>
              </div>
              <div className="bg-amber-50 rounded-lg px-3 py-2.5 border-l-2 border-amber-400">
                <p className="text-[9px] text-amber-600 font-semibold uppercase tracking-wider">Spec</p>
                <p className="text-[13px] font-bold text-amber-800 mt-0.5">₹{(salesman.specimenBudget / 100000).toFixed(1)}L</p>
              </div>
            </div>
            {/* Region */}
            <div className="bg-muted/40 rounded-lg px-3 py-2.5 border-l-2 border-teal-400">
              <p className="text-[9px] text-muted-foreground font-semibold uppercase tracking-wider">Working Cities</p>
              <p className="text-[13px] font-bold text-foreground mt-0.5">{salesman.region}</p>
            </div>
          </div>
          {/* Desktop: grid tiles */}
          <div className="hidden md:grid md:grid-cols-3 gap-4">
            <div className="bg-muted/30 p-3.5 rounded-xl border border-border/50">
              <p className="text-[11px] text-muted-foreground uppercase font-semibold tracking-wider mb-1">Salesman ID</p>
              <p className="text-base font-medium">{salesman.id}</p>
            </div>
            <div className="bg-muted/30 p-3.5 rounded-xl border border-border/50">
              <p className="text-[11px] text-muted-foreground uppercase font-semibold tracking-wider mb-1">Salesman Name</p>
              <p className="text-base font-medium">{salesman.name}</p>
            </div>
            <div className="bg-muted/30 p-3.5 rounded-xl border border-border/50">
              <p className="text-[11px] text-muted-foreground uppercase font-semibold tracking-wider mb-1">Email</p>
              <p className="text-base font-medium flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="truncate">{salesman.email}</span>
              </p>
            </div>
            <div className="bg-muted/30 p-3.5 rounded-xl border border-border/50">
              <p className="text-[11px] text-muted-foreground uppercase font-semibold tracking-wider mb-1">Contact Number</p>
              <p className="text-base font-medium flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                {salesman.phone || "N/A"}
              </p>
            </div>
            <div className="bg-emerald-50 p-3.5 rounded-xl border border-emerald-100">
              <p className="text-[11px] text-emerald-600 uppercase font-semibold tracking-wider mb-1">Sales Target</p>
              <p className="text-base font-medium text-emerald-800">₹{(salesman.salesTarget / 100000).toFixed(2)}L</p>
            </div>
            <div className="bg-amber-50 p-3.5 rounded-xl border border-amber-100">
              <p className="text-[11px] text-amber-600 uppercase font-semibold tracking-wider mb-1">Specimen Target %</p>
              <p className="text-base font-medium text-amber-800">{salesman.specimenTargetPercent || 15}%</p>
            </div>
            <div className="bg-amber-50 p-3.5 rounded-xl border border-amber-100">
              <p className="text-[11px] text-amber-600 uppercase font-semibold tracking-wider mb-1">Specimen Target</p>
              <p className="text-base font-medium text-amber-800">₹{(salesman.specimenBudget / 100000).toFixed(2)}L</p>
            </div>
            <div className="bg-muted/30 p-3.5 rounded-xl border border-border/50">
              <p className="text-[11px] text-muted-foreground uppercase font-semibold tracking-wider mb-1">Working State</p>
              <p className="text-base font-medium flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                {salesman.state}
              </p>
            </div>
            <div className="bg-muted/30 p-3.5 rounded-xl border border-border/50">
              <p className="text-[11px] text-muted-foreground uppercase font-semibold tracking-wider mb-1">Working Cities</p>
              <p className="text-base font-medium">{salesman.region}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4 mb-4 md:mb-6">
        <Card className="border-0 shadow-sm gradient-card-orange">
          <CardContent className="p-2.5 md:p-4">
            <div className="flex items-center justify-between mb-2 md:mb-3">
              <div className="p-1 md:p-1.5 rounded-lg bg-emerald-100">
                <Target className="h-3.5 w-3.5 md:h-4 md:w-4 text-emerald-600" />
              </div>
            </div>
            <p className="text-base md:text-xl font-bold tracking-tight">₹{(salesman.salesTarget / 100000).toFixed(1)}L</p>
            <p className="text-[10px] md:text-xs text-muted-foreground mt-0.5">Sales Target</p>
            <div className="mt-1.5 pt-1.5 md:mt-2 md:pt-2 border-t border-border/50">
              <p className="text-[10px] text-muted-foreground">Achieved: ₹{(salesman.salesAchieved / 100000).toFixed(1)}L</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm gradient-card-amber">
          <CardContent className="p-2.5 md:p-4">
            <div className="flex items-center justify-between mb-2 md:mb-3">
              <div className="p-1 md:p-1.5 rounded-lg bg-amber-100">
                <BookOpen className="h-3.5 w-3.5 md:h-4 md:w-4 text-amber-600" />
              </div>
            </div>
            <p className="text-base md:text-xl font-bold tracking-tight">₹{(salesman.specimenBudget / 100000).toFixed(1)}L</p>
            <p className="text-[10px] md:text-xs text-muted-foreground mt-0.5">Specimen Target</p>
            <div className="mt-1.5 pt-1.5 md:mt-2 md:pt-2 border-t border-border/50">
              <p className="text-[10px] text-muted-foreground">{salesman.specimenTargetPercent || 15}% of sales</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm gradient-card-orange">
          <CardContent className="p-2.5 md:p-4">
            <div className="flex items-center justify-between mb-2 md:mb-3">
              <div className="p-1 md:p-1.5 rounded-lg bg-blue-100">
                <TrendingUp className="h-3.5 w-3.5 md:h-4 md:w-4 text-blue-600" />
              </div>
            </div>
            <p className="text-base md:text-xl font-bold tracking-tight">₹{(salesman.specimenUsed / 100000).toFixed(1)}L</p>
            <p className="text-[10px] md:text-xs text-muted-foreground mt-0.5">Used Budget</p>
            <div className="mt-1.5 pt-1.5 md:mt-2 md:pt-2 border-t border-border/50">
              <p className="text-[10px] text-muted-foreground">{specimenUtilization}% utilized</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm gradient-card-neutral">
          <CardContent className="p-2.5 md:p-4">
            <div className="flex items-center justify-between mb-2 md:mb-3">
              <div className="p-1 md:p-1.5 rounded-lg bg-primary/10">
                <Target className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary" />
              </div>
            </div>
            <p className="text-base md:text-xl font-bold tracking-tight">₹{(remainingBudget / 100000).toFixed(1)}L</p>
            <p className="text-[10px] md:text-xs text-muted-foreground mt-0.5">Remaining</p>
            <div className="mt-1.5 pt-1.5 md:mt-2 md:pt-2 border-t border-border/50">
              <p className="text-[10px] text-muted-foreground">Available for specimens</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Charts */}
      <div className="grid gap-4 md:gap-6 md:grid-cols-2 mb-4 md:mb-6">
        {/* Sales Target Achievement */}
        <Card>
          <CardHeader className="px-4 md:px-6 py-3 md:py-4">
            <CardTitle className="text-sm md:text-lg flex items-center gap-2">
              <BarChart3 className="h-4 w-4 md:h-5 md:w-5" />
              Sales Target Achievement
            </CardTitle>
          </CardHeader>
          <CardContent className="px-2 md:px-6">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={monthlyPerformance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tickFormatter={(value) => `₹${(value / 100000).toFixed(0)}L`} tick={{ fontSize: 10 }} width={45} />
                <Tooltip formatter={(value: any) => `₹${(value / 100000).toFixed(2)}L`} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="achieved" fill={COLORS.success} name="Achieved" />
                <Bar dataKey="target" fill={COLORS.primary} name="Target" />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-3 md:mt-4 flex items-center justify-between px-2 md:px-0">
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Current Achievement</p>
                <p className="text-base md:text-lg font-bold">{salesAchievement}%</p>
              </div>
              <Progress value={salesAchievement} className="h-2 w-24 md:w-48" />
            </div>
          </CardContent>
        </Card>

        {/* Specimen Budget Utilization */}
        <Card>
          <CardHeader className="px-4 md:px-6 py-3 md:py-4">
            <CardTitle className="text-sm md:text-lg flex items-center gap-2">
              <TrendingUp className="h-4 w-4 md:h-5 md:w-5" />
              Specimen Budget Utilization
            </CardTitle>
          </CardHeader>
          <CardContent className="px-2 md:px-6">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={specimenBudgetData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `₹${(value / 100000).toFixed(1)}L`}
                  outerRadius={75}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {specimenBudgetData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => `₹${(value / 100000).toFixed(2)}L`} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-3 md:mt-4 text-center">
              <p className="text-xs md:text-sm text-muted-foreground">Utilization Rate</p>
              <p className="text-xl md:text-2xl font-bold">{specimenUtilization}%</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Charts */}
      <div className="grid gap-4 md:gap-6 md:grid-cols-2 mb-4 md:mb-6">
        {/* Sales Policy Compliance School Wise */}
        <Card>
          <CardHeader className="px-4 md:px-6 py-3 md:py-4">
            <CardTitle className="text-sm md:text-lg">Sales Policy Compliance (School Wise)</CardTitle>
          </CardHeader>
          <CardContent className="px-2 md:px-6">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={policyComplianceData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10 }} />
                <YAxis type="category" dataKey="school" width={70} tick={{ fontSize: 9 }} />
                <Tooltip />
                <Bar dataKey="compliance" fill={COLORS.purple} name="Compliance %" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Try to Prescribe vs Specimen Given */}
        <Card>
          <CardHeader className="px-4 md:px-6 py-3 md:py-4">
            <CardTitle className="text-sm md:text-lg">Prescribe vs Specimen (School Wise)</CardTitle>
          </CardHeader>
          <CardContent className="px-2 md:px-6">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={prescribeVsSpecimenData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="school" angle={-45} textAnchor="end" height={80} tick={{ fontSize: 8 }} />
                <YAxis tick={{ fontSize: 10 }} width={30} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <Bar dataKey="tryToPrescribe" fill={COLORS.cyan} name="Prescribe" />
                <Bar dataKey="specimenGiven" fill={COLORS.warning} name="Specimen" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Report Sections */}
      <Card className="mb-4 md:mb-6">
        <CardHeader className="px-4 md:px-6 py-3 md:py-4">
          <CardTitle className="text-sm md:text-lg flex items-center gap-2">
            <FileText className="h-4 w-4 md:h-5 md:w-5" />
            Reports & Management
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 md:px-6">
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 md:gap-3">
            <Link href={`/admin/team/${salesmanId}/manual-report`}>
              <Button variant="outline" className="justify-start h-auto py-3 w-full">
                <FileText className="h-4 w-4 mr-2" />
                Manual Report
              </Button>
            </Link>
            <Link href={`/admin/team/${salesmanId}/school-sales-plan`}>
              <Button variant="outline" className="justify-start h-auto py-3 w-full">
                <School className="h-4 w-4 mr-2" />
                School Sales Plan
              </Button>
            </Link>
            <Link href={`/admin/team/${salesmanId}/sales-plan-visit`}>
              <Button variant="outline" className="justify-start h-auto py-3 w-full">
                <CalendarCheck className="h-4 w-4 mr-2" />
                Sales Plan Visit
              </Button>
            </Link>
            <Link href={`/admin/team/${salesmanId}/school-list`}>
              <Button variant="outline" className="justify-start h-auto py-3 w-full">
                <List className="h-4 w-4 mr-2" />
                School List
              </Button>
            </Link>
            <Link href={`/admin/team/${salesmanId}/bookseller-list`}>
              <Button variant="outline" className="justify-start h-auto py-3 w-full">
                <Store className="h-4 w-4 mr-2" />
                Book Seller List
              </Button>
            </Link>
            <Link href={`/admin/team/${salesmanId}/attendance-report`}>
              <Button variant="outline" className="justify-start h-auto py-3 w-full">
                <CalendarCheck className="h-4 w-4 mr-2" />
                Attendance Report
              </Button>
            </Link>
            <Link href={`/admin/team/${salesmanId}/school-visit-report`}>
              <Button variant="outline" className="justify-start h-auto py-3 w-full">
                <BarChart3 className="h-4 w-4 mr-2" />
                School Visit Report
              </Button>
            </Link>
            <Link href={`/admin/team/${salesmanId}/multiple-visit-report`}>
              <Button variant="outline" className="justify-start h-auto py-3 w-full">
                <BarChart3 className="h-4 w-4 mr-2" />
                Multiple Visit Report
              </Button>
            </Link>
            <Link href={`/admin/team/${salesmanId}/bookseller-visit-report`}>
              <Button variant="outline" className="justify-start h-auto py-3 w-full">
                <Store className="h-4 w-4 mr-2" />
                Book Seller Visit Report
              </Button>
            </Link>
            <Button variant="outline" className="justify-start h-auto py-3">
              <List className="h-4 w-4 mr-2" />
              Delete School List
            </Button>
            <Button variant="outline" className="justify-start h-auto py-3">
              <Plus className="h-4 w-4 mr-2" />
              Add QB Stock
            </Button>
            <Button variant="outline" className="justify-start h-auto py-3">
              <List className="h-4 w-4 mr-2" />
              QB School List
            </Button>
            <Button variant="outline" className="justify-start h-auto py-3">
              <School className="h-4 w-4 mr-2" />
              QB Visit ICSC
            </Button>
            <Button variant="outline" className="justify-start h-auto py-3">
              <School className="h-4 w-4 mr-2" />
              QB Visit CBSE
            </Button>
            <Button variant="outline" className="justify-start h-auto py-3">
              <List className="h-4 w-4 mr-2" />
              School List with IP
            </Button>
            <Button variant="outline" className="justify-start h-auto py-3">
              <FileText className="h-4 w-4 mr-2" />
              Summary Report
            </Button>
            <Button variant="outline" className="justify-start h-auto py-3">
              <FileText className="h-4 w-4 mr-2" />
              Merge Report
            </Button>
            <Button variant="outline" className="justify-start h-auto py-3">
              <FileText className="h-4 w-4 mr-2" />
              IP Report
            </Button>
            <Button variant="outline" className="justify-start h-auto py-3">
              <List className="h-4 w-4 mr-2" />
              Drop List
            </Button>
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
