"use client";

import { useState, useEffect, useMemo } from "react";
import { Calendar, MapPin, School, Users, Search, Filter, Clock, CheckCircle2, X, ChevronRight, User, FileText } from "lucide-react";
import PageContainer from "@/components/layouts/PageContainer";
import PageHeader from "@/components/layouts/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MobileSheet } from "@/components/ui/mobile-sheet";
// Dummy API (replace with real API calls when backend is ready)
import { getVisitHistory } from "@/lib/dummy-api";
import type { VisitRecord } from "@/lib/dummy-api";

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

// ─── Visit Detail Content ──────────────────────────────────────────────────────

function VisitDetailContent({ visit }: { visit: VisitRecord }) {
  const TypeIcon = visit.type === "school" ? School : Users;
  return (
    <div className="space-y-4">
      {/* Type + Name */}
      <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <TypeIcon className="h-5 w-5 text-primary" />
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-sm">{visit.entityName}</p>
          <p className="text-xs text-muted-foreground capitalize">{visit.type}</p>
        </div>
      </div>

      {/* Info rows */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
          <div>
            <p className="text-[11px] text-muted-foreground">City</p>
            <p className="text-sm font-medium">{visit.city}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
          <div>
            <p className="text-[11px] text-muted-foreground">Date</p>
            <p className="text-sm font-medium">{formatDate(visit.date)}</p>
          </div>
        </div>
        {visit.time !== "—" && (
          <div className="flex items-center gap-3">
            <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
            <div>
              <p className="text-[11px] text-muted-foreground">Time</p>
              <p className="text-sm font-medium">{visit.time}</p>
            </div>
          </div>
        )}
        {visit.contactPerson !== "—" && (
          <div className="flex items-center gap-3">
            <User className="h-4 w-4 text-muted-foreground shrink-0" />
            <div>
              <p className="text-[11px] text-muted-foreground">Contact Person</p>
              <p className="text-sm font-medium">{visit.contactPerson}</p>
            </div>
          </div>
        )}
      </div>

      {/* Purposes */}
      <div>
        <p className="text-[11px] text-muted-foreground mb-2">Purpose of Visit</p>
        <div className="flex flex-wrap gap-1.5">
          {visit.purposes.map((p, i) => (
            <Badge key={i} variant="outline" className="text-xs">{p}</Badge>
          ))}
        </div>
      </div>

      {/* Source */}
      <div className="flex items-center gap-2">
        <p className="text-[11px] text-muted-foreground">Source:</p>
        <SourceBadge source={visit.source} />
      </div>

      {/* Notes */}
      {visit.notes && visit.notes !== "—" && !visit.notes.startsWith("Tour plan visit") && (
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <p className="text-[11px] text-muted-foreground">Notes</p>
          </div>
          <div className="text-sm text-muted-foreground bg-muted/50 rounded-xl px-3 py-2.5 italic">
            {visit.notes}
          </div>
        </div>
      )}
    </div>
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
  const [selectedVisit, setSelectedVisit] = useState<VisitRecord | null>(null);
  const [isMobileSheetOpen, setIsMobileSheetOpen] = useState(false);
  const [isDesktopDialogOpen, setIsDesktopDialogOpen] = useState(false);

  function openDetail(visit: VisitRecord) {
    setSelectedVisit(visit);
    if (window.innerWidth < 768) {
      setIsMobileSheetOpen(true);
    } else {
      setIsDesktopDialogOpen(true);
    }
  }

  function closeDetail() {
    setIsMobileSheetOpen(false);
    setIsDesktopDialogOpen(false);
  }

  useEffect(() => {
    getVisitHistory().then((data) => {
      setAllVisits(data);
      setIsLoading(false);
    });
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
              <Card key={visit.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => openDetail(visit)}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <TypeIcon className="h-4 w-4 text-primary shrink-0" />
                      <p className="font-semibold text-sm truncate">{visit.entityName}</p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <SourceBadge source={visit.source} />
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
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

      {/* ── Mobile Sheet ── */}
      <MobileSheet
        open={isMobileSheetOpen}
        onClose={closeDetail}
        title={selectedVisit?.entityName ?? "Visit Details"}
        description={selectedVisit ? `${selectedVisit.type === "school" ? "School" : "Bookseller"} visit` : undefined}
        footer={
          <Button className="w-full" onClick={closeDetail}>Close</Button>
        }
      >
        {selectedVisit && <VisitDetailContent visit={selectedVisit} />}
      </MobileSheet>

      {/* ── Desktop Dialog ── */}
      <Dialog open={isDesktopDialogOpen} onOpenChange={open => !open && closeDetail()}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedVisit?.entityName ?? "Visit Details"}</DialogTitle>
          </DialogHeader>
          {selectedVisit && <VisitDetailContent visit={selectedVisit} />}
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
