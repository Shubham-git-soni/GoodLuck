"use client";

import { useEffect, useState, useMemo } from "react";
import { Download, CheckCircle, XCircle, Clock, AlertCircle, User, Filter, RotateCcw, CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import PageContainer from "@/components/layouts/PageContainer";
import PageHeader from "@/components/layouts/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DataGrid, GridColumn } from "@/components/ui/data-grid";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

import salesmenData from "@/lib/mock-data/salesmen.json";

// ─── Types ────────────────────────────────────────────────────────────────────
interface AttendanceRecord {
  id: string;
  date: string;
  salesmanId: string;
  salesmanName: string;
  state: string;
  city: string;
  checkIn: string;
  checkOut: string;
  workingHours: number; // in minutes
  status: "Present" | "Absent" | "Half Day" | "On Leave";
  visits: number;
}

// ─── Deterministic mock generator (no Math.random — stable across renders) ────
const STATUSES: AttendanceRecord["status"][] = ["Present", "Present", "Present", "Present", "Present", "Absent", "Half Day", "On Leave"];

function seedHash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) & 0xffffffff;
  return Math.abs(h);
}

function generateAttendance(): AttendanceRecord[] {
  const records: AttendanceRecord[] = [];
  const months = ["2025-11", "2025-10", "2025-09"];

  salesmenData.forEach((sm) => {
    months.forEach((month) => {
      const [y, m] = month.split("-").map(Number);
      const daysInMonth = new Date(y, m, 0).getDate();

      for (let day = 1; day <= daysInMonth; day++) {
        const date = `${month}-${String(day).padStart(2, "0")}`;
        const dow = new Date(date).getDay(); // 0=Sun, 6=Sat
        if (dow === 0) continue; // skip Sundays

        const seed = seedHash(`${sm.id}-${date}`);
        const status = STATUSES[seed % STATUSES.length];
        const city = sm.cities[seed % sm.cities.length];

        let checkIn = "-", checkOut = "-", workingHours = 0, visits = 0;

        if (status === "Present") {
          const inH = 9 + (seed % 2);
          const inM = (seed * 7) % 45;
          const outH = 17 + ((seed * 3) % 3);
          const outM = (seed * 13) % 60;
          checkIn = `${String(inH).padStart(2, "0")}:${String(inM).padStart(2, "0")}`;
          checkOut = `${String(outH).padStart(2, "0")}:${String(outM).padStart(2, "0")}`;
          workingHours = (outH * 60 + outM) - (inH * 60 + inM);
          visits = 1 + (seed % 4);
        } else if (status === "Half Day") {
          checkIn = `09:${String((seed * 7) % 30).padStart(2, "0")}`;
          checkOut = `13:${String((seed * 5) % 30).padStart(2, "0")}`;
          workingHours = 240;
          visits = 1 + (seed % 2);
        }

        records.push({
          id: `${sm.id}-${date}`,
          date,
          salesmanId: sm.id,
          salesmanName: sm.name,
          state: sm.state,
          city,
          checkIn,
          checkOut,
          workingHours,
          status,
          visits,
        });
      }
    });
  });

  return records.sort((a, b) => b.date.localeCompare(a.date));
}

const ALL_RECORDS = generateAttendance();

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtHrs = (mins: number) =>
  mins > 0 ? `${Math.floor(mins / 60)}h ${mins % 60}m` : "-";

const STATUS_CONFIG = {
  Present: { icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50", badge: "default" as const },
  Absent: { icon: XCircle, color: "text-rose-600", bg: "bg-rose-50", badge: "destructive" as const },
  "Half Day": { icon: Clock, color: "text-amber-600", bg: "bg-amber-50", badge: "secondary" as const },
  "On Leave": { icon: AlertCircle, color: "text-slate-500", bg: "bg-slate-50", badge: "outline" as const },
};

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function MonthPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const parsed = value ? value.split("-") : ["2025", "11"];
  const [year, setYear] = useState(parseInt(parsed[0]));
  const selMonth = value ? parseInt(parsed[1]) - 1 : -1;
  const label = value
    ? `${MONTH_NAMES[parseInt(value.split("-")[1]) - 1]} ${value.split("-")[0]}`
    : "Pick month";
  return (
    <div className="relative">
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
            <div className="flex items-center justify-between mb-2">
              <button type="button" onClick={() => setYear(y => y - 1)} className="h-7 w-7 rounded-full hover:bg-muted flex items-center justify-center">
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
              <span className="text-sm font-bold">{year}</span>
              <button type="button" onClick={() => setYear(y => y + 1)} className="h-7 w-7 rounded-full hover:bg-muted flex items-center justify-center">
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-1">
              {MONTH_NAMES.map((m, i) => {
                const isSel = selMonth === i && parseInt(parsed[0]) === year;
                return (
                  <button key={m} type="button"
                    onClick={() => { onChange(`${year}-${String(i + 1).padStart(2, "0")}`); setOpen(false); }}
                    className={cn("text-xs py-1.5 rounded-lg font-medium transition-all",
                      isSel ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                    )}>{m}</button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Columns ──────────────────────────────────────────────────────────────────
const MONTHLY_COLUMNS: GridColumn<any>[] = [
  { key: "sr", header: "Sr.", width: 60, pinned: "left", sortable: false, filterable: false, render: (_, __, i) => <span className="text-muted-foreground text-xs">{i + 1}</span> },
  {
    key: "name", header: "Salesperson", width: 220, pinned: "left", sortable: true, render: (_, row) => (
      <div className="flex flex-col">
        <span className="font-semibold text-sm">{row.name}</span>
        <span className="text-xs text-muted-foreground">{row.id}</span>
      </div>
    )
  },
  { key: "state", header: "State", width: 150, filterable: true, sortable: true },
  { key: "present", header: "Present", align: "center", width: 90, sortable: true, render: (v) => <span className="font-semibold text-emerald-700">{v}</span> },
  { key: "absent", header: "Absent", align: "center", width: 90, sortable: true, render: (v) => <span className="font-semibold text-rose-700">{v}</span> },
  { key: "halfDay", header: "Half Day", align: "center", width: 100, sortable: true, render: (v) => <span className="font-semibold text-amber-700">{v}</span> },
  { key: "onLeave", header: "On Leave", align: "center", width: 100, sortable: true, render: (v) => <span className="text-slate-500">{v}</span> },
  {
    key: "attPct",
    header: "Attendance %",
    width: 140,
    align: "center",
    sortable: true,
    render: (v) => (
      <div className="flex flex-col items-center gap-1">
        <span className={cn("text-xs font-bold", v >= 85 ? "text-emerald-600" : v >= 70 ? "text-amber-600" : "text-rose-600")}>
          {v}%
        </span>
        <Progress value={v} className="h-1.5 w-16" />
      </div>
    )
  },
  { key: "totalVisits", header: "Visits", width: 90, align: "center", sortable: true, render: (v) => <span className="font-medium">{v}</span> },
  { key: "avgHrs", header: "Avg Hrs/Day", width: 120, align: "right", sortable: true, render: (v) => <span className="text-xs text-muted-foreground">{fmtHrs(v as number)}</span> },
];

const DAILY_COLUMNS: GridColumn<any>[] = [
  { key: "sr", header: "Sr.", width: 60, pinned: "left", sortable: false, filterable: false, render: (_, __, i) => <span className="text-muted-foreground text-xs">{i + 1}</span> },
  {
    key: "date", header: "Date", width: 120, pinned: "left", sortable: true, render: (v) => (
      <span className="text-xs font-medium whitespace-nowrap">
        {new Date(v as string).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
      </span>
    )
  },
  {
    key: "salesmanName", header: "Salesperson", width: 220, pinned: "left", sortable: true, render: (_, row) => (
      <div className="flex flex-col">
        <span className="text-sm font-medium">{row.salesmanName}</span>
        <span className="text-[10px] text-muted-foreground">{row.salesmanId}</span>
      </div>
    )
  },
  { key: "state", header: "State", width: 120, filterable: true, sortable: true },
  { key: "city", header: "City", width: 120, filterable: true, sortable: true },
  { key: "checkIn", header: "Check In", width: 100, align: "center", render: (v) => <span className="text-xs font-mono">{v}</span> },
  { key: "checkOut", header: "Check Out", width: 100, align: "center", render: (v) => <span className="text-xs font-mono">{v}</span> },
  { key: "workingHours", header: "Working Hrs", width: 120, align: "right", sortable: true, render: (v) => <span className="text-xs font-medium">{fmtHrs(v as number)}</span> },
  { key: "visits", header: "Visits", width: 80, align: "center", sortable: true, filterable: false, render: (v) => (v as number) > 0 ? <Badge variant="outline" className="text-[10px]">{v as string}</Badge> : "-" },
  {
    key: "status", header: "Status", width: 100, align: "center", sortable: true, render: (v) => {
      const cfg = STATUS_CONFIG[v as keyof typeof STATUS_CONFIG];
      return <Badge variant={cfg.badge} className="text-[10px]">{v as string}</Badge>;
    }
  },
];

// ─── Component ────────────────────────────────────────────────────────────────
export default function AttendanceReportPage() {
  const [monthFilter, setMonthFilter] = useState("2025-11");
  const [stateFilter, setStateFilter] = useState("all");
  const [cityFilter, setCityFilter] = useState("all");
  const [salesmanFilter, setSalesmanFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Derive available cities based on selected state
  const availableCities = useMemo(() => {
    if (stateFilter === "all") return [];
    const sm = salesmenData.filter((s) => s.state === stateFilter);
    return Array.from(new Set(sm.flatMap((s) => s.cities))).sort();
  }, [stateFilter]);

  // Reset city when state changes
  useEffect(() => { setCityFilter("all"); }, [stateFilter]);

  const states = Array.from(new Set(salesmenData.map((s) => s.state))).sort();

  // ── Filtered records ────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    return ALL_RECORDS.filter((r) => {
      if (!r.date.startsWith(monthFilter)) return false;
      if (stateFilter !== "all" && r.state !== stateFilter) return false;
      if (cityFilter !== "all" && r.city !== cityFilter) return false;
      if (salesmanFilter !== "all" && r.salesmanId !== salesmanFilter) return false;
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      return true;
    });
  }, [monthFilter, stateFilter, cityFilter, salesmanFilter, statusFilter]);

  // ── Summary counts ──────────────────────────────────────────────────────────
  const summary = useMemo(() => {
    const counts = { Present: 0, Absent: 0, "Half Day": 0, "On Leave": 0 };
    filtered.forEach((r) => counts[r.status]++);
    const total = filtered.length;
    const totalVisits = filtered.reduce((s, r) => s + r.visits, 0);
    const totalHours = filtered.reduce((s, r) => s + r.workingHours, 0);
    return { ...counts, total, totalVisits, totalHours };
  }, [filtered]);

  // ── Per-salesman monthly summary ────────────────────────────────────────────
  const salesmanSummary = useMemo(() => {
    const map: Record<string, {
      id: string; name: string; state: string;
      present: number; absent: number; halfDay: number; onLeave: number;
      totalDays: number; totalVisits: number; totalHours: number;
    }> = {};

    filtered.forEach((r) => {
      if (!map[r.salesmanId]) {
        map[r.salesmanId] = { id: r.salesmanId, name: r.salesmanName, state: r.state, present: 0, absent: 0, halfDay: 0, onLeave: 0, totalDays: 0, totalVisits: 0, totalHours: 0 };
      }
      const e = map[r.salesmanId];
      e.totalDays++;
      e.totalVisits += r.visits;
      e.totalHours += r.workingHours;
      if (r.status === "Present") e.present++;
      else if (r.status === "Absent") e.absent++;
      else if (r.status === "Half Day") e.halfDay++;
      else if (r.status === "On Leave") e.onLeave++;
    });

    return Object.values(map).map(sm => {
      const attPct = sm.totalDays > 0 ? Math.round(((sm.present + sm.halfDay * 0.5) / sm.totalDays) * 100) : 0;
      const avgHrs = sm.present > 0 ? Math.round(sm.totalHours / sm.present) : 0;
      return { ...sm, attPct, avgHrs };
    }).sort((a, b) => b.present - a.present);
  }, [filtered]);

  const handleExport = () => toast.success("Exporting attendance report...");

  const resetFilters = () => {
    setMonthFilter("2025-11");
    setStateFilter("all");
    setCityFilter("all");
    setSalesmanFilter("all");
    setStatusFilter("all");
  };

  return (
    <PageContainer>
      <PageHeader
        title="Attendance Report"
        description="Salesperson-wise attendance, working hours & visit tracking"
      />

      {/* ── Filters — compact bar ── */}
      <div className="mb-5 flex flex-wrap items-center gap-2 bg-card border rounded-xl px-4 py-2.5 shadow-sm">
        <Filter className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide shrink-0 mr-1">Filters</span>

        {/* Month picker */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-muted-foreground shrink-0">Month:</span>
          <MonthPicker value={monthFilter} onChange={setMonthFilter} />
        </div>

        {/* State */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-muted-foreground shrink-0">State:</span>
          <Select value={stateFilter} onValueChange={setStateFilter}>
            <SelectTrigger className="h-8 w-32 text-xs"><SelectValue placeholder="All States" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All States</SelectItem>
              {states.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* City */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-muted-foreground shrink-0">City:</span>
          <Select value={cityFilter} onValueChange={setCityFilter} disabled={stateFilter === "all"}>
            <SelectTrigger className="h-8 w-28 text-xs"><SelectValue placeholder="All Cities" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Cities</SelectItem>
              {availableCities.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
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
              {salesmenData.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* Status */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-muted-foreground shrink-0">Status:</span>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-8 w-28 text-xs"><SelectValue placeholder="All Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Present">Present</SelectItem>
              <SelectItem value="Absent">Absent</SelectItem>
              <SelectItem value="Half Day">Half Day</SelectItem>
              <SelectItem value="On Leave">On Leave</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Actions — right side */}
        <div className="ml-auto flex items-center gap-2">
          <Button variant="ghost" size="sm" className="h-8 text-xs text-muted-foreground hover:text-primary" onClick={resetFilters}>
            <RotateCcw className="h-3.5 w-3.5 mr-1" /> Reset
          </Button>
          <Button size="sm" className="h-8 text-xs" onClick={handleExport}>
            <Download className="h-3.5 w-3.5 mr-1" /> Export
          </Button>
        </div>
      </div>

      {/* ── KPI Cards — dashboard style ── */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 mb-5">
        {/* Present */}
        <Card className="border-0 shadow-sm gradient-card-orange">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="p-1.5 rounded-lg bg-emerald-100">
                <CheckCircle className="h-4 w-4 text-emerald-600" />
              </div>
            </div>
            <p className="text-xl font-bold tracking-tight">{summary.Present}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Present</p>
            <div className="mt-2 pt-2 border-t border-border/50">
              <Progress value={summary.total > 0 ? Math.round((summary.Present / summary.total) * 100) : 0} className="h-1.5" />
              <p className="text-[10px] text-muted-foreground mt-1">{summary.total > 0 ? Math.round((summary.Present / summary.total) * 100) : 0}% of total</p>
            </div>
          </CardContent>
        </Card>
        {/* Absent */}
        <Card className="border-0 shadow-sm gradient-card-neutral">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="p-1.5 rounded-lg bg-rose-100">
                <XCircle className="h-4 w-4 text-rose-600" />
              </div>
            </div>
            <p className="text-xl font-bold tracking-tight">{summary.Absent}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Absent</p>
            <div className="mt-2 pt-2 border-t border-border/50">
              <Progress value={summary.total > 0 ? Math.round((summary.Absent / summary.total) * 100) : 0} className="h-1.5" />
              <p className="text-[10px] text-muted-foreground mt-1">{summary.total > 0 ? Math.round((summary.Absent / summary.total) * 100) : 0}% of total</p>
            </div>
          </CardContent>
        </Card>
        {/* Half Day */}
        <Card className="border-0 shadow-sm gradient-card-amber">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="p-1.5 rounded-lg bg-amber-100">
                <Clock className="h-4 w-4 text-amber-600" />
              </div>
            </div>
            <p className="text-xl font-bold tracking-tight">{summary["Half Day"]}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Half Day</p>
            <div className="mt-2 pt-2 border-t border-border/50">
              <Progress value={summary.total > 0 ? Math.round((summary["Half Day"] / summary.total) * 100) : 0} className="h-1.5" />
              <p className="text-[10px] text-muted-foreground mt-1">{summary.total > 0 ? Math.round((summary["Half Day"] / summary.total) * 100) : 0}% of total</p>
            </div>
          </CardContent>
        </Card>
        {/* On Leave */}
        <Card className="border-0 shadow-sm gradient-card-neutral">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="p-1.5 rounded-lg bg-slate-100">
                <AlertCircle className="h-4 w-4 text-slate-500" />
              </div>
            </div>
            <p className="text-xl font-bold tracking-tight">{summary["On Leave"]}</p>
            <p className="text-xs text-muted-foreground mt-0.5">On Leave</p>
            <div className="mt-2 pt-2 border-t border-border/50">
              <p className="text-xs text-muted-foreground">{summary.total} total days</p>
            </div>
          </CardContent>
        </Card>
        {/* Total Visits */}
        <Card className="border-0 shadow-sm gradient-card-orange">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="p-1.5 rounded-lg bg-primary/10">
                <User className="h-4 w-4 text-primary" />
              </div>
            </div>
            <p className="text-xl font-bold tracking-tight">{summary.totalVisits}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Total Visits</p>
            <div className="mt-2 pt-2 border-t border-border/50">
              <p className="text-xs text-muted-foreground">This month</p>
            </div>
          </CardContent>
        </Card>
        {/* Working Hours */}
        <Card className="border-0 shadow-sm gradient-card-amber">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="p-1.5 rounded-lg bg-emerald-100">
                <Clock className="h-4 w-4 text-emerald-600" />
              </div>
            </div>
            <p className="text-xl font-bold tracking-tight">{fmtHrs(summary.totalHours)}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Working Hours</p>
            <div className="mt-2 pt-2 border-t border-border/50">
              <p className="text-xs text-muted-foreground">Total logged</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Tabs: Monthly Summary vs Daily Records ── */}
      <Tabs defaultValue="summary">
        <TabsList className="mb-4">
          <TabsTrigger value="summary">Monthly Summary</TabsTrigger>
          <TabsTrigger value="daily">Daily Records ({filtered.length})</TabsTrigger>
        </TabsList>

        {/* ─ Monthly Summary Tab ─ */}
        <TabsContent value="summary">
          <DataGrid
            data={salesmanSummary}
            columns={MONTHLY_COLUMNS}
            rowKey="id"
            defaultPageSize={10}
            enableRowPinning
            inlineFilters
            striped
          />
        </TabsContent>

        {/* ─ Daily Records Tab ─ */}
        <TabsContent value="daily">
          <DataGrid
            data={filtered}
            columns={DAILY_COLUMNS}
            rowKey="id"
            defaultPageSize={15}
            enableRowPinning
            inlineFilters
            striped
          />
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}
