"use client";

import { useState } from "react";
import { Calendar, Download, Filter } from "lucide-react";
import PageContainer from "@/components/layouts/PageContainer";
import PageHeader from "@/components/layouts/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";

interface DateWiseReport {
  salesmanId: string;
  salesmanName: string;
  totalVisits: number;
  state: string;
  schoolVisits: number;
  booksellerVisits: number;
}

export default function DateWiseReportPage() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [stateFilter, setStateFilter] = useState("all");

  // Mock date-wise report data
  const reportData: DateWiseReport[] = [
    {
      salesmanId: "SM001",
      salesmanName: "Rahul Sharma",
      totalVisits: 15,
      state: "Delhi",
      schoolVisits: 10,
      booksellerVisits: 5,
    },
    {
      salesmanId: "SM002",
      salesmanName: "Priya Singh",
      totalVisits: 12,
      state: "Delhi",
      schoolVisits: 8,
      booksellerVisits: 4,
    },
    {
      salesmanId: "SM005",
      salesmanName: "Amit Kumar",
      totalVisits: 18,
      state: "Maharashtra",
      schoolVisits: 13,
      booksellerVisits: 5,
    },
    {
      salesmanId: "SM003",
      salesmanName: "Neha Gupta",
      totalVisits: 10,
      state: "Gujarat",
      schoolVisits: 7,
      booksellerVisits: 3,
    },
    {
      salesmanId: "SM004",
      salesmanName: "Vikram Patel",
      totalVisits: 14,
      state: "Maharashtra",
      schoolVisits: 9,
      booksellerVisits: 5,
    },
  ];

  const filteredData = reportData.filter((record) => {
    const matchesState = stateFilter === "all" || record.state === stateFilter;
    return matchesState;
  });

  const handleExport = () => {
    toast.success("Exporting date-wise report...");
    // In real app, generate Excel/CSV file
  };

  const totalVisitsSum = filteredData.reduce((sum, record) => sum + record.totalVisits, 0);
  const totalSchoolVisits = filteredData.reduce((sum, record) => sum + record.schoolVisits, 0);
  const totalBooksellerVisits = filteredData.reduce((sum, record) => sum + record.booksellerVisits, 0);

  return (
    <PageContainer>
      <div className="space-y-6">
        <PageHeader
          title="Date-wise Report"
          description="Aggregated visit report by salesman"
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
                <Label htmlFor="state">State</Label>
                <Select value={stateFilter} onValueChange={setStateFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All States" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All States</SelectItem>
                    <SelectItem value="Delhi">Delhi</SelectItem>
                    <SelectItem value="Maharashtra">Maharashtra</SelectItem>
                    <SelectItem value="Gujarat">Gujarat</SelectItem>
                    <SelectItem value="Karnataka">Karnataka</SelectItem>
                    <SelectItem value="Rajasthan">Rajasthan</SelectItem>
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

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-1">Total Visits</p>
                <p className="text-3xl font-bold text-primary">{totalVisitsSum}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-1">School Visits</p>
                <p className="text-3xl font-bold text-blue-600">{totalSchoolVisits}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-1">Bookseller Visits</p>
                <p className="text-3xl font-bold text-green-600">{totalBooksellerVisits}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {filteredData.length} salesmen
          </p>
        </div>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">Sr. No.</TableHead>
                    <TableHead>Salesman ID</TableHead>
                    <TableHead>Salesman Name</TableHead>
                    <TableHead className="text-center">Total Visits</TableHead>
                    <TableHead className="text-center">School Visits</TableHead>
                    <TableHead className="text-center">Bookseller Visits</TableHead>
                    <TableHead>State</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No records found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredData.map((record, index) => (
                      <TableRow key={record.salesmanId}>
                        <TableCell className="font-medium">{index + 1}</TableCell>
                        <TableCell>{record.salesmanId}</TableCell>
                        <TableCell className="font-medium">{record.salesmanName}</TableCell>
                        <TableCell className="text-center">
                          <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary font-semibold">
                            {record.totalVisits}
                          </span>
                        </TableCell>
                        <TableCell className="text-center text-muted-foreground">
                          {record.schoolVisits}
                        </TableCell>
                        <TableCell className="text-center text-muted-foreground">
                          {record.booksellerVisits}
                        </TableCell>
                        <TableCell>{record.state}</TableCell>
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
