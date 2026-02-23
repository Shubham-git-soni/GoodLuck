"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, Filter, Plus, MapPin, Calendar, Users, ChevronRight, X } from "lucide-react";
import PageContainer from "@/components/layouts/PageContainer";
import PageHeader from "@/components/layouts/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ListItemSkeleton } from "@/components/ui/skeleton-loaders";
import EmptyState from "@/components/ui/empty-state";
import { School } from "@/types";
import { toast } from "sonner";

// Import mock data
import schoolsData from "@/lib/mock-data/schools.json";
import dropdownOptions from "@/lib/mock-data/dropdown-options.json";

export default function SchoolListPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [schools, setSchools] = useState<School[]>([]);
  const [filteredSchools, setFilteredSchools] = useState<School[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [boardFilter, setBoardFilter] = useState("all");
  const [cityFilter, setCityFilter] = useState("all");
  const [visitFilter, setVisitFilter] = useState("all");
  const [isMobileSheetOpen, setIsMobileSheetOpen] = useState(false);
  const [isDesktopDialogOpen, setIsDesktopDialogOpen] = useState(false);

  // Add School Form State
  const [newSchool, setNewSchool] = useState({
    name: "",
    city: "",
    board: "",
    strength: "",
    address: "",
    contactPersonName: "",
    contactPersonDesignation: "",
    contactPersonMobile: "",
  });

  useEffect(() => {
    // Simulate data loading
    setTimeout(() => {
      // Filter schools for current salesman (SM001)
      const assignedSchools = schoolsData.filter((s) => s.assignedTo === "SM001");
      setSchools(assignedSchools as School[]);
      setFilteredSchools(assignedSchools as School[]);
      setIsLoading(false);
    }, 800);
  }, []);

  useEffect(() => {
    // Apply filters
    let filtered = schools;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (school) =>
          school.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          school.city.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Board filter
    if (boardFilter !== "all") {
      filtered = filtered.filter((school) => school.board === boardFilter);
    }

    // City filter
    if (cityFilter !== "all") {
      filtered = filtered.filter((school) => school.city === cityFilter);
    }

    // Visit status filter
    if (visitFilter !== "all") {
      if (visitFilter === "0") {
        filtered = filtered.filter((school) => school.visitCount === 0);
      } else if (visitFilter === "1") {
        filtered = filtered.filter((school) => school.visitCount === 1);
      } else if (visitFilter === "2+") {
        filtered = filtered.filter((school) => school.visitCount >= 2);
      } else if (visitFilter === "pattakat") {
        filtered = filtered.filter((school) => school.isPattakat);
      }
    }

    setFilteredSchools(filtered);
  }, [searchQuery, boardFilter, cityFilter, visitFilter, schools]);

  // Get unique boards and cities
  const boards = ["all", ...Array.from(new Set(schools.map((s) => s.board)))];
  const cities = ["all", ...Array.from(new Set(schools.map((s) => s.city)))];

  // Handle Add School Submit
  const handleAddSchool = () => {
    if (!newSchool.name || !newSchool.city || !newSchool.board) {
      toast.error("Please fill all required fields");
      return;
    }

    toast.success("School added successfully! Pending admin approval.");
    setIsMobileSheetOpen(false);
    setIsDesktopDialogOpen(false);
    setNewSchool({
      name: "",
      city: "",
      board: "",
      strength: "",
      address: "",
      contactPersonName: "",
      contactPersonDesignation: "",
      contactPersonMobile: "",
    });
  };

  if (isLoading) {
    return (
      <PageContainer>
        <PageHeader title="My Schools" description="Manage your assigned schools" />
        <div className="space-y-3">
          <ListItemSkeleton />
          <ListItemSkeleton />
          <ListItemSkeleton />
          <ListItemSkeleton />
        </div>
      </PageContainer>
    );
  }

  // Common text/textarea fields shared between mobile + desktop
  const commonFields = (
    <>
      <div className="grid gap-2">
        <Label>School Name *</Label>
        <Input
          value={newSchool.name}
          onChange={(e) => setNewSchool({ ...newSchool, name: e.target.value })}
          placeholder="Enter school name"
        />
      </div>
      <div className="grid gap-2">
        <Label>Student Strength</Label>
        <Input
          type="number"
          value={newSchool.strength}
          onChange={(e) => setNewSchool({ ...newSchool, strength: e.target.value })}
          placeholder="Enter student count"
        />
      </div>
      <div className="grid gap-2">
        <Label>Address</Label>
        <Textarea
          value={newSchool.address}
          onChange={(e) => setNewSchool({ ...newSchool, address: e.target.value })}
          placeholder="Enter complete address"
          rows={2}
        />
      </div>
      <div className="border-t pt-3">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Contact Person Details</p>
        <div className="grid gap-3">
          <div className="grid gap-2">
            <Label>Contact Person Name</Label>
            <Input
              value={newSchool.contactPersonName}
              onChange={(e) => setNewSchool({ ...newSchool, contactPersonName: e.target.value })}
              placeholder="Enter contact person name"
            />
          </div>
          <div className="grid gap-2 md:hidden">
            <Label>Designation</Label>
            <NativeSelect
              value={newSchool.contactPersonDesignation}
              onValueChange={(v) => setNewSchool({ ...newSchool, contactPersonDesignation: v })}
              placeholder="Select designation"
            >
              {dropdownOptions.contactRoles.map((role) => (
                <NativeSelectOption key={role} value={role}>{role}</NativeSelectOption>
              ))}
            </NativeSelect>
          </div>
          <div className="hidden md:grid gap-2">
            <Label>Designation</Label>
            <Select value={newSchool.contactPersonDesignation} onValueChange={(v) => setNewSchool({ ...newSchool, contactPersonDesignation: v })}>
              <SelectTrigger><SelectValue placeholder="Select designation" /></SelectTrigger>
              <SelectContent>
                {dropdownOptions.contactRoles.map((role) => (
                  <SelectItem key={role} value={role}>{role}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Mobile Number</Label>
            <Input
              type="tel"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={10}
              value={newSchool.contactPersonMobile}
              onChange={(e) => setNewSchool({ ...newSchool, contactPersonMobile: e.target.value.replace(/\D/g, "") })}
              placeholder="10-digit mobile number"
            />
          </div>
        </div>
      </div>
    </>
  );

  // Mobile form — uses NativeSelect (no Radix portal, works inside sheet)
  const mobileFormFields = (
    <div className="grid gap-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-2">
          <Label>City *</Label>
          <NativeSelect
            value={newSchool.city}
            onValueChange={(v) => setNewSchool({ ...newSchool, city: v })}
            placeholder="Select city"
          >
            {dropdownOptions.cities.map((city) => (
              <NativeSelectOption key={city} value={city}>{city}</NativeSelectOption>
            ))}
          </NativeSelect>
        </div>
        <div className="grid gap-2">
          <Label>Board *</Label>
          <NativeSelect
            value={newSchool.board}
            onValueChange={(v) => setNewSchool({ ...newSchool, board: v })}
            placeholder="Select board"
          >
            {dropdownOptions.boards.map((board) => (
              <NativeSelectOption key={board} value={board}>{board}</NativeSelectOption>
            ))}
          </NativeSelect>
        </div>
      </div>
      {commonFields}
    </div>
  );

  // Desktop form — uses Radix Select (portal works fine in Dialog)
  const desktopFormFields = (
    <div className="grid gap-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-2">
          <Label>City *</Label>
          <Select value={newSchool.city} onValueChange={(v) => setNewSchool({ ...newSchool, city: v })}>
            <SelectTrigger><SelectValue placeholder="Select city" /></SelectTrigger>
            <SelectContent>
              {dropdownOptions.cities.map((city) => (
                <SelectItem key={city} value={city}>{city}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label>Board *</Label>
          <Select value={newSchool.board} onValueChange={(v) => setNewSchool({ ...newSchool, board: v })}>
            <SelectTrigger><SelectValue placeholder="Select board" /></SelectTrigger>
            <SelectContent>
              {dropdownOptions.boards.map((board) => (
                <SelectItem key={board} value={board}>{board}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      {commonFields}
    </div>
  );

  return (
    <PageContainer>
      {/* ── Mobile Bottom Sheet — completely separate from Dialog ── */}
      {isMobileSheetOpen && (
        <div
          className="md:hidden fixed inset-0 z-[100]"
          style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setIsMobileSheetOpen(false)}
          />
          {/* Sheet */}
          <div
            className="relative bg-background rounded-t-3xl shadow-2xl animate-in slide-in-from-bottom duration-300"
            style={{ maxHeight: '85dvh', display: 'flex', flexDirection: 'column' }}
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1 shrink-0">
              <div className="w-10 h-1 rounded-full bg-border" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-2 pb-4 shrink-0">
              <div>
                <h2 className="text-lg font-bold tracking-tight">Add New School</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Details will be sent for admin approval</p>
              </div>
              <button
                onClick={() => setIsMobileSheetOpen(false)}
                className="h-9 w-9 rounded-full bg-muted flex items-center justify-center"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Scrollable body */}
            <div
              style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch' as any }}
              className="px-5 pb-4"
            >
              {mobileFormFields}
            </div>

            {/* Footer */}
            <div className="px-5 pt-3 pb-6 border-t bg-background shrink-0">
              <Button
                className="w-full h-12 text-sm font-semibold rounded-2xl"
                onClick={handleAddSchool}
              >
                Submit for Approval
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Desktop Dialog ── */}
      <Dialog open={isDesktopDialogOpen} onOpenChange={setIsDesktopDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New School</DialogTitle>
            <DialogDescription>
              Fill in the school details. This will be sent for admin approval.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">{desktopFormFields}</div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDesktopDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddSchool}>Submit for Approval</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Desktop header */}
      <div className="hidden md:block">
        <PageHeader
          title="My Schools"
          description={`${schools.length} schools assigned`}
          action={
            <div className="flex gap-2">
              <Button size="sm" onClick={() => setIsDesktopDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add School
              </Button>
              <Link href="/salesman/schools/replacement">
                <Button variant="outline" size="sm">
                  Request Replacement
                </Button>
              </Link>
            </div>
          }
        />
      </div>

      {/* Mobile Master Tabs */}
      <div className="md:hidden mb-4">
        <div className="flex rounded-2xl bg-muted p-1 gap-1 mb-4">
          <Link href="/salesman/schools" className="flex-1">
            <button className="w-full flex items-center justify-center gap-1.5 rounded-xl py-2.5 px-2 text-xs font-semibold bg-background text-primary shadow-sm">
              My Schools
            </button>
          </Link>
          <Link href="/salesman/qbs" className="flex-1">
            <button className="w-full flex items-center justify-center gap-1.5 rounded-xl py-2.5 px-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-all">
              My QBs
            </button>
          </Link>
          <Link href="/salesman/booksellers" className="flex-1">
            <button className="w-full flex items-center justify-center gap-1.5 rounded-xl py-2.5 px-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-all">
              Book Sellers
            </button>
          </Link>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight">My Schools</h1>
            <p className="text-xs text-muted-foreground mt-0.5">{schools.length} schools assigned</p>
          </div>
          <Button size="sm" className="h-9 px-3" onClick={() => setIsMobileSheetOpen(true)}>
            <Plus className="h-4 w-4 mr-1.5" />
            Add
          </Button>
        </div>
      </div>

      {/* Search — full width, shared */}
      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search schools by name or city..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Desktop filters — 4-col grid */}
      <div className="hidden md:grid md:grid-cols-4 gap-3 mb-6">
        <Select value={boardFilter} onValueChange={setBoardFilter}>
          <SelectTrigger><SelectValue placeholder="All Boards" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Boards</SelectItem>
            {boards.slice(1).map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={cityFilter} onValueChange={setCityFilter}>
          <SelectTrigger><SelectValue placeholder="All Cities" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Cities</SelectItem>
            {cities.slice(1).map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={visitFilter} onValueChange={setVisitFilter}>
          <SelectTrigger><SelectValue placeholder="Visit Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="0">Not Visited</SelectItem>
            <SelectItem value="1">Visited Once</SelectItem>
            <SelectItem value="2+">Visited 2+ times</SelectItem>
            <SelectItem value="pattakat">Pattakat</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={() => { setSearchQuery(""); setBoardFilter("all"); setCityFilter("all"); setVisitFilter("all"); }}>
          <Filter className="h-4 w-4 mr-2" />Reset
        </Button>
      </div>

      {/* Mobile filters — 3 dropdowns in one row + reset icon */}
      <div className="md:hidden mb-4">
        <div className="flex gap-2 items-center">
          <Select value={boardFilter} onValueChange={setBoardFilter}>
            <SelectTrigger className="h-9 text-xs flex-1 min-w-0">
              <SelectValue placeholder="Board" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Boards</SelectItem>
              {boards.slice(1).map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}
            </SelectContent>
          </Select>

          <Select value={cityFilter} onValueChange={setCityFilter}>
            <SelectTrigger className="h-9 text-xs flex-1 min-w-0">
              <SelectValue placeholder="City" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Cities</SelectItem>
              {cities.slice(1).map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>

          <Select value={visitFilter} onValueChange={setVisitFilter}>
            <SelectTrigger className="h-9 text-xs flex-1 min-w-0">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="0">Not Visited</SelectItem>
              <SelectItem value="1">Visited Once</SelectItem>
              <SelectItem value="2+">2+ Visits</SelectItem>
              <SelectItem value="pattakat">Pattakat</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 shrink-0 text-muted-foreground hover:text-destructive"
            onClick={() => { setSearchQuery(""); setBoardFilter("all"); setCityFilter("all"); setVisitFilter("all"); }}
          >
            <Filter className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center justify-between mt-2">
          <p className="text-xs text-muted-foreground">
            Showing {filteredSchools.length} of {schools.length} schools
          </p>
          <Link href="/salesman/schools/replacement" className="text-xs text-primary hover:underline underline-offset-4">
            Request replacement →
          </Link>
        </div>
      </div>

      {/* Results Count — desktop only, mobile shows inline above */}
      <div className="hidden md:block mb-4">
        <p className="text-sm text-muted-foreground">
          Showing {filteredSchools.length} of {schools.length} schools
        </p>
      </div>

      {/* School List */}
      {filteredSchools.length === 0 ? (
        <EmptyState
          icon={Search}
          title="No schools found"
          description="Try adjusting your search or filter criteria"
          action={{
            label: "Reset Filters",
            onClick: () => {
              setSearchQuery("");
              setBoardFilter("all");
              setCityFilter("all");
              setVisitFilter("all");
            },
          }}
        />
      ) : (
        <div className="space-y-3">
          {filteredSchools.map((school) => (
            <Link key={school.id} href={`/salesman/schools/${school.id}`}>
              <Card className="hover:shadow-md transition-all cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-base mb-1 truncate">
                            {school.name}
                          </h3>
                          <div className="flex flex-wrap gap-2 mb-2">
                            <Badge variant="secondary" className="text-xs">
                              {school.board}
                            </Badge>
                            {school.isPattakat && (
                              <Badge variant="destructive" className="text-xs">
                                Pattakat
                              </Badge>
                            )}
                            <Badge
                              variant={school.visitCount >= 2 ? "default" : "outline"}
                              className="text-xs"
                            >
                              {school.visitCount} visits
                            </Badge>
                          </div>
                          <div className="flex flex-col gap-1.5 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1.5">
                              <MapPin className="h-3.5 w-3.5" />
                              <span>{school.city}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Users className="h-3.5 w-3.5" />
                              <span>{school.strength} students</span>
                            </div>
                            {school.lastVisitDate && (
                              <div className="flex items-center gap-1.5">
                                <Calendar className="h-3.5 w-3.5" />
                                <span>
                                  Last visit:{" "}
                                  {new Date(school.lastVisitDate).toLocaleDateString()}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-1" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </PageContainer>
  );
}
