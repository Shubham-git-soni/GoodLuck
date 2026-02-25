"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  School, Users, MapPin, Calendar, Clock, ArrowLeft,
  Search, Download, X,
} from "lucide-react";
import PageContainer from "@/components/layouts/PageContainer";
import PageHeader from "@/components/layouts/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

// ─── Mock data ────────────────────────────────────────────────────────────────

const schoolVisits = [
  {
    id: 1,
    date: "2025-11-15",
    time: "10:00 AM",
    day: "Friday",
    jointWorking: "Amit Sharma (Regional Manager)",
    schoolName: "Delhi Public School",
    purpose: "Need Mapping, Specimen Distribution",
    schoolCity: "Delhi",
    board: "CBSE",
    strength: 2500,
    contactPerson: "Dr. Rajesh Sharma",
    contactNo: "+91 11 2634 5678",
    supplyThrough: "Direct",
    specimenGiven: "Mathematics Class X (×5), Science Class X (×4)",
    specimenRequired: "Social Studies Class 10, English Class 9",
    schoolComment: "Interested in new Science series",
    yourComment: "Principal very cooperative, follow up next month",
  },
  {
    id: 2,
    date: "2025-11-18",
    time: "11:30 AM",
    day: "Monday",
    jointWorking: "—",
    schoolName: "Ryan International School",
    purpose: "Post-Sales Engagement, Relationship Building",
    schoolCity: "Mumbai",
    board: "CBSE",
    strength: 1800,
    contactPerson: "Mrs. Pooja Mehta",
    contactNo: "+91 22 2876 5432",
    supplyThrough: "Book Seller",
    specimenGiven: "Mathematics Class VIII (×3)",
    specimenRequired: "English Class 9, Hindi Class 9",
    schoolComment: "Looking for competitive pricing",
    yourComment: "Needs pricing discussion on next visit",
  },
  {
    id: 3,
    date: "2025-11-10",
    time: "09:30 AM",
    day: "Sunday",
    jointWorking: "Amit Sharma (Regional Manager)",
    schoolName: "DAV Public School",
    purpose: "Specimen Distribution, Need Mapping",
    schoolCity: "Delhi",
    board: "CBSE",
    strength: 1600,
    contactPerson: "Dr. Ramesh Chand",
    contactNo: "+91 11 2500 1234",
    supplyThrough: "Direct",
    specimenGiven: "Physics Class XII (×6), Chemistry Class XII (×6), Mathematics Part I (×5)",
    specimenRequired: "Biology Class 12",
    schoolComment: "Request to add more practical examples in Physics",
    yourComment: "Large potential, needs follow up in January",
  },
  {
    id: 4,
    date: "2025-11-05",
    time: "02:00 PM",
    day: "Wednesday",
    jointWorking: "—",
    schoolName: "Oakridge International School",
    purpose: "Relationship Building, Specimen Distribution",
    schoolCity: "Bangalore",
    board: "IGCSE",
    strength: 1200,
    contactPerson: "Ms. Sarah Williams",
    contactNo: "+91 80 4567 8901",
    supplyThrough: "Direct",
    specimenGiven: "English Class XI (×4)",
    specimenRequired: "Mathematics Class 11, 12",
    schoolComment: "Good engagement, open to new titles",
    yourComment: "Positive visit, schedule need mapping next",
  },
  {
    id: 5,
    date: "2025-11-20",
    time: "03:30 PM",
    day: "Thursday",
    jointWorking: "—",
    schoolName: "Cathedral School",
    purpose: "Need Mapping, Post-Sales Engagement",
    schoolCity: "Mumbai",
    board: "ICSE",
    strength: 2000,
    contactPerson: "Mrs. Linda Fernandes",
    contactNo: "+91 22 6789 0123",
    supplyThrough: "Book Seller",
    specimenGiven: "English Class IX (×5), ICSE Mathematics Class IX (×5)",
    specimenRequired: "History Class 10",
    schoolComment: "High-quality content well received",
    yourComment: "Strong follow up needed for conversion",
  },
];

const booksellerVisits = [
  {
    id: 1,
    date: "2025-11-19",
    time: "03:00 PM",
    day: "Wednesday",
    jointWorking: "—",
    name: "Academic Books Pvt Ltd",
    contactNo: "+91 11 2327 8901",
    email: "suresh@academicbooks.com",
    address: "Daryaganj, New Delhi - 110002",
    city: "Delhi",
    purpose: "Payment Collection, Relationship Building",
    specimenGiven: "—",
    paymentGL: "₹1,50,000",
    paymentVP: "₹1,35,000",
    remarks: "Owner agreed to clear 50% outstanding by mid-December",
  },
  {
    id: 2,
    date: "2025-11-20",
    time: "11:00 AM",
    day: "Thursday",
    jointWorking: "Neha Gupta (Regional Manager)",
    name: "Education Corner",
    contactNo: "+91 22 2267 3456",
    email: "ramesh@educorner.com",
    address: "Fort, Mumbai - 400001",
    city: "Mumbai",
    purpose: "Payment Collection, Documentation",
    specimenGiven: "Mathematics Class X (×3)",
    paymentGL: "₹2,00,000",
    paymentVP: "₹2,25,000",
    remarks: "Agreement renewed for next year, payment plan finalized",
  },
  {
    id: 3,
    date: "2025-11-17",
    time: "02:30 PM",
    day: "Monday",
    jointWorking: "—",
    name: "Scholar's Choice",
    contactNo: "+91 79 2640 5678",
    email: "meena@scholarschoice.com",
    address: "CG Road, Ahmedabad - 380006",
    city: "Ahmedabad",
    purpose: "Follow Up",
    specimenGiven: "English Class IX (×2)",
    paymentGL: "₹97,500",
    paymentVP: "₹97,500",
    remarks: "Discussed upcoming season requirements",
  },
  {
    id: 4,
    date: "2025-11-16",
    time: "10:00 AM",
    day: "Sunday",
    jointWorking: "Ravi Kumar (State Manager)",
    name: "Knowledge Hub",
    contactNo: "+91 141 2365 4321",
    email: "vikram@knowledgehub.com",
    address: "MI Road, Jaipur - 302001",
    city: "Jaipur",
    purpose: "Relationship Building",
    specimenGiven: "Physics Class XII (×4), Chemistry Class XII (×4)",
    paymentGL: "₹1,57,500",
    paymentVP: "₹1,57,500",
    remarks: "Large order expected next quarter",
  },
  {
    id: 5,
    date: "2025-11-18",
    time: "04:00 PM",
    day: "Tuesday",
    jointWorking: "—",
    name: "Book Paradise",
    contactNo: "+91 40 2323 4567",
    email: "lakshmi@bookparadise.com",
    address: "Abids, Hyderabad - 500001",
    city: "Hyderabad",
    purpose: "Follow Up",
    specimenGiven: "—",
    paymentGL: "₹1,20,000",
    paymentVP: "₹1,20,000",
    remarks: "Outstanding payment overdue, strong follow up needed",
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function exportCSV(rows: Record<string, any>[], filename: string) {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const csv = [
    headers.join(","),
    ...rows.map((r) =>
      headers.map((h) => `"${String(r[h] ?? "").replace(/"/g, '""')}"`).join(",")
    ),
  ].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Filter bar ───────────────────────────────────────────────────────────────

function FilterBar({
  search, onSearch,
  dateFrom, onDateFrom,
  dateTo, onDateTo,
  onClear, hasFilters,
  onExport,
}: {
  search: string; onSearch: (v: string) => void;
  dateFrom: string; onDateFrom: (v: string) => void;
  dateTo: string; onDateTo: (v: string) => void;
  onClear: () => void; hasFilters: boolean;
  onExport: () => void;
}) {
  return (
    <div className="mb-4 space-y-2">
      {/* Row 1: search + export */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Search…"
            className="pl-8 h-9 text-xs"
          />
          {search && (
            <button onClick={() => onSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        <Button size="sm" variant="outline" onClick={onExport} className="h-9 gap-1.5 text-xs shrink-0">
          <Download className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Export CSV</span>
        </Button>
      </div>

      {/* Row 2: start & end date — native date inputs */}
      <div className="flex items-center gap-2">
        <input
          type="date"
          value={dateFrom}
          max={dateTo || undefined}
          onChange={(e) => onDateFrom(e.target.value)}
          className="flex-1 h-9 rounded-md border border-input bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <span className="text-xs text-muted-foreground shrink-0">to</span>
        <input
          type="date"
          value={dateTo}
          min={dateFrom || undefined}
          onChange={(e) => onDateTo(e.target.value)}
          className="flex-1 h-9 rounded-md border border-input bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
        {hasFilters && (
          <button
            onClick={onClear}
            className="h-9 w-9 shrink-0 flex items-center justify-center rounded-md border border-input bg-background hover:bg-muted transition-colors"
          >
            <X className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Mobile card components ───────────────────────────────────────────────────

function SchoolVisitCard({ visit }: { visit: typeof schoolVisits[0] }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm truncate mb-0.5">{visit.schoolName}</p>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3 shrink-0" />
              <span>{visit.schoolCity}</span>
            </div>
          </div>
          <Badge variant="secondary" className="text-xs shrink-0">{visit.board}</Badge>
        </div>

        <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
          <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{visit.day}, {formatDate(visit.date)}</span>
          <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{visit.time}</span>
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs mb-3">
          <div>
            <p className="text-muted-foreground">Purpose</p>
            <p className="font-medium">{visit.purpose}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Strength</p>
            <p className="font-medium">{visit.strength}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Contact Person</p>
            <p className="font-medium truncate">{visit.contactPerson}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Contact No.</p>
            <p className="font-medium">{visit.contactNo}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Supply Through</p>
            <p className="font-medium">{visit.supplyThrough}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Joint Working</p>
            <p className="font-medium">{visit.jointWorking}</p>
          </div>
        </div>

        <div className="space-y-1.5 text-xs border-t pt-2">
          <div>
            <span className="text-muted-foreground">Specimen Given: </span>
            <span>{visit.specimenGiven}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Specimen Required: </span>
            <span>{visit.specimenRequired}</span>
          </div>
          {visit.schoolComment && (
            <div>
              <span className="text-muted-foreground">School Comment: </span>
              <span>{visit.schoolComment}</span>
            </div>
          )}
          {visit.yourComment && (
            <div>
              <span className="text-muted-foreground">Your Comment: </span>
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
            <p className="font-semibold text-sm truncate mb-0.5">{visit.name}</p>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3 shrink-0" />
              <span>{visit.city}</span>
            </div>
          </div>
          <Badge variant="outline" className="text-xs shrink-0">{visit.purpose.split(",")[0]}</Badge>
        </div>

        <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
          <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{visit.day}, {formatDate(visit.date)}</span>
          <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{visit.time}</span>
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs mb-3">
          <div>
            <p className="text-muted-foreground">Contact No.</p>
            <p className="font-medium">{visit.contactNo}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Joint Working</p>
            <p className="font-medium">{visit.jointWorking}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Payment GL</p>
            <p className="font-medium text-primary">{visit.paymentGL}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Payment VP</p>
            <p className="font-medium text-primary">{visit.paymentVP}</p>
          </div>
        </div>

        <div className="space-y-1.5 text-xs border-t pt-2">
          <div>
            <span className="text-muted-foreground">Address: </span>
            <span>{visit.address}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Specimen Given: </span>
            <span>{visit.specimenGiven}</span>
          </div>
          {visit.remarks && (
            <div>
              <span className="text-muted-foreground">Remarks: </span>
              <span>{visit.remarks}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({ hasFilter }: { hasFilter: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <Search className="h-10 w-10 text-muted-foreground/30 mb-3" />
      <p className="text-sm font-medium text-muted-foreground">
        {hasFilter ? "No visits match your filters" : "No visits yet"}
      </p>
      {hasFilter && (
        <p className="text-xs text-muted-foreground mt-1">Try adjusting your search or date range</p>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

type TabId = "schools" | "booksellers";

export default function MyVisitsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabId>("schools");
  const [allSchoolVisits, setAllSchoolVisits] = useState(schoolVisits);
  const [allBooksellerVisits, setAllBooksellerVisits] = useState(booksellerVisits);

  // Per-tab filter state
  const [schoolSearch, setSchoolSearch] = useState("");
  const [schoolFrom, setSchoolFrom] = useState("");
  const [schoolTo, setSchoolTo] = useState("");

  const [bsSearch, setBsSearch] = useState("");
  const [bsFrom, setBsFrom] = useState("");
  const [bsTo, setBsTo] = useState("");

  // Load from localStorage
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("myVisits_school") || "[]");
    if (saved.length) setAllSchoolVisits([...saved, ...schoolVisits]);

    const savedBS = JSON.parse(localStorage.getItem("myVisits_bookseller") || "[]");
    if (savedBS.length) setAllBooksellerVisits([...savedBS, ...booksellerVisits]);
  }, []);

  // ── Filtered data ──
  const filteredSchool = useMemo(() => {
    const q = schoolSearch.toLowerCase();
    return allSchoolVisits.filter((v) => {
      const matchSearch = !q || Object.values(v).some((val) => String(val).toLowerCase().includes(q));
      const matchFrom = !schoolFrom || v.date >= schoolFrom;
      const matchTo = !schoolTo || v.date <= schoolTo;
      return matchSearch && matchFrom && matchTo;
    });
  }, [allSchoolVisits, schoolSearch, schoolFrom, schoolTo]);

  const filteredBS = useMemo(() => {
    const q = bsSearch.toLowerCase();
    return allBooksellerVisits.filter((v) => {
      const matchSearch = !q || Object.values(v).some((val) => String(val).toLowerCase().includes(q));
      const matchFrom = !bsFrom || v.date >= bsFrom;
      const matchTo = !bsTo || v.date <= bsTo;
      return matchSearch && matchFrom && matchTo;
    });
  }, [allBooksellerVisits, bsSearch, bsFrom, bsTo]);

  const TABS: { id: TabId; label: string; shortLabel: string; count: number; filtered: number; icon: React.ElementType }[] = [
    { id: "schools",     label: "School Visits",     shortLabel: "School", count: allSchoolVisits.length,     filtered: filteredSchool.length, icon: School },
    { id: "booksellers", label: "Book Seller Visits", shortLabel: "Seller", count: allBooksellerVisits.length, filtered: filteredBS.length,     icon: Users  },
  ];

  return (
    <PageContainer>
      {/* Back button — mobile */}
      <div className="md:hidden mb-2">
        <Button variant="ghost" size="sm" onClick={() => router.back()} className="-ml-2">
          <ArrowLeft className="h-4 w-4 mr-1.5" />
          Back
        </Button>
      </div>
      <PageHeader title="My Visits" description="All visits created by you" />

      {/* Pill tab bar */}
      <div className="flex rounded-2xl bg-muted p-1 mb-5 gap-1">
        {TABS.map(({ id, label, shortLabel, count, filtered, icon: Icon }) => {
          const hasFilter = filtered !== count;
          return (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex-1 flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1.5 rounded-xl py-2 px-1 text-xs font-semibold transition-all duration-150 ${
                activeTab === id
                  ? "bg-background text-primary shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="h-3.5 w-3.5 shrink-0" />
              <span className="text-center leading-tight">
                <span className="sm:hidden">{shortLabel}</span>
                <span className="hidden sm:inline">{label}</span>
                <span className="block sm:inline sm:ml-0.5 text-[10px] opacity-70">
                  ({hasFilter ? `${filtered}/${count}` : count})
                </span>
              </span>
            </button>
          );
        })}
      </div>

      {/* ── School Visits ── */}
      {activeTab === "schools" && (
        <>
          <FilterBar
            search={schoolSearch} onSearch={setSchoolSearch}
            dateFrom={schoolFrom} onDateFrom={setSchoolFrom}
            dateTo={schoolTo} onDateTo={setSchoolTo}
            hasFilters={!!(schoolSearch || schoolFrom || schoolTo)}
            onClear={() => { setSchoolSearch(""); setSchoolFrom(""); setSchoolTo(""); }}
            onExport={() => exportCSV(filteredSchool.map(({ id, ...rest }) => rest), "school-visits.csv")}
          />
          {filteredSchool.length === 0 ? (
            <EmptyState hasFilter={!!(schoolSearch || schoolFrom || schoolTo)} />
          ) : (
            <>
              <div className="space-y-3 md:hidden">
                {filteredSchool.map((v, i) => <SchoolVisitCard key={i} visit={v} />)}
              </div>
              <Card className="hidden md:block">
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Time</TableHead>
                          <TableHead>Day</TableHead>
                          <TableHead className="min-w-[160px]">Joint Working</TableHead>
                          <TableHead className="min-w-[180px]">School Name</TableHead>
                          <TableHead className="min-w-[180px]">Purpose</TableHead>
                          <TableHead>School City</TableHead>
                          <TableHead>Board</TableHead>
                          <TableHead>Strength</TableHead>
                          <TableHead className="min-w-[150px]">Contact Person</TableHead>
                          <TableHead>Contact No.</TableHead>
                          <TableHead>Supply Through</TableHead>
                          <TableHead className="min-w-[220px]">Specimen Given</TableHead>
                          <TableHead className="min-w-[200px]">Specimen Required</TableHead>
                          <TableHead className="min-w-[200px]">School Comment</TableHead>
                          <TableHead className="min-w-[200px]">Your Comment</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredSchool.map((v, i) => (
                          <TableRow key={i}>
                            <TableCell>{formatDate(v.date)}</TableCell>
                            <TableCell>{v.time}</TableCell>
                            <TableCell>{v.day}</TableCell>
                            <TableCell>{v.jointWorking}</TableCell>
                            <TableCell className="font-medium">{v.schoolName}</TableCell>
                            <TableCell>{v.purpose}</TableCell>
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
        </>
      )}

      {/* ── Book Seller Visits ── */}
      {activeTab === "booksellers" && (
        <>
          <FilterBar
            search={bsSearch} onSearch={setBsSearch}
            dateFrom={bsFrom} onDateFrom={setBsFrom}
            dateTo={bsTo} onDateTo={setBsTo}
            hasFilters={!!(bsSearch || bsFrom || bsTo)}
            onClear={() => { setBsSearch(""); setBsFrom(""); setBsTo(""); }}
            onExport={() => exportCSV(filteredBS.map(({ id, ...rest }) => rest), "bookseller-visits.csv")}
          />
          {filteredBS.length === 0 ? (
            <EmptyState hasFilter={!!(bsSearch || bsFrom || bsTo)} />
          ) : (
            <>
              <div className="space-y-3 md:hidden">
                {filteredBS.map((v, i) => <BooksellerVisitCard key={i} visit={v} />)}
              </div>
              <Card className="hidden md:block">
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Time</TableHead>
                          <TableHead>Day</TableHead>
                          <TableHead className="min-w-[160px]">Joint Working</TableHead>
                          <TableHead className="min-w-[180px]">Name</TableHead>
                          <TableHead>Contact No.</TableHead>
                          <TableHead className="min-w-[180px]">Email</TableHead>
                          <TableHead className="min-w-[200px]">Address</TableHead>
                          <TableHead>City</TableHead>
                          <TableHead className="min-w-[160px]">Purpose</TableHead>
                          <TableHead className="min-w-[200px]">Specimen Given</TableHead>
                          <TableHead>Payment GL</TableHead>
                          <TableHead>Payment VP</TableHead>
                          <TableHead className="min-w-[220px]">Remarks</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredBS.map((v, i) => (
                          <TableRow key={i}>
                            <TableCell>{formatDate(v.date)}</TableCell>
                            <TableCell>{v.time}</TableCell>
                            <TableCell>{v.day}</TableCell>
                            <TableCell>{v.jointWorking}</TableCell>
                            <TableCell className="font-medium">{v.name}</TableCell>
                            <TableCell>{v.contactNo}</TableCell>
                            <TableCell>{v.email}</TableCell>
                            <TableCell>{v.address}</TableCell>
                            <TableCell>{v.city}</TableCell>
                            <TableCell>{v.purpose}</TableCell>
                            <TableCell>{v.specimenGiven}</TableCell>
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
        </>
      )}
    </PageContainer>
  );
}
