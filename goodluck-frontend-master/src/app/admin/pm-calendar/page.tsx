"use client";

import { useState, useEffect } from "react";
import { Calendar, ChevronLeft, ChevronRight, Clock, MapPin, User, Building2, Briefcase, Phone, Filter, AlertTriangle, CheckCircle2, Search, Download, Plus, TrendingUp } from "lucide-react";
import PageContainer from "@/components/layouts/PageContainer";
import PageHeader from "@/components/layouts/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  const [currentWeekStart, setCurrentWeekStart] = useState(new Date());
  const [stateFilter, setStateFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"week" | "list">("week");

  useEffect(() => {
    const data = require("@/lib/mock-data/product-manager-schedules.json");
    setProductManagers(data);
    setFilteredManagers(data);

    // Set to start of current week (Monday)
    const today = new Date();
    const dayOfWeek = today.getDay();
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(today);
    monday.setDate(today.getDate() + diff);
    setCurrentWeekStart(monday);
  }, []);

  useEffect(() => {
    let filtered = productManagers;

    if (stateFilter !== "all") {
      filtered = filtered.filter((pm) => pm.state === stateFilter);
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (pm) => pm.currentStatus.toLowerCase() === statusFilter.toLowerCase()
      );
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
          s.topic.toLowerCase().includes(query) ||
          s.activity.toLowerCase().includes(query)
        )
      );
    }

    setFilteredManagers(filtered);
  }, [stateFilter, statusFilter, searchQuery, productManagers]);

  const getWeekDates = () => {
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(currentWeekStart);
      date.setDate(currentWeekStart.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const navigateWeek = (direction: "prev" | "next") => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(currentWeekStart.getDate() + (direction === "next" ? 7 : -7));
    setCurrentWeekStart(newDate);
  };

  const goToToday = () => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(today);
    monday.setDate(today.getDate() + diff);
    setCurrentWeekStart(monday);
  };

  const formatDate = (date: Date) => {
    return date.toISOString().split("T")[0];
  };

  const getSchedulesForDateAndPM = (date: Date, pm: ProductManager) => {
    const dateStr = formatDate(date);
    return pm.schedules.filter((schedule) => schedule.date === dateStr);
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return formatDate(date) === formatDate(today);
  };

  const detectConflicts = (schedules: Schedule[]) => {
    for (let i = 0; i < schedules.length; i++) {
      for (let j = i + 1; j < schedules.length; j++) {
        if (schedules[i].date === schedules[j].date) {
          const start1 = schedules[i].startTime;
          const end1 = schedules[i].endTime;
          const start2 = schedules[j].startTime;
          const end2 = schedules[j].endTime;

          if ((start1 < end2 && start2 < end1) || (start2 < end1 && start1 < end2)) {
            return true;
          }
        }
      }
    }
    return false;
  };

  const getApprovalStatusBadge = (status: string) => {
    const config = {
      requested: { color: "bg-yellow-500 hover:bg-yellow-600", label: "Requested" },
      approved: { color: "bg-blue-500 hover:bg-blue-600", label: "Approved" },
      booked: { color: "bg-green-500 hover:bg-green-600", label: "Booked" },
      completed: { color: "bg-gray-500 hover:bg-gray-600", label: "Completed" }
    };
    return config[status as keyof typeof config] || config.requested;
  };

  const getApprovalBorderColor = (status: string) => {
    const colors = {
      requested: "border-yellow-500",
      approved: "border-blue-500",
      booked: "border-green-500",
      completed: "border-gray-500"
    };
    return colors[status as keyof typeof colors] || colors.requested;
  };

  const isPMBusyToday = (pm: ProductManager) => {
    const todayStr = formatDate(new Date());
    return pm.schedules.some((s) => s.date === todayStr);
  };

  const weekDates = getWeekDates();
  const uniqueStates = Array.from(new Set(productManagers.map((pm) => pm.state))).sort();

  const totalSchedulesThisWeek = filteredManagers.reduce((acc, pm) => {
    return (
      acc +
      pm.schedules.filter((s) => {
        const scheduleDate = new Date(s.date);
        const weekEnd = new Date(currentWeekStart);
        weekEnd.setDate(currentWeekStart.getDate() + 6);
        return scheduleDate >= currentWeekStart && scheduleDate <= weekEnd;
      }).length
    );
  }, 0);

  const busyManagersToday = filteredManagers.filter((pm) =>
    pm.schedules.some((s) => s.date === formatDate(new Date()))
  ).length;

  const totalConflicts = filteredManagers.reduce((acc, pm) => {
    return acc + (detectConflicts(pm.schedules) ? 1 : 0);
  }, 0);

  return (
    <PageContainer>
      {/* Header Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <PageHeader
            title="Product Manager Calendar"
            description="Centralized schedule management and availability tracking"
          />
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              New Schedule
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <Card className="p-4 border-0 shadow-sm">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by PM name, school, city, or topic..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={stateFilter} onValueChange={setStateFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <MapPin className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filter by State" />
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

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[160px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filter by Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="busy">Busy</SelectItem>
                <SelectItem value="free">Free</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card className="border-0 shadow-sm gradient-card-neutral">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-lg bg-blue-100">
                <User className="h-4 w-4 text-blue-600" />
              </div>
            </div>
            <p className="text-2xl font-bold tracking-tight">{filteredManagers.length}</p>
            <p className="text-xs text-muted-foreground mt-1">Managers Shown</p>
            <div className="mt-3">
              <Progress
                value={(filteredManagers.length / (productManagers.length || 1)) * 100}
                className="h-1.5"
              />
              <p className="text-[10px] text-muted-foreground mt-1">of {productManagers.length} total</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm gradient-card-amber">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-lg bg-blue-100">
                <Calendar className="h-4 w-4 text-blue-600" />
              </div>
            </div>
            <p className="text-2xl font-bold tracking-tight">{totalSchedulesThisWeek}</p>
            <p className="text-xs text-muted-foreground mt-1">This Week</p>
            <div className="mt-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-3 w-3 text-green-600" />
                <p className="text-[10px] text-green-600 font-medium">Total activities scheduled</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm gradient-card-orange">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-lg bg-orange-100">
                <Briefcase className="h-4 w-4 text-orange-600" />
              </div>
            </div>
            <p className="text-2xl font-bold tracking-tight">{busyManagersToday}</p>
            <p className="text-xs text-muted-foreground mt-1">Busy Today</p>
            <div className="mt-3">
              <Progress
                value={filteredManagers.length > 0 ? (busyManagersToday / filteredManagers.length) * 100 : 0}
                className="h-1.5"
              />
              <p className="text-[10px] text-muted-foreground mt-1">{filteredManagers.length - busyManagersToday} available</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm gradient-card-neutral">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-lg bg-red-100">
                <AlertTriangle className="h-4 w-4 text-red-600" />
              </div>
            </div>
            <p className="text-2xl font-bold tracking-tight">{totalConflicts}</p>
            <p className="text-xs text-muted-foreground mt-1">Conflicts Detected</p>
            <div className="mt-3">
              {totalConflicts > 0 ? (
                <p className="text-[10px] text-red-600 font-medium">⚠ Requires attention</p>
              ) : (
                <p className="text-[10px] text-green-600 font-medium">✓ All schedules clear</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Week Navigation */}
      <Card className="mb-6 border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => navigateWeek("prev")}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="default" size="sm" onClick={goToToday}>
                <Calendar className="h-4 w-4 mr-2" />
                Today
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigateWeek("next")}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="font-semibold">
                {currentWeekStart.toLocaleDateString("en-US", { month: "long", day: "numeric" })}
                {" - "}
                {new Date(currentWeekStart.getTime() + 6 * 24 * 60 * 60 * 1000).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
              </span>
            </div>
            <div className="flex gap-2">
              <Button
                variant={viewMode === "week" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("week")}
              >
                Week View
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("list")}
              >
                List View
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Calendar Content */}
      {viewMode === "week" ? (
        <>
          {/* Calendar Header */}
          <div className="grid grid-cols-8 gap-2 mb-3">
            <div className="bg-muted/50 rounded-lg p-3 font-semibold text-sm border flex items-center gap-2">
              <User className="h-4 w-4" />
              Manager
            </div>
            {weekDates.map((date, index) => (
              <div
                key={index}
                className={`rounded-lg p-3 text-center font-semibold border ${
                  isToday(date)
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted/30"
                }`}
              >
                <div className="text-xs uppercase">
                  {date.toLocaleDateString("en-US", { weekday: "short" })}
                </div>
                <div className="text-xl font-bold mt-1">{date.getDate()}</div>
                <div className="text-xs opacity-80">
                  {date.toLocaleDateString("en-US", { month: "short" })}
                </div>
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="space-y-2">
            {filteredManagers.map((pm) => (
              <Card key={pm.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="grid grid-cols-8 gap-2 p-2">
                  {/* Manager Info Column */}
                  <div className="bg-muted/30 rounded-lg p-3 border">
                    <div className="space-y-2">
                      <div>
                        <h3 className="font-semibold text-sm">{pm.name}</h3>
                        <p className="text-xs text-muted-foreground">{pm.id}</p>
                      </div>

                      <div className="flex flex-col gap-1 text-xs">
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <MapPin className="h-3 w-3 shrink-0" />
                          <span className="truncate">{pm.state}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Phone className="h-3 w-3 shrink-0" />
                          <span className="truncate text-[10px]">{pm.contactNo}</span>
                        </div>
                      </div>

                      <Badge
                        className={`w-full justify-center text-xs ${
                          isPMBusyToday(pm)
                            ? "bg-orange-500 hover:bg-orange-600 text-white"
                            : "bg-green-500 hover:bg-green-600 text-white"
                        }`}
                      >
                        {isPMBusyToday(pm) ? "Busy" : "Free"}
                      </Badge>
                    </div>
                  </div>

                  {/* Day Columns */}
                  {weekDates.map((date, dateIndex) => {
                    const schedules = getSchedulesForDateAndPM(date, pm);
                    const isCurrentDay = isToday(date);
                    const hasConflict = detectConflicts(schedules);
                    const isAvailable = schedules.length === 0;

                    return (
                      <div
                        key={dateIndex}
                        className={`rounded-lg min-h-[120px] p-2 border relative ${
                          isCurrentDay
                            ? "bg-primary/5 border-primary"
                            : isAvailable
                            ? "bg-green-50 dark:bg-green-950/10 border-green-200"
                            : "bg-orange-50 dark:bg-orange-950/10 border-orange-200"
                        }`}
                      >
                        {hasConflict && (
                          <div className="absolute -top-1 -right-1 z-10">
                            <Badge variant="destructive" className="text-[8px] px-1 py-0.5">
                              <AlertTriangle className="h-2 w-2 mr-0.5" />
                              Conflict
                            </Badge>
                          </div>
                        )}

                        {schedules.length === 0 ? (
                          <div className="flex flex-col items-center justify-center h-full">
                            <CheckCircle2 className="h-5 w-5 text-green-500 mb-1" />
                            <span className="text-xs text-green-600 font-medium">Available</span>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            {schedules.map((schedule) => {
                              const statusBadge = getApprovalStatusBadge(schedule.approvalStatus);
                              const borderColor = getApprovalBorderColor(schedule.approvalStatus);

                              return (
                                <Popover key={schedule.id}>
                                  <PopoverTrigger asChild>
                                    <div className={`bg-white dark:bg-gray-900 border-l-4 ${borderColor} rounded p-2 cursor-pointer hover:shadow-md transition-all text-left ${schedule.isCompleted ? 'opacity-60' : ''}`}>
                                      <div className="flex items-center justify-between gap-1 mb-1">
                                        <Badge variant="outline" className="text-[8px] px-1 py-0 h-4">
                                          {schedule.type === "workshop" ? "W" : "M"}
                                        </Badge>
                                        <Badge className={`text-[8px] px-1 py-0 h-4 ${statusBadge.color} text-white`}>
                                          {statusBadge.label}
                                        </Badge>
                                      </div>

                                      <div className="text-[10px] text-muted-foreground mb-1 flex items-center gap-1">
                                        <Clock className="h-2.5 w-2.5" />
                                        {schedule.startTime}
                                      </div>

                                      <div className="text-[11px] font-semibold line-clamp-2 mb-1">
                                        {schedule.topic}
                                      </div>

                                      <div className="text-[10px] text-muted-foreground line-clamp-1">
                                        {schedule.schoolName}
                                      </div>
                                    </div>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-80" align="start">
                                    <div className="space-y-3">
                                      <div>
                                        <h4 className="font-semibold mb-2">Schedule Details</h4>
                                        <div className="flex gap-2 flex-wrap">
                                          <Badge variant="outline" className="capitalize">
                                            {schedule.type}
                                          </Badge>
                                          <Badge className={`${statusBadge.color} text-white`}>
                                            {statusBadge.label}
                                          </Badge>
                                        </div>
                                      </div>

                                      <div className="space-y-2 text-sm">
                                        <div className="flex items-start gap-2">
                                          <Briefcase className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                                          <div>
                                            <div className="font-medium">Topic</div>
                                            <div className="text-muted-foreground">{schedule.topic}</div>
                                          </div>
                                        </div>

                                        <div className="flex items-start gap-2">
                                          <Clock className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                                          <div>
                                            <div className="font-medium">Time</div>
                                            <div className="text-muted-foreground">
                                              {schedule.startTime} - {schedule.endTime}
                                            </div>
                                          </div>
                                        </div>

                                        <div className="flex items-start gap-2">
                                          <Building2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                                          <div>
                                            <div className="font-medium">School</div>
                                            <div className="text-muted-foreground">{schedule.schoolName}</div>
                                            <div className="text-xs text-muted-foreground">{schedule.city}</div>
                                          </div>
                                        </div>

                                        <div className="flex items-start gap-2">
                                          <User className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                                          <div>
                                            <div className="font-medium">Salesman</div>
                                            <div className="text-muted-foreground">{schedule.salesmanName}</div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </PopoverContent>
                                </Popover>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </Card>
            ))}
          </div>
        </>
      ) : (
        /* List View */
        <div className="space-y-2">
          {filteredManagers.map((pm) => (
            <Card key={pm.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">{pm.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{pm.state}</p>
                  </div>
                  <Badge className={isPMBusyToday(pm) ? "bg-orange-500" : "bg-green-500"}>
                    {isPMBusyToday(pm) ? "Busy" : "Available"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2">
                  {pm.schedules
                    .filter((s) => {
                      const scheduleDate = new Date(s.date);
                      const weekEnd = new Date(currentWeekStart);
                      weekEnd.setDate(currentWeekStart.getDate() + 6);
                      return scheduleDate >= currentWeekStart && scheduleDate <= weekEnd;
                    })
                    .map((schedule) => {
                      const statusBadge = getApprovalStatusBadge(schedule.approvalStatus);
                      return (
                        <div
                          key={schedule.id}
                          className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex-1">
                            <div className="font-medium">{schedule.topic}</div>
                            <div className="text-sm text-muted-foreground">
                              {schedule.schoolName} • {schedule.city}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {new Date(schedule.date).toLocaleDateString()} • {schedule.startTime} - {schedule.endTime}
                            </div>
                          </div>
                          <Badge className={`${statusBadge.color} text-white`}>
                            {statusBadge.label}
                          </Badge>
                        </div>
                      );
                    })}
                  {pm.schedules.filter((s) => {
                    const scheduleDate = new Date(s.date);
                    const weekEnd = new Date(currentWeekStart);
                    weekEnd.setDate(currentWeekStart.getDate() + 6);
                    return scheduleDate >= currentWeekStart && scheduleDate <= weekEnd;
                  }).length === 0 && (
                    <div className="text-center py-4 text-muted-foreground text-sm">
                      No schedules this week
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {filteredManagers.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Calendar className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-semibold mb-2">No Managers Found</h3>
            <p className="text-muted-foreground">
              Adjust your filters to see product managers
            </p>
          </CardContent>
        </Card>
      )}
    </PageContainer>
  );
}
