"use client";

import { useState } from "react";
import { Download, Calendar } from "lucide-react";
import PageContainer from "@/components/layouts/PageContainer";
import PageHeader from "@/components/layouts/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";

interface DailyVisitReport {
  srNo: number; // Serial Number
  salesman: string;
  visit: string;
  dateTime: string;
  day: string;
  entity: string; // School/Bookseller
  address: string;
  city: string;
  board: string;
  strength: number;
  person: string;
  contact: string;
  email: string;
  st: number; // Specimen Total
  sg: number; // Specimen Given
  sr: number; // Specimen Returned
  pgl: number; // Payment GL
  pvp: number; // Payment VP
  subject: string;
  entityComment: string;
  yourComment: string;
}

export default function DailyReportPage() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);

  // Mock daily visit data
  const dailyData: DailyVisitReport[] = [
    {
      srNo: 1,
      salesman: "Rahul Sharma",
      visit: "School Visit",
      dateTime: "27-11-2025 10:30 AM",
      day: "Wednesday",
      entity: "Delhi Public School",
      address: "Mathura Road, New Delhi",
      city: "Delhi",
      board: "CBSE",
      strength: 2500,
      person: "Dr. Rajesh Sharma",
      contact: "+91 11 2634 5678",
      email: "principal@dps.edu",
      st: 15,
      sg: 10,
      sr: 5,
      pgl: 0,
      pvp: 0,
      subject: "Mathematics, Science",
      entityComment: "Interested in new textbooks for Class 10",
      yourComment: "Follow up required next month",
    },
    {
      srNo: 2,
      salesman: "Priya Singh",
      visit: "Bookseller Visit",
      dateTime: "27-11-2025 02:15 PM",
      day: "Wednesday",
      entity: "Books & More",
      address: "Connaught Place",
      city: "Delhi",
      board: "-",
      strength: 0,
      person: "Mr. Anil Kapoor",
      contact: "+91 98765 12345",
      email: "books@more.com",
      st: 0,
      sg: 0,
      sr: 0,
      pgl: 45000,
      pvp: 25000,
      subject: "-",
      entityComment: "Payment pending from last month",
      yourComment: "Collected partial payment, balance next week",
    },
    {
      srNo: 3,
      salesman: "Amit Kumar",
      visit: "School Visit",
      dateTime: "27-11-2025 11:00 AM",
      day: "Wednesday",
      entity: "Ryan International",
      address: "Goregaon West, Mumbai",
      city: "Mumbai",
      board: "CBSE",
      strength: 1800,
      person: "Mrs. Pooja Mehta",
      contact: "+91 22 2876 5432",
      email: "admin@ryan.edu",
      st: 20,
      sg: 15,
      sr: 0,
      pgl: 0,
      pvp: 0,
      subject: "English, Hindi",
      entityComment: "Need sample papers for Board exams",
      yourComment: "Will send samples by Friday",
    },
  ];

  const handleExport = () => {
    toast.success("Exporting daily report...");
    // In real app, generate Excel/CSV file
  };

  return (
    <PageContainer>
      <div className="space-y-6">
        <PageHeader
          title="Daily Report"
          description="Detailed visit report for selected date"
        />

        {/* Date Filter */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 space-y-2">
                <Label htmlFor="date">Select Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>&nbsp;</Label>
                <Button onClick={handleExport} className="w-full sm:w-auto">
                  <Download className="h-4 w-4 mr-2" />
                  Export to Excel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Count */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {dailyData.length} visits on {new Date(selectedDate).toLocaleDateString("en-US", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric"
            })}
          </p>
        </div>

        {/* Table - Horizontal Scroll */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[50px]">Sr.</TableHead>
                    <TableHead className="min-w-[130px]">Salesman</TableHead>
                    <TableHead className="min-w-[120px]">Visit Type</TableHead>
                    <TableHead className="min-w-[150px]">Date Time</TableHead>
                    <TableHead className="min-w-[80px]">Day</TableHead>
                    <TableHead className="min-w-[180px]">School/Bookseller</TableHead>
                    <TableHead className="min-w-[200px]">Address</TableHead>
                    <TableHead className="min-w-[100px]">City</TableHead>
                    <TableHead className="min-w-[80px]">Board</TableHead>
                    <TableHead className="min-w-[90px]">Strength</TableHead>
                    <TableHead className="min-w-[150px]">Person</TableHead>
                    <TableHead className="min-w-[130px]">Contact</TableHead>
                    <TableHead className="min-w-[180px]">Email</TableHead>
                    <TableHead className="min-w-[60px]">S.T</TableHead>
                    <TableHead className="min-w-[60px]">S.G</TableHead>
                    <TableHead className="min-w-[60px]">S.R</TableHead>
                    <TableHead className="min-w-[80px]">P.GL</TableHead>
                    <TableHead className="min-w-[80px]">P.VP</TableHead>
                    <TableHead className="min-w-[150px]">Subject</TableHead>
                    <TableHead className="min-w-[250px]">School/Bookseller Comment</TableHead>
                    <TableHead className="min-w-[250px]">Your Comment</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dailyData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={21} className="text-center py-8 text-muted-foreground">
                        No visits recorded for this date
                      </TableCell>
                    </TableRow>
                  ) : (
                    dailyData.map((record) => (
                      <TableRow key={record.srNo}>
                        <TableCell className="font-medium">{record.srNo}</TableCell>
                        <TableCell>{record.salesman}</TableCell>
                        <TableCell>{record.visit}</TableCell>
                        <TableCell className="whitespace-nowrap">{record.dateTime}</TableCell>
                        <TableCell>{record.day}</TableCell>
                        <TableCell>{record.entity}</TableCell>
                        <TableCell>{record.address}</TableCell>
                        <TableCell>{record.city}</TableCell>
                        <TableCell>{record.board}</TableCell>
                        <TableCell className="text-right">{record.strength || "-"}</TableCell>
                        <TableCell>{record.person}</TableCell>
                        <TableCell>{record.contact}</TableCell>
                        <TableCell>{record.email}</TableCell>
                        <TableCell className="text-right">{record.st || "-"}</TableCell>
                        <TableCell className="text-right">{record.sg || "-"}</TableCell>
                        <TableCell className="text-right">{record.sr || "-"}</TableCell>
                        <TableCell className="text-right">{record.pgl > 0 ? `₹${record.pgl}` : "-"}</TableCell>
                        <TableCell className="text-right">{record.pvp > 0 ? `₹${record.pvp}` : "-"}</TableCell>
                        <TableCell>{record.subject}</TableCell>
                        <TableCell className="max-w-[250px]">
                          <p className="line-clamp-2 text-sm">{record.entityComment}</p>
                        </TableCell>
                        <TableCell className="max-w-[250px]">
                          <p className="line-clamp-2 text-sm">{record.yourComment}</p>
                        </TableCell>
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
