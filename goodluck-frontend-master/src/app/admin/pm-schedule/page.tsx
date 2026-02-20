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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

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

export default function PMSchedulePage() {
  const { toast } = useToast();
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
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Schedule New Visit</DialogTitle>
              <DialogDescription>
                Schedule a new workshop or meeting for a product manager
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
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

              <div className="grid grid-cols-2 gap-4">
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
              </div>

              <div className="grid grid-cols-2 gap-4">
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

              <div className="grid gap-2">
                <Label htmlFor="activity">Activity Description *</Label>
                <Textarea
                  id="activity"
                  placeholder="e.g., Book Promotion Workshop - Class 9-10 Science Series"
                  value={formData.activity}
                  onChange={(e) =>
                    setFormData({ ...formData, activity: e.target.value })
                  }
                  rows={3}
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

      <div className="grid gap-6 md:grid-cols-3 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Product Managers</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{productManagers.length}</div>
            <p className="text-xs text-muted-foreground">Active managers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Currently Busy</CardTitle>
            <Briefcase className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{totalBusyManagers}</div>
            <p className="text-xs text-muted-foreground">
              {totalFreeManagers} managers free
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today&apos;s Schedules</CardTitle>
            <Calendar className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{totalSchedulesToday}</div>
            <p className="text-xs text-muted-foreground">
              Workshops and meetings
            </p>
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
                  placeholder="Search by name, email, or state..."
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

      <div className="grid gap-6">
        {filteredManagers.map((pm) => {
          const todaySchedules = getTodaySchedules(pm);
          const upcomingSchedules = getUpcomingSchedules(pm);

          return (
            <Card key={pm.id} className="overflow-hidden">
              <CardHeader className="bg-muted/50 pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <CardTitle className="text-xl">{pm.name}</CardTitle>
                      <Badge
                        variant={pm.currentStatus === "Busy" ? "default" : "secondary"}
                        className={
                          pm.currentStatus === "Busy"
                            ? "bg-orange-500 hover:bg-orange-600"
                            : "bg-green-500 hover:bg-green-600 text-white"
                        }
                      >
                        {pm.currentStatus}
                      </Badge>
                      <Badge variant="outline">{pm.id}</Badge>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Mail className="h-3.5 w-3.5 shrink-0" />
                        <span>{pm.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-3.5 w-3.5 shrink-0" />
                        <span>{pm.contactNo}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3.5 w-3.5 shrink-0" />
                        <span>{pm.state}</span>
                      </div>
                    </div>
                  </div>
                  <Link href={`/admin/pm-schedule/${pm.id}`}>
                    <Button variant="outline" size="sm">
                      View Details
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>

              <CardContent className="p-6">
                {pm.schedules.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p className="text-sm">No schedules planned</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {todaySchedules.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <Calendar className="h-4 w-4 text-blue-600" />
                          <h3 className="font-semibold text-blue-600">
                            Today&apos;s Schedule ({todaySchedules.length})
                          </h3>
                        </div>
                        <div className="rounded-md border overflow-hidden">
                          <Table>
                            <TableHeader>
                              <TableRow className="bg-muted/50">
                                <TableHead className="font-semibold">Time</TableHead>
                                <TableHead className="font-semibold">Type</TableHead>
                                <TableHead className="font-semibold">School</TableHead>
                                <TableHead className="font-semibold">Location</TableHead>
                                <TableHead className="font-semibold">Salesman</TableHead>
                                <TableHead className="font-semibold">Activity</TableHead>
                                <TableHead className="font-semibold">Status</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {todaySchedules.map((schedule) => (
                                <TableRow key={schedule.id} className="hover:bg-muted/30">
                                  <TableCell>
                                    <div className="flex items-center gap-2">
                                      <Clock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                      <div className="text-sm">
                                        <div className="font-medium">{schedule.startTime}</div>
                                        <div className="text-muted-foreground">{schedule.endTime}</div>
                                      </div>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <Badge variant="outline" className="capitalize">
                                      {schedule.type}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>
                                    <div>
                                      <div className="font-medium">{schedule.schoolName}</div>
                                      <div className="text-xs text-muted-foreground">
                                        {schedule.schoolId}
                                      </div>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex items-start gap-2">
                                      <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
                                      <div className="text-sm">
                                        <div className="font-medium">{schedule.city}</div>
                                        <div className="text-muted-foreground text-xs line-clamp-1">
                                          {schedule.address}
                                        </div>
                                      </div>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex items-center gap-2">
                                      <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                      <div className="text-sm">
                                        <div className="font-medium">{schedule.salesmanName}</div>
                                        <div className="text-xs text-muted-foreground">
                                          {schedule.salesmanId}
                                        </div>
                                      </div>
                                    </div>
                                  </TableCell>
                                  <TableCell className="max-w-[280px]">
                                    <div className="space-y-1">
                                      <div className="text-sm font-semibold text-blue-700 dark:text-blue-400">{schedule.topic}</div>
                                      <div className="text-xs text-muted-foreground line-clamp-1">{schedule.activity}</div>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex flex-col gap-1">
                                      <Badge
                                        className={
                                          schedule.approvalStatus === "requested"
                                            ? "bg-yellow-500 hover:bg-yellow-600 text-white"
                                            : schedule.approvalStatus === "approved"
                                            ? "bg-blue-500 hover:bg-blue-600 text-white"
                                            : schedule.approvalStatus === "booked"
                                            ? "bg-green-500 hover:bg-green-600 text-white"
                                            : "bg-gray-500 hover:bg-gray-600 text-white"
                                        }
                                      >
                                        {schedule.approvalStatus}
                                      </Badge>
                                      {schedule.isCompleted && (
                                        <Badge className="bg-gray-600 text-white text-xs">
                                          <CheckCircle2 className="h-3 w-3 mr-1" />
                                          Completed
                                        </Badge>
                                      )}
                                      {schedule.hasConflict && (
                                        <Badge variant="destructive" className="text-xs">
                                          <AlertTriangle className="h-3 w-3 mr-1" />
                                          Conflict
                                        </Badge>
                                      )}
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    )}

                    {upcomingSchedules.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <Calendar className="h-4 w-4 text-purple-600" />
                          <h3 className="font-semibold text-purple-600">
                            Upcoming Schedules ({upcomingSchedules.length})
                          </h3>
                        </div>
                        <div className="rounded-md border overflow-hidden">
                          <Table>
                            <TableHeader>
                              <TableRow className="bg-muted/50">
                                <TableHead className="font-semibold">Date</TableHead>
                                <TableHead className="font-semibold">Time</TableHead>
                                <TableHead className="font-semibold">Type</TableHead>
                                <TableHead className="font-semibold">School</TableHead>
                                <TableHead className="font-semibold">Location</TableHead>
                                <TableHead className="font-semibold">Salesman</TableHead>
                                <TableHead className="font-semibold">Activity</TableHead>
                                <TableHead className="font-semibold">Status</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {upcomingSchedules.map((schedule) => (
                                <TableRow key={schedule.id} className="hover:bg-muted/30">
                                  <TableCell>
                                    <Badge variant="outline">
                                      {new Date(schedule.date).toLocaleDateString("en-US", {
                                        month: "short",
                                        day: "numeric",
                                      })}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex items-center gap-2">
                                      <Clock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                      <div className="text-sm">
                                        <div className="font-medium">{schedule.startTime}</div>
                                        <div className="text-muted-foreground">{schedule.endTime}</div>
                                      </div>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <Badge variant="outline" className="capitalize">
                                      {schedule.type}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>
                                    <div>
                                      <div className="font-medium">{schedule.schoolName}</div>
                                      <div className="text-xs text-muted-foreground">
                                        {schedule.schoolId}
                                      </div>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex items-start gap-2">
                                      <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
                                      <div className="text-sm">
                                        <div className="font-medium">{schedule.city}</div>
                                        <div className="text-muted-foreground text-xs line-clamp-1">
                                          {schedule.address}
                                        </div>
                                      </div>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex items-center gap-2">
                                      <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                      <div className="text-sm">
                                        <div className="font-medium">{schedule.salesmanName}</div>
                                        <div className="text-xs text-muted-foreground">
                                          {schedule.salesmanId}
                                        </div>
                                      </div>
                                    </div>
                                  </TableCell>
                                  <TableCell className="max-w-[280px]">
                                    <div className="space-y-1">
                                      <div className="text-sm font-semibold text-blue-700 dark:text-blue-400">{schedule.topic}</div>
                                      <div className="text-xs text-muted-foreground line-clamp-1">{schedule.activity}</div>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex flex-col gap-1">
                                      <Badge
                                        className={
                                          schedule.approvalStatus === "requested"
                                            ? "bg-yellow-500 hover:bg-yellow-600 text-white"
                                            : schedule.approvalStatus === "approved"
                                            ? "bg-blue-500 hover:bg-blue-600 text-white"
                                            : schedule.approvalStatus === "booked"
                                            ? "bg-green-500 hover:bg-green-600 text-white"
                                            : "bg-gray-500 hover:bg-gray-600 text-white"
                                        }
                                      >
                                        {schedule.approvalStatus}
                                      </Badge>
                                      {schedule.isCompleted && (
                                        <Badge className="bg-gray-600 text-white text-xs">
                                          <CheckCircle2 className="h-3 w-3 mr-1" />
                                          Completed
                                        </Badge>
                                      )}
                                      {schedule.hasConflict && (
                                        <Badge variant="destructive" className="text-xs">
                                          <AlertTriangle className="h-3 w-3 mr-1" />
                                          Conflict
                                        </Badge>
                                      )}
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}

        {filteredManagers.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <User className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No Product Managers Found</h3>
              <p className="text-muted-foreground">
                Try adjusting your filters or search query
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </PageContainer>
  );
}
