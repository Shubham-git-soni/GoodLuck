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
          <Link href="/admin/team">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Team
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
      <div className="mb-6">
        <Link href="/admin/team">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Team
          </Button>
        </Link>
        <PageHeader
          title={`${salesman.name}'s Dashboard`}
          description="Comprehensive view of salesman performance and activities"
        />
      </div>

      {/* Profile Section */}
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile Information
          </CardTitle>
          <Button variant="outline" size="sm">
            <Edit className="h-4 w-4 mr-2" />
            Update Profile
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Salesman ID</p>
              <p className="font-medium">{salesman.id}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Salesman Name</p>
              <p className="font-medium">{salesman.name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                {salesman.email}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Contact Number</p>
              <p className="font-medium flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                {salesman.phone || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Sales Target</p>
              <p className="font-medium">₹{(salesman.salesTarget / 100000).toFixed(2)}L</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Specimen Target Percentage</p>
              <p className="font-medium">{salesman.specimenTargetPercent || 15}%</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Specimen Target</p>
              <p className="font-medium">₹{(salesman.specimenBudget / 100000).toFixed(2)}L</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Working State</p>
              <p className="font-medium flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                {salesman.state}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Working Cities</p>
              <p className="font-medium">{salesman.region}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Sales Target</p>
              <Target className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold">₹{(salesman.salesTarget / 100000).toFixed(1)}L</p>
            <p className="text-xs text-muted-foreground mt-1">
              Achieved: ₹{(salesman.salesAchieved / 100000).toFixed(1)}L
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Specimen Target</p>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold">₹{(salesman.specimenBudget / 100000).toFixed(1)}L</p>
            <p className="text-xs text-muted-foreground mt-1">
              {salesman.specimenTargetPercent || 15}% of sales target
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Used Budget</p>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold">₹{(salesman.specimenUsed / 100000).toFixed(1)}L</p>
            <p className="text-xs text-muted-foreground mt-1">{specimenUtilization}% utilized</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Remaining Budget</p>
              <Target className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold">₹{(remainingBudget / 100000).toFixed(1)}L</p>
            <p className="text-xs text-muted-foreground mt-1">Available for specimens</p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Charts */}
      <div className="grid gap-6 md:grid-cols-2 mb-6">
        {/* Sales Target Achievement */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Sales Target Achievement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyPerformance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => `₹${(value / 100000).toFixed(0)}L`} />
                <Tooltip formatter={(value: any) => `₹${(value / 100000).toFixed(2)}L`} />
                <Legend />
                <Bar dataKey="achieved" fill={COLORS.success} name="Achieved" />
                <Bar dataKey="target" fill={COLORS.primary} name="Target" />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Current Achievement</p>
                <p className="text-lg font-bold">{salesAchievement}%</p>
              </div>
              <Progress value={salesAchievement} className="h-2 w-48" />
            </div>
          </CardContent>
        </Card>

        {/* Specimen Budget Utilization */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Specimen Budget Utilization
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={specimenBudgetData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ₹${(value / 100000).toFixed(1)}L`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {specimenBudgetData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => `₹${(value / 100000).toFixed(2)}L`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 text-center">
              <p className="text-sm text-muted-foreground">Utilization Rate</p>
              <p className="text-2xl font-bold">{specimenUtilization}%</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Charts */}
      <div className="grid gap-6 md:grid-cols-2 mb-6">
        {/* Sales Policy Compliance School Wise */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Sales Policy Compliance (School Wise)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={policyComplianceData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, 100]} />
                <YAxis type="category" dataKey="school" width={100} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="compliance" fill={COLORS.purple} name="Compliance %" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Try to Prescribe vs Specimen Given */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Try to Prescribe vs Specimen Given (School Wise)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={prescribeVsSpecimenData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="school" angle={-45} textAnchor="end" height={100} tick={{ fontSize: 10 }} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="tryToPrescribe" fill={COLORS.cyan} name="Try to Prescribe" />
                <Bar dataKey="specimenGiven" fill={COLORS.warning} name="Specimen Given" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Report Sections */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Reports & Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
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
