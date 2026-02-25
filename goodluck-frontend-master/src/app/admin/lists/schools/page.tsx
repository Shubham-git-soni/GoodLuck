"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, Filter, Plus, MapPin, Calendar, Users, ChevronRight, X, Trash2, UserPlus } from "lucide-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ListItemSkeleton } from "@/components/ui/skeleton-loaders";
import EmptyState from "@/components/ui/empty-state";
import { School } from "@/types";
import { toast } from "sonner";

// Import mock data
import schoolsData from "@/lib/mock-data/schools.json";
import dropdownOptions from "@/lib/mock-data/dropdown-options.json";

// ─── Types ────────────────────────────────────────────────────────────────────
interface ContactPerson {
  id: string;
  name: string;
  designation: string;
  email: string;
  mobile: string;
}

interface NewSchoolForm {
  name: string;
  city: string;
  board: string;
  strength: string;
  email: string;
  contactNo: string;
  address: string;
  contacts: ContactPerson[];
}

const emptyContact = (): ContactPerson => ({
  id: Date.now().toString() + Math.random(),
  name: "",
  designation: "",
  email: "",
  mobile: "",
});

const defaultForm = (): NewSchoolForm => ({
  name: "",
  city: "",
  board: "",
  strength: "",
  email: "",
  contactNo: "",
  address: "",
  contacts: [emptyContact()],
});

// ─── Component ────────────────────────────────────────────────────────────────
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
  const [activeTab, setActiveTab] = useState("basic");

  // Add School Form State
  const [newSchool, setNewSchool] = useState<NewSchoolForm>(defaultForm());

  useEffect(() => {
    setTimeout(() => {
      setSchools(schoolsData as School[]);
      setFilteredSchools(schoolsData as School[]);
      setIsLoading(false);
    }, 800);
  }, []);

  useEffect(() => {
    let filtered = schools;
    if (searchQuery) {
      filtered = filtered.filter(
        (school) =>
          school.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          school.city.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (boardFilter !== "all") filtered = filtered.filter((s) => s.board === boardFilter);
    if (cityFilter !== "all") filtered = filtered.filter((s) => s.city === cityFilter);
    if (visitFilter !== "all") {
      if (visitFilter === "0") filtered = filtered.filter((s) => s.visitCount === 0);
      else if (visitFilter === "1") filtered = filtered.filter((s) => s.visitCount === 1);
      else if (visitFilter === "2+") filtered = filtered.filter((s) => s.visitCount >= 2);
      else if (visitFilter === "pattakat") filtered = filtered.filter((s) => s.isPattakat);
    }
    setFilteredSchools(filtered);
  }, [searchQuery, boardFilter, cityFilter, visitFilter, schools]);

  const boards = ["all", ...Array.from(new Set(schools.map((s) => s.board)))];
  const cities = ["all", ...Array.from(new Set(schools.map((s) => s.city)))];

  // ── Contact Persons Handlers ────────────────────────────────────────────
  const updateContact = (idx: number, field: keyof ContactPerson, value: string) => {
    setNewSchool((prev) => {
      const updated = [...prev.contacts];
      updated[idx] = { ...updated[idx], [field]: value };
      return { ...prev, contacts: updated };
    });
  };

  const addContact = () => {
    setNewSchool((prev) => ({ ...prev, contacts: [...prev.contacts, emptyContact()] }));
  };

  const removeContact = (idx: number) => {
    setNewSchool((prev) => ({
      ...prev,
      contacts: prev.contacts.filter((_, i) => i !== idx),
    }));
  };

  // ── Submit ──────────────────────────────────────────────────────────────
  const handleAddSchool = () => {
    if (!newSchool.name || !newSchool.city || !newSchool.board) {
      toast.error("Please fill all required fields in Basic Info");
      setActiveTab("basic");
      return;
    }
    const invalidContact = newSchool.contacts.find((c) => !c.name);
    if (invalidContact) {
      toast.error("Each contact person must have at least a name");
      setActiveTab("contacts");
      return;
    }
    toast.success(`School "${newSchool.name}" added with ${newSchool.contacts.length} contact(s)!`);
    setIsMobileSheetOpen(false);
    setIsDesktopDialogOpen(false);
    setNewSchool(defaultForm());
    setActiveTab("basic");
  };

  const openDialog = () => {
    setNewSchool(defaultForm());
    setActiveTab("basic");
    setIsDesktopDialogOpen(true);
  };

  const openSheet = () => {
    setNewSchool(defaultForm());
    setActiveTab("basic");
    setIsMobileSheetOpen(true);
  };

  if (isLoading) {
    return (
      <PageContainer>
        <PageHeader title="All Schools" description="Manage all schools" />
        <div className="space-y-3">
          <ListItemSkeleton /><ListItemSkeleton /><ListItemSkeleton /><ListItemSkeleton />
        </div>
      </PageContainer>
    );
  }

  // ── Shared Basic Info Fields ─────────────────────────────────────────────
  const BasicInfoFields = ({ isMobile = false }: { isMobile?: boolean }) => (
    <div className="grid gap-4">
      <div className="grid gap-2">
        <Label>School Name <span className="text-destructive">*</span></Label>
        <Input
          value={newSchool.name}
          onChange={(e) => setNewSchool({ ...newSchool, name: e.target.value })}
          placeholder="Enter school name"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-2">
          <Label>City <span className="text-destructive">*</span></Label>
          {isMobile ? (
            <NativeSelect value={newSchool.city} onValueChange={(v) => setNewSchool({ ...newSchool, city: v })} placeholder="Select city">
              {dropdownOptions.cities.map((c) => <NativeSelectOption key={c} value={c}>{c}</NativeSelectOption>)}
            </NativeSelect>
          ) : (
            <Select value={newSchool.city} onValueChange={(v) => setNewSchool({ ...newSchool, city: v })}>
              <SelectTrigger><SelectValue placeholder="Select city" /></SelectTrigger>
              <SelectContent>{dropdownOptions.cities.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
          )}
        </div>
        <div className="grid gap-2">
          <Label>Board <span className="text-destructive">*</span></Label>
          {isMobile ? (
            <NativeSelect value={newSchool.board} onValueChange={(v) => setNewSchool({ ...newSchool, board: v })} placeholder="Select board">
              {dropdownOptions.boards.map((b) => <NativeSelectOption key={b} value={b}>{b}</NativeSelectOption>)}
            </NativeSelect>
          ) : (
            <Select value={newSchool.board} onValueChange={(v) => setNewSchool({ ...newSchool, board: v })}>
              <SelectTrigger><SelectValue placeholder="Select board" /></SelectTrigger>
              <SelectContent>{dropdownOptions.boards.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
            </Select>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-2">
          <Label>Student Strength</Label>
          <Input
            type="number"
            value={newSchool.strength}
            onChange={(e) => setNewSchool({ ...newSchool, strength: e.target.value })}
            placeholder="e.g. 800"
          />
        </div>
        <div className="grid gap-2">
          <Label>School Contact No.</Label>
          <Input
            type="tel"
            inputMode="numeric"
            maxLength={10}
            value={newSchool.contactNo}
            onChange={(e) => setNewSchool({ ...newSchool, contactNo: e.target.value.replace(/\D/g, "") })}
            placeholder="10-digit number"
          />
        </div>
      </div>

      <div className="grid gap-2">
        <Label>School Email</Label>
        <Input
          type="email"
          value={newSchool.email}
          onChange={(e) => setNewSchool({ ...newSchool, email: e.target.value })}
          placeholder="school@example.com"
        />
      </div>

      <div className="grid gap-2">
        <Label>Address</Label>
        <Textarea
          value={newSchool.address}
          onChange={(e) => setNewSchool({ ...newSchool, address: e.target.value })}
          placeholder="Full school address"
          rows={2}
        />
      </div>
    </div>
  );

  // ── Contact Person Fields ────────────────────────────────────────────────
  const ContactPersonsFields = ({ isMobile = false }: { isMobile?: boolean }) => (
    <div className="grid gap-4">
      {newSchool.contacts.map((contact, idx) => (
        <div key={contact.id} className="border rounded-xl p-4 relative bg-muted/20">
          {/* Contact # heading + remove button */}
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-muted-foreground">Contact Person {idx + 1}</p>
            {newSchool.contacts.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-destructive hover:bg-destructive/10"
                onClick={() => removeContact(idx)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>

          <div className="grid gap-3">
            <div className="grid gap-2">
              <Label>Name <span className="text-destructive">*</span></Label>
              <Input
                value={contact.name}
                onChange={(e) => updateContact(idx, "name", e.target.value)}
                placeholder="Contact person name"
              />
            </div>

            <div className="grid gap-2">
              <Label>Designation</Label>
              {isMobile ? (
                <NativeSelect value={contact.designation} onValueChange={(v) => updateContact(idx, "designation", v)} placeholder="Select designation">
                  {dropdownOptions.contactRoles.map((r) => <NativeSelectOption key={r} value={r}>{r}</NativeSelectOption>)}
                </NativeSelect>
              ) : (
                <Select value={contact.designation} onValueChange={(v) => updateContact(idx, "designation", v)}>
                  <SelectTrigger><SelectValue placeholder="Select designation" /></SelectTrigger>
                  <SelectContent>
                    {dropdownOptions.contactRoles.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label>Mobile No.</Label>
                <Input
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  value={contact.mobile}
                  onChange={(e) => updateContact(idx, "mobile", e.target.value.replace(/\D/g, ""))}
                  placeholder="10-digit number"
                />
              </div>
              <div className="grid gap-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={contact.email}
                  onChange={(e) => updateContact(idx, "email", e.target.value)}
                  placeholder="Email address"
                />
              </div>
            </div>
          </div>
        </div>
      ))}

      <Button
        type="button"
        variant="outline"
        className="w-full border-dashed text-muted-foreground hover:text-foreground"
        onClick={addContact}
      >
        <UserPlus className="h-4 w-4 mr-2" />
        Add Another Contact Person
      </Button>
    </div>
  );

  // ── Tabbed Form ──────────────────────────────────────────────────────────
  const TabbedForm = ({ isMobile = false }: { isMobile?: boolean }) => (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-2 mb-4">
        <TabsTrigger value="basic">Basic Info</TabsTrigger>
        <TabsTrigger value="contacts">
          Contact Persons
          {newSchool.contacts.length > 0 && (
            <Badge variant="secondary" className="ml-2 h-5 px-1.5 text-[10px]">
              {newSchool.contacts.length}
            </Badge>
          )}
        </TabsTrigger>
      </TabsList>
      <TabsContent value="basic">
        <BasicInfoFields isMobile={isMobile} />
      </TabsContent>
      <TabsContent value="contacts">
        <ContactPersonsFields isMobile={isMobile} />
      </TabsContent>
    </Tabs>
  );

  return (
    <PageContainer>
      {/* ── Mobile Bottom Sheet ── */}
      {isMobileSheetOpen && (
        <div className="md:hidden fixed inset-0 z-[100]" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
          <div className="absolute inset-0 bg-black/60" onClick={() => setIsMobileSheetOpen(false)} />
          <div className="relative bg-background rounded-t-3xl shadow-2xl animate-in slide-in-from-bottom duration-300" style={{ maxHeight: '90dvh', display: 'flex', flexDirection: 'column' }}>
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1 shrink-0">
              <div className="w-10 h-1 rounded-full bg-border" />
            </div>
            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-2 pb-3 shrink-0">
              <div>
                <h2 className="text-lg font-bold tracking-tight">Add New School</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Fill both tabs before submitting</p>
              </div>
              <button onClick={() => setIsMobileSheetOpen(false)} className="h-9 w-9 rounded-full bg-muted flex items-center justify-center">
                <X className="h-4 w-4" />
              </button>
            </div>
            {/* Scrollable body */}
            <div style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch' as any }} className="px-5 pb-4">
              <TabbedForm isMobile />
            </div>
            {/* Footer */}
            <div className="px-5 pt-3 pb-6 border-t bg-background shrink-0">
              <Button className="w-full h-12 text-sm font-semibold rounded-2xl" onClick={handleAddSchool}>
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
              Fill in the Basic Info and add Contact Persons. Multiple contacts are supported.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <TabbedForm />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDesktopDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddSchool}>Submit for Approval</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Desktop header */}
      <div className="hidden md:block">
        <PageHeader
          title="All Schools"
          description={`${schools.length} total schools`}
          action={
            <Button size="sm" onClick={openDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Add School
            </Button>
          }
        />
      </div>

      {/* Mobile Header */}
      <div className="md:hidden mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight">All Schools</h1>
            <p className="text-xs text-muted-foreground mt-0.5">{schools.length} total schools</p>
          </div>
          <Button size="sm" className="h-9 px-3" onClick={openSheet}>
            <Plus className="h-4 w-4 mr-1.5" />Add
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search schools by name or city..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Desktop filters */}
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

      {/* Mobile filters */}
      <div className="md:hidden mb-4">
        <div className="flex gap-2 items-center">
          <Select value={boardFilter} onValueChange={setBoardFilter}>
            <SelectTrigger className="h-9 text-xs flex-1 min-w-0"><SelectValue placeholder="Board" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Boards</SelectItem>
              {boards.slice(1).map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={cityFilter} onValueChange={setCityFilter}>
            <SelectTrigger className="h-9 text-xs flex-1 min-w-0"><SelectValue placeholder="City" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Cities</SelectItem>
              {cities.slice(1).map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={visitFilter} onValueChange={setVisitFilter}>
            <SelectTrigger className="h-9 text-xs flex-1 min-w-0"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="0">Not Visited</SelectItem>
              <SelectItem value="1">Visited Once</SelectItem>
              <SelectItem value="2+">2+ Visits</SelectItem>
              <SelectItem value="pattakat">Pattakat</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0 text-muted-foreground hover:text-destructive"
            onClick={() => { setSearchQuery(""); setBoardFilter("all"); setCityFilter("all"); setVisitFilter("all"); }}>
            <Filter className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center justify-between mt-2">
          <p className="text-xs text-muted-foreground">
            Showing {filteredSchools.length} of {schools.length} schools
          </p>
        </div>
      </div>

      {/* Results Count — desktop only */}
      <div className="hidden md:block mb-4">
        <p className="text-sm text-muted-foreground">Showing {filteredSchools.length} of {schools.length} schools</p>
      </div>

      {/* School List */}
      {filteredSchools.length === 0 ? (
        <EmptyState
          icon={Search}
          title="No schools found"
          description="Try adjusting your search or filter criteria"
          action={{ label: "Reset Filters", onClick: () => { setSearchQuery(""); setBoardFilter("all"); setCityFilter("all"); setVisitFilter("all"); } }}
        />
      ) : (
        <div className="space-y-3">
          {filteredSchools.map((school) => (
            <Link key={school.id} href={`/admin/lists/schools/${school.id}`}>
              <Card className="hover:shadow-md transition-all cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-base mb-1 truncate">{school.name}</h3>
                          <div className="flex flex-wrap gap-2 mb-2">
                            <Badge variant="secondary" className="text-xs">{school.board}</Badge>
                            {school.isPattakat && <Badge variant="destructive" className="text-xs">Pattakat</Badge>}
                            <Badge variant={school.visitCount >= 2 ? "default" : "outline"} className="text-xs">
                              {school.visitCount} visits
                            </Badge>
                          </div>
                          <div className="flex flex-col gap-1.5 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1.5">
                              <MapPin className="h-3.5 w-3.5" /><span>{school.city}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Users className="h-3.5 w-3.5" /><span>{school.strength} students</span>
                            </div>
                            {school.lastVisitDate && (
                              <div className="flex items-center gap-1.5">
                                <Calendar className="h-3.5 w-3.5" />
                                <span>Last visit: {new Date(school.lastVisitDate).toLocaleDateString()}</span>
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
