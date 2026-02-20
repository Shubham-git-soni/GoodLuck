"use client";

import { useState } from "react";
import { School, Users, BookOpen } from "lucide-react";
import PageContainer from "@/components/layouts/PageContainer";
import PageHeader from "@/components/layouts/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

// Dummy data for school visits
const schoolVisits = [
  {
    id: 1,
    date: "2025-11-26",
    time: "10:00 AM",
    day: "Tuesday",
    schoolName: "Delhi Public School",
    schoolCity: "Delhi",
    board: "CBSE",
    strength: 2500,
    contactPerson: "Dr. Rajesh Kumar",
    contactNo: "+91 9876543210",
    supplyThrough: "Direct",
    specimenGiven: "Yes",
    specimenRequired: "Mathematics Class 10, Science Class 10",
    schoolComment: "Interested in new Math series",
    yourComment: "Principal very cooperative",
  },
  {
    id: 2,
    date: "2025-11-27",
    time: "11:30 AM",
    day: "Wednesday",
    schoolName: "St. Xavier's High School",
    schoolCity: "Mumbai",
    board: "ICSE",
    strength: 1800,
    contactPerson: "Ms. Priya Sharma",
    contactNo: "+91 9876543211",
    supplyThrough: "Book Seller",
    specimenGiven: "No",
    specimenRequired: "English Class 9, Hindi Class 9",
    schoolComment: "Looking for competitive pricing",
    yourComment: "Follow up needed for pricing",
  },
  {
    id: 3,
    date: "2025-11-28",
    time: "02:00 PM",
    day: "Thursday",
    schoolName: "Modern School",
    city: "Bangalore",
    board: "CBSE",
    strength: 2200,
    contactPerson: "Mr. Suresh Reddy",
    contactNo: "+91 9876543215",
    supplyThrough: "Direct",
    specimenGiven: "Yes",
    specimenRequired: "All subjects Class 6-8",
    schoolComment: "Bulk order expected",
    yourComment: "Great opportunity",
  },
  {
    id: 4,
    date: "2025-11-29",
    time: "09:30 AM",
    day: "Friday",
    schoolName: "Ryan International School",
    schoolCity: "Pune",
    board: "CBSE",
    strength: 3000,
    contactPerson: "Dr. Ashok Gupta",
    contactNo: "+91 9876543216",
    supplyThrough: "Book Seller",
    specimenGiven: "Yes",
    specimenRequired: "Science Class 11, 12",
    schoolComment: "Payment terms to be discussed",
    yourComment: "Large school, good potential",
  },
  {
    id: 5,
    date: "2025-12-02",
    time: "10:30 AM",
    day: "Monday",
    schoolName: "DAV Public School",
    schoolCity: "Chennai",
    board: "CBSE",
    strength: 1600,
    contactPerson: "Ms. Anjali Singh",
    contactNo: "+91 9876543219",
    supplyThrough: "Direct",
    specimenGiven: "No",
    specimenRequired: "Social Studies Class 9, 10",
    schoolComment: "Need samples urgently",
    yourComment: "Priority visit",
  },
];

// Dummy data for bookseller visits
const booksellerVisits = [
  {
    id: 1,
    date: "2025-11-26",
    time: "03:00 PM",
    day: "Tuesday",
    name: "Sharma Book Depot",
    contactNo: "+91 9876543230",
    email: "sharma@bookdepot.com",
    address: "123, Main Market, Connaught Place",
    city: "Delhi",
    purpose: "Payment Collection",
    paymentGL: "₹25,000",
    paymentVP: "₹20,000",
    remarks: "Pending payment for last quarter",
  },
  {
    id: 2,
    date: "2025-11-28",
    time: "11:00 AM",
    day: "Thursday",
    name: "Modern Book House",
    contactNo: "+91 9876543231",
    email: "modern@bookhouse.com",
    address: "45, Station Road, Andheri West",
    city: "Mumbai",
    purpose: "Relationship Building",
    paymentGL: "₹15,000",
    paymentVP: "₹17,000",
    remarks: "Good relationship, regular orders",
  },
  {
    id: 3,
    date: "2025-12-01",
    time: "02:30 PM",
    day: "Sunday",
    name: "Academic Publishers",
    contactNo: "+91 9876543232",
    email: "academic@publishers.com",
    address: "78, MG Road, Koramangala",
    city: "Bangalore",
    purpose: "Order Follow-up",
    paymentGL: "₹40,000",
    paymentVP: "₹38,000",
    remarks: "Large order placed, tracking delivery",
  },
  {
    id: 4,
    date: "2025-12-03",
    time: "10:00 AM",
    day: "Tuesday",
    name: "Student Corner",
    contactNo: "+91 9876543233",
    email: "student@corner.com",
    address: "12, FC Road, Deccan",
    city: "Pune",
    purpose: "Payment Collection",
    paymentGL: "₹65,000",
    paymentVP: "₹60,000",
    remarks: "Outstanding payment overdue",
  },
  {
    id: 5,
    date: "2025-12-06",
    time: "04:00 PM",
    day: "Friday",
    name: "Education Books & Stationery",
    contactNo: "+91 9876543234",
    email: "education@books.com",
    address: "34, T. Nagar Main Road",
    city: "Chennai",
    purpose: "New Product Introduction",
    paymentGL: "₹28,000",
    paymentVP: "₹28,000",
    remarks: "Interested in new arrivals",
  },
];

// Dummy data for QB visits
const qbVisits = [
  {
    id: 1,
    date: "2025-11-27",
    schoolName: "Brilliant Coaching Classes",
    board: "CBSE",
    subject: "Mathematics, Physics",
    supplyThrough: "Direct",
    teacher: "Dr. Amit Patel",
    contactNo: "+91 9876543240",
    city: "Delhi",
  },
  {
    id: 2,
    date: "2025-11-29",
    schoolName: "Excellence Academy",
    board: "ICSE",
    subject: "Chemistry, Biology",
    supplyThrough: "Book Seller",
    teacher: "Ms. Neha Singh",
    contactNo: "+91 9876543241",
    city: "Mumbai",
  },
  {
    id: 3,
    date: "2025-12-02",
    schoolName: "Career Point Institute",
    board: "CBSE",
    subject: "All Science Subjects",
    supplyThrough: "Direct",
    teacher: "Mr. Ramesh Gupta",
    contactNo: "+91 9876543242",
    city: "Bangalore",
  },
  {
    id: 4,
    date: "2025-12-04",
    schoolName: "Toppers Academy",
    board: "State Board",
    subject: "Mathematics, English",
    supplyThrough: "Book Seller",
    teacher: "Dr. Sunita Mehta",
    contactNo: "+91 9876543243",
    city: "Pune",
  },
  {
    id: 5,
    date: "2025-12-07",
    schoolName: "Smart Learning Hub",
    board: "CBSE",
    subject: "Physics, Chemistry",
    supplyThrough: "Direct",
    teacher: "Mr. Vijay Kumar",
    contactNo: "+91 9876543244",
    city: "Chennai",
  },
];

export default function NextVisitsPage() {
  const [activeTab, setActiveTab] = useState("schools");

  return (
    <PageContainer>
      <PageHeader
        title="Scheduled Visits"
        description="Manage your upcoming visits"
      />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="schools">
            <School className="h-4 w-4 mr-2" />
            School Visits ({schoolVisits.length})
          </TabsTrigger>
          <TabsTrigger value="booksellers">
            <Users className="h-4 w-4 mr-2" />
            Bookseller Visits ({booksellerVisits.length})
          </TabsTrigger>
          <TabsTrigger value="qb">
            <BookOpen className="h-4 w-4 mr-2" />
            QB Visits ({qbVisits.length})
          </TabsTrigger>
        </TabsList>

        {/* School Visits Tab */}
        <TabsContent value="schools">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16">Sr. No.</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Day</TableHead>
                      <TableHead>School Name</TableHead>
                      <TableHead>School City</TableHead>
                      <TableHead>Board</TableHead>
                      <TableHead>Strength</TableHead>
                      <TableHead>Contact Person</TableHead>
                      <TableHead>Contact No.</TableHead>
                      <TableHead>Supply Through</TableHead>
                      <TableHead>Specimen Given</TableHead>
                      <TableHead className="min-w-[200px]">Specimen Required</TableHead>
                      <TableHead className="min-w-[200px]">School Comment</TableHead>
                      <TableHead className="min-w-[200px]">Your Comment</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {schoolVisits.map((visit) => (
                      <TableRow key={visit.id}>
                        <TableCell className="font-medium">{visit.id}</TableCell>
                        <TableCell>{new Date(visit.date).toLocaleDateString()}</TableCell>
                        <TableCell>{visit.time}</TableCell>
                        <TableCell>{visit.day}</TableCell>
                        <TableCell className="font-medium">{visit.schoolName}</TableCell>
                        <TableCell>{visit.schoolCity}</TableCell>
                        <TableCell>{visit.board}</TableCell>
                        <TableCell>{visit.strength}</TableCell>
                        <TableCell>{visit.contactPerson}</TableCell>
                        <TableCell>{visit.contactNo}</TableCell>
                        <TableCell>{visit.supplyThrough}</TableCell>
                        <TableCell>{visit.specimenGiven}</TableCell>
                        <TableCell>{visit.specimenRequired}</TableCell>
                        <TableCell>{visit.schoolComment}</TableCell>
                        <TableCell>{visit.yourComment}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Bookseller Visits Tab */}
        <TabsContent value="booksellers">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16">Sr. No.</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Day</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Contact No.</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead className="min-w-[200px]">Address</TableHead>
                      <TableHead>City</TableHead>
                      <TableHead>Purpose</TableHead>
                      <TableHead>Payment GL</TableHead>
                      <TableHead>Payment VP</TableHead>
                      <TableHead className="min-w-[200px]">Remarks</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {booksellerVisits.map((visit) => (
                      <TableRow key={visit.id}>
                        <TableCell className="font-medium">{visit.id}</TableCell>
                        <TableCell>{new Date(visit.date).toLocaleDateString()}</TableCell>
                        <TableCell>{visit.time}</TableCell>
                        <TableCell>{visit.day}</TableCell>
                        <TableCell className="font-medium">{visit.name}</TableCell>
                        <TableCell>{visit.contactNo}</TableCell>
                        <TableCell>{visit.email}</TableCell>
                        <TableCell>{visit.address}</TableCell>
                        <TableCell>{visit.city}</TableCell>
                        <TableCell>{visit.purpose}</TableCell>
                        <TableCell>{visit.paymentGL}</TableCell>
                        <TableCell>{visit.paymentVP}</TableCell>
                        <TableCell>{visit.remarks}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* QB Visits Tab */}
        <TabsContent value="qb">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16">Sr. No.</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>School Name</TableHead>
                      <TableHead>Board</TableHead>
                      <TableHead className="min-w-[150px]">Subject</TableHead>
                      <TableHead>Supply Through</TableHead>
                      <TableHead>Teacher</TableHead>
                      <TableHead>Contact No.</TableHead>
                      <TableHead>City</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {qbVisits.map((visit) => (
                      <TableRow key={visit.id}>
                        <TableCell className="font-medium">{visit.id}</TableCell>
                        <TableCell>{new Date(visit.date).toLocaleDateString()}</TableCell>
                        <TableCell className="font-medium">{visit.schoolName}</TableCell>
                        <TableCell>{visit.board}</TableCell>
                        <TableCell>{visit.subject}</TableCell>
                        <TableCell>{visit.supplyThrough}</TableCell>
                        <TableCell>{visit.teacher}</TableCell>
                        <TableCell>{visit.contactNo}</TableCell>
                        <TableCell>{visit.city}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}
