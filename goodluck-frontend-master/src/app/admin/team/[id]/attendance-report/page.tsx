"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarCheck,
  Download,
  Filter,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  BarChart2,
  CalendarIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import PageContainer from "@/components/layouts/PageContainer";
import PageHeader from "@/components/layouts/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageSkeleton } from "@/components/ui/skeleton-loaders";
import { DataGrid, GridColumn } from "@/components/ui/data-grid";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts";

import salesmenData from "@/lib/mock-data/salesmen.json";

// Generate attendance data for the current month
const generateAttendanceData = () => {
  const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const year = 2026;
  const month = 2; // March (0-indexed)
  const daysInMonth = 9; // Only up to 9th March for recent data mimicking screenshot

  const attendanceRecords = [];

  for (let day = daysInMonth; day >= 1; day--) {
    const date = new Date(year, month, day);
    const dayOfWeek = daysOfWeek[date.getDay()];
    const dateString = date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).replace(/ /g, '-');

    // Skip Sundays
    if (dayOfWeek === "Sunday") {
      attendanceRecords.push({
        srNo: daysInMonth - day + 1,
        day: dayOfWeek,
        date: dateString,
        rawDate: date,
        startTime: "-",
        endTime: "-",
        workingHours: 0,
        status: "Absent",
      });
      continue;
    }

    // Random chance of absence
    const isPresent = Math.random() > 0.15;

    if (isPresent) {
      const startHour = 8 + Math.floor(Math.random() * 3);
      const startMinute = Math.floor(Math.random() * 60);
      const startSec = Math.floor(Math.random() * 60);
      const startTime = `${String(startHour).padStart(2, "0")}:${String(startMinute).padStart(2, "0")}:${String(startSec).padStart(2, "0")}`;

      let endTime = "-";
      let workingHours = 0;

      // Don't always have end time for today or some days
      if (Math.random() > 0.2) {
        const endHour = 17 + Math.floor(Math.random() * 4);
        const endMinute = Math.floor(Math.random() * 60);
        const endSec = Math.floor(Math.random() * 60);
        endTime = `${String(endHour).padStart(2, "0")}:${String(endMinute).padStart(2, "0")}:${String(endSec).padStart(2, "0")}`;

        const startDate = new Date(`2000-01-01T${startTime}`);
        const endDate = new Date(`2000-01-01T${endTime}`);
        workingHours = parseFloat(((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60)).toFixed(1));
      }

      attendanceRecords.push({
        srNo: daysInMonth - day + 1,
        day: dayOfWeek,
        date: dateString,
        rawDate: date,
        startTime,
        endTime,
        workingHours,
        status: "Present",
      });
    } else {
      attendanceRecords.push({
        srNo: daysInMonth - day + 1,
        day: dayOfWeek,
        date: dateString,
        rawDate: date,
        startTime: "-",
        endTime: "-",
        workingHours: 0,
        status: "Absent",
      });
    }
  }

  // Adding older dates to match screenshot rows
  let currentSrNo = attendanceRecords.length + 1;
  const olderDates = [
    { d: 28, m: 1, y: 2026 },
    { d: 27, m: 1, y: 2026 },
    { d: 26, m: 1, y: 2026 },
    { d: 25, m: 1, y: 2026 },
    { d: 24, m: 1, y: 2026 },
    { d: 23, m: 1, y: 2026 },
    { d: 22, m: 1, y: 2026 },
    { d: 20, m: 1, y: 2026 },
    { d: 19, m: 1, y: 2026 },
    { d: 18, m: 1, y: 2026 },
    { d: 17, m: 1, y: 2026 },
  ];

  olderDates.forEach(({ d, m, y }) => {
    const date = new Date(y, m, d);
    const dayOfWeek = daysOfWeek[date.getDay()];
    const dateString = date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).replace(/ /g, '-');

    attendanceRecords.push({
      srNo: currentSrNo++,
      day: dayOfWeek,
      date: dateString,
      rawDate: date,
      startTime: dayOfWeek === 'Sunday' ? "-" : `${String(8 + Math.floor(Math.random() * 2)).padStart(2, "0")}:${String(Math.floor(Math.random() * 60)).padStart(2, "0")}:${String(Math.floor(Math.random() * 60)).padStart(2, "0")}`,
      endTime: dayOfWeek === 'Sunday' || Math.random() > 0.7 ? "-" : `${String(17 + Math.floor(Math.random() * 3)).padStart(2, "0")}:${String(Math.floor(Math.random() * 60)).padStart(2, "0")}:${String(Math.floor(Math.random() * 60)).padStart(2, "0")}`,
      workingHours: dayOfWeek === 'Sunday' ? 0 : 8.5,
      status: dayOfWeek === 'Sunday' ? "Absent" : "Present",
    });
  });

  return attendanceRecords;
};

// ─── Chart View ──────────────────────────────────────────────────────────────
function AttendanceChartView({ data }: { data: any[] }) {
  // Present vs Absent
  const presentCount = data.filter(d => d.status === "Present").length;
  const absentCount = data.filter(d => d.status === "Absent").length;

  const pieData = [
    { name: "Present", value: presentCount, fill: "#10b981" },
    { name: "Absent", value: absentCount, fill: "#ef4444" },
  ];

  // Working Hours by Date (Reversed to show chronological order)
  const barData = [...data]
    .filter(d => d.status === "Present" && d.workingHours > 0)
    .sort((a, b) => a.rawDate.getTime() - b.rawDate.getTime())
    .slice(-14) // Limit to last 14 working days
    .map(d => ({
      date: d.date.substring(0, 6), // e.g. "09-Mar"
      hours: d.workingHours
    }));

  return (
    <div className="space-y-6 p-2">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Working Hours Trend */}
        <div className="bg-card border rounded-xl p-4 shadow-sm">
          <p className="text-sm font-semibold mb-3">Working Hours Trend (Last 14 Days)</p>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
              />
              <RechartsTooltip
                cursor={{ fill: 'transparent' }}
                contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Bar
                dataKey="hours"
                name="Working Hours"
                fill="#f97316"
                radius={[4, 4, 0, 0]}
                barSize={30}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Attendance Distribution */}
        <div className="bg-card border rounded-xl p-4 shadow-sm flex flex-col">
          <p className="text-sm font-semibold mb-2">Attendance Distribution</p>
          <div className="flex-1 flex items-center justify-center">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <RechartsTooltip
                  contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-2">
            {pieData.map((e) => (
              <div key={e.name} className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-sm" style={{ background: e.fill }} />
                <span className="text-sm font-medium">{e.name}: {e.value}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function MonthPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const parsed = value ? value.split("-") : ["2026", "03"];
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
          <div className="absolute top-10 right-0 md:left-0 md:right-auto z-50 bg-background border rounded-xl shadow-xl p-3 w-52">
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

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function AttendanceReportPage() {
  const params = useParams();
  const salesmanId = params.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [salesman, setSalesman] = useState<any>(null);
  const [attendanceData, setAttendanceData] = useState<any[]>([]);

  // Filters
  const [monthFilter, setMonthFilter] = useState("2026-03");

  useEffect(() => {
    setTimeout(() => {
      const foundSalesman = salesmenData.find((s) => s.id === salesmanId);
      if (foundSalesman) {
        setSalesman(foundSalesman);

        // Generate attendance data
        const attendance = generateAttendanceData();
        // Give each row an id for DataGrid
        const rowsWithId = attendance.map((r, i) => ({ ...r, id: `ATT-${i}` }));

        setAttendanceData(rowsWithId);
      }
      setIsLoading(false);
    }, 500);
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

  // Calculate summary statistics
  const totalDays = attendanceData.length;
  const presentDays = attendanceData.filter((item) => item.status === "Present").length;
  const absentDays = attendanceData.filter((item) => item.status === "Absent").length;
  const totalWorkingHours = attendanceData.reduce((sum, item) => sum + item.workingHours, 0);
  const avgWorkingHours = presentDays > 0 ? (totalWorkingHours / presentDays).toFixed(1) : 0;
  const attendancePercentage = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;

  // DataGrid Columns based on screenshot: Sr. No. | Day | Date | Start Time | End Time
  const columns: GridColumn<any>[] = [
    { key: "srNo", header: "Sr. No.", width: 80, sortable: true },
    { key: "day", header: "Day", width: 150, sortable: true, filterable: true, render: (v: string) => <span className="font-medium text-xs">{v}</span> },
    { key: "date", header: "Date", width: 160, sortable: true, filterable: true, render: (v: string) => <span className="text-xs">{v}</span> },
    {
      key: "startTime",
      header: "Start Time",
      width: 150,
      sortable: true,
      render: (v: string) => v !== "-" ? (
        <div className="flex items-center justify-center lg:justify-start gap-1.5 font-medium text-xs">
          {v}
        </div>
      ) : <span className="text-muted-foreground">—</span>
    },
    {
      key: "endTime",
      header: "End Time",
      width: 150,
      sortable: true,
      render: (v: string) => v !== "-" ? (
        <div className="flex items-center justify-center lg:justify-start gap-1.5 font-medium text-xs">
          {v}
        </div>
      ) : <span className="text-muted-foreground">—</span>
    },
  ];

  const extraViews = [
    {
      key: "chart",
      icon: <BarChart2 className="h-4 w-4" />,
      label: "Chart View",
      render: (data: any[]) => <AttendanceChartView data={data} />,
    },
  ];

  return (
    <PageContainer>
      {/* Header and specific filters layout */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link href={`/admin/team/${salesmanId}`}>
            <Button variant="ghost" size="sm" className="mb-2 -ml-3 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <PageHeader
            title={`Attendance Report of ${salesman.name}`}
            description={`Monthly attendance tracking for ${salesman.name}`}
          />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        {/* Present */}
        <Card className="border-0 shadow-sm gradient-card-orange">
          <CardContent className="p-2.5 md:p-4">
            <div className="flex items-center justify-between mb-2 md:mb-3">
              <div className="p-1 md:p-1.5 rounded-lg bg-emerald-100">
                <CheckCircle2 className="h-3.5 w-3.5 md:h-4 md:w-4 text-emerald-600" />
              </div>
            </div>
            <p className="text-base md:text-xl font-bold tracking-tight">{presentDays}</p>
            <p className="text-[10px] md:text-xs text-muted-foreground mt-0.5">Present</p>
            <div className="mt-1.5 pt-1.5 md:mt-2 md:pt-2 border-t border-border/50">
              <Progress value={totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0} className="h-1.5" />
              <p className="text-[10px] text-muted-foreground mt-1">{totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0}% of total</p>
            </div>
          </CardContent>
        </Card>

        {/* Absent */}
        <Card className="border-0 shadow-sm gradient-card-neutral">
          <CardContent className="p-2.5 md:p-4">
            <div className="flex items-center justify-between mb-2 md:mb-3">
              <div className="p-1 md:p-1.5 rounded-lg bg-rose-100">
                <XCircle className="h-3.5 w-3.5 md:h-4 md:w-4 text-rose-600" />
              </div>
            </div>
            <p className="text-base md:text-xl font-bold tracking-tight">{absentDays}</p>
            <p className="text-[10px] md:text-xs text-muted-foreground mt-0.5">Absent</p>
            <div className="mt-1.5 pt-1.5 md:mt-2 md:pt-2 border-t border-border/50">
              <Progress value={totalDays > 0 ? Math.round((absentDays / totalDays) * 100) : 0} className="h-1.5" />
              <p className="text-[10px] text-muted-foreground mt-1">{totalDays > 0 ? Math.round((absentDays / totalDays) * 100) : 0}% of total</p>
            </div>
          </CardContent>
        </Card>

        {/* Half Day (Keeping as placeholder or using Attendance %) */}
        <Card className="border-0 shadow-sm gradient-card-amber">
          <CardContent className="p-2.5 md:p-4">
            <div className="flex items-center justify-between mb-2 md:mb-3">
              <div className="p-1 md:p-1.5 rounded-lg bg-blue-100">
                <BarChart2 className="h-3.5 w-3.5 md:h-4 md:w-4 text-blue-600" />
              </div>
            </div>
            <p className="text-base md:text-xl font-bold tracking-tight">{attendancePercentage}%</p>
            <p className="text-[10px] md:text-xs text-muted-foreground mt-0.5">Attendance Pct.</p>
            <div className="mt-1.5 pt-1.5 md:mt-2 md:pt-2 border-t border-border/50">
              <Progress value={attendancePercentage} className="h-1.5" />
              <p className="text-[10px] text-muted-foreground mt-1">Based on present days</p>
            </div>
          </CardContent>
        </Card>

        {/* Total Days */}
        <Card className="border-0 shadow-sm gradient-card-neutral">
          <CardContent className="p-2.5 md:p-4">
            <div className="flex items-center justify-between mb-2 md:mb-3">
              <div className="p-1 md:p-1.5 rounded-lg bg-slate-100">
                <Calendar className="h-3.5 w-3.5 md:h-4 md:w-4 text-slate-500" />
              </div>
            </div>
            <p className="text-base md:text-xl font-bold tracking-tight">{totalDays}</p>
            <p className="text-[10px] md:text-xs text-muted-foreground mt-0.5">Total Days</p>
            <div className="mt-1.5 pt-1.5 md:mt-2 md:pt-2 border-t border-border/50">
              <p className="text-[10px] md:text-xs text-muted-foreground">Recorded in period</p>
            </div>
          </CardContent>
        </Card>

        {/* Avg Working Hours */}
        <Card className="border-0 shadow-sm gradient-card-amber">
          <CardContent className="p-2.5 md:p-4">
            <div className="flex items-center justify-between mb-2 md:mb-3">
              <div className="p-1 md:p-1.5 rounded-lg bg-emerald-100">
                <Clock className="h-3.5 w-3.5 md:h-4 md:w-4 text-emerald-600" />
              </div>
            </div>
            <p className="text-base md:text-xl font-bold tracking-tight">{avgWorkingHours}h</p>
            <p className="text-[10px] md:text-xs text-muted-foreground mt-0.5">Avg Hrs/Day</p>
            <div className="mt-1.5 pt-1.5 md:mt-2 md:pt-2 border-t border-border/50">
              <p className="text-[10px] md:text-xs text-muted-foreground">Across present days</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* DataGrid */}
      <DataGrid
        columns={columns}
        data={attendanceData}
        rowKey="id"
        extraViews={extraViews}
        toolbar={
          <div className="flex items-center gap-2 text-base">
            <span className="font-medium text-foreground mr-1 hidden md:inline-block">Filter Month:</span>
            <MonthPicker value={monthFilter} onChange={setMonthFilter} />
          </div>
        }
      />
    </PageContainer>
  );
}
