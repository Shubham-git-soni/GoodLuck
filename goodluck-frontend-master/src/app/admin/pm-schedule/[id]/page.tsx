"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Phone,
  Mail,
  Briefcase,
  ArrowLeft,
  Building2,
  Target,
  Plus,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
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
  approvalStatus?: "requested" | "approved" | "booked" | "completed";
  isCompleted?: boolean;
  hasConflict?: boolean;
  status: string;
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

export default function PMDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [productManager, setProductManager] = useState<ProductManager | null>(null);
  const [groupedSchedules, setGroupedSchedules] = useState<Record<string, Schedule[]>>({});
  const [dialogOpen, setDialogOpen] = useState(false);
  const [schools, setSchools] = useState<any[]>([]);
  const [salesmen, setSalesmen] = useState<any[]>([]);

  // Form state
  const [formData, setFormData] = useState({
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
    const pm = data.find((pm: ProductManager) => pm.id === params.id);

    if (pm) {
      setProductManager(pm);

      // Group schedules by date
      const grouped = pm.schedules.reduce((acc: Record<string, Schedule[]>, schedule: Schedule) => {
        if (!acc[schedule.date]) {
          acc[schedule.date] = [];
        }
        acc[schedule.date].push(schedule);
        return acc;
      }, {});

      // Sort dates
      const sortedGrouped = Object.keys(grouped)
        .sort()
        .reduce((acc: Record<string, Schedule[]>, key: string) => {
          acc[key] = grouped[key].sort((a: Schedule, b: Schedule) =>
            a.startTime.localeCompare(b.startTime)
          );
          return acc;
        }, {});

      setGroupedSchedules(sortedGrouped);
    }

    // Load schools and salesmen data
    const schoolsData = require("@/lib/mock-data/schools.json");
    const salesmenData = require("@/lib/mock-data/salesmen.json");
    setSchools(schoolsData);
    setSalesmen(salesmenData);
  }, [params.id]);

  const handleScheduleSubmit = () => {
    if (!formData.date || !formData.startTime || !formData.endTime ||
        !formData.schoolId || !formData.salesmanId || !formData.activity) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
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
    };

    // Update product manager with new schedule
    const updatedPM = {
      ...productManager,
      schedules: [...productManager.schedules, newSchedule],
    };
    setProductManager(updatedPM);

    // Re-group schedules
    const grouped = updatedPM.schedules.reduce((acc: Record<string, Schedule[]>, schedule: Schedule) => {
      if (!acc[schedule.date]) {
        acc[schedule.date] = [];
      }
      acc[schedule.date].push(schedule);
      return acc;
    }, {});

    const sortedGrouped = Object.keys(grouped)
      .sort()
      .reduce((acc: Record<string, Schedule[]>, key: string) => {
        acc[key] = grouped[key].sort((a: Schedule, b: Schedule) =>
          a.startTime.localeCompare(b.startTime)
        );
        return acc;
      }, {});

    setGroupedSchedules(sortedGrouped);

    toast({
      title: "Schedule Created",
      description: `New ${formData.type} scheduled successfully`,
    });

    // Reset form and close dialog
    setFormData({
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

  if (!productManager) {
    return (
      <PageContainer>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </PageContainer>
    );
  }

  const totalWorkshops = productManager.schedules.filter(
    (s) => s.type === "workshop"
  ).length;
  const totalMeetings = productManager.schedules.filter(
    (s) => s.type === "meeting"
  ).length;
  const confirmedSchedules = productManager.schedules.filter(
    (s) => s.status === "confirmed"
  ).length;
  const uniqueSchools = new Set(productManager.schedules.map((s) => s.schoolId)).size;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return "Tomorrow";
    } else {
      return date.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }
  };

  return (
    <PageContainer>
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => router.push("/admin/pm-schedule")}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to All Schedules
        </Button>

        <Card className="bg-linear-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <h1 className="text-3xl font-bold">{productManager.name}</h1>
                  <Badge
                    variant={productManager.currentStatus === "Busy" ? "default" : "secondary"}
                    className={
                      productManager.currentStatus === "Busy"
                        ? "bg-orange-500 hover:bg-orange-600"
                        : "bg-green-500 hover:bg-green-600 text-white"
                    }
                  >
                    {productManager.currentStatus}
                  </Badge>
                  <Badge variant="outline">{productManager.id}</Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span>{productManager.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span>{productManager.contactNo}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span>{productManager.state}</span>
                  </div>
                </div>
              </div>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Schedule
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Add New Schedule</DialogTitle>
                    <DialogDescription>
                      Schedule a new workshop or meeting for {productManager.name}
                    </DialogDescription>
                  </DialogHeader>

                  <div className="grid gap-4 py-4">
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
                    <Button onClick={handleScheduleSubmit}>Add Schedule</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Schedules</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{productManager.schedules.length}</div>
            <p className="text-xs text-muted-foreground">
              {confirmedSchedules} confirmed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Workshops</CardTitle>
            <Briefcase className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{totalWorkshops}</div>
            <p className="text-xs text-muted-foreground">Book promotions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Meetings</CardTitle>
            <User className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{totalMeetings}</div>
            <p className="text-xs text-muted-foreground">School discussions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Schools</CardTitle>
            <Building2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{uniqueSchools}</div>
            <p className="text-xs text-muted-foreground">Unique schools</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        {productManager.schedules.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Calendar className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No Schedules Planned</h3>
              <p className="text-muted-foreground">
                This product manager currently has no scheduled activities
              </p>
            </CardContent>
          </Card>
        ) : (
          Object.entries(groupedSchedules).map(([date, schedules]) => {
            const isToday = formatDate(date) === "Today";
            const isTomorrow = formatDate(date) === "Tomorrow";

            return (
              <Card key={date} className={isToday ? "border-blue-500 border-2" : ""}>
                <CardHeader className="bg-muted/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Calendar className={`h-5 w-5 ${isToday ? "text-blue-600" : "text-muted-foreground"}`} />
                      <CardTitle className={isToday ? "text-blue-600" : ""}>
                        {formatDate(date)}
                      </CardTitle>
                      {isToday && (
                        <Badge className="bg-blue-500 hover:bg-blue-600">Current Day</Badge>
                      )}
                      {isTomorrow && (
                        <Badge variant="secondary">Tomorrow</Badge>
                      )}
                    </div>
                    <Badge variant="outline" className="font-mono">
                      {schedules.length} {schedules.length === 1 ? "schedule" : "schedules"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
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
                        {schedules.map((schedule) => (
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
                              <Badge
                                variant="outline"
                                className={`capitalize ${
                                  schedule.type === "workshop"
                                    ? "border-blue-500 text-blue-600"
                                    : "border-purple-500 text-purple-600"
                                }`}
                              >
                                {schedule.type === "workshop" ? (
                                  <Briefcase className="h-3 w-3 mr-1" />
                                ) : (
                                  <User className="h-3 w-3 mr-1" />
                                )}
                                {schedule.type}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div>
                                <div className="font-medium flex items-center gap-2">
                                  <Building2 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                  {schedule.schoolName}
                                </div>
                                <div className="text-xs text-muted-foreground pl-5">
                                  {schedule.schoolId}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-start gap-2">
                                <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
                                <div className="text-sm">
                                  <div className="font-medium">{schedule.city}</div>
                                  <div className="text-muted-foreground text-xs max-w-[200px] line-clamp-1">
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
                                <div className="flex items-start gap-2">
                                  <Target className="h-3.5 w-3.5 text-blue-600 shrink-0 mt-0.5" />
                                  <div className="text-sm font-semibold text-blue-700 dark:text-blue-400">{schedule.topic}</div>
                                </div>
                                <div className="text-xs text-muted-foreground line-clamp-1 ml-5">{schedule.activity}</div>
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
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </PageContainer>
  );
}
