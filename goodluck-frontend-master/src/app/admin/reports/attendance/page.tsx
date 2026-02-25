"use client";

import { useEffect, useState, useMemo } from "react";
import { Download, CheckCircle, XCircle, Clock, AlertCircle, User, Filter, RotateCcw } from "lucide-react";
import PageContainer from "@/components/layouts/PageContainer";
import PageHeader from "@/components/layouts/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

import salesmenData from "@/lib/mock-data/salesmen.json";

// ─── Types ────────────────────────────────────────────────────────────────────
interface AttendanceRecord {
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

const MONTHS = [
  { value: "2025-11", label: "November 2025" },
  { value: "2025-10", label: "October 2025" },
  { value: "2025-09", label: "September 2025" },
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

    return Object.values(map).sort((a, b) => b.present - a.present);
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

      {/* ── Filters ── */}
      <Card className="mb-5">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Filter className="h-4 w-4" /> Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {/* Month */}
            <Select value={monthFilter} onValueChange={setMonthFilter}>
              <SelectTrigger><SelectValue placeholder="Month" /></SelectTrigger>
              <SelectContent>
                {MONTHS.map((m) => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
              </SelectContent>
            </Select>

            {/* State */}
            <Select value={stateFilter} onValueChange={setStateFilter}>
              <SelectTrigger><SelectValue placeholder="All States" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All States</SelectItem>
                {states.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>

            {/* City */}
            <Select value={cityFilter} onValueChange={setCityFilter} disabled={stateFilter === "all"}>
              <SelectTrigger><SelectValue placeholder="All Cities" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cities</SelectItem>
                {availableCities.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>

            {/* Salesperson */}
            <Select value={salesmanFilter} onValueChange={setSalesmanFilter}>
              <SelectTrigger><SelectValue placeholder="All Salesperson" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Salesperson</SelectItem>
                {salesmenData.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
              </SelectContent>
            </Select>

            {/* Status */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger><SelectValue placeholder="All Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Present">Present</SelectItem>
                <SelectItem value="Absent">Absent</SelectItem>
                <SelectItem value="Half Day">Half Day</SelectItem>
                <SelectItem value="On Leave">On Leave</SelectItem>
              </SelectContent>
            </Select>

            {/* Actions */}
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={resetFilters}>
                <RotateCcw className="h-3.5 w-3.5 mr-1.5" /> Reset
              </Button>
              <Button className="flex-1" onClick={handleExport}>
                <Download className="h-4 w-4 mr-1.5" /> Export
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Summary KPI Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {(["Present", "Absent", "Half Day", "On Leave"] as const).map((s) => {
          const cfg = STATUS_CONFIG[s];
          const Icon = cfg.icon;
          const pct = summary.total > 0 ? Math.round((summary[s] / summary.total) * 100) : 0;
          return (
            <Card key={s} className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className={`inline-flex p-2 rounded-lg ${cfg.bg} mb-2`}>
                  <Icon className={`h-4 w-4 ${cfg.color}`} />
                </div>
                <p className="text-2xl font-bold">{summary[s]}</p>
                <p className="text-xs text-muted-foreground">{s}</p>
                <div className="mt-2">
                  <Progress value={pct} className="h-1.5" />
                  <p className="text-[10px] text-muted-foreground mt-1">{pct}% of total days</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* ── Extra Stats ── */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <User className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-xl font-bold">{summary.totalVisits}</p>
              <p className="text-xs text-muted-foreground">Total Visits (Month)</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-100">
              <Clock className="h-4 w-4 text-emerald-600" />
            </div>
            <div>
              <p className="text-xl font-bold">{fmtHrs(summary.totalHours)}</p>
              <p className="text-xs text-muted-foreground">Total Working Hours</p>
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
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40 hover:bg-muted/40">
                      <TableHead className="w-10">Sr.</TableHead>
                      <TableHead>Salesperson</TableHead>
                      <TableHead>State</TableHead>
                      <TableHead className="text-center text-emerald-700">Present</TableHead>
                      <TableHead className="text-center text-rose-700">Absent</TableHead>
                      <TableHead className="text-center text-amber-700">Half Day</TableHead>
                      <TableHead className="text-center text-slate-500">On Leave</TableHead>
                      <TableHead className="text-center">Attendance %</TableHead>
                      <TableHead className="text-center">Visits</TableHead>
                      <TableHead className="text-right">Avg Hrs/Day</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {salesmanSummary.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                          No records found for selected filters.
                        </TableCell>
                      </TableRow>
                    ) : salesmanSummary.map((sm, i) => {
                      const attPct = sm.totalDays > 0
                        ? Math.round(((sm.present + sm.halfDay * 0.5) / sm.totalDays) * 100)
                        : 0;
                      const avgHrs = sm.present > 0 ? Math.round(sm.totalHours / sm.present) : 0;
                      return (
                        <TableRow key={sm.id} className="hover:bg-slate-50/50">
                          <TableCell className="text-muted-foreground">{i + 1}</TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-semibold text-sm">{sm.name}</span>
                              <span className="text-xs text-muted-foreground">{sm.id}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-xs">{sm.state}</TableCell>
                          <TableCell className="text-center font-semibold text-emerald-700">{sm.present}</TableCell>
                          <TableCell className="text-center font-semibold text-rose-700">{sm.absent}</TableCell>
                          <TableCell className="text-center font-semibold text-amber-700">{sm.halfDay}</TableCell>
                          <TableCell className="text-center text-slate-500">{sm.onLeave}</TableCell>
                          <TableCell>
                            <div className="flex flex-col items-center gap-1">
                              <span className={`text-xs font-bold ${attPct >= 85 ? "text-emerald-600" : attPct >= 70 ? "text-amber-600" : "text-rose-600"}`}>
                                {attPct}%
                              </span>
                              <Progress value={attPct} className="h-1.5 w-16" />
                            </div>
                          </TableCell>
                          <TableCell className="text-center font-medium">{sm.totalVisits}</TableCell>
                          <TableCell className="text-right text-xs text-muted-foreground">{fmtHrs(avgHrs)}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─ Daily Records Tab ─ */}
        <TabsContent value="daily">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40 hover:bg-muted/40">
                      <TableHead className="w-10">Sr.</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Salesperson</TableHead>
                      <TableHead>State</TableHead>
                      <TableHead>City</TableHead>
                      <TableHead>Check In</TableHead>
                      <TableHead>Check Out</TableHead>
                      <TableHead>Working Hrs</TableHead>
                      <TableHead className="text-center">Visits</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                          No records found.
                        </TableCell>
                      </TableRow>
                    ) : filtered.slice(0, 200).map((r, i) => {
                      const cfg = STATUS_CONFIG[r.status];
                      return (
                        <TableRow key={`${r.salesmanId}-${r.date}`} className="hover:bg-slate-50/50">
                          <TableCell className="text-muted-foreground text-xs">{i + 1}</TableCell>
                          <TableCell className="text-xs font-medium whitespace-nowrap">
                            {new Date(r.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="text-sm font-medium">{r.salesmanName}</span>
                              <span className="text-[10px] text-muted-foreground">{r.salesmanId}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-xs">{r.state}</TableCell>
                          <TableCell className="text-xs">{r.city}</TableCell>
                          <TableCell className="text-xs font-mono">{r.checkIn}</TableCell>
                          <TableCell className="text-xs font-mono">{r.checkOut}</TableCell>
                          <TableCell className="text-xs">{fmtHrs(r.workingHours)}</TableCell>
                          <TableCell className="text-center">
                            {r.visits > 0 ? (
                              <Badge variant="outline" className="text-[10px]">{r.visits}</Badge>
                            ) : "-"}
                          </TableCell>
                          <TableCell>
                            <Badge variant={cfg.badge} className="text-[10px]">{r.status}</Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    {filtered.length > 200 && (
                      <TableRow>
                        <TableCell colSpan={10} className="text-center py-3 text-xs text-muted-foreground">
                          Showing first 200 of {filtered.length} records. Use filters to narrow down.
                        </TableCell>
                      </TableRow>
                    )}
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
