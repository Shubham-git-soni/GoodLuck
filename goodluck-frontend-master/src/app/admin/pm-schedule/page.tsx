"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Calendar, Clock, MapPin, User, Briefcase, Search, Filter,
  Plus, AlertTriangle, CheckCircle2, CheckCheck, XCircle,
  CalendarCheck, Pencil, Ban, Eye
} from "lucide-react";
import PageContainer from "@/components/layouts/PageContainer";
import PageHeader from "@/components/layouts/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { DataGrid, GridColumn, RowAction } from "@/components/ui/data-grid";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { DatePicker } from "@/components/ui/date-picker";
import { TimePicker } from "@/components/ui/time-picker";
import { MobileSheet } from "@/components/ui/mobile-sheet";
import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Legend, CartesianGrid
} from "recharts";
import { BarChart2 } from "lucide-react";

// ─── Types ─────────────────────────────────────────────────────────────────────
type ApprovalStatus = "requested" | "booked" | "completed" | "rejected";

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
  approvalStatus: ApprovalStatus;
  isCompleted: boolean;
  hasConflict?: boolean;
  rejectionReason?: string;
  // fields added during "Approve & Book" step
  preferredPmId?: string;
  preferredDateFrom?: string;
  preferredDateTo?: string;
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

interface FlattenedSchedule extends Schedule {
  uniqueId: string;
  pmId: string;
  pmName: string;
  pmEmail: string;
  pmState: string;
  pmStatus: string;
}

// ─── Helpers ───────────────────────────────────────────────────────────────────
function isAutoCompleted(s: Schedule): boolean {
  if (s.approvalStatus !== "booked") return false;
  const endDt = new Date(`${s.date}T${s.endTime}`);
  return endDt < new Date();
}

// ─── Component ─────────────────────────────────────────────────────────────────
export default function PMSchedulePage() {
  const { toast } = useToast();
  const router = useRouter();

  const [productManagers, setProductManagers] = useState<ProductManager[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [stateFilter, setStateFilter] = useState("all");
  const [activeTab, setActiveTab] = useState<"all" | ApprovalStatus>("all");
  const [schools, setSchools] = useState<any[]>([]);
  const [salesmen, setSalesmen] = useState<any[]>([]);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia("(max-width: 767px)");
    setIsMobile(mql.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  // ── New Schedule dialog ──
  const [newScheduleOpen, setNewScheduleOpen] = useState(false);
  const [newScheduleForm, setNewScheduleForm] = useState({
    pmId: "", date: "", type: "workshop", startTime: "", endTime: "", schoolId: "", salesmanId: "", activity: "",
  });

  // ── Approve & Book dialog ──
  const [approveOpen, setApproveOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<FlattenedSchedule | null>(null);
  const [approveForm, setApproveForm] = useState({
    pmId: "", date: "", startTime: "", endTime: "",
  });

  // ── Reject dialog ──
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  // ── Mark Complete confirm ──
  const [completeOpen, setCompleteOpen] = useState(false);

  useEffect(() => {
    const data = require("@/lib/mock-data/product-manager-schedules.json");
    // Normalize approvalStatus — "approved" maps to "booked" in new workflow
    const normalized = (data as ProductManager[]).map(pm => ({
      ...pm,
      schedules: pm.schedules.map(s => ({
        ...s,
        approvalStatus: (["requested", "booked", "completed", "rejected"].includes(s.approvalStatus)
          ? s.approvalStatus
          : "booked") as ApprovalStatus,
      })),
    }));
    setProductManagers(normalized);
    setSchools(require("@/lib/mock-data/schools.json"));
    setSalesmen(require("@/lib/mock-data/salesmen.json"));
  }, []);

  // ── Derived data ────────────────────────────────────────────────────────────
  const allSchedules: FlattenedSchedule[] = useMemo(() =>
    productManagers.flatMap(pm =>
      pm.schedules.map(s => ({
        ...s,
        uniqueId: `${pm.id}-${s.id}`,
        // Auto-complete: if booked & date/time has passed → show as completed
        approvalStatus: isAutoCompleted(s) ? "completed" : s.approvalStatus,
        isCompleted: s.isCompleted || isAutoCompleted(s),
        pmId: pm.id, pmName: pm.name, pmEmail: pm.email,
        pmState: pm.state, pmStatus: pm.currentStatus,
      }))
    ), [productManagers]);

  const baseFilter = (s: FlattenedSchedule) => {
    if (searchQuery &&
      !s.pmName.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !s.schoolName.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !s.salesmanName.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (statusFilter !== "all" && s.pmStatus.toLowerCase() !== statusFilter.toLowerCase()) return false;
    if (stateFilter !== "all" && s.pmState !== stateFilter) return false;
    return true;
  };

  const flatFilteredSchedules = useMemo(() =>
    allSchedules.filter(s => baseFilter(s) && (activeTab === "all" || s.approvalStatus === activeTab)),
    [allSchedules, searchQuery, statusFilter, stateFilter, activeTab]);

  const tabCounts = useMemo(() => {
    const base = allSchedules.filter(baseFilter);
    const count = (status: ApprovalStatus) => base.filter(s => s.approvalStatus === status).length;
    return { all: base.length, requested: count("requested"), booked: count("booked"), completed: count("completed"), rejected: count("rejected") };
  }, [allSchedules, searchQuery, statusFilter, stateFilter]);

  const uniqueStates = useMemo(() =>
    Array.from(new Set(productManagers.map(pm => pm.state))).sort(), [productManagers]);

  // ── Summary KPIs ────────────────────────────────────────────────────────────
  const totalBusy = productManagers.filter(pm => pm.currentStatus === "Busy").length;
  const totalFree = productManagers.filter(pm => pm.currentStatus === "Free").length;
  const todaySchedules = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    return allSchedules.filter(s => s.date === today && s.approvalStatus === "booked").length;
  }, [allSchedules]);

  // ── Update helper ───────────────────────────────────────────────────────────
  const updateScheduleStatus = (
    pmId: string,
    scheduleId: string,
    updates: Partial<Schedule>
  ) => {
    setProductManagers(prev =>
      prev.map(pm =>
        pm.id === pmId
          ? {
            ...pm,
            schedules: pm.schedules.map(s =>
              s.id === scheduleId ? { ...s, ...updates } : s
            ),
          }
          : pm
      )
    );
  };

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleNewSchedule = () => {
    if (!newScheduleForm.pmId || !newScheduleForm.date || !newScheduleForm.startTime ||
      !newScheduleForm.endTime || !newScheduleForm.type || !newScheduleForm.schoolId ||
      !newScheduleForm.salesmanId || !newScheduleForm.activity) {
      toast({ title: "Missing Fields", description: "Please fill all required fields.", variant: "destructive" });
      return;
    }
    const selectedSchool = schools.find(s => s.id === newScheduleForm.schoolId);
    const selectedSalesman = salesmen.find(s => s.id === newScheduleForm.salesmanId);

    // Check conflict
    const pmSchedules = allSchedules.filter(s =>
      s.pmId === newScheduleForm.pmId &&
      s.date === newScheduleForm.date &&
      s.approvalStatus === "booked"
    );
    const hasConflict = pmSchedules.length > 0;

    const newSchedule: Schedule = {
      id: `SCH${Date.now()}`,
      date: newScheduleForm.date,
      startTime: newScheduleForm.startTime,
      endTime: newScheduleForm.endTime,
      type: newScheduleForm.type as "workshop" | "meeting",
      schoolId: newScheduleForm.schoolId,
      schoolName: selectedSchool?.name || "",
      city: selectedSchool?.city || "",
      address: selectedSchool?.address || "",
      salesmanId: newScheduleForm.salesmanId,
      salesmanName: selectedSalesman?.name || "",
      activity: newScheduleForm.activity,
      topic: newScheduleForm.activity.split(" - ")[0] || newScheduleForm.activity.substring(0, 30),
      approvalStatus: "booked",
      isCompleted: false,
      hasConflict,
    };

    setProductManagers(prev => prev.map(pm =>
      pm.id === newScheduleForm.pmId ? { ...pm, currentStatus: "Busy", schedules: [...pm.schedules, newSchedule] } : pm
    ));

    toast({ title: hasConflict ? "⚠️ Scheduled with Conflict" : "✅ Visit Scheduled!", description: hasConflict ? "PM has another schedule on this date." : "New visit has been added to PM calendar." });
    setNewScheduleForm({ pmId: "", date: "", type: "workshop", startTime: "", endTime: "", schoolId: "", salesmanId: "", activity: "" });
    setNewScheduleOpen(false);
  };

  const openApproveDialog = (row: FlattenedSchedule) => {
    setSelectedSchedule(row);
    setApproveForm({ pmId: row.pmId || "", date: row.preferredDateFrom || row.date, startTime: "10:00", endTime: "13:00" });
    setApproveOpen(true);
  };

  const handleApproveAndBook = () => {
    if (!approveForm.pmId || !approveForm.date || !approveForm.startTime || !approveForm.endTime) {
      toast({ title: "Missing Fields", description: "Please assign a PM, date and time.", variant: "destructive" });
      return;
    }
    if (!selectedSchedule) return;

    // Check conflict: does this PM already have a booked schedule on same date?
    const pmSchedules = allSchedules.filter(s =>
      s.pmId === approveForm.pmId &&
      s.date === approveForm.date &&
      s.approvalStatus === "booked" &&
      s.id !== selectedSchedule.id
    );
    const hasConflict = pmSchedules.length > 0;

    updateScheduleStatus(approveForm.pmId, selectedSchedule.id, {
      approvalStatus: "booked",
      isCompleted: false,
      date: approveForm.date,
      startTime: approveForm.startTime,
      endTime: approveForm.endTime,
      hasConflict,
    });

    // Mark PM as Busy
    setProductManagers(prev =>
      prev.map(pm =>
        pm.id === approveForm.pmId
          ? { ...pm, currentStatus: "Busy" }
          : pm
      )
    );

    toast({
      title: hasConflict ? "⚠️ Booked with Conflict" : "✅ Visit Booked!",
      description: hasConflict
        ? "PM assigned but has another schedule on this date."
        : "Visit approved and booked. PM Calendar updated.",
    });
    setApproveOpen(false);
    setSelectedSchedule(null);
  };

  const openRejectDialog = (row: FlattenedSchedule) => {
    setSelectedSchedule(row);
    setRejectReason("");
    setRejectOpen(true);
  };

  const handleReject = () => {
    if (!rejectReason.trim()) {
      toast({ title: "Reason Required", description: "Please provide a rejection reason.", variant: "destructive" });
      return;
    }
    if (!selectedSchedule) return;
    updateScheduleStatus(selectedSchedule.pmId, selectedSchedule.id, {
      approvalStatus: "rejected",
      rejectionReason: rejectReason,
      isCompleted: false,
    });
    toast({ title: "Request Rejected", description: "The salesman will be notified.", variant: "destructive" });
    setRejectOpen(false);
    setSelectedSchedule(null);
    setRejectReason("");
  };

  const openCompleteDialog = (row: FlattenedSchedule) => {
    setSelectedSchedule(row);
    setCompleteOpen(true);
  };

  const handleMarkComplete = () => {
    if (!selectedSchedule) return;
    updateScheduleStatus(selectedSchedule.pmId, selectedSchedule.id, {
      approvalStatus: "completed",
      isCompleted: true,
    });
    toast({ title: "✅ Visit Completed!", description: "Schedule marked as completed." });
    setCompleteOpen(false);
    setSelectedSchedule(null);
  };

  // ── Columns ─────────────────────────────────────────────────────────────────
  const columns: GridColumn<FlattenedSchedule>[] = [
    {
      key: "pmName",
      header: "Product Manager",
      sortable: true, filterable: true, width: 190,
      render: (v, row) => (
        <Link href={`/admin/pm-schedule/${row.pmId}`} className="group block">
          <div className="font-semibold text-sm text-primary group-hover:underline underline-offset-4">{v}</div>
          <div className="text-xs text-muted-foreground">{row.pmState}</div>
        </Link>
      ),
    },
    {
      key: "date",
      header: "Date & Time",
      sortable: true, width: 140,
      render: (v, row) => (
        <div>
          <Badge variant="secondary" className="font-medium text-[11px] mb-1">
            {row.approvalStatus === "requested"
              ? (row.preferredDateFrom
                ? `Req: ${new Date(row.preferredDateFrom).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
                : "TBD")
              : new Date(v).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          </Badge>
          {row.approvalStatus !== "requested" && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" /> {row.startTime} – {row.endTime}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "type",
      header: "Type",
      sortable: true, filterable: true, width: 105,
      render: (v) => <Badge variant="outline" className="capitalize text-[10px]">{v}</Badge>
    },
    {
      key: "schoolName",
      header: "School & Location",
      sortable: true, filterable: true, width: 210,
      render: (v, row) => (
        <div>
          <div className="font-medium text-sm truncate">{v}</div>
          <div className="flex items-center gap-1 mt-0.5 text-xs text-muted-foreground">
            <MapPin className="w-3 h-3" /> {row.city}
          </div>
        </div>
      )
    },
    {
      key: "salesmanName",
      header: "Salesman",
      sortable: true, filterable: true, width: 140,
      render: (v) => <span className="text-[13px] font-medium">{v}</span>
    },
    {
      key: "topic",
      header: "Activity",
      width: 240,
      render: (v, row) => (
        <div className="space-y-0.5 max-w-[240px]">
          <div className="text-[13px] font-semibold text-blue-700 dark:text-blue-400 truncate">{v}</div>
          <div className="text-[11px] text-muted-foreground line-clamp-1">{row.activity}</div>
        </div>
      )
    },
    {
      key: "approvalStatus",
      header: "Status",
      sortable: true, filterable: true, width: 130,
      render: (v, row) => (
        <div className="flex flex-wrap gap-1.5 items-center">
          <Badge className={cn(
            "capitalize shadow-sm border-0 font-medium px-2 py-0.5",
            v === "requested" ? "bg-amber-100 text-amber-700 hover:bg-amber-200 dark:bg-amber-900/40 dark:text-amber-400"
              : v === "booked" ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-400"
                : v === "rejected" ? "bg-rose-100 text-rose-700 hover:bg-rose-200 dark:bg-rose-900/40 dark:text-rose-400"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400"
          )}>
            {v}
          </Badge>
          {row.isCompleted && (
            <Badge variant="outline" className="border-emerald-200 text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-400 min-h-[22px] px-1.5 text-[10px] font-medium">
              <CheckCircle2 className="h-3 w-3 mr-1" /> Done
            </Badge>
          )}
          {row.hasConflict && (
            <Badge variant="destructive" className="min-h-[22px] border-0 px-1.5 text-[10px] font-medium shadow-sm">
              <AlertTriangle className="h-3 w-3 mr-1" /> Conflict
            </Badge>
          )}
          {v === "rejected" && row.rejectionReason && (
            <span className="text-[10px] text-rose-500 italic block">{row.rejectionReason}</span>
          )}
        </div>
      )
    },
  ];

  // ── Tab-wise row actions ─────────────────────────────────────────────────────
  const rowActions = (row: FlattenedSchedule): RowAction<FlattenedSchedule>[] => {
    switch (row.approvalStatus) {
      case "requested":
        return [
          {
            label: "Approve & Book",
            icon: <CalendarCheck className="h-3.5 w-3.5" />,
            onClick: openApproveDialog,
          },
          {
            label: "Reject",
            icon: <Ban className="h-3.5 w-3.5" />,
            onClick: openRejectDialog,
            danger: true,
          },
        ];
      case "booked":
        return [
          {
            label: "Mark Complete",
            icon: <CheckCheck className="h-3.5 w-3.5" />,
            onClick: openCompleteDialog,
          },
          {
            label: "Edit",
            icon: <Pencil className="h-3.5 w-3.5" />,
            onClick: () => { },
          },
        ];
      case "completed":
        return [
          {
            label: "View Details",
            icon: <Eye className="h-3.5 w-3.5" />,
            onClick: (row) => router.push(`/admin/pm-schedule/${row.pmId}`),
          },
        ];
      case "rejected":
        return [
          {
            label: "Re-open Request",
            icon: <CalendarCheck className="h-3.5 w-3.5" />,
            onClick: (row) => {
              updateScheduleStatus(row.pmId, row.id, { approvalStatus: "requested", rejectionReason: undefined });
              toast({ title: "Request Re-opened" });
            },
          },
        ];
      default:
        return [];
    }
  };

  // ── Tab config ───────────────────────────────────────────────────────────────
  const TABS = [
    { value: "all", label: "All Schedules", dot: null, count: tabCounts.all },
    { value: "requested", label: "Requested", dot: "bg-amber-500", count: tabCounts.requested },
    { value: "booked", label: "Booked", dot: "bg-emerald-500", count: tabCounts.booked },
    { value: "completed", label: "Completed", dot: "bg-gray-400", count: tabCounts.completed },
    { value: "rejected", label: "Rejected", dot: "bg-rose-500", count: tabCounts.rejected },
  ] as const;

  // ── Shared form fields JSX ───────────────────────────────────────────────────
  const scheduleFormFields = (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="grid gap-2">
        <Label>Product Manager *</Label>
        <Select value={newScheduleForm.pmId} onValueChange={v => setNewScheduleForm(f => ({ ...f, pmId: v }))}>
          <SelectTrigger><SelectValue placeholder="Select product manager" /></SelectTrigger>
          <SelectContent>{productManagers.map(pm => <SelectItem key={pm.id} value={pm.id}>{pm.name}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <div className="grid gap-2">
        <Label>Date *</Label>
        <DatePicker
          value={newScheduleForm.date}
          onChange={v => setNewScheduleForm(f => ({ ...f, date: v }))}
          min={new Date().toISOString().split("T")[0]}
          placeholder="dd-mm-yyyy"
        />
      </div>
      <div className="grid gap-2">
        <Label>Type *</Label>
        <Select value={newScheduleForm.type} onValueChange={v => setNewScheduleForm(f => ({ ...f, type: v }))}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="workshop">Workshop</SelectItem>
            <SelectItem value="meeting">Meeting</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-2">
        <Label>Start Time *</Label>
        <TimePicker value={newScheduleForm.startTime} onChange={(t: string) => setNewScheduleForm(f => ({ ...f, startTime: t }))} />
      </div>
      <div className="grid gap-2">
        <Label>End Time *</Label>
        <TimePicker value={newScheduleForm.endTime} onChange={(t: string) => setNewScheduleForm(f => ({ ...f, endTime: t }))} />
      </div>
      <div className="grid gap-2">
        <Label>School *</Label>
        <Select value={newScheduleForm.schoolId} onValueChange={v => setNewScheduleForm(f => ({ ...f, schoolId: v }))}>
          <SelectTrigger><SelectValue placeholder="Select school" /></SelectTrigger>
          <SelectContent>{schools.map(s => <SelectItem key={s.id} value={s.id}>{s.name} – {s.city}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <div className="grid gap-2">
        <Label>Salesman *</Label>
        <Select value={newScheduleForm.salesmanId} onValueChange={v => setNewScheduleForm(f => ({ ...f, salesmanId: v }))}>
          <SelectTrigger><SelectValue placeholder="Select salesman" /></SelectTrigger>
          <SelectContent>{salesmen.map(s => <SelectItem key={s.id} value={s.id}>{s.name} – {s.territory}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <div className="grid gap-2 md:col-span-2">
        <Label>Activity Description *</Label>
        <Textarea placeholder="e.g., Book Promotion Workshop - Class 9-10 Science Series"
          value={newScheduleForm.activity}
          onChange={e => setNewScheduleForm(f => ({ ...f, activity: e.target.value }))}
          rows={3} />
      </div>
    </div>
  );

  const scheduleFormFooter = (
    <div className="flex gap-3">
      <Button variant="outline" className="flex-1" onClick={() => setNewScheduleOpen(false)}>Cancel</Button>
      <Button onClick={handleNewSchedule} className="flex-1 gap-2">
        <Plus className="h-4 w-4" /> Schedule Visit
      </Button>
    </div>
  );

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <PageContainer>
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-6">
        <PageHeader
          title="Product Manager Schedules"
          description="Manage PM visit requests, approvals, and scheduling"
        />
        <Button className="gap-2 shrink-0" onClick={() => setNewScheduleOpen(true)}>
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">New Schedule</span>
          <span className="sm:hidden">New</span>
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 mb-6">
        {[
          { label: "Total Managers", value: productManagers.length, sub: "Active managers", icon: <User className="h-3.5 w-3.5 md:h-4 md:w-4 text-blue-600" />, bg: "bg-blue-100", card: "gradient-card-neutral" },
          { label: "Currently Busy", value: totalBusy, sub: `${totalFree} managers free`, icon: <Briefcase className="h-3.5 w-3.5 md:h-4 md:w-4 text-orange-600" />, bg: "bg-orange-100", card: "gradient-card-orange" },
          { label: "Today's Visits", value: todaySchedules, sub: "Booked for today", icon: <Calendar className="h-3.5 w-3.5 md:h-4 md:w-4 text-blue-600" />, bg: "bg-blue-100", card: "gradient-card-amber" },
          { label: "Pending Requests", value: tabCounts.requested, sub: "Awaiting approval", icon: <AlertTriangle className="h-3.5 w-3.5 md:h-4 md:w-4 text-amber-600" />, bg: "bg-amber-100", card: "gradient-card-amber" },
        ].map(({ label, value, sub, icon, bg, card }) => (
          <Card key={label} className={cn("border-0 shadow-sm", card)}>
            <CardContent className="p-2.5 md:p-4">
              <div className="flex items-center justify-between mb-2 md:mb-3">
                <div className={cn("p-1 md:p-1.5 rounded-lg", bg)}>{icon}</div>
              </div>
              <p className="text-base md:text-xl font-bold tracking-tight">{value}</p>
              <p className="text-[10px] md:text-xs text-muted-foreground mt-0.5">{label}</p>
              <div className="mt-1.5 pt-1.5 md:mt-2 md:pt-2 border-t border-border/50">
                <p className="text-[10px] md:text-xs text-muted-foreground">{sub}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Mobile bottom sheet */}
      {/* Mobile bottom sheet — only on mobile */}
      <MobileSheet
        open={isMobile && newScheduleOpen}
        onClose={() => setNewScheduleOpen(false)}
        title="Schedule New Visit"
        description="Schedule a new workshop or meeting for a product manager"
        footer={scheduleFormFooter}
      >
        {scheduleFormFields}
      </MobileSheet>

      {/* Desktop dialog — only on desktop */}
      <Dialog open={!isMobile && newScheduleOpen} onOpenChange={setNewScheduleOpen}>
        <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Schedule New Visit</DialogTitle>
            <DialogDescription>Schedule a new workshop or meeting for a product manager</DialogDescription>
          </DialogHeader>
          <div className="py-4">{scheduleFormFields}</div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewScheduleOpen(false)}>Cancel</Button>
            <Button onClick={handleNewSchedule} className="gap-2">
              <Plus className="h-4 w-4" /> Schedule Visit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Tabs */}
      <div className="w-full overflow-x-auto mb-4 -mx-0 scrollbar-none">
        <div className="flex items-center gap-1 bg-muted rounded-xl p-1 w-max min-w-full md:w-fit">
          {TABS.map(({ value, label, dot, count }) => (
            <button
              key={value}
              onClick={() => setActiveTab(value as typeof activeTab)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-xs md:text-sm font-semibold transition-all whitespace-nowrap shrink-0",
                activeTab === value ? "bg-background text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {dot && <span className={cn("h-2 w-2 rounded-full shrink-0", dot)} />}
              {label}
              <span className={cn("ml-0.5 text-[10px] md:text-[11px] font-bold tabular-nums",
                activeTab === value ? "text-primary" : "text-muted-foreground")}>({count})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab hint banners */}
      {activeTab === "requested" && tabCounts.requested > 0 && (
        <div className="mb-3 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-sm dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-300">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span><strong>{tabCounts.requested}</strong> request(s) pending approval. Use <strong>Approve & Book</strong> to assign a PM and confirm the visit, or <strong>Reject</strong> to decline.</span>
        </div>
      )}
      {activeTab === "booked" && (
        <div className="mb-3 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-300">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>Visits are confirmed and PM calendars are updated. Use <strong>Mark Complete</strong> after a visit is done. Past visits auto-complete.</span>
        </div>
      )}

      {/* Data Grid */}
      <div className="w-full">
        <DataGrid
          data={flatFilteredSchedules}
          columns={columns}
          rowKey="uniqueId"
          rowActions={rowActions}
          canExpandRow={() => true}
          expandedRowRender={(row) => (
            <div className="p-5 bg-muted/10 border-t rounded-b-lg">
              <h4 className="text-sm font-semibold mb-4 text-primary flex items-center gap-2">
                <Calendar className="h-4 w-4" /> Schedule Details
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-sm">
                <div>
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">General Info</div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between"><span className="text-muted-foreground">Type:</span><span className="font-medium capitalize">{row.type}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Status:</span><span className="font-medium capitalize">{row.approvalStatus}</span></div>
                    {row.approvalStatus !== "requested" && (
                      <>
                        <div className="flex justify-between"><span className="text-muted-foreground">Date:</span><span className="font-medium">{new Date(row.date).toLocaleDateString("en-US", { weekday: "short", year: "numeric", month: "short", day: "numeric" })}</span></div>
                        <div className="flex justify-between"><span className="text-muted-foreground">Time:</span><span className="font-medium">{row.startTime} – {row.endTime}</span></div>
                      </>
                    )}
                    {row.preferredDateFrom && row.approvalStatus === "requested" && (
                      <div className="flex justify-between"><span className="text-muted-foreground">Preferred:</span><span className="font-medium">{row.preferredDateFrom}{row.preferredDateTo ? ` → ${row.preferredDateTo}` : ""}</span></div>
                    )}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Manager Details</div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between"><span className="text-muted-foreground">PM Name:</span><span className="font-medium text-right">{row.pmName || "—"}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">State:</span><span className="font-medium text-right">{row.pmState}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Email:</span><span className="font-medium text-right text-xs">{row.pmEmail}</span></div>
                  </div>
                </div>
                <div className="lg:col-span-2">
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Location & Objective</div>
                  <div className="bg-background rounded-md p-3 border shadow-sm">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-primary font-medium"><MapPin className="h-3.5 w-3.5" /> {row.schoolName}</div>
                        <p className="text-xs text-muted-foreground">{row.address}, {row.city}</p>
                        <div className="mt-2 text-xs"><span className="text-muted-foreground">Salesman: </span><span className="font-medium">{row.salesmanName}</span></div>
                      </div>
                      <div className="space-y-1 border-l pl-4 border-border/50">
                        <p className="text-xs font-medium text-muted-foreground">Activity:</p>
                        <p className="text-sm font-medium">{row.activity}</p>
                        {row.rejectionReason && (
                          <div className="mt-2 p-2 bg-rose-50 border border-rose-200 rounded text-xs text-rose-600 dark:bg-rose-900/20 dark:border-rose-800 dark:text-rose-300">
                            <strong>Rejection reason:</strong> {row.rejectionReason}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          density="compact"
          selectable
          inlineFilters
          striped
          enableRowPinning
          defaultPageSize={15}
          cardRender={(row) => <PMScheduleCard row={row} onApprove={openApproveDialog} onReject={openRejectDialog} onComplete={openCompleteDialog} />}
          extraViews={[
            {
              key: "chart",
              icon: <BarChart2 className="h-3.5 w-3.5" />,
              label: "Chart",
              render: (data) => <PMScheduleChartView data={data as FlattenedSchedule[]} />,
            },
          ]}
        />
      </div>

      {/* ── Approve & Book — shared form fields ── */}
      {(() => {
        const approveFields = (
          <div className="space-y-4">
            {selectedSchedule && (
              <div className="p-3 bg-muted/50 rounded-lg text-sm space-y-1 border border-border/50">
                <div className="font-semibold">{selectedSchedule.schoolName} <span className="text-muted-foreground font-normal text-sm">• {selectedSchedule.city}</span></div>
                <div className="text-muted-foreground text-xs">{selectedSchedule.salesmanName} → <span className="capitalize">{selectedSchedule.type}</span></div>
                <div className="text-xs text-foreground/70 line-clamp-2">{selectedSchedule.activity}</div>
                {selectedSchedule.preferredDateFrom && (
                  <div className="text-xs text-primary font-medium">
                    Preferred: {selectedSchedule.preferredDateFrom}{selectedSchedule.preferredDateTo ? ` → ${selectedSchedule.preferredDateTo}` : ""}
                  </div>
                )}
              </div>
            )}
            <div className="grid gap-2">
              <Label className="font-semibold">Assign Product Manager *</Label>
              <Select value={approveForm.pmId} onValueChange={v => setApproveForm(f => ({ ...f, pmId: v }))}>
                <SelectTrigger className="h-10"><SelectValue placeholder="Select a Product Manager..." /></SelectTrigger>
                <SelectContent position="popper" className="max-h-56 overflow-y-auto" sideOffset={4}>
                  {productManagers.map(pm => {
                    const conflict = approveForm.date ? allSchedules.some(s => s.pmId === pm.id && s.date === approveForm.date && s.approvalStatus === "booked") : false;
                    return (
                      <SelectItem key={pm.id} value={pm.id} className="py-2">
                        <span className="flex items-center gap-2">
                          <span className="font-medium">{pm.name}</span>
                          <span className="text-muted-foreground text-xs">– {pm.state}</span>
                          {conflict ? <span className="text-xs text-orange-600 font-semibold">⚠️ Busy</span> : <span className={`text-xs font-medium ${pm.currentStatus === "Free" ? "text-primary" : "text-muted-foreground"}`}>({pm.currentStatus})</span>}
                        </span>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label className="font-semibold">Visit Date *</Label>
              <DatePicker value={approveForm.date} onChange={v => setApproveForm(f => ({ ...f, date: v }))} min={new Date().toISOString().split("T")[0]} placeholder="Select visit date" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label className="font-semibold">Start Time *</Label>
                <TimePicker value={approveForm.startTime} onChange={v => setApproveForm(f => ({ ...f, startTime: v }))} />
              </div>
              <div className="grid gap-2">
                <Label className="font-semibold">End Time *</Label>
                <TimePicker value={approveForm.endTime} onChange={v => setApproveForm(f => ({ ...f, endTime: v }))} />
              </div>
            </div>
          </div>
        );
        const approveFooter = (
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setApproveOpen(false)}>Cancel</Button>
            <Button className="flex-1 gap-2" onClick={handleApproveAndBook}>
              <CalendarCheck className="h-4 w-4" /> Confirm Booking
            </Button>
          </div>
        );
        return (
          <>
            <MobileSheet open={isMobile && approveOpen} onClose={() => setApproveOpen(false)} title="Approve & Book Visit" description="Assign a PM, confirm date and time." footer={approveFooter}>
              {approveFields}
            </MobileSheet>
            <Dialog open={!isMobile && approveOpen} onOpenChange={setApproveOpen}>
              <DialogContent className="sm:max-w-xl w-full">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2"><CalendarCheck className="h-5 w-5 text-primary" /> Approve & Book Visit</DialogTitle>
                  <DialogDescription>Assign a PM, confirm date and time. This will directly book the visit and update the PM's calendar.</DialogDescription>
                </DialogHeader>
                <div className="py-2">{approveFields}</div>
                <DialogFooter className="pt-2">
                  <Button variant="outline" onClick={() => setApproveOpen(false)}>Cancel</Button>
                  <Button className="gap-2" onClick={handleApproveAndBook}><CalendarCheck className="h-4 w-4" /> Confirm Booking</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </>
        );
      })()}

      {/* ── Reject ── */}
      {(() => {
        const rejectFields = (
          <div className="space-y-3">
            {selectedSchedule && (
              <div className="p-3 bg-muted/50 rounded-lg text-sm">
                <span className="font-semibold">{selectedSchedule.schoolName}</span> – {selectedSchedule.salesmanName}
              </div>
            )}
            <div className="grid gap-2">
              <Label>Rejection Reason *</Label>
              <Textarea placeholder="e.g., No PM available in this region for the requested dates. Please reschedule..." value={rejectReason} onChange={e => setRejectReason(e.target.value)} rows={3} />
            </div>
          </div>
        );
        const rejectFooter = (
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setRejectOpen(false)}>Cancel</Button>
            <Button variant="destructive" className="flex-1 gap-2" onClick={handleReject}><Ban className="h-4 w-4" /> Reject Request</Button>
          </div>
        );
        return (
          <>
            <MobileSheet open={isMobile && rejectOpen} onClose={() => setRejectOpen(false)} title="Reject Request" description="Provide a reason for rejection." footer={rejectFooter}>
              {rejectFields}
            </MobileSheet>
            <Dialog open={!isMobile && rejectOpen} onOpenChange={setRejectOpen}>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2"><XCircle className="h-5 w-5 text-rose-500" /> Reject Request</DialogTitle>
                  <DialogDescription>Provide a reason for rejection. This will be visible to the salesman.</DialogDescription>
                </DialogHeader>
                <div className="py-2">{rejectFields}</div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setRejectOpen(false)}>Cancel</Button>
                  <Button variant="destructive" onClick={handleReject}><Ban className="h-4 w-4 mr-2" /> Reject Request</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </>
        );
      })()}

      {/* ── Mark Complete ── */}
      {(() => {
        const completeFields = (
          selectedSchedule ? (
            <div className="p-3 bg-muted/50 rounded-lg text-sm">
              <div className="font-semibold">{selectedSchedule.schoolName}</div>
              <div className="text-muted-foreground text-xs mt-1">{selectedSchedule.date} · {selectedSchedule.startTime} – {selectedSchedule.endTime}</div>
              <p className="text-xs text-muted-foreground mt-2">Confirm that this visit/workshop has been completed successfully.</p>
            </div>
          ) : null
        );
        const completeFooter = (
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setCompleteOpen(false)}>Cancel</Button>
            <Button className="flex-1 gap-2 bg-emerald-600 hover:bg-emerald-700 text-white" onClick={handleMarkComplete}><CheckCheck className="h-4 w-4" /> Mark Complete</Button>
          </div>
        );
        return (
          <>
            <MobileSheet open={isMobile && completeOpen} onClose={() => setCompleteOpen(false)} title="Mark Visit as Complete" footer={completeFooter}>
              {completeFields}
            </MobileSheet>
            <Dialog open={!isMobile && completeOpen} onOpenChange={setCompleteOpen}>
              <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2"><CheckCheck className="h-5 w-5 text-emerald-600" /> Mark Visit as Complete</DialogTitle>
                  <DialogDescription>Confirm that this visit/workshop has been completed successfully.</DialogDescription>
                </DialogHeader>
                {selectedSchedule && (
                  <div className="p-3 bg-muted/50 rounded-lg text-sm my-2">
                    <div className="font-semibold">{selectedSchedule.schoolName}</div>
                    <div className="text-muted-foreground text-xs mt-1">{selectedSchedule.date} · {selectedSchedule.startTime} – {selectedSchedule.endTime}</div>
                  </div>
                )}
                <DialogFooter className="mt-2">
                  <Button variant="outline" onClick={() => setCompleteOpen(false)}>Cancel</Button>
                  <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={handleMarkComplete}><CheckCheck className="h-4 w-4 mr-2" /> Mark Complete</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </>
        );
      })()}
    </PageContainer>
  );
}

// ─── PMScheduleCard ───────────────────────────────────────────────────────────
function PMScheduleCard({
  row,
  onApprove,
  onReject,
  onComplete,
}: {
  row: FlattenedSchedule;
  onApprove: (row: FlattenedSchedule) => void;
  onReject: (row: FlattenedSchedule) => void;
  onComplete: (row: FlattenedSchedule) => void;
}) {
  const borderClass = {
    requested: "border-orange-300 bg-orange-50/40 dark:bg-orange-900/10",
    booked: "border-primary/40 bg-primary/5 dark:bg-primary/10",
    completed: "border-border bg-muted/30",
    rejected: "border-muted-foreground/30 bg-muted/20",
  }[row.approvalStatus] ?? "border-border";

  const badgeClass = {
    requested: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
    booked: "bg-primary/10 text-primary",
    completed: "bg-muted text-muted-foreground",
    rejected: "bg-muted text-muted-foreground line-through",
  }[row.approvalStatus] ?? "bg-muted text-muted-foreground";

  return (
    <div className={cn("border rounded-xl p-4 flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow", borderClass)}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-0.5">School</p>
          <p className="font-semibold text-sm truncate">{row.schoolName}</p>
          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
            <MapPin className="h-3 w-3" />{row.city}
          </p>
        </div>
        <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full capitalize shrink-0", badgeClass)}>
          {row.approvalStatus}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <p className="text-muted-foreground mb-0.5">PM</p>
          <Link href={`/admin/pm-schedule/${row.pmId}`} className="font-medium text-primary hover:underline">{row.pmName}</Link>
        </div>
        <div>
          <p className="text-muted-foreground mb-0.5">Salesman</p>
          <p className="font-medium">{row.salesmanName}</p>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <Badge variant="outline" className="text-[10px] capitalize">{row.type}</Badge>
        <span className="text-xs text-muted-foreground flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          {row.approvalStatus === "requested" ? (row.preferredDateFrom || "TBD") : `${row.date} · ${row.startTime}`}
        </span>
        {row.hasConflict && <span className="text-[10px] text-rose-500 flex items-center gap-0.5"><AlertTriangle className="h-3 w-3" />Conflict</span>}
      </div>
      <p className="text-xs text-muted-foreground line-clamp-2">{row.activity}</p>
      <div className="flex gap-2 pt-1 border-t border-border/50">
        {row.approvalStatus === "requested" && (
          <>
            <button onClick={() => onApprove(row)} className="flex-1 text-xs py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 font-medium transition-colors flex items-center justify-center gap-1">
              <CalendarCheck className="h-3.5 w-3.5" /> Approve
            </button>
            <button onClick={() => onReject(row)} className="flex-1 text-xs py-1.5 rounded-lg bg-rose-100 text-rose-600 hover:bg-rose-200 font-medium transition-colors flex items-center justify-center gap-1">
              <Ban className="h-3.5 w-3.5" /> Reject
            </button>
          </>
        )}
        {row.approvalStatus === "booked" && (
          <button onClick={() => onComplete(row)} className="flex-1 text-xs py-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 font-medium transition-colors flex items-center justify-center gap-1">
            <CheckCheck className="h-3.5 w-3.5" /> Mark Complete
          </button>
        )}
        {(row.approvalStatus === "completed" || row.approvalStatus === "rejected") && (
          <Link href={`/admin/pm-schedule/${row.pmId}`} className="flex-1 text-xs py-1.5 rounded-lg bg-muted text-muted-foreground hover:bg-muted/80 font-medium transition-colors flex items-center justify-center gap-1">
            <Eye className="h-3.5 w-3.5" /> View Details
          </Link>
        )}
      </div>
    </div>
  );
}


// ─── Chart colors — theme-aware (matches --chart-1..4 CSS vars) ────────────────
// chart-1 = primary orange, chart-2 = amber-orange, chart-4 = gold, chart-3 = deep orange
const STATUS_COLORS: Record<ApprovalStatus, string> = {
  requested: "var(--color-chart-1)",   // primary orange — pending action
  booked: "var(--color-chart-2)",   // amber-orange — active/confirmed
  completed: "var(--color-chart-4)",   // gold — done
  rejected: "var(--color-chart-3)",   // deep orange-red — rejected
};

// ─── PMScheduleChartView ───────────────────────────────────────────────────────
function PMScheduleChartView({ data }: { data: FlattenedSchedule[] }) {
  const statusData = (["requested", "booked", "completed", "rejected"] as ApprovalStatus[]).map(s => ({
    name: s.charAt(0).toUpperCase() + s.slice(1),
    value: data.filter(d => d.approvalStatus === s).length,
    fill: STATUS_COLORS[s],
  })).filter(d => d.value > 0);

  const typeCounts: Record<string, Record<string, number>> = {};
  data.forEach(d => {
    const t = d.type || "other";
    if (!typeCounts[t]) typeCounts[t] = { requested: 0, booked: 0, completed: 0, rejected: 0 };
    typeCounts[t][d.approvalStatus] = (typeCounts[t][d.approvalStatus] || 0) + 1;
  });
  const typeData = Object.entries(typeCounts).map(([type, counts]) => ({
    type: type.charAt(0).toUpperCase() + type.slice(1), ...counts,
  }));

  const pmCounts: Record<string, { name: string; booked: number; completed: number }> = {};
  data.forEach(d => {
    if (!pmCounts[d.pmId]) pmCounts[d.pmId] = { name: d.pmName, booked: 0, completed: 0 };
    if (d.approvalStatus === "booked") pmCounts[d.pmId].booked++;
    if (d.approvalStatus === "completed") pmCounts[d.pmId].completed++;
  });
  const pmData = Object.values(pmCounts).sort((a, b) => (b.booked + b.completed) - (a.booked + a.completed)).slice(0, 8);
  const total = data.length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Donut – Status Distribution */}
        <div className="bg-card border rounded-xl p-4 shadow-sm">
          <p className="text-sm font-semibold mb-3">Status Distribution</p>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={statusData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                {statusData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
              </Pie>
              <Tooltip formatter={(v) => [`${v} visits`, ""]} />
            </PieChart>
          </ResponsiveContainer>
          {/* Custom legend — 2-col grid, no overlap */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-3">
            {statusData.map(s => (
              <div key={s.name} className="flex items-center gap-2 min-w-0">
                <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: s.fill }} />
                <span className="text-xs text-muted-foreground truncate">{s.name}</span>
                <span className="text-xs font-semibold ml-auto shrink-0">{total ? Math.round(s.value / total * 100) : 0}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bar – Visit Type Breakdown */}
        <div className="bg-card border rounded-xl p-4 shadow-sm">
          <p className="text-sm font-semibold mb-1">Visit Type Breakdown</p>
          {/* Custom legend row */}
          <div className="flex flex-wrap gap-x-3 gap-y-1 mb-3">
            {[
              { key: "requested", label: "Requested", color: STATUS_COLORS.requested },
              { key: "booked", label: "Booked", color: STATUS_COLORS.booked },
              { key: "completed", label: "Completed", color: STATUS_COLORS.completed },
            ].map(l => (
              <div key={l.key} className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-sm shrink-0" style={{ background: l.color }} />
                <span className="text-[11px] text-muted-foreground">{l.label}</span>
              </div>
            ))}
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={typeData} barCategoryGap="30%">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="type" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} allowDecimals={false} width={24} />
              <Tooltip />
              <Bar dataKey="requested" name="Requested" fill={STATUS_COLORS.requested} radius={[4, 4, 0, 0]} />
              <Bar dataKey="booked" name="Booked" fill={STATUS_COLORS.booked} radius={[4, 4, 0, 0]} />
              <Bar dataKey="completed" name="Completed" fill={STATUS_COLORS.completed} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Horizontal Bar – PM Workload */}
      <div className="bg-card border rounded-xl p-4 shadow-sm">
        <p className="text-sm font-semibold mb-1">PM Workload (Top 8)</p>
        {/* Custom legend row */}
        <div className="flex gap-4 mb-3">
          {[
            { key: "booked", label: "Booked", color: STATUS_COLORS.booked },
            { key: "completed", label: "Completed", color: STATUS_COLORS.completed },
          ].map(l => (
            <div key={l.key} className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-sm shrink-0" style={{ background: l.color }} />
              <span className="text-[11px] text-muted-foreground">{l.label}</span>
            </div>
          ))}
        </div>
        <ResponsiveContainer width="100%" height={Math.max(200, pmData.length * 44)}>
          <BarChart data={pmData} layout="vertical" barCategoryGap="25%">
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 10 }} allowDecimals={false} />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={110} />
            <Tooltip />
            <Bar dataKey="booked" name="Booked" fill={STATUS_COLORS.booked} radius={[0, 4, 4, 0]} />
            <Bar dataKey="completed" name="Completed" fill={STATUS_COLORS.completed} radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
