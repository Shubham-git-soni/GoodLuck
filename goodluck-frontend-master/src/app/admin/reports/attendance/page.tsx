"use client";

import { useState } from "react";
import { Calendar, Download, Filter, Clock } from "lucide-react";
import PageContainer from "@/components/layouts/PageContainer";
import PageHeader from "@/components/layouts/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";

interface AttendanceRecord {
  id: string;
  salesmanId: string;
  salesmanName: string;
  date: string;
  checkIn: string;
  checkOut: string | null;
  status: "Present" | "Absent" | "Half Day" | "On Leave";
  workingHours: string;
}

export default function AttendanceReportPage() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Mock attendance data
  const attendanceData: AttendanceRecord[] = [
    {
      id: "ATT001",
      salesmanId: "SM001",
      salesmanName: "Rahul Sharma",
      date: "2025-11-27",
      checkIn: "09:15 AM",
      checkOut: "06:30 PM",
      status: "Present",
      workingHours: "9h 15m",
    },
    {
      id: "ATT002",
      salesmanId: "SM002",
      salesmanName: "Priya Singh",
      date: "2025-11-27",
      checkIn: "09:00 AM",
      checkOut: "06:00 PM",
      status: "Present",
      workingHours: "9h 00m",
    },
    {
      id: "ATT003",
      salesmanId: "SM005",
      salesmanName: "Amit Kumar",
      date: "2025-11-27",
      checkIn: "09:30 AM",
      checkOut: "01:30 PM",
      status: "Half Day",
      workingHours: "4h 00m",
    },
    {
      id: "ATT004",
      salesmanId: "SM001",
      salesmanName: "Rahul Sharma",
      date: "2025-11-26",
      checkIn: "09:10 AM",
      checkOut: "06:45 PM",
      status: "Present",
      workingHours: "9h 35m",
    },
    {
      id: "ATT005",
      salesmanId: "SM002",
      salesmanName: "Priya Singh",
      date: "2025-11-26",
      checkIn: "-",
      checkOut: "-",
      status: "On Leave",
      workingHours: "-",
    },
  ];

  const filteredData = attendanceData.filter((record) => {
    const matchesStatus = statusFilter === "all" || record.status === statusFilter;
    const matchesDateRange =
      (!startDate || record.date >= startDate) && (!endDate || record.date <= endDate);
    return matchesStatus && matchesDateRange;
  });

  const handleExport = () => {
    toast.success("Exporting attendance report...");
    // In real app, generate Excel/CSV file
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "destructive" | "secondary" | "outline"> = {
      Present: "default",
      Absent: "destructive",
      "Half Day": "secondary",
      "On Leave": "outline",
    };
    return <Badge variant={variants[status] || "default"}>{status}</Badge>;
  };

  return (
    <PageContainer>
      <div className="space-y-6">
        <PageHeader
          title="Attendance Report"
          description="Track salesman attendance and working hours"
        />

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="Present">Present</SelectItem>
                    <SelectItem value="Absent">Absent</SelectItem>
                    <SelectItem value="Half Day">Half Day</SelectItem>
                    <SelectItem value="On Leave">On Leave</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>&nbsp;</Label>
                <Button onClick={handleExport} className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Count */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {filteredData.length} records
          </p>
        </div>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[60px]">Sr.</TableHead>
                    <TableHead>Salesman ID</TableHead>
                    <TableHead>Salesman Name</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Check In</TableHead>
                    <TableHead>Check Out</TableHead>
                    <TableHead>Working Hours</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        No attendance records found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredData.map((record, index) => (
                      <TableRow key={record.id}>
                        <TableCell className="font-medium">{index + 1}</TableCell>
                        <TableCell>{record.salesmanId}</TableCell>
                        <TableCell>{record.salesmanName}</TableCell>
                        <TableCell>
                          {new Date(record.date).toLocaleDateString("en-US", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </TableCell>
                        <TableCell>{record.checkIn}</TableCell>
                        <TableCell>{record.checkOut || "-"}</TableCell>
                        <TableCell>{record.workingHours}</TableCell>
                        <TableCell>{getStatusBadge(record.status)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
