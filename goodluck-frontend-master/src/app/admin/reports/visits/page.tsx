"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import {
  Calendar, TrendingUp, Users, BarChart3, Filter, MapPin,
  Download, ArrowUpRight, ArrowDownRight, School, BookOpen,
  ChevronDown, ChevronUp, RotateCcw, Eye, CheckCircle2, Clock3
} from "lucide-react";
import PageContainer from "@/components/layouts/PageContainer";
import PageHeader from "@/components/layouts/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DataGrid, GridColumn } from "@/components/ui/data-grid";
import { DashboardSkeleton } from "@/components/ui/skeleton-loaders";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";

import visitsData from "@/lib/mock-data/visits.json";
import salesmenData from "@/lib/mock-data/salesmen.json";

// ─── Constants ─────────────────────────────────────────────────────────────
const COLORS = { primary: "#F47B20", success: "#2DD4BF", warning: "#94A3B8", danger: "#F43F5E" };

const DATE_OPTIONS = [
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "week", label: "This Week" },
  { value: "month", label: "This Month" },
  { value: "all", label: "All Time" },
];

// ─── Helpers ────────────────────────────────────────────────────────────────
function pctChange(curr: number, prev: number) {
  if (prev === 0) return null;
  return (((curr - prev) / prev) * 100).toFixed(1);
}

function filterByDate(arr: any[], range: string) {
  if (range === "today") return arr.filter(v => v.date === "2025-11-25");
  if (range === "yesterday") return arr.filter(v => v.date === "2025-11-24");
  if (range === "week") return arr.filter(v => v.date >= "2025-11-18" && v.date <= "2025-11-25");
  if (range === "month") return arr.filter(v => v.date.startsWith("2025-11"));
  return arr;
}
function prevPeriod(arr: any[], range: string) {
  if (range === "today") return arr.filter(v => v.date === "2025-11-24");
  if (range === "yesterday") return arr.filter(v => v.date === "2025-11-23");
  if (range === "week") return arr.filter(v => v.date >= "2025-11-11" && v.date < "2025-11-18");
  if (range === "month") return arr.filter(v => v.date.startsWith("2025-10"));
  return [];
}

const statusBadge = (v: any) => {
  if (v.status === "Completed") return <Badge variant="default" className="text-[10px] gap-1"><CheckCircle2 className="h-3 w-3" />Completed</Badge>;
  return <Badge variant="outline" className="text-[10px] gap-1"><Clock3 className="h-3 w-3" />Scheduled</Badge>;
};

// ─── Component ────────────────────────────────────────────────────────────
export default function VisitAnalyticsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState("month");
  const [stateFilter, setStateFilter] = useState("all");
  const [salesmanFilter, setSalesmanFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => { setTimeout(() => setIsLoading(false), 600); }, []);

  const states = useMemo(() => Array.from(new Set(salesmenData.map(s => s.state))).sort(), []);

  // ── Build salesman → state lookup ────────────────────────────────────────
  const smStateMap = useMemo(() => {
    const m: Record<string, string> = {};
    salesmenData.forEach(s => { m[s.id] = s.state; });
    return m;
  }, []);

  // ── Filter pipeline ──────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let arr = filterByDate(visitsData as any[], dateRange);
    if (typeFilter !== "all") arr = arr.filter(v => v.type === typeFilter);
    if (salesmanFilter !== "all") arr = arr.filter(v => v.salesmanId === salesmanFilter);
    if (stateFilter !== "all") arr = arr.filter(v => smStateMap[v.salesmanId] === stateFilter);
    return arr;
  }, [dateRange, typeFilter, salesmanFilter, stateFilter]);

  const previous = useMemo(() => {
    let arr = prevPeriod(visitsData as any[], dateRange);
    if (typeFilter !== "all") arr = arr.filter(v => v.type === typeFilter);
    return arr;
  }, [dateRange, typeFilter]);

  // ── KPIs ─────────────────────────────────────────────────────────────────
  const kpis = useMemo(() => {
    const total = filtered.length;
    const school = filtered.filter(v => v.type === "school").length;
    const bs = filtered.filter(v => v.type === "bookseller").length;
    const active = new Set(filtered.map(v => v.salesmanId)).size;
    const specs = filtered.reduce((s: number, v: any) => s + (v.specimensGiven?.length ?? 0), 0);
    const prevTot = previous.length;
    return { total, school, bs, active, specs, prevTot };
  }, [filtered, previous]);

  // ── Salesman breakdown ───────────────────────────────────────────────────
  const bySalesman = useMemo(() => {
    const filtSM = stateFilter === "all" ? salesmenData : salesmenData.filter(s => s.state === stateFilter);
    return filtSM.map(sm => {
      const smV = filtered.filter(v => v.salesmanId === sm.id);
      return {
        name: sm.name, id: sm.id, state: sm.state, region: sm.region,
        total: smV.length,
        school: smV.filter(v => v.type === "school").length,
        bs: smV.filter(v => v.type === "bookseller").length,
        specimens: smV.reduce((s: number, v: any) => s + (v.specimensGiven?.length ?? 0), 0),
      };
    }).sort((a, b) => b.total - a.total);
  }, [filtered, stateFilter]);

  // ── Trend (last 7 days fixed) ────────────────────────────────────────────
  const trendData = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date("2025-11-25"); d.setDate(d.getDate() - i);
      const ds = d.toISOString().split("T")[0];
      const dv = (visitsData as any[]).filter(v => v.date === ds);
      days.push({
        day: d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" }),
        School: dv.filter((v: any) => v.type === "school").length,
        Bookseller: dv.filter((v: any) => v.type === "bookseller").length,
      });
    }
    return days;
  }, []);

  const reset = () => { setDateRange("month"); setStateFilter("all"); setSalesmanFilter("all"); setTypeFilter("all"); };
  const exportCSV = () => toast.success("Exporting visit report...");

  if (isLoading) return <PageContainer><DashboardSkeleton /></PageContainer>;

  const totalChg = pctChange(kpis.total, kpis.prevTot);

  const SUMMARY_COLUMNS: GridColumn<any>[] = useMemo(() => [
    { key: "sr", header: "Sr.", width: 60, pinned: "left", sortable: false, filterable: false, render: (_, __, i) => <span className="text-muted-foreground text-xs">{i + 1}</span> },
    {
      key: "name", header: "Salesperson", width: 220, pinned: "left", sortable: true, render: (_, row) => (
        <div className="flex flex-col">
          <span className="font-semibold text-sm">{row.name}</span>
          <span className="text-[10px] text-muted-foreground">{row.id} · {row.region}</span>
        </div>
      )
    },
    { key: "state", header: "State", width: 120, filterable: true, sortable: true },
    { key: "school", header: "School", align: "center", width: 100, sortable: true, render: (v) => <span className="font-semibold text-primary">{v}</span> },
    { key: "bs", header: "Bookseller", align: "center", width: 100, sortable: true, render: (v) => <span className="font-semibold text-teal-700">{v}</span> },
    { key: "total", header: "Total", align: "center", width: 90, sortable: true, render: (v) => <span className="font-bold">{v}</span> },
    { key: "specimens", header: "Specimens", align: "center", width: 100, sortable: true, render: (v) => <span className="text-amber-700">{v}</span> },
    {
      key: "share",
      header: "Share",
      width: 140,
      sortable: false,
      render: (_, row) => {
        const pct = kpis.total > 0 ? Math.round((row.total / kpis.total) * 100) : 0;
        return (
          <div className="flex items-center gap-2 w-full">
            <Progress value={pct} className="h-1.5 flex-1" />
            <span className="text-xs text-muted-foreground w-8">{pct}%</span>
          </div>
        );
      }
    }
  ], [kpis.total]);

  const LOG_COLUMNS: GridColumn<any>[] = useMemo(() => [
    {
      key: "date", header: "Date", width: 120, pinned: "left", sortable: true, render: (v) => (
        <span className="text-xs whitespace-nowrap font-medium">
          {new Date(v as string).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
        </span>
      )
    },
    { key: "salesmanName", header: "Salesperson", width: 180, sortable: true, filterable: true, render: (v) => <span className="text-sm font-medium">{v as string}</span> },
    { key: "visited", header: "Visited", width: 200, sortable: false, filterable: true, render: (_, row) => <span className="text-sm">{row.schoolName || row.bookSellerName || "—"}</span> },
    {
      key: "type", header: "Type", width: 110, sortable: true, render: (v) => (
        <Badge variant={v === "school" ? "default" : "secondary"} className="text-[10px]">
          {v === "school" ? "School" : "Bookseller"}
        </Badge>
      )
    },
    {
      key: "purposes", header: "Purpose", width: 180, sortable: false, render: (v) => (
        <span className="truncate block text-xs text-muted-foreground w-full">{(v as string[])?.join(", ") || "—"}</span>
      )
    },
    {
      key: "specimens", header: "Specimens", align: "center", width: 110, sortable: false, render: (_, row) => (
        (row.specimensGiven as any[])?.length > 0
          ? <Badge variant="outline" className="text-[10px] text-amber-700">{row.specimensGiven.length} books</Badge>
          : <span className="text-xs text-muted-foreground">—</span>
      )
    },
    { key: "status", header: "Status", width: 110, sortable: true, render: (_, row) => statusBadge(row) },
  ], []);

  const expandedRowRender = useCallback((v: any) => (
    <div className="p-4 bg-muted/10 border-t border-b border-border/50">
      <div className="grid sm:grid-cols-3 gap-6 text-sm">
        {/* Contacts */}
        {(v.contacts as any[])?.length > 0 && (
          <div>
            <p className="font-semibold text-xs text-muted-foreground uppercase mb-2">Contacts Met</p>
            <div className="space-y-1.5">
              {(v.contacts as any[]).map((c: any) => (
                <div key={c.id} className="flex items-center gap-2">
                  <span className="font-medium text-sm">{c.name}</span>
                  <Badge variant="secondary" className="text-[10px] bg-background">{c.role}</Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Specimens */}
        {(v.specimensGiven as any[])?.length > 0 && (
          <div>
            <p className="font-semibold text-xs text-muted-foreground uppercase mb-2">Specimens Given</p>
            <div className="space-y-1.5">
              {(v.specimensGiven as any[]).map((s: any, i: number) => (
                <div key={i} className="text-sm">
                  <span className="font-medium">{s.book}</span>
                  <span className="text-muted-foreground ml-1">×{s.quantity} <span className="text-[10px]">(₹{s.cost})</span></span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Feedback + Next Visit */}
        <div className="space-y-4">
          {v.feedback && (
            <div>
              <p className="font-semibold text-xs text-muted-foreground uppercase mb-1.5">Feedback</p>
              <Badge variant="outline" className="text-[10px] mb-1.5 bg-background">{v.feedback.category}</Badge>
              <p className="text-sm text-foreground/80 leading-relaxed">{v.feedback.comment}</p>
            </div>
          )}
          {v.nextVisit && (
            <div>
              <p className="font-semibold text-xs text-muted-foreground uppercase mb-1.5">Next Check-in</p>
              <p className="text-sm font-medium">
                {new Date(v.nextVisit.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                <span className="text-muted-foreground font-normal ml-1.5">· {v.nextVisit.purpose}</span>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  ), []);

  return (
    <PageContainer>
      <PageHeader
        title="Visit Analytics"
        description="Track visits, specimen distribution and salesperson performance"
      />

      {/* ── Filters — compact bar ── */}
      <div className="mb-5 flex flex-wrap items-center gap-2 bg-card border rounded-xl px-4 py-2.5 shadow-sm">
        <Filter className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide shrink-0 mr-1">Filters</span>

        {/* Date Range */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-muted-foreground shrink-0">Period:</span>
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="h-8 w-32 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>{DATE_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
          </Select>
        </div>

        {/* State */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-muted-foreground shrink-0">State:</span>
          <Select value={stateFilter} onValueChange={setStateFilter}>
            <SelectTrigger className="h-8 w-32 text-xs"><SelectValue placeholder="All States" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All States</SelectItem>
              {states.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* Salesperson */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-muted-foreground shrink-0">Person:</span>
          <Select value={salesmanFilter} onValueChange={setSalesmanFilter}>
            <SelectTrigger className="h-8 w-36 text-xs"><SelectValue placeholder="All Salesperson" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Salesperson</SelectItem>
              {salesmenData.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* Type */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-muted-foreground shrink-0">Type:</span>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="h-8 w-28 text-xs"><SelectValue placeholder="All Types" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="school">School</SelectItem>
              <SelectItem value="bookseller">Bookseller</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Actions — right side */}
        <div className="ml-auto flex items-center gap-2">
          <Button variant="ghost" size="sm" className="h-8 text-xs text-muted-foreground hover:text-primary" onClick={reset}>
            <RotateCcw className="h-3.5 w-3.5 mr-1" /> Reset
          </Button>
          <Button size="sm" className="h-8 text-xs" onClick={exportCSV}>
            <Download className="h-3.5 w-3.5 mr-1" /> Export
          </Button>
        </div>
      </div>

      {/* ── KPI Cards — dashboard style ── */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-5">
        {/* Total Visits */}
        <Card className="border-0 shadow-sm gradient-card-orange">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="p-1.5 rounded-lg bg-primary/10">
                <Calendar className="h-4 w-4 text-primary" />
              </div>
              {totalChg && (
                <span className={`flex items-center text-xs font-semibold ${parseFloat(totalChg) >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                  {parseFloat(totalChg) >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                  {Math.abs(parseFloat(totalChg))}%
                </span>
              )}
            </div>
            <p className="text-xl font-bold tracking-tight">{kpis.total}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Total Visits</p>
            <div className="mt-2 pt-2 border-t border-border/50">
              <p className="text-xs text-muted-foreground">vs previous period</p>
            </div>
          </CardContent>
        </Card>
        {/* School Visits */}
        <Card className="border-0 shadow-sm gradient-card-orange">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="p-1.5 rounded-lg bg-primary/10">
                <School className="h-4 w-4 text-primary" />
              </div>
            </div>
            <p className="text-xl font-bold tracking-tight">{kpis.school}</p>
            <p className="text-xs text-muted-foreground mt-0.5">School Visits</p>
            <div className="mt-2 pt-2 border-t border-border/50">
              <p className="text-xs text-muted-foreground">{kpis.total > 0 ? Math.round((kpis.school / kpis.total) * 100) : 0}% of total</p>
            </div>
          </CardContent>
        </Card>
        {/* Bookseller */}
        <Card className="border-0 shadow-sm gradient-card-amber">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="p-1.5 rounded-lg bg-teal-100">
                <BookOpen className="h-4 w-4 text-teal-600" />
              </div>
            </div>
            <p className="text-xl font-bold tracking-tight">{kpis.bs}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Bookseller Visits</p>
            <div className="mt-2 pt-2 border-t border-border/50">
              <p className="text-xs text-muted-foreground">{kpis.total > 0 ? Math.round((kpis.bs / kpis.total) * 100) : 0}% of total</p>
            </div>
          </CardContent>
        </Card>
        {/* Active Salesmen */}
        <Card className="border-0 shadow-sm gradient-card-neutral">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="p-1.5 rounded-lg bg-indigo-100">
                <Users className="h-4 w-4 text-indigo-600" />
              </div>
            </div>
            <p className="text-xl font-bold tracking-tight">{kpis.active}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Active Salesmen</p>
            <div className="mt-2 pt-2 border-t border-border/50">
              <p className="text-xs text-muted-foreground">With visits</p>
            </div>
          </CardContent>
        </Card>
        {/* Specimens */}
        <Card className="border-0 shadow-sm gradient-card-amber">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="p-1.5 rounded-lg bg-amber-100">
                <BarChart3 className="h-4 w-4 text-amber-600" />
              </div>
            </div>
            <p className="text-xl font-bold tracking-tight">{kpis.specs}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Specimens Given</p>
            <div className="mt-2 pt-2 border-t border-border/50">
              <p className="text-xs text-muted-foreground">This period</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Charts ── */}
      <div className="grid gap-5 lg:grid-cols-2 mb-5">
        {/* Trend */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4" /> Visit Trend (Last 7 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={trendData} margin={{ top: 0, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="day" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: "8px", fontSize: "12px" }} />
                <Legend wrapperStyle={{ fontSize: "12px" }} />
                <Line type="monotone" dataKey="School" stroke={COLORS.primary} strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="Bookseller" stroke={COLORS.success} strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Salesman Bar */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <BarChart3 className="h-4 w-4" /> Salesperson-wise Visits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={bySalesman} margin={{ top: 0, right: 8, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} angle={-20} textAnchor="end" height={50} />
                <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: "8px", fontSize: "12px" }} />
                <Legend wrapperStyle={{ fontSize: "12px" }} />
                <Bar dataKey="school" stackId="a" fill={COLORS.primary} name="School" />
                <Bar dataKey="bs" stackId="a" fill={COLORS.success} name="Bookseller" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* ── Tabs: Salesman Summary + Visit Log ── */}
      <Tabs defaultValue="summary">
        <TabsList className="mb-4">
          <TabsTrigger value="summary">Salesperson Summary</TabsTrigger>
          <TabsTrigger value="log">Visit Log ({filtered.length})</TabsTrigger>
        </TabsList>

        {/* ─ Salesman Summary ─ */}
        <TabsContent value="summary">
          <DataGrid
            data={bySalesman}
            columns={SUMMARY_COLUMNS}
            rowKey="id"
            defaultPageSize={10}
            enableRowPinning
            inlineFilters
            striped
            showStats={false}
          />
        </TabsContent>

        {/* ─ Visit Log ─ */}
        <TabsContent value="log">
          <DataGrid
            data={filtered}
            columns={LOG_COLUMNS}
            rowKey="id"
            defaultPageSize={10}
            enableRowPinning
            inlineFilters
            striped
            expandedRowRender={expandedRowRender}
            dateFilterKey="date"
            showStats={false}
          />
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}
