"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { School, Users, BookOpen, MapPin, Phone, Calendar, Clock, User, ArrowLeft } from "lucide-react";
import PageContainer from "@/components/layouts/PageContainer";
import PageHeader from "@/components/layouts/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

// ─── Mock data ────────────────────────────────────────────────────────────────

const schoolVisits = [
  { id: 1, date: "2025-11-26", time: "10:00 AM", day: "Tuesday", schoolName: "Delhi Public School", schoolCity: "Delhi", board: "CBSE", strength: 2500, contactPerson: "Dr. Rajesh Kumar", contactNo: "+91 9876543210", supplyThrough: "Direct", specimenGiven: "Yes", specimenRequired: "Mathematics Class 10, Science Class 10", schoolComment: "Interested in new Math series", yourComment: "Principal very cooperative" },
  { id: 2, date: "2025-11-27", time: "11:30 AM", day: "Wednesday", schoolName: "St. Xavier's High School", schoolCity: "Mumbai", board: "ICSE", strength: 1800, contactPerson: "Ms. Priya Sharma", contactNo: "+91 9876543211", supplyThrough: "Book Seller", specimenGiven: "No", specimenRequired: "English Class 9, Hindi Class 9", schoolComment: "Looking for competitive pricing", yourComment: "Follow up needed for pricing" },
  { id: 3, date: "2025-11-28", time: "02:00 PM", day: "Thursday", schoolName: "Modern School", schoolCity: "Bangalore", board: "CBSE", strength: 2200, contactPerson: "Mr. Suresh Reddy", contactNo: "+91 9876543215", supplyThrough: "Direct", specimenGiven: "Yes", specimenRequired: "All subjects Class 6-8", schoolComment: "Bulk order expected", yourComment: "Great opportunity" },
  { id: 4, date: "2025-11-29", time: "09:30 AM", day: "Friday", schoolName: "Ryan International School", schoolCity: "Pune", board: "CBSE", strength: 3000, contactPerson: "Dr. Ashok Gupta", contactNo: "+91 9876543216", supplyThrough: "Book Seller", specimenGiven: "Yes", specimenRequired: "Science Class 11, 12", schoolComment: "Payment terms to be discussed", yourComment: "Large school, good potential" },
  { id: 5, date: "2025-12-02", time: "10:30 AM", day: "Monday", schoolName: "DAV Public School", schoolCity: "Chennai", board: "CBSE", strength: 1600, contactPerson: "Ms. Anjali Singh", contactNo: "+91 9876543219", supplyThrough: "Direct", specimenGiven: "No", specimenRequired: "Social Studies Class 9, 10", schoolComment: "Need samples urgently", yourComment: "Priority visit" },
];

const booksellerVisits = [
  { id: 1, date: "2025-11-26", time: "03:00 PM", day: "Tuesday", name: "Sharma Book Depot", contactNo: "+91 9876543230", email: "sharma@bookdepot.com", address: "123, Main Market, Connaught Place", city: "Delhi", purpose: "Payment Collection", paymentGL: "₹25,000", paymentVP: "₹20,000", remarks: "Pending payment for last quarter" },
  { id: 2, date: "2025-11-28", time: "11:00 AM", day: "Thursday", name: "Modern Book House", contactNo: "+91 9876543231", email: "modern@bookhouse.com", address: "45, Station Road, Andheri West", city: "Mumbai", purpose: "Relationship Building", paymentGL: "₹15,000", paymentVP: "₹17,000", remarks: "Good relationship, regular orders" },
  { id: 3, date: "2025-12-01", time: "02:30 PM", day: "Sunday", name: "Academic Publishers", contactNo: "+91 9876543232", email: "academic@publishers.com", address: "78, MG Road, Koramangala", city: "Bangalore", purpose: "Order Follow-up", paymentGL: "₹40,000", paymentVP: "₹38,000", remarks: "Large order placed, tracking delivery" },
  { id: 4, date: "2025-12-03", time: "10:00 AM", day: "Tuesday", name: "Student Corner", contactNo: "+91 9876543233", email: "student@corner.com", address: "12, FC Road, Deccan", city: "Pune", purpose: "Payment Collection", paymentGL: "₹65,000", paymentVP: "₹60,000", remarks: "Outstanding payment overdue" },
  { id: 5, date: "2025-12-06", time: "04:00 PM", day: "Friday", name: "Education Books & Stationery", contactNo: "+91 9876543234", email: "education@books.com", address: "34, T. Nagar Main Road", city: "Chennai", purpose: "New Product Introduction", paymentGL: "₹28,000", paymentVP: "₹28,000", remarks: "Interested in new arrivals" },
];

const qbVisits = [
  { id: 1, date: "2025-11-27", schoolName: "Brilliant Coaching Classes", board: "CBSE", subject: "Mathematics, Physics", supplyThrough: "Direct", teacher: "Dr. Amit Patel", contactNo: "+91 9876543240", city: "Delhi" },
  { id: 2, date: "2025-11-29", schoolName: "Excellence Academy", board: "ICSE", subject: "Chemistry, Biology", supplyThrough: "Book Seller", teacher: "Ms. Neha Singh", contactNo: "+91 9876543241", city: "Mumbai" },
  { id: 3, date: "2025-12-02", schoolName: "Career Point Institute", board: "CBSE", subject: "All Science Subjects", supplyThrough: "Direct", teacher: "Mr. Ramesh Gupta", contactNo: "+91 9876543242", city: "Bangalore" },
  { id: 4, date: "2025-12-04", schoolName: "Toppers Academy", board: "State Board", subject: "Mathematics, English", supplyThrough: "Book Seller", teacher: "Dr. Sunita Mehta", contactNo: "+91 9876543243", city: "Pune" },
  { id: 5, date: "2025-12-07", schoolName: "Smart Learning Hub", board: "CBSE", subject: "Physics, Chemistry", supplyThrough: "Direct", teacher: "Mr. Vijay Kumar", contactNo: "+91 9876543244", city: "Chennai" },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

// ─── Mobile card components ───────────────────────────────────────────────────

function SchoolVisitCard({ visit }: { visit: typeof schoolVisits[0] }) {
  return (
    <Card>
      <CardContent className="p-4">
        {/* Header row */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm truncate">{visit.schoolName}</p>
            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
              <MapPin className="h-3 w-3 shrink-0" />
              <span>{visit.schoolCity}</span>
            </div>
          </div>
          <Badge variant="secondary" className="text-xs shrink-0">{visit.board}</Badge>
        </div>

        {/* Date / time row */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
          <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{visit.day}, {formatDate(visit.date)}</span>
          <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{visit.time}</span>
        </div>

        {/* Key info grid */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs mb-3">
          <div>
            <span className="text-muted-foreground">Contact</span>
            <p className="font-medium truncate">{visit.contactPerson}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Phone</span>
            <p className="font-medium">{visit.contactNo}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Supply</span>
            <p className="font-medium">{visit.supplyThrough}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Specimen Given</span>
            <p className="font-medium">{visit.specimenGiven}</p>
          </div>
        </div>

        {/* Comments */}
        <div className="space-y-1.5 text-xs border-t pt-2">
          <div>
            <span className="text-muted-foreground">Specimen Required: </span>
            <span>{visit.specimenRequired}</span>
          </div>
          {visit.yourComment && (
            <div>
              <span className="text-muted-foreground">Your note: </span>
              <span className="italic">{visit.yourComment}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function BooksellerVisitCard({ visit }: { visit: typeof booksellerVisits[0] }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm truncate">{visit.name}</p>
            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
              <MapPin className="h-3 w-3 shrink-0" />
              <span>{visit.city}</span>
            </div>
          </div>
          <Badge variant="outline" className="text-xs shrink-0">{visit.purpose}</Badge>
        </div>

        <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
          <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{visit.day}, {formatDate(visit.date)}</span>
          <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{visit.time}</span>
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs mb-3">
          <div>
            <span className="text-muted-foreground">Contact</span>
            <p className="font-medium">{visit.contactNo}</p>
          </div>
          <div>
            <span className="text-muted-foreground">GL Payment</span>
            <p className="font-medium text-primary">{visit.paymentGL}</p>
          </div>
          <div>
            <span className="text-muted-foreground">VP Payment</span>
            <p className="font-medium text-primary">{visit.paymentVP}</p>
          </div>
        </div>

        {visit.remarks && (
          <div className="text-xs border-t pt-2">
            <span className="text-muted-foreground">Remarks: </span>
            <span>{visit.remarks}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function QBVisitCard({ visit }: { visit: typeof qbVisits[0] }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm truncate">{visit.schoolName}</p>
            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
              <MapPin className="h-3 w-3 shrink-0" />
              <span>{visit.city}</span>
            </div>
          </div>
          <Badge variant="secondary" className="text-xs shrink-0">{visit.board}</Badge>
        </div>

        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
          <Calendar className="h-3 w-3" />
          <span>{formatDate(visit.date)}</span>
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
          <div>
            <span className="text-muted-foreground">Teacher</span>
            <p className="font-medium truncate">{visit.teacher}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Contact</span>
            <p className="font-medium">{visit.contactNo}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Subject</span>
            <p className="font-medium">{visit.subject}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Supply</span>
            <p className="font-medium">{visit.supplyThrough}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

type TabId = "schools" | "booksellers" | "qb";

const TABS: { id: TabId; label: string; count: number; icon: React.ElementType }[] = [
  { id: "schools", label: "Schools", count: schoolVisits.length, icon: School },
  { id: "booksellers", label: "Sellers", count: booksellerVisits.length, icon: Users },
  { id: "qb", label: "QBs", count: qbVisits.length, icon: BookOpen },
];

export default function NextVisitsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabId>("schools");

  return (
    <PageContainer>
      {/* Back button — mobile */}
      <div className="md:hidden mb-2">
        <Button variant="ghost" size="sm" onClick={() => router.back()} className="-ml-2">
          <ArrowLeft className="h-4 w-4 mr-1.5" />
          Back
        </Button>
      </div>
      <PageHeader
        title="Scheduled Visits"
        description="Manage your upcoming visits"
      />

      {/* Pill tab bar — same style as Add Visit page */}
      <div className="flex rounded-2xl bg-muted p-1 mb-5 gap-1">
        {TABS.map(({ id, label, count, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2 px-2 text-xs font-semibold transition-all duration-150 ${activeTab === id
                ? "bg-background text-primary shadow-sm"
                : "text-muted-foreground hover:text-foreground"
              }`}
          >
            <Icon className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{label} ({count})</span>
          </button>
        ))}
      </div>

      {/* ── School Visits ── */}
      {activeTab === "schools" && (
        <>
          {/* Mobile cards */}
          <div className="space-y-3 md:hidden">
            {schoolVisits.map((v) => <SchoolVisitCard key={v.id} visit={v} />)}
          </div>

          {/* Desktop table */}
          <Card className="hidden md:block">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">#</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Day</TableHead>
                      <TableHead>School Name</TableHead>
                      <TableHead>City</TableHead>
                      <TableHead>Board</TableHead>
                      <TableHead>Strength</TableHead>
                      <TableHead>Contact Person</TableHead>
                      <TableHead>Contact No.</TableHead>
                      <TableHead>Supply Through</TableHead>
                      <TableHead>Specimen Given</TableHead>
                      <TableHead className="min-w-[180px]">Specimen Required</TableHead>
                      <TableHead className="min-w-[180px]">School Comment</TableHead>
                      <TableHead className="min-w-[180px]">Your Comment</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {schoolVisits.map((v) => (
                      <TableRow key={v.id}>
                        <TableCell className="font-medium">{v.id}</TableCell>
                        <TableCell>{formatDate(v.date)}</TableCell>
                        <TableCell>{v.time}</TableCell>
                        <TableCell>{v.day}</TableCell>
                        <TableCell className="font-medium">{v.schoolName}</TableCell>
                        <TableCell>{v.schoolCity}</TableCell>
                        <TableCell>{v.board}</TableCell>
                        <TableCell>{v.strength}</TableCell>
                        <TableCell>{v.contactPerson}</TableCell>
                        <TableCell>{v.contactNo}</TableCell>
                        <TableCell>{v.supplyThrough}</TableCell>
                        <TableCell>{v.specimenGiven}</TableCell>
                        <TableCell>{v.specimenRequired}</TableCell>
                        <TableCell>{v.schoolComment}</TableCell>
                        <TableCell>{v.yourComment}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* ── Bookseller Visits ── */}
      {activeTab === "booksellers" && (
        <>
          {/* Mobile cards */}
          <div className="space-y-3 md:hidden">
            {booksellerVisits.map((v) => <BooksellerVisitCard key={v.id} visit={v} />)}
          </div>

          {/* Desktop table */}
          <Card className="hidden md:block">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">#</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Day</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Contact No.</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead className="min-w-[180px]">Address</TableHead>
                      <TableHead>City</TableHead>
                      <TableHead>Purpose</TableHead>
                      <TableHead>Payment GL</TableHead>
                      <TableHead>Payment VP</TableHead>
                      <TableHead className="min-w-[180px]">Remarks</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {booksellerVisits.map((v) => (
                      <TableRow key={v.id}>
                        <TableCell className="font-medium">{v.id}</TableCell>
                        <TableCell>{formatDate(v.date)}</TableCell>
                        <TableCell>{v.time}</TableCell>
                        <TableCell>{v.day}</TableCell>
                        <TableCell className="font-medium">{v.name}</TableCell>
                        <TableCell>{v.contactNo}</TableCell>
                        <TableCell>{v.email}</TableCell>
                        <TableCell>{v.address}</TableCell>
                        <TableCell>{v.city}</TableCell>
                        <TableCell>{v.purpose}</TableCell>
                        <TableCell>{v.paymentGL}</TableCell>
                        <TableCell>{v.paymentVP}</TableCell>
                        <TableCell>{v.remarks}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* ── QB Visits ── */}
      {activeTab === "qb" && (
        <>
          {/* Mobile cards */}
          <div className="space-y-3 md:hidden">
            {qbVisits.map((v) => <QBVisitCard key={v.id} visit={v} />)}
          </div>

          {/* Desktop table */}
          <Card className="hidden md:block">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">#</TableHead>
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
                    {qbVisits.map((v) => (
                      <TableRow key={v.id}>
                        <TableCell className="font-medium">{v.id}</TableCell>
                        <TableCell>{formatDate(v.date)}</TableCell>
                        <TableCell className="font-medium">{v.schoolName}</TableCell>
                        <TableCell>{v.board}</TableCell>
                        <TableCell>{v.subject}</TableCell>
                        <TableCell>{v.supplyThrough}</TableCell>
                        <TableCell>{v.teacher}</TableCell>
                        <TableCell>{v.contactNo}</TableCell>
                        <TableCell>{v.city}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </PageContainer>
  );
}
