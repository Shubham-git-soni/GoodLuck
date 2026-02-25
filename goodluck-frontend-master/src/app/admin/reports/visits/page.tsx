"use client";

import { useEffect, useState, useMemo } from "react";
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DashboardSkeleton } from "@/components/ui/skeleton-loaders";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
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

  const statusBadge = (v: any) => {
    if (v.status === "Completed") return <Badge variant="default" className="text-[10px] gap-1"><CheckCircle2 className="h-3 w-3" />Completed</Badge>;
    return <Badge variant="outline" className="text-[10px] gap-1"><Clock3 className="h-3 w-3" />Scheduled</Badge>;
  };

  if (isLoading) return <PageContainer><DashboardSkeleton /></PageContainer>;

  const totalChg = pctChange(kpis.total, kpis.prevTot);

  return (
    <PageContainer>
      <PageHeader
        title="Visit Analytics"
        description="Track visits, specimen distribution and salesperson performance"
        action={
          <Button size="sm" onClick={exportCSV} variant="outline">
            <Download className="h-4 w-4 mr-1.5" /> Export CSV
          </Button>
        }
      />

      {/* ── Filters ── */}
      <Card className="mb-5">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Filter className="h-4 w-4" /> Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{DATE_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
            </Select>

            <Select value={stateFilter} onValueChange={setStateFilter}>
              <SelectTrigger><SelectValue placeholder="All States" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All States</SelectItem>
                {states.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>

            <Select value={salesmanFilter} onValueChange={setSalesmanFilter}>
              <SelectTrigger><SelectValue placeholder="All Salesperson" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Salesperson</SelectItem>
                {salesmenData.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger><SelectValue placeholder="All Types" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="school">School</SelectItem>
                <SelectItem value="bookseller">Bookseller</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={reset} className="w-full">
              <RotateCcw className="h-3.5 w-3.5 mr-1.5" /> Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-5">
        {[
          { label: "Total Visits", value: kpis.total, icon: Calendar, chg: totalChg, color: "text-primary" },
          { label: "School Visits", value: kpis.school, icon: School, chg: null, color: "text-primary" },
          { label: "Bookseller", value: kpis.bs, icon: BookOpen, chg: null, color: "text-teal-600" },
          { label: "Active Salesmen", value: kpis.active, icon: Users, chg: null, color: "text-indigo-600" },
          { label: "Specimens Given", value: kpis.specs, icon: BarChart3, chg: null, color: "text-amber-600" },
        ].map(({ label, value, icon: Icon, chg, color }) => (
          <Card key={label} className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="p-1.5 rounded-lg bg-muted"><Icon className={`h-4 w-4 ${color}`} /></div>
                {chg && (
                  <span className={`flex items-center text-xs font-semibold ${parseFloat(chg) >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                    {parseFloat(chg) >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                    {Math.abs(parseFloat(chg))}%
                  </span>
                )}
              </div>
              <p className="text-2xl font-bold">{value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
            </CardContent>
          </Card>
        ))}
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
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40 hover:bg-muted/40">
                      <TableHead className="w-10">Sr.</TableHead>
                      <TableHead>Salesperson</TableHead>
                      <TableHead>State</TableHead>
                      <TableHead className="text-center text-primary">School</TableHead>
                      <TableHead className="text-center text-teal-700">Bookseller</TableHead>
                      <TableHead className="text-center">Total</TableHead>
                      <TableHead className="text-center text-amber-700">Specimens</TableHead>
                      <TableHead>Share</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bySalesman.length === 0 ? (
                      <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">No visits found.</TableCell></TableRow>
                    ) : bySalesman.map((sm, i) => {
                      const pct = kpis.total > 0 ? Math.round((sm.total / kpis.total) * 100) : 0;
                      return (
                        <TableRow key={sm.id} className="hover:bg-slate-50/50">
                          <TableCell className="text-muted-foreground">{i + 1}</TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-semibold text-sm">{sm.name}</span>
                              <span className="text-[10px] text-muted-foreground">{sm.id} · {sm.region}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-xs">{sm.state}</TableCell>
                          <TableCell className="text-center font-semibold text-primary">{sm.school}</TableCell>
                          <TableCell className="text-center font-semibold text-teal-700">{sm.bs}</TableCell>
                          <TableCell className="text-center font-bold">{sm.total}</TableCell>
                          <TableCell className="text-center text-amber-700">{sm.specimens}</TableCell>
                          <TableCell className="min-w-[100px]">
                            <div className="flex items-center gap-2">
                              <Progress value={pct} className="h-1.5 flex-1" />
                              <span className="text-xs text-muted-foreground w-8">{pct}%</span>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─ Visit Log ─ */}
        <TabsContent value="log">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40 hover:bg-muted/40">
                      <TableHead className="w-8"></TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Salesperson</TableHead>
                      <TableHead>Visited</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Purpose</TableHead>
                      <TableHead className="text-center">Specimens</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.length === 0 ? (
                      <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">No visits found.</TableCell></TableRow>
                    ) : (filtered as any[]).map((v) => {
                      const expanded = expandedId === v.id;
                      return [
                        <TableRow
                          key={v.id}
                          className="cursor-pointer hover:bg-slate-50/70"
                          onClick={() => setExpandedId(expanded ? null : v.id)}
                        >
                          <TableCell>
                            <Button variant="ghost" size="icon" className="h-6 w-6">
                              {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                            </Button>
                          </TableCell>
                          <TableCell className="text-xs whitespace-nowrap font-medium">
                            {new Date(v.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                          </TableCell>
                          <TableCell>
                            <span className="text-sm font-medium">{v.salesmanName}</span>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm">{v.schoolName || v.bookSellerName || "—"}</span>
                          </TableCell>
                          <TableCell>
                            <Badge variant={v.type === "school" ? "default" : "secondary"} className="text-[10px]">
                              {v.type === "school" ? "School" : "Bookseller"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground max-w-[150px]">
                            <span className="truncate block">{(v.purposes as string[])?.join(", ") || "—"}</span>
                          </TableCell>
                          <TableCell className="text-center">
                            {(v.specimensGiven as any[])?.length > 0
                              ? <Badge variant="outline" className="text-[10px] text-amber-700">{v.specimensGiven.length} books</Badge>
                              : <span className="text-xs text-muted-foreground">—</span>
                            }
                          </TableCell>
                          <TableCell>{statusBadge(v)}</TableCell>
                        </TableRow>,

                        /* ── Expanded Detail Row ── */
                        expanded && (
                          <TableRow key={`${v.id}-detail`} className="bg-muted/20">
                            <TableCell colSpan={8} className="p-4">
                              <div className="grid sm:grid-cols-3 gap-4 text-sm">
                                {/* Contacts */}
                                {(v.contacts as any[])?.length > 0 && (
                                  <div>
                                    <p className="font-semibold text-xs text-muted-foreground uppercase mb-1.5">Contacts Met</p>
                                    <div className="space-y-1">
                                      {(v.contacts as any[]).map((c: any) => (
                                        <div key={c.id} className="flex items-center gap-1.5">
                                          <span className="font-medium">{c.name}</span>
                                          <Badge variant="secondary" className="text-[9px]">{c.role}</Badge>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Specimens */}
                                {(v.specimensGiven as any[])?.length > 0 && (
                                  <div>
                                    <p className="font-semibold text-xs text-muted-foreground uppercase mb-1.5">Specimens Given</p>
                                    <div className="space-y-1">
                                      {(v.specimensGiven as any[]).map((s: any, i: number) => (
                                        <div key={i} className="text-xs">
                                          <span className="font-medium">{s.book}</span>
                                          <span className="text-muted-foreground ml-1">×{s.quantity} (₹{s.cost})</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Feedback + Next Visit */}
                                <div className="space-y-3">
                                  {v.feedback && (
                                    <div>
                                      <p className="font-semibold text-xs text-muted-foreground uppercase mb-1">Feedback</p>
                                      <Badge variant="outline" className="text-[10px] mb-1">{v.feedback.category}</Badge>
                                      <p className="text-xs text-muted-foreground">{v.feedback.comment}</p>
                                    </div>
                                  )}
                                  {v.nextVisit && (
                                    <div>
                                      <p className="font-semibold text-xs text-muted-foreground uppercase mb-1">Next Visit</p>
                                      <p className="text-xs">
                                        {new Date(v.nextVisit.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                                        <span className="text-muted-foreground ml-1">· {v.nextVisit.purpose}</span>
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        ),
                      ];
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}
