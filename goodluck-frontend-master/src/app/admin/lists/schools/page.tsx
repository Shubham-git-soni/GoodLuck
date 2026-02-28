"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X, Trash2, UserPlus, Eye, Pencil, Phone, Mail, UserCircle, School as SchoolIcon, Users } from "lucide-react";
import PageContainer from "@/components/layouts/PageContainer";
import PageHeader from "@/components/layouts/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ListItemSkeleton } from "@/components/ui/skeleton-loaders";
import { School } from "@/types";
import { toast } from "sonner";
import { DataGrid, GridColumn, RowAction } from "@/components/ui/data-grid";
import { MultiSelect } from "@/components/ui/multi-select";

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
  // Sales Info
  station: string;
  salesTarget: string;
  prescribeSubjects: string[];
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
  station: "",
  salesTarget: "",
  prescribeSubjects: [],
});

// ─── Component ────────────────────────────────────────────────────────────────
export default function SchoolListPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [schools, setSchools] = useState<School[]>([]);
  const [isMobileSheetOpen, setIsMobileSheetOpen] = useState(false);
  const [isDesktopDialogOpen, setIsDesktopDialogOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit" | "view">("add");
  const [activeSchoolId, setActiveSchoolId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("basic");
  const [viewSchool, setViewSchool] = useState<School | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Add School Form State
  const [newSchool, setNewSchool] = useState<NewSchoolForm>(defaultForm());

  useEffect(() => {
    setTimeout(() => {
      setSchools(schoolsData as School[]);
      setIsLoading(false);
    }, 800);
  }, []);

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
  const handleSubmitSchool = () => {
    if (modalMode === "view") {
      setIsMobileSheetOpen(false);
      setIsDesktopDialogOpen(false);
      return;
    }
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
    const salesTargetNum = parseFloat(newSchool.salesTarget) || 0;
    const prescribedBooks = newSchool.prescribeSubjects.map(sub => ({
      subject: sub, class: "Any", book: `${sub} Book`, status: "Under Review"
    }));

    if (modalMode === "add") {
      const newEntry: School = {
        id: `SCH${String(schools.length + 1).padStart(3, "0")}`,
        name: newSchool.name,
        city: newSchool.city,
        board: newSchool.board,
        strength: parseInt(newSchool.strength) || 0,
        address: newSchool.address,
        state: "",
        station: newSchool.station,
        assignedTo: "",
        visitCount: 0,
        businessHistory: [],
        discountHistory: [],
        salesPlan: { targetRevenue: salesTargetNum, subjects: newSchool.prescribeSubjects, expectedConversion: 0 },
        prescribedBooks,
        contacts: newSchool.contacts.map((c, i) => ({
          id: c.id, name: c.name, role: c.designation, email: c.email, phone: c.mobile,
          isPrimary: i === 0,
        })),
      } as any;
      setSchools(prev => [newEntry, ...prev]);
      toast.success(`School "${newSchool.name}" added successfully!`);
    } else if (modalMode === "edit" && activeSchoolId) {
      setSchools(prev => prev.map(s => s.id === activeSchoolId ? {
        ...s,
        name: newSchool.name,
        city: newSchool.city,
        board: newSchool.board,
        strength: parseInt(newSchool.strength) || 0,
        address: newSchool.address,
        station: newSchool.station,
        salesPlan: { ...s.salesPlan, targetRevenue: salesTargetNum, subjects: newSchool.prescribeSubjects },
        prescribedBooks,
        contacts: newSchool.contacts.map((c, i) => ({
          id: c.id, name: c.name, role: c.designation, email: c.email, phone: c.mobile,
          isPrimary: i === 0,
        })),
      } : s));
      toast.success(`School "${newSchool.name}" updated successfully!`);
    }
    setIsMobileSheetOpen(false);
    setIsDesktopDialogOpen(false);
    setNewSchool(defaultForm());
    setActiveTab("basic");
  };

  const openModal = (mode: "add" | "edit" | "view", school?: School) => {
    setModalMode(mode);
    setActiveSchoolId(school?.id || null);
    if (school) {
      setNewSchool({
        name: school.name,
        city: school.city,
        board: school.board,
        strength: school.strength?.toString() || "",
        email: school.contacts?.[0]?.email || "",
        contactNo: school.contacts?.[0]?.phone || "",
        address: school.address || "",
        contacts: school.contacts?.length ? school.contacts.map(c => ({
          id: c.id, name: c.name, designation: c.role || "", email: c.email || "", mobile: c.phone || ""
        })) : [emptyContact()],
        station: school.station || "",
        salesTarget: school.salesPlan?.targetRevenue?.toString() || "",
        prescribeSubjects: school.prescribedBooks?.map((b: any) => b.subject) || [],
      });
    } else {
      setNewSchool(defaultForm());
    }
    setActiveTab("basic");
    if (window.innerWidth < 768) {
      setIsMobileSheetOpen(true);
    } else {
      setIsDesktopDialogOpen(true);
    }
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

  const SCHOOL_COLUMNS: GridColumn<School>[] = [
    { key: "name", header: "School Name", pinned: "left", minWidth: 200, sortable: true, filterable: true, render: (_, row) => <span className="font-semibold text-sm text-primary">{row.name}</span> },
    { key: "id", header: "School ID", width: 100, sortable: true, filterable: true, render: (val) => <span className="text-xs text-muted-foreground">{val}</span> },
    { key: "board", header: "Board", width: 90, sortable: true, filterable: true, render: (val) => <Badge variant="secondary" className="text-[10px]">{val}</Badge> },
    { key: "strength", header: "Strength", width: 100, sortable: true, align: "right", render: (val) => <span className="text-xs font-medium">{val?.toLocaleString() || "0"}</span> },
    { key: "contact", header: "Contact", width: 110, render: (_, row) => <span className="text-xs text-muted-foreground">{row.contacts?.[0]?.phone || "N/A"}</span> },
    { key: "email", header: "Email", width: 180, render: (_, row) => <div className="text-xs text-muted-foreground truncate" title={row.contacts?.[0]?.email}>{row.contacts?.[0]?.email || "N/A"}</div> },
    { key: "visitCount", header: "Visits", width: 80, sortable: true, align: "center", render: (val) => <Badge variant={val >= 2 ? "default" : "outline"} className="text-[10px]">{val}</Badge> },
    { key: "address", header: "Address", width: 220, render: (val) => <div className="text-xs text-muted-foreground truncate" title={val}>{val}</div> },
    { key: "state", header: "State", width: 120, sortable: true, filterable: true, render: (val) => <span className="text-xs">{val}</span> },
    { key: "city", header: "City", width: 120, sortable: true, filterable: true, render: (val) => <span className="text-xs">{val}</span> },
    {
      key: "station", header: "Station", width: 130, sortable: true, filterable: true,
      render: (val) => <span className="text-xs">{val || "—"}</span>,
    },
    {
      key: "salesTarget", header: "Sales Target", width: 130, align: "right", mobileFullWidth: true,
      render: (_, row) => (
        <span className="text-xs font-semibold text-emerald-700">
          {row.salesPlan?.targetRevenue ? `₹ ${row.salesPlan.targetRevenue.toLocaleString()}` : "—"}
        </span>
      ),
    },
    {
      key: "tryToPrescribe", header: "Try to Prescribe", width: 260, mobileFullWidth: true,
      mobileRender: (_, row) => {
        const subjects = row.prescribedBooks?.map((b: any) => b.subject) || [];
        if (!subjects.length) return <span className="text-xs text-muted-foreground">—</span>;
        return (
          <div className="flex flex-wrap gap-1">
            {subjects.map((s: string) => (
              <span key={s} className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-orange-100 text-orange-700">{s}</span>
            ))}
          </div>
        );
      },
      render: (_, row) => {
        const subjects = row.prescribedBooks?.map((b: any) => b.subject) || [];
        if (!subjects.length) return <span className="text-xs text-muted-foreground">—</span>;
        return (
          <div className="flex flex-wrap gap-1">
            {subjects.map((s: string) => (
              <span key={s} className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-orange-100/80 text-orange-700">{s}</span>
            ))}
          </div>
        );
      },
    }
  ];

  const rowActions: RowAction<School>[] = [
    {
      label: "View",
      icon: <Eye className="h-3.5 w-3.5" />,
      onClick: (s) => {
        if (window.innerWidth < 768) {
          setViewSchool(s);
        } else {
          openModal("view", s);
        }
      }
    },
    { label: "Edit", icon: <Pencil className="h-3.5 w-3.5" />, onClick: (s) => openModal("edit", s) },
    { label: "Delete", icon: <Trash2 className="h-3.5 w-3.5" />, onClick: () => toast.info("Delete confirmed..."), danger: true },
  ];

  // ── Shared Basic Info Fields ─────────────────────────────────────────────
  const BasicInfoFields = ({ isMobile = false }: { isMobile?: boolean }) => (
    <div className="grid gap-4">
      <div className="grid gap-2">
        <Label>School Name <span className="text-destructive">*</span></Label>
        <Input
          value={newSchool.name}
          onChange={(e) => setNewSchool({ ...newSchool, name: e.target.value })}
          placeholder="Enter school name"
          readOnly={modalMode === "view"}
          className={modalMode === "view" ? "bg-muted/50 pointer-events-none" : ""}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-2">
          <Label>City <span className="text-destructive">*</span></Label>
          {isMobile ? (
            <NativeSelect disabled={modalMode === "view"} value={newSchool.city} onValueChange={(v) => setNewSchool({ ...newSchool, city: v })} placeholder="Select city">
              {dropdownOptions.cities.map((c) => <NativeSelectOption key={c} value={c}>{c}</NativeSelectOption>)}
            </NativeSelect>
          ) : (
            <Select disabled={modalMode === "view"} value={newSchool.city} onValueChange={(v) => setNewSchool({ ...newSchool, city: v })}>
              <SelectTrigger className={modalMode === "view" ? "bg-muted/50" : ""}><SelectValue placeholder="Select city" /></SelectTrigger>
              <SelectContent>{dropdownOptions.cities.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
          )}
        </div>
        <div className="grid gap-2">
          <Label>Board <span className="text-destructive">*</span></Label>
          {isMobile ? (
            <NativeSelect disabled={modalMode === "view"} value={newSchool.board} onValueChange={(v) => setNewSchool({ ...newSchool, board: v })} placeholder="Select board">
              {dropdownOptions.boards.map((b) => <NativeSelectOption key={b} value={b}>{b}</NativeSelectOption>)}
            </NativeSelect>
          ) : (
            <Select disabled={modalMode === "view"} value={newSchool.board} onValueChange={(v) => setNewSchool({ ...newSchool, board: v })}>
              <SelectTrigger className={modalMode === "view" ? "bg-muted/50" : ""}><SelectValue placeholder="Select board" /></SelectTrigger>
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
            readOnly={modalMode === "view"}
            className={modalMode === "view" ? "bg-muted/50 pointer-events-none" : ""}
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
            readOnly={modalMode === "view"}
            className={modalMode === "view" ? "bg-muted/50 pointer-events-none" : ""}
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
          readOnly={modalMode === "view"}
          className={modalMode === "view" ? "bg-muted/50 pointer-events-none" : ""}
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
            {newSchool.contacts.length > 1 && modalMode !== "view" && (
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
                readOnly={modalMode === "view"}
                className={modalMode === "view" ? "bg-muted/50 pointer-events-none" : ""}
              />
            </div>

            <div className="grid gap-2">
              <Label>Designation</Label>
              {isMobile ? (
                <NativeSelect disabled={modalMode === "view"} value={contact.designation} onValueChange={(v) => updateContact(idx, "designation", v)} placeholder="Select designation">
                  {dropdownOptions.contactRoles.map((r) => <NativeSelectOption key={r} value={r}>{r}</NativeSelectOption>)}
                </NativeSelect>
              ) : (
                <Select disabled={modalMode === "view"} value={contact.designation} onValueChange={(v) => updateContact(idx, "designation", v)}>
                  <SelectTrigger className={modalMode === "view" ? "bg-muted/50" : ""}><SelectValue placeholder="Select designation" /></SelectTrigger>
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
                  readOnly={modalMode === "view"}
                  className={modalMode === "view" ? "bg-muted/50 pointer-events-none" : ""}
                />
              </div>
              <div className="grid gap-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={contact.email}
                  onChange={(e) => updateContact(idx, "email", e.target.value)}
                  placeholder="Email address"
                  readOnly={modalMode === "view"}
                  className={modalMode === "view" ? "bg-muted/50 pointer-events-none" : ""}
                />
              </div>
            </div>
          </div>
        </div>
      ))}

      {modalMode !== "view" && (
        <Button
          type="button"
          variant="outline"
          className="w-full border-dashed text-muted-foreground hover:text-foreground"
          onClick={addContact}
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Add Another Contact Person
        </Button>
      )}
    </div>
  );

  // ── Sales Info Fields ────────────────────────────────────────────────────
  const SalesInfoFields = ({ isMobile = false }: { isMobile?: boolean }) => (
    <div className="grid gap-4">
      <div className="grid gap-2">
        <Label>Station Allocation</Label>
        {isMobile ? (
          <NativeSelect disabled={modalMode === "view"} value={newSchool.station} onValueChange={(v) => setNewSchool({ ...newSchool, station: v })} placeholder="Select station">
            {Array.from(new Set(schools.map(s => s.station))).filter(Boolean).map((st) => (
              <NativeSelectOption key={st} value={st}>{st}</NativeSelectOption>
            ))}
          </NativeSelect>
        ) : (
          <Select disabled={modalMode === "view"} value={newSchool.station} onValueChange={(v) => setNewSchool({ ...newSchool, station: v })}>
            <SelectTrigger className={modalMode === "view" ? "bg-muted/50" : ""}><SelectValue placeholder="Select station" /></SelectTrigger>
            <SelectContent>
              {Array.from(new Set(schools.map(s => s.station))).filter(Boolean).map((st) => (
                <SelectItem key={st} value={st}>{st}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      <div className="grid gap-2">
        <Label>Sales Target (₹)</Label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium">₹</span>
          <Input
            type="number"
            value={newSchool.salesTarget}
            onChange={(e) => setNewSchool({ ...newSchool, salesTarget: e.target.value })}
            placeholder="e.g. 500000"
            readOnly={modalMode === "view"}
            className={`pl-7 ${modalMode === "view" ? "bg-muted/50 pointer-events-none" : ""}`}
          />
        </div>
      </div>

      <div className="grid gap-2">
        <Label>Try to Prescribe (Subjects)</Label>
        {modalMode === "view" ? (
          <div className="flex flex-wrap gap-1.5 p-3 rounded-lg bg-muted/50 min-h-10">
            {newSchool.prescribeSubjects.length ? newSchool.prescribeSubjects.map(s => (
              <span key={s} className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-orange-100 text-orange-700">{s}</span>
            )) : <span className="text-xs text-muted-foreground">None selected</span>}
          </div>
        ) : (
          <MultiSelect
            options={dropdownOptions.subjects.map(sub => ({ label: sub, value: sub }))}
            value={newSchool.prescribeSubjects}
            onChange={(v) => setNewSchool({ ...newSchool, prescribeSubjects: v })}
            placeholder="Select subjects to prescribe..."
            className="[&_div[role=button]]:min-h-10 [&_div[role=button]]:py-1.5 [&_div[role=button]]:px-3 text-sm w-full"
          />
        )}
      </div>
    </div>
  );

  // ── Tabbed Form ──────────────────────────────────────────────────────────
  const TabbedForm = ({ isMobile = false }: { isMobile?: boolean }) => (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-3 mb-4">
        <TabsTrigger value="basic">Basic Info</TabsTrigger>
        <TabsTrigger value="sales">Sales Info</TabsTrigger>
        <TabsTrigger value="contacts">
          Contacts
          {newSchool.contacts.length > 0 && (
            <Badge variant="secondary" className="ml-1.5 h-5 px-1.5 text-[10px]">
              {newSchool.contacts.length}
            </Badge>
          )}
        </TabsTrigger>
      </TabsList>
      <TabsContent value="basic">
        <BasicInfoFields isMobile={isMobile} />
      </TabsContent>
      <TabsContent value="sales">
        <SalesInfoFields isMobile={isMobile} />
      </TabsContent>
      <TabsContent value="contacts">
        <ContactPersonsFields isMobile={isMobile} />
      </TabsContent>
    </Tabs>
  );

  return (
    <PageContainer>
      {/* ── Mobile View Bottom Sheet ── */}
      {isMobile && viewSchool && (
        <div className="fixed inset-0 z-[100] flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/60" onClick={() => setViewSchool(null)} />
          <div className="relative bg-background rounded-t-3xl shadow-2xl animate-in slide-in-from-bottom duration-300" style={{ maxHeight: "92dvh", display: "flex", flexDirection: "column" }}>
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1 shrink-0">
              <div className="w-10 h-1 rounded-full bg-border" />
            </div>
            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-1 pb-3 shrink-0">
              <h2 className="text-lg font-bold tracking-tight flex items-center gap-2">
                <SchoolIcon className="h-4 w-4" /> School Details
              </h2>
              <button onClick={() => setViewSchool(null)} className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                <X className="h-4 w-4" />
              </button>
            </div>
            {/* Content */}
            <div className="flex-1 overflow-y-auto px-5 pb-4">
              {/* Identity card */}
              <div className="flex items-center gap-3 mb-4 p-3 bg-muted/40 rounded-2xl">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-sm font-bold text-primary">
                    {viewSchool.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-base leading-tight">{viewSchool.name}</p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">{viewSchool.board}</span>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 flex items-center gap-1">
                      <Users className="h-3 w-3" />{viewSchool.strength?.toLocaleString() || "0"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Info rows */}
              <div className="space-y-0 divide-y divide-border/50">
                {[
                  { label: "School ID", value: viewSchool.id },
                  { label: "City", value: viewSchool.city || "—" },
                  { label: "State", value: viewSchool.state || "—" },
                  { label: "Station", value: viewSchool.station || "—" },
                  { label: "Contact", value: viewSchool.contacts?.[0]?.phone || "—" },
                  { label: "Email", value: viewSchool.contacts?.[0]?.email || "—" },
                  { label: "Visits", value: viewSchool.visitCount?.toString() || "0" },
                  { label: "Address", value: viewSchool.address || "—" },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-start justify-between py-3 gap-2">
                    <p className="text-xs text-muted-foreground font-medium shrink-0">{label}</p>
                    <p className="text-sm font-semibold text-right break-all">{value}</p>
                  </div>
                ))}
              </div>

              {/* Contacts section */}
              {viewSchool.contacts && viewSchool.contacts.length > 0 && (
                <div className="mt-4">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Contact Persons</p>
                  <div className="space-y-2">
                    {viewSchool.contacts.map((contact, idx: number) => (
                      <div key={idx} className="p-3 rounded-xl bg-muted/30 border border-border/50">
                        <p className="font-semibold text-sm">{contact.name}</p>
                        {contact.role && <p className="text-xs text-muted-foreground mt-0.5">{contact.role}</p>}
                        <div className="flex gap-4 mt-2">
                          {contact.phone && (
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <Phone className="h-3 w-3" />{contact.phone}
                            </div>
                          )}
                          {contact.email && (
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground min-w-0">
                              <Mail className="h-3 w-3 shrink-0" /><span className="truncate">{contact.email}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            {/* Footer */}
            <div className="shrink-0 px-5 pb-6 pt-3 border-t flex gap-3">
              <Button
                variant="outline"
                className="flex-1 h-12 rounded-2xl"
                onClick={() => { setViewSchool(null); router.push(`/admin/lists/schools/${viewSchool.id}`); }}
              >
                Full Profile
              </Button>
              <Button className="flex-1 h-12 rounded-2xl" variant="outline" onClick={() => setViewSchool(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Mobile Bottom Sheet (Add/Edit) ── */}
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
                <h2 className="text-lg font-bold tracking-tight">
                  {modalMode === "add" ? "Add New School" : modalMode === "edit" ? "Edit School" : "View School Details"}
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {modalMode === "view" ? "School details and contact persons." : "Fill both tabs before submitting"}
                </p>
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
              <Button className="w-full h-12 text-sm font-semibold rounded-2xl" onClick={handleSubmitSchool}>
                {modalMode === "view" ? "Close" : modalMode === "edit" ? "Save Changes" : "Add School"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Desktop Dialog ── */}
      <Dialog open={isDesktopDialogOpen} onOpenChange={setIsDesktopDialogOpen}>
        <DialogContent className="!w-[75vw] !max-w-[75vw] h-[80vh] max-h-[80vh] flex flex-col p-0 gap-0 overflow-hidden">
          <DialogHeader className="px-6 pt-5 pb-4 shrink-0 border-b">
            <DialogTitle>
              {modalMode === "add" ? "Add New School" : modalMode === "edit" ? "Edit School" : "View School Details"}
            </DialogTitle>
            <DialogDescription>
              {modalMode === "view" ? "Review the complete school profile." : "Fill in the Basic Info and add Contact Persons. Multiple contacts are supported."}
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto px-6 py-5 bg-muted/10">
            <TabbedForm />
          </div>
          <DialogFooter className="px-6 py-4 border-t bg-background shrink-0">
            <Button variant="outline" onClick={() => setIsDesktopDialogOpen(false)}>Close</Button>
            {modalMode !== "view" && (
              <Button onClick={handleSubmitSchool}>
                {modalMode === "edit" ? "Save Changes" : "Add School"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Desktop header */}
      <div className="hidden md:block">
        <PageHeader
          title="All Schools"
          description={`${schools.length} total schools`}
          action={
            <Button size="sm" onClick={() => openModal("add")}>
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
          <Button size="sm" className="h-9 px-3" onClick={() => openModal("add")}>
            <Plus className="h-4 w-4 mr-1.5" />Add
          </Button>
        </div>
      </div>



      {/* School List */}
      <DataGrid
        data={schools}
        columns={SCHOOL_COLUMNS}
        rowKey="id"
        defaultPageSize={15}
        selectable
        enableRowPinning
        enableColumnPinning
        striped
        inlineFilters
        density="compact"
        rowActions={rowActions}
        canExpandRow={(row) => !!(row.contacts && row.contacts.length > 0)}
        expandedRowRender={(row) => {
          if (!row.contacts || row.contacts.length === 0) return null;
          return (
            <div className="bg-[#fafafa] dark:bg-muted/10 p-6 shadow-[inset_0_5px_8px_-4px_rgba(0,0,0,0.05)]">
              <div className="mb-4 flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                <UserCircle className="h-4 w-4" />
                {row.contacts.length} Contact Person{row.contacts.length !== 1 ? "s" : ""}
              </div>
              <div className="flex flex-wrap gap-4">
                {row.contacts.map((contact, idx) => (
                  <div key={idx} className="flex flex-col gap-1 p-3 rounded-lg bg-background border border-border/50 shadow-sm min-w-[200px]">
                    <div className="font-semibold text-sm">{contact.name}</div>
                    {contact.role && <div className="text-xs text-muted-foreground">{contact.role}</div>}
                    <div className="flex items-center gap-2 mt-2 text-xs">
                      <Phone className="h-3 w-3 text-muted-foreground" />
                      <span>{contact.phone || "N/A"}</span>
                    </div>
                    {contact.email && (
                      <div className="flex items-center gap-2 text-xs">
                        <Mail className="h-3 w-3 text-muted-foreground" />
                        <span className="truncate max-w-[150px]" title={contact.email}>{contact.email}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        }}
        className="border shadow-sm rounded-xl overflow-hidden"
        emptyMessage="No schools found matching your criteria"
      />
    </PageContainer>
  );
}
