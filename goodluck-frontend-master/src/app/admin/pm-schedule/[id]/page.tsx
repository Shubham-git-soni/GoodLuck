"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Calendar, Clock, MapPin, User, Phone, Mail, Briefcase,
  ArrowLeft, Building2, Target, Plus, AlertTriangle,
  CheckCircle2, CheckCheck, Ban, LayoutGrid,
} from "lucide-react";
import PageContainer from "@/components/layouts/PageContainer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { DataGrid, GridColumn } from "@/components/ui/data-grid";
import { useToast } from "@/hooks/use-toast";
import { DatePicker } from "@/components/ui/date-picker";
import { TimePicker } from "@/components/ui/time-picker";
import { cn } from "@/lib/utils";

// ─── Types ─────────────────────────────────────────────────────────────────────
type ApprovalStatus = "requested" | "approved" | "booked" | "completed" | "rejected";

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
  topic?: string;
  approvalStatus?: ApprovalStatus;
  isCompleted?: boolean;
  hasConflict?: boolean;
  status: string;
  rejectionReason?: string;
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

// ─── Status helpers ─────────────────────────────────────────────────────────────
const STATUS_BADGE: Record<string, string> = {
  requested: "bg-amber-100 text-amber-700 border-amber-200",
  booked: "bg-primary/10 text-primary border-primary/20",
  completed: "bg-muted text-muted-foreground border-border",
  rejected: "bg-muted text-muted-foreground border-border",
  approved: "bg-primary/10 text-primary border-primary/20",
  pending: "bg-amber-100 text-amber-700 border-amber-200",
  confirmed: "bg-primary/10 text-primary border-primary/20",
};

function formatDisplayTime(t: string) {
  if (!t) return "–";
  const [h, m] = t.split(":").map(Number);
  const ampm = h < 12 ? "AM" : "PM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${String(h12).padStart(2, "0")}:${String(m).padStart(2, "0")} ${ampm}`;
}

function formatDate(dateString: string) {
  if (!dateString) return "–";
  const date = new Date(dateString);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (date.toDateString() === today.toDateString()) return "Today";
  if (date.toDateString() === tomorrow.toDateString()) return "Tomorrow";
  return date.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function PMDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();

  const [productManager, setProductManager] = useState<ProductManager | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [schools, setSchools] = useState<any[]>([]);
  const [salesmen, setSalesmen] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    date: "", startTime: "", endTime: "", type: "workshop",
    schoolId: "", salesmanId: "", activity: "",
  });

  useEffect(() => {
    const data: ProductManager[] = require("@/lib/mock-data/product-manager-schedules.json");
    const pm = data.find((p) => p.id === params.id);
    if (pm) setProductManager(pm);
    setSchools(require("@/lib/mock-data/schools.json"));
    setSalesmen(require("@/lib/mock-data/salesmen.json"));
  }, [params.id]);

  const handleScheduleSubmit = () => {
    if (!formData.date || !formData.startTime || !formData.endTime ||
      !formData.schoolId || !formData.salesmanId || !formData.activity) {
      toast({ title: "Missing Information", description: "Please fill in all required fields", variant: "destructive" });
      return;
    }
    if (!productManager) return;

    const selectedSchool = schools.find((s) => s.id === formData.schoolId);
    const selectedSalesman = salesmen.find((s) => s.id === formData.salesmanId);

    const newSchedule: Schedule = {
      id: `SCH${Date.now()}`,
      date: formData.date,
      startTime: formData.startTime,
      endTime: formData.endTime,
      type: formData.type,
      schoolId: formData.schoolId,
      schoolName: selectedSchool?.name || "",
      city: selectedSchool?.city || "",
      address: selectedSchool?.address || "",
      salesmanId: formData.salesmanId,
      salesmanName: selectedSalesman?.name || "",
      activity: formData.activity,
      status: "pending",
      approvalStatus: "requested",
    };

    setProductManager(pm => pm ? { ...pm, schedules: [...pm.schedules, newSchedule] } : pm);
    toast({ title: "Schedule Created", description: `New ${formData.type} scheduled successfully` });
    setFormData({ date: "", startTime: "", endTime: "", type: "workshop", schoolId: "", salesmanId: "", activity: "" });
    setDialogOpen(false);
  };

  // ─── KPI calculations ───────────────────────────────────────────────────────
  const schedules = productManager?.schedules ?? [];
  const totalWorkshops = schedules.filter(s => s.type === "workshop").length;
  const totalMeetings = schedules.filter(s => s.type === "meeting").length;
  const completedCount = schedules.filter(s => s.approvalStatus === "completed" || s.isCompleted).length;
  const bookedCount = schedules.filter(s => s.approvalStatus === "booked").length;
  const todayCount = schedules.filter(s => s.date === new Date().toISOString().split("T")[0]).length;
  const uniqueSchools = new Set(schedules.map(s => s.schoolId)).size;

  // ─── DataGrid columns ───────────────────────────────────────────────────────
  const columns = useMemo<GridColumn<Schedule>[]>(() => [
    {
      key: "date",
      header: "Date",
      width: 160,
      sortable: true,
      render: (_, row) => {
        const label = formatDate(row.date);
        const isToday = label === "Today";
        return (
          <div className="flex flex-col gap-0.5">
            <span className={cn("text-sm font-semibold", isToday && "text-primary")}>{label}</span>
            <span className="text-xs text-muted-foreground font-mono">{row.date}</span>
          </div>
        );
      },
    },
    {
      key: "startTime",
      header: "Time",
      width: 140,
      render: (_, row) => (
        <div className="flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          <div className="text-sm">
            <div className="font-medium">{formatDisplayTime(row.startTime)}</div>
            <div className="text-muted-foreground text-xs">{formatDisplayTime(row.endTime)}</div>
          </div>
        </div>
      ),
    },
    {
      key: "type",
      header: "Type",
      width: 120,
      sortable: true,
      filterable: true,
      render: (_, row) => (
        <Badge variant="outline" className={cn("capitalize text-[11px] gap-1",
          row.type === "workshop" ? "border-primary/40 text-primary" : "border-muted-foreground/40 text-muted-foreground"
        )}>
          {row.type === "workshop" ? <Briefcase className="h-3 w-3" /> : <User className="h-3 w-3" />}
          {row.type}
        </Badge>
      ),
    },
    {
      key: "schoolName",
      header: "School",
      width: 200,
      sortable: true,
      filterable: true,
      render: (_, row) => (
        <div>
          <div className="font-medium text-sm flex items-center gap-1.5">
            <Building2 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            {row.schoolName}
          </div>
          <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5 pl-5">
            <MapPin className="h-3 w-3 shrink-0" />{row.city}
          </div>
        </div>
      ),
    },
    {
      key: "salesmanName",
      header: "Salesman",
      width: 160,
      sortable: true,
      filterable: true,
      render: (_, row) => (
        <div className="flex items-center gap-1.5">
          <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          <div className="text-sm">
            <div className="font-medium">{row.salesmanName}</div>
            <div className="text-xs text-muted-foreground">{row.salesmanId}</div>
          </div>
        </div>
      ),
    },
    {
      key: "activity",
      header: "Activity",
      width: 260,
      render: (_, row) => (
        <div className="space-y-0.5">
          {row.topic && (
            <div className="flex items-start gap-1.5">
              <Target className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
              <span className="text-sm font-medium text-primary line-clamp-1">{row.topic}</span>
            </div>
          )}
          <div className="text-xs text-muted-foreground line-clamp-2 pl-5">{row.activity}</div>
        </div>
      ),
    },
    {
      key: "approvalStatus",
      header: "Status",
      width: 130,
      sortable: true,
      filterable: true,
      render: (_, row) => {
        const status = row.approvalStatus || row.status || "pending";
        return (
          <div className="flex flex-col gap-1">
            <Badge variant="outline" className={cn("capitalize text-[11px] w-fit", STATUS_BADGE[status] ?? "bg-muted")}>
              {status}
            </Badge>
            {row.hasConflict && (
              <Badge variant="destructive" className="text-[10px] gap-0.5 w-fit">
                <AlertTriangle className="h-3 w-3" /> Conflict
              </Badge>
            )}
          </div>
        );
      },
    },
  ], []);

  if (!productManager) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center py-24 text-muted-foreground">Loading...</div>
      </PageContainer>
    );
  }

  const isBusy = productManager.currentStatus === "Busy";

  return (
    <PageContainer>

      {/* ── Back button ── */}
      <Button variant="ghost" size="sm" className="mb-4 gap-2 text-muted-foreground hover:text-foreground"
        onClick={() => router.push("/admin/pm-schedule")}>
        <ArrowLeft className="h-4 w-4" /> Back to All Schedules
      </Button>

      {/* ── PM Hero Card ── */}
      <Card className="mb-6 overflow-hidden border shadow-sm">
        <div className="h-1.5 w-full bg-gradient-to-r from-primary via-primary/70 to-primary/30" />
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            {/* Avatar + Info */}
            <div className="flex items-start gap-4">
              <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0 font-bold text-xl text-primary">
                {productManager.name.split(" ").map(w => w[0]).join("").slice(0, 2)}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl font-bold leading-tight">{productManager.name}</h1>
                  <Badge variant="outline" className="text-xs font-mono">{productManager.id}</Badge>
                  <span className={cn(
                    "text-xs font-bold px-2.5 py-0.5 rounded-full",
                    isBusy ? "bg-orange-100 text-orange-700" : "bg-primary/10 text-primary"
                  )}>
                    {isBusy ? "● Busy" : "● Free"}
                  </span>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" />{productManager.email}</span>
                  <span className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" />{productManager.contactNo}</span>
                  <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" />{productManager.state}</span>
                </div>
              </div>
            </div>

            {/* Add Schedule dialog trigger */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2 shrink-0">
                  <Plus className="h-4 w-4" /> Add Schedule
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-xl w-full">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" /> Add New Schedule
                  </DialogTitle>
                  <DialogDescription>Schedule a new workshop or meeting for {productManager.name}</DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-2 gap-4 py-2">
                  {/* Date */}
                  <div className="col-span-2 grid gap-2">
                    <Label className="font-semibold">Date *</Label>
                    <DatePicker
                      value={formData.date}
                      onChange={v => setFormData(f => ({ ...f, date: v }))}
                      placeholder="Select date"
                      min={new Date().toISOString().split("T")[0]}
                    />
                  </div>

                  {/* Type */}
                  <div className="col-span-2 grid gap-2">
                    <Label className="font-semibold">Type *</Label>
                    <Select value={formData.type} onValueChange={v => setFormData(f => ({ ...f, type: v }))}>
                      <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="workshop">Workshop</SelectItem>
                        <SelectItem value="meeting">Meeting</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Start Time */}
                  <div className="grid gap-2">
                    <Label className="font-semibold">Start Time *</Label>
                    <TimePicker value={formData.startTime} onChange={v => setFormData(f => ({ ...f, startTime: v }))} />
                  </div>

                  {/* End Time */}
                  <div className="grid gap-2">
                    <Label className="font-semibold">End Time *</Label>
                    <TimePicker value={formData.endTime} onChange={v => setFormData(f => ({ ...f, endTime: v }))} />
                  </div>

                  {/* School */}
                  <div className="col-span-2 grid gap-2">
                    <Label className="font-semibold">School *</Label>
                    <Select value={formData.schoolId} onValueChange={v => setFormData(f => ({ ...f, schoolId: v }))}>
                      <SelectTrigger className="h-10"><SelectValue placeholder="Select school" /></SelectTrigger>
                      <SelectContent className="max-h-52 overflow-y-auto z-[200]" position="popper">
                        {schools.map(s => <SelectItem key={s.id} value={s.id}>{s.name} – {s.city}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Salesman */}
                  <div className="col-span-2 grid gap-2">
                    <Label className="font-semibold">Salesman *</Label>
                    <Select value={formData.salesmanId} onValueChange={v => setFormData(f => ({ ...f, salesmanId: v }))}>
                      <SelectTrigger className="h-10"><SelectValue placeholder="Select salesman" /></SelectTrigger>
                      <SelectContent className="max-h-52 overflow-y-auto z-[200]" position="popper">
                        {salesmen.map(s => <SelectItem key={s.id} value={s.id}>{s.name} – {s.territory}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Activity */}
                  <div className="col-span-2 grid gap-2">
                    <Label className="font-semibold">Activity Description *</Label>
                    <Textarea
                      placeholder="e.g., Book Promotion Workshop – Class 9-10 Science Series"
                      value={formData.activity}
                      onChange={e => setFormData(f => ({ ...f, activity: e.target.value }))}
                      rows={3}
                    />
                  </div>
                </div>

                <DialogFooter className="pt-2">
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleScheduleSubmit} className="gap-2">
                    <Plus className="h-4 w-4" /> Add Schedule
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 md:gap-3 mb-5">
        {[
          {
            label: "Total Schedules", value: schedules.length,
            sub: `${uniqueSchools} unique schools`,
            icon: <Calendar className="h-3.5 w-3.5 md:h-4 md:w-4 text-orange-600" />,
            bg: "bg-orange-100", card: "gradient-card-orange",
          },
          {
            label: "Workshops", value: totalWorkshops,
            sub: "Book promotions",
            icon: <Briefcase className="h-3.5 w-3.5 md:h-4 md:w-4 text-amber-600" />,
            bg: "bg-amber-100", card: "gradient-card-amber",
          },
          {
            label: "Meetings", value: totalMeetings,
            sub: "School discussions",
            icon: <User className="h-3.5 w-3.5 md:h-4 md:w-4 text-blue-600" />,
            bg: "bg-blue-100", card: "gradient-card-blue",
          },
          {
            label: "Booked", value: bookedCount,
            sub: "Confirmed visits",
            icon: <CheckCircle2 className="h-3.5 w-3.5 md:h-4 md:w-4 text-emerald-600" />,
            bg: "bg-emerald-100", card: "gradient-card-emerald",
          },
          {
            label: "Completed", value: completedCount,
            sub: "Done visits",
            icon: <CheckCheck className="h-3.5 w-3.5 md:h-4 md:w-4 text-emerald-600" />,
            bg: "bg-emerald-100", card: "gradient-card-emerald",
          },
          {
            label: "Today", value: todayCount,
            sub: "Scheduled today",
            icon: <Clock className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary" />,
            bg: "bg-primary/10", card: "gradient-card-neutral",
          },
        ].map(({ label, value, sub, icon, bg, card }) => (
          <Card key={label} className={cn("border-0 shadow-sm", card)}>
            <CardContent className="p-2.5 md:p-4">
              <div className="flex items-center justify-between mb-2 md:mb-3">
                <div className={cn("p-1 md:p-1.5 rounded-lg", bg)}>
                  {icon}
                </div>
              </div>
              <p className="text-base md:text-xl font-bold tracking-tight">{value}</p>
              <p className="text-[10px] md:text-xs text-muted-foreground mt-0.5">{label}</p>
              <div className="mt-1.5 pt-1.5 md:mt-2 md:pt-2 border-t border-border/50">
                <p className="text-[10px] text-muted-foreground mt-1">{sub}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── DataGrid ── */}
      <DataGrid<Schedule>
        columns={columns}
        data={schedules}
        rowKey="id"
        title="PM Schedules"
        description={`All schedules for ${productManager.name}`}
        emptyMessage="No schedules found"
        emptyIcon={<Calendar className="h-10 w-10 text-muted-foreground/30" />}
        density="normal"
        striped
        inlineFilters
        selectable
        defaultPageSize={15}
        expandedRowRender={(row) => (
          <div className="p-4 bg-muted/30 border-t grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">School Details</p>
              <div className="font-semibold flex items-center gap-1.5"><Building2 className="h-3.5 w-3.5 text-muted-foreground" />{row.schoolName}</div>
              <div className="text-muted-foreground flex items-start gap-1.5"><MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0" />{row.address}, {row.city}</div>
              <div className="text-muted-foreground flex items-center gap-1.5"><User className="h-3.5 w-3.5" />{row.salesmanName} <span className="text-xs opacity-60">({row.salesmanId})</span></div>
            </div>
            <div className="space-y-2 border-l pl-4 border-border/50">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Activity</p>
              {row.topic && <p className="font-semibold text-primary">{row.topic}</p>}
              <p className="text-muted-foreground leading-relaxed">{row.activity}</p>
              {row.rejectionReason && (
                <div className="mt-2 p-2 bg-muted rounded text-xs text-muted-foreground border border-border">
                  <strong>Rejection reason:</strong> {row.rejectionReason}
                </div>
              )}
            </div>
          </div>
        )}
      />

    </PageContainer>
  );
}
