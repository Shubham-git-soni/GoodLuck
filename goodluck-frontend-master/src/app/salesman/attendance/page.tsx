"use client";

import { useState, useEffect, useMemo } from "react";
import { Clock, MapPin, Play, Square, AlertTriangle, Calendar, Timer, Download, X } from "lucide-react";
import PageContainer from "@/components/layouts/PageContainer";
import PageHeader from "@/components/layouts/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

// ─── Data ─────────────────────────────────────────────────────────────────────

const ATTENDANCE_RECORDS = [
  { date: "2025-11-25", day: "Tuesday",   start: "09:10 AM", end: "06:25 PM", duration: "9h 15m", durationMins: 555, status: "Full Day" },
  { date: "2025-11-24", day: "Monday",    start: "09:00 AM", end: "06:45 PM", duration: "9h 45m", durationMins: 585, status: "Full Day" },
  { date: "2025-11-22", day: "Saturday",  start: "09:30 AM", end: "01:15 PM", duration: "3h 45m", durationMins: 225, status: "Half Day" },
  { date: "2025-11-21", day: "Friday",    start: "08:55 AM", end: "06:30 PM", duration: "9h 35m", durationMins: 575, status: "Full Day" },
  { date: "2025-11-20", day: "Thursday",  start: "09:05 AM", end: "07:00 PM", duration: "9h 55m", durationMins: 595, status: "Full Day" },
  { date: "2025-11-19", day: "Wednesday", start: "09:20 AM", end: "06:10 PM", duration: "8h 50m", durationMins: 530, status: "Full Day" },
  { date: "2025-11-18", day: "Tuesday",   start: "09:00 AM", end: "06:00 PM", duration: "9h 00m", durationMins: 540, status: "Full Day" },
  { date: "2025-11-17", day: "Monday",    start: "10:15 AM", end: "03:30 PM", duration: "5h 15m", durationMins: 315, status: "Half Day" },
  { date: "2025-11-15", day: "Saturday",  start: "09:00 AM", end: "01:00 PM", duration: "4h 00m", durationMins: 240, status: "Half Day" },
  { date: "2025-11-14", day: "Friday",    start: "08:50 AM", end: "06:40 PM", duration: "9h 50m", durationMins: 590, status: "Full Day" },
  { date: "2025-10-31", day: "Thursday",  start: "09:00 AM", end: "06:30 PM", duration: "9h 30m", durationMins: 570, status: "Full Day" },
  { date: "2025-10-30", day: "Wednesday", start: "09:15 AM", end: "06:45 PM", duration: "9h 30m", durationMins: 570, status: "Full Day" },
  { date: "2025-10-29", day: "Tuesday",   start: "10:00 AM", end: "02:30 PM", duration: "4h 30m", durationMins: 270, status: "Half Day" },
  { date: "2025-10-28", day: "Monday",    start: "08:45 AM", end: "06:15 PM", duration: "9h 30m", durationMins: 570, status: "Full Day" },
  { date: "2025-10-25", day: "Friday",    start: "09:00 AM", end: "06:00 PM", duration: "9h 00m", durationMins: 540, status: "Full Day" },
];

const MONTHS = [
  { value: "all",     label: "All Months" },
  { value: "2025-11", label: "November 2025" },
  { value: "2025-10", label: "October 2025" },
  { value: "2025-09", label: "September 2025" },
];

const STATUSES = [
  { value: "all",      label: "All Status" },
  { value: "Full Day", label: "Full Day" },
  { value: "Half Day", label: "Half Day" },
];

function formatDisplayDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function minsToHours(mins: number) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h}h ${m.toString().padStart(2, "0")}m`;
}

// ─── Confirmation Sheet ────────────────────────────────────────────────────────

function ConfirmSheet({
  open, onClose, onConfirm, title, description, confirmLabel, confirmVariant = "default",
}: {
  open: boolean; onClose: () => void; onConfirm: () => void;
  title: string; description: string; confirmLabel: string;
  confirmVariant?: "default" | "destructive";
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 animate-in fade-in duration-200" onClick={onClose} />
      <div className="relative bg-background rounded-3xl shadow-2xl animate-in fade-in zoom-in-95 duration-200 w-full max-w-sm">
        <div className="px-6 pt-8 pb-2 text-center">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 mb-4">
            <AlertTriangle className="h-7 w-7 text-primary" />
          </div>
          <h3 className="text-lg font-bold tracking-tight mb-1">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <div className="px-6 pt-3 pb-6 flex flex-col gap-2.5">
          <Button size="lg" variant={confirmVariant} onClick={() => { onConfirm(); onClose(); }} className="w-full h-12 text-sm font-semibold rounded-2xl">
            {confirmLabel}
          </Button>
          <Button size="lg" variant="outline" onClick={onClose} className="w-full h-12 text-sm font-semibold rounded-2xl">
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AttendancePage() {
  const [isActive, setIsActive] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [city] = useState("Delhi");
  const [showStartConfirm, setShowStartConfirm] = useState(false);
  const [showEndConfirm, setShowEndConfirm] = useState(false);

  // ── Filters
  const [monthFilter, setMonthFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive && startTime) {
      interval = setInterval(() => {
        setElapsedTime(Math.floor((new Date().getTime() - startTime.getTime()) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, startTime]);

  const handleStartDay = () => {
    const now = new Date();
    setStartTime(now);
    setIsActive(true);
    toast.success("Day started successfully!");
  };

  const handleEndDay = () => {
    setIsActive(false);
    toast.success("Day ended successfully!");
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // ── Filtered records
  const filtered = useMemo(() => {
    return ATTENDANCE_RECORDS.filter((r) => {
      const monthOk = monthFilter === "all" || r.date.startsWith(monthFilter);
      const statusOk = statusFilter === "all" || r.status === statusFilter;
      return monthOk && statusOk;
    });
  }, [monthFilter, statusFilter]);

  // ── Summary stats from filtered
  const summary = useMemo(() => {
    const total = filtered.length;
    const fullDays = filtered.filter((r) => r.status === "Full Day").length;
    const halfDays = filtered.filter((r) => r.status === "Half Day").length;
    const totalMins = filtered.reduce((sum, r) => sum + r.durationMins, 0);
    return { total, fullDays, halfDays, totalMins };
  }, [filtered]);

  const hasFilters = monthFilter !== "all" || statusFilter !== "all";

  // ── CSV Export
  const handleExport = () => {
    const headers = ["Date", "Day", "Start Time", "End Time", "Hours Worked", "Status"];
    const rows = filtered.map((r) => [
      formatDisplayDate(r.date), r.day, r.start, r.end, r.duration, r.status,
    ]);
    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `attendance_${monthFilter === "all" ? "all" : monthFilter}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Attendance exported successfully!");
  };

  return (
    <PageContainer>
      <PageHeader title="Attendance" description="Mark your daily attendance" />

      {/* Confirmations */}
      <ConfirmSheet open={showStartConfirm} onClose={() => setShowStartConfirm(false)} onConfirm={handleStartDay}
        title="Start Your Day?" description="Your attendance and location will be recorded." confirmLabel="Yes, Start Day" />
      <ConfirmSheet open={showEndConfirm} onClose={() => setShowEndConfirm(false)} onConfirm={handleEndDay}
        title="End Your Day?" description="This action cannot be undone." confirmLabel="Yes, End Day" confirmVariant="destructive" />

      {/* ── Today's Status ── */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Today's Attendance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            {!isActive && !startTime ? (
              <>
                <div className="mb-6">
                  <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
                    <Play className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <p className="text-lg font-medium mb-2">Ready to start your day?</p>
                  <p className="text-sm text-muted-foreground">Click the button below to mark your attendance</p>
                </div>
                <Button size="lg" onClick={() => setShowStartConfirm(true)} className="min-w-[200px]">
                  <Play className="h-5 w-5 mr-2" />Start Day
                </Button>
              </>
            ) : (
              <>
                <div className="mb-6">
                  <Badge variant={isActive ? "default" : "secondary"} className="mb-4 text-sm px-4 py-2">
                    {isActive ? "Day in Progress" : "Day Ended"}
                  </Badge>
                  <div className="text-4xl font-bold font-mono mb-4">{formatTime(elapsedTime)}</div>
                  <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
                    <div>
                      <p className="mb-1">Started at</p>
                      <p className="font-medium text-foreground">{startTime?.toLocaleTimeString()}</p>
                    </div>
                    {!isActive && (
                      <div>
                        <p className="mb-1">Ended at</p>
                        <p className="font-medium text-foreground">{new Date().toLocaleTimeString()}</p>
                      </div>
                    )}
                  </div>
                </div>
                {isActive && (
                  <Button size="lg" variant="destructive" onClick={() => setShowEndConfirm(true)} className="min-w-[200px]">
                    <Square className="h-5 w-5 mr-2" />End Day
                  </Button>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Location Info */}
      {isActive && (
        <Card className="mb-6">
          <CardHeader><CardTitle className="text-base">Location Details</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">{city}</p>
                <p className="text-sm text-muted-foreground">Current location</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Attendance History ── */}
      <Card className="mt-2">
        {/* Header row: title + export */}
        <div className="flex items-center justify-between px-4 pt-4 pb-3 md:px-6 md:pt-5">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="font-semibold text-sm md:text-base">Attendance History</span>
          </div>
          <Button size="sm" variant="outline" onClick={handleExport} className="h-8 gap-1.5 text-xs px-3">
            <Download className="h-3.5 w-3.5" />
            Export
          </Button>
        </div>

        {/* ── Filters row ── */}
        <div className="px-4 pb-3 md:px-6">
          <div className="flex items-center gap-2">
            <Select value={monthFilter} onValueChange={setMonthFilter}>
              <SelectTrigger className="h-8 flex-1 text-xs">
                <SelectValue placeholder="Month" />
              </SelectTrigger>
              <SelectContent>
                {MONTHS.map((m) => <SelectItem key={m.value} value={m.value} className="text-xs">{m.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-8 flex-1 text-xs">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {STATUSES.map((s) => <SelectItem key={s.value} value={s.value} className="text-xs">{s.label}</SelectItem>)}
              </SelectContent>
            </Select>
            {hasFilters && (
              <button onClick={() => { setMonthFilter("all"); setStatusFilter("all"); }}
                className="h-8 w-8 flex items-center justify-center rounded-lg bg-muted hover:bg-muted/80 shrink-0 transition-colors">
                <X className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
            )}
          </div>
        </div>

        {/* ── Summary KPI strip — 4 cols always ── */}
        <div className="grid grid-cols-4 gap-0 border-t border-b divide-x divide-border">
          <div className="px-3 py-3 text-center md:px-4 md:py-4">
            <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wide mb-1 leading-tight">Total</p>
            <p className="text-lg font-bold leading-none">{summary.total}</p>
          </div>
          <div className="px-3 py-3 text-center md:px-4 md:py-4 bg-green-50/60 dark:bg-green-950/20">
            <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wide mb-1 leading-tight">Full</p>
            <p className="text-lg font-bold text-green-700 dark:text-green-400 leading-none">{summary.fullDays}</p>
          </div>
          <div className="px-3 py-3 text-center md:px-4 md:py-4 bg-amber-50/60 dark:bg-amber-950/20">
            <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wide mb-1 leading-tight">Half</p>
            <p className="text-lg font-bold text-amber-700 dark:text-amber-400 leading-none">{summary.halfDays}</p>
          </div>
          <div className="px-3 py-3 text-center md:px-4 md:py-4 bg-primary/5">
            <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wide mb-1 leading-tight">Hours</p>
            <p className="text-sm font-bold text-primary leading-none">{minsToHours(summary.totalMins)}</p>
          </div>
        </div>

        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Calendar className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm font-medium">No records found</p>
              <p className="text-xs mt-1">Try adjusting your filters</p>
            </div>
          ) : (
            <>
              {/* ── Desktop Table ── */}
              <div className="hidden md:flex md:flex-col rounded-b-xl overflow-hidden">
                <div className="overflow-y-auto max-h-[420px]">
                  <Table>
                    <TableHeader className="sticky top-0 z-10">
                      <TableRow className="bg-muted/40 hover:bg-muted/40">
                        <TableHead className="pl-6 font-semibold text-xs uppercase tracking-wide text-muted-foreground">#</TableHead>
                        <TableHead className="font-semibold text-xs uppercase tracking-wide text-muted-foreground">Date</TableHead>
                        <TableHead className="font-semibold text-xs uppercase tracking-wide text-muted-foreground">Day</TableHead>
                        <TableHead className="font-semibold text-xs uppercase tracking-wide text-muted-foreground">Start Time</TableHead>
                        <TableHead className="font-semibold text-xs uppercase tracking-wide text-muted-foreground">End Time</TableHead>
                        <TableHead className="font-semibold text-xs uppercase tracking-wide text-muted-foreground">Hours Worked</TableHead>
                        <TableHead className="pr-6 font-semibold text-xs uppercase tracking-wide text-muted-foreground">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filtered.map((record, index) => (
                        <TableRow
                          key={index}
                          className={`hover:bg-muted/20 transition-colors ${index % 2 === 0 ? "" : "bg-muted/10"}`}
                        >
                          <TableCell className="pl-6 text-muted-foreground text-sm">{index + 1}</TableCell>
                          <TableCell className="font-medium text-sm">{formatDisplayDate(record.date)}</TableCell>
                          <TableCell className="text-muted-foreground text-sm">{record.day}</TableCell>
                          <TableCell>
                            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-green-700 dark:text-green-400">
                              <span className="h-1.5 w-1.5 rounded-full bg-green-500 shrink-0" />
                              {record.start}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-rose-600 dark:text-rose-400">
                              <span className="h-1.5 w-1.5 rounded-full bg-rose-500 shrink-0" />
                              {record.end}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="inline-flex items-center gap-1 text-sm font-semibold">
                              <Timer className="h-3.5 w-3.5 text-muted-foreground" />
                              {record.duration}
                            </span>
                          </TableCell>
                          <TableCell className="pr-6">
                            <Badge
                              variant={record.status === "Full Day" ? "default" : "secondary"}
                              className="text-xs"
                            >
                              {record.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Table footer summary — always visible */}
                <div className="flex items-center justify-between px-6 py-3 border-t bg-muted/20 text-xs text-muted-foreground shrink-0">
                  <span>Showing {filtered.length} record{filtered.length !== 1 ? "s" : ""}</span>
                  <span className="font-semibold">Total: {minsToHours(summary.totalMins)}</span>
                </div>
              </div>

              {/* ── Mobile Cards ── */}
              <div className="md:hidden flex flex-col">
                <div className="overflow-y-auto max-h-[420px] divide-y divide-border">
                  {filtered.map((record, index) => (
                    <div key={index} className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="font-semibold text-sm">{formatDisplayDate(record.date)}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{record.day}</p>
                        </div>
                        <Badge variant={record.status === "Full Day" ? "default" : "secondary"} className="text-xs shrink-0">
                          {record.status}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="bg-green-50 dark:bg-green-950/30 rounded-lg px-3 py-2">
                          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-0.5">Start</p>
                          <p className="text-sm font-bold text-green-700 dark:text-green-400">{record.start}</p>
                        </div>
                        <div className="bg-rose-50 dark:bg-rose-950/30 rounded-lg px-3 py-2">
                          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-0.5">End</p>
                          <p className="text-sm font-bold text-rose-600 dark:text-rose-400">{record.end}</p>
                        </div>
                        <div className="bg-muted/60 rounded-lg px-3 py-2">
                          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-0.5">Hours</p>
                          <p className="text-sm font-bold">{record.duration}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {/* Mobile footer — always visible */}
                <div className="flex items-center justify-between px-4 py-3 border-t bg-muted/20 text-xs text-muted-foreground shrink-0">
                  <span>{filtered.length} record{filtered.length !== 1 ? "s" : ""}</span>
                  <span className="font-semibold">Total: {minsToHours(summary.totalMins)}</span>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </PageContainer>
  );
}
