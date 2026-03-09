"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Calendar, ChevronLeft, ChevronRight, Clock, MapPin, User,
  Building2, Briefcase, Phone, Filter, AlertTriangle, CheckCircle2,
  Search, Download, Plus, TrendingUp, CalendarDays, List, X, Mail,
  MoreVertical, Check, Trash2, Edit2, Copy, PlayCircle
} from "lucide-react";
import PageContainer from "@/components/layouts/PageContainer";
import PageHeader from "@/components/layouts/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuLabel } from "@/components/ui/dropdown-menu";
import { DatePicker } from "@/components/ui/date-picker";
import { TimePicker } from "@/components/ui/time-picker";
import { toast } from "sonner";

// Interfaces reused from the original component
interface Schedule {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  type: string;
  schoolId: string;
  schoolName: string;
  city: string;
  address: string;
  salesmanId: string;
  salesmanName: string;
  activity: string;
  topic: string;
  approvalStatus: "requested" | "approved" | "booked" | "completed";
  isCompleted: boolean;
  hasConflict?: boolean;
}

interface ProductManager {
  id: string;
  name: string;
  email: string;
  contactNo: string;
  state: string;
  status: string;
  currentStatus: string;
  schedules: Schedule[];
}

export default function PMCalendarPage() {
  const [productManagers, setProductManagers] = useState<ProductManager[]>([]);
  const [filteredManagers, setFilteredManagers] = useState<ProductManager[]>([]);

  // Date State
  const [currentDate, setCurrentDate] = useState(new Date()); // Base date for views

  // Filters
  const [stateFilter, setStateFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"day" | "week" | "list">("day");

  // Modal State
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [newScheduleData, setNewScheduleData] = useState({
    managerId: "", date: "", startTime: "", endTime: "", schoolName: "", topic: ""
  });

  // --- Initial Data Load ---
  useEffect(() => {
    // We are requiring the mock data statically
    const data = require("@/lib/mock-data/product-manager-schedules.json");
    setProductManagers(data);
    setFilteredManagers(data);
  }, []);

  // --- Date Math Helpers ---
  const getStartOfWeek = (d: Date) => {
    const start = new Date(d);
    const day = start.getDay();
    const diff = day === 0 ? -6 : 1 - day; // Monday as start
    start.setDate(start.getDate() + diff);
    start.setHours(0, 0, 0, 0);
    return start;
  };

  const currentWeekStart = getStartOfWeek(currentDate);

  const getWeekDates = () => {
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(currentWeekStart);
      d.setDate(currentWeekStart.getDate() + i);
      dates.push(d);
    }
    return dates;
  };

  const navDate = (dir: "prev" | "next") => {
    const newDate = new Date(currentDate);
    if (viewMode === "day") {
      newDate.setDate(currentDate.getDate() + (dir === "next" ? 1 : -1));
    } else {
      newDate.setDate(currentDate.getDate() + (dir === "next" ? 7 : -7));
    }
    setCurrentDate(newDate);
  };

  const goToToday = () => setCurrentDate(new Date());

  const formatDateStr = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const isTodayDate = (d: Date) => formatDateStr(d) === formatDateStr(new Date());

  // --- Filtering Logic ---
  useEffect(() => {
    let filtered = productManagers;

    if (stateFilter !== "all") {
      filtered = filtered.filter((pm) => pm.state === stateFilter);
    }
    if (statusFilter !== "all") {
      if (statusFilter === "free") {
        // Free means NO schedules for the CURRENT DATE
        const currDateStr = formatDateStr(currentDate);
        filtered = filtered.filter(pm => !pm.schedules.some(s => s.date === currDateStr));
      } else if (statusFilter === "busy") {
        const currDateStr = formatDateStr(currentDate);
        filtered = filtered.filter(pm => pm.schedules.some(s => s.date === currDateStr));
      }
    }
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((pm) =>
        pm.name.toLowerCase().includes(query) ||
        pm.email.toLowerCase().includes(query) ||
        pm.id.toLowerCase().includes(query) ||
        pm.state.toLowerCase().includes(query) ||
        pm.schedules.some(s =>
          s.schoolName.toLowerCase().includes(query) ||
          s.city.toLowerCase().includes(query) ||
          s.topic.toLowerCase().includes(query)
        )
      );
    }
    setFilteredManagers(filtered);
  }, [stateFilter, statusFilter, searchQuery, productManagers, currentDate]);

  // --- Schedule Math ---
  const getSchedules = (pm: ProductManager, dateStr: string) => {
    return pm.schedules.filter(s => s.date === dateStr);
  };

  const parseTime = (timeStr: string) => {
    const [h, m] = timeStr.split(":").map(Number);
    return h * 60 + (m || 0); // minutes since midnight
  };

  const detectConflicts = (schedules: Schedule[]) => {
    for (let i = 0; i < schedules.length; i++) {
      for (let j = i + 1; j < schedules.length; j++) {
        if (schedules[i].date === schedules[j].date) {
          const start1 = parseTime(schedules[i].startTime);
          const end1 = parseTime(schedules[i].endTime);
          const start2 = parseTime(schedules[j].startTime);
          const end2 = parseTime(schedules[j].endTime);
          if (Math.max(start1, start2) < Math.min(end1, end2)) return true;
        }
      }
    }
    return false;
  };

  const getApprovalColors = (status: string) => {
    const config: any = {
      requested: { bg: "bg-amber-100 dark:bg-amber-500/20", border: "border-amber-500", text: "text-amber-700 dark:text-amber-400", badge: "bg-amber-500" },
      approved: { bg: "bg-blue-100 dark:bg-blue-500/20", border: "border-blue-500", text: "text-blue-700 dark:text-blue-400", badge: "bg-blue-500" },
      booked: { bg: "bg-emerald-100 dark:bg-emerald-500/20", border: "border-emerald-500", text: "text-emerald-700 dark:text-emerald-400", badge: "bg-emerald-500" },
      completed: { bg: "bg-slate-100 dark:bg-slate-500/20", border: "border-slate-500", text: "text-slate-700 dark:text-slate-400", badge: "bg-slate-500" }
    };
    return config[status] || config.requested;
  };

  // --- Form Handlers ---
  const handleScheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Mocking submission
    setIsSheetOpen(false);
    toast.success("Schedule requested successfully!", {
      description: `Assigned ${newScheduleData.topic} to manager ID ${newScheduleData.managerId}.`
    });
    setNewScheduleData({ managerId: "", date: "", startTime: "", endTime: "", schoolName: "", topic: "" });
  };


  // --- Stat Calculations ---
  const uniqueStates = Array.from(new Set(productManagers.map((pm) => pm.state))).sort();

  const weekStartStr = formatDateStr(currentWeekStart);
  const weekDatesLocal = getWeekDates();
  const weekEndStr = formatDateStr(weekDatesLocal[6]);

  const totalSchedulesThisWeek = filteredManagers.reduce((acc, pm) => {
    return acc + pm.schedules.filter(s => s.date >= weekStartStr && s.date <= weekEndStr).length;
  }, 0);

  const busyTodayCount = filteredManagers.filter(pm => pm.schedules.some(s => s.date === formatDateStr(new Date()))).length;
  const totalConflicts = filteredManagers.reduce((acc, pm) => acc + (detectConflicts(pm.schedules) ? 1 : 0), 0);

  // --- Dynamic Form Availability Calculation ---
  const checkAvailability = (pm: ProductManager) => {
    if (!newScheduleData.date || !newScheduleData.startTime || !newScheduleData.endTime) return null;
    if (newScheduleData.startTime.length < 5 || newScheduleData.endTime.length < 5) return null;

    const reqStart = parseTime(newScheduleData.startTime);
    const reqEnd = parseTime(newScheduleData.endTime);
    if (reqStart >= reqEnd) return null; // Invalid time range

    for (const s of pm.schedules) {
      if (s.date === newScheduleData.date) {
        const sStart = parseTime(s.startTime);
        const sEnd = parseTime(s.endTime);
        // Standard overlap condition: StartA < EndB and StartB < EndA
        if (Math.max(reqStart, sStart) < Math.min(reqEnd, sEnd)) {
          return s; // The conflicting event
        }
      }
    }
    return null;
  };

  const availablePMs: ProductManager[] = [];
  const busyPMs: { pm: ProductManager; conflict: Schedule }[] = [];

  // Categorize based on newly entered form data
  productManagers.forEach(pm => {
    const conflict = checkAvailability(pm);
    if (conflict) {
      busyPMs.push({ pm, conflict });
    } else {
      availablePMs.push(pm);
    }
  });

  const selectedManagerConflict = newScheduleData.managerId
    ? checkAvailability(productManagers.find(m => m.id === newScheduleData.managerId) || { schedules: [] } as any)
    : null;

  // Day View specific grid constants
  const DAY_START_HOUR = 8; // 8 AM
  const DAY_END_HOUR = 20; // 8 PM
  const ROW_HEIGHT_PX = 80; // pixels per hour
  const hours = Array.from({ length: DAY_END_HOUR - DAY_START_HOUR }, (_, i) => i + DAY_START_HOUR);

  // --- Render Components ---
  const HeaderControls = () => (
    <div className="flex flex-col md:flex-row items-center justify-between gap-4 w-full">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" onClick={() => navDate("prev")}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="sm" onClick={goToToday} className="px-3">
          Today
        </Button>
        <Button variant="outline" size="icon" onClick={() => navDate("next")}>
          <ChevronRight className="h-4 w-4" />
        </Button>
        <div className="ml-2 font-semibold text-lg flex items-center gap-2">
          <DatePicker
            value={formatDateStr(currentDate)}
            onChange={(val) => {
              if (val) setCurrentDate(new Date(val + "T12:00:00"));
            }}
            className="w-auto min-w-[160px] border-none shadow-none text-foreground font-bold text-lg hover:bg-muted/50 focus-visible:ring-0 bg-transparent h-10 px-2"
          />
          {viewMode !== "day" && (
            <span className="text-sm text-muted-foreground font-medium hidden sm:block border-l pl-3">
              {weekDatesLocal[0].toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              {" - "}
              {weekDatesLocal[6].toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </span>
          )}
        </div>
      </div>
      <div className="flex gap-1.5 p-1 bg-muted/30 border rounded-lg">
        <Button variant={viewMode === "day" ? "default" : "ghost"} size="sm" onClick={() => setViewMode("day")} className="text-xs h-8">
          <Clock className="mr-1.5 h-3.5 w-3.5" /> Day View
        </Button>
        <Button variant={viewMode === "week" ? "default" : "ghost"} size="sm" onClick={() => setViewMode("week")} className="text-xs h-8">
          <Calendar className="mr-1.5 h-3.5 w-3.5" /> Week View
        </Button>
        <Button variant={viewMode === "list" ? "default" : "ghost"} size="sm" onClick={() => setViewMode("list")} className="text-xs h-8">
          <List className="mr-1.5 h-3.5 w-3.5" /> List
        </Button>
      </div>
    </div>
  );

  return (
    <PageContainer>
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex items-start justify-between mb-4">
          <PageHeader
            title="Schedules & Availability"
            description="Manage Product Manager itineraries and resolve assignment conflicts."
          />
          <div className="flex gap-2.5">
            {/* Slide-out Panel for New Schedule */}
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
              <SheetTrigger asChild>
                <Button size="sm" className="shadow-md">
                  <Plus className="h-4 w-4 mr-2" />
                  New Schedule
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[100vw] sm:w-[540px] sm:max-w-[540px] border-l shadow-2xl overflow-y-auto px-6">
                <SheetHeader className="mb-6">
                  <SheetTitle className="text-2xl font-bold">Assign a Manager</SheetTitle>
                  <SheetDescription>
                    Create a new block on a Product Manager's calendar.
                  </SheetDescription>
                </SheetHeader>
                <form onSubmit={handleScheduleSubmit} className="space-y-5">
                  <div className="bg-muted/30 p-4 -mx-6 -mt-2 border-b">
                    <div className="grid gap-4 flex-1">
                      <div className="space-y-2">
                        <Label className="text-primary font-bold">1. Select Appointment Window</Label>
                        <DatePicker value={newScheduleData.date} onChange={(date) => setNewScheduleData(p => ({ ...p, date }))} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div className="space-y-2">
                        <Label className="text-xs">Start Time</Label>
                        <TimePicker value={newScheduleData.startTime} onChange={(time) => setNewScheduleData(p => ({ ...p, startTime: time }))} />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs">End Time</Label>
                        <TimePicker value={newScheduleData.endTime} onChange={(time) => setNewScheduleData(p => ({ ...p, endTime: time }))} />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="font-bold">2. Assign Available Manager</Label>
                    <Select value={newScheduleData.managerId} onValueChange={(v) => setNewScheduleData(p => ({ ...p, managerId: v }))} required>
                      <SelectTrigger className={selectedManagerConflict ? "border-destructive/50 bg-destructive/5 text-destructive font-semibold shadow-sm shadow-destructive/10" : "shadow-sm"}>
                        <SelectValue placeholder="Select PM from available list..." />
                      </SelectTrigger>
                      <SelectContent className="max-h-[300px]">
                        <SelectGroup>
                          <SelectLabel className="text-emerald-700 bg-emerald-50 sticky top-0 font-bold border-b border-emerald-100 flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5" /> Available for this slot</SelectLabel>
                          {availablePMs.map(pm => (
                            <SelectItem key={pm.id} value={pm.id}>
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{pm.name}</span>
                                <Badge variant="outline" className="text-[9px] py-0 h-4 bg-muted/30">{pm.state}</Badge>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectGroup>
                        {busyPMs.length > 0 && (
                          <SelectGroup>
                            <SelectLabel className="text-destructive bg-destructive/10 sticky top-0 font-bold border-b border-destructive/20 mt-2 flex items-center gap-1.5"><AlertTriangle className="h-3.5 w-3.5" /> Busy (Has Conflicts)</SelectLabel>
                            {busyPMs.map(({ pm, conflict }) => (
                              <SelectItem key={pm.id} value={pm.id} className="text-muted-foreground focus:bg-destructive/10 focus:text-destructive">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium line-through decoration-destructive/50">{pm.name}</span>
                                  <span className="text-[10px] bg-background border px-1 rounded truncate max-w-[120px]">
                                    {conflict.startTime}-{conflict.endTime}
                                  </span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        )}
                      </SelectContent>
                    </Select>
                    {selectedManagerConflict && (
                      <div className="text-[11.5px] font-bold text-destructive bg-destructive/10 border border-destructive/20 p-3 rounded-lg flex items-start gap-2 shadow-sm animate-in slide-in-from-top-2">
                        <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                        <p className="leading-tight">
                          <span className="uppercase tracking-wide">Warning: Double Booking Overlap.</span> <br />
                          This manager is already scheduled for '<span className="italic">{selectedManagerConflict.topic}</span>' at {selectedManagerConflict.schoolName} from <span className="underline">{selectedManagerConflict.startTime} to {selectedManagerConflict.endTime}</span>.
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2 pt-4 border-t">
                    <Label className="font-bold">3. Target School / Client Info</Label>
                    <Input placeholder="E.g., DPS RK Puram" value={newScheduleData.schoolName} onChange={(e) => setNewScheduleData(p => ({ ...p, schoolName: e.target.value }))} required className="shadow-sm" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Topic / Agenda</Label>
                    <Input placeholder="E.g., Science Workshop Demo" value={newScheduleData.topic} onChange={(e) => setNewScheduleData(p => ({ ...p, topic: e.target.value }))} required className="shadow-sm" />
                  </div>

                  <div className="pt-6 border-t mt-6 gap-3 flex justify-end">
                    <Button type="button" variant="outline" onClick={() => setIsSheetOpen(false)}>Cancel</Button>
                    <Button type="submit" variant={selectedManagerConflict ? "destructive" : "default"} className="shadow-sm">
                      {selectedManagerConflict ? "Override and Confirm" : "Confirm Schedule"}
                    </Button>
                  </div>
                </form>
              </SheetContent>
            </Sheet>

          </div>
        </div>

      </div>

      {/* Analytics KPI Dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className="border bg-gradient-to-br from-background to-muted/30 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 group-hover:scale-110 transition-all duration-500">
            <User className="h-16 w-16" />
          </div>
          <CardContent className="p-3.5 flex flex-col justify-center h-full relative z-10">
            <div className="flex justify-between items-start mb-2">
              <div className="p-1.5 bg-primary/10 text-primary rounded-lg border border-primary/20 shadow-inner">
                <User className="h-4 w-4" />
              </div>
            </div>
            <div>
              <p className="text-2xl font-black tracking-tighter text-foreground drop-shadow-sm leading-none">{filteredManagers.length}</p>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">Total Staff</p>
            </div>
            <div className="mt-2 text-[10px] font-semibold text-muted-foreground/80 flex items-center gap-1.5 bg-background border px-2 py-0.5 w-max rounded-md shadow-sm">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Showing from {productManagers.length} total
            </div>
          </CardContent>
        </Card>

        <Card className="border bg-gradient-to-br from-background to-blue-500/5 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-2 opacity-5 group-hover:opacity-10 group-hover:scale-110 transition-all duration-500">
            <CalendarDays className="h-16 w-16 text-blue-500" />
          </div>
          <CardContent className="p-3.5 flex flex-col justify-center h-full relative z-10">
            <div className="flex justify-between items-start mb-2">
              <div className="p-1.5 bg-blue-500/10 text-blue-600 rounded-lg border border-blue-500/20 shadow-inner">
                <CalendarDays className="h-4 w-4" />
              </div>
            </div>
            <div>
              <p className="text-2xl font-black tracking-tighter text-foreground drop-shadow-sm leading-none">{totalSchedulesThisWeek}</p>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1 text-blue-600/80">Week Workload</p>
            </div>
            <div className="mt-2 text-[10px] font-bold text-blue-600/80 flex items-center gap-1.5 border border-blue-200 bg-blue-50/50 px-2 py-0.5 w-max rounded-md shadow-sm dark:bg-blue-900/20 dark:border-blue-800">
              <TrendingUp className="h-3 w-3" /> Active assignments
            </div>
          </CardContent>
        </Card>

        <Card className="border bg-gradient-to-br from-background to-amber-500/10 shadow-sm relative overflow-hidden group shadow-amber-500/5">
          <div className="absolute -top-6 -right-6 w-24 h-24 bg-amber-500/20 rounded-full blur-2xl group-hover:bg-amber-500/30 transition-colors duration-500" />
          <CardContent className="p-3.5 flex flex-col justify-center h-full relative z-10">
            <div className="flex justify-between items-start mb-2">
              <div className="p-1.5 bg-amber-500/10 text-amber-600 rounded-lg border border-amber-500/20 shadow-inner">
                <Briefcase className="h-4 w-4" />
              </div>
            </div>
            <div>
              <p className="text-2xl font-black tracking-tighter text-foreground drop-shadow-sm leading-none">{busyTodayCount}</p>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1 text-amber-600/80">Busy Today</p>
            </div>
            <div className="mt-2 bg-background/50 p-1.5 rounded-lg border shadow-sm backdrop-blur-sm">
              <Progress value={filteredManagers.length ? (busyTodayCount / filteredManagers.length) * 100 : 0} className="h-1 mb-1.5 bg-muted" indicatorColor="bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
              <div className="text-[9px] font-bold text-muted-foreground">{filteredManagers.length - busyTodayCount} fully available today</div>
            </div>
          </CardContent>
        </Card>

        <Card className="border bg-gradient-to-br from-background to-destructive/5 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-2 opacity-5 group-hover:opacity-10 group-hover:scale-110 transition-all duration-500">
            <AlertTriangle className="h-16 w-16 text-destructive" />
          </div>
          <CardContent className="p-3.5 flex flex-col justify-center h-full relative z-10">
            <div className="flex justify-between items-start mb-2">
              <div className="p-1.5 bg-destructive/10 text-destructive rounded-lg border border-destructive/20 shadow-inner">
                <AlertTriangle className="h-4 w-4" />
              </div>
            </div>
            <div>
              <p className="text-2xl font-black tracking-tighter text-destructive drop-shadow-sm leading-none">{totalConflicts}</p>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">Conflicts</p>
            </div>
            <div className={`mt-2 text-[10px] font-bold flex items-center gap-1 border px-2 py-0.5 w-max rounded-md shadow-sm ${totalConflicts === 0 ? 'text-emerald-600 bg-emerald-50/50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800' : 'text-destructive bg-destructive/10 border-destructive/20'}`}>
              {totalConflicts === 0 ? "✓ Zero overlaps." : "⚠ Attention required."}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-4 bg-muted/10 border-0 shadow-none rounded-none border-b py-2 px-1">
        <HeaderControls />
      </Card>

      {/* ======================= DAY VIEW (GRID TIMELINE) ======================= */}
      {viewMode === "day" && (
        <Card className="border overflow-hidden flex flex-col h-[650px] shadow-sm bg-background">
          <div className="flex flex-1 overflow-hidden relative">
            {/* Y-Axis: Time Headers Fixed Left */}
            <div className="w-16 flex-shrink-0 border-r bg-muted/20 sticky left-0 z-30 shadow-[1px_0_5px_rgba(0,0,0,0.05)]">
              <div className="h-14 border-b bg-muted/40" /> {/* Corner Top Left */}
              <div className="relative">
                {hours.map(hour => (
                  <div key={hour} className="absolute w-full text-right pr-2 text-[10px] font-medium text-muted-foreground -mt-2" style={{ top: (hour - DAY_START_HOUR) * ROW_HEIGHT_PX }}>
                    {hour > 12 ? `${hour - 12} PM` : hour === 12 ? '12 PM' : `${hour} AM`}
                  </div>
                ))}
                <div style={{ height: hours.length * ROW_HEIGHT_PX }} />
              </div>
            </div>

            {/* X-Axis: Managers Scrolling Panel */}
            <div className="flex-1 overflow-x-auto overflow-y-auto w-full relative group custom-scrollbar">
              <div className="flex min-w-max h-full">
                {filteredManagers.map(pm => {
                  const dateStr = formatDateStr(currentDate);
                  const dailySchedules = getSchedules(pm, dateStr);
                  const hasSchedules = dailySchedules.length > 0;

                  return (
                    <div key={pm.id} className="w-56 flex-shrink-0 border-r relative group">
                      {/* Manager Header cell (sticky top) */}
                      <div className="sticky top-0 bg-background/95 backdrop-blur z-20 h-14 border-b flex flex-col justify-center px-4 hover:bg-muted/30 transition-colors shadow-sm cursor-pointer" onClick={() => {
                        setNewScheduleData(prev => ({ ...prev, managerId: pm.id, date: dateStr }));
                        setIsSheetOpen(true);
                      }}>
                        <div className="flex items-center gap-2">
                          <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
                            <span className="text-[10px] font-bold text-primary">{pm.name.charAt(0)}</span>
                          </div>
                          <div className="min-w-0">
                            <h3 className="text-sm font-semibold truncate leading-tight dark:text-gray-200">{pm.name}</h3>
                            <div className="text-[10px] text-muted-foreground truncate flex items-center gap-1">
                              <div className={`h-1.5 w-1.5 rounded-full ${hasSchedules ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                              <span>{pm.state}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Timeline Grid lines */}
                      <div className="relative w-full" style={{ height: hours.length * ROW_HEIGHT_PX }}>
                        {hours.map(hour => (
                          <div
                            key={hour}
                            className="absolute w-full border-b border-dashed border-border/60 hover:bg-primary/5 cursor-crosshair transition-colors"
                            style={{ top: (hour - DAY_START_HOUR) * ROW_HEIGHT_PX, height: ROW_HEIGHT_PX }}
                            // Click empty grid to schedule
                            onClick={() => {
                              const hstr = String(hour).padStart(2, '0');
                              const hstrEnd = String(hour + 1).padStart(2, '0');
                              setNewScheduleData(prev => ({ ...prev, managerId: pm.id, date: dateStr, startTime: `${hstr}:00`, endTime: `${hstrEnd}:00` }));
                              setIsSheetOpen(true);
                            }}
                          >
                            {/* Half-hour subtle divider for aesthetic scale */}
                            <div className="absolute top-1/2 left-0 w-full border-b border-border/30 border-dotted" />
                          </div>
                        ))}

                        {/* Plotted Events for this Manager */}
                        {dailySchedules.map(sch => {
                          const startMins = parseTime(sch.startTime);
                          const endMins = parseTime(sch.endTime);
                          const dayStartMins = DAY_START_HOUR * 60;

                          // Calculate boundaries to prevent overflowing past grid top/bottom
                          const plotStart = Math.max(startMins, dayStartMins);
                          const plotEnd = Math.min(endMins, DAY_END_HOUR * 60);

                          if (plotStart >= plotEnd) return null; // Outside viewing window

                          const topPx = ((plotStart - dayStartMins) / 60) * ROW_HEIGHT_PX;
                          const heightPx = ((plotEnd - plotStart) / 60) * ROW_HEIGHT_PX;

                          const colors = getApprovalColors(sch.approvalStatus);

                          return (
                            <Popover key={sch.id}>
                              <PopoverTrigger asChild>
                                <div
                                  className={`absolute left-1 right-1 rounded-md sm:rounded-lg border-l-4 p-1.5 sm:p-2 overflow-hidden shadow-sm hover:shadow-md hover:ring-1 cursor-pointer transition-all hover:z-10 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm group/event ${colors.border}`}
                                  style={{
                                    top: topPx + 1, // +1 for aesthetics 
                                    height: Math.max(heightPx - 2, 24), // min-height text 
                                  }}
                                >
                                  <div className={`absolute inset-0 opacity-60 dark:opacity-100 ${colors.bg}`} />
                                  <div className="relative h-full flex flex-col z-10">
                                    <div className="flex items-start justify-between gap-1 mb-0.5">
                                      <span className="text-[9px] font-bold text-muted-foreground whitespace-nowrap bg-background/80 rounded px-1">{sch.startTime}</span>
                                      {heightPx >= ROW_HEIGHT_PX && <Badge className={`h-3 px-1 text-[8px] rounded-sm uppercase ${colors.badge} text-white font-bold tracking-wider opacity-80 border-none`}>{sch.approvalStatus.slice(0, 4)}</Badge>}
                                    </div>
                                    <div className={`text-[11px] font-bold leading-none line-clamp-1 group-hover/event:line-clamp-none group-hover/event:mb-1 ${colors.text}`}>{sch.topic}</div>
                                    {heightPx >= 45 && <div className="text-[10px] text-muted-foreground line-clamp-1 mt-1 font-medium">{sch.schoolName}</div>}
                                  </div>
                                </div>
                              </PopoverTrigger>
                              <PopoverContent side="right" align="start" className="w-[320px] p-0 overflow-hidden shadow-xl border-t-4 border-t-primary fade-in slide-in-from-left-2">
                                <div className="bg-muted/20 p-4 border-b relative">
                                  <Badge className="absolute right-4 top-4 uppercase tracking-widest text-[9px] shadow-sm">{sch.approvalStatus}</Badge>
                                  <h4 className="font-bold text-lg pr-16 leading-tight mb-2">{sch.topic}</h4>
                                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                    <Clock className="h-3.5 w-3.5 text-primary" />
                                    <span className="font-medium text-foreground">{sch.date}</span> at <span className="font-medium text-foreground">{sch.startTime} - {sch.endTime}</span>
                                  </div>
                                </div>
                                <div className="p-4 space-y-3.5 bg-background">
                                  <div className="flex gap-3">
                                    <div className="mt-0.5 bg-primary/10 p-1.5 rounded-md"><Building2 className="h-4 w-4 text-primary" /></div>
                                    <div>
                                      <div className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground mb-0.5">Location / Client</div>
                                      <div className="text-sm font-medium">{sch.schoolName}</div>
                                      <div className="text-xs text-muted-foreground">{sch.city}</div>
                                    </div>
                                  </div>
                                  <div className="flex gap-3">
                                    <div className="mt-0.5 bg-primary/10 p-1.5 rounded-md"><User className="h-4 w-4 text-primary" /></div>
                                    <div>
                                      <div className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground mb-0.5">Assigned To</div>
                                      <div className="text-sm font-medium flex items-center gap-1.5">
                                        {pm.name}
                                        <Badge variant="outline" className="h-5 text-[9px] py-0">{pm.id}</Badge>
                                      </div>
                                      <div className="text-xs text-muted-foreground mt-0.5 flex gap-2">
                                        <span className="flex items-center"><Mail className="h-3 w-3 mr-1" /> {pm.email}</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <div className="p-3 bg-muted/40 border-t flex justify-between">
                                  <Button variant="outline" size="sm" className="h-8 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive">Cancel Event</Button>
                                  <Button variant="default" size="sm" className="h-8 text-xs">Edit Details</Button>
                                </div>
                              </PopoverContent>
                            </Popover>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
                {filteredManagers.length === 0 && (
                  <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-muted/5 opacity-80">
                    <Search className="h-12 w-12 text-muted-foreground/30 mb-4" />
                    <h3 className="text-lg font-bold text-muted-foreground mb-1">No personnel matched.</h3>
                    <p className="text-xs text-muted-foreground">Try clearing your filters to see schedules.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* ======================= WEEK VIEW (GANNT TIMELINE) ======================= */}
      {viewMode === "week" && (
        <Card className="border shadow-sm overflow-hidden flex flex-col bg-background h-[650px]">
          {/* Header: Dates */}
          <div className="flex border-b shadow-sm z-20 sticky top-0 bg-muted/10 backdrop-blur-md">
            <div className="w-48 xl:w-64 p-3 font-semibold text-xs uppercase tracking-wider text-muted-foreground flex items-center border-r shrink-0">
              <Briefcase className="mr-2 h-4 w-4" /> Team / Manager
            </div>
            <div className="flex flex-1 overflow-hidden">
              {weekDatesLocal.map((d, i) => {
                const today = isTodayDate(d);
                return (
                  <div key={i} className={`flex-1 min-w-[120px] p-3 border-r flex flex-col ${today ? 'bg-primary/5' : ''}`}>
                    <span className={`text-[10px] uppercase font-bold ${today ? 'text-primary' : 'text-muted-foreground'}`}>{d.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className={`text-xl font-bold ${today ? 'text-primary' : ''}`}>{d.getDate()}</span>
                      {today && <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Content Body */}
          <div className="flex-1 overflow-y-auto w-full relative custom-scrollbar">
            {filteredManagers.map(pm => (
              <div key={pm.id} className="flex border-b border-border/60 hover:bg-muted/10 transition-colors group">
                {/* Manager Column */}
                <div className="w-48 xl:w-64 p-3 border-r relative shrink-0">
                  <div className="flex items-center gap-3 w-full">
                    <div className="h-8 w-8 rounded bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
                      <span className="text-xs font-bold text-primary">{pm.name.charAt(0)}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-sm truncate flex items-center gap-2">
                        {pm.name}
                      </div>
                      <div className="text-[10px] text-muted-foreground mt-0.5 flex flex-wrap gap-1 items-center">
                        <Badge variant="outline" className="px-1 h-3.5 text-[8px] rounded-sm">{pm.id}</Badge>
                        <span className="truncate">{pm.state}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Schedule Columns per day */}
                <div className="flex flex-1">
                  {weekDatesLocal.map((d, i) => {
                    const schs = getSchedules(pm, formatDateStr(d)).sort((a, b) => parseTime(a.startTime) - parseTime(b.startTime));
                    const isToday = isTodayDate(d);
                    return (
                      <div key={i} className={`flex-1 min-w-[120px] border-r border-border/40 p-1.5 flex flex-col gap-1.5 ${isToday ? 'bg-primary/5' : ''}`}>
                        {schs.map(sch => {
                          const colors = getApprovalColors(sch.approvalStatus);
                          return (
                            <Popover key={sch.id}>
                              <PopoverTrigger asChild>
                                <div className={`p-1.5 rounded border-l-[3px] shadow-sm text-left hover:shadow-md cursor-pointer transition-all ${colors.border} ${colors.bg} dark:bg-gray-800`}>
                                  <div className="flex items-start justify-between">
                                    <div className="text-[9px] font-bold text-muted-foreground/80 mb-0.5">{sch.startTime}</div>
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <button className="h-4 w-4 flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-muted/50 rounded transition-all">
                                          <MoreVertical className="h-3 w-3 text-muted-foreground" />
                                        </button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end" className="w-40 text-xs">
                                        <DropdownMenuLabel className="text-[10px] uppercase font-bold text-muted-foreground">Quick Actions</DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem><Check className="h-3.5 w-3.5 mr-2 text-emerald-500" /> Mark Completed</DropdownMenuItem>
                                        <DropdownMenuItem><Edit2 className="h-3.5 w-3.5 mr-2 text-blue-500" /> Edit Details</DropdownMenuItem>
                                        <DropdownMenuItem><Copy className="h-3.5 w-3.5 mr-2 text-muted-foreground" /> Copy Schedule</DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem className="text-destructive"><Trash2 className="h-3.5 w-3.5 mr-2" /> Cancel Event</DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </div>
                                  <div className={`text-[10px] font-bold truncate leading-tight ${colors.text}`}>{sch.topic}</div>
                                  <div className="text-[9px] text-muted-foreground truncate">{sch.schoolName}</div>
                                </div>
                              </PopoverTrigger>
                              <PopoverContent className="w-64 p-3 text-sm" align="start">
                                <div className="font-bold mb-1">{sch.topic}</div>
                                <div className="text-xs text-muted-foreground flex justify-between mb-2">
                                  <span>{sch.startTime} - {sch.endTime}</span>
                                  <Badge variant="outline" className="uppercase text-[8px]">{sch.approvalStatus}</Badge>
                                </div>
                                <div className="text-xs mb-1 font-medium"><Building2 className="inline h-3 w-3 mr-1" />{sch.schoolName}</div>
                              </PopoverContent>
                            </Popover>
                          );
                        })}
                        {/* Optional add button on hover */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <div className="h-full min-h-[40px] rounded border border-dashed border-transparent hover:border-primary/40 hover:bg-primary/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer mt-auto">
                              <Plus className="h-4 w-4 text-primary/50" />
                            </div>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="center" className="w-48 text-xs">
                            <DropdownMenuLabel className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">New For {pm.name}</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => {
                              setNewScheduleData({ ...newScheduleData, managerId: pm.id, date: formatDateStr(d), topic: "" });
                              setIsSheetOpen(true);
                            }}>
                              <Briefcase className="h-3.5 w-3.5 mr-2 text-primary" /> Regular Visit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {
                              setNewScheduleData({ ...newScheduleData, managerId: pm.id, date: formatDateStr(d), topic: "Product Workshop" });
                              setIsSheetOpen(true);
                            }}>
                              <PlayCircle className="h-3.5 w-3.5 mr-2 text-amber-500" /> Workshop Session
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-muted-foreground">
                              <User className="h-3.5 w-3.5 mr-2" /> Mark as Leave/OOF
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* ======================= LIST VIEW ======================= */}
      {viewMode === "list" && (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/40 border-b">
                <tr>
                  <th className="px-4 py-3 font-semibold">Date / Time</th>
                  <th className="px-4 py-3 font-semibold">Manager</th>
                  <th className="px-4 py-3 font-semibold">Agenda Focus</th>
                  <th className="px-4 py-3 font-semibold">Location</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredManagers.flatMap(pm => pm.schedules.map(sch => ({ ...sch, pm }))).sort((a, b) => {
                  if (a.date !== b.date) return a.date.localeCompare(b.date);
                  return parseTime(a.startTime) - parseTime(b.startTime);
                }).filter(item => {
                  const d = new Date(item.date);
                  return d >= weekDatesLocal[0] && d <= weekDatesLocal[6];
                }).map((sch, i) => (
                  <tr key={i} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="font-semibold text-foreground">{sch.date}</div>
                      <div className="text-xs text-muted-foreground flex items-center mt-0.5"><Clock className="h-3 w-3 mr-1" /> {sch.startTime} - {sch.endTime}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold">{sch.pm.name}</div>
                      <div className="text-xs text-muted-foreground">{sch.pm.state}</div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className="mb-1 text-[9px] uppercase tracking-wider">{sch.type}</Badge>
                      <div className="font-medium text-foreground">{sch.topic}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-foreground flex items-center"><Building2 className="h-3.5 w-3.5 mr-1" /> {sch.schoolName}</div>
                      <div className="text-xs text-muted-foreground pl-4 mt-0.5">{sch.city}</div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge className={`text-white text-[10px] uppercase font-bold ${getApprovalColors(sch.approvalStatus).badge}`}>
                        {sch.approvalStatus}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredManagers.flatMap(pm => pm.schedules).length === 0 && (
              <div className="text-center p-8 text-muted-foreground">No records matched active filters layer.</div>
            )}
          </div>
        </Card>
      )}

    </PageContainer>
  );
}
