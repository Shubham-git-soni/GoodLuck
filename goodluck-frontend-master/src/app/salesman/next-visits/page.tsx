"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { School, Users, MapPin, Calendar, Clock, ArrowLeft, CheckCircle2, CalendarX } from "lucide-react";
import PageContainer from "@/components/layouts/PageContainer";
import PageHeader from "@/components/layouts/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getApprovedScheduledVisits } from "@/lib/mock-data/tour-plans";

// ─── Only approved tour plan visits ──────────────────────────────────────────

const approvedVisits = getApprovedScheduledVisits();

const schoolVisits = approvedVisits
  .filter(v => v.type === "school")
  .map((v, i) => ({
    id: 1000 + i,
    date: v.date,
    day: v.day,
    schoolName: v.entityName,
    schoolCity: v.city,
    objectives: v.objectives.join(", "),
    planId: v.planId,
  }));

const booksellerVisits = approvedVisits
  .filter(v => v.type === "bookseller")
  .map((v, i) => ({
    id: 2000 + i,
    date: v.date,
    day: v.day,
    name: v.entityName,
    city: v.city,
    objectives: v.objectives.join(", "),
    planId: v.planId,
  }));

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="h-14 w-14 rounded-2xl bg-muted flex items-center justify-center mb-4">
        <CalendarX className="h-6 w-6 text-muted-foreground" />
      </div>
      <p className="text-sm font-semibold text-foreground mb-1">No {label} scheduled</p>
      <p className="text-xs text-muted-foreground max-w-[220px]">
        Visits from approved tour plans will appear here automatically.
      </p>
    </div>
  );
}

// ─── Tour Plan badge ──────────────────────────────────────────────────────────

function TourPlanBadge({ planId }: { planId: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200 px-2 py-0.5 text-[10px] font-semibold whitespace-nowrap">
      <CheckCircle2 className="h-2.5 w-2.5" />
      {planId}
    </span>
  );
}

// ─── Mobile cards ─────────────────────────────────────────────────────────────

function SchoolVisitCard({ visit }: { visit: typeof schoolVisits[0] }) {
  return (
    <Card className="border-emerald-200 bg-emerald-50/30">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm truncate">{visit.schoolName}</p>
            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
              <MapPin className="h-3 w-3 shrink-0" />
              <span>{visit.schoolCity}</span>
            </div>
          </div>
          <TourPlanBadge planId={visit.planId} />
        </div>

        <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {visit.day}, {formatDate(visit.date)}
          </span>
        </div>

        {visit.objectives && (
          <div className="text-xs border-t pt-2">
            <span className="text-muted-foreground">Objectives: </span>
            <span>{visit.objectives}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function BooksellerVisitCard({ visit }: { visit: typeof booksellerVisits[0] }) {
  return (
    <Card className="border-emerald-200 bg-emerald-50/30">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm truncate">{visit.name}</p>
            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
              <MapPin className="h-3 w-3 shrink-0" />
              <span>{visit.city}</span>
            </div>
          </div>
          <TourPlanBadge planId={visit.planId} />
        </div>

        <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {visit.day}, {formatDate(visit.date)}
          </span>
        </div>

        {visit.objectives && (
          <div className="text-xs border-t pt-2">
            <span className="text-muted-foreground">Objectives: </span>
            <span>{visit.objectives}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

type TabId = "schools" | "booksellers";

const TABS: { id: TabId; label: string; count: number; icon: React.ElementType }[] = [
  { id: "schools",     label: "Schools", count: schoolVisits.length,     icon: School },
  { id: "booksellers", label: "Sellers", count: booksellerVisits.length, icon: Users  },
];

export default function NextVisitsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabId>("schools");

  return (
    <PageContainer>
      <div className="md:hidden mb-2">
        <Button variant="ghost" size="sm" onClick={() => router.back()} className="-ml-2">
          <ArrowLeft className="h-4 w-4 mr-1.5" />
          Back
        </Button>
      </div>
      <PageHeader
        title="Scheduled Visits"
        description="Visits from approved tour plans"
      />

      {/* Tabs */}
      <div className="flex rounded-2xl bg-muted p-1 mb-5 gap-1">
        {TABS.map(({ id, label, count, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2 px-2 text-xs font-semibold transition-all duration-150 ${
              activeTab === id
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
          {schoolVisits.length === 0 ? (
            <EmptyState label="school visits" />
          ) : (
            <>
              {/* Mobile */}
              <div className="space-y-3 md:hidden">
                {schoolVisits.map((v) => <SchoolVisitCard key={v.id} visit={v} />)}
              </div>

              {/* Desktop */}
              <Card className="hidden md:block">
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-12">#</TableHead>
                          <TableHead>Tour Plan</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Day</TableHead>
                          <TableHead>School Name</TableHead>
                          <TableHead>City</TableHead>
                          <TableHead className="min-w-[220px]">Objectives</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {schoolVisits.map((v, idx) => (
                          <TableRow key={v.id} className="bg-emerald-50/30">
                            <TableCell className="font-medium">{idx + 1}</TableCell>
                            <TableCell><TourPlanBadge planId={v.planId} /></TableCell>
                            <TableCell>{formatDate(v.date)}</TableCell>
                            <TableCell>{v.day}</TableCell>
                            <TableCell className="font-medium">{v.schoolName}</TableCell>
                            <TableCell>{v.schoolCity}</TableCell>
                            <TableCell>{v.objectives}</TableCell>
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

      {/* ── Bookseller Visits ── */}
      {activeTab === "booksellers" && (
        <>
          {booksellerVisits.length === 0 ? (
            <EmptyState label="bookseller visits" />
          ) : (
            <>
              {/* Mobile */}
              <div className="space-y-3 md:hidden">
                {booksellerVisits.map((v) => <BooksellerVisitCard key={v.id} visit={v} />)}
              </div>

              {/* Desktop */}
              <Card className="hidden md:block">
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-12">#</TableHead>
                          <TableHead>Tour Plan</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Day</TableHead>
                          <TableHead>Bookseller</TableHead>
                          <TableHead>City</TableHead>
                          <TableHead className="min-w-[220px]">Objectives</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {booksellerVisits.map((v, idx) => (
                          <TableRow key={v.id} className="bg-emerald-50/30">
                            <TableCell className="font-medium">{idx + 1}</TableCell>
                            <TableCell><TourPlanBadge planId={v.planId} /></TableCell>
                            <TableCell>{formatDate(v.date)}</TableCell>
                            <TableCell>{v.day}</TableCell>
                            <TableCell className="font-medium">{v.name}</TableCell>
                            <TableCell>{v.city}</TableCell>
                            <TableCell>{v.objectives}</TableCell>
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
