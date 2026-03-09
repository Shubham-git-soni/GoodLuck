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
  Edit,
  Wallet,
  CheckCircle2,
  Clock,
} from "lucide-react";
import PageContainer from "@/components/layouts/PageContainer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
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

const ORANGE = "#f97316";
const GREEN = "#10b981";
const GREY = "#9ca3af";
const AMBER = "#f59e0b";

export default function SalesmanDashboard() {
  const params = useParams();
  const salesmanId = params.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [salesman, setSalesman] = useState<any>(null);
  const [assignedSchools, setAssignedSchools] = useState<any[]>([]);

  useEffect(() => {
    setTimeout(() => {
      const found = salesmenData.find((s) => s.id === salesmanId);
      if (found) {
        setSalesman(found);
        setAssignedSchools(schoolsData.filter((s) => s.assignedTo === found.name));
      }
      setIsLoading(false);
    }, 600);
  }, [salesmanId]);

  if (isLoading) return <PageContainer><PageSkeleton /></PageContainer>;

  if (!salesman) {
    return (
      <PageContainer>
        <div className="text-center py-16">
          <h2 className="text-xl font-bold mb-2">Salesman Not Found</h2>
          <Link href="/admin/users"><Button variant="outline" size="sm"><ArrowLeft className="h-4 w-4 mr-1.5" />Back</Button></Link>
        </div>
      </PageContainer>
    );
  }

  const salesAchievement = Math.round((salesman.salesAchieved / salesman.salesTarget) * 100);
  const specimenUtilization = Math.round((salesman.specimenUsed / salesman.specimenBudget) * 100);
  const remainingBudget = salesman.specimenBudget - salesman.specimenUsed;

  const monthlyData = [
    { month: "Jan", achieved: 450000, target: 500000 },
    { month: "Feb", achieved: 520000, target: 550000 },
    { month: "Mar", achieved: 580000, target: 600000 },
    { month: "Apr", achieved: 620000, target: 650000 },
    { month: "May", achieved: 680000, target: 700000 },
    { month: "Jun", achieved: salesman.salesAchieved, target: salesman.salesTarget },
  ];

  const specimenPie = [
    { name: "Used", value: salesman.specimenUsed, fill: ORANGE },
    { name: "Remaining", value: remainingBudget, fill: GREEN },
  ];

  const reportLinks = [
    { label: "Manual Report", icon: FileText, href: `manual-report` },
    { label: "School Sales Plan", icon: School, href: `school-sales-plan` },
    { label: "Sales Plan Visit", icon: CalendarCheck, href: `sales-plan-visit` },
    { label: "School List", icon: List, href: `school-list` },
    { label: "Book Seller List", icon: Store, href: `bookseller-list` },
    { label: "Attendance Report", icon: CalendarCheck, href: `attendance-report` },
    { label: "School Visit Report", icon: BarChart3, href: `school-visit-report` },
    { label: "Multiple Visit Report", icon: BarChart3, href: `multiple-visit-report` },
    { label: "Book Seller Visit Report", icon: Store, href: `bookseller-visit-report` },
    { label: "Delete School List", icon: List, href: null },
    { label: "School List with IP", icon: List, href: null },
    { label: "Summary Report", icon: FileText, href: null },
    { label: "Merge Report", icon: FileText, href: null },
    { label: "IP Report", icon: FileText, href: null },
    { label: "Drop List", icon: List, href: null },
  ];

  const infoItems = [
    { label: "ID", value: salesman.id, icon: User },
    { label: "Email", value: salesman.email, icon: Mail },
    { label: "Phone", value: salesman.phone || "N/A", icon: Phone },
    { label: "State", value: salesman.state, icon: MapPin },
    { label: "Working Cities", value: salesman.region, icon: MapPin },
    { label: "Sales Target", value: `₹${(salesman.salesTarget / 100000).toFixed(2)}L`, icon: Target },
    { label: "Specimen %", value: `${salesman.specimenTargetPercent || 15}%`, icon: BookOpen },
    { label: "Specimen Budget", value: `₹${(salesman.specimenBudget / 100000).toFixed(2)}L`, icon: Wallet },
  ];

  return (
    <PageContainer>

      {/* ── Top bar ──────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <Link href="/admin/users">
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-lg font-bold leading-none">{salesman.name}</h1>
            <p className="text-xs text-muted-foreground mt-0.5">{salesman.id} · {salesman.state}</p>
          </div>
        </div>
        <Link href={`/admin/team/${salesmanId}/edit`}>
          <Button size="sm" variant="outline" className="gap-1.5 text-xs h-8">
            <Edit className="h-3.5 w-3.5" /> Edit
          </Button>
        </Link>
      </div>

      {/* ── KPI strip ────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {[
          { label: "Sales Target", value: `₹${(salesman.salesTarget / 100000).toFixed(1)}L`, sub: `Achieved ₹${(salesman.salesAchieved / 100000).toFixed(1)}L`, progress: salesAchievement, icon: Target, cls: "gradient-card-orange", color: "text-orange-500" },
          { label: "Specimen Budget", value: `₹${(salesman.specimenBudget / 100000).toFixed(1)}L`, sub: `${salesman.specimenTargetPercent || 15}% of sales`, progress: null, icon: BookOpen, cls: "gradient-card-amber", color: "text-amber-500" },
          { label: "Used Budget", value: `₹${(salesman.specimenUsed / 100000).toFixed(1)}L`, sub: `${specimenUtilization}% utilized`, progress: specimenUtilization, icon: TrendingUp, cls: "gradient-card-orange", color: "text-blue-500" },
          { label: "Remaining", value: `₹${(remainingBudget / 100000).toFixed(1)}L`, sub: "Available for specimens", progress: null, icon: Wallet, cls: "gradient-card-neutral", color: "text-emerald-500" },
        ].map((kpi) => (
          <Card key={kpi.label} className={`border shadow-sm ${kpi.cls}`}>
            <CardContent className="p-3">
              <div className="flex items-start justify-between mb-2">
                <p className="text-[11px] text-muted-foreground font-medium">{kpi.label}</p>
                <div className="p-1 rounded-md bg-background/60">
                  <kpi.icon className={`h-3.5 w-3.5 ${kpi.color}`} />
                </div>
              </div>
              <p className={`text-lg font-bold ${kpi.color}`}>{kpi.value}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{kpi.sub}</p>
              {kpi.progress !== null && (
                <Progress value={kpi.progress} className="h-1 mt-2" />
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Profile + Charts ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-5">

        {/* Profile card */}
        <Card className="border shadow-sm">
          <CardHeader className="px-4 py-3 border-b">
            <CardTitle className="text-sm flex items-center gap-2">
              <div className="h-7 w-7 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold">
                {salesman.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
              </div>
              {salesman.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 py-3 space-y-2">
            {infoItems.map((item) => (
              <div key={item.label} className="flex items-center gap-2 text-xs">
                <item.icon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <span className="text-muted-foreground min-w-[80px]">{item.label}</span>
                <span className="font-medium text-foreground truncate">{item.value}</span>
              </div>
            ))}
            <div className="pt-2 border-t mt-2">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                <span className="text-xs text-muted-foreground">Achievement</span>
                <span className="text-xs font-bold text-emerald-500 ml-auto">{salesAchievement}%</span>
              </div>
              <Progress value={salesAchievement} className="h-1.5 mt-1.5" />
            </div>
          </CardContent>
        </Card>

        {/* Monthly Performance Chart */}
        <Card className="border shadow-sm lg:col-span-2">
          <CardHeader className="px-4 py-3 border-b">
            <CardTitle className="text-sm flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary" />
              Monthly Sales Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 pt-3 pb-2">
            <ResponsiveContainer width="100%" height={190}>
              <BarChart data={monthlyData} barCategoryGap="30%">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={(v) => `₹${(v / 100000).toFixed(0)}L`} tick={{ fontSize: 10 }} width={42} axisLine={false} tickLine={false} />
                <Tooltip formatter={(v: any) => `₹${(v / 100000).toFixed(2)}L`} cursor={{ fill: "transparent" }} />
                <Legend wrapperStyle={{ fontSize: 11, paddingTop: 4 }} />
                <Bar dataKey="target" name="Target" fill={GREY} radius={[3, 3, 0, 0]} />
                <Bar dataKey="achieved" name="Achieved" fill={ORANGE} radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* ── Specimen Utilization + Schools ──────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-5">

        {/* Specimen Pie */}
        <Card className="border shadow-sm">
          <CardHeader className="px-4 py-3 border-b">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Specimen Budget
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 py-2">
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={specimenPie} cx="50%" cy="50%" innerRadius={55} outerRadius={80}
                  paddingAngle={3} dataKey="value"
                  label={({ name, percent }) => `${name} ${Math.round((percent ?? 0) * 100)}%`}
                  labelLine={false}>
                  {specimenPie.map((e, i) => <Cell key={i} fill={e.fill} />)}
                </Pie>
                <Tooltip formatter={(v: any) => `₹${(v / 100000).toFixed(2)}L`} />
              </PieChart>
            </ResponsiveContainer>
            <p className="text-center text-xs text-muted-foreground mt-1">{specimenUtilization}% Utilized</p>
          </CardContent>
        </Card>

        {/* Schools summary */}
        <Card className="border shadow-sm lg:col-span-2">
          <CardHeader className="px-4 py-3 border-b">
            <CardTitle className="text-sm flex items-center gap-2">
              <School className="h-4 w-4 text-primary" />
              Assigned Schools
              <Badge variant="secondary" className="ml-auto text-[10px] px-1.5 py-0">{assignedSchools.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 py-2">
            <div className="space-y-1.5 max-h-[170px] overflow-y-auto pr-1 no-scrollbar">
              {assignedSchools.length === 0 ? (
                <p className="text-xs text-muted-foreground py-4 text-center">No schools assigned</p>
              ) : assignedSchools.slice(0, 12).map((sc: any, i: number) => (
                <div key={sc.id} className="flex items-center gap-2 text-xs py-1 border-b border-border/50 last:border-0">
                  <span className="text-[10px] text-muted-foreground w-5 shrink-0">{i + 1}.</span>
                  <span className="font-medium flex-1 truncate">{sc.name}</span>
                  <Badge variant="outline" className="text-[9px] px-1 py-0 shrink-0">{sc.board}</Badge>
                  <span className="text-muted-foreground text-[10px] shrink-0">{(sc.strength || 0).toLocaleString()}</span>
                </div>
              ))}
              {assignedSchools.length > 12 && (
                <p className="text-[10px] text-muted-foreground text-center pt-1">+{assignedSchools.length - 12} more schools</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Reports & Management ─────────────────────────────────── */}
      <Card className="border shadow-sm">
        <CardHeader className="px-4 py-3 border-b">
          <CardTitle className="text-sm flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            Reports &amp; Management
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 py-3">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
            {reportLinks.map((r) => {
              const Icon = r.icon;
              const inner = (
                <div className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-xs font-medium transition-all cursor-pointer
                  hover:border-primary hover:bg-primary/5 hover:text-primary group border-border bg-muted/30`}>
                  <Icon className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary shrink-0" />
                  <span className="truncate leading-none">{r.label}</span>
                </div>
              );
              return r.href ? (
                <Link key={r.label} href={`/admin/team/${salesmanId}/${r.href}`}>
                  {inner}
                </Link>
              ) : (
                <div key={r.label}>{inner}</div>
              );
            })}
          </div>
        </CardContent>
      </Card>

    </PageContainer>
  );
}
