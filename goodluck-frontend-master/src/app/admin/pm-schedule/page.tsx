"use client";

import { useState, useEffect } from "react";
import { Calendar, Clock, MapPin, User, Briefcase, Phone, Mail, Search, Filter, ChevronRight, Plus, AlertTriangle, CheckCircle2 } from "lucide-react";
import PageContainer from "@/components/layouts/PageContainer";
import PageHeader from "@/components/layouts/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DataGrid, GridColumn, RowAction } from "@/components/ui/data-grid";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

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

interface FlattenedSchedule extends Schedule {
  pmId: string;
  pmName: string;
  pmEmail: string;
  pmState: string;
  pmStatus: string;
}

export default function PMSchedulePage() {
  const { toast } = useToast();
  const router = useRouter();
  const [productManagers, setProductManagers] = useState<ProductManager[]>([]);
  const [filteredManagers, setFilteredManagers] = useState<ProductManager[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [stateFilter, setStateFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [schools, setSchools] = useState<any[]>([]);
  const [salesmen, setSalesmen] = useState<any[]>([]);

  // Form state
  const [formData, setFormData] = useState({
    productManagerId: "",
    date: "",
    startTime: "",
    endTime: "",
    type: "workshop",
    schoolId: "",
    salesmanId: "",
    activity: "",
  });

  useEffect(() => {
    const data = require("@/lib/mock-data/product-manager-schedules.json");
    setProductManagers(data);
    setFilteredManagers(data);

    // Load schools and salesmen data
    const schoolsData = require("@/lib/mock-data/schools.json");
    const salesmenData = require("@/lib/mock-data/salesmen.json");
    setSchools(schoolsData);
    setSalesmen(salesmenData);
  }, []);

  useEffect(() => {
    let filtered = productManagers;

    if (searchQuery) {
      filtered = filtered.filter(
        (pm) =>
          pm.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          pm.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          pm.state.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (pm) => pm.currentStatus.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    if (stateFilter !== "all") {
      filtered = filtered.filter((pm) => pm.state === stateFilter);
    }

    setFilteredManagers(filtered);
  }, [searchQuery, statusFilter, stateFilter, productManagers]);

  const getTodaySchedules = (pm: ProductManager) => {
    const today = new Date().toISOString().split("T")[0];
    return pm.schedules.filter((schedule) => schedule.date === today);
  };

  const getUpcomingSchedules = (pm: ProductManager) => {
    const today = new Date().toISOString().split("T")[0];
    return pm.schedules.filter((schedule) => schedule.date > today);
  };

  const handleScheduleSubmit = () => {
    if (!formData.productManagerId || !formData.date || !formData.startTime ||
      !formData.endTime || !formData.schoolId || !formData.salesmanId || !formData.activity) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

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
      topic: formData.activity.split(' - ')[0] || formData.activity.substring(0, 30),
      approvalStatus: "requested" as const,
      isCompleted: false,
    };

    // Update the product manager's schedules
    setProductManagers((prev) =>
      prev.map((pm) =>
        pm.id === formData.productManagerId
          ? { ...pm, schedules: [...pm.schedules, newSchedule] }
          : pm
      )
    );

    toast({
      title: "Schedule Created",
      description: `New ${formData.type} scheduled successfully`,
    });

    // Reset form and close dialog
    setFormData({
      productManagerId: "",
      date: "",
      startTime: "",
      endTime: "",
      type: "workshop",
      schoolId: "",
      salesmanId: "",
      activity: "",
    });
    setDialogOpen(false);
  };

  const totalBusyManagers = productManagers.filter(
    (pm) => pm.currentStatus === "Busy"
  ).length;
  const totalFreeManagers = productManagers.filter(
    (pm) => pm.currentStatus === "Free"
  ).length;
  const totalSchedulesToday = productManagers.reduce(
    (acc, pm) => acc + getTodaySchedules(pm).length,
    0
  );

  const uniqueStates = Array.from(
    new Set(productManagers.map((pm) => pm.state))
  ).sort();

  const allSchedules: FlattenedSchedule[] = productManagers.flatMap((pm) =>
    pm.schedules.map((s) => ({
      ...s,
      pmId: pm.id,
      pmName: pm.name,
      pmEmail: pm.email,
      pmState: pm.state,
      pmStatus: pm.currentStatus,
    }))
  );

  const flatFilteredSchedules = allSchedules.filter((s) => {
    if (searchQuery && !s.pmName.toLowerCase().includes(searchQuery.toLowerCase()) && !s.schoolName.toLowerCase().includes(searchQuery.toLowerCase()) && !s.salesmanName.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (statusFilter !== "all" && s.pmStatus.toLowerCase() !== statusFilter.toLowerCase()) return false;
    if (stateFilter !== "all" && s.pmState !== stateFilter) return false;
    return true;
  });

  const columns: GridColumn<FlattenedSchedule>[] = [
    {
      key: "pmName",
      header: "Product Manager",
      sortable: true,
      filterable: true,
      width: 200,
      render: (v, row) => (
        <div>
          <div className="font-semibold text-sm text-primary">{v}</div>
          <div className="text-xs text-muted-foreground">{row.pmState}</div>
        </div>
      ),
    },
    {
      key: "date",
      header: "Date & Time",
      sortable: true,
      filterable: true,
      width: 150,
      render: (v, row) => (
        <div>
          <Badge variant="secondary" className="font-medium text-[11px] mb-1">
            {new Date(v).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          </Badge>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" /> {row.startTime}
          </div>
        </div>
      ),
    },
    {
      key: "type",
      header: "Type",
      sortable: true,
      filterable: true,
      width: 110,
      render: (v) => <Badge variant="outline" className="capitalize text-[10px]">{v}</Badge>
    },
    {
      key: "schoolName",
      header: "School & Location",
      sortable: true,
      filterable: true,
      width: 220,
      render: (v, row) => (
        <div>
          <div className="font-medium truncate">{v}</div>
          <div className="flex items-center gap-1 mt-0.5 text-xs text-muted-foreground">
            <MapPin className="w-3 h-3" /> {row.city}
          </div>
        </div>
      )
    },
    {
      key: "salesmanName",
      header: "Salesman",
      sortable: true,
      filterable: true,
      width: 150,
      render: (v) => <span className="text-[13px] font-medium">{v}</span>
    },
    {
      key: "topic",
      header: "Activity",
      width: 250,
      render: (v, row) => (
        <div className="space-y-0.5 max-w-[250px]">
          <div className="text-[13px] font-semibold text-blue-700 dark:text-blue-400 truncate">{v}</div>
          <div className="text-[11px] text-muted-foreground line-clamp-1">{row.activity}</div>
        </div>
      )
    },
    {
      key: "approvalStatus",
      header: "Status",
      sortable: true,
      filterable: true,
      width: 130,
      render: (v, row) => (
        <div className="flex flex-col gap-1 items-start">
          <Badge
            className={
              v === "requested" ? "bg-yellow-500 hover:bg-yellow-600 text-white border-0"
                : v === "approved" ? "bg-blue-500 hover:bg-blue-600 text-white border-0"
                  : v === "booked" ? "bg-green-500 hover:bg-green-600 text-white border-0"
                    : "bg-gray-500 hover:bg-gray-600 text-white border-0"
            }
          >
            {v}
          </Badge>
          {row.isCompleted && (
            <Badge className="bg-gray-600 border-0 text-white min-h-[16px] px-1 text-[10px]">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Completed
            </Badge>
          )}
          {row.hasConflict && (
            <Badge variant="destructive" className="min-h-[16px] border-0 px-1 text-[10px]">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Conflict
            </Badge>
          )}
        </div>
      )
    }
  ];

  const rowActions: RowAction<FlattenedSchedule>[] = [
    { label: "View Details", icon: <Eye className="h-3.5 w-3.5" />, onClick: (row) => router.push(`/admin/pm-schedule/${row.pmId}`) },
    { label: "Edit Visit", icon: <Pencil className="h-3.5 w-3.5" />, onClick: () => { } },
    { label: "Cancel Visit", icon: <Trash2 className="h-3.5 w-3.5" />, onClick: () => { }, danger: true }
  ];

  return (
    <PageContainer>
      <div className="flex items-center justify-between mb-6">
        <PageHeader
          title="Product Manager Schedules"
          description="View and manage product manager availability and workshop schedules"
        />
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Schedule New Visit
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Schedule New Visit</DialogTitle>
              <DialogDescription>
                Schedule a new workshop or meeting for a product manager
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 py-4">
              <div className="grid gap-2">
                <Label htmlFor="productManager">Product Manager *</Label>
                <Select
                  value={formData.productManagerId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, productManagerId: value })
                  }
                >
                  <SelectTrigger id="productManager">
                    <SelectValue placeholder="Select product manager" />
                  </SelectTrigger>
                  <SelectContent>
                    {productManagers.map((pm) => (
                      <SelectItem key={pm.id} value={pm.id}>
                        {pm.name} - {pm.state}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="date">Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="type">Type *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) =>
                    setFormData({ ...formData, type: value })
                  }
                >
                  <SelectTrigger id="type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="workshop">Workshop</SelectItem>
                    <SelectItem value="meeting">Meeting</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="startTime">Start Time *</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={formData.startTime}
                  onChange={(e) =>
                    setFormData({ ...formData, startTime: e.target.value })
                  }
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="endTime">End Time *</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={formData.endTime}
                  onChange={(e) =>
                    setFormData({ ...formData, endTime: e.target.value })
                  }
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="school">School *</Label>
                <Select
                  value={formData.schoolId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, schoolId: value })
                  }
                >
                  <SelectTrigger id="school">
                    <SelectValue placeholder="Select school" />
                  </SelectTrigger>
                  <SelectContent>
                    {schools.map((school) => (
                      <SelectItem key={school.id} value={school.id}>
                        {school.name} - {school.city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="salesman">Salesman *</Label>
                <Select
                  value={formData.salesmanId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, salesmanId: value })
                  }
                >
                  <SelectTrigger id="salesman">
                    <SelectValue placeholder="Select salesman" />
                  </SelectTrigger>
                  <SelectContent>
                    {salesmen.map((salesman) => (
                      <SelectItem key={salesman.id} value={salesman.id}>
                        {salesman.name} - {salesman.territory}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2 lg:col-span-2">
                <Label htmlFor="activity">Activity Description *</Label>
                <Textarea
                  id="activity"
                  placeholder="e.g., Book Promotion Workshop - Class 9-10 Science Series"
                  value={formData.activity}
                  onChange={(e) =>
                    setFormData({ ...formData, activity: e.target.value })
                  }
                  rows={2}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleScheduleSubmit}>Schedule Visit</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <Card className="border-0 shadow-sm gradient-card-neutral">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="p-1.5 rounded-lg bg-blue-100">
                <User className="h-4 w-4 text-blue-600" />
              </div>
            </div>
            <p className="text-xl font-bold tracking-tight">{productManagers.length}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Total Product Managers</p>
            <div className="mt-2 pt-2 border-t border-border/50">
              <p className="text-xs text-muted-foreground">Active managers</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm gradient-card-orange">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="p-1.5 rounded-lg bg-orange-100">
                <Briefcase className="h-4 w-4 text-orange-600" />
              </div>
            </div>
            <p className="text-xl font-bold tracking-tight">{totalBusyManagers}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Currently Busy</p>
            <div className="mt-2 pt-2 border-t border-border/50">
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">{totalFreeManagers} managers free</p>
                <Progress value={(totalBusyManagers / productManagers.length) * 100} className="w-16 h-1.5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm gradient-card-amber">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="p-1.5 rounded-lg bg-blue-100">
                <Calendar className="h-4 w-4 text-blue-600" />
              </div>
            </div>
            <p className="text-xl font-bold tracking-tight">{totalSchedulesToday}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Today&apos;s Schedules</p>
            <div className="mt-2 pt-2 border-t border-border/50">
              <p className="text-xs text-muted-foreground">Workshops and meetings</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by PM, Salesman, or School..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[160px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="busy">Busy</SelectItem>
                  <SelectItem value="free">Free</SelectItem>
                </SelectContent>
              </Select>

              <Select value={stateFilter} onValueChange={setStateFilter}>
                <SelectTrigger className="w-[160px]">
                  <MapPin className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="State" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All States</SelectItem>
                  {uniqueStates.map((state) => (
                    <SelectItem key={state} value={state}>
                      {state}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="w-full">
        <DataGrid
          data={flatFilteredSchedules}
          columns={columns}
          rowKey="id"
          rowActions={rowActions}
          density="compact"
          selectable
          inlineFilters
          striped
          enableRowPinning
          defaultPageSize={15}
        />
      </div>
    </PageContainer>
  );
}
