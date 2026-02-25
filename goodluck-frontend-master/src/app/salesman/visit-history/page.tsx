"use client";

import { useState, useEffect, useMemo } from "react";
import { Calendar, MapPin, School, Users, Search, Filter, Clock, CheckCircle2, X } from "lucide-react";
import PageContainer from "@/components/layouts/PageContainer";
import PageHeader from "@/components/layouts/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getApprovedScheduledVisits } from "@/lib/mock-data/tour-plans";

// ─── Types ────────────────────────────────────────────────────────────────────

interface VisitRecord {
  id: string;
  type: "school" | "bookseller";
  entityName: string;
  city: string;
  date: string;
  time: string;
  purposes: string[];
  contactPerson: string;
  notes: string;
  source: "manual" | string; // "manual" or tour plan ID like "TP-2025-001"
}

// ─── Static completed visits (from My Visits mock) ────────────────────────────

const staticVisits: VisitRecord[] = [
  {
    id: "V001",
    type: "school",
    entityName: "Delhi Public School",
    city: "Delhi",
    date: "2025-11-15",
    time: "10:00 AM",
    purposes: ["Need Mapping", "Specimen Distribution"],
    contactPerson: "Dr. Rajesh Sharma",
    notes: "Principal very cooperative, follow up next month",
    source: "manual",
  },
  {
    id: "V002",
    type: "school",
    entityName: "Ryan International School",
    city: "Mumbai",
    date: "2025-11-18",
    time: "11:30 AM",
    purposes: ["Post-Sales Engagement", "Relationship Building"],
    contactPerson: "Mrs. Pooja Mehta",
    notes: "Needs pricing discussion on next visit",
    source: "manual",
  },
  {
    id: "V003",
    type: "school",
    entityName: "DAV Public School",
    city: "Delhi",
    date: "2025-11-10",
    time: "09:30 AM",
    purposes: ["Specimen Distribution", "Need Mapping"],
    contactPerson: "Dr. Ramesh Chand",
    notes: "Large potential, needs follow up in January",
    source: "manual",
  },
  {
    id: "V004",
    type: "school",
    entityName: "Oakridge International School",
    city: "Bangalore",
    date: "2025-11-05",
    time: "02:00 PM",
    purposes: ["Relationship Building", "Specimen Distribution"],
    contactPerson: "Ms. Sarah Williams",
    notes: "Positive visit, schedule need mapping next",
    source: "manual",
  },
  {
    id: "V005",
    type: "school",
    entityName: "Cathedral School",
    city: "Mumbai",
    date: "2025-11-20",
    time: "03:30 PM",
    purposes: ["Need Mapping", "Post-Sales Engagement"],
    contactPerson: "Mrs. Linda Fernandes",
    notes: "Strong follow up needed for conversion",
    source: "manual",
  },
  {
    id: "V006",
    type: "bookseller",
    entityName: "Academic Books Pvt Ltd",
    city: "Delhi",
    date: "2025-11-19",
    time: "03:00 PM",
    purposes: ["Payment Collection", "Relationship Building"],
    contactPerson: "Mr. Suresh Kapoor",
    notes: "Owner agreed to clear 50% outstanding by mid-December",
    source: "manual",
  },
  {
    id: "V007",
    type: "bookseller",
    entityName: "Education Corner",
    city: "Mumbai",
    date: "2025-11-20",
    time: "11:00 AM",
    purposes: ["Payment Collection", "Documentation"],
    contactPerson: "Mr. Ramesh Gupta",
    notes: "Agreement renewed for next year, payment plan finalized",
    source: "manual",
  },
  {
    id: "V008",
    type: "bookseller",
    entityName: "Scholar's Choice",
    city: "Ahmedabad",
    date: "2025-11-17",
    time: "02:30 PM",
    purposes: ["Follow Up"],
    contactPerson: "Ms. Meena Shah",
    notes: "Discussed upcoming season requirements",
    source: "manual",
  },
];

// Convert approved tour plan visits → completed VisitRecord entries
function getTourPlanCompletedVisits(): VisitRecord[] {
  return getApprovedScheduledVisits().map((v, i) => ({
    id: `TP-${v.planId}-${i}`,
    type: v.type,
    entityName: v.entityName,
    city: v.city,
    date: v.date,
    time: "—",
    purposes: v.objectives,
    contactPerson: "—",
    notes: `Tour plan visit — ${v.planId}`,
    source: v.planId,
  }));
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-IN", {
    weekday: "short", day: "numeric", month: "short", year: "numeric",
  });
}

function SourceBadge({ source }: { source: string }) {
  if (source === "manual") {
    return <Badge variant="secondary" className="text-[10px]">Manual</Badge>;
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200 px-2 py-0.5 text-[10px] font-semibold">
      <CheckCircle2 className="h-2.5 w-2.5" />
      {source}
    </span>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function VisitHistoryPage() {
  const [allVisits, setAllVisits] = useState<VisitRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [monthFilter, setMonthFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Merge: static + localStorage (from Add Visit form) + approved tour plan visits
    const savedSchool: VisitRecord[] = JSON.parse(localStorage.getItem("myVisits_school") || "[]")
      .map((v: Record<string, unknown>, i: number) => ({
        id: `LS-S-${i}`,
        type: "school" as const,
        entityName: String(v.schoolName || v.entityName || ""),
        city: String(v.schoolCity || v.city || ""),
        date: String(v.date || ""),
        time: String(v.time || "—"),
        purposes: Array.isArray(v.purposes) ? v.purposes : [String(v.purpose || "")],
        contactPerson: String(v.contactPerson || "—"),
        notes: String(v.yourComment || v.notes || ""),
        source: "manual" as const,
      }));

    const savedBS: VisitRecord[] = JSON.parse(localStorage.getItem("myVisits_bookseller") || "[]")
      .map((v: Record<string, unknown>, i: number) => ({
        id: `LS-B-${i}`,
        type: "bookseller" as const,
        entityName: String(v.name || v.entityName || ""),
        city: String(v.city || ""),
        date: String(v.date || ""),
        time: String(v.time || "—"),
        purposes: Array.isArray(v.purposes) ? v.purposes : [String(v.purpose || "")],
        contactPerson: String(v.contactPerson || "—"),
        notes: String(v.remarks || v.notes || ""),
        source: "manual" as const,
      }));

    const tourPlanVisits = getTourPlanCompletedVisits();

    const merged = [...savedSchool, ...savedBS, ...staticVisits, ...tourPlanVisits]
      .sort((a, b) => b.date.localeCompare(a.date)); // newest first

    setAllVisits(merged);
    setIsLoading(false);
  }, []);

  const monthOptions = useMemo(() => {
    const months = new Set(allVisits.map(v => v.date.slice(0, 7)));
    return Array.from(months).sort().reverse();
  }, [allVisits]);

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return allVisits.filter(v => {
      if (q && !v.entityName.toLowerCase().includes(q) && !v.city.toLowerCase().includes(q)) return false;
      if (typeFilter !== "all" && v.type !== typeFilter) return false;
      if (sourceFilter === "manual" && v.source !== "manual") return false;
      if (sourceFilter === "tourplan" && v.source === "manual") return false;
      if (monthFilter !== "all" && v.date.slice(0, 7) !== monthFilter) return false;
      return true;
    });
  }, [allVisits, searchQuery, typeFilter, sourceFilter, monthFilter]);

  const hasFilters = !!(searchQuery || typeFilter !== "all" || sourceFilter !== "all" || monthFilter !== "all");

  function resetFilters() {
    setSearchQuery("");
    setTypeFilter("all");
    setSourceFilter("all");
    setMonthFilter("all");
  }

  if (isLoading) {
    return (
      <PageContainer>
        <PageHeader title="Visit History" description="All completed visits" />
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4"><div className="h-20 bg-muted rounded" /></CardContent>
            </Card>
          ))}
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="Visit History"
        description={`${allVisits.length} total completed visits`}
      />

      {/* ── Filters ── */}
      <div className="space-y-2 mb-5">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or city..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-10 pr-8"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Dropdowns */}
        <div className="grid grid-cols-3 gap-2">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="h-9 text-xs">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="school">Schools</SelectItem>
              <SelectItem value="bookseller">Book Sellers</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sourceFilter} onValueChange={setSourceFilter}>
            <SelectTrigger className="h-9 text-xs">
              <SelectValue placeholder="Source" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sources</SelectItem>
              <SelectItem value="manual">Manual</SelectItem>
              <SelectItem value="tourplan">Tour Plan</SelectItem>
            </SelectContent>
          </Select>

          <Select value={monthFilter} onValueChange={setMonthFilter}>
            <SelectTrigger className="h-9 text-xs">
              <SelectValue placeholder="Month" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Months</SelectItem>
              {monthOptions.map(m => (
                <SelectItem key={m} value={m}>
                  {new Date(m + "-01").toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Result count + reset */}
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Showing <span className="font-semibold text-foreground">{filtered.length}</span> of {allVisits.length} visits
          </p>
          {hasFilters && (
            <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={resetFilters}>
              <Filter className="h-3 w-3" />
              Reset
            </Button>
          )}
        </div>
      </div>

      {/* ── Visit List ── */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="h-14 w-14 rounded-2xl bg-muted flex items-center justify-center mb-4">
            <Search className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-sm font-semibold">No visits found</p>
          <p className="text-xs text-muted-foreground mt-1">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(visit => {
            const TypeIcon = visit.type === "school" ? School : Users;
            return (
              <Card key={visit.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <TypeIcon className="h-4 w-4 text-primary shrink-0" />
                      <p className="font-semibold text-sm truncate">{visit.entityName}</p>
                    </div>
                    <SourceBadge source={visit.source} />
                  </div>

                  <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                    <MapPin className="h-3 w-3 shrink-0" />
                    <span>{visit.city}</span>
                    <span className="mx-1.5">•</span>
                    <Calendar className="h-3 w-3 shrink-0" />
                    <span>{formatDate(visit.date)}</span>
                    {visit.time !== "—" && (
                      <>
                        <span className="mx-1.5">•</span>
                        <Clock className="h-3 w-3 shrink-0" />
                        <span>{visit.time}</span>
                      </>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-1 mb-2">
                    {visit.purposes.map((p, i) => (
                      <Badge key={i} variant="outline" className="text-[10px]">{p}</Badge>
                    ))}
                  </div>

                  {visit.notes && visit.notes !== "—" && !visit.notes.startsWith("Tour plan visit") && (
                    <div className="text-xs text-muted-foreground bg-muted/50 rounded-md px-2.5 py-1.5 italic">
                      {visit.notes}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </PageContainer>
  );
}
