"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Calendar, Trash2, Save, MapPin, School, Users, CalendarIcon } from "lucide-react";
import { format, addDays, differenceInCalendarDays } from "date-fns";
import { type DateRange } from "react-day-picker";
import PageContainer from "@/components/layouts/PageContainer";
import PageHeader from "@/components/layouts/PageHeader";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/date-picker";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { MultiSelect } from "@/components/ui/multi-select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MobileSheet } from "@/components/ui/mobile-sheet";
import { toast } from "sonner";
import { School as SchoolType } from "@/types";
import schoolsData from "@/lib/mock-data/schools.json";
import bookSellersData from "@/lib/mock-data/book-sellers.json";
import dropdownOptions from "@/lib/mock-data/dropdown-options.json";

// ─── Types ────────────────────────────────────────────────────────────────────

type VisitType = "school" | "bookseller";

interface PlannedVisit {
  id: string;
  type: VisitType;
  entityId: string;
  entityName: string;
  city: string;
  objectives: string[];
  date: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const visitPurposes = dropdownOptions.visitPurposes;

// ─── Shared form component (used in both mobile sheet and desktop dialog) ─────

function VisitForm({
  visitType, setVisitType,
  selectedEntityId, setSelectedEntityId,
  selectedObjectives, setSelectedObjectives,
  selectedDate, setSelectedDate,
  startDate, endDate,
  schools, booksellers,
}: {
  visitType: VisitType;
  setVisitType: (t: VisitType) => void;
  selectedEntityId: string;
  setSelectedEntityId: (v: string) => void;
  selectedObjectives: string[];
  setSelectedObjectives: (v: string[]) => void;
  selectedDate: string;
  setSelectedDate: (v: string) => void;
  startDate: string;
  endDate: string;
  schools: any[];
  booksellers: any[];
}) {
  return (
    <div className="space-y-4">
      {/* Visit Type toggle */}
      <div className="space-y-2">
        <Label>Visit Type *</Label>
        <div className="flex rounded-xl bg-muted p-1 gap-1">
          <button
            type="button"
            onClick={() => { setVisitType("school"); setSelectedEntityId(""); setSelectedObjectives([]); }}
            className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition-all ${
              visitType === "school" ? "bg-background text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <School className="h-3.5 w-3.5" />
            School
          </button>
          <button
            type="button"
            onClick={() => { setVisitType("bookseller"); setSelectedEntityId(""); setSelectedObjectives([]); }}
            className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition-all ${
              visitType === "bookseller" ? "bg-background text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Users className="h-3.5 w-3.5" />
            Book Seller
          </button>
        </div>
      </div>

      {/* Visit Date */}
      <div className="space-y-2">
        <Label>Visit Date *</Label>
        <DatePicker
          value={selectedDate}
          onChange={setSelectedDate}
          placeholder="Select visit date"
          min={startDate}
          max={endDate}
          disabled={!startDate || !endDate}
        />
      </div>

      {/* Entity */}
      <div className="space-y-2">
        <Label>{visitType === "school" ? "Select School" : "Select Book Seller"} *</Label>
        {visitType === "school" ? (
          <NativeSelect value={selectedEntityId} onValueChange={setSelectedEntityId} placeholder="Choose a school">
            {schools.map((s: any) => (
              <NativeSelectOption key={s.id} value={s.id}>{s.name} — {s.city}</NativeSelectOption>
            ))}
          </NativeSelect>
        ) : (
          <NativeSelect value={selectedEntityId} onValueChange={setSelectedEntityId} placeholder="Choose a book seller">
            {booksellers.map((b: any) => (
              <NativeSelectOption key={b.id} value={b.id}>{b.shopName} — {b.city}</NativeSelectOption>
            ))}
          </NativeSelect>
        )}
      </div>

      {/* Purpose of Visit */}
      <div className="space-y-2">
        <Label>Purpose of Visit *</Label>
        <MultiSelect
          options={visitPurposes.map(o => ({ value: o, label: o }))}
          value={selectedObjectives}
          onChange={setSelectedObjectives}
          placeholder="Select purpose(s)"
          searchable
        />
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function TourPlanPage() {
  const router = useRouter();

  // Date range
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [mobileRangeOpen, setMobileRangeOpen] = useState(false);
  const [desktopRangeOpen, setDesktopRangeOpen] = useState(false);
  const startDate = dateRange?.from ? format(dateRange.from, "yyyy-MM-dd") : "";
  const endDate = dateRange?.to ? format(dateRange.to, "yyyy-MM-dd") : "";

  // Visits list
  const [plannedVisits, setPlannedVisits] = useState<PlannedVisit[]>([]);

  // Sheet/Dialog state
  const [isMobileSheetOpen, setIsMobileSheetOpen] = useState(false);
  const [isDesktopDialogOpen, setIsDesktopDialogOpen] = useState(false);

  // Form fields
  const [visitType, setVisitType] = useState<VisitType>("school");
  const [selectedEntityId, setSelectedEntityId] = useState("");
  const [selectedObjectives, setSelectedObjectives] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState("");

  // Data
  const schools = (schoolsData as SchoolType[]).filter(s => s.assignedTo === "SM001");
  const booksellers = (bookSellersData as any[]).filter(b => b.assignedTo === "SM001");

  const MAX_DAYS = 15;

  const totalDays =
    dateRange?.from && dateRange?.to
      ? differenceInCalendarDays(dateRange.to, dateRange.from) + 1
      : 0;

  // Reset form
  const resetForm = () => {
    setVisitType("school");
    setSelectedEntityId("");
    setSelectedObjectives([]);
    setSelectedDate("");
  };

  const openSheet = () => {
    resetForm();
    if (window.innerWidth < 768) setIsMobileSheetOpen(true);
    else setIsDesktopDialogOpen(true);
  };

  const closeSheet = () => {
    setIsMobileSheetOpen(false);
    setIsDesktopDialogOpen(false);
    resetForm();
  };

  const handleAddVisit = () => {
    if (!selectedEntityId || selectedObjectives.length === 0 || !selectedDate) {
      toast.error("Please fill all fields");
      return;
    }
    if (!startDate || !endDate) {
      toast.error("Please set tour plan date range first");
      return;
    }
    if (selectedDate < startDate || selectedDate > endDate) {
      toast.error("Visit date must be within tour plan date range");
      return;
    }
    if (plannedVisits.some(v => v.entityId === selectedEntityId && v.date === selectedDate && v.type === visitType)) {
      toast.error("This entry is already added for this date");
      return;
    }

    let entityName = "";
    let city = "";

    if (visitType === "school") {
      const school = schools.find(s => s.id === selectedEntityId);
      if (!school) return;
      entityName = school.name;
      city = school.city;
    } else {
      const bs = booksellers.find(b => b.id === selectedEntityId);
      if (!bs) return;
      entityName = bs.shopName;
      city = bs.city;
    }

    const newVisit: PlannedVisit = {
      id: `VISIT-${Date.now()}`,
      type: visitType,
      entityId: selectedEntityId,
      entityName,
      city,
      objectives: selectedObjectives,
      date: selectedDate,
    };

    setPlannedVisits(prev => [...prev, newVisit]);
    closeSheet();
    toast.success(`${visitType === "school" ? "School" : "Book Seller"} added to tour plan`);
  };

  const handleRemoveVisit = (visitId: string) => {
    setPlannedVisits(prev => prev.filter(v => v.id !== visitId));
    toast.success("Removed from tour plan");
  };

  const handleSubmitPlan = () => {
    if (!startDate || !endDate) {
      toast.error("Please select date range");
      return;
    }
    if (plannedVisits.length === 0) {
      toast.error("Please add at least one visit to the tour plan");
      return;
    }
    toast.success("Tour plan submitted for approval!");
    setTimeout(() => router.push("/salesman/tour-plans"), 1500);
  };

  const visitsByDate = plannedVisits.reduce((acc, visit) => {
    if (!acc[visit.date]) acc[visit.date] = [];
    acc[visit.date].push(visit);
    return acc;
  }, {} as Record<string, PlannedVisit[]>);

  const sortedDates = Object.keys(visitsByDate).sort();

  const formProps = {
    visitType, setVisitType,
    selectedEntityId, setSelectedEntityId,
    selectedObjectives, setSelectedObjectives,
    selectedDate, setSelectedDate,
    startDate, endDate,
    schools, booksellers,
  };

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <PageContainer>
      {/* Mobile Bottom Sheet */}
      <MobileSheet
        open={isMobileSheetOpen}
        onClose={closeSheet}
        title="Add Visit to Tour Plan"
        description="Select type, date, entity and objective"
        footer={
          <Button className="w-full h-12 text-sm font-semibold rounded-2xl" onClick={handleAddVisit}>
            Add to Plan
          </Button>
        }
      >
        <VisitForm {...formProps} />
      </MobileSheet>

      {/* Desktop Dialog */}
      <Dialog open={isDesktopDialogOpen} onOpenChange={(o) => { if (!o) closeSheet(); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Visit to Tour Plan</DialogTitle>
            <DialogDescription>Select type, date, entity and objective</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <VisitForm {...formProps} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeSheet}>Cancel</Button>
            <Button onClick={handleAddVisit}>Add to Plan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Header with Add Visit button */}
      <div className="flex items-start justify-between gap-3 mb-1">
        <PageHeader title="My Tour Plan" description="Create and manage your tour plan" />
        <Button
          disabled={!startDate || !endDate}
          onClick={openSheet}
          className="shrink-0 mt-1"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Visit
        </Button>
      </div>

      {/* Date Range */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Tour Plan Period</CardTitle>
          <CardDescription>Select start and end date (max {MAX_DAYS} days)</CardDescription>
        </CardHeader>
        <CardContent>

          {/* ── Mobile trigger ── */}
          <Button
            variant="outline"
            className="w-full justify-start text-left font-normal h-10 px-3 gap-2 md:hidden"
            onClick={() => setMobileRangeOpen(true)}
          >
            <CalendarIcon className="h-4 w-4 text-muted-foreground shrink-0" />
            {dateRange?.from ? (
              dateRange.to
                ? <span>{format(dateRange.from, "dd MMM yyyy")} → {format(dateRange.to, "dd MMM yyyy")}</span>
                : <span>{format(dateRange.from, "dd MMM yyyy")} → Pick end date</span>
            ) : (
              <span className="text-muted-foreground">Select tour plan period</span>
            )}
            {dateRange?.from && dateRange?.to && (
              <Badge variant="secondary" className="ml-auto text-xs font-semibold shrink-0">
                {totalDays} day{totalDays !== 1 ? "s" : ""}
              </Badge>
            )}
          </Button>

          {/* ── Mobile: full-screen bottom sheet ── */}
          {mobileRangeOpen && (
            <>
              <div className="fixed inset-0 z-[100] bg-black/50" onClick={() => setMobileRangeOpen(false)} />
              <div className="fixed bottom-0 left-0 right-0 z-[101] bg-background rounded-t-3xl shadow-2xl flex flex-col"
                style={{ maxHeight: "92dvh" }}>
                {/* Handle bar */}
                <div className="flex justify-center pt-3 pb-1 shrink-0">
                  <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
                </div>
                {/* Header */}
                <div className="flex items-center justify-between px-5 pt-2 pb-3 border-b shrink-0">
                  <div>
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-0.5">Tour Plan Period</p>
                    <p className="text-sm font-semibold">
                      {dateRange?.from && dateRange?.to
                        ? `${format(dateRange.from, "dd MMM")} → ${format(dateRange.to, "dd MMM yyyy")} · ${totalDays} days`
                        : dateRange?.from
                        ? `${format(dateRange.from, "dd MMM yyyy")} → select end date`
                        : "Select start & end date"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setMobileRangeOpen(false)}
                    className="h-8 w-8 rounded-full bg-muted flex items-center justify-center"
                  >
                    <span className="text-base leading-none text-muted-foreground font-medium">✕</span>
                  </button>
                </div>
                {/* Calendar — scrollable */}
                <div className="overflow-y-auto flex-1 px-2">
                  <CalendarComponent
                    mode="range"
                    selected={dateRange}
                    onSelect={(range) => {
                      if (range?.from && range?.to) {
                        const days = differenceInCalendarDays(range.to, range.from) + 1;
                        if (days > MAX_DAYS) {
                          toast.error(`Max ${MAX_DAYS} days. End date adjusted.`);
                          setDateRange({ from: range.from, to: addDays(range.from, MAX_DAYS - 1) });
                          return;
                        }
                      }
                      setDateRange(range);
                    }}
                    disabled={{ before: new Date() }}
                    numberOfMonths={1}
                    defaultMonth={dateRange?.from ?? new Date()}
                    className="w-full"
                  />
                </div>
                {/* Footer */}
                <div className="flex gap-3 px-5 py-4 border-t shrink-0">
                  <Button variant="outline" className="flex-1 h-11 rounded-2xl"
                    onClick={() => { setDateRange(undefined); setMobileRangeOpen(false); }}>
                    Clear
                  </Button>
                  <Button className="flex-1 h-11 rounded-2xl font-semibold"
                    disabled={!dateRange?.from || !dateRange?.to}
                    onClick={() => setMobileRangeOpen(false)}>
                    Done
                  </Button>
                </div>
              </div>
            </>
          )}

          {/* ── Desktop: popover with 2-month calendar ── */}
          <div className="hidden md:block">
            <Popover open={desktopRangeOpen} onOpenChange={setDesktopRangeOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal h-10 px-3 gap-2"
                >
                  <CalendarIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                  {dateRange?.from ? (
                    dateRange.to
                      ? <span>{format(dateRange.from, "dd MMM yyyy")} → {format(dateRange.to, "dd MMM yyyy")}</span>
                      : <span>{format(dateRange.from, "dd MMM yyyy")} → Pick end date</span>
                  ) : (
                    <span className="text-muted-foreground">Select tour plan period</span>
                  )}
                  {dateRange?.from && dateRange?.to && (
                    <Badge variant="secondary" className="ml-auto text-xs font-semibold shrink-0">
                      {totalDays} day{totalDays !== 1 ? "s" : ""}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start" sideOffset={8}>
                <div className="px-4 pt-4 pb-3 border-b bg-muted/30">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-0.5">Tour Plan Period</p>
                  <p className="text-sm font-semibold">
                    {dateRange?.from && dateRange?.to
                      ? `${format(dateRange.from, "dd MMM")} → ${format(dateRange.to, "dd MMM yyyy")} · ${totalDays} days`
                      : dateRange?.from
                      ? `${format(dateRange.from, "dd MMM yyyy")} → select end`
                      : "Select start date"}
                  </p>
                </div>
                <CalendarComponent
                  mode="range"
                  selected={dateRange}
                  onSelect={(range) => {
                    if (range?.from && range?.to) {
                      const days = differenceInCalendarDays(range.to, range.from) + 1;
                      if (days > MAX_DAYS) {
                        toast.error(`Max ${MAX_DAYS} days. End date adjusted.`);
                        setDateRange({ from: range.from, to: addDays(range.from, MAX_DAYS - 1) });
                        setDesktopRangeOpen(false);
                        return;
                      }
                      setDesktopRangeOpen(false);
                    }
                    setDateRange(range);
                  }}
                  disabled={{ before: new Date() }}
                  numberOfMonths={2}
                  defaultMonth={dateRange?.from ?? new Date()}
                  className="p-3"
                />
                <div className="flex gap-2 px-4 pb-4 pt-2 border-t">
                  <Button variant="outline" size="sm" className="flex-1 text-xs h-8"
                    onClick={() => { setDateRange(undefined); setDesktopRangeOpen(false); }}>
                    Clear
                  </Button>
                  <Button size="sm" className="flex-1 text-xs h-8"
                    disabled={!dateRange?.from || !dateRange?.to}
                    onClick={() => setDesktopRangeOpen(false)}>
                    Done
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {dateRange?.from && dateRange?.to && (
            <div className="mt-3 flex items-center gap-2 text-xs font-medium px-3 py-2 rounded-xl bg-primary/8 text-primary">
              <Calendar className="h-3.5 w-3.5 shrink-0" />
              <span>{totalDays} day{totalDays !== 1 ? "s" : ""} selected</span>
              <span className="ml-auto text-muted-foreground font-normal">
                {MAX_DAYS - totalDays} days remaining
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Planned Visits */}
      {plannedVisits.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">No visits planned yet. Click "Add Visit" to get started.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="space-y-6 mb-6">
            {sortedDates.map((date) => (
              <Card key={date}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-primary" />
                      <CardTitle className="text-base">
                        {new Date(date).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                      </CardTitle>
                    </div>
                    <Badge>{visitsByDate[date].length} visit{visitsByDate[date].length !== 1 ? "s" : ""}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {visitsByDate[date].map((visit) => (
                      <Card key={visit.id} className="border border-border/60">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                {visit.type === "school"
                                  ? <School className="h-3.5 w-3.5 text-primary shrink-0" />
                                  : <Users className="h-3.5 w-3.5 text-primary shrink-0" />
                                }
                                <h4 className="font-semibold text-sm truncate">{visit.entityName}</h4>
                              </div>
                              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
                                <MapPin className="h-3 w-3 shrink-0" />
                                <span>{visit.city}</span>
                              </div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <Badge variant="outline" className="text-[10px] capitalize">
                                  {visit.type === "school" ? "School" : "Book Seller"}
                                </Badge>
                                {visit.objectives.map(obj => (
                                  <Badge key={obj} variant="secondary" className="text-[10px]">{obj}</Badge>
                                ))}
                              </div>
                            </div>
                            <Button variant="ghost" size="icon" className="shrink-0 h-8 w-8" onClick={() => handleRemoveVisit(visit.id)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex justify-end gap-3 pb-6">
            <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
            <Button onClick={handleSubmitPlan}>
              <Save className="h-4 w-4 mr-2" />
              Submit for Approval
            </Button>
          </div>
        </>
      )}
    </PageContainer>
  );
}
