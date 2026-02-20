"use client";

import { useState, useEffect } from "react";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PageSkeleton } from "@/components/ui/skeleton-loaders";

import salesmenData from "@/lib/mock-data/salesmen.json";

// Generate attendance data for the current month
const generateAttendanceData = () => {
  const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const year = 2025;
  const month = 10; // November (0-indexed)
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const attendanceRecords = [];

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const dayOfWeek = daysOfWeek[date.getDay()];
    const dateString = date.toISOString().split("T")[0];

    // Skip Sundays (no work)
    if (date.getDay() === 0) {
      continue;
    }

    // Random chance of absence (10% chance)
    const isPresent = Math.random() > 0.1;

    if (isPresent) {
      // Generate random start time between 8:00 AM and 10:00 AM
      const startHour = 8 + Math.floor(Math.random() * 3);
      const startMinute = Math.floor(Math.random() * 60);
      const startTime = `${String(startHour).padStart(2, "0")}:${String(startMinute).padStart(2, "0")}`;

      // Generate random end time between 5:00 PM and 8:00 PM
      const endHour = 17 + Math.floor(Math.random() * 4);
      const endMinute = Math.floor(Math.random() * 60);
      const endTime = `${String(endHour).padStart(2, "0")}:${String(endMinute).padStart(2, "0")}`;

      // Calculate working hours
      const startDate = new Date(`2000-01-01T${startTime}`);
      const endDate = new Date(`2000-01-01T${endTime}`);
      const workingHours = ((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60)).toFixed(1);

      attendanceRecords.push({
        srNo: attendanceRecords.length + 1,
        day: dayOfWeek,
        date: dateString,
        startTime,
        endTime,
        workingHours: parseFloat(workingHours),
        status: "Present",
      });
    } else {
      attendanceRecords.push({
        srNo: attendanceRecords.length + 1,
        day: dayOfWeek,
        date: dateString,
        startTime: "-",
        endTime: "-",
        workingHours: 0,
        status: "Absent",
      });
    }
  }

  return attendanceRecords;
};

export default function AttendanceReportPage() {
  const params = useParams();
  const salesmanId = params.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [salesman, setSalesman] = useState<any>(null);
  const [attendanceData, setAttendanceData] = useState<any[]>([]);
  const [filteredData, setFilteredData] = useState<any[]>([]);

  // Filters
  const [monthFilter, setMonthFilter] = useState("2025-11");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    setTimeout(() => {
      const foundSalesman = salesmenData.find((s) => s.id === salesmanId);
      if (foundSalesman) {
        setSalesman(foundSalesman);

        // Generate attendance data
        const attendance = generateAttendanceData();
        setAttendanceData(attendance);
        setFilteredData(attendance);
      }
      setIsLoading(false);
    }, 500);
  }, [salesmanId]);

  // Apply filters
  useEffect(() => {
    let filtered = [...attendanceData];

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((item) => item.status === statusFilter);
    }

    setFilteredData(filtered);
  }, [statusFilter, attendanceData]);

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
  const totalDays = filteredData.length;
  const presentDays = filteredData.filter((item) => item.status === "Present").length;
  const absentDays = filteredData.filter((item) => item.status === "Absent").length;
  const totalWorkingHours = filteredData.reduce((sum, item) => sum + item.workingHours, 0);
  const avgWorkingHours = presentDays > 0 ? (totalWorkingHours / presentDays).toFixed(1) : 0;
  const attendancePercentage = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;

  return (
    <PageContainer>
      {/* Header */}
      <div className="mb-6">
        <Link href={`/admin/team/${salesmanId}`}>
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
        <PageHeader
          title={`Attendance Report of ${salesman.name}`}
          description={`Monthly attendance tracking for ${salesman.name}`}
        />
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Total Days</p>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold">{totalDays}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Present</p>
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            </div>
            <p className="text-2xl font-bold text-green-600">{presentDays}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Absent</p>
              <XCircle className="h-4 w-4 text-red-500" />
            </div>
            <p className="text-2xl font-bold text-red-600">{absentDays}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Attendance %</p>
            </div>
            <p className="text-2xl font-bold">{attendancePercentage}%</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Avg Hours/Day</p>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold">{avgWorkingHours}h</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters & Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <Select value={monthFilter} onValueChange={setMonthFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Select month" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2025-11">November 2025</SelectItem>
                <SelectItem value="2025-10">October 2025</SelectItem>
                <SelectItem value="2025-09">September 2025</SelectItem>
                <SelectItem value="2025-08">August 2025</SelectItem>
                <SelectItem value="2025-07">July 2025</SelectItem>
                <SelectItem value="2025-06">June 2025</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Present">Present Only</SelectItem>
                <SelectItem value="Absent">Absent Only</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" className="sm:ml-auto">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Attendance Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <CalendarCheck className="h-5 w-5" />
            Attendance Records ({filteredData.length} days)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">Sr. No.</TableHead>
                  <TableHead className="min-w-[120px]">Day</TableHead>
                  <TableHead className="min-w-[120px]">Date</TableHead>
                  <TableHead className="min-w-[120px]">Start Time</TableHead>
                  <TableHead className="min-w-[120px]">End Time</TableHead>
                  <TableHead className="text-right min-w-[120px]">Working Hours</TableHead>
                  <TableHead className="text-center min-w-[100px]">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No attendance records found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredData.map((item) => {
                    const formattedDate = new Date(item.date).toLocaleDateString("en-US", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    });

                    return (
                      <TableRow key={item.srNo}>
                        <TableCell className="font-medium">{item.srNo}</TableCell>
                        <TableCell className="font-medium">{item.day}</TableCell>
                        <TableCell>{formattedDate}</TableCell>
                        <TableCell>
                          {item.startTime !== "-" ? (
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3 text-muted-foreground" />
                              {item.startTime}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {item.endTime !== "-" ? (
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3 text-muted-foreground" />
                              {item.endTime}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {item.workingHours > 0 ? (
                            <Badge variant="outline">{item.workingHours}h</Badge>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge
                            variant={item.status === "Present" ? "default" : "destructive"}
                            className={
                              item.status === "Present"
                                ? "bg-green-500 hover:bg-green-600"
                                : ""
                            }
                          >
                            {item.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* Table Footer Summary */}
          {filteredData.length > 0 && (
            <div className="mt-4 p-4 bg-muted/50 rounded-lg">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Total Days</p>
                  <p className="font-bold text-lg">{totalDays}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Present Days</p>
                  <p className="font-bold text-lg text-green-600">{presentDays}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Absent Days</p>
                  <p className="font-bold text-lg text-red-600">{absentDays}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Attendance Rate</p>
                  <p className="font-bold text-lg">{attendancePercentage}%</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Avg Working Hours</p>
                  <p className="font-bold text-lg">{avgWorkingHours}h</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </PageContainer>
  );
}
